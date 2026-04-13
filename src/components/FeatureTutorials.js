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
