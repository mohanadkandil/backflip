import { env } from "@/env";

const ENDPOINT = "https://fal.run/fal-ai/imageutils/rembg";
const TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;

interface FalResponse {
  image?: { url?: string };
  detail?: unknown;
}

/**
 * fal.ai imageutils/rembg — background removal.
 * Accepts a publicly fetchable image URL. With `sync_mode: true`
 * the output is returned inline as a data URI (no extra fetch).
 */
export async function removeBackground(imageUrl: string): Promise<Buffer> {
  let lastErr: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          sync_mode: true,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`fal ${res.status}: ${text.slice(0, 400)}`);
      }

      const json = (await res.json()) as FalResponse;
      const url = json.image?.url;
      if (!url) {
        throw new Error(
          `fal returned no image url: ${JSON.stringify(json).slice(0, 300)}`,
        );
      }

      if (url.startsWith("data:")) {
        const b64 = url.split(",", 2)[1] ?? "";
        const buf = Buffer.from(b64, "base64");
        if (buf.length < 100) throw new Error("fal data URI was empty");
        return buf;
      }

      const dl = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!dl.ok) throw new Error(`fal CDN ${dl.status}`);
      const buf = Buffer.from(await dl.arrayBuffer());
      if (buf.length < 100) throw new Error("fal CDN returned empty payload");
      return buf;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : "";
      // Bad auth — don't waste retries
      if (msg.includes("401") || msg.includes("403")) throw err;
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error("fal rembg failed after retries");
}
