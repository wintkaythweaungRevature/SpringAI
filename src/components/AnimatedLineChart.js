import React, { useState, useRef, useEffect, useCallback } from 'react';

const W = 700;
const H = 280;
const PAD = { top: 20, right: 24, bottom: 36, left: 48 };
const CW = W - PAD.left - PAD.right;
const CH = H - PAD.top - PAD.bottom;

function buildPath(points) {
  if (points.length < 2) return points.length === 1 ? `M${points[0].x},${points[0].y}` : '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
  }
  return d;
}

export default function AnimatedLineChart({ data = [], color = '#3b82f6', title = '' }) {
  const [hoverIdx, setHoverIdx]     = useState(null);
  const [pathLen,  setPathLen]      = useState(0);
  const [animated, setAnimated]     = useState(false);
  const pathRef = useRef(null);
  const svgRef  = useRef(null);
  const animKey = useRef(0);

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range  = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * CW,
    y: PAD.top  + CH - ((d.value - minVal) / range) * CH,
    label: d.label,
    value: d.value,
  }));

  const linePath = buildPath(points);

  // Area path (close below the line)
  const areaPath = points.length >= 2
    ? `${linePath} L${points[points.length - 1].x},${PAD.top + CH} L${points[0].x},${PAD.top + CH} Z`
    : '';

  // Measure path length for draw animation
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
      setAnimated(false);
      animKey.current += 1;
      const id = setTimeout(() => setAnimated(true), 30);
      return () => clearTimeout(id);
    }
  }, [data]);

  // Y-axis grid lines
  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const frac = i / yTicks;
    const val  = minVal + frac * range;
    const y    = PAD.top + CH - frac * CH;
    return { y, val: Math.round(val) };
  });

  // Hover handling — find nearest point by x
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (W / rect.width);
    let nearest = 0;
    let minDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mx);
      if (dist < minDist) { minDist = dist; nearest = i; }
    });
    setHoverIdx(nearest);
  }, [points]);

  const hoverPt = hoverIdx !== null ? points[hoverIdx] : null;

  // Tooltip clamping so it doesn't overflow
  const tooltipX = hoverPt
    ? Math.min(Math.max(hoverPt.x - 50, PAD.left), W - PAD.right - 110)
    : 0;
  const tooltipY = hoverPt
    ? Math.max(hoverPt.y - 70, PAD.top)
    : 0;

  const gradId  = `alc-grad-${title.replace(/\s/g, '')}`;
  const clipId  = `alc-clip-${title.replace(/\s/g, '')}`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top} width={CW} height={CH} />
          </clipPath>
          <style>{`
            @keyframes alc-draw-${title.replace(/\s/g, '')} {
              from { stroke-dashoffset: ${pathLen}; }
              to   { stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yLines.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={t.y} x2={PAD.left + CW} y2={t.y}
              stroke="#1e3a5f" strokeWidth="1"
              strokeDasharray={i === 0 ? '' : '4 4'}
            />
            <text
              x={PAD.left - 8} y={t.y + 4}
              textAnchor="end" fontSize="11" fill="#475569"
            >
              {t.val > 999 ? `${(t.val / 1000).toFixed(1)}k` : t.val}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x} y={PAD.top + CH + 22}
            textAnchor="middle" fontSize="11" fill="#475569"
          >
            {p.label}
          </text>
        ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        )}

        {/* Animated line */}
        {linePath && (
          <path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
            strokeDasharray={pathLen || 9999}
            strokeDashoffset={animated ? 0 : (pathLen || 9999)}
            style={{
              transition: animated ? `stroke-dashoffset 1s ease` : 'none',
            }}
          />
        )}

        {/* Data dots (always visible, small) */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={hoverIdx === i ? 5 : 3}
            fill={hoverIdx === i ? color : '#0f172a'}
            stroke={color}
            strokeWidth="2"
            style={{ transition: 'r 0.1s' }}
          />
        ))}

        {/* Hover crosshair */}
        {hoverPt && (
          <line
            x1={hoverPt.x} y1={PAD.top}
            x2={hoverPt.x} y2={PAD.top + CH}
            stroke="#334155" strokeWidth="1"
          />
        )}

        {/* Tooltip */}
        {hoverPt && (
          <g>
            <rect
              x={tooltipX} y={tooltipY}
              width="110" height="46"
              rx="6" fill="#fff"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.25))"
            />
            <text x={tooltipX + 10} y={tooltipY + 17} fontSize="12" fill="#334155" fontWeight="600">
              {hoverPt.label}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 35} fontSize="13" fill={color} fontWeight="700">
              value : {hoverPt.value.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
