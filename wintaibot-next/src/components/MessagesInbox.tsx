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
  postCaption?: string;
};

const CANONICAL_INBOX_PLATFORMS = new Set(['instagram', 'facebook', 'youtube', 'linkedin', 'tiktok', 'x']);

function normalizeInboxPlatform<T extends { platform?: string; source?: string }>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  const raw = item.platform;
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim().toLowerCase();
    const aliases: Record<string, string> = {
      ig: 'instagram',
      insta: 'instagram',
      fb: 'facebook',
      yt: 'youtube',
      li: 'linkedin',
      tt: 'tiktok',
      twitter: 'x',
    };
    const resolved = aliases[s] || s;
    if (CANONICAL_INBOX_PLATFORMS.has(resolved)) {
      return { ...item, platform: resolved };
    }
  }
  const src = String(item.source || '').toLowerCase();
  const inferred =
    src.includes('instagram') ? 'instagram'
      : (src.includes('facebook') || src.includes('messenger')) ? 'facebook'
        : src.includes('youtube') ? 'youtube'
          : src.includes('linkedin') ? 'linkedin'
            : src.includes('tiktok') ? 'tiktok'
              : (src.includes('x_') || src.includes('twitter')) ? 'x'
                : '';
  if (inferred) return { ...item, platform: inferred };
  return item;
}

type InboxCoalesceRow = Record<string, unknown> & {
  comments?: unknown;
  type?: string;
  source?: string;
  platform?: string;
  id?: string;
  snippet?: string;
  message?: string;
  text?: string;
};

function coalesceMessagesApiPayload(data: unknown): { conversations: InboxCoalesceRow[]; comments: InboxCoalesceRow[] } {
  const empty = { conversations: [] as InboxCoalesceRow[], comments: [] as InboxCoalesceRow[] };
  if (!data || typeof data !== 'object') return empty;

  const top = data as Record<string, unknown>;
  const pl =
    top.payload != null && typeof top.payload === 'object' && !Array.isArray(top.payload)
      ? (top.payload as Record<string, unknown>)
      : null;

  let conversations = (top.conversations ?? top.directMessages ?? pl?.conversations ?? pl?.directMessages) as unknown;
  let comments = (top.comments ?? top.pageComments ?? pl?.comments ?? pl?.pageComments) as unknown;

  const convLen = Array.isArray(conversations) ? conversations.length : 0;
  const comLen = Array.isArray(comments) ? comments.length : 0;

  if (convLen > 0 || comLen > 0) {
    return {
      conversations: Array.isArray(conversations) ? (conversations as InboxCoalesceRow[]) : [],
      comments: Array.isArray(comments) ? (comments as InboxCoalesceRow[]) : [],
    };
  }

  const unified = (top.messages ?? top.items ?? top.inbox ?? top.threads
    ?? pl?.messages ?? pl?.items ?? pl?.inbox ?? pl?.threads) as unknown;
  if (!Array.isArray(unified)) return empty;

  const convs: InboxCoalesceRow[] = [];
  const comms: InboxCoalesceRow[] = [];

  for (const row of unified as InboxCoalesceRow[]) {
    if (!row || typeof row !== 'object') continue;

    const nested = row.comments;
    if (Array.isArray(nested) && nested.length > 0) {
      const parentPlatform = row.platform;
      const parentId = row.id;
      const parentCaption = row.snippet || row.message || row.text || '';
      for (const c of nested) {
        if (!c || typeof c !== 'object') continue;
        const cc = c as InboxCoalesceRow;
        comms.push({
          ...cc,
          platform: (cc.platform as string | undefined) || parentPlatform,
          source:
            cc.source
            || (String(parentPlatform || '').toLowerCase() === 'instagram'
              ? 'instagram_comment'
              : 'facebook_comment'),
          postId: cc.postId != null ? cc.postId : parentId,
          postCaption: cc.postCaption != null ? cc.postCaption : parentCaption,
        });
      }
    }

    const type = String(row.type || '').toLowerCase();
    const src = String(row.source || '').toLowerCase();
    const looksDm =
      type === 'message'
      || type === 'dm'
      || src.includes('messenger')
      || src.includes('_dm');

    if (looksDm) {
      const { comments: _omit, ...asConv } = row;
      convs.push(asConv);
    } else if (
      (type === 'comment' || src.includes('comment'))
      && !(Array.isArray(nested) && nested.length > 0)
    ) {
      comms.push(row);
    } else if (!looksDm && row.text != null && row.id != null && !nested) {
      comms.push(row);
    }
  }

  return { conversations: convs, comments: comms };
}

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

function commentKindLabel(source?: string, platform?: string) {
  const s = String(source || '').toLowerCase();
  if (s.includes('instagram')) return 'Instagram Comment';
  if (s.includes('facebook') || s.includes('messenger')) return 'Facebook Comment';
  const p = platform && PLATFORM_META[platform]?.label;
  return p ? `${p} Comment` : 'Comment';
}

function initials(name?: string) {
  const n = String(name || 'U').trim() || 'U';
  return n.charAt(0).toUpperCase();
}

function truncate(s: string, max: number) {
  const t = String(s || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export type MessagesInboxProps = {
  onOpenVideoPublisher?: () => void;
  onOpenConnectedAccounts?: () => void;
  onOpenAutoReply?: () => void;
};

export default function MessagesInbox({
  onOpenConnectedAccounts,
  onOpenAutoReply,
}: MessagesInboxProps) {
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
      const payload = (await res.json()) as Record<string, unknown>;
      const { conversations: c0, comments: cm0 } = coalesceMessagesApiPayload(payload);
      setData({
        conversations: c0.map((c) => normalizeInboxPlatform(c as Conversation)),
        comments: cm0.map((c) => normalizeInboxPlatform(c as CommentItem)),
        totalUnread: Number(
          payload.totalUnread
            ?? (payload.payload as { totalUnread?: number } | undefined)?.totalUnread
            ?? 0,
        ),
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

  const commentCountsByPlatform = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of data.comments) {
      const pid = c.platform || '';
      m[pid] = (m[pid] || 0) + 1;
    }
    return m;
  }, [data.comments]);

  const showComments = typeTab !== 'messages';
  const showMessages = typeTab !== 'comments';

  return (
    <div style={ui.root}>
      <div style={ui.topBar}>
        <span style={{ color: '#64748b', fontSize: 13 }}>
          New since last visit
          {data.totalUnread != null && data.totalUnread > 0 ? (
            <span style={{ marginLeft: 8, color: '#0f172a', fontWeight: 700 }}>({data.totalUnread})</span>
          ) : null}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            style={ui.ghostBtn}
            onClick={() => {
              setPlatformTab('all');
              setTypeTab('all');
              load();
            }}
          >
            Show all
          </button>
          <button type="button" style={ui.primaryOutlineBtn} onClick={load} disabled={loading}>
            <span style={{ marginRight: 6 }}>↻</span>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={ui.card}>
        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#b91c1c', fontSize: 13, borderBottom: '1px solid #fecaca' }}>
            ⚠ {error}
          </div>
        )}

        <div style={ui.inner}>
          {/* NETWORKS */}
          <aside style={ui.networksCol} aria-label="Filter by network">
            <div style={ui.colLabel}>Networks</div>
            <button
              type="button"
              title="All networks"
              style={{ ...ui.netBtn, ...(platformTab === 'all' ? ui.netBtnActive : {}) }}
              onClick={() => setPlatformTab('all')}
            >
              <span style={{ fontSize: 15, fontWeight: 800 }}>All</span>
            </button>
            {Object.values(PLATFORM_META).map((p) => {
              const n = commentCountsByPlatform[p.id] || 0;
              const active = platformTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.label}
                  style={{ ...ui.netBtn, ...(active ? ui.netBtnActive : {}) }}
                  onClick={() => setPlatformTab(active ? 'all' : p.id)}
                >
                  <span style={{ position: 'relative', display: 'inline-flex' }}>
                    <PlatformIcon platform={{ ...p, color: active ? '#fff' : p.color }} size={22} />
                    {n > 0 && (
                      <span style={ui.badge}>{n > 99 ? '99+' : n}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* VIEW */}
          <aside style={ui.viewCol} aria-label="Inbox view">
            <div style={ui.colLabel}>View</div>
            <button
              type="button"
              style={{ ...ui.viewPill, ...(typeTab === 'all' ? ui.viewPillOn : {}) }}
              onClick={() => setTypeTab('all')}
            >
              All
            </button>
            <button
              type="button"
              style={{ ...ui.viewPill, ...(typeTab === 'comments' ? ui.viewPillOn : {}) }}
              onClick={() => setTypeTab('comments')}
            >
              Comments
              <span style={ui.viewCount}>
                ({data.comments.length})
              </span>
            </button>
            <button
              type="button"
              style={{ ...ui.viewPill, ...(typeTab === 'messages' ? ui.viewPillOn : {}) }}
              onClick={() => setTypeTab('messages')}
            >
              Messages
              <span style={ui.viewCount}>
                ({data.conversations.length})
              </span>
            </button>

            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
              <button type="button" style={ui.smallAction} onClick={onOpenConnectedAccounts}>
                Accounts
              </button>
              <button type="button" style={ui.smallAction} onClick={onOpenAutoReply}>
                Auto
              </button>
            </div>
          </aside>

          {/* Feed */}
          <section style={ui.feedSection}>
            {showComments && (
              <>
                <header style={ui.feedHeader}>
                  COMMENTS ({filteredComments.length})
                </header>
                <div style={ui.feedScroll}>
                  {loading ? (
                    <div style={ui.mutedCenter}>Loading…</div>
                  ) : filteredComments.length === 0 ? (
                    <div style={ui.mutedCenter}>No comments in this view.</div>
                  ) : (
                    filteredComments.map((item) => {
                      const p = PLATFORM_META[item.platform] || PLATFORM_META.instagram;
                      const cap = item.postCaption ? truncate(item.postCaption, 72) : '';
                      return (
                        <article key={item.id} style={ui.feedRow}>
                          <div style={ui.avatar}>{initials(item.from)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={ui.rowTop}>
                              <strong style={ui.name}>{item.from || 'Unknown'}</strong>
                              <span style={ui.time}>{timeAgo(item.timestamp)}</span>
                            </div>
                            <p style={ui.commentText}>{item.text || '(no text)'}</p>
                            {cap ? (
                              <p style={ui.onLine}>
                                On: {cap}
                              </p>
                            ) : null}
                            <div style={ui.rowBottom}>
                              <span style={ui.metaLeft}>
                                <PlatformIcon platform={p} size={14} />
                                <span style={{ marginLeft: 6 }}>{commentKindLabel(item.source, item.platform)}</span>
                              </span>
                              <button type="button" style={ui.replyLink}>
                                Reply
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {showMessages && !showComments && (
              <>
                <header style={ui.feedHeader}>
                  MESSAGES ({filteredConvs.length})
                </header>
                <div style={ui.feedScroll}>
                  {loading ? (
                    <div style={ui.mutedCenter}>Loading…</div>
                  ) : filteredConvs.length === 0 ? (
                    <div style={ui.mutedCenter}>No direct messages in this view.</div>
                  ) : (
                    filteredConvs.map((item) => {
                      const p = PLATFORM_META[item.platform] || PLATFORM_META.instagram;
                      return (
                        <article key={item.id} style={ui.feedRow}>
                          <div style={ui.avatar}>{initials(item.from)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={ui.rowTop}>
                              <strong style={ui.name}>{item.from || 'Unknown'}</strong>
                              <span style={ui.time}>{timeAgo(item.updatedTime || item.timestamp)}</span>
                            </div>
                            <p style={ui.commentText}>{item.snippet || item.text || '(no preview)'}</p>
                            <div style={ui.rowBottom}>
                              <span style={ui.metaLeft}>
                                <PlatformIcon platform={p} size={14} />
                                <span style={{ marginLeft: 6 }}>{p.label} · Message</span>
                              </span>
                              <button type="button" style={ui.replyLink}>
                                Open
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {typeTab === 'all' && showMessages && (
              <>
                <header style={{ ...ui.feedHeader, paddingTop: showComments ? 8 : undefined, borderTop: showComments ? '1px solid #f1f5f9' : undefined }}>
                  MESSAGES ({filteredConvs.length})
                </header>
                <div style={ui.feedScroll}>
                  {loading ? null : filteredConvs.length === 0 ? (
                    <div style={{ ...ui.mutedCenter, borderTop: 'none' }}>No direct messages.</div>
                  ) : (
                    filteredConvs.map((item) => {
                      const p = PLATFORM_META[item.platform] || PLATFORM_META.instagram;
                      return (
                        <article key={`m-${item.id}`} style={ui.feedRow}>
                          <div style={ui.avatar}>{initials(item.from)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={ui.rowTop}>
                              <strong style={ui.name}>{item.from || 'Unknown'}</strong>
                              <span style={ui.time}>{timeAgo(item.updatedTime || item.timestamp)}</span>
                            </div>
                            <p style={ui.commentText}>{item.snippet || item.text || '(no preview)'}</p>
                            <div style={ui.rowBottom}>
                              <span style={ui.metaLeft}>
                                <PlatformIcon platform={p} size={14} />
                                <span style={{ marginLeft: 6 }}>{p.label}</span>
                              </span>
                              <button type="button" style={ui.replyLink}>
                                Open
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const ui: Record<string, React.CSSProperties> = {
  root: { width: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10,
  },
  ghostBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primaryOutlineBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    color: '#0f172a',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e8ecf1',
    boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
    overflow: 'hidden',
  },
  inner: { display: 'flex', minHeight: 420, alignItems: 'stretch' },
  colLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: '#94a3b8',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  networksCol: {
    width: 92,
    flexShrink: 0,
    borderRight: '1px solid #f1f5f9',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    background: '#fafbfc',
  },
  netBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  netBtnActive: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
    background: '#f5f3ff',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    padding: '0 4px',
    borderRadius: 99,
    background: '#ef4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  viewCol: {
    width: 168,
    flexShrink: 0,
    borderRight: '1px solid #f1f5f9',
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: '#fff',
  },
  viewPill: {
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
  },
  viewPillOn: {
    background: '#0f172a',
    color: '#fff',
    borderColor: '#0f172a',
  },
  viewCount: { marginLeft: 6, fontWeight: 700, opacity: 0.85 },
  smallAction: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
  },
  feedSection: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  feedHeader: {
    padding: '16px 20px 10px',
    fontSize: 17,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  feedScroll: { flex: 1, overflowY: 'auto', maxHeight: 560 },
  feedRow: {
    display: 'flex',
    gap: 14,
    padding: '14px 20px',
    borderTop: '1px solid #f1f5f9',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
    color: '#1e3a8a',
    fontWeight: 800,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  name: { fontSize: 14, color: '#0f172a' },
  time: { fontSize: 12, color: '#94a3b8', flexShrink: 0 },
  commentText: { margin: '6px 0 0', fontSize: 14, color: '#334155', lineHeight: 1.5 },
  onLine: { margin: '6px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.4 },
  rowBottom: {
    marginTop: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaLeft: { display: 'inline-flex', alignItems: 'center', fontSize: 12, color: '#64748b' },
  replyLink: {
    border: 'none',
    background: 'none',
    padding: 0,
    fontSize: 13,
    fontWeight: 700,
    color: '#2563eb',
    cursor: 'pointer',
  },
  mutedCenter: { padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 14 },
};
