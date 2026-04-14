import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── helpers ────────────────────────────────────────────────────────────────

const PLATFORM_EMOJI = {
  reddit: '🔴',
  twitter: '🐦',
  x: '🐦',
  instagram: '📸',
  facebook: '🔵',
  linkedin: '💼',
  youtube: '▶️',
  tiktok: '🎵',
  news: '📰',
};

function getPlatformEmoji(platform) {
  if (!platform) return '🌐';
  return PLATFORM_EMOJI[platform.toLowerCase()] || '🌐';
}

const SENTIMENT_CONFIG = {
  POSITIVE: { label: '🟢 Positive', color: '#22c55e', border: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
  NEUTRAL:  { label: '🟡 Neutral',  color: '#94a3b8', border: '#475569', bg: 'rgba(148,163,184,0.10)', text: '#94a3b8' },
  NEGATIVE: { label: '🔴 Negative', color: '#ef4444', border: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: '#f87171' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return dateStr; }
}

// ─── sub-components ──────────────────────────────────────────────────────────

function MentionCard({ mention, onDraftResponse }) {
  const [expanded, setExpanded] = useState(false);
  const text = mention.mentionText || '';
  const truncated = text.length > 200;
  const displayText = truncated && !expanded ? text.slice(0, 200) : text;
  const sc = SENTIMENT_CONFIG[mention.sentiment] || SENTIMENT_CONFIG.NEUTRAL;
  const isUnreadNegative = mention.sentiment === 'NEGATIVE' && !mention.alertRead;

  return (
    <div style={{
      background: '#1e293b',
      borderRadius: 12,
      borderLeft: `4px solid ${sc.border}`,
      padding: '16px 18px',
      marginBottom: 12,
      position: 'relative',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 1px ${sc.border}44`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Unread negative indicator dot */}
      {isUnreadNegative && (
        <span style={{
          position: 'absolute', top: 14, right: 14,
          width: 9, height: 9, borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 6px #ef4444aa',
          display: 'inline-block',
        }} title="Unread negative mention" />
      )}

      {/* Top row: platform + sentiment + keyword */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{
          background: '#0f172a', borderRadius: 8,
          padding: '2px 9px', fontSize: 11, fontWeight: 700, color: '#cbd5e1',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          {getPlatformEmoji(mention.platform)}
          <span style={{ textTransform: 'capitalize' }}>{mention.platform || 'Unknown'}</span>
        </span>

        <span style={{
          background: sc.bg, border: `1px solid ${sc.border}44`,
          borderRadius: 8, padding: '2px 9px',
          fontSize: 11, fontWeight: 700, color: sc.text,
        }}>
          {sc.label}
        </span>

        {mention.keyword && (
          <span style={{
            background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 8, padding: '2px 9px',
            fontSize: 11, fontWeight: 700, color: '#a5b4fc',
          }}>
            🔑 {mention.keyword}
          </span>
        )}
      </div>

      {/* Author */}
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
        @{mention.authorUsername || 'unknown'}
      </div>

      {/* Mention text */}
      <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.65, marginBottom: 10 }}>
        {displayText}
        {truncated && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6366f1', fontSize: 13, fontWeight: 600, padding: '0 4px',
            }}
          >
            {expanded ? ' show less' : '... show more'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#475569' }}>
          {formatDate(mention.mentionedAt || mention.fetchedAt)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {mention.postUrl && (
            <a
              href={mention.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}
            >
              View Original ↗
            </a>
          )}
          <button
            onClick={() => onDraftResponse(mention)}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#818cf8)',
              border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✍️ Draft Response
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponseModal({ mention, aiResponse, loading, onClose }) {
  const [copied, setCopied] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (aiResponse) setEditedResponse(aiResponse);
  }, [aiResponse]);

  const handleCopy = () => {
    const val = editedResponse || aiResponse || '';
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const sc = SENTIMENT_CONFIG[mention?.sentiment] || SENTIMENT_CONFIG.NEUTRAL;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1e293b', borderRadius: 16,
        border: '1px solid #334155',
        width: '100%', maxWidth: 580,
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>✍️</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Draft Response</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
              color: '#94a3b8', width: 32, height: 32, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {/* Original mention */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Original Mention
            </div>
            <div style={{
              background: '#0f172a', borderRadius: 10, padding: '12px 14px',
              borderLeft: `3px solid ${sc.border}`,
            }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                @{mention?.authorUsername || 'unknown'} &middot; {getPlatformEmoji(mention?.platform)} {mention?.platform}
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                {mention?.mentionText || ''}
              </div>
            </div>
          </div>

          {/* AI response area */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              AI Suggested Response
            </div>

            {loading ? (
              <div style={{
                background: '#0f172a', borderRadius: 10, padding: '20px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  display: 'inline-block', width: 18, height: 18,
                  border: '2px solid #334155', borderTopColor: '#6366f1',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                  Generating response...
                </span>
              </div>
            ) : aiResponse ? (
              <textarea
                ref={textareaRef}
                value={editedResponse}
                onChange={e => setEditedResponse(e.target.value)}
                rows={6}
                style={{
                  width: '100%', background: '#0f172a',
                  border: '1px solid #334155', borderRadius: 10,
                  padding: '12px 14px', color: '#e2e8f0',
                  fontSize: 13, lineHeight: 1.65, resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#334155'}
              />
            ) : (
              <div style={{
                background: '#0f172a', borderRadius: 10, padding: '16px 14px',
                color: '#475569', fontSize: 13, fontStyle: 'italic',
              }}>
                No response generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid #334155',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid #334155',
              color: '#94a3b8', fontSize: 13, fontWeight: 600,
            }}
          >
            Close
          </button>
          {aiResponse && !loading && (
            <button
              onClick={handleCopy}
              style={{
                padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                background: copied ? '#22c55e' : 'linear-gradient(135deg,#6366f1,#818cf8)',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Response'}
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function BrandGuardian() {
  const { apiBase, authHeaders } = useAuth();

  // Data state
  const [mentions, setMentions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [deletingKeywordId, setDeletingKeywordId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');

  // Modal state
  const [selectedMention, setSelectedMention] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

  // ── fetchers ───────────────────────────────────────────────────────────────

  const fetchMentions = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/mentions`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setMentions(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/keywords`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setKeywords(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/unread-count`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setUnreadCount(typeof data.count === 'number' ? data.count : 0);
      }
    } catch { /* silent */ }
  }, [apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchMentions(), fetchKeywords(), fetchUnreadCount()]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── keyword actions ────────────────────────────────────────────────────────

  const handleAddKeyword = async () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (keywords.length >= 10) { setError('Maximum 10 keywords allowed.'); return; }
    setAddingKeyword(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/keywords`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: trimmed }),
      });
      if (res.ok) {
        const saved = await res.json().catch(() => null);
        if (saved) setKeywords(prev => [...prev, saved]);
        setNewKeyword('');
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || err.message || 'Failed to add keyword.');
      }
    } catch {
      setError('Network error. Could not add keyword.');
    } finally {
      setAddingKeyword(false);
    }
  };

  const handleDeleteKeyword = async (id) => {
    setDeletingKeywordId(id);
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/keywords/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        setKeywords(prev => prev.filter(k => k.id !== id));
      } else {
        setError('Failed to delete keyword.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setDeletingKeywordId(null);
    }
  };

  // ── scan ───────────────────────────────────────────────────────────────────

  const handleScan = async () => {
    setScanning(true);
    setScanResult('');
    setError('');
    try {
      const res = await fetch(`${apiBase}/api/brand-guardian/scan`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setScanResult(data.result || 'Scan complete.');
        await Promise.all([fetchMentions(), fetchUnreadCount()]);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || err.message || 'Scan failed.');
      }
    } catch {
      setError('Network error during scan.');
    } finally {
      setScanning(false);
    }
  };

  // ── draft response ─────────────────────────────────────────────────────────

  const handleDraftResponse = async (mention) => {
    setSelectedMention(mention);
    setAiResponse(null);
    setLoadingResponse(true);

    // Fire both requests concurrently
    const promises = [
      fetch(`${apiBase}/api/brand-guardian/response`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentionId: mention.id }),
      }),
    ];

    if (mention.sentiment === 'NEGATIVE' && !mention.alertRead) {
      promises.push(
        fetch(`${apiBase}/api/brand-guardian/mentions/${mention.id}/read`, {
          method: 'PUT',
          headers: authHeaders(),
        }).then(() => {
          setMentions(prev => prev.map(m => m.id === mention.id ? { ...m, alertRead: true } : m));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }).catch(() => {})
      );
    }

    try {
      const [responseRes] = await Promise.all(promises);
      if (responseRes.ok) {
        const data = await responseRes.json().catch(() => ({}));
        setAiResponse(data.response || '');
      } else {
        const err = await responseRes.json().catch(() => ({}));
        setAiResponse(err.error || err.message || 'Could not generate response.');
      }
    } catch {
      setAiResponse('Network error. Could not generate response.');
    } finally {
      setLoadingResponse(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedMention(null);
    setAiResponse(null);
    setLoadingResponse(false);
  };

  // ── filtered mentions ──────────────────────────────────────────────────────

  const filteredMentions = mentions.filter(m => {
    if (showAlertsOnly) {
      return m.sentiment === 'NEGATIVE' && !m.alertRead;
    }
    if (sentimentFilter !== 'ALL') {
      return m.sentiment === sentimentFilter;
    }
    return true;
  });

  // ── styles ─────────────────────────────────────────────────────────────────

  const card = {
    background: '#1e293b',
    borderRadius: 14,
    border: '1px solid #334155',
    padding: '22px 24px',
    marginBottom: 22,
  };

  const filterBtn = (active) => ({
    padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700,
    background: active ? '#6366f1' : '#0f172a',
    color: active ? '#fff' : '#94a3b8',
    transition: 'background 0.15s, color 0.15s',
  });

  const FILTERS = [
    { key: 'ALL', label: 'All' },
    { key: 'POSITIVE', label: '🟢 Positive' },
    { key: 'NEUTRAL',  label: '🟡 Neutral' },
    { key: 'NEGATIVE', label: '🔴 Negative' },
  ];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      padding: '28px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      maxWidth: 820,
      margin: '0 auto',
    }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>
            AI Brand Guardian
          </h1>
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff',
              borderRadius: 20, padding: '2px 10px',
              fontSize: 12, fontWeight: 800,
            }}>
              {unreadCount} alert{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Monitor brand mentions across the web and craft AI-powered responses.
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 18,
          color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 16, padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 1: Keyword Tracker ─────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Tracked Keywords</span>
            <span style={{
              background: '#0f172a', border: '1px solid #334155',
              borderRadius: 20, padding: '1px 9px', fontSize: 11, fontWeight: 700, color: '#64748b',
            }}>
              {keywords.length}/10
            </span>
          </div>

          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: scanning ? 'not-allowed' : 'pointer',
              background: scanning ? '#334155' : 'linear-gradient(135deg,#6366f1,#818cf8)',
              color: scanning ? '#64748b' : '#fff',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'opacity 0.15s',
            }}
          >
            {scanning ? (
              <>
                <span style={{
                  display: 'inline-block', width: 13, height: 13,
                  border: '2px solid #475569', borderTopColor: '#94a3b8',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
                Scanning...
              </>
            ) : '🔄 Scan Now'}
          </button>
        </div>

        {scanResult && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8, padding: '8px 14px', marginBottom: 14,
            color: '#4ade80', fontSize: 13, fontWeight: 600,
          }}>
            ✓ {scanResult}
          </div>
        )}

        {/* Keyword tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, minHeight: 32 }}>
          {keywords.length === 0 && (
            <span style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
              No keywords yet. Add some to start monitoring.
            </span>
          )}
          {keywords.map(kw => (
            <span key={kw.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 20, padding: '4px 12px',
              fontSize: 13, color: '#a5b4fc', fontWeight: 600,
            }}>
              {kw.keyword}
              <button
                onClick={() => handleDeleteKeyword(kw.id)}
                disabled={deletingKeywordId === kw.id}
                title="Remove keyword"
                style={{
                  background: 'none', border: 'none', cursor: deletingKeywordId === kw.id ? 'not-allowed' : 'pointer',
                  color: deletingKeywordId === kw.id ? '#475569' : '#6366f1',
                  fontSize: 13, padding: 0, lineHeight: 1,
                  display: 'flex', alignItems: 'center',
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Add keyword input */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword(); }}
            placeholder="e.g. your brand name..."
            maxLength={80}
            disabled={keywords.length >= 10 || addingKeyword}
            style={{
              flex: 1, background: '#0f172a', border: '1px solid #334155',
              borderRadius: 9, padding: '9px 14px', color: '#e2e8f0',
              fontSize: 13, outline: 'none',
              opacity: keywords.length >= 10 ? 0.5 : 1,
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#334155'}
          />
          <button
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim() || keywords.length >= 10 || addingKeyword}
            style={{
              padding: '9px 18px', borderRadius: 9, border: 'none',
              background: (!newKeyword.trim() || keywords.length >= 10 || addingKeyword)
                ? '#334155' : 'linear-gradient(135deg,#6366f1,#818cf8)',
              color: (!newKeyword.trim() || keywords.length >= 10 || addingKeyword)
                ? '#475569' : '#fff',
              fontSize: 13, fontWeight: 700, cursor: (!newKeyword.trim() || keywords.length >= 10 || addingKeyword) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {addingKeyword ? 'Adding...' : '+ Add Keyword'}
          </button>
        </div>
        {keywords.length >= 10 && (
          <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
            ⚠ Maximum 10 keywords reached.
          </div>
        )}
      </div>

      {/* ── Section 2: Alert Banner ────────────────────────────────────────── */}
      {unreadCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.12))',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fca5a5' }}>
              You have {unreadCount} unread negative mention{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => {
              setShowAlertsOnly(v => !v);
              setSentimentFilter('ALL');
            }}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.5)',
              background: showAlertsOnly ? '#ef4444' : 'transparent',
              color: showAlertsOnly ? '#fff' : '#fca5a5',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {showAlertsOnly ? '✕ Clear Alert Filter' : '🔔 View Alerts Only'}
          </button>
        </div>
      )}

      {/* ── Section 3: Mentions Feed ──────────────────────────────────────── */}
      <div style={card}>
        {/* Filter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📡</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Mentions Feed</span>
            {!loading && (
              <span style={{
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: 20, padding: '1px 9px', fontSize: 11, fontWeight: 700, color: '#64748b',
              }}>
                {filteredMentions.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setSentimentFilter(f.key); setShowAlertsOnly(false); }}
                style={filterBtn(sentimentFilter === f.key && !showAlertsOnly)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mentions list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <div style={{
              display: 'inline-block', width: 28, height: 28,
              border: '3px solid #334155', borderTopColor: '#6366f1',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 12,
            }} />
            <div style={{ fontSize: 13 }}>Loading mentions...</div>
          </div>
        ) : filteredMentions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
              {showAlertsOnly ? 'No unread negative mentions.' : 'No mentions found.'}
            </div>
            {!showAlertsOnly && sentimentFilter === 'ALL' && (
              <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
                Add keywords and run a scan to start monitoring.
              </div>
            )}
          </div>
        ) : (
          filteredMentions.map(mention => (
            <MentionCard
              key={mention.id}
              mention={mention}
              onDraftResponse={handleDraftResponse}
            />
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedMention && (
        <ResponseModal
          mention={selectedMention}
          aiResponse={aiResponse}
          loading={loadingResponse}
          onClose={handleCloseModal}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
