const steps = [
  {
    step: '01',
    title: 'Install',
    description: 'Install vlayer globally with npm or run directly with npx. No configuration required.',
    code: 'npm install -g verification-layer',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Scan',
    description: 'Point vlayer at your project directory. It analyzes your codebase across all five HIPAA categories.',
    code: 'vlayer scan ./your-project',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Fix',
    description: 'Review the detailed report with HIPAA references. Use auto-fix for common issues or follow remediation guidance.',
    code: 'vlayer scan . --fix',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get HIPAA compliance insights in three simple steps.
            No complex setup or configuration required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#0066CC] to-transparent -translate-x-8" />
              )}

              <div className="text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0066CC]/10 text-[#0066CC] mb-6">
                  {step.icon}
                </div>

                {/* Step Badge */}
                <div className="inline-block bg-[#0066CC] text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                  Step {step.step}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {step.description}
                </p>

                {/* Code Block */}
                <div className="bg-gray-900 rounded-lg p-4 text-left">
                  <code className="text-green-400 font-mono text-sm">
                    $ {step.code}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
