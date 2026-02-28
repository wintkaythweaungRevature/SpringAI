import React, { useState } from "react";

function Anayzer() {
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
        formData.append("prompt", "Analyze document into JSON: summary, table_headers, table_rows, insights");

        const response = await fetch(`https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          // We assume your Java backend returns { analysis: "JSON_STRING", rawText: "FULL_TEXT" }
          const parsedAnalysis = JSON.parse(data.analysis);
          
          setResults(prev => [...prev, { fileName: file.name, ...parsedAnalysis }]);
          combinedText += `\n--- File: ${file.name} ---\n${data.rawText}`;
        }
      }
      setRawDocText(combinedText);
    } catch (error) {
      alert("Wizard Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const askWizard = async () => {
    if (!chatQuery || !rawDocText) return;
    setIsChatting(true);
    setChatResponse("");

    try {
      const response = await fetch("https://api.wintaibot.com/api/ai/chatdoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: rawDocText, 
          question: chatQuery
        }),
      });

      const data = await response.json();
      setChatResponse(data.answer);
    } catch (error) {
      setChatResponse("The Wizard is silent. Check your connection.");
    } finally {
      setIsChatting(false);
    }
  };

  const downloadCSV = (data) => {
    const csvContent = [
      data.table_headers.join(","),
      ...data.table_rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.fileName}_Export.csv`;
    a.click();
  };

  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <span style={{ fontSize: '32px' }}>🧙‍♂️</span>
        <h2 style={styles.mainTitle}>Smart Parser DocuWizard</h2>
      </div>
      <p style={styles.subTitle}>AI-Powered Bulk Extraction & Interaction</p>

      {/* Upload Section */}
      <div style={styles.uploadSection}>
        <input 
          type="file" 
          multiple 
          onChange={(e) => setFiles(Array.from(e.target.files))} 
          accept=".pdf" 
          style={styles.input}
        />
        <p style={{fontSize: '12px', color: '#666'}}>{files.length} files ready for magic</p>
      </div>
      
      <button onClick={handleProcess} disabled={loading} style={styles.button}>
        {loading ? "Processing Grimoires..." : `Analyze ${files.length} PDF(s)`}
      </button>

      {/* DASHBOARD RESULTS */}
      {results.map((res, idx) => (
        <div key={idx} style={styles.dashboardContainer}>
          <div style={styles.summaryCard}>
            <h4 style={styles.cardHeader}>📄 {res.fileName} Summary</h4>
            <p style={styles.summaryText}>{res.summary}</p>
          </div>

          <div style={styles.tableSection}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h4 style={{margin: 0}}>📊 Extracted Data</h4>
              <button onClick={() => downloadCSV(res)} style={styles.exportButton}>Export to Excel</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {res.table_headers.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {res.table_rows.map((row, i) => (
                    <tr key={i} style={i % 2 === 0 ? {} : styles.altRow}>
                      {row.map((cell, j) => (
                        <td key={j} contentEditable suppressContentEditableWarning style={styles.td}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* CHAT WITH WIZARD BOX */}
      {results.length > 0 && (
        <div style={styles.chatBox}>
          <h4 style={styles.cardHeader}>💬 Ask the Wizard</h4>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              placeholder="e.g. Which file has the highest total?" 
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              style={styles.chatInput}
            />
            <button onClick={askWizard} disabled={isChatting} style={styles.smallButton}>
              {isChatting ? "Thinking..." : "Ask Wizard"}
            </button>
          </div>
          {chatResponse && (
            <div style={styles.responseArea}>
              <strong>Wizard:</strong> {chatResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' },
  headerContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '5px' },
  mainTitle: { margin: 0, color: '#1a202c', fontSize: '24px', fontWeight: '800' },
  subTitle: { margin: '0 0 20px 0', fontSize: '14px', color: '#4a5568', textAlign: 'center' },
  uploadSection: { padding: '15px', border: '2px dashed #cbd5e0', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f7fafc', marginBottom: '15px' },
  input: { padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' },
  button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  dashboardContainer: { marginTop: '30px', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '20px' },
  summaryCard: { padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '10px', marginBottom: '20px', borderLeft: '6px solid #28a745' },
  cardHeader: { marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  summaryText: { fontSize: '15px', lineHeight: '1.6', color: '#555' },
  tableSection: { marginBottom: '30px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  th: { backgroundColor: '#28a745', color: '#fff', padding: '12px', textAlign: 'left', fontSize: '14px' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#444', outline: 'none' },
  altRow: { backgroundColor: '#f9f9f9' },
  exportButton: { padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  chatBox: { marginTop: '40px', padding: '20px', backgroundColor: '#fffbe6', borderRadius: '10px', border: '1px solid #ffe58f' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' },
  smallButton: { padding: '10px 20px', backgroundColor: '#fadb14', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  responseArea: { marginTop: '15px', padding: '15px', backgroundColor: '#fff', borderRadius: '4px', borderLeft: '4px solid #fadb14', fontSize: '14px' }
};

export default Anayzer;
