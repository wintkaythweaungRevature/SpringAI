import React, { useState } from "react";

// ... (Keep your T and AGENTS constants from the previous message)

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

  // Helper to create a pause for the "Loading" effect
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const runPipeline = async () => {
    if (!jdText || !fileObject) return alert("Please provide JD and upload a PDF!");
    
    setOutputs({});
    setMatchScore(null);

    const formData = new FormData();
    formData.append("file", fileObject);
    formData.append("jd", jdText);

    try {
      // 1. Start Global Loading
      setActiveAgent("extractor"); 

      const url = `https://api.wintaibot.com/api/ai/prepare-interview?t=${Date.now()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { 'Accept': 'application/json' },
        body: formData, 
      });

      if (!response.ok) throw new Error("Server Error");
      const data = await response.json();

      // 2. Sequential Reveal Logic
      // Agent 1: Keyword Match
      setActiveAgent("extractor");
      await delay(1500); // Realistic thinking time
      setMatchScore(data.match_percentage);
      setOutputs(prev => ({ ...prev, extractor: data.analysis }));

      // Agent 2: Gaps & Analysis
      setActiveAgent("analyzer");
      await delay(1500);
      setOutputs(prev => ({ ...prev, analyzer: data.analysis }));

      // Agent 3: 30 Questions
      setActiveAgent("generator");
      await delay(2000);
      setOutputs(prev => ({ ...prev, generator: data.questions }));

      // Agent 6: 20 Flashcards
      setActiveAgent("flashcards");
      await delay(2000);
      setOutputs(prev => ({ ...prev, flashcards: data.flashcards }));

    } catch (err) {
      setOutputs({ extractor: "Error: " + err.message });
    } finally {
      setActiveAgent(null);
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "40px", color: T.text, fontFamily: "sans-serif" }}>
      
      {/* DASHBOARD - Only shows once Agent 1 is "done" */}
      {matchScore !== null && (
        <div style={{ background: T.panel, border: `2px solid ${T.blue}`, padding: "20px", borderRadius: "12px", textAlign: "center", marginBottom: "30px", animation: "slideDown 0.5s ease" }}>
           <h2 style={{ color: T.blue, margin: 0, fontSize: "32px" }}>{matchScore}% Keyword Match</h2>
        </div>
      )}

      {/* MONITOR GRID with Pulsing Loading State */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "30px" }}>
        {AGENTS.map(a => {
          const isWorking = activeAgent === a.id;
          const isDone = !!outputs[a.id];
          return (
            <div key={a.id} style={{ 
              background: T.panel, 
              border: `1px solid ${isWorking ? a.color : isDone ? a.color : T.border}`, 
              padding: "15px", borderRadius: "8px", textAlign: "center", 
              opacity: isWorking || isDone ? 1 : 0.3,
              transform: isWorking ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
              boxShadow: isWorking ? `0 0 15px ${a.color}44` : "none"
            }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", color: a.color }}>{a.label}</div>
              <div style={{ fontSize: "11px", fontWeight: "bold" }}>{a.name}</div>
              {isWorking && (
                <div style={{ marginTop: "8px" }}>
                  <div className="pulse-loader" style={{ height: "3px", background: a.color, borderRadius: "2px" }} />
                  <span style={{ fontSize: "8px", color: a.color }}>PROCESSING...</span>
                </div>
              )}
              {isDone && <div style={{ fontSize: "10px", color: T.green, marginTop: "5px" }}>✔ COMPLETED</div>}
            </div>
          );
        })}
      </div>

      {/* SEQUENTIAL OUTPUTS - Same rendering logic as before */}
      <div style={{ minHeight: "300px", marginBottom: "40px" }}>
        {AGENTS.map(a => (
          outputs[a.id] && (
            <div key={a.id} style={{ 
               background: "#fff", border: `1px solid ${T.border}`, borderLeft: `5px solid ${a.color}`, 
               padding: "25px", marginBottom: "20px", borderRadius: "8px",
               animation: "fadeInUp 0.6s ease-out forwards"
            }}>
              {/* ... (Keep your existing rendering logic for Questions and Flashcards) */}
            </div>
          )
        ))}
      </div>

      {/* CSS for Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pulse-loader {
          width: 100%;
          animation: pulse 1.5s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.3; width: 10%; }
          50% { opacity: 1; width: 100%; }
          100% { opacity: 0.3; width: 10%; }
        }
      `}</style>
      
      {/* ... (Keep Inputs Panel) */}
    </div>
  );
}