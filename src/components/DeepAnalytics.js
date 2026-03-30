import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Section tabs (not platform tabs) — serial shown in UI
const SECTION_TABS = [
  { id: 'growth',     serial: '1', label: '👥 Follower Growth' },
  { id: 'besttime',   serial: '2', label: '⏰ Best time to post' },
  { id: 'breakdown',  serial: '3', label: '📊 Breakdown' },
  { id: 'calendar',   serial: '4', label: '📅 Calendar' },
  { id: 'competitor', serial: '5', label: '🔍 Competitor' },
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

function hexToRgb(hex) {
  const h = (hex || '#6366f1').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 99, g: 102, b: 241 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Lighter mixes of platform brand for the three type towers (video = full brand). */
function typeTowerColors(platformHex) {
  const { r, g, b } = hexToRgb(platformHex);
  const mix = (t) => {
    const R = Math.round(r + (255 - r) * t);
    const G = Math.round(g + (255 - g) * t);
    const B = Math.round(b + (255 - b) * t);
    return `rgb(${R},${G},${B})`;
  };
  return { video: mix(0), image: mix(0.32), text: mix(0.58) };
}

/** Pale track behind tower fill — same hue family as the selected platform (e.g. Facebook = light blue). */
function brandTowerTrackBg(platformHex) {
  const { r, g, b } = hexToRgb(platformHex);
  const t = 0.86;
  return `rgb(${Math.round(r + (255 - r) * t)},${Math.round(g + (255 - g) * t)},${Math.round(b + (255 - b) * t)})`;
}

/* ── SVG Line Chart ─────────────────────────────────────────── */
function LineChart({ data, color = '#6366f1', width = 500, height = 160 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, color: '#64748b', fontSize: 13, background: '#f8fafc', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
        <span style={{ fontSize: 22, opacity: 0.35 }}>📈</span>
        <div><strong style={{ color: '#475569' }}>Follower trend chart</strong></div>
        <div style={{ maxWidth: 360, lineHeight: 1.5 }}>
          No history points yet. Snapshots are saved daily (3am UTC) or when you use <strong>Refresh Now</strong> — after two or more points, your line appears here.
        </div>
      </div>
    );
  }

  if (data.length === 1) {
    const d0 = data[0];
    const f = d0.followers ?? 0;
    return (
      <div style={{
        height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 10, background: '#f8fafc', borderRadius: 12, padding: '16px 20px', textAlign: 'center',
        border: `1px dashed ${color}55`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>One snapshot so far</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, boxShadow: `0 0 0 4px ${color}33` }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{f.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>followers · {d0.date || 'latest'}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', maxWidth: 340, lineHeight: 1.5 }}>
          A line needs at least <strong>two</strong> days of snapshots. Run <strong>Refresh Now</strong> again tomorrow or wait for the next scheduled snapshot.
        </div>
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

/* ── Best time: normalize API + client fallbacks + guidance ───────── */

function padHeatmapTo7x24(hm) {
  if (!hm || !Array.isArray(hm) || hm.length === 0) {
    return Array.from({ length: 7 }, () => Array(24).fill(0));
  }
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const src = d < hm.length && Array.isArray(hm[d]) ? hm[d] : [];
    const row = [];
    for (let h = 0; h < 24; h++) {
      row.push(Number(src[h]) || 0);
    }
    rows.push(row);
  }
  return rows;
}

function isHeatmapAllZeros(rows) {
  return !rows || rows.every((r) => r.every((c) => !Number(c)));
}

/** When API heatmap is empty but postsDetail has timestamps, build Mon=0 … Sun=6 grid. */
function buildHeatmapFromPostsDetail(postsDetail) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let n = 0;
  (postsDetail || []).forEach((p) => {
    let d = p.dayIndex;
    let h = p.hour;
    if (d == null || h == null) {
      const raw = p.createdAt || p.publishedAt || p.dateTime;
      if (!raw) return;
      const dt = new Date(raw);
      if (Number.isNaN(dt.getTime())) return;
      d = (dt.getDay() + 6) % 7;
      h = dt.getHours();
    } else {
      d = Number(d);
      h = Number(h);
    }
    if (d < 0 || d > 6 || h < 0 || h > 23) return;
    grid[d][h] += 1;
    n += 1;
  });
  return n > 0 ? grid : null;
}

function inferPeakFromHeatmap(heatmap) {
  let bestD = 0;
  let bestH = 0;
  let bestC = -1;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const c = Number(heatmap[d]?.[h]) || 0;
      if (c > bestC) {
        bestC = c;
        bestD = d;
        bestH = h;
      }
    }
  }
  if (bestC <= 0) return null;
  return { d: bestD, h: bestH, count: bestC };
}

function topSlotsFromHeatmap(heatmap, limit) {
  const arr = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const c = Number(heatmap[d]?.[h]) || 0;
      if (c > 0) arr.push({ d, h, c });
    }
  }
  arr.sort((a, b) => b.c - a.c);
  return arr.slice(0, limit);
}

/**
 * Single source of truth for heatmap + best day/hour (fills gaps if API omits bestDay/bestHour).
 */
function resolveBestTimeView(api) {
  if (!api || typeof api !== 'object') return null;
  const rawPadded = padHeatmapTo7x24(api.heatmap);
  let heatmap = rawPadded;
  const postsDetail = api.postsDetail || [];
  let inferredFromDetail = false;
  if (isHeatmapAllZeros(heatmap)) {
    const built = buildHeatmapFromPostsDetail(postsDetail);
    if (built) {
      heatmap = built;
      inferredFromDetail = true;
    }
  }
  if (isHeatmapAllZeros(heatmap)) return null;

  const peak = inferPeakFromHeatmap(heatmap);
  if (!peak) return null;

  let bestDay = api.bestDay;
  let bestHour =
    api.bestHour != null && api.bestHour !== ''
      ? Number(api.bestHour)
      : null;
  if (bestHour != null && Number.isNaN(bestHour)) bestHour = null;

  let bestDayIndex = bestDay
    ? DAY_LABELS.findIndex((dl) => String(bestDay).toLowerCase().startsWith(dl.toLowerCase()))
    : -1;

  if (bestHour == null) bestHour = peak.h;
  if (bestDayIndex < 0) bestDayIndex = peak.d;
  if (!bestDay) bestDay = DAY_FULL_LABELS[peak.d];

  const totalPosts = heatmap.flat().reduce((a, b) => a + Number(b || 0), 0);
  const topSlots = topSlotsFromHeatmap(heatmap, 5);

  return {
    heatmap,
    bestDay,
    bestHour,
    bestDayIndex,
    totalPosts,
    topSlots,
    peakCount: peak.count,
    inferredFromDetail,
  };
}

function BestTimeGuidancePanel({ resolved, platformLabel, platformColor }) {
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local time'
      : 'your local time';
  const extras = (resolved.topSlots || []).filter(
    (s) => !(s.d === resolved.bestDayIndex && s.h === resolved.bestHour)
  );

  return (
    <div
      style={{
        marginBottom: 20,
        padding: '18px 20px',
        borderRadius: 16,
        border: `2px solid ${platformColor}40`,
        background: `linear-gradient(135deg, ${platformColor}12, #fff 55%)`,
        boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: platformColor, letterSpacing: '0.06em', marginBottom: 8 }}>
        SUGGESTED WINDOW
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
        Aim for <span style={{ color: platformColor }}>{resolved.bestDay}</span> around{' '}
        <span style={{ color: platformColor }}>{formatHour12(resolved.bestHour)}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}> ({tz})</span>
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
        Based on <strong>{resolved.totalPosts}</strong> post{resolved.totalPosts !== 1 ? 's' : ''} we counted for{' '}
        <strong>{platformLabel}</strong>
        {resolved.inferredFromDetail
          ? ' (timestamps from your post list — heatmap was empty in the API response).'
          : ' (when you usually publish in Wintaibot).'}
        {' '}This is <strong>your</strong> rhythm, not a guarantee of reach — use it as a starting point.
      </p>
      {extras.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>Also strong</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            {extras.slice(0, 3).map((s, i) => (
              <li key={i}>
                {DAY_FULL_LABELS[s.d]} · {formatHour12(s.h)} <span style={{ color: '#94a3b8' }}>({s.c} post{s.c !== 1 ? 's' : ''})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 8,
          paddingTop: 12,
          borderTop: '1px solid rgba(148,163,184,0.35)',
        }}
      >
        How to use this
      </div>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#475569', lineHeight: 1.65 }}>
        <li>
          Schedule the next post near this day &amp; hour using <strong>Video Publisher</strong> (left menu) or{' '}
          <strong>Content Calendar</strong>.
        </li>
        <li>
          Keep publishing for a few weeks, then check this heatmap again — patterns get clearer with more data.
        </li>
        <li>
          Open <a href="#trends-calendar">Posts Calendar (section 4 below)</a> → <strong>My Posts</strong> to see scheduled
          items on the grid.
        </li>
        <li>
          Click any <strong>non-empty</strong> cell in the heatmap to see which posts fell in that slot.
        </li>
      </ol>
    </div>
  );
}

function BestTimeEmptyGuide({ platformLabel, platformColor }) {
  return (
    <div
      style={{
        padding: '20px 22px',
        borderRadius: 14,
        background: '#f8fafc',
        border: '1.5px dashed #cbd5e1',
        marginBottom: 8,
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#334155' }}>
        No posting history yet for <span style={{ color: platformColor }}>{platformLabel}</span>
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
        We build your personal “best time” from <strong>when your posts actually go out</strong>. Connect the account,
        publish or schedule a few posts, then return here.
      </p>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#475569', lineHeight: 1.65 }}>
        <li>
          <strong>Connected Accounts</strong> — make sure {platformLabel} is linked.
        </li>
        <li>
          <strong>Video Publisher</strong> — publish or schedule content to {platformLabel}.
        </li>
        <li>
          <strong>Refresh</strong> — come back to Trends → Best Time; the heatmap fills as we see more timestamps.
        </li>
      </ol>
    </div>
  );
}

/* ── Heatmap ─────────────────────────────────────────────────── */
function PostHeatmap({ resolved, postsDetail = [], platformLabel = 'this platform' }) {
  const [selected, setSelected] = useState(null);

  const heatmap = resolved?.heatmap;
  const bestDay = resolved?.bestDay;
  const bestHour = resolved?.bestHour;
  const bestDayIndex = resolved?.bestDayIndex ?? -1;

  if (!heatmap || heatmap.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: 13 }}>No posts yet to analyze.</p>;
  }

  const maxVal = Math.max(...heatmap.flat(), 1);
  const selectedPosts = selected
    ? postsDetail.filter((p) => {
        if (p.dayIndex != null && p.hour != null) {
          return Number(p.dayIndex) === selected.d && Number(p.hour) === selected.h;
        }
        const raw = p.createdAt || p.publishedAt || p.dateTime;
        if (!raw) return false;
        const dt = new Date(raw);
        if (Number.isNaN(dt.getTime())) return false;
        const d = (dt.getDay() + 6) % 7;
        const h = dt.getHours();
        return d === selected.d && h === selected.h;
      })
    : [];

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
        Your busiest slot on <strong>{platformLabel}</strong>: <strong>{bestDay}</strong> at{' '}
        <strong>{formatHour12(bestHour)}</strong> (by post count)
      </div>

      {selected && selectedPosts.length === 0 && (
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, lineHeight: 1.5 }}>
          This cell has activity in the heatmap, but the API did not return individual posts for it. Try another cell or
          refresh after more posts sync.
        </p>
      )}

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
            const rowPlat = PLATFORMS.find((x) => x.id === (p.platform || '').toLowerCase());
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
            return (
              <div key={i} style={{ padding: '14px 16px', borderBottom: i < selectedPosts.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {rowPlat ? <PlatformIcon platform={rowPlat} size={22} /> : null}
                    <span style={{ background: platColor, color: '#fff', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{rowPlat?.label || p.platform || 'Unknown'}</span>
                  </span>
                  <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{p.mediaType || 'Post'}</span>
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

function getTypeCountNorm(normalizedByType, key) {
  const v = normalizedByType[key];
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  return Number(v.count) || 0;
}

/** Map varied API keys (photo, carousel, …) into video | image | text totals. */
function aggregateCanonicalTypeCounts(rawByType) {
  const totals = { video: 0, image: 0, text: 0 };
  const toVideo = new Set(['video', 'videos', 'reel', 'reels', 'short', 'shorts', 'clip', 'clips', 'vod']);
  const toImage = new Set([
    'image', 'images', 'photo', 'photos', 'carousel', 'carousels', 'picture', 'pictures',
    'pin', 'pins', 'igcarousel', 'media',
  ]);
  const toText = new Set(['text', 'texts', 'status', 'link', 'article', 'poll', 'polls', 'caption', 'captions']);

  Object.entries(rawByType || {}).forEach(([k, v]) => {
    const key = String(k).toLowerCase().replace(/[\s_-]+/g, '');
    const n = typeof v === 'number' ? v : Number(v?.count) || 0;
    if (!n) return;
    if (toVideo.has(key)) totals.video += n;
    else if (toImage.has(key)) totals.image += n;
    else if (toText.has(key)) totals.text += n;
    else if (key === 'video' || key.endsWith('video')) totals.video += n;
    else if (/photo|carousel|image|picture|pin/.test(key)) totals.image += n;
    else if (/text|status|link|article|poll/.test(key)) totals.text += n;
  });
  return totals;
}

/** Server can send { video: { youtube: 4 }, image: { instagram: 3 }, text: {...} } — any alias key merged per canonical type. */
function extractExplicitTypePlatform(byTypeByPlatform, typeKey) {
  if (!byTypeByPlatform || typeof byTypeByPlatform !== 'object') return null;
  const raw =
    byTypeByPlatform[typeKey] ||
    byTypeByPlatform[typeKey.toLowerCase()] ||
    byTypeByPlatform[typeKey.charAt(0).toUpperCase() + typeKey.slice(1).toLowerCase()];
  if (!raw || typeof raw !== 'object') return null;
  const segs = [];
  Object.entries(raw).forEach(([k, v]) => {
    const n = typeof v === 'number' ? v : Number(v?.count) || 0;
    if (n <= 0) return;
    const id = String(k).toLowerCase();
    const pc = PLATFORMS.find((p) => p.id === id);
    segs.push({
      platformId: id,
      label: pc?.label || id,
      color: pc?.color || PLATFORM_COLORS[id] || '#64748b',
      count: n,
    });
  });
  return segs.length ? segs : null;
}

const EXPLICIT_ALIASES = {
  video: ['video', 'videos', 'reel', 'reels', 'short', 'shorts', 'clip', 'clips'],
  image: ['image', 'images', 'photo', 'photos', 'carousel', 'picture', 'pictures', 'pin', 'pins', 'igcarousel'],
  text: ['text', 'texts', 'status', 'link', 'article', 'poll', 'polls', 'caption'],
};

/** Merge all API variant keys into one segment list per Video / Image / Text tower. */
function extractExplicitForCanonical(byTypeByPlatform, canonKey) {
  if (!byTypeByPlatform || typeof byTypeByPlatform !== 'object') return null;
  const aliases = EXPLICIT_ALIASES[canonKey] || [canonKey];
  const merged = {};
  for (const tk of aliases) {
    const part = extractExplicitTypePlatform(byTypeByPlatform, tk);
    if (!part) continue;
    part.forEach((s) => {
      merged[s.platformId] = (merged[s.platformId] || 0) + s.count;
    });
  }
  const arr = Object.entries(merged).map(([platformId, count]) => {
    const pc = PLATFORMS.find((p) => p.id === platformId);
    return {
      platformId,
      label: pc?.label || platformId,
      color: pc?.color || PLATFORM_COLORS[platformId] || '#64748b',
      count,
    };
  }).filter((x) => x.count > 0);
  return arr.length ? arr : null;
}

/**
 * Each tower stacks platform brand colors by share of that content type.
 * Prefers postPerf.byTypeByPlatform; else estimates from byPlatform mix (same ratio applied per type).
 */
function TypeTowersChart({ postPerf, platformColor = '#6366f1' }) {
  const canon = aggregateCanonicalTypeCounts(postPerf?.byType || {});
  const normalized = {
    video: { count: canon.video },
    image: { count: canon.image },
    text: { count: canon.text },
  };
  const byPlatNorm = {};
  Object.entries(postPerf?.byPlatform || {}).forEach(([k, v]) => {
    byPlatNorm[String(k).toLowerCase()] = Number(v) || 0;
  });
  const totalPosts = Object.values(byPlatNorm).reduce((a, b) => a + b, 0);

  const explicitRoot =
    postPerf?.byTypeByPlatform ||
    postPerf?.typeByPlatform ||
    postPerf?.postsByTypeAndPlatform;

  const tint = typeTowerColors(platformColor);
  const tintFor = (key) => (key === 'video' ? tint.video : key === 'image' ? tint.image : tint.text);

  function segmentsForType(typeKey) {
    const tc = getTypeCountNorm(normalized, typeKey);
    if (tc <= 0) return { segments: [], total: 0 };

    const ex = extractExplicitForCanonical(explicitRoot, typeKey);
    if (ex) {
      const sum = ex.reduce((s, x) => s + x.count, 0) || 1;
      return {
        segments: ex.map((x) => ({
          ...x,
          pctOfType: Math.round((x.count / sum) * 1000) / 10,
        })),
        total: tc,
      };
    }

    if (totalPosts <= 0) {
      return {
        segments: [{ platformId: '_all', label: 'All', color: tintFor(typeKey), count: tc, pctOfType: 100 }],
        total: tc,
      };
    }

    const segs = [];
    PLATFORMS.forEach((p) => {
      const share = byPlatNorm[p.id] || 0;
      if (share <= 0) return;
      const cnt = tc * (share / totalPosts);
      if (cnt < 0.005) return;
      segs.push({
        platformId: p.id,
        label: p.label,
        color: p.color,
        count: cnt,
        pctOfType: (cnt / tc) * 100,
      });
    });
    if (segs.length === 0) {
      return {
        segments: [{ platformId: '_all', label: 'Mix', color: tintFor(typeKey), count: tc, pctOfType: 100 }],
        total: tc,
      };
    }
    return { segments: segs, total: tc };
  }

  const towers = [
    { key: 'video', label: 'Video' },
    { key: 'image', label: 'Image' },
    { key: 'text', label: 'Text' },
  ];
  const trackBg = brandTowerTrackBg(platformColor);
  const rows = towers.map((t) => {
    const { segments, total } = segmentsForType(t.key);
    return { ...t, segments, count: total };
  });
  const max = Math.max(...rows.map((r) => r.count), 1);
  const sumTypes = rows.reduce((s, r) => s + r.count, 0) || 1;
  const CH = 100;

  return (
    <div>
      <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.45, maxWidth: 560 }}>
        <strong>Video</strong>, <strong>Image</strong>, and <strong>Text</strong> towers all work the same: each bar is stacked by{' '}
        <strong>platform</strong> (brand colors). True splits when the API sends{' '}
        <code style={{ fontSize: 10 }}>byTypeByPlatform</code> for each type; otherwise shares are estimated from overall posts per platform.
        Hover a band for % of that tower.
      </p>
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', minHeight: 168, justifyContent: 'center', flexWrap: 'wrap' }}>
        {rows.map((r) => {
          const pctOfAllTypes = Math.round((r.count / sumTypes) * 1000) / 10;
          const innerPx = Math.max((r.count / max) * CH, r.count > 0 ? 14 : 0);
          const borderTint = r.segments[0]?.color || tintFor(r.key);
          return (
            <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 82 }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{r.count}</span>
              <div
                title={`${r.label}: ${r.count} posts (${pctOfAllTypes}% of video+image+text)`}
                style={{
                  width: 60,
                  height: 118,
                  background: trackBg,
                  borderRadius: '12px 12px 10px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 5,
                  boxSizing: 'border-box',
                  border: `1px solid ${borderTint}44`,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: innerPx,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    borderRadius: 10,
                    overflow: 'hidden',
                    boxShadow: `0 2px 10px ${borderTint}33`,
                  }}
                >
                  {r.segments.map((seg) => (
                    <div
                      key={seg.platformId}
                      title={`${seg.label}: ~${Math.round(seg.count)} (${Math.round(seg.pctOfType * 10) / 10}% of ${r.label})`}
                      style={{
                        flex: Math.max(seg.count, 0.001),
                        minHeight: seg.count > 0 ? 3 : 0,
                        background: seg.color,
                        boxSizing: 'border-box',
                        borderTop: r.segments.length > 1 ? '1px solid rgba(255,255,255,0.35)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'capitalize' }}>{r.label}</span>
              <span style={{ fontSize: 11, color: tintFor(r.key), fontWeight: 800 }}>{pctOfAllTypes}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SCHEDULED_ORANGE = '#f97316';
const SCHEDULED_ORANGE_BORDER = '#ea580c';

/* ── Under Best Time: this month published vs scheduled (compact) ── */
function BestTimeMonthPostStrip({ authHeaders, platformId }) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/analytics/calendar?year=${y}&month=${m}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [y, m, authHeaders]);

  const flatItems = useMemo(() => {
    if (!data) return [];
    const out = [];
    (data.posts || []).forEach((p) => {
      const pid = (p.platform || '').toLowerCase();
      if (platformId && pid && pid !== platformId) return;
      out.push({ ...p, _kind: 'post' });
    });
    (data.scheduled || []).forEach((j) => {
      const pid = (j.platform || '').toLowerCase();
      if (platformId && pid && pid !== platformId) return;
      out.push({ ...j, _kind: 'scheduled' });
    });
    out.sort((a, b) => String(a.dateTime || a.date || '').localeCompare(String(b.dateTime || b.date || '')));
    return out;
  }, [data, platformId]);

  const legendPublished = platformId
    ? PLATFORMS.find((p) => p.id === platformId)?.color || '#6366f1'
    : '#6366f1';

  if (loading) {
    return (
      <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Loading this month&apos;s posts…</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid #f1f5f9', position: 'relative' }}>
      <h4 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
        📅 This month: published vs scheduled
      </h4>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>
        <strong>Round</strong> markers = published (color matches platform). <strong>Square</strong> markers = scheduled or pending
        (reschedule). Hover any marker for format (image / video / text), caption, status, and logo — same rules as the Calendar tab.
      </p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', fontSize: 11, color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: legendPublished }} />
          Published
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: SCHEDULED_ORANGE,
              border: `1px solid ${SCHEDULED_ORANGE_BORDER}`,
            }}
          />
          Scheduled / pending
        </span>
      </div>
      {flatItems.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No posts this month for the selected platform filter.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {flatItems.map((item, i) => {
            const pc = PLATFORMS.find((p) => p.id === (item.platform || '').toLowerCase());
            const isSched = item._kind === 'scheduled';
            const media = (item.mediaType || item.postType || 'post').toString();
            return (
              <button
                key={`${item.jobId || item.id || ''}-${i}`}
                type="button"
                onMouseEnter={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setHover({
                    item,
                    media,
                    pc,
                    isSched,
                    left: r.left + r.width / 2,
                    top: r.top,
                  });
                }}
                onMouseLeave={() => setHover(null)}
                style={{
                  border: `2px solid ${isSched ? SCHEDULED_ORANGE_BORDER : pc?.color || '#10b981'}`,
                  background: isSched ? '#fff7ed' : '#fff',
                  borderRadius: isSched ? 6 : 99,
                  width: isSched ? 14 : 13,
                  height: isSched ? 14 : 13,
                  padding: 0,
                  cursor: 'default',
                  boxSizing: 'border-box',
                }}
                aria-label={`${isSched ? 'Scheduled' : 'Published'} ${pc?.label || item.platform || ''}`}
              />
            );
          })}
        </div>
      )}
      {hover && typeof document !== 'undefined' && (
        <div
          style={{
            position: 'fixed',
            left: Math.max(12, Math.min(hover.left, window.innerWidth - 292)),
            top: hover.top,
            transform: 'translate(-50%, calc(-100% - 10px))',
            zIndex: 20000,
            width: 280,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
            padding: '12px 14px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {hover.pc ? <PlatformIcon platform={hover.pc} size={28} /> : <span style={{ fontSize: 22 }}>📱</span>}
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                {hover.pc?.label || hover.item.platform || 'Platform'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {hover.isSched ? 'Scheduled / pending' : 'Published'} ·{' '}
                <strong style={{ color: '#334155' }}>
                  {String(hover.media).replace(/^\w/, (c) => c.toUpperCase())}
                </strong>{' '}
                (format)
              </div>
            </div>
          </div>
          {(hover.item.dateTime || hover.item.date) && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              {hover.item.dateTime
                ? new Date(hover.item.dateTime).toLocaleString()
                : hover.item.date}
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              color: '#475569',
              lineHeight: 1.5,
              maxHeight: 120,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {hover.item.caption || <em style={{ color: '#94a3b8' }}>No caption</em>}
          </div>
          {hover.item.status && (
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                fontWeight: 700,
                color: hover.isSched ? '#c2410c' : '#16a34a',
              }}
            >
              Status: {hover.item.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Calendar API may omit this; try common shapes / keys. */
function normalizeCalendarBestTimeOverlay(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const raw =
    payload.bestTimeOverlay ||
    payload.best_time_overlay ||
    payload.bestTimeHeatmap ||
    payload.dayHourHeatmap ||
    payload.heatmap;
  return Array.isArray(raw) && raw.length > 0 ? raw : [];
}

/**
 * YYYY-MM-DD in the user's local calendar for grid cells.
 * Handles rows that only have scheduledAt / dateTime (common for jobs) without a plain date field.
 */
function calendarLocalDateKey(rec) {
  if (!rec || typeof rec !== 'object') return null;
  const dOnly = rec.date;
  if (typeof dOnly === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dOnly.trim())) {
    return dOnly.trim();
  }
  const raw =
    rec.dateTime ||
    rec.scheduledAt ||
    rec.scheduledTime ||
    rec.publishAt ||
    rec.publishedAt ||
    rec.createdAt ||
    dOnly;
  if (raw == null || String(raw).trim() === '') return null;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dayScoresFromHeatmapRows(heatmap) {
  return Array.from({ length: 7 }, (_, d) => {
    const row = heatmap?.[d];
    if (!Array.isArray(row)) return 0;
    return row.reduce((a, b) => a + (Number(b) || 0), 0);
  });
}

/** When API sends no overlay, infer weekday activity from post + scheduled rows (local calendar dates). */
function dayScoresFromPostDates(records) {
  const c = [0, 0, 0, 0, 0, 0, 0];
  (records || []).forEach((p) => {
    const key = calendarLocalDateKey(p);
    if (!key) return;
    const [yy, mm, dd] = key.split('-').map(Number);
    const d = new Date(yy, mm - 1, dd);
    if (Number.isNaN(d.getTime())) return;
    const dow = (d.getDay() + 6) % 7;
    c[dow] += 1;
  });
  return c;
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
  const [calTip, setCalTip] = useState(null); // hover on mini markers

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

  // Group posts + scheduled by local calendar key YYYY-MM-DD (not only p.date — jobs often use scheduledAt)
  const byDate = {};
  if (data) {
    (data.posts || []).forEach((p) => {
      const key = calendarLocalDateKey(p);
      if (!key) return;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({ ...p, _kind: 'post' });
    });
    (data.scheduled || []).forEach((j) => {
      const key = calendarLocalDateKey(j);
      if (!key) return;
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({ ...j, _kind: 'scheduled' });
    });
  }

  const bestTimeCal = useMemo(() => {
    const hm = normalizeCalendarBestTimeOverlay(data);
    let scores = dayScoresFromHeatmapRows(hm);
    let max = Math.max(...scores, 0);
    let source = 'heatmap';
    if (max === 0 && data) {
      scores = dayScoresFromPostDates([...(data.posts || []), ...(data.scheduled || [])]);
      max = Math.max(...scores, 0);
      source = max > 0 ? 'posts' : 'none';
    } else if (max > 0) {
      source = 'heatmap';
    } else {
      source = 'none';
    }
    return {
      dayScores: scores,
      maxDayScore: Math.max(max, 1),
      hasAny: max > 0,
      source,
    };
  }, [data]);

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

      {calView === 'besttime' && (
        <div
          style={{
            marginBottom: 14,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            fontSize: 12,
            color: '#92400e',
            lineHeight: 1.5,
          }}
        >
          <strong>Best Times</strong> shows weekday activity shading only — it does{' '}
          <strong>not</strong> list scheduled posts. Tap <strong>📌 My Posts</strong> above to see orange squares
          (scheduled) and colored dots (published) on each day.
        </div>
      )}

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

                // Best time: shade by weekday score (API heatmap or inferred from post dates)
                const dow = (new Date(year, month - 1, day).getDay() + 6) % 7; // Mon=0
                const score = calView === 'besttime'
                  ? bestTimeCal.dayScores[dow] / bestTimeCal.maxDayScore
                  : 0;
                const maxS = Math.max(...bestTimeCal.dayScores, 0);
                const isPeak =
                  calView === 'besttime' && maxS > 0 && bestTimeCal.dayScores[dow] === maxS;
                const isGood =
                  calView === 'besttime' &&
                  maxS > 0 &&
                  !isPeak &&
                  bestTimeCal.dayScores[dow] >= maxS * 0.5;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSel ? null : day)}
                    title={
                      calView === 'besttime' && bestTimeCal.hasAny
                        ? `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dow]} · relative activity ${Math.round(score * 100)}%`
                        : undefined
                    }
                    style={{
                      minHeight: 60, borderRadius: 8, padding: '6px 6px 4px',
                      cursor: 'pointer',
                      border: `1.5px solid ${isSel ? '#6366f1' : isToday ? '#818cf8' : '#e2e8f0'}`,
                      background: calView === 'besttime'
                        ? `rgba(99,102,241,${0.1 + score * 0.55})`
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
                        {posts.slice(0, 4).map((p, i) => {
                          const pcDot = PLATFORMS.find((x) => x.id === (p.platform || '').toLowerCase());
                          const media = (p.mediaType || p.postType || 'post').toString();
                          return (
                            <div
                              key={i}
                              role="presentation"
                              onMouseEnter={(e) => {
                                const r = e.currentTarget.getBoundingClientRect();
                                setCalTip({
                                  kind: 'post',
                                  item: p,
                                  pc: pcDot,
                                  media,
                                  left: r.left + r.width / 2,
                                  top: r.top,
                                });
                              }}
                              onMouseLeave={() => setCalTip(null)}
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                background: PLATFORM_COLORS[p.platform] || '#10b981',
                                border: `1px solid ${(PLATFORM_COLORS[p.platform] || '#10b981')}99`,
                                cursor: 'default',
                              }}
                            />
                          );
                        })}
                        {sched.slice(0, 3).map((j, i) => {
                          const pcDot = PLATFORMS.find((x) => x.id === (j.platform || '').toLowerCase());
                          const media = (j.mediaType || j.postType || 'post').toString();
                          return (
                            <div
                              key={`s${i}`}
                              role="presentation"
                              onMouseEnter={(e) => {
                                const r = e.currentTarget.getBoundingClientRect();
                                setCalTip({
                                  kind: 'scheduled',
                                  item: j,
                                  pc: pcDot,
                                  media,
                                  left: r.left + r.width / 2,
                                  top: r.top,
                                });
                              }}
                              onMouseLeave={() => setCalTip(null)}
                              style={{
                                width: 9,
                                height: 9,
                                borderRadius: 2,
                                background: SCHEDULED_ORANGE,
                                border: `1px solid ${SCHEDULED_ORANGE_BORDER}`,
                                cursor: 'default',
                              }}
                            />
                          );
                        })}
                        {(posts.length + sched.length) > 7 && (
                          <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: '8px' }}>
                            +{posts.length + sched.length - 7}
                          </div>
                        )}
                      </div>
                    )}
                    {calView === 'besttime' && isPeak && (
                      <div style={{ fontSize: 9, color: '#4338ca', fontWeight: 800 }}>🔥 Peak</div>
                    )}
                    {calView === 'besttime' && isGood && (
                      <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700 }}>✓ Good</div>
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
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: SCHEDULED_ORANGE, border: `1px solid ${SCHEDULED_ORANGE_BORDER}` }} />
                  Scheduled / pending
                </div>
              </div>
            )}
            {calView === 'besttime' && (
              <div style={{ marginTop: 12 }}>
                {!loading && !bestTimeCal.hasAny && (
                  <div
                    style={{
                      background: '#f5f3ff',
                      border: '1px solid #c7d2fe',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 12,
                      color: '#4338ca',
                      lineHeight: 1.5,
                      marginBottom: 10,
                    }}
                  >
                    <strong>No shading yet.</strong> The calendar response had no <code style={{ fontSize: 10 }}>bestTimeOverlay</code>{' '}
                    (or it was all zeros), and we found no post or scheduled dates in this month&apos;s payload to infer
                    weekdays from. For the full <strong>hour-by-hour</strong> “best time” view, open <strong>2 · Best Time</strong>{' '}
                    in Trends (above). Use <strong>My Posts</strong> here to see scheduled and published markers on each day.
                  </div>
                )}
                {bestTimeCal.source === 'posts' && bestTimeCal.hasAny && (
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8, lineHeight: 1.45 }}>
                    Shading is <strong>estimated</strong> from how many posts fall on each weekday in this calendar data (API did not send a heatmap).
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: '#64748b' }}>
                  <span>Darker purple = busier weekday (Mon–Sun pattern, same for each date in that column)</span>
                  <span>🔥 Peak = your strongest weekday · ✓ Good = at least half of peak</span>
                </div>
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
              ) : selItems.map((item, i) => {
                const rowPc = PLATFORMS.find((x) => x.id === (item.platform || '').toLowerCase());
                const rowMedia = (item.mediaType || item.postType || 'post').toString();
                return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                  padding: '10px 12px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {rowPc ? <PlatformIcon platform={rowPc} size={22} /> : null}
                      <span style={{
                        background: PLATFORM_COLORS[item.platform] || '#6366f1',
                        color: '#fff', borderRadius: 20, padding: '3px 10px',
                        fontSize: 10, fontWeight: 700, textTransform: 'capitalize',
                      }}>{rowPc?.label || item.platform}</span>
                    </span>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                      textTransform: 'capitalize',
                    }}>{rowMedia}</span>
                    <span style={{
                      background: item._kind === 'scheduled' ? '#fff7ed' : '#f0fdf4',
                      color: item._kind === 'scheduled' ? '#c2410c' : '#16a34a',
                      borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 600,
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
              );
              })}
            </div>
          )}
        </div>
      )}
      {calTip && typeof document !== 'undefined' && (
        <div
          style={{
            position: 'fixed',
            left: Math.max(12, Math.min(calTip.left, window.innerWidth - 292)),
            top: calTip.top,
            transform: 'translate(-50%, calc(-100% - 8px))',
            zIndex: 20000,
            width: 280,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
            padding: '12px 14px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {calTip.pc ? <PlatformIcon platform={calTip.pc} size={28} /> : <span style={{ fontSize: 22 }}>📱</span>}
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                {calTip.pc?.label || calTip.item.platform || 'Platform'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {calTip.kind === 'scheduled' ? 'Scheduled / pending' : 'Published'} ·{' '}
                <strong style={{ color: '#334155' }}>
                  {String(calTip.media).replace(/^\w/, (c) => c.toUpperCase())}
                </strong>
              </div>
            </div>
          </div>
          {(calTip.item.dateTime || calTip.item.date) && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
              {calTip.item.dateTime
                ? new Date(calTip.item.dateTime).toLocaleString()
                : calTip.item.date}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, maxHeight: 100, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {calTip.item.caption || <em style={{ color: '#94a3b8' }}>No caption</em>}
          </div>
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
    const q = new URLSearchParams({ platform });
    fetch(`${API}/api/analytics/best-time?${q}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(setBestTime)
      .catch(() => setBestTime(null))
      .finally(() => setLoadBestTime(false));
  }, [platform, authHeaders]);

  const fetchPerformance = useCallback(() => {
    setLoadPerf(true);
    const q = new URLSearchParams({ platform });
    fetch(`${API}/api/analytics/post-performance?${q}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setPostPerf)
      .catch(() => setPostPerf(null))
      .finally(() => setLoadPerf(false));
  }, [platform, authHeaders]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchBestTime(); }, [fetchBestTime]);
  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

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

  const bestTimeResolved = useMemo(() => {
    if (!bestTime || typeof bestTime !== 'object') return null;
    return resolveBestTimeView(bestTime);
  }, [bestTime]);

  return (
    <div style={s.wrap}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <h2 style={s.title}>📈 Trends & Analytics</h2>
        <p style={s.sub}>Follower growth, best posting times, competitor research, and your content calendar</p>
      </div>

      {/* ── Jump links (all sections below on one page) ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginRight: 4 }}>Jump to</span>
        {SECTION_TABS.map(tab => (
          <a
            key={tab.id}
            href={`#trends-${tab.id}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#6366f1',
              textDecoration: 'none',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid #e0e7ff',
              background: '#f5f3ff',
            }}
          >
            <span style={{ opacity: 0.85 }}>{tab.serial}.</span> {tab.label}
          </a>
        ))}
      </div>

      {/* ── PLATFORM (sections 1–3: growth, best time, breakdown) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
          Platform for follower growth, best time & breakdown
        </div>
        <div style={s.tabs}>
          {PLATFORMS.map(p => (
            <button key={p.id} type="button" onClick={() => setPlatform(p.id)} style={{
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
      </div>

      {/* ── FOLLOWER GROWTH ── */}
      <section id="trends-growth" style={{ scrollMarginTop: 12 }}>
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
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '10px 18px', marginBottom: 14,
            fontSize: 11, color: '#64748b', lineHeight: 1.45,
          }}>
            <span><strong style={{ color: '#6366f1' }}>1.</strong> Pick {platformConfig.label}</span>
            <span><strong style={{ color: '#6366f1' }}>2.</strong> Choose 7 / 30 / 90 days</span>
            <span><strong style={{ color: '#6366f1' }}>3.</strong> Refresh Now to snapshot</span>
            <span><strong style={{ color: '#6366f1' }}>4.</strong> Read the trend line</span>
          </div>
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
      </section>

      {/* ── BEST TIME ── */}
      <section id="trends-besttime" style={{ scrollMarginTop: 12 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>⏰ Your posting times — {platformConfig.label}</h3>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 1.55 }}>
            This heatmap is <strong>your</strong> activity on <strong>{platformConfig.label}</strong> (posts tracked in Wintaibot),
            not the same as a general best-time recommendation for everyone on that network.
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, lineHeight: 1.5 }}>
            Darker cells = more of your posts went out at that day and hour (your local timezone). Click a cell with posts
            to see them listed.
          </p>
          {loadBestTime ? (
            <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
          ) : !bestTime ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Could not load best time data.</p>
          ) : !bestTimeResolved ? (
            <BestTimeEmptyGuide platformLabel={platformConfig.label} platformColor={platformConfig.color} />
          ) : (
            <>
              <BestTimeGuidancePanel
                resolved={bestTimeResolved}
                platformLabel={platformConfig.label}
                platformColor={platformConfig.color}
              />
              <PostHeatmap
                resolved={bestTimeResolved}
                postsDetail={bestTime.postsDetail || []}
                platformLabel={platformConfig.label}
              />
            </>
          )}
          {!loadBestTime && (
            <BestTimeMonthPostStrip authHeaders={authHeaders} platformId={platform} />
          )}
        </div>
      </section>

      {/* ── POST TYPE BREAKDOWN ── */}
      <section id="trends-breakdown" style={{ scrollMarginTop: 12 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>📊 Post Type Breakdown</h3>
          {loadPerf ? (
            <div style={s.loadingRow}><div style={s.spinner} /> Loading…</div>
          ) : postPerf && Object.keys(postPerf.byType || {}).length > 0 ? (
            <div style={s.perfRow}>
              <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 1.5 }}>
                  <strong>Video</strong>, <strong>Image</strong>, and <strong>Text</strong> each get a tower with{' '}
                  <strong>multi-color platform stacks</strong> (same behavior for all three). The pale frame uses{' '}
                  <strong style={{ color: platformConfig.color }}>{platformConfig.label}</strong> tint; band colors are each network&apos;s brand.
                  Bottom % is that type&apos;s share of video+image+text.
                </p>
                <TypeTowersChart postPerf={postPerf} platformColor={platformConfig.color} />
              </div>
              <div style={{ flex: '2 1 360px', minWidth: 0 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12, lineHeight: 1.45 }}>
                  <strong>Posts by platform</strong> — totals across <em>all</em> connected networks (not filtered by the tab above).
                </p>
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
      </section>

      {/* ── CALENDAR ── */}
      <section id="trends-calendar" style={{ scrollMarginTop: 12 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>📅 Posts Calendar</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            View all your published and scheduled posts by month. The <strong>Best Time</strong> section above shows which days and hours you post most often.
          </p>
          <TrendsCalendar authHeaders={authHeaders} />
        </div>
      </section>

      {/* ── COMPETITOR ── */}
      <section id="trends-competitor" style={{ scrollMarginTop: 12 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>🔍 YouTube Competitor Analysis</h3>
          <CompetitorTab authHeaders={authHeaders} />
        </div>
      </section>

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
