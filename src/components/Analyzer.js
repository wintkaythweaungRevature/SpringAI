import React, { useState } from "react";

function PdfAnalyzer() {
  // ✅ Error တက်နေတဲ့ variables တွေကို state အဖြစ် ဒီမှာ ကြေညာပေးရပါမယ်
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState("");

  const handleProcess = async () => {
    if (!file) return alert("Please upload a PDF!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Analyze this document and extract information.");

    setLoading(true); // Line 8 fixed
    setRecipe(""); 

    try {
      const response = await fetch("https://api.wintaibot.com/api/ai/ask-ai", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Analyze this document... " + pdfText 
  }),
});

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      // AI ရဲ့ JSON response ကို စာသားအဖြစ် ပြောင်းပြီး သိမ်းမယ်
      setRecipe(JSON.stringify(data, null, 2)); // Line 22 fixed
    } catch (error) {
      console.error("Upload error:", error);
      setRecipe("Analysis failed. Please try again."); // Line 25 fixed
    } finally {
      setLoading(false); // Line 27 fixed
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