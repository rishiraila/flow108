"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RecipeAssignmentModal from "../RecipeAssignmentModal";
import DietPlanAssignmentModal from "../DietPlanAssignmentModal";

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
    Calories: 0,
    Fats: 0,
    Carbs: 0,
    Protein: 0,
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
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editMealFormData, setEditMealFormData] = useState({
    MealType: "",
    Features: "",
    Calories: 0,
    Fats: 0,
    Carbs: 0,
    Protein: 0,
  });
  const [editMealLoading, setEditMealLoading] = useState(false);
  const [editMealError, setEditMealError] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(null); // Track which user is being unassigned
  const [selectedUsersToUnassign, setSelectedUsersToUnassign] = useState([]); // Track selected users for bulk unassignment
  const [bulkUnassignLoading, setBulkUnassignLoading] = useState(false); // Track bulk unassignment loading

  // Function to unassign user from diet plan
  const handleUnassignUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unassign this user from the diet plan?")) return;

    try {
      setUnassignLoading(userId);
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/unassignplans/${userId}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to unassign user");

      const result = await response.json();
      if (result.Status) {
        alert(result.Message || "User unassigned successfully");

        // Remove the user from the assignedUsers state to update UI immediately
        setAssignedUsers((prevUsers) => prevUsers.filter(user => user.Id !== userId));

        // Refresh the assigned users list from server to ensure consistency
        await fetchAssignedUsers();
      } else {
        throw new Error(result.Message || "Failed to unassign user");
      }
    } catch (err) {
      console.error("Error unassigning user:", err);
      alert("Error unassigning user: " + err.message);
    } finally {
      setUnassignLoading(null);
    }
  };

  // Fetch diet plan details and meals
  useEffect(() => {
    if (planId) {
      fetchDietPlanDetails();
      fetchAllRecipes();
      fetchUserCount();
      fetchAssignedUsers();
    }
  }, [planId]);

  const fetchDietPlanDetails = async () => {
    try {
      setLoading(true);

      // Get plan details (includes meals + nutrition)
      const planResponse = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}`
      );
      if (!planResponse.ok) throw new Error("Failed to fetch diet plan");

      const planData = await planResponse.json();
      if (planData.Status && planData.Data) {
        setDietPlan(planData.Data);
        setMeals(planData.Data.Meals || []); // ✅ meals come with calories/fats/carbs/protein
      } else {
        throw new Error("Invalid diet plan data");
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
        errorMessage =
          "Network error - please check your connection or try again later";
      } else if (err.message.includes("HTTP error")) {
        errorMessage = `Server error (${
          err.message.match(/\d+/)?.[0] || "unknown"
        })`;
      }
      setRecipesError(errorMessage);
      setAllRecipes([]);
    }
  };
  const getColorFromName = (name = "") => {
    const colors = [
      "#1abc9c",
      "#3498db",
      "#9b59b6",
      "#e67e22",
      "#e74c3c",
      "#2ecc71",
      "#f39c12",
      "#d35400",
      "#8e44ad",
      "#16a085",
      "#27ae60",
      "#2980b9",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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

      // Use the correct API endpoint for diet plan assignments
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/users`
      );

      if (!response.ok) {
        console.warn(`Failed to fetch assigned users: ${response.status}`);
        setAssignedUsers([]);
        return;
      }

      const data = await response.json();
      console.log("Assigned users API response:", data); // Debug log

      if (data.Status && Array.isArray(data.Data)) {
        console.log("Assigned users data:", data.Data); // Debug log
        setAssignedUsers(data.Data);
      } else {
        console.warn("Invalid assigned users data format:", data);
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
    setSelectedUsersToUnassign([]); // Clear selections when closing
  };

  // Handle checkbox selection for bulk unassignment
  const handleUserSelection = (userId) => {
    setSelectedUsersToUnassign((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedUsersToUnassign.length === assignedUsers.length) {
      setSelectedUsersToUnassign([]);
    } else {
      setSelectedUsersToUnassign(assignedUsers.map((user) => user.Id));
    }
  };

  // Bulk unassign selected users
  const handleBulkUnassign = async () => {
    if (selectedUsersToUnassign.length === 0) {
      alert("Please select users to unassign");
      return;
    }

    if (!window.confirm(`Are you sure you want to unassign ${selectedUsersToUnassign.length} user(s) from the diet plan?`)) return;

    try {
      setBulkUnassignLoading(true);

      // Process unassignments sequentially
      const results = [];
      for (const userId of selectedUsersToUnassign) {
        try {
          const response = await fetch(
            `https://flow108.coinagesoft.com/api/AdminDietPlan/unassignplans/${userId}`,
            {
              method: "DELETE",
              headers: {
                accept: "*/*",
              },
            }
          );

          if (!response.ok) throw new Error("Failed to unassign user");

          const result = await response.json();
          if (result.Status) {
            results.push({ userId, success: true, message: result.Message });
          } else {
            results.push({ userId, success: false, message: result.Message });
          }
        } catch (err) {
          results.push({ userId, success: false, message: err.message });
        }
      }

      // Count successful unassignments
      const successfulUnassignments = results.filter(r => r.success).length;

      if (successfulUnassignments > 0) {
        alert(`${successfulUnassignments} user(s) unassigned successfully`);

        // Remove successfully unassigned users from the state
        const successfulUserIds = results.filter(r => r.success).map(r => r.userId);
        setAssignedUsers((prevUsers) =>
          prevUsers.filter(user => !successfulUserIds.includes(user.Id))
        );

        // Clear selections
        setSelectedUsersToUnassign([]);

        // Refresh the assigned users list from server to ensure consistency
        await fetchAssignedUsers();
      } else {
        alert("Failed to unassign any users");
      }
    } catch (err) {
      console.error("Error in bulk unassignment:", err);
      alert("Error during bulk unassignment: " + err.message);
    } finally {
      setBulkUnassignLoading(false);
    }
  };
  const getInitials = (name = "") => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
      setMealFormData({
        MealType: "",
        Features: "",
        Calories: 0,
        Fats: 0,
        Carbs: 0,
        Protein: 0,
      });
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
            // Nutrition data should come from the recipe itself, not manual input
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

  // Edit meal functionality
  const openEditMealModal = (meal) => {
    setEditingMeal(meal);
    setEditMealFormData({
      MealType: meal.MealType || "",
      Features: meal.Features || "",
      Calories: meal.Calories || 0,
      Fats: meal.Fats || 0,
      Carbs: meal.Carbs || 0,
      Protein: meal.Protein || 0,
    });
    setShowEditMealModal(true);
    setEditMealError(null);
  };

  const closeEditMealModal = () => {
    setShowEditMealModal(false);
    setEditingMeal(null);
    setEditMealFormData({
      MealType: "",
      Features: "",
      Calories: 0,
      Fats: 0,
      Carbs: 0,
      Protein: 0,
    });
    setEditMealError(null);
  };

  const handleEditMealFormChange = (e) => {
    const { name, value } = e.target;
    setEditMealFormData((prev) => ({ ...prev, [name]: value }));
  };

  const editMeal = async (e) => {
    e.preventDefault();
    try {
      setEditMealLoading(true);
      setEditMealError(null);

      console.log("Sending update data:", editMealFormData);

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/meals/${editingMeal.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editMealFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(
          `Failed to update meal: ${response.status} - ${errorData}`
        );
      }

      const result = await response.json();
      console.log("Update response:", result);

      if (result.Status) {
        alert("Meal updated successfully!");

        // Try to fetch the updated meal data directly
        try {
          const mealResponse = await fetch(
            `https://flow108.coinagesoft.com/api/meals/${editingMeal.Id}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            console.log("Updated meal data:", mealData);

            // Update the specific meal in the state
            setMeals((prevMeals) =>
              prevMeals.map((meal) =>
                meal.Id === editingMeal.Id
                  ? { ...meal, ...editMealFormData }
                  : meal
              )
            );
          }
        } catch (fetchError) {
          console.log(
            "Could not fetch updated meal data, falling back to full refresh"
          );
          // Fall back to full refresh
          await fetchDietPlanDetails();
        }

        closeEditMealModal();
      } else {
        throw new Error(result.Message || "Failed to update meal");
      }
    } catch (err) {
      console.error("Error updating meal:", err);
      setEditMealError(err.message || "Failed to update meal");
    } finally {
      setEditMealLoading(false);
    }
  };

  // Get nutrition from meal data instead of calculating from recipes
  const getMealNutrition = (meal) => {
    return {
      calories: meal.Calories || 0,
      fats: meal.Fats || 0,
      carbs: meal.Carbs || 0,
      protein: meal.Protein || 0,
    };
  };

  const deleteMeal = async (mealId) => {
    if (confirm("Are you sure you want to delete this meal?")) {
      try {
        const response = await fetch(
          `https://flow108.coinagesoft.com/api/AdminDietPlan/meals/delete/${mealId}`,
          {
            method: "DELETE",
            headers: {
              accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete meal");
        }

        const result = await response.json();
        if (result.Status) {
          alert(result.Message);
          fetchDietPlanDetails(); // Refresh the meal list
        } else {
          throw new Error(result.Message);
        }
      } catch (err) {
        console.error("Error deleting meal:", err);
        alert(err.message || "Failed to delete meal");
      }
    }
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
                  className="btn btn-success me-2"
                  onClick={() => setShowAssignmentModal(true)}
                >
                  <i className="bi bi-person-plus"></i> Assign User
                </button>
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
                    <p>
                      <strong>Assigned Users:</strong>{" "}
                      <button
                        className="btn btn-link p-0"
                        onClick={openUsersModal}
                        disabled={usersLoading}
                      >
                        {usersLoading
                          ? "Loading..."
                          : `${assignedUsers.length} users`}
                      </button>
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
                      const nutrition = {
                        calories: meal.Calories || 0,
                        fats: meal.Fats || 0,
                        carbs: meal.Carbs || 0,
                        protein: meal.Protein || 0,
                      };
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
                                  {getMealNutrition(meal).calories} cal |{" "}
                                  {getMealNutrition(meal).protein}g protein |{" "}
                                  {getMealNutrition(meal).fats}g fats |{" "}
                                  {getMealNutrition(meal).carbs}g carbs
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
                                    <button
                                      className="btn btn-sm btn-warning ms-2"
                                      onClick={() => openEditMealModal(meal)}
                                    >
                                      Edit Meal
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger ms-2"
                                      onClick={() => deleteMeal(meal.Id)}
                                    >
                                      Delete Meal
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
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Calories" className="form-label">
                          Calories
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Calories"
                          name="Calories"
                          placeholder="Enter calories"
                          min="0"
                          value={mealFormData.Calories}
                          onChange={handleMealFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Fats" className="form-label">
                          Fats (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Fats"
                          name="Fats"
                          placeholder="Enter fats"
                          min="0"
                          value={mealFormData.Fats}
                          onChange={handleMealFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Carbs" className="form-label">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Carbs"
                          name="Carbs"
                          placeholder="Enter carbs"
                          min="0"
                          value={mealFormData.Carbs}
                          onChange={handleMealFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="Protein" className="form-label">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Protein"
                          name="Protein"
                          placeholder="Enter protein"
                          min="0"
                          value={mealFormData.Protein}
                          onChange={handleMealFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
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
        {/* Users Assigned Modal */}
        {showUsersModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Users Assigned to {dietPlan.Name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeUsersModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {usersLoading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading assigned users...</p>
                    </div>
                  ) : assignedUsers.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={selectedUsersToUnassign.length === assignedUsers.length && assignedUsers.length > 0}
                                onChange={handleSelectAll}
                              />
                            </th>
                            <th>User</th>
                            <th>Assigned Date</th>
                            {/* <th>Status</th> */}
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedUsers.map((user) => (
                            <tr key={user.Id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedUsersToUnassign.includes(user.Id)}
                                  onChange={() => handleUserSelection(user.Id)}
                                />
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  {user.ProfilePictureUrl ? (
                                    <img
                                      src={user.ProfilePictureUrl}
                                      alt={user.Name}
                                      className="rounded-circle me-2"
                                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                      onError={(e) => {
                                        // if image fails to load → fallback to initials
                                        e.target.style.display = "none";
                                        const fallback = document.createElement("div");
                                        fallback.className =
                                          "rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2";
                                        fallback.style.width = "32px";
                                        fallback.style.height = "32px";
                                        fallback.style.fontWeight = "bold";
                                        fallback.innerText = getInitials(user.Name);
                                        e.target.parentNode.prepend(fallback);
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle text-white d-flex align-items-center justify-content-center me-2"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        fontWeight: "bold",
                                        backgroundColor: getColorFromName(user.Name),
                                      }}
                                    >
                                      {getInitials(user.Name)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="fw-semibold">{user.Name}</div>
                                    <small className="text-muted">Email: {user.Email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {user.SignupDate && !isNaN(new Date(user.SignupDate).getTime())
                                  ? new Date(user.SignupDate).toLocaleDateString()
                                  : 'Not Available'}
                              </td>
                              {/* <td>
                                <span className={`badge bg-${user.Status === 'Active' ? 'success' : user.Status === 'Completed' ? 'primary' : 'secondary'}`}>
                                  {user.Status || 'Active'}
                                </span>
                              </td> */}
                              <td>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleUnassignUser(user.Id)}
                                  disabled={unassignLoading === user.Id}
                                >
                                  {unassignLoading === user.Id ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                      Unassigning...
                                    </>
                                  ) : (
                                    "Unassign"
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="ri-user-unfollow-line" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2">No users assigned to this diet plan yet.</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  {selectedUsersToUnassign.length > 0 && (
                    <button
                      className="btn btn-danger"
                      onClick={handleBulkUnassign}
                      disabled={bulkUnassignLoading}
                    >
                      {bulkUnassignLoading ? "Unassigning..." : `Unassign ${selectedUsersToUnassign.length} User(s)`}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeUsersModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Meal Modal */}
        {showEditMealModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Meal</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEditMealModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {editMealError && (
                    <div className="alert alert-danger" role="alert">
                      {editMealError}
                    </div>
                  )}
                  <form onSubmit={editMeal}>
                    <div className="mb-3">
                      <label htmlFor="editMealType" className="form-label">
                        Meal Type
                      </label>
                      <select
                        className="form-select"
                        id="editMealType"
                        name="MealType"
                        value={editMealFormData.MealType}
                        onChange={handleEditMealFormChange}
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
                      <label htmlFor="editFeatures" className="form-label">
                        Features
                      </label>
                      <textarea
                        className="form-control"
                        id="editFeatures"
                        name="Features"
                        rows="3"
                        placeholder="Enter meal features (e.g., high protein, low carb, vegan)"
                        value={editMealFormData.Features}
                        onChange={handleEditMealFormChange}
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="editCalories" className="form-label">
                          Calories
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="editCalories"
                          name="Calories"
                          placeholder="Enter calories"
                          min="0"
                          value={editMealFormData.Calories}
                          onChange={handleEditMealFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="editFats" className="form-label">
                          Fats (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="editFats"
                          name="Fats"
                          placeholder="Enter fats"
                          min="0"
                          value={editMealFormData.Fats}
                          onChange={handleEditMealFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="editCarbs" className="form-label">
                          Carbs (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="editCarbs"
                          name="Carbs"
                          placeholder="Enter carbs"
                          min="0"
                          value={editMealFormData.Carbs}
                          onChange={handleEditMealFormChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="editProtein" className="form-label">
                          Protein (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="editProtein"
                          name="Protein"
                          placeholder="Enter protein"
                          min="0"
                          value={editMealFormData.Protein}
                          onChange={handleEditMealFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeEditMealModal}
                        disabled={editMealLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={editMealLoading}
                      >
                        {editMealLoading ? "Updating..." : "Update Meal"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diet Plan Assignment Modal */}
        {showAssignmentModal && (
          <DietPlanAssignmentModal
            isOpen={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            planId={planId}
            planName={dietPlan?.Name}
            onAssignmentSuccess={fetchAssignedUsers}
          />
        )}
      </div>
    </div>
  );
}
