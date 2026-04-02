import type { Metadata } from 'next';
import Link from 'next/link';
import { CHANGELOG_ENTRIES } from '@/data/changelogEntries';
import { WINTAI_SOCIAL } from '@/config/brandSocial';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'W!ntAi public changelog and ship log. Follow our product updates and developer trail.',
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
  lead: { fontSize: '15px', color: '#475569', marginBottom: '28px' },
  socialWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px 16px',
    marginBottom: '32px',
    padding: '14px 16px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },
  socialLink: { color: '#2563eb', fontWeight: 600, fontSize: '14px', textDecoration: 'none' },
  entry: {
    marginBottom: '28px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
  },
  date: { fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' },
  title: { fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '6px 0 10px' },
  ul: { margin: 0, paddingLeft: '20px' },
  li: { marginBottom: '6px', fontSize: '15px', color: '#334155' },
};

export default function ChangelogPage() {
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
        <h1 style={styles.h1}>Changelog &amp; ship log</h1>
        <p style={styles.lead}>
          A public trail of what we ship. For bite-sized updates, follow W!ntAi on social — we post
          highlights there; this page stays the canonical history.
        </p>
        <div style={styles.socialWrap} role="group" aria-label="Official W!ntAi social profiles">
          <a href={WINTAI_SOCIAL.x} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            X (Twitter)
          </a>
          <a href={WINTAI_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            Facebook
          </a>
          <a href={WINTAI_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            LinkedIn
          </a>
        </div>

        {CHANGELOG_ENTRIES.map((entry, i) => (
          <article key={`${entry.date}-${i}`} style={styles.entry}>
            <div style={styles.date}>{entry.date}</div>
            <h2 style={styles.title}>{entry.title}</h2>
            <ul style={styles.ul}>
              {entry.items.map((line) => (
                <li key={line} style={styles.li}>
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </main>
    </div>
  );
}
