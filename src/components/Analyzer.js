import React, { useState } from "react";

// Wizard Styles defined internally to prevent build errors
const styles = {
  app: { textAlign: 'center', maxWidth: '1000px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1, color: '#000' },
  header: { background: 'linear-gradient(135deg,#401187,#717cb3,#0c0e60)', padding: '40px 20px', borderRadius: '22px', marginBottom: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.25)' },
  title: { margin: 0, fontSize: '2.8rem', fontWeight: '800', background: 'linear-gradient(90deg,#d3e3e3,#7cffcb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  contentArea: { background: 'rgba(0,0,0,0.05)', borderRadius: '22px', padding: '25px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' },
  summaryCard: { background: '#ffffff', padding: '20px', borderRadius: '15px', borderLeft: '8px solid #401187', textAlign: 'left', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  tableContainer: { overflowX: 'auto', borderRadius: '12px', background: 'white', border: '1px solid #ddd' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#401187', color: '#ffffff', padding: '15px', textAlign: 'left' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', color: '#000' },
  chatSection: { marginTop: '40px', padding: '30px', background: '#fffbe6', borderRadius: '20px', border: '2px solid #fadb14' },
  chatInputGroup: { display: 'flex', gap: '10px', marginTop: '15px' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ccc' },
  wizardBtn: { padding: '12px 26px', borderRadius: '999px', border: 'none', background: '#28a745', color: '#fff', fontWeight: '700', cursor: 'pointer' },
  responseArea: { marginTop: '20px', textAlign: 'left', background: 'white', padding: '15px', borderRadius: '10px' }
};

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
          if (data.analysis) {
             let cleanJson = data.analysis.replace(/```json|```/g, "").trim();
             const parsedAnalysis = JSON.parse(cleanJson);
             setResults(prev => [...prev, { fileName: file.name, ...parsedAnalysis }]);
             combinedText += `\n--- File: ${file.name} ---\n${data.rawText || ""}`;
          }
        }
      }
      setRawDocText(combinedText);
    } catch (error) {
      alert("Wizard Error: Check your connection or the file format.");
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
      setChatResponse("The Wizard is momentarily unavailable.");
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <span style={{ fontSize: '45px' }}>🧙‍♂️</span>
        <h1 style={styles.title}>Smart Parser DocuWizard</h1>
      </header>

      <div style={styles.contentArea}>
        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} accept=".pdf" />
        <button onClick={handleProcess} disabled={loading} style={{...styles.wizardBtn, width: '100%', marginTop: '15px'}}>
          {loading ? "Magic in progress..." : `Analyze ${files.length} PDF(s)`}
        </button>
      </div>

      {results.map((res, idx) => (
        <div key={idx} style={{marginTop: '40px'}}>
          <div style={styles.summaryCard}>
            <h4>📄 {res.fileName}</h4>
            <p>{res.summary}</p>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>{res.table_headers.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {res.table_rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={styles.td} contentEditable suppressContentEditableWarning>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {results.length > 0 && (
        <div style={styles.chatSection}>
          <h3 style={{marginTop: 0}}>💬 Ask the Wizard</h3>
          <div style={styles.chatInputGroup}>
            <input 
              style={styles.chatInput} 
              value={chatQuery} 
              onChange={(e) => setChatQuery(e.target.value)} 
              placeholder="Ask anything about the PDFs..." 
            />
            <button onClick={askWizard} style={{...styles.wizardBtn, backgroundColor: '#401187'}}>{isChatting ? "..." : "Ask"}</button>
          </div>
          {chatResponse && <div style={styles.responseArea}><strong>Wizard:</strong> {chatResponse}</div>}
        </div>
      )}
    </div>
  );
}

export default PdfAnalyzer;