import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SUGGESTIONS = [
  "A futuristic city with golden pagodas at sunset",
  "Watercolor mountain landscape with cherry blossoms",
  "Cyberpunk street market at night, neon lights",
  "Minimalist Japanese zen garden, aerial view",
  "Abstract galaxy portrait, vibrant colors",
  "Medieval castle surrounded by glowing forest",
];

function ImageGenerator() {
  const { token, apiBase } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/generate-image?prompt=${encodeURIComponent(prompt)}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      let data = null;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!response.ok) {
        const apiMsg = data && (data.error || data.message);
        if (response.status === 401) {
          setError(apiMsg || "Session expired or not logged in. Log out and sign in again, then retry.");
          return;
        }
        if (response.status === 403) {
          setError(
            apiMsg ||
              "Access denied (403). Your account may need an active membership, email verification, or the server may be blocking this request. Try logging out and back in, or contact support if you're already subscribed."
          );
          return;
        }
        setError(apiMsg || `Could not generate image (HTTP ${response.status}). Please try again.`);
        return;
      }
      if (data && data.url) setImageUrl(data.url);
      else setError("Image URL not found in response.");
    } catch (err) {
      setError(err.message?.includes("JSON") ? "Failed to generate image. Please try again." : (err.message || "Failed to generate image. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.layout}>

        {/* ── LEFT PANEL: Controls ── */}
        <div style={s.left}>
          <div style={s.panelHeader}>
            <span style={s.panelIcon}>🎨</span>
            <div>
              <h2 style={s.panelTitle}>Image Generator</h2>
              <p style={s.panelSub}>DALL·E 3 powered</p>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              style={s.textarea}
              disabled={loading}
              rows={4}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Suggestions</label>
            <div style={s.chipGrid}>
              {SUGGESTIONS.map((s_) => (
                <button key={s_} style={s.chip} onClick={() => setPrompt(s_)}>
                  {s_}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            style={{ ...s.btnGenerate, opacity: !prompt.trim() ? 0.5 : 1 }}
          >
            {loading ? <><span style={s.spinner} />  Generating...</> : "✦ Generate Image"}
          </button>

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {imageUrl && (
            <div style={s.linksGroup}>
              <a href={imageUrl} target="_blank" rel="noreferrer" style={s.linkBtn}>🔍 Full Size</a>
              <a href={imageUrl} download="image.png" style={s.linkBtnGreen}>⬇ Download</a>
              <button style={s.linkBtnRed} onClick={() => { setImageUrl(""); setPrompt(""); }}>✕ Clear</button>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: Canvas ── */}
        <div style={s.right}>
          {loading ? (
            <div style={s.canvas}>
              <div style={s.canvasInner}>
                <div style={s.loadingIcon}>🖼️</div>
                <p style={s.loadingText}>Creating your image...</p>
                <p style={s.loadingHint}>This takes up to 15 seconds</p>
                <div style={s.progressWrap}><div style={s.progressBar} /></div>
              </div>
            </div>
          ) : imageUrl ? (
            <div style={s.imageCard}>
              <img
                src={imageUrl}
                alt="Generated"
                style={s.image}
                onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Not+Available"; }}
              />
              <div style={s.caption}>
                <span style={s.captionLabel}>Prompt — </span>{prompt}
              </div>
            </div>
          ) : (
            <div style={s.canvas}>
              <div style={s.canvasInner}>
                <div style={s.placeholderIcon}>✨</div>
                <p style={s.placeholderText}>Your image appears here</p>
                <p style={s.placeholderHint}>Enter a prompt and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-bar { 0%,100%{width:15%} 50%{width:80%} }
      `}</style>
    </div>
  );
}

export default ImageGenerator;

const s = {
  page: { padding: "4px 0", fontFamily: "'Inter',-apple-system,sans-serif" },
  layout: { display: "flex", gap: "20px", alignItems: "flex-start" },

  left: {
    width: "320px", minWidth: "280px", flexShrink: 0,
    background: "#fff", borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" },
  panelIcon: { fontSize: "32px" },
  panelTitle: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  panelSub: { margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" },

  field: { marginBottom: "18px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" },
  textarea: {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a",
    outline: "none", resize: "none", fontFamily: "inherit",
    background: "#f8fafc", boxSizing: "border-box", lineHeight: "1.6",
  },
  chipGrid: { display: "flex", flexDirection: "column", gap: "6px" },
  chip: {
    padding: "8px 12px", borderRadius: "8px", textAlign: "left",
    border: "1px solid #e2e8f0", background: "#f8fafc",
    color: "#475569", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  btnGenerate: {
    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", fontFamily: "inherit",
    marginBottom: "14px",
    boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
  },
  spinner: {
    width: "12px", height: "12px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff",
    display: "inline-block",
  },
  errorBox: {
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: "8px", padding: "10px 14px",
    color: "#b91c1c", fontSize: "13px", marginBottom: "14px",
  },
  linksGroup: { display: "flex", gap: "8px", flexWrap: "wrap" },
  linkBtn: {
    padding: "7px 14px", borderRadius: "8px",
    background: "#eff6ff", border: "1px solid #bfdbfe",
    color: "#2563eb", fontSize: "12px", fontWeight: "600", textDecoration: "none",
  },
  linkBtnGreen: {
    padding: "7px 14px", borderRadius: "8px",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    color: "#16a34a", fontSize: "12px", fontWeight: "600", textDecoration: "none",
  },
  linkBtnRed: {
    padding: "7px 14px", borderRadius: "8px",
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", fontSize: "12px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit",
  },

  right: { flex: 1, minWidth: 0 },
  canvas: {
    background: "#fff", border: "2px dashed #e2e8f0",
    borderRadius: "16px", minHeight: "480px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  canvasInner: { textAlign: "center", padding: "40px" },
  loadingIcon: { fontSize: "48px", marginBottom: "16px" },
  loadingText: { color: "#0f172a", fontSize: "16px", fontWeight: "600", margin: "0 0 6px" },
  loadingHint: { color: "#94a3b8", fontSize: "13px", margin: "0 0 20px" },
  progressWrap: { height: "3px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden", width: "180px", margin: "0 auto" },
  progressBar: { height: "100%", borderRadius: "2px", background: "linear-gradient(90deg,#2563eb,#7c3aed)", animation: "pulse-bar 2s ease-in-out infinite" },
  placeholderIcon: { fontSize: "52px", marginBottom: "16px", opacity: 0.25 },
  placeholderText: { color: "#94a3b8", fontSize: "16px", fontWeight: "600", margin: "0 0 6px" },
  placeholderHint: { color: "#cbd5e1", fontSize: "13px", margin: 0 },

  imageCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: "16px", overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  image: { width: "100%", display: "block" },
  caption: { padding: "12px 18px", color: "#64748b", fontSize: "13px", borderTop: "1px solid #f1f5f9" },
  captionLabel: { fontWeight: "600", color: "#94a3b8" },
};
