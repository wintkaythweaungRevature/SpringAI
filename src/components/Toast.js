import React, { useEffect, useState } from 'react';

/**
 * Tiny toast module — no external deps.
 *
 * Usage:
 *   import { fireToast, ToastHost } from './Toast';
 *   // Mount <ToastHost /> once inside <App/>.
 *   // Fire from anywhere:
 *   fireToast({ kind: 'success', message: 'Saved!' });
 *   fireToast({ kind: 'warning', message: '1 post needs attention', action: { label: 'View', onClick: () => ... } });
 *
 * Kinds: 'success' | 'warning' | 'error' | 'info'
 * Auto-dismiss after 4500ms; manually dismissable via the ✕.
 *
 * Backed by a simple pub/sub — each ToastHost instance subscribes and
 * renders the current queue. Only one host should mount per page.
 */

const listeners = new Set();
let nextId = 1;

export function fireToast(toast) {
  const entry = {
    id: nextId++,
    kind: toast?.kind || 'info',
    message: toast?.message || '',
    action: toast?.action || null,
  };
  listeners.forEach(fn => fn(entry));
  return entry.id;
}

const COLORS = {
  success: { bg: '#ecfdf5', border: '#86efac', text: '#065f46', icon: '✅' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '📝' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '❌' },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: 'ℹ️' },
};

export function ToastHost() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handler = (entry) => {
      setQueue(prev => [...prev, entry]);
      setTimeout(() => {
        setQueue(prev => prev.filter(t => t.id !== entry.id));
      }, 4500);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (queue.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 360,
      }}
    >
      {queue.map(t => {
        const c = COLORS[t.kind] || COLORS.info;
        return (
          <div
            key={t.id}
            role="status"
            style={{
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              color: c.text,
              padding: '12px 14px',
              borderRadius: 12,
              boxShadow: '0 10px 30px rgba(15,23,42,0.18)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.5,
              animation: 'wintToastIn 0.18s ease-out',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{c.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div>{t.message}</div>
              {t.action?.label && (
                <button
                  type="button"
                  onClick={() => {
                    try { t.action.onClick && t.action.onClick(); } catch {}
                    setQueue(prev => prev.filter(x => x.id !== t.id));
                  }}
                  style={{
                    marginTop: 6, padding: '4px 10px',
                    background: 'transparent',
                    border: `1px solid ${c.border}`,
                    borderRadius: 8,
                    color: c.text, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.action.label} →
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setQueue(prev => prev.filter(x => x.id !== t.id))}
              aria-label="Dismiss"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: c.text, opacity: 0.6, fontSize: 14, padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes wintToastIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default ToastHost;
