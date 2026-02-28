import React, { useState } from "react";

function PdfAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState("");

  const handleProcess = async () => {
    if (!file) return alert("Please upload a PDF!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Analyze this document and extract all important information.");

    setLoading(true);
    setRecipe(""); 

    try {
      const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server error");
      }

      const data = await response.json();
      setRecipe(JSON.stringify(data));
    } catch (error) {
      console.error("Upload error:", error);
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely parse JSON for the dashboard
  const parsedData = recipe && !recipe.startsWith("Analysis failed") ? JSON.parse(recipe) : null;

  return (
    <div style={styles.card}>
      <h3>📂 PDF Spending Analyzer</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".pdf" 
        style={styles.input}
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleProcess} disabled={loading} style={styles.button}>
          {loading ? "Analyzing..." : "Analyze PDF"}
        </button>
        {recipe && (
          <button onClick={() => setRecipe("")} style={styles.clearButton}>Clear</button>
        )}
      </div>

      {/* Dashboard View */}
      {parsedData && (
        <div style={styles.dashboardContainer}>
          <div style={styles.summaryCard}>
            <h4 style={styles.cardHeader}>📄 AI Document Summary</h4>
            <p style={styles.summaryText}>{parsedData.summary}</p>
          </div>

          <div style={styles.tableSection}>
            <h4>📊 Extracted Details</h4>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {parsedData.table_headers?.map((header, i) => (
                      <th key={i} style={styles.th}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.table_rows?.map((row, i) => (
                    <tr key={i} style={i % 2 === 0 ? {} : styles.altRow}>
                      {row.map((cell, j) => (
                        <td key={j} style={styles.td}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {parsedData.insights && (
            <div style={styles.insightsCard}>
              <h4 style={styles.cardHeader}>💡 Key Insights</h4>
              <ul style={styles.list}>
                {parsedData.insights.map((insight, i) => (
                  <li key={i} style={styles.listItem}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error View */}
      {!parsedData && recipe && (
        <div style={styles.outputArea}>
          <pre style={styles.recipeText}>{recipe}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' },
  input: { padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' },
  button: { padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  clearButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  dashboardContainer: { marginTop: '30px', textAlign: 'left' },
  summaryCard: { padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '10px', marginBottom: '20px', borderLeft: '6px solid #28a745' },
  insightsCard: { padding: '20px', backgroundColor: '#fffbe6', borderRadius: '10px', marginBottom: '20px', borderLeft: '6px solid #fadb14' },
  cardHeader: { marginTop: 0, color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  summaryText: { fontSize: '15px', lineHeight: '1.6', color: '#555' },
  tableSection: { marginBottom: '30px' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' },
  th: { backgroundColor: '#28a745', color: '#fff', padding: '12px', textAlign: 'left', fontSize: '14px' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#444' },
  altRow: { backgroundColor: '#f9f9f9' },
  list: { paddingLeft: '20px', margin: 0 },
  listItem: { marginBottom: '8px', fontSize: '14px', color: '#444' },
  outputArea: { marginTop: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '4px', border: '1px solid #feb2b2', color: '#c53030' },
  recipeText: { whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '12px' }
};

export default PdfAnalyzer;