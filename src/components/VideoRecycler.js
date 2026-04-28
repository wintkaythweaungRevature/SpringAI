import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C' },
  { id: 'twitter',   label: 'X / Twitter', emoji: '✖️', color: '#000' },
  { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼', color: '#0A66C2' },
  { id: 'facebook',  label: 'Facebook',   emoji: '📘', color: '#1877F2' },
  { id: 'tiktok',    label: 'TikTok',     emoji: '🎵', color: '#010101' },
];

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { copyText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      style={{
        padding: '3px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
        background: copied ? '#f0fdf4' : '#fafafa', color: copied ? '#16a34a' : '#475569',
        fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function PlatformResult({ platform, data }) {
  if (!data) return <div style={{ fontSize: 13, color: '#94a3b8', padding: '20px 0', textAlign: 'center' }}>No content for this platform.</div>;

  if (platform === 'instagram') {
    return (
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8 }}>📸 INSTAGRAM CAROUSEL — {data.slides?.length || 0} slides</div>
        {/* Wrap to a second row when slides don't all fit horizontally — old
            layout clipped the last slide(s) without a visible scrollbar. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 8,
          paddingBottom: 6,
        }}>
          {(data.slides || []).map((sl, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1.5px solid #fce7f3', borderRadius: 12, padding: '12px 10px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#E1306C', marginBottom: 4 }}>SLIDE {i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{sl.title}</div>
              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{sl.body}</div>
            </div>
          ))}
        </div>
        {data.caption && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#fdf2f8', borderRadius: 10, border: '1px solid #fce7f3' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#be185d', marginBottom: 4 }}>Caption</div>
            <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6 }}>{data.caption}</div>
            {data.hashtags && <div style={{ fontSize: 11, color: '#E1306C', marginTop: 4 }}>{data.hashtags}</div>}
            <div style={{ marginTop: 6 }}><CopyBtn text={`${data.caption}\n\n${data.hashtags || ''}`} /></div>
          </div>
        )}
      </div>
    );
  }

  if (platform === 'twitter') {
    const thread = data.thread || (data.post ? [data.post] : []);
    return (
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8 }}>✖️ X / TWITTER THREAD — {thread.length} tweets</div>
        {thread.map((tweet, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, padding: '10px 12px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6 }}>{tweet}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{tweet.length}/280</span>
                <CopyBtn text={tweet} />
              </div>
            </div>
          </div>
        ))}
        {thread.length > 1 && <div style={{ marginTop: 4 }}><CopyBtn text={thread.join('\n\n')} /><span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>Copy full thread</span></div>}
      </div>
    );
  }

  const borderColor = platform === 'linkedin' ? '#dbeafe' : platform === 'tiktok' ? '#fef3c7' : '#dbeafe';
  const tagColor = platform === 'linkedin' ? '#0A66C2' : platform === 'tiktok' ? '#010101' : '#1877F2';
  const meta = PLATFORMS.find(p => p.id === platform) || { id: platform, label: platform };
  const label = meta.label || platform;

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <PlatformIcon platform={meta} size={14} />
        {label.toUpperCase()} POST
      </div>
      <div style={{ padding: '12px 14px', background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 10 }}>
        <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.post || data.caption || data.body || ''}</div>
        {data.hashtags && <div style={{ fontSize: 12, color: tagColor, marginTop: 6 }}>{data.hashtags}</div>}
        {data.hook && <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4, fontStyle: 'italic' }}>Hook: {data.hook}</div>}
        <div style={{ marginTop: 8 }}><CopyBtn text={`${data.post || data.caption || ''}\n\n${data.hashtags || ''}`} /></div>
      </div>
    </div>
  );
}

export default function VideoRecycler() {
  const { authHeaders, apiBase } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [activeTab, setActiveTab] = useState('instagram');

  const generate = async () => {
    if (!videoUrl.trim() && !transcript.trim()) {
      setErr('Enter a video URL or paste the transcript.'); return;
    }
    setLoading(true); setErr(''); setResult(null);
    try {
      const res = await fetch(`${base}/api/content/recycle-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ url: videoUrl.trim(), transcript: transcript.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to repurpose video');
      setResult(data);
      setActiveTab('instagram');
    } catch (e) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const card = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '20px', marginBottom: 16 };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          🎬 Video Repurposer
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Paste a YouTube, TikTok or Instagram video URL → AI extracts the content and generates platform-optimized posts in your brand voice.
        </p>
      </div>

      {/* Input card */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Video URL</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="https://www.youtube.com/watch?v=... or TikTok / Instagram link"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
              color: '#1e293b',
            }}
          />
          <button
            onClick={generate}
            disabled={loading || (!videoUrl.trim() && !transcript.trim())}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: (videoUrl.trim() || transcript.trim()) && !loading ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0',
              color: (videoUrl.trim() || transcript.trim()) && !loading ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: 700,
              cursor: (videoUrl.trim() || transcript.trim()) && !loading ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '⏳ Recycling…' : '♻️ Recycle'}
          </button>
        </div>

        {/* Supported platforms */}
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'YouTube', color: '#FF0000' },
            { label: 'TikTok',  color: '#010101' },
            { label: 'Instagram Reels', color: '#E1306C' },
            { label: 'Twitter / X',    color: '#000' },
            { label: 'Vimeo',  color: '#1ab7ea' },
          ].map(p => (
            <span key={p.label} style={{ padding: '3px 10px', borderRadius: 20, background: p.color + '14', border: `1px solid ${p.color}40`, fontSize: 11, fontWeight: 700, color: p.color }}>
              {p.label}
            </span>
          ))}
        </div>

        {/* Transcript toggle */}
        <button
          onClick={() => setShowTranscript(v => !v)}
          style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6366f1', fontWeight: 700, padding: 0 }}
        >
          {showTranscript ? '▲ Hide transcript' : '▼ Or paste video transcript manually (faster & more accurate)'}
        </button>

        {showTranscript && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              Paste the video transcript below. This bypasses URL scraping and gives the AI full context.
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste the video transcript or script here…"
              rows={6}
              style={{
                width: '100%', borderRadius: 10, border: '1.5px solid #e2e8f0',
                padding: '10px 12px', fontSize: 12, resize: 'vertical',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                color: '#1e293b',
              }}
            />
          </div>
        )}

        {err && <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626' }}>⚠️ {err}</div>}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6366f1' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Analyzing video & generating content…</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>This takes 10–20 seconds</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Video info */}
          {(result.videoTitle || result.videoDescription) && (
            <div style={{ ...card, background: '#f8fafc', marginBottom: 16 }}>
              {result.videoTitle && (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  🎬 {result.videoTitle}
                </div>
              )}
              {result.videoDescription && (
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{result.videoDescription.slice(0, 200)}{result.videoDescription.length > 200 ? '…' : ''}</div>
              )}
              {result.transcriptPreview && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>TRANSCRIPT PREVIEW</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.transcriptPreview.slice(0, 300)}{result.transcriptPreview.length > 300 ? '…' : ''}"</div>
                </div>
              )}
              {/* Honest UX nudge: when the backend couldn't get a real transcript
                  (no captions on the video, or YouTube blocked the timedtext fetch),
                  the AI generates from title only — and tends to invent content.
                  Tell the user so they can paste the transcript manually for a much
                  better result. Backend sets hasTranscript=false in that case. */}
              {result.hasTranscript === false && (
                <div style={{
                  marginTop: 8, padding: '10px 12px',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 8, color: '#92400e', fontSize: 12, lineHeight: 1.5,
                }}>
                  ⚠️ <strong>This video has no captions we could fetch.</strong> The AI
                  generated content from the title only — it may invent details that
                  aren't in the actual video. For accurate output, click "Or paste video
                  transcript manually" above and paste the real transcript, then click
                  Recycle again.
                </div>
              )}
            </div>
          )}

          {/* Platform tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: activeTab === p.id ? p.color : '#f1f5f9',
                  color: activeTab === p.id ? '#fff' : '#475569',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                }}
              >
                {/* Real platform logo (Video Publisher pattern). Filter inverts
                    the SVG color when the tab is active so the logo stays visible
                    against the tab's solid colored background. */}
                <PlatformIcon
                  platform={p}
                  size={16}
                  style={{ filter: activeTab === p.id ? 'brightness(0) invert(1)' : 'none' }}
                />
                {p.label}
              </button>
            ))}
          </div>

          {/* Platform content */}
          <div style={card}>
            <PlatformResult platform={activeTab} data={result[activeTab]} />
          </div>

          <button
            onClick={() => { setResult(null); setVideoUrl(''); setTranscript(''); }}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ♻️ Recycle another video
          </button>
        </>
      )}
    </div>
  );
}
