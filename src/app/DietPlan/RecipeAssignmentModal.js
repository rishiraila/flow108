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
      }));
    }
  }, [selectedRecipeId, recipes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        `https://api.flow108.in/api/meals/${mealId}/recipes/${recipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            FoodName: formData.FoodName,
            Quantity: formData.Quantity,
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
