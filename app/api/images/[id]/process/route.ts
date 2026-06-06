import { and, eq } from "drizzle-orm";
import { apiError } from "@/lib/api-error";
import { db } from "@/server/db/client";
import { images } from "@/server/db/schema";
import { runPipeline } from "@/server/pipeline";
import { processLimiter } from "@/server/rate-limit";
import { getOwnerId } from "@/server/session";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ownerCookie = await getOwnerId();

  const limit = await processLimiter.limit(ownerCookie);
  if (!limit.success) {
    return apiError("RATE_LIMITED", "Too many requests. Try again later.");
  }

  const [row] = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.ownerCookie, ownerCookie)))
    .limit(1);

  if (!row) {
    return apiError("NOT_FOUND", "Image not found");
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        for await (const evt of runPipeline(id)) {
          send(evt);
          if (evt.stage === "done" || evt.stage === "error") break;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "pipeline crashed";
        send({ stage: "error", message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
