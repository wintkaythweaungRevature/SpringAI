import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Admin-only panel for creating, listing, and managing promo codes.
 * Visible to users where user.role === 'ROLE_ADMIN' (gated by parent route).
 */
export default function AdminPromoCodes() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    code: '',
    kind: 'FREE',
    percentOff: 50,
    durationKind: 'FOREVER',
    durationMonths: 3,
    durationUntilDate: '',
    maxUses: '',
    expiresAt: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  const loadCodes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${base}/api/admin/promo`, { headers: authHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load codes');
      }
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [base, authHeaders]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  const generateRandom = async () => {
    try {
      const res = await fetch(`${base}/api/admin/promo/random?prefix=WINT`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setForm(f => ({ ...f, code: data.code }));
    } catch {}
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccessMsg('');
    try {
      const body = { ...form };
      // Strip empty optional fields
      if (!body.maxUses) delete body.maxUses; else body.maxUses = Number(body.maxUses);
      if (!body.expiresAt) delete body.expiresAt;
      if (body.kind === 'FREE') {
        delete body.percentOff;
      } else {
        body.percentOff = Number(body.percentOff);
      }
      if (body.durationKind === 'FOREVER') {
        delete body.durationMonths;
        delete body.durationUntilDate;
      } else if (body.durationKind === 'MONTHS') {
        body.durationMonths = Number(body.durationMonths);
        delete body.durationUntilDate;
      } else if (body.durationKind === 'UNTIL_DATE') {
        delete body.durationMonths;
      }
      const res = await fetch(`${base}/api/admin/promo`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Create failed');
      }
      const created = await res.json();
      setSuccessMsg(`✅ Created code "${created.code}". Share it with your friend / beta user.`);
      setForm({ code: '', kind: 'FREE', percentOff: 50, durationKind: 'FOREVER', durationMonths: 3, durationUntilDate: '', maxUses: '', expiresAt: '', notes: '' });
      setShowForm(false);
      loadCodes();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await fetch(`${base}/api/admin/promo/${id}/${active ? 'disable' : 'enable'}`, {
        method: 'POST', headers: authHeaders(),
      });
      loadCodes();
    } catch {}
  };

  const deleteCode = async (id, code) => {
    if (!window.confirm(`Delete "${code}"? Existing redemptions will stay (audit), but the code can never be redeemed again.`)) return;
    try {
      await fetch(`${base}/api/admin/promo/${id}`, { method: 'DELETE', headers: authHeaders() });
      loadCodes();
    } catch {}
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setSuccessMsg(`📋 Copied "${text}" to clipboard`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>🎟 Promo Codes</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
            Generate codes friends and beta users can redeem for free access or a percentage discount.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={s.btnPrimary}
        >
          {showForm ? '× Cancel' : '+ New Code'}
        </button>
      </div>

      {/* Helper banner — explains how the user on the receiving end actually uses the code. */}
      <div style={s.helperBanner}>
        <strong>How users redeem:</strong> share the code via WhatsApp / email / SMS. The
        recipient signs up to W!ntAi (free tier), then enters the code in either{' '}
        <strong>Account Settings → Promo Code</strong> or on the <strong>Pricing</strong>{' '}
        page (or in any upgrade prompt). FREE codes activate instantly with no Stripe charge;
        percentage-discount codes apply at checkout.
      </div>

      {error && <div style={s.errorBox}>⚠ {error}</div>}
      {successMsg && <div style={s.successBox}>{successMsg}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={submitCreate} style={s.formCard}>
          <div style={s.row}>
            <label style={s.lbl}>
              Code
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={s.input} type="text"
                  placeholder="e.g. SARAH-FREE-2026 (or click 🎲 Random)"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                />
                <button type="button" onClick={generateRandom} style={s.btnSec} title="Generate random code">🎲</button>
              </div>
            </label>
          </div>

          <div style={s.row}>
            <label style={s.lbl}>
              Discount type
              <select style={s.input} value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))}>
                <option value="FREE">🎁 Free access (lifetime / time-limited)</option>
                <option value="PERCENT_OFF">💯 Percentage off</option>
              </select>
            </label>
            {form.kind === 'PERCENT_OFF' && (
              <label style={s.lbl}>
                Percent off (1–100)
                <input style={s.input} type="number" min="1" max="100"
                  value={form.percentOff}
                  onChange={e => setForm(f => ({ ...f, percentOff: e.target.value }))}
                />
              </label>
            )}
          </div>

          <div style={s.row}>
            <label style={s.lbl}>
              How long does the discount last?
              <select style={s.input} value={form.durationKind} onChange={e => setForm(f => ({ ...f, durationKind: e.target.value }))}>
                <option value="FOREVER">Forever / Lifetime</option>
                <option value="MONTHS">For N months</option>
                <option value="UNTIL_DATE">Until a specific date</option>
              </select>
            </label>
            {form.durationKind === 'MONTHS' && (
              <label style={s.lbl}>
                Number of months
                <input style={s.input} type="number" min="1" max="120"
                  value={form.durationMonths}
                  onChange={e => setForm(f => ({ ...f, durationMonths: e.target.value }))}
                />
              </label>
            )}
            {form.durationKind === 'UNTIL_DATE' && (
              <label style={s.lbl}>
                Discount expires on
                <input style={s.input} type="date"
                  value={form.durationUntilDate}
                  onChange={e => setForm(f => ({ ...f, durationUntilDate: e.target.value }))}
                />
              </label>
            )}
          </div>

          <div style={s.row}>
            <label style={s.lbl}>
              Max redemptions (blank = unlimited)
              <input style={s.input} type="number" min="1"
                placeholder="e.g. 100"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              />
            </label>
            <label style={s.lbl}>
              Code itself expires on (blank = never)
              <input style={s.input} type="date"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </label>
          </div>

          <div style={s.row}>
            <label style={s.lbl}>
              Notes (private — what is this code for?)
              <input style={s.input} type="text"
                placeholder="e.g. Sarah from college / Beta cohort #1"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={s.btnSec}>Cancel</button>
            <button type="submit" disabled={creating} style={{ ...s.btnPrimary, opacity: creating ? 0.6 : 1 }}>
              {creating ? '⏳ Creating…' : 'Create Code'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div style={s.empty}>Loading codes…</div>
      ) : codes.length === 0 ? (
        <div style={s.empty}>No codes yet. Click <strong>+ New Code</strong> to create one.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Code</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Duration</th>
                <th style={s.th}>Used / Max</th>
                <th style={s.th}>Expires</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Notes</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id}>
                  <td style={s.td}>
                    <code style={s.codeChip} onClick={() => copyToClipboard(c.code)} title="Click to copy">
                      {c.code}
                    </code>
                  </td>
                  <td style={s.td}>
                    {c.kind === 'FREE' ? '🎁 Free' :
                     c.kind === 'PERCENT_OFF' ? `💯 ${c.percentOff}% off` :
                     `$${(c.fixedOffCents || 0) / 100} off`}
                  </td>
                  <td style={s.td}>
                    {c.durationKind === 'FOREVER' ? 'Forever' :
                     c.durationKind === 'MONTHS' ? `${c.durationMonths} mo` :
                     c.durationUntilDate ? `Until ${c.durationUntilDate}` : '—'}
                  </td>
                  <td style={s.td}>
                    {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : '/ ∞'}
                  </td>
                  <td style={s.td}>{c.expiresAt ? c.expiresAt.split('T')[0] : 'Never'}</td>
                  <td style={s.td}>
                    {c.active
                      ? <span style={s.badgeActive}>Active</span>
                      : <span style={s.badgeInactive}>Disabled</span>}
                  </td>
                  <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{c.notes || '—'}</td>
                  <td style={s.td}>
                    <button onClick={() => copyToClipboard(c.code)} style={s.iconBtn} title="Copy code">📋</button>
                    <button onClick={() => toggleActive(c.id, c.active)} style={s.iconBtn} title={c.active ? 'Disable' : 'Enable'}>
                      {c.active ? '🚫' : '✅'}
                    </button>
                    <button onClick={() => deleteCode(c.id, c.code)} style={{ ...s.iconBtn, color: '#ef4444' }} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: 'inherit',
    background: 'linear-gradient(160deg, #060a14 0%, #0f172a 35%, #1e1b4b 70%, #0a1020 100%)',
    borderRadius: 18,
    minHeight: '70vh',
    color: '#e2e8f0',
  },
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
    fontSize: 13, fontWeight: 700,
  },
  btnSec: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.06)', color: '#cbd5e1',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13,
  },
  successBox: {
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)',
    color: '#6ee7b7', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13,
  },
  formCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 20, marginBottom: 20,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  lbl: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200, fontSize: 12, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(15,23,42,0.6)', color: '#f1f5f9', fontSize: 14, marginTop: 4,
    fontFamily: 'inherit',
  },
  empty: { textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 },
  tableWrap: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  td: { padding: '12px', fontSize: 13, color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  codeChip: {
    background: '#1e1b4b', color: '#a5b4fc', padding: '4px 10px', borderRadius: 6,
    fontSize: 13, fontFamily: '"JetBrains Mono", ui-monospace, monospace', cursor: 'pointer', userSelect: 'all',
  },
  badgeActive: { background: 'rgba(16,185,129,0.18)', color: '#6ee7b7', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  badgeInactive: { background: 'rgba(148,163,184,0.18)', color: '#94a3b8', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, padding: '4px 6px' },
  helperBanner: {
    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
    color: '#cbd5e1', padding: '12px 16px', borderRadius: 10, marginBottom: 16,
    fontSize: 13, lineHeight: 1.55,
  },
};
