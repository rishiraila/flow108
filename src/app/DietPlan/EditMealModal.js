"use client";
import { useState, useEffect } from "react";

export default function EditMealModal({ isOpen, onClose, meal, onSave }) {
  const [mealType, setMealType] = useState("");
  const [foodItem, setFoodItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calories, setCalories] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (meal) {
      setMealType(meal.MealType || "");
      setFoodItem(meal.FoodItem || "");
      setQuantity(meal.Quantity || "");
      setCalories(meal.Calories || 0);
      setCarbs(meal.Carbs || 0);
      setProtein(meal.Protein || 0);
      setFats(meal.Fats || 0);
      setError(null);
    }
  }, [meal]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!mealType || !foodItem || !quantity) {
      setError("Please fill in all required fields.");
      setSaving(false);
      return;
    }

    const updatedMeal = {
      MealType: mealType,
      FoodItem: foodItem,
      Quantity: quantity,
      Calories: Number(calories),
      Carbs: Number(carbs),
      Protein: Number(protein),
      Fats: Number(fats),
    };

    try {
      await onSave(updatedMeal);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save meal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Meal</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2 mb-3">{error}</div>
                )}
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="mealType" className="form-label">
                      <i className="bi bi-clock me-1"></i>Category <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mealType"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="foodItem" className="form-label">
                      <i className="bi bi-egg me-1"></i>Food Item <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="foodItem"
                      value={foodItem}
                      onChange={(e) => setFoodItem(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="quantity" className="form-label">
                      <i className="bi bi-speedometer me-1"></i>Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="calories" className="form-label">
                      <i className="bi bi-fire me-1"></i>Calories
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="calories"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="carbs" className="form-label">
                      <i className="bi bi-bread-slice me-1"></i>Carbs (g)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="carbs"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="protein" className="form-label">
                      <i className="bi bi-egg-fried me-1"></i>Protein (g)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="protein"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="fats" className="form-label">
                      <i className="bi bi-droplet me-1"></i>Fats (g)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="fats"
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
