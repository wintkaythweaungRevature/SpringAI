import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingSection.css";

/* ─── Data ─────────────────────────────────────────────────── */

const features = [
  {
    icon: "🤖",
    title: "Ask AI – Instant Answers",
    description:
      "Chat with a powerful AI assistant 24/7. Get answers, explanations, code help, writing assistance, and advice on any topic — no downloads, no setup.",
    badge: "Free",
    slug: "ask-ai",
  },
  {
    icon: "🍳",
    title: "Recipe Generator",
    description:
      "Type the ingredients you have and get step-by-step recipes instantly. Reduce food waste, discover new dishes, and plan meals effortlessly.",
    badge: "Free",
    slug: "recipe-generator",
  },
  {
    icon: "📄",
    title: "DocuWizard – PDF & Document AI",
    description:
      "Upload PDF, Excel, or Word files and extract structured data in seconds. Summarize reports, convert PDF tables to Excel, and analyze invoices with AI.",
    badge: "Member",
    slug: "docuwizard",
  },
  {
    icon: "🎤",
    title: "EchoScribe – Voice Transcription",
    description:
      "Convert audio recordings and live speech to accurate text. Transcribe meetings, lectures, and interviews — then summarize or translate the output.",
    badge: "Member",
    slug: "echoscribe",
  },
  {
    icon: "🖼️",
    title: "AI Image Generator",
    description:
      "Turn text prompts into stunning images in seconds. Create digital art, product mockups, social media graphics, and illustrations — no design skills needed.",
    badge: "Member",
    slug: "image-generator",
  },
  {
    icon: "✉️",
    title: "Reply Enchanter – AI Email Writer",
    description:
      "Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.",
    badge: "Member",
    slug: "reply-enchanter",
  },
  {
    icon: "📝",
    title: "Resume Warlock – Interview Prep AI",
    description:
      "Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, sharpen weak areas, and land your next role.",
    badge: "Member",
    slug: "resume-warlock",
  },
  {
    icon: "🎬",
    title: "Video Publisher – One Video, Every Platform",
    description:
      "Upload once, choose your destinations — we handle format and framing for each platform so you are not re-editing in another app. Pick your Shorts/Reels thumbnail (or let AI suggest the strongest frame), then review AI-generated captions and hashtags per network — edit anything before you schedule. Direct publishing to each network on your schedule, without a notification-heavy gatekeeping flow. Per-platform timing plus signals to plan what to post next.",
    badge: "Member",
    slug: "video-publisher",
  },
  {
    icon: "🚀",
    title: "Creator Suite – Grow, Automate & Analyze",
    description:
      "Everything to grow your audience in one place: follower growth charts, best-time forecasts, AI content ideas from your data, auto-reply to comments, link-in-bio page, and a full analytics dashboard.",
    badge: "Member",
    slug: "creator-suite",
  },
];

const steps = [
  {
    num: "1",
    title: "Choose a Tool",
    desc: "Social media managers start with Video Publisher, Messages, or Analytics; everyone else can open DocuWizard, EchoScribe, Ask AI, and more — eight tools in one login.",
  },
  {
    num: "2",
    title: "Paste, Upload, or Type",
    desc: "Input your text, upload a document, record audio, or describe what you need. Wintaibot accepts multiple input formats.",
  },
  {
    num: "3",
    title: "Get Instant AI Results",
    desc: "Receive accurate, high-quality output in seconds. Copy, download, or use the result directly in your workflow.",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    role: "HR Manager",
    quote:
      "Resume Warlock helped me prep candidates before interviews. The AI-generated questions were spot-on for each resume. We cut interview prep time by half.",
  },
  {
    name: "James T.",
    role: "Freelance Developer",
    quote:
      "I use Ask AI and Reply Enchanter every day. It's like having an assistant who never sleeps. The email drafts are professional and save me 30 minutes daily.",
  },
  {
    name: "Mei L.",
    role: "Graduate Student",
    quote:
      "EchoScribe transcribes my lectures perfectly. I paste the transcript into Ask AI to get summaries and study notes. It's transformed how I study.",
  },
];

const techStack = [
  { label: "Spring AI", url: "https://spring.io/projects/spring-ai" },
  { label: "React 19", url: "https://react.dev" },
  { label: "Java 21", url: "https://openjdk.org" },
  { label: "Stripe Payments", url: "https://stripe.com" },
  { label: "Docker", url: "https://docker.com" },
  { label: "AWS EC2", url: "https://aws.amazon.com/ec2/" },
];

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingSection({ onGetStarted, onChoosePlan, onOpenVideoPublisher }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="ls-root" aria-label="Wintaibot — social media video publishing and AI tools">

      {/* ── HERO (SEO: one H1 — video publishing + social managers) ── */}
      <section className="ls-hero" aria-labelledby="hero-heading">
        <div className="ls-hero-inner">
          <div className="ls-hero-badge">
            Multi-platform video publishing · Social media managers &amp; creators
          </div>
          <p className="ls-hero-kicker">The end of format errors</p>
          <h1 id="hero-heading" className="ls-hero-h1">
            If You Can Record It,<br /><span className="ls-hero-h1-accent">We Can Post It.</span>
          </h1>
          <p className="ls-hero-tagline">
            Upload once — Wintaibot adapts aspect ratio, framing, and quality for <strong>each network you choose</strong> (Instagram, YouTube Shorts, TikTok, Reels, and more).
            Add <strong>AI thumbnails</strong> and <strong>editable captions</strong>, then <strong>schedule</strong> or publish directly — plus inbox, auto-reply, and analytics in the same workspace.
          </p>
          <ul className="ls-hero-chips" aria-label="Product highlights">
            <li>No manual re-edits per platform</li>
            <li>Thumbnail picker + AI frames</li>
            <li>Schedule &amp; direct publishing</li>
            <li>Brand-aware Social AI (RAG)</li>
          </ul>
          <div className="ls-hero-actions">
            <button type="button" className="ls-btn-primary" onClick={onGetStarted}>
              Try Free — No Credit Card
            </button>
            <a className="ls-btn-ghost" href="/features">See all tools →</a>
          </div>
          <p className="ls-hero-note">
            <strong>Free:</strong> Ask AI &amp; Recipe Generator.{" "}
            <strong>Paid:</strong> Starter <strong>$19/mo</strong> · Pro <strong>$39/mo</strong> · Growth <strong>$79/mo</strong> — no per-channel fees, no install.
          </p>
        </div>
      </section>

      {/* ── WHAT IS WINTAIBOT ───────────────────────────────── */}
      <section className="ls-section ls-what" aria-labelledby="what-heading">
        <h2 id="what-heading">One workspace for social video — and the rest of your work</h2>
        <p className="ls-what-lead">
          <strong>Wintaibot</strong> is an <strong>AI platform for social media managers</strong> who publish <strong>video across Instagram, YouTube, TikTok,</strong> and other networks — without export gymnastics.
          The same account includes <strong>documents, transcription, email, and interview tools</strong> so teams do not pay for five different subscriptions.
        </p>
        <ul className="ls-what-bullets" aria-label="What you get">
          <li><strong>Video variants:</strong> correct format per platform you select — not one file forced everywhere</li>
          <li><strong>Thumbnails &amp; copy:</strong> pick frames or use AI; captions and hashtags are always editable</li>
          <li><strong>Ops in one place:</strong> schedule posts, Messages (DMs &amp; comments), optional AI auto-reply</li>
          <li><strong>Strategy:</strong> Analytics, Trends, and Social AI grounded in your real post history</li>
          <li><strong>Calm publishing:</strong> direct-to-network flow — fewer notification-driven steps</li>
        </ul>
        <p>
          <strong>Creators and social managers</strong> live in Video Publisher and analytics; <strong>professionals</strong> use DocuWizard and Reply Enchanter;
          <strong>job seekers</strong> use Resume Warlock; <strong>students</strong> use EchoScribe and Ask AI — all in one dashboard.
        </p>
        <div className="ls-stat-row">
          <div className="ls-stat"><span className="ls-stat-num">8</span><span>AI Tools</span></div>
          <div className="ls-stat"><span className="ls-stat-num">Free</span><span>To Start</span></div>
          <div className="ls-stat"><span className="ls-stat-num">$19+</span><span>Paid plans / mo</span></div>
          <div className="ls-stat"><span className="ls-stat-num">0</span><span>Installs Required</span></div>
        </div>
      </section>

      {/* ── ONE PLACE: SCHEDULE + INBOX + AUTO-REPLY ─────────── */}
      <section className="ls-section ls-social-hub" aria-labelledby="social-hub-heading">
        <h2 id="social-hub-heading">Schedule posts, read messages, automate replies — one login</h2>
        <p className="ls-section-sub ls-social-hub-intro">
          Creators shouldn&apos;t live in three tabs just to post, read messages, and answer fans.
          In Wintaibot you <strong>schedule posts</strong> per platform, open <strong>Messages</strong> for DMs and comments,
          and configure <strong>Auto Reply</strong> with <strong>AI on or off</strong> — your rules, your tone, your choice to automate or stay hands-on.
          Pair that with <strong>Analytics</strong>, <strong>Trends</strong>, and <strong>Social AI</strong> to generate ideas and analyze what actually worked.
        </p>
        <p className="ls-social-hub-direct">
          <strong>Direct publishing — we don&apos;t run your day on notifications.</strong>{" "}
          Some apps feel like a full-time job of unlocking steps on your phone: wait for the buzz, tap through prompts, repeat.
          Wintaibot is built the other way: <strong>you choose platforms and timing; we publish straight through</strong> when your content is ready.
          The goal is clarity — fewer interruptions, less &ldquo;notification anxiety,&rdquo; more time creating — not a workflow designed to ping you all day.
        </p>
      </section>

      {/* ── THREE ADVANTAGES: FIXER · THUMBNAILS · BRAIN AI ───── */}
      <section className="ls-section ls-video-edge" aria-labelledby="video-edge-heading">
        <h2 id="video-edge-heading">How we end format errors — and beat generic AI</h2>
        <p className="ls-section-sub ls-video-edge-intro">
          <strong>If you can record it, we can post it</strong> is the promise; here is how: <strong>automatic format fixes per destination</strong>,
          <strong>thumbnails you control</strong> (critical for Shorts and Reels), and <strong>strategy AI that knows your brand</strong> — not a one-size chatbot.
        </p>
        <ul className="ls-video-edge-list">
          <li>
            <span className="ls-video-edge-li-kicker">The fixer</span>
            <span className="ls-video-edge-li-title">Auto-optimization per destination</span>
            <span className="ls-video-edge-li-body">
              Other tools often stop at &ldquo;wrong ratio&rdquo; or &ldquo;wrong resolution&rdquo; and send <em>you</em> back to an editor.
              Wintaibot uses <strong>video variants</strong>: for <strong>each platform you select</strong>, we work toward the right shape, framing, and quality — crop, pad, upscale in the pipeline when needed — so the feeling is &ldquo;I uploaded once; Instagram <em>and</em> TikTok are already covered.&rdquo;
            </span>
          </li>
          <li>
            <span className="ls-video-edge-li-kicker">The eye-catcher</span>
            <span className="ls-video-edge-li-title">Thumbnail picker + AI assist</span>
            <span className="ls-video-edge-li-body">
              Shorts and vertical video live or die on the cover frame. Instead of accepting whatever the platform grabs automatically,
              use our <strong>thumbnail picker</strong>: choose the exact moment that looks best, or ask <strong>AI to suggest strong frames</strong>.
              Pair with <strong>AI captions and tags</strong> — always <strong>editable</strong> before you hit publish.
            </span>
          </li>
          <li>
            <span className="ls-video-edge-li-kicker">The brain</span>
            <span className="ls-video-edge-li-title">Contextual strategy (your data, not generic text)</span>
            <span className="ls-video-edge-li-body">
              Plain AI only writes text. Wintaibot&apos;s <strong>Social AI</strong> is built on your indexed posts (RAG): ask what format drove engagement last month,
              mirror a winning pattern in the next caption, or brainstorm ideas grounded in <strong>your</strong> history — a personal assistant that actually knows your brand.
            </span>
          </li>
        </ul>
      </section>

      {/* ── VS BUFFER / METRICOOL ───────────────────────────── */}
      <section className="ls-section ls-vs" aria-labelledby="vs-heading">
        <h2 id="vs-heading">How Wintaibot compares to Buffer &amp; Metricool</h2>
        <p className="ls-section-sub">
          Buffer and Metricool are great schedulers. Wintaibot is the only one where <strong>AI does the actual work</strong> — writing, replying, picking thumbnails, and adapting your video per platform automatically.
        </p>
        <div className="ls-vs-table-wrap">
          <table className="ls-vs-table" aria-label="Feature comparison: Wintaibot vs Buffer vs Metricool">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Buffer</th>
                <th scope="col">Metricool</th>
                <th scope="col" className="ls-vs-us">Wintaibot</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI writes captions &amp; hashtags per platform</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>AI auto-replies to comments 24/7 (Instagram, Facebook, YouTube)</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Multi-platform video — auto-fixes format per destination</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>AI thumbnail picker (scrub or AI-suggested frames)</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Social AI grounded in YOUR post history (RAG)</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Best time to post (AI analysis)</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Link-in-bio page</td>
                <td className="ls-vs-yes">✅</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Document &amp; PDF analysis</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Audio transcription</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-no">❌</td>
                <td className="ls-vs-yes">✅</td>
              </tr>
              <tr>
                <td>Per-channel pricing</td>
                <td className="ls-vs-warn">⚠️ $6/channel</td>
                <td className="ls-vs-warn">⚠️ $20/brand</td>
                <td className="ls-vs-yes">✅ Flat subscription</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="ls-vs-note">
          Buffer and Metricool data based on publicly available information as of 2026. Feature availability may vary by plan.
        </p>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="ls-section" id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">Tools for video publishing, documents, and daily work</h2>
        <p className="ls-section-sub">
          Social media teams get <strong>multi-platform video scheduling</strong>, captions, and analytics next to <strong>DocuWizard</strong>, <strong>EchoScribe</strong>, <strong>Ask AI</strong>, and more — one subscription, fewer tabs.
        </p>
        <div className="ls-features-grid" role="list">
          {features.map((f) => (
            <Link
              key={f.title}
              to={`/tools/${f.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}
            >
              <article className="ls-feature-card ls-feature-card--linked" role="listitem">
                <div className="ls-feature-top">
                  <span className="ls-feature-icon" aria-hidden="true">{f.icon}</span>
                  <span className={`ls-badge ls-badge--${f.badge.toLowerCase()}`}>{f.badge}</span>
                </div>
                <h3 className="ls-feature-title">{f.title}</h3>
                <p className="ls-feature-desc">{f.description}</p>
                {onOpenVideoPublisher && f.title.startsWith("Video Publisher") && (
                  <button type="button" className="ls-btn-outline ls-feature-cta" onClick={(e) => { e.preventDefault(); onOpenVideoPublisher(); }}>
                    Try Video Publisher →
                  </button>
                )}
                <span className="ls-feature-learn">Learn more →</span>
              </article>
            </Link>
          ))}
        </div>
        <p className="ls-features-note">
          <strong>Free</strong> tools are available immediately after signup.{" "}
          <strong>Premium</strong> tools (docs, transcription, images, email, interview prep, video publisher) unlock on{" "}
          <strong>Starter</strong>, <strong>Pro</strong>, or <strong>Growth</strong> — see pricing for limits.
        </p>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="ls-section ls-how" id="how-it-works" aria-labelledby="how-heading">
        <h2 id="how-heading">How It Works</h2>
        <p className="ls-section-sub">Start getting results in under 30 seconds.</p>
        <div className="ls-steps">
          {steps.map((s) => (
            <div className="ls-step" key={s.num}>
              <div className="ls-step-num" aria-hidden="true">{s.num}</div>
              <h3 className="ls-step-title">{s.title}</h3>
              <p className="ls-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ───────────────────────────────────────── */}
      <section className="ls-section" id="use-cases" aria-labelledby="usecases-heading">
        <h2 id="usecases-heading">Who Uses Wintaibot?</h2>
        <div className="ls-usecase-grid">
          <div className="ls-usecase ls-usecase--featured">
            <h3>Social media managers &amp; video creators</h3>
            <p>
              <strong>If you can record it, we can post it:</strong> use <strong>Video Publisher</strong> to upload once, <strong>pick your platforms</strong>, and let Wintaibot <strong>adapt format for each network</strong> — then refine <strong>AI captions and hashtags</strong>, <strong>schedule</strong> or publish directly, and use <strong>Analytics</strong>, <strong>Trends</strong>, and <strong>Social AI</strong> for ideas. <strong>AI Image Generator</strong> and <strong>Ask AI</strong> help with thumbnails and scripts.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Job Seekers</h3>
            <p>
              Upload your resume to <strong>Resume Warlock</strong> and receive
              AI-tailored interview questions. Practice answers, identify gaps in your
              experience, and walk into every interview prepared and confident.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Business Professionals</h3>
            <p>
              Extract key data from invoices and reports with <strong>DocuWizard</strong>,
              draft polished email responses in seconds with <strong>Reply Enchanter</strong>,
              and transcribe client calls with <strong>EchoScribe</strong>.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Students &amp; Researchers</h3>
            <p>
              Transcribe lectures and podcasts with <strong>EchoScribe</strong>, then
              paste the text into <strong>Ask AI</strong> for instant summaries, study notes,
              and explanations of complex topics.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Home Cooks</h3>
            <p>
              Open your fridge, list what you have, and let the <strong>Recipe Generator</strong>
              suggest delicious meals with full instructions. Reduce food waste and
              discover new cuisines every week.
            </p>
          </div>
          <div className="ls-usecase">
            <h3>Teams &amp; Small Businesses</h3>
            <p>
              Speed up document processing, automate repetitive email replies, and give
              every team member access to AI tools without expensive per-seat pricing.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
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

          <div className="ls-plan">
            <div className="ls-plan-name">Free</div>
            <div className="ls-plan-price">$0 <span>/ forever</span></div>
            <ul className="ls-plan-features">
              <li>Ask AI chatbot (unlimited)</li>
              <li>Recipe Generator (unlimited)</li>
              <li>No credit card required</li>
            </ul>
            <button type="button" className="ls-btn-outline" onClick={onGetStarted}>Get Started Free</button>
          </div>

          <div className="ls-plan">
            <div className="ls-plan-name">Starter</div>
            <div className="ls-plan-price">$19 <span>/ month</span></div>
            <p className="ls-plan-annual"><strong>$15/mo</strong> billed annually (<strong>$180/yr</strong>)</p>
            <ul className="ls-plan-features">
              <li>Everything in Free</li>
              <li>Premium AI: DocuWizard, EchoScribe, Image Gen, Reply Enchanter, Resume Warlock</li>
              <li>Video Publisher: <strong>5</strong> connected platforms</li>
              <li><strong>10</strong> videos / month · <strong>30</strong> scheduled posts / month</li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li className="ls-li-off">Deep analytics</li>
              <li className="ls-li-off">AI Social Chat (RAG)</li>
              <li><strong>1</strong> seat</li>
            </ul>
            <button type="button" className="ls-btn-outline" onClick={() => onChoosePlan ? onChoosePlan('STARTER') : onGetStarted()}>Choose Starter</button>
          </div>

          <div className="ls-plan ls-plan--featured">
            <div className="ls-plan-popular">Most Popular</div>
            <div className="ls-plan-name">Pro</div>
            <div className="ls-plan-price">$39 <span>/ month</span></div>
            <p className="ls-plan-annual"><strong>$32/mo</strong> billed annually (<strong>$384/yr</strong>)</p>
            <ul className="ls-plan-features">
              <li>Everything in Starter</li>
              <li><strong>All 8</strong> platforms · <strong>30</strong> videos / month</li>
              <li><strong>Unlimited</strong> scheduled posts</li>
              <li>Deep analytics</li>
              <li>AI Social Chat (RAG)</li>
              <li>AI captions, thumbnail picker, link-in-bio</li>
              <li><strong>1</strong> seat</li>
            </ul>
            <button type="button" className="ls-btn-primary" onClick={() => onChoosePlan ? onChoosePlan('PRO') : onGetStarted()}>Choose Pro</button>
          </div>

          <div className="ls-plan">
            <div className="ls-plan-name">Growth</div>
            <div className="ls-plan-price">$79 <span>/ month</span></div>
            <p className="ls-plan-annual"><strong>$64/mo</strong> billed annually (<strong>$768/yr</strong>)</p>
            <ul className="ls-plan-features">
              <li>Everything in Pro</li>
              <li><strong>Unlimited</strong> videos</li>
              <li><strong>Priority</strong> processing queue</li>
              <li><strong>3</strong> team seats <span style={{ color: '#64748b', fontWeight: 400 }}>(when enabled)</span></li>
              <li>Deep analytics · AI Social Chat (RAG)</li>
            </ul>
            <button type="button" className="ls-btn-outline" onClick={() => onChoosePlan ? onChoosePlan('GROWTH') : onGetStarted()}>Choose Growth</button>
          </div>
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
              <tr><td>Platforms</td><td>5</td><td>All 8</td><td>All 8</td></tr>
              <tr><td>Videos / month</td><td>10</td><td>30</td><td>Unlimited</td></tr>
              <tr><td>AI captions</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td></tr>
              <tr><td>Thumbnail picker</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td></tr>
              <tr><td>Link-in-bio</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td></tr>
              <tr><td>Deep analytics</td><td className="ls-no">—</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td></tr>
              <tr><td>AI Social Chat (RAG)</td><td className="ls-no">—</td><td className="ls-ok">✓</td><td className="ls-ok">✓</td></tr>
              <tr><td>Team seats</td><td>1</td><td>1</td><td>3</td></tr>
              <tr><td>Scheduled posts</td><td>30/mo</td><td>Unlimited</td><td>Unlimited</td></tr>
              <tr><td>Priority processing</td><td className="ls-no">—</td><td className="ls-no">—</td><td className="ls-ok">✓</td></tr>
              <tr><td>Annual (effective / mo)</td><td>$15 ($180/yr)</td><td>$32 ($384/yr)</td><td>$64 ($768/yr)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="ls-section ls-testimonials" id="testimonials" aria-labelledby="testimonials-heading">
        <h2 id="testimonials-heading">What Users Are Saying</h2>
        <div className="ls-testimonial-grid">
          {testimonials.map((t) => (
            <blockquote className="ls-testimonial" key={t.name}>
              <p className="ls-testimonial-quote">"{t.quote}"</p>
              <footer className="ls-testimonial-author">
                <strong>{t.name}</strong> · {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ── AUTHORITY / TECH STACK ──────────────────────────── */}
      <section className="ls-section ls-authority" id="about" aria-labelledby="authority-heading">
        <h2 id="authority-heading">Built with Trusted Technology</h2>
        <p className="ls-section-sub">
          Wintaibot is built on enterprise-grade open-source tools and hosted on
          AWS infrastructure — reliable, secure, and scalable.
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

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="ls-section ls-faq" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        {[
          {
            q: "Is Wintaibot really free to use?",
            a: "Yes. The Ask AI chatbot and Recipe Generator are completely free with no credit card required. Premium tools unlock on paid plans: Starter ($19/mo), Pro ($39/mo), or Growth ($79/mo), with annual discounts. See pricing for Video Publisher and analytics limits.",
          },
          {
            q: "What file types does DocuWizard support?",
            a: "DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files. It can extract tables, summarize content, and answer questions about the document.",
          },
          {
            q: "How accurate is EchoScribe transcription?",
            a: "EchoScribe uses AI-powered speech recognition optimized for English. It performs well on clear recordings of meetings, lectures, and interviews. Accuracy may vary with heavy accents or background noise.",
          },
          {
            q: "Can I cancel my subscription anytime?",
            a: "Yes, absolutely. You can cancel any paid plan at any time from your Account Settings. You keep access until the end of your current billing period.",
          },
          {
            q: "Is my data secure?",
            a: "Files you upload are processed to generate your results and are not stored permanently. Payments are handled by Stripe — we never store your card details.",
          },
          {
            q: "What does Video Publisher do?",
            a: "Upload once, choose your platforms — Wintaibot adapts the video for each destination (format and framing) so you are not fixing files by hand. You get AI captions and hashtags per platform, can schedule each at a different time, and see trends to plan your next content.",
          },
        ].map((item, i) => (
          <div className="ls-faq-item" key={i}>
            <button
              className="ls-faq-question"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              aria-expanded={openFaq === i}
            >
              <span>{item.q}</span>
              <span className="ls-faq-icon">{openFaq === i ? "−" : "+"}</span>
            </button>
            {openFaq === i && (
              <p className="ls-faq-answer">{item.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="ls-section ls-final-cta" aria-label="Get started with Wintaibot">
        <h2>Ready to post video everywhere — without format headaches?</h2>
        <p>
          Start free, then scale to <strong>Starter, Pro, or Growth</strong> for full <strong>video publishing</strong>, scheduling, and AI workflows.
          No credit card for the free tier.
        </p>
        <button className="ls-btn-primary ls-btn-lg" onClick={onGetStarted}>
          Get Started Free →
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="ls-footer">
        <p>
          © {new Date().getFullYear()} Wintaibot · Built by{" "}
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">
            Wint Kay Thwe Aung
          </a>
          {" · "}
          <a href="mailto:contact@wintaibot.com">contact@wintaibot.com</a>
        </p>
        <nav className="ls-footer-nav" aria-label="Footer navigation">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/use-cases">Use Cases</a>
          <a href="/#about">About</a>
          <a href="/#faq">FAQ</a>
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>

    </main>
  );
}
