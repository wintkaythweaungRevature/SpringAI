import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { filterEnabledPlatforms } from '../config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';
import PostDetailModal from './PostDetailModal';
import ComposePostModal from './ComposePostModal';
import { getHolidaysForDate, HOLIDAY_COLORS } from '../data/holidays';
import {
  fetchPreviewDisplayUrl,
  rawMediaRefForCalendarPost,
  looksLikeS3HttpUrl,
  syncDisplayableMediaUrl,
} from '../utils/mediaPreviewResolve';

function safeDecodeCaption(s) {
  if (!s) return s;
  try { return decodeURIComponent(s); } catch { return s; }
}

/* ─────────────────────────────────────────────────────────────────────────────
   ContentCalendar — Visual Calendar & Feed Planner
   Shows scheduled + published posts on a month calendar with:
   - Month navigation with post indicators per day
   - Week timeline view with time-slot cards
   - Instagram-style feed grid preview
   - Upcoming posts sidebar
───────────────────────────────────────────────────────────────────────────── */

const PLATFORMS_ALL = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', logo: 'instagram' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', logo: 'facebook'  },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', logo: 'youtube'   },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', logo: 'tiktok'    },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', logo: 'linkedin'  },
  { id: 'x',         label: 'X',         color: '#000000', logo: 'x'         },
  { id: 'threads',   label: 'Threads',   color: '#101010', logo: 'threads'   },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', logo: 'pinterest' },
];
/** Picker / filter pills only — disabled platforms still resolve in PLATFORM_MAP for old posts */
const PLATFORMS = filterEnabledPlatforms(PLATFORMS_ALL);
const PLATFORM_MAP = Object.fromEntries(PLATFORMS_ALL.map((p) => [p.id, p]));
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function platformColor(pid) {
  return PLATFORM_MAP[pid?.toLowerCase()]?.color || '#6366f1';
}

function fmtTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

/** First non-empty string among API variants (camelCase / snake_case). */
function firstNonEmptyStr(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/**
 * Best effort: scheduled wall/UTC instant from API (string, ISO, or ms epoch).
 * Omits generic publishAt unless nothing else matches (some backends overload it).
 */
function scheduledTimeFromPost(post) {
  const raw = post?.job && typeof post.job === 'object' ? post.job : null;
  const candidates = [
    post?.scheduledAt,
    post?.scheduled_at,
    post?.scheduledTime,
    post?.scheduled_time,
    post?.scheduledFor,
    post?.scheduled_for,
    post?.executeAt,
    post?.execute_at,
    post?.runAt,
    post?.run_at,
    post?.dateTime,
    post?.date_time,
    raw?.scheduledAt,
    raw?.scheduled_at,
    post?.publishAt,
    post?.publish_at,
  ];
  for (const v of candidates) {
    if (v == null || (typeof v === 'string' && v.trim() === '')) continue;
    if (typeof v === 'number' && Number.isFinite(v)) {
      const d = new Date(v);
      if (Number.isFinite(d.getTime())) return d.toISOString();
      continue;
    }
    const s = String(v).trim();
    if (s) return s;
  }
  return '';
}

function normalizePostListPayload(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.posts)) return raw.posts;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

/**
 * Which instant to plot on the calendar.
 * If we have a valid scheduled time, use it unless the post clearly finished and publishedAt is on/after that time.
 * (Fixes rows where status=SUCCESS but the job is still future-dated, or scheduledAt was ignored in favor of createdAt.)
 */
function postCalendarTimestamp(post) {
  const scheduled = scheduledTimeFromPost(post);
  const created = firstNonEmptyStr(post?.createdAt, post?.created_at);
  const published = firstNonEmptyStr(post?.publishedAt, post?.published_at);
  const s = String(post?.status || '').toUpperCase();

  const schedMs = scheduled ? new Date(scheduled).getTime() : NaN;
  const hasScheduled = Number.isFinite(schedMs);

  if (hasScheduled) {
    const pubMs = published ? new Date(published).getTime() : NaN;
    const terminalDone = s === 'SUCCESS' || s === 'PUBLISHED' || s === 'COMPLETED';
    if (terminalDone && Number.isFinite(pubMs) && pubMs >= schedMs - 60_000) {
      return published;
    }
    return scheduled;
  }

  if (s === 'SUCCESS' || s === 'PUBLISHED' || s === 'FAILED' || s === 'COMPLETED') {
    return published || created || scheduled;
  }
  if (s === 'SCHEDULED' || s === 'PENDING' || s === 'QUEUED') {
    return scheduled || created;
  }
  return scheduled || created;
}

function postCalendarDate(post) {
  return new Date(postCalendarTimestamp(post));
}

/** True when the post is still scheduled / not yet published (for day-cell border). */
function isPostScheduled(post) {
  const s = String(post?.status || '').toUpperCase();
  if (s === 'SCHEDULED' || s === 'PENDING' || s === 'QUEUED' || s === 'PROCESSING') return true;
  if (s === 'SUCCESS' || s === 'PUBLISHED' || s === 'FAILED' || s === 'COMPLETED') return false;
  try {
    const t = new Date(postCalendarTimestamp(post)).getTime();
    return Number.isFinite(t) && t > Date.now();
  } catch {
    return false;
  }
}

const POST_STATUS_UI = {
  published:        { label: 'Published',       emoji: '🟢', pillBg: '#f0fdf4', pillFg: '#15803d', solid: '#16a34a' },
  scheduled:        { label: 'Scheduled',       emoji: '🟡', pillBg: '#fffbeb', pillFg: '#b45309', solid: '#ca8a04' },
  draft:            { label: 'Draft',           emoji: '🔵', pillBg: '#eff6ff', pillFg: '#1d4ed8', solid: '#2563eb' },
  failed:           { label: 'Failed',          emoji: '🔴', pillBg: '#fef2f2', pillFg: '#b91c1c', solid: '#dc2626' },
  pending_approval: { label: 'Pending Approval',emoji: '🔶', pillBg: '#fef3c7', pillFg: '#92400e', solid: '#f59e0b' },
  changes_requested:{ label: 'Changes Requested',emoji: '⛔',pillBg: '#fee2e2', pillFg: '#991b1b', solid: '#ef4444' },
};

function getPostStatusCategory(post) {
  const s = String(post?.status || '').toUpperCase();
  if (s === 'PENDING_APPROVAL') return 'pending_approval';
  if (s === 'CHANGES_REQUESTED') return 'changes_requested';
  if (s === 'FAILED') return 'failed';
  if (s === 'DRAFT' || s === 'UNSCHEDULED') return 'draft';
  if (s === 'SUCCESS' || s === 'PUBLISHED' || s === 'COMPLETED') return 'published';
  if (['SCHEDULED', 'PENDING', 'QUEUED', 'PROCESSING'].includes(s)) return 'scheduled';
  const pub = post?.publishedAt || post?.published_at;
  if (pub && String(pub).trim()) {
    const pm = new Date(pub).getTime();
    if (Number.isFinite(pm)) return 'published';
  }
  const sched = scheduledTimeFromPost(post);
  if (sched) {
    const sm = new Date(sched).getTime();
    if (Number.isFinite(sm) && sm > Date.now()) return 'scheduled';
  }
  return 'draft';
}

function getPostStatusUi(post) {
  const key = getPostStatusCategory(post);
  return { key, ...POST_STATUS_UI[key] };
}

function pickFirstUrl(...vals) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function isHttpUrl(s) {
  return typeof s === 'string' && /^\s*https?:\/\//i.test(s.trim());
}

/** Prefer a real browser-loadable URL over raw S3 keys when merging overview + history. */
function pickBestMediaUrl(a, b) {
  const aa = typeof a === 'string' ? a.trim() : '';
  const bb = typeof b === 'string' ? b.trim() : '';
  if (isHttpUrl(aa)) return aa;
  if (isHttpUrl(bb)) return bb;
  return pickFirstUrl(a, b);
}

function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function coalesceMetric(pVal, srcVal) {
  const a = toNum(pVal);
  if (a !== null) return a;
  const b = toNum(srcVal);
  if (b !== null) return b;
  return 0;
}

function fmtCount(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '0';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${Math.round(v / 1_000)}K`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(Math.round(v));
}

function youtubeVideoIdForCalendarPost(post) {
  if (String(post?.platform || '').toLowerCase() !== 'youtube') return null;
  const pid = post?.platformPostId ?? post?.platform_post_id;
  if (!pid || typeof pid !== 'string') return null;
  let s = pid.trim();
  const m1 = s.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&?/]|$)/);
  if (m1) return m1[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function getPostPreview(post) {
  const mediaType = String(post?.mediaType || '').toLowerCase();
  const mediaUrl = pickFirstUrl(
    post?.mediaUrl,
    post?.videoUrl,
    post?.fileUrl,
    post?.assetUrl,
    post?.url,
  );
  const thumbUrl = pickFirstUrl(
    post?.thumbnailUrl,
    post?.thumbnail,
    post?.thumbUrl,
    post?.posterUrl,
    post?.previewImageUrl,
    post?.previewUrl,
    post?.imageUrl,
    post?.coverUrl,
  );

  if (thumbUrl) return { kind: 'image', url: thumbUrl };
  if (mediaType === 'image' && mediaUrl) return { kind: 'image', url: mediaUrl };
  if (mediaType === 'video' && mediaUrl) return { kind: 'video', url: mediaUrl };
  if (mediaUrl) return { kind: 'media', url: mediaUrl };
  const ytId = youtubeVideoIdForCalendarPost(post);
  if (ytId) return { kind: 'image', url: `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` };
  return null;
}

/** Preview URL is video bytes — use <video>. Image/poster URLs must use <img> even for video posts. */
function previewIsVideoMedia(preview) {
  return preview?.kind === 'video';
}

/** Post is a video (for play overlay) — includes posts whose preview is still a thumbnail image. */
function previewIsVideoPost(post, preview) {
  return (
    String(post?.mediaType || '').toLowerCase() === 'video' || preview?.kind === 'video'
  );
}

/**
 * Thumbnail / preview with the same presign path as PostDetailModal — fixes broken S3 keys and raw refs.
 */
function ResolvedPostMedia({
  post,
  wrapperStyle = {},
  imgStyle = {},
  videoStyle = {},
  playOverlay = false,
  playOverlayStyle = {},
}) {
  const { token, apiBase } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const preview = getPostPreview(post);
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    const sync = syncDisplayableMediaUrl(post, getPostPreview, youtubeVideoIdForCalendarPost);
    setUrl(sync || '');
    const raw = rawMediaRefForCalendarPost(post);
    if (!raw) return () => { cancelled = true; };
    const needsPresign = !/^https?:\/\//i.test(raw) || looksLikeS3HttpUrl(raw);
    if (!needsPresign || !token) {
      if (!sync) setUrl(raw);
      return () => { cancelled = true; };
    }
    if (sync) return () => { cancelled = true; };
    (async () => {
      const resolved = await fetchPreviewDisplayUrl(raw, { token, base });
      if (!cancelled && resolved) setUrl(resolved);
    })();
    return () => { cancelled = true; };
  }, [post, token, base]);

  if (!preview?.url) return null;

  const asVideo = previewIsVideoMedia(preview);
  const showPlay = playOverlay && previewIsVideoPost(post, preview);

  if (!url || failed) {
    return (
      <div
        style={{
          ...wrapperStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e2e8f0',
          color: '#94a3b8',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {failed ? '—' : '…'}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...wrapperStyle }}>
      {asVideo ? (
        <video
          src={url}
          muted
          preload="metadata"
          playsInline
          style={{ display: 'block', ...videoStyle }}
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={url}
          alt=""
          referrerPolicy="no-referrer"
          style={{ display: 'block', ...imgStyle }}
          onError={() => setFailed(true)}
        />
      )}
      {showPlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.35)',
            fontSize: 14,
            color: '#fff',
            pointerEvents: 'none',
            ...playOverlayStyle,
          }}
        >
          ▶
        </div>
      )}
    </div>
  );
}

function postMergeKey(post) {
  // PublishJob rows use id === jobId; never share a key with SocialPost id (same number = wrong merge).
  if (post?.jobId != null && String(post.jobId).trim() !== '') {
    return `job:${String(post.jobId)}`;
  }
  if (post?.id != null && String(post.id).trim() !== '') {
    return `post:${String(post.id)}`;
  }
  const platform = String(post?.platform || '').toLowerCase();
  const caption = String(post?.caption || '').trim().slice(0, 80).toLowerCase();
  const rawTs = postCalendarTimestamp(post);
  const ts = rawTs ? new Date(rawTs).getTime() : 0;
  const minuteBucket = Number.isFinite(ts) ? Math.floor(ts / 60000) : 0;
  return `${platform}|${caption}|${minuteBucket}`;
}

function mergeOneRow(p, src) {
  return {
    ...src,
    ...p,
    scheduledAt: firstNonEmptyStr(
      scheduledTimeFromPost(p),
      scheduledTimeFromPost(src),
    ),
    createdAt: firstNonEmptyStr(p?.createdAt, p?.created_at, src?.createdAt, src?.created_at),
    publishedAt: firstNonEmptyStr(p?.publishedAt, p?.published_at, src?.publishedAt, src?.published_at),
    status:
      p?.status != null && String(p.status).trim() !== ''
        ? p.status
        : src?.status,
    mediaUrl: pickBestMediaUrl(p?.mediaUrl, src?.mediaUrl),
    thumbnailUrl: pickFirstUrl(
      p?.thumbnailUrl,
      p?.thumbnail,
      p?.thumbUrl,
      p?.posterUrl,
      p?.previewImageUrl,
      p?.previewUrl,
      p?.imageUrl,
      p?.coverUrl,
      src?.thumbnailUrl,
      src?.thumbnail,
      src?.thumbUrl,
      src?.posterUrl,
      src?.previewImageUrl,
      src?.previewUrl,
      src?.imageUrl,
      src?.coverUrl,
    ),
    imageUrl: pickFirstUrl(p?.imageUrl, src?.imageUrl),
    likes: coalesceMetric(p?.likes, src?.likes),
    commentsCount: coalesceMetric(
      p?.commentsCount ?? p?.comments,
      src?.commentsCount ?? src?.comments,
    ),
    comments: coalesceMetric(p?.comments ?? p?.commentsCount, src?.comments ?? src?.commentsCount),
    shares: coalesceMetric(p?.shares, src?.shares),
    views: coalesceMetric(p?.views, src?.views),
    impressions: coalesceMetric(p?.impressions, src?.impressions),
    reach: coalesceMetric(p?.reach, src?.reach),
  };
}

function mergeRecentWithHistory(recentActivity, historyPosts) {
  const recent = normalizePostListPayload(recentActivity);
  const history = normalizePostListPayload(historyPosts);

  const historyById = new Map(history.filter(p => p?.id != null).map(p => [String(p.id), p]));
  const historyByKey = new Map(history.map(p => [postMergeKey(p), p]));

  const merged = recent.map((p) => {
    const byId =
      p?.jobId == null && p?.id != null ? historyById.get(String(p.id)) : null;
    const byKey = historyByKey.get(postMergeKey(p));
    const src = byId || byKey || {};
    return mergeOneRow(p, src);
  });

  const seenPostIds = new Set(
    merged
      .filter((p) => p?.id != null && p.jobId == null)
      .map((p) => String(p.id)),
  );
  const extras = history
    .filter((h) => h?.id != null && !seenPostIds.has(String(h.id)))
    .map((h) => mergeOneRow(h, historyById.get(String(h.id)) || {}));

  return [...merged, ...extras];
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

/* ── Month grid helpers ─────────────────────────────────────────────────── */
function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startDow = first.getDay(); // 0=Sun
  const days = [];
  // leading blanks
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  // trailing blanks to complete last row
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

/* ── Scheduled post modal ───────────────────────────────────────────────── */
function DayModal({ date, posts, onClose, onRetryFailed, retryingIds = {}, onCancelJob, onDeletePost, onRescheduleJob, reschedulingJob, newDateTime, setNewDateTime, setReschedulingJob, onPostSelect }) {
  const dayPosts = posts.filter(p => {
    try { return sameDay(postCalendarDate(p), date); } catch { return false; }
  });

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={ms.header}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{weekday}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{dateStr}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{dayPosts.length} post{dayPosts.length !== 1 ? 's' : ''} scheduled</div>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ── Posts ── */}
        {dayPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No posts scheduled</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>This day is free!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dayPosts.map((p, i) => {
              const pInfo = PLATFORM_MAP[p.platform?.toLowerCase()];
              const pColor = platformColor(p.platform);
              const preview = getPostPreview(p);
              const isVideo = String(p.mediaType || '').toLowerCase() === 'video';
              const isVideoPostModal = previewIsVideoPost(p, preview);
              const canRetry =
                String(p.status || '').toUpperCase() === 'FAILED' &&
                p.id != null &&
                p.jobId == null;
              const retrying = canRetry && !!retryingIds[String(p.id)];
              const isScheduled = ['SCHEDULED','PENDING'].includes(String(p.status || '').toUpperCase()) && p.jobId != null;
              const isScheduledPost = ['SCHEDULED','PENDING'].includes(String(p.status || '').toUpperCase()) && p.jobId == null;
              const isFailedPost = String(p.status || '').toUpperCase() === 'FAILED' && p.jobId == null;
              const jobId = p.jobId;
              const st = getPostStatusUi(p);

              const likes    = p.likes          ?? null;
              const comments = p.commentsCount   ?? p.comments ?? null;
              const shares   = p.shares          ?? null;
              const views    = p.views           ?? null;
              const hasMetrics = likes !== null || comments !== null || shares !== null || views !== null;

              return (
                <div
                  key={i}
                  role={typeof onPostSelect === 'function' ? 'button' : undefined}
                  tabIndex={typeof onPostSelect === 'function' ? 0 : undefined}
                  style={{
                    ...ms.postCard,
                    ...(typeof onPostSelect === 'function' ? { cursor: 'pointer' } : {}),
                  }}
                  onClick={() => typeof onPostSelect === 'function' && onPostSelect(p)}
                  onKeyDown={(e) => {
                    if (typeof onPostSelect === 'function' && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onPostSelect(p);
                    }
                  }}
                >
                  {/* top accent bar in platform color */}
                  <div style={{ height: 3, background: pColor, borderRadius: '8px 8px 0 0', margin: '-14px -14px 14px -14px' }} />

                  <div style={{ display: 'flex', gap: 12 }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: 76, height: 76, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      background: '#f1f5f9', border: '1px solid #e2e8f0', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {preview?.url ? (
                        <ResolvedPostMedia
                          post={p}
                          playOverlay={isVideoPostModal}
                          playOverlayStyle={{ background: 'rgba(0,0,0,0.28)', fontSize: 16 }}
                          wrapperStyle={{ width: '100%', height: '100%' }}
                          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: 22 }}>{isVideo ? '🎬' : String(p.mediaType || '').toLowerCase() === 'image' ? '🖼️' : '✍️'}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Platform + time + status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        {pInfo && <PlatformIcon platform={pInfo} size={15} />}
                        <span style={{ fontWeight: 700, fontSize: 13, color: pColor, textTransform: 'capitalize' }}>{pInfo?.label || p.platform}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', fontWeight: 600 }}>{fmtTime(postCalendarTimestamp(p))}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: st.pillBg, color: st.pillFg }}>
                          {st.emoji} {st.label}
                        </span>
                      </div>

                      {/* Caption */}
                      <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {safeDecodeCaption(p.caption) || <em style={{ color: '#94a3b8' }}>(no caption)</em>}
                      </div>

                      {/* Changes Requested comment — visible to agency (OWNER/ADMIN) */}
                      {String(p.status || '').toUpperCase() === 'CHANGES_REQUESTED' && p.approvalComment && (
                        <div style={{
                          marginTop: 6, padding: '6px 10px', borderRadius: 8, fontSize: 11,
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                          color: '#f87171',
                        }}>
                          <strong>Client feedback:</strong> {p.approvalComment}
                        </div>
                      )}

                      {/* Media type tag */}
                      <div style={{ marginTop: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: 6, textTransform: 'capitalize' }}>
                          {p.mediaType || 'post'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Metrics row ── */}
                  {hasMetrics && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                      {views !== null && (
                        <div style={ms.metric}>
                          <span style={{ fontSize: 14 }}>👁</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{views.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Views</div>
                          </div>
                        </div>
                      )}
                      {likes !== null && (
                        <div style={ms.metric}>
                          <span style={{ fontSize: 14 }}>❤️</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{likes.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Likes</div>
                          </div>
                        </div>
                      )}
                      {comments !== null && (
                        <div style={ms.metric}>
                          <span style={{ fontSize: 14 }}>💬</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{comments.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Comments</div>
                          </div>
                        </div>
                      )}
                      {shares !== null && (
                        <div style={ms.metric}>
                          <span style={{ fontSize: 14 }}>↗️</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{shares.toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Shares</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Actions ── */}
                  {(canRetry || isScheduled || isScheduledPost || isFailedPost) && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      {canRetry && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); if (onRetryFailed) onRetryFailed(p.id); }} disabled={retrying} style={{
                          padding: '6px 12px', borderRadius: 8, border: '1px solid #fca5a5',
                          background: retrying ? '#fee2e2' : '#fff5f5', color: '#dc2626',
                          fontSize: 11, fontWeight: 700, cursor: retrying ? 'wait' : 'pointer',
                        }}>
                          {retrying ? 'Retrying…' : '↻ Retry failed post'}
                        </button>
                      )}
                      {isScheduled && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                          {reschedulingJob === jobId ? (
                            <>
                              <input type="datetime-local" value={newDateTime} onChange={e => setNewDateTime(e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }} />
                              <button type="button" onClick={() => onRescheduleJob && onRescheduleJob(jobId, newDateTime)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                              <button type="button" onClick={() => setReschedulingJob(null)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => { setReschedulingJob(jobId); setNewDateTime(p.scheduledAt ? p.scheduledAt.slice(0,16) : ''); }} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #a5b4fc', background: '#eef2ff', color: '#4f46e5', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>🗓 Reschedule</button>
                              <button type="button" onClick={() => onCancelJob && onCancelJob(jobId)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕ Cancel</button>
                            </>
                          )}
                        </div>
                      )}
                      {(isScheduledPost || isFailedPost) && p.id != null && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <button type="button" onClick={() => onDeletePost && onDeletePost(p.id)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            🗑 Delete post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const ms = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.65)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#ffffff', borderRadius: 20, padding: '20px 20px', width: '100%', maxWidth: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.28)', maxHeight: '82vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' },
  closeBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', flexShrink: 0 },
  postCard: { background: '#f8fafc', borderRadius: 12, padding: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  metric: { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', flex: '1 1 70px' },
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ContentCalendar({ onOpenVideoPublisher }) {
  const { apiBase, token, myOrgRole, activeWorkspaceId, authHeaders } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const isMobile = useMediaQuery('(max-width: 768px)');

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [view,      setView]      = useState('calendar'); // 'calendar' | 'feed'
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [feedDetailPost, setFeedDetailPost] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [retryingIds, setRetryingIds] = useState({});
  const [actionMsg, setActionMsg] = useState('');
  const [hoverPreview, setHoverPreview] = useState(null); // { post, x, y }
  const [composeOpen, setComposeOpen]   = useState(false);
  const [composeDate]                   = useState(null); // pre-fill date when clicking a day
  const [reschedulingJob, setReschedulingJob] = useState(null); // { jobId, current }
  const [newDateTime, setNewDateTime]   = useState('');
  const [dragPost,    setDragPost]      = useState(null); // post being drag-rescheduled
  const [dragOverKey, setDragOverKey]   = useState(null); // day key hovered during drag

  // ── Approval queue state (CLIENT sees posts pending their review) ──────────
  const [pendingApprovalPosts, setPendingApprovalPosts] = useState([]);
  const [changesModalPostId,   setChangesModalPostId]   = useState(null);
  const [changesComment,       setChangesComment]       = useState('');
  const [approvalActionIds,    setApprovalActionIds]    = useState({}); // postId → true while loading

  const loadPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = authHeaders();
      const [overviewRes, historyRes] = await Promise.all([
        fetch(`${base}/api/analytics/overview`, { headers }),
        fetch(`${base}/api/social/post/history?limit=200`, { headers }),
      ]);

      if (!overviewRes.ok) throw new Error('Failed');
      const data = await overviewRes.json();
      const activity = normalizePostListPayload(data?.recentActivity);
      const historyRaw = historyRes.ok ? await historyRes.json() : [];
      const history = normalizePostListPayload(historyRaw);
      const enriched = mergeRecentWithHistory(activity, history)
        .filter(p => PLATFORMS_ALL.some(pm => pm.id === p.platform?.toLowerCase()));
      setPosts(enriched);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [base, token, activeWorkspaceId]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const retryFailedPost = async (postId) => {
    if (!postId || !token) return;
    const sid = String(postId);
    setRetryingIds(prev => ({ ...prev, [sid]: true }));
    setActionMsg('');
    try {
      const res = await fetch(`${base}/api/social/post/retry/${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Retry failed');
      setActionMsg('Retry started. We refreshed your post list.');
      await loadPosts();
    } catch (_) {
      setActionMsg('Could not retry this post. Please try again.');
    } finally {
      setRetryingIds(prev => ({ ...prev, [sid]: false }));
      setTimeout(() => setActionMsg(''), 3500);
    }
  };

  const cancelJob = async (jobId) => {
    if (!jobId || !token) return;
    try {
      const res = await fetch(`${base}/api/video-content/jobs/${jobId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Cancel failed');
      setActionMsg('Post cancelled.');
      await loadPosts();
    } catch (_) {
      setActionMsg('Could not cancel this post.');
    } finally {
      setSelectedDay(null);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const deletePost = async (postId) => {
    if (!postId || !token) return;
    try {
      const res = await fetch(`${base}/api/social/post/${postId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setActionMsg('Post deleted.');
      await loadPosts();
    } catch (_) {
      setActionMsg('Could not delete this post.');
    } finally {
      setSelectedDay(null);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const rescheduleJob = async (jobId, dt) => {
    if (!jobId || !dt || !token) return;
    try {
      const res = await fetch(`${base}/api/analytics/job/${jobId}/reschedule`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDateTime: dt }),
      });
      if (!res.ok) throw new Error('Reschedule failed');
      setActionMsg('Post rescheduled.');
      setReschedulingJob(null);
      await loadPosts();
    } catch (_) {
      setActionMsg('Could not reschedule this post.');
    } finally {
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const reschedulePost = async (postId, dt) => {
    if (!postId || !dt || !token) return;
    try {
      const res = await fetch(`${base}/api/analytics/post/${postId}/reschedule`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDateTime: dt }),
      });
      if (!res.ok) throw new Error('Reschedule failed');
      setActionMsg('Post rescheduled.');
      await loadPosts();
    } catch (_) {
      setActionMsg('Could not reschedule this post.');
    } finally {
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  // ── Fetch pending-approval posts for CLIENTs ─────────────────────────────
  const loadPendingApprovals = useCallback(async () => {
    if (!token || myOrgRole !== 'CLIENT') { setPendingApprovalPosts([]); return; }
    try {
      const res = await fetch(`${base}/api/social/post/pending-approval`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setPendingApprovalPosts(Array.isArray(data) ? data : []);
      }
    } catch { setPendingApprovalPosts([]); }
  }, [base, token, myOrgRole, activeWorkspaceId]);

  useEffect(() => { loadPendingApprovals(); }, [loadPendingApprovals]);

  const approvePost = async (postId) => {
    if (!token) return;
    setApprovalActionIds(p => ({ ...p, [postId]: true }));
    try {
      const res = await fetch(`${base}/api/social/post/${postId}/approve`, {
        method: 'POST', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Approve failed');
      setActionMsg('✅ Post approved — it will be published as scheduled.');
      await Promise.all([loadPendingApprovals(), loadPosts()]);
    } catch (_) {
      setActionMsg('Could not approve this post. Please try again.');
    } finally {
      setApprovalActionIds(p => ({ ...p, [postId]: false }));
      setTimeout(() => setActionMsg(''), 4000);
    }
  };

  const submitRequestChanges = async () => {
    if (!changesModalPostId || !token) return;
    const postId = changesModalPostId;
    setApprovalActionIds(p => ({ ...p, [postId]: true }));
    setChangesModalPostId(null);
    try {
      const res = await fetch(`${base}/api/social/post/${postId}/request-changes`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: changesComment }),
      });
      if (!res.ok) throw new Error('Request changes failed');
      setActionMsg('📝 Changes requested — the agency has been notified.');
      setChangesComment('');
      await Promise.all([loadPendingApprovals(), loadPosts()]);
    } catch (_) {
      setActionMsg('Could not submit change request. Please try again.');
    } finally {
      setApprovalActionIds(p => ({ ...p, [postId]: false }));
      setTimeout(() => setActionMsg(''), 4000);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const calDays = buildCalendarDays(viewYear, viewMonth);

  // Posts filtered by platform
  const filteredPosts = filterPlatform === 'all'
    ? posts
    : posts.filter(p => p.platform?.toLowerCase() === filterPlatform);

  // Posts for this calendar month
  const monthPosts = filteredPosts.filter(p => {
    try {
      const d = postCalendarDate(p);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    } catch { return false; }
  });

  // Posts by date key
  const postsByDay = {};
  monthPosts.forEach(p => {
    try {
      const d = postCalendarDate(p);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!postsByDay[key]) postsByDay[key] = [];
      postsByDay[key].push(p);
    } catch {}
  });

  // Upcoming posts (future or recent)
  const upcoming = [...filteredPosts]
    .sort((a, b) => postCalendarDate(b) - postCalendarDate(a))
    .slice(0, 20);

  return (
    <div style={{ ...s.page, ...(isMobile ? { padding: '12px 8px', borderRadius: 0, border: 'none' } : {}) }}>

      {/* ── CLIENT Approval Queue Banner ── */}
      {myOrgRole === 'CLIENT' && pendingApprovalPosts.length > 0 && (
        <div style={{
          marginBottom: 20, borderRadius: 14, overflow: 'hidden',
          border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.06)',
        }}>
          <div style={{
            padding: '12px 18px', background: 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 15 }}>
              Awaiting Your Approval ({pendingApprovalPosts.length} post{pendingApprovalPosts.length !== 1 ? 's' : ''})
            </span>
          </div>
          {pendingApprovalPosts.map(post => (
            <div key={post.id} style={{
              padding: '14px 18px', borderTop: '1px solid rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                    background: `${platformColor(post.platform)}25`, color: platformColor(post.platform),
                  }}>{(post.platform || 'unknown').toUpperCase()}</span>
                  {post.scheduledAt && (
                    <span style={{ color: '#888', fontSize: 12 }}>
                      ⏰ {new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p style={{ color: '#ddd', fontSize: 13, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 400 }}>
                  {post.caption || <em style={{ color: '#555' }}>No caption</em>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  disabled={approvalActionIds[post.id]}
                  onClick={() => approvePost(post.id)}
                  style={{
                    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 13, fontWeight: 700,
                    opacity: approvalActionIds[post.id] ? 0.6 : 1,
                  }}
                >
                  {approvalActionIds[post.id] ? '…' : '✅ Approve'}
                </button>
                <button
                  disabled={approvalActionIds[post.id]}
                  onClick={() => { setChangesModalPostId(post.id); setChangesComment(''); }}
                  style={{
                    padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 13, fontWeight: 700,
                    opacity: approvalActionIds[post.id] ? 0.6 : 1,
                  }}
                >
                  ✏️ Request Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Request Changes Modal ── */}
      {changesModalPostId && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setChangesModalPostId(null)}
        >
          <div
            style={{ background: '#161625', borderRadius: 16, padding: 28, maxWidth: 480, width: '90%', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: '#e0e0e0', marginBottom: 8, fontSize: 17, fontWeight: 700 }}>Request Changes</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Describe what you'd like the agency to update:</p>
            <textarea
              value={changesComment}
              onChange={e => setChangesComment(e.target.value)}
              placeholder="e.g. Please update the caption to include our promo code SUMMER25"
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#0d0d1a', color: '#e0e0e0', fontSize: 14,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setChangesModalPostId(null)}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: '#888', fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={submitRequestChanges}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: 14, fontWeight: 700 }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.pageHeader}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
          <div style={s.viewToggle}>
            <button style={{ ...s.viewBtn, ...(view === 'calendar' ? s.viewBtnActive : {}) }} onClick={() => setView('calendar')}>
              🗓 Calendar
            </button>
            <button style={{ ...s.viewBtn, ...(view === 'feed' ? s.viewBtnActive : {}) }} onClick={() => setView('feed')}>
              ⊞ Feed Grid
            </button>
          </div>
        </div>
      </div>

      {/* ── Platform filter pills ── */}
      <div style={{ ...s.pillRow, ...(isMobile ? { flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' } : {}) }}>
        <button
          style={{ ...s.pill, ...(filterPlatform === 'all' ? s.pillActive : {}) }}
          onClick={() => setFilterPlatform('all')}
        >All</button>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            style={{
              ...s.pill,
              ...(filterPlatform === p.id ? { background: p.color, color: '#fff', borderColor: p.color } : {}),
            }}
            onClick={() => setFilterPlatform(filterPlatform === p.id ? 'all' : p.id)}
          >
            <PlatformIcon platform={p} size={13} />
            <span style={{ marginLeft: 4 }}>{p.label}</span>
          </button>
        ))}
      </div>

      {actionMsg && (
        <div style={{
          marginBottom: 12,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          {actionMsg}
        </div>
      )}

      <div style={{ ...s.body, ...(isMobile ? { gridTemplateColumns: '1fr', gap: 12 } : {}) }}>

        {/* ══ CALENDAR VIEW ══ */}
        {view === 'calendar' && (
          <>
            {/* Month calendar */}
            <div style={s.calCard}>
              {/* Month nav */}
              <div style={s.monthNav}>
                <button style={s.navBtn} onClick={prevMonth}>‹</button>
                <span style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</span>
                <button style={s.navBtn} onClick={nextMonth}>›</button>
              </div>

              {/* Day-of-week headers */}
              <div style={s.calGrid}>
                {DAYS.map(d => (
                  <div key={d} style={s.calDayHeader}>{d}</div>
                ))}

                {/* Calendar cells */}
                {calDays.map((day, idx) => {
                  if (!day) return <div key={`blank-${idx}`} style={s.calCell} />;
                  const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                  const dayPosts = postsByDay[key] || [];
                  const isToday = sameDay(day, today);
                  const isSelected = selectedDay && sameDay(day, selectedDay);
                  const hasScheduledPost = dayPosts.some(isPostScheduled);
                  const platformColors = [...new Set(dayPosts.map(p => platformColor(p.platform)))].slice(0, 4);
                  const dayHolidays = getHolidaysForDate(day);

                  return (
                    <div
                      key={key}
                      style={{
                        ...s.calCell,
                        ...(isToday ? s.calCellToday : {}),
                        ...(hasScheduledPost && !isSelected ? s.calCellHasScheduled : {}),
                        ...(isSelected ? s.calCellSelected : {}),
                        ...(dragPost && dragOverKey === key ? { outline: '2px dashed #6366f1', background: '#eef2ff' } : {}),
                        cursor: dragPost ? 'copy' : 'pointer',
                      }}
                      onClick={() => !dragPost && setSelectedDay(isSelected ? null : day)}
                      onDragOver={(e) => { if (dragPost) { e.preventDefault(); setDragOverKey(key); } }}
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragPost) return;
                        const ts = postCalendarTimestamp(dragPost);
                        const orig = ts ? new Date(ts) : null;
                        const newDate = new Date(day);
                        newDate.setHours(orig ? orig.getHours() : 9, orig ? orig.getMinutes() : 0, 0, 0);
                        const pad = n => String(n).padStart(2, '0');
                        const localDt = `${newDate.getFullYear()}-${pad(newDate.getMonth()+1)}-${pad(newDate.getDate())}T${pad(newDate.getHours())}:${pad(newDate.getMinutes())}:00`;
                        if (dragPost.jobId) {
                          rescheduleJob(dragPost.jobId, localDt);
                        } else if (dragPost.id) {
                          reschedulePost(dragPost.id, localDt);
                        }
                        setDragPost(null);
                        setDragOverKey(null);
                      }}
                    >
                      <button
                        type="button"
                        title="Open Video Publisher"
                        style={{
                          ...s.calDayNum,
                          ...(isToday ? { color: '#fff', background: '#6366f1', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
                          border: 'none',
                          background: isToday ? '#6366f1' : 'transparent',
                          color: isToday ? '#fff' : undefined,
                          cursor: typeof onOpenVideoPublisher === 'function' ? 'pointer' : 'default',
                          padding: 0,
                          font: 'inherit',
                          textAlign: 'center',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof onOpenVideoPublisher === 'function') onOpenVideoPublisher();
                        }}
                      >
                        {day.getDate()}
                      </button>

                      {/* Holiday / awareness indicators */}
                      {dayHolidays.length > 0 && (
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginBottom: 2 }}>
                          {dayHolidays.map((h, hi) => (
                            <span
                              key={hi}
                              title={h.name}
                              style={{
                                fontSize: 10,
                                background: HOLIDAY_COLORS[h.type] + '22',
                                border: `1px solid ${HOLIDAY_COLORS[h.type]}55`,
                                borderRadius: 6,
                                padding: '1px 4px',
                                color: HOLIDAY_COLORS[h.type],
                                fontWeight: 700,
                                cursor: 'default',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.4,
                              }}
                            >
                              {h.emoji} {h.name.length > 12 ? h.name.slice(0, 12) + '…' : h.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {dayPosts.length > 0 ? (
                        <div style={s.dayPostList}>
                          {dayPosts.slice(0, 3).map((p, i) => {
                            const pInfo = PLATFORM_MAP[p.platform?.toLowerCase()];
                            const preview = getPostPreview(p);
                            const t = fmtTime(postCalendarTimestamp(p));
                            return (
                              <button
                                key={`${key}-${i}`}
                                type="button"
                                draggable={isPostScheduled(p) && (p.jobId != null || p.id != null)}
                                onDragStart={(e) => { e.stopPropagation(); setDragPost(p); }}
                                onDragEnd={() => { setDragPost(null); setDragOverKey(null); }}
                                style={{ ...s.dayPostChip, ...(isPostScheduled(p) ? { cursor: 'grab' } : {}) }}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoverPreview({
                                    post: p,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 8,
                                  });
                                }}
                                onMouseLeave={() => setHoverPreview(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFeedDetailPost(p);
                                }}
                                title="View post details"
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                  {pInfo ? <PlatformIcon platform={pInfo} size={12} /> : '•'}
                                </span>
                                <span>{t || 'Post'}</span>
                                {preview?.url && (
                                  <ResolvedPostMedia
                                    post={p}
                                    playOverlay={false}
                                    wrapperStyle={{ width: 18, height: 18, borderRadius: 4, overflow: 'hidden', marginLeft: 'auto', flexShrink: 0, border: '1px solid #e2e8f0' }}
                                    imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                              </button>
                            );
                          })}
                          {dayPosts.length > 3 && (
                            <button
                              type="button"
                              style={s.dayMoreBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDay(day);
                              }}
                            >
                              View {dayPosts.length - 3} More
                            </button>
                          )}
                        </div>
                      ) : (
                        <div style={s.dotRow}>
                          {platformColors.map((c, i) => (
                            <div key={i} style={{ ...s.dot, background: c }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={s.legend}>
                {PLATFORMS.filter(p => monthPosts.some(m => m.platform?.toLowerCase() === p.id)).map(p => (
                  <div key={p.id} style={s.legendItem}>
                    <div style={{ ...s.dot, background: p.color }} />
                    <span>{p.label}</span>
                  </div>
                ))}
              </div>
              {/* Holiday legend */}
              <div style={{ marginTop: 8, paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Calendar markers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
                  {[
                    { color: HOLIDAY_COLORS.holiday,   label: 'Public Holiday' },
                    { color: HOLIDAY_COLORS.awareness, label: 'Awareness Day' },
                    { color: HOLIDAY_COLORS.shopping,  label: 'Shopping Event' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                      <span style={{ fontSize: 11, color: '#64748b' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Post status</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px' }}>
                  {[
                    { emoji: '🟢', label: 'Published', hint: 'already live' },
                    { emoji: '🟡', label: 'Scheduled', hint: 'posts later' },
                    { emoji: '🔵', label: 'Draft', hint: 'not scheduled yet' },
                    { emoji: '🔴', label: 'Failed', hint: 'posting error' },
                  ].map((row) => (
                    <div key={row.label} style={s.legendItem} title={`${row.label}: ${row.hint}`}>
                      <span style={{ fontSize: 11, lineHeight: 1 }}>{row.emoji}</span>
                      <span style={{ fontSize: 12, color: '#475569' }}>
                        <strong>{row.label}</strong>
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}> — {row.hint}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming posts sidebar */}
            <div style={s.sidebar}>
              <div style={s.sidebarHeader}>
                <span style={s.sidebarTitle}>📋 Recent Posts</span>
                <span style={s.sidebarCount}>{upcoming.length}</span>
              </div>
              {loading ? (
                <div style={s.loadingState}>Loading…</div>
              ) : upcoming.length === 0 ? (
                <div style={s.emptyState}>No posts yet</div>
              ) : (
                <div style={s.upcomingList}>
                  {upcoming.map((p, i) => {
                    const pInfo = PLATFORM_MAP[p.platform?.toLowerCase()];
                    const preview = getPostPreview(p);
                    const isVideoPost = previewIsVideoPost(p, preview);
                    const canRetry =
                      String(p.status || '').toUpperCase() === 'FAILED' &&
                      p.id != null &&
                      p.jobId == null;
                    const retrying = canRetry && !!retryingIds[String(p.id)];
                    const st = getPostStatusUi(p);
                    return (
                      <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        style={{ ...s.upcomingItem, borderLeft: `3px solid ${platformColor(p.platform)}`, cursor: 'pointer' }}
                        onClick={() => setFeedDetailPost(p)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFeedDetailPost(p);
                          }
                        }}
                        title="Click to view or edit"
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {/* Thumbnail */}
                          {preview?.url && (
                            <ResolvedPostMedia
                              post={p}
                              wrapperStyle={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                overflow: 'hidden',
                                flexShrink: 0,
                                background: '#f1f5f9',
                              }}
                              imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              playOverlay={isVideoPost}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={s.upcomingTop}>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                                title={`Filter calendar by ${p.platform}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFilterPlatform(prev => prev === p.platform?.toLowerCase() ? 'all' : p.platform?.toLowerCase());
                                }}
                              >
                                {pInfo && <PlatformIcon platform={pInfo} size={14} />}
                                <span style={{ fontWeight: 700, fontSize: 12, color: platformColor(p.platform), textTransform: 'capitalize',
                                  textDecoration: filterPlatform === p.platform?.toLowerCase() ? 'underline' : 'none' }}>
                                  {p.platform}
                                </span>
                              </div>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                                background: st.pillBg,
                                color: st.pillFg,
                              }}>{st.emoji} {st.label}</span>
                            </div>
                            <div style={s.upcomingCaption}>{safeDecodeCaption(p.caption) || '(no caption)'}</div>
                            <div style={s.upcomingMeta}>
                              {fmtDate(postCalendarTimestamp(p))} · {p.mediaType || 'post'}
                            </div>
                            {canRetry && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  retryFailedPost(p.id);
                                }}
                                disabled={retrying}
                                style={{
                                  marginTop: 6,
                                  padding: '4px 8px',
                                  borderRadius: 7,
                                  border: '1px solid #dc2626',
                                  background: retrying ? '#fee2e2' : '#fff',
                                  color: '#dc2626',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: retrying ? 'wait' : 'pointer',
                                }}
                              >
                                {retrying ? 'Retrying…' : '↻ Retry'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ FEED GRID VIEW ══ */}
        {view === 'feed' && (
          <div style={s.feedWrap}>
            <div style={s.feedHeader}>
              <span style={s.feedTitle}>Your Content Feed</span>
              <span style={s.feedSub}>Latest published posts — newest first</span>
            </div>
            {loading ? (
              <div style={s.loadingState}>Loading…</div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ ...s.emptyState, padding: 40 }}>No posts yet. Start publishing from Video Publisher.</div>
            ) : (
              <div style={s.feedGrid}>
                {filteredPosts.map((p, i) => {
                    const pInfo = PLATFORM_MAP[p.platform?.toLowerCase()];
                    const preview = getPostPreview(p);
                    const isVideoPost = previewIsVideoPost(p, preview);
                    const thumbUrl = preview?.url;
                    const canRetry =
                      String(p.status || '').toUpperCase() === 'FAILED' &&
                      p.id != null &&
                      p.jobId == null;
                    const retrying = canRetry && !!retryingIds[String(p.id)];
                    const cardKey =
                      p.jobId != null
                        ? `job-${p.jobId}`
                        : p.id != null
                          ? `post-${p.id}`
                          : `feed-${postMergeKey(p)}-${i}`;
                    const st = getPostStatusUi(p);
                    const likes = p.likes ?? 0;
                    const comments = p.commentsCount ?? p.comments ?? 0;
                    const shares = p.shares ?? 0;
                    const views = p.views ?? p.impressions ?? 0;
                    return (
                      <div
                        key={cardKey}
                        role="button"
                        tabIndex={0}
                        title="View post details"
                        onClick={() => setFeedDetailPost(p)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFeedDetailPost(p);
                          }
                        }}
                        style={{
                          ...s.feedCard,
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s, border-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(15,23,42,0.1)';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                      {/* Thumbnail — same resolution order as day modal (thumb + media variants) */}
                      <div style={{
                        ...s.feedThumb,
                        background: thumbUrl
                          ? '#000'
                          : `linear-gradient(135deg, ${platformColor(p.platform)}22, ${platformColor(p.platform)}44)`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {thumbUrl ? (
                          <>
                            <ResolvedPostMedia
                              post={p}
                              playOverlay={false}
                              wrapperStyle={{
                                width: '100%',
                                height: '100%',
                                minHeight: 140,
                                position: 'relative',
                              }}
                              imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {isVideoPost && (
                              <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                                background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: 36, height: 36,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, color: '#fff', pointerEvents: 'none',
                              }}
                              >▶</div>
                            )}
                          </>
                        ) : (
                          <div style={{ fontSize: 32 }}>{isVideoPost ? '🎥' : String(p.mediaType || '').toLowerCase() === 'image' ? '🖼️' : '✍️'}</div>
                        )}
                        {/* Platform badge */}
                        <div style={{ ...s.feedPlatformBadge, background: platformColor(p.platform) }}>
                          {pInfo && <PlatformIcon platform={pInfo} size={11} />}
                        </div>
                        {/* Status badge */}
                        <div style={{
                          ...s.feedStatusBadge,
                          background: st.solid,
                          fontSize: 11,
                          lineHeight: 1,
                        }} title={st.label}>
                          {st.emoji}
                        </div>
                      </div>
                      {/* Caption */}
                      <div style={s.feedCaption}>
                        {(safeDecodeCaption(p.caption) || '(no caption)').slice(0, 80)}{(safeDecodeCaption(p.caption) || '').length > 80 ? '…' : ''}
                      </div>
                      <div style={s.feedMeta}>
                        <span style={{ textTransform: 'capitalize' }}>{p.platform}</span>
                        <span>·</span>
                        <span>{fmtDate(postCalendarTimestamp(p))}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px 12px',
                          padding: '0 12px 10px',
                          fontSize: 11,
                          color: '#64748b',
                          fontWeight: 600,
                        }}
                      >
                        <span title="Likes">❤️ {fmtCount(likes)}</span>
                        <span title="Comments">💬 {fmtCount(comments)}</span>
                        <span title="Shares">↗ {fmtCount(shares)}</span>
                        {views > 0 && (
                          <span title="Views / impressions">👁 {fmtCount(views)}</span>
                        )}
                      </div>
                      {canRetry && (
                        <div style={{ padding: '0 12px 12px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              retryFailedPost(p.id);
                            }}
                            disabled={retrying}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 8,
                              border: '1px solid #dc2626',
                              background: retrying ? '#fee2e2' : '#fff',
                              color: '#dc2626',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: retrying ? 'wait' : 'pointer',
                            }}
                          >
                            {retrying ? 'Retrying…' : '↻ Retry failed post'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <DayModal
          date={selectedDay}
          posts={filteredPosts}
          onRetryFailed={retryFailedPost}
          retryingIds={retryingIds}
          onClose={() => setSelectedDay(null)}
          onCancelJob={cancelJob}
          onDeletePost={deletePost}
          onRescheduleJob={rescheduleJob}
          reschedulingJob={reschedulingJob}
          newDateTime={newDateTime}
          setNewDateTime={setNewDateTime}
          setReschedulingJob={setReschedulingJob}
          onPostSelect={(p) => {
            setFeedDetailPost(p);
            setSelectedDay(null);
          }}
        />
      )}

      {/* Compose post modal */}
      <ComposePostModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        defaultDate={composeDate}
        onPosted={() => { loadPosts(); }}
      />

      {feedDetailPost && (
        <PostDetailModal
          post={feedDetailPost}
          platform={PLATFORM_MAP[feedDetailPost.platform?.toLowerCase()]}
          onClose={() => setFeedDetailPost(null)}
          onSaved={loadPosts}
        />
      )}

      {hoverPreview?.post && (() => {
        const hp = hoverPreview.post;
        const hst = getPostStatusUi(hp);
        return (
          <div
            style={{
              ...s.hoverCard,
              left: hoverPreview.x,
              top: hoverPreview.y,
            }}
            onMouseEnter={() => setHoverPreview(hoverPreview)}
            onMouseLeave={() => setHoverPreview(null)}
          >
            <div style={s.hoverHead}>
              <span style={{ color: platformColor(hp.platform), fontWeight: 800, textTransform: 'capitalize' }}>
                {hp.platform}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(postCalendarTimestamp(hp))} {fmtTime(postCalendarTimestamp(hp))}</span>
            </div>
            <div style={s.hoverBody}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.45 }}>
                  {(safeDecodeCaption(hp.caption) || '(no caption)').slice(0, 180)}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
                  <span>{hp.impressions ?? 0} Impressions</span>
                  <span>{hp.clicks ?? 0} Clicks</span>
                  <span>{hp.recentComments ?? hp.comments ?? 0} Comments</span>
                </div>
              </div>
              {getPostPreview(hp)?.url && (
                <ResolvedPostMedia
                  post={hp}
                  playOverlay={false}
                  wrapperStyle={{ width: 120, height: 96, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}
                  imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div style={s.hoverFooter}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: hst.pillFg,
              }}>
                {hst.emoji} {hst.label}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 16px',
    fontFamily: 'inherit',
    color: '#0f172a',
    background: 'rgba(248,250,252,0.97)',
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.25)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },

  pageHeader: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },

  viewToggle: { display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 3, gap: 2 },
  viewBtn: { background: 'none', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  viewBtnActive: { background: '#fff', color: '#6366f1', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },

  pillRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 99, border: '1.5px solid #e2e8f0',
    background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
  },
  pillActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },

  body: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, alignItems: 'start' },

  /* Calendar */
  calCard: { background: '#fff', borderRadius: 16, padding: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthLabel: { fontSize: 17, fontWeight: 800, color: '#0f172a' },
  navBtn: { background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
  calDayHeader: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  calCell: { minHeight: 72, padding: '6px', borderRadius: 8, border: '1px solid #e2e8f0', transition: 'all 0.15s', position: 'relative', background: '#fff' },
  calCellToday: { border: '1.5px solid #6366f133', background: '#f5f3ff' },
  /** Pale yellow border when the day has at least one scheduled (not yet published) post */
  calCellHasScheduled: { border: '1.5px solid #fde68a' },
  calCellSelected: { background: '#ede9fe', border: '1.5px solid #6366f1' },
  calDayNum: { fontSize: 13, fontWeight: 600, color: '#334155', lineHeight: 1, marginBottom: 4 },
  dotRow: { display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  moreBadge: { fontSize: 9, color: '#94a3b8', fontWeight: 700 },
  dayPostList: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 },
  dayPostChip: {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderRadius: 8,
    fontSize: 11,
    color: '#334155',
    padding: '3px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    textAlign: 'left',
  },
  dayChipThumb: { width: 18, height: 18, borderRadius: 4, marginLeft: 'auto', objectFit: 'cover', border: '1px solid #e2e8f0' },
  dayMoreBtn: {
    border: 'none',
    background: 'transparent',
    color: '#be123c',
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'left',
    cursor: 'pointer',
    padding: '1px 2px',
  },
  hoverCard: {
    position: 'fixed',
    zIndex: 2200,
    transform: 'translate(-50%, -100%)',
    width: 420,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    boxShadow: '0 18px 50px rgba(15,23,42,0.22)',
    padding: 14,
    pointerEvents: 'auto',
  },
  hoverHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hoverBody: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  hoverThumb: { width: 120, height: 96, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' },
  hoverFooter: { marginTop: 8, borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'flex', justifyContent: 'flex-end' },

  legend: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' },

  /* Sidebar */
  sidebar: { background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', maxHeight: 640, overflowY: 'auto' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sidebarTitle: { fontSize: 15, fontWeight: 800, color: '#0f172a' },
  sidebarCount: { background: '#f1f5f9', borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: '#6366f1' },
  upcomingList: { display: 'flex', flexDirection: 'column', gap: 8 },
  upcomingItem: { padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' },
  upcomingTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  upcomingCaption: { fontSize: 12, color: '#334155', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' },
  upcomingMeta: { fontSize: 10, color: '#94a3b8', marginTop: 3 },

  loadingState: { color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 },
  emptyState: { color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 16 },

  /* Feed grid */
  feedWrap: { gridColumn: '1 / -1', background: '#fff', borderRadius: 16, padding: 24, border: '1.5px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  feedHeader: { marginBottom: 20 },
  feedTitle: { fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'block' },
  feedSub: { fontSize: 13, color: '#94a3b8', marginTop: 2, display: 'block' },
  feedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 },
  feedCard: { borderRadius: 12, border: '1.5px solid #e2e8f0', overflow: 'hidden', background: '#fff' },
  feedThumb: { height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  feedPlatformBadge: { position: 'absolute', top: 8, left: 8, borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center' },
  feedStatusBadge: { position: 'absolute', top: 8, right: 8, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' },
  feedCaption: { padding: '10px 12px 4px', fontSize: 12, color: '#334155', lineHeight: 1.5 },
  feedMeta: { padding: '0 12px 12px', fontSize: 10, color: '#94a3b8', display: 'flex', gap: 4 },
};
