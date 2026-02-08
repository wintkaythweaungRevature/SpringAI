import React, { useState } from "react";

function ReceipeGenerator() {
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [dietaryRestriction, setDietaryRestrictions] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const createRecipe = async () => {
    if (!ingredients) return alert("Please enter some ingredients!");

    setLoading(true);
    try {
      // ✅ Prompt ကို Backend သို့ ပို့ရန် စနစ်တကျ ပေါင်းစပ်ခြင်း
      const fullPrompt = `Create a recipe using these ingredients: ${ingredients}. Cuisine type: ${cuisine}. Dietary restrictions: ${dietaryRestriction}`;

      // ✅ URL ကို api. subdomain သို့ လှမ်းခေါ်ခြင်း
      const response = await fetch(`https://api.wintkaythweaung.com/api/ai/ask-ai?prompt=${encodeURIComponent(fullPrompt)}`);
      
      if (!response.ok) throw new Error("Recipe generation failed");

      const data = await response.text();
      setRecipe(data);
    } catch (error) {
      console.error("Error generating Recipes response:", error);
      setRecipe("Error: ဟင်းချက်နည်း ထုတ်ပေးလို့ မရနိုင်ပါ။ Backend ကို စစ်ဆေးပါ။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>Create a Recipe</h2>
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter Ingredients (e.g. egg, potato, onion)"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        <input 
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="Enter cuisine type (e.g. Myanmar, Italian)"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        <input 
          type="text"
          value={dietaryRestriction}
          onChange={(e) => setDietaryRestrictions(e.target.value)}
          placeholder="Enter dietary restrictions (e.g. No Spicy, Vegan)"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        
        {/* ခလုတ်ကို သေချာ ပိတ်ပေးထားပါသည် */}
        <button onClick={createRecipe} disabled={loading} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? "Chef is thinking..." : "Create Recipe"}
        </button>
      </div>

      <div className="output" style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>Recipe Instructions:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
          {recipe || "ဟင်းချက်နည်းကို ဤနေရာတွင် ဖော်ပြပေးပါမည်..."}
        </pre>
      </div>
    </div>
  );
}

export default ReceipeGenerator;