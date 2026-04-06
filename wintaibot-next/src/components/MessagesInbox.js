'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isPlatformDisabled } from '@/config/disabledPlatforms';
import PlatformIcon from './PlatformIcon';

const PLATFORM_META = {
  instagram: { id: 'instagram', label: 'Instagram', color: '#E1306C', logo: 'instagram' },
  facebook:  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', logo: 'facebook'  },
  youtube:   { id: 'youtube',   label: 'YouTube',   color: '#FF0000', logo: 'youtube'   },
  linkedin:  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', logo: 'linkedin'  },
  tiktok:    { id: 'tiktok',    label: 'TikTok',    color: '#010101', logo: 'tiktok'    },
  x:         { id: 'x',         label: 'X',         color: '#000000', logo: 'x'         },
};

const SOURCE_LABELS = {
  instagram_dm:       { label: 'Instagram DM',       icon: '💬' },
  instagram_comment:  { label: 'Instagram Comment',  icon: '💭' },
  facebook_messenger: { label: 'Facebook Messenger', icon: '📨' },
  facebook_comment:   { label: 'Facebook Comment',   icon: '💬' },
  youtube_comment:    { label: 'YouTube Comment',    icon: '▶️' },
  linkedin_message:   { label: 'LinkedIn Message',   icon: '💼' },
  linkedin_comment:   { label: 'LinkedIn Comment',   icon: '💬' },
  tiktok_comment:     { label: 'TikTok Comment',     icon: '🎵' },
  x_mention:          { label: 'X Mention',          icon: '🐦' },
  x_reply:            { label: 'X Reply',            icon: '🐦' },
};

// Which type-tabs each platform supports
const PLATFORM_TYPES = {
  all:       ['all', 'messages', 'comments'],
  instagram: ['comments'],                      // Instagram DMs require Meta App Review — comments only
  facebook:  ['all', 'messages', 'comments'],
  youtube:   ['comments'],                      // YouTube has no DM API
  linkedin:  ['all', 'messages', 'comments'],
  tiktok:    ['comments'],                      // TikTok comments only
  x:         ['comments'],                      // X/Twitter — replies to tweets treated as comments
};

const TYPE_TAB_LABELS = { all: 'All', messages: 'Messages', comments: 'Comments' };

/** API may return numeric or string ids — keep selection/detail in sync. */
function sameInboxId(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

const CANONICAL_INBOX_PLATFORMS = new Set(['instagram', 'facebook', 'youtube', 'linkedin', 'tiktok', 'x']);

/** Map `/api/social/status` `connected` ids to inbox sidebar platform keys. */
function normalizeSocialStatusPlatformId(raw) {
  if (raw == null) return null;
  const s = String(raw).toLowerCase().trim();
  if (s === 'twitter') return 'x';
  if (CANONICAL_INBOX_PLATFORMS.has(s)) return s;
  return null;
}

/** API may use mixed casing or omit platform; infer from source when needed so filters match. */
function normalizeInboxPlatform(item) {
  if (!item || typeof item !== 'object') return item;
  const raw = item.platform;
  if (typeof raw === 'string' && raw.trim()) {
    const s = raw.trim().toLowerCase();
    const aliases = {
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

/**
 * Some backends return { messages: [...] } where each row may be a DM plus nested `comments`.
 * The inbox UI expects top-level `conversations` and `comments` arrays.
 */
function coalesceMessagesApiPayload(data) {
  const empty = { conversations: [], comments: [] };
  if (!data || typeof data !== 'object') return empty;

  const pl =
    data.payload != null && typeof data.payload === 'object' && !Array.isArray(data.payload)
      ? data.payload
      : null;

  let conversations =
    data.conversations ??
    data.directMessages ??
    pl?.conversations ??
    pl?.directMessages;
  let comments =
    data.comments ??
    data.pageComments ??
    pl?.comments ??
    pl?.pageComments;

  const convLen = Array.isArray(conversations) ? conversations.length : 0;
  const comLen = Array.isArray(comments) ? comments.length : 0;

  if (convLen > 0 || comLen > 0) {
    return {
      conversations: Array.isArray(conversations) ? conversations : [],
      comments: Array.isArray(comments) ? comments : [],
    };
  }

  const unified =
    data.messages ??
    data.items ??
    data.inbox ??
    data.threads ??
    pl?.messages ??
    pl?.items ??
    pl?.inbox ??
    pl?.threads;
  if (!Array.isArray(unified)) return empty;

  const convs = [];
  const comms = [];

  for (const row of unified) {
    if (!row || typeof row !== 'object') continue;

    const nested = row.comments;
    if (Array.isArray(nested) && nested.length > 0) {
      const parentPlatform = row.platform;
      const parentId = row.id;
      const parentCaption = row.snippet || row.message || row.text || '';
      for (const c of nested) {
        if (!c || typeof c !== 'object') continue;
        comms.push({
          ...c,
          platform: c.platform || parentPlatform,
          source:
            c.source
            || (String(parentPlatform || '').toLowerCase() === 'instagram'
              ? 'instagram_comment'
              : 'facebook_comment'),
          postId: c.postId != null ? c.postId : parentId,
          postCaption: c.postCaption != null ? c.postCaption : parentCaption,
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

const META_BUSINESS_INBOX_URL = 'https://business.facebook.com/latest/inbox';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Normalize API reply objects (or strings) for display. */
function normalizeReply(r) {
  if (r == null) return null;
  if (typeof r === 'string') return { text: r, time: null, fromMe: false, from: null };
  return {
    text: r.text || r.snippet || r.message || '',
    time: r.time || r.timestamp || r.updatedTime || null,
    fromMe: Boolean(r.fromMe ?? r.isFromPage ?? r.is_from_page ?? r.sender === 'page'),
    from: r.from || r.author || null,
  };
}

/** Normalize DM thread messages from API. */
function normalizeThreadMessage(m) {
  if (m == null) return null;
  if (typeof m === 'string') return { text: m, time: null, fromMe: false, from: null };
  return {
    text: m.text || m.snippet || m.message || '',
    time: m.timestamp || m.updatedTime || m.time || null,
    fromMe: Boolean(m.fromMe ?? m.is_from_page ?? m.isFromPage),
    from: m.from || m.sender || null,
  };
}

function mergedCommentReplies(item, localExtra) {
  const api = Array.isArray(item.replies) ? item.replies.map(normalizeReply).filter(Boolean) : [];
  const local = localExtra[item.id] || [];
  return [...api, ...local];
}

/** Compact platform toggle for left inbox sidebar (logo + optional count badge). */
function SidebarPlatformButton({ active, onClick, title, countBadge, unreadBadge, accent, children }) {
  const showCount = countBadge != null && countBadge > 0;
  const showUnread = unreadBadge != null && unreadBadge > 0;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        borderRadius: 12,
        border: active ? `2px solid ${accent || '#0f172a'}` : '1px solid #e2e8f0',
        background: active ? (accent ? `${accent}20` : '#e2e8f0') : '#f8fafc',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        flexShrink: 0,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {showUnread && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            borderRadius: 8,
            background: '#dc2626',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          {unreadBadge > 99 ? '99+' : unreadBadge}
        </span>
      )}
      {showCount && !showUnread && (
        <span
          style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            borderRadius: 8,
            background: '#0f172a',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          {countBadge > 99 ? '99+' : countBadge}
        </span>
      )}
      {children}
    </button>
  );
}

/** Inbox type filter: All / Comments / Messages (sidebar). */
function SidebarTypeButton({ label, active, disabled, onClick, badge, title }) {
  return (
    <button
      type="button"
      title={title || (disabled ? 'Not available for this network' : undefined)}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '9px 8px',
        borderRadius: 10,
        border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
        background: active ? '#0f172a' : '#fff',
        color: active ? '#fff' : disabled ? '#94a3b8' : '#334155',
        fontWeight: active ? 600 : 500,
        fontSize: 12,
        lineHeight: 1.2,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      }}
    >
      <span style={{ display: 'block' }}>{label}</span>
      {badge > 0 && (
        <span
          style={{
            display: 'inline-block',
            marginTop: 4,
            fontSize: 10,
            fontWeight: 700,
            color: active ? '#fecaca' : '#dc2626',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function RefreshIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyInboxIllustration() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ margin: '0 auto 14px', display: 'block', color: '#94a3b8' }}>
      <path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M4 8l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Space/Enter on list rows must not steal keys from inputs inside the row (e.g. reply textarea). */
function isKeyboardEventFromEditable(target) {
  if (!target || typeof target.tagName !== 'string') return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'textarea' || tag === 'input' || tag === 'select' || tag === 'button') return true;
  if (target.isContentEditable) return true;
  return false;
}

function ConversationItem({ item, selected, onClick }) {
  const p  = PLATFORM_META[item.platform] ?? PLATFORM_META.instagram;
  const sl = SOURCE_LABELS[item.source]   ?? { label: item.source, icon: '💬' };
  const unread = Number(item.unread ?? 0);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '13px 16px', cursor: 'pointer',
        background: selected ? '#eff6ff' : '#fff',
        borderBottom: '1px solid #f1f5f9',
        borderLeft: selected ? '3px solid #2563eb' : '3px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${p.color}33, ${p.color}66)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', position: 'relative',
      }}>
        {(item.from || '?')[0].toUpperCase()}
        <span style={{
          position: 'absolute', bottom: '-2px', right: '-2px',
          fontSize: '12px', background: '#fff', borderRadius: '50%',
          width: '18px', height: '18px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}>
          <PlatformIcon platform={p} size={12} />
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: '13px', color: '#1e293b' }}>
            {item.from || 'Unknown'}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
            {timeAgo(item.updatedTime || item.timestamp)}
          </span>
        </div>
        <div style={{
          fontSize: '12px', color: unread > 0 ? '#374151' : '#64748b',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontWeight: unread > 0 ? 600 : 400,
        }}>
          {item.snippet || item.text || '(no preview)'}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
          {sl.icon} {sl.label}
        </div>
      </div>

      {unread > 0 && (
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#2563eb', color: '#fff',
          fontSize: '10px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {unread}
        </div>
      )}
    </div>
  );
}

function CommentItem({ item, apiBase, token, selected, onSelect, onReplySent, replyExtras }) {
  const p  = PLATFORM_META[item.platform] ?? PLATFORM_META.instagram;
  const sl = SOURCE_LABELS[item.source]   ?? { label: item.source, icon: '💭' };

  const [showReply,  setShowReply]  = useState(false);
  const [replyText,  setReplyText]  = useState('');
  const [sending,    setSending]    = useState(false);
  const [replyError, setReplyError] = useState('');

  const sentReplies = useMemo(
    () => mergedCommentReplies(item, replyExtras || {}),
    [item, replyExtras]
  );

  const sendReply = async () => {
    if (!replyText.trim()) return;
    const textToSend = replyText.trim();
    setSending(true); setReplyError('');
    try {
      const res = await fetch(`${apiBase}/api/auto-reply/manual-reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: item.platform,
          commentId: item.id,
          postId: item.postId || '',
          commentText: item.text || '',
          authorUsername: item.from || '',
          replyText: textToSend,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setReplyError(d.error || `Error ${res.status}`);
      } else {
        const row = { text: textToSend, time: new Date().toISOString(), fromMe: true };
        onReplySent?.(item.id, row);
        setReplyText('');
        setShowReply(false);
      }
    } catch (e) {
      setReplyError('Network error.');
    } finally {
      setSending(false);
    }
  };

  const hasSent = sentReplies.length > 0;

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? () => onSelect() : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (isKeyboardEventFromEditable(e.target)) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      style={{
        padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
        background: selected ? '#eff6ff' : '#fff',
        borderLeft: selected ? '3px solid #2563eb' : '3px solid transparent',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${p.color}33, ${p.color}66)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', position: 'relative',
        }}>
          {(item.from || '?')[0].toUpperCase()}
          <span style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            fontSize: '11px', background: '#fff', borderRadius: '50%',
            width: '16px', height: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            <PlatformIcon platform={p} size={11} />
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
              {item.from || 'Unknown'}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {timeAgo(item.timestamp)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{item.text}</div>
          {item.postCaption && (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '5px 8px', borderRadius: '6px', borderLeft: `2px solid ${p.color}` }}>
              On: {item.postCaption}
            </div>
          )}

          {/* Show sent replies as bubbles */}
          {sentReplies.map((r, i) => (
            <div
              key={i}
              style={{
                marginTop: '8px',
                display: 'flex',
                justifyContent: r.fromMe ? 'flex-end' : 'flex-start',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                maxWidth: '85%',
                background: r.fromMe ? p.color : '#f1f5f9',
                color: r.fromMe ? '#fff' : '#1e293b',
                borderRadius: r.fromMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '7px 12px',
                fontSize: '12.5px',
                lineHeight: 1.5,
              }}>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.text}</div>
                <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '3px', textAlign: r.fromMe ? 'right' : 'left' }}>
                  {r.fromMe ? 'You' : (r.from || item.from || 'Them')} · {r.time ? timeAgo(r.time) : ''}
                </div>
              </div>
            </div>
          ))}

          <div
            style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
            onClick={e => e.stopPropagation()}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sl.icon} {sl.label}</span>
            {item.likes > 0 && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>❤️ {item.likes}</span>
            )}
            {hasSent && <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>✓ Replied</span>}
            <button
              type="button"
              onClick={() => { setShowReply(!showReply); setReplyError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '11px', color: p.color, fontWeight: 700, padding: '2px 0',
              }}
            >
              {showReply ? 'Cancel' : hasSent ? '↩ Reply again' : '↩ Reply'}
            </button>
          </div>

          {/* Reply input */}
          {showReply && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }} onClick={e => e.stopPropagation()}>
              <textarea
                rows={2}
                placeholder={`Reply to @${item.from || 'user'}…`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendReply();
                  }
                }}
                style={{
                  flex: 1, border: `1.5px solid ${p.color}55`, borderRadius: 8,
                  padding: '8px 10px', fontSize: 13, fontFamily: 'inherit',
                  resize: 'none', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={sendReply}
                disabled={sending || !replyText.trim()}
                style={{
                  background: p.color, border: 'none', borderRadius: 8,
                  padding: '8px 14px', color: '#fff', fontWeight: 700,
                  fontSize: 12, cursor: sending ? 'wait' : 'pointer',
                  opacity: !replyText.trim() ? 0.5 : 1, flexShrink: 0,
                }}
              >
                {sending ? '…' : 'Send'}
              </button>
            </div>
          )}
          {replyError && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>⚠ {replyError}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Right pane: full DM thread or comment + all replies (matches list selection). */
function InboxDetailPanel({ item, kind, commentReplyExtras, onClose, onOpenAutoReply, onOpenConnectedAccounts }) {
  const p = PLATFORM_META[item.platform] ?? PLATFORM_META.instagram;
  const sl = SOURCE_LABELS[item.source] ?? { label: item.source, icon: '💬' };
  const isMetaDm = item.source === 'facebook_messenger' || item.source === 'instagram_dm';

  const dmThread = useMemo(() => {
    if (kind !== 'dm') return [];
    const raw = item.messages || item.thread || item.messageHistory;
    if (Array.isArray(raw) && raw.length) {
      return raw.map(normalizeThreadMessage).filter(m => m && (m.text || '').trim());
    }
    const one = (item.snippet || item.text || '').trim();
    if (!one) return [];
    return [{ text: one, time: item.updatedTime || item.timestamp, fromMe: false, from: item.from }];
  }, [kind, item]);

  const { root: commentRoot, replies: commentReplies } = useMemo(() => {
    if (kind !== 'comment') return { root: '', replies: [] };
    return {
      root: item.text || '',
      replies: mergedCommentReplies(item, commentReplyExtras || {}),
    };
  }, [kind, item, commentReplyExtras]);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        minHeight: 0,
        maxHeight: 'min(72vh, 880px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px 18px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${p.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <PlatformIcon platform={p} size={26} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', lineHeight: 1.3 }}>
              {item.from || 'Unknown'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {sl.icon} {sl.label}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: '#64748b', width: '36px', height: '36px', flexShrink: 0, lineHeight: 1 }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', minHeight: 0 }}>
        {kind === 'dm' && (
          <>
            {dmThread.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: m.fromMe ? 'flex-end' : 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    maxWidth: '92%',
                    background: m.fromMe ? p.color : '#f1f5f9',
                    color: m.fromMe ? '#fff' : '#1e293b',
                    borderRadius: m.fromMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    padding: '10px 14px',
                    fontSize: '14px',
                    lineHeight: 1.55,
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '6px', textAlign: m.fromMe ? 'right' : 'left' }}>
                    {m.fromMe ? 'You' : (m.from || item.from || 'Contact')}
                    {m.time ? ` · ${timeAgo(typeof m.time === 'string' ? m.time : new Date(m.time).toISOString())}` : ''}
                  </div>
                </div>
              </div>
            ))}
            {dmThread.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>(no message content)</div>
            )}
            {kind === 'dm' && dmThread.length > 0 && !(Array.isArray(item.messages) && item.messages.length > 0) && (
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '14px', lineHeight: 1.55 }}>
                Full back-and-forth history appears here when the API returns a message list. If you only see one line, open the app or Meta Business Suite for the complete thread.
              </p>
            )}
          </>
        )}

        {kind === 'comment' && (
          <>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Their comment
              </div>
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {commentRoot || '(no text)'}
              </div>
            </div>
            {item.postCaption && (
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px', padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <strong>On post:</strong> {item.postCaption}
              </div>
            )}
            {commentReplies.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Replies
                </div>
                {commentReplies.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: r.fromMe ? 'flex-end' : 'flex-start',
                      marginBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '92%',
                        background: r.fromMe ? p.color : '#f1f5f9',
                        color: r.fromMe ? '#fff' : '#1e293b',
                        borderRadius: r.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        lineHeight: 1.55,
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.text}</div>
                      <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '6px', textAlign: r.fromMe ? 'right' : 'left' }}>
                        {r.fromMe ? 'You' : (r.from || item.from || 'Them')}
                        {r.time ? ` · ${timeAgo(r.time)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px', lineHeight: 1.5 }}>
              Use <strong>Reply</strong> in the list on the left to send another answer from here.
            </p>
          </>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          padding: '12px 18px 16px',
          flexShrink: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <div><strong>Platform:</strong> {(PLATFORM_META[item.platform] ?? {}).label ?? item.platform}</div>
        <div><strong>Type:</strong> {sl.label}</div>
        <div><strong>From:</strong> {item.from || '—'}</div>
        <div><strong>Time:</strong> {timeAgo(item.updatedTime || item.timestamp)}</div>
        {item.likes > 0 && <div><strong>Likes:</strong> ❤️ {item.likes}</div>}
        {item.unread > 0 && <div><strong>Unread:</strong> 🔴 {item.unread}</div>}
      </div>

      {kind === 'dm' && isMetaDm && (
        <div style={{ margin: '0 18px 16px', padding: '14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
          <p style={{ margin: '0 0 12px', lineHeight: 1.55 }}>
            💡 <strong>You can’t send Messenger / IG DMs from this panel yet</strong> — Meta requires <code style={{ fontSize: 11 }}>pages_messaging</code> (and related) on your app, plus a backend that calls the Send API. Use the buttons below to reply in Meta or configure auto-reply for when your API supports it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <a
              href={META_BUSINESS_INBOX_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', padding: '8px 12px', background: '#fff',
                border: '1px solid #fbbf24', borderRadius: 8, color: '#0f172a', fontWeight: 700, fontSize: 12, textDecoration: 'none',
              }}
            >
              Open Meta Business Suite ↗
            </a>
            {typeof onOpenAutoReply === 'function' && (
              <button
                type="button"
                onClick={onOpenAutoReply}
                style={{
                  padding: '8px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}
              >
                Auto-Reply settings
              </button>
            )}
            {typeof onOpenConnectedAccounts === 'function' && (
              <button
                type="button"
                onClick={onOpenConnectedAccounts}
                style={{
                  padding: '8px 12px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8,
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}
              >
                Connected accounts
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function MessagesInbox({ onOpenVideoPublisher, onOpenConnectedAccounts, onOpenAutoReply }) {
  const { apiBase, token } = useAuth();
  const base = (apiBase || (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/$/, '') || 'https://api.wintaibot.com');

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [platformTab, setPlatformTab] = useState('all');   // all | instagram | facebook | youtube | linkedin
  const [typeTab,     setTypeTab]     = useState('all');   // all | messages | comments
  /** Separate DM vs comment so IDs never collide; fixes wrong pane when filtering comments. */
  const [selection, setSelection]   = useState(null); // { kind: 'dm' | 'comment', id: string } | null
  const [commentReplyExtras, setCommentReplyExtras] = useState({}); // commentId -> locally sent replies
  /** `null` = loading or failed to load status; `Set` (possibly empty) = loaded — sidebar lists only connected IDs. */
  const [connectedPlatformIds, setConnectedPlatformIds] = useState(null);

  useEffect(() => {
    if (!token) {
      setConnectedPlatformIds(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${base}/api/social/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('social status');
        const j = await res.json();
        const raw = Array.isArray(j.connected) ? j.connected : [];
        const next = new Set();
        for (const x of raw) {
          const id = normalizeSocialStatusPlatformId(x);
          if (id) next.add(id);
        }
        if (!cancelled) setConnectedPlatformIds(next);
      } catch {
        if (!cancelled) setConnectedPlatformIds(null);
      }
    })();
    return () => { cancelled = true; };
  }, [base, token]);

  const sidebarPlatforms = useMemo(() => {
    const list = Object.values(PLATFORM_META);
    if (connectedPlatformIds === null) return [];
    if (connectedPlatformIds.size === 0) return [];
    return list.filter(
      (p) => connectedPlatformIds.has(p.id) && !isPlatformDisabled(p.id),
    );
  }, [connectedPlatformIds]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${base}/api/analytics/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [base, token]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setSelection(null);
  }, [platformTab, typeTab]);

  useEffect(() => {
    if (connectedPlatformIds === null || platformTab === 'all') return;
    if (!connectedPlatformIds.has(platformTab)) setPlatformTab('all');
  }, [connectedPlatformIds, platformTab]);

  useEffect(() => {
    if (platformTab !== 'all' && isPlatformDisabled(platformTab)) setPlatformTab('all');
  }, [platformTab]);

  const conversations = useMemo(() => {
    const { conversations: c0 } = coalesceMessagesApiPayload(data || {});
    return c0.map(normalizeInboxPlatform);
  }, [data]);

  const comments = useMemo(() => {
    const { comments: cm0 } = coalesceMessagesApiPayload(data || {});
    return cm0.map(normalizeInboxPlatform);
  }, [data]);

  const totalUnread = Number(data?.totalUnread ?? data?.payload?.totalUnread ?? 0);

  // Per-platform counts for stat cards
  const byPlatform = (list, p) => list.filter(x => x.platform === p);
  const igConvs = byPlatform(conversations, 'instagram');
  const fbConvs = byPlatform(conversations, 'facebook');
  const liConvs = byPlatform(conversations, 'linkedin');
  const igComments = byPlatform(comments, 'instagram');
  const fbComments = byPlatform(comments, 'facebook');
  const ytComments = byPlatform(comments, 'youtube');
  const liComments = byPlatform(comments, 'linkedin');
  const ttComments = byPlatform(comments, 'tiktok');
  const xComments  = byPlatform(comments, 'x');

  // Step 1: filter by platform
  const platConvs    = platformTab === 'all' ? conversations : byPlatform(conversations, platformTab);
  const platComments = platformTab === 'all' ? comments      : byPlatform(comments,      platformTab);

  // Step 2: filter by type (Instagram DMs are disabled — requires Meta App Review)
  const displayConvs    = typeTab === 'comments' ? [] : platConvs.filter(c => c.platform !== 'instagram');
  const displayComments = typeTab === 'messages' ? [] : platComments;

  // When switching platform, reset type if not supported
  const handlePlatformTab = (p) => {
    setPlatformTab(p);
    const supported = PLATFORM_TYPES[p] || ['all'];
    if (!supported.includes(typeTab)) setTypeTab(supported[0]);
  };

  const selectedItem = useMemo(() => {
    if (!selection) return null;
    if (selection.kind === 'dm') return conversations.find((c) => sameInboxId(c.id, selection.id)) ?? null;
    return comments.find((c) => sameInboxId(c.id, selection.id)) ?? null;
  }, [selection, conversations, comments]);

  const filteredView = platformTab !== 'all' || typeTab !== 'all';
  const hasAnyInboxData = conversations.length > 0 || comments.length > 0;
  const listTotalCount = displayConvs.length + displayComments.length;

  const listSectionHeaderStyle = {
    padding: '12px 16px 8px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: '#f8fafc',
    borderBottom: '1px solid #f1f5f9',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  };

  return (
    <div
      style={{
        maxWidth: 'none',
        width: '100%',
        margin: 0,
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}
    >

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '14px',
        }}
      >
        {totalUnread > 0 && (
          <span
            style={{
              display: 'inline-block',
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {totalUnread} unread
          </span>
        )}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {typeof onOpenVideoPublisher === 'function' && (
            <button
              type="button"
              onClick={onOpenVideoPublisher}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                flexShrink: 0,
              }}
            >
              <span aria-hidden>🎬</span>
              Video Publisher
            </button>
          )}
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              flexShrink: 0,
            }}
          >
            <RefreshIcon />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#64748b', fontSize: '14px' }}>Loading inbox…</div>
      )}

      {data && (
        <>
          {platformTab !== 'all' && data?.platformErrors?.[platformTab] && (
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 13,
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ flex: 1 }}>⚠️ {data.platformErrors[platformTab]}</span>
              {typeof onOpenConnectedAccounts === 'function' && (
                <button
                  type="button"
                  onClick={onOpenConnectedAccounts}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #d97706',
                    background: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                selection && selectedItem
                  ? '104px minmax(240px, 1fr) minmax(280px, 1.15fr)'
                  : '104px minmax(0, 1fr)',
              width: '100%',
              minHeight: 0,
              height: 'min(72vh, 880px)',
              maxHeight: 'min(72vh, 880px)',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
          <aside
            aria-label="Accounts and filters"
            style={{
              alignSelf: 'stretch',
              borderRight: '1px solid #e2e8f0',
              background: '#f8fafc',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 0,
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <div
              aria-label="Connected platforms"
              style={{
                flex: '1 1 0',
                minHeight: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  width: '100%',
                  flexShrink: 0,
                }}
              >
                Accounts
              </div>
              <SidebarPlatformButton
                active={platformTab === 'all'}
                onClick={() => handlePlatformTab('all')}
                title="All platforms"
                unreadBadge={totalUnread}
                accent="#334155"
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: '#334155', letterSpacing: '0.02em' }}>All</span>
              </SidebarPlatformButton>
              {connectedPlatformIds === null && (
                <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: '2px 0' }}>Loading…</div>
              )}
              {connectedPlatformIds !== null && sidebarPlatforms.length === 0 && (
                <div
                  style={{
                    fontSize: 9,
                    color: '#94a3b8',
                    textAlign: 'center',
                    padding: '2px 4px',
                    lineHeight: 1.35,
                  }}
                >
                  No accounts connected
                </div>
              )}
              {sidebarPlatforms.map((p) => {
                const unread =
                  p.id === 'instagram'
                    ? igConvs.filter((c) => Number(c.unread) > 0).length
                    : p.id === 'facebook'
                      ? fbConvs.filter((c) => Number(c.unread) > 0).length
                      : 0;
                const cnt =
                  p.id === 'instagram'
                    ? igComments.length
                    : p.id === 'facebook'
                      ? fbConvs.length + fbComments.length
                      : p.id === 'youtube'
                        ? ytComments.length
                        : p.id === 'linkedin'
                          ? liConvs.length + liComments.length
                          : p.id === 'tiktok'
                            ? ttComments.length
                            : xComments.length;
                return (
                  <SidebarPlatformButton
                    key={p.id}
                    active={platformTab === p.id}
                    onClick={() => handlePlatformTab(p.id)}
                    title={p.label}
                    accent={p.color}
                    unreadBadge={unread}
                    countBadge={unread > 0 ? undefined : cnt}
                  >
                    <PlatformIcon platform={p} size={22} />
                  </SidebarPlatformButton>
                );
              })}
            </div>

            <div
              style={{
                flexShrink: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                paddingTop: 4,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 1,
                  background: '#e2e8f0',
                  margin: '4px 0 6px',
                }}
              />

              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                View
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                {['all', 'comments', 'messages'].map((t) => {
                  const supported = PLATFORM_TYPES[platformTab] || ['all'];
                  const disabled = !supported.includes(t);
                  const badge =
                    t === 'messages'
                      ? platConvs.filter((c) => Number(c.unread) > 0).length
                      : t === 'comments'
                        ? platComments.length
                        : 0;
                  return (
                    <SidebarTypeButton
                      key={t}
                      label={TYPE_TAB_LABELS[t] || t}
                      active={typeTab === t}
                      disabled={disabled}
                      badge={badge}
                      onClick={() => {
                        if (!disabled) setTypeTab(t);
                      }}
                    />
                  );
                })}
              </div>

              {(typeof onOpenConnectedAccounts === 'function' || typeof onOpenAutoReply === 'function') && (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 10,
                    borderTop: '1px solid #e2e8f0',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {typeof onOpenConnectedAccounts === 'function' && (
                    <button
                      type="button"
                      title="Connected accounts"
                      onClick={onOpenConnectedAccounts}
                      style={{
                        width: '100%',
                        padding: '8px 6px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: 10,
                        lineHeight: 1.2,
                        cursor: 'pointer',
                      }}
                    >
                      🔗 Accounts
                    </button>
                  )}
                  {typeof onOpenAutoReply === 'function' && (
                    <button
                      type="button"
                      title="Auto reply"
                      onClick={onOpenAutoReply}
                      style={{
                        width: '100%',
                        padding: '8px 6px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: 10,
                        lineHeight: 1.2,
                        cursor: 'pointer',
                      }}
                    >
                      🤖 Auto
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          <div
            style={{
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRight: selection && selectedItem ? '1px solid #e2e8f0' : undefined,
            }}
          >
            <div
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                minHeight: 0,
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
            {listTotalCount > 4 && (
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#475569',
                  background: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  textAlign: 'center',
                  lineHeight: 1.45,
                }}
              >
                {listTotalCount} items in this list — <strong style={{ fontWeight: 700 }}>scroll inside the box</strong> to see DMs and every comment.
              </div>
            )}
            {/* Conversations */}
            {displayConvs.length > 0 && (
              <>
                <div style={listSectionHeaderStyle}>
                  Direct Messages ({displayConvs.length})
                </div>
                {displayConvs.map(item => (
                  <ConversationItem
                    key={item.id}
                    item={item}
                    selected={selection?.kind === 'dm' && sameInboxId(selection.id, item.id)}
                    onClick={() => setSelection(
                      (sel) => (sel?.kind === 'dm' && sameInboxId(sel.id, item.id) ? null : { kind: 'dm', id: item.id })
                    )}
                  />
                ))}
              </>
            )}

            {/* Comments */}
            {displayComments.length > 0 && (
              <>
                <div style={listSectionHeaderStyle}>
                  Comments ({displayComments.length})
                </div>
                {displayComments.map((item, i) => (
                  <CommentItem
                    key={item.id || `${item.source}-${item.timestamp}-${i}`}
                    item={item}
                    apiBase={base}
                    token={token}
                    selected={selection?.kind === 'comment' && sameInboxId(selection.id, item.id)}
                    onSelect={() => setSelection(
                      (sel) => (sel?.kind === 'comment' && sameInboxId(sel.id, item.id) ? null : { kind: 'comment', id: item.id })
                    )}
                    replyExtras={commentReplyExtras}
                    onReplySent={(commentId, row) => {
                      setCommentReplyExtras(prev => ({
                        ...prev,
                        [commentId]: [...(prev[commentId] || []), row],
                      }));
                    }}
                  />
                ))}
              </>
            )}

            {displayConvs.length === 0 && displayComments.length === 0 && (
              <div style={{ padding: '44px 28px', textAlign: 'center', maxWidth: '400px', margin: '0 auto', flex: 1 }}>
                <EmptyInboxIllustration />
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>
                  {filteredView ? 'No results for this filter' : 'Your inbox is empty'}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55 }}>
                  {filteredView
                    ? (typeTab === 'messages'
                        ? 'No DMs match this filter. Choose All or Comments to see comment threads and other activity.'
                        : 'Try choosing All platforms or All types, or pick a different combination.')
                    : 'New comments and messages from connected accounts will appear here.'}
                </div>
                {filteredView && (platformTab === 'instagram' || platformTab === 'youtube') && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#78350f',
                      lineHeight: 1.55,
                    }}
                  >
                    {platformTab === 'instagram' ? (
                      <>
                        <strong>Why Instagram can look empty:</strong> Comments here are loaded by the API from Instagram (Graph) for your Instagram Business account tied to your Page. Connecting or reconnecting an account does not by itself import comments. If the Instagram tile stays at 0, the server may not be syncing Instagram comments yet, required Meta permissions may be missing, or there are no comments on your posts.
                      </>
                    ) : (
                      <>
                        <strong>Why YouTube can look empty:</strong> Comments are loaded from the YouTube Data API for your channel. Reconnecting Google does not create inbox rows—there must be comments on your videos, and the backend must sync them. If this stays at 0, YouTube comment sync may not be enabled server-side yet.
                      </>
                    )}
                  </div>
                )}
                {filteredView && hasAnyInboxData && (
                  <div style={{ marginTop: '18px' }}>
                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                      You still have data in this inbox — the platform you picked has nothing that matches (check the counts on the left).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformTab('all');
                        setTypeTab('all');
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #0f172a',
                        background: '#0f172a',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Show all platforms &amp; types
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {selection && selectedItem && (
            <div
              style={{
                minWidth: 0,
                minHeight: 0,
                overflow: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
              }}
            >
              <InboxDetailPanel
                item={selectedItem}
                kind={selection.kind}
                commentReplyExtras={commentReplyExtras}
                onClose={() => setSelection(null)}
                onOpenAutoReply={onOpenAutoReply}
                onOpenConnectedAccounts={onOpenConnectedAccounts}
              />
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}
