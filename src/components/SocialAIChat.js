import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'https://api.wintaibot.com';
const BRAND_LOGO_SRC = '/android-chrome-192x192.png';

const SUGGESTED = [
  "What were my best posts last month?",
  "Which platform gets me the most engagement?",
  "What should I post next week?",
  "What's my best time to post?",
  "Which content type performs best for me?",
  "Which posts got the most comments?",
];

export default function SocialAIChat() {
  const { authHeaders } = useAuth();
  const bottomRef = useRef(null);

  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [indexing, setIndexing]       = useState(true);
  const [indexCount, setIndexCount]   = useState(null);
  const [indexError, setIndexError]   = useState('');
  const [thinking, setThinking]       = useState(false);
  const [reindexing, setReindexing]   = useState(false);

  /* ── Index social data on mount ── */
  useEffect(() => {
    setIndexing(true);
    fetch(`${API}/api/rag/social/index`, { method: 'POST', headers: authHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setIndexError(data.error);
        } else {
          setIndexCount(data.indexed);
          if (data.indexed === 0) {
            setIndexError('No posts found to index. Publish some content first!');
          }
        }
      })
      .catch(() => setIndexError('Failed to analyze social data'))
      .finally(() => setIndexing(false));
  }, [authHeaders]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  /* ── Re-index manually ── */
  const reindex = async () => {
    setReindexing(true);
    setIndexError('');
    try {
      const res = await fetch(`${API}/api/rag/social/index`, { method: 'POST', headers: authHeaders() });
      const data = await res.json();
      setIndexCount(data.indexed);
      if (data.indexed === 0) setIndexError('No posts found to index.');
    } catch {
      setIndexError('Refresh failed');
    } finally {
      setReindexing(false);
    }
  };

  /* ── Send question ── */
  const send = async (question) => {
    const q = (question || input).trim();
    if (!q || thinking) return;
    setInput('');

    const userMsg = { role: 'user', text: q, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const res = await fetch(`${API}/api/rag/social/query`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      const aiMsg = {
        role: 'ai',
        text: data.answer || data.error || 'No answer returned',
        ts: Date.now(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error — please try again', ts: Date.now() }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div style={s.wrap}>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>
            <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" style={s.titleLogo} />
            <span>Social AI</span>
          </h2>
          <p style={s.sub}>Ask anything about your social media performance. AI answers using your actual post data.</p>
        </div>
        <button
          style={{ ...s.reindexBtn, opacity: reindexing ? 0.6 : 1 }}
          onClick={reindex}
          disabled={reindexing}
          title="Re-analyze your posts (refreshes data)"
        >
          {reindexing ? '⏳ Refreshing…' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* ── STATUS BAR ── */}
      {indexing ? (
        <div style={s.statusBar}>
          <div style={s.spinner} />
          <span>Analyzing your posts…</span>
        </div>
      ) : indexError ? (
        <div style={s.errorBar}>{indexError}</div>
      ) : (
        <div style={s.successBar}>
          ✅ Analyzed {indexCount} posts — ready to answer your questions!
        </div>
      )}

      {/* ── CHAT AREA ── */}
      <div style={s.chatArea}>

        {/* Welcome + suggested questions (shown when chat is empty) */}
        {messages.length === 0 && !indexing && (
          <div style={s.welcome}>
            <img src={BRAND_LOGO_SRC} alt="W!ntAi logo" style={s.welcomeLogo} />
            <p style={s.welcomeText}>
              Hey! I've analyzed your social media history. Ask me anything about your performance.
            </p>
            <div style={s.chips}>
              {SUGGESTED.map(q => (
                <button key={q} style={s.chip} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'ai' && <img src={BRAND_LOGO_SRC} alt="AI" style={s.aiAvatarLogo} />}
            <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.aiBubble) }}>
              {msg.text.split('\n').map((line, li) => (
                <span key={li}>{line}{li < msg.text.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
            {msg.role === 'user' && <div style={s.userAvatar}>👤</div>}
          </div>
        ))}

        {/* Typing indicator */}
        {thinking && (
          <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
            <img src={BRAND_LOGO_SRC} alt="AI" style={s.aiAvatarLogo} />
            <div style={{ ...s.bubble, ...s.aiBubble, ...s.thinkingBubble }}>
              <span style={s.dot} />
              <span style={s.dot} />
              <span style={s.dot} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about your social media performance…"
          disabled={indexing || thinking}
        />
        <button
          style={{ ...s.sendBtn, opacity: (!input.trim() || thinking || indexing) ? 0.5 : 1 }}
          onClick={() => send()}
          disabled={!input.trim() || thinking || indexing}
        >
          Send ↗
        </button>
      </div>

      {/* Suggested chips below input */}
      {messages.length > 0 && (
        <div style={{ ...s.chips, marginTop: 8, paddingBottom: 4 }}>
          {SUGGESTED.slice(0, 3).map(q => (
            <button key={q} style={s.chip} onClick={() => send(q)}>{q}</button>
          ))}
        </div>
      )}

    </div>
  );
}

/* ── Styles ── */
const s = {
  wrap: {
    maxWidth: 780, margin: '0 auto', padding: '24px 20px',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Inter', -apple-system, sans-serif",
    height: 'calc(100vh - 120px)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12,
    marginBottom: 16, flexShrink: 0,
  },
  title:  { fontSize: 22, fontWeight: 700, color: '#1e293b', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 8 },
  titleLogo: { width: 26, height: 26, borderRadius: 6, display: 'block', flexShrink: 0 },
  sub:    { fontSize: 13, color: '#64748b', marginTop: 4 },
  reindexBtn: {
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    color: '#475569', borderRadius: 10, padding: '7px 14px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  statusBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#ede9fe', color: '#5b21b6',
    borderRadius: 10, padding: '10px 16px', fontSize: 13,
    marginBottom: 12, flexShrink: 0,
  },
  errorBar: {
    background: '#fee2e2', color: '#991b1b',
    borderRadius: 10, padding: '10px 16px', fontSize: 13,
    marginBottom: 12, flexShrink: 0,
  },
  successBar: {
    background: '#dcfce7', color: '#166534',
    borderRadius: 10, padding: '10px 16px', fontSize: 13,
    marginBottom: 12, flexShrink: 0,
  },
  spinner: {
    width: 18, height: 18,
    border: '2.5px solid #ddd6fe',
    borderTop: '2.5px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  chatArea: {
    flex: 1, overflowY: 'auto',
    background: '#f8fafc', borderRadius: 16,
    padding: '20px 16px', marginBottom: 12,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  welcome: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 12, padding: '20px 0',
  },
  welcomeLogo: { width: 48, height: 48, borderRadius: 10, display: 'block' },
  welcomeText: {
    fontSize: 14, color: '#475569', textAlign: 'center',
    maxWidth: 440, lineHeight: 1.6,
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    background: '#ede9fe', color: '#5b21b6',
    border: '1px solid #ddd6fe', borderRadius: 20,
    padding: '7px 14px', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'background 0.15s',
  },
  msgRow: {
    display: 'flex', alignItems: 'flex-end', gap: 8,
  },
  aiAvatarLogo: { width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginBottom: 2, display: 'block' },
  userAvatar: { fontSize: 18, flexShrink: 0, marginBottom: 2 },
  bubble: {
    maxWidth: '78%', padding: '12px 16px',
    borderRadius: 14, fontSize: 14, lineHeight: 1.55,
  },
  userBubble: {
    background: '#6366f1', color: '#fff',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    background: '#fff', color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: 4,
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  thinkingBubble: {
    display: 'flex', gap: 5, alignItems: 'center',
    padding: '12px 16px',
  },
  dot: {
    display: 'inline-block',
    width: 7, height: 7, borderRadius: '50%',
    background: '#94a3b8',
    animation: 'bounce 1.2s infinite',
  },
  inputRow: {
    display: 'flex', gap: 8, flexShrink: 0,
  },
  input: {
    flex: 1, padding: '12px 16px',
    border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 14, color: '#1e293b', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  },
  sendBtn: {
    background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: 12,
    padding: '12px 20px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s', whiteSpace: 'nowrap',
  },
};
