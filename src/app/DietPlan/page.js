"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUserCount, fetchForumPosts, fetchQuestions } from "../utils/api";

export default function Page() {
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Duration: "",
    TotalCalories: 0,
    meals: {
      Breakfast: false,
      Lunch: false,
      Dinner: false,
      Snacks: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dietPlans, setDietPlans] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [stats, setStats] = useState({
    totalPlans: 0,
    totalMeals: 0,
    avgCalories: 0,
    popularMealType: "None"
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch diet plans and calculate stats
  useEffect(() => {
    fetchDietPlans();
  }, []);

  // Calculate diet plan statistics from the fetched data
  const calculateDietStats = (plans) => {
    if (!plans || plans.length === 0) {
      return {
        totalPlans: 0,
        totalMeals: 0,
        avgCalories: 0,
        popularMealType: "None"
      };
    }

    const totalPlans = plans.length;
    const totalMeals = plans.reduce((sum, plan) => sum + (plan.Meals?.length || 0), 0);
    
    const totalCalories = plans.reduce((sum, plan) => {
      const planCalories = Number(plan.TotalCalories) || 0;
      return sum + (planCalories > 0 ? planCalories : 0);
    }, 0);
    
    const avgCalories = totalPlans > 0 ? Math.round(totalCalories / totalPlans) : 0;

    // Calculate most popular meal type
    const mealTypeCounts = {};
    plans.forEach(plan => {
      if (plan.Meals && Array.isArray(plan.Meals)) {
        plan.Meals.forEach(meal => {
          if (meal.MealType) {
            mealTypeCounts[meal.MealType] = (mealTypeCounts[meal.MealType] || 0) + 1;
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
      popularMealType
    };
  };

  // Update stats when dietPlans change
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
        popularMealType: "None"
      });
      setStatsLoading(false);
    }
  }, [dietPlans]);
  const calculateTotalNutrition = () => {
    return meals.reduce(
      (totals, meal) => {
        totals.calories += Number(meal.Calories) || 0;
        totals.fats += Number(meal.Fats) || 0;
        totals.carbs += Number(meal.Carbs) || 0;
        totals.protein += Number(meal.Protein) || 0;
        return totals;
      },
      { calories: 0, fats: 0, carbs: 0, protein: 0 }
    );
  };

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
      console.log("API Response:", data); // Debug log

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid API response format");
      }

      // Extract diet plans from response
      let plansData = [];

      if (data.Data && Array.isArray(data.Data)) {
        plansData = data.Data;
      } else if (data.data && Array.isArray(data.data.Data)) {
        plansData = data.data.Data;
      } else if (Array.isArray(data)) {
        plansData = data;
      } else {
        console.warn("Unexpected API response structure:", data);
        plansData = [];
      }

      // Validate each plan has required properties
      const validPlans = plansData.filter(
        (plan) =>
          plan &&
          typeof plan === "object" &&
          (plan.Id || plan.id) &&
          (plan.Name || plan.name || plan.Name === "")
      );

      console.log("Valid diet plans found:", validPlans.length);

      // Fetch user counts for each diet plan
      const plansWithUserCounts = await Promise.all(
        validPlans.map(async (plan) => {
          try {
            const userCount = await fetchUserCountForPlan(plan.Id || plan.id);
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

      setDietPlans(plansWithUserCounts);

      if (validPlans.length === 0 && plansData.length > 0) {
        console.warn("All plans filtered out due to invalid structure");
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
      // Use the optimized API client
      const { fetchUserCountForPlan } = await import("../utils/apiClient");
      return await fetchUserCountForPlan(planId);
    } catch (err) {
      console.error("Error fetching user count for plan:", err);
      return 0; // Graceful degradation
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: parseInt(value) || 0,
    }));
  };

  const handleCheckboxChange = (meal) => {
    setFormData((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: !prev.meals[meal],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const selectedMeals = Object.keys(formData.meals).filter(
      (key) => formData.meals[key]
    );

    const payload = {
      Name: formData.Name,
      Description: formData.Description,
      Duration: formData.Duration,
      TotalCalories: formData.TotalCalories,
    };

    try {
      const response = await fetch(
        "https://flow108.coinagesoft.com/api/AdminDietPlan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Diet plan created successfully:", result);
      setSuccess(true);

      // Reset form
      setFormData({
        Name: "",
        Description: "",
        Duration: "",
        TotalCalories: 0,
        meals: {
          Breakfast: false,
          Lunch: false,
          Dinner: false,
          Snacks: false,
        },
      });

      // Refresh the diet plans list
      fetchDietPlans();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error creating diet plan:", err);
      setError(err.message || "Failed to create diet plan");
    } finally {
      setLoading(false);
    }
  };

  // Add meal to diet plan
  const addMealToPlan = async (planId, mealData) => {
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
          body: JSON.stringify(mealData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Meal added successfully:", result);
      setAddMealSuccess(true);

      // Refresh the diet plans to show updated meals
      fetchDietPlans();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setAddMealSuccess(false);
        setShowAddMealModal(false);
        setMealFormData({ MealType: "", Features: "" });
      }, 3000);

      return result;
    } catch (err) {
      console.error("Error adding meal:", err);
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
    if (selectedPlanId) {
      const mealData = {
        MealType: mealFormData.MealType,
        Features: mealFormData.Features,
        Calories: mealFormData.Calories,
        Fats: mealFormData.Fats,
        Carbs: mealFormData.Carbs,
        Protein: mealFormData.Protein,
      };
      await addMealToPlan(selectedPlanId, mealData);
    }
  };
  const assignPlanToUser = async (userId) => {
    if (!selectedPlanForAssignment || !selectedPlanForAssignment.Id) {
      setAssignError("No plan selected for assignment.");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError(null);
      setAssignSuccess(false);

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/users/${userId}/dietplans/${selectedPlanForAssignment.Id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Assignment result:", result);

      if (result.status || result.Status) {
        setAssignSuccess(true);
      } else {
        throw new Error(
          result.message || result.Message || "Failed to assign diet plan."
        );
      }
    } catch (err) {
      console.error("Error assigning plan:", err);
      setAssignError(err.message || "Failed to assign diet plan");
    } finally {
      setAssignLoading(false);

      // Optional: Close modal after 2 seconds
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess(false);
      }, 2000);
    }
  };

  const openAddMealModal = (planId) => {
    setSelectedPlanId(planId);
    setShowAddMealModal(true);
    setMealFormData({ MealType: "", Features: "" });
    setAddMealError(null);
    setAddMealSuccess(false);
  };
  const openAssignModal = async (plan) => {
    setSelectedPlanForAssignment(plan);
    setShowAssignModal(true);
    setAssignError(null);
    setAssignSuccess(false);
    setUsers([]);

    try {
      setUsersLoading(true);
      setUsersError(null);

      const response = await fetch(
        "https://flow108.coinagesoft.com/api/AdminAccount/all-users"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // You can filter only approved users if needed here
      setUsers(result.Data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsersError("Failed to load users. Please try again later.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (
      !confirm(
        "Are you sure you want to delete this diet plan? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        // Remove the deleted plan from the state
        setDietPlans((prevPlans) =>
          prevPlans.filter((plan) => plan.Id !== planId)
        );

        // Set success message
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete diet plan");
      }
    } catch (err) {
      console.error("Error deleting diet plan:", err);
      setDeleteError(err.message || "Failed to delete diet plan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
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

  const handleEditFormNumberChange = (e) => {
    const { name, value } = e.target;
    setEditingPlan((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    const payload = {
      Name: editingPlan.Name,
      Description: editingPlan.Description,
      Duration: editingPlan.Duration,
      TotalCalories: editingPlan.TotalCalories,
    };

    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${editingPlan.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.Status) {
        // Show toast notification
        alert("Diet plan updated successfully!");

        // Refresh the diet plans list
        fetchDietPlans();

        // Close modal immediately after successful update
        setShowEditModal(false);
        setEditingPlan(null);
        setEditSuccess(false);
      } else {
        throw new Error(result.Message || "Failed to update diet plan");
      }
    } catch (err) {
      console.error("Error updating diet plan:", err);
      setEditError(err.message || "Failed to update diet plan");
    } finally {
      setEditLoading(false);
    }
  };

  // Filter diet plans based on search
  const filteredPlans = dietPlans.filter(
    (plan) =>
      plan.Name?.toLowerCase().includes(search.toLowerCase()) ||
      plan.Description?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper function to get meal types from plan data
  const getMealTypes = (meals) => {
    if (!meals || !Array.isArray(meals)) return [];
    return meals.map((meal) => meal.MealType).filter(Boolean);
  };

  // Helper function to generate mock stats for display
  const generateStats = (plan) => {
    if (!plan.Meals || plan.Meals.length === 0) {
      return [
        { label: "Carbs", value: 0, cal: "0 g" },
        { label: "Proteins", value: 0, cal: "0 g" },
        { label: "Fats", value: 0, cal: "0 g" },
        { label: "Calories", value: 0, cal: "0 kcal" },
      ];
    }

    const totals = plan.Meals.reduce(
      (acc, meal) => {
        acc.carbs += Number(meal.Carbs) || 0;
        acc.protein += Number(meal.Protein) || 0;
        acc.fats += Number(meal.Fats) || 0;
        acc.calories += Number(meal.Calories) || 0;
        return acc;
      },
      { carbs: 0, protein: 0, fats: 0, calories: 0 }
    );

    const totalMacros = totals.carbs + totals.protein + totals.fats;

    return [
      {
        label: "Carbs",
        value: totalMacros ? (totals.carbs / totalMacros) * 100 : 0,
        cal: `${totals.carbs} g`,
      },
      {
        label: "Proteins",
        value: totalMacros ? (totals.protein / totalMacros) * 100 : 0,
        cal: `${totals.protein} g`,
      },
      {
        label: "Fats",
        value: totalMacros ? (totals.fats / totalMacros) * 100 : 0,
        cal: `${totals.fats} g`,
      },
      {
        label: "Calories",
        value: 100,
        cal: `${totals.calories} kcal`,
      },
    ];
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-6 g-6">
          {/* Dashboard Cards */}
          {statsLoading ? (
            // Show loading state for stats
            Array.from({ length: 4 }).map((_, index) => (
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
                        <div className="spinner-border spinner-border-sm" role="status">
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
          ) : (
            // Show actual diet plan stats data
            [
              {
                title: "Total Plans",
                count: stats.totalPlans,
                trend: "+0%", // Placeholder trend since we don't have historical data
                color: "primary",
                icon: "ri-restaurant-line",
              },
              {
                title: "Total Meals",
                count: stats.totalMeals,
                trend: "+0%", // Placeholder trend
                color: "warning",
                icon: "ri-bowl-line",
              },
              {
                title: "Avg Calories",
                count: stats.avgCalories,
                trend: "+0%", // Placeholder trend
                color: "danger",
                icon: "ri-fire-line",
              },
              {
                title: "Popular Meal",
                count: stats.popularMealType,
                trend: "+0%", // Placeholder trend
                color: "info",
                icon: "ri-star-line",
              },
            ].map((stat, index) => (
              <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
                <div className={`card card-border-shadow-${stat.color} h-100`}>
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
                    <p className="mb-0">
                      <span className="me-1 fw-medium">{stat.trend}</span>
                      <small className="text-muted">than last week</small>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0">Diet Plans</h5>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search plans..."
                  style={{ maxWidth: 250, fontSize: 14 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                    Diet plan deleted successfully!
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
                          document.getElementById("Name")?.focus();
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
                      <div className="card h-100 my-2" key={plan.Id}>
                        <div className="card-body row widget-separator">
                          <div className="col-sm-5 border-end">
                            <h6 className="mb-2">
                              {plan.Name || "Unnamed Plan"}
                            </h6>
                            <p className="mb-2">
                              Duration: {plan.Duration || "Not specified"}
                            </p>
                            <p className="mb-2">
                              {plan.Description || "No description available"}
                            </p>
                            <p className="mb-2">
                              Total Calories: {plan.TotalCalories || 0}
                            </p>

                            {getMealTypes(plan.Meals).map((mealType) => (
                              <span
                                key={mealType}
                                className="badge bg-label-primary rounded-pill me-2 mb-2"
                              >
                                {mealType}
                              </span>
                            ))}

                            <p className="my-2 d-flex align-items-center gap-2">
                              {/* <Link href="/Recipies">Recipies</Link> */}
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
                            {generateStats(plan).map((stat) => (
                              <div
                                className="d-flex align-items-center gap-2"
                                key={stat.label}
                              >
                                <small style={{ width: 80 }}>
                                  {stat.label}
                                </small>
                                <div
                                  className="progress w-100 rounded-pill"
                                  style={{ height: 8 }}
                                >
                                  <div
                                    className="progress-bar bg-primary"
                                    role="progressbar"
                                    style={{ width: `${stat.value}%` }}
                                    aria-valuenow={stat.value}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <small className="w-px-20 text-end">
                                  {stat.cal}
                                </small>
                              </div>
                            ))}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-evenly",
                              }}
                            >
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
                              >
                                <i className="bi bi-trash-fill"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Add New Diet Plan</h5>
              </div>
              <div className="card-body" style={{ fontSize: "14px" }}>
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
                    <label htmlFor="Duration" className="form-label">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="Duration"
                      placeholder="e.g. 1 Month"
                      required
                      value={formData.Duration}
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
                    <label htmlFor="TotalCalories" className="form-label">
                      Total Calories
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="TotalCalories"
                      placeholder="Enter total calories"
                      required
                      min="0"
                      value={formData.TotalCalories}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meals Included</label>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {Object.keys(formData.meals).map((meal) => (
                        <div key={meal}>
                          <input
                            type="checkbox"
                            id={`meal-${meal}`}
                            checked={formData.meals[meal]}
                            onChange={() => handleCheckboxChange(meal)}
                          />
                          <label htmlFor={`meal-${meal}`} className="ms-1">
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
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Pre-workout">Pre-workout</option>
                          <option value="Post-workout">Post-workout</option>
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
                      onClick={() => setShowEditModal(false)}
                    ></button>
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
                          placeholder="Enter plan name"
                          required
                          value={editingPlan.Name || ""}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="editDuration" className="form-label">
                          Duration
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="editDuration"
                          name="Duration"
                          placeholder="e.g. 1 Month"
                          required
                          value={editingPlan.Duration || ""}
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
                          placeholder="Add a brief description"
                          required
                          value={editingPlan.Description || ""}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="editTotalCalories"
                          className="form-label"
                        >
                          Total Calories
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="editTotalCalories"
                          name="TotalCalories"
                          placeholder="Enter total calories"
                          required
                          min="0"
                          value={editingPlan.TotalCalories || 0}
                          onChange={handleEditFormNumberChange}
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowEditModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={editLoading}
                        >
                          {editLoading ? "Updating..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add components like Diet Plan List, Form, Modals here */}
          {/* Due to length, we can modularize into smaller components if needed */}
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Diet Plan to User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {assignSuccess && (
                  <div className="alert alert-success" role="alert">
                    Plan assigned successfully!
                  </div>
                )}
                {assignError && (
                  <div className="alert alert-danger" role="alert">
                    {assignError}
                  </div>
                )}
                {usersLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading users...</p>
                  </div>
                )}
                {usersError && (
                  <div className="alert alert-danger" role="alert">
                    {usersError}
                  </div>
                )}

                {!usersLoading && !usersError && users.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No approved users found.</p>
                  </div>
                )}

                {!usersLoading && !usersError && users.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.Id}>
                            <td>{user.Name || "N/A"}</td>
                            <td>{user.Email || "N/A"}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => assignPlanToUser(user.Id)}
                                disabled={assignLoading}
                              >
                                {assignLoading ? "Assigning..." : "Assign Plan"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl">
          <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
            <div className="text-body mb-2 mb-md-0">
              © {new Date().getFullYear()}, made with{" "}
              <span className="text-danger">
                <i className="tf-icons ri-heart-fill"></i>
              </span>{" "}
              by
              <Link
                href="https://www.coinagesoft.com/"
                target="_blank"
                className="footer-link"
              >
                {" "}
                Coinage.in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
