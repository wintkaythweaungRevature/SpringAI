import React from 'react';
import PlatformIcon from './PlatformIcon';

/**
 * Native CSS-keyframe animation: 8 platform tiles drop from above with staggered
 * delays + slight rotation, then loop. Two render modes:
 *   - mode="section"     → framed self-contained block (default)
 *   - mode="background"  → absolute overlay; parent must be position:relative
 *
 * Shared between LandingSection (hero background) and any other surface that wants
 * the same ambient motion (e.g. the Content Calendar).
 */
export default function FallingPlatformsAnimation({ mode = 'section' }) {
  const isBackground = mode === 'background';
  const tiles = [
    { id: 'youtube',   label: 'YouTube',    color: '#FF0000', logo: 'youtube',   x: 12, delay: 0.0  },
    { id: 'tiktok',    label: 'TikTok',     color: '#010101', logo: 'tiktok',    x: 28, delay: 0.4  },
    { id: 'instagram', label: 'Instagram',  color: '#E1306C', logo: 'instagram', x: 44, delay: 0.15 },
    { id: 'facebook',  label: 'Facebook',   color: '#1877F2', logo: 'facebook',  x: 60, delay: 0.55 },
    { id: 'linkedin',  label: 'LinkedIn',   color: '#0A66C2', logo: 'linkedin',  x: 76, delay: 0.25 },
    { id: 'x',         label: 'X',          color: '#000000', logo: 'x',         x: 88, delay: 0.7  },
    { id: 'threads',   label: 'Threads',    color: '#101010', logo: 'threads',   x: 36, delay: 0.85 },
    { id: 'pinterest', label: 'Pinterest',  color: '#E60023', logo: 'pinterest', x: 68, delay: 1.0  },
  ];

  const Wrapper = isBackground ? 'div' : 'section';
  const wrapperProps = isBackground
    ? { className: 'ls-falling-bg', 'aria-hidden': true }
    : {
        className: 'ls-section ls-falling-demo',
        'aria-label': 'One video drops to every social platform',
        style: { paddingTop: 16, paddingBottom: 16 },
      };

  return (
    <Wrapper {...wrapperProps}>
      <style>{`
        /* Drop → squash on impact → bounce up → settle → fall off-stage.
           The ease-in keeps the descent realistic; the % keyframes hand-tune the
           bounce timing so each tile reads as a physical object hitting a floor. */
        @keyframes ls-fall {
          0%   { transform: translate(-50%, -160px) rotate(-90deg) scale(1, 1);    opacity: 0; }
          10%  { opacity: 1; }
          55%  { transform: translate(-50%, 60%)   rotate(0deg)   scale(1, 1);    opacity: 1; }
          /* impact — squash horizontally, vertical compress */
          62%  { transform: translate(-50%, 70%)   rotate(0deg)   scale(1.18, 0.78); opacity: 1; }
          /* bounce up a little */
          72%  { transform: translate(-50%, 38%)   rotate(2deg)   scale(0.95, 1.08); opacity: 1; }
          /* second smaller landing */
          82%  { transform: translate(-50%, 65%)   rotate(0deg)   scale(1.06, 0.92); opacity: 1; }
          90%  { transform: translate(-50%, 60%)   rotate(0deg)   scale(1, 1);    opacity: 1; }
          100% { transform: translate(-50%, 120%)  rotate(15deg)  scale(1, 1);    opacity: 0; }
        }
        .ls-falling-stage {
          position: relative;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          height: 360px;
          overflow: hidden;
          background: transparent;
        }
        .ls-falling-bg {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
          opacity: 0.55;
        }
        .ls-falling-bg .ls-falling-stage {
          width: 100%;
          max-width: none;
          height: 100%;
          margin: 0;
        }
        .ls-falling-tile {
          position: absolute;
          top: 0;
          width: 72px;
          height: 72px;
          border-radius: 16px;
          background: #ffffff;
          display: grid;
          place-items: center;
          will-change: transform, opacity;
          animation: ls-fall 4.2s ease-in infinite;
        }
        .ls-falling-caption {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
          font-size: 22px;
          color: #e7ecf5;
          white-space: nowrap;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .ls-falling-tile { animation: none; opacity: 0.85; transform: translate(-50%, 50%); }
        }
      `}</style>
      <div className="ls-falling-stage">
        {tiles.map((t) => (
          <div
            key={t.id}
            className="ls-falling-tile"
            style={{
              left: `${t.x}%`,
              border: `2px solid ${t.color}`,
              boxShadow: `0 0 24px ${t.color}66`,
              animationDelay: `${t.delay}s`,
            }}
            title={t.label}
          >
            <PlatformIcon platform={t} size={42} />
          </div>
        ))}
        {!isBackground && (
          <div className="ls-falling-caption">One video — eight platforms.</div>
        )}
      </div>
    </Wrapper>
  );
}
