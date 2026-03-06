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
  { id: "extractor", label: "AGENT 01 — ROLE EXTRACTOR", icon: "◈", color: T.amber, desc: "Parsing job description" },
  { id: "analyzer", label: "AGENT 02 — CV ANALYZER", icon: "◉", color: T.green, desc: "Mapping candidate experience" },
  { id: "generator", label: "AGENT 03 — QUESTION GENERATOR", icon: "◆", color: T.blue, desc: "Synthesizing questions" },
  { id: "writer", label: "AGENT 04 — ANSWER WRITER", icon: "◇", color: T.purple, desc: "Drafting responses" },
  { id: "scorer", label: "AGENT 05 — CONFIDENCE SCORER", icon: "◎", color: T.amber, desc: "Scoring readiness" },
  { id: "flashcards", label: "AGENT 06 — FLASHCARD GEN", icon: "✦", color: T.pink, desc: "Creating study cards" },
];

function Flashcard({ question, answer }) {
  const [show, setShow] = useState(false);
  return (
    <div 
      onClick={() => setShow(!show)}
      style={{
        background: show ? T.pink + "08" : "#fff",
        border: `1px solid ${show ? T.pink : T.border}`,
        padding: "15px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <div style={{ fontSize: "9px", color: T.pink, fontWeight: "bold", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" }}>
        {show ? "• Answer" : "• Question"}
      </div>
      <div style={{ fontSize: "13px", color: T.text, fontWeight: "500", lineHeight: "1.5" }}>
        {show ? answer : question}
      </div>
    </div>
  );
}

function AgentRow({ agent, status }) {
  const isActive = status === "running";
  const isDone = status === "done";
  
  return (
    <div style={{
      border: `1px solid ${isActive ? agent.color : T.border}`,
      background: isActive ? `${agent.color}08` : T.panel,
      padding: "12px",
      marginBottom: "10px",
      borderRadius: "6px",
      transition: "all 0.3s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: agent.color, fontSize: "16px" }}>{agent.icon}</span> 
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: T.text }}>{agent.label}</div>
          <div style={{ fontSize: "10px", color: T.textDim }}>
            {isActive ? "RUNNING..." : isDone ? "✓ COMPLETE" : agent.desc}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Resume() {
  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setCvText(result.value);
      } else {
        const reader = new FileReader();
        reader.onload = (f) => setCvText(f.target.result);
        reader.readAsText(file);
      }
    } catch (err) { alert("Error reading file."); }
  };

  const downloadPDF = async () => {
    if (flashcards.length === 0) return;
    setIsDownloading(true);
    try {
      const response = await fetch("https://api.wintaibot.com/api/ai/flashcards-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flashcards)
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Interview_Flashcards.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      alert("PDF export failed. Please check backend.");
    } finally {
      setIsDownloading(false);
    }
  };

  const startPipeline = async () => {
    if (!jdText || !cvText) return alert("Missing JD or CV.");
    
    setAgentStatuses({});
    setShowFlashcards(false);
    setFlashcards([]);

    for (const agent of AGENTS) {
      setActiveAgent(agent.id);
      setAgentStatuses(prev => ({ ...prev, [agent.id]: "running" }));

      if (agent.id === "flashcards") {
        try {
          const response = await fetch("https://api.wintaibot.com/api/ai/generate-flashcards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jd: jdText, cv: cvText })
          });
          const data = await response.json();
          setFlashcards(data);
        } catch (error) {
          console.error("Flashcard generation failed", error);
        }
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      setAgentStatuses(prev => ({ ...prev, [agent.id]: "done" }));
    }

    setActiveAgent(null);
    setShowFlashcards(true);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "30px", boxSizing: "border-box", fontFamily: 'Inter, sans-serif' }}>
      
      <header style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginBottom: "30px", borderBottom: `1px solid ${T.border}`, paddingBottom: "15px" 
      }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: T.text, letterSpacing: "1px" }}>ARCHITECT_OS // V1</div>
        <button 
          onClick={startPipeline} 
          disabled={!!activeAgent}
          style={{
            background: "#0f172a", color: "#fff", border: "none", padding: "10px 20px",
            cursor: activeAgent ? "not-allowed" : "pointer", fontWeight: "bold", borderRadius: "4px", fontSize: "12px",
            opacity: activeAgent ? 0.7 : 1
          }}
        >
          {activeAgent ? "PIPELINE_ACTIVE..." : "INITIALIZE PIPELINE"}
        </button>
      </header>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        
        {/* LEFT MONITOR */}
        <div style={{ flex: "0 0 320px" }}>
          <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "15px", fontWeight: "bold", letterSpacing: "1px" }}>
            [ SYSTEM_MONITOR ]
          </label>
          {AGENTS.map(agent => (
            <AgentRow key={agent.id} agent={agent} status={agentStatuses[agent.id] || "idle"} />
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "20px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "10px", fontWeight: "bold" }}>INPUT_SOURCE: JOB_DESCRIPTION</label>
            <textarea 
              value={jdText} 
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description here..."
              style={{ 
                width: "100%", height: "120px", background: "#fff", border: `1px solid ${T.border}`,
                padding: "12px", fontFamily: T.mono, fontSize: "12px", borderRadius: "4px",
                boxSizing: "border-box", resize: "none"
              }}
            />
          </div>

          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "20px", borderRadius: "8px" }}>
            <label style={{ color: T.textDim, fontSize: "10px", display: "block", marginBottom: "10px", fontWeight: "bold" }}>INPUT_SOURCE: CV_STREAM</label>
            <input type="file" onChange={handleFileUpload} style={{ fontSize: "12px", marginBottom: "15px" }} />
            <div style={{ 
              height: "150px", overflowY: "auto", fontSize: "11px", color: T.text, 
              background: "#fff", padding: "15px", border: `1px solid ${T.border}`, 
              borderRadius: "4px", boxSizing: "border-box", whiteSpace: "pre-wrap"
            }}>
              {cvText || "Awaiting file upload..."}
            </div>
          </div>

          {/* FLASHCARDS SECTION */}
          {showFlashcards && flashcards.length > 0 && (
            <div style={{ background: "#fff", border: `2px solid ${T.pink}`, padding: "20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(219, 39, 119, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <label style={{ color: T.pink, fontSize: "11px", fontWeight: "bold", letterSpacing: "1px" }}>✦ AGENT_GEN_06: INTERVIEW_FLASHCARDS</label>
                <button 
                  onClick={downloadPDF}
                  disabled={isDownloading}
                  style={{
                    background: T.pink, color: "#fff", border: "none", padding: "6px 14px",
                    borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer"
                  }}
                >
                  {isDownloading ? "GENERATING PDF..." : "DOWNLOAD PDF"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {flashcards.map((card, i) => (
                  <Flashcard key={i} question={card.q} answer={card.a} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}