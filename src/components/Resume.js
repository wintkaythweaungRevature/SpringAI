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
  const [cvText, setCvText] = useState(""); // ဤနေရာတွင် Readable Text သိမ်းမည်
  const [rawFile, setRawFile] = useState(null); // Backend ပို့ရန် File သိမ်းမည်
  const [loading, setLoading] = useState(false);
  
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState({});

  // File ရွေးချယ်သည့်အခါ
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setRawFile(file); // File object ကို state ထဲသိမ်းထားပါ

    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
      } else if (file.name.endsWith(".pdf")) {
        // PDF ဆိုလျှင် binary data များ မမြင်ရစေရန် preview text ကို ခေတ္တပြောင်းထားပါမည်
        setCvText(`[ PDF_DETECTED ]: ${file.name}\nClick 'ANALYZE CV' to parse content.`);
      } else {
        const reader = new FileReader();
        reader.onload = (f) => setCvText(f.target.result);
        reader.readAsText(file);
      }
    } catch (err) { alert("Error reading file."); }
  };

  // PDF ကို Backend သို့ပို့၍ Analyze လုပ်ခြင်း (Transcription Logic အတိုင်း)
  const analyzeCVWithBackend = async () => {
    if (!rawFile) return alert("Please upload a CV file first!");
    
    const formData = new FormData();
    formData.append("file", rawFile);

    setLoading(true);
    setCvText("📡 COMMENCING_REMOTE_ANALYSIS... PLEASE_WAIT");

    try {
      const url = `https://api.wintaibot.com/api/ai/generate-flashcards`; 
      const response = await fetch(url, {
        method: "POST",
        body: formData, // FormData ပို့သည့်အတွက် Fetch မှ headers ကို အလိုအလျောက် သတ်မှတ်ပေးပါမည်
      });

      if (!response.ok) {
        throw new Error(`Server Error (${response.status})`);
      }

      const data = await response.text(); 
      setCvText(data); // Readable text ကို Preview box ထဲသို့ ထည့်သွင်းခြင်း
    } catch (error) {
      setCvText(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "20px", boxSizing: "border-box", overflowX: "hidden" }}>
      
      {/* HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${T.border}`, paddingBottom: "10px" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: T.text, letterSpacing: "1px" }}>ARCHITECT_OS // V1</div>
        <button 
           onClick={() => alert("Pipeline Initialized")}
           style={{ background: "#0f172a", color: "#fff", border: "none", padding: "6px 15px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
        >
          INITIALIZE
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: SYSTEM MONITOR */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ color: T.textDim, fontSize: "9px", fontWeight: "bold", letterSpacing: "1px" }}>[ SYSTEM_MONITOR ]</label>
          {AGENTS.map(agent => (
            <div key={agent.id} style={{ border: `1px solid ${T.border}`, background: T.panel, padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: agent.color, fontSize: "14px" }}>{agent.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: T.text }}>{agent.label}</div>
                <div style={{ fontSize: "9px", color: T.textDim }}>{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: INPUTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0 }}>
          
          {/* JD INPUT BOX */}
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "8px", fontWeight: "bold" }}>INPUT_SOURCE: JOB_DESCRIPTION</label>
            <textarea 
              value={jdText} 
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste JD here..."
              style={{ width: "100%", height: "80px", border: `1px solid ${T.border}`, padding: "10px", fontSize: "12px", borderRadius: "4px", boxSizing: "border-box", resize: "none", fontFamily: T.mono }}
            />
          </div>

          {/* CV INPUT BOX WITH ANALYZE FUNCTION */}
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "15px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "8px", fontWeight: "bold" }}>INPUT_SOURCE: CV_STREAM</label>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
              <input 
                type="file" 
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload} 
                style={{ fontSize: "11px", flex: 1, minWidth: "150px" }} 
              />
              <button 
                onClick={analyzeCVWithBackend}
                disabled={loading}
                style={{ 
                  background: loading ? T.textDim : T.blue, 
                  color: "#fff", 
                  border: "none", 
                  padding: "6px 14px", 
                  borderRadius: "4px", 
                  fontSize: "10px", 
                  fontWeight: "bold", 
                  cursor: loading ? "not-allowed" : "pointer", 
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s"
                }}
              >
                {loading ? "⌛ ANALYZING..." : "ANALYZE CV"}
              </button>
            </div>

            {/* PREVIEW BOX */}
            <div style={{ 
              height: "150px", overflowY: "auto", fontSize: "11px", color: T.text, 
              background: "#fff", padding: "15px", border: `1px solid ${T.border}`, 
              borderRadius: "4px", boxSizing: "border-box", whiteSpace: "pre-wrap",
              wordBreak: "break-all", fontFamily: T.mono, lineHeight: "1.5"
            }}>
              {cvText || "Awaiting file upload..."}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}