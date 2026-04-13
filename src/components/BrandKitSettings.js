import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BrandKitSettings() {
  const { user, token, apiBase, refetchUser } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [url,       setUrl]       = useState(user?.brandWebsite || '');
  const [scanning,  setScanning]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [scanResult, setScanResult] = useState(null);  // { logoUrl, colors[], favicon, error }
  const [scanErr,   setScanErr]   = useState('');
  const [saveMsg,   setSaveMsg]   = useState('');

  // Active brand from saved user data
  const [colors, setColors]   = useState(() => {
    try { return user?.brandColors ? JSON.parse(user.brandColors) : []; } catch { return []; }
  });
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');

  useEffect(() => {
    if (user?.brandColors) {
      try { setColors(JSON.parse(user.brandColors)); } catch { setColors([]); }
    }
    if (user?.logoUrl) setLogoUrl(user.logoUrl);
    if (user?.brandWebsite) setUrl(user.brandWebsite);
  }, [user]);

  const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const handleScan = async () => {
    if (!url.trim()) { setScanErr('Enter a website URL first.'); return; }
    setScanning(true); setScanResult(null); setScanErr(''); setSaveMsg('');
    try {
      const res = await fetch(`${base}/api/brand/scan`, {
        method: 'POST', headers: authH(), body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setScanResult(data);
      if (data.colors?.length > 0) setColors(data.colors);
      if (data.logoUrl) setLogoUrl(data.logoUrl);
      if (data.error) setScanErr('Partial scan: ' + data.error);
    } catch (e) {
      setScanErr(e.message || 'Could not scan website');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    setSaving(true); setSaveMsg(''); setScanErr('');
    try {
      const res = await fetch(`${base}/api/user/brand`, {
        method: 'PATCH', headers: authH(),
        body: JSON.stringify({
          brandColors: JSON.stringify(colors),
          logoUrl: logoUrl || '',
          brandWebsite: url.trim(),
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      await refetchUser();
      setSaveMsg('✅ Brand kit saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      setScanErr(e.message || 'Could not save brand kit');
    } finally {
      setSaving(false);
    }
  };

  const removeColor = (idx) => setColors(prev => prev.filter((_, i) => i !== idx));

  const hasBrand = colors.length > 0 || logoUrl;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
          🎨 Brand Kit
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          Scan your website to extract your brand colors and logo. Apply them to all templates in one click.
        </p>
      </div>

      {/* Scan Section */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16,
        padding: '20px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
          🔍 Scan Your Website
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="https://yourwebsite.com"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
              color: '#1e293b',
            }}
          />
          <button
            onClick={handleScan}
            disabled={scanning || !url.trim()}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: url.trim() && !scanning ? '#6366f1' : '#e2e8f0',
              color: url.trim() && !scanning ? '#fff' : '#94a3b8',
              fontSize: 13, fontWeight: 700,
              cursor: url.trim() && !scanning ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {scanning ? '⏳ Scanning…' : '🔍 Scan'}
          </button>
        </div>

        {scanErr && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#d97706' }}>⚠️ {scanErr}</div>
        )}

        {scanResult && !scanErr && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#16a34a' }}>
            ✅ Brand data extracted! Review and save below.
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16,
        padding: '20px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
          🎨 Brand Colors
        </div>

        {colors.length > 0 ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {colors.map((color, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: color, border: '2px solid #e2e8f0',
                  cursor: 'pointer', position: 'relative',
                }}
                  onClick={() => removeColor(i)}
                  title={`${color} — click to remove`}
                >
                  <div style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#ef4444', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                  }}>×</div>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{color}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
            No brand colors yet. Scan your website to extract them.
          </div>
        )}
      </div>

      {/* Logo Section */}
      <div style={{
        background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16,
        padding: '20px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
          🖼️ Brand Logo / Image
        </div>

        {logoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src={logoUrl}
              alt="Brand logo"
              style={{
                width: 80, height: 80, objectFit: 'contain',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                background: '#f8fafc',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, wordBreak: 'break-all' }}>
                {logoUrl}
              </div>
              <button
                onClick={() => setLogoUrl('')}
                style={{
                  padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                × Remove
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
            No logo detected. Scan your website to find it automatically.
          </div>
        )}

        {/* Manual logo URL override */}
        <div style={{ marginTop: 12 }}>
          <input
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="Or paste a logo URL manually"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 10,
              border: '1.5px solid #e2e8f0', fontSize: 12, outline: 'none',
              color: '#1e293b', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || (!colors.length && !logoUrl)}
        style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none',
          background: (colors.length || logoUrl) && !saving ? '#6366f1' : '#e2e8f0',
          color: (colors.length || logoUrl) && !saving ? '#fff' : '#94a3b8',
          fontSize: 15, fontWeight: 800,
          cursor: (colors.length || logoUrl) && !saving ? 'pointer' : 'not-allowed',
          opacity: saving ? 0.7 : 1,
          transition: 'all 0.15s',
        }}
      >
        {saving ? '⏳ Saving…' : '✅ Save Brand Kit'}
      </button>

      {saveMsg && (
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, color: '#16a34a', fontWeight: 600 }}>
          {saveMsg}
        </div>
      )}

      {/* Applied Notice */}
      {hasBrand && user?.brandColors && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 12,
          background: '#f0fdf4', border: '1.5px solid #bbf7d0',
          fontSize: 13, color: '#166534',
        }}>
          🎨 Your brand kit is active. Go to <strong>Templates</strong> to see the <strong>"My Brand"</strong> theme.
        </div>
      )}
    </div>
  );
}
