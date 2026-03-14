import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const CUISINES = ["Any", "Italian", "Asian", "Thai", "Myanmar", "Mexican", "French", "Indian", "Japanese", "Mediterranean"];

function RecipeGenerator() {
  const { token, apiBase } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [customCuisine, setCustomCuisine] = useState("");
  const [dietaryRestriction, setDietaryRestrictions] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createRecipe = async () => {
    if (!ingredients) return;
    setLoading(true);
    setRecipe("");
    try {
      const selectedCuisine = cuisine === "Any" ? (customCuisine || "any") : cuisine;
      const prompt = `Give me a ${selectedCuisine} recipe using these ingredients: ${ingredients}.
                      Dietary restrictions: ${dietaryRestriction || "none"}.
                      Please provide a Title, Ingredients list, and Step-by-step instructions.`;
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Server error");
      const data = await response.text();
      setRecipe(data);
    } catch (error) {
      setRecipe("This page is currently under maintenance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatRecipe = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.startsWith("# ") || line.match(/^(Title|TITLE|Recipe|RECIPE):/i)) {
        return <h3 key={i} style={s.recipeTitle}>{line.replace(/^#+\s*|^(Title|Recipe):\s*/i, "")}</h3>;
      }
      if (line.match(/^(Ingredients|INGREDIENTS|Instructions|INSTRUCTIONS|Steps|STEPS|Directions|DIRECTIONS):/i) || line.startsWith("## ")) {
        return <h4 key={i} style={s.recipeSection}>{line.replace(/^#+\s*/, "")}</h4>;
      }
      if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
        return <div key={i} style={s.recipeListItem}>
          <span style={s.recipeBullet}>{line.match(/^\d+\./) ? "→" : "•"}</span>
          <span>{line.replace(/^[-*•]\s|\d+\.\s/, "")}</span>
        </div>;
      }
      return <p key={i} style={s.recipePara}>{line}</p>;
    });
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.iconWrap}>👨‍🍳</div>
          <div>
            <h2 style={s.title}>AI Recipe Generator</h2>
            <p style={s.subtitle}>Turn your ingredients into a masterpiece</p>
          </div>
        </div>

        {/* Form */}
        <div style={s.card}>
          {/* Ingredients */}
          <div style={s.field}>
            <label style={s.label}>
              <span style={s.labelIcon}>🥦</span> Ingredients
            </label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRecipe()}
              placeholder="e.g. Chicken, Garlic, Tomato, Pasta"
              style={s.input}
            />
          </div>

          {/* Cuisine Chips */}
          <div style={s.field}>
            <label style={s.label}><span style={s.labelIcon}>🌍</span> Cuisine Style</label>
            <div style={s.chipGrid}>
              {CUISINES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisine(c)}
                  style={{ ...s.chip, ...(cuisine === c ? s.chipActive : {}) }}
                >
                  {c}
                </button>
              ))}
            </div>
            {cuisine === "Any" && (
              <input
                type="text"
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                placeholder="Or type a specific cuisine..."
                style={{ ...s.input, marginTop: "10px" }}
              />
            )}
          </div>

          {/* Dietary */}
          <div style={s.field}>
            <label style={s.label}><span style={s.labelIcon}>🥗</span> Dietary Restrictions</label>
            <input
              type="text"
              value={dietaryRestriction}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g. Vegan, Gluten-free, No Sugar"
              style={s.input}
            />
          </div>

          {/* Button */}
          <button
            onClick={createRecipe}
            disabled={loading || !ingredients.trim()}
            style={{ ...s.btnGenerate, opacity: !ingredients.trim() ? 0.5 : 1 }}
          >
            {loading ? (
              <><span style={s.spinner} /> Crafting your recipe...</>
            ) : "✦ Generate Recipe"}
          </button>
        </div>

        {/* Loading shimmer */}
        {loading && (
          <div style={s.shimmerCard}>
            <div style={s.shimmerLine} />
            <div style={{ ...s.shimmerLine, width: "75%" }} />
            <div style={{ ...s.shimmerLine, width: "55%", marginTop: "16px" }} />
            <div style={{ ...s.shimmerLine, width: "80%" }} />
            <div style={s.shimmerLine} />
          </div>
        )}

        {/* Result */}
        {recipe && !loading && (
          <div style={s.resultCard}>
            <div style={s.resultHeader}>
              <span style={s.resultHeaderIcon}>🍽</span>
              <span style={s.resultHeaderText}>Your Recipe</span>
              <button
                style={s.clearBtn}
                onClick={() => setRecipe("")}
              >✕ Clear</button>
            </div>
            <div style={s.recipeBody}>
              {formatRecipe(recipe)}
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

export default RecipeGenerator;

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 16px",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  container: { maxWidth: "680px", margin: "0 auto" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" },
  iconWrap: { fontSize: "40px" },
  title: { margin: 0, fontSize: "26px", fontWeight: "800", color: "#e2e8f0", letterSpacing: "-0.5px" },
  subtitle: { margin: "4px 0 0", fontSize: "14px", color: "#64748b" },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "20px",
    backdropFilter: "blur(12px)",
  },
  field: { marginBottom: "22px" },
  label: {
    display: "flex", alignItems: "center", gap: "8px",
    color: "#94a3b8", fontSize: "13px", fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.8px",
    marginBottom: "10px",
  },
  labelIcon: { fontSize: "16px" },
  input: {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  chipGrid: {
    display: "flex", flexWrap: "wrap", gap: "8px",
  },
  chip: {
    padding: "7px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  chipActive: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    border: "1px solid transparent",
    color: "#fff",
    fontWeight: "700",
    boxShadow: "0 0 12px rgba(102,126,234,0.3)",
  },
  btnGenerate: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 20px rgba(102,126,234,0.3)",
  },
  spinner: {
    width: "14px", height: "14px", borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff",
    display: "inline-block",
  },
  shimmerCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px", padding: "28px", marginBottom: "20px",
  },
  shimmerLine: {
    height: "14px", borderRadius: "8px",
    background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
    marginBottom: "12px", width: "100%",
  },
  resultCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(102,126,234,0.2)",
    borderRadius: "20px",
    overflow: "hidden",
  },
  resultHeader: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "16px 24px",
    background: "rgba(102,126,234,0.1)",
    borderBottom: "1px solid rgba(102,126,234,0.15)",
  },
  resultHeaderIcon: { fontSize: "20px" },
  resultHeaderText: { color: "#a5b4fc", fontSize: "14px", fontWeight: "700", flex: 1, textTransform: "uppercase", letterSpacing: "0.8px" },
  clearBtn: {
    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", fontSize: "12px", fontWeight: "600",
    padding: "5px 12px", borderRadius: "8px", cursor: "pointer",
  },
  recipeBody: { padding: "24px" },
  recipeTitle: { color: "#e2e8f0", fontSize: "20px", fontWeight: "800", margin: "0 0 16px", letterSpacing: "-0.3px" },
  recipeSection: { color: "#a5b4fc", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", margin: "20px 0 10px" },
  recipePara: { color: "#cbd5e1", fontSize: "14px", lineHeight: "1.7", margin: "0 0 8px" },
  recipeListItem: { display: "flex", gap: "12px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "8px" },
  recipeBullet: { color: "#667eea", fontWeight: "700", flexShrink: 0, marginTop: "1px" },
};
