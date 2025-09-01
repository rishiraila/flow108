"use client";

import React, { useState, useEffect } from "react";
import { fetchAllWorkouts, addWorkout, updateWorkout, deleteWorkout } from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [newWorkout, setNewWorkout] = useState({
    Title: "",
    Time: "",
    Format: "",
    Image: ""
  });

  // Fetch workouts from API
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = async (id) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const response = await deleteWorkout(id);

      if (response.status) {
        alert("Workout deleted successfully!");
        fetchWorkouts(); // Refresh the list
      } else {
        alert("Failed to delete workout");
      }
    } catch (err) {
      console.error("Error deleting workout:", err);
      alert("Error deleting workout");
    }
  };

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const workoutsData = await fetchAllWorkouts();
      setWorkouts(workoutsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching workouts:", err);

      let errorMessage = "Failed to fetch workouts";

      if (err.name === "AbortError") {
        errorMessage = "Request timeout - please check your connection";
      } else if (err.message.includes("Failed to fetch")) {
        errorMessage = "Network error - please check your connection or try again later";
      } else if (err.message.includes("HTTP error")) {
        errorMessage = `Server error (${err.message.match(/\d+/)?.[0] || "unknown"})`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();

    try {
      const response = await addWorkout(newWorkout);

      if (response.status) {
        alert("Workout added successfully!");
        setShowAddModal(false);
        setNewWorkout({
          Title: "",
          Time: "",
          Format: "",
          Image: ""
        });
        
        // Force a complete refresh by resetting state and re-fetching
        setWorkouts([]);
        setLoading(true);
        setTimeout(() => {
          fetchWorkouts(); // Refresh the list
        }, 100);
      }
    } catch (err) {
      console.error("Error adding workout:", err);
      alert("Failed to add workout");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkout((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingWorkout((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleEditWorkout = async (e) => {
    e.preventDefault();

    if (!editingWorkout) return;

    try {
      const response = await updateWorkout(editingWorkout.Id, editingWorkout);

      if (response.status) {
        alert("Workout updated successfully!");
        setShowEditModal(false);
        setEditingWorkout(null);
        
        // Force a complete refresh by resetting state and re-fetching
        setWorkouts([]);
        setLoading(true);
        setTimeout(() => {
          fetchWorkouts(); // Refresh the list
        }, 100);
      }
    } catch (err) {
      console.error("Error updating workout:", err);
      alert(`Failed to update workout: ${err.message}`);
    }
  };

  const openEditModal = (workout) => {
    setEditingWorkout({ ...workout });
    setShowEditModal(true);
  };

  const openWorkoutModal = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const closeWorkoutModal = () => {
    setShowWorkoutModal(false);
    setSelectedWorkout(null);
  };



  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-6 g-6">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Workouts</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Workout
                </button>
              </div>
              <div className="card-body">
                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading workouts...</p>
                  </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && workouts.length === 0 && (
                  <div className="text-center py-4">
                    <p>No workouts found.</p>
                  </div>
                )}

                {!loading && !error && workouts.length > 0 && (
                  <div className="row">
                    {workouts.map((workout) => (
                      <div key={workout.Id} className="col-md-4 mb-4">
                        <div className="card h-100 d-flex flex-column">
                          <img
                            src={getImageUrl(workout.Image)}
                            className="card-img-top"
                            alt={workout.Title}
                            style={{ height: "200px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />

                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{workout.Title}</h5>

                            <div className="mb-2">
                              <small className="text-muted">
                                <i className="ri-time-line me-1"></i>
                                {workout.Time}
                              </small>
                            </div>

                            <div className="mb-2">
                              <span className="badge bg-label-info">
                                {workout.Format}
                              </span>
                            </div>

                            {/* Push buttons to bottom with mt-auto */}
                            <div className="mt-auto d-flex justify-content-between">
                              <button
                                className="btn btn-sm btn-primary"
                                title="View Workout"
                                onClick={() => openWorkoutModal(workout)}
                              >
                                <i className="bi bi-eye me-1"></i> View Workout
                              </button>

                              <div>
                                <button
                                  className="btn btn-sm btn-outline-secondary me-2"
                                  title="Edit Workout"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(workout);
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Workout"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWorkout(workout.Id);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Workout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddWorkout}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Title"
                        value={newWorkout.Title}
                        onChange={handleInputChange}
                        placeholder="Enter workout title"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Format *</label>
                      <select
                        className="form-select"
                        name="Format"
                        value={newWorkout.Format}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Format</option>
                        <option value="Duration">Duration</option>
                        <option value="Repetitions">Repetitions</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Time *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Time"
                      value={newWorkout.Time}
                      onChange={handleInputChange}
                      placeholder="e.g., 30 minutes, 10 reps"
                      required
                    />
                    <div className="form-text">Enter the time or number of repetitions</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Workout Image</label>
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <i className="bi bi-image fs-1 text-muted"></i>
                        </div>
                        <input
                          type="file"
                          className="form-control"
                          name="Image"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setNewWorkout((prev) => ({ ...prev, Image: file }));
                          }}
                        />
                        <div className="form-text mt-2">
                          Upload an image for this workout (optional)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Workout
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workout Modal */}
      {showEditModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Workout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditWorkout}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Title"
                        value={editingWorkout?.Title || ""}
                        onChange={handleEditInputChange}
                        placeholder="Enter workout title"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Format *</label>
                      <select
                        className="form-select"
                        name="Format"
                        value={editingWorkout?.Format || ""}
                        onChange={handleEditInputChange}
                        required
                      >
                        <option value="">Select Format</option>
                        <option value="Duration">Duration</option>
                        <option value="Repetitions">Repetitions</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Time *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Time"
                      value={editingWorkout?.Time || ""}
                      onChange={handleEditInputChange}
                      placeholder="e.g., 30 minutes, 10 reps"
                      required
                    />
                    <div className="form-text">Enter the time or number of repetitions</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Workout Image</label>
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <i className="bi bi-image fs-1 text-muted"></i>
                        </div>
                        <input
                          type="file"
                          className="form-control"
                          name="Image"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setEditingWorkout((prev) => ({ ...prev, Image: file }));
                          }}
                        />
                        <div className="form-text mt-2">
                          Upload an image for this workout (optional)
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Workout
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Detail Modal */}
      {showWorkoutModal && selectedWorkout && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedWorkout.Title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeWorkoutModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <img
                      src={getImageUrl(selectedWorkout.Image)}
                      className="img-fluid rounded mb-3"
                      alt={selectedWorkout.Title}
                      style={{
                        maxHeight: "300px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Time:</strong> {selectedWorkout.Time}
                    </div>

                    <div className="mb-3">
                      <strong>Format:</strong>
                      <span className="badge bg-label-info ms-2">
                        {selectedWorkout.Format}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeWorkoutModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
