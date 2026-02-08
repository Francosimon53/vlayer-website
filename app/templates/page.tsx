import { createClient } from '@/lib/supabase/server';
import { requirePro } from '@/lib/plan-guard';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const TEMPLATES = [
  {
    id: 'privacy-policy',
    title: 'HIPAA Privacy Policy',
    description: 'Comprehensive privacy policy template compliant with HIPAA Privacy Rule',
    category: 'Policies',
    pages: 12,
  },
  {
    id: 'security-policy',
    title: 'HIPAA Security Policy',
    description: 'Security policy covering administrative, physical, and technical safeguards',
    category: 'Policies',
    pages: 15,
  },
  {
    id: 'breach-notification',
    title: 'Breach Notification Plan',
    description: 'Step-by-step breach notification procedures per HIPAA Breach Notification Rule',
    category: 'Procedures',
    pages: 8,
  },
  {
    id: 'risk-assessment',
    title: 'Security Risk Assessment',
    description: 'Framework for conducting periodic HIPAA security risk assessments',
    category: 'Assessments',
    pages: 10,
  },
  {
    id: 'baa-template',
    title: 'Business Associate Agreement',
    description: 'Standard BAA template for third-party vendors',
    category: 'Agreements',
    pages: 6,
  },
  {
    id: 'incident-response',
    title: 'Incident Response Plan',
    description: 'Security incident response procedures and escalation matrix',
    category: 'Procedures',
    pages: 9,
  },
];

export default async function TemplatesPage() {
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
                <Link href="/scans" className="text-gray-600 hover:text-gray-900">Scans</Link>
                <Link href="/templates" className="text-gray-900 font-medium">Templates</Link>
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
          <h1 className="text-3xl font-bold text-gray-900">HIPAA Templates</h1>
          <p className="text-gray-600 mt-1">Ready-to-use policies, procedures, and documentation templates</p>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search templates..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            <option>Policies</option>
            <option>Procedures</option>
            <option>Assessments</option>
            <option>Agreements</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-[#0066CC] hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {template.category}
                </span>
                <span className="text-sm text-gray-500">{template.pages} pages</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] font-medium text-sm">
                  Download
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
