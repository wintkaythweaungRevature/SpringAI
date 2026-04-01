'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import './ChatComponent.css';

export default function ChatComponent() {
  const { token, apiBase } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: string; text: string; isError?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  const askAI = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const fullUrl = `${apiBase || 'https://api.wintaibot.com'}/api/ai/ask-ai?prompt=${encodeURIComponent(trimmed)}`;
      const headers: Record<string, string> = { Accept: 'text/plain' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(fullUrl, { method: 'GET', headers });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.text();
      setMessages((prev) => [...prev, { role: 'ai', text: data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'This feature is currently under maintenance. Please try again later.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div className="chat-header-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="chat-header-title">Ask AI</h2>
          <p className="chat-header-sub">Powered by W!ntAi</p>
        </div>
        {messages.length > 0 && (
          <button
            className="chat-clear-btn"
            onClick={() => setMessages([])}
            title="Clear chat"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="chat-empty-title">How can I help you today?</p>
            <p className="chat-empty-sub">Type a message below to start the conversation.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message-row ${msg.role === 'user' ? 'row-user' : 'row-ai'}`}
          >
            {msg.role === 'ai' && (
              <div className="chat-avatar ai-avatar">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            )}
            <div
              className={`chat-bubble ${
                msg.role === 'user'
                  ? 'bubble-user'
                  : msg.isError
                    ? 'bubble-error'
                    : 'bubble-ai'
              }`}
            >
              <p className="bubble-text">{msg.text}</p>
            </div>
            {msg.role === 'user' && (
              <div className="chat-avatar user-avatar">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message-row row-ai">
            <div className="chat-avatar ai-avatar">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className="chat-bubble bubble-ai bubble-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={prompt}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={loading}
        />
        <button
          className={`chat-send-btn ${!prompt.trim() || loading ? 'send-disabled' : ''}`}
          onClick={askAI}
          disabled={!prompt.trim() || loading}
          title="Send"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
