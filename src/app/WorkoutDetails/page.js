"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WorkoutAssignmentModal from "../WorkoutAssignmentModal";
import {
  removeWorkoutFromPlan,
  fetchWorkoutUserAssignments,
  fetchUserProfile,
  updateWorkout,
} from "../utils/api";
import { getImageUrl, isVideoFile } from "../utils/imageUtils";
import authenticatedFetch from "../utils/authenticatedFetch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// MediaDisplay component to handle both images and videos
const MediaDisplay = ({ src, alt, className, style, onError }) => {
  const isVideo = isVideoFile(src);

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

  return (
    <img
      src={getImageUrl(src)}
      className={className}
      alt={alt}
      style={style}
      onError={(e) => {
        e.target.src = getImageUrl("");
        if (onError) onError(e);
      }}
    />
  );
};

// SortableWorkoutItem component for drag-and-drop functionality
const SortableWorkoutItem = ({
  workout,
  index,
  editIndex,
  setEditIndex,
  handleWorkoutChange,
  handleSaveWorkout,
  handleDeleteWorkout,
  removeWorkoutFromPlan,
  workoutPlan,
  setEditableWorkouts,
  editableWorkouts,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workout.WorkoutId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="col-md-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center">
              <div
                {...attributes}
                {...listeners}
                className="me-2"
                style={{ cursor: "grab", fontSize: "1.2rem" }}
              >
                <i className="ri-draggable"></i>
              </div>

              <div>
                <h6 className="card-title mb-1">
                  #{index + 1} – {workout.WorkoutName}
                </h6>

                {/* Time just below workout name, only in view mode */}
                {editIndex !== index && (
                  <small className="text-muted d-block">
                    {workout.Time || workout.Format}
                  </small>
                )}
              </div>
            </div>

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
                          await removeWorkoutFromPlan(
                            workoutPlan.PlanId,
                            workout.WorkoutId
                          );
                          alert("Workout removed from plan successfully");
                          // Update UI after removal
                          setEditableWorkouts((prev) =>
                            prev.filter(
                              (w) => w.WorkoutId !== workout.WorkoutId
                            )
                          );
                        } catch (error) {
                          alert(
                            "Failed to remove workout from plan: " +
                              error.message
                          );
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
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Time (e.g., 30 mins)"
                value={workout.Time}
                onChange={(e) =>
                  handleWorkoutChange(index, "Time", e.target.value)
                }
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Format"
                value={workout.Format}
                onChange={(e) =>
                  handleWorkoutChange(index, "Format", e.target.value)
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
              {/* <small className="text-muted">
                {workout.Time || workout.Format}
              </small> */}
              {workout.Image && (
                <div className="text-center">
                  <MediaDisplay
                    src={workout.Image}
                    alt={workout.WorkoutName}
                    className="img-fluid rounded"
                    style={{
                      maxHeight: "150px",
                      objectFit: "cover",
                      display: "block",
                      margin: "0 auto", // <-- centers horizontaly
                    }}
                  />
                </div>
              )}

              {workout.Audio && (
                <audio controls className="w-100 mb-2">
                  <source src={getImageUrl(workout.Audio)} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
    Time: "",
    Format: "",
    Image: "",
  });

  // State for assigned users functionality
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [unassignLoading, setUnassignLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const searchParams = useSearchParams();
  const workoutId = searchParams.get("workoutId");

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Safety check
    if (!over || active.id === over.id) return;

    const oldIndex = editableWorkouts.findIndex(
      (workout) => workout.WorkoutId === active.id
    );
    const newIndex = editableWorkouts.findIndex(
      (workout) => workout.WorkoutId === over.id
    );

    const newWorkouts = arrayMove(editableWorkouts, oldIndex, newIndex);
    setEditableWorkouts(newWorkouts);

    // 🔽 Save the new order to backend
    try {
      await saveWorkoutOrder(newWorkouts);
      console.log("Workout order saved successfully");
    } catch (err) {
      console.error("Failed to save workout order:", err);
      alert("Failed to save workout order: " + err.message);
      // Revert the UI change if save failed
      setEditableWorkouts(editableWorkouts);
    }
  };

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const data = await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/admin/workout_plan/${workoutId}/workouts`
      );

      setWorkoutPlan(data.data);

      const workouts = data.data.Workouts || [];

      // 🔽 Sort by Order so UI matches backend sequence
      const sorted = [...workouts].sort((a, b) => {
        const aOrder = a.Order ?? 0;
        const bOrder = b.Order ?? 0;
        return aOrder - bOrder;
      });

      setEditableWorkouts(sorted);
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
      // Process Time field to append " min" if only a number is entered
      let processedTime = workout.Time.trim();
      if (/^\d+$/.test(processedTime)) {
        processedTime = processedTime + " min";
      }

      // Prepare data for the API - map WorkoutName to Title
      const workoutData = {
        Title: workout.WorkoutName,
        Time: processedTime,
        Format: workout.Format,
        Image: workout.Image,
      };

      const response = await updateWorkout(workout.WorkoutId, workoutData);

      if (response.status) {
        alert("Workout updated successfully");
        setEditIndex(null);
        fetchWorkoutDetails();
      } else {
        throw new Error(response.message || "Failed to update workout");
      }
    } catch (err) {
      alert("Error updating workout: " + err.message);
    }
  };
  // Save the order/sequence of workouts to backend
  const saveWorkoutOrder = async (workoutsInNewOrder) => {
    // Build payload: each workout gets an Order number (1, 2, 3, ...)
    const payload = workoutsInNewOrder.map((w, index) => ({
      WorkoutId: w.WorkoutId,
      Order: index + 1, // << important: backend expects "Order"
    }));

    await authenticatedFetch(
      `https://flow108.coinagesoft.com/api/admin/workout-plans/${workoutId}/assign-workout`,
      {
        method: "POST",
        body: JSON.stringify({ Workouts: payload }),
      }
    );
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm("Are you sure you want to delete this workout?"))
      return;

    try {
      const result = await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/admin/workout/${workoutId}`,
        {
          method: "DELETE",
        }
      );

      alert(result.message || "Workout deleted successfully");

      const updatedWorkouts = editableWorkouts.filter(
        (workout) => workout.WorkoutId !== workoutId
      );
      setEditableWorkouts(updatedWorkouts);

      fetchWorkoutDetails();
    } catch (err) {
      alert("Error deleting workout: " + err.message);
    }
  };

  const handleAddWorkout = async (workout) => {
    try {
      // Process Time field to append " min" if only a number is entered
      let processedTime = workout.Time.trim();
      if (/^\d+$/.test(processedTime)) {
        processedTime = processedTime + " min";
      }

      await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/admin/workout_plan/${workoutId}/workouts`,
        {
          method: "POST",
          body: JSON.stringify({
            WorkoutName: workout.WorkoutName,
            Time: processedTime,
            Format: workout.Format,
            Image: workout.Image,
          }),
        }
      );

      alert("Workout added successfully!");
      fetchWorkoutDetails();

      setNewWorkout({
        WorkoutName: "",
        Time: "",
        Format: "",
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
      const data = await authenticatedFetch(
        "https://flow108.coinagesoft.com/api/admin/workouts"
      );

      const workouts = data.data || data.Data || [];
      setAllWorkouts(workouts);
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

  // Function to fetch assigned users for this workout plan
  const fetchAssignedUsers = async () => {
    try {
      setUsersLoading(true);
      const assignments = await fetchWorkoutUserAssignments(workoutId);

      // Fetch user profiles for each assignment
      const usersWithProfiles = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const profile = await fetchUserProfile(assignment.UserId);
            return {
              ...assignment,
              userName: profile.name,
              userAvatar: profile.avatar,
            };
          } catch (error) {
            console.error(
              `Error fetching profile for user ${assignment.UserId}:`,
              error
            );
            return {
              ...assignment,
              userName: "Unknown User",
              userAvatar:
                "https://ui-avatars.com/api/?name=Unknown&background=random",
            };
          }
        })
      );

      setAssignedUsers(usersWithProfiles);
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      alert("Failed to fetch assigned users: " + error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  // Function to open the assigned users modal
  const handleShowAssignedUsers = async () => {
    setShowUsersModal(true);
    await fetchAssignedUsers();
  };

  // Function to unassign user from workout plan
  const handleUnassignUser = async (userId, planId) => {
    if (
      !window.confirm(
        "Are you sure you want to unassign this user from the workout plan?"
      )
    )
      return;

    try {
      const result = await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/admin/users/${userId}/unassign-plan/${planId}`,
        {
          method: "DELETE",
        }
      );

      alert(result.message || "User unassigned successfully");

      // Remove the user from the assignedUsers state to update UI immediately
      setAssignedUsers((prevUsers) =>
        prevUsers.filter((user) => user.UserId !== userId)
      );

      // Refresh the assigned users list from server to ensure consistency
      await fetchAssignedUsers();
    } catch (err) {
      alert("Error unassigning user: " + err.message);
    }
  };

  // Function to toggle user selection for bulk unassignment
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  // Function to handle bulk unassignment
  const handleBulkUnassign = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user to unassign.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to unassign ${selectedUsers.length} user(s) from the workout plan?`
      )
    )
      return;

    setUnassignLoading(true);
    try {
      for (const userId of selectedUsers) {
        await authenticatedFetch(
          `https://flow108.coinagesoft.com/api/admin/users/${userId}/unassign-plan/${workoutId}`,
          {
            method: "DELETE",
          }
        );
      }

      alert(`${selectedUsers.length} user(s) unassigned successfully`);

      // Remove the users from the assignedUsers state to update UI immediately
      setAssignedUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedUsers.includes(user.UserId))
      );

      // Clear selection
      setSelectedUsers([]);

      // Refresh the assigned users list from server to ensure consistency
      await fetchAssignedUsers();
    } catch (err) {
      alert("Error unassigning users: " + err.message);
    } finally {
      setUnassignLoading(false);
    }
  };

  // Filter assigned users based on search
  const filteredAssignedUsers = assignedUsers.filter((user) =>
    `${user.userName} ${user.userEmail || user.UserId}`
      .toLowerCase()
      .includes(userSearch.toLowerCase())
  );

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
        <div className="alert alert-warning">
          No workout plan details found.
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Workout Plan Details */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{workoutPlan.PlanName}</h5>
              <p className="text-muted mb-0">Plan ID: {workoutPlan.PlanId}</p>
            </div>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={handleShowAssignedUsers}
              disabled={usersLoading}
            >
              <i className="ri-user-line me-1"></i> View Assigned Users
            </button>
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
            </div>
          </div>
          <div className="card-body">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={editableWorkouts.map((workout) => workout.WorkoutId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="row">
                  {editableWorkouts.map((workout, index) => (
                    <SortableWorkoutItem
                      key={workout.WorkoutId}
                      workout={workout}
                      index={index}
                      editIndex={editIndex}
                      setEditIndex={setEditIndex}
                      handleWorkoutChange={handleWorkoutChange}
                      handleSaveWorkout={handleSaveWorkout}
                      handleDeleteWorkout={handleDeleteWorkout}
                      removeWorkoutFromPlan={removeWorkoutFromPlan}
                      workoutPlan={workoutPlan}
                      setEditableWorkouts={setEditableWorkouts}
                      editableWorkouts={editableWorkouts}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
                    setNewWorkout({
                      ...newWorkout,
                      WorkoutName: e.target.value,
                    })
                  }
                />
                <div className="row">
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
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
                      src={getImageUrl(newWorkout.Image)}
                      className="img-fluid mt-2 rounded"
                      style={{ maxHeight: "150px", objectFit: "cover" }}
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
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
          existingPlanWorkouts={editableWorkouts}
        />

        {/* Assigned Users Modal */}
        {showUsersModal && (
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Users Assigned to {workoutPlan.PlanName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUsersModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {usersLoading ? (
                    <div className="text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading assigned users...</p>
                    </div>
                  ) : assignedUsers.length === 0 ? (
                    <div className="text-center text-muted">
                      <i
                        className="ri-user-unfollow-line"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <p className="mt-2">
                        No users assigned to this workout plan yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-3">
                        <input
                          type="text"
                          className="form-control w-50"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      {filteredAssignedUsers.length === 0 ? (
                        <div className="text-center text-muted">
                          <i
                            className="ri-search-line"
                            style={{ fontSize: "3rem" }}
                          ></i>
                          <p className="mt-2">No users found.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedUsers.length ===
                                        filteredAssignedUsers.length &&
                                      filteredAssignedUsers.length > 0
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUsers(
                                          filteredAssignedUsers.map((u) => u.UserId)
                                        );
                                      } else {
                                        setSelectedUsers([]);
                                      }
                                    }}
                                  />
                                </th>
                                <th>User</th>
                                <th>Assigned Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAssignedUsers.map((user) => (
                                <tr key={user.AssignmentId}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={selectedUsers.includes(user.UserId)}
                                      onChange={() =>
                                        toggleUserSelection(user.UserId)
                                      }
                                    />
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <img
                                        src={getImageUrl(user.userAvatar)}
                                        alt={user.userName}
                                        className="rounded-circle me-2"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <div>
                                        <div className="fw-semibold">
                                          {user.userName}
                                        </div>
                                        <small className="text-muted">
                                          Email: {user.userEmail || user.UserId}
                                        </small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    {new Date(
                                      user.AssignedDate
                                    ).toLocaleDateString()}
                                  </td>
                                  <td>
                                    <span
                                      className={`badge bg-${
                                        user.Status === "Active"
                                          ? "success"
                                          : user.Status === "Completed"
                                          ? "primary"
                                          : "secondary"
                                      }`}
                                    >
                                      {user.Status || "Active"}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() =>
                                        handleUnassignUser(user.UserId, workoutId)
                                      }
                                    >
                                      Unassign
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedUsers.length > 0 && (
                    <button
                      className="btn btn-danger me-auto"
                      onClick={handleBulkUnassign}
                      disabled={unassignLoading}
                    >
                      {unassignLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Unassigning...
                        </>
                      ) : (
                        <>
                          <i className="ri-user-unfollow-line me-1"></i>
                          Unassign Selected ({selectedUsers.length})
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUsersModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal backdrop */}
        {showUsersModal && <div className="modal-backdrop fade show"></div>}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function WorkoutDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-xxl flex-grow-1 container-p-y text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <WorkoutDetailsContent />
    </Suspense>
  );
}
