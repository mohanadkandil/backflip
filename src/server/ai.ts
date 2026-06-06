import { env } from "@/env";

const MODEL = "@cf/briaai/rembg-1.4";
const TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 3;

export async function removeBackground(imageBytes: Buffer): Promise<Buffer> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${MODEL}`;
  const body = JSON.stringify({ image: Array.from(imageBytes) });

  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Workers AI ${res.status}: ${text.slice(0, 500)}`);
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.startsWith("image/")) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 100) throw new Error("rembg returned empty payload");
        return buf;
      }

      // Fallback: JSON-wrapped base64 response shape some CF models return.
      const json = (await res.json()) as {
        success?: boolean;
        result?: string | { image?: string };
        errors?: { message: string }[];
      };
      if (!json.success || !json.result) {
        const msg = json.errors?.[0]?.message ?? "rembg JSON response missing result";
        throw new Error(msg);
      }
      const b64 =
        typeof json.result === "string" ? json.result : json.result.image;
      if (!b64) throw new Error("rembg JSON result has no image field");
      return Buffer.from(b64, "base64");
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("rembg failed after retries");
}
