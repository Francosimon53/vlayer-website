import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return NextResponse.redirect(new URL('/signup?error=Missing email or password', req.url));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(error.message)}`, req.url));
  }

  // If user is created successfully
  if (data.user) {
    // Create profile in profiles table with free plan
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          plan: 'free',
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error('Failed to create profile:', profileError);
      // Don't fail signup if profile creation fails - they can still sign in
    }
  }

  // Redirect to dashboard (or login if email confirmation is required)
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
