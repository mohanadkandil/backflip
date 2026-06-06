import { eq } from "drizzle-orm";
import sharp from "sharp";
import { removeBackground } from "./ai";
import { db } from "./db/client";
import { images } from "./db/schema";
import { publicUrl, putObject } from "./r2";

export type PipelineEvent =
  | { stage: "rembg"; progress: number }
  | { stage: "flip"; progress: number }
  | { stage: "upload"; progress: number }
  | { stage: "done"; progress: 1; publicId: string; processedKey: string }
  | { stage: "error"; message: string };

export async function* runPipeline(
  imageId: string,
): AsyncGenerator<PipelineEvent> {
  const [img] = await db
    .select()
    .from(images)
    .where(eq(images.id, imageId))
    .limit(1);

  if (!img) {
    yield { stage: "error", message: "image not found" };
    return;
  }

  await db
    .update(images)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(images.id, imageId));

  try {
    yield { stage: "rembg", progress: 0.2 };
    // fal pulls the original directly from the public R2 URL.
    const transparent = await removeBackground(publicUrl(img.originalKey));

    yield { stage: "flip", progress: 0.7 };
    // sharp.flop() = horizontal flip (mirror across vertical axis).
    // sharp.flip() would flip vertically — do not use here.
    const flipped = await sharp(transparent).flop().png().toBuffer();

    yield { stage: "upload", progress: 0.9 };
    const processedKey = `processed/${imageId}.png`;
    await putObject(processedKey, flipped, "image/png");

    await db
      .update(images)
      .set({
        processedKey,
        status: "done",
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(images.id, imageId));

    yield {
      stage: "done",
      progress: 1,
      publicId: img.publicId,
      processedKey,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    await db
      .update(images)
      .set({
        status: "failed",
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(images.id, imageId));
    yield { stage: "error", message };
  }
}
