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
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("audio/")) setFile(dropped);
  };

  const handleProcess = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setTranscript("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/transcribe`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: "POST", headers, body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Error"}`);
      }
      const data = await response.text();
      setTranscript(data);
    } catch (error) {
      setTranscript(`Transcription failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isError = transcript.startsWith("Transcription failed");

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.iconWrap}>🎙️</div>
          <div>
            <h2 style={s.title}>EchoScribe</h2>
            <p style={s.subtitle}>AI-powered audio to text transcription</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          style={{ ...s.dropZone, ...(dragOver ? s.dropZoneActive : {}), ...(file ? s.dropZoneFilled : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          {file ? (
            <div style={s.filePreview}>
              <span style={s.fileIcon}>🎵</span>
              <div style={{ flex: 1 }}>
                <div style={s.fileName}>{file.name}</div>
                <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB · {file.type}</div>
              </div>
              <button
                style={s.removeBtn}
                onClick={(e) => { e.stopPropagation(); setFile(null); setTranscript(""); }}
              >✕</button>
            </div>
          ) : (
            <div style={s.dropContent}>
              <div style={s.dropIcon}>🎧</div>
              <div style={s.dropText}>Drop your audio file here</div>
              <div style={s.dropHint}>MP3, WAV, M4A, OGG supported · click to browse</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button
            onClick={handleProcess}
            disabled={loading || !file}
            style={{ ...s.btnPrimary, opacity: !file ? 0.5 : 1 }}
          >
            {loading
              ? <><span style={s.spinner} /> Transcribing...</>
              : "✦ Start Transcription"}
          </button>
          {transcript && (
            <button onClick={() => { setTranscript(""); setFile(null); }} style={s.btnGhost}>
              Clear
            </button>
          )}
        </div>

        {/* Loading Animation */}
        {loading && (
          <div style={s.loadingCard}>
            <div style={s.waveWrap}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ ...s.wavebar, animationDelay: `${i * 0.1}s`, height: `${Math.random() * 24 + 8}px` }} />
              ))}
            </div>
            <p style={s.loadingText}>Processing your audio...</p>
          </div>
        )}

        {/* Transcript Result */}
        {transcript && !loading && (
          <div style={{ ...s.resultCard, ...(isError ? s.errorCard : {}) }}>
            <div style={s.resultHeader}>
              <span style={s.resultIcon}>{isError ? "⚠" : "📝"}</span>
              <span style={s.resultTitle}>{isError ? "Error" : "Transcript"}</span>
              {!isError && (
                <div style={s.resultActions}>
                  <span style={s.wordCount}>{transcript.split(/\s+/).filter(Boolean).length} words</span>
                  <button onClick={handleCopy} style={s.copyBtn}>
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              )}
            </div>
            <div style={{ ...s.transcriptText, color: isError ? "#fca5a5" : "#cbd5e1" }}>
              {transcript}
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default Transcription;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: "680px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" },
  iconWrap: { fontSize: "40px" },
  title: { margin: 0, fontSize: "26px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", color: "#64748b" },
  dropZone: {
    border: "2px dashed rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "48px 40px",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: "20px",
    transition: "all 0.2s",
    background: "rgba(255,255,255,0.02)",
  },
  dropZoneActive: {
    borderColor: "#667eea",
    background: "rgba(102,126,234,0.08)",
    transform: "scale(1.01)",
  },
  dropZoneFilled: {
    border: "2px solid rgba(102,126,234,0.4)",
    cursor: "default",
    background: "rgba(102,126,234,0.05)",
    padding: "20px 24px",
  },
  dropContent: {},
  dropIcon: { fontSize: "44px", marginBottom: "14px" },
  dropText: { color: "#e2e8f0", fontSize: "16px", fontWeight: "600", marginBottom: "6px" },
  dropHint: { color: "#475569", fontSize: "13px" },
  filePreview: { display: "flex", alignItems: "center", gap: "14px", textAlign: "left" },
  fileIcon: { fontSize: "32px", flexShrink: 0 },
  fileName: { color: "#e2e8f0", fontSize: "15px", fontWeight: "600" },
  fileSize: { color: "#64748b", fontSize: "12px", marginTop: "4px" },
  removeBtn: {
    background: "rgba(239,68,68,0.2)", border: "none",
    color: "#fca5a5", borderRadius: "8px",
    padding: "6px 10px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
  },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" },
  btnPrimary: {
    padding: "12px 28px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "8px",
  },
  btnGhost: {
    padding: "12px 20px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent", color: "#64748b",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  spinner: {
    width: "12px", height: "12px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    display: "inline-block",
  },
  loadingCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px", padding: "28px",
    textAlign: "center", marginBottom: "20px",
  },
  waveWrap: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "4px", height: "40px", marginBottom: "16px",
  },
  wavebar: {
    width: "4px", borderRadius: "2px",
    background: "linear-gradient(180deg, #667eea, #764ba2)",
    animation: "wave 1.2s ease-in-out infinite",
  },
  loadingText: { color: "#64748b", fontSize: "13px", margin: 0 },
  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: "20px", overflow: "hidden",
  },
  errorCard: {
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.06)",
  },
  resultHeader: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "16px 24px",
    background: "rgba(102,126,234,0.08)",
    borderBottom: "1px solid rgba(102,126,234,0.12)",
  },
  resultIcon: { fontSize: "18px" },
  resultTitle: { color: "#a5b4fc", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" },
  resultActions: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" },
  wordCount: { color: "#475569", fontSize: "12px" },
  copyBtn: {
    background: "rgba(102,126,234,0.2)", border: "1px solid rgba(102,126,234,0.3)",
    color: "#a5b4fc", fontSize: "12px", fontWeight: "600",
    padding: "5px 12px", borderRadius: "8px", cursor: "pointer",
  },
  transcriptText: {
    padding: "24px", fontSize: "15px", lineHeight: "1.8",
    whiteSpace: "pre-wrap", wordBreak: "break-word",
  },
};
