"use client";

import React, { useState, useEffect } from "react";
import { fetchAllWorkouts, addWorkout, updateWorkout, deleteWorkout } from "../utils/api";

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
    Description: "",
    Time: "",
    Category: "",
    Format: "",
    Intensity: 1,
    Image: ""
  });

  // Fetch workouts from API
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url; // already absolute
    return `https://flow108.coinagesoft.com${url}`; // prepend API domain
  };

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
          Description: "",
          Time: "",
          Category: "",
          Format: "",
          Intensity: 1,
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingWorkout((prev) => ({ ...prev, [name]: value }));
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

  const getIntensityLabel = (intensity) => {
    switch (intensity) {
      case 1: return "Low";
      case 2: return "Medium";
      case 3: return "High";
      default: return "Unknown";
    }
  };

  const getIntensityBadgeClass = (intensity) => {
    switch (intensity) {
      case 1: return "bg-label-success";
      case 2: return "bg-label-warning";
      case 3: return "bg-label-danger";
      default: return "bg-label-secondary";
    }
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
                            <p className="card-text">{workout.Description}</p>
                            
                            <div className="mb-2">
                              <small className="text-muted">
                                <i className="ri-time-line me-1"></i>
                                {workout.Time}
                              </small>
                            </div>
                            
                            <div className="mb-2">
                              <span className="badge bg-label-primary me-1">
                                {workout.Category}
                              </span>
                              <span className="badge bg-label-info me-1">
                                {workout.Format}
                              </span>
                              <span className={`badge ${getIntensityBadgeClass(workout.Intensity)}`}>
                                {getIntensityLabel(workout.Intensity)}
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
                  <div className="mb-3">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Title"
                      value={newWorkout.Title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="Description"
                      value={newWorkout.Description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Time</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Time"
                      value={newWorkout.Time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Category"
                      value={newWorkout.Category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Format</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Format"
                      value={newWorkout.Format}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Intensity</label>
                    <select
                      className="form-control"
                      name="Intensity"
                      value={newWorkout.Intensity}
                      onChange={handleInputChange}
                      required
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Image</label>
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
                  <div className="mb-3">
                    <label>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Title"
                      value={editingWorkout?.Title || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="Description"
                      value={editingWorkout?.Description || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Time</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Time"
                      value={editingWorkout?.Time || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Category"
                      value={editingWorkout?.Category || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Format</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Format"
                      value={editingWorkout?.Format || ""}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Intensity</label>
                    <select
                      className="form-control"
                      name="Intensity"
                      value={editingWorkout?.Intensity || 1}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Image</label>
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
                    <h6>Description</h6>
                    <p>{selectedWorkout.Description}</p>
                    
                    <div className="mb-3">
                      <strong>Time:</strong> {selectedWorkout.Time}
                    </div>
                    
                    <div className="mb-3">
                      <strong>Category:</strong> 
                      <span className="badge bg-label-primary ms-2">
                        {selectedWorkout.Category}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Format:</strong> 
                      <span className="badge bg-label-info ms-2">
                        {selectedWorkout.Format}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Intensity:</strong> 
                      <span className={`badge ${getIntensityBadgeClass(selectedWorkout.Intensity)} ms-2`}>
                        {getIntensityLabel(selectedWorkout.Intensity)}
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
