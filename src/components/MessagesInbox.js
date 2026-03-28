import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORM_META = {
  instagram: { id: 'instagram', label: 'Instagram', color: '#E1306C', logo: 'instagram' },
  facebook:  { id: 'facebook',  label: 'Facebook',  color: '#1877F2', logo: 'facebook'  },
  youtube:   { id: 'youtube',   label: 'YouTube',   color: '#FF0000', logo: 'youtube'   },
  linkedin:  { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', logo: 'linkedin'  },
};

const SOURCE_LABELS = {
  instagram_dm:       { label: 'Instagram DM',       icon: '💬' },
  instagram_comment:  { label: 'Instagram Comment',  icon: '💭' },
  facebook_messenger: { label: 'Facebook Messenger', icon: '📨' },
  facebook_comment:   { label: 'Facebook Comment',   icon: '💬' },
  youtube_comment:    { label: 'YouTube Comment',    icon: '▶️' },
  linkedin_message:   { label: 'LinkedIn Message',   icon: '💼' },
  linkedin_comment:   { label: 'LinkedIn Comment',   icon: '💬' },
};

// Which type-tabs each platform supports
const PLATFORM_TYPES = {
  all:       ['all', 'messages', 'comments'],
  instagram: ['comments'],                      // Instagram DMs require Meta App Review — comments only
  facebook:  ['all', 'messages', 'comments'],
  youtube:   ['comments'],                      // YouTube has no DM API
  linkedin:  ['all', 'messages', 'comments'],
};

const TYPE_TAB_LABELS = { all: 'All', messages: 'Messages', comments: 'Comments' };

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

function TabBtn({ label, active, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: active ? '1px solid #0f172a' : '1px solid #e2e8f0',
        cursor: 'pointer',
        fontWeight: active ? 600 : 500,
        fontSize: '13px',
        whiteSpace: 'nowrap',
        background: active ? '#0f172a' : '#fff',
        color: active ? '#fff' : '#475569',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        boxShadow: active ? 'none' : '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {label}
      {badge > 0 && (
        <span
          style={{
            background: active ? 'rgba(255,255,255,0.2)' : '#fee2e2',
            color: active ? '#fff' : '#b91c1c',
            borderRadius: '6px',
            padding: '1px 6px',
            fontSize: '10px',
            fontWeight: 700,
            minWidth: '18px',
            textAlign: 'center',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/** Unified metric tile — white card + tinted icon (no mixed solid fills). */
function StatTile({ icon, label, value, accent, onClick }) {
  const interactive = typeof onClick === 'function';
  const tint = accent ? `${accent}14` : '#f1f5f9';
  const content = (
    <>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: tint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accent || '#64748b',
          fontSize: '18px',
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '2px', letterSpacing: '0.02em' }}>
          {label}
        </div>
      </div>
    </>
  );
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    textAlign: 'left',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
    width: '100%',
    fontFamily: 'inherit',
  };
  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ ...baseStyle, cursor: 'pointer' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accent || '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)';
        }}
      >
        {content}
      </button>
    );
  }
  return (
    <div role="status" style={{ ...baseStyle, cursor: 'default' }}>
      {content}
    </div>
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

function UnreadDotIcon({ color = '#dc2626' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8" fill={color} opacity="0.2" />
      <circle cx="12" cy="12" r="4" fill={color} />
    </svg>
  );
}

function StatEnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function StatCommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8.5z" />
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

function CommentItem({ item, apiBase, token }) {
  const p  = PLATFORM_META[item.platform] ?? PLATFORM_META.instagram;
  const sl = SOURCE_LABELS[item.source]   ?? { label: item.source, icon: '💭' };

  const [showReply,  setShowReply]  = useState(false);
  const [replyText,  setReplyText]  = useState('');
  const [sending,    setSending]    = useState(false);
  const [sentReplies, setSentReplies] = useState(
    item.replies && item.replies.length > 0 ? item.replies : []
  );
  const [replyError, setReplyError] = useState('');

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
        setSentReplies(prev => [...prev, { text: textToSend, time: new Date().toISOString(), fromMe: true }]);
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
    <div style={{ padding: '13px 16px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
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
            <div key={i} style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '85%',
                background: p.color,
                color: '#fff',
                borderRadius: '12px 12px 2px 12px',
                padding: '7px 12px',
                fontSize: '12.5px',
                lineHeight: 1.5,
              }}>
                <div>{r.text}</div>
                <div style={{ fontSize: '10px', opacity: 0.75, marginTop: '3px', textAlign: 'right' }}>
                  You · {timeAgo(r.time)}
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <textarea
                rows={2}
                placeholder={`Reply to @${item.from || 'user'}…`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
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

/* ─────────────────────────────────────────────────────────── */
export default function MessagesInbox() {
  const { apiBase, token } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [platformTab, setPlatformTab] = useState('all');   // all | instagram | facebook | youtube | linkedin
  const [typeTab,     setTypeTab]     = useState('all');   // all | messages | comments
  const [selected,  setSelected]  = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
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

  const conversations = data?.conversations ?? [];
  const comments      = data?.comments      ?? [];
  const totalUnread   = Number(data?.totalUnread ?? 0);

  // Per-platform counts for stat cards
  const byPlatform = (list, p) => list.filter(x => x.platform === p);
  const igConvs = byPlatform(conversations, 'instagram');
  const fbConvs = byPlatform(conversations, 'facebook');
  const liConvs = byPlatform(conversations, 'linkedin');
  const igComments = byPlatform(comments, 'instagram');
  const fbComments = byPlatform(comments, 'facebook');
  const ytComments = byPlatform(comments, 'youtube');
  const liComments = byPlatform(comments, 'linkedin');

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

  const selectedItem = selected
    ? [...conversations, ...comments].find(x => x.id === selected)
    : null;

  const filteredView = platformTab !== 'all' || typeTab !== 'all';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Toolbar (page title lives in app shell — subtitle only here) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '14px',
        }}
      >
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
            Comments and direct messages from connected accounts in one place.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
            Instagram comments · Facebook Messenger · YouTube comments · LinkedIn
          </p>
          {totalUnread > 0 && (
            <span
              style={{
                display: 'inline-block',
                marginTop: '10px',
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
        </div>
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

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary — unified StatTile style */}
      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <StatTile icon={<StatEnvelopeIcon />} label="Total DMs" value={conversations.length} accent="#2563eb" />
          <StatTile icon={<UnreadDotIcon />} label="Unread" value={totalUnread} accent="#dc2626" />
          <StatTile icon={<StatCommentIcon />} label="Comments" value={comments.length} accent="#d97706" />
          <StatTile
            icon={<PlatformIcon platform={PLATFORM_META.instagram} size={20} />}
            label="Instagram"
            value={igComments.length}
            accent={PLATFORM_META.instagram.color}
            onClick={() => handlePlatformTab('instagram')}
          />
          <StatTile
            icon={<PlatformIcon platform={PLATFORM_META.facebook} size={20} />}
            label="Facebook"
            value={fbConvs.length + fbComments.length}
            accent={PLATFORM_META.facebook.color}
            onClick={() => handlePlatformTab('facebook')}
          />
          <StatTile
            icon={<PlatformIcon platform={PLATFORM_META.youtube} size={20} />}
            label="YouTube"
            value={ytComments.length}
            accent={PLATFORM_META.youtube.color}
            onClick={() => handlePlatformTab('youtube')}
          />
          <StatTile
            icon={<PlatformIcon platform={PLATFORM_META.linkedin} size={20} />}
            label="LinkedIn"
            value={liConvs.length + liComments.length}
            accent={PLATFORM_META.linkedin.color}
            onClick={() => handlePlatformTab('linkedin')}
          />
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Platform
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexWrap: 'wrap', paddingBottom: '2px' }}>
          <TabBtn label="All" active={platformTab === 'all'} badge={totalUnread} onClick={() => handlePlatformTab('all')} />
          {Object.values(PLATFORM_META).map(p => (
            <TabBtn
              key={p.id}
              label={(
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <PlatformIcon platform={{ ...p, color: platformTab === p.id ? '#fff' : p.color }} size={14} />
                  {p.label}
                </span>
              )}
              active={platformTab === p.id}
              badge={p.id === 'instagram' ? igConvs.filter(c => Number(c.unread) > 0).length
                : p.id === 'facebook' ? fbConvs.filter(c => Number(c.unread) > 0).length
                  : 0}
              onClick={() => handlePlatformTab(p.id)}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginTop: '12px',
            marginBottom: '8px',
          }}
        >
          Type
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexWrap: 'wrap' }}>
          {(PLATFORM_TYPES[platformTab] || ['all']).map(t => (
            <TabBtn
              key={t}
              label={TYPE_TAB_LABELS[t] || t}
              active={typeTab === t}
              badge={t === 'messages' ? platConvs.filter(c => Number(c.unread) > 0).length
                : t === 'comments' ? platComments.length
                  : 0}
              onClick={() => setTypeTab(t)}
            />
          ))}
        </div>
      </div>

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#64748b', fontSize: '14px' }}>Loading inbox…</div>
      )}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '16px' }}>

          {/* Left: List */}
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>

            {/* Conversations */}
            {displayConvs.length > 0 && (
              <>
                <div style={{ padding: '12px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  Direct Messages ({displayConvs.length})
                </div>
                {displayConvs.map(item => (
                  <ConversationItem
                    key={item.id}
                    item={item}
                    selected={selected === item.id}
                    onClick={() => setSelected(selected === item.id ? null : item.id)}
                  />
                ))}
              </>
            )}

            {/* Comments */}
            {displayComments.length > 0 && (
              <>
                <div style={{ padding: '12px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  Comments ({displayComments.length})
                </div>
                {displayComments.map((item, i) => (
                  <CommentItem key={`${item.source}-${i}`} item={item} apiBase={base} token={token} />
                ))}
              </>
            )}

            {displayConvs.length === 0 && displayComments.length === 0 && (
              <div style={{ padding: '44px 28px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                <EmptyInboxIllustration />
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>
                  {filteredView ? 'No results for this filter' : 'Your inbox is empty'}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55 }}>
                  {filteredView
                    ? 'Try choosing All platforms or All types, or pick a different combination.'
                    : 'New comments and messages from connected accounts will appear here.'}
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          {selected && selectedItem && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
                  {(SOURCE_LABELS[selectedItem.source] ?? {}).icon} {selectedItem.from || 'Unknown'}
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                  {selectedItem.snippet || selectedItem.text || '(no content)'}
                </div>
                {selectedItem.postCaption && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    📝 On post: {selectedItem.postCaption}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                <div><strong>Platform:</strong> {(PLATFORM_META[selectedItem.platform] ?? {}).label ?? selectedItem.platform}</div>
                <div><strong>Type:</strong> {(SOURCE_LABELS[selectedItem.source] ?? {}).label ?? selectedItem.source}</div>
                <div><strong>From:</strong> {selectedItem.from || '—'}</div>
                <div><strong>Time:</strong> {timeAgo(selectedItem.updatedTime || selectedItem.timestamp)}</div>
                {selectedItem.likes > 0 && <div><strong>Likes:</strong> ❤️ {selectedItem.likes}</div>}
                {selectedItem.unread > 0 && <div><strong>Unread:</strong> 🔴 {selectedItem.unread}</div>}
              </div>

              <div style={{ marginTop: '16px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                💡 To reply, open <strong>Meta Business Suite</strong> or the platform's native app. Direct replies via API require additional Meta permissions.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
