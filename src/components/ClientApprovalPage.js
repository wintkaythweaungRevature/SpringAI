import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE
  ? process.env.REACT_APP_API_BASE.replace(/\/$/, '')
  : 'https://api.wintaibot.com';

const PLATFORM_COLORS = {
  instagram: '#E1306C', tiktok: '#010101', youtube: '#FF0000',
  linkedin: '#0A66C2', facebook: '#1877F2', x: '#000', twitter: '#000',
};
const PLATFORM_EMOJIS = {
  instagram: '📸', tiktok: '🎵', youtube: '▶️',
  linkedin: '💼', facebook: '📘', x: '✖️', twitter: '✖️',
};

function fmt(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return iso; }
}

export default function ClientApprovalPage({ token }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [note, setNote]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(null); // { action, message }

  useEffect(() => {
    if (!token) { setError('Invalid link.'); setLoading(false); return; }
    fetch(`${API_BASE}/api/approve/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message || 'Could not load post'))
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async (action) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/approve/${token}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Action failed');
      setDone({ action, message: d.message });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const post = data?.post;
  const pColor = post ? (PLATFORM_COLORS[post.platform?.toLowerCase()] || '#6366f1') : '#6366f1';
  const pEmoji = post ? (PLATFORM_EMOJIS[post.platform?.toLowerCase()] || '📄') : '📄';

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading post preview…</div>
      </div>
    </div>
  );

  if (error && !data) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Link issue</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{error}</div>
        </div>
      </div>
    </div>
  );

  if (done) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {done.action === 'APPROVE' ? '✅' : done.action === 'REJECT' ? '❌' : '✏️'}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>
            {done.action === 'APPROVE' ? 'Post Approved!' : done.action === 'REJECT' ? 'Post Rejected' : 'Changes Requested'}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{done.message}</div>
        </div>
      </div>
    </div>
  );

  if (data?.used && data?.decision !== 'PENDING') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
            Already responded
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            This link was already used. Decision: <strong>{data.decision}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand header */}
        <div style={{ ...styles.header, background: `linear-gradient(135deg, ${pColor}22, #f8fafc)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{pEmoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Post Review Request</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Your feedback is needed before this post goes live
              </div>
            </div>
          </div>
          {post?.scheduledAt && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#475569', background: '#fff', borderRadius: 8, padding: '6px 10px', display: 'inline-block' }}>
              🕒 Scheduled: {fmt(post.scheduledAt)}
            </div>
          )}
        </div>

        {/* Post preview */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>
            {pEmoji} {post?.platform?.toUpperCase() || 'POST'} · {post?.publishType?.toUpperCase() || 'FEED'}
          </div>

          <div style={{
            background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12,
            padding: '16px', marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {post?.caption || '(No caption)'}
            </div>
            {post?.hashtags && (
              <div style={{ fontSize: 13, color: pColor, marginTop: 8 }}>{post.hashtags}</div>
            )}
          </div>

          {/* Expires notice */}
          {data?.expiresAt && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16, textAlign: 'right' }}>
              Link expires: {fmt(data.expiresAt)}
            </div>
          )}

          {/* Note input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a comment or request changes here…"
              rows={3}
              style={{
                width: '100%', borderRadius: 10, border: '1.5px solid #e2e8f0',
                padding: '10px 12px', fontSize: 13, resize: 'vertical',
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                color: '#1e293b',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {/* Approve — primary action */}
            <button
              onClick={() => submit('APPROVE')}
              disabled={submitting}
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#16a34a,#15803d)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? 'Submitting…' : '✅ Approve Post'}
            </button>
            {/* Secondary row: request changes + reject */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => submit('REQUEST_CHANGES')}
                disabled={submitting}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#475569', fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
                }}
              >
                ✏️ Request Changes
              </button>
              <button
                onClick={() => submit('REJECT')}
                disabled={submitting}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10,
                  border: '1.5px solid #fca5a5', background: '#fff',
                  color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
                }}
              >
                ❌ Reject
              </button>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>⚠️ {error}</div>
          )}

          <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', paddingBottom: 16 }}>
            Powered by <strong style={{ color: '#6366f1' }}>WintAi</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f1f5f9',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '40px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: '100%', maxWidth: 500,
    background: '#fff', borderRadius: 20,
    boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
};
