import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

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
      style={{ perspective: "1000px", cursor: "pointer", height: "180px" }}
    >
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          borderRadius: "14px", padding: "18px",
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          boxShadow: "0 8px 24px rgba(37,99,235,0.25)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#93c5fd", letterSpacing: "1.5px" }}>TERM</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#60a5fa",
              background: "rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2px 9px" }}>
              {String(index + 1).padStart(2, "0")} / 20
            </span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff", lineHeight: "1.6", textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            {card.front}
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", color: "#93c5fd", opacity: 0.8 }}>
            ↺ click to reveal
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          borderRadius: "14px", padding: "18px",
          background: "linear-gradient(135deg, #14532d 0%, #059669 100%)",
          boxShadow: "0 8px 24px rgba(5,150,105,0.25)",
          transform: "rotateY(180deg)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#6ee7b7", letterSpacing: "1.5px" }}>DEFINITION</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399",
              background: "rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2px 9px" }}>
              {String(index + 1).padStart(2, "0")} / 20
            </span>
          </div>
          <div style={{ fontSize: "14px", color: "#ecfdf5", lineHeight: "1.7", textAlign: "center", flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" }}>
            {card.back}
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", color: "#6ee7b7", opacity: 0.8 }}>
            ↺ click to flip back
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashcardDeck = ({ cards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState("grid"); // "grid" | "deck"

  const go = (dir) => {
    setFlipped(false);
    setTimeout(() => setCurrent(i => Math.max(0, Math.min(cards.length - 1, i + dir))), 150);
  };

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["grid", "deck"].map(m => (
          <button key={m} onClick={() => { setMode(m); setFlipped(false); setCurrent(0); }}
            style={{
              padding: "6px 18px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontWeight: "600", fontSize: "12px", letterSpacing: "0.5px",
              background: mode === m ? "#2563eb" : "#e2e8f0",
              color: mode === m ? "#fff" : "#555",
            }}>
            {m === "grid" ? "⊞ Grid View" : "◈ Study Mode"}
          </button>
        ))}
      </div>

      {mode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {cards.map((card, idx) => <Flashcard key={idx} card={card} index={idx} />)}
        </div>
      ) : (
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {/* Progress bar */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
              <span>Card {current + 1} of {cards.length}</span>
              <span>{Math.round(((current + 1) / cards.length) * 100)}% complete</span>
            </div>
            <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "4px" }}>
              <div style={{ height: "100%", borderRadius: "4px", background: "#2563eb",
                width: `${((current + 1) / cards.length) * 100}%`, transition: "width 0.3s ease" }} />
            </div>
          </div>

          {/* Single card flip */}
          <div onClick={() => setFlipped(f => !f)} style={{ perspective: "1000px", cursor: "pointer", height: "220px", marginBottom: "20px" }}>
            <div style={{
              position: "relative", width: "100%", height: "100%",
              transformStyle: "preserve-3d",
              transition: "transform 0.55s cubic-bezier(0.4,0.2,0.2,1)",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}>
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                borderRadius: "16px", padding: "24px",
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
                boxShadow: "0 12px 32px rgba(37,99,235,0.3)",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#93c5fd", letterSpacing: "2px" }}>TERM</span>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", textAlign: "center", lineHeight: "1.5" }}>
                  {cards[current]?.front}
                </div>
                <div style={{ textAlign: "center", fontSize: "12px", color: "#93c5fd" }}>↺ tap to reveal definition</div>
              </div>
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
                borderRadius: "16px", padding: "24px",
                background: "linear-gradient(135deg, #14532d 0%, #059669 100%)",
                boxShadow: "0 12px 32px rgba(5,150,105,0.3)",
                transform: "rotateY(180deg)",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#6ee7b7", letterSpacing: "2px" }}>DEFINITION</span>
                <div style={{ fontSize: "15px", color: "#ecfdf5", textAlign: "center", lineHeight: "1.7" }}>
                  {cards[current]?.back}
                </div>
                <div style={{ textAlign: "center", fontSize: "12px", color: "#6ee7b7" }}>↺ tap to flip back</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button onClick={() => go(-1)} disabled={current === 0}
              style={{ padding: "10px 28px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: current === 0 ? "not-allowed" : "pointer", opacity: current === 0 ? 0.4 : 1, fontWeight: "600" }}>
              ← Prev
            </button>
            <button onClick={() => setFlipped(f => !f)}
              style={{ padding: "10px 28px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
              Flip ↺
            </button>
            <button onClick={() => go(1)} disabled={current === cards.length - 1}
              style={{ padding: "10px 28px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: current === cards.length - 1 ? "not-allowed" : "pointer", opacity: current === cards.length - 1 ? 0.4 : 1, fontWeight: "600" }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Resume() {
  const { token, apiBase } = useAuth();
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
      const url = `${apiBase || 'https://api.wintaibot.com'}/api/ai/prepare-interview?t=${Date.now()}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { method: "POST", headers, body: formData });
      if (!response.ok) {
        const text = await response.text();
        let errMsg = `Server Error ${response.status}`;
        try {
          const errBody = JSON.parse(text);
          errMsg = errBody?.error || errBody?.message || errMsg;
        } catch {
          if (text) errMsg = text.slice(0, 200);
        }
        throw new Error(errMsg);
      }
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
                <FlashcardDeck cards={outputs[a.id]} />
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