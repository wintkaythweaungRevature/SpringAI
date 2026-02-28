import React, { useState } from "react";

function SmartParserDocuWizard() {
  const [files, setFiles] = useState([]); // Changed to array for Bulk
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // Store multiple results
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const handleProcess = async () => {
    if (files.length === 0) return alert("Please upload at least one PDF!");
    setLoading(true);
    setResults([]);

    try {
      // Process each file (Bulk Logic)
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prompt", "Analyze this document into JSON: summary, table_headers, table_rows, insights");

        const response = await fetch(`https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setResults(prev => [...prev, { fileName: file.name, ...data }]);
        }
      }
    } catch (error) {
      alert("Wizard Error: " + error.message);
    } finally {
      setLoading(false);
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
  };const askWizard = async (docText) => {
  if (!chatQuery) return;
  setLoading(true);

  try {
    const response = await fetch("https://api.wintaibot.com/api/ai/chat-with-doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentText: docText, // Send the text we already have
        question: chatQuery
      }),
    });

    const data = await response.json();
    setChatResponse(data.answer);
  } catch (error) {
    setChatResponse("The Wizard is tired. Try again later.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={styles.card}>
      <div style={styles.headerContainer}>
        <span style={{ fontSize: '32px' }}>🧙‍♂️</span>
        <h2 style={styles.mainTitle}>Smart Parser DocuWizard</h2>
      </div>
      <p style={styles.subTitle}>Bulk AI Extraction & Interactive Analytics</p>

      {/* 1. Bulk Upload Input */}
      <div style={styles.uploadSection}>
        <input 
          type="file" 
          multiple 
          onChange={(e) => setFiles(Array.from(e.target.files))} 
          accept=".pdf" 
          style={styles.input}
        />
        <p style={{fontSize: '12px', color: '#666'}}>{files.length} files selected</p>
      </div>
      {/* Add this inside your results.map loop */}
<div style={styles.chartBarContainer}>
  <div style={{
    ...styles.chartBar,
    width: `${Math.min(res.table_rows.length * 10, 100)}%` 
  }}></div>
  <span style={{fontSize: '12px'}}>Activity Level: {res.table_rows.length} items found</span>
</div>
      
      <button onClick={handleProcess} disabled={loading} style={styles.button}>
        {loading ? "Wizard is working..." : `Analyze ${files.length} PDF(s)`}
      </button>

      {results.map((res, idx) => (
        <div key={idx} style={styles.dashboardContainer}>
          <div style={styles.summaryCard}>
            <h4>📄 {res.fileName} Summary</h4>
            <p>{res.summary}</p>
          </div>

          {/* 2. Interactive Table (Editable) */}
          <div style={styles.tableSection}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <h4>📊 Data (Click cells to edit)</h4>
              <button onClick={() => downloadCSV(res)} style={styles.exportButton}>Export to Excel</button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>{res.table_headers.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {res.table_rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} contentEditable style={styles.td}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {/* 3. Chat with Document Section */}
      {results.length > 0 && (
        <div style={styles.chatBox}>
          <h4>💬 Ask the Wizard about these files</h4>
          <input 
            placeholder="e.g. Total spending on all files?" 
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            style={styles.chatInput}
          />
          <button style={styles.smallButton}>Ask Wizard</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: '30px', maxWidth: '900px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Segoe UI, sans-serif' },
  headerContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' },
  mainTitle: { margin: 0, color: '#1a202c', fontSize: '28px', fontWeight: '800' },
  subTitle: { margin: '5px 0 25px 0', fontSize: '14px', color: '#4a5568', textAlign: 'center' },
  uploadSection: { padding: '20px', border: '2px dashed #cbd5e0', borderRadius: '10px', textAlign: 'center', backgroundColor: '#f7fafc', marginBottom: '15px' },
  button: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  dashboardContainer: { marginTop: '40px', borderTop: '2px solid #edf2f7', paddingTop: '20px' },
  summaryCard: { padding: '15px', backgroundColor: '#ebf8ff', borderRadius: '8px', borderLeft: '5px solid #3182ce', marginBottom: '20px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8fafc', padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px', borderBottom: '1px solid #edf2f7', outline: 'none' },
  exportButton: { padding: '5px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  chatBox: { marginTop: '40px', padding: '20px', backgroundColor: '#fffbe6', borderRadius: '10px', border: '1px solid #ffe58f' },
  chatInput: { width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #d9d9d9', marginRight: '10px' },
  smallButton: { padding: '10px 15px', backgroundColor: '#fadb14', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default SmartParserDocuWizard;