import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { images } from "@/server/db/schema";
import { publicUrl } from "@/server/r2";
import { getOwnerId } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ownerCookie = await getOwnerId();

  const rows = await db
    .select()
    .from(images)
    .where(eq(images.ownerCookie, ownerCookie))
    .orderBy(desc(images.createdAt))
    .limit(100);

  return NextResponse.json({
    images: rows.map((r) => ({
      id: r.id,
      publicId: r.publicId,
      status: r.status,
      mimeType: r.mimeType,
      bytes: r.bytes,
      createdAt: r.createdAt,
      errorMessage: r.errorMessage,
      processedUrl: r.processedKey ? publicUrl(r.processedKey) : null,
    })),
  });
}
