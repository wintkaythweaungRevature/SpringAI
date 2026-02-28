import React, { useState, useMemo } from "react";
import "./Analyzer.css"; // Ensure this file exists in the same folder

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
        headers: { 'Accept': 'application/json' },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Error"}`);
      }

      const data = await response.json();
      setRecipe(JSON.stringify(data));
    } catch (error) {
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const parsedData = useMemo(() => {
    if (!recipe || recipe.startsWith("Analysis failed")) return null;
    try {
      return JSON.parse(recipe);
    } catch (e) {
      return null;
    }
  }, [recipe]);

  const downloadCSV = () => {
    if (!parsedData || !parsedData.table_headers) return;
    const csvContent = [
      parsedData.table_headers.join(","), 
      ...(parsedData.table_rows || []).map(row => row.map(cell => `"${cell}"`).join(",")) 
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analyzer-card">
      <div className="analyzer-header-container">
        <span style={{ fontSize: '32px' }}>🧙‍♂️</span>
        <h2 className="analyzer-main-title">Smart Parser DocuWizard</h2>
      </div>
      <p className="analyzer-sub-title">Bulk AI Extraction & Interactive Analytics</p>
      
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".pdf" 
        className="analyzer-input"
      />
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={handleProcess} disabled={loading} className="analyzer-button">
          {loading ? "⌛ Analyzing..." : "Analyze PDF"}
        </button>
        
        {parsedData && (
          <button onClick={downloadCSV} className="analyzer-export-button">
            📊 Export to Excel
          </button>
        )}

        {recipe && (
          <button onClick={() => { setRecipe(""); setFile(null); }} className="analyzer-clear-button">Clear</button>
        )}
      </div>

      {parsedData ? (
        <div className="analyzer-dashboard">
          <div className="analyzer-summary-card">
            <h4 className="analyzer-card-header">📄 AI Document Summary</h4>
            <p className="analyzer-summary-text">{parsedData.summary || "No summary available."}</p>
          </div>

          <div className="analyzer-table-section">
            <h4>📊 Extracted Details</h4>
            <div className="analyzer-table-wrapper">
              <table className="analyzer-table">
                <thead>
                  <tr>
                    {parsedData.table_headers?.map((header, i) => (
                      <th key={i} className="analyzer-th">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.table_rows?.map((row, i) => (
                    <tr key={i} className={i % 2 !== 0 ? "analyzer-alt-row" : ""}>
                      {row.map((cell, j) => (
                        <td key={j} className="analyzer-td">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {parsedData.insights && (
            <div className="analyzer-insights-card">
              <h4 className="analyzer-card-header">💡 Key Insights</h4>
              <ul className="analyzer-list">
                {parsedData.insights.map((insight, i) => (
                  <li key={i} className="analyzer-list-item">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        recipe && (
          <div className="analyzer-error-area">
            <pre className="analyzer-pre">{recipe}</pre>
          </div>
        )
      )}
    </div>
  );
}

export default PdfAnalyzer;