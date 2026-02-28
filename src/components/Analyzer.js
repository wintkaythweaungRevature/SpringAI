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

  return (
    <div style={styles.card}>
      <h3>📂 PDF Spending Analyzer</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        accept=".pdf" 
        style={styles.input}
      />
      
      <button 
        onClick={handleProcess} 
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Analyzing..." : "Analyze PDF"}
      </button>

      {recipe && (
        <div style={styles.outputArea}>
          <pre style={styles.recipeText}>{recipe}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { padding: '20px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' },
  input: { marginBottom: '15px', display: 'block', width: '100%' },
  button: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  outputArea: { marginTop: '20px', backgroundColor: '#f8f9fa', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', overflowX: 'auto' },
  recipeText: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '14px' }
};

export default PdfAnalyzer;