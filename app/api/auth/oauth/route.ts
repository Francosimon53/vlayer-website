import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeRedirectError } from '@/lib/api-errors';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const provider = formData.get('provider') as 'google' | 'github';
  const redirect = formData.get('redirect') as string | null;

  if (!provider || !['google', 'github'].includes(provider)) {
    return NextResponse.redirect(new URL('/login?error=Invalid provider', req.url));
  }

  const supabase = await createClient();

  // Store redirect in state parameter if provided
  const redirectTo = redirect
    ? `${req.nextUrl.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
    : `${req.nextUrl.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    return safeRedirectError(req, '/login', error, 'auth-oauth', 'Sign-in failed. Please try again.');
  }

  // Redirect to OAuth provider
  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL('/login?error=OAuth failed', req.url));
}
