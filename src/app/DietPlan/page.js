"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUserCount, fetchForumPosts, fetchQuestions } from "../utils/api";
import DietPlanAssignmentModal from "./DietPlanAssignmentModal";
import { useAlert } from "../utils/alertcontxt";
import { useConfirm } from "../utils/confirmContext";
import { dietPlanApi } from "../utils/apiClient";
import * as XLSX from "xlsx";

export default function Page() {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    selectedMeals: [],
    Meals: [],
  });

  const availableMeals = ["Breakfast", "Lunch", "Snack", "Dinner"];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dietPlans, setDietPlans] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const BASE_MEALS = ["Breakfast", "Lunch", "Snack", "Dinner"];
  const EXTRA_MEALS = ["Pre-workout", "Post-workout"];

  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
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
  const [addMealSuccess, setAddMealSuccess] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanForAssignment, setSelectedPlanForAssignment] =
    useState(null);
  const [modalMode, setModalMode] = useState("assign");

  const [showAddModal, setShowAddModal] = useState(false);

  const [availableAdditionalMeals, setAvailableAdditionalMeals] = useState([]);

  const [stats, setStats] = useState({
    totalPlans: 0,
    totalMeals: 0,
    avgCalories: 0,
    popularMealType: "None",
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const calculateDietStats = (plans) => {
    if (!plans || plans.length === 0) {
      return {
        totalPlans: 0,
        totalMeals: 0,
        avgCalories: 0,
        popularMealType: "None",
      };
    }

    const totalPlans = plans.length;
    const totalMeals = plans.reduce(
      (sum, plan) => sum + (plan.Meals?.length || 0),
      0
    );

    const totalCalories = plans.reduce((sum, plan) => {
      const planCalories = Number(plan.TotalCalories) || 0;
      return sum + (planCalories > 0 ? planCalories : 0);
    }, 0);

    const avgCalories =
      totalPlans > 0 ? Math.round(totalCalories / totalPlans) : 0;

    const mealTypeCounts = {};
    plans.forEach((plan) => {
      if (plan.Meals && Array.isArray(plan.Meals)) {
        plan.Meals.forEach((meal) => {
          // using Name as the category
          if (meal.Name) {
            mealTypeCounts[meal.Name] = (mealTypeCounts[meal.Name] || 0) + 1;
          }
        });
      }
    });

    let popularMealType = "None";
    let maxCount = 0;
    Object.entries(mealTypeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        popularMealType = type;
      }
    });

    return {
      totalPlans,
      totalMeals,
      avgCalories,
      popularMealType,
    };
  };

  useEffect(() => {
    if (dietPlans.length > 0) {
      const newStats = calculateDietStats(dietPlans);
      setStats(newStats);
      setStatsLoading(false);
    } else {
      setStats({
        totalPlans: 0,
        totalMeals: 0,
        avgCalories: 0,
        popularMealType: "None",
      });
      setStatsLoading(false);
    }
  }, [dietPlans]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Meals: (prev.selectedMeals || []).map((meal) => ({
        Name: meal,
      })),
    }));
  }, [formData.selectedMeals]);

  const fetchDietPlans = async () => {
    try {
      setApiLoading(true);
      setApiError(null);

      const response = await fetch(
        "https://flow108.coinagesoft.com/api/AdminDietPlan"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.Status && data.Data && Array.isArray(data.Data)) {
        let plansWithUserCounts = [];
        try {
          const usersResponse = await fetch(
            "https://flow108.coinagesoft.com/api/AdminDietPlan/with-users"
          );
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            if (usersData.Status && usersData.Data) {
              const plansWithUsers = usersData.Data;
              const userCountMap = {};
              plansWithUsers.forEach((plan) => {
                userCountMap[plan.DietPlanId] = plan.AssignedUsers
                  ? plan.AssignedUsers.length
                  : 0;
              });
              plansWithUserCounts = data.Data.map((plan) => {
                const planId = plan.Id || plan.id;
                return {
                  ...plan,
                  userCount: userCountMap[planId] || 0,
                };
              });
            } else {
              throw new Error("Invalid users data structure");
            }
          } else {
            throw new Error("Failed to fetch users data");
          }
        } catch (err) {
          console.error(
            "Error fetching assigned users, falling back to individual calls:",
            err
          );
          plansWithUserCounts = await Promise.all(
            data.Data.map(async (plan) => {
              try {
                const userCount = await fetchUserCountForPlan(
                  plan.Id || plan.id
                );
                return {
                  ...plan,
                  userCount: userCount,
                };
              } catch (err) {
                console.error(
                  `Error fetching user count for plan ${plan.Id}:`,
                  err
                );
                return {
                  ...plan,
                  userCount: 0,
                };
              }
            })
          );
        }

        setDietPlans(plansWithUserCounts);
      } else {
        throw new Error(data.Message || "Failed to fetch diet plans");
      }
    } catch (err) {
      console.error("Error fetching diet plans:", err);
      setApiError(err.message || "Failed to fetch diet plans");
    } finally {
      setApiLoading(false);
    }
  };

  const fetchUserCountForPlan = async (planId) => {
    try {
      const { fetchUserCountForPlan } = await import("../utils/apiClient");
      return await fetchUserCountForPlan(planId);
    } catch (err) {
      console.error("Error fetching user count for plan:", err);
      return 0;
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleMealSelection = (meal) => {
    setFormData((prev) => {
      const isSelected = (prev.selectedMeals || []).includes(meal);
      if (isSelected) {
        return {
          ...prev,
          selectedMeals: (prev.selectedMeals || []).filter((m) => m !== meal),
        };
      } else {
        return {
          ...prev,
          selectedMeals: [...(prev.selectedMeals || []), meal],
        };
      }
    });
  };

  const handleMealChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      Meals: prev.Meals.map((meal, i) =>
        i === index
          ? {
              ...meal,
              [field]: [
                "RecommendedCalories",
                "RecommendedProtein",
                "RecommendedCarbs",
                "RecommendedFats",
              ].includes(field)
                ? parseInt(value) || 0
                : value,
            }
          : meal
      ),
    }));
  };

  const addMeal = () => {
    setFormData((prev) => ({
      ...prev,
      Meals: [
        ...prev.Meals,
        {
          Name: "",
          RecommendedCalories: 0,
          RecommendedProtein: 0,
          RecommendedCarbs: 0,
          RecommendedFats: 0,
        },
      ],
    }));
  };

  const removeMeal = (index) => {
    setFormData((prev) => ({
      ...prev,
      Meals: prev.Meals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const validMeals = formData.Meals.filter((meal) => meal.Name.trim());

    if (validMeals.length === 0) {
      setError("Please select at least one meal.");
      setLoading(false);
      return;
    }

    // Check for duplicate meal types
    const mealNames = validMeals.map((meal) => meal.Name);
    const uniqueMealNames = new Set(mealNames);
    if (mealNames.length !== uniqueMealNames.size) {
      setError(
        "Meal type already exists. Please ensure all meal types are unique."
      );
      setLoading(false);
      return;
    }

    const mealsPayload = validMeals.map((meal) => ({
      Name: meal.Name,
    }));

    const payload = {
      Name: formData.Name,
      Description: formData.Description,
      Meals: mealsPayload,
    };

    try {
      const { dietPlanApi } = await import("../utils/apiClient");
      const result = await dietPlanApi.create(payload);

      if (result.Status) {
        setSuccess(true);
        setFormData({
          Name: "",
          Description: "",
          selectedMeals: [],
          Meals: [],
        });
        fetchDietPlans();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(result.Message || "Failed to create diet plan");
      }
    } catch (err) {
      setError(err.message || "Failed to create diet plan");
    } finally {
      setLoading(false);
    }
  };

  const addMealToPlan = async (planId, mealData) => {
    try {
      setAddMealLoading(true);
      setAddMealError(null);

      const { dietPlanApi } = await import("../utils/apiClient");
      const result = await dietPlanApi.addMeal(planId, mealData);

      setAddMealSuccess(true);
      fetchDietPlans();

      setTimeout(() => {
        setAddMealSuccess(false);
        setShowAddMealModal(false);
        setMealFormData({
          MealType: "",
          Features: "",
          Calories: 0,
          Fats: 0,
          Carbs: 0,
          Protein: 0,
        });
      }, 3000);

      return result;
    } catch (err) {
      setAddMealError(err.message || "Failed to add meal to plan");
    } finally {
      setAddMealLoading(false);
    }
  };

  const handleMealFormChange = (e) => {
    const { name, value } = e.target;
    setMealFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleMealSubmit = async (e) => {
  e.preventDefault();

  const plan = dietPlans.find(p => p.Id === selectedPlanId);
  const existingMealTypes =
    plan?.Meals?.map(meal => meal.Name) || [];

  if (existingMealTypes.includes(mealFormData.MealType)) {
    setAddMealError("This meal type already exists in the plan.");
    return;
  }

  if (!EXTRA_MEALS.includes(mealFormData.MealType)) {
    setAddMealError("This meal type cannot be added manually.");
    return;
  }

  const mealData = {
    MealType: mealFormData.MealType,
    Features: mealFormData.Features,
    Calories: mealFormData.Calories,
    Fats: mealFormData.Fats,
    Carbs: mealFormData.Carbs,
    Protein: mealFormData.Protein,
  };

  await addMealToPlan(selectedPlanId, mealData);
};


 const openAddMealModal = (planId) => {
  const plan = dietPlans.find(p => p.Id === planId);

  // Meals already present in plan
  const existingMealTypes =
    plan?.Meals?.map(meal => meal.Name) || [];

  // Meals selected during plan creation (checkbox meals)
  const baseMealTypes =
    plan?.Meals
      ?.map(meal => meal.Name)
      .filter(name => BASE_MEALS.includes(name)) || [];

  // Allow ONLY extra meals that are not already used
  const allowedMeals = EXTRA_MEALS.filter(
    meal =>
      !existingMealTypes.includes(meal) &&
      !baseMealTypes.includes(meal)
  );

  setAvailableAdditionalMeals(allowedMeals);
  setSelectedPlanId(planId);
  setShowAddMealModal(true);
  setMealFormData({
    MealType: "",
    Features: "",
    Calories: 0,
    Fats: 0,
    Carbs: 0,
    Protein: 0,
  });
  setAddMealError(null);
  setAddMealSuccess(false);
};


  const openAssignModal = async (plan, mode = "assign") => {
    setSelectedPlanForAssignment(plan);
    setModalMode(mode);
    setShowAssignModal(true);
  };

  const handleDeletePlan = async (planId) => {
    console.log("🗑️ handleDeletePlan called with planId:", planId);

    // Use Promise to handle the confirm dialog
    const confirmed = await new Promise((resolve) => {
      showConfirm(
        "Are you sure you want to delete this diet plan? This action cannot be undone.",
        () => resolve(true), // onConfirm
        () => resolve(false) // onCancel
      );
    });

    console.log("🗑️ Confirmation result:", confirmed);

    if (!confirmed) {
      console.log("🗑️ User cancelled deletion");
      return;
    }

    try {
      console.log("🗑️ Starting delete process...");
      setDeleteLoading(true);
      setDeleteError(null);

      console.log("🗑️ Calling dietPlanApi.delete...");
      const result = await dietPlanApi.delete(planId);
      console.log("🗑️ API result:", result);

      if (result && result.Status === true) {
        console.log("🗑️ Delete successful, updating UI...");
        // Optimistically update UI
        setDietPlans((prevPlans) =>
          prevPlans.filter((plan) => plan.Id !== planId)
        );
        console.log("🗑️ Showing success alert...");
        alert("Diet plan deleted successfully.");
        // Refresh the list to ensure consistency
        console.log("🗑️ Refreshing diet plans list...");
        fetchDietPlans();
      } else {
        console.log("🗑️ Delete failed, result:", result);
        setDeleteError(result?.Message || "Failed to delete diet plan.");
      }
    } catch (err) {
      console.error("🗑️ Error deleting diet plan:", err);
      setDeleteError(err.message || "Failed to delete diet plan");
    } finally {
      console.log("🗑️ Setting loading to false");
      setDeleteLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({
      ...plan,
      Meals: plan.Meals?.map((meal) => ({
        Name: meal.Name || "",
        RecommendedCalories: meal.RecommendedCalories || 0,
        RecommendedProtein: meal.RecommendedProtein || 0,
        RecommendedCarbs: meal.RecommendedCarbs || 0,
        RecommendedFats: meal.RecommendedFats || 0,
      })) || [
        {
          Name: "",
          RecommendedCalories: 0,
          RecommendedProtein: 0,
          RecommendedCarbs: 0,
          RecommendedFats: 0,
        },
      ],
    });
    setShowEditModal(true);
    setEditError(null);
    setEditSuccess(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingPlan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditMealChange = (index, field, value) => {
    setEditingPlan((prev) => ({
      ...prev,
      Meals: prev.Meals.map((meal, i) =>
        i === index
          ? {
              ...meal,
              [field]: [
                "RecommendedCalories",
                "RecommendedProtein",
                "RecommendedCarbs",
                "RecommendedFats",
              ].includes(field)
                ? parseInt(value) || 0
                : value,
            }
          : meal
      ),
    }));
  };

  const addEditMeal = () => {
    setEditingPlan((prev) => ({
      ...prev,
      Meals: [
        ...prev.Meals,
        {
          Name: "",
          RecommendedCalories: 0,
          RecommendedProtein: 0,
          RecommendedCarbs: 0,
          RecommendedFats: 0,
        },
      ],
    }));
  };

  const removeEditMeal = (index) => {
    setEditingPlan((prev) => ({
      ...prev,
      Meals: prev.Meals.filter((_, i) => i !== index),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    const validMeals = editingPlan.Meals.filter((meal) => meal.Name.trim());

    if (validMeals.length === 0) {
      setEditError("Please add at least one meal with a name.");
      setEditLoading(false);
      return;
    }

    // Check for duplicate meal types
    const mealNames = validMeals.map((meal) => meal.Name);
    const uniqueMealNames = new Set(mealNames);
    if (mealNames.length !== uniqueMealNames.size) {
      setEditError(
        "Meal type already exists. Please ensure all meal types are unique."
      );
      setEditLoading(false);
      return;
    }

    const mealsPayload = validMeals.map((meal) => ({
      Name: meal.Name,
    }));

    const payload = {
      Id: editingPlan.Id,
      Name: editingPlan.Name,
      Description: editingPlan.Description,
      Meals: mealsPayload,
    };

    try {
      const { dietPlanApi } = await import("../utils/apiClient");
      const result = await dietPlanApi.update(payload);

      alert("Diet plan updated successfully!");
      fetchDietPlans();

      setShowEditModal(false);
      setEditingPlan(null);
      setEditSuccess(false);
    } catch (err) {
      setEditError(err.message || "Failed to update diet plan");
    } finally {
      setEditLoading(false);
    }
  };

  const filteredPlans = dietPlans.filter(
    (plan) =>
      (plan.Name && plan.Name.toLowerCase().includes(search.toLowerCase())) ||
      (plan.Description &&
        plan.Description.toLowerCase().includes(search.toLowerCase()))
  );

  const getMealTypes = (meals) => {
    if (!meals || !Array.isArray(meals)) return [];

    const mealTypes = meals.map((meal) => meal.Name).filter(Boolean);
    return [...new Set(mealTypes)];
  };

  const exportMealsToExcel = () => {
    // Collect all meals from all diet plans
    const allMeals = [];

    dietPlans.forEach((plan) => {
      if (plan.Meals && Array.isArray(plan.Meals)) {
        plan.Meals.forEach((meal) => {
          allMeals.push({
            "Diet Plan Name": plan.Name || "Unnamed Plan",
            "Meal Type": meal.Name || "",
            Calories: meal.RecommendedCalories || 0,
            "Protein (g)": meal.RecommendedProtein || 0,
            "Carbs (g)": meal.RecommendedCarbs || 0,
            "Fats (g)": meal.RecommendedFats || 0,
            "Plan Description": plan.Description || "",
          });
        });
      }
    });

    if (allMeals.length === 0) {
      showAlert("No meals found to export.", "warning");
      return;
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(allMeals);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meals");

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `diet_plan_meals_${date}.xlsx`;

    // Write workbook to array buffer
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Create blob and download
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert(
      `Successfully exported ${allMeals.length} meals to Excel.`,
      "success"
    );
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Diet Plan Management</h4>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                Name: "",
                Description: "",
                selectedMeals: [],
                Meals: [],
              });
              setError(null);
              setSuccess(false);
              setShowAddModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Plan
          </button>
        </div>
        <div className="row mb-6 g-6">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
                  <div className={`card card-border-shadow-primary h-100`}>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span className="avatar-initial rounded-3 bg-label-primary">
                            <i className="tf-icons ri-loader-2-line ri-24px"></i>
                          </span>
                        </div>
                        <h4 className="mb-0">
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </h4>
                      </div>
                      <h6 className="mb-0 fw-normal">Loading...</h6>
                      <p className="mb-0">
                        <span className="me-1 fw-medium">0%</span>
                        <small className="text-muted">than last week</small>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            : [
                {
                  title: "Total Plans",
                  count: stats.totalPlans,
                  color: "primary",
                  icon: "ri-restaurant-line",
                },
                {
                  title: "Total Meals",
                  count: stats.totalMeals,
                  color: "warning",
                  icon: "ri-bowl-line",
                },
                {
                  title: "Avg Calories",
                  count: stats.avgCalories,
                  color: "danger",
                  icon: "ri-fire-line",
                },
                {
                  title: "Popular Meal",
                  count: stats.popularMealType,
                  color: "info",
                  icon: "ri-star-line",
                },
              ].map((stat, index) => (
                <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
                  <div
                    className={`card card-border-shadow-${stat.color} h-100`}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span
                            className={`avatar-initial rounded-3 bg-label-${stat.color}`}
                          >
                            <i className={`tf-icons ${stat.icon} ri-24px`}></i>
                          </span>
                        </div>
                        <h4 className="mb-0">{stat.count}</h4>
                      </div>
                      <h6 className="mb-0 fw-normal">{stat.title}</h6>
                    </div>
                  </div>
                </div>
              ))}

          {/* Diet Plans List */}
          <div className="col-md-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0">Diet Plans</h5>
                <div className="d-flex gap-2">
                  {/* <button
                    className="btn btn-success btn-sm"
                    onClick={exportMealsToExcel}
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                    Export Meals
                  </button> */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search plans..."
                    style={{ maxWidth: 250, fontSize: 14 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="card-body">
                {apiLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading diet plans...</p>
                  </div>
                )}

                {apiError && (
                  <div className="alert alert-danger" role="alert">
                    {apiError}
                  </div>
                )}

                {deleteSuccess && (
                  <div className="alert alert-success" role="alert">
                    {deleteSuccess}
                  </div>
                )}
                {deleteError && (
                  <div className="alert alert-danger" role="alert">
                    {deleteError}
                  </div>
                )}

                {!apiLoading && !apiError && filteredPlans.length === 0 && (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-inbox display-1 text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-2">No Diet Plans Found</h5>
                    <p className="text-muted mb-4">
                      {dietPlans.length === 0
                        ? "There are no diet plans available yet. Create your first diet plan to get started!"
                        : "No diet plans match your search criteria. Try adjusting your search terms."}
                    </p>
                    {dietPlans.length === 0 && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setFormData({
                            Name: "",
                            Description: "",
                            Meals: [
                              {
                                Name: "",
                                RecommendedCalories: 0,
                                RecommendedProtein: 0,
                                RecommendedCarbs: 0,
                                RecommendedFats: 0,
                              },
                            ],
                          });
                          setError(null);
                          setSuccess(false);
                          setShowAddModal(true);
                        }}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create First Diet Plan
                      </button>
                    )}
                  </div>
                )}

                <div className="row">
                  {!apiLoading &&
                    filteredPlans.map((plan) => (
                      <div className="col-12 col-sm-6 mb-3" key={plan.Id}>
                        <div className="card h-100 my-2">
                          <div className="card-body row widget-separator">
                            <div className="col-sm-5 border-end">
                              <h6 className="mb-2">
                                {plan.Name || "Unnamed Plan"}
                              </h6>
                              <p className="mb-2">
                                {plan.Description || "No description available"}
                              </p>
                              <div className="mb-2">
                                <strong>Meals:</strong>
                                <ul className="list-unstyled small">
                                  {plan.Meals?.map((meal, idx) => (
                                    <li key={idx}>
                                      {meal.Name}: {meal.RecommendedCalories}{" "}
                                      cal
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {getMealTypes(plan.Meals).map((mealType) => (
                                <span
                                  key={mealType}
                                  className="badge bg-label-primary rounded-pill me-2 mb-2"
                                >
                                  {mealType}
                                </span>
                              ))}

                              <p className="my-2 d-flex align-items-center gap-2">
                                <Link
                                  href={`/DietPlan/${plan.Id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  View Plan
                                </Link>
                              </p>
                              <hr className="d-sm-none" />
                            </div>
                            <div className="col-sm-7 g-2 text-nowrap d-flex flex-column justify-content-between px-6 gap-3">
                              <div className="d-flex flex-column gap-2">
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-bowl-fill me-2 text-primary"></i>
                                  <span className="fw-medium">
                                    Total Meals: {plan.Meals?.length || 0}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-fire me-2 text-danger"></i>
                                  <span className="fw-medium">
                                    Total Calories: {plan.TotalCalories || 0}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-people me-2 text-info"></i>
                                  <span className="fw-medium">
                                    Assigned Users: {plan.userCount || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex flex-column flex-lg-row justify-content-center gap-2">
                                <button
                                  className="btn btn-outline-primary btn-small"
                                  onClick={() => openAssignModal(plan)}
                                >
                                  <i
                                    className="bi bi-person-check"
                                    style={{ fontSize: 20 }}
                                  ></i>
                                </button>
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleEditPlan(plan)}
                                >
                                  <i className="bi bi-pencil-fill"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger delete-btn"
                                  title="Delete"
                                  onClick={() => handleDeletePlan(plan.Id)}
                                  disabled={deleteLoading}
                                >
                                  <i className="bi bi-trash-fill"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    <h5 className="modal-title">Add Meal to Diet Plan</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddMealModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {addMealSuccess && (
                      <div className="alert alert-success" role="alert">
                        Meal added successfully!
                      </div>
                    )}
                    {addMealError && (
                      <div className="alert alert-danger" role="alert">
                        {addMealError}
                      </div>
                    )}
                    <form onSubmit={handleMealSubmit}>
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
                          {availableAdditionalMeals.map((meal) => (
                            <option key={meal} value={meal}>
                              {meal}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="Calories" className="form-label">
                          Calories
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Calories"
                          name="Calories"
                          placeholder="Enter calories"
                          required
                          min="0"
                          value={mealFormData.Calories}
                          onChange={handleMealFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="Fats" className="form-label">
                          Fats
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Fats"
                          name="Fats"
                          placeholder="Enter fats"
                          required
                          min="0"
                          value={mealFormData.Fats}
                          onChange={handleMealFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="Carbs" className="form-label">
                          Carbs
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Carbs"
                          name="Carbs"
                          placeholder="Enter carbs"
                          required
                          min="0"
                          value={mealFormData.Carbs}
                          onChange={handleMealFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="Protein" className="form-label">
                          Protein
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="Protein"
                          name="Protein"
                          placeholder="Enter protein"
                          required
                          min="0"
                          value={mealFormData.Protein}
                          onChange={handleMealFormChange}
                        />
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

          {/* Assign Modal */}
          {showAssignModal && selectedPlanForAssignment && (
            <DietPlanAssignmentModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              planId={selectedPlanForAssignment.Id}
              onAssignmentSuccess={() => {
                fetchDietPlans();
                setShowAssignModal(false);
              }}
              mode={modalMode}
            />
          )}

          {/* Edit Modal */}
          {showEditModal && editingPlan && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Diet Plan</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingPlan(null);
                      }}
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    {editSuccess && (
                      <div className="alert alert-success" role="alert">
                        Diet plan updated successfully!
                      </div>
                    )}
                    {editError && (
                      <div className="alert alert-danger" role="alert">
                        {editError}
                      </div>
                    )}
                    <form onSubmit={handleEditSubmit}>
                      <div className="mb-3">
                        <label htmlFor="editName" className="form-label">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editName"
                          name="Name"
                          required
                          value={editingPlan.Name}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="editDescription" className="form-label">
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          id="editDescription"
                          name="Description"
                          rows="3"
                          required
                          value={editingPlan.Description}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      {editingPlan.Meals?.map((meal, index) => (
                        <div key={index} className="mb-3 border rounded p-3">
                          <div className="row g-2 mb-2">
                            <div className="col-md-10">
                              <label className="form-label">Meal Name</label>
                              <select
                                className="form-select"
                                value={meal.Name}
                                onChange={(e) =>
                                  handleEditMealChange(
                                    index,
                                    "Name",
                                    e.target.value
                                  )
                                }
                                required
                              >
                                <option value="">Select meal</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Snack">Snack</option>
                                <option value="Dinner">Dinner</option>
                              </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                              <label className="form-label">&nbsp;</label>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm w-100"
                                onClick={() => removeEditMeal(index)}
                                disabled={editingPlan.Meals.length === 1}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={addEditMeal}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Add Meal
                      </button>
                      <div className="modal-footer mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingPlan(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={editLoading}
                        >
                          {editLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Diet Plan</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body" style={{ fontSize: "14px" }}>
                    {success && (
                      <div className="alert alert-success" role="alert">
                        Diet plan created successfully!
                      </div>
                    )}
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="Name"
                          placeholder="Enter plan name"
                          required
                          value={formData.Name}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="Description" className="form-label">
                          Description
                        </label>
                        <textarea
                          className="form-control"
                          id="Description"
                          rows="3"
                          placeholder="Add a brief description"
                          required
                          value={formData.Description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Select Meals</label>
                        <div>
                          {availableMeals.map((meal) => (
                            <div key={meal} className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`meal-${meal}`}
                                checked={(
                                  formData.selectedMeals || []
                                ).includes(meal)}
                                onChange={() => handleMealSelection(meal)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`meal-${meal}`}
                              >
                                {meal}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Plan"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
