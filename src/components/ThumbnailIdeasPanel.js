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
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {ideas.map((idea, idx) => {
                const color = idea.colorHex || '#6366f1';
                return (
                  <div
                    key={idx}
                    style={{
                      borderRadius: '10px',
                      border: `1.5px solid ${color}44`,
                      background: hexToRgba(color, 0.08),
                      padding: '10px 8px',
                    }}
                  >
                    <div style={{ fontSize: '28px', textAlign: 'center', marginBottom: '6px', lineHeight: 1 }}>
                      {idea.emojis || '🎨'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px', textAlign: 'center' }}>
                      {idea.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                      {idea.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
