import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API = 'https://api.wintaibot.com';

export default function PublicBioPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/bio/public/${slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setPage(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
    </div>
  );

  if (notFound || !page) return (
    <div style={s.centered}>
      <h2 style={{ color: '#1e293b', marginBottom: 8 }}>Page not found</h2>
      <p style={{ color: '#94a3b8' }}>No bio page at <strong>/u/{slug}</strong></p>
    </div>
  );

  const color = page.themeColor || '#6366f1';

  return (
    <div style={{ ...s.bg, background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)` }}>
      <div style={s.card}>
        {page.avatarUrl && (
          <img src={page.avatarUrl} alt="avatar"
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
                     border: `3px solid ${color}`, marginBottom: 16 }} />
        )}
        <h1 style={{ ...s.name }}>{page.displayName || slug}</h1>
        {page.bio && <p style={s.bio}>{page.bio}</p>}

        <div style={s.links}>
          {(page.links || []).map(link => (
            <a
              key={link.id}
              href={`${API}/u/${slug}/click/${link.id}`}
              target="_blank"
              rel="noreferrer"
              style={{ ...s.linkBtn, background: color }}
            >
              {link.title}
            </a>
          ))}
        </div>

        <p style={s.footer}>
          Made with <a href="https://www.wintaibot.com" style={{ color, textDecoration: 'none', fontWeight: 600 }}>Wintaibot</a>
        </p>
      </div>
    </div>
  );
}

const s = {
  bg: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '48px 16px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    padding: '40px 32px',
    maxWidth: 480, width: '100%',
    textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  name: { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' },
  bio:  { fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' },
  links: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  linkBtn: {
    display: 'block', width: '100%', padding: '14px 24px',
    borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 15,
    textDecoration: 'none', transition: 'opacity 0.15s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  footer: { marginTop: 32, fontSize: 12, color: '#cbd5e1' },
  centered: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "-apple-system, sans-serif",
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1',
    animation: 'spin 0.8s linear infinite',
  },
};
