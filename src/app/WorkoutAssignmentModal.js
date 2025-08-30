"use client";
import { useState, useEffect } from "react";

export default function WorkoutAssignmentModal({
  isOpen,
  onClose,
  planId,
  onWorkoutAssigned,
  workouts = [],
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!selectedWorkoutId) {
      setError("Please select a workout");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/workout-plans/${planId}/assign-workout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ WorkoutId: selectedWorkoutId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        setSuccess(true);
        setTimeout(() => {
          onWorkoutAssigned(result);
          onClose();
          setSelectedWorkoutId("");
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to assign workout");
      }
    } catch (err) {
      setError(err.message || "Failed to assign workout to plan");
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
            <h5 className="modal-title">Assign Workout to Plan</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {success && (
              <div className="alert alert-success" role="alert">
                Workout assigned successfully!
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="workoutSelect" className="form-label">
                  Select Workout
                </label>
                <select
                  className="form-select"
                  id="workoutSelect"
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  required
                >
                  <option value="">Select a workout</option>
                  {workouts.map((workout) => (
                    <option key={workout.Id || workout.WorkoutId} value={workout.Id || workout.WorkoutId}>
                      {workout.Title || workout.WorkoutName || workout.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
