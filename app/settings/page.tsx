import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at, current_period_end')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan || 'free';
  const isPro = plan === 'pro';
  const isTrialing = profile?.subscription_status === 'trialing' ||
                     (profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-[#0066CC]">vlayer</Link>
              <div className="flex gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
                <Link href="/scans" className="text-gray-600 hover:text-gray-900">Scans</Link>
                <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/team" className="text-gray-600 hover:text-gray-900">Team</Link>
                <Link href="/settings" className="text-gray-900 font-medium">Settings</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <form action="/api/auth/signout" method="post">
                <button className="text-gray-600 hover:text-gray-900">Sign Out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and subscription</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <div className="text-gray-600 font-mono text-sm">{user.id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <div className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Billing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription & Billing</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Current Plan</div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900 capitalize">{plan}</span>
                    {isPro && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        PRO
                      </span>
                    )}
                    {plan === 'free' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        FREE
                      </span>
                    )}
                  </div>
                </div>
                {isPro && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">Billing</div>
                    <div className="text-2xl font-bold text-gray-900">$49/mo</div>
                  </div>
                )}
              </div>

              {isTrialing && profile?.trial_ends_at && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 text-lg">🎉</span>
                    <div>
                      <div className="font-medium text-orange-900">Free Trial Active</div>
                      <div className="text-sm text-orange-800 mt-1">
                        Your 14-day trial ends on {new Date(profile.trial_ends_at).toLocaleDateString()}.
                        You'll be charged $49/month after the trial ends.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isPro && !isTrialing && profile?.current_period_end && (
                <div className="text-sm text-gray-600">
                  Next billing date: {new Date(profile.current_period_end).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isPro ? (
                <Link
                  href="/pricing"
                  className="px-6 py-2.5 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium"
                >
                  Upgrade to Pro
                </Link>
              ) : (
                <form action="/api/stripe/portal" method="POST">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                  >
                    Manage Subscription
                  </button>
                </form>
              )}
            </div>

            {isPro && (
              <p className="text-sm text-gray-600 mt-4">
                Click "Manage Subscription" to update your payment method, view invoices, or cancel your subscription.
              </p>
            )}
          </div>

          {/* Plan Features */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Plan Features</h2>

            {plan === 'free' ? (
              <div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600">✓</span> CLI scanning tool
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600">✓</span> 163+ detection rules
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-600">✓</span> Community support
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-400">✗</span> Team dashboard
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-400">✗</span> GitHub App integration
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-400">✗</span> PDF audit reports
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-400">✗</span> HIPAA templates
                  </li>
                </ul>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-2.5 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium"
                >
                  See Pro Features →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Everything in Free
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Team dashboard
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> GitHub App with PR comments
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Pre-commit hooks
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Historical scan dashboard
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> HIPAA document templates
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Team compliance tracking (10 users)
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> PDF audit reports
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span> Email support (48h SLA)
                </li>
              </ul>
            )}
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Password</div>
                <Link
                  href="/reset-password"
                  className="text-[#0066CC] hover:text-[#0052A3] text-sm font-medium"
                >
                  Change password →
                </Link>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Account Actions</div>
                <form action="/api/auth/signout" method="post" className="inline">
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Sign out of all devices
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
