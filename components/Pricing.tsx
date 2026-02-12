const plans = [
  {
    name: 'Free',
    subtitle: 'Open Source',
    price: '$0',
    period: 'forever',
    description: 'For individual developers and open source projects.',
    features: [
      'CLI scanner with 163+ detection rules',
      '5 HIPAA compliance categories',
      'JSON & Markdown reports',
      'Community support (GitHub)',
      'Open source',
    ],
    cta: 'Get Started',
    ctaLink: 'https://www.npmjs.com/package/verification-layer',
    highlighted: false,
    annualNote: null,
  },
  {
    name: 'Pro',
    subtitle: null,
    price: '$49',
    period: '/month',
    description: 'For teams building healthcare applications.',
    features: [
      'Everything in Free',
      'Team dashboard with scan history',
      'GitHub App with automatic PR comments',
      'Pre-commit hooks',
      'HIPAA document templates (IRP, BAA, NPP)',
      'PDF audit-ready reports',
      'Custom rules library',
      'Slack integration',
      'Email support (48h SLA)',
    ],
    cta: 'Start 14-Day Free Trial',
    ctaLink: 'https://app.vlayer.app/signup?plan=pro',
    highlighted: true,
    annualNote: 'Save 20% with annual billing — $470/year',
  },
  {
    name: 'Enterprise',
    subtitle: null,
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced security needs.',
    features: [
      'Everything in Pro',
      'Custom SSO/SAML integration',
      'Self-hosted / on-premise deployment',
      'Dedicated compliance consultant',
      'SLA guarantee (4h response)',
      'Audit trail & compliance reports',
      'Custom training modules',
    ],
    cta: 'Contact Sales',
    ctaLink: 'mailto:sales@vlayer.app',
    highlighted: false,
    annualNote: null,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as your team grows.
            No hidden fees, no per-seat pricing for the CLI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlighted
                  ? 'bg-[#0066CC] text-white ring-4 ring-[#0066CC]/20 scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="text-sm font-medium text-blue-200 mb-2">
                  Most Popular
                </div>
              )}

              <h3 className={`text-2xl font-bold mb-1 ${
                plan.highlighted ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.name}
              </h3>

              {plan.subtitle && (
                <p className="text-sm text-gray-500 mb-2">{plan.subtitle}</p>
              )}

              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-4xl font-bold ${
                  plan.highlighted ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.price}
                </span>
                <span className={plan.highlighted ? 'text-blue-200' : 'text-gray-500'}>
                  {plan.period}
                </span>
              </div>

              <p className={`mb-6 ${
                plan.highlighted ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-blue-200' : 'text-[#10B981]'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className={plan.highlighted ? 'text-white' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaLink}
                className={`block w-full py-3 px-4 rounded-lg font-medium text-center transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-[#0066CC] hover:bg-gray-100'
                    : 'bg-[#0066CC] text-white hover:bg-[#0052A3]'
                }`}
              >
                {plan.cta}
              </a>

              {plan.annualNote && (
                <p className="text-sm text-blue-200 text-center mt-3">
                  {plan.annualNote}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
