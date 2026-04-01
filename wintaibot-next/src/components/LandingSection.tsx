'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PlatformIcon from '@/components/PlatformIcon';
import './LandingSection.css';

const SI = 'https://cdn.simpleicons.org';

const infraStackLogos = [
  { label: 'AWS', fullLabel: 'Amazon Web Services', slug: 'amazonwebservices', color: '232F3E', href: 'https://aws.amazon.com' },
  { label: 'Cloudflare', fullLabel: 'Cloudflare', slug: 'cloudflare', color: 'F38020', href: 'https://www.cloudflare.com' },
  { label: 'PostgreSQL', fullLabel: 'PostgreSQL', slug: 'postgresql', color: '4169E1', href: 'https://www.postgresql.org' },
  { label: 'Java', fullLabel: 'OpenJDK / Java', slug: 'openjdk', color: '437291', href: 'https://openjdk.org' },
];

const landingPublishPlatforms = [
  { id: 'youtube', label: 'YouTube', emoji: '▶️', color: '#FF0000', logo: 'youtube' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', logo: 'instagram' },
  { id: 'facebook', label: 'Facebook', emoji: '👍', color: '#1877F2', logo: 'facebook' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵', color: '#010101', logo: 'tiktok' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼', color: '#0A66C2', logo: 'linkedin' },
  { id: 'x', label: 'X', emoji: '🐦', color: '#000000', logo: 'x' },
  { id: 'threads', label: 'Threads', emoji: '🧵', color: '#101010', logo: 'threads' },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌', color: '#E60023', logo: 'pinterest' },
] as const;

const VP_SHOWCASE_PLATFORMS = [
  { slug: 'youtube', color: 'FF0000' },
  { slug: 'tiktok', color: '000000' },
  { slug: 'facebook', color: '1877F2' },
  { slug: 'instagram', color: 'E4405F' },
] as const;

function VideoPublishShowcaseGraphic({ variant = 'hero' }: { variant?: 'hero' | 'card' | 'compact' }) {
  const v = variant === 'card' ? 'card' : variant === 'compact' ? 'compact' : 'hero';
  const imgSize = v === 'hero' ? 40 : v === 'compact' ? 34 : 32;
  return (
    <figure
      className={`ls-vp-showcase ls-vp-showcase--${v}`}
      aria-label="One video publishing to YouTube, TikTok, Facebook, and Instagram"
    >
      <div className="ls-vp-showcase__col ls-vp-showcase__col--src">
        <div className="ls-vp-showcase__screen">
          <div className="ls-vp-showcase__glow" aria-hidden="true" />
          <span className="ls-vp-showcase__play" aria-hidden="true">
            ▶
          </span>
        </div>
        {v !== 'card' && <span className="ls-vp-showcase__label">One upload</span>}
      </div>
      <div className="ls-vp-showcase__beam" aria-hidden="true">
        <span className="ls-vp-showcase__particle" />
        <span className="ls-vp-showcase__particle ls-vp-showcase__particle--d1" />
        <span className="ls-vp-showcase__particle ls-vp-showcase__particle--d2" />
      </div>
      <div className="ls-vp-showcase__targets">
        {VP_SHOWCASE_PLATFORMS.map((p) => (
          <div key={p.slug} className="ls-vp-showcase__target">
            <img
              src={`${SI}/${p.slug}/${p.color}`}
              alt=""
              width={imgSize}
              height={imgSize}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </figure>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'Ask AI – Instant Answers',
    description:
      'Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic — no downloads, no setup.',
    badge: 'Free',
  },
  {
    icon: '🍳',
    title: 'Recipe Generator',
    description:
      'Type the ingredients you have and get step-by-step recipes instantly. Reduce food waste, discover new dishes, and plan meals effortlessly.',
    badge: 'Free',
  },
  {
    icon: '📄',
    title: 'DocuWizard – PDF & Document AI',
    description:
      'Upload PDF, Excel, or Word files and extract structured data in seconds. Summarize reports, convert PDF tables to Excel, and analyze invoices with AI.',
    badge: 'Member',
  },
  {
    icon: '🎤',
    title: 'EchoScribe – Voice Transcription',
    description:
      'Convert audio recordings and live speech to accurate text. Transcribe meetings, lectures, and interviews — then summarize or translate the output.',
    badge: 'Member',
  },
  {
    icon: '🖼️',
    title: 'AI Image Generator',
    description:
      'Turn text prompts into stunning images in seconds. Create digital art, product mockups, social media graphics, and illustrations — no design skills needed.',
    badge: 'Member',
  },
  {
    icon: '✉️',
    title: 'Reply Enchanter – AI Email Writer',
    description:
      'Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.',
    badge: 'Member',
  },
  {
    icon: '📝',
    title: 'Resume Warlock – Interview Prep AI',
    description:
      'Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, sharpen weak areas, and land your next role.',
    badge: 'Member',
  },
  {
    icon: '🎬',
    title: 'Video Publisher – One Video, Every Platform',
    description:
      'Upload once, publish everywhere. Connect YouTube, Instagram, TikTok, and more. Get AI captions and hashtags per platform, schedule each post when you want.',
    badge: 'Member',
  },
];

const steps = [
  {
    num: '1',
    title: 'Create and Prepare',
    desc: 'Upload media, generate captions, and prepare platform-ready content from one workspace.',
  },
  {
    num: '2',
    title: 'Schedule and Publish',
    desc: 'Post now or schedule by platform with full visibility across your content calendar.',
  },
  {
    num: '3',
    title: 'Analyze and Improve',
    desc: 'Review best-time, calendar, and performance analytics, then optimize your next posts.',
  },
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'HR Manager',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sarahK&backgroundColor=e0e7ff',
    quote:
      'Resume Warlock helped me prep candidates before interviews. The AI-generated questions were spot-on for each resume. We cut interview prep time by half.',
  },
  {
    name: 'James T.',
    role: 'Freelance Developer',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=jamesT&backgroundColor=c7d2fe',
    quote:
      "I use Ask AI and Reply Enchanter every day. It's like having an assistant who never sleeps. The email drafts are professional and save me 30 minutes daily.",
  },
  {
    name: 'Mei L.',
    role: 'Graduate Student',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=meiL&backgroundColor=fce7f3',
    quote:
      'EchoScribe transcribes my lectures perfectly. I paste the transcript into Ask AI to get summaries and study notes. It\'s transformed how I study.',
  },
];

const techStack = [
  { label: 'Spring AI', url: 'https://spring.io/projects/spring-ai' },
  { label: 'React 19', url: 'https://react.dev' },
  { label: 'Java 21', url: 'https://openjdk.org' },
  { label: 'PostgreSQL', url: 'https://postgresql.org' },
  { label: 'AWS', url: 'https://aws.amazon.com' },
  { label: 'Cloudflare', url: 'https://cloudflare.com' },
  { label: 'Stripe Payments', url: 'https://stripe.com' },
  { label: 'Docker', url: 'https://docker.com' },
];

export default function LandingSection() {
  const router = useRouter();
  const { user, token, apiBase } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState('');

  const handlePlanCheckout = async (plan: 'STARTER' | 'PRO' | 'GROWTH') => {
    if (!user || !token) {
      router.push('/chat');
      return;
    }
    setLoadingPlan(plan);
    try {
      const base = apiBase || 'https://api.wintaibot.com';
      const res = await fetch(`${base}/api/subscription/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, billingInterval: 'MONTHLY' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `Checkout failed (${res.status})`);
      const url = data.url || data.checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      if (data.updated) {
        router.push('/pricing');
        return;
      }
      throw new Error('Checkout failed');
    } catch (err) {
      alert((err as Error).message || 'Checkout failed');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <main className="ls-root" aria-label="W!ntAi – AI Platform">
      <section className="ls-hero ls-hero--showcase" aria-labelledby="hero-heading">
        <div className="ls-hero-inner ls-hero-inner--split">
          <div className="ls-hero-copy">
            <div className="ls-hero-badge">AI Social Media Publishing &amp; Analytics Platform</div>
            <h1 id="hero-heading" className="ls-hero-h1">
              Plan, Publish, and Optimize
              <br />
              Your Social Media Workflow with AI
            </h1>
            <p className="ls-hero-sub">
              <strong>One workspace</strong> for video, scheduling, inbox, analytics, and AI — so you spend less time in tabs and more time creating.
            </p>
            <div className="ls-hero-actions">
              <Link href="/chat" className="ls-btn-primary">
                Try Free — No Credit Card
              </Link>
              <Link href="/#features" className="ls-btn-ghost">
                See showcase →
              </Link>
            </div>
            <p className="ls-hero-note">
              Free tier includes <strong>Ask AI</strong> and <strong>Recipe Generator</strong>. Paid
              plans from <strong>$19/month</strong> (or <strong>$15/mo</strong> billed annually).
            </p>
          </div>
          <div className="ls-hero-visual">
            <VideoPublishShowcaseGraphic variant="hero" />
          </div>
        </div>
      </section>

      <section className="ls-section ls-what" aria-labelledby="what-heading">
        <h2 id="what-heading">What Is W!ntAi?</h2>
        <p>
          W!ntAi is an AI-powered social media operations platform built to help you execute
          faster without losing control. It combines publishing, scheduling, analytics, inbox, and
          reply automation into one system.
        </p>
        <p>
          Main focus: <strong>social publishing workflow</strong>. Upload once, generate better
          captions, schedule per platform, monitor performance, and improve content decisions using
          your real post data.
        </p>
        <div className="ls-stat-row">
          <div className="ls-stat">
            <span className="ls-stat-num">1</span>
            <span>Unified Social Workflow</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">Free</span>
            <span>To Start</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">$19+</span>
            <span>Paid plans / mo</span>
          </div>
          <div className="ls-stat">
            <span className="ls-stat-num">API</span>
            <span>Integration-Based</span>
          </div>
        </div>
      </section>

      <section className="ls-section" id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">Product showcase</h2>
        <p className="ls-section-sub ls-section-sub--tight">
          Video, documents, voice, and AI tools — <strong>one subscription</strong>, fewer tabs.
        </p>
        <div className="ls-features-grid" role="list">
          {features.map((f) => (
            <article className="ls-feature-card" key={f.title} role="listitem">
              {f.title.startsWith('Video Publisher') && <VideoPublishShowcaseGraphic variant="card" />}
              <div className="ls-feature-top">
                <span className="ls-feature-icon" aria-hidden="true">
                  {f.icon}
                </span>
                <span className={`ls-badge ls-badge--${f.badge.toLowerCase()}`}>{f.badge}</span>
              </div>
              <h3 className="ls-feature-title">{f.title}</h3>
              <p className="ls-feature-desc">{f.description}</p>
              {f.title.startsWith('Video Publisher') && (
                <Link href="/video-publisher" className="ls-btn-outline ls-feature-cta">
                  Try Video Publisher →
                </Link>
              )}
            </article>
          ))}
        </div>
        <p className="ls-features-note">
          <strong>Free</strong> tools are available immediately after signup.{' '}
          <strong>Premium</strong> tools unlock on <strong>Starter</strong>, <strong>Pro</strong>, or{' '}
          <strong>Growth</strong> — see pricing for limits.
        </p>
      </section>

      <section className="ls-section ls-how" id="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">How It Works</h2>
        <p className="ls-section-sub">Start getting results in under 30 seconds.</p>
        <ol className="ls-steps" role="list">
          {steps.map((s) => (
            <li className="ls-step" key={s.num}>
              <article>
                <span className="ls-step-num" aria-hidden="true">
                  {s.num}
                </span>
                <h3 className="ls-step-title">{s.title}</h3>
                <p className="ls-step-desc">{s.desc}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="ls-section" id="use-cases" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading">Who W!ntAi Is Built For</h2>
        <div className="ls-usecase-grid" role="list">
          <article className="ls-usecase">
            <h3>Content Creators &amp; Social Managers</h3>
            <p>
              Use <strong>Video Publisher</strong> to upload once and publish to YouTube, Instagram,
              TikTok, LinkedIn, and more with platform-ready captions and scheduling.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Creator Teams</h3>
            <p>
              Coordinate content across channels, track scheduled items in calendar view, and keep
              posting consistency with one shared workflow.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Brands &amp; Small Businesses</h3>
            <p>
              Combine scheduling, message handling, and analytics in one place to improve
              performance without adding extra tools.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Agencies</h3>
            <p>
              Run multiple posting calendars and optimize with performance signals like best posting
              windows and post-level outcomes.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Community-Led Products</h3>
            <p>
              Manage inbound comments and DMs with unified inbox + auto-reply rules while keeping
              responses on brand.
            </p>
          </article>
          <article className="ls-usecase">
            <h3>Data-Driven Marketing Teams</h3>
            <p>
              Use analytics and Social AI insights to iterate quickly on formats, hooks, and posting
              cadence.
            </p>
          </article>
        </div>
      </section>

      <section className="ls-section ls-pricing" id="pricing" aria-labelledby="pricing-heading">
        <h2 id="pricing-heading">Simple, Transparent Pricing</h2>
        <p className="ls-section-sub">Start free. Upgrade when you need more — annual billing saves up to ~21%.</p>

        <div className="ls-pricing-why" aria-labelledby="why-pricing-heading">
          <h3 id="why-pricing-heading">Why these numbers?</h3>
          <div className="ls-pricing-why-grid">
            <div className="ls-pricing-why-block">
              <h4>Starter — $19/mo</h4>
              <p>
                Buffer charges about <strong>$18/mo</strong> for fewer features. Staying <strong>under $20</strong> is a
                psychological anchor — cheap enough to try. Roughly <strong>7 paying users</strong> cover baseline AWS hosting.
              </p>
            </div>
            <div className="ls-pricing-why-block">
              <h4>Pro — $39/mo</h4>
              <p>
                About <strong>half the price of Hootsuite</strong> (~$99) with stronger <strong>video &amp; AI</strong> workflows.
                A sweet spot for small businesses; on the order of <strong>4 users</strong> covers a typical full AWS bill.
              </p>
            </div>
            <div className="ls-pricing-why-block">
              <h4>Growth — $79/mo</h4>
              <p>
                Still <strong>below many enterprise schedulers</strong>, with <strong>team seats</strong> (as you roll them out) and
                room for margin — roughly <strong>2 accounts</strong> can cover AWS plus profit at this tier.
              </p>
            </div>
          </div>
        </div>

        <div className="ls-plans">
          <article className="ls-plan">
            <div className="ls-plan-name">Free</div>
            <div className="ls-plan-price">
              $0 <span>/ forever</span>
            </div>
            <ul className="ls-plan-features">
              <li>Ask AI chatbot (unlimited)</li>
              <li>Recipe Generator (unlimited)</li>
              <li>No credit card required</li>
            </ul>
            <Link href="/chat" className="ls-btn-outline">
              Get Started Free
            </Link>
          </article>

          <article className="ls-plan">
            <div className="ls-plan-name">Starter</div>
            <div className="ls-plan-price">
              $19 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$15/mo</strong> billed annually (<strong>$180/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Free</li>
              <li>Premium AI: DocuWizard, EchoScribe, Image Gen, Email, Resume</li>
              <li>Video Publisher: <strong>5</strong> connected platforms</li>
              <li>
                <strong>10</strong> videos / month · <strong>30</strong> scheduled posts / month
              </li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li className="ls-li-off">Deep analytics</li>
              <li className="ls-li-off">AI Social Chat (RAG)</li>
              <li>
                <strong>1</strong> seat
              </li>
            </ul>
            <button type="button" className="ls-btn-outline" onClick={() => handlePlanCheckout('STARTER')} disabled={loadingPlan === 'STARTER'}>
              {loadingPlan === 'STARTER' ? 'Redirecting...' : 'Choose Starter'}
            </button>
          </article>

          <article className="ls-plan ls-plan--featured">
            <div className="ls-plan-popular">Most Popular</div>
            <div className="ls-plan-name">Pro</div>
            <div className="ls-plan-price">
              $39 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$32/mo</strong> billed annually (<strong>$384/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Starter</li>
              <li>
                <strong>All 8</strong> platforms · <strong>30</strong> videos / month
              </li>
              <li>
                <strong>Unlimited</strong> scheduled posts
              </li>
              <li>Deep analytics</li>
              <li>AI Social Chat (RAG)</li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li>
                <strong>1</strong> seat
              </li>
            </ul>
            <button type="button" className="ls-btn-primary" onClick={() => handlePlanCheckout('PRO')} disabled={loadingPlan === 'PRO'}>
              {loadingPlan === 'PRO' ? 'Redirecting...' : 'Choose Pro'}
            </button>
          </article>

          <article className="ls-plan">
            <div className="ls-plan-name">Growth</div>
            <div className="ls-plan-price">
              $79 <span>/ month</span>
            </div>
            <p className="ls-plan-annual">
              <strong>$64/mo</strong> billed annually (<strong>$768/yr</strong>)
            </p>
            <ul className="ls-plan-features">
              <li>Everything in Pro</li>
              <li>
                <strong>Unlimited</strong> videos
              </li>
              <li>
                <strong>Priority</strong> processing queue
              </li>
              <li>
                <strong>3</strong> team seats <span style={{ color: '#64748b', fontWeight: 400 }}>(when enabled)</span>
              </li>
              <li>Deep analytics · AI Social Chat (RAG)</li>
            </ul>
            <button type="button" className="ls-btn-outline" onClick={() => handlePlanCheckout('GROWTH')} disabled={loadingPlan === 'GROWTH'}>
              {loadingPlan === 'GROWTH' ? 'Redirecting...' : 'Choose Growth'}
            </button>
          </article>
        </div>

        <div className="ls-comparison-wrap">
          <p className="ls-comparison-title">Video &amp; social — per-plan limits</p>
          <table className="ls-comparison-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Starter $19</th>
                <th scope="col">Pro $39</th>
                <th scope="col">Growth $79</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Platforms</td>
                <td>5</td>
                <td>All 8</td>
                <td>All 8</td>
              </tr>
              <tr>
                <td>Videos / month</td>
                <td>10</td>
                <td>30</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>AI captions</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Thumbnail picker</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Link-in-bio</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Deep analytics</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>AI Social Chat (RAG)</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Team seats</td>
                <td>1</td>
                <td>1</td>
                <td>3</td>
              </tr>
              <tr>
                <td>Scheduled posts</td>
                <td>30/mo</td>
                <td>Unlimited</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <td>Priority processing</td>
                <td className="ls-no">—</td>
                <td className="ls-no">—</td>
                <td className="ls-ok">✓</td>
              </tr>
              <tr>
                <td>Annual (effective / mo)</td>
                <td>$15 ($180/yr)</td>
                <td>$32 ($384/yr)</td>
                <td>$64 ($768/yr)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="ls-section ls-testimonials"
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <h2 id="testimonials-heading">What Users Are Saying</h2>
        <div className="ls-testimonial-grid">
          {testimonials.map((t) => (
            <blockquote className="ls-testimonial" key={t.name}>
              <p className="ls-testimonial-quote">&quot;{t.quote}&quot;</p>
              <footer className="ls-testimonial-author">
                <img
                  className="ls-testimonial-avatar"
                  src={t.avatar}
                  alt=""
                  width={52}
                  height={52}
                  loading="lazy"
                  decoding="async"
                />
                <div className="ls-testimonial-author-meta">
                  <strong>{t.name}</strong>
                  <span className="ls-testimonial-role">{t.role}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="ls-section ls-authority" id="about" aria-labelledby="authority-heading">
        <h2 id="authority-heading">Built with Trusted Technology</h2>
        <p className="ls-section-sub">
          W!ntAi is built on enterprise-grade open-source tools and hosted on AWS
          infrastructure — reliable, secure, and scalable.
        </p>
        <div className="ls-tech-row">
          {techStack.map((t) => (
            <a
              key={t.label}
              href={t.url}
              className="ls-tech-badge"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.label}
            </a>
          ))}
        </div>
        <div className="ls-authority-links">
          <a
            href="https://github.com/wintkaythweaungRevature"
            className="ls-authority-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub — View Source Code
          </a>
          <a
            href="https://api.wintaibot.com/swagger-ui.html"
            className="ls-authority-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Documentation (Swagger)
          </a>
        </div>
      </section>

      <section className="ls-section ls-faq" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        {[
          {
            q: 'Is W!ntAi really free to use?',
            a: 'Yes. The Ask AI chatbot and Recipe Generator are completely free with no credit card required. Premium tools unlock on Starter ($19/mo), Pro ($39/mo), or Growth ($79/mo), with annual discounts. See pricing for Video Publisher and analytics limits.',
          },
          {
            q: 'What file types does DocuWizard support?',
            a: 'DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files. It can extract tables, summarize content, and answer questions about the document.',
          },
          {
            q: 'How accurate is EchoScribe transcription?',
            a: 'EchoScribe uses AI-powered speech recognition optimized for English. It performs well on clear recordings of meetings, lectures, and interviews.',
          },
          {
            q: 'Can I cancel my subscription anytime?',
            a: 'Yes, absolutely. You can cancel any paid plan at any time from your Account Settings. You keep access until the end of your current billing period.',
          },
          {
            q: 'Is my data secure?',
            a: 'Files you upload are processed to generate your results and are not stored permanently. Payments go through Stripe only: W!ntAi does not store your bank account information or full card details on our servers — Stripe handles billing and payment data using their secure, PCI-compliant systems.',
          },
          {
            q: 'What does Video Publisher do?',
            a: 'Video Publisher lets you upload one video and publish it to YouTube, Instagram, TikTok, LinkedIn, and more. You get AI-generated captions and hashtags per platform, can schedule each platform at a different time, and see viral trends to plan your next content.',
          },
        ].map((item, i) => (
          <div className="ls-faq-item" key={i}>
            <button
              className="ls-faq-question"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
            >
              <span>{item.q}</span>
              <span className="ls-faq-icon">{openFaq === i ? '−' : '+'}</span>
            </button>
            {openFaq === i && <p className="ls-faq-answer">{item.a}</p>}
          </div>
        ))}
      </section>

      <section className="ls-section ls-final-cta" aria-label="Get started with W!ntAi">
        <h2>Ready to Run Your Social Workflow in One Place?</h2>
        <p>
          Publish faster, schedule with confidence, and optimize with real analytics and engagement
          data. Start free — no credit card needed.
        </p>
        <Link href="/chat" className="ls-btn-primary ls-btn-lg">
          Get Started Free →
        </Link>
      </section>

      <footer className="ls-footer">
        <div className="ls-footer-trust" aria-label="Production stack and social platforms">
          <p className="ls-footer-trust-lead">
            Built and hosted like a real SaaS product — not a blank page: Java &amp; Spring API, PostgreSQL,
            AWS infrastructure, Cloudflare-style edge where used, and direct integrations to eight social
            networks.
          </p>
          <div className="ls-footer-trust-rows">
            <div className="ls-footer-trust-group">
              <span className="ls-footer-trust-label">Infrastructure &amp; data</span>
              <div className="ls-footer-trust-logos">
                {infraStackLogos.map((item) => (
                  <a
                    key={item.slug}
                    className="ls-footer-infra-logo"
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.fullLabel}
                  >
                    <img
                      src={`${SI}/${item.slug}/${item.color}`}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="ls-footer-trust-group">
              <span className="ls-footer-trust-label">Publish destinations (8 platforms)</span>
              <div className="ls-footer-trust-logos ls-footer-trust-platforms">
                {landingPublishPlatforms.map((p) => (
                  <div key={p.id} className="ls-footer-platform-slot" title={p.label}>
                    <PlatformIcon platform={p} size={28} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p>
          © {new Date().getFullYear()} W!ntAi · Built by{' '}
          <a
            href="https://github.com/wintkaythweaungRevature"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wint Kay Thwe Aung
          </a>
          {' · '}
          <a href="mailto:contact@wintaibot.com">contact@wintaibot.com</a>
        </p>
        <nav className="ls-footer-nav" aria-label="Footer navigation">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/use-cases">Use Cases</Link>
          <a href="/#about">About</a>
          <a href="/#faq">FAQ</a>
          <a
            href="https://github.com/wintkaythweaungRevature"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </main>
  );
}
