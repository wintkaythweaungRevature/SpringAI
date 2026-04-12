import React, { useState } from 'react';

export default function ThumbnailIdeasPanel({
  captionText,
  platform,
  apiBase,
  token,
  currentThumbnailUrl,
}) {
  const [loading, setLoading] = useState(false);
  const [ideas,   setIdeas]   = useState([]);
  const [error,   setError]   = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyToClipboard = async (text) => {
    const t = (text || '').trim();
    if (!t) return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(t);
        return true;
      }
    } catch {
      /* fall through */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopyIdea = async (idea, idx) => {
    const title = (idea?.title || '').trim();
    const desc = (idea?.description || '').trim();
    const emojis = (idea?.emojis || '').trim();
    const plat = (platform || 'YouTube').toString();
    const lines = [
      `[W!ntAi — ${plat} thumbnail direction]`,
      title ? `Style: ${title}` : null,
      desc ? `Direction: ${desc}` : null,
      emojis ? `Mood / icons: ${emojis}` : null,
      captionText?.trim() ? `Based on your caption: ${captionText.trim()}` : null,
      '',
      'Next: design the thumbnail in your tool of choice, then set the actual image in this app using “Scrub & Pick” or “AI Suggested”.',
    ].filter((line) => line !== null && line !== '');
    const payload = lines.join('\n');
    const ok = await copyToClipboard(payload);
    if (!ok) {
      setError('Could not copy to clipboard. Allow clipboard permission for this site, or copy the text manually from the card.');
      window.setTimeout(() => setError(''), 5000);
      return;
    }
    setCopiedIdx(idx);
    window.setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 2000);
  };

  const fetchIdeas = async () => {
    if (!captionText?.trim()) { setError('Add a caption first — thumbnail ideas are based on your caption.'); return; }
    setLoading(true); setIdeas([]); setError('');
    try {
      const res = await fetch(`${apiBase}/api/video/thumbnail-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ caption: captionText, platform: platform || 'YouTube' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to generate ideas');
      setIdeas(data.ideas || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const hexToRgba = (hex, alpha) => {
    const h = typeof hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#6366f1';
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>💡 Thumbnail Ideas</span>
        <button
          onClick={fetchIdeas}
          disabled={loading}
          style={{
            padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: loading ? '#e2e8f0' : '#6366f1', color: loading ? '#94a3b8' : '#fff',
            fontSize: '12px', fontWeight: 600,
          }}
        >
          {loading ? '⏳ Generating…' : ideas.length > 0 ? '🔄 Regenerate' : '✨ Get Ideas'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '8px', padding: '8px 12px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {(currentThumbnailUrl || ideas.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: currentThumbnailUrl ? '120px 1fr' : '1fr', gap: '12px', alignItems: 'start' }}>

          {currentThumbnailUrl && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Pick
              </div>
              <img
                src={currentThumbnailUrl}
                alt="current thumbnail"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0', display: 'block' }}
              />
            </div>
          )}

          {ideas.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', lineHeight: 1.4 }}>
                Tap a card to <strong>copy</strong> that thumbnail direction to your clipboard (then paste in Canva, Photoshop, Notes, etc.).
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {ideas.map((idea, idx) => {
                const color = (idea.colorHex && /^#[0-9A-Fa-f]{6}$/.test(idea.colorHex)) ? idea.colorHex : '#6366f1';
                const isCopied = copiedIdx === idx;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleCopyIdea(idea, idx)}
                    title="Copy thumbnail direction to clipboard"
                    style={{
                      borderRadius: '10px',
                      border: `1.5px solid ${isCopied ? '#22c55e' : `${color}44`}`,
                      background: isCopied ? 'rgba(34, 197, 94, 0.12)' : hexToRgba(color, 0.08),
                      padding: '10px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: 'inherit',
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                      boxShadow: isCopied ? '0 0 0 2px rgba(34, 197, 94, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: isCopied ? '#15803d' : '#6366f1', marginBottom: '6px' }}>
                      {isCopied ? '✓ Copied' : '📋 Tap to copy'}
                    </div>
                    <div style={{ fontSize: '28px', textAlign: 'center', marginBottom: '6px', lineHeight: 1 }}>
                      {idea.emojis || '🎨'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px', textAlign: 'center' }}>
                      {idea.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                      {idea.description}
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
