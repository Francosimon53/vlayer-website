'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PLANS } from '@/lib/stripe';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    });
  }, []);

  const handleUpgrade = async () => {
    // Check if user is authenticated
    if (!authChecked) {
      return; // Wait for auth check
    }

    if (!user) {
      window.location.href = '/login?redirect=/pricing&action=trial';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingPeriod }),
      });

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const proPrice = billingPeriod === 'monthly'
    ? PLANS.pro.priceMonthly
    : PLANS.pro.priceAnnual / 12;

  const savings = billingPeriod === 'annual'
    ? ((PLANS.pro.priceMonthly * 12 - PLANS.pro.priceAnnual) / (PLANS.pro.priceMonthly * 12) * 100).toFixed(0)
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.badge}>Pricing</div>
        <h1 style={styles.title}>Start free, scale as you grow</h1>
        <p style={styles.subtitle}>All plans include the full rule set and HIPAA 2026 coverage</p>

        {/* Billing Toggle */}
        <div style={styles.toggle}>
          <button
            style={{
              ...styles.toggleButton,
              ...(billingPeriod === 'monthly' ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            style={{
              ...styles.toggleButton,
              ...(billingPeriod === 'annual' ? styles.toggleButtonActive : {}),
            }}
            onClick={() => setBillingPeriod('annual')}
          >
            Annual <span style={styles.savingsBadge}>Save {savings}%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={styles.grid}>
        {/* Free Plan */}
        <div style={styles.card}>
          <h3 style={styles.planName}>{PLANS.free.name}</h3>
          <div style={styles.price}>
            <span style={styles.priceAmount}>$0</span>
            <span style={styles.pricePeriod}>/forever</span>
          </div>
          <p style={styles.description}>
            Perfect for individual developers and open source projects
          </p>

          <ul style={styles.features}>
            {PLANS.free.features.map((feature, i) => (
              <li key={i} style={styles.feature}>
                <span style={styles.checkmark}>✓</span> {feature}
              </li>
            ))}
          </ul>

          <a
            href="https://github.com/Francosimon53/verification-layer"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.buttonGhost}
          >
            Install via npm →
          </a>
        </div>

        {/* Pro Plan */}
        <div style={{ ...styles.card, ...styles.cardFeatured }}>
          <div style={styles.popularBadge}>Most Popular</div>
          <h3 style={styles.planName}>{PLANS.pro.name}</h3>
          <div style={styles.price}>
            <span style={styles.priceAmount}>${proPrice.toFixed(0)}</span>
            <span style={styles.pricePeriod}>/month</span>
          </div>
          {billingPeriod === 'annual' && (
            <p style={styles.billedAnnually}>Billed ${PLANS.pro.priceAnnual} annually</p>
          )}
          <p style={styles.description}>
            For teams building HIPAA-compliant healthcare apps
          </p>

          <ul style={styles.features}>
            {PLANS.pro.features.map((feature, i) => (
              <li key={i} style={styles.feature}>
                <span style={styles.checkmark}>✓</span> {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={styles.buttonPrimary}
          >
            {loading ? 'Loading...' : 'Start 14-Day Free Trial →'}
          </button>
          <p style={styles.trialNote}>No credit card required</p>
        </div>

        {/* Enterprise Plan */}
        <div style={styles.card}>
          <h3 style={styles.planName}>{PLANS.enterprise.name}</h3>
          <div style={styles.price}>
            <span style={styles.priceAmount}>Custom</span>
          </div>
          <p style={styles.description}>
            For healthcare organizations requiring advanced compliance
          </p>

          <ul style={styles.features}>
            {PLANS.enterprise.features.map((feature, i) => (
              <li key={i} style={styles.feature}>
                <span style={styles.checkmark}>✓</span> {feature}
              </li>
            ))}
          </ul>

          <a
            href="mailto:sales@vlayer.app"
            style={styles.buttonGhost}
          >
            Contact Sales →
          </a>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0a0f1e',
    color: '#ffffff',
    padding: '80px 24px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '64px',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(14, 165, 233, 0.1)',
    border: '1px solid rgba(14, 165, 233, 0.3)',
    color: '#0ea5e9',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '16px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#9ca3af',
    marginBottom: '32px',
  },
  toggle: {
    display: 'inline-flex',
    gap: '8px',
    background: '#1f2937',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid #374151',
  },
  toggleButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#9ca3af',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleButtonActive: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#ffffff',
  },
  savingsBadge: {
    marginLeft: '8px',
    fontSize: '12px',
    background: '#10b981',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: '16px',
    padding: '40px',
    position: 'relative' as const,
  },
  cardFeatured: {
    borderColor: '#0ea5e9',
    boxShadow: '0 0 40px rgba(14, 165, 233, 0.2)',
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#ffffff',
    padding: '4px 16px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  planName: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  price: {
    margin: '16px 0',
  },
  priceAmount: {
    fontSize: '48px',
    fontWeight: 700,
  },
  pricePeriod: {
    fontSize: '18px',
    color: '#9ca3af',
    fontWeight: 400,
  },
  billedAnnually: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '-8px',
    marginBottom: '16px',
  },
  description: {
    color: '#9ca3af',
    marginBottom: '24px',
    fontSize: '15px',
  },
  features: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '32px',
  },
  feature: {
    padding: '12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#9ca3af',
  },
  checkmark: {
    color: '#10b981',
    fontSize: '18px',
  },
  buttonPrimary: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  buttonGhost: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #374151',
    background: 'transparent',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center' as const,
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  trialNote: {
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '12px',
  },
};
