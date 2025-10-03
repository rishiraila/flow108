"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DietPlanAssignmentModal from "../DietPlanAssignmentModal";
import EditMealModal from "../EditMealModal";
import { fetchAllMeals, updateMeal } from "../../utils/api";
import { useAlert } from "../../utils/alertcontxt";

export default function DietPlanDetails() {
  const params = useParams();
  const planId = params.id;
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
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [flattenedItems, setFlattenedItems] = useState([]);
  const [mealSearch, setMealSearch] = useState("");
  const [mealSortKey, setMealSortKey] = useState("mealType");
  const [mealSortOrder, setMealSortOrder] = useState("asc");
  const [mealPage, setMealPage] = useState(1);
  const mealsPerPage = 10;

  // Fetch diet plan details
  useEffect(() => {
    if (planId) {
      fetchDietPlanDetails();
      fetchMeals();
    }
  }, [planId]);

  const fetchMeals = async () => {
    try {
      const apiMeals = await fetchAllMeals();
      const transformedMeals = transformMealsData(apiMeals);
      setMeals(transformedMeals);
      const flattened = transformedMeals.flatMap(meal =>
        meal.items.map(item => ({ mealType: meal.name, ...item }))
      );
      setFlattenedItems(flattened);
    } catch (err) {
      console.error("Failed to fetch meals:", err);
    }
  };

  // Transform API data to match component structure
  const transformMealsData = (apiMeals) => {
    // Group meals by MealType
    const groupedMeals = {};

    apiMeals.forEach(meal => {
      const mealType = meal.MealType || 'Breakfast'; // Default to Breakfast if not specified
      if (!groupedMeals[mealType]) {
        groupedMeals[mealType] = {
          id: mealType.toLowerCase(),
          name: mealType,
          time: getMealTime(mealType),
          items: []
        };
      }

      // Add item to the meal
      groupedMeals[mealType].items.push({
        name: meal.FoodItem || 'Unknown Item',
        quantity: meal.Quantity || '1 serving',
        calories: meal.Calories || 0,
        carbs: meal.Carbs || 0,
        protein: meal.Protein || 0,
        fats: meal.Fats || 0
      });
    });

    // Calculate totals for each meal
    Object.values(groupedMeals).forEach(meal => {
      meal.totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
      meal.totalProtein = meal.items.reduce((sum, item) => sum + item.protein, 0);
      meal.totalCarbs = meal.items.reduce((sum, item) => sum + item.carbs, 0);
      meal.totalFats = meal.items.reduce((sum, item) => sum + item.fats, 0);
    });

    // Convert to array and sort by typical meal order
    const mealOrder = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
    return Object.values(groupedMeals).sort((a, b) => {
      const aIndex = mealOrder.indexOf(a.name);
      const bIndex = mealOrder.indexOf(b.name);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  };

  // Get default time for meal type
  const getMealTime = (mealType) => {
    const timeMap = {
      'Breakfast': '08:00 AM',
      'Lunch': '12:30 PM',
      'Snack': '03:00 PM',
      'Dinner': '07:00 PM'
    };
    return timeMap[mealType] || '12:00 PM';
  };

  const handleEditMealClick = (meal) => {
    setEditingMeal(meal);
    setShowEditMealModal(true);
  };

  const handleSaveMeal = async (updatedMeal) => {
    if (!editingMeal) return;
    try {
      await updateMeal(editingMeal.Id, updatedMeal);
      setShowEditMealModal(false);
      setEditingMeal(null);
      // Refresh meals list
      fetchMeals();
    } catch (err) {
      console.error("Failed to update meal:", err);
      throw err;
    }
  };
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
                  </div>
                  <div className="col-md-6">
                    {/* <button
                      className="btn btn-info btn-sm mt-2"
                      onClick={() => {
                        setAssignmentModalMode("view");
                        setShowDietPlanAssignmentModal(true);
                      }}
                    >
                      Assign Users
                    </button> */}
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
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Meals</h5>
              </div>
              <div className="card-body">
                {flattenedItems.length === 0 ? (
                  <p>No meals found for this diet plan.</p>
                ) : (
                  <>
                    <div className="d-flex justify-content-between mb-3">
                      <input
                        type="text"
                        className="form-control w-25"
                        placeholder="Search meals..."
                        value={mealSearch}
                        onChange={(e) => {
                          setMealSearch(e.target.value);
                          setMealPage(1); // reset page when searching
                        }}
                      />
                    </div>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th
                              onClick={() => {
                                setMealSortKey("mealType");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Meal Type{" "}
                              {mealSortKey === "mealType"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("name");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Food Item{" "}
                              {mealSortKey === "name"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("quantity");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Qty{" "}
                              {mealSortKey === "quantity"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("calories");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Calories{" "}
                              {mealSortKey === "calories"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("carbs");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Carbs{" "}
                              {mealSortKey === "carbs"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("protein");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Protein{" "}
                              {mealSortKey === "protein"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                            <th
                              onClick={() => {
                                setMealSortKey("fats");
                                setMealSortOrder(
                                  mealSortOrder === "asc" ? "desc" : "asc"
                                );
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              Fats{" "}
                              {mealSortKey === "fats"
                                ? mealSortOrder === "asc"
                                  ? "↑"
                                  : "↓"
                                : ""}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedMeals.map((item, index) => (
                            <tr key={index}>
                              <td>{item.mealType}</td>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.calories}</td>
                              <td>{item.carbs}g</td>
                              <td>{item.protein}g</td>
                              <td>{item.fats}g</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setMealPage((p) => Math.max(p - 1, 1))}
                        disabled={mealPage === 1}
                      >
                        Prev
                      </button>
                      <span>
                        Page {mealPage} of{" "}
                        {Math.ceil(filteredMeals.length / mealsPerPage)}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          setMealPage((p) =>
                            p < Math.ceil(filteredMeals.length / mealsPerPage)
                              ? p + 1
                              : p
                          )
                        }
                        disabled={
                          mealPage >= Math.ceil(filteredMeals.length / mealsPerPage)
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
