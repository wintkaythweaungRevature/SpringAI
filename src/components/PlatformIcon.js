import React, { useState } from 'react';

/** Official LinkedIn "in" logo */
export function LinkedInLogo({ size = 24, color = '#0A66C2', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** Instagram gradient camera logo */
function InstagramLogo({ size = 24, style = {} }) {
  const id = 'ig_grad_' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <defs>
        <radialGradient id={id} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <path fill={`url(#${id})`} d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.049 1.265.064 1.645.064 4.849 0 3.205-.015 3.585-.074 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.072-4.85.072-3.204 0-3.584-.014-4.849-.072-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.072-1.644-.072-4.849 0-3.204.013-3.583.072-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.071 4.849-.071zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/** Facebook "f" logo */
function FacebookLogo({ size = 24, color = '#1877F2', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** YouTube play button logo */
function YouTubeLogo({ size = 24, color = '#FF0000', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}

/** TikTok logo */
function TikTokLogo({ size = 24, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <path fill="#010101" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      <path fill="#EE1D52" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" opacity="0" />
    </svg>
  );
}

/** X (Twitter) logo */
function XLogo({ size = 24, color = '#000000', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ minWidth: size, minHeight: size, display: 'block', ...style }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Map of id → inline SVG component (no CDN needed) */
const INLINE_LOGOS = {
  linkedin:  (size, color, style) => <LinkedInLogo  size={size} color={color} style={style} />,
  instagram: (size, _color, style) => <InstagramLogo size={size} style={style} />,
  facebook:  (size, color, style) => <FacebookLogo  size={size} color={color} style={style} />,
  youtube:   (size, color, style) => <YouTubeLogo   size={size} color={color} style={style} />,
  tiktok:    (size, _color, style) => <TikTokLogo   size={size} style={style} />,
  x:         (size, color, style) => <XLogo         size={size} color={color} style={style} />,
  twitter:   (size, color, style) => <XLogo         size={size} color={color} style={style} />,
};

/** Platform logo — uses inline SVG for known platforms, CDN fallback for others */
export default function PlatformIcon({ platform, size = 24, style = {} }) {
  const [cdnFailed, setCdnFailed] = useState(false);

  if (!platform) return null;

  const id = (platform.id || '').toLowerCase();
  const color = platform.color || '#64748b';

  if (INLINE_LOGOS[id]) {
    return INLINE_LOGOS[id](size, color, style);
  }

  const logo = platform.logo || id;
  const hasValidCdnTarget = logo && logo !== 'all' && logo !== 'globe' && logo.length > 1;

  if (cdnFailed || !hasValidCdnTarget) {
    return (
      <span aria-hidden style={{ fontSize: size, lineHeight: '1', display: 'block', ...style }}>
        {platform.emoji || ''}
      </span>
    );
  }

  const cdnUrl = `https://cdn.simpleicons.org/${logo}/${color.replace('#', '')}`;
  return (
    <img
      src={cdnUrl}
      alt=""
      aria-hidden
      style={{ width: size, height: size, minWidth: size, minHeight: size, objectFit: 'contain', display: 'block', ...style }}
      onError={() => setCdnFailed(true)}
    />
  );
}
