import React, { useState, useRef, useEffect, useCallback } from 'react';

const W = 700;
const PAD_NORMAL  = { top: 20, right: 24, bottom: 36, left: 52 };
const PAD_COMPACT = { top: 16, right: 20, bottom: 56, left: 52 };

function buildPath(points) {
  if (points.length < 2) return points.length === 1 ? `M${points[0].x},${points[0].y}` : '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx  = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

/** Binary-search the SVG path for the exact Y at a given X. */
function getPointOnCurve(path, targetX, totalLen) {
  if (!path || totalLen === 0) return null;
  let lo = 0, hi = totalLen;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pt  = path.getPointAtLength(mid);
    if (Math.abs(pt.x - targetX) < 0.3) return pt;
    if (pt.x < targetX) lo = mid; else hi = mid;
  }
  return path.getPointAtLength((lo + hi) / 2);
}

/** Linear-interpolate the data value at a given SVG X between two data points. */
function interpValue(points, svgX) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    if (svgX >= a.x && svgX <= b.x) {
      const t = (svgX - a.x) / (b.x - a.x);
      return { value: Math.round(a.value + t * (b.value - a.value)), label: t < 0.5 ? a.label : b.label };
    }
  }
  if (svgX <= points[0].x)                   return { value: points[0].value, label: points[0].label };
  if (svgX >= points[points.length - 1].x)   return { value: points[points.length - 1].value, label: points[points.length - 1].label };
  return null;
}

export default function AnimatedLineChart({ data = [], color = '#3b82f6', title = '', compact = false }) {
  const H   = compact ? 200 : 280;
  const PAD = compact ? PAD_COMPACT : PAD_NORMAL;
  const CW  = W - PAD.left - PAD.right;
  const CH  = H - PAD.top  - PAD.bottom;

  const [hoverX,   setHoverX]   = useState(null);   // raw SVG x
  const [pathLen,  setPathLen]  = useState(0);
  const [animated, setAnimated] = useState(false);
  const pathRef = useRef(null);
  const svgRef  = useRef(null);

  const values = data.map(d => d.value);
  const rawMax = Math.max(...values, 0);
  const maxVal = rawMax === 0 ? 10 : rawMax;   // avoid flat-zero chart
  const minVal = 0;
  const range  = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * CW,
    y: PAD.top  + CH - ((d.value - minVal) / range) * CH,
    label: d.label,
    value: d.value,
  }));

  const linePath = buildPath(points);
  const areaPath = points.length >= 2
    ? `${linePath} L${points[points.length - 1].x},${PAD.top + CH} L${points[0].x},${PAD.top + CH} Z`
    : '';

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
      setAnimated(false);
      const id = setTimeout(() => setAnimated(true), 30);
      return () => clearTimeout(id);
    }
  }, [data]);

  // Y-axis ticks
  const yLines = Array.from({ length: 5 }, (_, i) => {
    const frac = i / 4;
    return { y: PAD.top + CH - frac * CH, val: Math.round(minVal + frac * range) };
  });

  // Mouse move — store raw SVG X, clamped to chart area
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || points.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (W / rect.width);
    setHoverX(Math.max(PAD.left, Math.min(PAD.left + CW, mx)));
  }, [points, PAD.left, CW]);

  // Compute the moving point on the actual bezier curve
  const movingPt = (hoverX !== null && pathLen > 0 && pathRef.current)
    ? getPointOnCurve(pathRef.current, hoverX, pathLen)
    : null;

  const interp = (hoverX !== null && points.length >= 2)
    ? interpValue(points, hoverX)
    : null;

  // Tooltip clamping
  const TW = 120, TH = 52;
  const ttX = movingPt ? Math.min(Math.max(movingPt.x - TW / 2, PAD.left + 2), W - PAD.right - TW - 2) : 0;
  const ttY = movingPt ? Math.max(movingPt.y - TH - 14, PAD.top + 2) : 0;

  const gradId = `alc-grad-${title.replace(/\s/g, '')}`;
  const clipId = `alc-clip-${title.replace(/\s/g, '')}`;

  const allZero = values.length > 0 && values.every(v => v === 0);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {allZero && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2, pointerEvents: 'none',
        }}>
          <div style={{ background: 'rgba(15,23,42,0.85)', borderRadius: 10, padding: '8px 18px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
            No data yet for this metric
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block', cursor: 'none' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverX(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top} width={CW} height={CH} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + number labels */}
        {yLines.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={t.y} x2={PAD.left + CW} y2={t.y}
              stroke="#1e3a5f" strokeWidth="1" strokeDasharray={i === 0 ? '' : '4 4'} />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {t.val > 999 ? `${(t.val / 1000).toFixed(1)}k` : t.val}
            </text>
          </g>
        ))}

        {/* X-axis date labels */}
        {points.map((p, i) => (
          compact ? (
            <text key={i} x={p.x} y={PAD.top + CH + 10} textAnchor="end" fontSize="10" fill="#64748b"
              transform={`rotate(-55, ${p.x}, ${PAD.top + CH + 10})`}>
              {p.label}
            </text>
          ) : (
            <text key={i} x={p.x} y={PAD.top + CH + 22} textAnchor="middle" fontSize="11" fill="#64748b">
              {p.label}
            </text>
          )
        ))}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />}

        {/* Animated line */}
        {linePath && (
          <path ref={pathRef} d={linePath} fill="none" stroke={color} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${clipId})`}
            strokeDasharray={pathLen || 9999}
            strokeDashoffset={animated ? 0 : (pathLen || 9999)}
            style={{ transition: animated ? 'stroke-dashoffset 1s ease' : 'none' }}
          />
        )}

        {/* Static data dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3}
            fill="#0f172a" stroke={color} strokeWidth="2" />
        ))}

        {/* ── Smooth moving hover ── */}
        {movingPt && interp && (
          <g style={{ pointerEvents: 'none' }}>
            {/* Vertical crosshair line */}
            <line
              x1={movingPt.x} y1={PAD.top}
              x2={movingPt.x} y2={PAD.top + CH}
              stroke={color} strokeWidth="1" strokeOpacity="0.5"
              strokeDasharray="4 3"
            />
            {/* Horizontal crosshair to Y axis */}
            <line
              x1={PAD.left} y1={movingPt.y}
              x2={movingPt.x} y2={movingPt.y}
              stroke={color} strokeWidth="1" strokeOpacity="0.3"
              strokeDasharray="4 3"
            />

            {/* Outer glow ring */}
            <circle cx={movingPt.x} cy={movingPt.y} r={10}
              fill={color} fillOpacity="0.15" />
            {/* Middle ring */}
            <circle cx={movingPt.x} cy={movingPt.y} r={6}
              fill={color} fillOpacity="0.35" />
            {/* Inner dot */}
            <circle cx={movingPt.x} cy={movingPt.y} r={4}
              fill="#fff" stroke={color} strokeWidth="2.5" />

            {/* Tooltip card */}
            <rect x={ttX} y={ttY} width={TW} height={TH}
              rx="8" fill="#0f172a"
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
            />
            <rect x={ttX} y={ttY} width={TW} height={3} rx="2" fill={color} />
            <text x={ttX + 10} y={ttY + 20} fontSize="11" fill="#94a3b8" fontWeight="600">
              {interp.label}
            </text>
            <text x={ttX + 10} y={ttY + 38} fontSize="14" fill={color} fontWeight="800">
              {interp.value.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
