import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return NextResponse.redirect(new URL('/forgot-password?error=Email is required', req.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${req.nextUrl.origin}/reset-password`,
  });

  if (error) {
    return NextResponse.redirect(new URL(`/forgot-password?error=${encodeURIComponent(error.message)}`, req.url));
  }

  // Always show success message to prevent email enumeration
  return NextResponse.redirect(new URL('/forgot-password?success=Check your email for the reset link', req.url));
}
