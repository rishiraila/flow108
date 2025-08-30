"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WorkoutAssignmentModal from "../WorkoutAssignmentModal";
import { removeWorkoutFromPlan } from "../utils/api";

// Main content component that uses useSearchParams
function WorkoutDetailsContent() {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editableWorkouts, setEditableWorkouts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);

  const [newWorkout, setNewWorkout] = useState({
    WorkoutName: "",
    Description: "",
    Time: "",
    Category: "",
    Format: "",
    Intensity: "",
    Image: "",
  });

  const searchParams = useSearchParams();
  const workoutId = searchParams.get("workoutId");

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/workout_plan/${workoutId}/workouts`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch workout details");

      const data = await response.json();
      
      // Convert relative image URLs to absolute URLs
      const baseDomain = "https://flow108.coinagesoft.com";
      if (data.data && data.data.Workouts && Array.isArray(data.data.Workouts)) {
        data.data.Workouts = data.data.Workouts.map(workout => {
          const updatedWorkout = { ...workout };
          
          // Convert Image if it's a relative path
          if (workout.Image && workout.Image.startsWith('/')) {
            updatedWorkout.Image = baseDomain + workout.Image;
          }
          
          return updatedWorkout;
        });
      }
      
      setWorkoutPlan(data.data);
      setEditableWorkouts(data.data.Workouts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutChange = (index, field, value) => {
    const updatedWorkouts = [...editableWorkouts];
    updatedWorkouts[index][field] = value;
    setEditableWorkouts(updatedWorkouts);
  };

  const handleSaveWorkout = async (workout) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/workout/${workout.WorkoutId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            WorkoutName: workout.WorkoutName,
            Description: workout.Description,
            Time: workout.Time,
            Category: workout.Category,
            Format: workout.Format,
            Intensity: workout.Intensity,
            Image: workout.Image,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update workout");

      alert("Workout updated successfully");
      setEditIndex(null);
      fetchWorkoutDetails();
    } catch (err) {
      alert("Error updating workout: " + err.message);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;

    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/workout/${workoutId}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete workout");

      const result = await response.json();
      alert(result.message || "Workout deleted successfully");

      const updatedWorkouts = editableWorkouts.filter((workout) => workout.WorkoutId !== workoutId);
      setEditableWorkouts(updatedWorkouts);

      fetchWorkoutDetails();
    } catch (err) {
      alert("Error deleting workout: " + err.message);
    }
  };

  const handleAddWorkout = async (workout) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/workout_plan/${workoutId}/workouts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            WorkoutName: workout.WorkoutName,
            Description: workout.Description,
            Time: workout.Time,
            Category: workout.Category,
            Format: workout.Format,
            Intensity: workout.Intensity,
            Image: workout.Image,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add workout");

      alert("Workout added successfully!");
      fetchWorkoutDetails();

      setNewWorkout({
        WorkoutName: "",
        Description: "",
        Time: "",
        Category: "",
        Format: "",
        Intensity: "",
        Image: "",
      });
      setImageFile(null);
      setVideoFile(null);
    } catch (err) {
      alert("Error adding workout: " + err.message);
    }
  };

  const fetchAllWorkouts = async () => {
    try {
      setWorkoutsLoading(true);
      const response = await fetch(
        "https://flow108.coinagesoft.com/api/admin/workouts",
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch workouts");

      const data = await response.json();
      const workouts = data.data || data.Data || [];
      
      // Convert relative image URLs to absolute URLs
      const baseDomain = "https://flow108.coinagesoft.com";
      const updatedWorkouts = workouts.map(workout => {
        const updatedWorkout = { ...workout };
        
        // Convert Image if it's a relative path
        if (workout.Image && workout.Image.startsWith('/')) {
          updatedWorkout.Image = baseDomain + workout.Image;
        }
        
        return updatedWorkout;
      });

      setAllWorkouts(updatedWorkouts);
    } catch (err) {
      console.error("Error fetching workouts:", err);
      alert("Failed to fetch workouts: " + err.message);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleOpenAssignmentModal = async () => {
    if (allWorkouts.length === 0) {
      await fetchAllWorkouts();
    }
    setShowAssignmentModal(true);
  };

  const handleWorkoutAssigned = (result) => {
    alert("Workout assigned successfully!");
    fetchWorkoutDetails(); // Refresh the workout plan details
  };

  if (loading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="alert alert-danger">Error: {error}</div>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="alert alert-warning">No workout plan details found.</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Workout Plan Details */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">{workoutPlan.PlanName}</h5>
            <p className="text-muted mb-0">Plan ID: {workoutPlan.PlanId}</p>
          </div>
        </div>

        {/* Workouts Section */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Workouts in this Plan</h5>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleOpenAssignmentModal}
                disabled={workoutsLoading}
              >
                <i className="ri-link me-1"></i> Assign Existing Workout
              </button>
              <button
                className="btn btn-sm btn-outline-success"
                data-bs-toggle="modal"
                data-bs-target="#addWorkoutModal"
              >
                <i className="ri-add-line me-1"></i> Add New Workout
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              {editableWorkouts.map((workout, index) => (
                <div className="col-md-4 mb-4" key={workout.WorkoutId}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="card-title mb-1">{workout.WorkoutName}</h6>
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-icon dropdown-toggle hide-arrow"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ri-more-2-fill"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => setEditIndex(index)}
                              >
                                ✏️ Edit
                              </button>
                            </li>
                            
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to remove this workout from the plan?"
                                    )
                                  ) {
                                    try {
                                      await removeWorkoutFromPlan(workoutPlan.PlanId, workout.WorkoutId);
                                      alert("Workout removed from plan successfully");
                                      // Update UI after removal
                                      setEditableWorkouts((prev) =>
                                        prev.filter((w) => w.WorkoutId !== workout.WorkoutId)
                                      );
                                    } catch (error) {
                                      alert("Failed to remove workout from plan: " + error.message);
                                    }
                                  }
                                }}
                              >
                                🛑 Remove from Plan
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {editIndex === index ? (
                        <>
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Workout Name"
                            value={workout.WorkoutName}
                            onChange={(e) =>
                              handleWorkoutChange(index, "WorkoutName", e.target.value)
                            }
                          />
                          <textarea
                            className="form-control mb-2"
                            placeholder="Description"
                            value={workout.Description}
                            onChange={(e) =>
                              handleWorkoutChange(
                                index,
                                "Description",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Time (e.g., 30 mins)"
                            value={workout.Time}
                            onChange={(e) =>
                              handleWorkoutChange(
                                index,
                                "Time",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Category"
                            value={workout.Category}
                            onChange={(e) =>
                              handleWorkoutChange(
                                index,
                                "Category",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Format"
                            value={workout.Format}
                            onChange={(e) =>
                              handleWorkoutChange(
                                index,
                                "Format",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Intensity"
                            value={workout.Intensity}
                            onChange={(e) =>
                              handleWorkoutChange(
                                index,
                                "Intensity",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleSaveWorkout(workout)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditIndex(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <small className="text-muted">
                            {workout.Time} &bull; {workout.Category} &bull; {workout.Format}
                          </small>
                          <p className="card-text mt-2">{workout.Description}</p>
                          <span className={`badge bg-${
                            workout.Intensity === "High"
                              ? "danger"
                              : workout.Intensity === "Medium"
                              ? "warning"
                              : "success"
                          }`}>
                            {workout.Intensity}
                          </span>
                          {workout.Image && (
                            <img
                              src={workout.Image}
                              className="img-fluid rounded mb-2"
                              style={{
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        <div
          className="modal fade"
          id="addWorkoutModal"
          tabIndex="-1"
          aria-labelledby="addWorkoutModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Workout</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Workout Name"
                  value={newWorkout.WorkoutName}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, WorkoutName: e.target.value })
                  }
                />
                <textarea
                  className="form-control mb-3"
                  placeholder="Description"
                  value={newWorkout.Description}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, Description: e.target.value })
                  }
                />
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Time (e.g., 30 mins)"
                      value={newWorkout.Time}
                      onChange={(e) =>
                        setNewWorkout({
                          ...newWorkout,
                          Time: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Category"
                      value={newWorkout.Category}
                      onChange={(e) =>
                        setNewWorkout({
                          ...newWorkout,
                          Category: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Format"
                      value={newWorkout.Format}
                      onChange={(e) =>
                        setNewWorkout({
                          ...newWorkout,
                          Format: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <select
                      className="form-control"
                      value={newWorkout.Intensity}
                      onChange={(e) =>
                        setNewWorkout({
                          ...newWorkout,
                          Intensity: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Intensity</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setImageFile(file);
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setNewWorkout((prev) => ({ ...prev, Image: imageUrl }));
                      }
                    }}
                  />
                  {newWorkout.Image && (
                    <img
                      src={newWorkout.Image}
                      className="img-fluid mt-2 rounded"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddWorkout(newWorkout)}
                >
                  <i className="ri-check-line me-1"></i> Add Workout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            <i className="ri-arrow-left-line me-1"></i> Back to Workout Plans
          </button>
        </div>

        {/* Workout Assignment Modal */}
        <WorkoutAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          planId={workoutId}
          workouts={allWorkouts}
          onWorkoutAssigned={handleWorkoutAssigned}
        />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function WorkoutDetailsPage() {
  return (
    <Suspense fallback={
      <div className="container-xxl flex-grow-1 container-p-y text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <WorkoutDetailsContent />
    </Suspense>
  );
}
