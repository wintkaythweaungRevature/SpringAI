import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingSection from '../components/LandingSection';
import './SEOPublicLayout.css';

const ROUTE_META = {
  '/': {
    title: 'W!ntAi – AI Assistant for PDF Analysis, Documents & Productivity',
    description: 'W!ntAi is an AI assistant that analyzes PDFs, extracts data from documents, transcribes audio, generates images, writes emails, and prepares you for interviews. Start free.',
  },
  '/features': {
    title: 'Features – 8 AI Tools in One Platform | W!ntAi',
    description: 'DocuWizard, EchoScribe, AI Image Generator, Reply Enchanter, Resume Warlock, Video Publisher, Ask AI, Recipe Generator. All in one dashboard.',
  },
  '/pricing': {
    title: 'Pricing – Free, Starter $19, Pro $39, Growth $79 | W!ntAi',
    description: 'Start free. Paid plans from $19/mo ($15/mo annual) with video publisher limits; Pro $39 and Growth $79 with annual savings. Compare features and why we priced this way.',
  },
  '/use-cases': {
    title: 'Who Uses W!ntAi – Job Seekers, Professionals, Creators | W!ntAi',
    description: 'Job seekers, business professionals, students, content creators, and teams use W!ntAi to automate documents, emails, and more.',
  },
  '/blog': {
    title: 'Blogs – Guides & Updates | W!ntAi',
    description: 'Product updates, creator tips, and articles from the W!ntAi team.',
  },
  '/tutorial': {
    title: 'Tutorials – How to Use W!ntAi | W!ntAi',
    description: 'Step-by-step tutorials for Video Publisher, scheduling, analytics, and more.',
  },
  '/docs': {
    title: 'Documentation & API | W!ntAi',
    description: 'W!ntAi API documentation, Swagger UI, and integration guides.',
  },
};

export default function SEOPublicLayout({ onGetStarted, onOpenVideoPublisher }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const handleGetStarted = () => (onGetStarted ? onGetStarted() : navigate('/?auth=signup'));
  const handleLogin = () => navigate('/?auth=login');
  const meta = ROUTE_META[pathname] || ROUTE_META['/'];
  const scrollTarget = pathname === '/' ? null : (pathname === '/docs' ? 'about' : pathname.slice(1));

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

      <LandingSection onGetStarted={handleGetStarted} onOpenVideoPublisher={onOpenVideoPublisher} />
    </>
  );
}
