"use client";

import React, { useState, useEffect } from "react";
import { fetchWorkoutPlans, updateWorkoutPlan, deleteWorkoutPlan, addWorkoutPlan } from "../utils/api";
import WorkoutPlanAssignmentModal from "../WorkoutPlanAssignmentModal";
import { getImageUrl } from "../utils/imageUtils";

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
    Time: "",
    Description: "",
    Category: "",
    Image: null,
    Intensity: "None"
  });

  // Filter workout plans based on search
  const filteredPlans = workoutPlans.filter(
    (plan) =>
      plan.Name?.toLowerCase().includes(search.toLowerCase()) ||
      plan.Description?.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedWorkoutPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
      longDuration: workoutPlans.filter((w) => {
        const timeValue = parseInt(w.Time);
        return !isNaN(timeValue) && timeValue > 30;
      }).length,
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
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

    // Process Time field to append " min" if only a number is entered
    let processedTime = formData.Time.trim();
    if (/^\d+$/.test(processedTime)) {
      processedTime = processedTime + " min";
    }

    setAddingWorkout(true);
    try {
      const response = await addWorkoutPlan({ ...formData, Time: processedTime });
      if (response && response.status === true) {
        // Refresh workout plans list
        await fetchWorkoutPlansData();
        setFormData({
          Name: "",
          Time: "",
          Description: "",
          Category: "",
          Image: null,
          Intensity: "None"
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

  let updatedTime = form.Time.value.trim();
  if (/^\d+$/.test(updatedTime)) {
    updatedTime = updatedTime + " min";
  }

  // Build plain object for update
  const updatedData = {
    Name: form.Name.value.trim(),
    Description: form.Description.value.trim(),
    Time: updatedTime,
    Category: form.Category.value.trim(),
    Intensity: form.Intensity.value,
  };

  // Append file if new image selected
  if (form.Image.files && form.Image.files.length > 0) {
    updatedData.Image = form.Image.files[0];
  }

  if (!updatedData.Name) {
    setEditError("Workout name cannot be empty");
    setEditLoading(false);
    return;
  }

  try {
    console.log("Sending update request with data:", updatedData);
    const response = await updateWorkoutPlan(currentWorkout.Id, updatedData);

    console.log("Update response:", response);

    if (response && response.status === true && response.data) {
      setWorkoutPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.Id === currentWorkout.Id
            ? { ...plan, ...response.data } // use backend’s updated data
            : plan
        )
      );

      alert("Workout plan updated successfully!");
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
      }, 2000);
    } else {
      throw new Error(response?.message || "Invalid response from server");
    }
  } catch (error) {
    console.error("Error updating workout plan:", error);
    setEditError(
      error.message || "Failed to update workout plan. Please try again."
    );
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
                  {/* <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p> */}
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
                      {stats.plansWithSteps}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Plans with Steps</h6>
                  {/* <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p> */}
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
                      {stats.longDuration}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Long Duration</h6>
                  {/* <p className="mb-0">
                    <span className="me-1 fw-medium">30+ min</span>
                    <small className="text-muted">workouts</small>
                  </p> */}
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
                      {stats.highIntensity}
                    </h4>
                  </div>
                  <h6 className="mb-0 fw-normal">High Intensity</h6>
                  {/* <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          <div className="bs-stepper-content rounded-0">
            <div id="checkout-confirmation" className="content">
              <div className="row">
                <div className="col-md-8 mb-4 mb-xl-0">
                  <h4>Workout Plans</h4>
                  <div className="input-group mb-3" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text"><i className="ri-search-line"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search workout plans..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <ul className="list-group">
                    {paginatedWorkoutPlans.map((workout) => (
                      <li key={workout.Id} className="list-group-item p-5 bg-white">
                        <div className="d-flex gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={getImageUrl(workout.Image)}
                              alt={workout.Name}
                              className="rounded"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZTllY2VmIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iI2FkYjViZCIvPjxwYXRoIGQ9Ik03MCAxMjAgUTEwMCAxMDAgMTMwIDEyMCBRMTMwIDE0MCAxMDAgMTUwIFE3MCAxNDAgNzAgMTIwIFoiIGZpbGw9IiNhZGI1YmQiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZjNzU3ZCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
                              }}
                            />
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
                                <p className="mb-1 text-muted small">
                                  {workout.Description && workout.Description.length > 100
                                    ? `${workout.Description.substring(0, 100)}...`
                                    : workout.Description}
                                </p>
                                <div className="d-flex gap-3 small text-muted">
                                  {workout.Time && <span><i className="ri-time-line me-1"></i>{workout.Time}</span>}
                                  {workout.Category && <span><i className="ri-price-tag-3-line me-1"></i>{workout.Category}</span>}
                                  {workout.Intensity && workout.Intensity !== "None" && (
                                    <span><i className="ri-flashlight-line me-1"></i>{workout.Intensity}</span>
                                  )}
                                </div>
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
                <div className="col-md-4">
                  <div className="card bg-white">
                    <div className="card-body">
                      <h4>Add New Workout Plan</h4>
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
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Workout Plan Name *</label>
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
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
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
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        id="Category"
                        name="Category"
                        value={formData.Category}
                        onChange={handleInputChange}
                        disabled={addingWorkout}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Mind">Mind</option>
                        <option value="Body">Body</option>
                      </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Time *</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="Time"
                            name="Time"
                            value={formData.Time}
                            onChange={handleInputChange}
                            placeholder="e.g., 30 minutes, 1 hour"
                            disabled={addingWorkout}
                          />
                          <span className="input-group-text"><i className="ri-time-line"></i></span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Intensity Level *</label>
                      <select
                        className="form-select"
                        id="Intensity"
                        name="Intensity"
                        value={formData.Intensity}
                        onChange={handleInputChange}
                        disabled={addingWorkout}
                      >
                        <option value="None">None</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      <div className="card">
                        <div className="card-body">
                          <input
                            type="file"
                            className="form-control"
                            id="Image"
                            name="Image"
                            onChange={handleInputChange}
                            disabled={addingWorkout}
                            accept="image/*"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Workout Plan Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editName"
                        name="Name"
                        defaultValue={currentWorkout.Name}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Intensity Level *</label>
                      <select
                        className="form-select"
                        id="editIntensity"
                        name="Intensity"
                        defaultValue={currentWorkout.Intensity || "None"}
                      >
                        <option value="None">None</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      id="editDescription"
                      name="Description"
                      rows="3"
                      defaultValue={currentWorkout.Description || ""}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        id="editCategory"
                        name="Category"
                        defaultValue={currentWorkout.Category || ""}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Mind">Mind</option>
                        <option value="Body">Body</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Time *</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="editTime"
                          name="Time"
                          defaultValue={currentWorkout.Time || ""}
                          placeholder="e.g., 30 minutes, 1 hour"
                        />
                        <span className="input-group-text"><i className="ri-time-line"></i></span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <div className="card">
                      <div className="card-body">
                        <input
                          type="file"
                          className="form-control"
                          id="editImage"
                          name="Image"
                          accept="image/*"
                        />
                        {currentWorkout.Image && (
                          <small className="text-muted">Current image will be replaced if you select a new one.</small>
                        )}
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
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
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
