import React, { useState } from "react";

// --- 1. GLOBAL CONSTANTS ---
const T = {
  bg: "#ffffff", panel: "#f8fafc", border: "#e2e8f0", text: "#0f172a",
  textDim: "#64748b", amber: "#d97706", green: "#059669", blue: "#2563eb", 
  purple: "#7c3aed", pink: "#db2777", darkBg: "#1a1f26", darkBorder: "#2d3748"
};

const AGENTS = [
  { id: "extractor", label: "Extraction", name: "KEYWORD MATCH", color: T.amber },
  { id: "analyzer", label: "Analyzing", name: "GAPS & ANALYSIS", color: T.green },
  { id: "generator", label: "Generating", name: "30 INTERVIEW QUESTIONS", color: T.blue },
  { id: "flashcards", label: "Flashcards", name: "20 STUDY FLASHCARDS", color: T.pink },
];

const Flashcard = ({ card, index }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div 
      onClick={() => setFlipped(!flipped)}
      style={{
        background: "#d1d6ef", borderRadius: "12px", padding: "20px", marginBottom: "16px",
        cursor: "pointer", border: `1px solid ${T.darkBorder}`, transition: "all 0.2s ease",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", minHeight: "160px", display: "flex", flexDirection: "column"
      }}
    >
      <div style={{ color: "#4a5568", fontWeight: "bold", fontSize: "12px", marginBottom: "10px" }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ color: "#040a74", fontSize: "14px", lineHeight: "1.6", flexGrow: 1 }}>
        {flipped ? card.back : card.front}
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

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const runPipeline = async () => {
    if (!jdText || !fileObject) return alert("Please provide JD and upload a PDF!");
    setOutputs({}); setMatchScore(null);
    const formData = new FormData();
    formData.append("file", fileObject);
    formData.append("jd", jdText);

    try {
      setActiveAgent("extractor"); 
      const url = `https://api.wintaibot.com/prepare-interview?t=${Date.now()}`;
      const response = await fetch(url, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();

      setActiveAgent("extractor"); await delay(1000);
      setMatchScore(data.match_percentage);
      setOutputs(prev => ({ ...prev, extractor: data.analysis }));

      setActiveAgent("analyzer"); await delay(1000);
      setOutputs(prev => ({ ...prev, analyzer: data.analysis }));

      setActiveAgent("generator"); await delay(1200);
      setOutputs(prev => ({ ...prev, generator: data.questions }));

      setActiveAgent("flashcards"); await delay(1200);
      setOutputs(prev => ({ ...prev, flashcards: data.flashcards }));
    } catch (err) {
      setOutputs({ extractor: "Error: " + err.message });
    } finally {
      setActiveAgent(null);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "30px", color: T.text, fontFamily: "sans-serif" }}>
      
      {/* 1. INPUT SECTION (NOW AT THE TOP) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", marginBottom: "30px", background: T.panel, padding: "25px", borderRadius: "12px", border: `1px solid ${T.border}` }}>
        <div>
          <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>TARGET JOB DESCRIPTION</label>
          <textarea 
            placeholder="Paste Job Description here..."
            value={jdText} 
            onChange={e => setJdText(e.target.value)} 
            style={{ width: "100%", height: "120px", marginTop: "10px", padding: "12px", border: `1px solid ${T.border}`, borderRadius: "8px", resize: "none" }} 
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: "bold", color: T.textDim }}>UPLOAD PDF RESUME</label>
            <div style={{ marginTop: "10px", padding: "20px", background: "#fff", border: `2px dashed ${T.border}`, borderRadius: "8px", textAlign: "center" }}>
              <input type="file" onChange={handleFile} accept=".pdf" style={{ fontSize: "12px" }} />
              {fileObject && <div style={{ fontSize: "11px", color: T.green, marginTop: "5px" }}>✓ {fileObject.name} loaded</div>}
            </div>
          </div>
          <button 
            onClick={runPipeline} 
            disabled={!!activeAgent} 
            style={{ 
              width: "100%", background: "#21419e", color: "#ffffff", padding: "16px", 
              marginTop: "15px", border: "none", borderRadius: "8px", cursor: "pointer",
              fontWeight: "bold", letterSpacing: "1px", transition: "0.2s opacity",appearance: "none",
               WebkitAppearance: "none"
            }}>
            {activeAgent ? "AI AGENTS DEPLOYED..." : "Run Full Prep Kit"}
          </button>
        </div>
      </div>

      {/* 2. MATCH SCORE DASHBOARD */}
      {matchScore !== null && (
        <div style={{ background: "#eff6ff", border: `2px solid ${T.blue}`, padding: "15px", borderRadius: "12px", textAlign: "center", marginBottom: "30px" }}>
           <h2 style={{ color: T.blue, margin: 0, fontSize: "28px" }}>{matchScore}% Keyword Match Score</h2>
        </div>
      )}

      {/* 3. AGENT STATUS MONITOR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "30px" }}>
        {AGENTS.map(a => {
          const isWorking = activeAgent === a.id;
          const isDone = !!outputs[a.id];
          return (
            <div key={a.id} style={{ 
              background: T.panel, border: `1px solid ${isWorking || isDone ? a.color : T.border}`, 
              padding: "12px", borderRadius: "8px", textAlign: "center", 
              opacity: isWorking || isDone ? 1 : 0.4, transition: "all 0.3s ease"
            }}>
              <div style={{ fontSize: "9px", fontWeight: "bold", color: a.color }}>{a.label}</div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>{a.name}</div>
              {isWorking && <div style={{ fontSize: "9px", color: a.color, marginTop: "5px", animation: "pulse 1s infinite" }}>PROCESSING...</div>}
              {isDone && <div style={{ fontSize: "9px", color: T.green, marginTop: "5px" }}>READY</div>}
            </div>
          );
        })}
      </div>

      {/* 4. OUTPUTS (REVEALED SEQUENTIALLY) */}
      <div style={{ minHeight: "200px" }}>
        {AGENTS.map(a => (
          outputs[a.id] && (
            <div key={a.id} style={{ 
              background: "#fff", border: `1px solid ${T.border}`, borderLeft: `5px solid ${a.color}`, 
              padding: "20px", marginBottom: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: a.color, marginBottom: "15px", textTransform: "uppercase" }}>{a.name} Result</div>
              
              {a.id === "flashcards" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  {outputs[a.id].map((card, idx) => <Flashcard key={idx} card={card} index={idx} />)}
                </div>
              ) : a.id === "generator" ? (
                outputs[a.id].map((q, idx) => (
                  <div key={idx} style={{ marginBottom: "15px", borderBottom: `1px solid ${T.border}`, paddingBottom: "10px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "5px" }}>{idx + 1}. {q.q}</div>
                    <div style={{ fontSize: "13px", color: T.textDim, fontStyle: "italic" }}>Tip: {q.guidance}</div>
                  </div>
                ))
              ) : (
                <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.6" }}>{outputs[a.id]}</div>
              )}
            </div>
          )
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}