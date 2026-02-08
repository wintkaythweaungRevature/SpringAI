import React, { useState }  from "react";

function ReceipeGenerator ()
{
  const [ingredients, setIngredients] = useState ('');
  const [cuisine ,setCuisine] = useState ('any');
  const [dietaryRestriction,setDietaryRestrictions] = useState ('');
  const [recipe , setRescipe] = useState ('');

  const createRecipe = async () => {

    try {
      const response = await fetch (`https://api.wintkaythweaung.com/api/ai/ask-ai?prompt= ${ingredients}&dietaryRestrictions=${dietaryRestriction}&cuisine =${cuisine}`)
      const data = await response.text();
      console.log(data);
      setRescipe(data);
  } catch (error) {
     console.error("Error generating Recipes response : " , error)
     
  }
  };
 return (

<div>
    <h2>Create a Recipe </h2>
    <input 
    type = "text"
    value = {ingredients}
    onChange={(e) => setIngredients (e.target.value)}
    placeholder="Enter Ingredients (comma seperated )"
    />


    <input 
    type = "text"
    value = {cuisine}
    onChange={(e) => setCuisine (e.target.value)}
    placeholder="Enter cuisine type "

 />

    <input 
    type = "text"
    value = {dietaryRestriction}
    onChange={(e) => setDietaryRestrictions (e.target.value)}
    placeholder="Enter dietary rerstictions "


    />
    
  <button onClick={createRecipe}>Create Recipes  </button>
  <div className=" output">
    <pre className=" recipe-text"> {recipe}</pre>
  </div>
</div>
  
 );
}
export default ReceipeGenerator;