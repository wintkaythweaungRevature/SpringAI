import React, { useState } from "react";

function PdfAnalyzer() {
  // ✅ Error တက်နေတဲ့ variables တွေကို state အဖြစ် ဒီမှာ ကြေညာပေးရပါမယ်
 This ESLint error happens because your JavaScript code is trying to use a variable named pdfText that hasn't been created or declared yet.

Since your Java Backend is already set up to read the PDF file using PDFBox, you don't need to extract the text in React. You just need to send the File object itself.

The Fix: Update Analyzer.js
Modify your handleProcess function to use the file state (which you already defined) instead of pdfText.

JavaScript
const handleProcess = async () => {
  if (!file) return alert("Please upload a PDF!");

  // 1. Create FormData to send the actual file
  const formData = new FormData();
  formData.append("file", file); // This matches @RequestParam("file") in your Java code
  formData.append("prompt", "Analyze this document and extract all important information.");

  setLoading(true);
  try {
    // 2. Point to the correct POST endpoint
    const response = await fetch("https://api.wintaibot.com/api/ai/analyze-pdf", {
      method: "POST",
      body: formData, 
      // Note: Do NOT set 'Content-Type' manually; browser handles it for FormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    setRecipe(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Upload error:", error);
    setRecipe("Analysis failed. Check backend logs.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.card}>
      <h3>📂 PDF Spending Analyzer</h3>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} // Line 2 & 5 fixed
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
  card: { padding: '20px', maxWidth: '500px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px' },
  input: { marginBottom: '15px', display: 'block' },
  button: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' },
  outputArea: { marginTop: '20px', backgroundColor: '#f4f4f4', padding: '10px' },
  recipeText: { whiteSpace: 'pre-wrap', wordBreak: 'break-all' }
};

export default PdfAnalyzer;