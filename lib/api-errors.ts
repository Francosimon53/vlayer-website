import { NextResponse } from 'next/server';

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

export function safeJsonError(
  context: string,
  error: unknown,
  userMessage: string,
  status: number = 500,
): NextResponse {
  console.error(`[${context}]`, stringifyError(error));
  return NextResponse.json({ error: userMessage }, { status });
}

export function safeRedirectError(
  req: Request,
  path: string,
  error: unknown,
  context: string,
  userMessage: string = 'An error occurred',
): NextResponse {
  console.error(`[${context}]`, stringifyError(error));
  const url = new URL(path, req.url);
  url.searchParams.set('error', userMessage);
  return NextResponse.redirect(url);
}
