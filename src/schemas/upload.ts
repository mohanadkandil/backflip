import { z } from "zod";

export const MAX_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type AllowedType = (typeof ALLOWED_TYPES)[number];

export const signRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(ALLOWED_TYPES),
  size: z.number().int().positive().max(MAX_BYTES),
});

export type SignRequest = z.infer<typeof signRequestSchema>;

export const signResponseSchema = z.object({
  imageId: z.string(),
  uploadUrl: z.string().url(),
  key: z.string(),
});

export type SignResponse = z.infer<typeof signResponseSchema>;
