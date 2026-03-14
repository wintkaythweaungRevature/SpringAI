import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const SUPPORTED = ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"];

function Transcription() {
  const { token, apiBase } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!SUPPORTED.includes(ext)) return alert(`Unsupported format. Use: ${SUPPORTED.join(", ")}`);
    setFile(f);
    setTranscript("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleProcess = async () => {
    if (!file) return alert("Please upload an audio file!");
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
        const err = await response.text();
        throw new Error(`Server Error (${response.status}): ${err || "Error"}`);
      }
      setTranscript(await response.text());
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

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = transcript.length;
  const isError = transcript.startsWith("Transcription failed");

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerIcon}>🎙️</div>
          <div>
            <h2 style={S.headerTitle}>AI Voice Transcriber</h2>
            <p style={S.headerSub}>Convert MP3 / WAV / M4A audio to text using Whisper AI</p>
          </div>
        </div>

        <div style={S.body}>
          {/* Drop zone */}
          <div
            style={{ ...S.dropzone, ...(dragOver ? S.dropzoneActive : {}), ...(file ? S.dropzoneFilled : {}) }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input ref={inputRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files[0])} />
            {file ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎵</div>
                <div style={S.fileName}>{file.name}</div>
                <div style={S.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setTranscript(""); }}
                  style={S.removeBtn}>✕ Remove</button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
                <div style={S.dropText}>Drag & drop your audio file here</div>
                <div style={S.dropSub}>or click to browse</div>
                <div style={S.formatBadges}>
                  {SUPPORTED.map(f => <span key={f} style={S.badge}>.{f}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleProcess} disabled={loading || !file}
              style={{ ...S.btn, flex: 1, ...(loading || !file ? S.btnDisabled : {}) }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <span style={S.spinner} /> Transcribing...
                </span>
              ) : "▶ Start Transcription"}
            </button>
            {transcript && (
              <button onClick={() => { setTranscript(""); setFile(null); }} style={S.clearBtn}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result */}
        {transcript && (
          <div style={S.resultSection}>
            <div style={S.resultHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={S.resultTitle}>{isError ? "❌ Error" : "📝 Transcript"}</span>
                {!isError && (
                  <>
                    <span style={S.statBadge}>{wordCount} words</span>
                    <span style={{ ...S.statBadge, background: "#fef3c7", color: "#92400e" }}>{charCount} chars</span>
                  </>
                )}
              </div>
              {!isError && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleCopy} style={S.actionBtn}>{copied ? "✓ Copied" : "Copy"}</button>
                  <button onClick={handleDownload} style={{ ...S.actionBtn, background: "#059669" }}>↓ TXT</button>
                </div>
              )}
            </div>
            <div style={{ ...S.transcriptBody, ...(isError ? S.errorBody : {}) }}>
              {transcript}
            </div>
          </div>
        )}

        {/* Loading overlay hint */}
        {loading && (
          <div style={S.loadingBar}>
            <div style={S.loadingInner} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { 0% { width: 0%; } 80% { width: 85%; } 100% { width: 100%; } }
      `}</style>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f1f5f9", padding: "32px 20px", fontFamily: "'Segoe UI', Arial, sans-serif" },
  card: { maxWidth: "680px", margin: "0 auto", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" },

  header: { background: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)", padding: "28px 32px", display: "flex", alignItems: "center", gap: "18px" },
  headerIcon: { fontSize: "44px", lineHeight: 1 },
  headerTitle: { margin: 0, fontSize: "22px", fontWeight: "700", color: "#fff" },
  headerSub: { margin: "4px 0 0", fontSize: "13px", color: "#c4b5fd" },

  body: { padding: "28px 32px" },

  dropzone: { border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "36px 20px", cursor: "pointer", transition: "all 0.2s", marginBottom: "20px", background: "#f8fafc" },
  dropzoneActive: { borderColor: "#7c3aed", background: "#faf5ff" },
  dropzoneFilled: { borderColor: "#059669", background: "#f0fdf4", borderStyle: "solid" },
  dropText: { fontSize: "15px", fontWeight: "600", color: "#475569", marginBottom: "4px" },
  dropSub: { fontSize: "13px", color: "#94a3b8", marginBottom: "12px" },
  formatBadges: { display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" },
  badge: { background: "#ede9fe", color: "#6d28d9", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "10px" },
  fileName: { fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  fileSize: { fontSize: "12px", color: "#64748b", marginBottom: "10px" },
  removeBtn: { padding: "4px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" },

  btn: { padding: "14px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  btnDisabled: { background: "#94a3b8", cursor: "not-allowed" },
  clearBtn: { padding: "14px 20px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  resultSection: { borderTop: "1px solid #e2e8f0" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "14px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  resultTitle: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  statBadge: { fontSize: "11px", background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" },
  actionBtn: { padding: "6px 14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  transcriptBody: { padding: "24px 32px", whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.85", color: "#334155" },
  errorBody: { color: "#dc2626", background: "#fff5f5" },

  loadingBar: { height: "3px", background: "#e2e8f0", overflow: "hidden" },
  loadingInner: { height: "100%", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", animation: "progress 3s ease-out forwards" },
};

export default Transcription;
