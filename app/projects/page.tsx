import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const isPro = await requirePro(user.id);
  if (!isPro) {
    redirect('/pricing');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-[#0066CC]">vlayer</Link>
              <div className="flex gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/projects" className="text-gray-900 font-medium">Projects</Link>
                <Link href="/scans" className="text-gray-600 hover:text-gray-900">Scans</Link>
                <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/team" className="text-gray-600 hover:text-gray-900">Team</Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your scanned repositories and compliance tracking</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-6">
              Start scanning your repositories to see them here. Each scan creates a project with historical data and compliance tracking.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Get started with the CLI:</h3>
              <div className="bg-gray-900 rounded p-4 font-mono text-sm text-left text-green-400">
                <div>$ npx vlayer scan ./src</div>
                <div className="text-gray-500 mt-2"># Or install globally:</div>
                <div>$ npm install -g vlayer</div>
                <div>$ vlayer scan ./src</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="https://docs.vlayer.app"
                target="_blank"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                📚 Read Documentation
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Automated Scanning</h3>
            <p className="text-sm text-gray-600">
              Connect your repositories and get automatic scans on every commit via GitHub Actions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Compliance Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor your compliance score over time and track improvements across all your projects.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl mb-3">🚨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Alerts</h3>
            <p className="text-sm text-gray-600">
              Get notified via email or Slack when critical HIPAA violations are detected in your code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
