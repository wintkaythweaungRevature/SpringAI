import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Upload-and-upscale tool. The user drops a small / low-resolution image
 * (logo, screenshot, thumbnail, AI placeholder), picks a mode, optionally
 * describes the image, and gets back a 4×-larger version (up to ~4MP)
 * powered by Stability AI's image upscaler. Backend endpoint:
 *   POST /api/ai/upscale-image  (multipart: file, prompt, mode)
 *
 * UX:
 *   - Drag-and-drop OR click-to-pick
 *   - Side-by-side preview: original ⇄ upscaled, with their pixel sizes
 *   - Conservative mode by default (faithful to source); creative for AI art
 *   - Counts against the same monthly AI-image quota as the Image Generator
 */
function ImageUpscaler() {
  const { token, apiBase } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalDims, setOriginalDims] = useState(null);
  const [upscaledUrl, setUpscaledUrl] = useState('');
  const [upscaledDims, setUpscaledDims] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('conservative');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setFile(null);
    setOriginalUrl('');
    setOriginalDims(null);
    setUpscaledUrl('');
    setUpscaledDims(null);
    setPrompt('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const acceptFile = (f) => {
    setError('');
    setUpscaledUrl('');
    setUpscaledDims(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please drop an image file (PNG, JPEG, or WEBP).');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image is too large (max 10 MB).');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalUrl(e.target.result);
      // Read pixel dimensions for the side-by-side label.
      const img = new Image();
      img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  };

  const onPick = (e) => acceptFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const upscale = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setUpscaledUrl('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', mode);
      if (prompt.trim()) fd.append('prompt', prompt.trim());

      const res = await fetch(`${apiBase || 'https://api.wintaibot.com'}/api/ai/upscale-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setError(data.error || 'Session expired. Please sign in again.');
        } else if (res.status === 403) {
          setError(data.error || 'Monthly AI-image limit reached on your plan. Upgrade to upscale more images.');
        } else if (res.status === 503) {
          setError(data.error || 'Upscaler not configured on this server.');
        } else {
          setError(data.error || `Upscale failed (HTTP ${res.status}).`);
        }
        return;
      }
      if (!data.url) {
        setError('No image returned from the upscaler. Try a different source image.');
        return;
      }
      setUpscaledUrl(data.url);
      // Read upscaled pixel dimensions for the side-by-side label.
      const img = new Image();
      img.onload = () => setUpscaledDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = data.url;
    } catch (err) {
      setError(err.message || 'Upscale failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dimsLabel = (d) => d ? `${d.w} × ${d.h}px` : '';
  const sizeBytes = file ? (file.size / 1024).toFixed(1) + ' KB' : '';

  return (
    <div style={s.page}>
      <div style={s.layout}>
        {/* ── LEFT PANEL: Controls ── */}
        <div style={s.left}>
          <div style={s.panelHeader}>
            <span style={s.panelIcon}>🔍</span>
            <div>
              <h2 style={s.panelTitle}>Image Upscaler</h2>
              <p style={s.panelSub}>Stability AI · 4× resolution</p>
            </div>
          </div>

          {/* Drop zone / file picker */}
          <div
            style={{
              ...s.dropZone,
              borderColor: dragOver ? '#7c3aed' : (file ? '#16a34a' : '#cbd5e1'),
              background: dragOver ? '#faf5ff' : (file ? '#f0fdf4' : '#f8fafc'),
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onPick}
              style={{ display: 'none' }}
            />
            {file ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{file.name}</div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                  {dimsLabel(originalDims)} · {sizeBytes}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 6 }}>
                  Click to pick a different image
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 6, opacity: 0.5 }}>📤</div>
                <div style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>
                  Drop an image here
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
                  or click to browse · PNG, JPEG, WEBP · max 10 MB
                </div>
              </>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Mode</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setMode('conservative')}
                style={{ ...s.modeBtn, ...(mode === 'conservative' ? s.modeBtnActive : {}) }}
              >
                🛡 Conservative
              </button>
              <button
                type="button"
                onClick={() => setMode('creative')}
                style={{ ...s.modeBtn, ...(mode === 'creative' ? s.modeBtnActive : {}) }}
              >
                ✨ Creative
              </button>
            </div>
            <div style={s.modeHint}>
              {mode === 'conservative'
                ? 'Faithful to the original — best for logos, photos, screenshots.'
                : 'Adds detail + texture — best for AI art, illustrations.'}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Describe the image (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. a coffee shop logo, green text 'Brewed Daily'"
              style={s.textarea}
              disabled={loading}
              rows={3}
            />
            <div style={s.modeHint}>
              Helps the upscaler preserve text + intent. Skip for generic photos.
            </div>
          </div>

          <button
            onClick={upscale}
            disabled={loading || !file}
            style={{ ...s.btnGenerate, opacity: !file ? 0.5 : 1, cursor: !file ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <><span style={s.spinner} />  Upscaling…</> : '🔍 Upscale Image'}
          </button>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {(file || upscaledUrl) && (
            <div style={s.linksGroup}>
              {upscaledUrl && (
                <a href={upscaledUrl} download={`upscaled-${file?.name || 'image.png'}`} style={s.linkBtnGreen}>
                  ⬇ Download
                </a>
              )}
              {upscaledUrl && (
                <a href={upscaledUrl} target="_blank" rel="noreferrer" style={s.linkBtn}>🔍 Full Size</a>
              )}
              <button style={s.linkBtnRed} onClick={reset}>✕ Clear</button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Before / After preview ── */}
        <div style={s.right}>
          {loading ? (
            <div style={s.canvas}>
              <div style={s.canvasInner}>
                <div style={s.loadingIcon}>🔍</div>
                <p style={s.loadingText}>Upscaling your image…</p>
                <p style={s.loadingHint}>Conservative mode usually finishes in 5–10 seconds</p>
                <div style={s.progressWrap}><div style={s.progressBar} /></div>
              </div>
            </div>
          ) : !originalUrl ? (
            <div style={s.canvas}>
              <div style={s.canvasInner}>
                <div style={s.placeholderIcon}>🖼️</div>
                <p style={s.placeholderText}>Upload an image to upscale</p>
                <p style={s.placeholderHint}>Small images (16px – 1024px) work best</p>
              </div>
            </div>
          ) : (
            <div style={s.compareGrid}>
              {/* Original */}
              <div style={s.previewCard}>
                <div style={s.previewLabel}>
                  <span>Original</span>
                  <span style={s.previewDim}>{dimsLabel(originalDims)}</span>
                </div>
                <div style={s.previewImageWrap}>
                  <img src={originalUrl} alt="Original" style={s.previewImage} />
                </div>
              </div>

              {/* Upscaled */}
              <div style={s.previewCard}>
                <div style={s.previewLabel}>
                  <span style={{ color: upscaledUrl ? '#16a34a' : '#94a3b8' }}>
                    {upscaledUrl ? '✦ Upscaled' : 'Upscaled (pending)'}
                  </span>
                  <span style={s.previewDim}>
                    {upscaledUrl ? dimsLabel(upscaledDims) : '—'}
                  </span>
                </div>
                <div style={{ ...s.previewImageWrap, background: upscaledUrl ? '#fff' : '#f1f5f9' }}>
                  {upscaledUrl ? (
                    <img src={upscaledUrl} alt="Upscaled" style={s.previewImage} />
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: 13, padding: 24, textAlign: 'center' }}>
                      Click <strong>Upscale Image</strong> to generate the high-resolution version.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse-bar { 0%,100%{width:15%} 50%{width:80%} }`}</style>
    </div>
  );
}

export default ImageUpscaler;

// Reuses the visual language of ImageGenerator.js so the two components feel
// like siblings in the AI tools section. Keep style names aligned with that
// file so future cross-edits stay simple.
const s = {
  page: { padding: '4px 0', fontFamily: "'Inter',-apple-system,sans-serif" },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },

  left: {
    width: '320px', minWidth: '280px', flexShrink: 0,
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  panelIcon: { fontSize: '32px' },
  panelTitle: { margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' },
  panelSub: { margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' },

  dropZone: {
    padding: '24px 16px', borderRadius: '12px',
    border: '2px dashed #cbd5e1',
    background: '#f8fafc',
    textAlign: 'center', cursor: 'pointer',
    marginBottom: '18px',
    transition: 'all 0.15s',
  },

  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
  textarea: {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: '1px solid #e2e8f0', fontSize: '13px', color: '#0f172a',
    outline: 'none', resize: 'none', fontFamily: 'inherit',
    background: '#f8fafc', boxSizing: 'border-box', lineHeight: '1.6',
  },
  modeBtn: {
    flex: 1, padding: '8px 6px', borderRadius: '8px',
    border: '1px solid #e2e8f0', background: '#f8fafc',
    color: '#475569', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  modeBtnActive: {
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff', borderColor: 'transparent',
  },
  modeHint: { fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 },

  btnGenerate: {
    width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: '#fff', fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px', fontFamily: 'inherit',
    marginBottom: '14px',
    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
  },
  spinner: {
    width: '12px', height: '12px', borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff',
    display: 'inline-block',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '10px 14px',
    color: '#b91c1c', fontSize: '13px', marginBottom: '14px',
  },
  linksGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  linkBtn: {
    padding: '7px 14px', borderRadius: '8px',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    color: '#2563eb', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
  },
  linkBtnGreen: {
    padding: '7px 14px', borderRadius: '8px',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#16a34a', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
  },
  linkBtnRed: {
    padding: '7px 14px', borderRadius: '8px',
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  right: { flex: 1, minWidth: 0 },
  canvas: {
    background: '#fff', border: '2px dashed #e2e8f0',
    borderRadius: '16px', minHeight: '480px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  canvasInner: { textAlign: 'center', padding: '40px' },
  loadingIcon: { fontSize: '48px', marginBottom: '16px' },
  loadingText: { color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0 0 6px' },
  loadingHint: { color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' },
  progressWrap: { height: '3px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', width: '180px', margin: '0 auto' },
  progressBar: { height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#2563eb,#7c3aed)', animation: 'pulse-bar 2s ease-in-out infinite' },
  placeholderIcon: { fontSize: '52px', marginBottom: '16px', opacity: 0.25 },
  placeholderText: { color: '#94a3b8', fontSize: '16px', fontWeight: '600', margin: '0 0 6px' },
  placeholderHint: { color: '#cbd5e1', fontSize: '13px', margin: 0 },

  compareGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  previewCard: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '14px', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  previewLabel: {
    padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: '12px', fontWeight: '700', color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  previewDim: { color: '#94a3b8', fontSize: '11px', fontWeight: '600', textTransform: 'none', letterSpacing: 0 },
  previewImageWrap: {
    background: '#f8fafc', minHeight: '320px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px',
  },
  previewImage: { maxWidth: '100%', maxHeight: '420px', display: 'block', borderRadius: '8px' },
};
