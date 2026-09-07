import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const search = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const redirectUrl = search.redirect || '';
  const error = search.error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-[#0066CC]">vlayer</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in to your account</h1>
          <p className="text-gray-600 mt-2">Access your HIPAA compliance dashboard</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action="/api/auth/signin" method="post" className="space-y-4">
            {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#0066CC] hover:text-[#0052A3]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <form action="/api/auth/oauth" method="post">
                <input type="hidden" name="provider" value="github" />
                {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
                <button
                  type="submit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  🔗 GitHub
                </button>
              </form>
              <form action="/api/auth/oauth" method="post">
                <input type="hidden" name="provider" value="google" />
                {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
                <button
                  type="submit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  📧 Google
                </button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#0066CC] hover:text-[#0052A3] font-medium">
            Sign up for free
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 mt-4">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
