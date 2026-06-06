import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "REMBG_FAILED"
  | "INTERNAL";

const STATUS: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_TYPE: 415,
  REMBG_FAILED: 502,
  INTERNAL: 500,
};

export function apiError(code: ApiErrorCode, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status: STATUS[code] },
  );
}
