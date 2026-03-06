import React, { useState } from "react";
import * as mammoth from "mammoth";

const T = {
  bg: "#ffffff",
  panel: "#f8fafc",
  border: "#e2e8f0",
  text: "#0f172a",
  textDim: "#64748b",
  amber: "#d97706",
  green: "#059669",
  blue: "#2563eb",
  purple: "#7c3aed",
  pink: "#db2777",
  mono: "'JetBrains Mono', monospace"
};

const AGENTS = [
  { id: "extractor", label: "01 — ROLE EXTRACTOR", icon: "◈", color: T.amber, desc: "Parsing JD" },
  { id: "analyzer", label: "02 — CV ANALYZER", icon: "◉", color: T.green, desc: "Mapping CV" },
  { id: "generator", label: "03 — QUESTION GEN", icon: "◆", color: T.blue, desc: "Synthesizing" },
  { id: "writer", label: "04 — ANSWER WRITER", icon: "◇", color: T.purple, desc: "Drafting" },
  { id: "scorer", label: "05 — CONFIDENCE", icon: "◎", color: T.amber, desc: "Scoring" },
  { id: "flashcards", label: "06 — FLASHCARDS", icon: "✦", color: T.pink, desc: "Generating" },
];

export default function Resume() {
  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const [rawFile, setRawFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);

  // ၁။ File Upload & Initial Parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawFile(file);
    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
      } else {
        setCvText(`[ ${file.name.toUpperCase()} DETECTED ]\nClick 'INITIALIZE PIPELINE' to begin extraction.`);
      }
    } catch (err) { alert("File Read Error"); }
  };

  // ၂။ Orchestration Pipeline (The Main Engine)
  const runFullPipeline = async () => {
    if (!rawFile || !jdText) return alert("Please provide both JD and CV!");
    
    setLoading(true);
    try {
      // Step A: Agent 01 & 02 - Extract & Analyze
      setCurrentStep("extractor");
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("prompt", `Job Requirements: ${jdText}`);

      const analyzeRes = await fetch("https://api.wintaibot.com/api/ai/analyze-pdf", {
        method: "POST",
        body: formData,
      });
      const parsedData = await analyzeRes.json();
      const extractedCV = parsedData.summary; // Backend summary used as CV text
      setCvText(extractedCV);

      // Step B: Agent 03, 04, 05, 06 - Generate Interview Prep Kit
      setCurrentStep("flashcards");
      const flashRes = await fetch("https://api.wintaibot.com/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd: jdText, cv: extractedCV }),
      });
      const cards = await flashRes.json();
      setFlashcards(cards);
      
      setCurrentStep(null);
      alert("Prep Kit Orchestration Complete!");
    } catch (error) {
      console.error(error);
      alert("Pipeline Interrupted: Check Console");
    } finally {
      setLoading(false);
    }
  };

  // ၃။ PDF Export Function
  const downloadPrepKit = async () => {
    if (flashcards.length === 0) return alert("No cards to export!");
    try {
      const res = await fetch("https://api.wintaibot.com/api/ai/flashcards-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flashcards),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Interview_Prep_Kit.pdf";
      a.click();
    } catch (err) { alert("Export Failed"); }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "20px", boxSizing: "border-box" }}>
      
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: `1px solid ${T.border}`, paddingBottom: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: T.text }}>ARCHITECT_OS // V1</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={runFullPipeline}
            disabled={loading}
            style={{ background: T.blue, color: "#fff", border: "none", padding: "6px 15px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
          >
            {loading ? "⚙️ ORCHESTRATING..." : "INITIALIZE PIPELINE"}
          </button>
          {flashcards.length > 0 && (
            <button 
              onClick={downloadPrepKit}
              style={{ background: T.green, color: "#fff", border: "none", padding: "6px 15px", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}
            >
              DOWNLOAD PREP KIT (PDF)
            </button>
          )}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>
        
        {/* SIDEBAR: Agent Status Monitor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ color: T.textDim, fontSize: "9px", fontWeight: "bold" }}>[ SYSTEM_MONITOR ]</label>
          {AGENTS.map(agent => (
            <div key={agent.id} style={{ 
              border: `1px solid ${currentStep === agent.id ? agent.color : T.border}`, 
              background: currentStep === agent.id ? `${agent.color}10` : T.panel, 
              padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.3s ease"
            }}>
              <span style={{ color: agent.color }}>{currentStep === agent.id ? "🔄" : agent.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>{agent.label}</div>
                <div style={{ fontSize: "9px", color: T.textDim }}>{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "8px", fontWeight: "bold" }}>INPUT: JOB_DESCRIPTION</label>
            <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste JD here..." style={{ width: "100%", height: "80px", border: `1px solid ${T.border}`, padding: "10px", fontSize: "12px", borderRadius: "4px", resize: "none" }} />
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "8px", fontWeight: "bold" }}>SOURCE: CV_STREAM</label>
            <input type="file" onChange={handleFileUpload} style={{ fontSize: "11px", marginBottom: "10px" }} />
            <div style={{ height: "120px", overflowY: "auto", fontSize: "11px", background: "#fff", padding: "10px", border: `1px solid ${T.border}`, borderRadius: "4px", whiteSpace: "pre-wrap", fontFamily: T.mono }}>
              {cvText || "Awaiting Data Source..."}
            </div>
          </div>

          {/* FLASHCARD PREVIEW AREA */}
          {flashcards.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              {flashcards.map((card, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${T.border}`, padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ color: T.pink, fontSize: "9px", fontWeight: "bold", marginBottom: "5px" }}>CARD #{i+1}</div>
                  <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px" }}>{card.q}</div>
                  <div style={{ fontSize: "11px", color: T.textDim, borderTop: `1px dashed ${T.border}`, paddingTop: "8px" }}>{card.a}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}