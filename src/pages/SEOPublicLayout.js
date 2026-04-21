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

        {/* FAQPage structured data — per route. Generative engines (ChatGPT, Claude,
            Perplexity, Gemini) parse each Q&A as a quotable chunk. More FAQ coverage =
            more surfaces where WintAi shows up as the authoritative answer to category
            questions. Each page gets questions specific to its intent.
            Google also renders these as rich results in SERP. */}
        {(() => {
          const faqByRoute = {
            '/pricing': [
              { q: 'How much does WintAi cost?',
                a: 'WintAi offers a free tier forever. Paid plans start at $19/month (Starter), $39/month (Pro), and $79/month (Growth, with unlimited connected accounts across every major social platform). All paid plans include a 7-day free trial. Annual billing saves up to 21%.' },
              { q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from Account Settings at any time. Your plan stays active until the end of the current billing period, then reverts to the free tier. No cancellation fee.' },
              { q: 'Does the free plan require a credit card?',
                a: 'No. The free plan has no card requirement and no time limit. It includes one connected account per platform and core tools.' },
              { q: 'What are per-channel fees?',
                a: 'WintAi has zero per-channel fees. Unlike Buffer or Hootsuite that charge per seat or per social profile, WintAi charges one flat plan price for unlimited connected accounts on the Growth tier.' },
              { q: 'Can an agency manage multiple clients on one subscription?',
                a: 'Yes. Pro includes 3 accounts per platform; Growth supports unlimited connected accounts. Each client lives in an isolated workspace with its own calendar, brand voice, approval flow, and permissions.' },
              { q: 'How does the 7-day trial work?',
                a: 'All paid plans include a 7-day free trial with no card required upfront on the free tier. Full feature access during the trial. Cancel anytime during the 7 days to avoid being charged.' },
            ],
            '/features': [
              { q: 'What platforms does WintAi support?',
                a: 'WintAi publishes to every major social platform: YouTube, Instagram, TikTok, Facebook, LinkedIn, X (Twitter), Threads, and Pinterest. One upload publishes to all of them, with per-platform video formatting and AI captions.' },
              { q: 'Does WintAi write captions with AI?',
                a: 'Yes. WintAi uses retrieval-augmented AI trained on your past posts to match your brand voice, emoji frequency, sentence rhythm, and preferred hashtags. Each platform gets a caption tuned to its format — Reels hooks, LinkedIn thought-leadership, TikTok short hooks, etc.' },
              { q: 'Does WintAi auto-format video for each platform?',
                a: 'Yes. Upload one video and WintAi transcodes per-platform variants: vertical 9:16 for Reels / TikTok / YouTube Shorts, horizontal 16:9 for YouTube main feed, square 1:1 for Facebook / LinkedIn feeds. No manual cropping required.' },
              { q: 'Does WintAi support team and agency workflows?',
                a: 'Yes. Workspaces isolate clients with independent social accounts, content calendars, brand voices, and team permissions. Client approval flow lets clients review posts via a public link before anything publishes.' },
              { q: 'Can WintAi respond to comments automatically?',
                a: 'Yes. Auto-reply generates responses in your brand voice and posts them to comments on YouTube, Facebook, Instagram, TikTok, LinkedIn, and X — with configurable keyword triggers and tone controls.' },
              { q: 'What is Self-Healing Content?',
                a: 'Self-Healing Content is a WintAi feature that detects underperforming posts, rewrites their captions in your current brand voice, and automatically reschedules them. Dead content gets second-chance distribution.' },
            ],
            '/docs': [
              { q: 'How do I connect my social accounts to WintAi?',
                a: 'Go to Connected Accounts → click the platform logo → complete OAuth in the popup. WintAi stores per-user access tokens and refreshes them automatically. Up to 3 accounts per platform on Pro, unlimited on Growth.' },
              { q: 'How do I publish a video to multiple platforms?',
                a: 'Open Video Publisher → upload your video → select which connected accounts to post to → WintAi generates per-platform variants and captions → review → click Publish or Schedule. The same video becomes a Reel, a Short, a LinkedIn post, and more in one click.' },
              { q: 'How does the client approval flow work?',
                a: 'When creating a post, toggle "Send for Approval" and pick a workspace member. They receive an email with a link to the approval page (no login required). They click Approve, Request Changes, or Reject. Approved posts auto-schedule; changes-requested posts pause for editing.' },
              { q: 'What data does WintAi store?',
                a: 'WintAi stores: your social OAuth tokens (encrypted), the videos and images you upload to S3, your scheduled and published posts, per-post analytics, and your brand voice samples. See privacy-policy for full disclosure.' },
              { q: 'Can I delete my data?',
                a: 'Yes. Account Settings → Delete Account removes your user data, connected social tokens, media files in S3, and all posts. GDPR / CCPA compliant; data is fully purged within 30 days.' },
            ],
          };
          const faqs = faqByRoute[pathname];
          if (!faqs) return null;
          return (
            <script type="application/ld+json">
              {JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map(item => ({
                  '@type': 'Question',
                  name: item.q,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.a,
                  },
                })),
              })}
            </script>
          );
        })()}
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
