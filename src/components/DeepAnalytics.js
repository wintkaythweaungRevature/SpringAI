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

const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', youtube: '#FF0000',
  tiktok: '#010101', linkedin: '#0A66C2', x: '#000000',
  threads: '#101010', pinterest: '#E60023',
};

const DAY_LABELS      = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_FULL_LABELS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const HOUR_LABELS     = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Section tabs (not platform tabs)
const SECTION_TABS = [
  { id: 'growth',     label: '👥 Follower Growth' },
  { id: 'besttime',   label: '⏰ Best Time' },
  { id: 'breakdown',  label: '📊 Breakdown' },
  { id: 'calendar',   label: '📅 Calendar' },
  { id: 'competitor', label: '🔍 Competitor' },
];

function formatHour12(hour) {
  const h = Number(hour);
  if (Number.isNaN(h)) return '';
  if (h === 0) return '12:00 AM';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

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

  const yTicks  = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range);
  const step    = Math.max(1, Math.floor(data.length / 5));
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
function PostHeatmap({ heatmap, bestDay, bestHour, postsDetail = [] }) {
  const [selected, setSelected] = useState(null);

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
          <div />
          {HOUR_LABELS.map((h, i) => (
            <div key={i} style={{
              fontSize: 9, textAlign: 'center', paddingBottom: 4,
              fontWeight: i === bestHour ? 800 : 400,
              color: i === bestHour ? '#6366f1' : '#94a3b8',
            }}>{h}</div>
          ))}
          {DAY_LABELS.map((day, d) => (
            <React.Fragment key={d}>
              <div style={{
                fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center',
                fontWeight: d === bestDayIndex ? 800 : 500, paddingRight: 8,
              }}>{day}</div>
              {(heatmap[d] || []).map((count, h) => {
                const intensity  = count / maxVal;
                const isSelected = selected?.d === d && selected?.h === h;
                const isBest     = d === bestDayIndex && h === bestHour;
                const bg = count > 0 ? `rgba(99,102,241,${0.12 + intensity * 0.88})` : '#f1f5f9';
                return (
                  <div
                    key={h}
                    onClick={() => count > 0 && setSelected(isSelected ? null : { d, h })}
                    title={`${DAY_FULL_LABELS[d]} ${formatHour12(h)} — ${count} post${count !== 1 ? 's' : ''}`}
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
        🏆 Top posting window: <strong>{bestDay}</strong> at <strong>{formatHour12(bestHour)}</strong>
      </div>

      {selected && selectedPosts.length > 0 && (
        <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>
              {DAY_FULL_LABELS[selected.d]} {formatHour12(selected.h)} — {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>✕</button>
          </div>
          {selectedPosts.map((p, i) => {
            const platColor = PLATFORM_COLORS[p.platform?.toLowerCase()] || '#6366f1';
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return (
              <div key={i} style={{ padding: '14px 16px', borderBottom: i < selectedPosts.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ background: platColor, color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{p.platform || 'Unknown'}</span>
                  <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{p.mediaType}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{date}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 100, overflowY: 'auto' }}>
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

/* ── Trends Calendar ─────────────────────────────────────────── */
function TrendsCalendar({ authHeaders }) {
  const today     = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [data,  setData]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [calView, setCalView] = useState('posts'); // 'posts' | 'besttime'
  const [selectedDay, setSelectedDay] = useState(null);
  const [rescheduleJob, setRescheduleJob] = useState(null); // { job, newDate, newTime }
  const [reschMsg, setReschMsg] = useState('');

  const loadCalendar = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/analytics/calendar?year=${year}&month=${month}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [year, month, authHeaders]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth     = new Date(year, month, 0).getDate();
  // Shift so Mon=0
  const offset = (firstDayOfMonth + 6) % 7;

  // Group posts + scheduled by date string "YYYY-M-D"
  const byDate = {};
  if (data) {
    (data.posts || []).forEach(p => {
      if (!p.date) return;
      const key = p.date;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({ ...p, _kind: 'post' });
    });
    (data.scheduled || []).forEach(j => {
      if (!j.date) return;
      const key = j.date;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({ ...j, _kind: 'scheduled' });
    });
  }

  // Best time overlay: for each day of week, find the best hour score
  const heatmap = data?.bestTimeOverlay || [];
  const heatmaxVal = heatmap.length > 0 ? Math.max(...heatmap.flat(), 1) : 1;
  // Sum score per day-of-week (Mon=0 … Sun=6)
  const dayScores = Array.from({ length: 7 }, (_, d) =>
    heatmap[d] ? heatmap[d].reduce((a, b) => a + b, 0) : 0
  );
  const maxDayScore = Math.max(...dayScores, 1);

  // Find selected day's items
  const selKey = selectedDay ? `${year}-${String(month).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : null;
  const selItems = selKey ? (byDate[selKey] || []) : [];

  const handleReschedule = async () => {
    if (!rescheduleJob) return;
    const { job, newDate, newTime } = rescheduleJob;
    if (!newDate || !newTime) { setReschMsg('Pick a date and time'); return; }
    const newDateTime = `${newDate}T${newTime}:00`;
    try {
      const res = await fetch(`${API}/api/analytics/job/${job.jobId}/reschedule`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDateTime }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReschMsg(err.error || 'Reschedule failed');
        return;
      }
      setReschMsg('Rescheduled!');
      setRescheduleJob(null);
      setTimeout(() => { setReschMsg(''); loadCalendar(); }, 1200);
    } catch {
      setReschMsg('Reschedule failed');
    }
  };

  return (
    <div>
      {/* Sub-view toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['posts','📌 My Posts'],['besttime','🕐 Best Times']].map(([id, label]) => (
          <button key={id} onClick={() => setCalView(id)} style={{
            padding: '7px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: calView === id ? '#6366f1' : 'transparent',
            color: calView === id ? '#fff' : '#64748b',
            border: `1.5px solid ${calView === id ? '#6366f1' : '#e2e8f0'}`,
          }}>{label}</button>
        ))}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={prevMonth} style={s.navBtn}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', minWidth: 130, textAlign: 'center' }}>
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button onClick={nextMonth} style={s.navBtn}>›</button>
      </div>

      {loading ? (
        <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
          {/* Calendar grid */}
          <div>
            {/* Day-of-week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {/* Empty offset cells */}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`e-${i}`} style={{ minHeight: 60, background: '#f8fafc', borderRadius: 8 }} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateKey = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const items   = byDate[dateKey] || [];
                const posts   = items.filter(x => x._kind === 'post');
                const sched   = items.filter(x => x._kind === 'scheduled');
                const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                const isSel   = day === selectedDay;

                // Best time overlay: color cell by day-of-week score
                const dow = (new Date(year, month - 1, day).getDay() + 6) % 7; // Mon=0
                const score = calView === 'besttime'
                  ? dayScores[dow] / maxDayScore
                  : 0;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSel ? null : day)}
                    style={{
                      minHeight: 60, borderRadius: 8, padding: '6px 6px 4px',
                      cursor: 'pointer',
                      border: `1.5px solid ${isSel ? '#6366f1' : isToday ? '#818cf8' : '#e2e8f0'}`,
                      background: calView === 'besttime'
                        ? `rgba(99,102,241,${0.04 + score * 0.45})`
                        : isSel ? '#ede9fe' : isToday ? '#f5f3ff' : '#fff',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      fontSize: 11, fontWeight: isToday ? 800 : 600,
                      color: isToday ? '#6366f1' : isSel ? '#6366f1' : '#475569',
                      marginBottom: 4,
                    }}>{day}</div>
                    {calView === 'posts' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {posts.slice(0, 4).map((p, i) => (
                          <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: PLATFORM_COLORS[p.platform] || '#10b981',
                            title: p.platform,
                          }} title={p.platform} />
                        ))}
                        {sched.slice(0, 3).map((j, i) => (
                          <div key={`s${i}`} style={{
                            width: 8, height: 8, borderRadius: 2,
                            background: '#f97316',
                          }} title={`Scheduled: ${j.platform}`} />
                        ))}
                        {(posts.length + sched.length) > 7 && (
                          <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: '8px' }}>
                            +{posts.length + sched.length - 7}
                          </div>
                        )}
                      </div>
                    )}
                    {calView === 'besttime' && score > 0.3 && (
                      <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>
                        {score > 0.8 ? '🔥 Peak' : score > 0.5 ? '✓ Good' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {calView === 'posts' && (
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1' }} />
                  Published post (colored by platform)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316' }} />
                  Scheduled / pending
                </div>
              </div>
            )}
            {calView === 'besttime' && (
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap', fontSize: 11, color: '#64748b' }}>
                <span>Cell shade = engagement score for that day-of-week based on your posting history</span>
                <span>🔥 Peak = top posting day, ✓ Good = above average</span>
              </div>
            )}
          </div>

          {/* Day detail panel */}
          {selectedDay && (
            <div style={{ width: 280, background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e2e8f0', padding: 16, maxHeight: 500, overflowY: 'auto' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 12 }}>
                {MONTH_NAMES[month - 1]} {selectedDay}, {year}
              </div>
              {selItems.length === 0 ? (
                <p style={{ fontSize: 12, color: '#94a3b8' }}>No posts on this day.</p>
              ) : selItems.map((item, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                  padding: '10px 12px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{
                      background: PLATFORM_COLORS[item.platform] || '#6366f1',
                      color: '#fff', borderRadius: 20, padding: '2px 8px',
                      fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
                    }}>{item.platform}</span>
                    <span style={{
                      background: item._kind === 'scheduled' ? '#fff7ed' : '#f0fdf4',
                      color: item._kind === 'scheduled' ? '#c2410c' : '#16a34a',
                      borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600,
                    }}>
                      {item._kind === 'scheduled' ? `⏰ ${item.status}` : `✓ ${item.status}`}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.5,
                               overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3,
                               WebkitBoxOrient: 'vertical' }}>
                    {item.caption || <em style={{ color: '#94a3b8' }}>No caption</em>}
                  </p>
                  {item.dateTime && (
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(item.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}

                  {/* Reschedule button for pending jobs */}
                  {item._kind === 'scheduled' && (item.status === 'PENDING' || item.status === 'SCHEDULED') && (
                    rescheduleJob?.job?.jobId === item.jobId ? (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                          <input type="date"
                            value={rescheduleJob.newDate}
                            onChange={e => setRescheduleJob(r => ({ ...r, newDate: e.target.value }))}
                            style={{ flex: 1, padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 6 }}
                          />
                          <input type="time"
                            value={rescheduleJob.newTime}
                            onChange={e => setRescheduleJob(r => ({ ...r, newTime: e.target.value }))}
                            style={{ flex: 1, padding: '4px 6px', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 6 }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={handleReschedule} style={{
                            flex: 1, background: '#6366f1', color: '#fff', border: 'none',
                            borderRadius: 6, padding: '5px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>Confirm</button>
                          <button onClick={() => setRescheduleJob(null)} style={{
                            flex: 1, background: '#f1f5f9', color: '#475569', border: 'none',
                            borderRadius: 6, padding: '5px 0', fontSize: 11, cursor: 'pointer',
                          }}>Cancel</button>
                        </div>
                        {reschMsg && <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4 }}>{reschMsg}</div>}
                      </div>
                    ) : (
                      <button onClick={() => setRescheduleJob({
                        job: item,
                        newDate: item.date || '',
                        newTime: item.dateTime ? item.dateTime.slice(11, 16) : '12:00',
                      })} style={{
                        marginTop: 8, width: '100%', background: '#fff7ed',
                        color: '#c2410c', border: '1px solid #fed7aa',
                        borderRadius: 6, padding: '5px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>⏱ Reschedule</button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Competitor Analysis ─────────────────────────────────────── */
function CompetitorTab({ authHeaders }) {
  const [query,       setQuery]       = useState('');
  const [searching,   setSearching]   = useState(false);
  const [channels,    setChannels]    = useState(null);
  const [selectedCh,  setSelectedCh]  = useState(null);
  const [analysis,    setAnalysis]    = useState(null);
  const [loadAnalysis,setLoadAnalysis]= useState(false);
  const [error,       setError]       = useState('');

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setChannels(null); setSelectedCh(null); setAnalysis(null); setError('');
    try {
      const res = await fetch(`${API}/api/analytics/competitors/youtube?query=${encodeURIComponent(query)}`,
        { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Search failed'); return; }
      setChannels(data.channels || []);
    } catch {
      setError('Search failed. Make sure your YouTube account is connected.');
    } finally {
      setSearching(false);
    }
  };

  const doAnalyze = async (channelId) => {
    setSelectedCh(channelId); setLoadAnalysis(true); setAnalysis(null); setError('');
    try {
      const res = await fetch(`${API}/api/analytics/competitors/youtube/${channelId}`,
        { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Analysis failed'); return; }
      setAnalysis(data);
    } catch {
      setError('Analysis failed.');
    } finally {
      setLoadAnalysis(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        Search any YouTube channel to see their stats, recent videos, and engagement — compared to your channel.
        <strong style={{ color: '#e74c3c' }}> Requires YouTube account connected.</strong>
      </p>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search channel (e.g. MrBeast, Tech With Tim…)"
          style={{
            flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0',
            borderRadius: 10, fontSize: 13, color: '#1e293b',
          }}
        />
        <button onClick={doSearch} disabled={searching || !query.trim()} style={{
          padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          opacity: searching || !query.trim() ? 0.6 : 1,
        }}>
          {searching ? '⏳' : '🔍 Search'}
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {/* Channel results */}
      {channels && channels.length === 0 && !searching && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No channels found. Try a different search term.</p>
      )}
      {channels && channels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {channels.map(ch => (
            <div key={ch.channelId}
              onClick={() => doAnalyze(ch.channelId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: selectedCh === ch.channelId ? '#ede9fe' : '#fff',
                border: `1.5px solid ${selectedCh === ch.channelId ? '#6366f1' : '#e2e8f0'}`,
                borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {ch.thumbnailUrl && (
                <img src={ch.thumbnailUrl} alt={ch.title} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{ch.title}</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    👥 {ch.hiddenSubscribers ? 'Hidden' : fmtNum(ch.subscriberCount)} subs
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>🎬 {fmtNum(ch.videoCount)} videos</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>👁 {fmtNum(ch.viewCount)} views</span>
                </div>
              </div>
              <span style={{ color: '#6366f1', fontSize: 13, fontWeight: 600 }}>Analyze →</span>
            </div>
          ))}
        </div>
      )}

      {/* Deep analysis */}
      {loadAnalysis && <div style={s.loadingRow}><div style={s.spinner} /> Loading analysis…</div>}
      {analysis && (
        <div>
          {/* Channel header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
            {analysis.channel?.thumbnailUrl && (
              <img src={analysis.channel.thumbnailUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1e293b', marginBottom: 4 }}>{analysis.channel?.title}</div>
              {analysis.channel?.description && (
                <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {analysis.channel.description}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            {[
              ['👥 Subscribers', analysis.channel?.hiddenSubscribers ? 'Hidden' : fmtNum(analysis.channel?.subscriberCount)],
              ['🎬 Total Videos',   fmtNum(analysis.channel?.videoCount)],
              ['👁 Total Views',    fmtNum(analysis.channel?.viewCount)],
              ['📊 Avg Views/Video', fmtNum(analysis.avgViewsPerVideo)],
              ['❤️ Avg Likes/Video', fmtNum(analysis.avgLikesPerVideo)],
              ['💬 Avg Comments',   fmtNum(analysis.avgCommentsPerVideo)],
              ['📈 Avg Engagement', `${analysis.avgEngagementRate}%`],
            ].map(([label, value]) => (
              <div key={label} style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', minWidth: 120, flex: '1 1 120px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>{value}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Recent videos table */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
              Recent Videos
            </div>
            {(analysis.recentVideos || []).map((v, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 20px', borderBottom: i < analysis.recentVideos.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                {v.thumbnailUrl && (
                  <img src={v.thumbnailUrl} alt="" style={{ width: 72, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                marginBottom: 4 }}>{v.title}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>👁 {fmtNum(v.viewCount)}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>❤️ {fmtNum(v.likeCount)}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>💬 {fmtNum(v.commentCount)}</span>
                    <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{v.engagementRate}% eng.</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                  {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function DeepAnalytics() {
  const { authHeaders } = useAuth();

  const [platform,     setPlatform]     = useState('instagram');
  const [section,      setSection]      = useState('growth');
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
      await fetch(`${API}/api/analytics/snapshot/run?platform=${platform}`, { method: 'POST', headers: authHeaders() });
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
        <h2 style={s.title}>📈 Trends & Analytics</h2>
        <p style={s.sub}>Follower growth, best posting times, competitor research, and your content calendar</p>
      </div>

      {/* ── SECTION TABS ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {SECTION_TABS.map(tab => (
          <button key={tab.id} onClick={() => setSection(tab.id)} style={{
            ...s.tab,
            background: section === tab.id ? '#6366f1' : 'transparent',
            color: section === tab.id ? '#fff' : '#64748b',
            border: `1.5px solid ${section === tab.id ? '#6366f1' : '#e2e8f0'}`,
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── PLATFORM TABS (only for growth/besttime/breakdown) ── */}
      {['growth','besttime','breakdown'].includes(section) && (
        <div style={s.tabs}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)} style={{
              ...s.tab,
              background: platform === p.id ? p.color : 'transparent',
              color: platform === p.id ? '#fff' : '#64748b',
              border: `1.5px solid ${platform === p.id ? p.color : '#e2e8f0'}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <PlatformIcon platform={p} size={15} />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── FOLLOWER GROWTH ── */}
      {section === 'growth' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle}>👥 Follower Growth</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={days} onChange={e => setDays(Number(e.target.value))} style={s.select}>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
              <button
                style={{ ...s.refreshBtn, background: platformConfig.color, opacity: snapping ? 0.7 : 1 }}
                onClick={refreshSnapshot}
                disabled={snapping}
              >{snapping ? '⏳' : '🔄'} Refresh Now</button>
            </div>
          </div>
          {snapMsg && <div style={s.snapMsg}>{snapMsg}</div>}
          {loadHistory ? (
            <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
          ) : (
            <>
              <div style={s.chartStretch}>
                <LineChart data={history?.dataPoints || []} color={platformConfig.color} width={960} height={200} />
              </div>
              {history?.dataPoints?.length > 0 && (
                <div style={s.statRow}>
                  <div style={s.stat}>
                    <span style={s.statNum}>{(history.dataPoints[history.dataPoints.length - 1]?.followers || 0).toLocaleString()}</span>
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
                    <span style={s.statNum}>{history.dataPoints[history.dataPoints.length - 1]?.engagementRate || '—'}%</span>
                    <span style={s.statLabel}>Engagement Rate</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BEST TIME ── */}
      {section === 'besttime' && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>⏰ Best Time to Post</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            Based on your posting history. Darker blocks = times you post most often. Click a block to see which posts you made.
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
      )}

      {/* ── POST TYPE BREAKDOWN ── */}
      {section === 'breakdown' && (
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
                    const pc  = PLATFORMS.find(p => p.id === plat);
                    const max = Math.max(...Object.values(postPerf.byPlatform || {}));
                    return (
                      <div key={plat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, width: 100, flexShrink: 0, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {pc ? <PlatformIcon platform={pc} size={14} /> : null}
                          {pc?.label || plat}
                        </span>
                        <div style={{ flex: 1, height: 12, minWidth: 80, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: pc?.color || '#6366f1', borderRadius: 6 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', width: 28, flexShrink: 0, textAlign: 'right' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No published posts yet. Start publishing to see performance data.</p>
          )}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {section === 'calendar' && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>📅 Posts Calendar</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            View all your published and scheduled posts by month. Switch to "Best Times" to see which days historically get the most engagement.
          </p>
          <TrendsCalendar authHeaders={authHeaders} />
        </div>
      )}

      {/* ── COMPETITOR ── */}
      {section === 'competitor' && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>🔍 YouTube Competitor Analysis</h3>
          <CompetitorTab authHeaders={authHeaders} />
        </div>
      )}

    </div>
  );
}

/* ── Styles ── */
const s = {
  wrap: {
    width: '100%', maxWidth: '100%', margin: 0,
    padding: '8px 4px 24px', boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  chartStretch: { width: '100%', minHeight: 200 },
  perfRow: { display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'flex-start', justifyContent: 'space-between' },
  header:    { marginBottom: 20 },
  title:     { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0 },
  sub:       { fontSize: 13, color: '#64748b', marginTop: 4 },
  tabs:      { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  tab: {
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  card: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    padding: '24px', marginBottom: 20,
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cardTitle:  { fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 },
  select: {
    padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 12, color: '#475569', background: '#f8fafc', cursor: 'pointer',
  },
  refreshBtn: {
    border: 'none', color: '#fff', borderRadius: 8,
    padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  snapMsg:    { background: '#ede9fe', color: '#5b21b6', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 },
  loadingRow: { display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 13, padding: '20px 0' },
  spinner: {
    width: 20, height: 20, border: '2px solid #e2e8f0',
    borderTop: '2px solid #6366f1', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statRow:   { display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' },
  stat:      { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum:   { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#94a3b8' },
  navBtn: {
    background: '#f1f5f9', border: 'none', borderRadius: 8,
    padding: '6px 14px', fontSize: 16, cursor: 'pointer', color: '#475569',
  },
};
