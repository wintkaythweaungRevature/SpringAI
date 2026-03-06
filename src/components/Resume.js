import React, { useState } from "react";

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

export default function Resume() {
  const [jdText, setJdText] = useState("");
  const [fileObject, setFileObject] = useState(null); // Store the actual binary file
  const [activeAgent, setActiveAgent] = useState(null);
  const [outputs, setOutputs] = useState({});

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
    }
  };

  const runPipeline = async () => {
    if (!jdText || !fileObject) return alert("Please provide JD and upload a PDF!");
    setOutputs({}); 

    for (const a of AGENTS) {
      setActiveAgent(a.id);
      
      const formData = new FormData();
      formData.append("file", fileObject);
      // We send a custom prompt for each agent so the AI knows its role
      formData.append("prompt", `Role: ${a.name}. Analyze this resume against the following JD: ${jdText}. Provide a detailed 10-line technical insight.`);

      try {
        // Using the URL and logic from your working Analyzer.js
        const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { 'Accept': 'application/json' },
          body: formData, // Sending FormData as in your working file
        });

        if (!response.ok) throw new Error("Server Error");

        const data = await response.json();
        
        // Map the correct field from your API (usually 'summary' or 'result')
        const aiAnswer = data.summary || data.result || "Analysis complete.";
        
        setOutputs(prev => ({ ...prev, [a.id]: aiAnswer }));
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
                {a.name} // LIVE_AI_REPORT
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
            {activeAgent ? "AGENTS PROCESSING..." : "INITIALIZE AI AGENTS"}
          </button>
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>CANDIDATE SOURCE (PDF)</label>
          <div style={{ marginTop: "10px", padding: "35px", background: T.panel, border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
            <input type="file" onChange={handleFile} accept=".pdf" style={{ fontSize: "12px" }} />
            <div style={{ fontSize: "11px", marginTop: "20px", color: fileObject ? T.green : T.textDim }}>
              {fileObject ? `✔ ${fileObject.name} Ready` : "Upload PDF Resume"}
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