import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { publicUrl } from "@/server/r2";
import { db } from "./client";
import { images } from "./schema";

export async function getImageByPublicId(publicId: string) {
  const [row] = await db
    .select()
    .from(images)
    .where(eq(images.publicId, publicId))
    .limit(1);
  if (!row) return null;
  return {
    ...row,
    processedUrl: row.processedKey ? publicUrl(row.processedKey) : null,
  };
}

export async function listImagesForOwner(ownerCookie: string) {
  const rows = await db
    .select()
    .from(images)
    .where(eq(images.ownerCookie, ownerCookie))
    .orderBy(desc(images.createdAt))
    .limit(100);
  return rows.map((r) => ({
    ...r,
    processedUrl: r.processedKey ? publicUrl(r.processedKey) : null,
  }));
}

export async function getOwnedImage(id: string, ownerCookie: string) {
  const [row] = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.ownerCookie, ownerCookie)))
    .limit(1);
  return row ?? null;
}
