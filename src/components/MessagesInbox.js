import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PlatformIcon from './PlatformIcon';

const PLATFORM_META = {
  instagram: { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', bg: '#fce4ec', logo: 'instagram' },
  facebook:  { id: 'facebook',  label: 'Facebook',  emoji: '👍', color: '#1877F2', bg: '#e3f2fd', logo: 'facebook'  },
  youtube:   { id: 'youtube',   label: 'YouTube',   emoji: '▶️', color: '#FF0000', bg: '#fff0f0', logo: 'youtube'   },
};

const SOURCE_LABELS = {
  instagram_dm:       { label: 'Instagram DM',       icon: '💬' },
  instagram_comment:  { label: 'Instagram Comment',  icon: '💭' },
  facebook_messenger: { label: 'Facebook Messenger', icon: '📨' },
  facebook_comment:   { label: 'Facebook Comment',   icon: '💬' },
  youtube_comment:    { label: 'YouTube Comment',    icon: '▶️' },
};

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
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: '20px', border: 'none',
        cursor: 'pointer', fontWeight: active ? 700 : 500,
        fontSize: '13px', whiteSpace: 'nowrap',
        background: active ? '#1e293b' : '#f1f5f9',
        color: active ? '#fff' : '#475569',
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.15s',
      }}
    >
      {label}
      {badge > 0 && (
        <span style={{
          background: '#ef4444', color: '#fff', borderRadius: '20px',
          padding: '1px 6px', fontSize: '10px', fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </button>
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

function CommentItem({ item }) {
  const p  = PLATFORM_META[item.platform] ?? PLATFORM_META.instagram;
  const sl = SOURCE_LABELS[item.source]   ?? { label: item.source, icon: '💭' };

  return (
    <div style={{
      padding: '13px 16px', borderBottom: '1px solid #f1f5f9', background: '#fff',
    }}>
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
          <div style={{ marginTop: '5px', display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{sl.icon} {sl.label}</span>
            {item.likes > 0 && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>❤️ {item.likes}</span>
            )}
          </div>
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
  const [tab,       setTab]       = useState('all');       // all | messages | instagram | facebook | comments
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

  const igConvs    = conversations.filter(c => c.platform === 'instagram');
  const fbConvs    = conversations.filter(c => c.platform === 'facebook');
  const ytConvs    = conversations.filter(c => c.platform === 'youtube');
  const igComments = comments.filter(c => c.platform === 'instagram');
  const fbComments = comments.filter(c => c.platform === 'facebook');
  const ytComments = comments.filter(c => c.platform === 'youtube');

  const displayConvs = tab === 'all'       ? conversations
                     : tab === 'messages'  ? conversations
                     : tab === 'instagram' ? igConvs
                     : tab === 'facebook'  ? fbConvs
                     : tab === 'youtube'   ? ytConvs
                     : [];

  const displayComments = tab === 'all'            ? comments
                        : tab === 'comments'       ? comments
                        : tab === 'ig_comments'    ? igComments
                        : tab === 'fb_comments'    ? fbComments
                        : tab === 'yt_comments'    ? ytComments
                        : tab === 'instagram'      ? igComments
                        : tab === 'facebook'       ? fbComments
                        : tab === 'youtube'        ? ytComments
                        : [];

  const selectedItem = selected
    ? [...conversations, ...comments].find(x => x.id === selected)
    : null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            💬 Messages & Comments
            {totalUnread > 0 && (
              <span style={{ marginLeft: '10px', background: '#ef4444', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '14px', fontWeight: 700 }}>
                {totalUnread} unread
              </span>
            )}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Instagram DMs · Facebook Messenger · YouTube Comments
          </p>
        </div>
        <button
          onClick={load} disabled={loading}
          style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#4f46e5', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          {loading ? '⟳ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: '#991b1b', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary cards */}
      {data && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { icon: '📨', label: 'Total Messages', value: conversations.length,                            color: '#2563eb', bg: '#eff6ff' },
            { icon: '🔴', label: 'Unread',          value: totalUnread,                                    color: '#dc2626', bg: '#fef2f2' },
            { icon: '💭', label: 'Comments',         value: comments.length,                               color: '#d97706', bg: '#fffbeb' },
            { icon: <PlatformIcon platform={PLATFORM_META.instagram} size={22} />, label: 'Instagram', value: igConvs.length + igComments.length,  color: '#E1306C', bg: '#fce4ec' },
            { icon: <PlatformIcon platform={PLATFORM_META.facebook}  size={22} />, label: 'Facebook',  value: fbConvs.length + fbComments.length,  color: '#1877F2', bg: '#e3f2fd' },
            { icon: <PlatformIcon platform={PLATFORM_META.youtube}   size={22} />, label: 'YouTube',   value: ytConvs.length  + ytComments.length,  color: '#FF0000', bg: '#fff0f0' },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, borderRadius: '12px', padding: '14px 18px', minWidth: '110px', flex: 1 }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{c.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: c.color, lineHeight: 1.2 }}>{c.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <TabBtn label="All messages" active={tab === 'all'}      badge={totalUnread} onClick={() => setTab('all')} />
        <TabBtn label="💬 Messages"  active={tab === 'messages'} badge={conversations.filter(c=>Number(c.unread)>0).length} onClick={() => setTab('messages')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.instagram, color: tab==='instagram'?'#ffffff':'#E1306C'}} size={13}/>Instagram</span>} active={tab === 'instagram'} badge={igConvs.filter(c=>Number(c.unread)>0).length} onClick={() => setTab('instagram')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.facebook,  color: tab==='facebook' ?'#ffffff':'#1877F2'}} size={13}/>Facebook</span>}  active={tab === 'facebook'}  badge={fbConvs.filter(c=>Number(c.unread)>0).length}  onClick={() => setTab('facebook')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.youtube,   color: tab==='youtube'  ?'#ffffff':'#FF0000'}} size={13}/>YouTube</span>}   active={tab === 'youtube'}   badge={0}                                                onClick={() => setTab('youtube')} />
      </div>
      {/* Comments sub-tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        <TabBtn label="💭 All Comments"  active={tab === 'comments'}     badge={comments.length}     onClick={() => setTab('comments')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.instagram, color: tab==='ig_comments'?'#ffffff':'#E1306C'}} size={12}/>Instagram Comments</span>} active={tab === 'ig_comments'} badge={igComments.length} onClick={() => setTab('ig_comments')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.facebook,  color: tab==='fb_comments'?'#ffffff':'#1877F2'}} size={12}/>Facebook Comments</span>}  active={tab === 'fb_comments'} badge={fbComments.length} onClick={() => setTab('fb_comments')} />
        <TabBtn label={<span style={{display:'flex',alignItems:'center',gap:'5px'}}><PlatformIcon platform={{...PLATFORM_META.youtube,   color: tab==='yt_comments'?'#ffffff':'#FF0000'}} size={12}/>YouTube Comments</span>}   active={tab === 'yt_comments'} badge={ytComments.length} onClick={() => setTab('yt_comments')} />
      </div>

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>⟳ Loading messages...</div>
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
                  <CommentItem key={`${item.source}-${i}`} item={item} />
                ))}
              </>
            )}

            {displayConvs.length === 0 && displayComments.length === 0 && (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', marginBottom: '6px' }}>No messages found</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {!data ? 'Connect Instagram or Facebook to see messages.' : 'No messages in this category yet.'}
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
