import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram',  emoji: '📸', color: '#E1306C', logo: 'instagram' },
  { id: 'twitter',   label: 'X / Twitter',emoji: '✖️', color: '#000000', logo: 'x'         },
  { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼', color: '#0A66C2', logo: 'linkedin'  },
  { id: 'facebook',  label: 'Facebook',   emoji: '📘', color: '#1877F2', logo: 'facebook'  },
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

function InstagramResult({ data }) {
  if (!data?.slides) return null;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><PlatformIcon platform={PLATFORMS[0]} size={14} /> INSTAGRAM CAROUSEL — 5 slides</div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {data.slides.map((sl, i) => (
          <div key={i} style={{
            minWidth: 150, maxWidth: 160, background: '#fff',
            border: '1.5px solid #fce7f3', borderRadius: 12, padding: '12px 10px',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#E1306C', marginBottom: 4 }}>SLIDE {i + 1}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{sl.title}</div>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>{sl.body}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: '10px 12px', background: '#fdf2f8', borderRadius: 10, border: '1px solid #fce7f3' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#be185d', marginBottom: 4 }}>Caption</div>
        <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6 }}>{data.caption}</div>
        <div style={{ fontSize: 11, color: '#E1306C', marginTop: 4 }}>{data.hashtags}</div>
        <div style={{ marginTop: 6 }}><CopyBtn text={`${data.caption}\n\n${data.hashtags}`} /></div>
      </div>
    </div>
  );
}

function TwitterResult({ data }) {
  if (!data?.thread) return null;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><PlatformIcon platform={PLATFORMS[1]} size={14} /> X / TWITTER THREAD — {data.thread.length} tweets</div>
      {data.thread.map((tweet, i) => (
        <div key={i} style={{
          display: 'flex', gap: 8, marginBottom: 8, padding: '10px 12px',
          background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6 }}>{tweet}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{tweet.length}/280</span>
              <CopyBtn text={tweet} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 4 }}>
        <CopyBtn text={data.thread.join('\n\n')} />
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>Copy full thread</span>
      </div>
    </div>
  );
}

function LinkedInResult({ data }) {
  if (!data?.post) return null;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><PlatformIcon platform={PLATFORMS[2]} size={14} /> LINKEDIN POST</div>
      <div style={{ padding: '12px 14px', background: '#fff', border: '1.5px solid #e0e7ff', borderRadius: 10 }}>
        <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.post}</div>
        <div style={{ fontSize: 12, color: '#0A66C2', marginTop: 6 }}>{data.hashtags}</div>
        <div style={{ marginTop: 8 }}><CopyBtn text={`${data.post}\n\n${data.hashtags}`} /></div>
      </div>
    </div>
  );
}

function FacebookResult({ data }) {
  if (!data?.post) return null;
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><PlatformIcon platform={PLATFORMS[3]} size={14} /> FACEBOOK POST</div>
      <div style={{ padding: '12px 14px', background: '#fff', border: '1.5px solid #dbeafe', borderRadius: 10 }}>
        <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7 }}>{data.post}</div>
        <div style={{ fontSize: 12, color: '#1877F2', marginTop: 6 }}>{data.hashtags}</div>
        <div style={{ marginTop: 8 }}><CopyBtn text={`${data.post}\n\n${data.hashtags}`} /></div>
      </div>
    </div>
  );
}

export default function UrlRepurposer() {
  const { authHeaders, apiBase } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [activeTab, setActiveTab] = useState('instagram');

  const generate = async () => {
    if (!url.trim()) { setErr('Enter a URL first.'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const res = await fetch(`${base}/api/content/from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to generate content');
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
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
          🔗 URL Repurposer
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Paste any blog post or article URL → AI generates Instagram carousel, Twitter thread, LinkedIn post & Facebook post in your brand voice.
        </p>
      </div>

      {/* Input */}
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Article or Blog URL</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="https://yourblog.com/article-title"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
              color: '#1e293b',
            }}
          />
          <button
            onClick={generate}
            disabled={loading || !url.trim()}
            style={{
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: url.trim() && !loading ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#e2e8f0',
              color: url.trim() && !loading ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: 700,
              cursor: url.trim() && !loading ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '⏳ Generating…' : '✨ Repurpose'}
          </button>
        </div>
        {err && <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626' }}>⚠️ {err}</div>}

        {/* Platform tabs */}
        {!loading && !result && (
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLATFORMS.map(p => (
              <span key={p.id} style={{
                padding: '4px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6,
                background: p.color + '14', border: `1px solid ${p.color}40`,
                fontSize: 11, fontWeight: 700, color: p.color,
              }}>
                <PlatformIcon platform={p} size={13} />
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6366f1' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Reading article & generating content…</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>This takes about 10–15 seconds</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Article preview */}
          {result.articlePreview && (
            <div style={{ ...card, background: '#f8fafc', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>📄 Article extracted from: <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>{result.sourceUrl}</a></div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{result.articlePreview}</div>
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
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: activeTab === p.id ? p.color : '#f1f5f9',
                  color: activeTab === p.id ? '#fff' : '#475569',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                }}
              >
                <PlatformIcon platform={p} size={16} style={{ filter: activeTab === p.id ? 'brightness(0) invert(1)' : 'none' }} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Platform content */}
          <div style={card}>
            {activeTab === 'instagram' && <InstagramResult data={result.instagram} />}
            {activeTab === 'twitter'   && <TwitterResult   data={result.twitter}   />}
            {activeTab === 'linkedin'  && <LinkedInResult  data={result.linkedin}  />}
            {activeTab === 'facebook'  && <FacebookResult  data={result.facebook}  />}
          </div>

          <button
            onClick={() => { setResult(null); setUrl(''); }}
            style={{
              width: '100%', padding: '11px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ↩ Repurpose another article
          </button>
        </>
      )}
    </div>
  );
}
