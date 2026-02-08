'use client';

import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066CC] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-gray-900">vlayer</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-[#0066CC] transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-[#0066CC] transition-colors">
              Pricing
            </a>
            <a
              href="https://play.vlayer.app"
              className="text-[#7C3AED] font-medium hover:text-[#6D28D9] transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Playground
            </a>
            <a href="https://docs.vlayer.app" className="text-gray-600 hover:text-[#0066CC] transition-colors">
              Docs
            </a>
            <a href="https://github.com/vlayer" className="text-gray-600 hover:text-[#0066CC] transition-colors">
              GitHub
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="https://app.vlayer.app/signup"
              className="bg-[#0066CC] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#0052A3] transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-[#0066CC]">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#0066CC]">Pricing</a>
              <a href="https://play.vlayer.app" className="text-[#7C3AED] font-medium hover:text-[#6D28D9]">Playground</a>
              <a href="https://docs.vlayer.app" className="text-gray-600 hover:text-[#0066CC]">Docs</a>
              <a href="https://github.com/vlayer" className="text-gray-600 hover:text-[#0066CC]">GitHub</a>
              <a
                href="https://app.vlayer.app/signup"
                className="bg-[#0066CC] text-white px-5 py-2.5 rounded-lg font-medium text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
