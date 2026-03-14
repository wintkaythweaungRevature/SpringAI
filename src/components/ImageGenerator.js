import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ImageGenerator() {
  const { token, apiBase } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/generate-image?prompt=${encodeURIComponent(prompt)}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.url) {
        setImageUrls([data.url]);
      } else {
        setError("Image URL not found in response.");
      }
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.iconWrap}>🎨</div>
          <div>
            <h2 style={s.title}>AI Image Generator</h2>
            <p style={s.subtitle}>Turn your words into stunning visuals with DALL·E 3</p>
          </div>
        </div>

        {/* Prompt Input */}
        <div style={s.inputCard}>
          <label style={s.inputLabel}>
            <span style={{ fontSize: "14px" }}>✏️</span> Describe your image
          </label>
          <div style={s.inputRow}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && generateImage()}
              placeholder="e.g. A futuristic city in Myanmar with golden pagodas at sunset..."
              style={s.input}
              disabled={loading}
            />
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              style={{ ...s.btnGenerate, opacity: !prompt.trim() ? 0.5 : 1 }}
            >
              {loading ? <><span style={s.spinner} /> Generating...</> : "✦ Generate"}
            </button>
          </div>

          {/* Prompt suggestions */}
          <div style={s.suggestions}>
            {["Cyberpunk city at night", "Watercolor mountain landscape", "Abstract galaxy portrait", "Minimalist Japanese garden"].map((s_) => (
              <button key={s_} style={s.chip} onClick={() => setPrompt(s_)}>
                {s_}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>⚠ {error}</div>
        )}

        {/* Result */}
        {loading && (
          <div style={s.canvas}>
            <div style={s.loadingContent}>
              <div style={s.loadingIcon}>🖼️</div>
              <p style={s.loadingText}>Crafting your image...</p>
              <p style={s.loadingHint}>This may take up to 15 seconds</p>
              <div style={s.progressWrap}>
                <div style={s.progressBar} />
              </div>
            </div>
          </div>
        )}

        {!loading && imageUrls.length > 0 && (
          <div style={s.resultCard}>
            <div style={s.resultHeader}>
              <span style={s.resultLabel}>✦ Generated Image</span>
              <div style={s.resultActions}>
                <a href={imageUrls[0]} target="_blank" rel="noreferrer" style={s.viewBtn}>
                  🔍 View Full Size
                </a>
                <a href={imageUrls[0]} download="generated-image.png" style={s.downloadBtn}>
                  ⬇ Download
                </a>
                <button style={s.clearBtn} onClick={() => { setImageUrls([]); setPrompt(""); }}>
                  ✕ Clear
                </button>
              </div>
            </div>
            <div style={s.imageWrap}>
              <img
                src={imageUrls[0]}
                alt="Generated"
                style={s.image}
                onError={(e) => { e.target.src = "https://via.placeholder.com/500?text=Image+Not+Available"; }}
              />
            </div>
            <div style={s.promptCaption}>
              <span style={s.captionLabel}>Prompt:</span> {prompt}
            </div>
          </div>
        )}

        {!loading && imageUrls.length === 0 && !error && (
          <div style={s.canvas}>
            <div style={s.placeholderContent}>
              <div style={s.placeholderIcon}>🖼️</div>
              <p style={s.placeholderText}>Your image will appear here</p>
              <p style={s.placeholderHint}>Type a description above and click Generate</p>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse-bar {
          0% { width: 15%; }
          50% { width: 75%; }
          100% { width: 15%; }
        }
      `}</style>
    </div>
  );
}

export default ImageGenerator;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: "700px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" },
  iconWrap: { fontSize: "40px" },
  title: { margin: 0, fontSize: "26px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", color: "#64748b" },

  inputCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px", padding: "24px",
    marginBottom: "20px",
    backdropFilter: "blur(12px)",
  },
  inputLabel: {
    display: "flex", alignItems: "center", gap: "8px",
    color: "#94a3b8", fontSize: "12px", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.8px",
    marginBottom: "12px",
  },
  inputRow: { display: "flex", gap: "12px", marginBottom: "16px" },
  input: {
    flex: 1, padding: "14px 18px", borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0", fontSize: "14px", outline: "none",
    fontFamily: "inherit",
  },
  btnGenerate: {
    padding: "14px 24px", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center",
    gap: "8px", whiteSpace: "nowrap", fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(102,126,234,0.3)",
  },
  spinner: {
    width: "12px", height: "12px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    display: "inline-block",
  },
  suggestions: { display: "flex", flexWrap: "wrap", gap: "8px" },
  chip: {
    padding: "6px 14px", borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#64748b", fontSize: "12px", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "12px", padding: "14px 18px",
    color: "#fca5a5", fontSize: "14px", marginBottom: "20px",
  },

  canvas: {
    border: "2px dashed rgba(255,255,255,0.08)",
    borderRadius: "20px", minHeight: "320px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.02)",
  },
  loadingContent: { textAlign: "center", padding: "40px" },
  loadingIcon: { fontSize: "48px", marginBottom: "16px" },
  loadingText: { color: "#e2e8f0", fontSize: "16px", fontWeight: "600", margin: "0 0 8px" },
  loadingHint: { color: "#475569", fontSize: "13px", margin: "0 0 20px" },
  progressWrap: {
    height: "3px", background: "rgba(255,255,255,0.06)",
    borderRadius: "2px", overflow: "hidden", width: "200px", margin: "0 auto",
  },
  progressBar: {
    height: "100%", borderRadius: "2px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    animation: "pulse-bar 2s ease-in-out infinite",
  },

  placeholderContent: { textAlign: "center", padding: "40px" },
  placeholderIcon: { fontSize: "52px", marginBottom: "16px", opacity: 0.3 },
  placeholderText: { color: "#475569", fontSize: "16px", fontWeight: "600", margin: "0 0 8px" },
  placeholderHint: { color: "#334155", fontSize: "13px", margin: 0 },

  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: "20px", overflow: "hidden",
  },
  resultHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: "12px",
    padding: "16px 20px",
    background: "rgba(102,126,234,0.08)",
    borderBottom: "1px solid rgba(102,126,234,0.12)",
  },
  resultLabel: { color: "#a5b4fc", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px" },
  resultActions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  viewBtn: {
    padding: "6px 14px", borderRadius: "8px",
    background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)",
    color: "#a5b4fc", fontSize: "12px", fontWeight: "600",
    textDecoration: "none",
  },
  downloadBtn: {
    padding: "6px 14px", borderRadius: "8px",
    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)",
    color: "#6ee7b7", fontSize: "12px", fontWeight: "600",
    textDecoration: "none",
  },
  clearBtn: {
    padding: "6px 12px", borderRadius: "8px",
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#fca5a5", fontSize: "12px", fontWeight: "600", cursor: "pointer",
    fontFamily: "inherit",
  },
  imageWrap: { padding: "20px" },
  image: {
    width: "100%", borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    display: "block",
  },
  promptCaption: {
    padding: "12px 20px 16px",
    color: "#475569", fontSize: "13px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },
  captionLabel: { color: "#64748b", fontWeight: "600" },
};
