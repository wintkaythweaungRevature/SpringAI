import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ApprovalRequestPopup from './ApprovalRequestPopup';

/**
 * Action bar shown on a PENDING_APPROVAL post (a "draft").
 *
 * The user has two paths from a draft:
 *   🚀 Publish — pick a time (Now / future) → flips status to SCHEDULED.
 *                The existing publish scheduler picks it up and posts it.
 *                NO email goes anywhere.
 *   📨 Send to client — type the client's email → backend issues a token,
 *                stays PENDING_APPROVAL, emails the client a public review
 *                link, AND writes an in-app notification for the owner so
 *                they can confirm the action. Owner receives NO email.
 *
 * Once a post has been sent to a client (an active ApprovalToken exists),
 * the action bar collapses to a status row instead — caller passes
 * `awaitingApproverEmail` to render that variant.
 *
 * Props:
 *   post                   — the SocialPost row { id, status, ... }
 *   awaitingApproverEmail  — string or null. When truthy, renders the
 *                            "awaiting review" status instead of the buttons.
 *   onUpdated              — callback fired after a successful action so the
 *                            parent (Calendar / Modal) can re-fetch.
 */
export default function DraftActionBar({ post, awaitingApproverEmail, onUpdated }) {
  const { apiBase, authHeaders } = useAuth();

  const [mode, setMode] = useState(null);     // null | 'publish'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Send-to-client now reuses the shared ApprovalRequestPopup (workspace member
  // dropdown), matching Video Publisher's pattern. The old inline email-input
  // picker is removed — keep one consistent UX everywhere.
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  // Publish picker state
  const [publishWhen, setPublishWhen] = useState('now'); // 'now' | 'later'
  const [scheduledAt, setScheduledAt] = useState('');

  // Already-sent passive state
  if (awaitingApproverEmail) {
    return (
      <div style={{
        marginTop: 10,
        padding: '10px 12px',
        background: '#fefce8',
        border: '1px solid #fde68a',
        borderRadius: 8,
        fontSize: 13,
        color: '#92400e',
      }}>
        📨 Awaiting review by <strong>{awaitingApproverEmail}</strong>
      </div>
    );
  }

  const reset = () => {
    setMode(null); setError(null); setSuccess(null);
    setPublishWhen('now'); setScheduledAt('');
  };

  const doPublish = async () => {
    setBusy(true); setError(null);
    try {
      const body = publishWhen === 'later' && scheduledAt
        ? { scheduledAt }
        : {};
      const res = await fetch(`${apiBase}/api/social/post/publish-draft/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Publish failed (HTTP ${res.status})`);
      setSuccess(publishWhen === 'now'
        ? '🚀 Publishing — your post will go live within a minute.'
        : `🚀 Scheduled for ${new Date(data.scheduledAt).toLocaleString()}`);
      if (onUpdated) onUpdated(data);
    } catch (e) {
      setError(e.message || 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  // Send-to-client moved to ApprovalRequestPopup (workspace-member dropdown)
  // — same flow Video Publisher uses. The popup itself handles the API call.

  return (
    <div style={{
      marginTop: 10,
      padding: '12px 14px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 8 }}>
        📝 Draft — choose what to do next
      </div>

      {/* Default two-button state */}
      {!mode && !success && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => { reset(); setMode('publish'); }}
            style={btnPrimary}
          >
            🚀 Publish
          </button>
          <button
            onClick={() => setShowApprovalPopup(true)}
            style={btnSecondary}
          >
            👤 Approval Request
          </button>
        </div>
      )}

      {/* Publish picker */}
      {mode === 'publish' && !success && (
        <div>
          <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginBottom: 8 }}>When?</div>
          <label style={radioLabel}>
            <input
              type="radio"
              name={`when-${post.id}`}
              value="now"
              checked={publishWhen === 'now'}
              onChange={() => setPublishWhen('now')}
              disabled={busy}
            />
            Publish now
          </label>
          <label style={radioLabel}>
            <input
              type="radio"
              name={`when-${post.id}`}
              value="later"
              checked={publishWhen === 'later'}
              onChange={() => setPublishWhen('later')}
              disabled={busy}
            />
            Schedule for…
          </label>
          {publishWhen === 'later' && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              disabled={busy}
              style={inputStyle}
            />
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={doPublish} disabled={busy} style={btnPrimary}>
              {busy ? 'Working…' : 'Confirm'}
            </button>
            <button onClick={reset} disabled={busy} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Inline feedback */}
      {error && (
        <div style={{ marginTop: 10, padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 6, fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: 10, padding: '6px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 6, fontSize: 12 }}>
          {success}
        </div>
      )}

      {/* Approval Request popup — same shared component used by PostDetailModal,
          loads workspace members and POSTs to /api/approve/send/{postId}. */}
      {showApprovalPopup && (
        <ApprovalRequestPopup
          post={post}
          onClose={() => setShowApprovalPopup(false)}
          onSent={(data) => {
            setSuccess(data?.sent
              ? `📨 Approval link sent.`
              : `Token created — share the link manually if email failed.`);
            if (onUpdated) onUpdated(data);
          }}
        />
      )}
    </div>
  );
}

const btnPrimary = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
const btnSecondary = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #6366f1',
  background: '#fff',
  color: '#6366f1',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
const btnGhost = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: 'transparent',
  color: '#475569',
  fontSize: 13,
  cursor: 'pointer',
};
const radioLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  color: '#334155',
  marginBottom: 4,
  cursor: 'pointer',
};
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 13,
  outline: 'none',
  marginTop: 6,
};
