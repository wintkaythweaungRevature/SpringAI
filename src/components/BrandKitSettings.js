import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';
import FallingPlatformsAnimation from './FallingPlatformsAnimation';

const EMPTY_FORM = {
  name: '',
  websiteUrl: '',
  productSummary: '',
  targetAudience: '',
  brandVoice: '',
  keyPhrases: '',
  primaryColor: '#6366f1',
  secondaryColors: '',
  logoUrl: '',
  hashtagSets: '',
  contentPillars: '',
  blacklistWords: '',
  platformVoices: { linkedin: '', tiktok: '', instagram: '', facebook: '', youtube: '', x: '' },
  examplePosts: '',
};

function safeJson(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
}

function jsonToString(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  try { return JSON.stringify(val, null, 2); } catch { return ''; }
}

function toCommaString(val) {
  if (!val) return '';
  const arr = safeJson(val);
  if (Array.isArray(arr)) return arr.join(', ');
  return typeof val === 'string' ? val : '';
}

function fromCommaString(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/** Map API brand object → form state */
function brandToForm(b) {
  if (!b) return { ...EMPTY_FORM };
  const pv = safeJson(b.platformVoices) || {};
  return {
    name:           b.name            || '',
    websiteUrl:     b.websiteUrl      || '',
    productSummary: b.productSummary  || '',
    targetAudience: b.targetAudience  || '',
    brandVoice:     b.brandVoice      || '',
    keyPhrases:     Array.isArray(b.keyPhrases) ? b.keyPhrases.join(', ') : toCommaString(b.keyPhrases),
    primaryColor:   b.primaryColor    || '#6366f1',
    secondaryColors: toCommaString(b.secondaryColors),
    logoUrl:        b.logoUrl         || '',
    hashtagSets:    jsonToString(b.hashtagSets),
    contentPillars: jsonToString(b.contentPillars),
    blacklistWords: toCommaString(b.blacklistWords),
    platformVoices: {
      linkedin:  pv.linkedin  || '',
      tiktok:    pv.tiktok    || '',
      instagram: pv.instagram || '',
      facebook:  pv.facebook  || '',
      youtube:   pv.youtube   || '',
      x:         pv.x         || '',
    },
    examplePosts: Array.isArray(safeJson(b.examplePosts))
      ? safeJson(b.examplePosts).join('\n\n')
      : toCommaString(b.examplePosts).replace(/,\s*/g, '\n\n'),
  };
}

/** Map form state → API request body */
function formToBody(form) {
  const body = {
    name:           form.name,
    websiteUrl:     form.websiteUrl,
    productSummary: form.productSummary,
    targetAudience: form.targetAudience,
    brandVoice:     form.brandVoice,
    keyPhrases:     fromCommaString(form.keyPhrases),
    primaryColor:   form.primaryColor,
    logoUrl:        form.logoUrl,
    platformVoices: JSON.stringify(form.platformVoices),
    blacklistWords: JSON.stringify(fromCommaString(form.blacklistWords)),
    secondaryColors: form.secondaryColors
      ? JSON.stringify(fromCommaString(form.secondaryColors))
      : '[]',
    examplePosts: form.examplePosts
      ? JSON.stringify(form.examplePosts.split(/\n\n+/).map(s => s.trim()).filter(Boolean))
      : '[]',
    hashtagSets:    form.hashtagSets    || null,
    contentPillars: form.contentPillars || null,
  };
  return body;
}

// ── Brand Consistency Check sub-component ────────────────────────────────────

function ScoreRing({ score }) {
  if (score === null || score === undefined) return null;
  const r = 36, cx = 44, cy = 44;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#dc2626';
  const label = score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Partial' : score >= 25 ? 'Poor' : 'Off-brand';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 18, fontWeight: 800, fill: color }}>{score}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 9, fill: '#64748b' }}>/100</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color }}>{label}</div>
    </div>
  );
}

function ColorSwatch({ hex, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 16, height: 16, borderRadius: 4, background: hex, border: '1.5px solid #e2e8f0', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>{hex}</span>
      {label && <span style={{ fontSize: 10, color: '#94a3b8' }}>({label})</span>}
    </div>
  );
}

function BrandConsistencyCheck({ token, apiBase, brandId, activeWorkspaceId }) {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); setErr('');
  };

  const checkImage = async () => {
    if (!imageFile) { setErr('Select an image first.'); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      if (brandId) fd.append('brandId', String(brandId));

      const headers = { Authorization: `Bearer ${token}` };
      if (activeWorkspaceId) headers['X-Workspace-Id'] = String(activeWorkspaceId);

      const res = await fetch(`${apiBase}/api/brand/check-image`, {
        method: 'POST', headers, body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Check failed');
      setResult(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageFile(null); setPreview(null); setResult(null); setErr('');
  };

  return (
    <div style={{ ...cardStyle, marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
          {open ? '▾' : '▸'} 🖼 Brand Consistency Check
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>Check if an image matches your brand colors</span>
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          {/* Upload area */}
          {!preview ? (
            <label style={{
              display: 'block', padding: '20px', borderRadius: 10,
              border: '2px dashed #c7d2fe', background: '#f5f3ff',
              textAlign: 'center', cursor: 'pointer',
            }}>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <div style={{ fontSize: 28, marginBottom: 6 }}>🖼</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>Click to upload image</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>JPG, PNG, GIF, BMP · Max 5MB</div>
            </label>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={preview} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e2e8f0' }} />
                <button onClick={reset} style={{ position: 'absolute', top: -6, right: -6, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>×</button>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>{imageFile?.name}</div>
                <button
                  onClick={checkImage}
                  disabled={loading}
                  style={{
                    padding: '8px 18px', borderRadius: 9, border: 'none',
                    background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: loading ? '#94a3b8' : '#fff',
                    fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '⏳ Analyzing…' : '🔍 Check Consistency'}
                </button>
              </div>
            </div>
          )}

          {err && <div style={{ marginTop: 8, fontSize: 12, color: '#dc2626' }}>⚠️ {err}</div>}

          {/* Result */}
          {result && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
                {/* Score ring */}
                <ScoreRing score={result.score} />

                {/* Color comparison */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {result.hasBrandColors && result.comparisons?.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>Color Comparison</div>
                      {result.comparisons.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 3, background: c.imageColor, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{c.imageColor}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>→ closest:</span>
                          <div style={{ width: 14, height: 14, borderRadius: 3, background: c.closestBrand, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{c.closestBrand}</span>
                          <span style={{ fontSize: 10, color: c.distance < 30 ? '#16a34a' : c.distance < 80 ? '#f59e0b' : '#dc2626', fontWeight: 700 }}>
                            Δ{c.distance}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {!result.hasBrandColors && (
                    <div style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0' }}>
                      No brand colors set — add a primary color above to get a consistency score.
                    </div>
                  )}
                </div>
              </div>

              {/* Dominant colors */}
              {result.imageDominant?.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>Image Dominant Colors</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {result.imageDominant.map((c, i) => (
                      <ColorSwatch key={i} hex={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {result.suggestions && (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>💡 AI SUGGESTIONS</div>
                  <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.7 }}>{result.suggestions}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const cardStyle = {
  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14,
  padding: '18px', marginBottom: 16,
};
const labelStyle = {
  fontSize: 11, fontWeight: 700, color: '#475569',
  marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em',
};
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 9,
  border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
  color: '#1e293b', boxSizing: 'border-box', background: '#fafafa',
  fontFamily: 'inherit',
};
const taStyle = { ...inputStyle, resize: 'vertical', minHeight: 72 };

export default function BrandKitSettings() {
  const { token, apiBase, activeWorkspaceId, switchBrand, activeBrandId } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [brands, setBrands] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [scannedColors, setScannedColors] = useState([]);
  const [scannedLogo, setScannedLogo] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 680);

  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 680);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const authH = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(activeWorkspaceId ? { 'X-Workspace-Id': String(activeWorkspaceId) } : {}),
  }), [token, activeWorkspaceId]);

  // Load brands
  const loadBrands = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const wsParam = activeWorkspaceId ? `?workspaceId=${activeWorkspaceId}` : '';
      const res = await fetch(`${base}/api/brand/brands${wsParam}`, {
        headers: { Authorization: `Bearer ${token}`, ...(activeWorkspaceId ? { 'X-Workspace-Id': String(activeWorkspaceId) } : {}) },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setBrands(list);
        // Select active brand or first brand
        if (list.length > 0) {
          const active = list.find(b => b.isActive) || list[0];
          setSelectedId(active.id);
          setForm(brandToForm(active));
        } else {
          setSelectedId(null);
          setForm({ ...EMPTY_FORM });
        }
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [base, token, activeWorkspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBrands(); }, [loadBrands]);

  const selectBrand = (brand) => {
    setSelectedId(brand.id);
    setForm(brandToForm(brand));
    setMsg(''); setErr('');
  };

  const handleCreate = async () => {
    try {
      const res = await fetch(`${base}/api/brand/brands`, {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ name: 'New Brand', ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setBrands(prev => [...prev, data]);
      selectBrand(data);
    } catch (e) { setErr(e.message); }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true); setMsg(''); setErr('');
    try {
      const res = await fetch(`${base}/api/brand/brands/${selectedId}`, {
        method: 'PUT', headers: authH(), body: JSON.stringify(formToBody(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setBrands(prev => prev.map(b => b.id === selectedId ? data : b));
      setForm(brandToForm(data));
      setMsg('✅ Brand saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand? This cannot be undone.')) return;
    try {
      const res = await fetch(`${base}/api/brand/brands/${id}`, {
        method: 'DELETE', headers: authH(),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setBrands(prev => {
        const remaining = prev.filter(b => b.id !== id);
        if (selectedId === id) {
          if (remaining.length > 0) { setSelectedId(remaining[0].id); setForm(brandToForm(remaining[0])); }
          else { setSelectedId(null); setForm({ ...EMPTY_FORM }); }
        }
        return remaining;
      });
    } catch (e) { setErr(e.message); }
  };

  const handleSetActive = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${base}/api/brand/brands/${selectedId}/set-active`, {
        method: 'POST', headers: authH(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setBrands(prev => prev.map(b => ({ ...b, isActive: b.id === selectedId })));
      // Update AuthContext so X-Brand-Id header is sent
      if (switchBrand) switchBrand(selectedId, activeWorkspaceId);
      setMsg('✅ Active brand updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setErr(e.message); }
  };

  const handleAnalyze = async () => {
    if (!form.websiteUrl.trim()) { setErr('Enter a website URL first.'); return; }
    setAnalyzing(true); setErr(''); setMsg('');
    setScannedColors([]); setScannedLogo('');
    try {
      const urlStr = form.websiteUrl.trim();

      // Run logo/color scan AND brand DNA analysis in parallel
      const [scanRes, analyzeRes] = await Promise.all([
        fetch(`${base}/api/brand/scan`, {
          method: 'POST', headers: authH(), body: JSON.stringify({ url: urlStr }),
        }),
        fetch(`${base}/api/brand/analyze`, {
          method: 'POST', headers: authH(),
          body: JSON.stringify({ url: urlStr, ...(selectedId ? { brandId: selectedId } : {}), ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}) }),
        }),
      ]);

      const scanData    = await scanRes.json().catch(() => ({}));
      const analyzeData = await analyzeRes.json().catch(() => ({}));
      if (!analyzeRes.ok) throw new Error(analyzeData.error || 'Analysis failed');

      // Auto-apply logo: prefer og:image/apple-touch-icon, fallback to favicon
      const autoLogo = scanData.logoUrl || scanData.favicon || '';
      // Auto-apply primary color: first non-default extracted color
      const autoColor = (scanData.colors && scanData.colors.length > 0) ? scanData.colors[0] : '';

      // Always overwrite logo + primary color with real extracted values
      const merged = {
        ...analyzeData,
        logoUrl:      autoLogo  || analyzeData.logoUrl  || '',
        primaryColor: autoColor || analyzeData.primaryColor || '',
      };

      if (selectedId) {
        setBrands(prev => prev.map(b => b.id === selectedId ? merged : b));
      }
      setForm(brandToForm(merged));

      // Save all extracted colors so user can click to pick an alternative
      if (scanData.colors?.length > 0) setScannedColors(scanData.colors);
      if (autoLogo) setScannedLogo(autoLogo);

      setMsg('✅ Brand identity extracted! Colors and logo applied automatically. Review and save.');
      setTimeout(() => setMsg(''), 6000);
    } catch (e) { setErr(e.message); }
    setAnalyzing(false);
  };

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const setPV = (platform, val) => setForm(prev => ({
    ...prev,
    platformVoices: { ...prev.platformVoices, [platform]: val },
  }));

  const selectedBrand = brands.find(b => b.id === selectedId);
  const isActive = selectedBrand?.isActive === true;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  // Background + bouncing-platforms animation are now provided by the parent
  // (BrandGuardian wraps this in its own dark gradient panel). Keeping a second
  // panel here doubled the styling and produced an unwanted inner edge.
  return (
    <div style={{
      maxWidth: 960, margin: '0 auto', padding: '32px 24px',
      fontFamily: 'inherit', display: 'flex', flexDirection: 'column', gap: 0,
      background: 'transparent',
    }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>
          🎨 Brand Kit
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
          Manage multiple brand profiles. The active brand is used automatically in all AI features.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading brands…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>

          {/* ── Left: Brand List ──────────────────────────────────────────── */}
          <div style={{
            width: mobile ? '100%' : 220, flexShrink: 0,
          }}>
            <div style={{
              border: '1.5px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
              background: '#fff', marginBottom: 10,
            }}>
              {brands.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No brands yet
                </div>
              )}
              {brands.map(brand => (
                <div
                  key={brand.id}
                  onClick={() => selectBrand(brand)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: brand.id === selectedId ? '#f5f3ff' : '#fff',
                    borderLeft: brand.id === selectedId ? '3px solid #6366f1' : '3px solid transparent',
                    transition: 'all 0.12s',
                  }}
                >
                  {/* Color dot */}
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                    background: brand.primaryColor || '#6366f1',
                    border: '1.5px solid #e2e8f0',
                  }} />

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: '#1e293b',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {brand.name || 'Unnamed Brand'}
                    </div>
                    {brand.isActive && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#16a34a',
                        background: '#f0fdf4', borderRadius: 10, padding: '1px 7px',
                        border: '1px solid #bbf7d0', display: 'inline-block', marginTop: 2,
                      }}>Active</span>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(brand.id); }}
                    style={{
                      background: 'none', border: 'none', padding: '2px 4px',
                      cursor: 'pointer', color: '#94a3b8', fontSize: 14, flexShrink: 0,
                      borderRadius: 4,
                    }}
                    title="Delete brand"
                  >🗑</button>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreate}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: '1.5px dashed #c7d2fe', background: '#f5f3ff',
                color: '#6366f1', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + New Brand
            </button>
          </div>

          {/* ── Right: Editor ─────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selectedId ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                Select a brand or create a new one
              </div>
            ) : (
              <>
                {/* Status messages */}
                {msg && (
                  <div style={{ marginBottom: 12, padding: '9px 14px', borderRadius: 9, background: '#f0fdf4', border: '1px solid #86efac', fontSize: 13, color: '#15803d' }}>
                    {msg}
                  </div>
                )}
                {err && (
                  <div style={{ marginBottom: 12, padding: '9px 14px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fca5a5', fontSize: 13, color: '#b91c1c' }}>
                    ⚠️ {err}
                  </div>
                )}

                {/* ── Identity card ─────────────────────────────────────── */}
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 14 }}>🪪 Identity</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Name */}
                    <div>
                      <label style={labelStyle}>Brand Name</label>
                      <input value={form.name} onChange={e => setF('name', e.target.value)}
                        placeholder="e.g. Client A, Nike Campaign" style={inputStyle} />
                    </div>

                    {/* Logo URL + preview */}
                    <div>
                      <label style={labelStyle}>Logo URL</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input value={form.logoUrl} onChange={e => setF('logoUrl', e.target.value)}
                          placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
                        {form.logoUrl && (
                          <img src={form.logoUrl} alt="logo" style={{ height: 32, borderRadius: 6, border: '1px solid #e2e8f0', objectFit: 'contain', background: '#fafafa' }}
                            onError={e => { e.target.style.display = 'none'; }} />
                        )}
                      </div>
                    </div>

                    {/* Website URL + Analyze */}
                    <div>
                      <label style={labelStyle}>Website URL</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={form.websiteUrl} onChange={e => setF('websiteUrl', e.target.value)}
                          placeholder="https://yourwebsite.com" style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={handleAnalyze} disabled={analyzing || !form.websiteUrl.trim()}
                          style={{
                            padding: '8px 14px', borderRadius: 9, border: 'none',
                            background: form.websiteUrl.trim() && !analyzing ? '#6366f1' : '#e2e8f0',
                            color: form.websiteUrl.trim() && !analyzing ? '#fff' : '#94a3b8',
                            fontSize: 12, fontWeight: 700, cursor: form.websiteUrl.trim() && !analyzing ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap', flexShrink: 0,
                          }}>
                          {analyzing ? '⏳ Analyzing…' : '🧠 Analyze'}
                        </button>
                      </div>
                    </div>

                    {/* Colors row */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: '0 0 auto' }}>
                        <label style={labelStyle}>Primary Color</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={form.primaryColor || '#6366f1'}
                            onChange={e => setF('primaryColor', e.target.value)}
                            style={{ width: 40, height: 36, border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                          <input value={form.primaryColor} onChange={e => setF('primaryColor', e.target.value)}
                            placeholder="#6366f1" style={{ ...inputStyle, width: 90 }} />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label style={labelStyle}>Secondary Colors <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(comma-sep hex)</span></label>
                        <input value={form.secondaryColors} onChange={e => setF('secondaryColors', e.target.value)}
                          placeholder="#fff, #000" style={inputStyle} />
                      </div>
                    </div>

                    {/* Extracted colors palette — shown after analyze, click to pick */}
                    {scannedColors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>DETECTED COLORS</span>
                        {scannedColors.map((c, i) => (
                          <button key={i} onClick={() => setF('primaryColor', c)} title={`Use ${c}`}
                            style={{
                              width: 28, height: 28, borderRadius: 7, background: c, flexShrink: 0,
                              border: form.primaryColor === c ? `3px solid ${c}` : '2px solid #e2e8f0',
                              cursor: 'pointer', outline: form.primaryColor === c ? `2px solid ${c}55` : 'none',
                              boxShadow: form.primaryColor === c ? `0 0 0 2px ${c}44` : 'none',
                            }} />
                        ))}
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>click to set as primary</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={handleSetActive}
                        disabled={isActive}
                        style={{
                          padding: '9px 18px', borderRadius: 9, border: 'none',
                          background: isActive ? '#f0fdf4' : 'linear-gradient(135deg,#16a34a,#15803d)',
                          color: isActive ? '#16a34a' : '#fff',
                          fontSize: 12, fontWeight: 700,
                          cursor: isActive ? 'default' : 'pointer',
                          border: isActive ? '1.5px solid #bbf7d0' : 'none',
                        }}>
                        {isActive ? '✓ Active Brand' : '⚡ Set as Active'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Brand DNA card ────────────────────────────────────── */}
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 14 }}>🧠 Brand DNA</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    <div>
                      <label style={labelStyle}>What you do</label>
                      <textarea value={form.productSummary} onChange={e => setF('productSummary', e.target.value)}
                        placeholder="e.g. AI-powered scheduling tool for social media creators"
                        rows={2} style={taStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Target Audience</label>
                      <textarea value={form.targetAudience} onChange={e => setF('targetAudience', e.target.value)}
                        placeholder="e.g. Content creators aged 25-40" rows={2} style={taStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Brand Voice</label>
                      <input value={form.brandVoice} onChange={e => setF('brandVoice', e.target.value)}
                        placeholder="e.g. Casual, energetic, uses emojis" style={inputStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Key Phrases <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(comma-separated)</span></label>
                      <input value={form.keyPhrases} onChange={e => setF('keyPhrases', e.target.value)}
                        placeholder="e.g. grow faster, save time, effortless content" style={inputStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Blacklist Words <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(never use these)</span></label>
                      <input value={form.blacklistWords} onChange={e => setF('blacklistWords', e.target.value)}
                        placeholder="e.g. cheap, discount, basic" style={inputStyle} />
                    </div>

                    <div>
                      <label style={labelStyle}>Example Posts <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(separate with blank line)</span></label>
                      <textarea value={form.examplePosts} onChange={e => setF('examplePosts', e.target.value)}
                        placeholder={"Example caption 1...\n\nExample caption 2..."}
                        rows={4} style={taStyle} />
                    </div>
                  </div>
                </div>

                {/* ── Platform Voices card ──────────────────────────────── */}
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 14 }}>🎙 Platform Voices</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                    {[
                      { key: 'linkedin',  label: 'LinkedIn',    logo: 'linkedin',  color: '#0A66C2', emoji: '💼' },
                      { key: 'tiktok',    label: 'TikTok',      logo: 'tiktok',    color: '#010101', emoji: '🎵' },
                      { key: 'instagram', label: 'Instagram',   logo: 'instagram', color: '#E1306C', emoji: '📸' },
                      { key: 'facebook',  label: 'Facebook',    logo: 'facebook',  color: '#1877F2', emoji: '👍' },
                      { key: 'youtube',   label: 'YouTube',     logo: 'youtube',   color: '#FF0000', emoji: '▶️' },
                      { key: 'x',         label: 'X (Twitter)', logo: 'x',         color: '#000000', emoji: '🐦' },
                    ].map(({ key, label, logo, color, emoji }) => (
                      <div key={key}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, cursor: 'default' }}>
                          <PlatformIcon platform={{ id: key, logo, color, emoji }} size={18} />
                          <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                        </label>
                        <input value={form.platformVoices[key]} onChange={e => setPV(key, e.target.value)}
                          placeholder="e.g. Professional, insight-driven" style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Advanced (collapsible) ─────────────────────────────── */}
                <div style={cardStyle}>
                  <button
                    onClick={() => setAdvancedOpen(o => !o)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: advancedOpen ? 14 : 0,
                    }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                      {advancedOpen ? '▾' : '▸'} ⚙️ Advanced
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Hashtag sets, Content pillars</span>
                  </button>

                  {advancedOpen && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Hashtag Sets <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>JSON: [{"{"}"name":"Set A","tags":["#tag1","#tag2"]{"}"}]</span></label>
                        <textarea value={form.hashtagSets} onChange={e => setF('hashtagSets', e.target.value)}
                          placeholder='[{"name": "Brand Tags", "tags": ["#mybrand", "#growthhacking"]}]'
                          rows={3} style={taStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Content Pillars <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>JSON: [{"{"}"name":"Education","description":"..."{"}"}]</span></label>
                        <textarea value={form.contentPillars} onChange={e => setF('contentPillars', e.target.value)}
                          placeholder='[{"name": "Education", "description": "Tips and how-tos"}]'
                          rows={3} style={taStyle} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Brand Consistency Check ───────────────────────── */}
                <BrandConsistencyCheck
                  token={token}
                  apiBase={base}
                  brandId={selectedId}
                  activeWorkspaceId={activeWorkspaceId}
                />

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                    background: saving ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: saving ? '#94a3b8' : '#fff',
                    fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, transition: 'all 0.15s',
                  }}
                >
                  {saving ? '⏳ Saving…' : '💾 Save Brand'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
