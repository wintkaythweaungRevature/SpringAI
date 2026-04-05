import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'breezegirl6@gmail.com';

// Plan tier limits
const PLAN_LIMITS = {
  FREE:    { maxTickets: 1,         label: 'Free',     priority: false },
  MEMBER:  { maxTickets: 3,         label: 'Member',   priority: false },
  STARTER: { maxTickets: 3,         label: 'Starter',  priority: false },
  PRO:     { maxTickets: Infinity,  label: 'Pro',      priority: true  },
  GROWTH:  { maxTickets: Infinity,  label: 'Growth',   priority: true  },
};

function getPlanLimit(membershipType) {
  return PLAN_LIMITS[membershipType?.toUpperCase()] || PLAN_LIMITS.FREE;
}

function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function HelpPanel() {
  const { user, apiBase, authHeaders } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const planLimit = getPlanLimit(user?.membershipType);
  const openTickets = (tickets) => tickets.filter(t => t.status === 'OPEN').length;

  const [view, setView] = useState('list');
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('OPEN');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadTickets() {
    setLoading(true);
    try {
      const url = isAdmin
        ? `${apiBase}/api/support/admin/tickets`
        : `${apiBase}/api/support/tickets`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) setTickets(await res.json());
    } catch (e) {}
    setLoading(false);
  }

  async function openTicket(ticket) {
    setActiveTicket(ticket);
    setMessages([]);
    setReplyText('');
    setError('');
    setView('chat');
    try {
      const res = await fetch(
        `${apiBase}/api/support/tickets/${ticket.id}/messages`,
        { headers: authHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setActiveTicket(data.ticket || ticket);
      }
    } catch (e) {}
  }

  async function submitNewTicket() {
    if (!newSubject.trim() || !newMessage.trim()) { setError('Please fill in both fields.'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch(`${apiBase}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ subject: newSubject.trim(), message: newMessage.trim() }),
      });
      if (res.ok) {
        const ticket = await res.json();
        setNewSubject(''); setNewMessage('');
        await loadTickets();
        await openTicket(ticket);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to send.');
      }
    } catch (e) { setError('Network error.'); }
    setSending(false);
  }

  async function sendReply() {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true); setError('');
    try {
      const url = isAdmin
        ? `${apiBase}/api/support/admin/tickets/${activeTicket.id}/reply`
        : `${apiBase}/api/support/tickets/${activeTicket.id}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setReplyText('');
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to send.');
      }
    } catch (e) { setError('Network error.'); }
    setSending(false);
  }

  async function closeTicket() {
    if (!activeTicket) return;
    try {
      const res = await fetch(`${apiBase}/api/support/admin/tickets/${activeTicket.id}/close`,
        { method: 'POST', headers: authHeaders() });
      if (res.ok) {
        const updated = await res.json();
        setActiveTicket(updated);
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
    } catch (e) {}
  }

  async function deleteTicket(ticketId) {
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      const res = await fetch(`${apiBase}/api/support/admin/tickets/${ticketId}`,
        { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (activeTicket?.id === ticketId) { setView('list'); setActiveTicket(null); }
      }
    } catch (e) {}
  }

  const filteredTickets = isAdmin
    ? (filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter))
    : tickets;

  // ── CHAT VIEW ────────────────────────────────────────────────────────────────
  if (view === 'chat' && activeTicket) {
    const isClosed = activeTicket.status === 'CLOSED';
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b1120' }}>
        {/* Chat Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderBottom: '1px solid #1e293b',
          background: '#0f172a', flexShrink: 0,
        }}>
          <button onClick={() => { setView('list'); setActiveTicket(null); }} style={{
            background: '#1e293b', border: 'none', borderRadius: 8,
            color: '#94a3b8', cursor: 'pointer', padding: '6px 10px',
            fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center',
          }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeTicket.subject}
            </div>
            {isAdmin && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{activeTicket.userEmail}</div>
            )}
          </div>
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: isClosed ? 'rgba(100,116,139,0.2)' : 'rgba(16,185,129,0.15)',
            color: isClosed ? '#64748b' : '#10b981',
          }}>{activeTicket.status}</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#334155', paddingTop: 40, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
              No messages yet
            </div>
          )}
          {messages.map(msg => {
            const fromAdmin = msg.senderType === 'ADMIN';
            const isOwn = isAdmin ? fromAdmin : !fromAdmin;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: fromAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {fromAdmin ? 'S' : (activeTicket.userEmail?.[0] || 'U').toUpperCase()}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  {fromAdmin && !isAdmin && (
                    <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 600, marginBottom: 3, paddingLeft: 2 }}>Support Team</div>
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isOwn ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#1e293b',
                    color: '#f1f5f9', fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
                  }}>{msg.message}</div>
                  <div style={{ fontSize: 10, color: '#334155', marginTop: 4, textAlign: isOwn ? 'right' : 'left', paddingLeft: 2 }}>
                    {fmt(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ padding: '0 16px 6px', fontSize: 12, color: '#ef4444' }}>{error}</div>}

        {/* Admin action buttons */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
            {!isClosed && (
              <button onClick={closeTicket} style={{
                flex: 1, padding: '8px', background: 'transparent',
                color: '#10b981', border: '1px solid #10b981',
                borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>✓ Mark Resolved</button>
            )}
            <button onClick={() => deleteTicket(activeTicket.id)} style={{
              flex: 1, padding: '8px', background: 'transparent',
              color: '#ef4444', border: '1px solid #ef4444',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}>🗑 Delete</button>
          </div>
        )}

        {/* Reply input */}
        {!isClosed ? (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', gap: 8, flexShrink: 0, background: '#0f172a' }}>
            <textarea
              ref={textareaRef}
              style={{
                flex: 1, background: '#1e293b', border: '1px solid #2d3f55',
                borderRadius: 12, padding: '10px 14px', color: '#f1f5f9',
                fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit',
                minHeight: 44, maxHeight: 120, lineHeight: 1.5,
              }}
              placeholder={isAdmin ? 'Reply to user...' : 'Type your message...'}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              rows={2}
            />
            <button
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
              style={{
                padding: '0 18px', borderRadius: 12, border: 'none', cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                background: sending || !replyText.trim() ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#7c3aed)',
                color: sending || !replyText.trim() ? '#334155' : '#fff',
                fontWeight: 700, fontSize: 13, flexShrink: 0, transition: 'all 0.15s',
              }}
            >{sending ? '...' : '➤'}</button>
          </div>
        ) : (
          <div style={{ padding: '14px', textAlign: 'center', fontSize: 13, color: '#475569', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
            This conversation has been resolved ✓
          </div>
        )}
      </div>
    );
  }

  // ── NEW TICKET FORM ─────────────────────────────────────────────────────────
  if (view === 'new') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b1120' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid #1e293b', background: '#0f172a', flexShrink: 0 }}>
          <button onClick={() => { setView('list'); setError(''); }} style={{
            background: '#1e293b', border: 'none', borderRadius: 8,
            color: '#94a3b8', cursor: 'pointer', padding: '6px 10px', fontSize: 16, lineHeight: 1,
          }}>←</button>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>New Conversation</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          {/* Info banner */}
          <div style={{
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 24, display: 'flex', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 2 }}>How it works</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                Describe your issue and our support team will respond as soon as possible. We typically reply within 24 hours.
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Subject
            </label>
            <input
              style={{
                width: '100%', background: '#1e293b', border: '1px solid #2d3f55',
                borderRadius: 10, padding: '11px 14px', color: '#f1f5f9',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              placeholder="e.g. Can't connect my Instagram account"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#2d3f55'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Message
            </label>
            <textarea
              style={{
                width: '100%', background: '#1e293b', border: '1px solid #2d3f55',
                borderRadius: 10, padding: '11px 14px', color: '#f1f5f9',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
                resize: 'vertical', minHeight: 120, boxSizing: 'border-box', lineHeight: 1.6,
              }}
              placeholder="Describe your problem in detail..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#2d3f55'}
            />
          </div>

          <button
            onClick={submitNewTicket}
            disabled={sending || !newSubject.trim() || !newMessage.trim()}
            style={{
              width: '100%', padding: '13px',
              background: sending || !newSubject.trim() || !newMessage.trim()
                ? '#1e293b'
                : 'linear-gradient(135deg,#6366f1,#7c3aed)',
              color: sending || !newSubject.trim() || !newMessage.trim() ? '#334155' : '#fff',
              border: 'none', borderRadius: 12, cursor: sending || !newSubject.trim() || !newMessage.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'all 0.2s',
            }}
          >{sending ? 'Sending...' : 'Send Message'}</button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0b1120' }}>

      {/* Header banner */}
      <div style={{
        background: isAdmin
          ? 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        padding: '24px 20px 20px', borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            {isAdmin ? '🎧' : '💬'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>
                {isAdmin ? 'Support Inbox' : 'Help & Support'}
              </div>
              {!isAdmin && planLimit.priority && (
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#fff',
                }}>⚡ Priority</span>
              )}
              {!isAdmin && !planLimit.priority && (
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: '#1e293b', color: '#64748b', border: '1px solid #334155',
                }}>{planLimit.label}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
              {isAdmin
                ? `${tickets.length} total conversation${tickets.length !== 1 ? 's' : ''}`
                : planLimit.priority
                  ? 'Priority support — faster responses guaranteed'
                  : 'We typically reply within 24 hours'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Admin filter tabs */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['OPEN', 'CLOSED', 'ALL'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: filter === f ? '#6366f1' : '#1e293b',
                color: filter === f ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}>{f}</button>
            ))}
          </div>
        )}

        {/* New conversation button (users only) */}
        {!isAdmin && (() => {
          const openCount = openTickets(tickets);
          const atLimit = openCount >= planLimit.maxTickets;
          return (
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => { if (!atLimit) { setView('new'); setError(''); } }}
                disabled={atLimit}
                style={{
                  width: '100%', padding: '12px 20px',
                  background: atLimit ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#7c3aed)',
                  color: atLimit ? '#475569' : '#fff',
                  border: atLimit ? '1px solid #334155' : 'none',
                  borderRadius: 12, cursor: atLimit ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: atLimit ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 18 }}>+</span>
                {atLimit ? `Limit reached (${planLimit.maxTickets} open ticket${planLimit.maxTickets !== 1 ? 's' : ''})` : 'New Conversation'}
              </button>
              {/* Upgrade nudge for FREE/STARTER */}
              {atLimit && planLimit.maxTickets < Infinity && (
                <div style={{
                  marginTop: 10, padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>🚀</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>
                      Upgrade for more support
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                      {planLimit.maxTickets === 1
                        ? 'Free plan: 1 open ticket. Upgrade to Starter for 3 or Pro for unlimited.'
                        : 'Starter plan: 3 open tickets. Upgrade to Pro for unlimited + priority support.'}
                    </div>
                  </div>
                </div>
              )}
              {/* Ticket count indicator */}
              {!atLimit && planLimit.maxTickets < Infinity && (
                <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: '#475569' }}>
                  {openCount} / {planLimit.maxTickets} open tickets used
                </div>
              )}
            </div>
          );
        })()}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#334155', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            Loading...
          </div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isAdmin ? '📭' : '🙌'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              {isAdmin ? 'No conversations yet' : 'No conversations yet'}
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              {isAdmin
                ? 'User support messages will appear here.'
                : 'Click "New Conversation" above to reach our support team.'}
            </div>
          </div>
        )}

        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            onClick={() => openTicket(ticket)}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.background = '#172033';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e293b';
              e.currentTarget.style.background = '#131f35';
            }}
            style={{
              background: '#131f35', borderRadius: 14, padding: '14px 16px',
              marginBottom: 10, cursor: 'pointer',
              border: '1px solid #1e293b', transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isAdmin && (
                  <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 3 }}>
                    {ticket.userEmail}
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ticket.subject}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>{fmt(ticket.createdAt)}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0,
                background: ticket.status === 'OPEN' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                color: ticket.status === 'OPEN' ? '#10b981' : '#64748b',
              }}>{ticket.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
