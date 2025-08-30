"use client";

import React, { useState, useEffect } from "react";
import { fetchWorkoutPlans, updateWorkoutPlan, deleteWorkoutPlan, addWorkoutPlan } from "../utils/api";
import WorkoutPlanAssignmentModal from "../WorkoutPlanAssignmentModal";

export default function ExercisePage() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assignWorkoutId, setAssignWorkoutId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [addingWorkout, setAddingWorkout] = useState(false);
  const [addWorkoutError, setAddWorkoutError] = useState(null);
  const [addWorkoutSuccess, setAddWorkoutSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // New workout form data
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Duration: "",
    Intensity: "Medium"
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(workoutPlans.length / itemsPerPage);
  const paginatedWorkoutPlans = workoutPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter workout plans based on search
  const filteredPlans = workoutPlans.filter(
    (plan) =>
      plan.Name?.toLowerCase().includes(search.toLowerCase()) ||
      plan.Description?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate workout plan statistics
  const calculateWorkoutStats = () => {
    if (!workoutPlans || workoutPlans.length === 0) {
      return {
        totalPlans: 0,
        plansWithSteps: 0,
        longDuration: 0,
        highIntensity: 0
      };
    }

    return {
      totalPlans: workoutPlans.length,
      plansWithSteps: workoutPlans.filter((w) => w.Steps && w.Steps.length > 0).length,
      longDuration: workoutPlans.filter((w) => w.Duration > 30).length,
      highIntensity: workoutPlans.filter((w) => w.Intensity === "High").length
    };
  };

  const stats = calculateWorkoutStats();

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchWorkoutPlansData = async () => {
    try {
      const plans = await fetchWorkoutPlans();
      setWorkoutPlans(plans);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setAddWorkoutError(null);
    setAddWorkoutSuccess(false);

    const trimmedName = formData.Name.trim();
    if (!trimmedName) {
      setAddWorkoutError("Workout name cannot be empty");
      return;
    }

    setAddingWorkout(true);
    try {
      const response = await addWorkoutPlan(formData);
      if (response && response.status === true) {
        // Refresh workout plans list
        await fetchWorkoutPlansData();
        setFormData({
          Name: "",
          Description: "",
          Duration: "",
          Intensity: "Medium"
        });
        setAddWorkoutSuccess(true);
        setTimeout(() => setAddWorkoutSuccess(false), 3000);
      } else {
        throw new Error(response.message || "Failed to add workout plan");
      }
    } catch (error) {
      setAddWorkoutError(error.message || "Failed to add workout plan");
    } finally {
      setAddingWorkout(false);
    }
  };

  const handleEditWorkout = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    const form = e.target;
    const updatedData = {
      Name: form.Name.value.trim(),
      Description: form.Description.value.trim(),
      Duration: form.Duration.value.trim(),
      Intensity: form.Intensity.value
    };

    if (!updatedData.Name) {
      setEditError("Workout name cannot be empty");
      setEditLoading(false);
      return;
    }

    try {
      const response = await updateWorkoutPlan(currentWorkout.Id, updatedData);
      
      if (response && response.status === true && response.data) {
        // Update the local state to reflect the change
        setWorkoutPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.Id === currentWorkout.Id 
              ? { ...plan, ...updatedData }
              : plan
          )
        );
        
        setEditSuccess(true);
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess(false);
        }, 2000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating workout plan:", error);
      setEditError(error.message || "Failed to update workout plan. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Are you sure you want to delete this workout plan?")) {
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteWorkoutPlan(workoutId);
      setWorkoutPlans((prevPlans) => prevPlans.filter((plan) => plan.Id !== workoutId));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      setDeleteError(error.message || "Failed to delete workout plan. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditButtonClick = (workout) => {
    setCurrentWorkout(workout);
    setShowEditModal(true);
    setEditError(null);
    setEditSuccess(false);
  };

  useEffect(() => {
    fetchWorkoutPlansData();
  }, []);

  // Rendering loader or error
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-5">Error: {error}</div>;
  }

  return (
    <div>
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-5">
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-primary">
                        <i className="tf-icons ri-user-add-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{workoutPlans.length}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Workout Plans</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-warning h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-warning">
                        <i className="ri-user-star-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">
                      {workoutPlans.filter((w) => w.Steps && w.Steps.length > 0).length}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Plans with Steps</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-danger h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-danger">
                        <i className="ri-group-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">
                      {workoutPlans.filter((w) => w.Duration > 30).length}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Long Duration</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">30+ min</span>
                    <small className="text-muted">workouts</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-info h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-info">
                        <i className="ri-article-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">
                      {workoutPlans.filter((w) => w.Intensity === "High").length}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">High Intensity</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bs-stepper-content rounded-0">
            <div id="checkout-confirmation" className="content">
              <div className="row">
                <div className="col-xl-8 mb-4 mb-xl-0">
                  <h4>Workout Plans</h4>
                  <ul className="list-group">
                    {paginatedWorkoutPlans.map((workout) => (
                      <li key={workout.Id} className="list-group-item p-5">
                        <div className="d-flex gap-4">
                          <div className="flex-shrink-0">
                            
                          </div>
                          <div className="flex-grow-1">
                            <div className="row d-flex align-items-center">
                              <div className="col-md-8 pt-2">
                                <a
                                  href={`/WorkoutDetails?workoutId=${workout.Id}`}
                                  className="text-body mt-1"
                                >
                                  <h6 className="mb-2">{workout.Name}</h6>
                                </a>
                               
                              </div>
                              <div className="col-md-4">
                                <div className="text-md-end">
                                  <div className="my-2 my-lg-6 d-flex gap-2">
                                    <button
                                      className="btn btn-icon btn-outline-success"
                                      title="Assign User"
                                      onClick={() => {
                                        setAssignWorkoutId(workout.Id);
                                        setShowAssignModal(true);
                                      }}
                                    >
                                      <i className="ri-user-add-line"></i>
                                    </button>
                                    <button
                                      className="btn btn-icon btn-outline-primary"
                                      title="Edit Workout"
                                      onClick={() => {
                                        setCurrentWorkout(workout);
                                        setShowEditModal(true);
                                        handleEditButtonClick(workout);
                                      }}
                                    >
                                      <i className="ri-pencil-line"></i>
                                    </button>
                                    <button
                                      className="btn btn-icon btn-outline-danger"
                                      title="Delete Workout"
                                      onClick={() => handleDeleteWorkout(workout.Id)}
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <nav className="mt-3">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          &laquo;
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>

                {/* New Workout Plan Form on the right  here */}
                <div className="col-xl-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Add New Workout Plan</h5>
                    </div>
                    <div className="card-body">
                      {addWorkoutSuccess && (
                        <div className="alert alert-success" role="alert">
                          Workout plan created successfully!
                        </div>
                      )}
                      {addWorkoutError && (
                        <div className="alert alert-danger" role="alert">
                          {addWorkoutError}
                        </div>
                      )}
                      <form onSubmit={handleAddWorkout}>
                        <div className="mb-3">
                          <label htmlFor="Name" className="form-label">
                            Workout Plan Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="Name"
                            name="Name"
                            value={formData.Name}
                            onChange={handleInputChange}
                            placeholder="Enter workout plan name"
                            disabled={addingWorkout}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="Description" className="form-label">
                            Description
                          </label>
                          <textarea
                            className="form-control"
                            id="Description"
                            name="Description"
                            rows="3"
                            value={formData.Description}
                            onChange={handleInputChange}
                            placeholder="Add a brief description"
                            disabled={addingWorkout}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="Duration" className="form-label">
                            Duration
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="Duration"
                            name="Duration"
                            value={formData.Duration}
                            onChange={handleInputChange}
                            placeholder="e.g., 30 minutes, 1 hour"
                            disabled={addingWorkout}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="Intensity" className="form-label">
                            Intensity Level
                          </label>
                          <select
                            className="form-select"
                            id="Intensity"
                            name="Intensity"
                            value={formData.Intensity}
                            onChange={handleInputChange}
                            disabled={addingWorkout}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={addingWorkout}
                        >
                          {addingWorkout ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Adding...
                            </>
                          ) : (
                            "Add Workout Plan"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Workout Modal */}
      {showEditModal && currentWorkout && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Workout Plan: {currentWorkout.Name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditWorkout}>
                  <div className="mb-3">
                    <label className="form-label">Workout Name</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={currentWorkout.Name}
                      required
                    />
                  </div>
                  <div className="alert alert-info">
                    <small>Note: Only the workout name can be edited. Other fields are read-only.</small>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Plan Assignment Modal */}
      <WorkoutPlanAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        planId={assignWorkoutId}
        onAssignmentSuccess={() => {
          alert("Workout plan assigned to user successfully!");
          setShowAssignModal(false);
        }}
      />
    </div>
  );
}
