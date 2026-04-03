import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';
import PostDetailModal from './PostDetailModal';
import ComposePostModal from './ComposePostModal';

/* ─────────────────────────────────────────────────────────────────────────────
   ContentCalendar — Visual Calendar & Feed Planner
   Shows scheduled + published posts on a month calendar with:
   - Month navigation with post indicators per day
   - Week timeline view with time-slot cards
   - Instagram-style feed grid preview
   - Upcoming posts sidebar
───────────────────────────────────────────────────────────────────────────── */

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', logo: 'instagram' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', logo: 'facebook'  },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', logo: 'youtube'   },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', logo: 'tiktok'    },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', logo: 'linkedin'  },
  { id: 'x',         label: 'X',         color: '#000000', logo: 'x'         },
  { id: 'threads',   label: 'Threads',   color: '#101010', logo: 'threads'   },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', logo: 'pinterest' },
];

const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.id, p]));
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

function pickFirstUrl(...vals) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
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
  return null;
}

function postMergeKey(post) {
  if (post?.id != null && String(post.id).trim() !== '') {
    return `id:${String(post.id)}`;
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
    mediaUrl: pickFirstUrl(p?.mediaUrl, src?.mediaUrl),
    thumbnailUrl: pickFirstUrl(
      p?.thumbnailUrl,
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
  };
}

function mergeRecentWithHistory(recentActivity, historyPosts) {
  const recent = normalizePostListPayload(recentActivity);
  const history = normalizePostListPayload(historyPosts);

  const historyById = new Map(history.filter(p => p?.id != null).map(p => [String(p.id), p]));
  const historyByKey = new Map(history.map(p => [postMergeKey(p), p]));

  const merged = recent.map((p) => {
    const byId = p?.id != null ? historyById.get(String(p.id)) : null;
    const byKey = historyByKey.get(postMergeKey(p));
    const src = byId || byKey || {};
    return mergeOneRow(p, src);
  });

  const seenIds = new Set(
    merged.map((p) => (p?.id != null ? String(p.id) : null)).filter(Boolean),
  );
  const extras = history
    .filter((h) => h?.id != null && !seenIds.has(String(h.id)))
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
function DayModal({ date, posts, onClose, onRetryFailed, retryingIds = {}, onCancelJob, onRescheduleJob, reschedulingJob, newDateTime, setNewDateTime, setReschedulingJob }) {
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
              const canRetry = String(p.status || '').toUpperCase() === 'FAILED' && p.id != null;
              const retrying = canRetry && !!retryingIds[String(p.id)];
              const isScheduled = ['SCHEDULED','PENDING'].includes(String(p.status || '').toUpperCase());
              const jobId = p.jobId || p.id;
              return (
                <div key={i} style={{ ...ms.postCard, borderLeft: `3px solid ${platformColor(p.platform)}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 84, height: 84, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      background: '#f1f5f9', border: '1px solid #e2e8f0', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {preview?.kind === 'image' ? (
                        <img src={preview.url} alt="post thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : preview?.kind === 'video' ? (
                        <video src={preview.url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>{isVideo ? '🎬' : String(p.mediaType || '').toLowerCase() === 'image' ? '🖼️' : '✍️'}</span>
                      )}
                      {isVideo && (
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 13, fontWeight: 700,
                        }}>▶</div>
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
                          background: p.status === 'SUCCESS' ? '#f0fdf4' : p.status === 'FAILED' ? '#fef2f2' : '#fff7ed',
                          color: p.status === 'SUCCESS' ? '#16a34a' : p.status === 'FAILED' ? '#dc2626' : '#d97706',
                        }}>{p.status || 'SCHEDULED'}</span>
                      </div>

                      {/* Caption */}
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                        {p.caption || <em style={{ color: '#94a3b8' }}>(no caption)</em>}
                      </div>
                      {canRetry && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            type="button"
                            onClick={() => onRetryFailed && onRetryFailed(p.id)}
                            disabled={retrying}
                            style={{
                              padding: '6px 10px', borderRadius: 8,
                              border: '1px solid #dc2626',
                              background: retrying ? '#fee2e2' : '#fff',
                              color: '#dc2626', fontSize: 11, fontWeight: 700,
                              cursor: retrying ? 'wait' : 'pointer',
                            }}
                          >
                            {retrying ? 'Retrying…' : '↻ Retry failed post'}
                          </button>
                        </div>
                      )}
                      {isScheduled && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {reschedulingJob === jobId ? (
                            <>
                              <input
                                type="datetime-local"
                                value={newDateTime}
                                onChange={e => setNewDateTime(e.target.value)}
                                style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                              />
                              <button onClick={() => onRescheduleJob && onRescheduleJob(jobId, newDateTime)} style={{
                                padding: '5px 10px', borderRadius: 6, border: 'none',
                                background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}>Save</button>
                              <button onClick={() => setReschedulingJob(null)} style={{
                                padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                                background: '#fff', fontSize: 11, cursor: 'pointer',
                              }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setReschedulingJob(jobId); setNewDateTime(p.scheduledAt ? p.scheduledAt.slice(0,16) : ''); }} style={{
                                padding: '5px 10px', borderRadius: 6, border: '1px solid #6366f1',
                                background: '#f0f0ff', color: '#6366f1', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}>🗓 Reschedule</button>
                              <button onClick={() => onCancelJob && onCancelJob(jobId)} style={{
                                padding: '5px 10px', borderRadius: 6, border: '1px solid #f87171',
                                background: '#fff5f5', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}>✕ Cancel post</button>
                            </>
                          )}
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
export default function ContentCalendar({ onOpenVideoPublisher }) {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

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
  const [composeDate, setComposeDate]   = useState(null); // pre-fill date when clicking a day
  const [reschedulingJob, setReschedulingJob] = useState(null); // { jobId, current }
  const [newDateTime, setNewDateTime]   = useState('');

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

  const cancelJob = async (jobId) => {
    if (!jobId || !token) return;
    try {
      const res = await fetch(`${base}/api/analytics/job/${jobId}/cancel`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
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

  const rescheduleJob = async (jobId, dt) => {
    if (!jobId || !dt || !token) return;
    try {
      const res = await fetch(`${base}/api/analytics/job/${jobId}/reschedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>📅 Content Calendar</h2>
          <p style={s.pageSub}>Visual overview of your published and scheduled posts across all platforms.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* New Post button */}
          <button
            onClick={() => { setComposeDate(null); setComposeOpen(true); }}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + New Post
          </button>
          {/* View toggle */}
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
                                  <img src={preview.url} alt="" style={s.dayChipThumb} />
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
                    const isVideo = p.mediaType === 'video';
                    const canRetry = String(p.status || '').toUpperCase() === 'FAILED' && p.id != null;
                    const retrying = canRetry && !!retryingIds[String(p.id)];
                    return (
                      <div key={i} style={{ ...s.upcomingItem, borderLeft: `3px solid ${platformColor(p.platform)}` }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {/* Thumbnail */}
                          {p.mediaUrl && (
                            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', position: 'relative' }}>
                              {isVideo ? (
                                <video src={p.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                              ) : (
                                <img src={p.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              {isVideo && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'rgba(0,0,0,0.35)', fontSize: 14, color: '#fff' }}>▶</div>
                              )}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={s.upcomingTop}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {pInfo && <PlatformIcon platform={pInfo} size={14} />}
                                <span style={{ fontWeight: 700, fontSize: 12, color: platformColor(p.platform), textTransform: 'capitalize' }}>{p.platform}</span>
                              </div>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                                background: p.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
                                color: p.status === 'SUCCESS' ? '#16a34a' : '#dc2626',
                              }}>{p.status}</span>
                            </div>
                            <div style={s.upcomingCaption}>{p.caption || '(no caption)'}</div>
                            <div style={s.upcomingMeta}>
                              {fmtDate(postCalendarTimestamp(p))} · {p.mediaType || 'post'}
                            </div>
                            {canRetry && (
                              <button
                                type="button"
                                onClick={() => retryFailedPost(p.id)}
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
                  const isVideo = p.mediaType === 'video';
                  const canRetry = String(p.status || '').toUpperCase() === 'FAILED' && p.id != null;
                  const retrying = canRetry && !!retryingIds[String(p.id)];
                  const cardKey = p.id != null ? `post-${p.id}` : `feed-${postMergeKey(p)}-${i}`;
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
                      {/* Thumbnail area */}
                      <div style={{
                        ...s.feedThumb,
                        background: p.mediaUrl
                          ? '#000'
                          : `linear-gradient(135deg, ${platformColor(p.platform)}22, ${platformColor(p.platform)}44)`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {p.mediaUrl ? (
                          isVideo ? (
                            <video
                              src={p.mediaUrl}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              muted
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={p.mediaUrl}
                              alt="post"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          )
                        ) : (
                          <div style={{ fontSize: 32 }}>{isVideo ? '🎥' : p.mediaType === 'image' ? '🖼️' : '✍️'}</div>
                        )}
                        {isVideo && p.mediaUrl && (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                            background: 'rgba(0,0,0,0.55)', borderRadius: '50%', width: 36, height: 36,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, color: '#fff', pointerEvents: 'none' }}>▶</div>
                        )}
                        {/* Platform badge */}
                        <div style={{ ...s.feedPlatformBadge, background: platformColor(p.platform) }}>
                          {pInfo && <PlatformIcon platform={pInfo} size={11} />}
                        </div>
                        {/* Status badge */}
                        <div style={{
                          ...s.feedStatusBadge,
                          background: p.status === 'SUCCESS' ? '#16a34a' : '#dc2626',
                        }}>
                          {p.status === 'SUCCESS' ? '✓' : '✗'}
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
          onRescheduleJob={rescheduleJob}
          reschedulingJob={reschedulingJob}
          newDateTime={newDateTime}
          setNewDateTime={setNewDateTime}
          setReschedulingJob={setReschedulingJob}
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
        />
      )}

      {hoverPreview?.post && (
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
            <span style={{ color: platformColor(hoverPreview.post.platform), fontWeight: 800, textTransform: 'capitalize' }}>
              {hoverPreview.post.platform}
            </span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(postCalendarTimestamp(hoverPreview.post))} {fmtTime(postCalendarTimestamp(hoverPreview.post))}</span>
          </div>
          <div style={s.hoverBody}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.45 }}>
                {(hoverPreview.post.caption || '(no caption)').slice(0, 180)}
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
                <span>{hoverPreview.post.impressions ?? 0} Impressions</span>
                <span>{hoverPreview.post.clicks ?? 0} Clicks</span>
                <span>{hoverPreview.post.recentComments ?? hoverPreview.post.comments ?? 0} Comments</span>
              </div>
            </div>
            {getPostPreview(hoverPreview.post)?.url && (
              <img src={getPostPreview(hoverPreview.post).url} alt="" style={s.hoverThumb} />
            )}
          </div>
          <div style={s.hoverFooter}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: String(hoverPreview.post.status || '').toUpperCase() === 'SUCCESS' ? '#16a34a' : '#d97706',
            }}>
              {String(hoverPreview.post.status || 'PUBLISHED').toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '20px 16px', fontFamily: 'inherit' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' },
  pageSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },

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
