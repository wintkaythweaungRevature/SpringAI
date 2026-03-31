'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORM_META: Record<string, { id: string; label: string; color: string; logo: string; emoji: string }> = {
  instagram: { id: 'instagram', label: 'Instagram', color: '#E1306C', logo: 'instagram', emoji: '📷' },
  facebook: { id: 'facebook', label: 'Facebook', color: '#1877F2', logo: 'facebook', emoji: '📘' },
  youtube: { id: 'youtube', label: 'YouTube', color: '#FF0000', logo: 'youtube', emoji: '▶️' },
  linkedin: { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', logo: 'linkedin', emoji: '💼' },
  tiktok: { id: 'tiktok', label: 'TikTok', color: '#010101', logo: 'tiktok', emoji: '🎵' },
  x: { id: 'x', label: 'X', color: '#000000', logo: 'x', emoji: '𝕏' },
};

type Conversation = {
  id: string;
  platform: string;
  from?: string;
  snippet?: string;
  text?: string;
  source?: string;
  updatedTime?: string;
  timestamp?: string;
  unread?: number;
};

type CommentItem = {
  id: string;
  platform: string;
  from?: string;
  text?: string;
  source?: string;
  timestamp?: string;
};

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MessagesInbox() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platformTab, setPlatformTab] = useState('all');
  const [typeTab, setTypeTab] = useState<'all' | 'messages' | 'comments'>('all');
  const [data, setData] = useState<{ conversations: Conversation[]; comments: CommentItem[]; totalUnread?: number }>({
    conversations: [],
    comments: [],
  });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${base}/api/analytics/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const payload = await res.json();
      setData({
        conversations: Array.isArray(payload?.conversations) ? payload.conversations : [],
        comments: Array.isArray(payload?.comments) ? payload.comments : [],
        totalUnread: Number(payload?.totalUnread || 0),
      });
    } catch (e) {
      setError((e as Error).message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredConvs = useMemo(() => {
    const source = platformTab === 'all' ? data.conversations : data.conversations.filter((x) => x.platform === platformTab);
    return typeTab === 'comments' ? [] : source;
  }, [data.conversations, platformTab, typeTab]);

  const filteredComments = useMemo(() => {
    const source = platformTab === 'all' ? data.comments : data.comments.filter((x) => x.platform === platformTab);
    return typeTab === 'messages' ? [] : source;
  }, [data.comments, platformTab, typeTab]);

  return (
    <div style={{ width: '100%', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
          Comments and direct messages from connected accounts in one place.
        </p>
        <button type="button" onClick={load} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <button type="button" onClick={() => setPlatformTab('all')} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: platformTab === 'all' ? '#0f172a' : '#fff', color: platformTab === 'all' ? '#fff' : '#334155' }}>All</button>
        {Object.values(PLATFORM_META).map((p) => (
          <button key={p.id} type="button" onClick={() => setPlatformTab(p.id)} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: platformTab === p.id ? '#0f172a' : '#fff', color: platformTab === p.id ? '#fff' : '#334155', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <PlatformIcon platform={{ ...p, color: platformTab === p.id ? '#fff' : p.color }} size={14} />
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button type="button" onClick={() => setTypeTab('all')} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: typeTab === 'all' ? '#0f172a' : '#fff', color: typeTab === 'all' ? '#fff' : '#334155' }}>All</button>
        <button type="button" onClick={() => setTypeTab('messages')} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: typeTab === 'messages' ? '#0f172a' : '#fff', color: typeTab === 'messages' ? '#fff' : '#334155' }}>Messages</button>
        <button type="button" onClick={() => setTypeTab('comments')} style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: typeTab === 'comments' ? '#0f172a' : '#fff', color: typeTab === 'comments' ? '#fff' : '#334155' }}>Comments</button>
      </div>

      {error && <div style={{ marginBottom: 12, color: '#b91c1c', fontSize: 13 }}>⚠ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>
            Direct Messages ({filteredConvs.length})
          </div>
          {filteredConvs.length === 0 ? (
            <div style={{ padding: 14, fontSize: 13, color: '#94a3b8' }}>No direct messages.</div>
          ) : (
            filteredConvs.map((item) => {
              const p = PLATFORM_META[item.platform] || PLATFORM_META.instagram;
              return (
                <div key={item.id} style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: 13 }}>{item.from || 'Unknown'}</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(item.updatedTime || item.timestamp)}</span>
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: '#475569' }}>{item.snippet || item.text || '(no preview)'}</div>
                  <div style={{ marginTop: 5, fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <PlatformIcon platform={p} size={12} />
                    {p.label}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>
            Comments ({filteredComments.length})
          </div>
          {filteredComments.length === 0 ? (
            <div style={{ padding: 14, fontSize: 13, color: '#94a3b8' }}>No comments.</div>
          ) : (
            filteredComments.map((item) => {
              const p = PLATFORM_META[item.platform] || PLATFORM_META.instagram;
              return (
                <div key={item.id} style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong style={{ fontSize: 13 }}>{item.from || 'Unknown'}</strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(item.timestamp)}</span>
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: '#475569' }}>{item.text || '(no text)'}</div>
                  <div style={{ marginTop: 5, fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <PlatformIcon platform={p} size={12} />
                    {p.label}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
