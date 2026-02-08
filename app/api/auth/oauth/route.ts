import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url));
  }

  // Redirect to OAuth provider
  if (data.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL('/login?error=OAuth failed', req.url));
}
