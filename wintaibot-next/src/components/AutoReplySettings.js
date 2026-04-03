'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import PlatformIcon from './PlatformIcon';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '') || 'https://api.wintaibot.com';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸', logo: 'instagram',
    note: 'Replies to comments on your Instagram posts.' },
  { id: 'facebook',  label: 'Facebook (comments)',  color: '#1877F2', emoji: '👍', logo: 'facebook',
    note: 'AI replies to new comments on your Facebook Page posts only. Uses Graph API comment replies. Keep the Page connected with comment permissions; the server polls periodically (no webhook on your domain).' },
  { id: 'facebook_messenger', label: 'Facebook Messenger', color: '#0084FF', emoji: '💬', logo: 'facebookmessenger',
    note: 'AI replies to new direct messages to your Page Inbox. Requires Meta permissions for messaging (e.g. pages_messaging) and a backend that can send via the Messenger Platform; enable this rule separately from Page comments.' },
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
  const { apiBase, token } = useAuth();
  const API_BASE = (apiBase || (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '') || 'https://api.wintaibot.com');
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

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
  const [logsError, setLogsError] = useState('');
  const [showLogs, setShowLogs] = useState(true);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [logDetail, setLogDetail] = useState(null); // full conversation modal
  const [hoverLogId, setHoverLogId] = useState(null);
  const [logPlatformFilter, setLogPlatformFilter] = useState(null); // null = all platforms

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

  const rulePayload = useCallback(
    (platformId) => {
      const r = rules[platformId];
      if (r) return r;
      return {
        enabled: false,
        promptTemplate: DEFAULT_PROMPT,
        maxRepliesPerDay: 50,
        replyToFirstOnly: false,
        keywordFilter: '',
      };
    },
    [rules]
  );

  const setAllPlatformsEnabled = async (enabled) => {
    setBulkSaving(true);
    setGlobalError('');
    try {
      const results = await Promise.all(
        PLATFORMS.map(async (p) => {
          const body = { ...rulePayload(p.id), enabled };
          const res = await fetch(`${API_BASE}/api/auto-reply/rules/${p.id}`, {
            method: 'PUT',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          return { id: p.id, ok: res.ok };
        })
      );
      const failed = results.filter((x) => !x.ok).map((x) => x.id);
      if (failed.length) {
        setGlobalError(`Could not update rules for: ${failed.join(', ')}.`);
      } else {
        setRules((prev) => {
          const next = { ...prev };
          for (const p of PLATFORMS) {
            const base = prev[p.id] ?? {
              enabled: false,
              promptTemplate: DEFAULT_PROMPT,
              maxRepliesPerDay: 50,
              replyToFirstOnly: false,
              keywordFilter: '',
            };
            next[p.id] = { ...base, enabled };
          }
          return next;
        });
      }
    } catch {
      setGlobalError('Network error while updating platforms.');
    } finally {
      setBulkSaving(false);
    }
  };

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const res = await fetch(`${API_BASE}/api/auto-reply/logs`, { headers: authHeaders() });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        throw new Error('Invalid response from server.');
      }
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || text || res.statusText || 'Request failed';
        throw new Error(typeof msg === 'string' ? msg : 'Could not load activity log.');
      }
      const list = normalizeLogsResponse(data);
      setLogs(Array.isArray(list) ? list : []);
    } catch (e) {
      setLogs([]);
      setLogsError(e.message || 'Could not load activity log.');
    } finally {
      setLogsLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const sortedLogs = useMemo(() => {
    const arr = [...logs];
    arr.sort((a, b) => {
      const ta = new Date(a.repliedAt || 0).getTime();
      const tb = new Date(b.repliedAt || 0).getTime();
      if (tb !== ta) return tb - ta;
      const ia = a.id != null ? String(a.id) : '';
      const ib = b.id != null ? String(b.id) : '';
      return ib.localeCompare(ia);
    });
    return arr;
  }, [logs]);

  const platformLogCounts = useMemo(() => {
    const c = Object.fromEntries(PLATFORMS.map((p) => [p.id, 0]));
    for (const l of logs) {
      const id = logCanonicalPlatformId(l);
      if (id && c[id] != null) c[id] += 1;
    }
    return c;
  }, [logs]);

  const recentByPlatform = useMemo(() => {
    const latest = Object.fromEntries(PLATFORMS.map((p) => [p.id, null]));
    for (const l of sortedLogs) {
      const id = logCanonicalPlatformId(l);
      if (id && latest[id] == null) latest[id] = l;
    }
    return latest;
  }, [sortedLogs]);

  const displayLogs = useMemo(() => {
    if (!logPlatformFilter) return sortedLogs;
    return sortedLogs.filter((l) => logCanonicalPlatformId(l) === logPlatformFilter);
  }, [sortedLogs, logPlatformFilter]);

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

  const handleShowLogs = () => {
    if (!showLogs) loadLogs();
    setShowLogs(!showLogs);
  };

  useEffect(() => {
    if (!logDetail) return;
    const onKey = (e) => { if (e.key === 'Escape') setLogDetail(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logDetail]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>AI Auto-Reply</h2>
        <p style={s.subtitle}>
          Automatically reply to new comments (and, where supported, Messenger DMs) using AI. The backend polls about every 5 minutes for comment-style channels (scheduled Graph API checks—not a customer-hosted webhook).
          <strong> Facebook</strong> has two toggles: <strong>Facebook (comments)</strong> for post comments and <strong>Facebook Messenger</strong> for DMs—enable each one you need. Use <strong>Enable all</strong> to turn on every row at once (connect each account in Social / Video Publisher first; Facebook OAuth must use the API redirect URI under Connected Accounts).
        </p>
        <div style={s.bulkActions}>
          <button
            type="button"
            style={{ ...s.bulkEnableBtn, opacity: bulkSaving ? 0.65 : 1 }}
            onClick={() => setAllPlatformsEnabled(true)}
            disabled={bulkSaving}
          >
            {bulkSaving ? 'Updating…' : 'Enable all platforms'}
          </button>
          <button
            type="button"
            style={{ ...s.bulkDisableBtn, opacity: bulkSaving ? 0.65 : 1 }}
            onClick={() => setAllPlatformsEnabled(false)}
            disabled={bulkSaving}
          >
            Disable all
          </button>
        </div>
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
                    <PlatformIcon platform={p} size={30} />
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

      {/* Activity Log — full width; click row to open full conversation */}
      <div style={s.sectionLog}>
        <div style={s.logHeader}>
          <div>
            <h3 style={s.sectionTitle}>Activity Log</h3>
            <p style={s.logHint}>
              Recent activity for every platform is summarized below, then listed newest first. Facebook = Page posts.
              Click a row for a larger view.
            </p>
          </div>
          <div style={s.logHeaderBtns}>
            <button type="button" style={s.logRefreshBtn} onClick={() => loadLogs()} disabled={logsLoading}>
              {logsLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" style={s.logToggleBtn} onClick={handleShowLogs}>
              {showLogs ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {showLogs && (
          logsLoading && logs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading activity…</p>
          ) : logsError ? (
            <div style={s.logErrorBox}>
              <strong style={{ color: '#b91c1c' }}>Could not load log</strong>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 15 }}>{logsError}</p>
              <button type="button" style={s.logRetryBtn} onClick={() => loadLogs()}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <div style={s.recentByPlatformWrap}>
                <h4 style={s.recentByPlatformTitle}>Recent by platform</h4>
                <p style={s.recentByPlatformSub}>
                  Each card is the latest auto-reply we have in this log for that network ({logs.length} total loaded).
                  Click a card to filter the table; use All to show every platform again.
                </p>
                <div style={s.platformFilterChips}>
                  <button
                    type="button"
                    style={{
                      ...s.filterChip,
                      ...(logPlatformFilter == null ? s.filterChipOn : {}),
                    }}
                    onClick={() => setLogPlatformFilter(null)}
                  >
                    All platforms
                  </button>
                  {PLATFORMS.map((p) => {
                    const n = platformLogCounts[p.id] ?? 0;
                    const active = logPlatformFilter === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        style={{
                          ...s.filterChip,
                          borderColor: active ? p.color : '#e2e8f0',
                          background: active ? p.color + '22' : '#fff',
                          color: active ? p.color : '#475569',
                        }}
                        onClick={() => setLogPlatformFilter(active ? null : p.id)}
                      >
                        {p.label}
                        <span style={s.filterChipCount}>{n}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={s.recentPlatformGrid}>
                  {PLATFORMS.map((p) => {
                    const latest = recentByPlatform[p.id];
                    const count = platformLogCounts[p.id] ?? 0;
                    const isSelected = logPlatformFilter === p.id;
                    return (
                      <button
                        key={`card-${p.id}`}
                        type="button"
                        style={{
                          ...s.recentPlatformCard,
                          borderColor: isSelected ? p.color : '#e2e8f0',
                          boxShadow: isSelected ? `0 0 0 1px ${p.color}40` : 'none',
                        }}
                        onClick={() => setLogPlatformFilter(isSelected ? null : p.id)}
                      >
                        <div style={s.recentPlatformCardTop}>
                          <div style={{ ...s.recentCardDot, background: p.color + '18' }}>
                            <PlatformIcon platform={p} size={26} />
                          </div>
                          <div style={s.recentPlatformCardHead}>
                            <span style={s.recentPlatformName}>{p.label}</span>
                            <span style={s.recentPlatformCount}>
                              {count} {count === 1 ? 'reply' : 'replies'} in loaded history
                            </span>
                          </div>
                        </div>
                        {latest ? (
                          <div style={s.recentPlatformSnippet}>
                            <div style={s.recentSnippetLine}>
                              <span style={{ color: latest.success ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                {latest.success ? '✓' : '✗'}
                              </span>
                              <span style={{ color: '#94a3b8' }}>{formatTime(latest.repliedAt)}</span>
                            </div>
                            <div style={s.recentSnippetText} title={latest.commentText || ''}>
                              {(latest.commentText || '—').slice(0, 72)}
                              {(latest.commentText || '').length > 72 ? '…' : ''}
                            </div>
                          </div>
                        ) : (
                          <div style={s.recentPlatformEmpty}>No entries in this log yet</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {logs.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 16 }}>
                  No logged replies yet. After auto-reply runs, entries show here for every platform. Use Refresh if you
                  expected new rows.
                </p>
              ) : displayLogs.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 16 }}>
                  No entries for {PLATFORMS.find((x) => x.id === logPlatformFilter)?.label || 'this platform'} in the
                  loaded history. Choose another platform or All platforms.
                </p>
              ) : (
                <>
                  {logPlatformFilter && (
                    <div style={s.logFilterBanner}>
                      Showing <strong>{PLATFORMS.find((x) => x.id === logPlatformFilter)?.label}</strong> only ·{' '}
                      <button type="button" style={s.logFilterClear} onClick={() => setLogPlatformFilter(null)}>
                        Show all
                      </button>
                    </div>
                  )}
                  <h4 style={s.allRecentTitle}>All recent replies (newest first)</h4>
                  <div style={s.logTable}>
                    <div style={s.logHead}>
                      <span>Platform</span>
                      <span>Author</span>
                      <span>Comment</span>
                      <span>Reply</span>
                      <span>Time</span>
                      <span>Status</span>
                    </div>
                    {displayLogs.map((l, idx) => {
                      const rowKey = l.id != null ? String(l.id) : `log-${idx}-${l.repliedAt || ''}`;
                      return (
                        <button
                          key={rowKey}
                          type="button"
                          style={{
                            ...s.logRowBtn,
                            background: hoverLogId === rowKey ? '#f8fafc' : 'transparent',
                          }}
                          onMouseEnter={() => setHoverLogId(rowKey)}
                          onMouseLeave={() => setHoverLogId(null)}
                          onClick={() => setLogDetail(l)}
                        >
                          <span style={s.logPlatformCell}>
                            <PlatformIcon platform={resolvePlatformMeta(l.platform)} size={22} />
                            <span style={s.logPlatformLabel}>{platformLabel(l.platform)}</span>
                          </span>
                          <span style={s.logColAuthor}>@{l.authorUsername || '—'}</span>
                          <span style={s.logCellWrap}>{l.commentText || '—'}</span>
                          <span style={s.logCellWrap}>{l.replyText || '—'}</span>
                          <span style={s.logColTime}>{formatTime(l.repliedAt)}</span>
                          <span style={{ ...s.logColStatus, color: l.success ? '#22c55e' : '#ef4444' }}>
                            {l.success ? '✓ Sent' : '✗ Failed'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )
        )}
      </div>

      {logDetail && (
        <div
          style={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-detail-title"
          onClick={() => setLogDetail(null)}
        >
          <div style={s.modalPanel} onClick={e => e.stopPropagation()}>
            <div style={s.modalPanelHeader}>
              <h3 id="log-detail-title" style={s.modalTitle}>Conversation</h3>
              <button type="button" style={s.modalClose} onClick={() => setLogDetail(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <div style={s.modalMeta}>
              <span style={s.modalPlatform}>
                <PlatformIcon platform={resolvePlatformMeta(logDetail.platform)} size={24} />
                <span style={{ fontWeight: 700 }}>{platformLabel(logDetail.platform)}</span>
              </span>
              <span style={{ color: '#6366f1' }}>@{logDetail.authorUsername || '—'}</span>
              <span style={{ color: '#94a3b8' }}>{formatTime(logDetail.repliedAt)}</span>
              <span style={{ color: logDetail.success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {logDetail.success ? '✓ Sent' : '✗ Failed'}
              </span>
            </div>
            <div style={s.modalBlock}>
              <div style={s.modalLabel}>Their comment</div>
              <div style={s.modalBody}>{logDetail.commentText || '—'}</div>
            </div>
            <div style={s.modalBlock}>
              <div style={s.modalLabel}>Your AI reply</div>
              <div style={s.modalBody}>{logDetail.replyText || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

/** Map API platform string → PLATFORMS row for icons (handles casing / aliases). */
function resolvePlatformMeta(raw) {
  const p = resolvePlatform(raw);
  if (p) return p;
  return { id: 'unknown', label: raw || 'Unknown', color: '#64748b', emoji: '📱', logo: null };
}

function normalizeLogsResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.logs)) return data.logs;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

function resolvePlatform(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  // Collapse hyphens/underscores so API values like meta_facebook → metafacebook (alias below).
  let id = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');
  const aliases = {
    twitter: 'x',
    xtwitter: 'x',
    fb: 'facebook',
    fbpage: 'facebook',
    facebookpage: 'facebook', // e.g. API "facebook_page" after [-_] strip
    facebookpagecomments: 'facebook',
    pagefacebook: 'facebook',
    metafacebook: 'facebook',
    metafb: 'facebook',
    graphfacebook: 'facebook',
    facebookmessenger: 'facebook_messenger',
    fbmessenger: 'facebook_messenger',
    pagesmessenger: 'facebook_messenger',
    messenger: 'facebook_messenger',
    msngr: 'facebook_messenger',
    fbm: 'facebook_messenger',
    ig: 'instagram',
    insta: 'instagram',
    instagrambusiness: 'instagram',
    yt: 'youtube',
    youtubecom: 'youtube',
    googleyoutube: 'youtube',
    tt: 'tiktok',
    tiktokcom: 'tiktok',
    li: 'linkedin',
    linkedincom: 'linkedin',
    pin: 'pinterest',
    pinterestcom: 'pinterest',
  };
  id = aliases[id] || id;
  return PLATFORMS.find(x => x.id === id) || null;
}

/** Canonical platform id for a log row (for grouping / filters). */
function logCanonicalPlatformId(log) {
  if (!log) return null;
  const p = resolvePlatform(log.platform);
  return p ? p.id : null;
}

function platformLabel(raw) {
  const p = resolvePlatform(raw);
  if (p) return p.label;
  if (raw == null || String(raw).trim() === '') return '—';
  return String(raw).replace(/_/g, ' ');
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  page: {
    maxWidth: 'none',
    width: '100%',
    margin: 0,
    padding: '28px clamp(12px, 2vw, 28px) 40px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  header: { marginBottom: 28 },
  title: { margin: 0, fontSize: 30, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  subtitle: { margin: '8px 0 0', color: '#64748b', fontSize: 16, lineHeight: 1.55, maxWidth: 720 },
  bulkActions: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  bulkEnableBtn: {
    background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10,
    padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  bulkDisableBtn: {
    background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  errorBanner: {
    background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14,
  },
  cards: { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 36 },
  card: {
    border: '2px solid #e2e8f0', borderRadius: 18, padding: '24px 26px',
    background: '#fff', transition: 'border-color 0.2s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  platformInfo: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  platformDot: {
    width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, opacity: 0.9,
  },
  platformName: { fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 4 },
  platformNote: { fontSize: 14, color: '#64748b', lineHeight: 1.45, maxWidth: 520 },
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
    background: '#f1f5f9', border: 'none', borderRadius: 10, padding: '8px 14px',
    cursor: 'pointer', fontSize: 14, color: '#475569', fontWeight: 600,
  },
  statusChip: {
    display: 'inline-block', borderRadius: 99, padding: '5px 12px',
    fontSize: 13, fontWeight: 600, marginTop: 12,
  },
  settingsArea: {
    marginTop: 18, paddingTop: 18, borderTop: '1px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  label: { fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'block' },
  textarea: {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px',
    fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
    minHeight: 120,
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  input: {
    border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px',
    fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  hint: { fontSize: 12, color: '#94a3b8' },
  checkRow: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: 14, color: '#334155' },
  saveBtn: {
    alignSelf: 'flex-start', border: 'none', borderRadius: 10, padding: '12px 26px',
    color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  section: {
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18,
    padding: '28px 30px', marginBottom: 28,
  },
  sectionTitle: { margin: '0 0 6px', fontSize: 21, fontWeight: 700, color: '#1e293b' },
  sectionSub: { margin: '0 0 18px', fontSize: 15, color: '#64748b', lineHeight: 1.5 },
  testRow: { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' },
  select: {
    border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '11px 14px',
    fontSize: 15, outline: 'none', background: '#fff', minWidth: 160,
  },
  testBtn: {
    background: '#6366f1', border: 'none', borderRadius: 10, padding: '11px 24px',
    color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  replyBox: {
    marginTop: 18, background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: 12, padding: '18px 20px',
  },
  replyLabel: { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  replyText: { margin: '8px 0 0', fontSize: 16, color: '#1e293b', lineHeight: 1.65 },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  logHint: { margin: '4px 0 0', fontSize: 14, color: '#94a3b8', lineHeight: 1.45, maxWidth: 620 },
  logHeaderBtns: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  logRefreshBtn: {
    background: '#e0e7ff', border: 'none', borderRadius: 10, padding: '8px 16px',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#4338ca',
    flexShrink: 0,
  },
  logToggleBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 10, padding: '8px 18px',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569',
    flexShrink: 0,
  },
  logErrorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 18px',
  },
  logRetryBtn: {
    marginTop: 12, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  recentByPlatformWrap: { marginBottom: 8 },
  recentByPlatformTitle: { margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#1e293b' },
  recentByPlatformSub: { margin: '0 0 14px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5, maxWidth: 720 },
  platformFilterChips: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center',
  },
  filterChip: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 99,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: '#fff',
    color: '#475569',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'inherit',
  },
  filterChipOn: {
    background: '#0f172a',
    color: '#fff',
    border: '1.5px solid #0f172a',
  },
  filterChipCount: {
    fontSize: 11,
    fontWeight: 700,
    background: 'rgba(148, 163, 184, 0.35)',
    color: '#334155',
    padding: '2px 7px',
    borderRadius: 99,
    marginLeft: 2,
  },
  recentPlatformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 14,
    marginBottom: 22,
  },
  recentPlatformCard: {
    border: '2px solid #e2e8f0',
    borderRadius: 16,
    padding: '16px 18px',
    textAlign: 'left',
    cursor: 'pointer',
    background: '#fafafa',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  recentPlatformCardTop: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  recentCardDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recentPlatformCardHead: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  recentPlatformName: { fontWeight: 700, fontSize: 15, color: '#1e293b' },
  recentPlatformCount: { fontSize: 12, color: '#94a3b8', fontWeight: 600 },
  recentPlatformSnippet: { marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' },
  recentSnippetLine: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontSize: 12 },
  recentSnippetText: { fontSize: 13, color: '#475569', lineHeight: 1.45, overflow: 'hidden' },
  recentPlatformEmpty: { marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: 13, color: '#94a3b8' },
  logFilterBanner: {
    background: '#f1f5f9',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 12,
    fontSize: 14,
    color: '#475569',
  },
  logFilterClear: {
    border: 'none',
    background: 'none',
    color: '#4338ca',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline',
    padding: 0,
    fontFamily: 'inherit',
  },
  allRecentTitle: { margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#334155' },
  sectionLog: {
    background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 18,
    padding: '28px clamp(16px, 2vw, 28px)', marginBottom: 28,
    width: '100%', boxSizing: 'border-box',
  },
  logTable: { display: 'flex', flexDirection: 'column', gap: 4, overflowX: 'auto', width: '100%' },
  logHead: {
    display: 'grid',
    gridTemplateColumns: 'minmax(92px, 0.7fr) minmax(110px, 0.85fr) minmax(220px, 1.6fr) minmax(220px, 1.6fr) minmax(118px, 0.75fr) minmax(76px, 0.5fr)',
    fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
    padding: '10px 4px', borderBottom: '1px solid #e2e8f0', gap: 14, flexShrink: 0,
    minWidth: 0, alignItems: 'end',
  },
  logRowBtn: {
    display: 'grid',
    gridTemplateColumns: 'minmax(92px, 0.7fr) minmax(110px, 0.85fr) minmax(220px, 1.6fr) minmax(220px, 1.6fr) minmax(118px, 0.75fr) minmax(76px, 0.5fr)',
    fontSize: 15, color: '#334155', padding: '14px 4px',
    borderBottom: '1px solid #f1f5f9', gap: 14, alignItems: 'start',
    minWidth: 0,
    width: '100%',
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s',
    outline: 'none',
  },
  logPlatformCell: {
    display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingTop: 2,
  },
  logPlatformLabel: { fontWeight: 600, fontSize: 14, color: '#334155', lineHeight: 1.3 },
  logColAuthor: { color: '#6366f1', fontWeight: 500, wordBreak: 'break-word', paddingTop: 2 },
  logColTime: { color: '#94a3b8', fontSize: 14, paddingTop: 2, whiteSpace: 'nowrap' },
  logColStatus: { fontSize: 14, paddingTop: 2, whiteSpace: 'nowrap' },
  logCellWrap: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    lineHeight: 1.55,
    fontSize: 15,
    color: '#334155',
    minWidth: 0,
  },
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 10050,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', boxSizing: 'border-box',
  },
  modalPanel: {
    background: '#fff', borderRadius: 16, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    maxWidth: 'min(920px, 100%)', width: '100%', maxHeight: 'min(85vh, 900px)',
    overflow: 'auto', padding: '24px 26px 28px',
    boxSizing: 'border-box',
  },
  modalPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  modalTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' },
  modalClose: {
    border: 'none', background: '#f1f5f9', color: '#475569', width: 40, height: 40,
    borderRadius: 10, fontSize: 18, cursor: 'pointer', lineHeight: 1, flexShrink: 0,
  },
  modalMeta: {
    display: 'flex', flexWrap: 'wrap', gap: '8px 16px', alignItems: 'center',
    marginBottom: 22, fontSize: 14, color: '#334155',
  },
  modalPlatform: { display: 'inline-flex', alignItems: 'center', gap: 10 },
  modalBlock: { marginBottom: 20 },
  modalLabel: {
    fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  modalBody: {
    fontSize: 16, lineHeight: 1.65, color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
};
