import React, { useState } from "react";
import * as XLSX from "xlsx";

function PdfAnalyzer() {
  const [pdfFile, setPdfFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setSummary('');
    setTableHeaders([]);
    setTableRows([]);
    setInsights([]);
  };

  const analyzePdf = async () => {
    if (!pdfFile) return alert("Please upload a PDF file first!");

    setLoading(true);
    setSummary('');
    setTableHeaders([]);
    setTableRows([]);
    setInsights([]);

    try {
      // ✅ Send as multipart/form-data — same as your existing convert-pdf-to-excel
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('prompt', prompt || 'Analyze this document and extract all important information.');

      const response = await fetch('https://api.wintaibot.com/api/ai/analyze-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Server error");

      const text = await response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      setSummary(parsed.summary || '');
      setTableHeaders(parsed.table_headers || []);
      setTableRows(parsed.table_rows || []);
      setInsights(parsed.insights || []);
    } catch (error) {
      console.error("Error analyzing PDF: ", error);
      setSummary("This page is currently under maintenance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['PDF Analysis Report'], [''],
      ['Summary'], [summary], [''],
      ['Key Insights'],
      ...insights.map(i => [i])
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    if (tableHeaders.length && tableRows.length) {
      const ws2 = XLSX.utils.aoa_to_sheet([tableHeaders, ...tableRows]);
      ws2['!cols'] = tableHeaders.map((h, i) => ({
        wch: Math.max(h.length, ...tableRows.map(r => (r[i] || '').toString().length), 12)
      }));
      XLSX.utils.book_append_sheet(wb, ws2, 'Extracted Data');
    }

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `wintaibot-analysis-${date}.xlsx`);
  };

  const hasResults = summary || tableHeaders.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📄 AI PDF Analyzer</h2>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload PDF File</label>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={styles.fileInput} />
          {pdfFile && <p style={styles.fileName}>✅ {pdfFile.name}</p>}

          <label style={styles.label}>What to focus on? (Optional)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Extract all invoice items, summarize financial data"
            style={styles.input}
          />
        </div>

        <button
          onClick={analyzePdf}
          disabled={loading || !pdfFile}
          style={{ ...styles.button, backgroundColor: loading || !pdfFile ? '#6c757d' : '#007bff' }}
        >
          {loading ? "Analyzing PDF..." : "Analyze PDF"}
        </button>

        {hasResults && (
          <div style={styles.outputArea}>
            {summary && (
              <>
                <h3 style={styles.resultTitle}>📋 Summary:</h3>
                <p style={styles.summaryText}>{summary}</p>
              </>
            )}
            {insights.length > 0 && (
              <>
                <h3 style={styles.resultTitle}>🔍 Key Insights:</h3>
                <ul style={styles.insightList}>
                  {insights.map((insight, i) => <li key={i} style={styles.insightItem}>{insight}</li>)}
                </ul>
              </>
            )}
            {tableHeaders.length > 0 && tableRows.length > 0 && (
              <>
                <h3 style={styles.resultTitle}>📊 Extracted Data:</h3>
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>{tableHeaders.map((h, i) => <th key={i} style={styles.th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, i) => (
                        <tr key={i}>
                          {tableHeaders.map((_, j) => <td key={j} style={styles.td}>{row[j] || ''}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <button onClick={exportExcel} style={styles.exportButton}>⬇ Export as Excel</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '700px', width: '100%' },
  title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#555' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' },
  fileInput: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: '#f8f9fa' },
  fileName: { fontSize: '13px', color: '#28a745', margin: '0' },
  button: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  outputArea: { marginTop: '25px', padding: '15px', backgroundColor: '#fff9e6', borderRadius: '8px', borderLeft: '4px solid #ffc107' },
  resultTitle: { marginTop: '15px', marginBottom: '8px', fontSize: '16px', color: '#856404' },
  summaryText: { whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333', fontSize: '14px' },
  insightList: { paddingLeft: '20px', color: '#333' },
  insightItem: { marginBottom: '6px', fontSize: '14px', lineHeight: '1.5' },
  tableWrap: { overflowX: 'auto', marginTop: '10px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '10px 12px', backgroundColor: '#007bff', color: '#fff', textAlign: 'left', whiteSpace: 'nowrap' },
  td: { padding: '9px 12px', borderBottom: '1px solid #ddd', color: '#333', verticalAlign: 'top' },
  exportButton: { marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default PdfAnalyzer;