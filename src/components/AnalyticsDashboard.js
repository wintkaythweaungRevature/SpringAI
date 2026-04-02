import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', logo: 'instagram' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👍', color: '#1877F2', logo: 'facebook' },
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️', color: '#FF0000', logo: 'youtube' },
  { id: 'x',         label: 'X',         emoji: '🐦', color: '#000000', logo: 'x' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵', color: '#010101', logo: 'tiktok' },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼', color: '#0A66C2', logo: 'linkedin' },
];

/** Small UI icons (not brand logos) */
function IconChart({ size = 26, color = '#6366f1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="13" width="4" height="8" rx="1" fill={color} />
      <rect x="10" y="9" width="4" height="12" rx="1" fill={color} />
      <rect x="17" y="5" width="4" height="16" rx="1" fill={color} />
    </svg>
  );
}
function IconGlobe({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" fill="none" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function IconUsers({ size = 22, color = '#6366f1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCheck({ size = 22, color = '#16a34a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBubble({ size = 22, color = '#d97706' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconEye({ size = 22, color = '#2563eb' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.75" />
    </svg>
  );
}
function IconTrash({ size = 16, color = '#94a3b8' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPalette({ size = 18, color = '#6366f1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="13.5" cy="6.5" r=".5" fill={color} />
      <circle cx="17.5" cy="10.5" r=".5" fill={color} />
      <circle cx="8.5" cy="7.5" r=".5" fill={color} />
      <circle cx="6.5" cy="12.5" r=".5" fill={color} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const HIDDEN_ACTIVITY_PREFIX = 'wintaibot_analytics_hidden_activity';

function loadHiddenActivityIds(userId) {
  if (userId == null) return new Set();
  try {
    const raw = localStorage.getItem(`${HIDDEN_ACTIVITY_PREFIX}_${userId}`);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveHiddenActivityIds(userId, ids) {
  if (userId == null) return;
  try {
    localStorage.setItem(`${HIDDEN_ACTIVITY_PREFIX}_${userId}`, JSON.stringify([...ids]));
  } catch { /* ignore quota */ }
}

function fmt(n) {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

/** Summary metric — white card + tinted icon (consistent with Messages inbox). */
function StatTile({ icon, label, value, sub, accent = '#6366f1' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px 18px',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        flex: 1,
        minWidth: '140px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: `${accent}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accent,
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', lineHeight: 1.35 }}>{sub}</div>}
      </div>
    </div>
  );
}

function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar({ size = 16, color = '#64748b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.75" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconClock({ size = 16, color = '#64748b' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconXCircle({ size = 16, color = '#dc2626' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" />
      <path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function HBar({ label, value, max, color, icon, platform, barHeight = 10 }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ width: '24px', height: '24px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {platform ? <PlatformIcon platform={platform} size={22} /> : <span style={{ fontSize: '16px' }}>{icon}</span>}
      </span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', width: '78px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', height: `${barHeight}px`, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', width: '48px', textAlign: 'right', flexShrink: 0 }}>
        {fmt(value)}
      </span>
    </div>
  );
}

function PlatformTabBtn({ active, onClick, children, activeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: active ? `1px solid ${activeColor || '#0f172a'}` : '1px solid #e2e8f0',
        cursor: 'pointer',
        fontWeight: active ? 600 : 500,
        fontSize: '13px',
        whiteSpace: 'nowrap',
        background: active ? (activeColor || '#0f172a') : '#fff',
        color: active ? '#fff' : '#475569',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        boxShadow: active ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.04)',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

function DonutChart({ segments }) {
  // CSS conic-gradient donut — legend always lists Video / Image / Text with %; ring uses non-zero slices only
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>No data yet</div>;

  const nonZero = segments.filter((s) => s.value > 0);
  let cumulative = 0;
  const gradient = nonZero.map((seg) => {
    const pct = (seg.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return `${seg.color} ${start.toFixed(2)}% ${cumulative.toFixed(2)}%`;
  }).join(', ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <div
        title="Content types (video, image, text posts)"
        style={{
          width: '100px', height: '100px', borderRadius: '50%', flexShrink: 0,
          background: nonZero.length ? `conic-gradient(${gradient})` : '#e2e8f0',
          boxShadow: 'inset 0 0 0 28px #fff',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          const hint = `${seg.label}: ${seg.value} post${seg.value === 1 ? '' : 's'} (${pct}% of total)`;
          return (
            <div
              key={seg.label}
              title={hint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                margin: '-4px -6px',
                borderRadius: '8px',
                cursor: 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.color, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{seg.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{pct}%</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>({seg.value})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlatformCard({ platform, data }) {
  const p = PLATFORMS.find(x => x.id === platform);
  if (!p) return null;

  const hasError = !!data.error;

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '18px',
      border: `1.5px solid ${hasError ? '#e2e8f0' : p.color}22`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${p.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlatformIcon platform={p} size={26} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{p.label}</div>
          {data.channelName && <div style={{ fontSize: '11px', color: '#64748b' }}>{data.channelName}</div>}
          {data.username    && <div style={{ fontSize: '11px', color: '#64748b' }}>@{data.username}</div>}
          {data.pageName    && <div style={{ fontSize: '11px', color: '#64748b' }}>{data.pageName}</div>}
          {data.displayName && <div style={{ fontSize: '11px', color: '#64748b' }}>{data.displayName}</div>}
        </div>
      </div>

      {hasError ? (
        <div style={{ fontSize: '12px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', padding: '10px', lineHeight: 1.5 }}>
          ⚠️ {data.error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
          {/* Followers / Subscribers / Fans */}
          {(data.followers !== undefined || data.subscribers !== undefined || data.fans !== undefined) && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: p.color }}>
                {fmt(data.followers ?? data.subscribers ?? data.fans ?? 0)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {data.subscribers !== undefined ? 'Subscribers' : data.fans !== undefined ? 'Fans' : 'Followers'}
              </div>
            </div>
          )}

          {/* Following */}
          {data.following !== undefined && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#374151' }}>{fmt(data.following)}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Following</div>
            </div>
          )}

          {/* Posts / Videos / Tweets */}
          {(data.posts !== undefined || data.videos !== undefined || data.tweets !== undefined) && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#374151' }}>
                {fmt(data.posts ?? data.videos ?? data.tweets ?? 0)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {data.tweets !== undefined ? 'Tweets' : 'Posts'}
              </div>
            </div>
          )}

          {/* Views */}
          {data.totalViews !== undefined && (
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#374151' }}>{fmt(data.totalViews)}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Total Views</div>
            </div>
          )}

          {/* Likes */}
          {(data.recentLikes !== undefined || data.totalLikes !== undefined) && (
            <div style={{ background: '#fef9f0', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>
                {fmt(data.recentLikes ?? data.totalLikes ?? 0)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {data.totalLikes !== undefined ? 'Total Likes' : 'Recent Likes'}
              </div>
            </div>
          )}

          {/* Comments */}
          {data.recentComments !== undefined && (
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{fmt(data.recentComments)}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Comments</div>
            </div>
          )}

          {/* Talking About (Facebook engagement proxy) */}
          {data.talkingAbout !== undefined && (
            <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>{fmt(data.talkingAbout)}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Talking About</div>
            </div>
          )}

          {/* Profile Views */}
          {data.profileViews !== undefined && data.profileViews > 0 && (
            <div style={{ background: '#f5f3ff', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed' }}>{fmt(data.profileViews)}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Profile Views</div>
            </div>
          )}

          {/* Engagement Rate */}
          {data.engagementRate !== undefined && (
            <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '10px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>{data.engagementRate}%</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Engagement Rate (last 10 posts)</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function AnalyticsDashboard() {
  const { apiBase, token, user } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState('overview'); // 'overview' | platform id
  const [hiddenActivityIds, setHiddenActivityIds] = useState(() => new Set());

  useEffect(() => {
    if (user?.id != null) {
      setHiddenActivityIds(loadHiddenActivityIds(user.id));
    }
  }, [user?.id]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${base}/api/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => { load(); }, [load]);

  /* ── derived values ── */
  const connected   = data?.connectedPlatforms ?? [];
  const platforms   = data?.platforms ?? {};
  const ownPosts    = data?.ownPosts   ?? {};
  const recent      = data?.recentActivity;

  const removeActivityFromList = useCallback((activityId) => {
    const sid = String(activityId);
    setHiddenActivityIds((prev) => {
      const next = new Set(prev);
      next.add(sid);
      if (user?.id != null) saveHiddenActivityIds(user.id, next);
      return next;
    });
    if (token) {
      fetch(`${base}/api/analytics/activity/${encodeURIComponent(sid)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, [base, token, user?.id]);

  const recentVisible = useMemo(() => {
    const list = Array.isArray(recent) ? recent : [];
    return list.filter((p) => p?.id == null || !hiddenActivityIds.has(String(p.id)));
  }, [recent, hiddenActivityIds]);

  const totalFollowers = connected.reduce((sum, pid) => {
    const d = platforms[pid] ?? {};
    return sum + (d.followers ?? d.subscribers ?? d.fans ?? 0);
  }, 0);

  const totalEngagement = connected.reduce((sum, pid) => {
    const d = platforms[pid] ?? {};
    return sum + (d.recentLikes ?? 0) + (d.recentComments ?? 0) + (d.talkingAbout ?? 0) + (d.totalLikes ?? 0);
  }, 0);

  const totalViews = connected.reduce((sum, pid) => {
    const d = platforms[pid] ?? {};
    return sum + (d.totalViews ?? d.profileViews ?? 0);
  }, 0);

  const byPlatform          = ownPosts.byPlatform          ?? {};
  const byType              = ownPosts.byType              ?? {};
  const byPlatformThisWeek  = ownPosts.byPlatformThisWeek  ?? {};
  const byPlatformThisMonth = ownPosts.byPlatformThisMonth ?? {};
  const byPlatformFailed    = ownPosts.byPlatformFailed    ?? {};
  const maxCount   = Math.max(...Object.values(byPlatform).map(Number), 1);

  const nVideo = Number(
    byType.video ?? byType.VIDEO ?? byType.Video ?? 0,
  );
  const nImage = Number(
    byType.image ?? byType.IMAGE ?? byType.Image ?? 0,
  );
  const nText = Number(
    byType.text ?? byType.TEXT ?? byType.Text ?? 0,
  );

  const typeSegments = [
    { label: 'Video', value: nVideo, color: '#6366f1' },
    { label: 'Image', value: nImage, color: '#ec4899' },
    { label: 'Text', value: nText, color: '#f59e0b' },
  ];

  const tabPlatforms = ['overview', ...connected];

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Subtitle + refresh (page title is in the app shell) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '14px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.55, maxWidth: '520px' }}>
          Live metrics from connected social accounts. Use Overview for a combined view or open a single platform.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#334155',
            fontWeight: 600,
            fontSize: '13px',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            flexShrink: 0,
            fontFamily: 'inherit',
          }}
        >
          <RefreshIcon />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
          ⚠️ {error} — make sure you are logged in and have connected platforms.
        </div>
      )}

      {!data && loading && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#64748b', fontSize: '14px' }}>Loading analytics…</div>
      )}

      {data && (
        <>
          {/* Platform tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              marginBottom: '14px',
              flexWrap: 'wrap',
            }}
          >
            {tabPlatforms.map(pid => {
              const p = PLATFORMS.find(x => x.id === pid);
              const isOverview = pid === 'overview';
              const active = tab === pid;
              const brand = p?.color ?? '#6366f1';
              return (
                <PlatformTabBtn
                  key={pid}
                  active={active}
                  onClick={() => setTab(pid)}
                  activeColor={isOverview ? '#0f172a' : brand}
                >
                  {isOverview ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <IconGlobe size={16} color={active ? '#fff' : '#475569'} />
                      Overview
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <PlatformIcon platform={p} size={16} />
                      {p?.label ?? pid}
                    </span>
                  )}
                </PlatformTabBtn>
              );
            })}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              {/* Summary metrics */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <StatTile icon={<IconUsers size={22} color="#6366f1" />} label="Total followers" value={fmt(totalFollowers)} sub={`Across ${connected.length} platform${connected.length !== 1 ? 's' : ''}`} accent="#6366f1" />
                <StatTile icon={<IconCheck size={22} color="#16a34a" />} label="Posts published" value={fmt(ownPosts.totalPublished)} sub={`${fmt(ownPosts.thisWeek)} this week`} accent="#16a34a" />
                <StatTile icon={<IconBubble size={22} color="#d97706" />} label="Total engagement" value={fmt(totalEngagement)} sub="Likes + comments" accent="#d97706" />
                <StatTile icon={<IconEye size={22} color="#2563eb" />} label="Total views" value={fmt(totalViews)} sub="YouTube + profile views" accent="#2563eb" />
              </div>

              {/* Two-column: followers bar + content type donut */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '14px', marginBottom: '14px' }}>

                {/* Followers per platform */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconUsers size={18} color="#6366f1" />
                    Followers by Platform
                  </div>
                  {connected.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>No platforms connected yet.</div>
                  ) : (
                    connected.map(pid => {
                      const p = PLATFORMS.find(x => x.id === pid);
                      const d = platforms[pid] ?? {};
                      const val = d.followers ?? d.subscribers ?? d.fans ?? 0;
                      const allVals = connected.map(id => { const dd = platforms[id] ?? {}; return dd.followers ?? dd.subscribers ?? dd.fans ?? 0; });
                      const mx = Math.max(...allVals, 1);
                      return <HBar key={pid} label={p?.label ?? pid} value={val} max={mx} color={p?.color ?? '#6366f1'} icon={p?.emoji ?? '📤'} platform={p} />;
                    })
                  )}
                </div>

                {/* Content type breakdown */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconPalette size={18} color="#6366f1" />
                    Content created
                  </div>
                  <DonutChart segments={typeSegments} />
                  <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { label: 'This week',  value: ownPosts.thisWeek,    node: <IconCalendar color="#64748b" />, breakdown: byPlatformThisWeek },
                      { label: 'This month', value: ownPosts.thisMonth,   node: <IconCalendar color="#64748b" />, breakdown: byPlatformThisMonth },
                      { label: 'Failed',     value: ownPosts.totalFailed, node: <IconXCircle color="#dc2626" />,  breakdown: byPlatformFailed },
                    ].map(c => {
                      const entries = Object.entries(c.breakdown ?? {})
                        .sort((a, b) => Number(b[1]) - Number(a[1]));
                      const tip = entries.length > 0
                        ? `${fmt(c.value ?? 0)} total\n${entries.map(([pid, cnt]) => {
                          const p = PLATFORMS.find(x => x.id === pid);
                          return `${p?.label ?? pid}: ${cnt}`;
                        }).join('\n')}`
                        : null;
                      return (
                        <div
                          key={c.label}
                          title={tip ?? undefined}
                          style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '12px 8px',
                            textAlign: 'center',
                            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                            cursor: tip ? 'help' : 'default',
                            position: 'relative',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{c.node}</div>
                          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{fmt(c.value ?? 0)}</div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginTop: '4px', letterSpacing: '0.02em' }}>{c.label}</div>
                          {entries.length > 0 && (
                            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '8px', lineHeight: 1.65, textAlign: 'left' }}>
                              {entries.slice(0, 4).map(([pid, cnt]) => {
                                const p = PLATFORMS.find(x => x.id === pid);
                                const rowTip = `${p?.label ?? pid}: ${cnt} post${Number(cnt) === 1 ? '' : 's'}`;
                                return (
                                  <div
                                    key={`${c.label}-${pid}`}
                                    title={rowTip}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '3px 2px',
                                      borderRadius: '6px',
                                      marginBottom: '2px',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <span style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {p ? <PlatformIcon platform={p} size={16} /> : <span style={{ fontSize: '12px' }}>·</span>}
                                    </span>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {p?.label ?? pid}
                                    </span>
                                    <span style={{ fontWeight: 700, color: '#475569', flexShrink: 0 }}>{cnt}</span>
                                  </div>
                                );
                              })}
                              {entries.length > 4 && (
                                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>+{entries.length - 4} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Posts per platform bar */}
              {Object.keys(byPlatform).length > 0 && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', marginBottom: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconChart size={18} color="#6366f1" />
                    Content shared by platform
                  </div>
                  {Object.entries(byPlatform).sort((a, b) => Number(b[1]) - Number(a[1])).map(([pid, cnt]) => {
                    const p = PLATFORMS.find(x => x.id === pid);
                    return (
                      <HBar
                        key={pid}
                        label={p?.label ?? pid}
                        value={Number(cnt)}
                        max={maxCount}
                        color={p?.color ?? '#6366f1'}
                        icon={p?.emoji ?? '📤'}
                        platform={p}
                        barHeight={10}
                      />
                    );
                  })}
                </div>
              )}

              {/* Recent activity */}
              {recentVisible.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconClock size={18} color="#6366f1" />
                      Recent activity
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = recentVisible.filter(p => p?.id != null).map(p => String(p.id));
                        setHiddenActivityIds(prev => {
                          const next = new Set(prev);
                          allIds.forEach(id => next.add(id));
                          if (user?.id != null) saveHiddenActivityIds(user.id, next);
                          return next;
                        });
                      }}
                      style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 14px' }}>
                    Remove hides an entry here only; it does not delete the post on the social network.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recentVisible.map(post => {
                      const p = PLATFORMS.find(x => x.id === post.platform);
                      const sc = post.status === 'SUCCESS' ? '#16a34a' : post.status === 'FAILED' ? '#dc2626' : '#d97706';
                      const sb = post.status === 'SUCCESS' ? '#f0fdf4'  : post.status === 'FAILED' ? '#fef2f2'  : '#fffbeb';
                      const d  = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const rowKey = post.id != null ? String(post.id) : `${post.platform}-${post.createdAt}-${(post.caption || '').slice(0, 20)}`;
                      return (
                        <div key={rowKey} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {p ? <PlatformIcon platform={p} size={20} /> : <span style={{ fontSize: '16px' }}>📤</span>}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {post.caption || '(no caption)'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              {p?.label ?? post.platform} · {post.mediaType} · {d}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => post.id != null && removeActivityFromList(post.id)}
                            disabled={post.id == null}
                            title="Remove from this list"
                            aria-label="Remove from recent activity"
                            style={{
                              flexShrink: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#fff',
                              color: '#64748b',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: post.id == null ? 'not-allowed' : 'pointer',
                              opacity: post.id == null ? 0.5 : 1,
                            }}
                          >
                            <IconTrash size={14} color="currentColor" />
                            Remove
                          </button>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: sb, color: sc, flexShrink: 0 }}>
                            {post.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SINGLE PLATFORM TAB ── */}
          {tab !== 'overview' && platforms[tab] && (
            <div style={{ maxWidth: '560px' }}>
              <PlatformCard platform={tab} data={platforms[tab]} />
            </div>
          )}

          {tab !== 'overview' && !platforms[tab] && (
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No analytics data available for this platform yet.
            </div>
          )}
        </>
      )}

      {data && connected.length === 0 && (
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔌</div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '8px' }}>No platforms connected</div>
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            Go to <strong>Connected Accounts</strong> in the sidebar to link Instagram, YouTube, X, and more.
          </div>
        </div>
      )}
    </div>
  );
}
