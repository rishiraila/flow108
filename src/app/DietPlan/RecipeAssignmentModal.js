"use client";
import { useState, useEffect } from "react";

export default function RecipeAssignmentModal({
  isOpen,
  onClose,
  mealId,
  onRecipeAssigned,
  recipes = [],
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");

  const [formData, setFormData] = useState({
    FoodName: "",
    Quantity: "",
    Calories: 0,
    Fats: 0,
    Carbs: 0,
    Protein: 0,
    recipeId: "",
  });

  useEffect(() => {
    if (!selectedRecipeId) return;
    const selectedRecipe = recipes.find((r) => r.Id === selectedRecipeId);
    if (selectedRecipe) {
      setFormData((prev) => ({
        ...prev,
        recipeId: selectedRecipe.Id,
        FoodName: selectedRecipe.Name,
        Calories: selectedRecipe.Calories || 0,
      }));
    }
  }, [selectedRecipeId, recipes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["Calories", "Fats", "Carbs", "Protein"].includes(name)
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const recipeId =
        formData.recipeId || "00000000-0000-0000-0000-000000000000";

      const response = await fetch(
        `https://flow108.coinagesoft.com/api/meals/${mealId}/recipes/${recipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            FoodName: formData.FoodName,
            Quantity: formData.Quantity,
            Calories: formData.Calories,
            Fats: formData.Fats,
            Carbs: formData.Carbs,
            Protein: formData.Protein,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        setSuccess(true);
        setTimeout(() => {
          onRecipeAssigned(result);
          onClose();
          setFormData({
            FoodName: "",
            Quantity: "",
            Calories: 0,
            Fats: 0,
            Carbs: 0,
            Protein: 0,
            recipeId: "",
          });
          setSelectedRecipeId("");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to assign recipe");
      }
    } catch (err) {
      setError(err.message || "Failed to assign recipe to meal");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign Recipe to Meal</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {success && (
              <div className="alert alert-success" role="alert">
                Recipe assigned successfully!
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label htmlFor="recipeSelect" className="form-label">
                    Select Recipe
                  </label>
                  <select
                    className="form-select"
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    required
                  >
                    <option value="">Select a recipe</option>
                    {recipes.map((recipe) => (
                      <option key={recipe.Id} value={recipe.Id}>
                        {recipe.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="FoodName" className="form-label">
                    Food Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="FoodName"
                    name="FoodName"
                    value={formData.FoodName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Grilled Chicken Salad"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="Quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="Quantity"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 1 serving, 200g"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="Calories" className="form-label">
                    Calories
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="Calories"
                    name="Calories"
                    value={formData.Calories}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="Protein" className="form-label">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="Protein"
                    name="Protein"
                    value={formData.Protein}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="Carbs" className="form-label">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="Carbs"
                    name="Carbs"
                    value={formData.Carbs}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="Fats" className="form-label">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="Fats"
                    name="Fats"
                    value={formData.Fats}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label htmlFor="recipeId" className="form-label">
                    Recipe ID (Manual Entry)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="recipeId"
                    name="recipeId"
                    value={formData.recipeId}
                    onChange={handleInputChange}
                    placeholder="UUID (e.g., 665d27b7-7429-4ab6-8ff3-1316b54b6282)"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
