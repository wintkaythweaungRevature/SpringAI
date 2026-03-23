import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Wintaibot Privacy Policy. How we collect, use, and protect your data.',
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

export default function PrivacyPolicyPage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          Wintaibot
        </Link>
        <Link href="/" style={styles.back}>
          ← Back to home
        </Link>
      </header>
      <main style={styles.main}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.updated}>Last updated: February 2026</p>

        <p style={styles.p}>
          Wintaibot (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates
          https://www.wintaibot.com (the &quot;Site&quot;). This page informs you of our policies
          regarding the collection, use, and disclosure of personal information when you use our
          service.
        </p>

        <h2 style={styles.h2}>Information We Collect</h2>
        <p style={styles.p}>When you use Wintaibot, we may collect:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Account information (email address, name) when you register</li>
          <li style={styles.li}>
            Usage data (how you use our AI tools, such as prompts and file uploads) to provide and
            improve the service
          </li>
          <li style={styles.li}>
            Payment and subscription information when you subscribe (processed by Stripe; we do not
            store full card numbers)
          </li>
          <li style={styles.li}>
            Log data (IP address, browser type, access times) for security and operations
          </li>
        </ul>

        <h2 style={styles.h2}>How We Use Your Information</h2>
        <p style={styles.p}>
          We use the information we collect to provide, maintain, and improve Wintaibot; to process
          your account and subscription; to send you service-related communications; and to comply
          with legal obligations.
        </p>

        <h2 style={styles.h2}>Contact Us</h2>
        <p style={styles.p}>
          For questions about this Privacy Policy or your personal data, contact us at{' '}
          <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>
            contact@wintaibot.com
          </a>
          .
        </p>
      </main>
    </div>
  );
}
