import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { auditLogger, errorMetadata } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirect = formData.get('redirect') as string | null;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    auditLogger.warn(
      { event: 'auth.signin.failed', ...errorMetadata(error) },
      'Authentication failed',
    );
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'Invalid credentials');
    if (redirect) loginUrl.searchParams.set('redirect', redirect);
    return NextResponse.redirect(loginUrl);
  }

  auditLogger.info(
    { event: 'auth.signin.succeeded', userId: data.user?.id },
    'Authentication succeeded',
  );

  // Validate redirect URL to prevent open redirects
  let redirectUrl = '/dashboard';
  if (redirect) {
    try {
      const url = new URL(redirect, req.url);
      // Only allow internal redirects
      if (url.origin === req.nextUrl.origin) {
        redirectUrl = redirect;
      }
    } catch {
      // Invalid URL, use default
    }
  }

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}
