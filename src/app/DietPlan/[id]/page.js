"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RecipeAssignmentModal from "../RecipeAssignmentModal";

export default function DietPlanDetails() {
  const params = useParams();
  const planId = params.id;

  const [dietPlan, setDietPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMeals, setExpandedMeals] = useState({});

  const toggleMealExpansion = (mealId) => {
    setExpandedMeals((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [mealFormData, setMealFormData] = useState({
    MealType: "",
    Features: "",
  });
  const [addMealLoading, setAddMealLoading] = useState(false);
  const [addMealError, setAddMealError] = useState(null);
  const [showRecipeAssignmentModal, setShowRecipeAssignmentModal] =
    useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipesError, setRecipesError] = useState(null);
  const [recipeAssignmentForm, setRecipeAssignmentForm] = useState({
    FoodName: "",
    Quantity: "",
    Calories: "",
    Fats: "",
    Carbs: "",
    Protein: "",
    selectedRecipeId: "",
  });
  const [recipeAssignmentLoading, setRecipeAssignmentLoading] = useState(false);
  const [recipeAssignmentError, setRecipeAssignmentError] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [userCountLoading, setUserCountLoading] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch diet plan details and meals
  useEffect(() => {
    if (planId) {
      fetchDietPlanDetails();
      fetchAllRecipes();
      fetchUserCount();
    }
  }, [planId]);

  const fetchDietPlanDetails = async () => {
    try {
      setLoading(true);

      // Fetch diet plan details
      const planResponse = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}`
      );
      if (!planResponse.ok) throw new Error("Failed to fetch diet plan");

      const planData = await planResponse.json();
      if (planData.Status && planData.Data) {
        setDietPlan(planData.Data);
      } else {
        throw new Error("Invalid diet plan data");
      }

      // Fetch all meals with recipes for this diet plan
      const mealsResponse = await fetch(
        "https://flow108.coinagesoft.com/api/AllMealsWithRecipes"
      );
      if (!mealsResponse.ok)
        throw new Error("Failed to fetch meals with recipes");

      const mealsData = await mealsResponse.json();
      if (mealsData.Status && mealsData.Data) {
        // Filter meals for this specific diet plan
        const filteredMeals = mealsData.Data.filter(
          (meal) => meal.DietPlanId === planId
        );
        setMeals(filteredMeals);
      } else {
        throw new Error("Failed to fetch meals");
      }
    } catch (err) {
      console.error("Error fetching diet plan:", err);
      setError(err.message || "Failed to load diet plan");
    } finally {
      setLoading(false);
    }
  };

 const fetchAllRecipes = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(
      "https://flow108.coinagesoft.com/api/recipes",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const recipesData = data?.data?.Data || data?.Data || [];

    if (!Array.isArray(recipesData)) {
      console.warn("Invalid recipe data format:", data);
      setAllRecipes([]);
      return;
    }

    const validRecipes = recipesData
      .filter(
        (recipe) =>
          recipe &&
          (recipe.Id || recipe.id) &&
          recipe.Name &&
          recipe.Name !== "string"
      )
      .map((recipe) => ({
        Id: recipe.Id || recipe.id,
        Name: recipe.Name,
        Description: recipe.Description || "",
        Calories: recipe.Calories || 0,
        Fats: recipe.Fats || 0,
        Carbs: recipe.Carbs || 0,
        Protein: recipe.Protein || 0,
      }));

    console.log("Fetched valid recipes:", validRecipes); // ✅ Add this

    setAllRecipes(validRecipes);
    setRecipesError(null);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    let errorMessage = "Failed to load recipes";
    if (err.name === "AbortError") {
      errorMessage = "Request timeout - please check your connection";
    } else if (err.message.includes("Failed to fetch")) {
      errorMessage = "Network error - please check your connection or try again later";
    } else if (err.message.includes("HTTP error")) {
      errorMessage = `Server error (${err.message.match(/\d+/)?.[0] || "unknown"})`;
    }
    setRecipesError(errorMessage);
    setAllRecipes([]);
  }
};


  const fetchUserCount = async () => {
    try {
      setUserCountLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        "https://flow108.coinagesoft.com/api/Users/count",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`User count endpoint returned: ${response.status}`);
        setUserCount(0);
        return;
      }

      const data = await response.json();
      if (data.Status && data.Data !== undefined) {
        setUserCount(data.Data);
      } else {
        setUserCount(0);
      }
    } catch (err) {
      console.error("Error fetching user count:", err);
      // Don't show error to user for user count, just set to 0
      setUserCount(0);
    } finally {
      setUserCountLoading(false);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/users`
      );
      if (!response.ok) throw new Error("Failed to fetch assigned users");

      const data = await response.json();
      if (data.Status && data.Data) {
        setAssignedUsers(data.Data);
      } else {
        setAssignedUsers([]);
      }
    } catch (err) {
      console.error("Error fetching assigned users:", err);
      setAssignedUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const openUsersModal = () => {
    fetchAssignedUsers();
    setShowUsersModal(true);
  };

  const closeUsersModal = () => {
    setShowUsersModal(false);
    setAssignedUsers([]);
  };

  // Add meal to diet plan
  const addMealToPlan = async (e) => {
    e.preventDefault();
    try {
      setAddMealLoading(true);
      setAddMealError(null);

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/meals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mealFormData),
        }
      );

      if (!response.ok) throw new Error("Failed to add meal");

      const result = await response.json();

      // Refresh meals
      fetchDietPlanDetails();

      // Reset form and close modal
      setMealFormData({ MealType: "", Features: "" });
      setShowAddMealModal(false);
    } catch (err) {
      console.error("Error adding meal:", err);
      setAddMealError(err.message || "Failed to add meal");
    } finally {
      setAddMealLoading(false);
    }
  };

  const handleMealFormChange = (e) => {
    const { name, value } = e.target;
    setMealFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openRecipeAssignmentModal = (recipe, mealId) => {
    setSelectedRecipe(recipe);
    setSelectedMealId(mealId);
    setRecipeAssignmentForm({
      FoodName: recipe.FoodName || recipe.Recipe?.Name || "",
      Quantity: recipe.Quantity || "100",
      Calories: recipe.Calories || "0",
      Fats: recipe.Fats || "0",
      Carbs: recipe.Carbs || "0",
      Protein: recipe.Protein || "0",
    });
    setShowRecipeAssignmentModal(true);
    setRecipeAssignmentError(null);
  };

  const openRecipeSelectionModal = (mealId) => {
    // Open recipe selection modal with all available recipes
    setSelectedMealId(mealId);
    setShowRecipeAssignmentModal(true);
    // Reset form for new assignment
    setRecipeAssignmentForm({
      FoodName: "",
      Quantity: "100",
      Calories: "0",
      Fats: "0",
      Carbs: "0",
      Protein: "0",
      selectedRecipeId: "",
    });
  };

  const closeRecipeAssignmentModal = () => {
    setShowRecipeAssignmentModal(false);
    setSelectedRecipe(null);
    setSelectedMealId(null);
    setRecipeAssignmentForm({
      FoodName: "",
      Quantity: "",
      Calories: "",
      Fats: "",
      Carbs: "",
      Protein: "",
    });
    setRecipeAssignmentError(null);
  };

  const handleRecipeAssignmentFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "selectedRecipeId" && value) {
      // Auto-populate recipe details when a recipe is selected
      const selectedRecipe = allRecipes.find(
        (recipe) => (recipe.Id || recipe.id) === value
      );
      if (selectedRecipe) {
        setRecipeAssignmentForm((prev) => ({
          ...prev,
          selectedRecipeId: value,
          FoodName: selectedRecipe.Name || selectedRecipe.name || "",
          Calories:
            selectedRecipe.Calories?.toString() ||
            selectedRecipe.calories?.toString() ||
            "0",
          Fats:
            selectedRecipe.Fats?.toString() ||
            selectedRecipe.fats?.toString() ||
            "0",
          Carbs:
            selectedRecipe.Carbs?.toString() ||
            selectedRecipe.carbs?.toString() ||
            "0",
          Protein:
            selectedRecipe.Protein?.toString() ||
            selectedRecipe.protein?.toString() ||
            "0",
        }));
        return;
      }
    }

    setRecipeAssignmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const assignRecipeToMeal = async (e) => {
    e.preventDefault();
    try {
      setRecipeAssignmentLoading(true);
      setRecipeAssignmentError(null);

      const selectedRecipeId = recipeAssignmentForm.selectedRecipeId;
      if (!selectedRecipeId) {
        throw new Error("Please select a recipe");
      }

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/meals/${selectedMealId}/recipes/${selectedRecipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            FoodName: recipeAssignmentForm.FoodName,
            Quantity: recipeAssignmentForm.Quantity,
            Calories: parseInt(recipeAssignmentForm.Calories),
            Fats: parseInt(recipeAssignmentForm.Fats),
            Carbs: parseInt(recipeAssignmentForm.Carbs),
            Protein: parseInt(recipeAssignmentForm.Protein),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(
          `Failed to assign recipe: ${response.status} - ${errorData}`
        );
      }

      const result = await response.json();

      // Refresh meals to show updated data
      fetchDietPlanDetails();

      // Close modal
      closeRecipeAssignmentModal();
    } catch (err) {
      console.error("Error assigning recipe:", err);
      setRecipeAssignmentError(err.message || "Failed to assign recipe");
    } finally {
      setRecipeAssignmentLoading(false);
    }
  };

  // Calculate total nutrition for a meal
  const calculateMealNutrition = (recipes) => {
    if (!recipes || recipes.length === 0)
      return { calories: 0, fats: 0, carbs: 0, protein: 0 };

    return recipes.reduce(
      (total, recipe) => ({
        calories: total.calories + (recipe.Calories || 0),
        fats: total.fats + (recipe.Fats || 0),
        carbs: total.carbs + (recipe.Carbs || 0),
        protein: total.protein + (recipe.Protein || 0),
      }),
      { calories: 0, fats: 0, carbs: 0, protein: 0 }
    );
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading diet plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="alert alert-danger" role="alert">
            <h4>Error Loading Diet Plan</h4>
            <p>{error}</p>
            <Link href="/DietPlan" className="btn btn-primary">
              Back to Diet Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="alert alert-warning" role="alert">
            Diet plan not found
          </div>
          <Link href="/DietPlan" className="btn btn-primary">
            Back to Diet Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>{dietPlan.Name}</h2>
              <div>
                <Link
                  href="/DietPlan"
                  className="btn btn-outline-secondary me-2"
                >
                  Back to Plans
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddMealModal(true)}
                >
                  <i className="bi bi-plus-circle"></i> Add Meal
                </button>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Plan Details</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Description:</strong> {dietPlan.Description}
                    </p>
                    <p>
                      <strong>Duration:</strong> {dietPlan.Duration}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Total Calories:</strong> {dietPlan.TotalCalories}
                    </p>
                    <p>
                      <strong>Number of Meals:</strong> {meals.length}
                    </p>
                  </div>
                </div>
              </div>
              {/*  */}
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Meals</h5>
              </div>
              <div className="card-body">
                {meals.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No meals added to this plan yet.</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowAddMealModal(true)}
                    >
                      Add First Meal
                    </button>
                  </div>
                ) : (
                  <div className="accordion" id="mealsAccordion">
                    {meals.map((meal) => {
                      const nutrition = calculateMealNutrition(
                        meal.MealRecipes
                      );
                      return (
                        <div className="accordion-item" key={meal.Id}>
                          <h2 className="accordion-header">
                            <button
                              className="accordion-button collapsed"
                              type="button"
                              onClick={() => toggleMealExpansion(meal.Id)}
                              aria-expanded={expandedMeals[meal.Id]}
                            >
                              <div className="d-flex justify-content-between w-100 align-items-center">
                                <div>
                                  <strong>{meal.MealType}</strong>
                                  <span className="badge bg-primary ms-2">
                                    {meal.MealRecipes?.length || 0} recipes
                                  </span>
                                </div>
                                <div className="text-muted small">
                                  {nutrition.calories} cal | {nutrition.protein}
                                  g protein
                                </div>
                              </div>
                            </button>
                          </h2>
                          {expandedMeals[meal.Id] && (
                            <div className="accordion-collapse collapse show">
                              <div className="accordion-body">
                                <p>
                                  <strong>Features:</strong> {meal.Features}
                                </p>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0">Recipes</h6>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() =>
                                        openRecipeSelectionModal(meal.Id)
                                      }
                                    >
                                      Assign Recipe
                                    </button>
                                  </div>
                                </div>

                                {meal.MealRecipes &&
                                meal.MealRecipes.length > 0 ? (
                                  <div className="row">
                                    {meal.MealRecipes.map((mealRecipe) => (
                                      <div
                                        className="col-md-6 mb-3"
                                        key={mealRecipe.Id}
                                      >
                                        <div className="card">
                                          <div className="card-body">
                                            <h6 className="card-title">
                                              {mealRecipe.FoodName}
                                            </h6>
                                            <p className="card-text">
                                              <small className="text-muted">
                                                Quantity: {mealRecipe.Quantity}
                                                <br />
                                                Calories: {mealRecipe.Calories}
                                                <br />
                                                Protein: {mealRecipe.Protein}g |
                                                Carbs: {mealRecipe.Carbs}g |
                                                Fats: {mealRecipe.Fats}g
                                              </small>
                                            </p>
                                            {mealRecipe.Recipe && (
                                              <div className="mt-2">
                                                <h6 className="text-primary">
                                                  {mealRecipe.Recipe.Name}
                                                </h6>
                                                <p className="small text-muted">
                                                  {
                                                    mealRecipe.Recipe
                                                      .Description
                                                  }
                                                </p>
                                                {mealRecipe.Recipe.Steps &&
                                                  mealRecipe.Recipe.Steps
                                                    .length > 0 && (
                                                    <details>
                                                      <summary className="small text-primary cursor-pointer">
                                                        View Recipe Steps
                                                      </summary>
                                                      <ol className="small mt-2">
                                                        {mealRecipe.Recipe.Steps.map(
                                                          (step, index) => (
                                                            <li key={index}>
                                                              {step}
                                                            </li>
                                                          )
                                                        )}
                                                      </ol>
                                                    </details>
                                                  )}
                                                {mealRecipe.Recipe.Tags &&
                                                  mealRecipe.Recipe.Tags
                                                    .length > 0 && (
                                                    <div className="mt-2">
                                                      {mealRecipe.Recipe.Tags.map(
                                                        (tag, index) => (
                                                          <span
                                                            key={index}
                                                            className="badge bg-light text-dark me-1"
                                                          >
                                                            {tag}
                                                          </span>
                                                        )
                                                      )}
                                                    </div>
                                                  )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-3">
                                    <p className="text-muted">
                                      No recipes assigned to this meal yet.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Meal Modal */}
        {showAddMealModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Meal to {dietPlan.Name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddMealModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {addMealError && (
                    <div className="alert alert-danger" role="alert">
                      {addMealError}
                    </div>
                  )}
                  <form onSubmit={addMealToPlan}>
                    <div className="mb-3">
                      <label htmlFor="MealType" className="form-label">
                        Meal Type
                      </label>
                      <select
                        className="form-select"
                        id="MealType"
                        name="MealType"
                        value={mealFormData.MealType}
                        onChange={handleMealFormChange}
                        required
                      >
                        <option value="">Select meal type</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Pre-workout">Pre-workout</option>
                        <option value="Post-workout">Post-workout</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="Features" className="form-label">
                        Features
                      </label>
                      <textarea
                        className="form-control"
                        id="Features"
                        name="Features"
                        rows="3"
                        placeholder="Enter meal features (e.g., high protein, low carb, vegan)"
                        value={mealFormData.Features}
                        onChange={handleMealFormChange}
                        required
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddMealModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={addMealLoading}
                      >
                        {addMealLoading ? "Adding..." : "Add Meal"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Assignment Modal */}

        {showRecipeAssignmentModal && (
          <RecipeAssignmentModal
            isOpen={showRecipeAssignmentModal}
            onClose={closeRecipeAssignmentModal}
            mealId={selectedMealId}
            onRecipeAssigned={fetchDietPlanDetails}
            recipes={allRecipes}
          />
        )}
      </div>
    </div>
  );
}
