import React, { useState, useMemo } from "react";

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
      // Use a cache-busting timestamp
      const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': 'application/json', // Explicitly ask for JSON
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error (${response.status}): ${errorText || "Internal Server Error"}`);
      }

      const data = await response.json();
      // Ensure we store a string for the state logic
      setRecipe(JSON.stringify(data));
      
    } catch (error) {
      console.error("Upload error details:", error);
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Safe parsing logic to prevent crashes
  const parsedData = useMemo(() => {
    if (!recipe || recipe.startsWith("Analysis failed")) return null;
    try {
      return JSON.parse(recipe);
    } catch (e) {
      console.error("Parsing error:", e);
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
    <div style={styles.card}>
      <h3>📂 PDF Spending Analyzer</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".pdf" 
        style={styles.input}
      />
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleProcess} disabled={loading} style={styles.button}>
          {loading ? "⌛ Analyzing..." : "Analyze PDF"}
        </button>
        
        {parsedData && (
          <button onClick={downloadCSV} style={styles.exportButton}>
            📊 Export to Excel
          </button>
        )}

        {recipe && (
          <button onClick={() => { setRecipe(""); setFile(null); }} style={styles.clearButton}>Clear</button>
        )}
      </div>

      {parsedData ? (
        <div style={styles.dashboardContainer}>
          <div style={styles.summaryCard}>
            <h4 style={styles.cardHeader}>📄 AI Document Summary</h4>
            <p style={styles.summaryText}>{parsedData.summary || "No summary available."}</p>
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
      ) : (
        recipe && (
          <div style={styles.outputArea}>
            <pre style={styles.recipeText}>{recipe}</pre>
          </div>
        )
      )}
    </div>
  );
}

// ... (keep your existing styles object)