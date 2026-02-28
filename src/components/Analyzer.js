import React, { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";

// Worker for PDF.js - use local copy from public/ to avoid CDN fetch errors
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

const ASK_AI_URL = "https://api.wintaibot.com/api/ai/ask-ai";
const MAX_TEXT_LENGTH = 5000; // URL limit for ask-ai GET request

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

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
      // 1. Extract text from PDF (client-side)
      const fullText = await extractTextFromPdf(pdfFile);
      if (!fullText.trim()) throw new Error("No text found in PDF.");

      const truncated = fullText.length > MAX_TEXT_LENGTH
        ? fullText.slice(0, MAX_TEXT_LENGTH) + "\n\n[... truncated ...]"
        : fullText;

      // 2. Call ask-ai with extracted text (works without analyze-pdf endpoint)
      const userPrompt = prompt || "Analyze this document and extract all important information.";
      const aiPrompt = `${userPrompt}\n\nDocument content:\n${truncated}`;

      const response = await fetch(
        `${ASK_AI_URL}?prompt=${encodeURIComponent(aiPrompt)}`,
        { method: "GET", headers: { Accept: "text/plain" } }
      );

      const aiResponse = await response.text();
      if (!response.ok) throw new Error(`Server error (${response.status}): ${aiResponse.slice(0, 80)}`);

      // 3. Parse response: ask-ai returns plain text. Try to extract insights (bullet points)
      const lines = aiResponse.split("\n").map((s) => s.trim()).filter(Boolean);
      const bulletInsights = lines.filter((l) => /^[-*•]\s/.test(l) || /^\d+\.\s/.test(l));
      const mainText = bulletInsights.length > 0
        ? lines.filter((l) => !/^[-*•]\s/.test(l) && !/^\d+\.\s/.test(l)).join("\n\n")
        : aiResponse;

      setSummary(mainText || aiResponse);
      setInsights(bulletInsights.length > 0 ? bulletInsights : []);
      setTableHeaders([]);
      setTableRows([]);
    } catch (error) {
      console.error("Error analyzing PDF: ", error);
      const msg = error.message || String(error);
      setSummary(`Analysis failed: ${msg}. Please check your connection and try again.`);
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