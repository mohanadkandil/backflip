import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { db } from "@/server/db/client";
import { images } from "@/server/db/schema";
import { deleteObject } from "@/server/r2";
import { getOwnerId } from "@/server/session";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const ownerCookie = await getOwnerId();

  const [row] = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.ownerCookie, ownerCookie)))
    .limit(1);

  if (!row) {
    return apiError("NOT_FOUND", "Image not found");
  }

  await Promise.allSettled([
    deleteObject(row.originalKey),
    row.processedKey ? deleteObject(row.processedKey) : Promise.resolve(),
  ]);

  await db.delete(images).where(eq(images.id, id));

  return NextResponse.json({ ok: true });
}
