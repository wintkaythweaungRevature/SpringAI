import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ─── Voice Creator palette (dark) ───────────────────────────────────────────
const C = {
  bg: '#0f172a', card: '#1e293b', cardAlt: '#253347', border: '#334155',
  accent: '#6366f1', accentHover: '#4f46e5', accentLight: 'rgba(99,102,241,0.15)',
  red: '#ef4444', redLight: 'rgba(239,68,68,0.15)',
  green: '#22c55e', greenLight: 'rgba(34,197,94,0.12)',
  textPrimary: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#64748b',
};

// ─── Tiny helpers ────────────────────────────────────────────────────────────
function fmtTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function useCopy() {
  const [copies, setCopies] = useState({});
  const copy = useCallback((key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopies(p => ({ ...p, [key]: true }));
      setTimeout(() => setCopies(p => ({ ...p, [key]: false })), 2000);
    }).catch(() => {});
  }, []);
  const isCopied = useCallback((key) => !!copies[key], [copies]);
  return { copy, isCopied };
}

function CpBtn({ label, copiedLabel = '✓ Copied!', k, text, copyFn, isCopied, style }) {
  const copied = isCopied(k);
  return (
    <button onClick={() => copyFn(k, text)} style={{
      padding: '6px 14px', borderRadius: 8,
      border: `1px solid ${copied ? C.green : C.border}`,
      background: copied ? C.greenLight : 'transparent',
      color: copied ? C.green : C.textSecondary,
      fontSize: 12, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', ...style,
    }}>{copied ? copiedLabel : label}</button>
  );
}

function TabBar({ tabs, active, onSelect, style }) {
  return (
    <div style={{ display: 'flex', gap: 4, ...style }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key)} style={{
          padding: '8px 18px', borderRadius: 8, border: 'none',
          background: active === t.key ? C.accent : C.cardAlt,
          color: active === t.key ? '#fff' : C.textSecondary,
          fontWeight: active === t.key ? 600 : 400, fontSize: 14,
          cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── Voice Creator sub-components ────────────────────────────────────────────
function RecordTab({ onReady }) {
  const [rec, setRec] = useState(false);
  const [time, setTime] = useState(0);
  const mrRef = useRef(null); const chunksRef = useRef([]);
  const timerRef = useRef(null); const streamRef = useRef(null);

  useEffect(() => {
    if (rec) timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [rec]);
  useEffect(() => () => { clearInterval(timerRef.current); streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        onReady(new File([blob], 'recording.webm', { type: 'audio/webm' }));
        setTime(0);
      };
      mrRef.current = mr; mr.start(); setRec(true);
    } catch { alert('Microphone access denied. Please allow microphone access.'); }
  };
  const stop = () => { mrRef.current?.state !== 'inactive' && mrRef.current.stop(); setRec(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {rec && <><div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(239,68,68,0.18)', animation: 'vc-pulse 1.4s ease-in-out infinite' }} /><div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', animation: 'vc-pulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }} /></>}
        <button onClick={rec ? stop : start} style={{
          width: 96, height: 96, borderRadius: '50%', border: 'none',
          background: rec ? 'radial-gradient(circle at 35% 35%, #f87171, #ef4444)' : 'radial-gradient(circle at 35% 35%, #475569, #334155)',
          boxShadow: rec ? '0 0 0 4px rgba(239,68,68,0.3), 0 8px 32px rgba(239,68,68,0.4)' : '0 4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, transition: 'all .25s', position: 'relative', zIndex: 2,
        }}>{rec ? '⏹' : '🎙'}</button>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 700, color: rec ? C.red : C.textMuted, letterSpacing: 2, transition: 'color .3s' }}>{fmtTime(time)}</div>
      <div style={{ color: C.textSecondary, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        {rec ? <><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: C.red, animation: 'vc-blink 1s step-end infinite' }} />Recording… click to stop &amp; generate</> : 'Click the microphone to start recording'}
      </div>
      <style>{`@keyframes vc-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.6}}@keyframes vc-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}

function UploadTab({ onReady }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '28px 0' }}>
      <div onClick={() => ref.current?.click()} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} style={{ border: `2px dashed ${drag ? C.accent : C.border}`, borderRadius: 14, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: drag ? C.accentLight : C.cardAlt, transition: 'all .2s' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
        <div style={{ color: C.textPrimary, fontWeight: 600, marginBottom: 6, fontSize: 15 }}>Drag &amp; drop your audio file here</div>
        <div style={{ color: C.textMuted, fontSize: 13 }}>or click to browse</div>
        <div style={{ color: C.textMuted, fontSize: 12, marginTop: 10 }}>Supported: MP3, WAV, M4A, OGG, WebM</div>
      </div>
      <input ref={ref} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
      {file && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: C.accentLight, border: `1px solid ${C.accent}`, borderRadius: 10 }}>
          <span style={{ fontSize: 18 }}>🎵</span>
          <span style={{ color: C.textPrimary, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
          <span style={{ color: C.textMuted, fontSize: 12, whiteSpace: 'nowrap' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
        </div>
      )}
      <button onClick={() => file && onReady(file)} disabled={!file} style={{ padding: '13px', borderRadius: 12, border: 'none', background: file ? `linear-gradient(135deg,${C.accent},${C.accentHover})` : C.cardAlt, color: file ? '#fff' : C.textMuted, fontWeight: 700, fontSize: 15, cursor: file ? 'pointer' : 'not-allowed', transition: 'all .2s', boxShadow: file ? '0 4px 16px rgba(99,102,241,.35)' : 'none' }}>✨ Generate Content</button>
    </div>
  );
}

function VcSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '56px 0' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, animation: 'vc-spin .85s linear infinite' }} />
      <div style={{ color: C.textSecondary, fontSize: 15 }}>Transcribing &amp; generating content…</div>
      <style>{`@keyframes vc-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function TranscriptCard({ text }) {
  const [open, setOpen] = useState(true);
  const { copy, isCopied } = useCopy();
  return (
    <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>Transcript</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {open && <CpBtn label="Copy" k="t" text={text} copyFn={copy} isCopied={isCopied} />}
          <span style={{ color: C.textMuted, fontSize: 18, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </div>
      </div>
      {open && <div style={{ padding: '0 20px 20px 20px', paddingTop: 16, color: C.textSecondary, fontSize: 14, lineHeight: 1.75, borderTop: `1px solid ${C.border}` }}>{text}</div>}
    </div>
  );
}

function TwitterTab({ data }) {
  const { copy, isCopied } = useCopy();
  const threads = data?.thread || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {threads.map((tw, i) => {
        const over = tw.length > 280;
        return (
          <div key={i} style={{ background: C.cardAlt, borderRadius: 12, border: `1px solid ${over ? C.red : C.border}`, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                <span style={{ color: C.textMuted, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', marginTop: 1 }}>{i + 1}/{threads.length}</span>
                <p style={{ color: C.textPrimary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{tw}</p>
              </div>
              <CpBtn label="Copy" k={`tw-${i}`} text={tw} copyFn={copy} isCopied={isCopied} style={{ flexShrink: 0 }} />
            </div>
            <div style={{ marginTop: 10, textAlign: 'right' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: over ? C.red : C.green, background: over ? C.redLight : C.greenLight, padding: '3px 9px', borderRadius: 20 }}>{tw.length}/280</span>
            </div>
          </div>
        );
      })}
      {threads.length > 1 && (
        <button onClick={() => copy('all', threads.join('\n\n---\n\n'))} style={{ marginTop: 4, padding: '11px', borderRadius: 10, border: `1px solid ${isCopied('all') ? C.green : C.accent}`, background: isCopied('all') ? C.greenLight : C.accentLight, color: isCopied('all') ? C.green : C.accent, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all .2s' }}>
          {isCopied('all') ? '✓ Copied All Tweets!' : '📋 Copy All Tweets'}
        </button>
      )}
    </div>
  );
}

function LinkedInTab({ data }) {
  const { copy, isCopied } = useCopy();
  const post = data?.post || '';
  const tags = Array.isArray(data?.hashtags) ? data.hashtags : (data?.hashtags ? [data.hashtags] : []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.cardAlt, borderRadius: 14, border: `1px solid ${C.border}`, padding: '22px 22px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#0077b5,#00a0dc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💼</div>
          <div><div style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>Your Name</div><div style={{ color: C.textMuted, fontSize: 12 }}>Your headline · 1st</div></div>
        </div>
        <p style={{ color: C.textPrimary, fontSize: 14, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{post}</p>
        {tags.length > 0 && <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>{tags.map((h, i) => <span key={i} style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 500 }}>{h.startsWith('#') ? h : `#${h}`}</span>)}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <CpBtn label="📋 Copy Post" k="li-p" text={post} copyFn={copy} isCopied={isCopied} style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: 13 }} />
        <CpBtn label="# Hashtags" k="li-t" text={tags.join(' ')} copyFn={copy} isCopied={isCopied} style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: 13 }} />
        <CpBtn label="📄 Full" k="li-f" text={tags.length ? `${post}\n\n${tags.join(' ')}` : post} copyFn={copy} isCopied={isCopied} style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: 13 }} />
      </div>
    </div>
  );
}

function InstagramTab({ data }) {
  const { copy, isCopied } = useCopy();
  const quote = data?.quote || '';
  const subtext = data?.subtext || '';
  const tags = Array.isArray(data?.hashtags) ? data.hashtags : (data?.hashtags ? [data.hashtags] : []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,#312e81 0%,#4338ca 40%,#6366f1 70%,#818cf8 100%)', borderRadius: 20, padding: '48px 36px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 40px rgba(99,102,241,.45)', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{ fontSize: 72, lineHeight: 0.7, color: 'rgba(255,255,255,.25)', fontFamily: 'Georgia,serif', alignSelf: 'flex-start', marginBottom: 4, position: 'relative', zIndex: 1 }}>"</div>
        <p style={{ color: '#fff', fontSize: 20, fontStyle: 'italic', fontWeight: 600, lineHeight: 1.6, margin: 0, position: 'relative', zIndex: 1, textShadow: '0 2px 8px rgba(0,0,0,.2)' }}>{quote}</p>
        {subtext && <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, margin: 0, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>{subtext}</p>}
        {tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 8, position: 'relative', zIndex: 1 }}>{tags.map((h, i) => <span key={i} style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500 }}>{h.startsWith('#') ? h : `#${h}`}</span>)}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <CpBtn label="💬 Copy Quote" k="ig-q" text={quote + (subtext ? `\n\n${subtext}` : '')} copyFn={copy} isCopied={isCopied} style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: 13 }} />
        <CpBtn label="# Hashtags" k="ig-t" text={tags.join(' ')} copyFn={copy} isCopied={isCopied} style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: 13 }} />
      </div>
    </div>
  );
}

// ─── Voice Creator section (embedded) ────────────────────────────────────────
function VoiceCreator({ token, apiBase }) {
  const [inputTab, setInputTab] = useState('record');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [results, setResults] = useState(null);
  const [outputTab, setOutputTab] = useState('twitter');
  const [error, setError] = useState(null);

  const submit = useCallback(async (file) => {
    setLoading(true); setError(null); setTranscript(null); setResults(null);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${apiBase || 'https://api.wintaibot.com'}/api/ai/voice-to-content`, {
        method: 'POST', headers, body: fd,
      });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const j = await res.json(); msg = j.error || j.message || msg; } catch (_) {}
        throw new Error(msg);
      }
      const d = await res.json();
      setTranscript(d.transcript || '');
      setResults({
        twitter: d.twitter || { thread: [] },
        linkedin: d.linkedin || { post: '', hashtags: [] },
        instagram: d.instagram || { quote: '', subtext: '', hashtags: [] },
      });
      setOutputTab('twitter');
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, apiBase]);

  const reset = () => { setTranscript(null); setResults(null); setError(null); };

  return (
    <div style={{ background: C.bg, borderRadius: 16, padding: '24px', color: C.textPrimary, minHeight: 400 }}>
      {/* Description */}
      <p style={{ color: C.textSecondary, fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
        Record or upload audio → AI transcribes → generates a Twitter Thread, LinkedIn Post &amp; Instagram Quote Card
      </p>

      {/* Error */}
      {error && (
        <div style={{ background: C.redLight, border: `1px solid ${C.red}`, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ color: '#fca5a5', fontSize: 14 }}>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: 18, padding: 0 }}>✕</button>
        </div>
      )}

      {/* Input card */}
      {!results && !loading && (
        <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: '24px 24px 28px', marginBottom: 20 }}>
          <TabBar tabs={[{ key: 'record', label: '🎙 Record' }, { key: 'upload', label: '📁 Upload' }]} active={inputTab} onSelect={setInputTab} />
          {inputTab === 'record' ? <RecordTab onReady={submit} /> : <UploadTab onReady={submit} />}
        </div>
      )}

      {loading && <VcSpinner />}

      {results && !loading && (
        <div>
          {transcript && <TranscriptCard text={transcript} />}
          <button onClick={reset} style={{ display: 'block', width: '100%', marginBottom: 24, padding: '11px', borderRadius: 12, border: `1px solid ${C.border}`, background: 'transparent', color: C.textSecondary, fontSize: 14, cursor: 'pointer' }}>← Record / Upload Another</button>
          <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: '24px' }}>
            <TabBar tabs={[{ key: 'twitter', label: '🐦 Thread' }, { key: 'linkedin', label: '💼 LinkedIn' }, { key: 'instagram', label: '📸 Quote Card' }]} active={outputTab} onSelect={setOutputTab} style={{ marginBottom: 24, flexWrap: 'wrap' }} />
            {outputTab === 'twitter' && <TwitterTab data={results.twitter} />}
            {outputTab === 'linkedin' && <LinkedInTab data={results.linkedin} />}
            {outputTab === 'instagram' && <InstagramTab data={results.instagram} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Transcription component ────────────────────────────────────────────
function Transcription() {
  const { token, apiBase } = useAuth();
  const [mainTab, setMainTab] = useState('transcribe');

  // Transcribe state
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("audio/")) setFile(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true); setTranscript("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/transcribe`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: "POST", headers, body: formData });
      if (!response.ok) throw new Error(`Server Error (${response.status})`);
      setTranscript(await response.text());
    } catch (e) {
      setTranscript(`Transcription failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const isError = transcript.startsWith("Transcription failed");
  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div style={s.page}>
      {/* Main tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        {[
          { key: 'transcribe', label: '🎙️ Transcribe' },
          { key: 'voice', label: '✨ Voice → Content' },
        ].map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)} style={{
            padding: '10px 22px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: mainTab === t.key ? 700 : 500, fontSize: 14, fontFamily: 'inherit',
            color: mainTab === t.key ? '#2563eb' : '#94a3b8',
            borderBottom: mainTab === t.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-1px', transition: 'all .2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Transcribe tab ── */}
      {mainTab === 'transcribe' && (
        <div style={s.layout}>
          {/* LEFT: Controls */}
          <div style={s.left}>
            <div style={s.panelHeader}>
              <span style={s.panelIcon}>🎙️</span>
              <div>
                <h2 style={s.panelTitle}>EchoScribe</h2>
                <p style={s.panelSub}>Audio to text transcription</p>
              </div>
            </div>

            <div
              style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}), ...(file ? s.dropFilled : {}) }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current.click()}
            >
              <input ref={fileInputRef} type="file" accept="audio/*"
                onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
              {file ? (
                <div style={s.fileRow}>
                  <span style={{ fontSize: "24px" }}>🎵</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.fileName}>{file.name}</div>
                    <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button style={s.removeBtn} onClick={(e) => { e.stopPropagation(); setFile(null); setTranscript(""); }}>✕</button>
                </div>
              ) : (
                <div style={s.dropContent}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎧</div>
                  <div style={s.dropText}>Drop audio file here</div>
                  <div style={s.dropHint}>MP3, WAV, M4A · click to browse</div>
                </div>
              )}
            </div>

            <button onClick={handleProcess} disabled={loading || !file}
              style={{ ...s.btnPrimary, opacity: !file ? 0.5 : 1, marginBottom: "10px" }}>
              {loading ? <><span style={s.spinner} /> Transcribing...</> : "✦ Start Transcription"}
            </button>

            {transcript && (
              <button onClick={() => { setTranscript(""); setFile(null); }} style={s.btnGhost}>Clear</button>
            )}

            <div style={s.infoBox}>
              <div style={s.infoTitle}>Supported formats</div>
              <div style={s.infoText}>MP3, MP4, WAV, M4A, OGG, WEBM</div>
              <div style={{ ...s.infoTitle, marginTop: "10px" }}>Powered by</div>
              <div style={s.infoText}>OpenAI Whisper</div>
            </div>
          </div>

          {/* RIGHT: Transcript */}
          <div style={s.right}>
            {loading ? (
              <div style={s.emptyCanvas}>
                <div style={{ textAlign: "center" }}>
                  <div style={s.waveWrap}>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} style={{ ...s.waveBar, animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                  <p style={s.emptyTitle}>Transcribing audio...</p>
                  <p style={s.emptyHint}>Processing with Whisper AI</p>
                </div>
              </div>
            ) : transcript ? (
              <div style={{ ...s.resultCard, ...(isError ? s.errorCard : {}) }}>
                <div style={s.resultHeader}>
                  <span style={s.resultHeaderLabel}>{isError ? "⚠ Error" : "📝 Transcript"}</span>
                  {!isError && (
                    <div style={s.headerRight}>
                      <span style={s.wordCount}>{wordCount} words</span>
                      <button onClick={handleCopy} style={s.copyBtn}>
                        {copied ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ ...s.transcriptBody, color: isError ? "#b91c1c" : "#475569" }}>
                  {transcript}
                </div>
              </div>
            ) : (
              <div style={s.emptyCanvas}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.2 }}>🎙️</div>
                  <p style={s.emptyTitle}>Transcript appears here</p>
                  <p style={s.emptyHint}>Upload an audio file and click Transcribe</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Voice → Content tab ── */}
      {mainTab === 'voice' && (
        <VoiceCreator token={token} apiBase={apiBase} />
      )}

      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>
    </div>
  );
}

export default Transcription;

const s = {
  page: { padding: "4px 0", fontFamily: "'Inter',-apple-system,sans-serif" },
  layout: { display: "flex", gap: "20px", alignItems: "flex-start" },
  left: {
    width: "300px", minWidth: "260px", flexShrink: 0,
    background: "#fff", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  panelIcon: { fontSize: "30px" },
  panelTitle: { margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" },
  panelSub: { margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" },
  dropZone: {
    border: "2px dashed #e2e8f0", borderRadius: "12px",
    padding: "24px 16px", textAlign: "center",
    cursor: "pointer", marginBottom: "14px",
    background: "#f8fafc", transition: "all 0.2s",
  },
  dropOver: { borderColor: "#2563eb", background: "#eff6ff" },
  dropFilled: { border: "2px solid #bfdbfe", cursor: "default", padding: "14px 16px" },
  dropContent: {},
  dropText: { color: "#0f172a", fontSize: "14px", fontWeight: "600", marginBottom: "4px" },
  dropHint: { color: "#94a3b8", fontSize: "12px" },
  fileRow: { display: "flex", alignItems: "center", gap: "10px", textAlign: "left" },
  fileName: { color: "#0f172a", fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileSize: { color: "#94a3b8", fontSize: "11px", marginTop: "2px" },
  removeBtn: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "11px", fontWeight: "700", flexShrink: 0 },
  btnPrimary: {
    width: "100%", padding: "12px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
  },
  btnGhost: {
    width: "100%", padding: "9px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit", marginTop: "8px",
  },
  spinner: { width: "12px", height: "12px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", display: "inline-block" },
  infoBox: { marginTop: "20px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  infoTitle: { fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" },
  infoText: { fontSize: "13px", color: "#475569", fontWeight: "500" },
  right: { flex: 1, minWidth: 0 },
  emptyCanvas: {
    background: "#fff", border: "2px dashed #e2e8f0",
    borderRadius: "16px", minHeight: "400px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  waveWrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", height: "36px", marginBottom: "16px" },
  waveBar: { width: "4px", height: "28px", borderRadius: "2px", background: "linear-gradient(180deg,#2563eb,#7c3aed)", animation: "wave 1.2s ease-in-out infinite" },
  emptyTitle: { color: "#94a3b8", fontSize: "15px", fontWeight: "600", margin: "0 0 6px" },
  emptyHint: { color: "#cbd5e1", fontSize: "13px", margin: 0 },
  resultCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  errorCard: { border: "1px solid #fecaca", background: "#fef2f2" },
  resultHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  resultHeaderLabel: { color: "#2563eb", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px" },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  wordCount: { color: "#94a3b8", fontSize: "12px" },
  copyBtn: { padding: "6px 12px", borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  transcriptBody: { padding: "20px 24px", fontSize: "15px", lineHeight: "1.8", whiteSpace: "pre-wrap", wordBreak: "break-word" },
};
