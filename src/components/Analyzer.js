import React, { useState } from "react";

function PdfAnalyzer() {
  // ✅ These MUST be defined inside the function
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState("");

  const handleProcess = async () => {
    if (!file) return alert("Please upload a PDF!");

    // 1. Create FormData to send the actual file
    const formData = new FormData();
    formData.append("file", file); // Matches @RequestParam("file") in Java
    formData.append("prompt", "Analyze this document and extract all important information.");

    setLoading(true);
    setRecipe(""); // Clear previous results

    try {
      // 2. POST to your API       "https://api.wintaibot.com/api/ai/analyze-pdf";
     const url = `https://api.wintaibot.com/api/ai/analyze-pdf?t=${Date.now()}`;
const response = await fetch(url, {
  method: "POST", // Ensure this is POST
  body: formData,
});

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server error");
      }

      const data = await response.json();
      setRecipe(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Upload error:", error);
      setRecipe(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely parse JSON
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
      
      <button onClick={handleProcess} disabled={loading} style={styles.button}>
        {loading ? "Analyzing..." : "Analyze PDF"}
      </button>

      {parsedData && (
        <div style={styles.resultContainer}>
          {/* Summary Section */}
          <div style={styles.summaryBox}>
            <h4 style={{marginTop: 0}}>Summary</h4>
            <p>{parsedData.summary}</p>
          </div>

          {/* Table Section */}
          <div style={styles.tableWrapper}>
            <h4>Extracted Data</h4>
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
                  <tr key={i} style={i % 2 === 0 ? {} : {backgroundColor: '#f9f9f9'}}>
                    {row.map((cell, j) => (
                      <td key={j} style={styles.td}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights Section */}
          <div style={styles.summaryBox}>
            <h4 style={{marginTop: 0}}>AI Insights</h4>
            <ul>
              {parsedData.insights?.map((insight, i) => (
                <li key={i} style={{fontSize: '14px', marginBottom: '5px'}}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Show raw error if it's not JSON */}
      {!parsedData && recipe && (
        <div style={styles.outputArea}>
          <pre style={styles.recipeText}>{recipe}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  input: { padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' },
  button: { padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  outputArea: { marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #ddd' },
  recipeText: { whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '12px' },
  resultContainer: { marginTop: '25px', textAlign: 'left' },
  summaryBox: { padding: '15px', backgroundColor: '#eefaf0', borderRadius: '6px', marginBottom: '20px', borderLeft: '5px solid #28a745' },
  tableWrapper: { overflowX: 'auto', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: '#28a745', color: '#fff', padding: '10px', textAlign: 'left', border: '1px solid #ddd' },
  td: { padding: '10px', border: '1px solid #ddd' },
};

export default PdfAnalyzer;