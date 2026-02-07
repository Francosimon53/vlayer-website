'use client';

import Link from 'next/link';

export function UpgradeBanner() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <span style={styles.icon}>🚀</span>
        <span style={styles.text}>
          Upgrade to Pro for CI/CD integration, templates, and audit reports.{' '}
          <strong>Start your 14-day free trial</strong>
        </span>
      </div>
      <Link href="/pricing" style={styles.button}>
        Upgrade Now →
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    borderRadius: '12px',
    margin: '16px 0',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#ffffff',
    fontSize: '15px',
  },
  icon: {
    fontSize: '24px',
  },
  text: {
    lineHeight: 1.5,
  },
  button: {
    padding: '10px 20px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    transition: 'background 0.2s',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
};
