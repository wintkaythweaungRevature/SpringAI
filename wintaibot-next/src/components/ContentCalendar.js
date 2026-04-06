'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { filterEnabledPlatforms } from '@/config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';
import PostDetailModal from './PostDetailModal';
import {
  fetchPreviewDisplayUrl,
  rawMediaRefForCalendarPost,
  looksLikeS3HttpUrl,
  syncDisplayableMediaUrl,
} from '@/utils/mediaPreviewResolve';

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

/** Maps API `status` (+ dates) to a single UI bucket for labels & colors under the calendar. */
const POST_STATUS_UI = {
  published: { label: 'Published', emoji: '🟢', pillBg: '#f0fdf4', pillFg: '#15803d', solid: '#16a34a' },
  scheduled: { label: 'Scheduled', emoji: '🟡', pillBg: '#fffbeb', pillFg: '#b45309', solid: '#ca8a04' },
  draft: { label: 'Draft', emoji: '🔵', pillBg: '#eff6ff', pillFg: '#1d4ed8', solid: '#2563eb' },
  failed: { label: 'Failed', emoji: '🔴', pillBg: '#fef2f2', pillFg: '#b91c1c', solid: '#dc2626' },
};

function getPostStatusCategory(post) {
  const s = String(post?.status || '').toUpperCase();
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

/** Prefer primary row, then merge source (e.g. overview + history). */
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

function previewIsVideoMedia(preview) {
  return preview?.kind === 'video';
}

function previewIsVideoPost(post, preview) {
  return (
    String(post?.mediaType || '').toLowerCase() === 'video' || preview?.kind === 'video'
  );
}

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
function DayModal({ date, posts, onClose, onRetryFailed, onPostSelect, retryingIds = {} }) {
  const dayPosts = posts.filter(p => {
    try { return sameDay(postCalendarDate(p), date); } catch { return false; }
  });
  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <div style={ms.header}>
          <div style={ms.title}>
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>
        {dayPosts.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 14, padding: '24px 0', textAlign: 'center' }}>
            No posts on this day
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dayPosts.map((p, i) => {
              const pInfo = PLATFORM_MAP[p.platform?.toLowerCase()];
              const preview = getPostPreview(p);
              const isVideo = String(p.mediaType || '').toLowerCase() === 'video';
              const isVideoPostModal = previewIsVideoPost(p, preview);
              const canRetry =
                String(p.status || '').toUpperCase() === 'FAILED' &&
                p.id != null &&
                p.jobId == null;
              const retrying = canRetry && !!retryingIds[String(p.id)];
              const st = getPostStatusUi(p);
              return (
                <div
                  key={i}
                  role={typeof onPostSelect === 'function' ? 'button' : undefined}
                  tabIndex={typeof onPostSelect === 'function' ? 0 : undefined}
                  style={{
                    ...ms.postCard,
                    borderLeft: `3px solid ${platformColor(p.platform)}`,
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
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 84, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      background: '#f1f5f9', border: '1px solid #e2e8f0', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {preview?.url ? (
                        <ResolvedPostMedia
                          post={p}
                          playOverlay={isVideoPostModal}
                          playOverlayStyle={{ background: 'rgba(0,0,0,0.25)', fontSize: 13, fontWeight: 700 }}
                          wrapperStyle={{ width: '100%', height: '100%' }}
                          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: 20 }}>{isVideo ? '🎬' : String(p.mediaType || '').toLowerCase() === 'image' ? '🖼️' : '✍️'}</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {pInfo && <PlatformIcon platform={pInfo} size={16} />}
                        <span style={{ fontWeight: 700, fontSize: 13, color: platformColor(p.platform), textTransform: 'capitalize' }}>{p.platform}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{fmtTime(postCalendarTimestamp(p))}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                          background: st.pillBg,
                          color: st.pillFg,
                        }}>{st.emoji} {st.label}</span>
                      </div>

                      {/* Caption */}
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                        {p.caption || <em style={{ color: '#94a3b8' }}>(no caption)</em>}
                      </div>
                      {canRetry && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onRetryFailed) onRetryFailed(p.id);
                            }}
                            disabled={retrying}
                            style={{
                              padding: '6px 10px',
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
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5, textTransform: 'capitalize' }}>
                    {p.mediaType || 'post'}
                  </div>
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
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 800, color: '#0f172a' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: 4 },
  postCard: { background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0' },
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ContentCalendar() {
  const { apiBase, token } = useAuth();
  const base = (apiBase || (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '') || 'https://api.wintaibot.com');

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

  const loadPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [overviewRes, historyRes] = await Promise.all([
        fetch(`${base}/api/analytics/overview`, { headers }),
        fetch(`${base}/api/social/post/history?limit=200`, { headers }),
      ]);

      if (!overviewRes.ok) throw new Error('Failed');
      const data = await overviewRes.json();
      const activity = normalizePostListPayload(data?.recentActivity);
      const historyRaw = historyRes.ok ? await historyRes.json() : [];
      const history = normalizePostListPayload(historyRaw);
      const enriched = mergeRecentWithHistory(activity, history);
      setPosts(enriched);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const retryFailedPost = async (postId) => {
    if (!postId || !token) return;
    const sid = String(postId);
    setRetryingIds(prev => ({ ...prev, [sid]: true }));
    setActionMsg('');
    try {
      const res = await fetch(`${base}/api/social/post/retry/${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    .sort((a, b) => new Date(postCalendarTimestamp(b)) - new Date(postCalendarTimestamp(a)))
    .slice(0, 20);

  return (
    <div style={s.page}>

      {/* View toggle only — page name is in the app sidebar */}
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
      <div style={s.pillRow}>
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

      <div style={s.body}>

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

                  return (
                    <div
                      key={key}
                      style={{
                        ...s.calCell,
                        ...(isToday ? s.calCellToday : {}),
                        ...(hasScheduledPost && !isSelected ? s.calCellHasScheduled : {}),
                        ...(isSelected ? s.calCellSelected : {}),
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                    >
                      <div style={{ ...s.calDayNum, ...(isToday ? { color: '#fff', background: '#2563eb', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}) }}                      >
                        {day.getDate()}
                      </div>

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
                                style={s.dayPostChip}
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
                        onClick={() => setFeedDetailPost(p)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFeedDetailPost(p);
                          }
                        }}
                        style={{
                          ...s.upcomingItem,
                          borderLeft: `3px solid ${platformColor(p.platform)}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {/* Thumbnail — same URL resolution as calendar day modal + feed grid */}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {pInfo && <PlatformIcon platform={pInfo} size={14} />}
                                <span style={{ fontWeight: 700, fontSize: 12, color: platformColor(p.platform), textTransform: 'capitalize' }}>{p.platform}</span>
                              </div>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                                background: st.pillBg,
                                color: st.pillFg,
                              }}>{st.emoji} {st.label}</span>
                            </div>
                            <div style={s.upcomingCaption}>{p.caption || '(no caption)'}</div>
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
                      {/* Thumbnail — use thumbnailUrl + mediaUrl + variants (same as day modal) */}
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
                        {(p.caption || '(no caption)').slice(0, 80)}{p.caption?.length > 80 ? '…' : ''}
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
          onPostSelect={(p) => {
            setFeedDetailPost(p);
            setSelectedDay(null);
          }}
        />
      )}

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
                  {(hp.caption || '(no caption)').slice(0, 180)}
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
    maxWidth: 1180,
    margin: '0 auto',
    padding: '12px 12px 28px',
    fontFamily: 'inherit',
    color: '#0f172a',
    background: 'rgba(248,250,252,0.97)',
    borderRadius: 16,
    border: '1px solid rgba(148,163,184,0.25)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  },

  pageHeader: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 },

  viewToggle: { display: 'flex', background: 'rgba(15,23,42,0.06)', borderRadius: 12, padding: 4, gap: 2, border: '1px solid #e2e8f0' },
  viewBtn: { background: 'none', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' },
  viewBtnActive: {
    background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 55%, #2563eb 100%)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
  },

  pillRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '6px 14px', borderRadius: 99, border: '1.5px solid #e2e8f0',
    background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
    transition: 'transform 0.12s, box-shadow 0.12s',
  },
  pillActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
    color: '#fff',
    borderColor: 'transparent',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
  },

  body: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', gap: 20, alignItems: 'start' },

  /* Calendar */
  calCard: {
    background: '#fff',
    borderRadius: 18,
    padding: '22px',
    border: '1px solid #e8ecf1',
    boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
  },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthLabel: { fontSize: 17, fontWeight: 800, color: '#0f172a' },
  navBtn: { background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
  calDayHeader: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  calCell: { minHeight: 76, padding: '6px', borderRadius: 10, border: '1px solid #e8ecf1', transition: 'all 0.15s', position: 'relative', background: '#fff' },
  calCellToday: { border: '1.5px solid #93c5fd', background: '#eff6ff' },
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
  sidebar: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid #e8ecf1',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
    maxHeight: 680,
    overflowY: 'auto',
  },
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
  feedWrap: {
    gridColumn: '1 / -1',
    background: '#fff',
    borderRadius: 18,
    padding: 24,
    border: '1px solid #e8ecf1',
    boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
  },
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
