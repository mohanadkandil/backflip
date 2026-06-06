import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { apiError } from "@/lib/api-error";
import { signRequestSchema } from "@/schemas/upload";
import { db } from "@/server/db/client";
import { images } from "@/server/db/schema";
import { presignPut } from "@/server/r2";
import { uploadLimiter } from "@/server/rate-limit";
import { getOwnerId } from "@/server/session";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const ownerCookie = await getOwnerId();

  const limit = await uploadLimiter.limit(ownerCookie);
  if (!limit.success) {
    return apiError("RATE_LIMITED", "Too many uploads. Try again later.");
  }

  const body = await req.json().catch(() => null);
  const parsed = signRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const id = nanoid();
  const publicId = nanoid(10);
  const ext = parsed.data.contentType.split("/")[1];
  const originalKey = `original/${id}.${ext}`;

  const uploadUrl = await presignPut(originalKey, parsed.data.contentType);

  await db.insert(images).values({
    id,
    publicId,
    ownerCookie,
    originalKey,
    mimeType: parsed.data.contentType,
    bytes: parsed.data.size,
    status: "uploaded",
  });

  return NextResponse.json({ imageId: id, uploadUrl, key: originalKey });
}
