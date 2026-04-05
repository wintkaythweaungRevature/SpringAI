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

function fmtDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return String(iso); }
}

export default function PostDetailModal({ post, onClose, platform }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
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

  const status    = String(post.status || 'SCHEDULED').toUpperCase();
  const statusOk  = status === 'SUCCESS' || status === 'PUBLISHED';
  const statusErr = status === 'FAILED';
  const statusClr = statusOk ? '#15803d' : statusErr ? '#dc2626' : '#a16207';
  const statusBg  = statusOk ? '#dcfce7'  : statusErr ? '#fee2e2'  : '#fef9c3';

  const rawCaption = post.caption != null ? String(post.caption) : '';
  const caption    = (() => { try { return decodeURIComponent(rawCaption); } catch { return rawCaption; } })();
  let hashtags = post.hashtags;
  if (Array.isArray(hashtags)) hashtags = hashtags.join(' ');
  else if (hashtags == null) hashtags = '';

  const link      = pickUrl(post);
  const createdAt = fmtDate(post.createdAt);
  const scheduledAt = post.scheduledAt && post.scheduledAt !== post.createdAt ? fmtDate(post.scheduledAt) : null;

  const likes    = post.likes          ?? 0;
  const comments = post.commentsCount  ?? post.comments ?? 0;
  const shares   = post.shares         ?? 0;
  const views    = post.views          ?? 0;
  const impressions  = post.impressions ?? 0;
  const engageRate   = post.engagementRate ?? null;
  const isScheduled  = status === 'SCHEDULED' || status === 'PENDING';

  const mediaType = String(post.mediaType || '').toLowerCase();
  const mediaKeys = ['mediaUrl', 'thumbnailUrl', 'imageUrl', 'videoUrl'];
  let mediaPreview = null;
  for (const k of mediaKeys) {
    if (post[k]) { mediaPreview = { url: post[k], kind: mediaType === 'video' ? 'video' : 'image' }; break; }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10060, background: 'rgba(2,6,23,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', boxSizing: 'border-box' }}
      role="dialog" aria-modal="true" aria-labelledby="post-detail-title"
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 22, boxShadow: '0 32px 80px rgba(0,0,0,0.32)', maxWidth: 'min(540px,100%)', width: '100%', maxHeight: 'min(88vh,760px)', overflow: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Coloured header band ── */}
        <div style={{ background: `linear-gradient(135deg, ${p.color}22 0%, ${p.color}08 100%)`, borderBottom: `1px solid ${p.color}28`, padding: '20px 22px 18px', position: 'relative' }}>
          {/* top accent */}
          <div style={{ position: 'absolute', top: 0, left: 22, right: 22, height: 3, background: p.color, borderRadius: '0 0 4px 4px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            {/* Platform info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', boxShadow: `0 2px 12px ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PlatformIcon platform={p} size={28} />
              </div>
              <div>
                <div id="post-detail-title" style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{p.label || post.platform}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: statusBg, color: statusClr, letterSpacing: '0.04em' }}>{status}</span>
                  {mediaType && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#64748b', textTransform: 'capitalize' }}>{mediaType || 'post'}</span>}
                </div>
              </div>
            </div>
            {/* Close */}
            <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Media preview */}
          {mediaPreview && (
            <div style={{ borderRadius: 12, overflow: 'hidden', maxHeight: 220, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mediaPreview.kind === 'video'
                ? <video src={mediaPreview.url} controls muted style={{ maxWidth: '100%', maxHeight: 220 }} />
                : <img src={mediaPreview.url} alt="post media" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'contain' }} />
              }
            </div>
          )}

          {/* Caption */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Caption</div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f8fafc', borderRadius: 12, padding: '13px 15px', border: '1px solid #e2e8f0', minHeight: 52 }}>
              {caption.trim() || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>(no caption)</span>}
            </div>
          </div>

          {/* Hashtags */}
          {hashtags && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Hashtags</div>
              <div style={{ fontSize: 13, color: '#3b82f6', lineHeight: 1.6, wordBreak: 'break-word' }}>{hashtags}</div>
            </div>
          )}

          {/* ── Engagement Metrics ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engagement</div>
              {isScheduled && <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>Available after publishing</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={metricCard}>
                <span style={{ fontSize: 20 }}>👁</span>
                <div style={metricNum}>{views.toLocaleString()}</div>
                <div style={metricLabel}>Views</div>
              </div>
              <div style={metricCard}>
                <span style={{ fontSize: 20 }}>❤️</span>
                <div style={metricNum}>{likes.toLocaleString()}</div>
                <div style={metricLabel}>Likes</div>
              </div>
              <div style={metricCard}>
                <span style={{ fontSize: 20 }}>💬</span>
                <div style={metricNum}>{comments.toLocaleString()}</div>
                <div style={metricLabel}>Comments</div>
              </div>
              <div style={metricCard}>
                <span style={{ fontSize: 20 }}>↗️</span>
                <div style={metricNum}>{shares.toLocaleString()}</div>
                <div style={metricLabel}>Shares</div>
              </div>
            </div>
            {engageRate !== null && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}>
                <div style={metricCard}>
                  <span style={{ fontSize: 20 }}>📊</span>
                  <div style={metricNum}>{impressions.toLocaleString()}</div>
                  <div style={metricLabel}>Impressions</div>
                </div>
                <div style={metricCard}>
                  <span style={{ fontSize: 20 }}>⚡</span>
                  <div style={metricNum}>{Number(engageRate).toFixed(1)}%</div>
                  <div style={metricLabel}>Eng. Rate</div>
                </div>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 15px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {createdAt && (
              <div style={metaRow}>
                <span style={metaLabel}>Created</span>
                <span style={metaValue}>{createdAt}</span>
              </div>
            )}
            {scheduledAt && (
              <div style={metaRow}>
                <span style={metaLabel}>Scheduled</span>
                <span style={metaValue}>{scheduledAt}</span>
              </div>
            )}
            {post.id != null && (
              <div style={metaRow}>
                <span style={metaLabel}>Post ID</span>
                <span style={{ ...metaValue, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{String(post.id)}</span>
              </div>
            )}
          </div>

          {/* Error message */}
          {post.errorMessage && (
            <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, fontSize: 13, color: '#991b1b', lineHeight: 1.5 }}>
              <strong>Error</strong><br />{post.errorMessage}
            </div>
          )}

          {/* External link */}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff', background: p.color, padding: '9px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', alignSelf: 'flex-start' }}>
              View on {p.label || 'platform'} ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const metricCard = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' };
const metricNum  = { fontSize: 16, fontWeight: 800, color: '#0f172a' };
const metricLabel = { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };
const metaRow   = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 };
const metaLabel = { fontSize: 12, fontWeight: 700, color: '#94a3b8' };
const metaValue = { fontSize: 12, color: '#334155', fontWeight: 600, textAlign: 'right' };
