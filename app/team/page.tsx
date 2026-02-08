import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TeamPage() {
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
                <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
                <Link href="/team" className="text-gray-900 font-medium">Team</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-1">Manage team members and access permissions</p>
          </div>
          <button className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium">
            Invite Member
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Team Seats</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">1 / 10 used</div>
            </div>
            <Link href="/pricing" className="text-[#0066CC] hover:text-[#0052A3] font-medium">
              Upgrade Plan →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search team members..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>All Roles</option>
                <option>Admin</option>
                <option>Developer</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#0066CC] flex items-center justify-center text-white font-medium">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">You</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    Owner
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 cursor-not-allowed">
                    —
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="px-6 py-12 text-center text-gray-500 bg-gray-50">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invite your team</h3>
            <p className="text-gray-600 mb-4">Collaborate on HIPAA compliance with up to 10 team members</p>
            <button className="px-6 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium">
              Send Invitation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
