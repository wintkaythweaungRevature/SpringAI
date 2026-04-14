import React, { useState } from 'react';
import { LinkedInLogo } from './PlatformIcon';

/* ─── Shared CDN helper (LinkedIn always uses inline SVG) ─────── */
const SI = 'https://cdn.simpleicons.org';
const cdnSrc = (name, color) => `${SI}/${name}/${color.replace('#', '')}`;

const PLAT_LOGOS = {
  youtube:   { src: cdnSrc('youtube',   '#FF0000'), color: '#FF0000' },
  instagram: { src: cdnSrc('instagram', '#E1306C'), color: '#E1306C' },
  facebook:  { src: cdnSrc('facebook',  '#1877F2'), color: '#1877F2' },
  tiktok:    { src: cdnSrc('tiktok',    '#FFFFFF'), color: '#FFFFFF', bg: '#010101' },
  x:         { src: cdnSrc('x',         '#FFFFFF'), color: '#FFFFFF', bg: '#000000' },
  threads:   { src: cdnSrc('threads',   '#101010'), color: '#101010' },
  pinterest: { src: cdnSrc('pinterest', '#E60023'), color: '#E60023' },
};

/** Platform logo — LinkedIn uses inline SVG, all others use Simple Icons CDN */
function PlatLogo({ id, size = 16 }) {
  if (id === 'linkedin') return <LinkedInLogo size={size} color="#0A66C2" />;
  const entry = PLAT_LOGOS[id];
  if (!entry) return null;
  const style = {
    width: size, height: size, objectFit: 'contain',
    ...(entry.bg ? { background: entry.bg, borderRadius: 4, padding: 1 } : {}),
  };
  return <img src={entry.src} alt={id} style={style} />;
}

/* ─── Shared phone frame styles ───────────────────────────────── */
const ill = {
  phone: {
    width: 200, minHeight: 280,
    background: '#0f172a', borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    overflow: 'hidden', flexShrink: 0,
  },
  phoneHeader: {
    background: '#1e293b', padding: '8px 14px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #334155',
  },
  card: {
    background: '#1e293b', borderRadius: 10, padding: '10px 12px', margin: '0 8px 8px',
  },
};

/* ══════════════════════════════════════════════════════════════
   TEMPLATES TUTORIAL
══════════════════════════════════════════════════════════════ */

const TEMPLATE_STEPS = [
  {
    id: 'browse',   number: 1,
    title: 'Browse 84+ Templates',
    desc: 'Scroll through templates organised by category — Business, Product, Sale, Quote, Event, Holiday, Content, and Announce. Click any card to open the Customize modal.',
    tip: 'Use the category filter pills at the top to quickly find the right template type for your post.',
  },
  {
    id: 'theme',    number: 2,
    title: 'Pick a Colour Theme',
    desc: 'Choose from 12 colour themes (Default, Earth, Floral, Corporate, Navy, Rose, Forest, and more). The theme is applied live — your design updates instantly.',
    tip: 'The "Default" theme matches most templates\' original design. Try "Corporate" or "Navy" for professional posts.',
  },
  {
    id: 'text',     number: 3,
    title: 'Edit Every Word in the Design',
    desc: 'Open the "✏️ Design Text" panel and type your own headlines, subtitles, button labels, and any other text visible in the template. Changes update the preview in real time.',
    tip: 'Every word you see in the template can be replaced — badge labels, CTAs, body copy, everything.',
  },
  {
    id: 'caption',  number: 4,
    title: 'Fill In Your Caption',
    desc: 'Below the design preview you\'ll see a caption with [placeholder] slots. Fill in your brand name, niche, offer details and more. The filled caption is ready to paste into Instagram, LinkedIn, etc.',
    tip: 'Business info (name, handle, email, website) syncs automatically into the design so you only type it once.',
  },
  {
    id: 'download', number: 5,
    title: 'Download PNG, JPG, or PDF',
    desc: 'Hit the Download button and choose your format. The exported file contains only the visual design — clean, cropped, and ready to post. No caption text on the image.',
    tip: 'PNG is best for Instagram. PDF is ideal for client presentations. JPG keeps file size small.',
  },
];

function TBrowseIllustration() {
  const cats = ['All', 'Business', 'Sale', 'Quote'];
  const cards = [
    { label: 'Navy Business Cover', cat: 'Business' },
    { label: 'Product Launch',      cat: 'Product'  },
    { label: 'Flash Sale',          cat: 'Sale'      },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>🎨 Templates</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {cats.map((c, i) => (
            <span key={c} style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700,
              background: i === 0 ? '#6366f1' : '#1e293b',
              color: i === 0 ? '#fff' : '#94a3b8',
              border: i === 0 ? 'none' : '1px solid #334155',
            }}>{c}</span>
          ))}
        </div>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: i === 0 ? '#1e3a8a' : '#1e293b',
            borderRadius: 8, marginBottom: 6, overflow: 'hidden',
            border: i === 0 ? '1.5px solid #3b82f6' : '1px solid #334155',
          }}>
            <div style={{ height: 42, background: i === 0 ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: i === 0 ? 11 : 9, color: '#fff', fontWeight: i === 0 ? 800 : 400 }}>{card.label}</span>
            </div>
            <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 8, color: '#64748b' }}>{card.cat}</span>
              <span style={{ fontSize: 8, color: '#6366f1', fontWeight: 700 }}>{i === 0 ? 'SELECTED ✓' : 'Customize'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TThemeIllustration() {
  const themes = [
    { label: 'Default',   swatches: ['#1a3a5c', '#94a3b8', '#e2e8f0'] },
    { label: 'Corporate', swatches: ['#0e7490', '#f8fafc', '#0f172a'] },
    { label: 'Rose',      swatches: ['#be185d', '#fda4af', '#fff1f2'] },
    { label: 'Forest',    swatches: ['#166534', '#86efac', '#f0fdf4'] },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>🎨 Colour Theme</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 8 }}>Choose a theme:</div>
        {themes.map((t, i) => (
          <div key={t.label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 8, marginBottom: 4,
            background: i === 0 ? '#1e3a8a20' : '#1e293b',
            border: i === 0 ? '1.5px solid #3b82f6' : '1px solid #334155',
          }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {t.swatches.map((s, j) => (
                <div key={j} style={{ width: 10, height: 10, borderRadius: 3, background: s }} />
              ))}
            </div>
            <span style={{ fontSize: 10, color: i === 0 ? '#93c5fd' : '#94a3b8', fontWeight: i === 0 ? 700 : 400, flex: 1 }}>{t.label}</span>
            {i === 0 && <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 700 }}>✓</span>}
          </div>
        ))}
        <div style={{ marginTop: 10, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 8, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>LIVE PREVIEW</span>
        </div>
      </div>
    </div>
  );
}

function TTextIllustration() {
  const fields = [
    { label: 'Headline',    value: 'Product Launch' },
    { label: 'Subtitle',    value: 'Built for results.' },
    { label: 'Button 1',   value: 'SHOP NOW' },
    { label: 'Button 2',   value: 'Learn More' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>✏️ Design Text</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        {fields.map((f, i) => (
          <div key={f.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>{f.label}</div>
            <div style={{
              background: i === 0 ? '#1e3a8a' : '#1e293b',
              border: i === 0 ? '1.5px solid #3b82f6' : '1px solid #334155',
              borderRadius: 6, padding: '5px 8px',
              fontSize: 9, color: i === 0 ? '#93c5fd' : '#94a3b8', fontWeight: i === 0 ? 700 : 400,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{f.value}</span>
              {i === 0 && <span style={{ fontSize: 8, color: '#6366f1' }}>|</span>}
            </div>
          </div>
        ))}
        <div style={{ height: 1, background: '#334155', margin: '8px 0' }} />
        <div style={{ fontSize: 8, color: '#22c55e', textAlign: 'center', fontWeight: 700 }}>Preview updates in real time ✓</div>
      </div>
    </div>
  );
}

function TCaptionIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📝 Caption</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>Fill in your info:</div>
        {[
          { label: 'Brand Name', value: 'WintAI', filled: true },
          { label: '@handle',    value: 'wintaibot', filled: true },
          { label: 'Email',      value: 'contact@wintaibot.com', filled: true },
          { label: 'Website',    value: '', filled: false },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>{f.label}</div>
            <div style={{
              background: f.filled ? '#052e16' : '#1e293b',
              border: f.filled ? '1px solid #166534' : '1px solid #334155',
              borderRadius: 6, padding: '4px 8px', fontSize: 9,
              color: f.filled ? '#86efac' : '#94a3b8',
            }}>
              {f.filled ? f.value : <span style={{ color: '#334155' }}>type here...</span>}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 8, background: '#1e293b', borderRadius: 6, padding: '6px 8px', border: '1px solid #334155' }}>
          <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.5 }}>
            ✨ Elevating your niche...<br />
            📱 wintaibot &nbsp;•&nbsp; 📧 contact@wintaibot.com<br />
            <span style={{ color: '#334155' }}>🔗 [website]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TDownloadIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>⬇️ Download</span>
      </div>
      <div style={{ padding: '12px 8px' }}>
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', borderRadius: 8, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 10, fontWeight: 800 }}>Product Launch</div>
            <div style={{ color: '#93c5fd', fontSize: 8 }}>SHOP NOW · Learn More</div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 6 }}>Choose format:</div>
        {[
          { fmt: 'PNG',  icon: '🖼️', note: 'Best for Instagram', active: true  },
          { fmt: 'JPG',  icon: '📷', note: 'Smaller file size',   active: false },
          { fmt: 'PDF',  icon: '📄', note: 'For presentations',   active: false },
        ].map((f) => (
          <div key={f.fmt} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 7, marginBottom: 4,
            background: f.active ? '#1e3a8a' : '#1e293b',
            border: f.active ? '1.5px solid #3b82f6' : '1px solid #334155',
          }}>
            <span style={{ fontSize: 12 }}>{f.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: f.active ? '#93c5fd' : '#94a3b8', flex: 1 }}>{f.fmt}</span>
            <span style={{ fontSize: 8, color: '#64748b' }}>{f.note}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, background: '#6366f1', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>⬇️ Download PNG</span>
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_ILLUSTRATIONS = {
  browse: TBrowseIllustration,
  theme:  TThemeIllustration,
  text:   TTextIllustration,
  caption:TCaptionIllustration,
  download: TDownloadIllustration,
};

export function TemplatesTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = TEMPLATE_STEPS[activeStep];
  const Illustration = TEMPLATE_ILLUSTRATIONS[step.id];
  return <TutorialLayout
    badge="Templates"
    icon="🎨"
    title="How to Use Caption Templates"
    subtitle="Pick a template, customise every word, fill your caption, and download a professional graphic in minutes."
    steps={TEMPLATE_STEPS}
    activeStep={activeStep}
    setActiveStep={setActiveStep}
    step={step}
    Illustration={Illustration}
    accentColor="#6366f1"
  />;
}

/* ══════════════════════════════════════════════════════════════
   ANALYTICS DASHBOARD TUTORIAL
══════════════════════════════════════════════════════════════ */

const DASHBOARD_STEPS = [
  {
    id: 'overview', number: 1,
    title: 'Performance Overview',
    desc: 'The Dashboard gives you a bird\'s-eye view of your social media performance — total posts, views, likes, and comments in one place across all connected platforms.',
    tip: 'Connect at least one social account in "Connected Accounts" to start seeing real data.',
  },
  {
    id: 'platforms', number: 2,
    title: 'Platform Breakdown',
    desc: 'See how each platform is performing individually. Compare YouTube vs Instagram vs LinkedIn engagement at a glance and decide where to invest more content energy.',
    tip: 'Click any platform row to drill down into post-level analytics for that channel.',
  },
  {
    id: 'posts', number: 3,
    title: 'Top Performing Posts',
    desc: 'The dashboard surfaces your highest-performing posts by views and engagement. Use these insights to understand what topics and formats resonate with your audience.',
    tip: 'Repurpose your top posts using the Caption Templates tool — click "Use This Template" from any top post.',
  },
  {
    id: 'insights', number: 4,
    title: 'Performance Insights',
    desc: 'AI-powered insights highlight patterns in your data — best posting days, peak engagement hours, which hashtag groups perform best, and which captions drive the most clicks.',
    tip: 'Check insights every Monday to plan your content calendar for the week ahead.',
  },
  {
    id: 'export', number: 5,
    title: 'Track Growth Over Time',
    desc: 'Toggle between 7-day, 30-day, and 90-day views to track your growth trajectory. See if your follower count and engagement rate are trending up week over week.',
    tip: 'Share the analytics summary with clients or your team as a PDF from the export button.',
  },
];

function DOverviewIllustration() {
  const metrics = [
    { label: 'Total Posts', value: '47',   icon: '📝', color: '#6366f1' },
    { label: 'Total Views', value: '12.4K', icon: '👁️', color: '#22c55e' },
    { label: 'Likes',       value: '3.2K', icon: '❤️', color: '#ef4444' },
    { label: 'Comments',    value: '284',  icon: '💬', color: '#f59e0b' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📊 Dashboard</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155' }}>
          <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>7-day views</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}>
            {[40, 65, 50, 80, 72, 90, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 5 ? '#6366f1' : '#334155', borderRadius: '2px 2px 0 0', height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DPlatformsIllustration() {
  const platforms = [
    { id: 'youtube',   label: 'YouTube',   posts: 14, color: '#FF0000' },
    { id: 'instagram', label: 'Instagram', posts: 22, color: '#E1306C' },
    { id: 'linkedin',  label: 'LinkedIn',  posts: 11, color: '#0A66C2' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📊 By Platform</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        {platforms.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8, marginBottom: 6,
            background: '#1e293b', border: '1px solid #334155',
          }}>
            <PlatLogo id={p.id} size={20} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{p.label}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.posts}</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>posts</div>
            </div>
            <div style={{ width: 40, height: 5, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(p.posts / 22) * 100}%`, height: '100%', background: p.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DPostsIllustration() {
  const posts = [
    { title: '5 Tips to Grow Faster', views: '4.2K', likes: '312', platform: 'youtube'   },
    { title: 'Behind the Scenes',     views: '3.8K', likes: '278', platform: 'instagram' },
    { title: 'Monday Motivation',     views: '2.1K', likes: '195', platform: 'linkedin'  },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>🏆 Top Posts</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        {posts.map((p, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, padding: '7px 8px', borderRadius: 8, marginBottom: 5,
            background: '#1e293b', border: '1px solid #334155',
          }}>
            <div style={{ width: 6, borderRadius: 3, background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7c2a', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.title}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 8, color: '#64748b' }}>👁️ {p.views}</span>
                <span style={{ fontSize: 8, color: '#64748b' }}>❤️ {p.likes}</span>
              </div>
            </div>
            <PlatLogo id={p.platform} size={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DInsightsIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>💡 AI Insights</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        {[
          { icon: '📅', label: 'Best day to post', value: 'Tuesday' },
          { icon: '⏰', label: 'Peak hour',          value: '7–9 PM'  },
          { icon: '#️⃣', label: 'Top hashtag group',  value: '#growth' },
        ].map((ins) => (
          <div key={ins.label} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 8, marginBottom: 5,
            background: '#1e293b', border: '1px solid #334155',
          }}>
            <span style={{ fontSize: 14 }}>{ins.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: '#64748b' }}>{ins.label}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1' }}>{ins.value}</div>
            </div>
          </div>
        ))}
        <div style={{ background: '#052e16', borderRadius: 8, padding: '8px', border: '1px solid #166534', marginTop: 4 }}>
          <div style={{ fontSize: 8, color: '#86efac', fontWeight: 700 }}>📈 Engagement up 23% this week</div>
        </div>
      </div>
    </div>
  );
}

function DGrowthIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📈 Growth</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {['7d', '30d', '90d'].map((t, i) => (
            <span key={t} style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
              background: i === 1 ? '#6366f1' : '#1e293b',
              color: i === 1 ? '#fff' : '#64748b',
              border: i === 1 ? 'none' : '1px solid #334155',
            }}>{t}</span>
          ))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: 10, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
            {[20,28,32,25,40,52,48,60,55,72,68,80].map((h, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: '2px 2px 0 0',
                background: i > 8 ? '#6366f1' : '#334155',
                height: `${h}%`,
              }} />
            ))}
          </div>
          <div style={{ height: 1, background: '#334155', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 8, color: '#64748b' }}>Jan</span>
            <span style={{ fontSize: 8, color: '#6366f1', fontWeight: 700 }}>↑ +34%</span>
            <span style={{ fontSize: 8, color: '#64748b' }}>Mar</span>
          </div>
        </div>
        <div style={{ marginTop: 8, background: '#6366f1', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>📥 Export Report</span>
        </div>
      </div>
    </div>
  );
}

const DASHBOARD_ILLUSTRATIONS = {
  overview:  DOverviewIllustration,
  platforms: DPlatformsIllustration,
  posts:     DPostsIllustration,
  insights:  DInsightsIllustration,
  export:    DGrowthIllustration,
};

export function DashboardTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = DASHBOARD_STEPS[activeStep];
  const Illustration = DASHBOARD_ILLUSTRATIONS[step.id];
  return <TutorialLayout
    badge="Dashboard"
    icon="📊"
    title="How to Use the Analytics Dashboard"
    subtitle="Track every post, understand what's working, and get AI insights to grow faster across all your platforms."
    steps={DASHBOARD_STEPS}
    activeStep={activeStep}
    setActiveStep={setActiveStep}
    step={step}
    Illustration={Illustration}
    accentColor="#22c55e"
  />;
}

/* ══════════════════════════════════════════════════════════════
   GROWTH PLANNER TUTORIAL  (Content Calendar)
══════════════════════════════════════════════════════════════ */

const GROWTH_STEPS = [
  {
    id: 'calendar', number: 1,
    title: 'View Your Content Calendar',
    desc: 'The Growth Planner shows your full posting schedule in a monthly calendar view. See all scheduled, published, and draft posts at a glance across every platform.',
    tip: 'Switch between month, week, and list views using the toggle at the top right.',
  },
  {
    id: 'schedule', number: 2,
    title: 'Schedule a New Post',
    desc: 'Click any empty day on the calendar to open the Compose Post modal. Choose your platform, write your caption, attach media, and pick your publish time.',
    tip: 'You can schedule the same post to multiple platforms at once to save time.',
  },
  {
    id: 'platforms', number: 3,
    title: 'Filter by Platform',
    desc: 'Use the platform filter pills to focus on one channel. See only your Instagram schedule, or only LinkedIn — perfect for platform-specific planning sessions.',
    tip: 'Aim for at least 3 posts per platform per week for consistent algorithm performance.',
  },
  {
    id: 'besttime', number: 4,
    title: 'Post at the Right Time',
    desc: 'The AI suggests the best posting times based on your audience\'s activity patterns. Use the "Best Time" indicator on the schedule modal to maximise reach.',
    tip: 'For most audiences: Tue–Thu mornings (9–11 AM) and evenings (6–8 PM) get the highest engagement.',
  },
  {
    id: 'pipeline', number: 5,
    title: 'Manage Your Content Pipeline',
    desc: 'Track all posts in draft, scheduled, published, and failed states. Retry failed posts, edit drafts, and review what\'s coming up next week — all from one screen.',
    tip: 'Batch-create a full week of content using Caption Templates, then schedule them all in the calendar.',
  },
];

function GCalendarIllustration() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const hasPost = [1, 3, 4, 6, 8, 10, 11, 13, 15, 17, 18, 20, 22, 24, 25];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📅 Content Calendar</span>
        <span style={{ fontSize: 9, color: '#6366f1' }}>April 2026</span>
      </div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {days.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 8, color: '#64748b', fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
            <div key={d} style={{
              height: 22, borderRadius: 4, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 8, flexDirection: 'column',
              background: d === 12 ? '#6366f1' : hasPost.includes(d) ? '#1e3a8a' : '#1e293b',
              color: d === 12 ? '#fff' : '#94a3b8',
              border: d === 12 ? 'none' : hasPost.includes(d) ? '1px solid #3b82f6' : '1px solid #334155',
            }}>
              <span>{d}</span>
              {hasPost.includes(d) && d !== 12 && <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#6366f1', marginTop: 1 }} />}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
          {[
            { color: '#6366f1', label: 'Today' },
            { color: '#3b82f6', label: 'Scheduled' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: l.color }} />
              <span style={{ fontSize: 7, color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GScheduleIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>✍️ New Post</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Platforms</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {[
            { id: 'instagram', active: true },
            { id: 'linkedin',  active: true },
            { id: 'facebook',  active: false },
          ].map(p => (
            <div key={p.id} style={{
              padding: '4px', borderRadius: 6,
              background: p.active ? '#1e3a8a' : '#1e293b',
              border: p.active ? '1.5px solid #3b82f6' : '1px solid #334155',
            }}>
              <PlatLogo id={p.id} size={16} />
            </div>
          ))}
        </div>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155', marginBottom: 8, fontSize: 9, color: '#94a3b8', minHeight: 40 }}>
          🚀 Exciting news! We just launched...
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Schedule for</div>
        <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 8px', border: '1px solid #334155', fontSize: 9, color: '#6366f1', fontWeight: 700, marginBottom: 8 }}>
          📅 Tue Apr 15, 9:00 AM
        </div>
        <div style={{ background: '#6366f1', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Schedule Post →</span>
        </div>
      </div>
    </div>
  );
}

function GPlatformsIllustration() {
  const platforms = [
    { id: 'instagram', label: 'Instagram', count: 12, color: '#E1306C' },
    { id: 'linkedin',  label: 'LinkedIn',  count: 8,  color: '#0A66C2' },
    { id: 'youtube',   label: 'YouTube',   count: 5,  color: '#FF0000' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>🔍 Filter Platform</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 9, background: '#6366f1', color: '#fff', fontWeight: 700 }}>All</span>
          {platforms.map(p => (
            <div key={p.id} style={{
              padding: '3px 6px', borderRadius: 20, border: '1px solid #334155',
              background: '#1e293b', display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <PlatLogo id={p.id} size={10} />
            </div>
          ))}
        </div>
        {platforms.map((p) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 8, marginBottom: 5,
            background: '#1e293b', border: '1px solid #334155',
          }}>
            <PlatLogo id={p.id} size={18} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{p.label}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: p.color }}>{p.count} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GBestTimeIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>⏰ Best Time to Post</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        {[
          { platform: 'instagram', id: 'instagram', time: '7–9 PM',    day: 'Tue, Wed',  score: 94 },
          { platform: 'LinkedIn',  id: 'linkedin',  time: '8–10 AM',   day: 'Tue, Thu',  score: 88 },
          { platform: 'YouTube',   id: 'youtube',   time: '2–4 PM',    day: 'Fri, Sat',  score: 81 },
        ].map((item) => (
          <div key={item.platform} style={{
            display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 8, marginBottom: 5,
            background: '#1e293b', border: '1px solid #334155',
          }}>
            <PlatLogo id={item.id} size={18} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>{item.time}</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>{item.day}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e' }}>{item.score}%</div>
              <div style={{ fontSize: 7, color: '#64748b' }}>reach</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GPipelineIllustration() {
  const statuses = [
    { label: 'Draft',      count: 3, color: '#94a3b8' },
    { label: 'Scheduled',  count: 8, color: '#6366f1' },
    { label: 'Published',  count: 47, color: '#22c55e' },
    { label: 'Failed',     count: 1, color: '#ef4444' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>📋 Pipeline</span>
      </div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          {statuses.map(s => (
            <div key={s.label} style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: `1px solid ${s.color}33`, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 8, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: '#64748b', marginBottom: 6 }}>Recent activity:</div>
        {[
          { icon: '✅', text: 'Instagram post published',  time: '2m ago' },
          { icon: '📅', text: 'LinkedIn post scheduled',   time: '1h ago' },
          { icon: '⚠️', text: 'TikTok post failed — retry', time: '3h ago' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 10 }}>{item.icon}</span>
            <span style={{ fontSize: 8, color: '#94a3b8', flex: 1 }}>{item.text}</span>
            <span style={{ fontSize: 7, color: '#475569' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const GROWTH_ILLUSTRATIONS = {
  calendar:  GCalendarIllustration,
  schedule:  GScheduleIllustration,
  platforms: GPlatformsIllustration,
  besttime:  GBestTimeIllustration,
  pipeline:  GPipelineIllustration,
};

export function GrowthPlannerTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = GROWTH_STEPS[activeStep];
  const Illustration = GROWTH_ILLUSTRATIONS[step.id];
  return <TutorialLayout
    badge="Growth Planner"
    icon="🗓️"
    title="How to Use the Growth Planner"
    subtitle="Plan, schedule, and track all your social media posts in one content calendar. Post consistently without the daily scramble."
    steps={GROWTH_STEPS}
    activeStep={activeStep}
    setActiveStep={setActiveStep}
    step={step}
    Illustration={Illustration}
    accentColor="#f59e0b"
  />;
}

/* ══════════════════════════════════════════════════════════════
   ECHOSCRIBE TUTORIAL
══════════════════════════════════════════════════════════════ */

const ECHO_STEPS = [
  { id: 'upload',    number: 1, title: 'Upload or Record Audio',        desc: 'Go to EchoScribe under The Forge. Either upload an audio file (MP3, WAV, M4A, OGG, MP4) or switch to the Voice → Content tab to record directly from your microphone using the browser.',                                           tip: 'Recordings up to 25 MB are supported. For long recordings, compress the file first to stay under the limit.' },
  { id: 'transcribe',number: 2, title: 'Get Your Full Transcript',      desc: 'Click Transcribe. OpenAI Whisper processes your audio and returns a word-for-word transcript in seconds. The transcript appears below the upload area and is fully selectable for copy-pasting.',                                       tip: 'Whisper handles accents, background noise, and multiple speakers well. For best results, use a quiet environment.' },
  { id: 'voice',     number: 3, title: 'Generate Social Content',       desc: 'Switch to the ✨ Voice → Content tab. Upload or record audio, then click Generate. The AI produces a 5-tweet thread, a LinkedIn long-form post, and an Instagram quote card — all from your spoken words.',                             tip: 'Use this after a podcast episode, meeting, or brainstorm session to instantly repurpose your ideas into social content.' },
  { id: 'formats',   number: 4, title: 'Review All Three Formats',      desc: 'Switch between the Thread, LinkedIn, and Instagram tabs to review each piece of content. Each tab shows the formatted output — tweet cards with character counts, LinkedIn paragraph post, and a styled Instagram quote card.',         tip: 'The Instagram quote card uses your active brand\'s primary color automatically.' },
  { id: 'copy',      number: 5, title: 'Copy and Schedule',             desc: 'Use the Copy button on each tweet, or copy the full thread at once. Paste directly into Social Post Scheduler with your preferred platform, date, and time. Your voice idea becomes a scheduled post in under 2 minutes.',              tip: 'Copy the LinkedIn post and paste it into the scheduler set to LinkedIn — it\'s ready to publish with no editing needed.' },
];

function EUploadIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🎙️ EchoScribe</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {['🎙️ Transcribe', '✨ Voice → Content'].map((t, i) => (
            <span key={t} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: i === 0 ? '#6366f1' : '#1e293b', color: i === 0 ? '#fff' : '#64748b', border: i === 0 ? 'none' : '1px solid #334155' }}>{t}</span>
          ))}
        </div>
        <div style={{ border: '2px dashed #334155', borderRadius: 10, padding: '14px 10px', textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🎵</div>
          <div style={{ fontSize: 9, color: '#64748b' }}>Drop audio file here</div>
          <div style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>MP3 · WAV · M4A · OGG</div>
        </div>
        <div style={{ background: '#6366f1', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Transcribe →</span>
        </div>
      </div>
    </div>
  );
}

function ETranscribeIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📄 Transcript</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155', marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.6 }}>"Today I want to talk about three key strategies that have helped our brand grow on social media. The first one is consistency — posting at least five times a week..."</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#64748b' }}>247 words · 1:42</span>
          <span style={{ fontSize: 8, color: '#22c55e', fontWeight: 700 }}>✓ Copy</span>
        </div>
      </div>
    </div>
  );
}

function EVoiceIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>✨ Voice → Content</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {['🎤 Record', '📁 Upload'].map((t, i) => (
            <span key={t} style={{ padding: '3px 8px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: i === 0 ? '#8b5cf6' : '#1e293b', color: i === 0 ? '#fff' : '#64748b', border: i === 0 ? 'none' : '1px solid #334155' }}>{t}</span>
          ))}
        </div>
        <div style={{ background: '#1e293b', border: '2px solid #8b5cf6', borderRadius: 10, padding: '12px', textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>⏺</div>
          <div style={{ fontSize: 9, color: '#a78bfa', fontWeight: 700 }}>Recording… 0:23</div>
        </div>
        <div style={{ background: '#8b5cf6', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✨ Generate Content</span>
        </div>
      </div>
    </div>
  );
}

function EFormatsIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📱 Output Formats</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          {[
            { label: 'Thread', color: '#000', active: true },
            { label: 'LinkedIn', color: '#0A66C2', active: false },
            { label: 'Instagram', color: '#E1306C', active: false },
          ].map(t => (
            <span key={t.label} style={{ padding: '3px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: t.active ? t.color : '#1e293b', color: t.active ? '#fff' : '#64748b', border: t.active ? 'none' : '1px solid #334155' }}>{t.label}</span>
          ))}
        </div>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#1e293b', borderRadius: 8, padding: '7px 8px', marginBottom: 5, border: '1px solid #334155' }}>
            <div style={{ fontSize: 8, color: '#e2e8f0', marginBottom: 3 }}>Tweet {i} of 5</div>
            <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.4 }}>Strategy #{i}: {i === 1 ? 'Consistency is the #1 growth...' : i === 2 ? 'Engage with your audience...' : 'Use analytics to double down...'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 7, color: '#475569' }}>{[62, 78, 54][i-1]}/280</span>
              <span style={{ fontSize: 7, color: '#6366f1', fontWeight: 700 }}>Copy</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ECopyIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📋 Schedule</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 8, padding: '8px', marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: '#86efac', fontWeight: 700, marginBottom: 2 }}>✓ Copied to clipboard!</div>
          <div style={{ fontSize: 8, color: '#4ade80' }}>Full thread (5 tweets) ready</div>
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>Paste into Schedule Post:</div>
        {[
          { label: 'Platform', value: 'X / Twitter' },
          { label: 'Caption',  value: 'Strategy #1: Consistency is the...' },
          { label: 'Date',     value: 'Tue Apr 15, 9:00 AM' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 5 }}>
            <div style={{ fontSize: 7, color: '#475569', marginBottom: 2 }}>{f.label}</div>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '4px 7px', fontSize: 8, color: '#94a3b8' }}>{f.value}</div>
          </div>
        ))}
        <div style={{ background: '#6366f1', borderRadius: 7, padding: '6px', textAlign: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Schedule →</span>
        </div>
      </div>
    </div>
  );
}

const ECHO_ILLUSTRATIONS = { upload: EUploadIllustration, transcribe: ETranscribeIllustration, voice: EVoiceIllustration, formats: EFormatsIllustration, copy: ECopyIllustration };

export function EchoScribeTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = ECHO_STEPS[activeStep];
  const Illustration = ECHO_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="EchoScribe" icon="🎙️" title="How to Use EchoScribe & Voice Creator" subtitle="Transcribe any audio file — or record your voice — and instantly turn your words into a Twitter thread, LinkedIn post, and Instagram quote card." steps={ECHO_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#8b5cf6" />;
}

/* ══════════════════════════════════════════════════════════════
   URL REPURPOSER TUTORIAL
══════════════════════════════════════════════════════════════ */

const URL_STEPS = [
  { id: 'paste',    number: 1, title: 'Paste Any Article URL',          desc: 'Go to The Forge → URL Repurposer. Paste the full URL of any blog post, news article, or online resource. The AI will scrape and read the article content automatically — no copy-pasting text required.',                              tip: 'Works with Medium, Substack, WordPress, LinkedIn articles, news sites, and most public blogs.' },
  { id: 'generate', number: 2, title: 'Click Repurpose',                desc: 'Hit the Repurpose button. The backend fetches the article, extracts the key content, and passes it to GPT-4o. In about 10–15 seconds you get content ready for 4 platforms: Instagram, X/Twitter, LinkedIn, and Facebook.',           tip: 'If the page is behind a paywall or login, the scraper can\'t read it. Use public articles only.' },
  { id: 'instagram',number: 3, title: 'Instagram: 5-Slide Carousel',    desc: 'The Instagram tab shows a 5-slide carousel format — each slide has a title and body text perfect for a swipeable post. Below the slides you\'ll find a ready-made caption and hashtags to copy directly.',                             tip: 'Use Canva or your design tool to build the actual graphic. Just copy the slide text into your template.' },
  { id: 'twitter',  number: 4, title: 'X/Twitter: Threaded Tweets',     desc: 'The Twitter tab formats the article as a connected thread — hook tweet, supporting points, and a closing CTA. Each tweet shows a character count to confirm it\'s under 280 chars. Copy individual tweets or the full thread at once.', tip: 'A thread gets 3–5× more reach than a single tweet. Always end with a strong CTA or question.' },
  { id: 'linkedin', number: 5, title: 'LinkedIn & Facebook Posts',       desc: 'The LinkedIn tab gives you a long-form professional post with paragraph breaks and hashtags. The Facebook tab is conversational in tone. Both are copy-ready — just paste into the Scheduler with your target date.',               tip: 'Repurpose one article per week across all 4 platforms to maintain a consistent posting schedule without writing from scratch.' },
];

function UrPasteIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔗 URL Repurposer</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Article or Blog URL</div>
        <div style={{ background: '#1e293b', border: '1.5px solid #6366f1', borderRadius: 7, padding: '6px 8px', fontSize: 8, color: '#94a3b8', marginBottom: 8 }}>
          https://yourblog.com/social-media-tips
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
          {[{color:'#E1306C',label:'Instagram'},{color:'#000',label:'X'},{color:'#0A66C2',label:'LinkedIn'},{color:'#1877F2',label:'Facebook'}].map(p => (
            <span key={p.label} style={{ padding: '2px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, color: p.color, background: p.color+'14', border: `1px solid ${p.color}40` }}>{p.label}</span>
          ))}
        </div>
        <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 7, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✨ Repurpose</span>
        </div>
      </div>
    </div>
  );
}

function UrGenerateIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>⏳ Generating…</span></div>
      <div style={{ padding: '20px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>✨</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>Reading article…</div>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155', marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Article extracted:</div>
          <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.5 }}>"5 proven strategies for growing your social media following in 2026 without spending on ads…"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', opacity: 0.3 + i * 0.3 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UrInstagramIllustration() {
  const slides = ['Hook: Why 95% of brands fail on Instagram', 'Slide 2: Consistency beats perfection', 'Slide 3: Use carousels for 3× reach', 'Slide 4: Reply to every comment', 'Slide 5: CTA → Follow for more tips'];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📸 Instagram Carousel</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, marginBottom: 6 }}>
          {slides.map((s, i) => (
            <div key={i} style={{ minWidth: 70, background: i === 0 ? '#be185d' : '#1e293b', border: `1px solid ${i === 0 ? '#be185d' : '#334155'}`, borderRadius: 7, padding: '6px 6px', flexShrink: 0 }}>
              <div style={{ fontSize: 7, fontWeight: 800, color: i === 0 ? '#fdf2f8' : '#E1306C', marginBottom: 2 }}>SLIDE {i+1}</div>
              <div style={{ fontSize: 7, color: i === 0 ? '#fce7f3' : '#94a3b8', lineHeight: 1.3 }}>{s.replace(/Slide \d: /,'')}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '6px 8px' }}>
          <div style={{ fontSize: 7, color: '#be185d', fontWeight: 700, marginBottom: 2 }}>Caption + Hashtags</div>
          <div style={{ fontSize: 7, color: '#94a3b8' }}>Save this for later! 5 Instagram growth secrets… #socialmedia #growth</div>
        </div>
      </div>
    </div>
  );
}

function UrTwitterIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>✖ X Thread</span></div>
      <div style={{ padding: '8px' }}>
        {[
          { n:1, text: 'Thread: 5 strategies to grow on social media without paid ads 🧵', chars: 72 },
          { n:2, text: '1/ Consistency > perfection. Post 5× per week minimum.', chars: 55 },
          { n:3, text: '2/ Carousels get 3× more reach on Instagram than single images.', chars: 64 },
        ].map(t => (
          <div key={t.n} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '7px 8px', marginBottom: 5, display: 'flex', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{t.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 2 }}>{t.text}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 7, color: '#475569' }}>{t.chars}/280</span>
                <span style={{ fontSize: 7, color: '#6366f1', fontWeight: 700 }}>Copy</span>
              </div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 8, color: '#6366f1', fontWeight: 700, textAlign: 'right' }}>Copy full thread →</div>
      </div>
    </div>
  );
}

function UrLinkedInIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>💼 LinkedIn + 📘 Facebook</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: '#0A66C2', color: '#fff' }}>LinkedIn</span>
          <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}>Facebook</span>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155', marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: '#e2e8f0', lineHeight: 1.6 }}>Most brands struggle with social media because they confuse activity with strategy...</div>
          <div style={{ fontSize: 8, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>Here are 5 evidence-based approaches that consistently drive engagement growth...</div>
          <div style={{ marginTop: 6, fontSize: 8, color: '#0A66C2' }}>#SocialMediaStrategy #GrowthHacking #ContentMarketing</div>
        </div>
        <div style={{ background: '#0A66C2', borderRadius: 7, padding: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Copy LinkedIn Post</span>
        </div>
      </div>
    </div>
  );
}

const URL_ILLUSTRATIONS = { paste: UrPasteIllustration, generate: UrGenerateIllustration, instagram: UrInstagramIllustration, twitter: UrTwitterIllustration, linkedin: UrLinkedInIllustration };

export function UrlRepurposerTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = URL_STEPS[activeStep];
  const Illustration = URL_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="URL Repurposer" icon="🔗" title="How to Use the URL Repurposer" subtitle="Turn any blog post or article into Instagram carousel, Twitter thread, LinkedIn post, and Facebook post — in one click." steps={URL_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#6366f1" />;
}

/* ══════════════════════════════════════════════════════════════
   AI WORKSPACE TUTORIAL
══════════════════════════════════════════════════════════════ */

const AIWS_STEPS = [
  { id: 'agents',   number: 1, title: 'Create Your AI Team',            desc: 'Go to Settings → AI Workspace. Click "+ Add AI Agent" and choose a role: Strategist (plans post times & topics), Writer (drafts captions), or Analyst (performance insights). Give your agent a name and emoji avatar.',               tip: 'Start with one Strategist agent to get weekly post-time suggestions automatically.' },
  { id: 'roles',    number: 2, title: 'Understand Each Role',           desc: 'Strategist agents analyse your engagement data and suggest 3 optimal post times and topics each week. Writer agents draft captions for your scheduled posts. Analyst agents generate 7-day performance summaries with actionable insights.', tip: 'You can have multiple agents of different roles running simultaneously.' },
  { id: 'run',      number: 3, title: 'Trigger Your Agents',            desc: 'Agents run automatically every day at 9AM UTC. To test immediately, click the ▶ Run Agents button. Each active agent generates a task and places it in the Approval Queue for your review.',                                             tip: 'Use the toggle on each agent card to pause or resume that agent without deleting it.' },
  { id: 'approve',  number: 4, title: 'Approve Tasks → Take Action',   desc: 'Open the Task Queue tab. Each pending task shows the agent name, task type, and AI output. Click ✅ Approve to apply the action: Strategist tasks create real scheduled posts in your Content Calendar. Writer tasks apply the draft caption to the linked post.', tip: 'Clicking Reject simply marks the task as rejected — no changes are made. Use this when the AI suggestion doesn\'t fit your brand.' },
  { id: 'history',  number: 5, title: 'Review Task History',           desc: 'The History tab shows all approved and rejected tasks with timestamps. Use this as an audit log to track what your AI team has done and spot patterns in the suggestions over time.',                                                       tip: 'Approved Strategist tasks automatically create SCHEDULED posts — check your Content Calendar after approving.' },
];

function WAgentsIllustration() {
  const agents = [
    { name: 'Max', role: 'STRATEGIST', emoji: '🧠', active: true  },
    { name: 'Luna', role: 'WRITER',    emoji: '✍️', active: true  },
    { name: 'Rex', role: 'ANALYST',    emoji: '📊', active: false },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🤖 AI Workspace</span></div>
      <div style={{ padding: '8px' }}>
        {agents.map(a => (
          <div key={a.name} style={{ background: '#1e293b', border: `1px solid ${a.active ? '#6366f1' : '#334155'}`, borderRadius: 8, padding: '7px 8px', marginBottom: 5, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>{a.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f1f5f9' }}>{a.name}</div>
              <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 10, background: '#6366f122', color: '#818cf8', fontWeight: 700 }}>{a.role}</span>
            </div>
            <div style={{ width: 24, height: 14, borderRadius: 7, background: a.active ? '#6366f1' : '#334155', position: 'relative' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, [a.active ? 'right' : 'left']: 2 }} />
            </div>
          </div>
        ))}
        <div style={{ background: '#1e293b', border: '1px dashed #334155', borderRadius: 8, padding: '7px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>+ Add AI Agent</span>
        </div>
      </div>
    </div>
  );
}

function WRolesIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🎭 Agent Roles</span></div>
      <div style={{ padding: '8px' }}>
        {[
          { emoji: '🧠', role: 'STRATEGIST', desc: 'Post times + topics', color: '#f59e0b' },
          { emoji: '✍️', role: 'WRITER',     desc: 'Caption drafts',       color: '#22c55e' },
          { emoji: '📊', role: 'ANALYST',    desc: 'Performance insights', color: '#6366f1' },
        ].map(r => (
          <div key={r.role} style={{ background: '#1e293b', border: `1px solid ${r.color}44`, borderRadius: 8, padding: '8px', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 14 }}>{r.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: r.color }}>{r.role}</span>
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8' }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WRunIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>▶ Run Agents</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ background: '#6366f1', borderRadius: 8, padding: '8px', textAlign: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>▶ Run Agents Now</span>
        </div>
        {[
          { name: 'Max (Strategist)', status: '✅ Task created',   color: '#22c55e' },
          { name: 'Luna (Writer)',    status: '✅ Task created',   color: '#22c55e' },
          { name: 'Rex (Analyst)',    status: '⏸ Paused',          color: '#64748b' },
        ].map(a => (
          <div key={a.name} style={{ background: '#1e293b', borderRadius: 7, padding: '6px 8px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
            <span style={{ fontSize: 8, color: '#94a3b8' }}>{a.name}</span>
            <span style={{ fontSize: 8, color: a.color, fontWeight: 700 }}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WApproveIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📋 Task Queue</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', border: '1.5px solid #f59e0b', borderRadius: 8, padding: '8px', marginBottom: 6 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>🧠</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#f1f5f9' }}>Max · Post Strategy</div>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>Mon 9AM, Wed 12:30PM, Fri 6PM</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, background: '#166534', borderRadius: 6, padding: '5px', textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: '#4ade80', fontWeight: 700 }}>✅ Approve → Schedule</span>
            </div>
            <div style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '5px', textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: '#64748b', fontWeight: 700 }}>❌ Reject</span>
            </div>
          </div>
        </div>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 7, padding: '6px 8px' }}>
          <div style={{ fontSize: 8, color: '#4ade80', fontWeight: 700 }}>✓ 3 posts scheduled to Calendar!</div>
        </div>
      </div>
    </div>
  );
}

function WHistoryIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📜 Task History</span></div>
      <div style={{ padding: '8px' }}>
        {[
          { agent: '🧠 Max', type: 'Post Strategy', status: 'APPROVED', color: '#22c55e', date: 'Apr 14' },
          { agent: '✍️ Luna', type: 'Caption Draft', status: 'APPROVED', color: '#22c55e', date: 'Apr 14' },
          { agent: '🧠 Max', type: 'Post Strategy', status: 'REJECTED', color: '#ef4444', date: 'Apr 13' },
          { agent: '📊 Rex', type: 'Performance',   status: 'APPROVED', color: '#22c55e', date: 'Apr 13' },
        ].map((t, i) => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '5px 8px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#e2e8f0' }}>{t.agent}</div>
              <div style={{ fontSize: 7, color: '#64748b' }}>{t.type}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: t.color }}>{t.status}</div>
              <div style={{ fontSize: 7, color: '#475569' }}>{t.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AIWS_ILLUSTRATIONS = { agents: WAgentsIllustration, roles: WRolesIllustration, run: WRunIllustration, approve: WApproveIllustration, history: WHistoryIllustration };

export function AiWorkspaceTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = AIWS_STEPS[activeStep];
  const Illustration = AIWS_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="AI Workspace" icon="🤖" title="How to Use the AI Workspace" subtitle="Build a virtual AI team that generates post strategies, drafts captions, and surfaces performance insights daily — for your approval." steps={AIWS_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#6366f1" />;
}

/* ══════════════════════════════════════════════════════════════
   SELF-HEALING CONTENT TUTORIAL
══════════════════════════════════════════════════════════════ */

const HEAL_STEPS = [
  { id: 'enable',   number: 1, title: 'Enable Self-Healing',            desc: 'Go to Social HQ → Self-Healing. Toggle "Enable Self-Healing Content" on. Set your thresholds: the minimum likes and engagement rate a post must reach within 3 hours of publishing before the AI intervenes.',                            tip: 'Default thresholds: fewer than 5 likes OR less than 1% engagement rate triggers a heal action.' },
  { id: 'detect',   number: 2, title: 'Automatic Low-Engagement Detection', desc: 'The system scans all posts published 3–12 hours ago every 3 hours. If a post falls below your thresholds and hasn\'t been healed yet, it\'s flagged automatically. No manual monitoring required.',                                tip: 'Only posts with a platform post ID (successfully published) can be healed.' },
  { id: 'action',   number: 3, title: 'Two Healing Actions',            desc: 'For platforms that support caption editing (Instagram, Facebook, LinkedIn) the AI rewrites the caption with a stronger hook. For all platforms including X and TikTok, the AI posts a compelling "boost comment" as the first reply to re-surface the post.', tip: 'Caption edits are invisible to readers. Boost comments look organic and restart engagement.' },
  { id: 'log',      number: 4, title: 'Review the Heal History',        desc: 'The Heal History table shows every intervention: date, platform, original caption, new caption or boost comment text, likes at the time of detection, and whether the action succeeded.',                                                   tip: 'Each post is only healed once — the system tracks healed posts to avoid spamming.' },
  { id: 'manual',   number: 5, title: 'Manual Trigger',                 desc: 'Want to test Self-Healing without waiting? Enter a Social Post ID in the Manual Trigger box and click Heal Now. The AI immediately generates and applies a boost comment or caption edit for that specific post.',                           tip: 'Use the post ID from the Content Calendar or Social Posts page to find specific posts to test.' },
];

function HEnableIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🩺 Self-Healing</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ background: '#1e293b', border: '1.5px solid #22c55e', borderRadius: 8, padding: '10px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f1f5f9' }}>Self-Healing Content</span>
            <div style={{ width: 30, height: 16, borderRadius: 8, background: '#22c55e', position: 'relative' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, right: 2 }} />
            </div>
          </div>
          {[{label:'Min Likes',val:'5'},{label:'Min Engagement',val:'1%'}].map(f => (
            <div key={f.label} style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 7, color: '#64748b', marginBottom: 2 }}>{f.label}</div>
              <div style={{ background: '#0f172a', borderRadius: 5, padding: '4px 7px', border: '1px solid #334155', fontSize: 9, color: '#94a3b8' }}>{f.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 7, padding: '6px 8px' }}>
          <div style={{ fontSize: 8, color: '#4ade80' }}>✓ Active — monitoring your posts every 3 hours</div>
        </div>
      </div>
    </div>
  );
}

function HDetectIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔍 Monitoring</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>Posts checked (last 3h scan):</div>
        {[
          { platform: 'instagram', title: 'Motivation Monday',  likes: 12, ok: true  },
          { platform: 'linkedin',  title: 'Behind the Scenes', likes: 2,  ok: false },
          { platform: 'facebook',  title: 'Weekend Tips',      likes: 8,  ok: true  },
        ].map((p, i) => (
          <div key={i} style={{ background: '#1e293b', border: `1px solid ${p.ok ? '#334155' : '#ef444444'}`, borderRadius: 7, padding: '6px 8px', marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
            <PlatLogo id={p.platform} size={14} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: '#e2e8f0' }}>{p.title}</div>
              <div style={{ fontSize: 7, color: p.ok ? '#64748b' : '#ef4444' }}>❤️ {p.likes} likes</div>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: p.ok ? '#22c55e' : '#f87171' }}>{p.ok ? '✓ OK' : '⚠ Low'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HActionIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>⚡ Healing Action</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #ef4444', borderRadius: 8, padding: '7px', marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: '#ef4444', fontWeight: 700, marginBottom: 2 }}>Low engagement detected</div>
          <div style={{ fontSize: 8, color: '#94a3b8' }}>Behind the Scenes — 2 likes in 3h</div>
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Healing actions:</div>
        {[
          { action: '✏️ Caption Edit', desc: 'Rewrites with stronger hook', platform: 'LinkedIn', color: '#0A66C2' },
          { action: '💬 Boost Comment', desc: 'Compelling first reply', platform: 'X / TikTok', color: '#6366f1' },
        ].map((a, i) => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '6px 8px', marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: a.color, marginBottom: 1 }}>{a.action}</div>
            <div style={{ fontSize: 7, color: '#64748b' }}>{a.desc} · {a.platform}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HLogIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📋 Heal History</span></div>
      <div style={{ padding: '8px' }}>
        {[
          { platform: 'instagram', action: 'CAPTION_EDIT',    likes: 2,  success: true  },
          { platform: 'x',         action: 'BOOST_COMMENT',   likes: 1,  success: true  },
          { platform: 'linkedin',  action: 'CAPTION_EDIT',    likes: 3,  success: false },
        ].map((h, i) => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '6px 8px', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlatLogo id={h.platform} size={14} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#e2e8f0' }}>{h.action}</div>
                <div style={{ fontSize: 7, color: '#64748b' }}>Before: {h.likes} likes</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color: h.success ? '#22c55e' : '#ef4444' }}>{h.success ? '✓' : '✗'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HManualIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔧 Manual Trigger</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4 }}>Social Post ID</div>
        <div style={{ background: '#1e293b', border: '1.5px solid #f59e0b', borderRadius: 7, padding: '6px 8px', fontSize: 9, color: '#fbbf24', marginBottom: 8, fontFamily: 'monospace' }}>42</div>
        <div style={{ background: '#f59e0b', borderRadius: 7, padding: '7px', textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>🩺 Heal Now</span>
        </div>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 7, padding: '6px 8px' }}>
          <div style={{ fontSize: 8, color: '#4ade80', fontWeight: 700, marginBottom: 2 }}>✓ Boost comment posted!</div>
          <div style={{ fontSize: 7, color: '#86efac' }}>"This is a reminder to check out our latest tips — what\'s been most useful for your brand?"</div>
        </div>
      </div>
    </div>
  );
}

const HEAL_ILLUSTRATIONS = { enable: HEnableIllustration, detect: HDetectIllustration, action: HActionIllustration, log: HLogIllustration, manual: HManualIllustration };

export function SelfHealingTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = HEAL_STEPS[activeStep];
  const Illustration = HEAL_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="Self-Healing" icon="🩺" title="How to Use Self-Healing Content" subtitle="Automatically rescue low-performing posts with AI-rewritten captions or a compelling boost comment — without any manual work." steps={HEAL_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#f59e0b" />;
}

/* ══════════════════════════════════════════════════════════════
   BRAND GUARDIAN TUTORIAL
══════════════════════════════════════════════════════════════ */

const BG_STEPS = [
  { id: 'keywords', number: 1, title: 'Add Brand Keywords to Track',    desc: 'Go to Settings → Brand Guardian. Type your brand name, product names, or competitor names in the keyword box and click + Add Keyword. You can track up to 10 keywords. The system scans Reddit and X/Twitter for public mentions of each.',  tip: 'Add your brand name, product name, founder name, and one or two competitor names to get comprehensive coverage.' },
  { id: 'scan',     number: 2, title: 'Run Your First Scan',            desc: 'Click "Scan Now" to immediately fetch the latest mentions. The scanner checks Reddit\'s search API and your connected X/Twitter account for recent posts mentioning your tracked keywords. New mentions appear in the feed below.',           tip: 'Scans run automatically every 2 hours in the background. Use Scan Now to get results immediately.' },
  { id: 'sentiment',number: 3, title: 'Review Mentions by Sentiment',   desc: 'Each mention is classified as Positive 🟢, Neutral 🟡, or Negative 🔴 by AI. Use the filter pills (All / Positive / Neutral / Negative) to focus on what matters most. Negative mentions are highlighted with a red alert badge.',          tip: 'Check the Negative filter first thing each morning — these are the conversations that need your attention fastest.' },
  { id: 'respond',  number: 4, title: 'Draft an AI Response',           desc: 'Click "Draft Response" on any mention. The AI reads the mention context and your brand voice from your Brand Kit, then writes a contextual, professional reply ready to copy-paste. The draft respects your brand\'s tone and key phrases.',   tip: 'Always personalise the AI draft slightly before posting — it makes the response feel more human.' },
  { id: 'alerts',   number: 5, title: 'Stay on Top of Alerts',          desc: 'The Brand Guardian NavItem shows an unread alert count badge for new negative mentions. Click "Mark as Read" on each alert to clear the badge. Use this to stay on top of reputation issues without manually checking every day.',          tip: 'Set up a daily habit: check Brand Guardian first thing each morning and respond to any overnight negatives.' },
];

function BgKeywordsIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🛡 Brand Guardian</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <div style={{ flex: 1, background: '#1e293b', border: '1.5px solid #6366f1', borderRadius: 7, padding: '5px 8px', fontSize: 9, color: '#94a3b8' }}>WintAI</div>
          <div style={{ background: '#6366f1', borderRadius: 7, padding: '5px 10px', fontSize: 9, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>+ Add</div>
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 5 }}>Tracked Keywords (3/10):</div>
        {['WintAI', 'wintaibot', 'WintKay'].map((k, i) => (
          <div key={k} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '5px 8px', marginBottom: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: '#e2e8f0', fontWeight: 700 }}>{k}</span>
            <span style={{ fontSize: 8, color: '#ef4444', cursor: 'pointer' }}>✕</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BgScanIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔍 Scanning…</span></div>
      <div style={{ padding: '10px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🛡</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#a5b4fc', marginBottom: 6 }}>Scanning Reddit + X…</div>
        {['Reddit /r/socialmedia', 'Reddit /r/marketing', 'X/Twitter search'].map((s, i) => (
          <div key={s} style={{ background: '#1e293b', borderRadius: 6, padding: '4px 8px', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 8, color: '#94a3b8' }}>{s}</span>
            <span style={{ fontSize: 8, color: i < 2 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{i < 2 ? '✓ Done' : '⏳'}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 8, color: '#64748b' }}>Found 7 new mentions</div>
      </div>
    </div>
  );
}

function BgSentimentIllustration() {
  const mentions = [
    { user: 'u/devmarketer', text: 'WintAI just saved me 3 hours of work!', sentiment: 'POSITIVE', color: '#22c55e', icon: '🟢', platform: 'reddit' },
    { user: '@socialpro',    text: 'Has anyone tried WintAI for scheduling?', sentiment: 'NEUTRAL',  color: '#f59e0b', icon: '🟡', platform: 'x'      },
    { user: 'u/frustrated',  text: 'WintAI kept crashing on my exports', sentiment: 'NEGATIVE', color: '#ef4444', icon: '🔴', platform: 'reddit' },
  ];
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>📡 Mentions Feed</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          {['All','🟢','🟡','🔴'].map((f, i) => (
            <span key={f} style={{ padding: '2px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: i === 0 ? '#6366f1' : '#1e293b', color: i === 0 ? '#fff' : '#64748b', border: i === 0 ? 'none' : '1px solid #334155' }}>{f}</span>
          ))}
        </div>
        {mentions.map((m, i) => (
          <div key={i} style={{ background: '#1e293b', border: `1px solid ${m.color}44`, borderRadius: 7, padding: '6px 8px', marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 10 }}>{m.icon}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#e2e8f0' }}>{m.user}</span>
              <span style={{ fontSize: 7, color: '#475569', marginLeft: 'auto' }}>{m.platform}</span>
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.4 }}>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BgRespondIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>✍️ Draft Response</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', border: '1px solid #ef444444', borderRadius: 8, padding: '6px 8px', marginBottom: 6 }}>
          <div style={{ fontSize: 7, color: '#ef4444', marginBottom: 2 }}>🔴 Negative mention · u/frustrated</div>
          <div style={{ fontSize: 8, color: '#94a3b8' }}>"WintAI kept crashing on my exports"</div>
        </div>
        <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 8, padding: '8px', marginBottom: 6 }}>
          <div style={{ fontSize: 7, color: '#86efac', fontWeight: 700, marginBottom: 3 }}>🤖 AI Draft Response:</div>
          <div style={{ fontSize: 8, color: '#4ade80', lineHeight: 1.5 }}>"Hi! We\'re sorry to hear about the export issue. Could you DM us your account email? We\'ll investigate and get this fixed for you ASAP!"</div>
        </div>
        <div style={{ background: '#6366f1', borderRadius: 7, padding: '6px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Copy Response</span>
        </div>
      </div>
    </div>
  );
}

function BgAlertsIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔔 Alert Badge</span></div>
      <div style={{ padding: '10px 8px' }}>
        <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px', border: '1px solid #334155', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🛡</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>Brand Guardian</span>
            <div style={{ background: '#ef4444', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>3</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 8, color: '#64748b', marginBottom: 5 }}>3 unread negative alerts:</div>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#1e293b', border: '1px solid #ef444433', borderRadius: 6, padding: '5px 8px', marginBottom: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: '#94a3b8' }}>🔴 Negative · Reddit · {i}h ago</span>
            <span style={{ fontSize: 7, color: '#6366f1', fontWeight: 700 }}>Read</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BG_ILLUSTRATIONS = { keywords: BgKeywordsIllustration, scan: BgScanIllustration, sentiment: BgSentimentIllustration, respond: BgRespondIllustration, alerts: BgAlertsIllustration };

export function BrandGuardianTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = BG_STEPS[activeStep];
  const Illustration = BG_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="Brand Guardian" icon="🛡" title="How to Use Brand Guardian" subtitle="Monitor Reddit and X/Twitter for every mention of your brand — get alerted on negative sentiment and respond instantly with AI-drafted replies." steps={BG_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#ef4444" />;
}

/* ══════════════════════════════════════════════════════════════
   ASSET LIBRARY TUTORIAL
══════════════════════════════════════════════════════════════ */

const AL_STEPS = [
  { id: 'upload',  number: 1, title: 'Upload Brand Assets',             desc: 'Go to Digital Vault → Asset Library. Drag and drop images onto the upload area, or click to select files. Supported: JPG, PNG, GIF, WEBP, SVG. After upload, the AI automatically analyses each image and generates a description and 10 tags.', tip: 'Upload your brand photos, product shots, logos, team photos, and lifestyle imagery here — build your brand\'s visual library.' },
  { id: 'ai',      number: 2, title: 'AI Automatically Tags Everything', desc: 'You don\'t need to tag anything manually. GPT-4o Vision reads each image and generates: a 2–3 sentence description (objects, setting, colors, mood) and 10 searchable tags. These are stored and used to power the search engine.',        tip: 'The AI descriptions are stored privately — they\'re only used for search. They are never shown to your audience.' },
  { id: 'search',  number: 3, title: 'Search by Content, Color, or Mood', desc: 'Use the search bar at the top to find images using natural language. Type "office photo", "product on white background", "team outdoors", "blue tones", or "professional headshot" — the AI will surface matching assets instantly.',      tip: 'You can search by emotion too: "warm and friendly" or "clean and minimal" will find matching images.' },
  { id: 'preview', number: 4, title: 'Preview and Copy Asset URL',       desc: 'Click any image thumbnail to open the side panel. See the large preview, AI description, all tags as chips, and a copy URL button. The URL is a secure 24-hour link to the file — use it in your social posts, captions, or campaigns.',      tip: 'Presigned URLs expire after 24 hours for security. Regenerate by reopening the asset panel.' },
  { id: 'delete',  number: 5, title: 'Manage and Clean Up',              desc: 'Click the trash icon on any asset to permanently delete it from both the library and your cloud storage. Use the search bar to find and audit specific groups of assets — search "old logo" to find and remove outdated brand materials.',       tip: 'Keep your library clean by deleting unused assets — this speeds up search and reduces clutter.' },
];

function AlUploadIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🗂 Asset Library</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ border: '2px dashed #334155', borderRadius: 10, padding: '14px 8px', textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🖼️</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginBottom: 2 }}>Drop images here</div>
          <div style={{ fontSize: 8, color: '#475569' }}>JPG · PNG · GIF · WEBP · SVG</div>
          <div style={{ marginTop: 6, background: '#6366f1', borderRadius: 6, padding: '4px 12px', display: 'inline-block' }}>
            <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>Browse Files</span>
          </div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, background: '#334155', borderRadius: 5 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: '#e2e8f0' }}>product-hero.jpg</div>
              <div style={{ fontSize: 7, color: '#64748b' }}>🤖 AI analysing…</div>
            </div>
            <div style={{ width: 24, height: 4, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: '#6366f1' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlAiIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🤖 AI Analysis</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '8px', border: '1px solid #6366f1', marginBottom: 6 }}>
          <div style={{ fontSize: 7, color: '#818cf8', fontWeight: 700, marginBottom: 3 }}>AI Description</div>
          <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.5 }}>A professional product shot of a white coffee mug on a light wooden table. Warm natural lighting, minimal setting, lifestyle photography style.</div>
        </div>
        <div style={{ fontSize: 7, color: '#64748b', marginBottom: 4 }}>AI Tags (10):</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {['coffee','product','white','minimal','lifestyle','warm','wooden','studio','clean','beverage'].map(tag => (
            <span key={tag} style={{ padding: '1px 6px', background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: 20, fontSize: 7, color: '#93c5fd' }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlSearchIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🔍 Smart Search</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', border: '1.5px solid #6366f1', borderRadius: 7, padding: '6px 8px', fontSize: 8, color: '#a5b4fc', marginBottom: 8 }}>🔍 product on white background</div>
        <div style={{ fontSize: 7, color: '#64748b', marginBottom: 5 }}>4 results found:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {['#e2e8f0','#f8fafc','#fff','#f1f5f9'].map((bg, i) => (
            <div key={i} style={{ height: 40, background: bg, borderRadius: 6, border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>📦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlPreviewIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🖼️ Asset Preview</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ height: 60, background: '#e2e8f0', borderRadius: 8, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24 }}>📦</span>
        </div>
        <div style={{ fontSize: 8, color: '#e2e8f0', fontWeight: 700, marginBottom: 3 }}>product-hero.jpg</div>
        <div style={{ fontSize: 7, color: '#64748b', marginBottom: 5 }}>2.1 MB · PNG · 1200×800</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 6 }}>
          {['product','white','minimal','clean'].map(t => (
            <span key={t} style={{ padding: '1px 5px', background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: 20, fontSize: 7, color: '#93c5fd' }}>{t}</span>
          ))}
        </div>
        <div style={{ background: '#6366f1', borderRadius: 6, padding: '5px', textAlign: 'center' }}>
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>🔗 Copy URL</span>
        </div>
      </div>
    </div>
  );
}

function AlDeleteIllustration() {
  return (
    <div style={ill.phone}>
      <div style={ill.phoneHeader}><span style={{ fontSize: 10, color: '#94a3b8' }}>🗑 Manage Assets</span></div>
      <div style={{ padding: '8px' }}>
        <div style={{ background: '#1e293b', border: '1.5px solid #94a3b8', borderRadius: 7, padding: '5px 8px', fontSize: 8, color: '#94a3b8', marginBottom: 6 }}>🔍 old logo</div>
        <div style={{ fontSize: 7, color: '#64748b', marginBottom: 5 }}>2 results:</div>
        {['logo-v1-2023.png', 'logo-draft-old.svg'].map((f, i) => (
          <div key={f} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 7, padding: '5px 8px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, background: '#334155', borderRadius: 4, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: '#94a3b8', flex: 1 }}>{f}</span>
            <span style={{ fontSize: 10, color: '#ef4444', cursor: 'pointer' }}>🗑</span>
          </div>
        ))}
        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: 7, padding: '6px 8px', marginTop: 4 }}>
          <div style={{ fontSize: 8, color: '#fca5a5' }}>Delete removes the file from storage permanently.</div>
        </div>
      </div>
    </div>
  );
}

const AL_ILLUSTRATIONS = { upload: AlUploadIllustration, ai: AlAiIllustration, search: AlSearchIllustration, preview: AlPreviewIllustration, delete: AlDeleteIllustration };

export function AssetLibraryTutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const step = AL_STEPS[activeStep];
  const Illustration = AL_ILLUSTRATIONS[step.id];
  return <TutorialLayout badge="Asset Library" icon="🗂" title="How to Use the Asset Library" subtitle="Upload your brand images once — the AI tags everything automatically so you can find any asset instantly with natural language search." steps={AL_STEPS} activeStep={activeStep} setActiveStep={setActiveStep} step={step} Illustration={Illustration} accentColor="#3b82f6" />;
}

/* ══════════════════════════════════════════════════════════════
   SHARED TUTORIAL LAYOUT
══════════════════════════════════════════════════════════════ */

function TutorialLayout({ badge, icon, title, subtitle, steps, activeStep, setActiveStep, step, Illustration, accentColor }) {
  return (
    <section style={st.section}>
      <div style={st.container}>
        {/* Header */}
        <div style={st.header}>
          <span style={{ ...st.badge, background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44` }}>
            {icon} {badge}
          </span>
          <h2 style={st.title}>{title}</h2>
          <p style={st.subtitle}>{subtitle}</p>
        </div>

        {/* Body */}
        <div style={st.body}>
          {/* Step list */}
          <div style={st.stepList}>
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                style={{
                  ...st.stepBtn,
                  ...(i === activeStep ? { ...st.stepBtnActive, borderLeftColor: accentColor } : {}),
                }}
              >
                <div style={{
                  ...st.stepNum,
                  background: i === activeStep ? accentColor : '#1e293b',
                  color: i === activeStep ? '#fff' : '#64748b',
                }}>
                  {i < activeStep ? '✓' : s.number}
                </div>
                <div style={st.stepText}>
                  <div style={{ ...st.stepTitle, color: i === activeStep ? '#f8fafc' : '#94a3b8' }}>{s.title}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Right panel */}
          <div style={st.rightPanel}>
            <div style={st.illustBox}>
              <Illustration />
            </div>
            <div style={st.descBox}>
              <div style={st.stepHeader}>
                <span style={{ ...st.stepNumLarge, background: accentColor }}>{step.number}</span>
                <h3 style={st.stepTitleLarge}>{step.title}</h3>
              </div>
              <p style={st.stepDesc}>{step.desc}</p>
              <div style={st.tip}>
                <span style={{ color: accentColor, fontSize: 16 }}>💡</span>
                <span style={st.tipText}><strong>Tip:</strong> {step.tip}</span>
              </div>
              <div style={st.navRow}>
                <button style={st.navBtn} onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}>← Previous</button>
                <span style={{ fontSize: 13, color: '#64748b' }}>{activeStep + 1} / {steps.length}</span>
                <button style={{ ...st.navBtn, ...st.navBtnNext, background: accentColor }} onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} disabled={activeStep === steps.length - 1}>Next →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const st = {
  section: { background: '#0f172a', padding: '64px 20px', fontFamily: "'Inter',-apple-system,sans-serif" },
  container: { maxWidth: 900, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 40 },
  badge: { display: 'inline-block', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 16 },
  title: { fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#f8fafc', margin: '0 0 14px', lineHeight: 1.2 },
  subtitle: { fontSize: 15, color: '#94a3b8', maxWidth: 560, margin: '0 auto', lineHeight: 1.65 },
  body: { display: 'flex', gap: 28, flexWrap: 'wrap' },
  stepList: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 190, flex: '0 0 190px' },
  stepBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 10,
    background: 'transparent', border: '1px solid #1e293b',
    borderLeft: '3px solid transparent',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
    width: '100%',
  },
  stepBtnActive: { background: '#1e293b', borderColor: '#334155' },
  stepNum: { width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 12, fontWeight: 600 },
  rightPanel: { flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 },
  illustBox: { display: 'flex', justifyContent: 'center' },
  descBox: { background: '#1e293b', borderRadius: 16, padding: '24px', border: '1px solid #334155' },
  stepHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepNumLarge: { width: 32, height: 32, borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepTitleLarge: { fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: 0 },
  stepDesc: { fontSize: 14, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 16px' },
  tip: { display: 'flex', gap: 10, alignItems: 'flex-start', background: '#0f172a', borderRadius: 10, padding: '12px 14px', marginBottom: 20 },
  tipText: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
  navRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: '8px 18px', borderRadius: 8, border: '1.5px solid #334155', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  navBtnNext: { border: 'none', color: '#fff' },
};
