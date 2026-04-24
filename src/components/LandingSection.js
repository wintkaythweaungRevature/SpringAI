import React, { useState } from "react";
import { Link } from "react-router-dom";
import PlatformIcon, { LinkedInLogo } from "./PlatformIcon";
import FallingPlatformsAnimation from "./FallingPlatformsAnimation";
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

// FallingPlatformsAnimation moved to ./FallingPlatformsAnimation.js so it can be
// reused from both the landing page and the Content Calendar.

/**
 * Radial-spokes background — same movement as wintai-ad-15s.html "Shot 4":
 *   • central video-file hub, two dashed orbit rings around it
 *   • the entire constellation rotates slowly and continuously
 *   • beams to each platform have a staggered draw-in pulse
 *   • platform circles + logos sit on the outer ring
 *
 * Pure SVG + CSS keyframes (no images, no canvas, no JS animation loop).
 * Positioned absolutely; parent must be position:relative.
 */
function RadialSpokesBackground() {
  const HUB = { x: 50, y: 50 }; // viewBox 100×100
  const R_OUTER = 38;            // platform ring radius
  const R_RING1 = 32;            // dashed orbit ring 1
  const R_RING2 = 24;            // dashed orbit ring 2

  const platforms = [
    { id: 'youtube',   color: '#FF0000', logo: 'youtube',   angleDeg:  -90 },
    { id: 'instagram', color: '#E1306C', logo: 'instagram', angleDeg:  -45 },
    { id: 'facebook',  color: '#1877F2', logo: 'facebook',  angleDeg:    0 },
    { id: 'linkedin',  color: '#0A66C2', logo: 'linkedin',  angleDeg:   45 },
    { id: 'tiktok',    color: '#010101', logo: 'tiktok',    angleDeg:   90 },
    { id: 'pinterest', color: '#E60023', logo: 'pinterest', angleDeg:  135 },
    { id: 'x',         color: '#000000', logo: 'x',         angleDeg:  180 },
    { id: 'threads',   color: '#101010', logo: 'threads',   angleDeg: -135 },
  ].map(p => {
    const rad = (p.angleDeg * Math.PI) / 180;
    return { ...p, x: HUB.x + Math.cos(rad) * R_OUTER, y: HUB.y + Math.sin(rad) * R_OUTER };
  });

  return (
    <div className="ls-radial-bg" aria-hidden="true">
      <style>{`
        .ls-radial-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0.22;
          overflow: hidden;
        }
        .ls-radial-bg__svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        /* The whole constellation rotates around the hub (slow, continuous) */
        .ls-radial-bg__rotor {
          transform-origin: 50px 50px;
          animation: ls-radial-spin 60s linear infinite;
        }
        @keyframes ls-radial-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Orbit rings */
        .ls-radial-bg__ring {
          fill: none;
          stroke: rgba(255,255,255,0.18);
          stroke-width: 0.18;
        }
        .ls-radial-bg__ring--inner { stroke-dasharray: 0.6 1.2; }
        .ls-radial-bg__ring--outer { stroke-dasharray: 1.2 2.0; }
        /* Beams: dashed line that travels out from hub, staggered per platform */
        .ls-radial-bg__beam {
          stroke-width: 0.6;
          stroke-linecap: round;
          fill: none;
          stroke-dasharray: 8 60;
          animation: ls-radial-beam 3s ease-in-out infinite;
        }
        @keyframes ls-radial-beam {
          0%   { stroke-dashoffset: 60;  opacity: 0;   }
          15%  { opacity: 0.9; }
          50%  { stroke-dashoffset: -10; opacity: 1;   }
          85%  { opacity: 0.4; }
          100% { stroke-dashoffset: -60; opacity: 0;   }
        }
        /* Hub (video file rectangle) */
        .ls-radial-bg__hub rect {
          fill: rgba(255,255,255,0.06);
          stroke: rgba(255,255,255,0.5);
          stroke-width: 0.3;
        }
        .ls-radial-bg__hub text {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          fill: rgba(255,255,255,0.7);
        }
        /* Platform nodes — counter-rotate so logos stay upright while constellation spins */
        .ls-radial-bg__node {
          animation: ls-radial-counter 60s linear infinite;
          transform-origin: center;
        }
        @keyframes ls-radial-counter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .ls-radial-bg__node-ring { fill: rgba(7,9,13,0.85); }
        @media (prefers-reduced-motion: reduce) {
          .ls-radial-bg__rotor, .ls-radial-bg__beam, .ls-radial-bg__node {
            animation: none;
          }
        }
      `}</style>
      <svg className="ls-radial-bg__svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Two dashed orbit rings (do not rotate — they're concentric) */}
        <circle cx={HUB.x} cy={HUB.y} r={R_RING1} className="ls-radial-bg__ring ls-radial-bg__ring--inner" />
        <circle cx={HUB.x} cy={HUB.y} r={R_RING2} className="ls-radial-bg__ring ls-radial-bg__ring--inner" />

        {/* Rotating constellation: beams + platforms */}
        <g className="ls-radial-bg__rotor">
          {platforms.map((p, i) => (
            <line
              key={`beam-${p.id}`}
              x1={HUB.x}
              y1={HUB.y}
              x2={p.x}
              y2={p.y}
              className="ls-radial-bg__beam"
              stroke={p.color}
              style={{ animationDelay: `${-i * 0.35}s` }}
            />
          ))}
          {platforms.map(p => (
            <g key={`node-${p.id}`} transform={`translate(${p.x} ${p.y})`}>
              {/* counter-rotate the inner contents so the logo stays upright */}
              <g className="ls-radial-bg__node">
                <circle r="3.8" className="ls-radial-bg__node-ring" stroke={p.color} strokeWidth="0.4" />
                <foreignObject x={-2.8} y={-2.8} width="5.6" height="5.6" style={{ overflow: 'visible' }}>
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                    <PlatformIcon platform={p} size={18} />
                  </div>
                </foreignObject>
              </g>
            </g>
          ))}
        </g>

        {/* Center hub intentionally removed — keep the spokes converging on an empty center */}
      </svg>
    </div>
  );
}

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
  // ── Free Tools ──
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
  // ── Publishing & Scheduling ──
  {
    icon: "🎬",
    title: "Video Publisher – One Video, Every Platform",
    description:
      "One upload — right format, framing, and AI captions per network. Thumbnail picker, schedule or publish instantly to YouTube, Instagram, TikTok, Facebook, LinkedIn, X, Threads & Pinterest.",
    badge: "Starter",
    slug: "video-publisher",
  },
  {
    icon: "📅",
    title: "Content Calendar – Visual Schedule",
    description:
      "See your entire month at a glance. Drag-and-drop scheduling, holiday markers, post status tracking (Published, Scheduled, Draft, Failed), and a feed grid view for published content.",
    badge: "Starter",
    slug: "content-calendar",
  },
  {
    icon: "🎨",
    title: "Design Templates – 84 Ready-Made Designs",
    description:
      "Professional social media designs with customizable themes. Preview, fill in your brand details, download as PNG/JPG/PDF, or send the caption straight to Video Publisher.",
    badge: "Starter",
    slug: "caption-templates",
  },
  // ── Analytics & Growth ──
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description:
      "Real-time follower counts, engagement rates, content performance, and month-by-month growth trends across all connected platforms in one unified view.",
    badge: "Starter",
    slug: "analytics",
  },
  {
    icon: "📈",
    title: "Growth Planner – Deep Analytics",
    description:
      "AI-powered best-time-to-post forecasts, engagement heatmaps by day and hour, platform comparison charts, YouTube competitor analysis, and a posts calendar with scheduling insights.",
    badge: "Pro",
    slug: "growth-planner",
  },
  // ── AI-Powered Creation ──
  {
    icon: "🖼️",
    title: "AI Image Generator",
    description:
      "Turn text prompts into stunning images for posts, ads, and thumbnails. Choose between creative (DALL-E 3) and photorealistic (Stability AI) styles.",
    badge: "Starter",
    slug: "image-generator",
  },
  {
    icon: "🧠",
    title: "AI Workspace – Your Content Team",
    description:
      "Three AI agents work for you daily: a Strategist suggests optimal post times, a Writer drafts on-brand captions, and an Analyst delivers weekly performance insights. Approve drafts and they go straight to Video Publisher.",
    badge: "Pro",
    slug: "ai-workspace",
  },
  {
    icon: "🔥",
    title: "Viral Hooks Generator",
    description:
      "Enter your topic and get scroll-stopping hooks for every platform. AI analyzes what makes content go viral and generates attention-grabbing openers tailored to your brand voice.",
    badge: "Starter",
    slug: "viral-hooks",
  },
  // ── Communication & Engagement ──
  {
    icon: "💬",
    title: "Unified Inbox – All Messages in One Place",
    description:
      "DMs, comments, and mentions from Instagram, Facebook, YouTube, TikTok, LinkedIn, and X — all in a single conversation view. Reply without switching apps.",
    badge: "Pro",
    slug: "messages",
  },
  {
    icon: "⚡",
    title: "Auto-Reply – 24/7 AI Engagement",
    description:
      "Set up AI-powered auto-replies for comments across all platforms. Custom prompt templates, keyword filters, daily limits, and test mode — your audience gets replies even while you sleep.",
    badge: "Pro",
    slug: "auto-reply",
  },
  // ── Content Optimization ──
  {
    icon: "🔗",
    title: "URL Repurposer – Article to Social Posts",
    description:
      "Paste any article URL and get platform-optimized social posts in seconds. AI extracts key points, generates captions with hashtags, and adapts tone per platform.",
    badge: "Pro",
    slug: "url-repurpose",
  },
  {
    icon: "♻️",
    title: "Video Recycler – Repurpose Long-Form Content",
    description:
      "Turn YouTube videos and long-form content into short-form clips for TikTok, Reels, and Shorts. Auto-transcription, subtitle overlays, and platform-specific formatting.",
    badge: "Pro",
    slug: "video-recycler",
  },
  {
    icon: "🔮",
    title: "Trend Hijacker – Ride Viral Waves",
    description:
      "Real-time trending topics across platforms with AI-suggested post ideas. Get ahead of trends before they peak — with viral score predictions and content angle suggestions.",
    badge: "Pro",
    slug: "trends-live",
  },
  {
    icon: "🩺",
    title: "Self-Healing Content",
    description:
      "AI monitors your published posts and suggests improvements: rewording, hashtag swaps, timing adjustments, and creative refreshes for underperforming content.",
    badge: "Pro",
    slug: "self-heal",
  },
  {
    icon: "🛡️",
    title: "Brand Guardian – Reputation Monitor",
    description:
      "Track brand mentions across Reddit, X, Instagram, LinkedIn, and news. Real-time sentiment analysis, crisis alerts, and AI-generated response templates to protect your reputation.",
    badge: "Pro",
    slug: "brand-guardian",
  },
  // ── Document & Productivity Tools ──
  {
    icon: "📄",
    title: "DocuWizard – PDF & Document AI",
    description:
      "Upload PDF, Excel, or Word files and extract structured data in seconds. Summarize reports, convert PDF tables to Excel, and ask questions about your documents.",
    badge: "Starter",
    slug: "docuwizard",
  },
  {
    icon: "🎤",
    title: "EchoScribe – Voice Transcription",
    description:
      "Convert audio recordings to accurate text with speaker identification, timestamps, and multi-language support. Then summarize, translate, or extract action items.",
    badge: "Pro",
    slug: "echoscribe",
  },
  {
    icon: "✉️",
    title: "Reply Enchanter – AI Email Writer",
    description:
      "Paste any email and get a polished AI-drafted reply instantly. Choose your tone — professional, friendly, casual, or urgent — and send with confidence.",
    badge: "Starter",
    slug: "reply-enchanter",
  },
  {
    icon: "📝",
    title: "Career Alchemist – Interview Prep AI",
    description:
      "Upload your resume and receive AI-generated interview questions tailored to your experience. Practice answers, identify weak areas, and ace your next interview.",
    badge: "Starter",
    slug: "resume-warlock",
  },
  // ── Asset & Team Management ──
  {
    icon: "📁",
    title: "Asset Library – Organized Media Hub",
    description:
      "Upload, organize, and reuse media across all your posts. Folder-based organization, batch upload, and performance analytics per asset.",
    badge: "Pro",
    slug: "asset-library",
  },
  {
    icon: "🔗",
    title: "Link in Bio – Your Landing Page",
    description:
      "A customizable landing page with unlimited links, click tracking, theme colors, and analytics. Share one link that showcases everything — no coding required.",
    badge: "Starter",
    slug: "link-in-bio",
  },
  {
    icon: "👥",
    title: "Workspaces & Teams",
    description:
      "Create isolated workspaces for different clients or projects. Invite team members with role-based permissions (Owner, Admin, Member, Client), manage who can publish, and keep content separate.",
    badge: "Pro",
    slug: "workspaces",
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

/* ─── Feature Showcase (tabbed by use case) ──────────────────── */

const FEATURE_TABS = [
  {
    id: 'creators',
    label: '🎬 For Creators',
    hero: {
      icon: '🎬', name: 'Publish Everywhere — In Your Brand Voice',
      desc: 'Upload one video and publish to YouTube, Instagram Reels, TikTok, Facebook, LinkedIn, X, Threads & Pinterest. AI generates captions, hashtags, and content ideas that match YOUR brand voice, tone, and key phrases — not generic filler. Every piece of content sounds like you wrote it.',
      accent: '#6366f1',
    },
    items: [
      { icon: '📅', name: 'Content Calendar',    desc: 'Drag-and-drop scheduling with month view', accent: '#0ea5e9',
        preview: '/features/content-calendar.png',
        long: 'A bird’s-eye view of every post across every channel. Drag a post to reschedule, click to preview, and filter by platform with one tap.',
        bullets: ['Month + feed grid views', 'Drag & drop reschedule', 'Per-platform colored chips', 'Holiday & awareness-day markers'] },
      { icon: '🧠', name: 'AI Workspace',         desc: 'Writer, Strategist & Analyst draft in your brand voice daily', accent: '#7c3aed',
        long: 'Three AI agents run every morning. Strategist picks the topic, Writer drafts the caption in your tone, Analyst reports what worked yesterday.',
        bullets: ['Daily brand-voice drafts', 'One-click approve → publish', 'Performance reports every AM', 'Learns from your feedback'] },
      { icon: '🔥', name: 'Viral Hooks',          desc: 'On-brand scroll-stopping openers', accent: '#ef4444',
        long: 'Never start a post with “Hey guys” again. Get 10 hook options tuned to your niche, voice, and platform — in seconds.',
        bullets: ['10 hooks per generation', 'Tuned to your niche', 'Platform-specific formats', 'Saves to your library'] },
      { icon: '🎨', name: 'Design Templates',     desc: '84 designs with your brand colors & style', accent: '#ec4899',
        long: '84 ready-to-edit templates that auto-apply your brand palette, fonts, and logo. Built for Reels, carousels, stories, and thumbnails.',
        bullets: ['84 hand-picked designs', 'Auto brand colors & fonts', 'Export for every platform', 'Unlimited edits'] },
      { icon: '🖼️', name: 'Image Generator',     desc: 'AI art that matches your visual identity', accent: '#f59e0b',
        long: 'Describe what you need; get imagery that respects your brand palette and mood. No more off-brand stock photos.',
        bullets: ['Brand-palette aware', 'HD downloads', 'Consistent style across posts', 'Unlimited on paid plans'] },
      { icon: '♻️', name: 'Video Recycler',       desc: 'Repurpose in your voice for Reels/Shorts', accent: '#14b8a6',
        long: 'Feed it a long video; get a pack of short-form cuts with captions rewritten in your voice — ready for Reels, TikTok, and Shorts.',
        bullets: ['Auto-cut highlights', 'Captions in your voice', 'Aspect-ratio resize', 'One-click publish'] },
      { icon: '🔗', name: 'URL Repurposer',       desc: 'Articles → on-brand social posts', accent: '#6366f1',
        long: 'Paste any blog URL. Out comes a set of social posts — LinkedIn long-form, X thread, Facebook share, Instagram carousel — all in your tone.',
        bullets: ['Blog → 4 post formats', 'Tone-matched to your brand', 'Auto-schedule all at once', 'Works on any public URL'] },
    ],
  },
  {
    id: 'business',
    label: '💼 For Business',
    hero: {
      icon: '💬', name: 'Engage Your Audience — In Your Brand Voice',
      desc: 'Every DM, comment, and mention from all your social platforms in one inbox. AI auto-replies use your brand personality, tone, and key phrases — so every response sounds authentically you, even at 3 AM. Your audience feels heard; you stay focused on growth.',
      accent: '#f59e0b',
    },
    items: [
      { icon: '📊', name: 'Analytics Dashboard',  desc: 'Track what resonates with your audience', accent: '#3b82f6',
        long: 'See impressions, clicks, follows, and engagement rolled up per workspace — with AI commentary explaining *why* a post took off.',
        bullets: ['Per-workspace roll-ups', 'AI "why it worked" summary', 'Top 10 posts leaderboard', 'Export CSV / PDF'] },
      { icon: '📈', name: 'Growth Planner',        desc: 'Best-time forecasts tuned to your niche', accent: '#10b981',
        long: 'Ask it when to post. It answers based on YOUR followers’ active hours and past engagement — not generic "Tuesday 10am" advice.',
        bullets: ['Per-platform best times', 'Weekly growth forecast', 'Follower chart by workspace', 'Auto-fill scheduler'] },
      { icon: '🛡️', name: 'Brand Guardian',       desc: 'Protect your brand reputation in real-time', accent: '#ef4444',
        long: 'Track up to 10 keywords across Reddit and X. Sentiment-tagged mentions stream in live — respond before a complaint turns into a crisis.',
        bullets: ['Reddit + X live scan', 'Positive / neutral / negative tags', 'AI draft-response button', 'No history bloat (live only)'] },
      { icon: '🔮', name: 'Trend Hijacker',        desc: 'Jump on trends with on-brand content ideas', accent: '#a855f7',
        long: 'Surfaces trending topics in your industry and drafts post ideas that tie the trend to your brand — so you ride waves without sounding off-brand.',
        bullets: ['Daily trending topics', 'Brand-aware post ideas', 'One-click to AI Workspace', 'Filter by platform'] },
      { icon: '🩺', name: 'Self-Healing Content',  desc: 'AI rewrites underperformers in your voice', accent: '#f97316',
        long: 'Old posts flatlining? Self-Healing finds them, rewrites captions in your current voice, and reschedules for your best time slot.',
        bullets: ['Auto-detects low performers', 'Rewrite in current voice', 'Auto-reschedule', 'A/B-tracks the rewrite'] },
      { icon: '👥', name: 'Workspaces & Teams',    desc: 'Each client gets their own brand environment', accent: '#6366f1',
        long: 'Agency-ready. Every workspace has its own brand voice, assets, posts, analytics, and team permissions — fully isolated from the others.',
        bullets: ['Unlimited workspaces (paid)', 'Per-workspace brand voice', 'Granular team permissions', 'Strict data isolation'] },
      { icon: '🔗', name: 'Link in Bio',           desc: 'Branded landing page with your colors', accent: '#ec4899',
        long: 'A single URL for your bio that carries your brand colors, logo, and every link you care about. Click-tracked, mobile-first.',
        bullets: ['Auto-branded theme', 'Unlimited links', 'Click analytics', 'Custom slug'] },
    ],
  },
  {
    id: 'productivity',
    label: '⚡ Productivity',
    hero: {
      icon: '📄', name: 'AI That Knows Your Context',
      desc: 'Upload documents, transcribe meetings, or ask anything — and the AI responds with your brand context in mind. DocuWizard summarizes with your terminology, EchoScribe transcribes with your team names, and Ask AI brainstorms ideas aligned with your brand direction.',
      accent: '#14b8a6',
    },
    items: [
      { icon: '🤖', name: 'Ask AI',               desc: 'Brand-aware brainstorming & answers 24/7', accent: '#14b8a6',
        long: 'A chat that already knows your brand voice, audience, and goals — so the first answer is usable, not a generic template.',
        bullets: ['Loaded with your brand DNA', 'Unlimited chats (paid)', 'File & URL context', 'Export answers to posts'] },
      { icon: '✉️', name: 'Reply Enchanter',      desc: 'Email replies that match your professional voice', accent: '#0ea5e9',
        long: 'Paste a tough email. Get three reply drafts — friendly, firm, and formal — all in your professional tone. Pick, tweak, send.',
        bullets: ['3 tone variants every draft', 'Matches your written style', 'Pastes back in one click', 'Saves your common phrases'] },
      { icon: '📝', name: 'Career Alchemist',      desc: 'Interview prep tailored to your experience', accent: '#8b5cf6',
        long: 'Upload your resume and the JD. Get likely interview questions plus answers that use your actual experience — not generic STAR templates.',
        bullets: ['JD + resume aware', '20+ mock questions', 'Personalized STAR answers', 'Practice mode with timer'] },
      { icon: '🍳', name: 'Recipe Generator',      desc: 'Ingredients in → recipes out (free forever)', accent: '#f59e0b',
        long: 'Type what’s in your fridge. Get a recipe back. Free forever. Because sometimes you just need dinner and a smile.',
        bullets: ['Free on every plan', 'Uses what you already have', 'Dietary filters', 'One-click save'] },
      { icon: '📁', name: 'Asset Library',         desc: 'Your media organized with brand tags', accent: '#64748b',
        long: 'Every image, video, and clip you’ve uploaded — auto-tagged with brand categories so you can find the exact asset in seconds.',
        bullets: ['Auto brand-tagging', 'Search by mood / color', 'One-click re-use in posts', 'Cloud sync'] },
    ],
  },
];

function FeatureShowcase({ features, onOpenVideoPublisher }) {
  const [activeTab, setActiveTab] = useState('creators');
  // Hover popup state: { item, x, y, flipBelow }
  const [hover, setHover] = useState(null);
  const tab = FEATURE_TABS.find(t => t.id === activeTab) || FEATURE_TABS[0];

  // Compute popup position relative to the hovered card. Flips below the card
  // if there isn't enough space above.
  const openHover = (item, el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const flipBelow = rect.top < 260; // not enough room above — show under instead
    setHover({
      item,
      x: rect.left + rect.width / 2,
      y: flipBelow ? rect.bottom + 10 : rect.top - 10,
      flipBelow,
    });
  };
  const closeHover = () => setHover(null);

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      style={{
        padding: '80px 24px',
        // Transparent so the page's radial-blob gradient shows through; no more bright white gap
        background: 'transparent',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Ambient radial-spokes animation behind the features content */}
      <RadialSpokesBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <h2 id="features-heading" style={{ textAlign: 'center', fontSize: '2.25rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-0.02em' }}>
        Everything you need. One platform.
      </h2>
      <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 16, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.6 }}>
        Choose your path — whether you create content, grow a brand, or boost productivity.
      </p>

      {/* Tabs — frosted pill style */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
        {FEATURE_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '11px 24px', borderRadius: 12, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
              background: activeTab === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
              backdropFilter: activeTab === t.id ? 'blur(14px) saturate(160%)' : 'none',
              WebkitBackdropFilter: activeTab === t.id ? 'blur(14px) saturate(160%)' : 'none',
              color: activeTab === t.id ? '#f1f5f9' : '#94a3b8',
              border: activeTab === t.id ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              boxShadow: activeTab === t.id ? 'inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 24px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hero feature — large frosted-glass card */}
      <div style={{
        maxWidth: 880, margin: '0 auto 28px', padding: '32px 36px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))',
        backdropFilter: 'saturate(180%) blur(22px)',
        WebkitBackdropFilter: 'saturate(180%) blur(22px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderLeft: `4px solid ${tab.hero.accent}`, borderRadius: 18,
        boxShadow: '0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: '2.4rem' }}>{tab.hero.icon}</span>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.01em' }}>{tab.hero.name}</h3>
        </div>
        <p style={{ fontSize: 15.5, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{tab.hero.desc}</p>
        {onOpenVideoPublisher && tab.id === 'creators' && (
          <button type="button" onClick={onOpenVideoPublisher}
            style={{ marginTop: 18, padding: '11px 26px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(236,72,153,0.35)' }}>
            Try Video Publisher →
          </button>
        )}
      </div>

      {/* Secondary features — light card grid */}
      <div style={{
        maxWidth: 880, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14,
      }}>
        {tab.items.map(item => (
          <div key={item.name} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 18px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
            backdropFilter: 'saturate(180%) blur(18px)',
            WebkitBackdropFilter: 'saturate(180%) blur(18px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 12,
            boxShadow: '0 12px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
            cursor: 'pointer',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 16px 40px ${item.accent || '#6366f1'}44, inset 0 1px 0 rgba(255,255,255,0.16)`;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = `${item.accent || '#6366f1'}88`;
              openHover(item, e.currentTarget);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
              closeHover();
            }}
          >
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, marginTop: 3 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Hover popup — rich preview card matching landing page style */}
      {hover?.item && (() => {
        const a = hover.item.accent || '#6366f1';
        return (
        <div
          role="tooltip"
          onMouseEnter={() => setHover(hover)}
          onMouseLeave={closeHover}
          style={{
            position: 'fixed',
            left: hover.x,
            top: hover.y,
            transform: hover.flipBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            width: 340,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: `0 24px 60px ${a}33, 0 8px 24px rgba(15,23,42,0.12)`,
            overflow: 'hidden',
            zIndex: 2000,
            animation: 'wintFeaturePopIn 0.18s ease-out',
            pointerEvents: 'auto',
          }}
        >
          {/* Visual preview banner — real screenshot if provided, else colored gradient + emoji */}
          {hover.item.preview ? (
            <div style={{
              position: 'relative',
              height: 180,
              background: `linear-gradient(135deg, ${a}18, ${a}08)`,
              overflow: 'hidden',
              borderBottom: `1px solid ${a}22`,
            }}>
              <img
                src={hover.item.preview}
                alt={`${hover.item.name} preview`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  display: 'block',
                }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* Feature-name badge bottom-left */}
              <div style={{
                position: 'absolute',
                bottom: 10, left: 12,
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 20,
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: a,
                boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
              }}>
                {hover.item.icon} {hover.item.name}
              </div>
            </div>
          ) : (
            <div style={{
              position: 'relative',
              height: 110,
              background: `linear-gradient(135deg, ${a}, ${a}cc 60%, ${a}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Subtle dot grid pattern */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
                opacity: 0.6,
              }} />
              {/* Soft glow behind emoji */}
              <div style={{
                position: 'absolute',
                width: 180, height: 180,
                background: 'radial-gradient(closest-side, rgba(255,255,255,0.35), transparent)',
                borderRadius: '50%',
                filter: 'blur(2px)',
              }} />
              {/* Big emoji */}
              <span style={{
                position: 'relative',
                fontSize: '3.6rem',
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))',
              }}>{hover.item.icon}</span>
              {/* Feature-name badge bottom-left */}
              <div style={{
                position: 'absolute',
                bottom: 10, left: 12,
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 20,
                fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: a,
              }}>
                {hover.item.name}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ padding: '16px 20px 18px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: 8 }}>
              {hover.item.name}
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 12px' }}>
              {hover.item.long || hover.item.desc}
            </p>
            {hover.item.bullets && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {hover.item.bullets.map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#334155' }}>
                    <span style={{ color: a, fontWeight: 800, flexShrink: 0 }}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        );
      })()}
      <style>{`
        @keyframes wintFeaturePopIn {
          from { opacity: 0; transform: translate(-50%, -100%) translateY(6px); }
          to   { opacity: 1; transform: translate(-50%, -100%) translateY(0); }
        }
      `}</style>

      {/* All plans include */}
      <div style={{
        maxWidth: 880, margin: '40px auto 0', padding: '22px 28px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 14,
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          All plans include
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', justifyContent: 'center' }}>
          {['Your Brand Voice in Every AI Output', '8 Social Platforms', 'AI Captions & Hashtags', 'Brand Profile & Key Phrases', 'Content Calendar', 'Link in Bio', 'Ask AI Chatbot', 'No Per-Channel Fees'].map(item => (
            <span key={item} style={{ fontSize: 13, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: 14 }}>✓</span> {item}
            </span>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

/* ─── Component ─────────────────────────────────────────────── */

export default function LandingSection({ onGetStarted, onChoosePlan, onOpenVideoPublisher }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="ls-root" aria-label="W!ntAi — social media video publishing and AI tools">

      {/* ── HERO (SEO: one H1 — video publishing + social managers) ── */}
      <section className="ls-hero ls-hero--showcase" aria-labelledby="hero-heading" style={{ position: 'relative' }}>
        {/* Ambient falling-platforms animation behind the hero copy */}
        <FallingPlatformsAnimation mode="background" />
        <div className="ls-hero-inner ls-hero-inner--split" style={{ position: 'relative', zIndex: 1 }}>
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
                  <div className="ls-hero-h1-line ls-hero-h1-line--wide">
                    If You Can Record It, <span className="ls-hero-h1-accent">We Can Post It.</span>
                  </div>
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

      {/* ── SHOWCASE ──────────────────────────────────────────── */}
      <section className="ls-section ls-gallery" aria-labelledby="gallery-heading">
        <RadialSpokesBackground />
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

      {/* ── WHAT IS WINTAIBOT ───────────────────────────────── */}
      <section id="use-cases" className="ls-section ls-what" aria-labelledby="what-heading">
        <RadialSpokesBackground />
        <div className="ls-what-header">
          {/* LEFT column — 5 killer feature cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {[
              { emoji: '🎬', name: 'Video Publisher',  desc: 'Upload once — auto-format & publish to YouTube, Instagram, TikTok, Facebook, LinkedIn, X, Threads & Pinterest in one click.', accent: '#6366f1' },
              { emoji: '📅', name: 'Content Calendar', desc: 'Drag-and-drop scheduling, month view, post status tracking, holiday markers — see your entire content plan at a glance.', accent: '#0ea5e9' },
              { emoji: '🧠', name: 'AI Workspace',     desc: 'Three AI agents draft captions, suggest post times, and analyze performance daily — approve and it goes straight to publish.', accent: '#7c3aed' },
              { emoji: '📊', name: 'Analytics & Growth Planner', desc: 'Real-time follower counts, engagement heatmaps, best-time-to-post forecasts, and platform comparison — all in one dashboard.', accent: '#10b981' },
              { emoji: '💬', name: 'Inbox & Auto-Reply', desc: 'Every DM, comment, and mention from all platforms in a single inbox. Set up AI auto-replies with your brand voice — engage 24/7.', accent: '#f59e0b' },
            ].map(({ emoji, name, desc, accent }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: `3px solid ${accent}`, borderRadius: 12,
              }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{emoji}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT column — headline + description + "17+ more" */}
          <div className="ls-what-header__text">
            <h2 id="what-heading">One workspace.<br/>Not five subscriptions.</h2>
            <p className="ls-what-short">
              <strong>W!ntAi</strong> combines every tool a creator needs — video publishing, scheduling, inbox, analytics, AI writing, image generation, and more — in a single login.
            </p>

            {/* "17+ more tools" placed directly under the copy */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8,
              padding: '18px 0 4px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 22,
            }}>
              <div style={{ width: '100%', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                  And 17+ more tools included
                </span>
              </div>
              {[
                '🔥 Viral Hooks', '🎨 Design Templates', '🖼️ Image Generator', '🔮 Trend Hijacker',
                '🛡️ Brand Guardian', '♻️ Video Recycler', '🔗 URL Repurposer', '🩺 Self-Healing',
                '📁 Asset Library', '🔗 Link in Bio', '👥 Workspaces & Teams',
                '🎤 EchoScribe', '📄 DocuWizard', '✉️ Reply Enchanter', '📝 Career Alchemist',
                '🤖 Ask AI', '🍳 Recipe Generator',
              ].map(tool => (
                <span key={tool} style={{
                  fontSize: 11, fontWeight: 600, color: '#94a3b8',
                  padding: '5px 12px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {tool}
                </span>
              ))}
            </div>

            <div className="ls-stat-row" style={{ marginTop: 24, justifyContent: 'flex-start' }}>
              <div className="ls-stat"><span className="ls-stat-num">22</span><span>AI Tools</span></div>
              <div className="ls-stat"><span className="ls-stat-num">Free</span><span>To Start</span></div>
              <div className="ls-stat"><span className="ls-stat-num">$19+</span><span>Paid plans / mo</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ONE PLACE: SCHEDULE + INBOX + AUTO-REPLY ─────────── */}
      <section id="how-it-works" className="ls-section ls-social-hub" aria-labelledby="social-hub-heading">
        <RadialSpokesBackground />
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

      <section className="ls-section ls-seo-spotlight" aria-labelledby="seo-spotlight-heading">
        <RadialSpokesBackground />
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
        <RadialSpokesBackground />
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

      {/* ── FEATURES — tabbed by use case ────────────────────── */}
      <FeatureShowcase features={features} onOpenVideoPublisher={onOpenVideoPublisher} />

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section className="ls-section ls-pricing" id="pricing" aria-labelledby="pricing-heading">
        <RadialSpokesBackground />
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
              <div className="ls-plan-feat ls-plan-feat--yes"><span className="ls-pf-icon">✓</span><span>Connected accounts</span><span className="ls-pf-val">Unlimited</span></div>
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
        <RadialSpokesBackground />
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
        <RadialSpokesBackground />
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
          © {new Date().getFullYear()} W!ntAi · Built by Wint Kay Thwe Aung
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
        </nav>
      </footer>

    </main>
  );
}
