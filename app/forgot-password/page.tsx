import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const error = searchParams.error;
  const success = searchParams.success;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-[#0066CC]">vlayer</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset your password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form action="/api/auth/reset-password" method="post" className="space-y-4">
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

            <button
              type="submit"
              className="w-full px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium"
            >
              Send Reset Link
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-[#0066CC] hover:text-[#0052A3] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
