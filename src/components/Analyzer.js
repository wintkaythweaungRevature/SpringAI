import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const DOC_TYPE_COLORS = {
  Invoice: "#e67e22", Resume: "#2563eb", Contract: "#8e44ad",
  Report: "#16a085", Financial: "#27ae60", Legal: "#c0392b",
  Medical: "#e74c3c", Academic: "#f39c12", Other: "#7f8c8d",
};

function PdfAnalyzer() {
  const { token, apiBase } = useAuth();
  const [file, setFile] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") setFile(dropped);
  };

  const handleProcess = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Analyze this document and extract all important information.");
    setLoading(true);
    setRecipe("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/analyze-pdf?t=${Date.now()}`;
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: "POST", headers, body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Error"}`);
      }
      const data = await response.json();
      setRecipe(JSON.stringify(data));
    } catch (error) {
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const parsedData = useMemo(() => {
    if (!recipe || recipe.startsWith("Analysis failed")) return null;
    try { return JSON.parse(recipe); }
    catch (e) { return null; }
  }, [recipe]);

  const downloadCSV = () => {
    if (!parsedData || !parsedData.table_headers) return;
    const csvContent = [
      parsedData.table_headers.join(","),
      ...(parsedData.table_rows || []).map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Data_Export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.iconWrap}>🧙‍♂️</div>
          <div>
            <h2 style={s.title}>DocuWizard</h2>
            <p style={s.subtitle}>AI-powered PDF extraction & analytics</p>
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
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
          {file ? (
            <div style={s.filePreview}>
              <span style={s.fileIcon}>📄</span>
              <div>
                <div style={s.fileName}>{file.name}</div>
                <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                style={s.removeBtn}
                onClick={(e) => { e.stopPropagation(); setFile(null); setRecipe(""); }}
              >✕</button>
            </div>
          ) : (
            <div style={s.dropContent}>
              <div style={s.dropIcon}>📂</div>
              <div style={s.dropText}>Drop your PDF here</div>
              <div style={s.dropHint}>or click to browse</div>
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
            {loading ? (
              <><span style={s.spinnerDot} />  Analyzing...</>
            ) : "✦ Analyze PDF"}
          </button>

          {parsedData && (
            <button onClick={downloadCSV} style={s.btnOutline}>
              ⬇ Export CSV
            </button>
          )}
          {recipe && (
            <button onClick={() => { setRecipe(""); setFile(null); }} style={s.btnGhost}>
              Clear
            </button>
          )}
        </div>

        {/* Loading Bar */}
        {loading && (
          <div style={s.progressWrap}>
            <div style={s.progressBar} />
          </div>
        )}

        {/* Results */}
        {parsedData ? (
          <div style={s.results}>

            {/* Summary */}
            <div style={s.resultCard}>
              <div style={s.resultCardHeader}>
                <span>📄</span>
                <span>Document Summary</span>
              </div>
              <p style={s.summaryText}>{parsedData.summary || "No summary available."}</p>
            </div>

            {/* Table */}
            {parsedData.table_headers && (
              <div style={s.resultCard}>
                <div style={s.resultCardHeader}>
                  <span>📊</span>
                  <span>Extracted Data</span>
                </div>
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {parsedData.table_headers.map((h, i) => (
                          <th key={i} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.table_rows?.map((row, i) => (
                        <tr key={i} style={i % 2 === 0 ? {} : s.altRow}>
                          {row.map((cell, j) => <td key={j} style={s.td}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insights */}
            {parsedData.insights && (
              <div style={s.resultCard}>
                <div style={s.resultCardHeader}>
                  <span>💡</span>
                  <span>Key Insights</span>
                </div>
                <ul style={s.insightList}>
                  {parsedData.insights.map((insight, i) => (
                    <li key={i} style={s.insightItem}>
                      <span style={s.insightDot}>▸</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          recipe && !loading && (
            <div style={s.errorCard}>
              <pre style={s.errorPre}>{recipe}</pre>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PdfAnalyzer;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: "720px", margin: "0 auto" },
  header: {
    display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px",
  },
  iconWrap: { fontSize: "40px" },
  title: { margin: 0, fontSize: "26px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", color: "#64748b" },
  dropZone: {
    border: "2px dashed rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "40px",
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
  },
  dropContent: {},
  dropIcon: { fontSize: "40px", marginBottom: "12px" },
  dropText: { color: "#e2e8f0", fontSize: "16px", fontWeight: "600", marginBottom: "6px" },
  dropHint: { color: "#475569", fontSize: "13px" },
  filePreview: {
    display: "flex", alignItems: "center", gap: "14px", textAlign: "left",
  },
  fileIcon: { fontSize: "32px", flexShrink: 0 },
  fileName: { color: "#e2e8f0", fontSize: "15px", fontWeight: "600" },
  fileSize: { color: "#64748b", fontSize: "12px", marginTop: "4px" },
  removeBtn: {
    marginLeft: "auto", background: "rgba(239,68,68,0.2)", border: "none",
    color: "#fca5a5", borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
    fontSize: "13px", fontWeight: "700",
  },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" },
  btnPrimary: {
    padding: "12px 28px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "8px", transition: "opacity 0.2s",
  },
  btnOutline: {
    padding: "12px 20px", borderRadius: "10px",
    border: "1px solid rgba(102,126,234,0.5)",
    background: "transparent", color: "#a5b4fc",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  btnGhost: {
    padding: "12px 20px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent", color: "#64748b",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
  spinnerDot: {
    width: "12px", height: "12px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    display: "inline-block",
  },
  progressWrap: {
    height: "3px", borderRadius: "2px",
    background: "rgba(255,255,255,0.06)", marginBottom: "24px", overflow: "hidden",
  },
  progressBar: {
    height: "100%", width: "60%",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    animation: "shimmer 1.5s infinite",
    borderRadius: "2px",
  },
  results: { display: "flex", flexDirection: "column", gap: "16px" },
  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px", padding: "20px",
    backdropFilter: "blur(12px)",
  },
  resultCardHeader: {
    display: "flex", alignItems: "center", gap: "10px",
    color: "#a5b4fc", fontSize: "14px", fontWeight: "700",
    marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.8px",
  },
  summaryText: { color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", margin: 0 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px 14px",
    background: "rgba(102,126,234,0.15)",
    color: "#a5b4fc", fontSize: "12px", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  td: {
    padding: "10px 14px", color: "#cbd5e1", fontSize: "13px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  altRow: { background: "rgba(255,255,255,0.02)" },
  insightList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
  insightItem: { display: "flex", gap: "10px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" },
  insightDot: { color: "#667eea", fontWeight: "700", flexShrink: 0, marginTop: "1px" },
  errorCard: {
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "12px", padding: "16px",
  },
  errorPre: { color: "#fca5a5", fontSize: "13px", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" },
};
