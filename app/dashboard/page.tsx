import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isPro = await requirePro(user.id);
  if (!isPro) {
    redirect('/pricing');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at, current_period_end')
    .eq('id', user.id)
    .single();

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
                <Link href="/dashboard" className="text-gray-900 font-medium">Dashboard</Link>
                <Link href="/scans" className="text-gray-600 hover:text-gray-900">Scans</Link>
                <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/team" className="text-gray-600 hover:text-gray-900">Team</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isTrialing && (
                <span className="text-sm text-orange-600 font-medium">
                  Trial: {Math.ceil((new Date(profile.trial_ends_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left
                </span>
              )}
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {profile?.plan?.toUpperCase()}
              </span>
              <form action="/api/auth/signout" method="post">
                <button className="text-gray-600 hover:text-gray-900">Sign Out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.email}</p>
        </div>

        {isTrialing && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800">
              🎉 Your 14-day free trial is active. You'll be charged on {new Date(profile.trial_ends_at!).toLocaleDateString()}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Scans</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Critical Issues</div>
            <div className="text-3xl font-bold text-red-600">0</div>
            <div className="text-xs text-gray-500 mt-1">Requires attention</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Compliance Score</div>
            <div className="text-3xl font-bold text-green-600">100</div>
            <div className="text-xs text-gray-500 mt-1">HIPAA compliance</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Team Members</div>
            <div className="text-3xl font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-500 mt-1">of 10 seats</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Scans</h2>
            <div className="text-center py-12 text-gray-500">
              No scans yet. Run your first scan with the CLI:
              <div className="mt-4 bg-gray-50 p-4 rounded font-mono text-sm text-left">
                npx vlayer scan ./src
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/scans" className="block p-4 border border-gray-200 rounded-lg hover:border-[#0066CC] hover:bg-blue-50 transition-colors">
                <div className="font-medium text-gray-900">📊 View All Scans</div>
                <div className="text-sm text-gray-600">Historical scan data and trends</div>
              </Link>
              <Link href="/templates" className="block p-4 border border-gray-200 rounded-lg hover:border-[#0066CC] hover:bg-blue-50 transition-colors">
                <div className="font-medium text-gray-900">📄 Browse Templates</div>
                <div className="text-sm text-gray-600">HIPAA policies and procedures</div>
              </Link>
              <Link href="/reports" className="block p-4 border border-gray-200 rounded-lg hover:border-[#0066CC] hover:bg-blue-50 transition-colors">
                <div className="font-medium text-gray-900">📑 Generate Report</div>
                <div className="text-sm text-gray-600">PDF audit reports for compliance</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
