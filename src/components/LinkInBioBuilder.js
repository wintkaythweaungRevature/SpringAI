import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'https://api.wintaibot.com';

const THEME_COLORS = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Blue',    value: '#2563eb' },
  { label: 'Purple',  value: '#7c3aed' },
  { label: 'Pink',    value: '#db2777' },
  { label: 'Red',     value: '#dc2626' },
  { label: 'Orange',  value: '#ea580c' },
  { label: 'Teal',    value: '#0d9488' },
  { label: 'Dark',    value: '#1e293b' },
];

export default function LinkInBioBuilder() {
  const { authHeaders } = useAuth();

  /* ── page state ── */
  const [exists, setExists]       = useState(false);
  const [slug, setSlug]           = useState('');
  const [displayName, setDisplay] = useState('');
  const [bio, setBio]             = useState('');
  const [themeColor, setTheme]    = useState('#6366f1');
  const [publicUrl, setPublicUrl] = useState('');
  const [links, setLinks]         = useState([]);

  /* ── UI state ── */
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [error, setError]         = useState('');

  /* ── add-link form ── */
  const [showAdd, setShowAdd]     = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newUrl, setNewUrl]       = useState('');
  const [addError, setAddError]   = useState('');

  /* ── edit link ── */
  const [editId, setEditId]       = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl]     = useState('');

  const applyData = useCallback((data) => {
    setExists(data.exists);
    if (data.exists) {
      setSlug(data.slug || '');
      setDisplay(data.displayName || '');
      setBio(data.bio || '');
      setTheme(data.themeColor || '#6366f1');
      setPublicUrl(data.publicUrl || '');
      setLinks(data.links || []);
    }
  }, []);

  /* ── initial load ── */
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/bio`, { headers: authHeaders() })
      .then(r => r.json())
      .then(applyData)
      .catch(() => setError('Failed to load bio page'))
      .finally(() => setLoading(false));
  }, [authHeaders, applyData]);

  /* ── save bio page ── */
  const savePage = async () => {
    setError('');
    if (!slug.trim()) { setError('Slug is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/bio`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), displayName, bio, themeColor }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Save failed'); return; }
      applyData(data);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  /* ── add link ── */
  const addLink = async () => {
    setAddError('');
    if (!newTitle.trim()) { setAddError('Title required'); return; }
    if (!newUrl.trim())   { setAddError('URL required'); return; }
    try {
      const res = await fetch(`${API}/api/bio/links`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), url: newUrl.trim(), position: links.length }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || 'Failed to add link'); return; }
      applyData(data);
      setNewTitle(''); setNewUrl(''); setShowAdd(false);
    } catch {
      setAddError('Network error');
    }
  };

  /* ── delete link ── */
  const deleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      const res = await fetch(`${API}/api/bio/links/${id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      const data = await res.json();
      applyData(data);
    } catch { /* silent */ }
  };

  /* ── toggle active ── */
  const toggleActive = async (link) => {
    try {
      const res = await fetch(`${API}/api/bio/links/${link.id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      const data = await res.json();
      applyData(data);
    } catch { /* silent */ }
  };

  /* ── save edit ── */
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/api/bio/links/${id}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, url: editUrl }),
      });
      const data = await res.json();
      applyData(data);
      setEditId(null);
    } catch { /* silent */ }
  };

  /* ── move link up/down ── */
  const moveLink = async (index, direction) => {
    const newLinks = [...links];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;
    [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
    const reordered = newLinks.map((l, i) => ({ id: l.id, position: i }));
    try {
      const res = await fetch(`${API}/api/bio/links/reorder`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered),
      });
      const data = await res.json();
      applyData(data);
    } catch { /* silent */ }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setSaveMsg('URL copied!');
      setTimeout(() => setSaveMsg(''), 2000);
    });
  };

  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading your bio page…</p>
      </div>
    );
  }

  return (
    <div style={s.wrap}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🔗 Link in Bio</h2>
          <p style={s.sub}>One link for all your content. Put <strong>www.wintaibot.com/u/{slug || 'yourname'}</strong> in your Instagram bio.</p>
        </div>
        {exists && publicUrl && (
          <div style={s.urlRow}>
            <span style={s.urlPill}>{publicUrl.replace('https://', '')}</span>
            <button style={s.copyBtn} onClick={copyUrl} title="Copy URL">📋 Copy</button>
            <a href={publicUrl} target="_blank" rel="noreferrer" style={s.openBtn}>↗ Open</a>
          </div>
        )}
      </div>

      {saveMsg && <div style={s.successBanner}>{saveMsg}</div>}
      {error   && <div style={s.errorBanner}>{error}</div>}

      <div style={s.grid}>

        {/* ── LEFT: Profile Editor ── */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Profile</h3>

          <label style={s.label}>Slug (your unique URL path)</label>
          <div style={s.slugRow}>
            <span style={s.slugPrefix}>www.wintaibot.com/u/</span>
            <input
              style={s.slugInput}
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_\-]/g, ''))}
              placeholder="yourname"
              maxLength={40}
            />
          </div>

          <label style={s.label}>Display Name</label>
          <input
            style={s.input}
            value={displayName}
            onChange={e => setDisplay(e.target.value)}
            placeholder="John Doe"
          />

          <label style={s.label}>Bio</label>
          <textarea
            style={s.textarea}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Creator · Entrepreneur · Fitness Coach"
            rows={3}
          />

          <label style={s.label}>Theme Color</label>
          <div style={s.colorRow}>
            {THEME_COLORS.map(c => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setTheme(c.value)}
                style={{
                  ...s.colorSwatch,
                  background: c.value,
                  outline: themeColor === c.value ? `3px solid ${c.value}` : 'none',
                  outlineOffset: 2,
                  transform: themeColor === c.value ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
            <input
              type="color"
              value={themeColor}
              onChange={e => setTheme(e.target.value)}
              style={s.colorPicker}
              title="Custom color"
            />
          </div>

          <button
            style={{ ...s.saveBtn, background: themeColor, opacity: saving ? 0.7 : 1 }}
            onClick={savePage}
            disabled={saving}
          >
            {saving ? 'Saving…' : (exists ? '💾 Save Changes' : '🚀 Create Bio Page')}
          </button>
        </div>

        {/* ── RIGHT: Links Manager ── */}
        <div style={s.card}>
          <div style={s.linksHeader}>
            <h3 style={s.cardTitle}>Links</h3>
            {exists && (
              <button style={{ ...s.addBtn, background: themeColor }} onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? '✕ Cancel' : '+ Add Link'}
              </button>
            )}
          </div>

          {!exists && (
            <p style={s.hint}>Create your bio page first (left panel), then add links.</p>
          )}

          {/* Add link form */}
          {showAdd && (
            <div style={s.addForm}>
              {addError && <div style={s.addError}>{addError}</div>}
              <input
                style={s.input}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Link title (e.g. My YouTube)"
              />
              <input
                style={s.input}
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                onKeyDown={e => e.key === 'Enter' && addLink()}
              />
              <button style={{ ...s.saveBtn, background: themeColor }} onClick={addLink}>
                ➕ Add
              </button>
            </div>
          )}

          {/* Link list */}
          {links.length === 0 && exists && !showAdd && (
            <p style={s.hint}>No links yet. Click "+ Add Link" to start.</p>
          )}

          {links.map((link, idx) => (
            <div key={link.id} style={{ ...s.linkRow, opacity: link.isActive ? 1 : 0.5 }}>
              {editId === link.id ? (
                /* ── Edit mode ── */
                <div style={{ flex: 1 }}>
                  <input
                    style={s.editInput}
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    style={s.editInput}
                    value={editUrl}
                    onChange={e => setEditUrl(e.target.value)}
                    placeholder="URL"
                  />
                  <div style={s.editBtns}>
                    <button style={s.smallGreen} onClick={() => saveEdit(link.id)}>✓ Save</button>
                    <button style={s.smallGray} onClick={() => setEditId(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Reorder arrows ── */}
                  <div style={s.arrows}>
                    <button style={s.arrowBtn} onClick={() => moveLink(idx, 'up')} disabled={idx === 0} title="Move up">▲</button>
                    <button style={s.arrowBtn} onClick={() => moveLink(idx, 'down')} disabled={idx === links.length - 1} title="Move down">▼</button>
                  </div>

                  {/* ── Link info ── */}
                  <div style={s.linkInfo}>
                    <span style={s.linkTitle}>{link.title}</span>
                    <a href={link.url} target="_blank" rel="noreferrer" style={s.linkUrl}>
                      {link.url.length > 40 ? link.url.slice(0, 40) + '…' : link.url}
                    </a>
                  </div>

                  {/* ── Stats ── */}
                  <span style={s.clickBadge} title="Clicks">👆 {link.clickCount || 0}</span>

                  {/* ── Actions ── */}
                  <div style={s.actions}>
                    <button
                      style={{ ...s.actionBtn, color: link.isActive ? '#10b981' : '#94a3b8' }}
                      onClick={() => toggleActive(link)}
                      title={link.isActive ? 'Visible — click to hide' : 'Hidden — click to show'}
                    >
                      {link.isActive ? '👁' : '🙈'}
                    </button>
                    <button
                      style={{ ...s.actionBtn, color: '#6366f1' }}
                      onClick={() => { setEditId(link.id); setEditTitle(link.title); setEditUrl(link.url); }}
                      title="Edit"
                    >✏️</button>
                    <button
                      style={{ ...s.actionBtn, color: '#ef4444' }}
                      onClick={() => deleteLink(link.id)}
                      title="Delete"
                    >🗑</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* ── PREVIEW ── */}
      {exists && (
        <div style={{ ...s.card, marginTop: 24 }}>
          <h3 style={s.cardTitle}>Preview</h3>
          <p style={s.previewHint}>
            This is how your page looks at{' '}
            <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: themeColor }}>{publicUrl}</a>
          </p>
          <div style={{ ...s.previewCard, borderTop: `4px solid ${themeColor}` }}>
            <div style={{ ...s.previewAvatar, background: themeColor }}>
              {(displayName || slug || '?')[0].toUpperCase()}
            </div>
            <h4 style={s.previewName}>{displayName || slug || 'Your Name'}</h4>
            {bio && <p style={s.previewBio}>{bio}</p>}
            <div style={{ marginTop: 16, width: '100%' }}>
              {links.filter(l => l.isActive).map(l => (
                <div key={l.id} style={{ ...s.previewLinkBtn, background: themeColor }}>
                  {l.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Styles ── */
const s = {
  wrap: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px 20px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 300,
  },
  spinner: {
    width: 36, height: 36,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex', flexWrap: 'wrap', gap: 16,
    alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 24,
  },
  title:  { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  sub:    { fontSize: 13, color: '#64748b', marginTop: 4 },
  urlRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  urlPill: {
    background: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: 20, padding: '6px 14px',
    fontSize: 12, color: '#475569', fontFamily: 'monospace',
  },
  copyBtn: {
    background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: 20, padding: '6px 14px', fontSize: 12,
    cursor: 'pointer', fontWeight: 600,
  },
  openBtn: {
    background: '#f1f5f9', color: '#6366f1', border: '1px solid #c7d2fe',
    borderRadius: 20, padding: '6px 14px', fontSize: 12,
    fontWeight: 600, textDecoration: 'none',
  },
  successBanner: {
    background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
    borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 14,
  },
  errorBanner: {
    background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
    borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    padding: '24px',
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 20, marginTop: 0 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, marginTop: 16 },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box', marginBottom: 4,
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, color: '#1e293b', background: '#f8fafc',
    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  slugRow: { display: 'flex', alignItems: 'center', gap: 0 },
  slugPrefix: {
    background: '#f1f5f9', border: '1.5px solid #e2e8f0',
    borderRight: 'none', borderRadius: '10px 0 0 10px',
    padding: '10px 10px', fontSize: 12, color: '#94a3b8',
    whiteSpace: 'nowrap',
  },
  slugInput: {
    flex: 1, padding: '10px 12px',
    border: '1.5px solid #e2e8f0', borderRadius: '0 10px 10px 0',
    fontSize: 14, color: '#1e293b', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box',
  },
  colorRow: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' },
  colorSwatch: {
    width: 28, height: 28, borderRadius: '50%',
    border: 'none', cursor: 'pointer',
    transition: 'transform 0.15s',
  },
  colorPicker: {
    width: 32, height: 28, border: '1.5px solid #e2e8f0',
    borderRadius: 8, padding: 2, cursor: 'pointer',
    background: 'transparent',
  },
  saveBtn: {
    display: 'block', width: '100%',
    marginTop: 24, padding: '12px 20px',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s',
  },
  linksHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addBtn: {
    border: 'none', color: '#fff', borderRadius: 20,
    padding: '6px 16px', fontSize: 12, fontWeight: 700,
    cursor: 'pointer',
  },
  addForm: {
    background: '#f8fafc', borderRadius: 12, padding: 16,
    marginBottom: 16, border: '1px solid #e2e8f0',
  },
  addError: {
    color: '#dc2626', fontSize: 12, marginBottom: 8,
    background: '#fee2e2', padding: '6px 10px', borderRadius: 6,
  },
  hint: { color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' },
  linkRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '10px 12px', marginBottom: 8,
  },
  arrows: { display: 'flex', flexDirection: 'column', gap: 2 },
  arrowBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#94a3b8', fontSize: 10, padding: '1px 4px',
    lineHeight: 1,
  },
  linkInfo: { flex: 1, overflow: 'hidden' },
  linkTitle: { display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b' },
  linkUrl: {
    display: 'block', fontSize: 11, color: '#6366f1',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  clickBadge: {
    fontSize: 11, color: '#64748b', background: '#e2e8f0',
    borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', gap: 4 },
  actionBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 15, padding: '4px',
  },
  editInput: {
    display: 'block', width: '100%', padding: '7px 10px',
    border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13,
    marginBottom: 6, boxSizing: 'border-box',
  },
  editBtns: { display: 'flex', gap: 6 },
  smallGreen: {
    background: '#10b981', color: '#fff', border: 'none',
    borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
  },
  smallGray: {
    background: '#e2e8f0', color: '#475569', border: 'none',
    borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
  },
  previewHint: { fontSize: 12, color: '#94a3b8', marginBottom: 16 },
  previewCard: {
    maxWidth: 340, margin: '0 auto',
    background: '#f8fafc', borderRadius: 16,
    padding: '28px 24px', textAlign: 'center',
  },
  previewAvatar: {
    width: 60, height: 60, borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12,
  },
  previewName: { fontSize: 17, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' },
  previewBio:  { fontSize: 12, color: '#64748b', margin: '0 0 4px' },
  previewLinkBtn: {
    display: 'block', color: '#fff', borderRadius: 10,
    padding: '11px 16px', marginBottom: 8,
    fontSize: 13, fontWeight: 600, textAlign: 'center',
  },
};
