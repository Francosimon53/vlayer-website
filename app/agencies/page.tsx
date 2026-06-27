import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// The real $449/mo Stripe Payment Link is wired through this env var. Until it
// is set (see .env.example), the CTA falls back to the signup flow so the page
// is never broken in preview.
const AGENCY_PAYMENT_LINK =
  process.env.AGENCY_PAYMENT_LINK_URL || 'https://app.vlayer.app/signup?plan=agency';

const GITHUB_REPO = 'https://github.com/Francosimon53/verification-layer';
const AUDIT_WORKFLOW =
  'https://github.com/Francosimon53/vlayer-website/actions/workflows/audit.yml';

export const metadata: Metadata = {
  title: 'VLayer for Agencies — Audit-ready HIPAA proof, white-labeled',
  description:
    'Healthcare clients ask for proof of HIPAA-compliant development. VLayer generates audit-ready, white-label compliance reports with your agency’s name — in 60 seconds.',
  keywords: [
    'HIPAA',
    'healthcare agency',
    'white-label compliance report',
    'audit-ready',
    'HIPAA compliance scan',
    'development agency',
  ],
  alternates: { canonical: 'https://vlayer.app/agencies' },
  openGraph: {
    title: 'Your healthcare client will ask for proof.',
    description:
      'VLayer generates audit-ready HIPAA evidence — with your agency’s name on it — in 60 seconds. $449/mo, unlimited projects.',
    type: 'website',
    url: 'https://vlayer.app/agencies',
    siteName: 'vlayer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your healthcare client will ask for proof.',
    description:
      'Audit-ready, white-label HIPAA reports for healthcare dev agencies. $449/mo, unlimited projects.',
  },
};

const steps = [
  {
    step: '01',
    title: 'Run',
    description:
      'Point VLayer at your source. One command scans the whole project and stamps it with your agency’s brand.',
    code: 'vlayer report ./src \\\n  --brand-name "Your Agency" \\\n  --brand-logo logo.png',
  },
  {
    step: '02',
    title: 'Get',
    description:
      'An audit-ready PDF: your agency cover page, findings grouped by category, HIPAA §164.312 mapping, and verification hashes.',
    code: 'report.pdf  →  cover · findings · §164.312 · hashes',
  },
  {
    step: '03',
    title: 'Bill',
    description:
      'Hand it to your client as a deliverable. Add it to your invoice as a line item: “HIPAA Compliance Scan & Report.”',
    code: 'Invoice — HIPAA Compliance Scan & Report',
  },
];

const faqs = [
  {
    q: 'Does this replace a formal HIPAA audit?',
    a: 'No. A formal audit is broader and human-led. VLayer is the technical, code-level evidence that accompanies it — the proof that your codebase was actually scanned against HIPAA technical safeguards.',
  },
  {
    q: 'Is it really white-label?',
    a: 'Yes. Your agency name and logo go on the cover and throughout the report. You deliver it as your own work product — VLayer stays behind the scenes.',
  },
  {
    q: 'Is this SOC 2?',
    a: 'No. SOC 2 is wide and organizational. VLayer is HIPAA at the code level — deep, not wide. It answers “was this codebase built against HIPAA technical safeguards?”, not “is your company SOC 2 certified?”',
  },
  {
    q: 'Does my client’s code leave my machine?',
    a: 'Not on the free/local tier — the scan runs entirely on your machine. The optional AI tier sends only the minimal context of a single finding for triage, never your whole codebase.',
  },
];

const mathRows = [
  { label: 'Your cost', value: '$449 / month', sub: 'Unlimited projects' },
  { label: 'You bill per delivery', value: '$500 – $2,000', sub: 'Per client report' },
];

export default function AgenciesPage() {
  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 text-[#7C3AED] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[#7C3AED] rounded-full"></span>
            For healthcare development agencies
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your healthcare client will ask for{' '}
            <span className="text-[#0066CC]">proof.</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            You promise HIPAA-compliant development. VLayer generates the
            audit-ready evidence — with your agency&rsquo;s name on it — in 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sample-report"
              className="bg-[#0066CC] text-white px-8 py-3.5 rounded-lg font-medium hover:bg-[#0052A3] transition-colors text-lg"
            >
              See a sample report
            </a>
            <a
              href={AGENCY_PAYMENT_LINK}
              className="bg-gray-100 text-gray-900 px-8 py-3.5 rounded-lg font-medium hover:bg-gray-200 transition-colors text-lg"
            >
              Start 14-day trial
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Run it. Get the PDF. Bill the client.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three steps from your terminal to a deliverable on your invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
                <div className="inline-block bg-[#0066CC] text-white text-sm font-medium px-3 py-1 rounded-full mb-4 self-start">
                  {step.title} · {step.step}
                </div>
                <p className="text-gray-600 mb-6 flex-1">{step.description}</p>
                <div className="bg-gray-900 rounded-lg p-4 text-left overflow-x-auto">
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap break-words">
                    <span className="text-gray-500">$ </span>
                    {step.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE MATH */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The math is not subtle.
            </h2>
            <p className="text-xl text-gray-600">
              $449/month. Unlimited projects. Agencies bill the report at
              $500–$2,000 per delivery.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            {mathRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center justify-between gap-4 px-6 sm:px-8 py-6 ${
                  i === 0 ? 'bg-gray-50' : 'bg-[#10B981]/5'
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {row.label}
                  </div>
                  <div className="text-sm text-gray-500">{row.sub}</div>
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold ${
                    i === 0 ? 'text-gray-900' : 'text-[#10B981]'
                  }`}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Bill the report at $500–$2,000. VLayer is $449/month, unlimited.
          </p>
        </div>
      </section>

      {/* PROOF */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              We don&rsquo;t ask you to take our word for it.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-4xl font-bold text-[#0066CC] mb-2">§164.312</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real rules</h3>
              <p className="text-gray-600 text-sm">
                Detection rules mapped to the HIPAA technical safeguards — no inflated counts.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-2">🌙</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Scanned nightly, in public</h3>
              <p className="text-gray-600 text-sm mb-3">
                We run VLayer against our own site every night and publish the result.
              </p>
              <a
                href={AUDIT_WORKFLOW}
                className="text-[#0066CC] font-medium text-sm hover:underline"
              >
                See the audit workflow →
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-2">{'</>'}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Open source, MIT</h3>
              <p className="text-gray-600 text-sm mb-3">
                The scanner is open source. Read every rule before you bill on it.
              </p>
              <a
                href={GITHUB_REPO}
                className="text-[#0066CC] font-medium text-sm hover:underline"
              >
                View the repo →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* VLAYER VERIFIED BADGE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-[#0066CC] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center gap-2 bg-white text-[#0066CC] px-5 py-3 rounded-full font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                VLayer Verified
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Put the badge on your proposals.
              </h2>
              <p className="text-blue-100">
                Agencies on the Agency plan can show the &ldquo;VLayer Verified&rdquo; badge
                in proposals and pitches — a visual signal that your HIPAA claims
                come with evidence behind them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Questions agencies ask
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0066CC]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop promising. Start proving.
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            $449/month, unlimited projects. Your first white-label report is 60 seconds away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={AGENCY_PAYMENT_LINK}
              className="bg-white text-[#0066CC] px-8 py-3.5 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
            >
              Start 14-day trial
            </a>
            <a
              href="/sample-report"
              className="bg-blue-800 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-blue-900 transition-colors text-lg"
            >
              See a sample report
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
