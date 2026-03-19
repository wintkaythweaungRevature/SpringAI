'use client';

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const CUISINES = ["Any","Italian","Asian","Thai","Myanmar","Mexican","French","Indian","Japanese","Mediterranean"];

function RecipeGenerator() {
  const { token, apiBase } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [dietary, setDietary] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  const createRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true); setRecipe("");
    try {
      const selectedCuisine = cuisine === "Any" ? "any" : cuisine;
      const prompt = `Give me a ${selectedCuisine} recipe using these ingredients: ${ingredients}. Dietary restrictions: ${dietary || "none"}. Please provide a Title, Ingredients list, and Step-by-step instructions.`;
      const url = `${apiBase || "https://api.wintaibot.com"}/api/ai/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Server error");
      setRecipe(await response.text());
    } catch {
      setRecipe("Unable to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatRecipe = (text) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.match(/^(Title|TITLE|Recipe|RECIPE):/i) || line.startsWith("# "))
      return <h3 key={i} style={s.rTitle}>{line.replace(/^#+\s*|(Title|Recipe):\s*/i, "")}</h3>;
    if (line.match(/^(Ingredients|Instructions|Steps|Directions):/i) || line.startsWith("## "))
      return <h4 key={i} style={s.rSection}>{line.replace(/^#+\s*/, "")}</h4>;
    if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/))
      return <div key={i} style={s.rItem}><span style={s.rBullet}>{line.match(/^\d+\./) ? "→" : "•"}</span><span>{line.replace(/^[-*•]\s|\d+\.\s/, "")}</span></div>;
    return <p key={i} style={s.rPara}>{line}</p>;
  });

  return (
    <div style={s.page}>
      <div style={s.layout}>

        {/* ── LEFT: Controls ── */}
        <div style={s.left}>
          <div style={s.panelHeader}>
            <span style={s.panelIcon}>👨‍🍳</span>
            <div>
              <h2 style={s.panelTitle}>Recipe Generator</h2>
              <p style={s.panelSub}>AI-powered cooking assistant</p>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>🥦 Ingredients</label>
            <input
              type="text" value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRecipe()}
              placeholder="e.g. Chicken, Garlic, Tomato"
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>🌍 Cuisine Style</label>
            <div style={s.chipGrid}>
              {CUISINES.map((c) => (
                <button key={c} onClick={() => setCuisine(c)}
                  style={{ ...s.chip, ...(cuisine === c ? s.chipActive : {}) }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>🥗 Dietary Restrictions</label>
            <input
              type="text" value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="e.g. Vegan, Gluten-free"
              style={s.input}
            />
          </div>

          <button onClick={createRecipe} disabled={loading || !ingredients.trim()}
            style={{ ...s.btnGenerate, opacity: !ingredients.trim() ? 0.5 : 1 }}>
            {loading ? <><span style={s.spinner} /> Generating...</> : "✦ Generate Recipe"}
          </button>

          {recipe && (
            <button onClick={() => setRecipe("")} style={s.btnGhost}>Clear</button>
          )}
        </div>

        {/* ── RIGHT: Output ── */}
        <div style={s.right}>
          {loading ? (
            <div style={s.emptyCanvas}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🍳</div>
                <p style={s.emptyTitle}>Crafting your recipe...</p>
                <p style={s.emptyHint}>AI is creating something delicious</p>
                <div style={s.progressWrap}><div style={s.progressBar} /></div>
              </div>
            </div>
          ) : recipe ? (
            <div style={s.recipeCard}>
              <div style={s.recipeHeader}>
                <span style={s.recipeHeaderLabel}>🍽 Your Recipe</span>
                <button onClick={() => navigator.clipboard.writeText(recipe)} style={s.copyBtn}>📋 Copy</button>
              </div>
              <div style={s.recipeBody}>{formatRecipe(recipe)}</div>
            </div>
          ) : (
            <div style={s.emptyCanvas}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.2 }}>🍲</div>
                <p style={s.emptyTitle}>Your recipe appears here</p>
                <p style={s.emptyHint}>Enter ingredients and click Generate</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse-bar{0%,100%{width:15%}50%{width:80%}}`}</style>
    </div>
  );
}

export default RecipeGenerator;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s: Record<string, any> = {
  page: { padding: "4px 0", fontFamily: "'Inter',-apple-system,sans-serif" },
  layout: { display: "flex", gap: "20px", alignItems: "flex-start" },
  left: {
    width: "300px", minWidth: "260px", flexShrink: 0,
    background: "#fff", borderRadius: "16px",
    border: "1px solid #e2e8f0", padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  panelIcon: { fontSize: "30px" },
  panelTitle: { margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" },
  panelSub: { margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a",
    outline: "none", fontFamily: "inherit", background: "#f8fafc",
    boxSizing: "border-box",
  },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: {
    padding: "6px 12px", borderRadius: "20px",
    border: "1px solid #e2e8f0", background: "#f8fafc",
    color: "#475569", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
  },
  chipActive: {
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    border: "1px solid transparent", color: "#fff", fontWeight: "700",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  btnGenerate: {
    width: "100%", padding: "12px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
    color: "#fff", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", fontFamily: "inherit",
    marginBottom: "10px", boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
  },
  btnGhost: {
    width: "100%", padding: "9px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#94a3b8", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
  },
  spinner: { width: "12px", height: "12px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTop: "2px solid #fff", display: "inline-block" },
  right: { flex: 1, minWidth: 0 },
  emptyCanvas: {
    background: "#fff", border: "2px dashed #e2e8f0",
    borderRadius: "16px", minHeight: "400px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { color: "#94a3b8", fontSize: "15px", fontWeight: "600", margin: "0 0 6px" },
  emptyHint: { color: "#cbd5e1", fontSize: "13px", margin: "0 0 20px" },
  progressWrap: { height: "3px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden", width: "160px", margin: "0 auto" },
  progressBar: { height: "100%", borderRadius: "2px", background: "linear-gradient(90deg,#2563eb,#7c3aed)", animation: "pulse-bar 2s ease-in-out infinite" },
  recipeCard: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  recipeHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  recipeHeaderLabel: { color: "#2563eb", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px" },
  copyBtn: { padding: "6px 12px", borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" },
  recipeBody: { padding: "20px 24px" },
  rTitle: { color: "#0f172a", fontSize: "19px", fontWeight: "800", margin: "0 0 14px", letterSpacing: "-0.3px" },
  rSection: { color: "#2563eb", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", margin: "18px 0 10px" },
  rPara: { color: "#475569", fontSize: "14px", lineHeight: "1.7", margin: "0 0 6px" },
  rItem: { display: "flex", gap: "10px", color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "6px" },
  rBullet: { color: "#2563eb", fontWeight: "700", flexShrink: 0 },
};
