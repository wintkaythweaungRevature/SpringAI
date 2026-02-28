import React, { useState } from "react"; // Fixed: Line 2 & 3 errors

function SpendingAnalyzer() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("analyze"); 
  const [recipe, setRecipe] = useState(""); // Fixed: Line 17 error
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!file) return alert("Please upload a PDF first!");

    setLoading(true);
    try {
      if (mode === "analyze") {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("https://api.wintaibot.com/api/ai/analyze-spending", {
          method: "POST",
          body: formData
        });
        const result = await response.text();
        setRecipe(result); 
      } else {
        // Logic for Excel export
        window.location.href = `https://api.wintaibot.com/api/ai/convert-pdf-to-excel?file=${file.name}`;
      }
    } catch (error) {
      console.error("Error:", error);
      setRecipe("Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>📂 Upload Statement (PDF)</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".pdf" 
        style={styles.input}
      />
      
      <div style={{ margin: '15px 0', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setMode("analyze")} 
          style={mode === "analyze" ? styles.activeButton : styles.inactiveButton}
        >
          AI Analysis
        </button>
        <button 
          onClick={() => setMode("excel")} 
          style={mode === "excel" ? styles.activeButton : styles.inactiveButton}
        >
          Export to Excel
        </button>
      </div>

      <button onClick={handleProcess} style={styles.button} disabled={loading}>
        {loading ? "Processing..." : "Process File"}
      </button>

      {recipe && (
        <div style={styles.outputArea}>
          <p>{recipe}</p>
        </div>
      )}
    </div>
  );
}

// Fixed: Added the missing 'styles' object (Line 26-39 errors)
const styles = {
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '20px auto'
  },
  title: { color: '#333', marginBottom: '15px' },
  input: { marginBottom: '15px', width: '100%' },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  activeButton: {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  inactiveButton: {
    padding: '8px 15px',
    backgroundColor: '#e9ecef',
    color: '#333',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  outputArea: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap'
  }
};

// Fixed: Added export default (App.js error)
export default SpendingAnalyzer;