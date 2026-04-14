import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const SOURCE_COLORS = {
  google:  { bg: '#fef3c7', border: '#fde68a', text: '#92400e', label: '📈 Google Trends' },
  reddit:  { bg: '#fff1f0', border: '#fecaca', text: '#991b1b', label: '🔴 Reddit' },
  twitter: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', label: '✖️ X / Twitter' },
  news:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', label: '📰 News' },
  general: { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6', label: '🌐 Trending' },
};

const CATEGORY_FILTERS = ['All', 'Marketing', 'Social Media', 'Business', 'Tech', 'Entertainment'];

function TrendCard({ trend, onGenerate }) {
  const src = SOURCE_COLORS[trend.source] || SOURCE_COLORS.general;

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14,
      padding: '16px', marginBottom: 12,
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          {/* Source badge + category */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: src.bg, border: `1px solid ${src.border}`, color: src.text,
            }}>{src.label}</span>
            {trend.category && (
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                {trend.category}
              </span>
            )}
            {trend.trafficVolume && (
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                🔥 {trend.trafficVolume}
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.4, marginBottom: 6 }}>
            {trend.title}
          </div>

          {/* Description */}
          {trend.description && (
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
              {trend.description}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {trend.url && (
              <a
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}
              >
                Read more ↗
              </a>
            )}
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {trend.fetchedAt ? new Date(trend.fetchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={() => onGenerate(trend)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          ✨ Use Trend
        </button>
      </div>
    </div>
  );
}

function GenerateModal({ trend, onClose, apiBase, authHeaders }) {
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const platforms = [
    { id: 'instagram', label: '📸 Instagram', color: '#E1306C' },
    { id: 'twitter',   label: '✖️ Twitter',   color: '#000' },
    { id: 'linkedin',  label: '💼 LinkedIn',  color: '#0A66C2' },
    { id: 'tiktok',    label: '🎵 TikTok',    color: '#010101' },
  ];

  const generate = async () => {
    setLoading(true); setErr(''); setResult('');
    try {
      const res = await fetch(`${apiBase}/api/trends/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ trendId: trend.id, trendTitle: trend.title, platform }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to generate content');
      setResult(data.content || data.post || '');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard?.writeText(result).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>✨ Generate Trend Content</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Trend: <strong>{trend.title}</strong></div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', padding: 0 }}>×</button>
        </div>

        {/* Platform picker */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => { setPlatform(p.id); setResult(''); }}
              style={{
                padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: platform === p.id ? p.color : '#f1f5f9',
                color: platform === p.id ? '#fff' : '#475569',
                fontSize: 12, fontWeight: 700,
              }}
            >{p.label}</button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none',
            background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: loading ? '#94a3b8' : '#fff', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12,
          }}
        >
          {loading ? '⏳ Generating…' : '✨ Generate Post'}
        </button>

        {err && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>⚠️ {err}</div>}

        {result && (
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result}</div>
            <button
              onClick={copyResult}
              style={{
                marginTop: 10, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                background: copied ? '#f0fdf4' : '#fff', color: copied ? '#16a34a' : '#475569',
                border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700,
              }}
            >{copied ? '✓ Copied!' : '📋 Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrendAlerts() {
  const { authHeaders, apiBase } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [kwLoading, setKwLoading] = useState(false);

  const fetchTrends = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${base}/api/trends/alerts`, { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load trends');
      setTrends(Array.isArray(data) ? data : (data.trends || []));
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [base, authHeaders]);

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/trends/keywords`, { headers: authHeaders() });
      const data = await res.json().catch(() => []);
      if (res.ok) setKeywords(Array.isArray(data) ? data : []);
    } catch {}
  }, [base, authHeaders]);

  useEffect(() => {
    fetchTrends();
    fetchKeywords();
  }, [fetchTrends, fetchKeywords]);

  const addKeyword = async () => {
    if (!keyword.trim()) return;
    setKwLoading(true);
    try {
      const res = await fetch(`${base}/api/trends/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to add keyword');
      setKeywords(prev => [...prev, data]);
      setKeyword('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setKwLoading(false);
    }
  };

  const removeKeyword = async (id) => {
    try {
      await fetch(`${base}/api/trends/keywords/${id}`, { method: 'DELETE', headers: authHeaders() });
      setKeywords(prev => prev.filter(k => k.id !== id));
    } catch {}
  };

  const filteredTrends = category === 'All'
    ? trends
    : trends.filter(t => t.category?.toLowerCase().includes(category.toLowerCase()));

  const card = { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 16 };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            📡 Trend Hijacker
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Real-time trending topics from Google, Reddit & the web — click "Use Trend" to generate content instantly.
          </p>
        </div>
        <button
          onClick={() => fetchTrends(true)}
          disabled={refreshing}
          style={{
            padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#475569', fontSize: 12, fontWeight: 700,
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          {refreshing ? '⏳ Refreshing…' : '🔄 Refresh Trends'}
        </button>
      </div>

      {/* Keyword Tracker */}
      <div style={card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
          🔍 Track Keywords
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>Get notified when these topics trend</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addKeyword()}
            placeholder="e.g. AI marketing, social media trends…"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none', color: '#1e293b' }}
          />
          <button
            onClick={addKeyword}
            disabled={kwLoading || !keyword.trim()}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: keyword.trim() && !kwLoading ? '#6366f1' : '#e2e8f0',
              color: keyword.trim() && !kwLoading ? '#fff' : '#94a3b8',
              fontSize: 12, fontWeight: 700, cursor: keyword.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {kwLoading ? '…' : '+ Track'}
          </button>
        </div>
        {keywords.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {keywords.map(k => (
              <span key={k.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20, background: '#f0f0ff',
                border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 600, color: '#4338ca',
              }}>
                {k.keyword}
                <button
                  onClick={() => removeKeyword(k.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc', fontSize: 14, padding: 0, lineHeight: 1 }}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: category === cat ? '#6366f1' : '#f1f5f9',
              color: category === cat ? '#fff' : '#475569',
              fontSize: 12, fontWeight: 700,
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Trend list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6366f1' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Loading trending topics…</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Scanning Google Trends, Reddit & more</div>
        </div>
      ) : err ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 14, color: '#dc2626', fontWeight: 700 }}>{err}</div>
          <button onClick={() => fetchTrends()} style={{ marginTop: 12, padding: '8px 16px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Retry
          </button>
        </div>
      ) : filteredTrends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌐</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No trends found</div>
          <div style={{ fontSize: 12 }}>Try refreshing or changing the category filter.</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>
            {filteredTrends.length} trending topic{filteredTrends.length !== 1 ? 's' : ''} · Updated {trends[0]?.fetchedAt ? new Date(trends[0].fetchedAt).toLocaleTimeString() : '–'}
          </div>
          {filteredTrends.map((trend, i) => (
            <TrendCard key={trend.id || i} trend={trend} onGenerate={t => setSelectedTrend(t)} />
          ))}
        </div>
      )}

      {/* Generate modal */}
      {selectedTrend && (
        <GenerateModal
          trend={selectedTrend}
          onClose={() => setSelectedTrend(null)}
          apiBase={base}
          authHeaders={authHeaders}
        />
      )}
    </div>
  );
}
