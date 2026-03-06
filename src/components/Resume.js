import React, { useState } from "react";

const T = {
  bg: "#ffffff", panel: "#f8fafc", border: "#e2e8f0", text: "#0f172a",
  textDim: "#64748b", amber: "#d97706", green: "#059669", blue: "#2563eb", 
  purple: "#7c3aed", pink: "#db2777"
};

const AGENTS = [
  { id: "extractor", label: "AGENT 01", name: "KEYWORD MATCH", color: T.amber },
  { id: "analyzer", label: "AGENT 02", name: "GAPS & ANALYSIS", color: T.green },
  { id: "generator", label: "AGENT 03", name: "30 INTERVIEW QUESTIONS", color: T.blue },
  { id: "flashcards", label: "AGENT 06", name: "20 STUDY FLASHCARDS", color: T.pink },
];

export default function Resume() {
  const [jdText, setJdText] = useState("");
  const [fileObject, setFileObject] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [outputs, setOutputs] = useState({});
  const [matchScore, setMatchScore] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setFileObject(file);
  };

  const runPipeline = async () => {
    if (!jdText || !fileObject) return alert("Please provide JD and upload a PDF!");
    
    setOutputs({}); 
    setActiveAgent("extractor"); // Start visual processing

    const formData = new FormData();
    formData.append("file", fileObject);
    formData.append("jd", jdText); // Matches Java @RequestParam("jd")

    try {
      const url = `https://api.wintaibot.com/api/ai/prepare-interview?t=${Date.now()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData, 
      });

      if (!response.ok) throw new Error("Server connection failed.");

      const data = await response.json();
      
      setMatchScore(data.match_percentage);

      // Map the single JSON response to your individual Agent UI boxes
      setOutputs({
        extractor: `Keyword Match Score: ${data.match_percentage}%\n\n${data.analysis}`,
        analyzer: data.analysis,
        generator: data.questions.map((q, i) => `${i+1}. [${q.type}] ${q.q}\nGuidance: ${q.guidance}`).join("\n\n"),
        flashcards: data.flashcards.map((f, i) => `Card ${i+1}: ${f.front} → ${f.back}`).join("\n\n")
      });

    } catch (err) {
      setOutputs({ extractor: "Error: " + err.message });
    } finally {
      setActiveAgent(null);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "40px", color: T.text, fontFamily: "sans-serif" }}>
      
      {/* MATCH PERCENTAGE DASHBOARD */}
      {matchScore !== null && (
        <div style={{ background: T.panel, border: `2px solid ${T.blue}`, padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "30px", animation: "fadeIn 0.5s ease" }}>
           <h2 style={{ color: T.blue, margin: 0, fontSize: "32px" }}>{matchScore}% Keyword Match</h2>
           <p style={{ fontSize: "12px", color: T.textDim }}>Calculated by comparing Resume Skills vs Job Requirements</p>
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
            {activeAgent && !outputs[a.id] && <div style={{ fontSize: "8px", color: a.color, marginTop: "5px" }}>PROCESSING...</div>}
          </div>
        ))}
      </div>

      {/* SEQUENTIAL OUTPUTS */}
      <div style={{ minHeight: "300px", marginBottom: "40px" }}>
        {AGENTS.map(a => (
          outputs[a.id] && (
            <div key={a.id} style={{ 
              background: "#fff", border: `1px solid ${T.border}`, borderLeft: `5px solid ${a.color}`, 
              padding: "25px", marginBottom: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: a.color, marginBottom: "12px" }}>
                {a.name} // SYSTEM_GENERATED
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
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste keywords and requirements here..." style={{ width: "100%", height: "150px", marginTop: "10px", padding: "12px", border: `1px solid ${T.border}`, borderRadius: "8px", fontSize: "13px" }} />
          <button onClick={runPipeline} disabled={!!activeAgent} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", marginTop: "15px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            {activeAgent ? "ANALYZING KEYWORDS..." : "ANALYZE & GENERATE PREP KIT"}
          </button>
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>CANDIDATE RESUME (PDF)</label>
          <div style={{ marginTop: "10px", padding: "45px", background: T.panel, border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
            <input type="file" onChange={handleFile} accept=".pdf" />
            <div style={{ fontSize: "11px", marginTop: "20px", color: fileObject ? T.green : T.textDim }}>
              {fileObject ? `✔ ${fileObject.name} Loaded` : "Upload PDF to Begin"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}