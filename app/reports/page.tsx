import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ReportsPage() {
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
                <Link href="/scans" className="text-gray-600 hover:text-gray-900">Scans</Link>
                <Link href="/templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/reports" className="text-gray-900 font-medium">Reports</Link>
                <Link href="/team" className="text-gray-600 hover:text-gray-900">Team</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Reports</h1>
          <p className="text-gray-600 mt-1">Generate professional PDF reports for auditors and stakeholders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Full Compliance Report</option>
                    <option>Executive Summary</option>
                    <option>Technical Findings</option>
                    <option>Remediation Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Last scan only</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>All time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repositories</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" multiple size={4}>
                    <option>All repositories</option>
                    <option>backend-api</option>
                    <option>frontend-app</option>
                    <option>mobile-app</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Include Sections</label>
                  <div className="space-y-2">
                    {['Executive Summary', 'Compliance Score', 'Critical Findings', 'All Findings', 'Remediation Recommendations', 'Historical Trends'].map((section) => (
                      <label key={section} className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm text-gray-700">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium">
                  Generate PDF Report
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📑</div>
                <p className="text-sm">No reports generated yet</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-blue-800">
                Generate reports monthly for auditors and quarterly for executive reviews to maintain compliance documentation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
