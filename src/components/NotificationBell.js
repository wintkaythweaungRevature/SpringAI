import React, { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Header bell + dropdown of unread notifications.
 *
 * Props:
 *   - onOpenPost(postId, payload): called when user clicks a notification row.
 *     The host app should navigate to the calendar and open that post's modal.
 *
 * Visuals match the existing dark top-nav styling (matches App.js link colors).
 */
export default function NotificationBell({ onOpenPost }) {
  const { unreadCount, unread, refresh, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) refresh();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        title="Notifications"
        style={{
          position: 'relative',
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.85)',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: 8,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          fontSize: 18,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0, right: 0,
              minWidth: 18, height: 18,
              padding: '0 5px',
              background: '#ef4444',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 360,
            maxHeight: 480,
            overflowY: 'auto',
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
            zIndex: 10000,
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ fontWeight: 800, color: '#f1f5f9', fontSize: 13 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.16)',
                  color: '#cbd5e1', fontSize: 11, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {unread.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              You're all caught up ✨
            </div>
          )}

          {unread.map(n => (
            <NotificationRow
              key={n.id}
              n={n}
              onOpen={() => {
                const payload = safeParse(n.payload);
                markRead(n.id);
                setOpen(false);
                if (typeof onOpenPost === 'function' && payload?.postId) {
                  onOpenPost(payload.postId, { ...payload, type: n.type });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onOpen }) {
  const payload = safeParse(n.payload);
  const approver = payload.approverEmail || 'reviewer';
  const platform = payload.platform || 'post';
  const note = payload.note || '';
  const captionPreview = payload.captionPreview || '';
  const { emoji, headline } = headlineFor(n.type, payload);
  const timeAgo = timeAgoFrom(n.createdAt);

  return (
    <button
      type="button"
      onClick={onOpen}
      role="menuitem"
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>
          {headline}
        </div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 3 }}>
          <span style={{ textTransform: 'capitalize' }}>{platform}</span>
          {' · '}
          <span>{timeAgo}</span>
        </div>
        {(note || captionPreview) && (
          <div style={{
            marginTop: 6,
            fontSize: 11.5, color: '#cbd5e1', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {note ? `"${note}"` : captionPreview}
          </div>
        )}
      </div>
    </button>
  );
}

function headlineFor(type, p) {
  const approver = p.approverEmail || 'reviewer';
  if (type === 'APPROVAL_DECISION') {
    switch ((p.decision || '').toUpperCase()) {
      case 'APPROVE':         return { emoji: '✅', headline: `${approver} approved your post` };
      case 'REQUEST_CHANGES': return { emoji: '📝', headline: `${approver} requested changes` };
      case 'REJECT':          return { emoji: '❌', headline: `${approver} rejected your post` };
      default:                return { emoji: 'ℹ️', headline: `Update from ${approver}` };
    }
  }
  if (type === 'APPROVAL_EXPIRED') return { emoji: '⏰', headline: `Approval link expired for ${approver}` };
  if (type === 'APPROVAL_REMINDER') return { emoji: '📨', headline: `Reminder sent to ${approver}` };
  return { emoji: 'ℹ️', headline: 'Notification' };
}

function safeParse(s) {
  try { return JSON.parse(s || '{}'); } catch { return {}; }
}

function timeAgoFrom(iso) {
  try {
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (diffSec < 60) return 'just now';
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  } catch { return ''; }
}
