import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types";

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export function unauthorized(error = "Unauthorized"): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: 401 });
}

export function forbidden(error = "Forbidden"): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: 403 });
}

export function notFound(error = "Not found"): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: 404 });
}

export function tooManyRequests(): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
    },
    { status: 429 },
  );
}

export function serverError(error: unknown): NextResponse<ApiResponse> {
  console.error("[API Error]", error);
  return NextResponse.json(
    { success: false, error: "An unexpected error occurred." },
    { status: 500 },
  );
}
