import { notFound } from "next/navigation";
import { getImageByPublicId } from "@/server/db/queries";
import { getObjectBytes } from "@/server/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await ctx.params;
  const img = await getImageByPublicId(publicId);
  if (!img?.processedKey) notFound();

  const bytes = await getObjectBytes(img.processedKey);
  const isDownload = new URL(req.url).searchParams.get("download") === "1";

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(isDownload && {
        "Content-Disposition": `attachment; filename="backflip-${publicId}.png"`,
      }),
    },
  });
}
