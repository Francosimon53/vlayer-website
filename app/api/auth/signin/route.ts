import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirect = formData.get('redirect') as string | null;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'Invalid credentials');
    if (redirect) loginUrl.searchParams.set('redirect', redirect);
    return NextResponse.redirect(loginUrl);
  }

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
