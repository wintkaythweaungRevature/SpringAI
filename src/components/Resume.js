import React, { useState } from "react";
import * as mammoth from "mammoth";

const T = {
  bg: "#ffffff", panel: "#f8fafc", border: "#e2e8f0", text: "#0f172a",
  textDim: "#64748b", amber: "#d97706", green: "#059669", blue: "#2563eb", 
  purple: "#7c3aed", pink: "#db2777"
};

const AGENTS = [
  { id: "extractor", label: "AGENT 01", name: "ROLE EXTRACTOR", color: T.amber },
  { id: "analyzer", label: "AGENT 02", name: "CV ANALYZER", color: T.green },
  { id: "generator", label: "AGENT 03", name: "QUESTION GEN", color: T.blue },
  { id: "writer", label: "AGENT 04", name: "ANSWER WRITER", color: T.purple },
  { id: "scorer", label: "AGENT 05", name: "CONFIDENCE", color: T.amber },
  { id: "flashcards", label: "AGENT 06", name: "FLASHCARDS", color: T.pink },
];

export default function PrepKit() {
  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const [activeAgent, setActiveAgent] = useState(null);
  const [outputs, setOutputs] = useState({});

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.name.endsWith(".docx")) {
      const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      setCvText(value);
    } else {
      // For PDF, you'll ideally send the File object to the backend 
      // but for this snippet, we'll treat it as text-based
      setCvText(`[FILE_SOURCE: ${file.name}]`); 
    }
  };

  const runPipeline = async () => {
    if (!jdText || !cvText) return alert("Please provide JD and Resume content.");
    setOutputs({}); 

    for (const a of AGENTS) {
      setActiveAgent(a.id);
      
      try {
        // CALLING YOUR BACKEND (Example URL)
        const response = await fetch("https://api.wintaibot.com/api/ai/analyze-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: a.id,
            agentName: a.name,
            jd: jdText,
            cv: cvText
          })
        });

        const data = await response.json();
        // State updates: Previous answers remain, new one appears below
        setOutputs(prev => ({ ...prev, [a.id]: data.result }));
      } catch (err) {
        setOutputs(prev => ({ ...prev, [a.id]: "Error connecting to AI service." }));
      }
    }
    setActiveAgent(null);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "40px", color: T.text, fontFamily: "sans-serif" }}>
      
      {/* MONITOR GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "30px" }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ 
            background: T.panel, border: `1px solid ${activeAgent === a.id ? a.color : T.border}`, 
            padding: "10px", borderRadius: "8px", textAlign: "center", 
            opacity: activeAgent === a.id || outputs[a.id] ? 1 : 0.3,
            transition: "all 0.3s ease"
          }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: a.color }}>{a.label}</div>
            {activeAgent === a.id && <div style={{ fontSize: "8px", marginTop: "4px", color: a.color }}>⚡ ACTIVE</div>}
            {outputs[a.id] && <div style={{ fontSize: "8px", marginTop: "4px", color: T.green }}>✓ DONE</div>}
          </div>
        ))}
      </div>

      {/* SEQUENTIAL OUTPUTS */}
      <div style={{ minHeight: "300px", marginBottom: "40px" }}>
        {AGENTS.map(a => (
          outputs[a.id] && (
            <div key={a.id} style={{ 
              background: "#fff", border: `1px solid ${T.border}`, borderLeft: `5px solid ${a.color}`, 
              padding: "25px", marginBottom: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              animation: "fadeIn 0.5s ease forwards"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: a.color, marginBottom: "12px", letterSpacing: "0.5px" }}>
                {a.name} // DYNAMIC_REPORT
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                {outputs[a.id]}
              </div>
            </div>
          )
        ))}
      </div>

      {/* INPUTS PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", borderTop: `1px solid ${T.border}`, paddingTop: "30px" }}>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>TARGET JOB DESCRIPTION</label>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste full JD here..." style={{ width: "100%", height: "120px", marginTop: "10px", padding: "12px", border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "13px" }} />
          <button onClick={runPipeline} disabled={!!activeAgent} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", marginTop: "15px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", opacity: activeAgent ? 0.6 : 1 }}>
            {activeAgent ? "AGENTS PROCESSING DATA..." : "EXECUTE PIPELINE"}
          </button>
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>CANDIDATE SOURCE (CV)</label>
          <div style={{ marginTop: "10px", padding: "35px", background: T.panel, border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
            <input type="file" onChange={handleFile} accept=".pdf,.docx" style={{ fontSize: "12px" }} />
            <div style={{ fontSize: "11px", marginTop: "20px", color: cvText ? T.green : T.textDim }}>
              {cvText ? "✔ CV Content Parsed & Ready" : "Upload Resume to Begin"}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}