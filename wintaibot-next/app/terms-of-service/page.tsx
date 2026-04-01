import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'W!ntAi Terms of Service. Terms and conditions for using our AI platform.',
};

const styles = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b',
    lineHeight: 1.7,
  },
  header: {
    background: '#0f172a',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  logo: { color: '#fff', fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none' },
  back: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
  },
  main: { maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' },
  h1: { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' },
  updated: { fontSize: '14px', color: '#64748b', marginBottom: '32px' },
  h2: { fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '28px', marginBottom: '10px' },
  p: { marginBottom: '14px', fontSize: '15px', color: '#334155' },
  ul: { marginBottom: '14px', paddingLeft: '24px' },
  li: { marginBottom: '6px', fontSize: '15px', color: '#334155' },
};

export default function TermsOfServicePage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          W!ntAi
        </Link>
        <Link href="/" style={styles.back}>
          ← Back to home
        </Link>
      </header>
      <main style={styles.main}>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.updated}>Last updated: February 2026</p>

        <p style={styles.p}>
          Welcome to W!ntAi. By accessing or using https://www.wintaibot.com and our AI tools (the
          &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
          If you do not agree, do not use the Service.
        </p>

        <h2 style={styles.h2}>Eligibility and Account</h2>
        <p style={styles.p}>
          You must be at least 13 years old and able to form a binding contract to use the Service.
          You are responsible for keeping your account credentials secure and for all activity under
          your account.
        </p>

        <h2 style={styles.h2}>Subscription and Payment</h2>
        <p style={styles.p}>
          Paid membership is billed in advance (e.g., monthly) via Stripe. Fees are non-refundable
          except where required by law. You may cancel your subscription at any time from Account
          Settings.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <p style={styles.p}>
          For questions about these Terms of Service, contact us at{' '}
          <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>
            contact@wintaibot.com
          </a>
          .
        </p>
      </main>
    </div>
  );
}
