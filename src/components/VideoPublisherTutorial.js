import React, { useState } from 'react';
import { LinkedInLogo } from './PlatformIcon';

const SI = 'https://cdn.simpleicons.org';
const logo = (name, color) => `${SI}/${name}/${color.replace('#', '')}`;
const LOGOS = {
  youtube:   { src: logo('youtube',   '#FF0000'), color: '#FF0000' },
  instagram: { src: logo('instagram', '#E1306C'), color: '#E1306C' },
  tiktok:    { src: logo('tiktok',    '#000000'), color: '#000000' },
  facebook:  { src: logo('facebook',  '#1877F2'), color: '#1877F2' },
};

/** Platform logo — LinkedIn uses inline SVG (CDN unreliable); others use Simple Icons CDN. */
const PlatLogo = ({ id, size = 16 }) => {
  if (id === 'linkedin') return <LinkedInLogo size={size} color="#0A66C2" />;
  const entry = LOGOS[id];
  if (!entry) return null;
  return <img src={entry.src} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
};

/* ───────────────────────────────────────────────────────────
   Video Publisher Tutorial — step-by-step walkthrough
   with inline UI illustrations built in JSX
   ─────────────────────────────────────────────────────────── */

const STEPS = [
  {
    id: 'choose',
    number: 1,
    title: 'Choose Your Content Type',
    desc: 'Select whether you want to publish a Video, Image, or Text-only post. Each type has its own upload experience and platform rules.',
    tip: 'Videos support MP4, MOV, AVI, WebM (max 2 GB). Images support JPG, PNG, GIF, WebP (max 20 MB).',
  },
  {
    id: 'upload',
    number: 2,
    title: 'Upload Your File',
    desc: 'Drag-and-drop your file into the upload zone, or click to browse. You\'ll see a preview with file size and duration (for videos). Growth plan users can also trim videos here.',
    tip: 'For Instagram Reels, keep videos under 90 seconds. For YouTube Shorts, keep them under 60 seconds.',
  },
  {
    id: 'platforms',
    number: 3,
    title: 'Select Platforms',
    desc: 'Pick which social media platforms you want to publish to. You can choose multiple platforms and each one will get its own optimized caption.',
    tip: 'Connect your accounts first in "Connected Accounts" so publishing works seamlessly.',
  },
  {
    id: 'generate',
    number: 4,
    title: 'AI Generates Captions',
    desc: 'Click "Generate Content" and our AI will transcribe your video audio, then generate platform-optimized captions and hashtags automatically.',
    tip: 'You can skip AI generation and write your own captions if you prefer.',
  },
  {
    id: 'review',
    number: 5,
    title: 'Review & Edit Captions',
    desc: 'Review AI-generated captions for each platform. Edit them freely, use quick rewrites (Shorten, Expand, Punchier, Add CTA), and check the caption quality score.',
    tip: 'Use the "🔮 Viral Score" button to get AI-powered prediction of how viral your post could be!',
  },
  {
    id: 'schedule',
    number: 6,
    title: 'Schedule or Publish Now',
    desc: 'Set a specific date and time for each platform, or publish immediately. Use quick presets like "Morning 9 AM" or "Evening 7 PM" for fast scheduling.',
    tip: 'Check "Best Time to Post" in the Growth Planner to find your audience\'s peak hours.',
  },
  {
    id: 'publish',
    number: 7,
    title: 'Publish & Track',
    desc: 'Hit "Schedule & Publish" and watch real-time status updates for each platform. Once done, view your analytics dashboard to track performance.',
    tip: 'If any platform fails, you can retry just the failed ones without re-publishing everything.',
  },
];

/* ── Mini UI Illustrations ─────────────────────────────────── */

function StepChooseIllustration() {
  const types = [
    { icon: '🎬', label: 'Video', active: true },
    { icon: '🖼️', label: 'Image', active: false },
    { icon: '✍️', label: 'Text', active: false },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>📲 Video Publisher</span>
      </div>
      <div style={{ padding: '16px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>CONTENT TYPE</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {types.map(t => (
            <div key={t.label} style={{
              flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 10,
              background: t.active ? '#6366f1' : '#f1f5f9',
              color: t.active ? '#fff' : '#64748b',
              fontWeight: 700, fontSize: 11, cursor: 'pointer',
              boxShadow: t.active ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
          Choose <strong>Reels/Feed</strong> or <strong>Story</strong> for Instagram
        </div>
      </div>
    </div>
  );
}

function StepUploadIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>📲 Video Publisher</span>
      </div>
      <div style={{ padding: '16px 12px' }}>
        <div style={{
          border: '2px dashed #c7d2fe', borderRadius: 12, padding: '24px 12px',
          textAlign: 'center', background: '#f5f3ff',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>Drop your video here</div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>or click to browse</div>
          <div style={{ fontSize: 9, color: '#cbd5e1', marginTop: 8 }}>MP4, MOV, AVI, WebM • Max 2 GB</div>
        </div>
        <div style={{
          marginTop: 12, background: '#f0fdf4', borderRadius: 8, padding: '8px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🎬</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>my-video.mp4</div>
            <div style={{ fontSize: 9, color: '#86efac' }}>24.5 MB • 0:45</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>✅</span>
        </div>
      </div>
    </div>
  );
}

function StepPlatformsIllustration() {
  const platforms = [
    { id: 'youtube',   label: 'YouTube',   checked: true },
    { id: 'instagram', label: 'Instagram', checked: true },
    { id: 'linkedin',  label: 'LinkedIn',  checked: true },
    { id: 'tiktok',    label: 'TikTok',    checked: false },
    { id: 'facebook',  label: 'Facebook',  checked: false },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Select Platforms</span>
      </div>
      <div style={{ padding: '12px' }}>
        {platforms.map(p => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            borderRadius: 8, marginBottom: 4,
            background: p.checked ? '#f0fdf4' : '#fff',
            border: p.checked ? '1.5px solid #bbf7d0' : '1.5px solid #f1f5f9',
          }}>
            <PlatLogo id={p.id} size={18} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155', flex: 1 }}>{p.label}</span>
            <div style={{
              width: 18, height: 18, borderRadius: 4,
              background: p.checked ? '#22c55e' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: '#fff', fontWeight: 700,
            }}>
              {p.checked ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepGenerateIllustration() {
  const steps = [
    { label: 'Uploading video...', done: true },
    { label: 'Transcribing audio...', done: true },
    { label: 'Generating captions...', done: true },
    { label: 'Creating hashtags...', active: true },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>⚙️ Processing</span>
      </div>
      <div style={{ padding: '16px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 12 }}>AI is generating captions...</div>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 8px', fontSize: 10, color: s.done ? '#22c55e' : s.active ? '#6366f1' : '#94a3b8',
            fontWeight: s.active ? 700 : 400,
          }}>
            <span>{s.done ? '✅' : s.active ? '🔄' : '⏳'}</span>
            <span>{s.label}</span>
          </div>
        ))}
        <div style={{
          marginTop: 12, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 6 }}>3 of 4 steps complete</div>
      </div>
    </div>
  );
}

function StepReviewIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Review & Edit</span>
      </div>
      <div style={{ padding: '10px 12px' }}>
        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[{ id: 'youtube', label: 'YT' }, { id: 'instagram', label: 'IG' }, { id: 'linkedin', label: 'LI' }].map((p, i) => (
            <div key={p.id} style={{
              flex: 1, textAlign: 'center', padding: '5px 4px', borderRadius: 6,
              background: i === 0 ? '#6366f1' : '#f1f5f9',
              color: i === 0 ? '#fff' : '#64748b',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            }}><PlatLogo id={p.id} size={12} /> {p.label}</div>
          ))}
        </div>
        {/* Caption */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Caption</div>
        <div style={{
          background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8,
          padding: '8px', fontSize: 9, color: '#475569', lineHeight: 1.5, minHeight: 40,
        }}>
          🔥 5 tips to boost your productivity today! Stop wasting time and start...
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 8, color: '#22c55e', fontWeight: 700 }}>✓ Strong</span>
          <span style={{ fontSize: 8, color: '#94a3b8' }}>87 / 2200</span>
        </div>
        {/* Viral Score button */}
        <div style={{
          marginTop: 8, padding: '6px 10px', borderRadius: 6,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: '#fff', fontSize: 9, fontWeight: 700, textAlign: 'center',
        }}>
          🔮 Viral Score
        </div>
        {/* Score result */}
        <div style={{
          marginTop: 6, background: '#f0fdf4', borderRadius: 8, padding: '8px',
          border: '1px solid #bbf7d022',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '78%', height: '100%', background: '#22c55e', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>78</span>
          </div>
          <div style={{ fontSize: 8, color: '#22c55e', fontWeight: 700, marginTop: 3 }}>High Viral Potential</div>
        </div>
        {/* Quick rewrites */}
        <div style={{ display: 'flex', gap: 3, marginTop: 8, flexWrap: 'wrap' }}>
          {['Shorten', 'Expand', 'Punchier', 'Add CTA'].map(r => (
            <span key={r} style={{
              padding: '3px 6px', borderRadius: 4, background: '#f1f5f9',
              fontSize: 8, color: '#6366f1', fontWeight: 600,
            }}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepScheduleIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Schedule</span>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Quick Presets</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[
            { icon: '🌅', label: 'Morning', time: '9 AM', active: true },
            { icon: '🌙', label: 'Evening', time: '7 PM', active: false },
            { icon: '☀️', label: 'Lunch', time: '12 PM', active: false },
          ].map(p => (
            <div key={p.label} style={{
              flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8,
              background: p.active ? '#ede9fe' : '#f8fafc',
              border: p.active ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
            }}>
              <div style={{ fontSize: 16 }}>{p.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: p.active ? '#6366f1' : '#64748b' }}>{p.label}</div>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>{p.time}</div>
            </div>
          ))}
        </div>
        {/* Per-platform schedule */}
        {[
          { id: 'youtube',   label: 'YouTube',   time: 'Tomorrow, 9:00 AM' },
          { id: 'instagram', label: 'Instagram', time: 'Tomorrow, 9:00 AM' },
          { id: 'linkedin',  label: 'LinkedIn',  time: 'Publish immediately' },
        ].map(p => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
            borderRadius: 6, marginBottom: 4, background: '#f8fafc',
          }}>
            <PlatLogo id={p.id} size={16} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#334155', flex: 1 }}>{p.label}</span>
            <span style={{ fontSize: 8, color: p.time.includes('immediately') ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>
              {p.time.includes('immediately') ? '⏱️' : '📅'} {p.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPublishIllustration() {
  const statuses = [
    { id: 'youtube',   label: 'YouTube',   status: 'done', text: '✅ Published' },
    { id: 'instagram', label: 'Instagram', status: 'done', text: '✅ Published' },
    { id: 'linkedin',  label: 'LinkedIn',  status: 'publishing', text: '⏳ Publishing...' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>🚀 Publishing</span>
      </div>
      <div style={{ padding: '16px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🚀</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Publishing your content...</div>
        {statuses.map(s => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            borderRadius: 8, marginBottom: 4,
            background: s.status === 'done' ? '#f0fdf4' : '#fefce8',
            border: s.status === 'done' ? '1px solid #bbf7d0' : '1px solid #fde68a',
          }}>
            <PlatLogo id={s.id} size={16} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#334155', flex: 1, textAlign: 'left' }}>{s.label}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: s.status === 'done' ? '#22c55e' : '#f59e0b' }}>{s.text}</span>
          </div>
        ))}
        <div style={{
          marginTop: 14, padding: '8px 16px', borderRadius: 8,
          background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700,
        }}>
          📊 View Analytics →
        </div>
      </div>
    </div>
  );
}

const ILLUSTRATIONS = {
  choose: StepChooseIllustration,
  upload: StepUploadIllustration,
  platforms: StepPlatformsIllustration,
  generate: StepGenerateIllustration,
  review: StepReviewIllustration,
  schedule: StepScheduleIllustration,
  publish: StepPublishIllustration,
};

/* ── Main Tutorial Component ─────────────────────────────────── */

export default function VideoPublisherTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];
  const Illustration = ILLUSTRATIONS[step.id];

  return (
    <section style={st.section}>
      <div style={st.container}>
        {/* Header */}
        <div style={st.header}>
          <span style={st.badge}>Tutorial</span>
          <h2 style={st.title}>How to Publish with Video Publisher</h2>
          <p style={st.subtitle}>
            Follow these 7 simple steps to upload, optimize, schedule, and publish your content across all platforms.
          </p>
        </div>

        {/* Step navigation dots */}
        <div style={st.dotsRow}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(i)}
              style={{
                ...st.dot,
                background: i === activeStep ? '#6366f1' : i < activeStep ? '#a5b4fc' : '#e2e8f0',
                color: i === activeStep ? '#fff' : i < activeStep ? '#fff' : '#94a3b8',
                transform: i === activeStep ? 'scale(1.15)' : 'scale(1)',
                boxShadow: i === activeStep ? '0 2px 10px rgba(99,102,241,0.35)' : 'none',
              }}
            >
              {s.number}
            </button>
          ))}
        </div>

        {/* Main content: illustration + description */}
        <div style={st.content}>
          {/* Left: illustration */}
          <div style={st.illustrationWrap}>
            <Illustration />
          </div>

          {/* Right: text */}
          <div style={st.textWrap}>
            <div style={st.stepBadge}>Step {step.number} of {STEPS.length}</div>
            <h3 style={st.stepTitle}>{step.title}</h3>
            <p style={st.stepDesc}>{step.desc}</p>
            <div style={st.tipBox}>
              <span style={{ fontSize: 14 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Pro Tip</div>
                <div style={{ fontSize: 12, color: '#a16207', lineHeight: 1.5 }}>{step.tip}</div>
              </div>
            </div>

            {/* Nav buttons */}
            <div style={st.navRow}>
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                style={{
                  ...st.navBtn,
                  opacity: activeStep === 0 ? 0.4 : 1,
                  cursor: activeStep === 0 ? 'default' : 'pointer',
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                disabled={activeStep === STEPS.length - 1}
                style={{
                  ...st.navBtnPrimary,
                  opacity: activeStep === STEPS.length - 1 ? 0.4 : 1,
                  cursor: activeStep === STEPS.length - 1 ? 'default' : 'pointer',
                }}
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>

        {/* All steps overview */}
        <div style={st.overviewGrid}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(i)}
              style={{
                ...st.overviewCard,
                borderColor: i === activeStep ? '#6366f1' : '#334155',
                background: i === activeStep ? '#1e1b4b' : '#1e293b',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i <= activeStep ? '#6366f1' : '#334155',
                color: i <= activeStep ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>
                {i < activeStep ? '✓' : s.number}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: i === activeStep ? '#a5b4fc' : '#cbd5e1' }}>{s.title}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>
                  {s.desc.slice(0, 60)}...
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Illustration frame styles ─────────────────────────────── */
const ill = {
  phone: {
    width: 240, margin: '0 auto',
    background: '#fff', borderRadius: 20,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    border: '3px solid #1e293b',
  },
  phoneHeader: {
    background: '#1e293b', padding: '8px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};

/* ── Section styles ────────────────────────────────────────── */
const st = {
  section: {
    padding: '60px 20px 80px',
    background: '#0f172a',
    fontFamily: "'Inter', -apple-system, sans-serif",
    minHeight: '100vh',
  },
  container: {
    maxWidth: 960,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 36,
  },
  badge: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 14px',
    borderRadius: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: '0 0 8px',
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    margin: 0,
    maxWidth: 520,
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 36,
  },
  dot: {
    width: 32, height: 32, borderRadius: '50%',
    border: 'none', fontWeight: 800, fontSize: 13,
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  content: {
    display: 'flex',
    gap: 40,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 48,
  },
  illustrationWrap: {
    flex: '0 0 280px',
    display: 'flex',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 280,
  },
  stepBadge: {
    display: 'inline-block',
    background: '#1e1b4b',
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 6,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: '0 0 10px',
  },
  stepDesc: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: '0 0 16px',
  },
  tipBox: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 20,
  },
  navRow: {
    display: 'flex',
    gap: 10,
  },
  navBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1.5px solid #334155',
    background: '#1e293b',
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navBtnPrimary: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
    transition: 'all 0.15s',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 10,
  },
  overviewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1.5px solid #1e293b',
    background: '#1e293b',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
};
