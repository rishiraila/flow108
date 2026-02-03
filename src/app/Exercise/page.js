"use client";

import React, { useState, useEffect } from "react";
import { fetchWorkoutPlans, updateWorkoutPlan, deleteWorkoutPlan, addWorkoutPlan } from "../utils/api";
import WorkoutPlanAssignmentModal from "../WorkoutPlanAssignmentModal";
import { getImageUrl, isVideoFile, isAudioFile, processWorkoutImages } from "../utils/imageUtils";
import { useAlert } from "../utils/alertcontxt";
import { useConfirm } from "../utils/confirmContext";

// MediaDisplay component to handle images, videos, and audio
const MediaDisplay = ({ src, alt, className, style, onError }) => {
  const isVideo = isVideoFile(src);
  const isAudio = isAudioFile(src);

  if (isVideo) {
    return (
      <video
        src={getImageUrl(src)}
        className={className}
        style={style}
        controls
        onError={onError}
        muted
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  if (isAudio) {
    return (
      <div className={className} style={style}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light rounded">
          <i className="bi bi-music-note fs-1 text-muted mb-2"></i>
          <audio
            src={getImageUrl(src)}
            controls
            onError={onError}
            className="w-100"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      </div>
    );
  }

  return (
    <img
      src={getImageUrl(src)}
      className={className}
      alt={alt}
      style={style}
      onError={(e) => {
        e.target.src = getImageUrl('');
        if (onError) onError(e);
      }}
    />
  );
};

export default function ExercisePage() {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [assignWorkoutId, setAssignWorkoutId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [addingWorkout, setAddingWorkout] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // File error states
  const [addFileError, setAddFileError] = useState('');
  const [addTimeError, setAddTimeError] = useState('');
  const [editFileError, setEditFileError] = useState('');

  // New workout form data
  const [formData, setFormData] = useState({
    Name: "",
    Time: "",
    Description: "",
    Category: "",
    Image: null,
    Intensity: "None"
  });

  // Filter workout plans based on search and category
  const filteredPlans = workoutPlans.filter(
    (plan) => {
      const matchesSearch =
        plan.Name?.toLowerCase().includes(search.toLowerCase()) ||
        plan.Description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "" || plan.Category === categoryFilter;
      return matchesSearch && matchesCategory;
    }
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
      const file = files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        if (isImage && file.size > 1024 * 1024) {
          setAddFileError('Image size must be below 1MB');
          return;
        }
        if ((isVideo || isAudio) && file.size > 10 * 1024 * 1024) {
          setAddFileError('Video/Audio size must be below 10MB');
          return;
        }
        setAddFileError('');
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      } else {
        setAddFileError('');
        setFormData((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (name === 'Time' && value.trim()) {
        setAddTimeError('');
      }
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        if (isImage && file.size > 1024 * 1024) {
          setEditFileError('Image size must be below 1MB');
          return;
        }
        if ((isVideo || isAudio) && file.size > 10 * 1024 * 1024) {
          setEditFileError('Video/Audio size must be below 10MB');
          return;
        }
        setEditFileError('');
        setCurrentWorkout((prev) => ({
          ...prev,
          [name]: file,
        }));
      } else {
        setEditFileError('');
        setCurrentWorkout((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    } else {
      setCurrentWorkout((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

 const handleAddWorkout = async (e) => {
    e.preventDefault();
    const trimmedName = formData.Name.trim();
    if (!trimmedName) {
      showAlert("error", "Workout name cannot be empty");
      return;
    }

    const trimmedTime = formData.Time.trim();
    if (!trimmedTime) {
      setAddTimeError("Time is required");
      showAlert("error", "Time is required");
      return;
    }

    let processedTime = trimmedTime;
    if (/^\d+$/.test(processedTime)) {
      processedTime += " min";
    }

    setAddingWorkout(true);
    try {
      const response = await addWorkoutPlan({ ...formData, Time: processedTime });
      if (response?.status === true) {
        await fetchWorkoutPlansData();
        setFormData({
          Name: "",
          Time: "",
          Description: "",
          Category: "",
          Image: null,
          Intensity: "None",
        });
        showAlert("success", "Workout plan created successfully!");
      } else {
        throw new Error(response.message || "Failed to add workout plan");
      }
    } catch (error) {
      showAlert("error", error.message || "Failed to add workout plan");
    } finally {
      setAddingWorkout(false);
    }
  };

  const handleEditWorkout = async (e) => {
  e.preventDefault();

  let updatedTime = currentWorkout.Time?.trim() || "";
  if (/^\d+$/.test(updatedTime)) {
    updatedTime += " min";
  }

  const updatedData = {
    Name: currentWorkout.Name?.trim(),
    Description: currentWorkout.Description?.trim(),
    Time: updatedTime,
    Category: currentWorkout.Category,
    Intensity: currentWorkout.Intensity,
  };

  if (currentWorkout.Image instanceof File) {
    updatedData.Image = currentWorkout.Image;
  }

  if (!updatedData.Name) {
    showAlert("error", "Workout name cannot be empty");
    return;
  }

  try {
    const response = await updateWorkoutPlan(
      currentWorkout.Id,
      updatedData
    );

    if (response?.status === true) {
      setWorkoutPlans((prev) =>
        prev.map((plan) =>
          plan.Id === currentWorkout.Id ? response.data : plan
        )
      );

      showAlert("success", response.message || "Workout plan updated!");
      setShowEditModal(false);
    } else {
      throw new Error(response?.message || "Update failed");
    }
  } catch (error) {
    showAlert("error", error.message || "Failed to update workout plan");
  }
};


  const handleDeleteWorkout = (workoutId) => {
    showConfirm(
      "Are you sure you want to delete this workout plan? This action cannot be undone.",
      async () => {
        setDeleteLoading(true);
        try {
          await deleteWorkoutPlan(workoutId);
          setWorkoutPlans((prev) => prev.filter((plan) => plan.Id !== workoutId));
          showAlert("success", "Workout plan deleted successfully!");
        } catch (error) {
          showAlert("error", error.message || "Failed to delete workout plan");
        } finally {
          setDeleteLoading(false);
        }
      },
      () => {
        // Cancel
      }
    );
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
      {/* Styled Alerts */}
     

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
                  <div className="d-flex gap-3 mb-3" style={{ maxWidth: '600px' }}>
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                      <span className="input-group-text"><i className="ri-search-line"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search workout plans..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="form-select"
                      style={{ maxWidth: '200px' }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="Mind">Mind</option>
                      <option value="Body">Body</option>
                    </select>
                  </div>
                  <ul className="list-group">
                    {paginatedWorkoutPlans.map((workout) => (
                      <li key={workout.Id} className="list-group-item p-5 bg-white">
                        <div className="d-flex gap-4">
                          <div className="flex-shrink-0">
                            <MediaDisplay
                              src={workout.Image}
                              alt={workout.Name}
                              className="rounded"
                              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = "/placeholder.jpg";
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
                            required
                          />
                          <span className="input-group-text"><i className="ri-time-line"></i></span>
                        </div>
                        {addTimeError && (
                          <div className="text-danger small mt-1">{addTimeError}</div>
                        )}
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
                      <label className="form-label">Workout Image/Video/Audio</label>
                      <div className="card">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <i className="bi bi-image fs-1 text-muted"></i>
                          </div>
                          <input
                            type="file"
                            className="form-control"
                            id="Image"
                            name="Image"
                            onChange={handleInputChange}
                            disabled={addingWorkout}
                            accept="image/*,video/*,audio/*"
                          />
                          <div className="form-text mt-2">
                            Upload an image (max 1MB), video (max 10MB), or audio (max 10MB) for this workout.
                          </div>
                        </div>
                      </div>
                      {addFileError && <div className="alert alert-danger mt-2">{addFileError}</div>}
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={addingWorkout || !!addFileError}
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
                        value={currentWorkout.Name || ""}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Intensity Level *</label>
                      <select
                        className="form-select"
                        id="editIntensity"
                        name="Intensity"
                        value={currentWorkout.Intensity || "None"}
                        onChange={handleEditInputChange}
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
                      value={currentWorkout.Description || ""}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        className="form-select"
                        id="editCategory"
                        name="Category"
                        value={currentWorkout.Category || ""}
                        onChange={handleEditInputChange}
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
                          value={currentWorkout.Time || ""}
                          onChange={handleEditInputChange}
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
          showAlert("success", "Workout plan assigned successfully!");
          setShowAssignModal(false);
        }}
      />
    </div>
  );
}
