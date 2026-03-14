import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

function Transcription() {
  const { token, apiBase } = useAuth();
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
      <div style={s.layout}>

        {/* ── LEFT: Controls ── */}
        <div style={s.left}>
          <div style={s.panelHeader}>
            <span style={s.panelIcon}>🎙️</span>
            <div>
              <h2 style={s.panelTitle}>EchoScribe</h2>
              <p style={s.panelSub}>Audio to text transcription</p>
            </div>
          </div>

          {/* Drop Zone */}
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

          {/* Info */}
          <div style={s.infoBox}>
            <div style={s.infoTitle}>Supported formats</div>
            <div style={s.infoText}>MP3, MP4, WAV, M4A, OGG, WEBM</div>
            <div style={s.infoTitle} style={{ marginTop: "10px" }}>Powered by</div>
            <div style={s.infoText}>OpenAI Whisper</div>
          </div>
        </div>

        {/* ── RIGHT: Transcript ── */}
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

      <style>{`
        @keyframes wave { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
      `}</style>
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
