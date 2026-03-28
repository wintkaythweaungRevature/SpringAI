import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LandingSection from '../components/LandingSection';
import './SEOPublicLayout.css';

const ROUTE_META = {
  '/': {
    title: 'Wintaibot – AI Assistant for PDF Analysis, Documents & Productivity',
    description: 'Wintaibot is an AI assistant that analyzes PDFs, extracts data from documents, transcribes audio, generates images, writes emails, and prepares you for interviews. Start free.',
  },
  '/features': {
    title: 'Features – 8 AI Tools in One Platform | Wintaibot',
    description: 'DocuWizard, EchoScribe, AI Image Generator, Reply Enchanter, Resume Warlock, Video Publisher, Ask AI, Recipe Generator. All in one dashboard.',
  },
  '/pricing': {
    title: 'Pricing – Free, Starter $19, Pro $39, Growth $79 | Wintaibot',
    description: 'Start free. Paid plans from $19/mo ($15/mo annual) with video publisher limits; Pro $39 and Growth $79 with annual savings. Compare features and why we priced this way.',
  },
  '/use-cases': {
    title: 'Who Uses Wintaibot – Job Seekers, Professionals, Creators | Wintaibot',
    description: 'Job seekers, business professionals, students, content creators, and teams use Wintaibot to automate documents, emails, and more.',
  },
  '/docs': {
    title: 'Documentation & API | Wintaibot',
    description: 'Wintaibot API documentation, Swagger UI, and integration guides.',
  },
};

export default function SEOPublicLayout({ onGetStarted, onOpenVideoPublisher }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const handleGetStarted = () => (onGetStarted ? onGetStarted() : navigate('/'));
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
          <a href="/" className="seo-nav-brand">Wintaibot</a>
          <div className="seo-nav-links">
            <a href="/">Home</a>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="/use-cases">Use Cases</a>
            <a href="/docs">Docs</a>
            <a href="/" className="seo-nav-cta" onClick={(e) => { e.preventDefault(); handleGetStarted(); }}>Get Started Free →</a>
          </div>
        </nav>
      </header>

      <LandingSection onGetStarted={handleGetStarted} onOpenVideoPublisher={onOpenVideoPublisher} />
    </>
  );
}
