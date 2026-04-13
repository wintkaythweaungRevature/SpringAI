import React, { useState } from 'react';

const CATEGORY_STYLES = {
  Curiosity:    { emoji: '🤔', color: '#7c3aed', bg: '#ede9fe' },
  Challenge:    { emoji: '💪', color: '#d97706', bg: '#fef3c7' },
  Controversy:  { emoji: '🔥', color: '#dc2626', bg: '#fee2e2' },
  Secret:       { emoji: '🤫', color: '#0f766e', bg: '#ccfbf1' },
  POV:          { emoji: '🎬', color: '#1d4ed8', bg: '#dbeafe' },
  List:         { emoji: '📋', color: '#047857', bg: '#d1fae5' },
  'Before/After': { emoji: '✨', color: '#9333ea', bg: '#f3e8ff' },
  Question:     { emoji: '❓', color: '#0369a1', bg: '#e0f2fe' },
  Story:        { emoji: '📖', color: '#b45309', bg: '#fef9c3' },
  Myth:         { emoji: '💡', color: '#4f46e5', bg: '#eef2ff' },
};

/**
 * HookGeneratorPanel
 *
 * Props:
 *   platform  {string}   — platform id e.g. "instagram"
 *   apiBase   {string}   — base API URL
 *   token     {string}   — JWT bearer token
 *   onApply   {function} — called with hook text string when user clicks "Use This"
 */
export default function HookGeneratorPanel({ platform, apiBase, token, onApply }) {
  const [open,    setOpen]    = useState(false);
  const [topic,   setTopic]   = useState('');
  const [loading, setLoading] = useState(false);
  const [hooks,   setHooks]   = useState([]);
  const [error,   setError]   = useState('');

  const base = apiBase || 'https://api.wintaibot.com';

  const generateHooks = async () => {
    if (!topic.trim()) { setError('Enter a topic first.'); return; }
    setLoading(true); setHooks([]); setError('');
    try {
      const res = await fetch(`${base}/api/hooks/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: topic.trim(), platform: platform || 'instagram' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate hooks');
      setHooks(data.hooks || []);
      setOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); generateHooks(); }
  };

  return (
    <div style={{ marginTop: 6 }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => hooks.length > 0 ? setOpen(o => !o) : null}
        disabled={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20, border: '1.5px solid #fde68a',
          background: '#fffbeb', color: '#d97706', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', opacity: loading ? 0.7 : 1,
        }}
      >
        🎣 Viral Hooks
      </button>

      {/* Inline input row — always shown */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Topic (e.g. fitness coaching, skincare...)"
          style={{
            flex: 1, padding: '7px 12px', borderRadius: 10,
            border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none',
            background: '#fafafa', color: '#1e293b',
          }}
        />
        <button
          type="button"
          onClick={generateHooks}
          disabled={loading || !topic.trim()}
          style={{
            padding: '7px 14px', borderRadius: 10, border: 'none',
            background: topic.trim() && !loading ? '#f59e0b' : '#e2e8f0',
            color: topic.trim() && !loading ? '#fff' : '#94a3b8',
            fontSize: 12, fontWeight: 700,
            cursor: topic.trim() && !loading ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '⏳…' : '⚡ Generate'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>⚠️ {error}</div>
      )}

      {/* Hooks panel */}
      {open && hooks.length > 0 && (
        <div style={{
          marginTop: 10, background: '#fffbeb', border: '1.5px solid #fde68a',
          borderRadius: 14, padding: '14px', animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            ⚡ Pick a viral hook
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hooks.map((hook, i) => {
              const style = CATEGORY_STYLES[hook.category] || { emoji: '🎯', color: '#4f46e5', bg: '#eef2ff' };
              return (
                <div key={i} style={{
                  background: '#fff', border: '1.5px solid #fde68a', borderRadius: 12,
                  padding: '10px 12px',
                }}>
                  {/* Category badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 20, marginBottom: 6,
                    background: style.bg, color: style.color,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}>
                    {style.emoji} {hook.category}
                  </div>

                  {/* Hook text */}
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>
                    {hook.text}
                  </p>

                  {/* Use button */}
                  <button
                    type="button"
                    onClick={() => { onApply(hook.text); setOpen(false); }}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none',
                      background: style.color, color: '#fff',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Use this →
                  </button>
                </div>
              );
            })}
          </div>

          {/* Regenerate */}
          <button
            type="button"
            onClick={generateHooks}
            disabled={loading}
            style={{
              marginTop: 10, width: '100%', padding: '8px', borderRadius: 10,
              border: '1.5px solid #fde68a', background: 'transparent',
              color: '#d97706', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ Generating…' : '🔄 Generate 5 more hooks'}
          </button>
        </div>
      )}
    </div>
  );
}
