import React, { useState } from "react";

function SmartParserDocuWizard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
const handleProcess = async () => {
    if (files.length === 0) return alert("Please upload at least one PDF!");
    setLoading(true);
    setResults([]);

    try {
      // ✅ FIX: Loop through each file
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`, {
          method: "POST",
          body: formData,
        });

        // ✅ FIX: Catch 502/404 errors before they break JSON
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.analysis) {
          try {
            // ✅ FIX: Remove markdown backticks
            const cleanJson = data.analysis.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            
            setResults(prev => [...prev, {
              fileName: file.name,
              summary: parsed.summary || "Summary extracted.",
              table_headers: parsed.table_headers || ["Data"],
              table_rows: parsed.table_rows || [["No rows found"]],
              insights: parsed.insights || []
            }]);
          } catch (e) {
            // ✅ FIX: Fallback if AI sends text instead of JSON
            setResults(prev => [...prev, {
              fileName: file.name,
              summary: "Raw Text Result",
              table_headers: ["Content"],
              table_rows: [[data.analysis]],
              insights: []
            }]);
          }
        }
      }
    } catch (error) {
      alert(`Wizard Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const askWizard = async () => {
    if (!chatQuery || results.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("https://api.wintaibot.com/api/ai/chatdoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: results.map(r => r.summary).join("\n"), 
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

  const downloadCSV = (data) => {
    if (!data.table_headers || !data.table_rows) return;
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
      <p style={styles.subTitle}>Bulk AI Extraction & Interactive Analytics</p>

      <div style={styles.uploadSection}>
        <input 
          type="file" 
          multiple 
          onChange={(e) => setFiles(Array.from(e.target.files))} 
          accept=".pdf" 
          style={styles.input}
        />
        <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>{files.length} files selected</p>
      </div>
      
      <button onClick={handleProcess} disabled={loading} style={styles.button}>
        {loading ? "Magic in progress..." : `Analyze ${files.length} PDF(s)`}
      </button>

      {results.map((res, idx) => (
        <div key={idx} style={styles.dashboardContainer}>
          <div style={styles.summaryCard}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <h4 style={{margin: 0}}>📄 {res.fileName}</h4>
               <button onClick={() => downloadCSV(res)} style={styles.exportButton}>Export CSV</button>
            </div>
            <p style={{fontSize: '14px', marginTop: '10px'}}>{res.summary}</p>
          </div>

          <div style={styles.tableSection}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>{res.table_headers?.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {res.table_rows?.map((row, i) => (
                    <tr key={i}>
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

      {results.length > 0 && (
        <div style={styles.chatBox}>
          <h4 style={{marginTop: 0}}>💬 Ask the Wizard</h4>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              placeholder="e.g. Total spending?" 
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              style={styles.chatInput}
            />
            <button onClick={askWizard} style={styles.smallButton}>Ask</button>
          </div>
          {chatResponse && (
            <div style={{marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '5px', border: '1px solid #ffe58f', textAlign: 'left'}}>
              <strong>Wizard:</strong> {chatResponse}
            </div>
          )}
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
  uploadSection: { padding: '30px', border: '2px dashed #cbd5e0', borderRadius: '10px', textAlign: 'center', backgroundColor: '#f7fafc', marginBottom: '15px' },
  button: { width: '100%', padding: '15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  dashboardContainer: { marginTop: '40px', borderTop: '2px solid #edf2f7', paddingTop: '20px' },
  summaryCard: { padding: '15px', backgroundColor: '#ebf8ff', borderRadius: '8px', borderLeft: '5px solid #3182ce', marginBottom: '20px', textAlign: 'left' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#f8fafc', padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontSize: '13px' },
  td: { padding: '12px', borderBottom: '1px solid #edf2f7', outline: 'none', fontSize: '13px', textAlign: 'left' },
  exportButton: { padding: '5px 12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  chatBox: { marginTop: '40px', padding: '20px', backgroundColor: '#fffbe6', borderRadius: '10px', border: '1px solid #ffe58f', textAlign: 'left' },
  chatInput: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #d9d9d9' },
  smallButton: { padding: '10px 20px', backgroundColor: '#fadb14', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default SmartParserDocuWizard;