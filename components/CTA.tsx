'use client';

export default function CTA() {
  return (
    <section id="get-started" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0066CC]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Start Scanning in 30 Seconds
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          No signup required. Install with npm and scan your first project immediately.
        </p>

        {/* Install Command */}
        <div className="bg-gray-900 rounded-xl p-6 max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <code className="text-green-400 font-mono">
              npm install -g verification-layer
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('npm install -g verification-layer')}
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Alternative */}
        <p className="text-blue-200 mb-8">
          Or use npx without installing:{' '}
          <code className="bg-blue-800/50 px-2 py-1 rounded">npx vlayer scan .</code>
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://github.com/vlayer"
            className="bg-white text-[#0066CC] px-8 py-3.5 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
          <a
            href="https://github.com/vlayer/docs"
            className="bg-blue-800 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-blue-900 transition-colors text-lg"
          >
            Read Documentation
          </a>
        </div>
      </div>
    </section>
  );
}
