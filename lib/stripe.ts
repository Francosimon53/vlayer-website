import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-01-28.clover',
});

export const PLANS = {
  free: {
    name: 'Open Source',
    price: 0,
    priceId: null,
    features: [
      '163+ detection rules',
      'CLI scanning & reports',
      'Compliance scoring (0-100)',
      'Developer training module',
      'Community support',
    ],
    limits: {
      dashboardAccess: false,
      prComments: false,
      templates: false,
      pdfReports: false,
      teamMembers: 1,
      scansPerMonth: 999999, // unlimited CLI scans
    },
  },
  pro: {
    name: 'Pro',
    priceMonthly: 49,
    priceAnnual: 490,
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    trialDays: 14,
    features: [
      'Everything in Open Source',
      'GitHub App with PR comments',
      'Pre-commit hooks',
      'Historical scan dashboard',
      'HIPAA document templates',
      'Team compliance tracking',
      'PDF audit reports',
      'Email support (48h SLA)',
    ],
    limits: {
      dashboardAccess: true,
      prComments: true,
      templates: true,
      pdfReports: true,
      teamMembers: 10,
      scansPerMonth: 999999,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // custom
    features: [
      'Everything in Pro',
      'Custom detection rules',
      'Self-hosted deployment',
      'SSO & RBAC integration',
      'Dedicated compliance consultant',
      'Custom training modules',
      'Audit preparation support',
      'Priority support (4h SLA)',
    ],
  },
} as const;
