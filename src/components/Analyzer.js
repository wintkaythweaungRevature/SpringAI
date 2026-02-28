import React, { useState } from "react";
import * as XLSX from "xlsx"; // ✅ Import Excel library

function SmartParserDocuWizard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleProcess = async () => {
    if (files.length === 0) return alert("Please upload at least one PDF!");
    setLoading(true);
    setResults([]);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        
        if (data.analysis) {
          try {
            const cleanJson = data.analysis.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            
            setResults(prev => [...prev, {
              fileName: file.name,
              summary: parsed.summary || "Summary extracted.",
              table_headers: parsed.table_headers || ["Data"],
              table_rows: parsed.table_rows || [["No rows found"]],
            }]);
          } catch (e) {
            // Fallback if AI sends text instead of JSON
            setResults(prev => [...prev, {
              fileName: file.name,
              summary: "Analysis Complete",
              table_headers: ["Raw Content"],
              table_rows: [[data.analysis]],
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

  // ✅ NEW: Excel Export Function
  const exportToExcel = (res) => {
    const workbook = XLSX.utils.book_new();
    // Combine headers and rows into one array for the sheet
    const worksheetData = [res.table_headers, ...res.table_rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI Analysis");
    XLSX.writeFile(workbook, `${res.fileName}_Export.xlsx`);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.mainTitle}>🧙‍♂️ PDF AI Wizard</h2>
      <p style={styles.subTitle}>Upload PDF ➔ AI Analysis ➔ Export Excel</p>

      <div style={styles.uploadSection}>
        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} accept=".pdf" />
        <p>{files.length} files ready</p>
      </div>
      
      <button onClick={handleProcess} disabled={loading} style={styles.button}>
        {loading ? "Wizard is thinking..." : `Analyze ${files.length} PDF(s)`}
      </button>

      {results.map((res, idx) => (
        <div key={idx} style={styles.resultCard}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <h4 style={{margin: 0}}>📄 {res.fileName}</h4>
            {/* ✅ The Excel Export Button */}
            <button onClick={() => exportToExcel(res)} style={styles.excelButton}>
              Export Excel
            </button>
          </div>
          <p style={styles.summaryText}>{res.summary}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: { padding: '30px', maxWidth: '700px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' },
  mainTitle: { textAlign: 'center', marginBottom: '5px' },
  subTitle: { textAlign: 'center', color: '#666', marginBottom: '20px' },
  uploadSection: { padding: '20px', border: '2px dashed #ccc', borderRadius: '10px', textAlign: 'center', marginBottom: '15px' },
  button: { width: '100%', padding: '12px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  resultCard: { marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #6366f1' },
  summaryText: { fontSize: '14px', color: '#334155', lineHeight: '1.5' },
  excelButton: { padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
};

export default SmartParserDocuWizard;