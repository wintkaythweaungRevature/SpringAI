import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const SUGGESTED = [
  'How do I schedule a post?',
  'How do I invite a team member?',
  'What is the Brand Kit?',
  'How do I switch workspaces?',
  "What's the difference between PRO and GROWTH?",
  'How do I use the Hooks Generator?',
];

export default function AppHelpChat() {
  const { token, apiBase, authHeaders } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your WintAi assistant 👋 Ask me anything about how to use the app." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${base}/api/help/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json().catch(() => ({}));
      const answer = res.ok
        ? (data.answer || 'Sorry, I could not get a response.')
        : (data.error || 'Something went wrong. Please try again.');
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hasSent = messages.length > 1;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0b1120', fontFamily: 'inherit',
    }}>

      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>WintAi Assistant</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
              Ask me anything about using WintAi
            </div>
          </div>
        </div>

        {/* Suggested chips — shown before first message sent */}
        {!hasSent && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  padding: '5px 12px', borderRadius: 20,
                  border: '1px solid rgba(99,102,241,0.35)',
                  background: 'rgba(99,102,241,0.1)',
                  color: '#a5b4fc', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(99,102,241,0.25)';
                  e.target.style.color = '#c7d2fe';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(99,102,241,0.1)';
                  e.target.style.color = '#a5b4fc';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 8,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'assistant'
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : '#1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              {msg.role === 'assistant' ? '🤖' : 'You'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '76%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg,#6366f1,#7c3aed)'
                : '#1e293b',
              color: '#f1f5f9',
              fontSize: 14,
              lineHeight: 1.6,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#fff',
            }}>🤖</div>
            <div style={{
              padding: '10px 16px',
              background: '#1e293b',
              borderRadius: '16px 16px 16px 4px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#6366f1',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid #1e293b',
        display: 'flex', gap: 8, flexShrink: 0, background: '#0f172a',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about WintAi..."
          rows={1}
          style={{
            flex: 1, background: '#1e293b', border: '1px solid #2d3f55',
            borderRadius: 12, padding: '10px 14px', color: '#f1f5f9',
            fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit',
            minHeight: 44, maxHeight: 120, lineHeight: 1.5,
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
          onBlur={(e) => { e.target.style.borderColor = '#2d3f55'; }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            padding: '0 18px', borderRadius: 12, border: 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            background: loading || !input.trim()
              ? '#1e293b'
              : 'linear-gradient(135deg,#6366f1,#7c3aed)',
            color: loading || !input.trim() ? '#334155' : '#fff',
            fontWeight: 700, fontSize: 18, flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >➤</button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
