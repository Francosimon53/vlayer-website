import pino from 'pino';

export const auditLogger = pino({
  name: 'vlayer-website',
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['email', 'password', 'authorization', 'token', 'secret'],
    censor: '[REDACTED]',
  },
});

export function errorMetadata(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    return { errorName: error.name };
  }

  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') {
      return { errorCode: code };
    }
  }

  return { errorType: typeof error };
}
