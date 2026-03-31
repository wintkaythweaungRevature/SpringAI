import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { TOOLS, getToolBySlug } from '@/data/toolsData';

type ToolPageProps = {
  params: { slug: string };
};

const siteUrl = 'https://wintaibot.com';

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return {
      title: 'Tool Not Found | Wintaibot',
      description: 'The requested tool page could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${siteUrl}/tools/${tool.slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords.split(',').map((keyword) => keyword.trim()),
    alternates: { canonical },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export default function ToolSlugPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = TOOLS.filter((item) => item.slug !== tool.slug).slice(0, 4);
  const isFree = tool.badge === 'Free';

  return (
    <main style={s.page}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>
          Wintaibot
        </Link>
        <div style={s.navLinks}>
          <Link href="/tools" style={s.navLink}>
            All Tools
          </Link>
          <Link href="/pricing" style={s.navLink}>
            Pricing
          </Link>
          <Link href="/" style={{ ...s.navCta, background: tool.color }}>
            Try Free
          </Link>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={{ ...s.iconBubble, background: `${tool.color}1c` }}>{tool.icon}</div>
        <span
          style={{
            ...s.badge,
            background: isFree ? '#dcfce7' : '#ede9fe',
            color: isFree ? '#15803d' : '#6d28d9',
          }}
        >
          {isFree ? 'Free Tool' : 'Member Tool'}
        </span>
        <h1 style={s.h1}>{tool.fullName}</h1>
        <p style={s.heroSub}>{tool.headline}</p>
        <div style={s.heroActions}>
          <Link href="/" style={{ ...s.primaryButton, background: tool.color }}>
            Start {tool.name}
          </Link>
          <Link href="/pricing" style={s.secondaryButton}>
            View Plans
          </Link>
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>What is {tool.name}?</h2>
        <p style={s.body}>{tool.description}</p>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Use Cases</h2>
        <div style={s.useCaseGrid}>
          {tool.useCases.map((useCase) => (
            <article key={useCase.title} style={s.useCaseCard}>
              <span style={s.useCaseIcon}>{useCase.icon}</span>
              <h3 style={s.useCaseTitle}>{useCase.title}</h3>
              <p style={s.useCaseDesc}>{useCase.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...s.section, ...s.promptSection }}>
        <h2 style={s.h2}>Example Prompts</h2>
        <p style={s.body}>
          Use these proven prompts as a starting point, then customize details for your audience,
          format, and workflow.
        </p>
        <ol style={s.promptList}>
          {tool.examplePrompts.map((prompt) => (
            <li key={prompt} style={s.promptItem}>
              {prompt}
            </li>
          ))}
        </ol>
      </section>

      <section style={s.cta}>
        <h2 style={{ ...s.h2, color: '#ffffff', marginBottom: 10 }}>Ready to use {tool.name}?</h2>
        <p style={{ ...s.body, color: '#dbeafe', marginBottom: 22 }}>
          {isFree
            ? 'Launch now without a credit card and start shipping faster with AI.'
            : 'Unlock this tool in member plans and scale your output with automation.'}
        </p>
        <Link href="/" style={{ ...s.primaryButton, background: '#ffffff', color: '#0f172a' }}>
          Get Started
        </Link>
      </section>

      <section style={s.section}>
        <h2 style={s.h2}>Related Tools</h2>
        <div style={s.relatedGrid}>
          {relatedTools.map((related) => (
            <Link key={related.slug} href={`/tools/${related.slug}`} style={s.relatedCard}>
              <span style={s.relatedIcon}>{related.icon}</span>
              <h3 style={s.relatedTitle}>{related.name}</h3>
              <p style={s.relatedDesc}>{related.headline}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: '#0f172a',
    maxWidth: 980,
    margin: '0 auto',
    padding: '0 20px 70px',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: 16,
  },
  logo: { textDecoration: 'none', fontWeight: 800, fontSize: 22, color: '#1e3a8a' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 12 },
  navLink: { textDecoration: 'none', color: '#475569', fontWeight: 600, fontSize: 14 },
  navCta: {
    textDecoration: 'none',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: 14,
    padding: '9px 14px',
    borderRadius: 10,
  },
  hero: { textAlign: 'center', padding: '48px 0 34px' },
  iconBubble: {
    width: 82,
    height: 82,
    margin: '0 auto 14px',
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    fontSize: 36,
  },
  badge: {
    borderRadius: 999,
    padding: '4px 11px',
    fontSize: 12,
    fontWeight: 700,
    display: 'inline-block',
    marginBottom: 14,
  },
  h1: { margin: '0 0 12px', fontSize: 'clamp(32px, 5vw, 50px)', lineHeight: 1.12 },
  heroSub: { margin: '0 auto', maxWidth: 760, color: '#475569', fontSize: 18, lineHeight: 1.65 },
  heroActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
  },
  primaryButton: {
    textDecoration: 'none',
    color: '#ffffff',
    fontWeight: 700,
    padding: '11px 20px',
    borderRadius: 10,
    display: 'inline-block',
  },
  secondaryButton: {
    textDecoration: 'none',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    fontWeight: 700,
    padding: '11px 20px',
    borderRadius: 10,
    display: 'inline-block',
  },
  section: { marginTop: 34 },
  h2: { fontSize: 28, margin: '0 0 10px', lineHeight: 1.2 },
  body: { color: '#475569', fontSize: 16, lineHeight: 1.75, margin: 0 },
  useCaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    marginTop: 14,
  },
  useCaseCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 16,
    background: '#ffffff',
  },
  useCaseIcon: { fontSize: 24, display: 'inline-block', marginBottom: 8 },
  useCaseTitle: { margin: '0 0 6px', fontSize: 16 },
  useCaseDesc: { margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  promptSection: {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderRadius: 14,
    padding: 18,
  },
  promptList: { marginTop: 12, marginBottom: 0, paddingLeft: 20, color: '#334155', lineHeight: 1.8 },
  promptItem: { marginBottom: 6 },
  cta: {
    marginTop: 34,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    padding: '34px 22px',
    textAlign: 'center',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    marginTop: 12,
  },
  relatedCard: {
    textDecoration: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 14,
    color: '#0f172a',
    background: '#ffffff',
  },
  relatedIcon: { display: 'inline-block', fontSize: 24, marginBottom: 6 },
  relatedTitle: { margin: '0 0 6px', fontSize: 16 },
  relatedDesc: { margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.5 },
};
