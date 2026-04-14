import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

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
  bg:      '#0f172a',
  card:    '#1e293b',
  card2:   '#273447',
  border:  '#334155',
  accent:  '#6366f1',
  accentH: '#818cf8',
  text:    '#f1f5f9',
  muted:   '#94a3b8',
  green:   '#22c55e',
  red:     '#ef4444',
  greenBg: 'rgba(34,197,94,0.12)',
  redBg:   'rgba(239,68,68,0.12)',
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
      <div style={{ background: '#0d1829', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '14px', fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {task.taskOutput || task.taskInput || '(no output)'}
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

function HistoryRow({ task, agentMap, expanded, onToggle }) {
  const agent = agentMap[task.agentId];
  const isApproved = task.status === 'APPROVED';
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', marginBottom: '8px', overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', flexWrap: 'wrap' }}
        onClick={onToggle}
      >
        {agent && <span style={{ fontSize: '20px' }}>{agent.avatarEmoji || '🤖'}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent ? agent.name : `Agent #${task.agentId}`}
          </div>
          <div style={{ fontSize: '12px', color: C.muted }}>{fmtDate(task.reviewedAt || task.createdAt)}</div>
        </div>
        <TaskTypeTag taskType={task.taskType} />
        <span style={s.badge(isApproved ? C.green : C.red, isApproved ? C.greenBg : C.redBg)}>
          {isApproved ? 'Approved' : 'Rejected'}
        </span>
        <span style={{ color: C.muted, fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px', background: '#0d1829', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {task.taskOutput || task.taskInput || '(no output)'}
        </div>
      )}
    </div>
  );
}

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

export default function AiWorkspace() {
  const { apiBase, authHeaders } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);          // pending tasks
  const [historyTasks, setHistoryTasks] = useState([]);
  const [mainTab, setMainTab] = useState('agents');
  const [taskSubTab, setTaskSubTab] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [processingTaskId, setProcessingTaskId] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');

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

  const fetchHistoryTasks = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/tasks`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        const arr = Array.isArray(data) ? data : [];
        // History = non-pending tasks
        setHistoryTasks(arr.filter(t => t.status !== 'PENDING'));
      }
    } catch (e) {
      setError('Failed to load history: ' + e.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount
  useEffect(() => {
    fetchAgents();
    fetchPendingTasks();
    fetchPendingCount();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When switching to history sub-tab, load history
  useEffect(() => {
    if (mainTab === 'tasks' && taskSubTab === 'history') {
      fetchHistoryTasks();
    }
  }, [mainTab, taskSubTab]); // eslint-disable-line react-hooks/exhaustive-deps

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
    try {
      const res = await fetch(`${apiBase}/api/ai-agents/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setPendingCount(prev => Math.max(0, prev - 1));
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

      {/* ── TASKS TAB ── */}
      {mainTab === 'tasks' && (
        <>
          {/* Sub-tabs */}
          <div style={{ ...s.tabBar, marginBottom: '20px' }}>
            <button style={s.tab(taskSubTab === 'pending')} onClick={() => setTaskSubTab('pending')}>
              ⏳ Pending {pendingCount > 0 ? `(${pendingCount})` : '(0)'}
            </button>
            <button style={s.tab(taskSubTab === 'history')} onClick={() => setTaskSubTab('history')}>
              ✅ History
            </button>
          </div>

          {/* Pending tasks */}
          {taskSubTab === 'pending' && (
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

          {/* History */}
          {taskSubTab === 'history' && (
            <>
              {loadingHistory ? (
                <div style={{ color: C.muted, fontSize: '14px', padding: '40px 0', textAlign: 'center' }}>Loading history...</div>
              ) : historyTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>No history yet</div>
                  <div style={{ color: C.muted, fontSize: '14px' }}>Approved and rejected tasks will appear here.</div>
                </div>
              ) : (
                <div>
                  {historyTasks.map(task => (
                    <HistoryRow
                      key={task.id}
                      task={task}
                      agentMap={agentMap}
                      expanded={!!expandedHistory[task.id]}
                      onToggle={() => setExpandedHistory(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                    />
                  ))}
                </div>
              )}
            </>
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
