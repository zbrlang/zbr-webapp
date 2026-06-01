import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function createApiResponse<T>(
  data: T | null,
  options: { status?: number; error?: string; cacheControl?: string } = {}
) {
  const { status = 200, error, cacheControl = "private, no-store, max-age=0" } = options;

  if (error) {
    return NextResponse.json({ error }, { status, headers: { "Cache-Control": cacheControl } });
  }

  return NextResponse.json(data, { status, headers: { "Cache-Control": cacheControl } });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return createApiResponse(null, { status: 400, error: 'Invalid request data: ' + error.message });
  }
  console.error("API Error:", error);
  return createApiResponse(null, { status: 500, error: 'Internal Server Error' });
}
