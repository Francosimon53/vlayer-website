import { NextResponse } from 'next/server';
import { auditLogger, errorMetadata } from '@/lib/audit-logger';

export function safeJsonError(
  context: string,
  error: unknown,
  userMessage: string,
  status: number = 500,
): NextResponse {
  auditLogger.error(
    { event: context, ...errorMetadata(error) },
    'Request failed',
  );
  return NextResponse.json({ error: userMessage }, { status });
}

export function safeRedirectError(
  req: Request,
  path: string,
  error: unknown,
  context: string,
  userMessage: string = 'An error occurred',
): NextResponse {
  auditLogger.error(
    { event: context, ...errorMetadata(error) },
    'Request failed',
  );
  const url = new URL(path, req.url);
  url.searchParams.set('error', userMessage);
  return NextResponse.redirect(url);
}
