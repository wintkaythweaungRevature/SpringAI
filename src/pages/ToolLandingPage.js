import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getToolBySlug, TOOLS } from '../data/toolsData';

export default function ToolLandingPage() {
  const { slug } = useParams();
  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <div style={s.notFound}>
        <h1>Tool not found</h1>
        <Link to="/" style={s.backLink}>← Back to W!ntAi</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{tool.metaTitle}</title>
        <meta name="description" content={tool.metaDescription} />
        <meta name="keywords" content={tool.keywords} />
        <meta property="og:title" content={tool.metaTitle} />
        <meta property="og:description" content={tool.metaDescription} />
        <meta property="og:url" content={`https://wintaibot.com/tools/${tool.slug}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://wintaibot.com/tools/${tool.slug}`} />
      </Helmet>

      <div style={s.page}>
        {/* Nav */}
        <nav style={s.nav}>
          <Link to="/" style={s.logo}>W!ntAi</Link>
          <div style={s.navLinks}>
            <a href="/#features" style={s.navLink}>All Tools</a>
            <a href="/pricing" style={s.navLink}>Pricing</a>
            <a href="/" style={{ ...s.navCta, background: tool.color }}>Try Free Trial →</a>
          </div>
        </nav>

        {/* Hero */}
        <section style={s.hero}>
          <div style={{ ...s.iconBubble, background: tool.color + '18' }}>
            <span style={s.icon}>{tool.icon}</span>
          </div>
          <span style={{ ...s.badge, background: tool.badge === 'Free' ? '#dcfce7' : '#ede9fe', color: tool.badge === 'Free' ? '#15803d' : '#6d28d9' }}>
            {tool.badge === 'Free' ? '✓ Free — no credit card' : `Paid — from $19/mo (annual discounts)`}
          </span>
          <h1 style={s.h1}>{tool.fullName}</h1>
          <p style={s.heroSub}>{tool.headline}</p>
          <a href="/" style={{ ...s.ctaBtn, background: tool.color }}>
            Try {tool.name} Free →
          </a>
        </section>

        {/* Description */}
        <section style={s.section}>
          <div style={s.descCard}>
            <h2 style={s.h2}>What is {tool.name}?</h2>
            <p style={s.desc}>{tool.description}</p>
          </div>
        </section>

        {/* Use Cases */}
        <section style={s.section}>
          <h2 style={{ ...s.h2, textAlign: 'center', marginBottom: '8px' }}>Who Uses {tool.name}?</h2>
          <p style={s.sectionSub}>Real use cases for real workflows</p>
          <div style={s.useCaseGrid}>
            {tool.useCases.map(uc => (
              <div key={uc.title} style={s.useCaseCard}>
                <span style={s.ucIcon}>{uc.icon}</span>
                <h3 style={s.ucTitle}>{uc.title}</h3>
                <p style={s.ucDesc}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        <section style={{ ...s.section, background: '#f8fafc', borderRadius: '16px', padding: '32px' }}>
          <h2 style={{ ...s.h2, textAlign: 'center', marginBottom: '8px' }}>Example Prompts</h2>
          <p style={s.sectionSub}>Try these as soon as you open {tool.name}</p>
          <div style={s.promptList}>
            {tool.examplePrompts.map((p, i) => (
              <div key={i} style={s.promptItem}>
                <span style={{ ...s.promptNum, background: tool.color }}>{i + 1}</span>
                <span style={s.promptText}>"{p}"</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={s.ctaSection}>
          <h2 style={s.ctaH2}>Ready to try {tool.name}?</h2>
          <p style={s.ctaSub}>
            {tool.badge === 'Free'
              ? 'It\'s completely free — no credit card, no download.'
              : 'Unlock on Starter, Pro, or Growth — from $19/mo, annual options available.'}
          </p>
          <a href="/" style={{ ...s.ctaBtn, background: tool.color, fontSize: '18px', padding: '16px 40px' }}>
            Start for Free →
          </a>
        </section>

        {/* Other Tools */}
        <section style={s.section}>
          <h2 style={{ ...s.h2, textAlign: 'center', marginBottom: '24px' }}>Explore Other Tools</h2>
          <div style={s.otherGrid}>
            {TOOLS.filter(t => t.slug !== slug).slice(0, 4).map(t => (
              <Link key={t.slug} to={`/tools/${t.slug}`} style={s.otherCard}>
                <span style={s.otherIcon}>{t.icon}</span>
                <span style={s.otherName}>{t.name}</span>
                <span style={{ ...s.otherBadge, background: t.badge === 'Free' ? '#dcfce7' : '#ede9fe', color: t.badge === 'Free' ? '#15803d' : '#6d28d9' }}>{t.badge}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={s.footer}>
          <Link to="/" style={s.logo}>W!ntAi</Link>
          <div style={s.footerLinks}>
            <Link to="/privacy-policy" style={s.footerLink}>Privacy Policy</Link>
            <Link to="/terms-of-service" style={s.footerLink}>Terms of Service</Link>
            <Link to="/refund-policy" style={s.footerLink}>Refund Policy</Link>
            <Link to="/changelog" style={s.footerLink}>Changelog</Link>
            <a href="mailto:contact@wintaibot.com" style={s.footerLink}>Contact</a>
          </div>
          <p style={s.footerCopy}>© 2026 W!ntAi. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

const s = {
  page:         { fontFamily: "'Inter',-apple-system,sans-serif", color: '#1e293b', maxWidth: '900px', margin: '0 auto', padding: '0 20px' },
  notFound:     { textAlign: 'center', padding: '80px 20px' },
  backLink:     { color: '#2563eb', textDecoration: 'none' },
  nav:          { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '0' },
  logo:         { fontWeight: 800, fontSize: '20px', color: '#1e3a8a', textDecoration: 'none' },
  navLinks:     { display: 'flex', alignItems: 'center', gap: '16px' },
  navLink:      { color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: 500 },
  navCta:       { color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '8px' },
  hero:         { textAlign: 'center', padding: '60px 0 40px' },
  iconBubble:   { width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  icon:         { fontSize: '36px' },
  badge:        { display: 'inline-block', borderRadius: '100px', padding: '4px 14px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' },
  h1:           { fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', color: '#0f172a' },
  heroSub:      { fontSize: '18px', color: '#475569', maxWidth: '600px', margin: '0 auto 28px', lineHeight: 1.6 },
  ctaBtn:       { display: 'inline-block', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '16px', padding: '14px 32px', borderRadius: '10px', transition: 'opacity 0.15s' },
  section:      { marginBottom: '48px' },
  descCard:     { background: '#f8fafc', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' },
  h2:           { fontSize: '24px', fontWeight: 800, margin: '0 0 12px', color: '#0f172a' },
  desc:         { fontSize: '16px', color: '#475569', lineHeight: 1.7, margin: 0 },
  sectionSub:   { textAlign: 'center', color: '#64748b', fontSize: '15px', marginBottom: '24px' },
  useCaseGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' },
  useCaseCard:  { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  ucIcon:       { fontSize: '28px', display: 'block', marginBottom: '10px' },
  ucTitle:      { fontWeight: 700, fontSize: '15px', margin: '0 0 6px', color: '#0f172a' },
  ucDesc:       { fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 },
  promptList:   { display: 'flex', flexDirection: 'column', gap: '12px' },
  promptItem:   { display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e2e8f0' },
  promptNum:    { color: '#fff', fontWeight: 800, fontSize: '13px', borderRadius: '6px', padding: '2px 8px', flexShrink: 0, marginTop: '1px' },
  promptText:   { fontSize: '14px', color: '#374151', lineHeight: 1.5, fontStyle: 'italic' },
  ctaSection:   { textAlign: 'center', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: '20px', padding: '56px 32px', marginBottom: '48px', color: '#fff' },
  ctaH2:        { fontSize: '32px', fontWeight: 800, margin: '0 0 12px' },
  ctaSub:       { fontSize: '16px', opacity: 0.85, margin: '0 0 28px' },
  otherGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' },
  otherCard:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 12px', textDecoration: 'none', color: '#1e293b', transition: 'box-shadow 0.15s' },
  otherIcon:    { fontSize: '28px' },
  otherName:    { fontWeight: 700, fontSize: '13px' },
  otherBadge:   { borderRadius: '100px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 },
  footer:       { borderTop: '1px solid #e2e8f0', padding: '32px 0', textAlign: 'center', marginTop: '16px' },
  footerLinks:  { display: 'flex', justifyContent: 'center', gap: '20px', margin: '12px 0' },
  footerLink:   { color: '#64748b', textDecoration: 'none', fontSize: '13px' },
  footerCopy:   { color: '#94a3b8', fontSize: '12px', margin: 0 },
};
