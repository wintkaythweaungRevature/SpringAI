import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fireToast } from '../components/Toast';

/**
 * Polls /api/notifications/count every 60 seconds and fetches the full list
 * only when the count goes UP (new notifications arrived) or when the dropdown
 * is opened. Fires a toast for the first new notification in each poll cycle.
 *
 * Returns: { unreadCount, unread, refresh, markRead, markAllRead }
 *
 * Notes
 *  - Unauthenticated sessions short-circuit — no poll runs.
 *  - The backend returns at most 20 unread rows; we use that slice for the dropdown.
 *  - Toasts are fired only when count increases — not on every poll — so a reload
 *    with 3 existing unread doesn't produce 3 toasts.
 */
export function useNotifications() {
  const { user, token, apiBase } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unread, setUnread] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ref rather than state so setInterval closure sees the latest value without re-binding.
  const lastCountRef = useRef(0);
  const lastTopIdRef = useRef(null);

  const base = apiBase || '';

  const fetchList = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${base}/api/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const list = await res.json();
      setUnread(Array.isArray(list) ? list : []);
    } catch {
      /* swallow — transient network errors shouldn't break the UI */
    }
  }, [base, token]);

  const pollCount = useCallback(async () => {
    if (!token || !user) return;
    try {
      const res = await fetch(`${base}/api/notifications/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { unread: n } = await res.json();
      const prev = lastCountRef.current;
      lastCountRef.current = n || 0;
      setUnreadCount(n || 0);

      // New notifications arrived since last poll → refresh the dropdown list + toast the newest.
      if ((n || 0) > prev) {
        const prevTopId = lastTopIdRef.current;
        const refreshed = await fetch(`${base}/api/notifications/unread`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.ok ? r.json() : []).catch(() => []);
        if (Array.isArray(refreshed)) {
          setUnread(refreshed);
          const top = refreshed[0];
          if (top && top.id !== prevTopId) {
            lastTopIdRef.current = top.id;
            toastFromNotification(top);
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, [base, token, user]);

  // 60-second poll loop.
  useEffect(() => {
    if (!token || !user) return undefined;
    pollCount();
    const iv = setInterval(pollCount, 60_000);
    return () => clearInterval(iv);
  }, [token, user, pollCount]);

  const markRead = useCallback(async (id) => {
    if (!token) return;
    try {
      await fetch(`${base}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnread(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      lastCountRef.current = Math.max(0, lastCountRef.current - 1);
    } catch {
      /* ignore */
    }
  }, [base, token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await fetch(`${base}/api/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnread([]);
      setUnreadCount(0);
      lastCountRef.current = 0;
    } catch {
      /* ignore */
    }
  }, [base, token]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchList();
    setLoading(false);
  }, [fetchList]);

  return { unreadCount, unread, loading, refresh, markRead, markAllRead };
}

/** Translate a Notification row from the backend into a toast. */
function toastFromNotification(n) {
  let payload = {};
  try { payload = JSON.parse(n.payload || '{}'); } catch { /* ignore */ }
  const approver = payload.approverEmail || 'reviewer';
  const platform = payload.platform || 'post';

  if (n.type === 'APPROVAL_DECISION') {
    switch ((payload.decision || '').toUpperCase()) {
      case 'APPROVE':
        fireToast({
          kind: 'success',
          message: `✅ ${approver} approved your ${platform} post`,
        });
        return;
      case 'REQUEST_CHANGES':
        fireToast({
          kind: 'warning',
          message: `📝 ${approver} requested changes on your ${platform} post`,
        });
        return;
      case 'REJECT':
        fireToast({
          kind: 'error',
          message: `❌ ${approver} rejected your ${platform} post`,
        });
        return;
      default:
        return;
    }
  }

  if (n.type === 'APPROVAL_EXPIRED') {
    fireToast({
      kind: 'warning',
      message: `⏰ The approval link to ${approver} expired without action`,
    });
    return;
  }

  if (n.type === 'APPROVAL_REMINDER') {
    fireToast({ kind: 'info', message: `Reminder sent to ${approver}` });
  }
}

export default useNotifications;
