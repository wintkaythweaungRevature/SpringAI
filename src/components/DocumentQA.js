import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Document Q&A — RAG-backed PDF chat.
 *
 * Wires the existing backend RAG endpoints (`/api/rag/upload`, `/query`,
 * `/documents`, `/documents/{id}`) into a UI. Each user can upload PDFs,
 * which are chunked + embedded into pgvector. When they ask a question,
 * the backend retrieves the top-K relevant chunks + asks GPT to answer
 * grounded in those chunks (with citations).
 *
 * Single-screen layout:
 *   left  — upload zone + list of uploaded docs (with delete)
 *   right — chat thread (question/answer pairs) + input
 */
export default function DocumentQA() {
  const { apiBase, authHeaders } = useAuth();
  const base = apiBase || 'https://api.wintaibot.com';

  // ── State ────────────────────────────────────────────────────────────
  const [docs, setDocs]               = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [question, setQuestion]       = useState('');
  const [thread, setThread]           = useState([]); // [{q, a, sources?}]
  const [asking, setAsking]           = useState(false);
  const [askError, setAskError]       = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const fileInputRef = useRef(null);
  const threadEndRef = useRef(null);

  // ── Load existing documents ──────────────────────────────────────────
  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${base}/api/rag/documents`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setDocs(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
    finally { setLoadingDocs(false); }
  }, [base, authHeaders]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // ── Auto-scroll chat to latest answer ────────────────────────────────
  useEffect(() => {
    if (threadEndRef.current) threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, asking]);

  // ── Upload handler ───────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      setUploadError('Only PDF files are supported right now.');
      return;
    }
    setUploading(true); setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const headers = { ...authHeaders() };
      delete headers['Content-Type']; // browser sets multipart boundary
      const res = await fetch(`${base}/api/rag/upload`, {
        method: 'POST',
        headers,
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
      await loadDocs();
    } catch (e) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Ask a question ───────────────────────────────────────────────────
  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    setAsking(true); setAskError('');
    setQuestion('');
    setThread(prev => [...prev, { q, a: null, sources: [] }]);
    try {
      const res = await fetch(`${base}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Query failed (HTTP ${res.status})`);
      const answer = data.answer || data.result || data.response || '(no answer)';
      const sources = Array.isArray(data.sources) ? data.sources : [];
      setThread(prev => prev.map((t, i) =>
        i === prev.length - 1 ? { ...t, a: answer, sources } : t
      ));
    } catch (e) {
      setAskError(e.message || 'Failed to query');
      setThread(prev => prev.slice(0, -1));
    } finally {
      setAsking(false);
    }
  };

  // ── Delete a document ────────────────────────────────────────────────
  const deleteDoc = async (docId) => {
    try {
      const res = await fetch(`${base}/api/rag/documents/${docId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${res.status})`);
      }
      setDocs(prev => prev.filter(d => (d.docId || d.id) !== docId));
      setConfirmDeleteId(null);
    } catch (e) {
      setUploadError(e.message || 'Delete failed');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.shell}>
        {/* ── Header ── */}
        <div style={s.header}>
          <h1 style={s.title}>📄 Document Q&A</h1>
          <p style={s.subtitle}>
            Upload PDFs and ask questions. Answers are grounded in your documents
            with citations to the relevant chunks.
          </p>
        </div>

        <div style={s.split}>
          {/* ── Left: documents column ── */}
          <aside style={s.left}>
            <h3 style={s.sectionTitle}>Your Documents</h3>

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              style={{
                ...s.dropZone,
                ...(uploading ? s.dropZoneBusy : {}),
              }}
            >
              {uploading ? (
                <>
                  <div style={s.spinner} />
                  <div style={s.dropText}>Uploading + indexing…</div>
                  <div style={s.dropSub}>This may take ~30s for large PDFs</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32 }}>📎</div>
                  <div style={s.dropText}>Drop a PDF or click to upload</div>
                  <div style={s.dropSub}>PDFs are chunked and embedded for semantic search</div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
              style={{ display: 'none' }}
            />

            {uploadError && <div style={s.errorBox}>⚠️ {uploadError}</div>}

            {loadingDocs ? (
              <div style={s.muted}>Loading documents…</div>
            ) : docs.length === 0 ? (
              <div style={s.muted}>
                No documents yet. Upload a PDF above to start asking questions.
              </div>
            ) : (
              <ul style={s.docList}>
                {docs.map(d => {
                  const id = d.docId || d.id;
                  const name = d.filename || d.name || `Document ${id?.slice(0, 8) || ''}`;
                  const chunkCount = d.chunkCount || d.chunks || null;
                  return (
                    <li key={id} style={s.docRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.docName}>📄 {name}</div>
                        {chunkCount && <div style={s.docMeta}>{chunkCount} chunks</div>}
                      </div>
                      {confirmDeleteId === id ? (
                        <>
                          <button onClick={() => deleteDoc(id)} style={s.btnDangerSmall}>Confirm</button>
                          <button onClick={() => setConfirmDeleteId(null)} style={s.btnGhostSmall}>Cancel</button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(id)}
                          style={s.btnGhostSmall}
                          title="Delete this document and its embeddings"
                        >×</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* ── Right: chat column ── */}
          <main style={s.right}>
            <h3 style={s.sectionTitle}>Ask a question</h3>

            <div style={s.chatPanel}>
              {thread.length === 0 && !asking && (
                <div style={s.emptyChat}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Ask anything about your uploaded documents
                  </div>
                  <div style={s.muted}>
                    Try: "Summarize the Q4 strategy" or "What's our refund policy?"
                  </div>
                </div>
              )}
              {thread.map((t, i) => (
                <div key={i} style={s.exchange}>
                  <div style={s.qBubble}>
                    <div style={s.bubbleLabel}>You</div>
                    <div>{t.q}</div>
                  </div>
                  {t.a ? (
                    <div style={s.aBubble}>
                      <div style={s.bubbleLabel}>📄 Document Q&A</div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{t.a}</div>
                      {t.sources && t.sources.length > 0 && (
                        <div style={s.sources}>
                          <strong>Sources:</strong>{' '}
                          {t.sources.map((src, si) => (
                            <span key={si} style={s.sourceTag}>
                              {src.filename || src.docId || `chunk ${si + 1}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={s.aBubble}>
                      <div style={s.bubbleLabel}>📄 Document Q&A</div>
                      <div style={s.muted}>Searching your documents…</div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>

            {askError && <div style={s.errorBox}>⚠️ {askError}</div>}

            <div style={s.askRow}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !asking) ask(); }}
                placeholder={docs.length === 0
                  ? 'Upload a document first…'
                  : 'Ask anything about your documents…'}
                disabled={asking || docs.length === 0}
                style={s.askInput}
              />
              <button
                onClick={ask}
                disabled={asking || docs.length === 0 || !question.trim()}
                style={{
                  ...s.askBtn,
                  ...((asking || docs.length === 0 || !question.trim()) ? s.askBtnDisabled : {}),
                }}
              >
                {asking ? '⏳ Asking…' : 'Ask'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#f1f5f9',
    padding: '32px 20px',
  },
  shell: { maxWidth: 1240, margin: '0 auto' },
  header: { marginBottom: 24 },
  title: { margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' },
  subtitle: { margin: 0, color: '#94a3b8', fontSize: 14 },
  split: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 360px) 1fr',
    gap: 20,
    alignItems: 'flex-start',
  },
  left: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: '18px 18px 22px',
    minHeight: 400,
  },
  right: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 14,
    padding: '18px 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 540,
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: 13,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  dropZone: {
    border: '2px dashed #475569',
    borderRadius: 10,
    padding: '20px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(15,23,42,0.4)',
    transition: 'border-color 0.15s, background 0.15s',
    marginBottom: 16,
  },
  dropZoneBusy: { cursor: 'wait', opacity: 0.85 },
  dropText: { color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginTop: 8 },
  dropSub: { color: '#64748b', fontSize: 11, marginTop: 4 },
  spinner: {
    width: 24, height: 24, margin: '0 auto',
    border: '3px solid #334155',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    marginBottom: 12,
  },
  muted: { color: '#64748b', fontSize: 13, padding: '8px 0' },
  docList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  docRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '8px 10px',
  },
  docName: {
    color: '#e2e8f0', fontSize: 13, fontWeight: 500,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  docMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  btnGhostSmall: {
    background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
  },
  btnDangerSmall: {
    background: 'rgba(239,68,68,0.18)', border: '1px solid #ef4444', color: '#fca5a5',
    borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  chatPanel: {
    flex: 1,
    overflowY: 'auto',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: 14,
    minHeight: 360,
    maxHeight: 480,
    marginBottom: 12,
  },
  emptyChat: {
    color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '40px 20px',
  },
  exchange: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 },
  qBubble: {
    alignSelf: 'flex-end', maxWidth: '85%',
    background: '#6366f1', color: '#fff',
    padding: '10px 14px', borderRadius: '12px 12px 2px 12px',
    fontSize: 13, lineHeight: 1.5,
  },
  aBubble: {
    alignSelf: 'flex-start', maxWidth: '95%',
    background: '#1e293b', color: '#e2e8f0',
    border: '1px solid #334155',
    padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
    fontSize: 13,
  },
  bubbleLabel: {
    fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase',
  },
  sources: {
    marginTop: 8, padding: '6px 8px', background: 'rgba(99,102,241,0.1)',
    borderRadius: 6, fontSize: 11, color: '#a5b4fc',
  },
  sourceTag: {
    display: 'inline-block', background: 'rgba(99,102,241,0.2)',
    padding: '2px 6px', borderRadius: 4, marginRight: 4, fontSize: 10,
  },
  askRow: { display: 'flex', gap: 8 },
  askInput: {
    flex: 1, padding: '10px 14px', borderRadius: 10,
    border: '1px solid #334155', background: '#0f172a',
    color: '#f1f5f9', fontSize: 13, outline: 'none',
  },
  askBtn: {
    padding: '10px 22px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
    fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  askBtnDisabled: { background: '#334155', color: '#64748b', cursor: 'not-allowed' },
};
