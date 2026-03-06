import React, { useState } from "react";

const T = {
  bg: "#ffffff", panel: "#f8fafc", border: "#e2e8f0", text: "#0f172a",
  textDim: "#64748b", amber: "#d97706", green: "#059669", blue: "#2563eb", 
  purple: "#7c3aed", pink: "#db2777", darkBg: "#1a1f26", darkBorder: "#2d3748"
};

const AGENTS = [
  { id: "extractor", label: "AGENT 01", name: "KEYWORD MATCH", color: T.amber },
  { id: "analyzer", label: "AGENT 02", name: "GAPS & ANALYSIS", color: T.green },
  { id: "generator", label: "AGENT 03", name: "30 INTERVIEW QUESTIONS", color: T.blue },
  { id: "flashcards", label: "AGENT 06", name: "20 STUDY FLASHCARDS", color: T.pink },
];

// Specialized Flashcard Component with Dark Mode Design
const Flashcard = ({ card, index }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      style={{
        background: T.darkBg, borderRadius: "12px", padding: "24px", marginBottom: "16px",
        cursor: "pointer", border: `1px solid ${T.darkBorder}`, transition: "all 0.2s ease",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ color: "#4a5568", fontWeight: "bold", fontSize: "14px" }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div style={{ color: "#e2e8f0", fontSize: "16px", lineHeight: "1.6", marginBottom: "20px", minHeight: "60px" }}>
        {flipped ? card.back : card.front}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#718096", marginBottom: "4px", fontWeight: "bold", letterSpacing: "1px" }}>CONFIDENCE</div>
          <div style={{ height: "4px", background: "#2d3748", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${card.confidence || 85}%`, height: "100%", background: T.amber }} />
          </div>
          <div style={{ textAlign: "right", fontSize: "12px", color: T.amber, marginTop: "4px" }}>{card.confidence || 85}%</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#718096", marginBottom: "4px", fontWeight: "bold", letterSpacing: "1px" }}>ROLE FIT</div>
          <div style={{ height: "4px", background: "#2d3748", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${card.roleFit || 90}%`, height: "100%", background: T.green }} />
          </div>
          <div style={{ textAlign: "right", fontSize: "12px", color: T.green, marginTop: "4px" }}>{card.roleFit || 90}%</div>
        </div>
      </div>
    </div>
  );
};

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
    setActiveAgent("extractor");

    const formData = new FormData();
    formData.append("file", fileObject);
    formData.append("jd", jdText);

    try {
      const url = `https://api.wintaibot.com/api/ai/prepare-interview?t=${Date.now()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData, 
      });

      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();
      
      setMatchScore(data.match_percentage);
      setOutputs({
        extractor: data.analysis,
        analyzer: data.analysis,
        generator: data.questions, // Store as array for mapping
        flashcards: data.flashcards  // Store as array for mapping
      });
    } catch (err) {
      setOutputs({ extractor: "Error: " + err.message });
    } finally {
      setActiveAgent(null);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "40px", color: T.text, fontFamily: "sans-serif" }}>
      {/* DASHBOARD */}
      {matchScore !== null && (
        <div style={{ background: T.panel, border: `2px solid ${T.blue}`, padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "30px" }}>
           <h2 style={{ color: T.blue, margin: 0, fontSize: "32px" }}>{matchScore}% Keyword Match</h2>
        </div>
      )}

      {/* MONITOR GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "30px" }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{ 
            background: T.panel, border: `1px solid ${activeAgent === a.id ? a.color : T.border}`, 
            padding: "15px", borderRadius: "8px", textAlign: "center", 
            opacity: activeAgent === a.id || outputs[a.id] ? 1 : 0.3
          }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: a.color }}>{a.label}</div>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>{a.name}</div>
          </div>
        ))}
      </div>

      {/* DYNAMIC OUTPUTS */}
      <div style={{ minHeight: "300px", marginBottom: "40px" }}>
        {AGENTS.map(a => (
          outputs[a.id] && (
            <div key={a.id} style={{ 
              background: "#fff", border: `1px solid ${T.border}`, borderLeft: `5px solid ${a.color}`, 
              padding: "25px", marginBottom: "20px", borderRadius: "8px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: a.color, marginBottom: "12px" }}>{a.name}</div>
              
              {/* SPECIAL RENDERING FOR FLASHCARDS */}
              {a.id === "flashcards" && Array.isArray(outputs[a.id]) ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  {outputs[a.id].map((card, idx) => (
                    <Flashcard key={idx} card={card} index={idx} />
                  ))}
                </div>
              ) : a.id === "generator" && Array.isArray(outputs[a.id]) ? (
                // Render Questions
                outputs[a.id].map((q, idx) => (
                  <div key={idx} style={{ marginBottom: "15px", paddingBottom: "10px", borderBottom: `1px solid ${T.border}` }}>
                    <strong>{idx + 1}. {q.q}</strong>
                    <p style={{ fontSize: "13px", color: T.textDim }}>{q.guidance}</p>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{outputs[a.id]}</div>
              )}
            </div>
          )
        ))}
      </div>

      {/* INPUTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", borderTop: `1px solid ${T.border}`, paddingTop: "30px" }}>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>TARGET JOB DESCRIPTION</label>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} style={{ width: "100%", height: "150px", marginTop: "10px", padding: "12px", border: `1px solid ${T.border}`, borderRadius: "8px" }} />
          <button onClick={runPipeline} disabled={!!activeAgent} style={{ width: "100%", background: "#000", color: "#fff", padding: "14px", marginTop: "15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            {activeAgent ? "ANALYZING..." : "ANALYZE & GENERATE"}
          </button>
        </div>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>RESUME (PDF)</label>
          <div style={{ marginTop: "10px", padding: "45px", background: T.panel, border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
            <input type="file" onChange={handleFile} accept=".pdf" />
          </div>
        </div>
      </div>
    </div>
  );
}