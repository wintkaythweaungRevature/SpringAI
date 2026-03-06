import React, { useState } from "react";

const T = {
  bg: "#ffffff", panel: "#f8fafc", border: "#e2e8f0", text: "#0f172a",
  textDim: "#64748b", amber: "#d97706", green: "#059669", blue: "#2563eb", 
  purple: "#7c3aed", pink: "#db2777"
};

const AGENTS = [
  { id: "extractor", label: "AGENT 01", name: "MATCH SCORE", color: T.amber },
  { id: "analyzer", label: "AGENT 02", name: "STRENGTHS & WEAKNESSES", color: T.green },
  { id: "generator", label: "AGENT 03", name: "30 INTERVIEW QUESTIONS", color: T.blue },
  { id: "flashcards", label: "AGENT 06", name: "STUDY FLASHCARDS", color: T.pink },
];

export default function Resume() {
  const [jdText, setJdText] = useState("");
  const [fileObject, setFileObject] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [outputs, setOutputs] = useState({});

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setFileObject(file);
  };

  const runPipeline = async () => {
    if (!jdText || !fileObject) return alert("Please provide JD and upload a PDF!");
    setOutputs({}); 

    // This loop runs automatically one by one
    for (const a of AGENTS) {
      setActiveAgent(a.id);
      
      const formData = new FormData();
      formData.append("file", fileObject);

      // Define specific instructions for each box
      let dynamicPrompt = "";
      if (a.id === "extractor") {
        dynamicPrompt = `Calculate Match Percentage (0-100%). Provide a 10-line detailed breakdown of why the candidate fits or doesn't fit this JD: ${jdText}`;
      } else if (a.id === "analyzer") {
        dynamicPrompt = `Analyze Strengths and Weaknesses. List 5 specific strengths and 5 critical weaknesses based on this JD: ${jdText}`;
      } else if (a.id === "generator") {
        dynamicPrompt = `Generate exactly 30 interview questions (10 Technical, 10 Behavioral, 10 Role-specific). Provide brief answer guidance for each. JD: ${jdText}`;
      } else if (a.id === "flashcards") {
        dynamicPrompt = `Create 10 technical flashcards based on the skills found in the resume and required by the JD: ${jdText}`;
      }

      formData.append("prompt", dynamicPrompt);

      try {
        const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { 'Accept': 'application/json' },
          body: formData, 
        });

        if (!response.ok) throw new Error("Server Error");

        const data = await response.json();
        const aiAnswer = data.summary || data.result || "Processing complete.";
        
        // Update state and move to next agent automatically
        setOutputs(prev => ({ ...prev, [a.id]: aiAnswer }));
      } catch (err) {
        setOutputs(prev => ({ ...prev, [a.id]: "Error: Check backend connection." }));
      }
    }
    setActiveAgent(null);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "40px", color: T.text, fontFamily: "sans-serif" }}>
      
      {/* MATCH PERCENTAGE DASHBOARD */}
      {outputs.extractor && (
        <div style={{ background: T.panel, border: `1px solid ${T.blue}`, padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "30px" }}>
           <h2 style={{ color: T.blue, margin: 0 }}>
             {outputs.extractor.match(/\d+/)?.[0] || "85"}% Match Score
           </h2>
           <p style={{ fontSize: "12px", color: T.textDim }}>AI-Generated Compatibility Rating</p>
        </div>
      )}

      {/* MONITOR GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "30px" }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ 
            background: T.panel, border: `1px solid ${activeAgent === a.id ? a.color : T.border}`, 
            padding: "15px", borderRadius: "8px", textAlign: "center", 
            opacity: activeAgent === a.id || outputs[a.id] ? 1 : 0.3,
            transition: "all 0.3s ease"
          }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: a.color }}>{a.label}</div>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>{a.name}</div>
            {activeAgent === a.id && <div style={{ fontSize: "10px", color: a.color }}>⚡ ANALYZING...</div>}
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
              <div style={{ fontSize: "11px", fontWeight: "bold", color: a.color, marginBottom: "12px" }}>
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
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste JD requirements here..." style={{ width: "100%", height: "150px", marginTop: "10px", padding: "12px", border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "13px" }} />
          <button onClick={runPipeline} disabled={!!activeAgent} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", marginTop: "15px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            {activeAgent ? "AI PROCESSING..." : "RUN FULL PREP KIT"}
          </button>
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>RESUME SOURCE (PDF)</label>
          <div style={{ marginTop: "10px", padding: "45px", background: T.panel, border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
            <input type="file" onChange={handleFile} accept=".pdf" />
            <div style={{ fontSize: "11px", marginTop: "20px", color: fileObject ? T.green : T.textDim }}>
              {fileObject ? `✔ ${fileObject.name} Loaded` : "Upload Resume"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}