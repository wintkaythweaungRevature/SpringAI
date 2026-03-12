import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function RecipeGenerator() {
  const { token, apiBase } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [dietaryRestriction, setDietaryRestrictions] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const createRecipe = async () => {
    if (!ingredients) return alert("Please enter some ingredients!");

    setLoading(true);
    setRecipe(""); // အရင်ထွက်ထားတဲ့ ဟာကို ရှင်းထုတ်ခြင်း

    try {
      // ✅ AI ကို ပိုပြီး တိကျတဲ့ မေးခွန်း (Prompt) ပို့ပေးခြင်း
      const prompt = `Give me a ${cuisine} recipe using these ingredients: ${ingredients}. 
                      Dietary restrictions: ${dietaryRestriction || 'none'}. 
                      Please provide a Title, Ingredients list, and Step-by-step instructions.`;

      const url = `${apiBase || 'https://api.wintaibot.com'}/ask-ai?prompt=${encodeURIComponent(prompt)}`;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) throw new Error("Server error");

      const data = await response.text();
      setRecipe(data);
    } catch (error) {
      console.error("Error generating Recipes response: ", error);
      setRecipe("This page is currently under maintenance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👨‍🍳 AI Recipe Generator</h2>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Ingredients</label>
          <input 
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. Tomato, Egg, Onion"
            style={styles.input}
          />

          <label style={styles.label}>Cuisine Type</label>
          <input 
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g. Italian, Myanmar, Thai"
            style={styles.input}
          />

          <label style={styles.label}>Dietary Restrictions</label>
          <input 
            type="text"
            value={dietaryRestriction}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g. Vegan, No Sugar"
            style={styles.input}
          />
        </div>

        <button 
          onClick={createRecipe} 
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: loading ? '#6c757d' : '#28a745'
          }}
        >
          {loading ? "Creating Recipe..." : "Generate Recipe"}
        </button>

        {recipe && (
          <div style={styles.outputArea}>
            <h3 style={styles.resultTitle}>Your Recipe:</h3>
            <div style={styles.recipeText}>
              {recipe}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✨ Styling (Inline CSS)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh'
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#555' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px' },
  button: {
    width: '100%',
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  outputArea: { marginTop: '25px', padding: '15px', backgroundColor: '#fff9e6', borderRadius: '8px', borderLeft: '4px solid #ffc107' },
  resultTitle: { marginTop: 0, fontSize: '18px', color: '#856404' },
  recipeText: { whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#333' }
};

export default RecipeGenerator;