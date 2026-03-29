import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const API_BASE = process.env.REACT_APP_API_URL || 'https://api.wintaibot.com';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸', logo: 'instagram',
    note: 'Replies to comments on your Instagram posts.' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', emoji: '👍', logo: 'facebook',
    note: 'Replies to comments on your Facebook Page posts.' },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', emoji: '▶️', logo: 'youtube',
    note: 'Replies to top-level comments on your YouTube videos.' },
  { id: 'tiktok',   label: 'TikTok',    color: '#010101', emoji: '🎵', logo: 'tiktok',
    note: 'Replies to comments on your TikTok videos.' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', emoji: '💼', logo: 'linkedin',
    note: 'Replies to comments on your LinkedIn posts.' },
  { id: 'x',         label: 'X',         color: '#000000', emoji: '🐦', logo: 'x',
    note: 'Replies to comments on your X (Twitter) posts.' },
  { id: 'threads',   label: 'Threads',   color: '#101010', emoji: '🧵', logo: 'threads',
    note: 'Replies to comments on your Threads posts.' },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', emoji: '📌', logo: 'pinterest',
    note: 'Replies to comments on your Pinterest pins.' },
];

const DEFAULT_PROMPT =
  "You are a friendly social media manager. Reply to the following comment in 1-2 short, human sentences. " +
  "Be warm, helpful, and on-brand. Do NOT use hashtags or emojis unless the comment uses them.";

export default function AutoReplySettings() {
  const { authHeaders } = useAuth();

  // rules[platform] = { enabled, promptTemplate, maxRepliesPerDay, replyToFirstOnly, keywordFilter }
  const [rules, setRules] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});   // { [platform]: true } briefly after save
  const [expanded, setExpanded] = useState(null); // which platform card is expanded

  // Test reply UI
  const [testPlatform, setTestPlatform] = useState('instagram');
  const [testComment, setTestComment] = useState('');
  const [testReply, setTestReply] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');

  // Logs UI
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const [globalError, setGlobalError] = useState('');

  // ─── Load rules ───────────────────────────────────────────────────────────
  const loadRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auto-reply/rules`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const map = {};
      for (const r of data) {
        map[r.platform] = {
          enabled: r.enabled,
          promptTemplate: r.promptTemplate || DEFAULT_PROMPT,
          maxRepliesPerDay: r.maxRepliesPerDay ?? 50,
          replyToFirstOnly: r.replyToFirstOnly ?? false,
          keywordFilter: r.keywordFilter || '',
        };
      }
      // fill defaults for platforms with no rule yet
      for (const p of PLATFORMS) {
        if (!map[p.id]) {
          map[p.id] = {
            enabled: false,
            promptTemplate: DEFAULT_PROMPT,
            maxRepliesPerDay: 50,
            replyToFirstOnly: false,
            keywordFilter: '',
          };
        }
      }
      setRules(map);
    } catch (e) {
      setGlobalError('Failed to load rules.');
    }
  }, [authHeaders]);

  useEffect(() => { loadRules(); }, [loadRules]);

  // ─── Save rule ────────────────────────────────────────────────────────────
  const saveRule = async (platform) => {
    setSaving(s => ({ ...s, [platform]: true }));
    setGlobalError('');
    try {
      const res = await fetch(`${API_BASE}/api/auto-reply/rules/${platform}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(rules[platform]),
      });
      if (!res.ok) {
        const d = await res.json();
        setGlobalError(d.error || 'Save failed.');
      } else {
        setSaved(s => ({ ...s, [platform]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [platform]: false })), 2500);
      }
    } catch {
      setGlobalError('Network error.');
    } finally {
      setSaving(s => ({ ...s, [platform]: false }));
    }
  };

  // ─── Toggle enabled (save immediately) ───────────────────────────────────
  const toggleEnabled = async (platform) => {
    const updated = { ...rules[platform], enabled: !rules[platform]?.enabled };
    setRules(r => ({ ...r, [platform]: updated }));
    setSaving(s => ({ ...s, [platform]: true }));
    try {
      await fetch(`${API_BASE}/api/auto-reply/rules/${platform}`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch { /* silent */ }
    setSaving(s => ({ ...s, [platform]: false }));
  };

  const setField = (platform, field, value) => {
    setRules(r => ({ ...r, [platform]: { ...r[platform], [field]: value } }));
  };

  // ─── Test reply ───────────────────────────────────────────────────────────
  const runTest = async () => {
    if (!testComment.trim()) return;
    setTestLoading(true);
    setTestReply('');
    setTestError('');
    try {
      const res = await fetch(`${API_BASE}/api/auto-reply/test`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: testPlatform,
          commentText: testComment,
          promptTemplate: rules[testPlatform]?.promptTemplate,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setTestError(d.error || 'AI error.'); return; }
      setTestReply(d.reply);
    } catch {
      setTestError('Network error.');
    } finally {
      setTestLoading(false);
    }
  };

  // ─── Load logs ────────────────────────────────────────────────────────────
  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auto-reply/logs`, { headers: authHeaders() });
      const data = await res.json();
      setLogs(data);
    } catch { /* silent */ }
    setLogsLoading(false);
  };

  const handleShowLogs = () => {
    if (!showLogs) loadLogs();
    setShowLogs(!showLogs);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>AI Auto-Reply</h2>
        <p style={s.subtitle}>
          Automatically reply to new comments on your posts using AI. Polls every 5 minutes.
        </p>
      </div>

      {globalError && <div style={s.errorBanner}>{globalError}</div>}

      {/* Platform cards */}
      <div style={s.cards}>
        {PLATFORMS.map(p => {
          const rule = rules[p.id] || {};
          const isExpanded = expanded === p.id;
          return (
            <div key={p.id} style={{ ...s.card, borderColor: rule.enabled ? p.color : '#e2e8f0' }}>
              {/* Card header */}
              <div style={s.cardHeader}>
                <div style={s.platformInfo}>
                  <div style={{ ...s.platformDot, background: p.color + '18' }}>
                    <PlatformIcon platform={p} size={26} />
                  </div>
                  <div>
                    <div style={s.platformName}>{p.label}</div>
                    <div style={s.platformNote}>{p.note}</div>
                  </div>
                </div>
                <div style={s.cardActions}>
                  {/* Toggle */}
                  <button
                    style={{ ...s.toggleBtn, background: rule.enabled ? p.color : '#cbd5e1' }}
                    onClick={() => toggleEnabled(p.id)}
                    disabled={saving[p.id]}
                    aria-label={rule.enabled ? 'Disable' : 'Enable'}
                  >
                    <div style={{ ...s.toggleThumb, transform: rule.enabled ? 'translateX(20px)' : 'translateX(2px)' }} />
                  </button>
                  {/* Expand settings */}
                  <button style={s.settingsToggle} onClick={() => setExpanded(isExpanded ? null : p.id)}>
                    {isExpanded ? '▲ Less' : '⚙ Settings'}
                  </button>
                </div>
              </div>

              {/* Status chip */}
              <div style={{ ...s.statusChip, background: rule.enabled ? p.color + '18' : '#f1f5f9', color: rule.enabled ? p.color : '#94a3b8' }}>
                {rule.enabled ? '● Active — replies every 5 min' : '○ Disabled'}
              </div>

              {/* Expanded settings */}
              {isExpanded && (
                <div style={s.settingsArea}>
                  <label style={s.label}>AI Prompt Template</label>
                  <textarea
                    style={s.textarea}
                    rows={4}
                    value={rule.promptTemplate || DEFAULT_PROMPT}
                    onChange={e => setField(p.id, 'promptTemplate', e.target.value)}
                  />

                  <div style={s.row}>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Max replies / day</label>
                      <input
                        type="number"
                        style={s.input}
                        min={1} max={200}
                        value={rule.maxRepliesPerDay ?? 50}
                        onChange={e => setField(p.id, 'maxRepliesPerDay', parseInt(e.target.value) || 50)}
                      />
                    </div>
                    <div style={s.fieldGroup}>
                      <label style={s.label}>Keyword filter (comma-separated)</label>
                      <input
                        type="text"
                        style={s.input}
                        placeholder="e.g. price, shipping, help"
                        value={rule.keywordFilter || ''}
                        onChange={e => setField(p.id, 'keywordFilter', e.target.value)}
                      />
                      <span style={s.hint}>Only reply if comment contains one of these words. Leave empty to reply to all.</span>
                    </div>
                  </div>

                  <label style={s.checkRow}>
                    <input
                      type="checkbox"
                      checked={rule.replyToFirstOnly ?? false}
                      onChange={e => setField(p.id, 'replyToFirstOnly', e.target.checked)}
                    />
                    <span style={{ marginLeft: 8 }}>Reply to first comment per post only (prevents floods)</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      style={{ ...s.saveBtn, background: p.color, opacity: saving[p.id] ? 0.6 : 1 }}
                      onClick={() => saveRule(p.id)}
                      disabled={saving[p.id]}
                    >
                      {saving[p.id] ? 'Saving…' : 'Save Settings'}
                    </button>
                    {saved[p.id] && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>✓ Saved!</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Test Reply Box */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Test AI Reply</h3>
        <p style={s.sectionSub}>Preview what the AI would say — nothing is actually posted.</p>
        <div style={s.testRow}>
          <select
            style={s.select}
            value={testPlatform}
            onChange={e => setTestPlatform(e.target.value)}
          >
            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <input
            style={{ ...s.input, flex: 1 }}
            type="text"
            placeholder='Paste a comment here, e.g. "How much does this cost?"'
            value={testComment}
            onChange={e => setTestComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runTest()}
          />
          <button style={s.testBtn} onClick={runTest} disabled={testLoading || !testComment.trim()}>
            {testLoading ? '...' : 'Generate'}
          </button>
        </div>
        {testError && <div style={s.errorBanner}>{testError}</div>}
        {testReply && (
          <div style={s.replyBox}>
            <span style={s.replyLabel}>AI Reply:</span>
            <p style={s.replyText}>{testReply}</p>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div style={s.section}>
        <div style={s.logHeader}>
          <h3 style={s.sectionTitle}>Activity Log</h3>
          <button style={s.logToggleBtn} onClick={handleShowLogs}>
            {showLogs ? 'Hide' : 'Show recent replies'}
          </button>
        </div>
        {showLogs && (
          logsLoading ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading...</p>
          ) : logs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>No replies yet. Enable a platform above to get started.</p>
          ) : (
            <div style={s.logTable}>
              <div style={s.logHead}>
                <span>Platform</span><span>Author</span><span>Comment</span><span>Reply</span><span>Time</span><span>Status</span>
              </div>
              {logs.map(l => (
                <div key={l.id} style={s.logRow}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{l.platform}</span>
                  <span style={{ color: '#6366f1' }}>@{l.authorUsername || '—'}</span>
                  <span style={s.logCell} title={l.commentText}>{truncate(l.commentText, 50)}</span>
                  <span style={s.logCell} title={l.replyText}>{truncate(l.replyText, 60)}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{formatTime(l.repliedAt)}</span>
                  <span style={{ color: l.success ? '#22c55e' : '#ef4444', fontSize: 12 }}>
                    {l.success ? '✓ Sent' : '✗ Failed'}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function truncate(str, n) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  page: { maxWidth: 860, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  errorBanner: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14,
  },
  cards: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 },
  card: {
    border: '2px solid #e2e8f0', borderRadius: 16, padding: '20px',
    background: '#fff', transition: 'border-color 0.2s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  platformInfo: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  platformDot: {
    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, opacity: 0.9,
  },
  platformName: { fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 2 },
  platformNote: { fontSize: 12, color: '#94a3b8' },
  cardActions: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  toggleBtn: {
    position: 'relative', width: 44, height: 24, borderRadius: 12,
    border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
  },
  toggleThumb: {
    position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
  },
  settingsToggle: {
    background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 12px',
    cursor: 'pointer', fontSize: 12, color: '#475569', fontWeight: 600,
  },
  statusChip: {
    display: 'inline-block', borderRadius: 99, padding: '3px 10px',
    fontSize: 12, fontWeight: 600, marginTop: 10,
  },
  settingsArea: {
    marginTop: 18, paddingTop: 18, borderTop: '1px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  label: { fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4, display: 'block' },
  textarea: {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px',
    fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  input: {
    border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px',
    fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  hint: { fontSize: 11, color: '#94a3b8' },
  checkRow: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 13, color: '#334155' },
  saveBtn: {
    alignSelf: 'flex-start', border: 'none', borderRadius: 8, padding: '10px 22px',
    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  },
  section: {
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16,
    padding: 24, marginBottom: 24,
  },
  sectionTitle: { margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#1e293b' },
  sectionSub: { margin: '0 0 16px', fontSize: 13, color: '#94a3b8' },
  testRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  select: {
    border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 10px',
    fontSize: 13, outline: 'none', background: '#fff',
  },
  testBtn: {
    background: '#6366f1', border: 'none', borderRadius: 8, padding: '8px 18px',
    color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  },
  replyBox: {
    marginTop: 14, background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 10, padding: '14px 16px',
  },
  replyLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  replyText: { margin: '6px 0 0', fontSize: 14, color: '#1e293b', lineHeight: 1.6 },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logToggleBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 14px',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569',
  },
  logTable: { display: 'flex', flexDirection: 'column', gap: 2 },
  logHead: {
    display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr 120px 70px',
    fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
    padding: '6px 0', borderBottom: '1px solid #f1f5f9', gap: 8,
  },
  logRow: {
    display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr 120px 70px',
    fontSize: 13, color: '#334155', padding: '8px 0',
    borderBottom: '1px solid #f8fafc', gap: 8, alignItems: 'center',
  },
  logCell: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
