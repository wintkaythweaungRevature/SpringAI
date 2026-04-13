import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { filterEnabledPlatforms } from '../config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';
import CaptionIdeasPanel from './CaptionIdeasPanel';
import HookGeneratorPanel from './HookGeneratorPanel';

const PLATFORMS = filterEnabledPlatforms([
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2' },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2' },
  { id: 'x',         label: 'X',         color: '#000000' },
  { id: 'threads',   label: 'Threads',   color: '#000000' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023' },
]);

const MEDIA_TYPES = ['Text', 'Image', 'Video', 'Story'];

/**
 * ComposePostModal
 * Props:
 *   open         boolean
 *   onClose      () => void
 *   defaultDate  string  ISO date-time (optional) — pre-fills datetime picker
 *   onPosted     () => void — called after successful post/schedule so calendar can refresh
 */
export default function ComposePostModal({ open, onClose, defaultDate, onPosted }) {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [mediaType, setMediaType]   = useState('Text');
  const [caption, setCaption]       = useState('');
  const [hashtags, setHashtags]     = useState('');
  const [when, setWhen]             = useState('now'); // 'now' | 'schedule'
  const [scheduledAt, setScheduledAt] = useState(
    defaultDate ? defaultDate.slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [publishType, setPublishType] = useState('post'); // post | story
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults]       = useState([]); // { platform, ok, error }
  const [done, setDone]             = useState(false);
  const fileRef = useRef();

  if (!open) return null;

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (f.type.startsWith('image/')) setMediaType('Image');
    else if (f.type.startsWith('video/')) setMediaType('Video');
  };

  const handleSubmit = async () => {
    if (!caption.trim()) { alert('Caption is required'); return; }
    if (selectedPlatforms.length === 0) { alert('Select at least one platform'); return; }
    setSubmitting(true);
    setResults([]);

    const res = [];
    for (const platform of selectedPlatforms) {
      const fd = new FormData();
      fd.append('platform', platform);
      fd.append('caption', caption);
      fd.append('hashtags', hashtags);
      fd.append('publishType', publishType);
      fd.append('mediaType', mediaType.toUpperCase());
      if (file) fd.append('file', file);

      try {
        if (when === 'now') {
          // Immediate post
          const r = await fetch(`${base}/api/social/post/${platform}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          const data = await r.json();
          res.push({ platform, ok: r.ok, error: data.error || null });
        } else {
          const fdSched = new FormData();
          fdSched.append('caption', caption);
          fdSched.append('hashtags', hashtags);
          const at = new Date(`${scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt}`);
          fdSched.append('scheduledAt', Number.isNaN(at.getTime()) ? scheduledAt : at.toISOString());
          fdSched.append('publishType', publishType === 'story' ? 'story' : 'feed');
          if (file) fdSched.append('file', file);
          const r = await fetch(`${base}/api/social/post/schedule/${platform}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fdSched,
          });
          const data = await r.json().catch(() => ({}));
          const ok =
            r.ok &&
            (data?.jobId != null ||
              data?.id != null ||
              data?.scheduledAt != null ||
              String(data?.status || '').toUpperCase() === 'SCHEDULED' ||
              data?.success === true);
          res.push({
            platform,
            ok,
            jobId: data.jobId ?? data.id,
            error: data.error || (ok ? null : `Schedule failed (${r.status})`),
          });
        }
      } catch (e) {
        res.push({ platform, ok: false, error: e.message });
      }
    }

    setResults(res);
    setDone(true);
    setSubmitting(false);
    if (res.some(r => r.ok) && onPosted) onPosted();
  };

  const handleClose = () => {
    setCaption(''); setHashtags(''); setFile(null); setPreview(null);
    setDone(false); setResults([]); setMediaType('Text'); setWhen('now');
    setSelectedPlatforms(['instagram']);
    if (onClose) onClose();
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={handleClose}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
            {when === 'now' ? 'Post Now' : 'Schedule Post'}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        {done ? (
          // Results screen
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>
              {when === 'now' ? 'Post results:' : 'Scheduled:'}
            </p>
            {results.map(r => (
              <div key={r.platform} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: '1px solid #f1f5f9',
              }}>
                <PlatformIcon platform={PLATFORMS.find(p => p.id === r.platform) || { id: r.platform, label: r.platform, color: '#64748b' }} size={20} />
                <span style={{ flex: 1, fontSize: 14, color: '#334155', textTransform: 'capitalize' }}>{r.platform}</span>
                {r.ok
                  ? <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>✓ {when === 'now' ? 'Posted' : 'Scheduled'}</span>
                  : <span style={{ color: '#ef4444', fontSize: 13 }}>✗ {r.error || 'Failed'}</span>
                }
              </div>
            ))}
            <button onClick={handleClose} style={{
              marginTop: 18, width: '100%', padding: '10px', borderRadius: 8,
              background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600,
              fontSize: 14, cursor: 'pointer',
            }}>Done</button>
          </div>
        ) : (
          <>
            {/* Platform selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8 }}>PLATFORMS</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => togglePlatform(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                    borderRadius: 20, border: `2px solid ${selectedPlatforms.includes(p.id) ? p.color : '#e2e8f0'}`,
                    background: selectedPlatforms.includes(p.id) ? p.color + '18' : '#fff',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: selectedPlatforms.includes(p.id) ? p.color : '#64748b',
                  }}>
                    <PlatformIcon platform={p} size={15} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Media type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8 }}>TYPE</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {MEDIA_TYPES.map(t => (
                  <button key={t} onClick={() => { setMediaType(t); if (t === 'Story') setPublishType('story'); else setPublishType('post'); }} style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    background: mediaType === t ? '#6366f1' : '#f1f5f9',
                    color: mediaType === t ? '#fff' : '#475569',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* File upload */}
            {(mediaType === 'Image' || mediaType === 'Video' || mediaType === 'Story') && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8 }}>
                  {mediaType === 'Video' ? 'VIDEO FILE' : 'IMAGE FILE'}
                </label>
                <div onClick={() => fileRef.current?.click()} style={{
                  border: '2px dashed #cbd5e1', borderRadius: 8, padding: '20px',
                  textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                }}>
                  {preview ? (
                    mediaType === 'Video'
                      ? <video src={preview} style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6 }} controls />
                      : <img src={preview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Click to upload {mediaType.toLowerCase()}</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept={mediaType === 'Video' ? 'video/*' : 'image/*'} onChange={handleFile} style={{ display: 'none' }} />
              </div>
            )}

            {/* Caption */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>CAPTION</label>
              <textarea
                value={caption} onChange={e => setCaption(e.target.value)}
                placeholder="Write your caption..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
              <CaptionIdeasPanel
                captionText={caption}
                platform={selectedPlatforms[0] || 'social media'}
                apiBase={base}
                token={token}
                onApply={({ caption: c, hashtags: h }) => { setCaption(c); if (h) setHashtags(h); }}
              />
              <HookGeneratorPanel
                platform={selectedPlatforms[0] || 'instagram'}
                apiBase={base}
                token={token}
                onApply={(hookText) => setCaption(prev => hookText + (prev ? '\n\n' + prev : ''))}
              />
            </div>

            {/* Hashtags */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>HASHTAGS</label>
              <input
                value={hashtags} onChange={e => setHashtags(e.target.value)}
                placeholder="#travel #food"
                style={inputStyle}
              />
            </div>

            {/* When to post */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 8 }}>WHEN TO POST</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: when === 'schedule' ? 10 : 0 }}>
                {['now', 'schedule'].map(w => (
                  <button key={w} onClick={() => setWhen(w)} style={{
                    flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: 13,
                    background: when === w ? '#6366f1' : '#f1f5f9',
                    color: when === w ? '#fff' : '#475569',
                  }}>
                    {w === 'now' ? '⚡ Post Now' : '🗓 Schedule'}
                  </button>
                ))}
              </div>
              {when === 'schedule' && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ ...inputStyle, marginTop: 6 }}
                />
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                background: submitting ? '#94a3b8' : '#6366f1', color: '#fff',
                fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Posting…' : when === 'now'
                ? `Post to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`
                : `Schedule for ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
