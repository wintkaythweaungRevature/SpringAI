import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_META = {
  STRATEGIST: {
    label: 'Strategist',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.15)',
    description: 'Plans content strategy, schedules, and campaign direction.',
  },
  WRITER: {
    label: 'Writer',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    description: 'Drafts captions, copy, and creative content.',
  },
  ANALYST: {
    label: 'Analyst',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
    description: 'Reviews performance data and surfaces actionable insights.',
  },
};

const TASK_TYPE_META = {
  SUGGEST_POST_TIME: { label: 'Post Strategy', icon: '📅' },
  DRAFT_CAPTION:     { label: 'Caption Draft',  icon: '✍️' },
  PERFORMANCE_INSIGHT: { label: 'Performance Insight', icon: '📊' },
  CONTENT_IDEA:      { label: 'Content Idea',   icon: '💡' },
  ASSET_TO_POST:     { label: 'Asset → Post Drafts', icon: '🖼️' },
};

const EMOJI_OPTIONS = ['🤖', '🧠', '✍️', '📊', '🎯', '🔮', '💡', '🚀'];

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Inline style tokens ──────────────────────────────────────────────────────

const C = {
  // Light-theme palette — mirrors the Account Settings / Content Calendar surface.
  bg:      '#f8fafc',   // page background
  card:    '#ffffff',   // primary card surface
  card2:   '#f1f5f9',   // sunken / alt surface (e.g. inline insight panel)
  border:  '#e2e8f0',
  accent:  '#6366f1',
  accentH: '#818cf8',
  text:    '#0f172a',   // primary text
  muted:   '#64748b',   // secondary text
  green:   '#16a34a',
  red:     '#dc2626',
  greenBg: 'rgba(22,163,74,0.10)',
  redBg:   'rgba(220,38,38,0.10)',
};

const s = {
  wrap: {
    minHeight: '100vh',
    background: C.bg,
    color: C.text,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '24px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '28px',
  },
  h1: {
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
    color: C.text,
  },
  subtitle: {
    fontSize: '13px',
    color: C.muted,
    marginTop: '2px',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '24px',
    width: 'fit-content',
  },
  tab: (active) => ({
    padding: '8px 18px',
    borderRadius: '7px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    background: active ? C.accent : 'transparent',
    color: active ? '#fff' : C.muted,
    transition: 'all 0.15s',
  }),
  btn: (variant = 'primary') => {
    const map = {
      primary: { background: C.accent, color: '#fff' },
      ghost:   { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` },
      danger:  { background: C.redBg, color: C.red, border: `1px solid ${C.red}` },
      success: { background: C.greenBg, color: C.green, border: `1px solid ${C.green}` },
      outline: { background: 'transparent', color: C.accent, border: `1px solid ${C.accent}` },
    };
    return {
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'opacity 0.15s',
      ...map[variant],
    };
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '20px',
  },
  agentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  badge: (color, bg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.4px',
    background: bg,
    color: color,
  }),
  input: {
    width: '100%',
    padding: '10px 14px',
    background: C.card2,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    color: C.text,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '13px',
    fontWeight: 500,
    color: C.muted,
    display: 'block',
    marginBottom: '6px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  divider: {
    borderColor: C.border,
    margin: '16px 0',
    borderStyle: 'solid',
    borderWidth: '0 0 1px',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const m = ROLE_META[role] || { label: role, color: C.muted, bg: C.card2 };
  return <span style={s.badge(m.color, m.bg)}>{m.label}</span>;
}

function StatusDot({ active }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: active ? C.green : C.muted }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? C.green : C.muted, display: 'inline-block' }} />
      {active ? 'Active' : 'Paused'}
    </span>
  );
}

function AgentCard({ agent, onToggle, onDelete, deleteConfirm, setDeleteConfirm }) {
  const isConfirming = deleteConfirm === agent.id;

  return (
    <div style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <span style={{ fontSize: '48px', lineHeight: 1 }}>{agent.avatarEmoji || '🤖'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent.name}
          </div>
          <RoleBadge role={agent.role} />
        </div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusDot active={agent.isActive} />
        <span style={{ fontSize: '11px', color: C.muted }}>
          {agent.lastRanAt ? `Last ran: ${fmtDate(agent.lastRanAt)}` : 'Never ran'}
        </span>
      </div>

      <hr style={s.divider} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button style={s.btn(agent.isActive ? 'ghost' : 'outline')} onClick={() => onToggle(agent.id)}>
          {agent.isActive ? 'Pause' : 'Activate'}
        </button>

        {isConfirming ? (
          <>
            <span style={{ fontSize: '12px', color: C.muted, alignSelf: 'center' }}>Delete?</span>
            <button style={s.btn('danger')} onClick={() => onDelete(agent.id)}>Yes</button>
            <button style={s.btn('ghost')} onClick={() => setDeleteConfirm(null)}>No</button>
          </>
        ) : (
          <button style={{ ...s.btn('ghost'), marginLeft: 'auto' }} onClick={() => setDeleteConfirm(agent.id)} title="Delete agent">
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

function TaskTypeTag({ taskType }) {
  const m = TASK_TYPE_META[taskType] || { label: taskType, icon: '🔧' };
  return (
    <span style={{ ...s.badge('#a5b4fc', 'rgba(99,102,241,0.15)'), fontSize: '12px' }}>
      {m.icon} {m.label}
    </span>
  );
}

// ─── Platform helpers ──────────────────────────────────────────────────────────
const PLATFORM_META_MAP = {
  instagram: { id: 'instagram', color: '#E1306C' },
  facebook:  { id: 'facebook',  color: '#1877F2' },
  tiktok:    { id: 'tiktok',    color: '#010101' },
  youtube:   { id: 'youtube',   color: '#FF0000' },
  linkedin:  { id: 'linkedin',  color: '#0A66C2' },
  x:         { id: 'x',         color: '#e2e8f0' },
  twitter:   { id: 'twitter',   color: '#e2e8f0' },
  threads:   { id: 'threads',   color: '#e2e8f0' },
  pinterest: { id: 'pinterest', color: '#E60023' },
};

/**
 * Smart renderer for task output.
 * Post Strategy tasks (SUGGEST_POST_TIME) with JSON output get rendered as
 * readable post cards. Everything else gets rendered as pre-wrapped text.
 */
function TaskOutputRenderer({ task }) {
  // ASSET_TO_POST: taskOutput is a JSON object keyed by platform with caption /
  // hashtags / suggestedTime per platform. Render each as a tabbed card so the
  // user can scan all platform variants at a glance before approving.
  if (task.taskType === 'ASSET_TO_POST' && task.taskOutput) {
    try {
      let raw = task.taskOutput.trim();
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```\s*$/, '').trim();
      }
      const perPlatform = JSON.parse(raw);
      if (perPlatform && typeof perPlatform === 'object') {
        const entries = Object.entries(perPlatform);
        if (entries.length > 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {task.mediaAssetId && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
                  🖼️ Source asset #{task.mediaAssetId} (open Asset Library to view)
                </div>
              )}
              {entries.map(([plat, v]) => {
                const platLower = (plat || '').toLowerCase();
                const pmeta = PLATFORM_META_MAP[platLower] || { id: platLower, color: '#6366f1' };
                const color = pmeta.color;
                const caption  = v?.caption  || '';
                const hashtags = v?.hashtags || '';
                const sugg     = v?.suggestedTime || '';
                const errMsg   = v?.error;
                return (
                  <div key={plat} style={{
                    background: '#0d1829',
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <PlatformIcon platform={pmeta} size={18} />
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        color, background: color + '22',
                        border: `1px solid ${color}44`,
                        borderRadius: 4, padding: '1px 7px',
                      }}>{platLower}</span>
                      {sugg && (
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                          ⏰ {sugg}
                        </span>
                      )}
                    </div>
                    {errMsg ? (
                      <div style={{ fontSize: 12, color: '#fca5a5' }}>⚠️ {errMsg}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {caption || '(empty caption)'}
                        </div>
                        {hashtags && (
                          <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 6 }}>
                            {hashtags}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Approving creates one PENDING_APPROVAL post per platform — edit & schedule from Compose or Calendar.
              </div>
            </div>
          );
        }
      }
    } catch {
      // fall through to plain text
    }
  }

  // Only try to render as cards for Post Strategy tasks
  if (task.taskType === 'SUGGEST_POST_TIME' && task.taskOutput) {
    try {
      let raw = task.taskOutput.trim();
      // Strip markdown fences
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```[a-z]*\n?/, '').replace(/```\s*$/, '').trim();
      }
      const start = raw.indexOf('[');
      const end   = raw.lastIndexOf(']');
      if (start >= 0 && end > start) {
        const suggestions = JSON.parse(raw.slice(start, end + 1));
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map((s, i) => {
                const plat = (s.platform || 'instagram').toLowerCase();
                const pmeta = PLATFORM_META_MAP[plat] || { id: plat, color: '#6366f1' };
                const color = pmeta.color;
                return (
                  <div key={i} style={{
                    background: '#0d1829',
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${color}`,
                    borderRadius: 8,
                    padding: '12px 14px',
                  }}>
                    {/* Platform + time row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <PlatformIcon platform={pmeta} size={18} />
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        color, background: color + '22',
                        border: `1px solid ${color}44`,
                        borderRadius: 4, padding: '1px 7px',
                      }}>{plat}</span>
                      <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                        📅 {s.day} at {s.time || '09:00'}
                      </span>
                      {s.topic && (
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                          💡 {s.topic}
                        </span>
                      )}
                    </div>
                    {/* Caption */}
                    <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {(s.caption || s.topic || '(no caption)').replace(/\\n/g, '\n')}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
      }
    } catch {
      // fall through to plain text
    }
  }

  // Default: plain pre-wrapped text — replace literal \n sequences with real newlines
  const rawText = task.taskOutput || task.taskInput || '(no output)';
  const displayText = rawText.replace(/\\n/g, '\n');
  return (
    <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {displayText}
    </div>
  );
}

/**
 * Panel shown after approving a Performance Insight task.
 * Displays 3 concrete action items extracted by the AI.
 */
function InsightActionsPanel({ actions, onDismiss, onCreateStrategy }) {
  const ctaStyle = (type) => ({
    padding: '5px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
    ...(type === 'schedule'
      ? { background: C.accent, color: '#fff' }
      : type === 'post'
      ? { background: C.card2, color: C.text, border: `1px solid ${C.border}` }
      : { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` }),
  });

  const handleCta = (type) => {
    if (type === 'schedule') {
      onCreateStrategy();
    } else if (type === 'post') {
      window.dispatchEvent(new CustomEvent('wint:openCompose'));
    }
    onDismiss();
  };

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.accent}55`,
      borderRadius: '10px',
      marginBottom: '16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(90deg, ${C.accent}18 0%, transparent 100%)`,
      }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>
          📊 Insight Actions
        </span>
        <span style={{ fontSize: '12px', color: C.muted, flex: 1, marginLeft: 10 }}>
          — based on your approved insight
        </span>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: C.muted, fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
        >×</button>
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {actions.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            borderBottom: i < actions.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: '13px', color: C.text, lineHeight: 1.5 }}>{item.action}</span>
            <button style={ctaStyle(item.type)} onClick={() => handleCta(item.type)}>
              {item.cta || 'Got it'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingTaskCard({ task, agent, onApprove, onReject, processing }) {
  const busy = processing === task.id;
  return (
    <div style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {agent && (
          <span style={{ fontSize: '22px' }}>{agent.avatarEmoji || '🤖'}</span>
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent ? agent.name : `Agent #${task.agentId}`}</div>
          {agent && <RoleBadge role={agent.role} />}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <TaskTypeTag taskType={task.taskType} />
        </div>
      </div>

      {/* Output */}
      <div style={{ background: '#0d1829', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px' }}>
        <TaskOutputRenderer task={task} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: C.muted }}>{fmtDateTime(task.createdAt)}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ ...s.btn('success'), opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={() => onApprove(task.id)}>
            {busy ? '...' : '✅ Approve'}
          </button>
          <button style={{ ...s.btn('danger'), opacity: busy ? 0.5 : 1 }} disabled={busy} onClick={() => onReject(task.id)}>
            {busy ? '...' : '❌ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// HistoryRow component removed — Tasks tab no longer has a History sub-view.

function AddAgentModal({ onClose, onCreate }) {
  const [newAgent, setNewAgent] = useState({ name: '', role: '', avatarEmoji: '🤖' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const canSubmit = newAgent.name.trim() && newAgent.role;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setErr('');
    try {
      await onCreate(newAgent);
      onClose();
    } catch (e) {
      setErr(e.message || 'Failed to create agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add AI Agent</h2>
          <button style={{ background: 'none', border: 'none', color: C.muted, fontSize: '20px', cursor: 'pointer' }} onClick={onClose}>×</button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '18px' }}>
          <label style={s.label}>Agent Name</label>
          <input
            style={s.input}
            placeholder="e.g. Content Commander"
            value={newAgent.name}
            onChange={(e) => setNewAgent(a => ({ ...a, name: e.target.value }))}
          />
        </div>

        {/* Role picker */}
        <div style={{ marginBottom: '18px' }}>
          <label style={s.label}>Role</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(ROLE_META).map(([role, meta]) => {
              const active = newAgent.role === role;
              return (
                <div
                  key={role}
                  onClick={() => setNewAgent(a => ({ ...a, role }))}
                  style={{
                    border: `2px solid ${active ? meta.color : C.border}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    background: active ? meta.bg : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, color: active ? meta.color : C.text, fontSize: '14px', marginBottom: '2px' }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted }}>{meta.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: '22px' }}>
          <label style={s.label}>Avatar</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => setNewAgent(a => ({ ...a, avatarEmoji: em }))}
                style={{
                  fontSize: '24px',
                  background: newAgent.avatarEmoji === em ? 'rgba(99,102,241,0.25)' : C.card2,
                  border: `2px solid ${newAgent.avatarEmoji === em ? C.accent : C.border}`,
                  borderRadius: '8px',
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {err && <div style={{ color: C.red, fontSize: '13px', marginBottom: '12px' }}>{err}</div>}

        <button
          style={{ ...s.btn('primary'), width: '100%', justifyContent: 'center', padding: '12px', opacity: (!canSubmit || saving) ? 0.5 : 1 }}
          disabled={!canSubmit || saving}
          onClick={handleCreate}
        >
          {saving ? 'Creating...' : 'Create Agent'}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiWorkspace({ onCaptionApproved } = {}) {
  const { apiBase, authHeaders } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);          // pending tasks
  // History tab removed — no historyTasks / loadingHistory / expandedHistory / taskSubTab needed.
  const [mainTab, setMainTab] = useState('agents');
  const [pendingCount, setPendingCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');
  const [approveMsg, setApproveMsg] = useState('');
  const [insightActions, setInsightActions] = useState(null); // [{icon,action,type,cta}]

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch(`${apiBase}/api/ai-agents`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setAgents(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError('Failed to load agents: ' + e.message);
    } finally {
      setLoadingAgents(false);
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/tasks?status=PENDING`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setError('Failed to load tasks: ' + e.message);
    } finally {
      setLoadingTasks(false);
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/tasks/pending-count`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => ({ count: 0 }));
        setPendingCount(data.count ?? 0);
      }
    } catch {
      // non-critical
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  // History tab + fetchHistoryTasks removed — Tasks tab now shows the Pending list only.

  // On mount
  useEffect(() => {
    fetchAgents();
    fetchPendingTasks();
    fetchPendingCount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Agent actions ──────────────────────────────────────────────────────────

  const handleCreateAgent = async (newAgent) => {
    const res = await fetch(`${apiBase}/api/ai-agents`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAgent.name.trim(),
        role: newAgent.role,
        avatarEmoji: newAgent.avatarEmoji,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Failed to create agent');
    setAgents(prev => [...prev, data]);
  };

  const handleToggleAgent = async (id) => {
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (res.ok) {
        const updated = await res.json().catch(() => null);
        if (updated) {
          setAgents(prev => prev.map(a => a.id === id ? updated : a));
        } else {
          setAgents(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
        }
      }
    } catch {
      setError('Failed to toggle agent.');
    }
  };

  const handleDeleteAgent = async (id) => {
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok || res.status === 204) {
        setAgents(prev => prev.filter(a => a.id !== id));
        setDeleteConfirm(null);
      }
    } catch {
      setError('Failed to delete agent.');
    }
  };

  const handleRunAll = async () => {
    setRunning(true);
    setRunMsg('');
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/run`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        setRunMsg('Agents ran successfully! New tasks may appear in the Tasks tab.');
        fetchPendingTasks();
        fetchPendingCount();
      } else {
        const data = await res.json().catch(() => ({}));
        setRunMsg('Error: ' + (data.error || data.message || 'Run failed'));
      }
    } catch (e) {
      setRunMsg('Error: ' + e.message);
    } finally {
      setRunning(false);
      setTimeout(() => setRunMsg(''), 5000);
    }
  };

  // ── Task actions ───────────────────────────────────────────────────────────

  const handleApprove = async (taskId) => {
    setProcessingTaskId(taskId);
    setApproveMsg('');
    try {
      // Find the task before removing it — we need the caption text for the pre-fill
      const approvedTask = tasks.find(t => t.id === taskId);
      const captionText = approvedTask?.taskOutput || approvedTask?.output || '';

      const res = await fetch(`${apiBase}/api/ai-agents/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setPendingCount(prev => Math.max(0, prev - 1));

        // If the task is a caption draft AND we have a callback, send it to Video Publisher
        const isCaptionDraft = approvedTask?.taskType === 'DRAFT_CAPTION' || approvedTask?.taskType === 'SUGGEST_POST_TIME';
        if (isCaptionDraft && captionText && onCaptionApproved) {
          onCaptionApproved(captionText);
          return; // Navigation happens via the callback — skip the toast
        }

        if (data.postsCreated > 0) {
          setApproveMsg(`✅ ${data.postsCreated} post${data.postsCreated > 1 ? 's' : ''} scheduled to your Content Calendar!`);
          setTimeout(() => setApproveMsg(''), 6000);
        } else if (data.captionApplied) {
          setApproveMsg(`✅ ${data.captionApplied}`);
          setTimeout(() => setApproveMsg(''), 5000);
        } else if (data.actionsExtracted?.length > 0) {
          setInsightActions(data.actionsExtracted);
        }
      }
    } catch {
      setError('Failed to approve task.');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const handleReject = async (taskId) => {
    setProcessingTaskId(taskId);
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setPendingCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      setError('Failed to reject task.');
    } finally {
      setProcessingTaskId(null);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const agentMap = agents.reduce((acc, a) => { acc[a.id] = a; return acc; }, {});

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Collaborative AI Workspace</h1>
          <p style={s.subtitle}>Manage your AI team and review generated tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={{ ...s.btn('outline'), opacity: running ? 0.6 : 1 }}
            disabled={running}
            onClick={handleRunAll}
          >
            {running ? '⏳ Running...' : '▶ Run All Agents Now'}
          </button>
          <button style={s.btn('primary')} onClick={() => setShowAddModal(true)}>
            + Add AI Agent
          </button>
        </div>
      </div>

      {/* Run message */}
      {runMsg && (
        <div style={{
          background: runMsg.startsWith('Error') ? C.redBg : C.greenBg,
          border: `1px solid ${runMsg.startsWith('Error') ? C.red : C.green}`,
          color: runMsg.startsWith('Error') ? C.red : C.green,
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          {runMsg}
        </div>
      )}

      {/* Insight Actions panel */}
      {insightActions && (
        <InsightActionsPanel
          actions={insightActions}
          onDismiss={() => setInsightActions(null)}
          onCreateStrategy={handleRunAll}
        />
      )}

      {/* Approve success */}
      {approveMsg && (
        <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          {approveMsg}
          <button style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '16px' }} onClick={() => setApproveMsg('')}>×</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: C.redBg, border: `1px solid ${C.red}`, color: C.red, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px' }} onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Main tabs */}
      <div style={s.tabBar}>
        <button style={s.tab(mainTab === 'agents')} onClick={() => setMainTab('agents')}>
          🤖 Agents
        </button>
        <button style={s.tab(mainTab === 'tasks')} onClick={() => setMainTab('tasks')}>
          📋 Tasks {pendingCount > 0 && <span style={{ background: C.red, color: '#fff', borderRadius: '999px', fontSize: '10px', padding: '1px 6px', marginLeft: '4px' }}>{pendingCount}</span>}
        </button>
      </div>

      {/* ── AGENTS TAB ── */}
      {mainTab === 'agents' && (
        <>
          {loadingAgents ? (
            <div style={{ color: C.muted, fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>Loading agents...</div>
          ) : agents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
              <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>No agents yet</div>
              <div style={{ color: C.muted, fontSize: '14px', marginBottom: '20px' }}>Create your first AI team member to get started.</div>
              <button style={s.btn('primary')} onClick={() => setShowAddModal(true)}>+ Add AI Agent</button>
            </div>
          ) : (
            <div style={s.agentGrid}>
              {agents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggle={handleToggleAgent}
                  onDelete={handleDeleteAgent}
                  deleteConfirm={deleteConfirm}
                  setDeleteConfirm={setDeleteConfirm}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TASKS TAB ── (History sub-tab removed; Pending is now the only view) */}
      {mainTab === 'tasks' && (
        <>
          {loadingTasks ? (
            <div style={{ color: C.muted, fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>No pending tasks</div>
              <div style={{ color: C.muted, fontSize: '14px', marginBottom: '20px' }}>Run your agents to generate tasks.</div>
              <button
                style={{ ...s.btn('primary'), opacity: running ? 0.6 : 1 }}
                disabled={running}
                onClick={handleRunAll}
              >
                {running ? '⏳ Running...' : '▶ Run Agents'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.map(task => (
                <PendingTaskCard
                  key={task.id}
                  task={task}
                  agent={agentMap[task.agentId]}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processing={processingTaskId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <AddAgentModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateAgent}
        />
      )}
    </div>
  );
}
