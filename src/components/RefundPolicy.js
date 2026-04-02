import React from 'react';

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

export default function RefundPolicy() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo}>W!ntAi</a>
        <a href="/" style={styles.back}>← Back to home</a>
      </header>
      <main style={styles.main}>
        <h1 style={styles.h1}>Refund Policy</h1>
        <p style={styles.updated}>Last updated: April 2026</p>

        <p style={styles.p}>
          This Refund Policy explains how refunds and cancellations work for paid subscriptions and
          one-time purchases on W!ntAi (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) at
          https://www.wintaibot.com. By purchasing a paid plan, you agree to this policy together with
          our{' '}
          <a href="/terms-of-service" style={{ color: '#2563eb', fontWeight: 600 }}>
            Terms of Service
          </a>
          .
        </p>

        <h2 style={styles.h2}>Payment processing (Stripe)</h2>
        <p style={styles.p}>
          Payments are processed securely by{' '}
          <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
            Stripe
          </a>
          , Inc. W!ntAi does not store your full card number. Stripe&apos;s terms and privacy practices
          also apply to payment transactions.
        </p>

        <h2 style={styles.h2}>Subscriptions</h2>
        <p style={styles.p}>
          Paid plans are billed on a recurring basis (monthly or annual, as selected at checkout).
          You may cancel your subscription at any time from your account or billing portal. After
          cancellation, you generally retain access to paid features until the end of your current
          billing period; we do not provide partial refunds for unused time within that period unless
          required by law or as described below.
        </p>

        <h2 style={styles.h2}>Refund requests</h2>
        <p style={styles.p}>
          If you believe you are entitled to a refund (for example, a duplicate charge, a billing
          error, or failure of the service to work as described in material respects), contact us at{' '}
          <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>
            contact@wintaibot.com
          </a>{' '}
          with your account email, date of charge, and a short description of the issue. We will
          review requests in good faith and respond within a reasonable time.
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            Where a refund is approved, we may process it through Stripe; timing may depend on your
            bank or card issuer.
          </li>
          <li style={styles.li}>
            Promotional or discounted periods may be subject to the specific terms shown at checkout.
          </li>
        </ul>

        <h2 style={styles.h2}>Chargebacks</h2>
        <p style={styles.p}>
          If you initiate a chargeback, we may suspend or close your account pending resolution. We
          encourage you to contact us first so we can help without involving your bank when possible.
        </p>

        <h2 style={styles.h2}>Changes</h2>
        <p style={styles.p}>
          We may update this Refund Policy from time to time. The &quot;Last updated&quot; date at the
          top will change when we do. Material changes may also be communicated by email or in-app
          notice where appropriate.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <p style={styles.p}>
          Questions about billing or refunds:{' '}
          <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>
            contact@wintaibot.com
          </a>
          .
        </p>
      </main>
    </div>
  );
}
