import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Admin-only user roster page. Shows total user count, plan breakdown,
 * and a sortable / searchable table of every user with their current
 * subscription tier. Reads from GET /api/admin/users which returns the
 * shape:
 *   [{ id, email, firstName, lastName, membershipType, role,
 *      active, stripeCustomerId, createdAt, deactivatedAt }]
 *
 * Plan breakdown counts deactivated users separately so an "FREE: 12"
 * card always means active free users, not abandoned accounts.
 */
function AdminUsers() {
  const { authHeaders, apiBase } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const base = apiBase || 'https://api.wintaibot.com';

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${base}/api/admin/users`, { headers: authHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load users (HTTP ${res.status})`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [base, authHeaders]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Derived stats — recompute when users change. Active vs. deactivated split
  // matters because abandoned accounts shouldn't bloat the FREE-tier number
  // an admin uses to estimate cost or capacity.
  const stats = useMemo(() => {
    const byPlan = {};
    let activeCount = 0;
    let deactivatedCount = 0;
    let adminCount = 0;
    for (const u of users) {
      const plan = (u.membershipType || 'FREE').toUpperCase();
      byPlan[plan] = (byPlan[plan] || 0) + 1;
      if (u.active === false) deactivatedCount++;
      else activeCount++;
      if (u.role === 'ROLE_ADMIN') adminCount++;
    }
    return { byPlan, activeCount, deactivatedCount, adminCount, total: users.length };
  }, [users]);

  // Apply text search + plan filter, then sort. All client-side because the
  // user list is small (admin sees everyone but the org's max realistic size
  // is hundreds, not millions).
  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = users.filter(u => {
      if (planFilter !== 'ALL' && (u.membershipType || 'FREE').toUpperCase() !== planFilter) return false;
      if (q) {
        const hay = [u.email, u.firstName, u.lastName, u.id?.toString()]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      let cmp = 0;
      if (av < bv) cmp = -1; else if (av > bv) cmp = 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [users, search, planFilter, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };
  const sortIndicator = (col) => sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  // Distinct plan codes seen — used to render the filter dropdown so it
  // adapts if a new plan tier appears in the data without us hardcoding it.
  const knownPlans = useMemo(() => Object.keys(stats.byPlan).sort(), [stats.byPlan]);

  const fmtDate = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toISOString().split('T')[0]; } catch { return iso; }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>👥 Users & Plans</h1>
          <p style={s.subtitle}>Admin view — every registered account and what plan they're on.</p>
        </div>
        <button onClick={loadUsers} style={s.refreshBtn} disabled={loading}>
          {loading ? '⏳ Loading…' : '🔄 Refresh'}
        </button>
      </div>

      {/* Top-level KPI cards */}
      <div style={s.kpiGrid}>
        <Kpi label="Total users" value={stats.total} accent="#2563eb" />
        <Kpi label="Active" value={stats.activeCount} accent="#16a34a" />
        <Kpi label="Deactivated" value={stats.deactivatedCount} accent="#94a3b8" />
        <Kpi label="Admins" value={stats.adminCount} accent="#a855f7" />
      </div>

      {/* Per-plan breakdown — coloured chips so an admin can eyeball the mix */}
      <div style={s.planBreakdown}>
        <div style={s.sectionLabel}>Plan breakdown</div>
        <div style={s.chipRow}>
          {Object.entries(stats.byPlan).length === 0 && (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>No users yet.</span>
          )}
          {Object.entries(stats.byPlan)
            .sort(([, a], [, b]) => b - a)
            .map(([plan, count]) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan === planFilter ? 'ALL' : plan)}
                style={{
                  ...s.planChip,
                  background: planFilter === plan ? PLAN_COLORS(plan).strong : PLAN_COLORS(plan).soft,
                  color: planFilter === plan ? '#fff' : PLAN_COLORS(plan).text,
                  borderColor: PLAN_COLORS(plan).border,
                }}
                title={`Click to filter table to ${plan} only`}
              >
                <strong>{plan}</strong>&nbsp;· {count}
              </button>
            ))}
        </div>
      </div>

      {/* Filter + search bar */}
      <div style={s.filterRow}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by email, name, or user id"
          style={s.searchInput}
        />
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={s.planSelect}>
          <option value="ALL">All plans ({stats.total})</option>
          {knownPlans.map(p => (
            <option key={p} value={p}>{p} ({stats.byPlan[p]})</option>
          ))}
        </select>
        {(search || planFilter !== 'ALL') && (
          <button onClick={() => { setSearch(''); setPlanFilter('ALL'); }} style={s.clearBtn}>
            ✕ Clear filters
          </button>
        )}
        <span style={s.resultCount}>{visibleUsers.length} shown</span>
      </div>

      {error && <div style={s.errorBox}>⚠ {error}</div>}

      {/* Users table */}
      {loading ? (
        <div style={s.empty}>Loading users…</div>
      ) : visibleUsers.length === 0 ? (
        <div style={s.empty}>No users match the current filters.</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th} onClick={() => toggleSort('id')}>ID{sortIndicator('id')}</th>
                <th style={s.th} onClick={() => toggleSort('email')}>Email{sortIndicator('email')}</th>
                <th style={s.th}>Name</th>
                <th style={s.th} onClick={() => toggleSort('membershipType')}>Plan{sortIndicator('membershipType')}</th>
                <th style={s.th} onClick={() => toggleSort('role')}>Role{sortIndicator('role')}</th>
                <th style={s.th} onClick={() => toggleSort('active')}>Status{sortIndicator('active')}</th>
                <th style={s.th} onClick={() => toggleSort('createdAt')}>Joined{sortIndicator('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(u => {
                const plan = (u.membershipType || 'FREE').toUpperCase();
                const c = PLAN_COLORS(plan);
                return (
                  <tr key={u.id}>
                    <td style={s.tdMono}>{u.id}</td>
                    <td style={s.td}>{u.email || '—'}</td>
                    <td style={s.td}>
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || <span style={s.muted}>—</span>}
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.planBadge, background: c.soft, color: c.text, borderColor: c.border }}>
                        {plan}
                      </span>
                    </td>
                    <td style={s.td}>
                      {u.role === 'ROLE_ADMIN'
                        ? <span style={s.adminBadge}>ADMIN</span>
                        : <span style={s.muted}>user</span>}
                    </td>
                    <td style={s.td}>
                      {u.active === false
                        ? <span style={s.statusOff}>Deactivated</span>
                        : <span style={s.statusOn}>Active</span>}
                    </td>
                    <td style={s.tdMono}>{fmtDate(u.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Single coloured KPI tile — used in the top stats row.
function Kpi({ label, value, accent }) {
  return (
    <div style={{ ...s.kpiCard, borderLeft: `4px solid ${accent}` }}>
      <div style={s.kpiLabel}>{label}</div>
      <div style={s.kpiValue}>{value.toLocaleString()}</div>
    </div>
  );
}

// Per-plan colour palette — kept as a function so unknown plans (added in
// the backend later) get a sensible neutral fallback instead of a crash.
function PLAN_COLORS(plan) {
  switch ((plan || '').toUpperCase()) {
    case 'FREE':    return { soft: '#f1f5f9', strong: '#64748b', border: '#cbd5e1', text: '#475569' };
    case 'STARTER': return { soft: '#eff6ff', strong: '#2563eb', border: '#bfdbfe', text: '#1d4ed8' };
    case 'PRO':     return { soft: '#fdf4ff', strong: '#a855f7', border: '#e9d5ff', text: '#7c3aed' };
    case 'GROWTH':  return { soft: '#f0fdf4', strong: '#16a34a', border: '#bbf7d0', text: '#15803d' };
    case 'AGENCY':  return { soft: '#fff7ed', strong: '#ea580c', border: '#fed7aa', text: '#c2410c' };
    case 'MEMBER':  return { soft: '#fefce8', strong: '#ca8a04', border: '#fef08a', text: '#a16207' };
    default:        return { soft: '#f8fafc', strong: '#475569', border: '#e2e8f0', text: '#475569' };
  }
}

export default AdminUsers;

const s = {
  page: { padding: '24px 28px', fontFamily: "'Inter',-apple-system,sans-serif", color: '#1e293b' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  refreshBtn: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    color: '#475569',
  },

  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12, marginBottom: 18,
  },
  kpiCard: {
    background: '#fff', padding: '14px 18px', borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  kpiLabel: {
    fontSize: 11, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.6px',
  },
  kpiValue: { fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 },

  planBreakdown: { marginBottom: 18 },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  planChip: {
    padding: '6px 12px', borderRadius: 999, border: '1px solid',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.12s',
  },

  filterRow: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    marginBottom: 14,
  },
  searchInput: {
    flex: '1 1 280px', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
    background: '#fff', fontFamily: 'inherit',
  },
  planSelect: {
    padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, background: '#fff', fontFamily: 'inherit', cursor: 'pointer',
  },
  clearBtn: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca',
    background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  resultCount: { fontSize: 12, color: '#94a3b8', fontWeight: 600, marginLeft: 'auto' },

  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
    padding: '10px 14px', color: '#b91c1c', fontSize: 13, marginBottom: 14,
  },

  empty: {
    background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 10,
    padding: '40px 20px', color: '#94a3b8', textAlign: 'center', fontSize: 13,
  },

  tableWrap: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
    overflow: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
    background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    position: 'sticky', top: 0, cursor: 'pointer', userSelect: 'none',
  },
  td: { padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b' },
  tdMono: {
    padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
    color: '#475569', fontFamily: 'monospace', fontSize: 12,
  },
  muted: { color: '#94a3b8', fontStyle: 'italic' },

  planBadge: {
    display: 'inline-block', padding: '2px 10px', borderRadius: 6,
    fontSize: 11, fontWeight: 700, border: '1px solid',
    letterSpacing: '0.4px',
  },
  adminBadge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 10, fontWeight: 700, color: '#7c3aed',
    background: '#fdf4ff', border: '1px solid #e9d5ff',
    letterSpacing: '0.4px',
  },
  statusOn: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 10, fontWeight: 700, color: '#16a34a',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
  },
  statusOff: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 10, fontWeight: 700, color: '#94a3b8',
    background: '#f1f5f9', border: '1px solid #cbd5e1',
  },
};
