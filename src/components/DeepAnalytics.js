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

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range);
  // X axis labels (show ~5 dates)
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
      {/* Y gridlines */}
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
      {/* Area fill */}
      <polygon points={area} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Dots for each data point (only if few) */}
      {data.length <= 15 && data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.followers)} r="3.5" fill={color} />
      ))}
      {/* X axis labels */}
      {xLabels.map((d, _) => {
        const idx = data.indexOf(d);
        return (
          <text key={d.date} x={x(idx)} y={height - 4}
                textAnchor="middle" fontSize="9" fill="#94a3b8">
            {d.date.slice(5)} {/* MM-DD */}
          </text>
        );
      })}
    </svg>
  );
}

const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', youtube: '#FF0000',
  tiktok: '#010101', linkedin: '#0A66C2', x: '#000000',
  threads: '#101010', pinterest: '#E60023',
};

/* ── Heatmap ─────────────────────────────────────────────────── */
function PostHeatmap({ heatmap, bestDay, bestHour, postsDetail = [] }) {
  const [selected, setSelected] = useState(null); // {d, h}

  if (!heatmap || heatmap.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: 13 }}>No posts yet to analyze.</p>;
  }

  const maxVal = Math.max(...heatmap.flat(), 1);
  const selectedPosts = selected
    ? postsDetail.filter(p => p.dayIndex === selected.d && p.hour === selected.h)
    : [];

  const bestDayIndex = DAY_LABELS.findIndex(dl =>
    bestDay?.toLowerCase().startsWith(dl.toLowerCase())
  );

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `52px repeat(24, 32px)`, gap: 3, minWidth: 'max-content' }}>
          {/* Header row */}
          <div />
          {HOUR_LABELS.map((h, i) => (
            <div key={i} style={{
              fontSize: 9, textAlign: 'center', paddingBottom: 4,
              fontWeight: i === bestHour ? 800 : 400,
              color: i === bestHour ? '#6366f1' : '#94a3b8',
            }}>{h}</div>
          ))}
          {/* Data rows */}
          {DAY_LABELS.map((day, d) => (
            <React.Fragment key={d}>
              <div style={{
                fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center',
                fontWeight: d === bestDayIndex ? 800 : 500, paddingRight: 8,
              }}>{day}</div>
              {(heatmap[d] || []).map((count, h) => {
                const intensity = count / maxVal;
                const isSelected = selected?.d === d && selected?.h === h;
                const isBest = d === bestDayIndex && h === bestHour;
                const bg = count > 0
                  ? `rgba(99,102,241,${0.12 + intensity * 0.88})`
                  : '#f1f5f9';
                return (
                  <div
                    key={h}
                    onClick={() => count > 0 && setSelected(isSelected ? null : { d, h })}
                    title={`${day} ${HOUR_LABELS[h]}: ${count} post${count !== 1 ? 's' : ''}`}
                    style={{
                      width: 32, height: 28, borderRadius: 5,
                      background: isSelected ? '#6366f1' : bg,
                      outline: isBest && !isSelected ? '2px solid #6366f1' : 'none',
                      cursor: count > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.1s',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#64748b', marginTop: 12 }}>
        🏆 Best time to post: <strong>{bestDay}</strong> at <strong>{bestHour < 12 ? `${bestHour || 12}am` : bestHour === 12 ? '12pm' : `${bestHour - 12}pm`}</strong>
        {selected && <span style={{ marginLeft: 16, color: '#6366f1' }}>
          · Click another cell or same cell to deselect
        </span>}
      </div>

      {/* ── Post Detail Card ── */}
      {selected && selectedPosts.length > 0 && (
        <div style={{
          marginTop: 16, background: '#f8fafc', borderRadius: 14,
          border: '1.5px solid #e2e8f0', overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
            background: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
              {DAY_LABELS[selected.d]} {HOUR_LABELS[selected.h]} — {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setSelected(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: 16, lineHeight: 1,
            }}>✕</button>
          </div>
          {selectedPosts.map((p, i) => {
            const platColor = PLATFORM_COLORS[p.platform?.toLowerCase()] || '#6366f1';
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return (
              <div key={i} style={{
                padding: '14px 16px',
                borderBottom: i < selectedPosts.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: '#fff',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{
                    background: platColor, color: '#fff', borderRadius: 20,
                    padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    textTransform: 'capitalize',
                  }}>{p.platform || 'Unknown'}</span>
                  <span style={{
                    background: '#f1f5f9', color: '#64748b', borderRadius: 20,
                    padding: '3px 10px', fontSize: 11, fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>{p.mediaType}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{date}</span>
                </div>
                <p style={{
                  margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.55,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  maxHeight: 100, overflowY: 'auto',
                }}>
                  {p.caption || <em style={{ color: '#94a3b8' }}>No caption</em>}
                </p>
              </div>
            );
          })}
        </div>
      )}
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

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchBestTime(); fetchPerformance(); }, [fetchBestTime, fetchPerformance]);

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

      {/* ── FOLLOWER GROWTH + BEST TIME (wide screens: side by side) ── */}
      <div style={s.topGrid}>
        <div style={{ ...s.card, marginBottom: 0 }}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>👥 Follower Growth</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
              <div style={s.chartStretch}>
                <LineChart
                  data={history?.dataPoints || []}
                  color={platformConfig.color}
                  width={960}
                  height={200}
                />
              </div>
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

        <div style={{ ...s.card, marginBottom: 0 }}>
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
              postsDetail={bestTime.postsDetail || []}
            />
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Could not load best time data.</p>
          )}
        </div>
      </div>

      {/* ── POST TYPE PERFORMANCE ── */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>📊 Post Type Breakdown</h3>
        {loadPerf ? (
          <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
        ) : postPerf && Object.keys(postPerf.byType || {}).length > 0 ? (
          <div style={s.perfRow}>
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Posts by type</p>
              <BarChart data={postPerf.byType} color={platformConfig.color} />
            </div>
            <div style={{ flex: '2 1 360px', minWidth: 0 }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Posts by platform</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(postPerf.byPlatform || {}).map(([plat, count]) => {
                  const pc = PLATFORMS.find(p => p.id === plat);
                  const max = Math.max(...Object.values(postPerf.byPlatform || {}));
                  return (
                    <div key={plat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, width: 100, flexShrink: 0, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {pc ? <PlatformIcon platform={pc} size={14} /> : null}
                        {pc?.label || plat}
                      </span>
                      <div style={{ flex: 1, height: 12, minWidth: 80, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / max) * 100}%`,
                                      background: pc?.color || '#6366f1', borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', width: 28, flexShrink: 0, textAlign: 'right' }}>{count}</span>
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
    width: '100%',
    maxWidth: '100%',
    margin: 0,
    padding: '8px 4px 24px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
    gap: 20,
    marginBottom: 20,
    alignItems: 'stretch',
  },
  chartStretch: {
    width: '100%',
    minHeight: 200,
  },
  perfRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 40,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
