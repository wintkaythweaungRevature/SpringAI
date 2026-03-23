'use client';

import React, { useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

function PdfAnalyzer() {
  const { token, apiBase } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Analyze this document and extract all important information.");
    setLoading(true); setResult("");
    try {
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/analyze-pdf?t=${Date.now()}`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: "POST", headers, body: formData });
      if (!response.ok) throw new Error(`Server Error (${response.status})`);
      const data = await response.json();
      setResult(JSON.stringify(data));
    } catch (e) {
      setResult(`Analysis failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const parsed = useMemo(() => {
    if (!result || result.startsWith("Analysis failed")) return null;
    try { return JSON.parse(result); } catch { return null; }
  }, [result]);

  const downloadCSV = () => {
    if (!parsed?.table_headers) return;
    const csv = [parsed.table_headers.join(","), ...(parsed.table_rows || []).map((r: string[]) => r.map((c: string) => `"${c}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={s.page}>
      <div style={s.layout}>

        {/* ── LEFT: Controls ── */}
        <div style={s.left}>
          <div style={s.panelHeader}>
            <span style={s.panelIcon}>🧙‍♂️</span>
            <div>
              <h2 style={s.panelTitle}>DocuWizard</h2>
              <p style={s.panelSub}>AI PDF extraction</p>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            style={{ ...s.dropZone, ...(dragOver ? s.dropOver : {}), ...(file ? s.dropFilled : {}) } as React.CSSProperties}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
            {file ? (
              <div style={s.fileRow}>
                <span style={{ fontSize: "24px" }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.fileName}>{file.name}</div>
                  <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button style={s.removeBtn} onClick={(e) => { e.stopPropagation(); setFile(null); setResult(""); }}>✕</button>
              </div>
            ) : (
              <div style={s.dropContent}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📂</div>
                <div style={s.dropText}>Drop PDF here</div>
                <div style={s.dropHint}>or click to browse</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <button onClick={handleProcess} disabled={loading || !file}
            style={{ ...s.btnPrimary, opacity: !file ? 0.5 : 1, marginBottom: "10px" }}>
            {loading ? <><span style={s.spinner} /> Analyzing...</> : "✦ Analyze PDF"}
          </button>

          {parsed && (
            <button onClick={downloadCSV} style={s.btnOutline}>⬇ Export CSV</button>
          )}

          {result && (
            <button onClick={() => { setResult(""); setFile(null); }} style={s.btnGhost}>Clear</button>
          )}
        </div>

        {/* ── RIGHT: Results ── */}
        <div style={s.right}>
          {loading ? (
            <div style={s.emptyCanvas}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
                <p style={s.emptyTitle}>Analyzing your document...</p>
                <p style={s.emptyHint}>AI is extracting key information</p>
                <div style={s.progressWrap}><div style={s.progressBar} /></div>
              </div>
            </div>
          ) : parsed ? (
            <div style={s.results}>
              {parsed.summary && (
                <div style={s.resultCard}>
                  <div style={s.resultCardTitle}>📄 Document Summary</div>
                  <p style={s.summaryText}>{parsed.summary}</p>
                </div>
              )}
              {parsed.table_headers && (
                <div style={s.resultCard}>
                  <div style={s.resultCardTitle}>📊 Extracted Data</div>
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>{parsed.table_headers.map((h, i) => <th key={i} style={s.th}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {parsed.table_rows?.map((row, i) => (
                          <tr key={i} style={i % 2 ? s.altRow : {}}>
                            {row.map((c, j) => <td key={j} style={s.td}>{c}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {parsed.insights && (
                <div style={s.resultCard}>
                  <div style={s.resultCardTitle}>💡 Key Insights</div>
                  <ul style={s.insightList}>
                    {parsed.insights.map((item, i) => (
                      <li key={i} style={s.insightItem}><span style={s.insightDot}>▸</span>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : result && !loading ? (
            <div style={s.errorCard}><pre style={s.errorPre}>{result}</pre></div>
          ) : (
            <div style={s.emptyCanvas}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.2 }}>📋</div>
                <p style={s.emptyTitle}>Analysis results appear here</p>
                <p style={s.emptyHint}>Upload a PDF and click Analyze</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PdfAnalyzer;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s: Record<string, any> = {
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
    padding: "24px 16px", textAlign: "center" as const,
    cursor: "pointer", marginBottom: "14px",
    background: "#f8fafc", transition: "all 0.2s",
  },
  dropOver: { borderColor: "#2563eb", background: "#eff6ff" },
  dropFilled: { border: "2px solid #bfdbfe", cursor: "default", padding: "14px 16px" },
  dropContent: {},
  dropText: { color: "#0f172a", fontSize: "14px", fontWeight: "600", marginBottom: "4px" },
  dropHint: { color: "#94a3b8", fontSize: "12px" },
  fileRow: { display: "flex", alignItems: "center", gap: "10px", textAlign: "left" as const },
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
  btnOutline: {
    width: "100%", padding: "10px", borderRadius: "10px",
    border: "1px solid #bfdbfe", background: "#eff6ff",
    color: "#2563eb", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "inherit", marginBottom: "8px",
  },
  btnGhost: {
    width: "100%", padding: "9px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#94a3b8", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", fontFamily: "inherit", marginTop: "6px",
  },
  spinner: { width: "12px", height: "12px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", display: "inline-block" },
  right: { flex: 1, minWidth: 0 },
  emptyCanvas: {
    background: "#fff", border: "2px dashed #e2e8f0",
    borderRadius: "16px", minHeight: "400px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { color: "#94a3b8", fontSize: "15px", fontWeight: "600", margin: "0 0 6px" },
  emptyHint: { color: "#cbd5e1", fontSize: "13px", margin: "0 0 20px" },
  progressWrap: { height: "3px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden", width: "160px", margin: "0 auto" },
  progressBar: { height: "100%", borderRadius: "2px", background: "linear-gradient(90deg,#2563eb,#7c3aed)", animation: "pulse-bar 2s ease-in-out infinite" },
  results: { display: "flex", flexDirection: "column", gap: "14px" },
  resultCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  resultCardTitle: { fontSize: "13px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" },
  summaryText: { color: "#475569", fontSize: "14px", lineHeight: "1.7", margin: 0 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left" as const, padding: "9px 12px", background: "#f1f5f9", color: "#2563eb", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "9px 12px", color: "#475569", fontSize: "13px", borderBottom: "1px solid #f1f5f9" },
  altRow: { background: "#f8fafc" },
  insightList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" },
  insightItem: { display: "flex", gap: "10px", color: "#475569", fontSize: "14px", lineHeight: "1.6" },
  insightDot: { color: "#2563eb", fontWeight: "700", flexShrink: 0 },
  errorCard: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px" },
  errorPre: { color: "#b91c1c", fontSize: "13px", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" },
};
