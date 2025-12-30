"use client";
import { useEffect, useState } from "react";
import EditMealModal from "../DietPlan/EditMealModal";
import { mealApi } from "../utils/apiClient";

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealApi.getAllMeals();
      setMeals(data);
    } catch (err) {
      setError("Failed to load meals: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (meal) => {
    setEditingMeal(meal);
    setShowEditModal(true);
  };

  const handleSaveMeal = async (updatedMeal) => {
    if (!editingMeal) return;
    try {
      const { updateMeal } = await import("../utils/api");
      await updateMeal(editingMeal.Id, updatedMeal);
      setShowEditModal(false);
      setEditingMeal(null);
      fetchMeals();
    } catch (err) {
      alert("Failed to update meal: " + err.message);
    }
  };

  const filteredMeals = meals.filter((meal) =>
    meal.MealType?.toLowerCase().includes(search.toLowerCase()) ||
    meal.FoodItem?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>All Meals</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search meals..."
            style={{ maxWidth: 250, fontSize: 14 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading && <p>Loading meals...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && !error && meals.length === 0 && <p>No meals found.</p>}
        {!loading && !error && meals.length > 0 && filteredMeals.length === 0 && search && (
          <p>No meal found.</p>
        )}
        {!loading && !error && meals.length > 0 && filteredMeals.length > 0 && (
          <div className="list-group">
            {filteredMeals.map((meal) => (
              <div
                key={meal.Id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{meal.MealType}</strong> - {meal.FoodItem} (Qty: {meal.Quantity})
                  <br />
                  <small className="text-muted">
                    Calories: {meal.Calories} | Carbs: {meal.Carbs}g | Protein: {meal.Protein}g | Fats: {meal.Fats}g
                  </small>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEditClick(meal)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {showEditModal && editingMeal && (
          <EditMealModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
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
