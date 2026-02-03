"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DietPlanAssignmentModal from "../DietPlanAssignmentModal";
import EditMealModal from "../EditMealModal";
import { useAlert } from "../../utils/alertcontxt";
import { useConfirm } from "../../utils/confirmContext";
import { dietPlanApi, mealApi, dietAssignmentApi } from "../../utils/apiClient";
import { fetchAllMeals } from "../../utils/api";

export default function DietPlanDetails() {
  const params = useParams();
  const planId = params.id;
  const router = useRouter();
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editingRecommendationId, setEditingRecommendationId] = useState(null);

  // Assigned Users table controls
  const [userSearch, setUserSearch] = useState("");
  const [userSortKey, setUserSortKey] = useState("Name");
  const [userSortOrder, setUserSortOrder] = useState("asc");
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 5;

  const [dietPlan, setDietPlan] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDietPlanAssignmentModal, setShowDietPlanAssignmentModal] =
    useState(false);
  const [assignmentModalMode, setAssignmentModalMode] = useState("assign"); // 'assign' or 'view'

  // Meals state
  const [meals, setMeals] = useState([]);
  const [mealSearch, setMealSearch] = useState("");
  const [mealSortKey, setMealSortKey] = useState("mealType");
  const [mealSortOrder, setMealSortOrder] = useState("asc");
  const [mealPage, setMealPage] = useState(1);
  const [mealSearchTerm, setMealSearchTerm] = useState("");

  const mealsPerPage = 5;

  // Edit Meal Modal state
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // All Meals state
  const [allMeals, setAllMeals] = useState([]);
  const [allMealSearch, setAllMealSearch] = useState("");
  const [allMealSortKey, setAllMealSortKey] = useState("FoodItem");
  const [allMealSortOrder, setAllMealSortOrder] = useState("asc");
  const [allMealPage, setAllMealPage] = useState(1);
  const allMealsPerPage = 5;

  // Recommended Meals Modal state
  const [showRecommendMealModal, setShowRecommendMealModal] = useState(false);
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [recommendMealLoading, setRecommendMealLoading] = useState(false);
  const [dropdownMeals, setDropdownMeals] = useState([]);
  const [dropdownMealsLoading, setDropdownMealsLoading] = useState(false);
  const [recSearch, setRecSearch] = useState("");
  const [recSortKey, setRecSortKey] = useState("FoodItem");
  const [recSortOrder, setRecSortOrder] = useState("asc");
  const [recPage, setRecPage] = useState(1);
  const recPerPage = 6;

  const [recommendMealForm, setRecommendMealForm] = useState({
    MealItemId: "",
    MealType: "",
    RecommendedQuantity: "",
    DietPlanId: planId,
    Category: "",
  });
  const [submittingRecommendation, setSubmittingRecommendation] =
    useState(false);

  // Flatten meals for display
  const flattenedItems = meals.flatMap((meal) =>
    (meal.FoodItems || []).map((item) => ({
      ...item,
      mealType: meal.MealType,
    })),
  );

  // Calculate nutrition totals
  const totalMeals = meals.length;
  const totalFoodItems = flattenedItems.length;
  const totalCalories = flattenedItems.reduce(
    (sum, item) => sum + (item.calories || 0),
    0,
  );
  const totalCarbs = flattenedItems.reduce(
    (sum, item) => sum + (item.carbs || 0),
    0,
  );
  const totalProtein = flattenedItems.reduce(
    (sum, item) => sum + (item.protein || 0),
    0,
  );
  const totalFats = flattenedItems.reduce(
    (sum, item) => sum + (item.fats || 0),
    0,
  );

  // ====== All Meals Pagination ======
  const filteredAllMeals = allMeals.filter((meal) =>
    meal.FoodItem.toLowerCase().includes(allMealSearch.toLowerCase()),
  );

  const sortedAllMeals = [...filteredAllMeals].sort((a, b) => {
    const valA = a[allMealSortKey] || "";
    const valB = b[allMealSortKey] || "";
    if (valA < valB) return allMealSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return allMealSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedAllMeals = sortedAllMeals.slice(
    (allMealPage - 1) * allMealsPerPage,
    allMealPage * allMealsPerPage,
  );

  // ====== Meals Pagination ======
  const filteredMeals = flattenedItems.filter((item) =>
    `${item.mealType} ${item.name}`
      .toLowerCase()
      .includes(mealSearch.toLowerCase()),
  );

  const sortedMeals = [...filteredMeals].sort((a, b) => {
    let valA, valB;
    if (mealSortKey === "mealType") {
      valA = a.mealType;
      valB = b.mealType;
    } else {
      valA = a[mealSortKey];
      valB = b[mealSortKey];
    }
    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return mealSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return mealSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedMeals = sortedMeals.slice(
    (mealPage - 1) * mealsPerPage,
    mealPage * mealsPerPage,
  );

  const handleSaveMeal = (updatedMeal) => {
    // Implement save logic here
    console.log("Saving meal:", updatedMeal);
    // Close modal
    setShowEditMealModal(false);
    setEditingMeal(null);
  };

  // Fetch diet plan details and all meals
  useEffect(() => {
    if (planId) {
      fetchDietPlanDetails();
      fetchRecommendedMeals();
      fetchAllMealsData();
    }
  }, [planId]);

  // Fetch dropdown meals when modal opens
  useEffect(() => {
    if (showRecommendMealModal) {
      fetchDropdownMeals();
    }
  }, [showRecommendMealModal]);
  // ====== Assigned Users ======
  const filteredUsers = assignedUsers.filter((u) =>
    `${u.Name} ${u.Email}`.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = a[userSortKey] || "";
    const valB = b[userSortKey] || "";
    if (valA < valB) return userSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return userSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedUsers = sortedUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage,
  );

  const fetchDietPlanDetails = async () => {
    try {
      setLoading(true);

      const res = await dietPlanApi.getById(planId);

      if (res?.Status === true && res.Data) {
        setDietPlan(res.Data);
        setMeals(res.Data.Meals || []);
      } else {
        throw new Error(res?.Message || "Invalid diet plan data");
      }

      // ✅ IMPORTANT: getPlanAssignments already returns users
      const users = await dietAssignmentApi.getPlanAssignments(planId);
      setAssignedUsers(users);
    } catch (err) {
      setError(err.message || "Failed to load diet plan");
    } finally {
      setLoading(false);
    }
  };

  const unassignUser = async (userId) => {
  try {
    const result = await dietAssignmentApi.unassignFromPlan(planId, userId);

    if (result && result.Status === true) {
      showAlert("User unassigned successfully.", "success");

      // ✅ Optimistic UI update (FAST & CORRECT)
      setAssignedUsers((prev) =>
        prev.filter((u) => u.UserId !== userId)
      );
    } else {
      showAlert(
        "Failed to unassign user: " + (result?.Message || "Unknown error"),
        "error"
      );
    }
  } catch (err) {
    console.error("Error unassigning user:", err);
    showAlert("Error unassigning user: " + err.message, "error");
  }
};


  const fetchAllMealsData = async () => {
    try {
      const data = await fetchAllMeals();
      if (Array.isArray(data)) {
        setAllMeals(data);
      } else {
        console.error("Failed to fetch all meals", data);
        setAllMeals([]);
      }
    } catch (err) {
      console.error("Error fetching all meals:", err);
      setAllMeals([]);
    }
  };
  const fetchRecommendedMeals = async () => {
    try {
      setRecommendMealLoading(true);

      const json = await mealApi.getRecommendations();

      const list = Array.isArray(json) ? json : [];

      const filtered = list.filter(
        (r) => r.DietPlanId?.trim() === planId?.trim(),
      );

      setRecommendedMeals(filtered);
    } catch (err) {
      console.error("Error fetching recommended meals:", err);
      setRecommendedMeals([]);
    } finally {
      setRecommendMealLoading(false);
    }
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
  };

  // Open modal in EDIT mode with pre-filled data
  const handleEditRecommendationClick = (rec) => {
    setEditingRecommendationId(rec.Id); // which recommendation we are editing

    setRecommendMealForm({
      MealItemId: rec.MealItemId || "",
      MealType:
        dietMealTypes.find(
          (t) => t.toLowerCase() === String(rec.MealType).toLowerCase(),
        ) || "",

      RecommendedQuantity: String(parseFloat(rec.RecommendedQuantity) || ""),
      DietPlanId: rec.DietPlanId || planId,
      Category: rec.Category || "",
    });

    // 🆕 show current meal text in the search box
    const label = `${rec.FoodItem || ""}${
      rec.RecommendedQuantity ? ` (${rec.RecommendedQuantity})` : ""
    }`;
    setMealSearchTerm(label.trim());

    setShowRecommendMealModal(true);
  };

  // Delete a recommendation
  const handleDeleteRecommendation = async (id) => {
    // ? Native browser confirmation
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Are you sure you want to delete this recommendation?")
        : false;

    if (!confirmed) return;

    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/GlobalUsers/${id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${
              localStorage.getItem("adminToken") ||
              localStorage.getItem("token") ||
              ""
            }`,
          },
        },
      );

      const result = await res.json().catch(() => ({}));

      if (res.ok && (result.status === true || result.Status === true)) {
        showAlert("Recommendation deleted successfully.", "success");
        fetchRecommendedMeals(); // refresh list
      } else {
        showAlert(
          result?.message ||
            result?.Message ||
            "Failed to delete recommendation.",
          "error",
        );
      }
    } catch (err) {
      console.error("Error deleting recommendation:", err);
      showAlert("Error deleting recommendation.", "error");
    }
  };

  const fetchDropdownMeals = async () => {
    try {
      setDropdownMealsLoading(true);
      const data = await fetchAllMeals();
      if (Array.isArray(data)) {
        setDropdownMeals(data);
      } else {
        console.error("Failed to fetch dropdown meals", data);
        setDropdownMeals([]);
      }
    } catch (err) {
      console.error("Error fetching dropdown meals:", err);
      setDropdownMeals([]);
    } finally {
      setDropdownMealsLoading(false);
    }
  };
  const filteredDropdownMeals = dropdownMeals.filter((meal) =>
    `${meal.FoodItem} ${meal.Quantity}`
      .toLowerCase()
      .includes(mealSearchTerm.toLowerCase()),
  );

  const handleAddToPlan = (meal) => {
    // Placeholder action for adding meal to plan
    console.log("Adding meal to plan:", meal);
    // TODO: Implement actual add to plan logic
  };

  const handleDeletePlan = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this diet plan? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      // Use the centralized API client for better error handling
      const result = await dietPlanApi.delete(planId);

      console.log("Delete API response:", result);

      // Check the API response status
      if (result && result.Status === true) {
        // Show success message
        showAlert("Diet plan deleted successfully.", "success");
        // Redirect to diet plans list
        router.push("/DietPlan");
      } else {
        // Handle API error response
        setDeleteError(result?.Message || "Failed to delete diet plan.");
      }
    } catch (err) {
      console.error("Error deleting diet plan:", err);
      setDeleteError(err.message || "Failed to delete diet plan");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();

    const isEditing = !!editingRecommendationId;

    // Validation:
    // MealItemId is required only when ADDING; for edit we keep existing item
    if (!isEditing && !recommendMealForm.MealItemId)
      return showAlert("Please select a meal", "error");
    if (!recommendMealForm.MealType)
      return showAlert("Please select meal type", "error");
    const quantityStr = String(
      recommendMealForm.RecommendedQuantity || "",
    ).trim();
    if (!quantityStr) return showAlert("Please enter quantity", "error");

    try {
      setSubmittingRecommendation(true);

      if (!isEditing) {
        // ✅ ADD MODE using mealApi.recommendMeal
        const recommendationData = {
          MealItemId: recommendMealForm.MealItemId,
          MealType: recommendMealForm.MealType,
          RecommendedQuantity: recommendMealForm.RecommendedQuantity,
          DietPlanId: recommendMealForm.DietPlanId,
        };

        const result = await mealApi.recommendMeal(recommendationData);

        if (result && (result.status === true || result.Status === true)) {
          showAlert("Recommendation added successfully!", "success");

          const dataArray = result.data || result.Data || [];
          if (Array.isArray(dataArray) && dataArray.length > 0) {
            setRecommendedMeals((prev) => {
              const existingIds = new Set(
                prev.map((r) => r.Id || r.id || r.mealId),
              );
              const merged = [...prev];
              dataArray.forEach((item) => {
                const id = item.Id || item.id || item.mealId;
                if (!existingIds.has(id)) merged.push(item);
              });
              return merged;
            });
          } else {
            await fetchRecommendedMeals();
          }

          setRecommendMealForm({
            MealItemId: "",
            MealType: "",
            RecommendedQuantity: "",
            DietPlanId: planId,
            Category: "",
          });
          setShowRecommendMealModal(false);
        } else {
          showAlert(
            result?.message || "Failed to add recommendation.",
            "error",
          );
        }
      } else {
        // ✅ EDIT MODE using mealApi.updateRecommendation
        const updateData = {
          MealType: recommendMealForm.MealType,
          RecommendedQuantity: recommendMealForm.RecommendedQuantity,
          DietPlanId: recommendMealForm.DietPlanId,
        };
        if (recommendMealForm.Category) {
          updateData.Category = recommendMealForm.Category;
        }

        const response = await mealApi.updateRecommendation(
          editingRecommendationId,
          updateData,
        );

        if (response?.status === true || response?.Status === true) {
          const updated = response.data ?? response.Data;

          setRecommendedMeals((prev) =>
            prev.map((r) => (r.Id === updated.Id ? { ...r, ...updated } : r)),
          );

          showAlert("Recommendation updated successfully!", "success");
          setEditingRecommendationId(null);
          setShowRecommendMealModal(false);
        } else {
          showAlert(
            result?.message || "Failed to update recommendation.",
            "error",
          );
        }
      }

      // refresh plan-related info if needed
      fetchDietPlanDetails();
    } catch (err) {
      console.error("Error submitting recommendation:", err);
      showAlert("Error submitting recommendation.", "error");
    } finally {
      setSubmittingRecommendation(false);
    }
  };
  // 🔹 Unique meal types for this plan (from dietPlan.Meals), trimmed
  const dietMealTypes = [...new Set(meals.map((m) => m.Name).filter(Boolean))];

  // 🔹 Filter, sort, and paginate Recommended Meals
  const filteredRecommendedMeals = recommendedMeals.filter((r) => {
    const text = `${r.FoodItem ?? r.foodItem ?? ""} ${
      r.MealType ?? r.mealType ?? ""
    } ${r.Category ?? r.category ?? ""} ${
      r.RecommendedQuantity ?? r.recommendedQuantity ?? ""
    }`
      .toLowerCase()
      .trim();

    return text.includes(recSearch.toLowerCase());
  });

  const sortedRecommendedMeals = [...filteredRecommendedMeals].sort((a, b) => {
    let valA = "";
    let valB = "";

    switch (recSortKey) {
      case "FoodItem":
        valA = (a.FoodItem ?? a.foodItem ?? "").toString().toLowerCase();
        valB = (b.FoodItem ?? b.foodItem ?? "").toString().toLowerCase();
        break;
      case "MealType":
        valA = (a.MealType ?? a.mealType ?? "").toString().toLowerCase();
        valB = (b.MealType ?? b.mealType ?? "").toString().toLowerCase();
        break;
      case "Category":
        valA = (a.Category ?? a.category ?? "").toString().toLowerCase();
        valB = (b.Category ?? b.category ?? "").toString().toLowerCase();
        break;
      case "RecommendedQuantity":
        valA = (a.RecommendedQuantity ?? a.recommendedQuantity ?? "")
          .toString()
          .toLowerCase();
        valB = (b.RecommendedQuantity ?? b.recommendedQuantity ?? "")
          .toString()
          .toLowerCase();
        break;
      default:
        break;
    }

    if (valA < valB) return recSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return recSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalRecPages =
    Math.ceil(sortedRecommendedMeals.length / recPerPage) || 1;

  const paginatedRecommendedMeals = sortedRecommendedMeals.slice(
    (recPage - 1) * recPerPage,
    recPage * recPerPage,
  );

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
                  className="btn btn-danger me-2"
                  onClick={handleDeletePlan}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-line me-1"></i>
                      Delete Plan
                    </>
                  )}
                </button>
                {/* <button
                  className="btn btn-info"
                  onClick={() => {
                    setAssignmentModalMode("view");
                    setShowDietPlanAssignmentModal(true);
                  }}
                >
                  Assign Users
                </button> */}
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
                      <strong>Total Calories:</strong> {dietPlan.TotalCalories}
                    </p>
                    <p>
                      <strong>Total Carbs:</strong> {dietPlan.TotalCarbs}g
                    </p>
                    <p>
                      <strong>Total Protein:</strong> {dietPlan.TotalProtein}g
                    </p>
                    <p>
                      <strong>Total Fats:</strong> {dietPlan.TotalFats}g
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Meals:</h6>
                    {meals.length > 0 ? (
                      <ul className="list-unstyled">
                        {meals.map((meal, index) => (
                          <li key={index} className="mb-2">
                            <strong>{meal.Name}:</strong>{" "}
                            {meal.RecommendedCalories} cal,{" "}
                            {meal.RecommendedProtein}g protein,{" "}
                            {meal.RecommendedCarbs}g carbs,{" "}
                            {meal.RecommendedFats}g fats
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No meals available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Assigned Users</h5>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setAssignmentModalMode("assign");
                    setShowDietPlanAssignmentModal(true);
                  }}
                >
                  Assign Users
                </button>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1); // reset page when searching
                    }}
                  />
                </div>

                {paginatedUsers.length === 0 ? (
                  <p>No users found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            onClick={() => {
                              setUserSortKey("Name");
                              setUserSortOrder(
                                userSortOrder === "asc" ? "desc" : "asc",
                              );
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            Name{" "}
                            {userSortKey === "Name"
                              ? userSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>
                          <th
                            onClick={() => {
                              setUserSortKey("Email");
                              setUserSortOrder(
                                userSortOrder === "asc" ? "desc" : "asc",
                              );
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            Email{" "}
                            {userSortKey === "Email"
                              ? userSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>
                          <th>Assigned Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((user) => (
                          <tr key={user.UserId}>
                            <td>{user.Name}</td>
                            <td>{user.Email}</td>
                            <td>{formatDate(user.AssignedDate)}</td>

                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => unassignUser(user.UserId)}
                              >
                                Unassign
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                    disabled={userPage === 1}
                  >
                    Prev
                  </button>
                  <span>
                    Page {userPage} of{" "}
                    {Math.ceil(filteredUsers.length / usersPerPage)}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      setUserPage((p) =>
                        p < Math.ceil(filteredUsers.length / usersPerPage)
                          ? p + 1
                          : p,
                      )
                    }
                    disabled={
                      userPage >= Math.ceil(filteredUsers.length / usersPerPage)
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Meals Section */}
            {/* Recommended Meals Section (MAIN - shows recommendations for this plan) */}
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recommended Meals</h5>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      // ➜ reset to ADD mode
                      setEditingRecommendationId(null);
                      setRecommendMealForm({
                        MealItemId: "",
                        MealType: "",
                        RecommendedQuantity: "",
                        DietPlanId: planId,
                        Category: "",
                      });
                      setMealSearchTerm("");
                      setShowRecommendMealModal(true);
                    }}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Recommended Meal
                  </button>

                  {/* <input
                    type="text"
                    className="form-control"
                    placeholder="Search recommended..."
                    value={allMealSearch}
                    onChange={(e) => {
                      setRecSearch(e.target.value);
                      setRecPage(1);
                    }}
                    style={{ width: "200px" }}
                  /> */}
                </div>
              </div>

              <div className="card-body">
                {recommendMealLoading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recommendedMeals.length === 0 ? (
                  <p>No recommended meals for this plan.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setRecSortKey("FoodItem");
                              setRecSortOrder((prev) =>
                                recSortKey === "FoodItem" && prev === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Food Item{" "}
                            {recSortKey === "FoodItem"
                              ? recSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>

                          <th
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setRecSortKey("MealType");
                              setRecSortOrder((prev) =>
                                recSortKey === "MealType" && prev === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Meal Type{" "}
                            {recSortKey === "MealType"
                              ? recSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>

                          <th
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setRecSortKey("Category");
                              setRecSortOrder((prev) =>
                                recSortKey === "Category" && prev === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Category{" "}
                            {recSortKey === "Category"
                              ? recSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>

                          <th
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setRecSortKey("RecommendedQuantity");
                              setRecSortOrder((prev) =>
                                recSortKey === "RecommendedQuantity" &&
                                prev === "asc"
                                  ? "desc"
                                  : "asc",
                              );
                            }}
                          >
                            Recommended Quantity{" "}
                            {recSortKey === "RecommendedQuantity"
                              ? recSortOrder === "asc"
                                ? "↑"
                                : "↓"
                              : ""}
                          </th>

                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedRecommendedMeals.map((r, i) => (
                          <tr
                            key={
                              r.Id ??
                              r.id ??
                              `${r.MealItemId ?? r.mealItemId ?? i}-${i}`
                            }
                          >
                            <td>{r.FoodItem ?? r.foodItem ?? "—"}</td>
                            <td>{r.MealType ?? r.mealType ?? "—"}</td>
                            <td>{r.Category ?? r.category ?? "—"}</td>
                            <td>
                              {r.RecommendedQuantity?.trim() ||
                                r.recommendedQuantity?.trim() ||
                                r.BaseQuantity ||
                                "—"}
                            </td>

                            <td>
                              <button
                                className="btn btn-sm btn-warning me-2"
                                type="button"
                                onClick={() => handleEditRecommendationClick(r)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                type="button"
                                onClick={() => handleDeleteRecommendation(r.Id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setRecPage((p) => Math.max(p - 1, 1))}
                        disabled={recPage === 1}
                      >
                        Prev
                      </button>

                      <span>
                        Page {recPage} of {totalRecPages}
                      </span>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          setRecPage((p) => (p < totalRecPages ? p + 1 : p))
                        }
                        disabled={recPage >= totalRecPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diet Plan Assignment Modal */}
        {showDietPlanAssignmentModal && (
          <DietPlanAssignmentModal
            isOpen={showDietPlanAssignmentModal}
            onClose={() => setShowDietPlanAssignmentModal(false)}
            planId={planId}
            onAssignmentSuccess={() => {
              // Refetch assigned users after assignment
              fetchDietPlanDetails();
            }}
          />
        )}

        {/* Edit Meal Modal */}
        {showEditMealModal && (
          <EditMealModal
            isOpen={showEditMealModal}
            onClose={() => {
              setShowEditMealModal(false);
              setEditingMeal(null);
            }}
            meal={editingMeal}
            onSave={handleSaveMeal}
          />
        )}

        {/* Recommended Meals Modal */}
        {/* Recommended Meals Modal (FORM ONLY) */}
        {showRecommendMealModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingRecommendationId
                      ? "Edit Recommended Meal"
                      : "Add Recommended Meal"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowRecommendMealModal(false);
                      setEditingRecommendationId(null);
                      setMealSearchTerm(""); // 🆕
                    }}
                  />
                </div>

                <div className="modal-body">
                  <form onSubmit={handleSubmitRecommendation}>
                    <div className="row">
                      {/* Meal (only really needed for ADD; we still show it for EDIT but not required) */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="MealItemId" className="form-label">
                          Food Item
                        </label>

                        {dropdownMealsLoading ? (
                          <div className="text-center">
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading meals...
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* 🔎 Search box for meals */}
                            <input
                              type="text"
                              className="form-control mb-2"
                              placeholder="Search meal..."
                              value={mealSearchTerm}
                              disabled={!!editingRecommendationId} // 🔒 mute in EDIT mode
                              onChange={(e) => {
                                const value = e.target.value;
                                setMealSearchTerm(value);

                                // 🧹 If user clears the box in ADD mode, clear selected meal so dropdown shows again
                                if (
                                  !editingRecommendationId &&
                                  value.trim() === ""
                                ) {
                                  setRecommendMealForm((prev) => ({
                                    ...prev,
                                    MealItemId: "",
                                  }));
                                }
                              }}
                            />

                            {/* 🔻 Dropdown shows only until a meal is selected */}
                            {!editingRecommendationId &&
                              !recommendMealForm.MealItemId && (
                                <select
                                  className="form-select"
                                  id="MealItemId"
                                  size={5}
                                  value={recommendMealForm.MealItemId}
                                  onChange={(e) => {
                                    const mealId = e.target.value;

                                    // save selected meal id and pre-fill quantity with base quantity
                                    setRecommendMealForm((prev) => ({
                                      ...prev,
                                      MealItemId: mealId,
                                      RecommendedQuantity: "",
                                    }));

                                    // find selected meal & show in search box, and pre-fill quantity
                                    const selected = dropdownMeals.find(
                                      (m) => m.Id === mealId,
                                    );
                                    if (selected) {
                                      setMealSearchTerm(
                                        `${selected.FoodItem} (${selected.Quantity})`,
                                      );
                                      setRecommendMealForm((prev) => ({
                                        ...prev,
                                        RecommendedQuantity: String(
                                          parseFloat(selected.Quantity) || "",
                                        ),
                                      }));
                                    }
                                  }}
                                  required
                                >
                                  <option value="">Select a meal</option>
                                  {filteredDropdownMeals.map((meal) => (
                                    <option key={meal.Id} value={meal.Id}>
                                      {meal.FoodItem} ({meal.Quantity})
                                    </option>
                                  ))}
                                </select>
                              )}
                          </>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="MealType" className="form-label">
                          Meal Type
                        </label>
                        <select
                          className="form-select"
                          value={recommendMealForm.MealType}
                          onChange={(e) =>
                            setRecommendMealForm({
                              ...recommendMealForm,
                              MealType: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="" disabled>
                            Select meal type
                          </option>

                          {dietMealTypes.map((type) => {
                            const isCurrent =
                              type === recommendMealForm.MealType;

                            return (
                              <option
                                key={type}
                                value={type}
                                disabled={isCurrent} // 🔒 disable current one
                              >
                                {type} {isCurrent ? "(current)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      {editingRecommendationId && (
                        <div className="col-md-6 mb-3">
                          <label htmlFor="Category" className="form-label">
                            Category
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="Category"
                            // readOnly
                            disabled
                            value={recommendMealForm.Category}
                            onChange={(e) =>
                              setRecommendMealForm({
                                ...recommendMealForm,
                                Category: e.target.value,
                              })
                            }
                            placeholder="e.g. Vegetarian"
                          />
                        </div>
                      )}

                      <div
                        className={
                          editingRecommendationId
                            ? "col-md-6 mb-3"
                            : "col-md-12 mb-3"
                        }
                      >
                        <label
                          htmlFor="RecommendedQuantity"
                          className="form-label"
                        >
                          Recommended Quantity
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="RecommendedQuantity"
                          placeholder="Enter quantity (number only)"
                          value={recommendMealForm.RecommendedQuantity}
                          onChange={(e) =>
                            setRecommendMealForm({
                              ...recommendMealForm,
                              RecommendedQuantity: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowRecommendMealModal(false);
                          setEditingRecommendationId(null);
                          setMealSearchTerm("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submittingRecommendation}
                      >
                        {submittingRecommendation
                          ? editingRecommendationId
                            ? "Updating..."
                            : "Adding..."
                          : editingRecommendationId
                            ? "Update Recommendation"
                            : "Add Recommendation"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
