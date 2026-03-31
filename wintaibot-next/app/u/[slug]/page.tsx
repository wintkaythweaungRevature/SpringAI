'use client';

import React, { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'https://api.wintaibot.com';

export default function PublicBioPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug;
  const [page, setPage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/bio/public/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setPage(d);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading...</div>;
  if (notFound || !page) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Page not found</div>;

  const color = String(page.themeColor || '#6366f1');
  const links = Array.isArray(page.links) ? page.links : [];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'start center', padding: 24, background: `linear-gradient(135deg, ${color}22 0%, ${color}08 100%)` }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, padding: 24, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        {page.avatarUrl ? <img src={String(page.avatarUrl)} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, marginBottom: 12 }} /> : null}
        <h1 style={{ margin: '0 0 8px', color: '#0f172a' }}>{String(page.displayName || slug)}</h1>
        {page.bio ? <p style={{ color: '#64748b', marginTop: 0 }}>{String(page.bio)}</p> : null}
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {links.map((link: Record<string, unknown>) => (
            <a key={String(link.id)} href={`${API}/u/${slug}/click/${String(link.id)}`} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '12px 16px', borderRadius: 10, color: '#fff', textDecoration: 'none', background: color }}>
              {String(link.title || 'Link')}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
