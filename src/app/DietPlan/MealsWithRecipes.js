"use client";
import { useState, useEffect } from "react";

export default function MealsWithRecipes() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMeals, setExpandedMeals] = useState({});

  useEffect(() => {
    fetchMealsWithRecipes();
  }, []);

  const fetchMealsWithRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.flow108.in/api/AllMealsWithRecipes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Status && data.Data) {
        setMeals(data.Data);
      } else {
        throw new Error(data.Message || 'Failed to fetch meals');
      }
    } catch (err) {
      console.error('Error fetching meals with recipes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpansion = (mealId) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const renderRecipeSteps = (steps) => {
    if (!steps || !Array.isArray(steps)) return null;
    
    return (
      <ol className="list-decimal list-inside space-y-1">
        {steps.map((step, index) => (
          <li key={index} className="text-sm text-gray-600">{step}</li>
        ))}
      </ol>
    );
  };

  const renderTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag, index) => (
          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading meals with recipes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading meals</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No meals found</h3>
        <p className="mt-1 text-sm text-gray-500">There are no meals with recipes available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meals with Recipes</h2>
        <button
          onClick={fetchMealsWithRecipes}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {meals.map((meal) => (
          <div key={meal.Id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{meal.MealType}</h3>
                <span className="text-sm text-gray-500">{meal.DietPlanName}</span>
              </div>
              
              {meal.Features && meal.Features !== 'string' && (
                <p className="text-sm text-gray-600 mb-3">{meal.Features}</p>
              )}
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500">Recipes: {meal.MealRecipes?.length || 0}</span>
                <button
                  onClick={() => toggleMealExpansion(meal.Id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {expandedMeals[meal.Id] ? 'Hide Recipes' : 'Show Recipes'}
                </button>
              </div>

              {expandedMeals[meal.Id] && meal.MealRecipes && meal.MealRecipes.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Recipes</h4>
                  <div className="space-y-4">
                    {meal.MealRecipes.map((mealRecipe) => (
                      <div key={mealRecipe.Id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-sm font-medium text-gray-900">{mealRecipe.FoodName}</h5>
                          <span className="text-xs text-gray-500">{mealRecipe.Quantity}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>Calories: {mealRecipe.Calories}</div>
                          <div>Protein: {mealRecipe.Protein}g</div>
                          <div>Carbs: {mealRecipe.Carbs}g</div>
                          <div>Fats: {mealRecipe.Fats}g</div>
                        </div>

                        {mealRecipe.Recipe && (
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-gray-800">{mealRecipe.Recipe.Name}</h6>
                            <p className="text-xs text-gray-600 mt-1">{mealRecipe.Recipe.Description}</p>
                            
                            {mealRecipe.Recipe.Steps && mealRecipe.Recipe.Steps.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Steps:</p>
                                {renderRecipeSteps(mealRecipe.Recipe.Steps)}
                              </div>
                            )}
                            
                            {renderTags(mealRecipe.Recipe.Tags)}
                            
                            {mealRecipe.Recipe.ImageUrl && (
                              <img 
                                src={mealRecipe.Recipe.ImageUrl} 
                                alt={mealRecipe.Recipe.Name}
                                className="mt-2 rounded w-full h-32 object-cover"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
