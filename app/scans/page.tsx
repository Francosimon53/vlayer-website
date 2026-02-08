import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ScansPage() {
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
                <Link href="/projects" className="text-gray-600 hover:text-gray-900">Projects</Link>
                <Link href="/scans" className="text-gray-900 font-medium">Scans</Link>
                <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/team" className="text-gray-600 hover:text-gray-900">Team</Link>
                <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historical Scans</h1>
          <p className="text-gray-600 mt-1">View and compare all your HIPAA compliance scans</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Repositories</option>
                  <option>Backend API</option>
                  <option>Frontend App</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium">
                New Scan
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
              <p className="text-gray-600 mb-6">Run your first scan using the CLI or GitHub App</p>
              <div className="bg-gray-50 p-6 rounded-lg max-w-2xl mx-auto">
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-700 mb-3">Quick Start:</div>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded font-mono text-sm border border-gray-200">
                      <span className="text-gray-500"># Install vlayer CLI</span><br/>
                      npm install -g vlayer
                    </div>
                    <div className="bg-white p-3 rounded font-mono text-sm border border-gray-200">
                      <span className="text-gray-500"># Run a scan</span><br/>
                      vlayer scan ./src --upload
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
