"use client";
import { useState, useEffect } from "react";
import { assignRecipeToMeal } from "../utils/api";

export default function MealRecipeAssignment({ mealId, onRecipeAssigned }) {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [recipeData, setRecipeData] = useState({
    FoodName: "",
    Quantity: "",
    Calories: 0,
    Fats: 0,
    Carbs: 0,
    Protein: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available recipes
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('https://api.flow108.in/api/Recipies');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data.Data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await assignRecipeToMeal(mealId, selectedRecipe, recipeData);
      onRecipeAssigned();
      // Reset form
      setSelectedRecipe("");
      setRecipeData({
        FoodName: "",
        Quantity: "",
        Calories: 0,
        Fats: 0,
        Carbs: 0,
        Protein: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipeId) => {
    const recipe = recipes.find(r => r.Id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipeId);
      setRecipeData({
        FoodName: recipe.Name || "",
        Quantity: "100gm",
        Calories: recipe.Calories || 0,
        Fats: recipe.Fats || 0,
        Carbs: recipe.Carbs || 0,
        Protein: recipe.Protein || 0
      });
    }
  };

  return (
    <div className="card mt-3">
      <div className="card-header">
        <h6 className="mb-0">Assign Recipe to Meal</h6>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Select Recipe</label>
            <select 
              className="form-select" 
              value={selectedRecipe}
              onChange={(e) => handleRecipeSelect(e.target.value)}
              required
            >
              <option value="">Choose a recipe</option>
              {recipes.map(recipe => (
                <option key={recipe.Id} value={recipe.Id}>
                  {recipe.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Food Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={recipeData.FoodName}
                onChange={(e) => setRecipeData({...recipeData, FoodName: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Quantity</label>
              <input 
                type="text" 
                className="form-control" 
                value={recipeData.Quantity}
                onChange={(e) => setRecipeData({...recipeData, Quantity: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Calories</label>
              <input 
                type="number" 
                className="form-control" 
                value={recipeData.Calories}
                onChange={(e) => setRecipeData({...recipeData, Calories: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Protein (g)</label>
              <input 
                type="number" 
                className="form-control" 
                value={recipeData.Protein}
                onChange={(e) => setRecipeData({...recipeData, Protein: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Carbs (g)</label>
              <input 
                type="number" 
                className="form-control" 
                value={recipeData.Carbs}
                onChange={(e) => setRecipeData({...recipeData, Carbs: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fats (g)</label>
              <input 
                type="number" 
                className="form-control" 
                value={recipeData.Fats}
                onChange={(e) => setRecipeData({...recipeData, Fats: parseInt(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
}
