import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CUISINES = ["Any", "Italian", "Thai", "Japanese", "Indian", "French", "Myanmar", "Mexican", "Chinese", "Mediterranean"];
const DIETS = ["None", "Vegan", "Vegetarian", "Gluten-Free", "Keto", "Dairy-Free", "No Sugar", "Halal"];

function RecipeGenerator() {
  const { token, apiBase } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [dietaryRestriction, setDietaryRestrictions] = useState("None");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createRecipe = async () => {
    if (!ingredients.trim()) return alert("Please enter some ingredients!");
    setLoading(true);
    setRecipe("");
    try {
      const prompt = `Give me a ${cuisine} recipe using these ingredients: ${ingredients}. Dietary restrictions: ${dietaryRestriction}. Please provide a Title, Ingredients list, and Step-by-step instructions.`;
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Server error");
      setRecipe(await response.text());
    } catch (error) {
      setRecipe("This page is currently under maintenance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recipe);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = recipe ? recipe.trim().split(/\s+/).length : 0;

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerIcon}>👨‍🍳</div>
          <div>
            <h2 style={S.headerTitle}>AI Recipe Generator</h2>
            <p style={S.headerSub}>Get a custom recipe from your ingredients instantly</p>
          </div>
        </div>

        {/* Form */}
        <div style={S.body}>
          <div style={S.fieldGroup}>
            <label style={S.label}>INGREDIENTS <span style={S.required}>*</span></label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g. Tomato, Egg, Onion, Garlic"
              style={S.input}
              onKeyDown={(e) => e.key === "Enter" && createRecipe()}
            />
          </div>

          <div style={S.row2}>
            <div style={S.fieldGroup}>
              <label style={S.label}>CUISINE TYPE</label>
              <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={S.select}>
                {CUISINES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>DIETARY RESTRICTION</label>
              <select value={dietaryRestriction} onChange={(e) => setDietaryRestrictions(e.target.value)} style={S.select}>
                {DIETS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Tags preview */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {[cuisine !== "Any" && cuisine, dietaryRestriction !== "None" && dietaryRestriction]
              .filter(Boolean).map(tag => (
                <span key={tag} style={S.tag}>{tag}</span>
              ))}
          </div>

          <button onClick={createRecipe} disabled={loading} style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <span style={S.spinner} /> Generating Recipe...
              </span>
            ) : "✨ Generate Recipe"}
          </button>
        </div>

        {/* Result */}
        {recipe && (
          <div style={S.resultSection}>
            <div style={S.resultHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>📋</span>
                <span style={S.resultTitle}>Your Recipe</span>
                <span style={S.wordBadge}>{wordCount} words</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleCopy} style={S.actionBtn}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button onClick={() => { setRecipe(""); }} style={S.clearBtn}>
                  Clear
                </button>
              </div>
            </div>
            <div style={S.recipeBody}>
              {recipe}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
      `}</style>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f1f5f9", padding: "32px 20px", fontFamily: "'Segoe UI', Arial, sans-serif" },
  card: { maxWidth: "680px", margin: "0 auto", background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.09)" },

  header: { background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "28px 32px", display: "flex", alignItems: "center", gap: "18px" },
  headerIcon: { fontSize: "44px", lineHeight: 1 },
  headerTitle: { margin: 0, fontSize: "22px", fontWeight: "700", color: "#fff" },
  headerSub: { margin: "4px 0 0", fontSize: "13px", color: "#93c5fd" },

  body: { padding: "28px 32px" },
  fieldGroup: { marginBottom: "18px", flex: 1 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "4px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.8px", marginBottom: "7px" },
  required: { color: "#ef4444" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", background: "#f8fafc", boxSizing: "border-box", transition: "border 0.2s, box-shadow 0.2s" },
  select: { width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#0f172a", background: "#f8fafc", cursor: "pointer", transition: "border 0.2s" },
  tag: { background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "600", padding: "3px 12px", borderRadius: "20px", border: "1px solid #bfdbfe" },

  btn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #2563eb, #1e40af)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.3px" },
  btnDisabled: { background: "#94a3b8", cursor: "not-allowed" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  resultSection: { borderTop: "1px solid #e2e8f0" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  resultTitle: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  wordBadge: { fontSize: "11px", background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" },
  actionBtn: { padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  clearBtn: { padding: "6px 14px", background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  recipeBody: { padding: "24px 32px", whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.85", color: "#334155" },
};

export default RecipeGenerator;
