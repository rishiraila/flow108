"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function WorkoutDetailsPage() {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editableSteps, setEditableSteps] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState(null);

  const [newStep, setNewStep] = useState({
    Title: "",
    Description: "",
    Duration: 0,
    Repets: 0,
    VideoUrl: "",
    ImageUrl: "",
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
        `https://flow108.coinagesoft.com/api/AdminWorkout/${workoutId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch workout details");

      const data = await response.json();
      setWorkout(data.Data);
      setEditableSteps(data.Data.Steps || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...editableSteps];
    updatedSteps[index][field] = field === "Duration" ? parseInt(value) : value;
    setEditableSteps(updatedSteps);
  };

  const handleSaveStep = async (step) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/WorkoutStep/${step.Id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            Title: step.Title,
            Description: step.Description,
            Duration: step.Duration,
            Repets: step.Repets,
            VideoUrl: step.VideoUrl,
            ImageUrl: step.ImageUrl,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update step");

      alert("Step updated successfully");
      setEditIndex(null);
      fetchWorkoutDetails();
    } catch (err) {
      alert("Error updating step: " + err.message);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!window.confirm("Are you sure you want to delete this step?")) return;

    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminWorkout/steps/${stepId}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete step");

      const result = await response.json();
      alert(result.message || "Step deleted successfully");

      const updatedSteps = editableSteps.filter((step) => step.Id !== stepId);
      setEditableSteps(updatedSteps);

      fetchWorkoutDetails();
    } catch (err) {
      alert("Error deleting step: " + err.message);
    }
  };

  const handleAddStep = async (step) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/WorkoutStep/${workoutId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            Title: step.Title,
            Description: step.Description,
            Duration: step.Duration,
            Repets: step.Repets,
            VideoUrl: step.VideoUrl,
            ImageUrl: step.ImageUrl,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add step");

      alert("Step added successfully!");
      fetchWorkoutDetails();

      setNewStep({
        Title: "",
        Description: "",
        Duration: 0,
        Repets: 0,
        VideoUrl: "",
        ImageUrl: "",
      });
      setImageFile(null);
      setVideoFile(null);
    } catch (err) {
      alert("Error adding step: " + err.message);
    }
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

  if (!workout) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="alert alert-warning">No workout details found.</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Workout Details */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">{workout.Name}</h5>
            <p className="text-muted mb-0">{workout.Description}</p>
          </div>
          <div className="card-body row">
            <div className="col-md-4">
              <img
                src={
                  workout.ImageUrl || "/assets/img/avatars/default-workout.jpg"
                }
                alt={workout.Name}
                className="img-fluid rounded mb-3"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
            <div className="col-md-8">
              <div className="d-flex flex-wrap gap-4 mb-3">
                <div>
                  <span className="text-muted">Duration:</span>
                  <h6 className="mb-0">{workout.Duration} minutes</h6>
                </div>
                <div>
                  <span className="text-muted">Intensity:</span>
                  <h6 className="mb-0">
                    <span
                      className={`badge bg-${
                        workout.Intensity === "High"
                          ? "danger"
                          : workout.Intensity === "Medium"
                          ? "warning"
                          : "success"
                      }`}
                    >
                      {workout.Intensity}
                    </span>
                  </h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Workout Steps</h5>
            <button
              className="btn btn-sm btn-outline-success"
              data-bs-toggle="modal"
              data-bs-target="#addStepModal"
            >
              <i className="ri-add-line me-1"></i> Add Step
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              {editableSteps.map((step, index) => (
                <div className="col-md-4 mb-4" key={step.Id}>
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="card-title mb-1">
                          Step {step.Order}: {step.Title}
                        </h6>
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
                                onClick={() => handleDeleteStep(step.Id)}
                              >
                                🗑️ Delete
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
                            placeholder="Title"
                            value={step.Title}
                            onChange={(e) =>
                              handleStepChange(index, "Title", e.target.value)
                            }
                          />
                          <textarea
                            className="form-control mb-2"
                            placeholder="Description"
                            value={step.Description}
                            onChange={(e) =>
                              handleStepChange(
                                index,
                                "Description",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="number"
                            className="form-control mb-2"
                            placeholder="Duration"
                            value={step.Duration}
                            onChange={(e) =>
                              handleStepChange(
                                index,
                                "Duration",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleSaveStep(step)}
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
                            {step.Duration} min &bull; {step.Repets || 0} reps
                          </small>
                          <p className="card-text mt-2">{step.Description}</p>
                          {step.ImageUrl && (
                            <img
                              src={step.ImageUrl}
                              className="img-fluid rounded mb-2"
                              style={{
                                maxHeight: "150px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          {step.VideoUrl && (
                            <video
                              src={step.VideoUrl}
                              controls
                              className="w-100 rounded"
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
          id="addStepModal"
          tabIndex="-1"
          aria-labelledby="addStepModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Step</h5>
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
                  placeholder="Title"
                  value={newStep.Title}
                  onChange={(e) =>
                    setNewStep({ ...newStep, Title: e.target.value })
                  }
                />
                <textarea
                  className="form-control mb-3"
                  placeholder="Description"
                  value={newStep.Description}
                  onChange={(e) =>
                    setNewStep({ ...newStep, Description: e.target.value })
                  }
                />
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Duration (min)"
                      value={newStep.Duration}
                      onChange={(e) =>
                        setNewStep({
                          ...newStep,
                          Duration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Repetitions"
                      value={newStep.Repets}
                      onChange={(e) =>
                        setNewStep({
                          ...newStep,
                          Repets: parseInt(e.target.value),
                        })
                      }
                    />
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
                        setNewStep((prev) => ({ ...prev, ImageUrl: imageUrl }));
                      }
                    }}
                  />
                  {newStep.ImageUrl && (
                    <img
                      src={newStep.ImageUrl}
                      className="img-fluid mt-2 rounded"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                  )}
                </div>

                {/* Video Upload */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept="video/*"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setVideoFile(file);
                      if (file) {
                        const videoUrl = URL.createObjectURL(file);
                        setNewStep((prev) => ({
                          ...prev,
                          VideoUrl: videoUrl,
                        }));
                      }
                    }}
                  />
                  {newStep.VideoUrl && (
                    <video
                      src={newStep.VideoUrl}
                      controls
                      className="w-100 mt-2 rounded"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
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
                  onClick={() => handleAddStep(newStep)}
                >
                  <i className="ri-check-line me-1"></i> Add Step
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
            <i className="ri-arrow-left-line me-1"></i> Back to Workouts
          </button>
        </div>
      </div>
    </div>
  );
}
