import React, { useState, useMemo } from "react";
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

  const handleProcess = async () => {
    if (!file) return alert("Please upload a PDF!");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", customPrompt.trim() || "Analyze this document and extract all important information.");
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
    try { return JSON.parse(recipe); } catch { return null; }
  }, [recipe]);

  const downloadCSV = () => {
    if (!parsedData?.table_headers) return;
    const csv = [
      parsedData.table_headers.join(","),
      ...(parsedData.table_rows || []).map(row => row.map(c => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Data_Export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ fontSize: "44px", lineHeight: 1 }}>🧙‍♂️</div>
          <div>
            <h2 style={S.headerTitle}>Smart Parser DocuWizard</h2>
            <p style={S.headerSub}>AI-powered PDF extraction &amp; interactive analytics</p>
          </div>
        </div>

        <div style={S.body}>
          {/* File picker */}
          <label style={S.label}>UPLOAD PDF DOCUMENT</label>
          <div style={{ ...S.fileRow, ...(file ? S.fileRowFilled : {}) }}>
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <input type="file" onChange={(e) => { setFile(e.target.files[0]); setRecipe(""); }} accept=".pdf" style={{ display: "none" }} />
              <span style={{ fontSize: "22px" }}>{file ? "📄" : "📂"}</span>
              <span style={{ fontSize: "14px", color: file ? "#059669" : "#64748b", fontWeight: file ? "600" : "400" }}>
                {file ? file.name : "Click to choose a PDF file"}
              </span>
              {file && <span style={S.fileSizeBadge}>{(file.size / 1024).toFixed(0)} KB</span>}
            </label>
            {file && (
              <button onClick={() => { setFile(null); setRecipe(""); }} style={S.removeBtn}>✕</button>
            )}
          </div>

          {/* Focus prompt */}
          <label style={{ ...S.label, marginTop: "16px" }}>
            ANALYSIS FOCUS <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", fontSize: "11px" }}>(optional)</span>
          </label>
          <textarea
            style={S.textarea}
            placeholder="e.g. 'Extract all financial figures and payment terms' — leave blank for full analysis"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
          />

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleProcess} disabled={loading} style={{ ...S.btn, flex: 1, ...(loading ? S.btnDisabled : {}) }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <span style={S.spinner} /> Analyzing...
                </span>
              ) : "🔍 Analyze PDF"}
            </button>
            {parsedData?.table_headers?.length > 0 && (
              <button onClick={downloadCSV} style={S.exportBtn}>📊 CSV</button>
            )}
            {recipe && (
              <button onClick={() => { setRecipe(""); setFile(null); setCustomPrompt(""); }} style={S.clearBtn}>Clear</button>
            )}
          </div>
        </div>

        {/* Results */}
        {parsedData ? (
          <div style={S.results}>

            {/* Doc type + summary */}
            <div style={S.summaryBlock}>
              {parsedData.document_type && (
                <span style={{ ...S.docBadge, background: DOC_TYPE_COLORS[parsedData.document_type] || "#7f8c8d" }}>
                  {parsedData.document_type}
                </span>
              )}
              <h4 style={S.sectionTitle}>📄 AI Document Summary</h4>
              <p style={S.summaryText}>{parsedData.summary || "No summary available."}</p>
            </div>

            {/* Key Metrics */}
            {parsedData.key_metrics?.length > 0 && (
              <div style={S.section}>
                <h4 style={S.sectionTitle}>📈 Key Metrics</h4>
                <div style={S.metricsGrid}>
                  {parsedData.key_metrics.map((m, i) => (
                    <div key={i} style={S.metricCard}>
                      <div style={S.metricValue}>{m.value}</div>
                      <div style={S.metricLabel}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            {parsedData.table_headers?.length > 0 && (
              <div style={S.section}>
                <h4 style={S.sectionTitle}>📊 Extracted Details</h4>
                <div style={S.tableWrap}>
                  <table style={S.table}>
                    <thead>
                      <tr>{parsedData.table_headers.map((h, i) => <th key={i} style={S.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {parsedData.table_rows?.map((row, i) => (
                        <tr key={i} style={i % 2 ? { background: "#f8fafc" } : {}}>
                          {row.map((cell, j) => <td key={j} style={S.td}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insights + Actions */}
            <div style={S.twoCol}>
              {parsedData.insights?.length > 0 && (
                <div style={S.insightsCard}>
                  <h4 style={S.cardTitle}>💡 Key Insights</h4>
                  <ul style={S.list}>
                    {parsedData.insights.map((item, i) => (
                      <li key={i} style={S.listItem}>✦ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {parsedData.action_items?.length > 0 && (
                <div style={S.actionsCard}>
                  <h4 style={S.cardTitle}>✅ Action Items</h4>
                  <ul style={S.list}>
                    {parsedData.action_items.map((item, i) => (
                      <li key={i} style={S.listItem}>→ {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Entities */}
            {parsedData.entities && (
              <div style={S.section}>
                <h4 style={S.sectionTitle}>🔍 Extracted Entities</h4>
                <div style={S.entitiesGrid}>
                  {[
                    { key: "people", label: "👤 People", cls: { bg: "#dbeafe", color: "#1d4ed8" } },
                    { key: "organizations", label: "🏢 Organizations", cls: { bg: "#ede9fe", color: "#6d28d9" } },
                    { key: "dates", label: "📅 Dates", cls: { bg: "#dcfce7", color: "#15803d" } },
                    { key: "amounts", label: "💰 Amounts", cls: { bg: "#ffedd5", color: "#c2410c" } },
                  ].filter(e => parsedData.entities[e.key]?.length > 0).map(e => (
                    <div key={e.key} style={S.entityGroup}>
                      <div style={S.entityHeader}>{e.label}</div>
                      <div>{parsedData.entities[e.key].map((v, i) => (
                        <span key={i} style={{ ...S.tag, background: e.cls.bg, color: e.cls.color }}>{v}</span>
                      ))}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : recipe && (
          <div style={S.errorBox}>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: "13px" }}>{recipe}</pre>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea:focus { outline: none; border-color: #16a085 !important; box-shadow: 0 0 0 3px rgba(22,160,133,0.12) !important; }
      `}</style>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f1f5f9", padding: "32px 20px", fontFamily: "'Segoe UI', Arial, sans-serif" },
  card: { maxWidth: "860px", margin: "0 auto", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" },

  header: { background: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)", padding: "28px 32px", display: "flex", alignItems: "center", gap: "18px" },
  headerTitle: { margin: 0, fontSize: "22px", fontWeight: "700", color: "#fff" },
  headerSub: { margin: "4px 0 0", fontSize: "13px", color: "#99f6e4" },

  body: { padding: "28px 32px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.8px", marginBottom: "8px" },

  fileRow: { display: "flex", alignItems: "center", padding: "14px 16px", border: "2px dashed #cbd5e1", borderRadius: "10px", background: "#f8fafc", marginBottom: "4px", transition: "all 0.2s", gap: "10px" },
  fileRowFilled: { borderColor: "#0d9488", borderStyle: "solid", background: "#f0fdfa" },
  fileSizeBadge: { fontSize: "11px", background: "#ccfbf1", color: "#0f766e", padding: "2px 8px", borderRadius: "10px", fontWeight: "600", marginLeft: "auto" },
  removeBtn: { padding: "4px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700", flexShrink: 0 },

  textarea: { width: "100%", boxSizing: "border-box", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", color: "#334155", resize: "vertical", lineHeight: "1.5", background: "#f8fafc", marginBottom: "18px", transition: "border 0.2s" },

  btn: { padding: "14px", background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  btnDisabled: { background: "#94a3b8", cursor: "not-allowed" },
  exportBtn: { padding: "14px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  clearBtn: { padding: "14px 20px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  results: { borderTop: "1px solid #e2e8f0", padding: "28px 32px" },
  summaryBlock: { background: "#f0fdfa", borderRadius: "12px", padding: "20px", marginBottom: "24px", borderLeft: "5px solid #0d9488" },
  docBadge: { display: "inline-block", padding: "3px 12px", borderRadius: "20px", color: "#fff", fontSize: "12px", fontWeight: "700", marginBottom: "10px" },
  sectionTitle: { margin: "0 0 12px", fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  summaryText: { margin: 0, fontSize: "14px", lineHeight: "1.75", color: "#475569" },

  section: { marginBottom: "24px" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" },
  metricCard: { background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "10px", padding: "16px 14px", textAlign: "center" },
  metricValue: { fontSize: "20px", fontWeight: "700", color: "#4ade80", marginBottom: "4px", wordBreak: "break-word" },
  metricLabel: { fontSize: "11px", color: "#94a3b8" },

  tableWrap: { overflowX: "auto", borderRadius: "8px", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: { background: "#0d9488", color: "#fff", padding: "11px 14px", textAlign: "left", fontSize: "13px", fontWeight: "600" },
  td: { padding: "11px 14px", borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "#475569" },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" },
  insightsCard: { background: "#fffbe6", borderRadius: "10px", padding: "18px", borderLeft: "4px solid #eab308" },
  actionsCard: { background: "#f0fdf4", borderRadius: "10px", padding: "18px", borderLeft: "4px solid #22c55e" },
  cardTitle: { margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#1e293b" },
  list: { padding: 0, margin: 0, listStyle: "none" },
  listItem: { fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "7px" },

  entitiesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" },
  entityGroup: { background: "#f8fafc", borderRadius: "8px", padding: "14px" },
  entityHeader: { fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "10px" },
  tag: { display: "inline-block", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", margin: "3px 3px 3px 0", fontWeight: "500" },

  errorBox: { margin: "0 32px 28px", padding: "16px", background: "#fff5f5", borderRadius: "8px", border: "1px solid #fecaca", color: "#dc2626" },
};

export default PdfAnalyzer;
