"use client";
import { useState, useEffect } from "react";
import authenticatedFetch from "./utils/authenticatedFetch";

export default function WorkoutAssignmentModal({
  isOpen,
  onClose,
  planId,
  onWorkoutAssigned,
  workouts = [],
  existingPlanWorkouts = [], // 🔹 NEW
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [order, setOrder] = useState(1);
  const [restSeconds, setRestSeconds] = useState(30);

  // 🔹 When modal opens or existingPlanWorkouts changes,
  //     set default Order = max(Order) + 1 (or length + 1 fallback)
  useEffect(() => {
    if (!isOpen) return;

    if (existingPlanWorkouts && existingPlanWorkouts.length > 0) {
      const maxOrder = existingPlanWorkouts.reduce((max, w) => {
        const o = Number(w.Order ?? 0);
        return o > max ? o : max;
      }, 0);

      setOrder(maxOrder > 0 ? maxOrder + 1 : existingPlanWorkouts.length + 1);
    } else {
      setOrder(1);
    }

    // reset state when opening
    setSelectedWorkoutId("");
    setRestSeconds(30);
    setError(null);
    setSuccess(false);
  }, [isOpen, existingPlanWorkouts]);

  // 🔹 Compute already-assigned workout IDs for filtering dropdown
  const assignedWorkoutIds = new Set(
    (existingPlanWorkouts || []).map((w) => w.WorkoutId)
  );

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
      const result = await authenticatedFetch(
        `https://api.flow108.in/api/admin/workout-plans/${planId}/assign-workout`,
        {
          method: "POST",
          body: JSON.stringify({
            Workouts: [
              {
                WorkoutId: selectedWorkoutId,
                Order: order,          // 🔹 uses your desired sequence
                RestSeconds: restSeconds, // 🔹 if backend supports it
              },
            ],
          }),
        }
      );

      if (result.status) {
        setSuccess(true);
        setTimeout(() => {
          onWorkoutAssigned(result); // parent will re-fetch plan
          onClose();
          setSelectedWorkoutId("");
          setOrder(1);
          setRestSeconds(30);
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
                  {workouts
                    // 🔹 filter out workouts already in this plan
                    .filter((workout) => {
                      const id = workout.Id || workout.WorkoutId;
                      return id && !assignedWorkoutIds.has(id);
                    })
                    .map((workout) => (
                      <option
                        key={workout.Id || workout.WorkoutId}
                        value={workout.Id || workout.WorkoutId}
                      >
                        {workout.Title ||
                          workout.WorkoutName ||
                          workout.Name ||
                          "Untitled Workout"}
                      </option>
                    ))}
                </select>
                {workouts.length === 0 && (
                  <small className="text-muted">
                    No workouts available. Please create workouts first.
                  </small>
                )}
              </div>
{/* 
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="orderInput" className="form-label">
                    Order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="orderInput"
                    value={order}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setOrder(Number.isNaN(value) || value < 1 ? 1 : value);
                    }}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="restSecondsInput" className="form-label">
                    Rest Seconds
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="restSecondsInput"
                    value={restSeconds}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setRestSeconds(Number.isNaN(value) || value < 0 ? 0 : value);
                    }}
                    min="0"
                    required
                  />
                </div>
              </div> */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
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
