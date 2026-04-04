import React, { useEffect } from 'react';
import PlatformIcon from './PlatformIcon';

function pickUrl(post) {
  const keys = ['postUrl', 'permalink', 'externalUrl', 'url', 'link', 'publicUrl', 'mediaUrl'];
  for (const k of keys) {
    const v = post?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/**
 * Shared modal: full post caption + meta (history / feed).
 * @param {{ post: object, onClose: () => void, platform?: { id: string, label?: string, color?: string, logo?: string, emoji?: string } }} props
 */
export default function PostDetailModal({ post, onClose, platform }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!post) return null;

  const p = platform || {
    id: String(post.platform || 'unknown').toLowerCase(),
    label: post.platform || 'Unknown',
    color: '#64748b',
    emoji: '📤',
    logo: null,
  };

  const status = post.status || '—';
  const statusOk = status === 'SUCCESS' || status === 'PUBLISHED';
  const statusColor = statusOk ? '#16a34a' : status === 'FAILED' ? '#dc2626' : '#d97706';
  const statusBg = statusOk ? '#f0fdf4' : status === 'FAILED' ? '#fef2f2' : '#fffbeb';

  const created = post.createdAt || post.scheduledAt;
  let when = '';
  try {
    when = created
      ? new Date(created).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '';
  } catch {
    when = String(created || '');
  }

  const link = pickUrl(post);
  const rawCaption = post.caption != null ? String(post.caption) : '';
  const caption = (() => { try { return decodeURIComponent(rawCaption); } catch { return rawCaption; } })();
  let hashtags = post.hashtags;
  if (Array.isArray(hashtags)) hashtags = hashtags.join(' ');
  else if (hashtags == null) hashtags = '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10060,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-detail-title"
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: 'min(520px, 100%)',
          width: '100%',
          maxHeight: 'min(85vh, 720px)',
          overflow: 'auto',
          padding: '22px 24px 24px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${p.color || '#6366f1'}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PlatformIcon platform={p} size={26} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 id="post-detail-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                Post details
              </h2>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                {p.label || post.platform}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              color: '#475569',
              width: 40,
              height: 40,
              borderRadius: 10,
              fontSize: 18,
              cursor: 'pointer',
              lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              background: statusBg,
              color: statusColor,
            }}
          >
            {status}
          </span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Caption
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#1e293b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#f8fafc',
            borderRadius: 10,
            padding: '12px 14px',
            border: '1px solid #e2e8f0',
            marginBottom: 14,
            minHeight: 48,
          }}
        >
          {caption.trim() ? caption : '(no caption)'}
        </div>

        {hashtags && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Hashtags
            </div>
            <div style={{ fontSize: 13, color: '#334155', marginBottom: 14, lineHeight: 1.5 }}>{hashtags}</div>
          </>
        )}

        <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#475569' }}>
          <div>
            <strong style={{ color: '#64748b' }}>Media</strong> · {post.mediaType || '—'}
          </div>
          <div>
            <strong style={{ color: '#64748b' }}>Time</strong> · {when || '—'}
          </div>
          {post.scheduledAt && post.scheduledAt !== post.createdAt && (
            <div>
              <strong style={{ color: '#64748b' }}>Scheduled</strong> ·{' '}
              {(() => {
                try {
                  return new Date(post.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                } catch {
                  return post.scheduledAt;
                }
              })()}
            </div>
          )}
          {post.id != null && (
            <div>
              <strong style={{ color: '#64748b' }}>ID</strong> · <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{String(post.id)}</span>
            </div>
          )}
        </div>

        {post.errorMessage && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              fontSize: 13,
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            <strong>Error</strong>
            <br />
            {post.errorMessage}
          </div>
        )}

        {link && (
          <div style={{ marginTop: 16 }}>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, wordBreak: 'break-all' }}>
              Open link ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
