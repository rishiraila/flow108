// API utility functions for diet plan management

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// Common fetch wrapper with error handling and timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - please check your connection");
    }
    throw error;
  }
};

// Handle API response
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const data = await response.json();
  return data;
};

// Fetch diet plan details
export const fetchDietPlan = async (planId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${planId}`
    );
    const data = await handleApiResponse(response);
    return data.Data;
  } catch (error) {
    console.error("Error fetching diet plan:", error);
    throw new Error(`Failed to fetch diet plan: ${error.message}`);
  }
};

// Fetch meals for a diet plan
export const fetchMealsByPlan = async (planId) => {
  try {
    const plan = await fetchDietPlan(planId);
    return plan.Meals || [];
  } catch (error) {
    console.error("Error fetching meals by plan:", error);
    throw new Error(`Failed to fetch meals: ${error.message}`);
  }
};

// Fetch recipes for a meal
export const fetchRecipesByMeal = async (mealId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/meals/${mealId}/recipes`
    );
    const data = await handleApiResponse(response);
    return data.Data || [];
  } catch (error) {
    console.error("Error fetching recipes by meal:", error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

// Fetch all recipes
export const fetchAllRecipes = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/recipes`);
    const data = await response.json();

    const recipesData = data?.data?.Data || data?.Data || [];

    const validRecipes = recipesData
      .filter((recipe) => recipe && recipe.Id && recipe.Name && recipe.Name !== "string")
      .map((recipe) => ({
        Id: recipe.Id,
        Name: recipe.Name,
        Description: recipe.Description || "",
        Calories: recipe.Calories || 0,
        ImageUrl: recipe.ImageUrl || "",
        Steps: recipe.Steps || [],
        Tags: recipe.Tags || [],
      }));

    return validRecipes;
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};


// Add meal to diet plan
export const addMealToPlan = async (planId, mealData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${planId}/meals`,
      {
        method: "POST",
        body: JSON.stringify(mealData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error adding meal to plan:", error);
    throw new Error(`Failed to add meal: ${error.message}`);
  }
};

// Assign recipe to meal
export const assignRecipeToMeal = async (mealId, recipeId, recipeData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/meals/${mealId}/recipes/${recipeId}`,
      {
        method: "POST",
        body: JSON.stringify(recipeData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error assigning recipe to meal:", error);
    throw new Error(`Failed to assign recipe: ${error.message}`);
  }
};

// Delete meal from plan
export const deleteMealFromPlan = async (mealId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/meals/${mealId}`, {
      method: "DELETE",
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting meal from plan:", error);
    throw new Error(`Failed to delete meal: ${error.message}`);
  }
};

// Fetch user count
export const fetchUserCount = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/Users/count`);
    const data = await handleApiResponse(response);
    return data.Data || 0;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0; // Return 0 instead of throwing for user count
  }
};
