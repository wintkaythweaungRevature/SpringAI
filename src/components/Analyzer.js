import React, { useState } from "react";
import "./App.css";

function PdfAnalyzer() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); 
  const [rawDocText, setRawDocText] = useState(""); 
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleProcess = async () => {
    if (files.length === 0) return alert("Please upload at least one PDF!");
    setLoading(true);
    setResults([]);
    setRawDocText(""); 

    try {
      let combinedText = "";
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prompt", "Analyze document into JSON: summary, table_headers, table_rows");

        const response = await fetch(`https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // Safe Parsing for AI formatting
          let cleanJson = data.analysis.replace(/```json|```/g, "").trim();
          const parsedAnalysis = JSON.parse(cleanJson);
          
          setResults(prev => [...prev, { fileName: file.name, ...parsedAnalysis }]);
          combinedText += `\n--- File: ${file.name} ---\n${data.rawText || ""}`;
        }
      }
      setRawDocText(combinedText);
    } catch (error) {
      alert("Wizard Error: Data processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const askWizard = async () => {
    if (!chatQuery || !rawDocText) return;
    setIsChatting(true);
    try {
      const response = await fetch("https://api.wintaibot.com/api/ai/chatdoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: rawDocText, question: chatQuery }),
      });
      const data = await response.json();
      setChatResponse(data.answer);
    } catch (error) {
      setChatResponse("The Wizard is currently recharging.");
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="App">
      <header className="wizard-header">
        <span style={{ fontSize: '45px' }}>🧙‍♂️</span>
        <h1 className="wizard-title">Smart Parser DocuWizard</h1>
        <p style={{ color: '#d3e3e3', margin: '10px 0 0 0' }}>AI-Powered Bulk Extraction & Interaction</p>
      </header>

      <div className="content-area">
        <input 
          type="file" 
          multiple 
          onChange={(e) => setFiles(Array.from(e.target.files))} 
          accept=".pdf" 
          style={{marginBottom: '20px'}}
        />
        <button onClick={handleProcess} disabled={loading} className="wizard-btn" style={{width: '100%'}}>
          {loading ? "Wizard is working..." : `Analyze ${files.length} PDF(s)`}
        </button>
      </div>

      {results.map((res, idx) => (
        <div key={idx} style={{marginTop: '40px'}}>
          <div className="summary-card">
            <h4>📄 {res.fileName}</h4>
            <p>{res.summary}</p>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>{res.table_headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {res.table_rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} contentEditable suppressContentEditableWarning>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {results.length > 0 && (
        <div className="chat-section">
          <h3 style={{marginTop: 0}}>💬 Ask the Wizard about these files</h3>
          <div className="chat-input-group">
            <input 
              className="chat-input"
              placeholder="e.g. Which document has the highest cost?" 
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
            />
            <button onClick={askWizard} className="wizard-btn" style={{backgroundColor: '#401187'}}>
              {isChatting ? "..." : "Ask"}
            </button>
          </div>
          {chatResponse && (
            <div className="response-area" style={{marginTop: '20px', textAlign: 'left', background: 'white', padding: '15px', borderRadius: '10px'}}>
              <strong>Wizard:</strong> {chatResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PdfAnalyzer;