import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL('/login?error=OAuth callback failed', req.url));
    }

    // Redirect to the original destination or dashboard
    const redirectUrl = redirect || '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // No code present, redirect to login
  return NextResponse.redirect(new URL('/login?error=No code provided', req.url));
}
