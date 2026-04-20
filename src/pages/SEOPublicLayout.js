import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingSection from '../components/LandingSection';
import VideoPublisherTutorial from '../components/VideoPublisherTutorial';
import { TemplatesTutorial, DashboardTutorial, GrowthPlannerTutorial, EchoScribeTutorial, UrlRepurposerTutorial, AiWorkspaceTutorial, SelfHealingTutorial, BrandGuardianTutorial, AssetLibraryTutorial } from '../components/FeatureTutorials';
import BlogPage from '../components/BlogPage';
import './SEOPublicLayout.css';

// Route → (title, description, breadcrumbs). Descriptions prioritize the current
// social-media product positioning (previous copy referenced PDF/flashcards which
// was the MVP era — stale for 2026). Breadcrumbs drive Google rich-result snippets
// AND give LLMs a navigable site graph when they cite individual pages.
const ROUTE_META = {
  '/': {
    title: 'WintAi — AI Social Media Management for Creators & Agencies',
    description: 'Publish one video to every major social platform — YouTube, Instagram, TikTok, Facebook, LinkedIn, X, Threads, Pinterest — with unlimited accounts and AI captions in your brand voice. Start free.',
    breadcrumbs: [
      { name: 'Home', item: 'https://www.wintaibot.com/' },
    ],
  },
  '/about': {
    title: 'About WintAi — What It Is & Who Uses It',
    description: 'WintAi is an AI social media management platform for creators and agencies. Publish videos, schedule posts, and manage unlimited accounts across every major social platform from one dashboard.',
    breadcrumbs: [
      { name: 'Home',  item: 'https://www.wintaibot.com/' },
      { name: 'About', item: 'https://www.wintaibot.com/about' },
    ],
  },
  '/features': {
    title: 'Features — 15+ AI Tools for Social Media | WintAi',
    description: 'Video Publisher, AI Workspace, Viral Hooks, Content Calendar, Brand Guardian, Growth Planner, Self-Healing Content, Trend Hijacker, and more.',
    breadcrumbs: [
      { name: 'Home',     item: 'https://www.wintaibot.com/' },
      { name: 'Features', item: 'https://www.wintaibot.com/features' },
    ],
  },
  '/pricing': {
    title: 'Pricing — Free, Starter $19, Pro $39, Growth $79 | WintAi',
    description: 'WintAi pricing: Free tier, Starter $19/mo, Pro $39/mo, Growth $79/mo. 7-day free trial on all paid plans. Unlimited accounts on Growth.',
    breadcrumbs: [
      { name: 'Home',    item: 'https://www.wintaibot.com/' },
      { name: 'Pricing', item: 'https://www.wintaibot.com/pricing' },
    ],
  },
  '/use-cases': {
    title: 'Who Uses WintAi — Creators, Agencies, Teams | WintAi',
    description: 'Solo creators, marketing agencies, and teams use WintAi to publish across every major social platform with unlimited accounts, schedule with AI, and grow with brand-voice captions.',
    breadcrumbs: [
      { name: 'Home',      item: 'https://www.wintaibot.com/' },
      { name: 'Use Cases', item: 'https://www.wintaibot.com/use-cases' },
    ],
  },
  '/blog': {
    title: 'Blog — Social Media Tips, AI Content Guides | WintAi',
    description: 'Expert guides on AI-powered social media: content calendars, cross-platform publishing, brand voice, and growth strategies for creators and agencies.',
    breadcrumbs: [
      { name: 'Home', item: 'https://www.wintaibot.com/' },
      { name: 'Blog', item: 'https://www.wintaibot.com/blog' },
    ],
  },
  '/tutorial': {
    title: 'Tutorials — How to Use WintAi | WintAi',
    description: 'Step-by-step tutorials for Video Publisher, scheduling, analytics, AI Workspace, Brand Guardian, and more WintAi tools.',
    breadcrumbs: [
      { name: 'Home',      item: 'https://www.wintaibot.com/' },
      { name: 'Tutorials', item: 'https://www.wintaibot.com/tutorial' },
    ],
  },
  '/docs': {
    title: 'Documentation & API | WintAi',
    description: 'WintAi API documentation, Swagger UI, and integration guides for developers.',
    breadcrumbs: [
      { name: 'Home', item: 'https://www.wintaibot.com/' },
      { name: 'Docs', item: 'https://www.wintaibot.com/docs' },
    ],
  },
};

/* ─── Tutorial tab picker ──────────────────────────────────────── */
const TUTORIAL_TABS = [
  { id: 'video',        label: '📲 Video Publisher', Component: VideoPublisherTutorial },
  { id: 'templates',    label: '🎨 Templates',        Component: TemplatesTutorial },
  { id: 'dashboard',    label: '📊 Dashboard',         Component: DashboardTutorial },
  { id: 'growth',       label: '🗓️ Growth Planner',    Component: GrowthPlannerTutorial },
  { id: 'echoscribe',   label: '🎙 EchoScribe',        Component: EchoScribeTutorial },
  { id: 'repurposer',   label: '🔗 URL Repurposer',    Component: UrlRepurposerTutorial },
  { id: 'ai-workspace', label: '🤖 AI Workspace',      Component: AiWorkspaceTutorial },
  { id: 'self-healing', label: '🩺 Self-Healing',       Component: SelfHealingTutorial },
  { id: 'guardian',     label: '🛡 Brand Guardian',     Component: BrandGuardianTutorial },
  { id: 'assets',       label: '🗂 Asset Library',      Component: AssetLibraryTutorial },
];

function TutorialTabs() {
  const [active, setActive] = useState('video');
  const { Component } = TUTORIAL_TABS.find(t => t.id === active);
  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, padding: '24px 20px 0',
        flexWrap: 'wrap', background: '#0f172a',
      }}>
        {TUTORIAL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: 30, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.18s',
              background: active === tab.id ? '#6366f1' : '#1e293b',
              color:      active === tab.id ? '#fff'     : '#94a3b8',
              border:     active === tab.id ? 'none'     : '1.5px solid #334155',
              boxShadow:  active === tab.id ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Active tutorial */}
      <Component />
    </div>
  );
}

export default function SEOPublicLayout({ onGetStarted, onOpenVideoPublisher }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const handleGetStarted = () => (onGetStarted ? onGetStarted() : navigate('/?auth=signup'));
  const handleLogin = () => navigate('/?auth=login');
  const meta = ROUTE_META[pathname] || ROUTE_META['/'];
  // /tutorial has its own in-page tabs — don't auto-scroll into the content section
  const scrollTarget = (pathname === '/' || pathname === '/tutorial') ? null : (pathname === '/docs' ? 'about' : pathname.slice(1));

  useEffect(() => {
    if (scrollTarget) {
      const el = document.getElementById(scrollTarget);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollTarget]);

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://www.wintaibot.com${pathname}`} />
        {/* Open Graph + Twitter so social previews match the per-route title/description. */}
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`https://www.wintaibot.com${pathname}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="WintAi" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        {/* BreadcrumbList — Google uses this to render the "Home › Pricing" trail in
            search results (rich snippet), and LLMs use it to understand site hierarchy
            when they cite an inner page. */}
        {meta.breadcrumbs && meta.breadcrumbs.length > 1 && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: meta.breadcrumbs.map((b, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: b.name,
                item: b.item,
              })),
            })}
          </script>
        )}
      </Helmet>

      <header className="seo-nav" role="banner">
        <nav className="seo-nav-inner" aria-label="Main navigation">
          <a href="/" className="seo-nav-brand">
            <img src="/android-chrome-192x192.png" alt="W!ntAi logo" className="seo-nav-brand-logo" />
            <span>W!ntAi</span>
          </a>
          <div className="seo-nav-links">
            <a href="/">Home</a>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <div
              className="seo-nav-dropdown"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                type="button"
                className="seo-nav-dropdown-trigger"
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
                onClick={() => setResourcesOpen((o) => !o)}
              >
                Resources <span aria-hidden="true">▾</span>
              </button>
              {resourcesOpen && (
                <div className="seo-nav-dropdown-menu" role="menu">
                  <a href="/tutorial" role="menuitem" onClick={() => setResourcesOpen(false)}>Tutorials</a>
                  <a href="/blog" role="menuitem" onClick={() => setResourcesOpen(false)}>Blog</a>
                  <a href="/changelog" role="menuitem" onClick={() => setResourcesOpen(false)}>Changelog</a>
                </div>
              )}
            </div>
            <a href="/docs">Docs</a>
            <a href="/?auth=login" className="seo-nav-login" onClick={(e) => { e.preventDefault(); handleLogin(); }}>Login</a>
            <a href="/" className="seo-nav-cta" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>Try Free Trial →</a>
          </div>
        </nav>
      </header>

      {pathname === '/blog' ? (
        <main style={{ paddingTop: 80 }}>
          <BlogPage />
        </main>
      ) : pathname === '/tutorial' ? (
        <main id="tutorial" style={{ paddingTop: 80, background: '#0f172a' }}>
          {/* ── Tutorial tab selector ── */}
          <TutorialTabs />
          <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13, borderTop: '1px solid #1e293b', background: '#0f172a' }}>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} W!ntAi · Built by Wint Kay Thwe Aung</p>
          </footer>
        </main>
      ) : (
        <LandingSection onGetStarted={handleGetStarted} onOpenVideoPublisher={onOpenVideoPublisher} />
      )}

    </>
  );
}
