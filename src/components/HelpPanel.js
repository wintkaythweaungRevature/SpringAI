import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'breezegirl6@gmail.com';

function fmt(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function HelpPanel() {
  const { user, apiBase, authHeaders } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [view, setView] = useState('list'); // 'list' | 'new' | 'chat'
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('OPEN'); // admin filter
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
    if (!newSubject.trim() || !newMessage.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ subject: newSubject.trim(), message: newMessage.trim() }),
      });
      if (res.ok) {
        const ticket = await res.json();
        setNewSubject('');
        setNewMessage('');
        await loadTickets();
        await openTicket(ticket);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to send.');
      }
    } catch (e) {
      setError('Network error.');
    }
    setSending(false);
  }

  async function sendReply() {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true);
    setError('');
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
    } catch (e) {
      setError('Network error.');
    }
    setSending(false);
  }

  async function closeTicket() {
    if (!activeTicket) return;
    try {
      const res = await fetch(
        `${apiBase}/api/support/admin/tickets/${activeTicket.id}/close`,
        { method: 'POST', headers: authHeaders() }
      );
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
      const res = await fetch(
        `${apiBase}/api/support/admin/tickets/${ticketId}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        if (activeTicket?.id === ticketId) {
          setView('list');
          setActiveTicket(null);
        }
      }
    } catch (e) {}
  }

  const filteredTickets = isAdmin
    ? (filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter))
    : tickets;

  const s = {
    wrap: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      color: '#f1f5f9',
      fontFamily: 'inherit',
    },
    header: {
      padding: '20px 24px 14px',
      borderBottom: '1px solid #1e293b',
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#f1f5f9',
      margin: 0,
    },
    headerSub: {
      fontSize: 13,
      color: '#64748b',
      margin: '4px 0 0',
    },
    body: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 16px 16px',
    },
    filterRow: {
      display: 'flex',
      gap: 8,
      padding: '14px 0 8px',
    },
    filterBtn: (active) => ({
      padding: '5px 14px',
      borderRadius: 20,
      border: 'none',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
      background: active ? '#6366f1' : '#1e293b',
      color: active ? '#fff' : '#94a3b8',
      transition: 'all 0.15s',
    }),
    newBtn: {
      margin: '14px 0 8px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      width: '100%',
    },
    ticketCard: (isOpen) => ({
      background: '#1e293b',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 10,
      cursor: 'pointer',
      border: `1px solid ${isOpen ? '#334155' : '#1e293b'}`,
      transition: 'border-color 0.15s',
    }),
    ticketSubject: {
      fontSize: 14,
      fontWeight: 600,
      color: '#f1f5f9',
      marginBottom: 4,
    },
    ticketMeta: {
      fontSize: 12,
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    badge: (status) => ({
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: status === 'OPEN' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.2)',
      color: status === 'OPEN' ? '#10b981' : '#64748b',
    }),
    chatHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 24px 14px',
      borderBottom: '1px solid #1e293b',
      flexShrink: 0,
    },
    backBtn: {
      background: 'none',
      border: 'none',
      color: '#94a3b8',
      cursor: 'pointer',
      fontSize: 22,
      padding: '0 4px',
      lineHeight: 1,
    },
    chatTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: 600,
      color: '#f1f5f9',
    },
    messages: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    bubble: (isUser) => ({
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
    }),
    bubbleInner: (isUser) => ({
      maxWidth: '72%',
      padding: '10px 14px',
      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      background: isUser ? '#6366f1' : '#1e293b',
      color: '#f1f5f9',
      fontSize: 14,
      lineHeight: 1.5,
      wordBreak: 'break-word',
    }),
    bubbleTime: {
      fontSize: 10,
      color: '#475569',
      marginTop: 4,
      textAlign: 'center',
    },
    avatar: (isAdmin) => ({
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: '#fff',
      flexShrink: 0,
    }),
    inputRow: {
      padding: '12px 16px',
      borderTop: '1px solid #1e293b',
      display: 'flex',
      gap: 8,
      flexShrink: 0,
    },
    textarea: {
      flex: 1,
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 10,
      padding: '10px 12px',
      color: '#f1f5f9',
      fontSize: 14,
      resize: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      minHeight: 40,
      maxHeight: 120,
    },
    sendBtn: (disabled) => ({
      padding: '0 18px',
      background: disabled ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: disabled ? '#475569' : '#fff',
      border: 'none',
      borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 600,
      fontSize: 13,
      flexShrink: 0,
    }),
    adminActions: {
      display: 'flex',
      gap: 8,
      padding: '8px 16px',
      borderTop: '1px solid #1e293b',
      flexShrink: 0,
    },
    closeBtn: {
      flex: 1,
      padding: '9px',
      background: '#1e293b',
      color: '#10b981',
      border: '1px solid #10b981',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
    },
    deleteBtn: {
      flex: 1,
      padding: '9px',
      background: '#1e293b',
      color: '#ef4444',
      border: '1px solid #ef4444',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 600,
    },
    formGroup: {
      marginBottom: 14,
    },
    label: {
      display: 'block',
      fontSize: 12,
      fontWeight: 600,
      color: '#94a3b8',
      marginBottom: 6,
    },
    input: {
      width: '100%',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '10px 12px',
      color: '#f1f5f9',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    formTextarea: {
      width: '100%',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '10px 12px',
      color: '#f1f5f9',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: 100,
      boxSizing: 'border-box',
    },
    submitBtn: (disabled) => ({
      width: '100%',
      padding: '12px',
      background: disabled ? '#334155' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: disabled ? '#475569' : '#fff',
      border: 'none',
      borderRadius: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 700,
      fontSize: 14,
      marginTop: 4,
    }),
    errorText: {
      color: '#ef4444',
      fontSize: 12,
      marginBottom: 10,
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#475569',
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: '#64748b',
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 13,
      color: '#475569',
    },
  };

  // ── CHAT VIEW ──────────────────────────────────────────────────────────────
  if (view === 'chat' && activeTicket) {
    const isClosed = activeTicket.status === 'CLOSED';
    return (
      <div style={s.wrap}>
        <div style={s.chatHeader}>
          <button style={s.backBtn} onClick={() => { setView('list'); setActiveTicket(null); }}>
            ←
          </button>
          <div style={s.chatTitle}>
            {activeTicket.subject}
            {isAdmin && (
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                {activeTicket.userEmail}
              </div>
            )}
          </div>
          <span style={s.badge(activeTicket.status)}>{activeTicket.status}</span>
        </div>

        <div style={s.messages}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#475569', paddingTop: 40, fontSize: 13 }}>
              No messages yet.
            </div>
          )}
          {messages.map(msg => {
            const fromAdmin = msg.senderType === 'ADMIN';
            const isOwnMsg = isAdmin ? fromAdmin : !fromAdmin;
            return (
              <div key={msg.id}>
                <div style={s.bubble(isOwnMsg)}>
                  <div style={s.avatar(fromAdmin)}>
                    {fromAdmin ? 'A' : (activeTicket.userEmail?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div style={s.bubbleInner(isOwnMsg)}>{msg.message}</div>
                    <div style={{ ...s.bubbleTime, textAlign: isOwnMsg ? 'right' : 'left' }}>
                      {fmt(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ padding: '0 16px 4px', ...s.errorText }}>{error}</div>}

        {isAdmin && (
          <div style={s.adminActions}>
            {!isClosed && (
              <button style={s.closeBtn} onClick={closeTicket}>Mark Resolved</button>
            )}
            <button style={s.deleteBtn} onClick={() => deleteTicket(activeTicket.id)}>
              Delete Conversation
            </button>
          </div>
        )}

        {!isClosed && (
          <div style={s.inputRow}>
            <textarea
              style={s.textarea}
              placeholder="Type your message..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              rows={2}
            />
            <button
              style={s.sendBtn(sending || !replyText.trim())}
              onClick={sendReply}
              disabled={sending || !replyText.trim()}
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        )}
        {isClosed && (
          <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#475569', borderTop: '1px solid #1e293b' }}>
            This conversation has been resolved.
          </div>
        )}
      </div>
    );
  }

  // ── NEW TICKET FORM ────────────────────────────────────────────────────────
  if (view === 'new') {
    return (
      <div style={s.wrap}>
        <div style={s.chatHeader}>
          <button style={s.backBtn} onClick={() => { setView('list'); setError(''); }}>←</button>
          <div style={s.chatTitle}>New Conversation</div>
        </div>
        <div style={s.body}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '16px 0 20px' }}>
            Describe your issue and our support team will respond as soon as possible.
          </p>
          {error && <div style={s.errorText}>{error}</div>}
          <div style={s.formGroup}>
            <label style={s.label}>Subject</label>
            <input
              style={s.input}
              placeholder="e.g. Can't connect my Instagram account"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Message</label>
            <textarea
              style={s.formTextarea}
              placeholder="Describe your problem in detail..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
          </div>
          <button
            style={s.submitBtn(sending || !newSubject.trim() || !newMessage.trim())}
            onClick={submitNewTicket}
            disabled={sending || !newSubject.trim() || !newMessage.trim()}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <p style={s.headerTitle}>
          {isAdmin ? '🎧 Support Inbox' : '💬 Help & Support'}
        </p>
        <p style={s.headerSub}>
          {isAdmin
            ? 'All user conversations'
            : 'Ask us anything — we typically reply within 24 hours.'}
        </p>
      </div>

      <div style={s.body}>
        {isAdmin ? (
          <div style={s.filterRow}>
            {['OPEN', 'CLOSED', 'ALL'].map(f => (
              <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        ) : (
          <button style={s.newBtn} onClick={() => { setView('new'); setError(''); }}>
            + New Conversation
          </button>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 30, color: '#475569', fontSize: 13 }}>
            Loading...
          </div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>💬</div>
            <div style={s.emptyTitle}>
              {isAdmin ? 'No conversations yet' : 'No conversations yet'}
            </div>
            <div style={s.emptyDesc}>
              {isAdmin
                ? 'User support messages will appear here.'
                : 'Click "New Conversation" to get help.'}
            </div>
          </div>
        )}

        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            style={s.ticketCard(ticket.status === 'OPEN')}
            onClick={() => openTicket(ticket)}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = ticket.status === 'OPEN' ? '#334155' : '#1e293b'}
          >
            <div style={s.ticketSubject}>{ticket.subject}</div>
            <div style={s.ticketMeta}>
              {isAdmin && <span style={{ color: '#94a3b8' }}>{ticket.userEmail}</span>}
              <span style={s.badge(ticket.status)}>{ticket.status}</span>
              <span>{fmt(ticket.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
