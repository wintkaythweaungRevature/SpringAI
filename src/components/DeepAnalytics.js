import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const API = process.env.REACT_APP_API_URL || 'https://api.wintaibot.com';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸', logo: 'instagram' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', emoji: '👍', logo: 'facebook'  },
  { id: 'youtube',   label: 'YouTube',   color: '#FF0000', emoji: '▶️', logo: 'youtube'   },
  { id: 'tiktok',    label: 'TikTok',    color: '#010101', emoji: '🎵', logo: 'tiktok'    },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', emoji: '💼', logo: 'linkedin'  },
  { id: 'x',         label: 'X',         color: '#000000', emoji: '🐦', logo: 'x'         },
  { id: 'threads',   label: 'Threads',   color: '#101010', emoji: '🧵', logo: 'threads'   },
  { id: 'pinterest', label: 'Pinterest', color: '#E60023', emoji: '📌', logo: 'pinterest' },
];

const DAY_LABELS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`);

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const CAL_DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ── SVG Line Chart ─────────────────────────────────────────── */
function LineChart({ data, color = '#6366f1', width = 500, height = 160 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 12 }}>
        No data yet — snapshots save daily at 3am UTC or click "Refresh Now"
      </div>
    );
  }

  const vals = data.map(d => d.followers);
  const min  = Math.min(...vals);
  const max  = Math.max(...vals);
  const range = max - min || 1;

  const pad = { top: 16, right: 12, bottom: 28, left: 48 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const x = (i) => pad.left + (i / (data.length - 1)) * W;
  const y = (v) => pad.top + H - ((v - min) / range) * H;

  const points = data.map((d, i) => `${x(i)},${y(d.followers)}`).join(' ');
  const area   = `${x(0)},${y(min) + H} ` + data.map((d, i) => `${x(i)},${y(d.followers)}`).join(' ') + ` ${x(data.length - 1)},${y(min) + H}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range);
  const step = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} y1={y(v)} x2={pad.left + W} y2={y(v)}
                stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
          <text x={pad.left - 6} y={y(v) + 4} textAnchor="end"
                fontSize="10" fill="#94a3b8">
            {v >= 1000 ? `${(v/1000).toFixed(1)}k` : Math.round(v)}
          </text>
        </g>
      ))}
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {data.length <= 15 && data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.followers)} r="3.5" fill={color} />
      ))}
      {xLabels.map((d) => {
        const idx = data.indexOf(d);
        return (
          <text key={d.date} x={x(idx)} y={height - 4}
                textAnchor="middle" fontSize="9" fill="#94a3b8">
            {d.date.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Heatmap ─────────────────────────────────────────────────── */
function PostHeatmap({ heatmap, bestDay, bestHour }) {
  if (!heatmap || heatmap.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: 13 }}>No posts yet to analyze.</p>;
  }

  const maxVal = Math.max(...heatmap.flat(), 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `44px repeat(24, 22px)`, gap: 2 }}>
        <div />
        {HOUR_LABELS.map((h, i) => (
          <div key={i} style={{ fontSize: 8, textAlign: 'center',
                                fontWeight: i === bestHour ? 700 : 400,
                                color: i === bestHour ? '#6366f1' : '#94a3b8' }}>{h}</div>
        ))}
        {DAY_LABELS.map((day, d) => (
          <React.Fragment key={d}>
            <div style={{ fontSize: 10, color: '#64748b', display: 'flex', alignItems: 'center',
                          fontWeight: day.toLowerCase().startsWith(bestDay?.slice(0,3).toLowerCase()) ? 700 : 400,
                          paddingRight: 6 }}>{day}</div>
            {(heatmap[d] || []).map((count, h) => {
              const intensity = count / maxVal;
              const bg = count > 0
                ? `rgba(99,102,241,${0.1 + intensity * 0.9})`
                : '#f1f5f9';
              return (
                <div
                  key={h}
                  title={`${day} ${HOUR_LABELS[h]}: ${count} post${count !== 1 ? 's' : ''}`}
                  style={{
                    width: 22, height: 18, borderRadius: 4,
                    background: bg,
                    outline: (d === DAY_LABELS.indexOf(bestDay?.slice(0,3)) && h === bestHour)
                      ? '2px solid #6366f1' : 'none',
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>
        🏆 Best time to post: <strong>{bestDay}</strong> at <strong>{bestHour < 12 ? `${bestHour}am` : bestHour === 12 ? '12pm' : `${bestHour - 12}pm`}</strong>
      </div>
    </div>
  );
}

/* ── Bar chart ───────────────────────────────────────────────── */
function BarChart({ data, color = '#6366f1' }) {
  const max = Math.max(...Object.values(data).map(v => v.count || 0), 1);
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 100 }}>
      {Object.entries(data).map(([type, vals]) => {
        const h = ((vals.count || 0) / max) * 80;
        return (
          <div key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{vals.count}</span>
            <div style={{ width: 40, height: h, background: color, borderRadius: '6px 6px 0 0' }} />
            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{type}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Post Calendar ───────────────────────────────────────────── */
function PostCalendar({ posts }) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year  = calMonth.getFullYear();
  const month = calMonth.getMonth();

  const firstDow    = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group posts by local date string "YYYY-MM-DD"
  const postsByDay = {};
  (posts || []).forEach(p => {
    if (!p.date) return;
    const d    = new Date(p.date);
    const key  = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!postsByDay[key]) postsByDay[key] = [];
    postsByDay[key].push(p);
  });

  const prevMonth = () => setCalMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalMonth(new Date(year, month + 1, 1));

  const getDotColor = (post) => {
    if (post.status === 'SUCCESS')   return PLATFORMS.find(p => p.id === post.platform)?.color || '#10b981';
    if (post.status === 'SCHEDULED') return '#f59e0b';
    if (post.status === 'FAILED')    return '#ef4444';
    return '#94a3b8';
  };

  const getStatusBadge = (status) => {
    if (status === 'SUCCESS')   return { label: 'Published', bg: '#dcfce7', color: '#16a34a' };
    if (status === 'SCHEDULED') return { label: 'Scheduled', bg: '#fef3c7', color: '#d97706' };
    if (status === 'FAILED')    return { label: 'Failed',    bg: '#fee2e2', color: '#dc2626' };
    return { label: status, bg: '#f1f5f9', color: '#64748b' };
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Build calendar cells: nulls for padding + day numbers
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selKey = selectedDay
    ? `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}`
    : null;
  const selPosts = selKey ? (postsByDay[selKey] || []) : [];

  return (
    <div>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prevMonth} style={cs.navBtn}>&#8249;</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={cs.navBtn}>&#8250;</button>
      </div>

      {/* Day-of-week header */}
      <div style={cs.grid}>
        {CAL_DAY_LABELS.map(d => (
          <div key={d} style={cs.dayHeader}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`pad-${idx}`} />;

          const cellDate = new Date(year, month, day);
          cellDate.setHours(0,0,0,0);
          const key     = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const dayPosts = postsByDay[key] || [];
          const isToday  = cellDate.getTime() === today.getTime();
          const isPast   = cellDate < today;
          const isSel    = selKey === key;

          return (
            <div
              key={key}
              onClick={() => setSelectedDay(isSel ? null : cellDate)}
              style={{
                ...cs.cell,
                background: isSel ? '#ede9fe' : isToday ? '#f0f9ff' : '#fff',
                outline: isToday ? '2px solid #6366f1' : 'none',
                outlineOffset: -2,
                cursor: dayPosts.length > 0 ? 'pointer' : 'default',
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: isToday ? 700 : 400,
                color: isToday ? '#6366f1' : isPast ? '#94a3b8' : '#1e293b',
              }}>
                {day}
              </span>

              {/* Post dots */}
              {dayPosts.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 3, justifyContent: 'center' }}>
                  {dayPosts.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      title={`${p.platform} · ${p.status}`}
                      style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: getDotColor(p),
                        flexShrink: 0,
                      }}
                    />
                  ))}
                  {dayPosts.length > 3 && (
                    <span style={{ fontSize: 8, color: '#64748b', lineHeight: '7px' }}>
                      +{dayPosts.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'Published', color: '#10b981' },
          { label: 'Scheduled', color: '#f59e0b' },
          { label: 'Failed',    color: '#ef4444' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            {item.label}
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
          Click a day to see post details
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div style={cs.detailPanel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
              {selectedDay.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <button onClick={() => setSelectedDay(null)} style={cs.closeBtn}>✕</button>
          </div>

          {selPosts.length === 0 ? (
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>No posts on this day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selPosts.map((p, i) => {
                const badge  = getStatusBadge(p.status);
                const platCfg = PLATFORMS.find(pl => pl.id === p.platform);
                return (
                  <div key={i} style={cs.postRow}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: platCfg?.color || '#6366f1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                    }}>
                      {platCfg ? <PlatformIcon platform={platCfg} size={16} color="#fff" /> : '📄'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.caption || '(no caption)'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {platCfg?.label || p.platform} · {formatTime(p.date)}
                        {p.mediaType && ` · ${p.mediaType}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                      background: badge.bg, color: badge.color, flexShrink: 0,
                    }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Calendar sub-styles */
const cs = {
  navBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 8,
    width: 32, height: 32, fontSize: 18, cursor: 'pointer',
    color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, lineHeight: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  },
  dayHeader: {
    fontSize: 11, fontWeight: 600, color: '#94a3b8',
    textAlign: 'center', padding: '4px 0 6px',
  },
  cell: {
    minHeight: 52, borderRadius: 10,
    border: '1px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '6px 2px 4px',
    transition: 'background 0.12s',
  },
  detailPanel: {
    marginTop: 16,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '16px',
  },
  postRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff', borderRadius: 10,
    padding: '10px 12px',
    border: '1px solid #f1f5f9',
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: '#94a3b8', padding: 4,
  },
};

/* ── Main Component ──────────────────────────────────────────── */
export default function DeepAnalytics() {
  const { authHeaders } = useAuth();

  const [platform,     setPlatform]     = useState('instagram');
  const [days,         setDays]         = useState(30);
  const [history,      setHistory]      = useState(null);
  const [bestTime,     setBestTime]     = useState(null);
  const [postPerf,     setPostPerf]     = useState(null);
  const [loadHistory,  setLoadHistory]  = useState(true);
  const [loadBestTime, setLoadBestTime] = useState(true);
  const [loadPerf,     setLoadPerf]     = useState(true);
  const [snapping,     setSnapping]     = useState(false);
  const [snapMsg,      setSnapMsg]      = useState('');
  const [calPosts,     setCalPosts]     = useState([]);
  const [calLoading,   setCalLoading]   = useState(true);

  const fetchHistory = useCallback(() => {
    setLoadHistory(true);
    fetch(`${API}/api/analytics/history?platform=${platform}&days=${days}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory(null))
      .finally(() => setLoadHistory(false));
  }, [platform, days, authHeaders]);

  const fetchBestTime = useCallback(() => {
    setLoadBestTime(true);
    fetch(`${API}/api/analytics/best-time`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setBestTime)
      .catch(() => setBestTime(null))
      .finally(() => setLoadBestTime(false));
  }, [authHeaders]);

  const fetchPerformance = useCallback(() => {
    setLoadPerf(true);
    fetch(`${API}/api/analytics/post-performance`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setPostPerf)
      .catch(() => setPostPerf(null))
      .finally(() => setLoadPerf(false));
  }, [authHeaders]);

  const fetchCalendar = useCallback(() => {
    setCalLoading(true);
    fetch(`${API}/api/analytics/calendar`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setCalPosts(Array.isArray(data) ? data : []))
      .catch(() => setCalPosts([]))
      .finally(() => setCalLoading(false));
  }, [authHeaders]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchBestTime(); fetchPerformance(); fetchCalendar(); }, [fetchBestTime, fetchPerformance, fetchCalendar]);

  const refreshSnapshot = async () => {
    setSnapping(true);
    try {
      await fetch(`${API}/api/analytics/snapshot/run?platform=${platform}`, {
        method: 'POST', headers: authHeaders(),
      });
      setSnapMsg('Snapshot saved! Refreshing chart…');
      setTimeout(() => { setSnapMsg(''); fetchHistory(); }, 1500);
    } catch {
      setSnapMsg('Snapshot failed');
      setTimeout(() => setSnapMsg(''), 2500);
    } finally {
      setSnapping(false);
    }
  };

  const platformConfig = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];

  return (
    <div style={s.wrap}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📈 Trends & Analytics</h2>
          <p style={s.sub}>Follower growth, best posting times, and content performance</p>
        </div>
      </div>

      {/* ── PLATFORM TABS ── */}
      <div style={s.tabs}>
        {PLATFORMS.map(p => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            style={{
              ...s.tab,
              background: platform === p.id ? p.color : 'transparent',
              color: platform === p.id ? '#fff' : '#64748b',
              border: `1.5px solid ${platform === p.id ? p.color : '#e2e8f0'}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <PlatformIcon platform={p} size={15} />
            {p.label}
          </button>
        ))}
      </div>

      {/* ── FOLLOWER GROWTH ── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h3 style={s.cardTitle}>👥 Follower Growth</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              style={s.select}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <button
              style={{ ...s.refreshBtn, background: platformConfig.color, opacity: snapping ? 0.7 : 1 }}
              onClick={refreshSnapshot}
              disabled={snapping}
              title="Save a snapshot right now (normally runs at 3am)"
            >
              {snapping ? '⏳' : '🔄'} Refresh Now
            </button>
          </div>
        </div>
        {snapMsg && <div style={s.snapMsg}>{snapMsg}</div>}
        {loadHistory ? (
          <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
        ) : (
          <>
            <LineChart
              data={history?.dataPoints || []}
              color={platformConfig.color}
              width={580}
              height={180}
            />
            {history?.dataPoints?.length > 0 && (
              <div style={s.statRow}>
                <div style={s.stat}>
                  <span style={s.statNum}>
                    {(history.dataPoints[history.dataPoints.length - 1]?.followers || 0).toLocaleString()}
                  </span>
                  <span style={s.statLabel}>Current Followers</span>
                </div>
                {history.dataPoints.length >= 2 && (
                  <div style={s.stat}>
                    <span style={{ ...s.statNum, color: '#10b981' }}>
                      {((history.dataPoints[history.dataPoints.length - 1]?.followers || 0)
                        - (history.dataPoints[0]?.followers || 0)).toLocaleString()}
                    </span>
                    <span style={s.statLabel}>Growth ({days}d)</span>
                  </div>
                )}
                <div style={s.stat}>
                  <span style={s.statNum}>
                    {history.dataPoints[history.dataPoints.length - 1]?.engagementRate || '—'}%
                  </span>
                  <span style={s.statLabel}>Engagement Rate</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── BEST TIME TO POST ── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>⏰ Best Time to Post</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
          Based on when you've published across all platforms. Darker = more posts.
        </p>
        {loadBestTime ? (
          <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
        ) : bestTime ? (
          <PostHeatmap
            heatmap={bestTime.heatmap}
            bestDay={bestTime.bestDay}
            bestHour={bestTime.bestHour}
          />
        ) : (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Could not load best time data.</p>
        )}
      </div>

      {/* ── POST SCHEDULE CALENDAR ── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h3 style={s.cardTitle}>📅 Post Schedule</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
              All your published and upcoming scheduled posts at a glance.
            </p>
          </div>
          <button
            onClick={fetchCalendar}
            style={{ ...s.refreshBtn, background: '#6366f1', fontSize: 11, padding: '5px 12px' }}
            disabled={calLoading}
          >
            {calLoading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
        {calLoading ? (
          <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
        ) : (
          <PostCalendar posts={calPosts} />
        )}
      </div>

      {/* ── POST TYPE PERFORMANCE ── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📊 Post Type Breakdown</h3>
        {loadPerf ? (
          <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
        ) : postPerf && Object.keys(postPerf.byType || {}).length > 0 ? (
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Posts by type</p>
              <BarChart data={postPerf.byType} color={platformConfig.color} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Posts by platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(postPerf.byPlatform || {}).map(([plat, count]) => {
                  const pc = PLATFORMS.find(p => p.id === plat);
                  const max = Math.max(...Object.values(postPerf.byPlatform || {}));
                  return (
                    <div key={plat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, width: 90, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {pc ? <PlatformIcon platform={pc} size={14} /> : null}
                        {pc?.label || plat}
                      </span>
                      <div style={{ width: 120, height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / max) * 100}%`,
                                      background: pc?.color || '#6366f1', borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            No published posts yet. Start publishing to see performance data.
          </p>
        )}
      </div>

    </div>
  );
}

/* ── Styles ── */
const s = {
  wrap: {
    maxWidth: 900, margin: '0 auto', padding: '24px 20px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: { marginBottom: 20 },
  title:  { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  sub:    { fontSize: 13, color: '#64748b', marginTop: 4 },
  tabs:   { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tab: {
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  card: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    padding: '24px', marginBottom: 20,
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  select: {
    padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 12, color: '#475569', background: '#f8fafc', cursor: 'pointer',
  },
  refreshBtn: {
    border: 'none', color: '#fff', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  snapMsg: {
    background: '#ede9fe', color: '#5b21b6', borderRadius: 8,
    padding: '8px 12px', fontSize: 12, marginBottom: 12,
  },
  loadingRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    color: '#94a3b8', fontSize: 13, padding: '20px 0',
  },
  spinner: {
    width: 20, height: 20,
    border: '2px solid #e2e8f0',
    borderTop: '2px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statRow: {
    display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum:   { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#94a3b8' },
};
