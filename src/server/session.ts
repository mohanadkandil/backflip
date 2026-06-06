import { nanoid } from "nanoid";
import { cookies } from "next/headers";

const COOKIE_NAME = "backflip_owner";
const MAX_AGE = 60 * 60 * 24 * 365;

export async function getOwnerId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = nanoid();
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return id;
}
