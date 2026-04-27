import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Inline popup for "send post to a workspace member for approval".
 *
 * Reuses the EXACT same pattern Video Publisher already uses:
 *   1. Fetch /api/workspace/{workspaceId}/members
 *   2. Show a dropdown of members (only in this workspace)
 *   3. POST /api/approve/send/{postId} with { memberEmail, memberName }
 *      → backend creates an ApprovalToken + emails the link
 *      → backend writes an APPROVAL_SENT in-app notification for the owner
 *
 * No email goes to the owner (in-app notification only).
 *
 * Props:
 *   post           — the SocialPost { id, workspaceId, ... }
 *   onClose        — invoked when user clicks Cancel or after a successful send
 *   onSent(data)   — optional callback fired on success with the backend response
 *                    (the parent typically refreshes its list / closes modal here)
 */
export default function ApprovalRequestPopup({ post, onClose, onSent }) {
  const { apiBase, authHeaders, activeWorkspaceId } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  // Prefer the post's own workspaceId; fall back to current active workspace
  // (matches behaviour when post lacks an explicit workspace tag — e.g. legacy
  // rows from before workspaces were per-post).
  const workspaceId = post?.workspaceId || activeWorkspaceId || null;

  const [members,   setMembers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [picked,    setPicked]    = useState(null); // { userId, email, firstName, lastName }
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(null);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${base}/api/workspace/${workspaceId}/members`,
          { headers: authHeaders() });
        if (!res.ok) {
          if (alive) setError('Could not load workspace members.');
          return;
        }
        const data = await res.json().catch(() => []);
        if (!alive) return;
        setMembers(Array.isArray(data) ? data : []);
      } catch {
        if (alive) setError('Could not load workspace members.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [workspaceId, base, authHeaders]);

  const send = async () => {
    if (!picked?.email) { setError('Pick a workspace member first.'); return; }
    setSending(true); setError(null);
    try {
      const memberName = picked.firstName
        ? `${picked.firstName} ${picked.lastName || ''}`.trim()
        : picked.email;
      const res = await fetch(`${base}/api/approve/send/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ memberEmail: picked.email, memberName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Send failed (HTTP ${res.status})`);
      setSuccess(data.sent
        ? `📨 Approval link sent to ${picked.email}.`
        : `Token created but email transport failed — share the link manually.`);
      if (onSent) onSent(data);
    } catch (e) {
      setError(e.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { if (!sending) onClose && onClose(); }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          zIndex: 9000,
        }}
      />
      {/* Popup */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(440px, 92vw)',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        padding: '22px 24px',
        zIndex: 9001,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            👤 Send for Approval
          </h3>
          <button
            onClick={() => { if (!sending) onClose && onClose(); }}
            style={{ background: 'none', border: 'none', cursor: sending ? 'wait' : 'pointer', fontSize: 22, color: '#94a3b8', lineHeight: 1, padding: '0 4px' }}
            disabled={sending}
          >×</button>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
          Pick a workspace member to review this post. They'll get an email with
          a private link to approve, request changes, or reject. You'll get an
          in-app notification confirming the send.
        </p>

        {!workspaceId ? (
          <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>
            ⚠️ This post isn't tagged to a workspace. Open a workspace first.
          </p>
        ) : loading ? (
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Loading members…</p>
        ) : members.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
            No members in this workspace yet. Invite a teammate under
            Settings → Team first.
          </p>
        ) : (
          <>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select workspace member to review
            </label>
            <select
              value={picked ? String(picked.userId) : ''}
              onChange={e => {
                const m = members.find(x => String(x.userId) === e.target.value);
                setPicked(m || null);
              }}
              disabled={sending}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #c7d2fe',
                fontSize: 13, color: '#1e293b',
                background: '#fff', cursor: sending ? 'wait' : 'pointer',
                outline: 'none',
              }}
            >
              <option value="">— choose a member —</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m.email}
                  {m.email ? ` (${m.email})` : ''}
                </option>
              ))}
            </select>
            {picked && (
              <p style={{ fontSize: 11, color: '#6366f1', marginTop: 8, marginBottom: 0, fontWeight: 600 }}>
                ✉️ Approval email will be sent to <strong>{picked.email}</strong>
              </p>
            )}
          </>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, fontSize: 12 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 12, padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 8, fontSize: 12 }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { if (!sending) onClose && onClose(); }}
            disabled={sending}
            style={{
              padding: '9px 16px', borderRadius: 8,
              border: '1px solid #cbd5e1', background: 'transparent',
              color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: sending ? 'wait' : 'pointer',
            }}
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && (
            <button
              onClick={send}
              disabled={sending || !picked?.email || members.length === 0}
              style={{
                padding: '9px 18px', borderRadius: 8,
                border: 'none',
                background: (sending || !picked?.email || members.length === 0)
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: (sending || !picked?.email || members.length === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? 'Sending…' : '📤 Send for Approval'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
