"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DietPlanAssignmentModal from "../DietPlanAssignmentModal";
import EditMealModal from "../EditMealModal";
import { useAlert } from "../../utils/alertcontxt";
import { useConfirm } from "../../utils/confirmContext";
import { dietPlanApi } from "../../utils/apiClient";
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

  // Flatten meals for display
  const flattenedItems = meals.flatMap(meal =>
    (meal.FoodItems || []).map(item => ({ ...item, mealType: meal.MealType }))
  );

  // Calculate nutrition totals
  const totalMeals = meals.length;
  const totalFoodItems = flattenedItems.length;
  const totalCalories = flattenedItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalCarbs = flattenedItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalProtein = flattenedItems.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalFats = flattenedItems.reduce((sum, item) => sum + (item.fats || 0), 0);

  // ====== All Meals Pagination ======
  const filteredAllMeals = allMeals.filter((meal) =>
    meal.FoodItem.toLowerCase().includes(allMealSearch.toLowerCase())
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
    allMealPage * allMealsPerPage
  );

  // ====== Meals Pagination ======
  const filteredMeals = flattenedItems.filter((item) =>
    `${item.mealType} ${item.name}`.toLowerCase().includes(mealSearch.toLowerCase())
  );

  const sortedMeals = [...filteredMeals].sort((a, b) => {
    let valA, valB;
    if (mealSortKey === 'mealType') {
      valA = a.mealType;
      valB = b.mealType;
    } else {
      valA = a[mealSortKey];
      valB = b[mealSortKey];
    }
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return mealSortOrder === "asc" ? -1 : 1;
    if (valA > valB) return mealSortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedMeals = sortedMeals.slice(
    (mealPage - 1) * mealsPerPage,
    mealPage * mealsPerPage
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
      fetchAllMealsData();
    }
  }, [planId]);
  // ====== Assigned Users ======
  const filteredUsers = assignedUsers.filter((u) =>
    `${u.Name} ${u.Email}`.toLowerCase().includes(userSearch.toLowerCase())
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
    userPage * usersPerPage
  );

  const fetchDietPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/dietplan/${planId}`
      );
      if (!response.ok) throw new Error("Failed to fetch diet plan");
      const planData = await response.json();
      if (planData.Status && planData.Data) {
        setDietPlan(planData.Data);
        setMeals(planData.Data.Meals || []);

        // Fetch assigned users
        try {
          const usersResponse = await fetch(
            "https://flow108.coinagesoft.com/api/AdminDietPlan/with-users"
          );
          if (!usersResponse.ok)
            throw new Error("Failed to fetch assigned users");
          const usersData = await usersResponse.json();
          if (usersData.Status && usersData.Data) {
            const planWithUsers = usersData.Data.find(
              (p) => p.DietPlanId === planId
            );
            setAssignedUsers(
              planWithUsers ? planWithUsers.AssignedUsers || [] : []
            );
          }
        } catch (err) {
          console.error("Failed to fetch assigned users:", err);
          setAssignedUsers([]);
        }
      } else {
        throw new Error("Invalid diet plan data");
      }
    } catch (err) {
      setError(err.message || "Failed to load diet plan");
    } finally {
      setLoading(false);
    }
  };

  const unassignUser = async (userId) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/unassign/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
          },
        }
      );
      if (!response.ok) throw new Error("Failed to unassign user");
      const result = await response.json();
      if (result.Status) {
        // Refetch assigned users
        fetchDietPlanDetails();
      } else {
        alert("Failed to unassign user: " + result.Message);
      }
    } catch (err) {
      console.error("Error unassigning user:", err);
      alert("Error unassigning user: " + err.message);
    }
  };

  const fetchAllMealsData = async () => {
    try {
      const data = await fetchAllMeals();
      if (data && (data.Status === true || data.Status === undefined) && data.Data) {
        setAllMeals(data.Data);
      } else {
        console.error("Failed to fetch all meals", data);
        setAllMeals([]);
      }
    } catch (err) {
      console.error("Error fetching all meals:", err);
      setAllMeals([]);
    }
  };

  const handleAddToPlan = (meal) => {
    // Placeholder action for adding meal to plan
    console.log("Adding meal to plan:", meal);
    // TODO: Implement actual add to plan logic
  };

  const handleDeletePlan = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this diet plan? This action cannot be undone."
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
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
                            <strong>{meal.Name}:</strong> {meal.RecommendedCalories} cal, {meal.RecommendedProtein}g protein, {meal.RecommendedCarbs}g carbs, {meal.RecommendedFats}g fats
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
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setAssignmentModalMode('assign');
                  setShowDietPlanAssignmentModal(true);
                }}>
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
                                userSortOrder === "asc" ? "desc" : "asc"
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
                                userSortOrder === "asc" ? "desc" : "asc"
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
                            <td>
                              {new Date(user.AssignedDate).toLocaleDateString()}
                            </td>
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
                          : p
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

            {/* Meals Section */}
           

            {/* All Meals Section */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">All Meals</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search all meals..."
                    value={allMealSearch}
                    onChange={(e) => {
                      setAllMealSearch(e.target.value);
                      setAllMealPage(1); // reset page when searching
                    }}
                  />
                </div>
                {allMeals.length === 0 ? (
                  <p>No meals available.</p>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th
                              onClick={() => {
                                setAllMealSortKey("FoodItem");
                                setAllMealSortOrder(
                                  allMealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Food Item{" "}
                              {allMealSortKey === "FoodItem"
                                ? allMealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setAllMealSortKey("Calories");
                                setAllMealSortOrder(
                                  allMealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Calories{" "}
                              {allMealSortKey === "Calories"
                                ? allMealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setAllMealSortKey("Carbs");
                                setAllMealSortOrder(
                                  allMealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Carbs{" "}
                              {allMealSortKey === "Carbs"
                                ? allMealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setAllMealSortKey("Protein");
                                setAllMealSortOrder(
                                  allMealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Protein{" "}
                              {allMealSortKey === "Protein"
                                ? allMealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setAllMealSortKey("Fats");
                                setAllMealSortOrder(
                                  allMealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Fats{" "}
                              {allMealSortKey === "Fats"
                                ? allMealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                          
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAllMeals.map((meal, index) => (
                            <tr key={meal.FoodItemId || index}>
                              <td>{meal.FoodItem}</td>
                              <td>{meal.Calories}</td>
                              <td>{meal.Carbs}g</td>
                              <td>{meal.Protein}g</td>
                              <td>{meal.Fats}g</td>
                             
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setAllMealPage((p) => Math.max(p - 1, 1))}
                        disabled={allMealPage === 1}
                      >
                        Prev
                      </button>
                      <span>
                        Page {allMealPage} of{" "}
                        {Math.ceil(filteredAllMeals.length / allMealsPerPage)}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          setAllMealPage((p) =>
                            p < Math.ceil(filteredAllMeals.length / allMealsPerPage)
                              ? p + 1
                              : p
                          )
                        }
                        disabled={
                          allMealPage >= Math.ceil(filteredAllMeals.length / allMealsPerPage)
                        }
                      >
                        Next
                      </button>
                    </div>
                  </>
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
      </div>
    </div>
  );
}
