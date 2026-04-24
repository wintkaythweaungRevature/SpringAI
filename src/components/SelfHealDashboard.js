import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';
import FallingPlatformsAnimation from './FallingPlatformsAnimation';

const PLATFORM_META = {
  instagram: { id: 'instagram', color: '#E1306C' },
  facebook:  { id: 'facebook',  color: '#1877F2' },
  x:         { id: 'x',         color: '#e2e8f0' },
  twitter:   { id: 'twitter',   color: '#e2e8f0' },
  tiktok:    { id: 'tiktok',   color: '#010101'  },
  youtube:   { id: 'youtube',  color: '#FF0000'  },
  linkedin:  { id: 'linkedin', color: '#0A66C2'  },
};

function getMediaBadge(post) {
  const mt = (post.mediaType || post.type || '').toUpperCase();
  if (mt.includes('VIDEO'))                        return { label: 'VIDEO', color: '#818cf8' };
  if (mt.includes('IMAGE') || mt.includes('PHOTO') || mt.includes('CAROUSEL')) return { label: 'IMAGE', color: '#f472b6' };
  if (mt.includes('TEXT') || mt.includes('LINK'))  return { label: 'TEXT',  color: '#94a3b8' };
  if (post.mediaUrl)                               return { label: 'MEDIA', color: '#818cf8' };
  return null;
}

// ─── Shared style tokens ────────────────────────────────────────────────────
// Dark gradient matches the landing-page final-CTA backdrop so the falling-platforms
// animation reads the same way it does on the landing page.
const BG_PAGE   = 'linear-gradient(160deg, #060a14 0%, #0f172a 35%, #1e1b4b 70%, #0a1020 100%)';
const BG_CARD   = '#1e293b';
const BG_INPUT  = '#0f172a';
const ACCENT    = '#6366f1';
const ACCENT_HV = '#4f52d4';
const TEXT_PRI  = '#f1f5f9';
const TEXT_SEC  = '#94a3b8';
const BORDER    = '#334155';

// ─── Reusable inline styles ─────────────────────────────────────────────────
const cardStyle = {
  background: BG_CARD,
  borderRadius: 12,
  padding: '24px 28px',
  border: `1px solid ${BORDER}`,
  marginBottom: 24,
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: TEXT_SEC,
  marginBottom: 6,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const inputStyle = {
  background: BG_INPUT,
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  color: TEXT_PRI,
  padding: '8px 12px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnPrimaryStyle = {
  background: ACCENT,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '9px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s',
};

const btnSecondaryStyle = {
  background: '#334155',
  color: TEXT_PRI,
  border: 'none',
  borderRadius: 8,
  padding: '9px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.15s',
};

// ─── Toggle Switch component ─────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, id }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          background: checked ? ACCENT : '#475569',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 25 : 3,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      {label && (
        <label
          htmlFor={id}
          style={{ color: TEXT_PRI, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
          onClick={() => onChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function SelfHealDashboard() {
  const { apiBase, authHeaders } = useAuth();

  // Settings state
  const [settings, setSettings] = useState({
    enabled: false,
    likesThreshold: 5,
    engagementRateThreshold: 1, // displayed as %; stored as 0.01 on backend
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null); // { type: 'success'|'error', text }

  // Heal log state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');

  // Manual trigger state
  const [triggerExpanded, setTriggerExpanded] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState(null); // { type: 'success'|'error', text }
  const [triggerFromDate, setTriggerFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [triggerToDate, setTriggerToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [triggerPosts, setTriggerPosts] = useState([]);
  const [triggerPostsLoading, setTriggerPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // ─── Fetch settings ────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/social/self-heal/settings`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSettings({
        enabled: !!data.enabled,
        likesThreshold: data.likesThreshold ?? 5,
        // Backend stores as decimal (0.01 = 1%), show as percentage
        engagementRateThreshold:
          data.engagementRateThreshold != null
            ? Math.round(data.engagementRateThreshold * 100 * 100) / 100
            : 1,
      });
    } catch (err) {
      // Keep defaults on error; settings save will show its own error
    } finally {
      setSettingsLoading(false);
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch heal log ────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const res = await fetch(`${apiBase}/api/social/self-heal/log`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data.slice(0, 50) : []);
    } catch (err) {
      setLogsError('Failed to load heal history. Please refresh.');
    } finally {
      setLogsLoading(false);
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, [fetchSettings, fetchLogs]);

  // ─── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const payload = {
        enabled: settings.enabled,
        likesThreshold: settings.likesThreshold,
        // Convert display % back to decimal for backend
        engagementRateThreshold: settings.engagementRateThreshold / 100,
      };
      const res = await fetch(`${apiBase}/api/social/self-heal/settings`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
      }
      setSettingsMsg({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err) {
      setSettingsMsg({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSettingsSaving(false);
      setTimeout(() => setSettingsMsg(null), 4000);
    }
  };

  // ─── Manual trigger ────────────────────────────────────────────────────────
  const handleTrigger = async () => {
    if (!selectedPost) {
      setTriggerMsg({ type: 'error', text: 'Please select a post first.' });
      return;
    }
    setTriggerLoading(true);
    setTriggerMsg(null);
    try {
      const res = await fetch(
        `${apiBase}/api/social/self-heal/trigger/${selectedPost.id}`,
        { method: 'POST', headers: authHeaders() }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json().catch(() => ({}));
      setTriggerMsg({
        type: 'success',
        text: data.message || 'Self-heal triggered successfully. Check the history below.',
      });
      setSelectedPost(null);
      setTriggerPosts([]);
      setTimeout(fetchLogs, 1500);
    } catch (err) {
      setTriggerMsg({ type: 'error', text: err.message || 'Trigger failed. Please try again.' });
    } finally {
      setTriggerLoading(false);
    }
  };

  const fetchPostsInRange = useCallback(async () => {
    setTriggerPostsLoading(true);
    setTriggerPosts([]);
    setSelectedPost(null);
    setTriggerMsg(null);
    try {
      const res = await fetch(`${apiBase}/api/social/post/history?limit=200`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.posts || []);
      const from = new Date(triggerFromDate);
      const to   = new Date(triggerToDate); to.setHours(23, 59, 59, 999);
      const filtered = list.filter(p => {
        const ts = new Date(p.publishedAt || p.scheduledAt || p.createdAt);
        return ts >= from && ts <= to;
      });
      setTriggerPosts(filtered);
    } catch { setTriggerPosts([]); }
    finally { setTriggerPostsLoading(false); }
  }, [apiBase, authHeaders, triggerFromDate, triggerToDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const truncate = (str, len) => {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '…' : str;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG_PAGE,
        color: TEXT_PRI,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: '32px 24px',
        maxWidth: 860,
        margin: '0 auto',
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
      }}
    >
      <FallingPlatformsAnimation mode="background" />

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: TEXT_PRI }}>
          🩺 Self-Healing Content
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: TEXT_SEC }}>
          AI auto-repairs low-engagement posts
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Settings
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 20px', color: TEXT_PRI }}>
          Settings
        </h2>

        {settingsLoading ? (
          <p style={{ color: TEXT_SEC, fontSize: 14 }}>Loading settings…</p>
        ) : (
          <>
            {/* Enable toggle */}
            <div style={{ marginBottom: 24 }}>
              <ToggleSwitch
                id="self-heal-enabled"
                checked={settings.enabled}
                onChange={(val) => setSettings((s) => ({ ...s, enabled: val }))}
                label="Enable Self-Healing"
              />
            </div>

            {/* Thresholds row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Likes threshold */}
              <div>
                <label style={labelStyle} htmlFor="likes-threshold">
                  Minimum Likes Threshold
                </label>
                <input
                  id="likes-threshold"
                  type="number"
                  min={0}
                  step={1}
                  value={settings.likesThreshold}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      likesThreshold: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              {/* Engagement rate threshold */}
              <div>
                <label style={labelStyle} htmlFor="engagement-threshold">
                  Engagement Rate Threshold %
                </label>
                <input
                  id="engagement-threshold"
                  type="number"
                  min={0}
                  step={0.1}
                  value={settings.engagementRateThreshold}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      engagementRateThreshold: parseFloat(e.target.value) || 0,
                    }))
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Save button + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                style={{
                  ...btnPrimaryStyle,
                  opacity: settingsSaving ? 0.7 : 1,
                  cursor: settingsSaving ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!settingsSaving) e.currentTarget.style.background = ACCENT_HV;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ACCENT;
                }}
              >
                {settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>

              {settingsMsg && (
                <span
                  style={{
                    fontSize: 13,
                    color: settingsMsg.type === 'success' ? '#4ade80' : '#f87171',
                    fontWeight: 500,
                  }}
                >
                  {settingsMsg.type === 'success' ? '✓ ' : '✗ '}
                  {settingsMsg.text}
                </span>
              )}
            </div>

            {/* Info note */}
            <p
              style={{
                marginTop: 16,
                marginBottom: 0,
                fontSize: 13,
                color: TEXT_SEC,
                background: 'rgba(99,102,241,0.08)',
                border: `1px solid rgba(99,102,241,0.25)`,
                borderRadius: 8,
                padding: '10px 14px',
                lineHeight: 1.55,
              }}
            >
              ℹ️ Posts published 3–12 hours ago with likes below threshold will be automatically healed.
            </p>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Heal History
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: TEXT_PRI }}>
            Heal History
          </h2>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            style={{
              ...btnSecondaryStyle,
              padding: '6px 14px',
              fontSize: 12,
              opacity: logsLoading ? 0.6 : 1,
              cursor: logsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {logsLoading ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>

        {logsLoading ? (
          <p style={{ color: TEXT_SEC, fontSize: 14 }}>Loading heal history…</p>
        ) : logsError ? (
          <p style={{ color: '#f87171', fontSize: 14 }}>{logsError}</p>
        ) : logs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 0',
              color: TEXT_SEC,
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🩺</div>
            <p style={{ margin: 0 }}>
              No healed posts yet. Enable self-healing above to get started.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13,
                color: TEXT_PRI,
              }}
            >
              <thead>
                <tr>
                  {['Date', 'Platform', 'Action', 'Status', 'Preview'].map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        color: TEXT_SEC,
                        fontWeight: 600,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        borderBottom: `1px solid ${BORDER}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const platformKey = (log.platform || '').toLowerCase();
                  const pmeta = PLATFORM_META[platformKey] || { id: platformKey, color: '#64748b' };
                  const isCaption = log.actionType === 'CAPTION_EDIT';
                  return (
                    <tr
                      key={log.id ?? idx}
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {/* Date */}
                      <td
                        style={{
                          padding: '10px 12px',
                          whiteSpace: 'nowrap',
                          color: TEXT_SEC,
                        }}
                      >
                        {formatDate(log.actionTakenAt)}
                      </td>

                      {/* Platform */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <PlatformIcon platform={pmeta} size={16} />
                          <span style={{ textTransform: 'capitalize', fontSize: 13 }}>
                            {log.platform || '—'}
                          </span>
                        </span>
                      </td>

                      {/* Action badge */}
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            background: isCaption
                              ? 'rgba(59,130,246,0.18)'
                              : 'rgba(34,197,94,0.15)',
                            color: isCaption ? '#60a5fa' : '#4ade80',
                            border: isCaption
                              ? '1px solid rgba(59,130,246,0.35)'
                              : '1px solid rgba(34,197,94,0.35)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isCaption ? 'Caption Edit' : 'Boost Comment'}
                        </span>
                      </td>

                      {/* Status */}
                      <td
                        style={{
                          padding: '10px 12px',
                          textAlign: 'center',
                          fontSize: 16,
                        }}
                        title={log.success ? 'Success' : log.errorMsg || 'Failed'}
                      >
                        {log.success ? '✅' : '❌'}
                      </td>

                      {/* Preview */}
                      <td
                        style={{
                          padding: '10px 12px',
                          color: TEXT_SEC,
                          maxWidth: 280,
                        }}
                        title={log.originalCaption || ''}
                      >
                        {truncate(log.originalCaption, 60)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {logs.length >= 50 && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: TEXT_SEC,
                  textAlign: 'right',
                }}
              >
                Showing the 50 most recent entries.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — Manual Trigger (collapsible)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={cardStyle}>
        {/* Collapsible header */}
        <button
          onClick={() => setTriggerExpanded((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: 11,
              color: TEXT_SEC,
              transition: 'transform 0.2s',
              transform: triggerExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▶
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: TEXT_PRI }}>
            Manual Trigger
          </h2>
          <span
            style={{
              marginLeft: 6,
              fontSize: 12,
              color: TEXT_SEC,
              fontWeight: 400,
            }}
          >
            {triggerExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </button>

        {/* Collapsible content */}
        {triggerExpanded && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 13, color: TEXT_SEC, marginTop: 0, marginBottom: 16 }}>
              Pick a date range to find your posts, then select one and trigger a self-heal.
            </p>

            {/* Date range row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}>From</label>
                <input type="date" value={triggerFromDate} onChange={e => setTriggerFromDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}>To</label>
                <input type="date" value={triggerToDate} onChange={e => setTriggerToDate(e.target.value)} style={inputStyle} />
              </div>
              <button
                onClick={fetchPostsInRange}
                disabled={triggerPostsLoading}
                style={{ ...btnPrimaryStyle, flexShrink: 0, alignSelf: 'flex-end', opacity: triggerPostsLoading ? 0.7 : 1 }}
                onMouseEnter={e => { if (!triggerPostsLoading) e.currentTarget.style.background = ACCENT_HV; }}
                onMouseLeave={e => { e.currentTarget.style.background = ACCENT; }}
              >
                {triggerPostsLoading ? 'Loading…' : '🔍 Find Posts'}
              </button>
            </div>

            {/* Post list */}
            {triggerPosts.length > 0 && (
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {triggerPosts.map(post => {
                    const isSelected = selectedPost?.id === post.id;
                    const status = (post.status || '').toUpperCase();
                    const statusColors = {
                      FAILED:  { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
                      PENDING: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
                      SUCCESS: { bg: 'rgba(74,222,128,0.15)',  text: '#4ade80' },
                    };
                    const sc = statusColors[status] || { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' };
                    const ts = post.publishedAt || post.scheduledAt || post.createdAt;
                    const dateStr = ts ? new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const caption = post.caption ? (post.caption.length > 60 ? post.caption.slice(0, 60) + '…' : post.caption) : '(no caption)';
                    const platformKey = post.platform?.toLowerCase();
                    const pmeta = PLATFORM_META[platformKey] || { id: platformKey, color: '#64748b' };
                    const mediaBadge = getMediaBadge(post);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(isSelected ? null : post)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '10px 14px', background: isSelected ? 'rgba(99,102,241,0.18)' : status === 'FAILED' ? 'rgba(248,113,113,0.05)' : 'transparent',
                          border: 'none', borderBottom: `1px solid ${BORDER}`,
                          outline: isSelected ? `2px solid ${ACCENT}` : 'none',
                          cursor: 'pointer', textAlign: 'left', color: TEXT_PRI,
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = status === 'FAILED' ? 'rgba(248,113,113,0.05)' : 'transparent'; }}
                      >
                        {/* Platform logo */}
                        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                          <PlatformIcon platform={pmeta} size={18} />
                        </span>
                        {/* Media type badge */}
                        {mediaBadge && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                            background: mediaBadge.color + '22', color: mediaBadge.color,
                            border: `1px solid ${mediaBadge.color}44`, letterSpacing: '0.05em',
                          }}>{mediaBadge.label}</span>
                        )}
                        <span style={{ flex: 1, fontSize: 13, color: TEXT_PRI, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caption}</span>
                        <span style={{ fontSize: 11, color: TEXT_SEC, flexShrink: 0, marginRight: 8 }}>{dateStr}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: sc.bg, color: sc.text, flexShrink: 0 }}>{status || 'UNKNOWN'}</span>
                        {isSelected && <span style={{ fontSize: 14, color: ACCENT, flexShrink: 0 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding: '8px 14px', fontSize: 12, color: TEXT_SEC, background: 'rgba(0,0,0,0.15)' }}>
                  {triggerPosts.length} post{triggerPosts.length !== 1 ? 's' : ''} found
                  {selectedPost ? ` — 1 selected` : ' — click a post to select it'}
                </div>
              </div>
            )}

            {triggerPosts.length === 0 && !triggerPostsLoading && triggerPosts !== null && (
              <p style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 14 }}>No posts found — try a different date range.</p>
            )}

            {/* Trigger button */}
            <button
              onClick={handleTrigger}
              disabled={triggerLoading || !selectedPost}
              style={{
                ...btnPrimaryStyle,
                opacity: (triggerLoading || !selectedPost) ? 0.5 : 1,
                cursor: (triggerLoading || !selectedPost) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!triggerLoading && selectedPost) e.currentTarget.style.background = ACCENT_HV; }}
              onMouseLeave={e => { e.currentTarget.style.background = ACCENT; }}
            >
              {triggerLoading ? 'Triggering…' : '⚡ Trigger Heal Now'}
            </button>

            {triggerMsg && (
              <p style={{
                marginTop: 12, marginBottom: 0, fontSize: 13,
                color: triggerMsg.type === 'success' ? '#4ade80' : '#f87171',
                background: triggerMsg.type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                border: `1px solid ${triggerMsg.type === 'success' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                borderRadius: 8, padding: '10px 14px',
              }}>
                {triggerMsg.type === 'success' ? '✓ ' : '✗ '}{triggerMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
