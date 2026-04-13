import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LinkedInLogo } from "./PlatformIcon";
import { filterEnabledPlatforms, isPlatformDisabled } from "../config/disabledPlatforms";
import "./LandingSection.css";

/** Simple Icons CDN — same source as PlatformIcon (production- recognizable marks). */
const SI = "https://cdn.simpleicons.org";


/** Publish destinations shown on marketing (mirrors in-app picker; some may be temporarily hidden). */
const landingPublishPlatforms = filterEnabledPlatforms([
  { id: "youtube", label: "YouTube", color: "#FF0000", logo: "youtube" },
  { id: "instagram", label: "Instagram", color: "#E1306C", logo: "instagram" },
  { id: "facebook", label: "Facebook", color: "#1877F2", logo: "facebook" },
  { id: "tiktok", label: "TikTok", color: "#010101", logo: "tiktok" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", logo: "linkedin" },
  { id: "x", label: "X", color: "#000000", logo: "x" },
  { id: "threads", label: "Threads", color: "#101010", logo: "threads" },
  { id: "pinterest", label: "Pinterest", color: "#E60023", logo: "pinterest" },
]);

/** Icons for landing “showcase” graphic (Simple Icons CDN). */
const VP_SHOWCASE_PLATFORMS = [
  { slug: "youtube", color: "FF0000" },
  { slug: "tiktok", color: "000000" },
  { slug: "facebook", color: "1877F2" },
  { slug: "instagram", color: "E4405F" },
].filter((row) => !isPlatformDisabled(row.slug));

/**
 * Visual story: one video → beams → platform marks (showcase, not a wall of text).
 * variant: hero (dark glass on hero) | card (feature tile) | compact (inline section)
 */
/**
 * Product-grid card preview: same light “stage” as Video Publisher, tool-specific motion.
 * Decoupled from routing — keyed by feature slug.
 */
function FeatureCardMotionGraphic({ slug }) {
  if (slug === "video-publisher") {
    return <VideoPublishShowcaseGraphic variant="card" />;
  }
  if (slug === "ask-ai") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-chat">
          <div className="ls-fc-chat__row">
            <div className="ls-fc-chat__bubble ls-fc-chat__bubble--in" />
          </div>
          <div className="ls-fc-chat__row ls-fc-chat__row--out">
            <div className="ls-fc-chat__bubble ls-fc-chat__bubble--out">
              <span className="ls-fc-chat__dot" />
              <span className="ls-fc-chat__dot" />
              <span className="ls-fc-chat__dot" />
            </div>
          </div>
        </div>
      </figure>
    );
  }
  if (slug === "recipe-generator") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-kitchen">
          <div className="ls-fc-kitchen__steam" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="ls-fc-kitchen__pot">
            <div className="ls-fc-kitchen__rim" />
          </div>
        </div>
      </figure>
    );
  }
  if (slug === "docuwizard") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-doc">
          <div className="ls-fc-doc__lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="ls-fc-doc__scan" />
        </div>
      </figure>
    );
  }
  if (slug === "echoscribe") {
    const bars = [0.35, 0.55, 0.75, 0.45, 0.9, 0.5, 0.7, 0.4, 0.85, 0.6];
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-wave">
          {bars.map((h, i) => (
            <span
              key={i}
              className="ls-fc-wave__bar"
              style={{ height: `${Math.round(h * 100)}%`, animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      </figure>
    );
  }
  if (slug === "image-generator") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-vision">
          <div className="ls-fc-vision__canvas" />
          <div className="ls-fc-vision__shimmer" />
        </div>
      </figure>
    );
  }
  if (slug === "reply-enchanter") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-mail">
          <div className="ls-fc-mail__tile ls-fc-mail__tile--in" />
          <span className="ls-fc-mail__arrow" aria-hidden="true">
            →
          </span>
          <div className="ls-fc-mail__tile ls-fc-mail__tile--out" />
        </div>
      </figure>
    );
  }
  if (slug === "resume-warlock") {
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-cv">
          <span className="ls-fc-cv__line" />
          <span className="ls-fc-cv__line" />
          <span className="ls-fc-cv__line" />
          <span className="ls-fc-cv__line" />
        </div>
      </figure>
    );
  }
  if (slug === "creator-suite") {
    const heights = ["32%", "48%", "72%", "56%", "88%"];
    return (
      <figure className="ls-fc-motion" aria-hidden="true">
        <div className="ls-fc-grow">
          {heights.map((h, i) => (
            <span
              key={i}
              className="ls-fc-grow__bar"
              style={{ height: h, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </figure>
    );
  }
  return null;
}

function VideoPublishShowcaseGraphic({ variant = "hero" }) {
  const v = variant === "card" ? "card" : variant === "compact" ? "compact" : "hero";
  const imgSize = v === "hero" ? 40 : v === "compact" ? 34 : 32;
  return (
    <figure
      className={`ls-vp-showcase ls-vp-showcase--${v}`}
      aria-label="One video publishing to YouTube, TikTok, Facebook, and Instagram"
    >
      <div className="ls-vp-showcase__col ls-vp-showcase__col--src">
        <div className="ls-vp-showcase__screen">
          <div className="ls-vp-showcase__glow" aria-hidden="true" />
          <span className="ls-vp-showcase__play" aria-hidden="true">▶</span>
        </div>
        {v !== "card" && <span className="ls-vp-showcase__label">One upload</span>}
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

/**
 * Frames our existing hero graphics: dot field + dashed spokes from the upload hub to each
 * destination (same 8 platforms as HeroEightPlatformsMotion). Not a third-party layout clone.
 */
const HERO_ORCH_HUB = { x: 200, y: 76 };
/** viewBox 0 0 400 280 — line ends align roughly with `.ls-hero-platform-dance__orb` positions */
const HERO_ORCH_SPOKES = [
  [48, 172],
  [112, 200],
  [168, 152],
  [216, 192],
  [272, 156],
  [336, 178],
  [88, 224],
  [296, 214],
];

function HeroVisualOrchestration() {
  return (
    <div className="ls-hero-orch">
      <svg
        className="ls-hero-orch__svg"
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {HERO_ORCH_SPOKES.map(([x2, y2], i) => (
          <line
            key={i}
            x1={HERO_ORCH_HUB.x}
            y1={HERO_ORCH_HUB.y}
            x2={x2}
            y2={y2}
            className="ls-hero-orch__link"
            style={{ animationDelay: `${-i * 0.9}s` }}
          />
        ))}
      </svg>
      <div className="ls-hero-orch__content">
        <VideoPublishShowcaseGraphic variant="hero" />
        <HeroEightPlatformsMotion />
      </div>
    </div>
  );
}

/** Eight publish destinations — gentle float inside a small hero “stage” (Simple Icons CDN). */
function HeroEightPlatformsMotion() {
  const wobble = [
    "ls-hero-platform-dance__orb--a",
    "ls-hero-platform-dance__orb--b",
    "ls-hero-platform-dance__orb--c",
    "ls-hero-platform-dance__orb--d",
    "ls-hero-platform-dance__orb--b",
    "ls-hero-platform-dance__orb--a",
    "ls-hero-platform-dance__orb--d",
    "ls-hero-platform-dance__orb--c",
  ];
  return (
    <div
      className="ls-hero-platform-dance"
      role="img"
      aria-label="YouTube, Instagram, Facebook, TikTok, LinkedIn, X, Threads, and Pinterest"
    >
      {landingPublishPlatforms.map((p, i) => (
        <span
          key={p.id}
          className={`ls-hero-platform-dance__orb ${wobble[i] || wobble[0]}`}
          style={{ animationDelay: `${-i * 0.42}s` }}
        >
          <span className="ls-hero-platform-dance__tile">
            {p.id === "linkedin" ? (
              <LinkedInLogo size={22} color={p.color} />
            ) : (
              <img
                src={`${SI}/${p.logo}/${p.color.replace("#", "")}`}
                alt=""
                width={22}
                height={22}
                loading="lazy"
                decoding="async"
              />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Eight platform marks under the pricing note (“no install”) — same destinations, gentle drift. */
function HeroPlatformsUnderNote() {
  const wobble = [
    "ls-hero-under-note__item--a",
    "ls-hero-under-note__item--b",
    "ls-hero-under-note__item--c",
    "ls-hero-under-note__item--d",
    "ls-hero-under-note__item--b",
    "ls-hero-under-note__item--a",
    "ls-hero-under-note__item--d",
    "ls-hero-under-note__item--c",
  ];
  return (
    <div
      className="ls-hero-under-note"
      role="img"
      aria-label="YouTube, Instagram, Facebook, TikTok, LinkedIn, X, Threads, and Pinterest"
    >
      {landingPublishPlatforms.map((p, i) => (
        <span
          key={p.id}
          className={`ls-hero-under-note__item ${wobble[i] || wobble[0]}`}
          style={{ animationDelay: `${-i * 0.42}s` }}
        >
          <span className="ls-hero-under-note__tile">
            {p.id === "linkedin" ? (
              <LinkedInLogo size={18} color={p.color} />
            ) : (
              <img
                src={`${SI}/${p.logo}/${p.color.replace("#", "")}`}
                alt=""
                width={18}
                height={18}
                loading="lazy"
                decoding="async"
              />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

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
      "Turn text prompts into images for posts, ads, and channel art. For each video upload, Video Publisher also includes a thumbnail picker: scrub any frame or use AI-suggested stills before you publish.",
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
      "One upload — right format, framing, and captions per network. Thumbnail picker, AI frames, schedule or publish.",
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
    desc: "Input your text, upload a document, record audio, or describe what you need. W!ntAi accepts multiple input formats.",
  },
  {
    num: "3",
    title: "Get Instant AI Results",
    desc: "Receive accurate, high-quality output in seconds. Copy, download, or use the result directly in your workflow.",
  },
];


const landingGallery = [
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-079a4005-12cf-4525-a9ea-c9074eea79eb.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-c992bddf-ef70-47e2-b477-8f651555a515.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-97713f70-08dd-4f0b-acb5-2e86a6ee386b.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-b8738e01-43b6-43fa-b1fa-93c4b23e6e1c.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-d045ea09-07d3-4bed-8941-86f68842612f.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-d630803b-cde0-4e2a-84f3-de245cf6a469.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-7092ebb3-d280-416d-98b9-ff58925ffe37.png",
  "c__Users_wintk_AppData_Roaming_Cursor_User_workspaceStorage_69bc542c894986623db97e4396cf2017_images_image-0efb6809-0160-4e90-b47a-6c7def0d94e7.png",
];

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingSection({ onGetStarted, onChoosePlan, onOpenVideoPublisher }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="ls-root" aria-label="W!ntAi — social media video publishing and AI tools">

      {/* ── HERO (SEO: one H1 — video publishing + social managers) ── */}
      <section className="ls-hero ls-hero--showcase" aria-labelledby="hero-heading">
        <div className="ls-hero-inner ls-hero-inner--split">
          <div className="ls-hero-copy">
            <div className="ls-hero-copy__head">
              <div className="ls-hero-copy__block ls-hero-copy__block--badge">
                <div className="ls-hero-badge">
                  Multi-platform video publishing · Social media managers &amp; creators
                </div>
              </div>
              <div className="ls-hero-copy__block ls-hero-copy__block--kicker">
                <div className="ls-hero-kicker">The end of format errors</div>
              </div>
              <div className="ls-hero-copy__block ls-hero-copy__block--title">
                <div
                  id="hero-heading"
                  className="ls-hero-h1"
                  role="heading"
                  aria-level={1}
                >
                  <div className="ls-hero-h1-line">If You Can Record It,</div>
                  <div className="ls-hero-h1-line ls-hero-h1-accent">We Can Post It.</div>
                </div>
              </div>
              <div className="ls-hero-copy__block ls-hero-copy__block--tagline">
                <div className="ls-hero-tagline">
                  <strong>Upload Once. Optimize Everywhere.</strong> Let AI handle the formats while you focus on creating.
                </div>
              </div>
            </div>
            <div className="ls-hero-copy__body">
              <div className="ls-hero-copy__rail">
                <ul className="ls-hero-chips" aria-label="Product highlights">
                  <li>No manual re-edits per platform</li>
                  <li>Thumbnail picker + AI frames</li>
                  <li>Schedule &amp; direct publishing</li>
                  <li>Brand-aware Social AI (RAG)</li>
                </ul>
                <div className="ls-hero-actions">
                  <button type="button" className="ls-btn-primary" onClick={onGetStarted}>
                    Start Trial
                  </button>
                  <a className="ls-btn-ghost" href="/features">See all tools →</a>
                </div>
                <p className="ls-hero-note">
                  <strong>Try free:</strong> Ask AI &amp; Recipe Generator.{" "}
                  <strong>Starter</strong> $19/mo · <strong>Pro</strong> $39/mo (agency + workspaces) · <strong>Growth</strong> $79/mo (full team) — no per-channel fees, no install.
                </p>
                <HeroPlatformsUnderNote />
              </div>
              <div className="ls-hero-visual ls-hero-visual--nested">
                <HeroVisualOrchestration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS WINTAIBOT ───────────────────────────────── */}
      <section className="ls-section ls-what" aria-labelledby="what-heading">
        <div className="ls-what-header">
          <div className="ls-what-header__text">
            <h2 id="what-heading">One workspace.<br/>Not five subscriptions.</h2>
            <p className="ls-what-short">
              <strong>W!ntAi</strong> combines every tool a creator needs — video publishing, scheduling, inbox, analytics, AI writing, image generation, and more — in a single login.
            </p>
            <div className="ls-stat-row">
              <div className="ls-stat"><span className="ls-stat-num">8</span><span>AI Tools</span></div>
              <div className="ls-stat"><span className="ls-stat-num">Free</span><span>To Start</span></div>
              <div className="ls-stat"><span className="ls-stat-num">$19+</span><span>Paid plans / mo</span></div>
              <div className="ls-stat"><span className="ls-stat-num">0</span><span>Installs Required</span></div>
            </div>
          </div>

          {/* Tool cards grid — visually distinct from hero */}
          <div className="ls-tool-grid" aria-label="All tools in W!ntAi">
            {[
              { emoji: '🎬', name: 'Video Publisher',   desc: 'Upload once, post everywhere',      accent: '#6366f1' },
              { emoji: '📅', name: 'Content Calendar',  desc: 'Schedule & track posts',            accent: '#0ea5e9' },
              { emoji: '📊', name: 'Analytics',         desc: 'Growth & engagement data',          accent: '#10b981' },
              { emoji: '💬', name: 'Messages Inbox',    desc: 'DMs & comments in one place',       accent: '#f59e0b' },
              { emoji: '🤖', name: 'Auto Reply',        desc: 'AI-powered smart responses',        accent: '#8b5cf6' },
              { emoji: '🖼️', name: 'Image Generator',  desc: 'AI art for posts & thumbnails',     accent: '#ec4899' },
              { emoji: '🎤', name: 'EchoScribe',        desc: 'Audio & video transcription',       accent: '#14b8a6' },
              { emoji: '📄', name: 'DocuWizard',        desc: 'Summarize & analyze documents',     accent: '#f97316' },
            ].map(({ emoji, name, desc, accent }) => (
              <div key={name} className="ls-tool-card" style={{ '--tool-accent': accent }}>
                <span className="ls-tool-card__icon">{emoji}</span>
                <div>
                  <div className="ls-tool-card__name">{name}</div>
                  <div className="ls-tool-card__desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ONE PLACE: SCHEDULE + INBOX + AUTO-REPLY ─────────── */}
      <section className="ls-section ls-social-hub" aria-labelledby="social-hub-heading">
        <h2 id="social-hub-heading">Schedule posts, read messages, automate replies — one login</h2>
        <p className="ls-section-sub ls-social-hub-intro">
          Creators shouldn&apos;t live in three tabs just to post, read messages, and answer fans.
          In W!ntAi you <strong>schedule posts</strong> per platform, open <strong>Messages</strong> for DMs and comments,
          and configure <strong>Auto Reply</strong> with <strong>AI on or off</strong> — your rules, your tone, your choice to automate or stay hands-on.
          Pair that with <strong>Analytics</strong>, <strong>Trends</strong>, and <strong>Social AI</strong> to generate ideas and analyze what actually worked.
        </p>
        <p className="ls-social-hub-direct">
          <strong>Direct publishing — we don&apos;t run your day on notifications.</strong>{" "}
          Some apps feel like a full-time job of unlocking steps on your phone: wait for the buzz, tap through prompts, repeat.
          W!ntAi is built the other way: <strong>you choose platforms and timing; we publish straight through</strong> when your content is ready.
          The goal is clarity — fewer interruptions, less &ldquo;notification anxiety,&rdquo; more time creating — not a workflow designed to ping you all day.
        </p>
      </section>

      <section className="ls-section ls-gallery" aria-labelledby="gallery-heading">
        <h2 id="gallery-heading">Showcase</h2>
        <p className="ls-section-sub ls-section-sub--tight">
          Real screens — analytics, inbox, auto-reply, publish flow, calendar, and Social AI.
        </p>
        <div className="ls-gallery-slider" aria-label="Moving product screenshot slideshow">
          <div className="ls-gallery-track">
            {[...landingGallery, ...landingGallery].map((fileName, idx) => (
              <figure key={`${fileName}-${idx}`} className="ls-gallery-item">
                <img
                  src={`/landing-gallery/${fileName}`}
                  alt={`W!ntAi product screenshot ${(idx % landingGallery.length) + 1}`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="ls-section ls-seo-spotlight" aria-labelledby="seo-spotlight-heading">
        <h2 id="seo-spotlight-heading">AI Social Media Scheduler for Video, Captions, and Analytics</h2>
        <p className="ls-section-sub">
          W!ntAi is an <strong>AI social media management platform</strong> built for creators and growing teams that want to
          <strong> publish video to multiple platforms from one dashboard</strong>. Upload once, customize by network, schedule at the right
          time, and track what performs best.
        </p>
        <div className="ls-seo-grid">
          <article className="ls-seo-card">
            <h3>Multi-platform video publishing</h3>
            <p>
              Plan and publish content for YouTube, Instagram, Facebook, TikTok, LinkedIn, X, Threads, and Pinterest in one workflow.
              Reduce manual posting and keep your content calendar consistent.
            </p>
          </article>
          <article className="ls-seo-card">
            <h3>AI caption and hashtag assistant</h3>
            <p>
              Generate platform-ready caption drafts, quick rewrites, and hashtag suggestions. Keep your tone, edit fast, and publish
              with fewer copy bottlenecks.
            </p>
          </article>
          <article className="ls-seo-card">
            <h3>Content calendar with post insights</h3>
            <p>
              Use a visual calendar to review scheduled and published posts, open day-level details, and monitor engagement signals like
              impressions, comments, and posting cadence.
            </p>
          </article>
          <article className="ls-seo-card">
            <h3>Built-in AI workspace</h3>
            <p>
              Beyond scheduling, teams use Ask AI, DocuWizard, EchoScribe, image generation, and Social AI in the same account to speed up
              production from idea to publish.
            </p>
          </article>
        </div>
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
              W!ntAi uses <strong>video variants</strong>: for <strong>each platform you select</strong>, we work toward the right shape, framing, and quality — crop, pad, upscale in the pipeline when needed — so the feeling is &ldquo;I uploaded once; Instagram <em>and</em> TikTok are already covered.&rdquo;
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
              Plain AI only writes text. W!ntAi&apos;s <strong>Social AI</strong> is built on your indexed posts (RAG): ask what format drove engagement last month,
              mirror a winning pattern in the next caption, or brainstorm ideas grounded in <strong>your</strong> history — a personal assistant that actually knows your brand.
            </span>
          </li>
        </ul>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="ls-section" id="features" aria-labelledby="features-heading">
        <h2 id="features-heading">Product showcase</h2>
        <p className="ls-section-sub ls-section-sub--tight">
          Video, documents, voice, and AI tools — <strong>one subscription</strong>, fewer tabs.
        </p>
        <div className="ls-features-grid" role="list">
          {features.map((f) => (
            <Link
              key={f.title}
              to={`/tools/${f.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}
            >
              <article className="ls-feature-card ls-feature-card--linked" role="listitem">
                <FeatureCardMotionGraphic slug={f.slug} />
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
          <strong>Try free trial</strong> — Ask AI and Recipe Generator are available immediately after signup.{" "}
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
        <h2 id="usecases-heading">Who Uses W!ntAi?</h2>
        <div className="ls-usecase-grid">
          <div className="ls-usecase ls-usecase--featured">
            <h3>Social media managers &amp; video creators</h3>
            <p>
              <strong>If you can record it, we can post it:</strong> use <strong>Video Publisher</strong> to upload once, <strong>pick your platforms</strong>, and let W!ntAi <strong>adapt format for each network</strong> — then refine <strong>AI captions and hashtags</strong>, <strong>schedule</strong> or publish directly, and use <strong>Analytics</strong>, <strong>Trends</strong>, and <strong>Social AI</strong> for ideas. <strong>AI Image Generator</strong> and <strong>Ask AI</strong> help with thumbnails and scripts.
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
        <p className="ls-section-sub">Start free — upgrade when you're ready. Annual billing saves up to 21%.</p>

        {/* Free tier callout */}
        <div className="ls-pricing-free-bar">
          <span className="ls-pricing-free-badge">Free Forever</span>
          <span>Ask AI Chatbot &amp; Recipe Generator — no credit card, no account required</span>
        </div>

        <div className="ls-plans">

          {/* ── STARTER ── */}
          <div className="ls-plan">
            <div className="ls-plan-tier ls-plan-tier--starter">🚀 Starter</div>
            <div className="ls-plan-price-row">
              <div className="ls-plan-price">$19 <span>/ mo</span></div>
              <div className="ls-plan-save">Save 21%<br /><small>annually</small></div>
            </div>
            <p className="ls-plan-annual">$15/mo billed annually · $180/yr</p>
            <p className="ls-plan-tagline">Perfect for solo creators</p>
            <button type="button" className="ls-btn-outline ls-plan-cta" onClick={() => onChoosePlan ? onChoosePlan('STARTER') : onGetStarted()}>
              Start with Starter
            </button>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Publishing</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Connected Platforms</span><span className="ls-pf-val">3</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Videos / month</span><span className="ls-pf-val">100</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Images / month</span><span className="ls-pf-val">1,000</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Scheduled posts</span><span className="ls-pf-val">30 / mo</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">AI Tools</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>AI Idea Generator</span><span className="ls-pf-val ls-pf-val--dim">Basic</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎨 Brand Kit</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎣 Viral Hook Generator</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>DocuWizard &amp; Resume</span></div>
              <div className="ls-plan-feat ls-plan-feat--no"><span className="ls-pf-icon ls-pf-icon--no">✗</span><span>EchoScribe transcription</span></div>
              <div className="ls-plan-feat ls-plan-feat--no"><span className="ls-pf-icon ls-pf-icon--no">✗</span><span>Growth Planner</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Team</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Seats</span><span className="ls-pf-val">1 (solo)</span></div>
              <div className="ls-plan-feat ls-plan-feat--no"><span className="ls-pf-icon ls-pf-icon--no">✗</span><span>Organization &amp; Workspaces</span></div>
            </div>
          </div>

          {/* ── PRO ── */}
          <div className="ls-plan ls-plan--featured">
            <div className="ls-plan-popular">Most Popular</div>
            <div className="ls-plan-tier ls-plan-tier--pro">⚡ Pro</div>
            <div className="ls-plan-price-row">
              <div className="ls-plan-price">$39 <span>/ mo</span></div>
              <div className="ls-plan-save ls-plan-save--featured">Save 18%<br /><small>annually</small></div>
            </div>
            <p className="ls-plan-annual">$32/mo billed annually · $384/yr</p>
            <p className="ls-plan-tagline">For agencies &amp; serious creators</p>
            <button type="button" className="ls-btn-primary ls-plan-cta" onClick={() => onChoosePlan ? onChoosePlan('PRO') : onGetStarted()}>
              Start with Pro
            </button>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Publishing</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Connected Platforms</span><span className="ls-pf-val">5</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Videos / month</span><span className="ls-pf-val">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Images to post</span><span className="ls-pf-val">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Scheduled posts</span><span className="ls-pf-val">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>AI-generated images</span><span className="ls-pf-val">100 / mo</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">AI Tools</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>AI Idea Generator</span><span className="ls-pf-val">Full</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎨 Brand Kit</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎣 Viral Hook Generator</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>EchoScribe transcription</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Messages &amp; Auto Reply</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Deep Analytics &amp; Growth Planner</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Social AI Chat (RAG)</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Team &amp; Agency</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🏢 Organization management</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>📁 Multiple workspaces</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🔐 Per-member permissions</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Org members</span><span className="ls-pf-val">Up to 3</span></div>
            </div>
          </div>

          {/* ── GROWTH ── */}
          <div className="ls-plan ls-plan--growth">
            <div className="ls-plan-popular ls-plan-popular--growth">Best for Agencies</div>
            <div className="ls-plan-tier ls-plan-tier--growth">🔥 Growth</div>
            <div className="ls-plan-price-row">
              <div className="ls-plan-price">$79 <span>/ mo</span></div>
              <div className="ls-plan-save">Save 19%<br /><small>annually</small></div>
            </div>
            <p className="ls-plan-annual">$64/mo billed annually · $768/yr</p>
            <p className="ls-plan-tagline">Maximum power for teams</p>
            <button type="button" className="ls-btn-outline ls-btn-outline--growth ls-plan-cta" onClick={() => onChoosePlan ? onChoosePlan('GROWTH') : onGetStarted()}>
              Start with Growth
            </button>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Publishing</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Connected Platforms</span><span className="ls-pf-val">All 8</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>Videos / month</span><span className="ls-pf-val ls-pf-val--star">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>AI-generated images</span><span className="ls-pf-val ls-pf-val--star">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>Scheduled posts</span><span className="ls-pf-val ls-pf-val--star">Unlimited</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>Priority processing queue</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>Fastest upload &amp; AI speeds</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">AI Tools</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>AI Idea Generator</span><span className="ls-pf-val">Full</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎨 Brand Kit</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🎣 Viral Hook Generator</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Video Trimming Tool</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>EchoScribe transcription</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Messages &amp; Auto Reply</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Deep Analytics &amp; Growth Planner</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Social AI Chat (RAG)</span></div>
            </div>

            <div className="ls-plan-group">
              <div className="ls-plan-group-label">Team &amp; Agency</div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>🏢 Organization management</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>📁 Unlimited workspaces</span></div>
              <div className="ls-plan-feat ls-plan-feat--star"><span className="ls-pf-icon ls-pf-icon--star">★</span><span>🔐 Granular permissions</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Org members</span><span className="ls-pf-val">Up to 5</span></div>
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Members inherit your plan</span></div>
            </div>
          </div>

        </div>
      </section>


      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="ls-section ls-faq" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        {[
          {
            q: "Is W!ntAi really free to use?",
            a: "Yes. The Ask AI chatbot and Recipe Generator are completely free with no credit card required. Premium tools unlock on paid plans: Starter ($19/mo, solo), Pro ($39/mo, agency + workspaces), or Growth ($79/mo, full team + unlimited workspaces), with annual discounts.",
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
            a: "Files you upload are processed to generate your results and are not stored permanently. Payments go through Stripe only: W!ntAi does not store your bank account information or full card details on our servers — Stripe handles billing and payment data using their secure, PCI-compliant systems.",
          },
          {
            q: "What does Video Publisher do?",
            a: "Upload once, choose your platforms — W!ntAi adapts the video for each destination (format and framing) so you are not fixing files by hand. You get AI captions and hashtags per platform, can schedule each at a different time, and see trends to plan your next content.",
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
      <section className="ls-section ls-final-cta" aria-label="Get started with W!ntAi">
        <h2>Ready to post video everywhere — without format headaches?</h2>
        <p>
          Start with a <strong>free trial</strong>, then scale to <strong>Starter</strong> (solo), <strong>Pro</strong> (agency + workspaces), or <strong>Growth</strong> (unlimited team) for full <strong>video publishing</strong>, scheduling, and AI workflows.
          No credit card required to try.
        </p>
        <button className="ls-btn-primary ls-btn-lg" onClick={onGetStarted}>
          Try Free Trial →
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="ls-footer">
        <p>
          © {new Date().getFullYear()} W!ntAi · Built by{" "}
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">
            Wint Kay Thwe Aung
          </a>
          {" · "}
          <a href="mailto:contact@wintaibot.com">contact@wintaibot.com</a>
        </p>
        <nav className="ls-footer-nav" aria-label="Footer navigation">
          <a href="/features">Features</a>
          <a href="/pricing">Pricing</a>
          <span className="ls-footer-nav-group" role="group" aria-label="Legal">
            <span className="ls-footer-nav-label">Legal</span>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
          </span>
          <span className="ls-footer-nav-group" role="group" aria-label="Resources">
            <span className="ls-footer-nav-label">Resources</span>
            <a href="/tutorial">Tutorials</a>
            <a href="/blog">Blog</a>
            <a href="/changelog">Changelog</a>
          </span>
          <a href="/#about">About</a>
          <a href="/#faq">FAQ</a>
          <a href="https://github.com/wintkaythweaungRevature" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>

    </main>
  );
}
