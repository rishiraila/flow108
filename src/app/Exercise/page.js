 'use client'

import React, { useState, useEffect } from 'react';

export default function ExercisePage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editableSteps, setEditableSteps] = useState([]);
  const [newSteps, setNewSteps] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
const [selectedUsers, setSelectedUsers] = useState([]);
const [assignWorkoutId, setAssignWorkoutId] = useState(null);


  useEffect(() => {
    fetchWorkouts();
  }, []);
const handleNewStepChange = (index, field, value) => {
  const updatedSteps = [...newSteps];
  updatedSteps[index][field] = field === 'Duration' || field === 'Order' ? parseInt(value) : value;
  setNewSteps(updatedSteps);
};
const fetchUsers = async () => {
  try {
    const res = await fetch("https://flow108.coinagesoft.com/api/AdminAccount/all-users");
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    console.log("User API response:", data);

    // Ensure it's an array
    if (Array.isArray(data)) {
      setAllUsers(data);
    } else if (Array.isArray(data.users)) {
      // Sometimes APIs return { users: [...] }
      setAllUsers(data.users);
    } else {
      console.error("Unexpected response format:", data);
      setAllUsers([]); // fallback to empty array
    }
  } catch (err) {
    console.error("User fetch error:", err);
    alert("Error fetching users. Please try again later."); // User feedback
    setAllUsers([]); // prevent .map crash
  }
};


useEffect(() => {
  fetchWorkouts();
  fetchUsers();
}, []);

const handleAddNewStep = () => {
  const newStep = {
    Title: '',
    Description: '',
    Duration: 0,
    Order: newSteps.length + 1
  };
  setNewSteps([...newSteps, newStep]);
};

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('https://flow108.coinagesoft.com/api/AdminWorkout/workouts');
      if (!response.ok) throw new Error('Failed to fetch workouts');
      const data = await response.json();
      setWorkouts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

const handleAddWorkout = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newWorkout = {
    Id: crypto.randomUUID(),
    Name: formData.get('planName'),
    Description: formData.get('features'),
    Duration: parseInt(formData.get('duration')) || 0,
    Intensity: formData.get('intensity') || "Medium",
    ImageUrl: formData.get('imageUrl') || "https://example.com/images/default-workout.png",
    Steps: newSteps
  };

  try {
    const response = await fetch('https://flow108.coinagesoft.com/api/AdminWorkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(newWorkout)
    });

    if (!response.ok) throw new Error('Failed to add workout');

    alert("Exercise plan is added");

    // ✅ Clear form + steps
    e.target.reset();
    setNewSteps([]);

    // ✅ Fetch again
    fetchWorkouts();
  } catch (err) {
    alert("Error adding workout: " + err.message);
  }
};
const handleAssignUsers = async (e) => {
  e.preventDefault();
  if (!assignWorkoutId || selectedUsers.length === 0) {
    alert("Please select at least one user");
    return;
  }

  try {
    const response = await fetch("https://flow108.coinagesoft.com/api/AdminWorkout/assign-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*"
      },
      body: JSON.stringify({
        workoutId: assignWorkoutId,
        userIds: selectedUsers
      })
    });

    if (!response.ok) throw new Error("Failed to assign users");

    alert("Users assigned successfully!");
    setSelectedUsers([]);
    setAssignWorkoutId(null);
    document.querySelector("#assignUserModal .btn-close")?.click(); // Close modal
  } catch (err) {
    alert("Error: " + err.message);
  }
};

const handleDeleteWorkout = async (workoutId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this workout?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`https://flow108.coinagesoft.com/api/AdminWorkout/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'accept': '*/*',
      }
    });

    if (!response.ok) throw new Error("Failed to delete workout");

    const result = await response.json();
    alert(result.Message || "Workout deleted successfully");

    // Refresh workouts list
    fetchWorkouts();
  } catch (err) {
    alert("Error deleting workout: " + err.message);
  }
};

  const handleEditButtonClick = (workout) => {
    setSelectedWorkout(workout);
    setEditableSteps(workout.Steps || []);
    setTimeout(() => {
      document.getElementById('editWorkoutId').value = workout.WorkoutId;
      document.getElementById('editPlanName').value = workout.Name;
      document.getElementById('editDuration').value = workout.Duration;
      document.getElementById('editFeatures').value = workout.Description;
      document.getElementById('editImageUrl').value = workout.ImageUrl || "";
      document.getElementById('editIntensity').value = workout.Intensity || "Medium";
    }, 200);
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...editableSteps];
    updatedSteps[index][field] = field === "Duration" || field === "Order" ? parseInt(value) : value;
    setEditableSteps(updatedSteps);
  };

  const handleAddStep = () => {
    const newStep = {
      Id: crypto.randomUUID(),
      WorkoutId: selectedWorkout?.WorkoutId,
      Title: "",
      Description: "",
      Duration: 0,
      Order: editableSteps.length + 1
    };
    setEditableSteps([...editableSteps, newStep]);
  };

  const handleEditWorkout = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const workoutId = formData.get('workoutId');

    const updatedWorkout = {
      Name: formData.get('editPlanName'),
      Description: formData.get('editFeatures'),
      Duration: parseInt(formData.get('editDuration')) || 0,
      Intensity: formData.get('editIntensity') || "Medium",
      ImageUrl: formData.get('editImageUrl') || "https://example.com/images/default-workout.png",
      Steps: editableSteps
    };

    try {
      const response = await fetch(`https://flow108.coinagesoft.com/api/AdminWorkout/${workoutId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(updatedWorkout)
      });
      if (!response.ok) throw new Error('Failed to update workout');
      alert("Workout plan updated successfully!");
      const modal = document.getElementById('editPlanModal');
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
      fetchWorkouts();
      e.target.reset();
    } catch (err) {
      alert("Error updating workout: " + err.message);
    }
  };

  // Rendering loader or error
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-5">Error: {error}</div>
    );
  }

  return (
    <div>
      <div className="content-wrapper">
        {/* <!-- Content --> */}
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row mb-5">
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-primary"><i
                          className="tf-icons ri-user-add-line ri-24px"></i></span>
                    </div>
                    <h4 className="mb-0">{workouts.length}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Workouts</h6>
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
                      <span className="avatar-initial rounded-3 bg-label-warning"><i
                          className="ri-user-star-line ri-24px"></i></span>
                    </div>
                    <h4 className="mb-0">{workouts.filter(w => w.Steps && w.Steps.length > 0).length}</h4>
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
                      <span className="avatar-initial rounded-3 bg-label-danger"><i
                          className="ri-group-line ri-24px"></i></span>
                    </div>
                    <h4 className="mb-0">{workouts.filter(w => w.Duration > 30).length}</h4>
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
                      <span className="avatar-initial rounded-3 bg-label-info"><i
                          className="ri-article-line ri-24px"></i></span>
                    </div>
                    <h4 className="mb-0">{workouts.filter(w => w.Intensity === 'High').length}</h4>
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
           
              {/* <!-- Cart --> */}
              <div id="checkout-cart" className="content">
                <div className="row">
                  {/* <!-- Cart left --> */}
                  <div className="col-xl-8 mb-4 mb-xl-0">
                  </div>
                </div>
              </div>

              {/* <!-- Confirmation --> */}
              <div id="checkout-confirmation" className="content">
                <div className="row">
                  {/* <!-- Confirmation items --> */}
                  <div className="col-xl-8 mb-4 mb-xl-0">
                    <ul className="list-group">
                      {workouts.map((workout) => (
                        <li key={workout.WorkoutId} className="list-group-item p-5">
                          <div className="d-flex gap-4">
                            <div className="flex-shrink-0">
                              <a href={`/WorkoutDetails?workoutId=${workout.WorkoutId}`}>
                                <img 
                                  src={workout.ImageUrl || "/assets/img/avatars/14.png"} 
                                  alt={workout.Name}
                                  className="w-px-75" 
                                  onError={(e) => {
                                    e.target.src = "/assets/img/avatars/14.png";
                                  }}
                                />
                              </a>
                            </div>
                            <div className="flex-grow-1">
                              <div className="row d-flex align-items-center">
                                <div className="col-md-8 pt-2">
                                  <a href={`/WorkoutDetails?workoutId=${workout.WorkoutId}`} className="text-body mt-1">
                                    <h6 className="mb-2">{workout.Name}</h6>
                                  </a>
                                  <div className="text-body mb-2 d-flex flex-wrap">
                                    <span className="me-1">Duration:</span>
                                    <a href={`/WorkoutDetails?workoutId=${workout.WorkoutId}`} className="me-1">
                                      {workout.Duration} minutes
                                    </a>
                                  </div>
                                  <span className="badge bg-label-success rounded-pill mt-2 mt-sm-0">
                                    Intensity: {workout.Intensity} - {workout.Description}
                                  </span>
                                </div>
                                <div className="col-md-4">
                                  <div className="text-md-end">
                                    <div className="my-2 my-lg-6">
                                      <button
  className="btn btn-outline-success ms-2"
  data-bs-toggle="modal"
  data-bs-target="#assignUserModal"
  onClick={() => setAssignWorkoutId(workout.WorkoutId)}
>
  Assign User
</button>

                                    <button
  className="btn btn-outline-primary"
  data-bs-toggle="modal"
  data-bs-target="#editPlanModal"
  onClick={() => handleEditButtonClick(workout)}
>
  Edit
</button>
<button
  className="btn btn-outline-danger ms-2"
  onClick={() => handleDeleteWorkout(workout.WorkoutId)}
>
  Delete
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
                  </div>
                  
                  {/* <!-- Confirmation total --> */}
                  <div className="col-xl-4">
                    <div className="border rounded-4 p-5">
                      {/* <!-- Add Exercise Plan Form --> */}
                      <h6>Add Exercise Plan</h6>
                     <form id="exerciseForm" onSubmit={handleAddWorkout}>
  <div className="mb-3">
    <label htmlFor="imageUrl" className="form-label">Image URL</label>
    <input type="url" className="form-control" id="imageUrl" name="imageUrl" placeholder="https://example.com/workout.jpg" />
  </div>

  <div className="mb-3">
    <label htmlFor="planName" className="form-label">Plan Name</label>
    <input type="text" className="form-control" id="planName" name="planName" placeholder="e.g. Beginner Fitness Plan" required />
  </div>

  <div className="mb-3">
    <label htmlFor="duration" className="form-label">Duration (minutes)</label>
    <input type="number" className="form-control" id="duration" name="duration" placeholder="e.g. 45" required />
  </div>

  <div className="mb-3">
    <label htmlFor="intensity" className="form-label">Intensity</label>
    <select className="form-select" id="intensity" name="intensity">
      <option value="Low">Low</option>
      <option value="Medium" selected>Medium</option>
      <option value="High">High</option>
    </select>
  </div>

  <div className="mb-3">
    <label htmlFor="features" className="form-label">Description</label>
    <textarea className="form-control" id="features" name="features" rows="3"
      placeholder="e.g. A comprehensive workout plan for beginners" required></textarea>
  </div>

  {/* Steps Section */}
  <div className="border-top pt-3">
    <h6 className="mb-3">Workout Steps</h6>
    {newSteps.map((step, index) => (
      <div key={index} className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={step.Title}
            onChange={(e) => handleNewStepChange(index, 'Title', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-control"
            value={step.Description}
            onChange={(e) => handleNewStepChange(index, 'Description', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Duration</label>
          <input
            type="number"
            className="form-control"
            value={step.Duration}
            onChange={(e) => handleNewStepChange(index, 'Duration', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Order</label>
          <input
            type="number"
            className="form-control"
            value={step.Order}
            onChange={(e) => handleNewStepChange(index, 'Order', e.target.value)}
          />
        </div>
      </div>
    ))}
    <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddNewStep}>
      + Add Step
    </button>
  </div>

  <button type="submit" className="btn btn-success w-100 mt-3">Add Plan</button>
</form>

                    </div>
                  </div>
                </div>
              </div>
            
          </div>
        </div>
        {/* <!-- / Content --> */}

        {/* <!-- Enhanced Edit Modal --> */}
        <div className="modal fade" id="editPlanModal" tabIndex="-1" aria-labelledby="editPlanModalLabel"
          aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="editPlanModalLabel">Edit Workout Plan</h5>
                <button type="button" className="btn-close modal-close" data-bs-dismiss="modal"
                  aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form id="editPlanForm" onSubmit={handleEditWorkout}>
                  <input type="hidden" id="editWorkoutId" name="workoutId" />
                  
                  {/* Basic Workout Info */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editPlanName" className="form-label">Plan Name *</label>
                      <input type="text" className="form-control" id="editPlanName" name="editPlanName" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editDuration" className="form-label">Duration (minutes) *</label>
                      <input type="number" className="form-control" id="editDuration" name="editDuration" required />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editIntensity" className="form-label">Intensity *</label>
                      <select className="form-select" id="editIntensity" name="editIntensity" required>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="editImageUrl" className="form-label">Image URL</label>
                      <input type="url" className="form-control" id="editImageUrl" name="editImageUrl" 
                        placeholder="https://example.com/image.jpg" />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="editFeatures" className="form-label">Description *</label>
                    <textarea className="form-control" id="editFeatures" name="editFeatures" rows="3" required></textarea>
                  </div>
                  
                  {/* Steps Management */}
                   <div className="border-top pt-3">
        <h6 className="mb-3">Workout Steps</h6>
        {editableSteps.map((step, index) => (
          <div key={step.Id || index} className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={step.Title}
                onChange={(e) => handleStepChange(index, 'Title', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={step.Description}
                onChange={(e) => handleStepChange(index, 'Description', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Duration</label>
              <input
                type="number"
                className="form-control"
                value={step.Duration}
                onChange={(e) => handleStepChange(index, 'Duration', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Order</label>
              <input
                type="number"
                className="form-control"
                value={step.Order}
                onChange={(e) => handleStepChange(index, 'Order', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddStep}>
          + Add Step
        </button>
      </div>

                  
                  <div className="mt-4 d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
<div className="modal fade" id="assignUserModal" tabIndex="-1" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Assign Users to Workout</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
      </div>
      <div className="modal-body">
        <form onSubmit={handleAssignUsers}>
          <div className="mb-3">
            <label className="form-label">Select Users</label>
            <select
              multiple
              className="form-select"
              value={selectedUsers}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedUsers(selected);
              }}
            >
              {allUsers.map((user) => (
                <option key={user.Id} value={user.Id}>
                  {user.Name || user.Email}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100">Assign</button>
        </form>
      </div>
    </div>
  </div>
</div>

        {/* <!-- Overlay --> */}
        <div className="layout-overlay layout-menu-toggle"></div>

        {/* <!-- Footer --> */}
        <footer className="content-footer footer bg-footer-theme">
          <div className="container-xxl">
            <div
              className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
              <div className="text-body mb-2 mb-md-0">
                ©
                <script>
                  document.write(new Date().getFullYear());
                </script>
                , made with <span className="text-danger"><i className="tf-icons ri-heart-fill"></i></span> by
                <a href="https://www.coinagesoft.com/" target="_blank" className="footer-link">Coinage.in</a>
              </div>
            </div>
          </div>
        </footer>
        {/* <!-- / Footer --> */}

        <div className="content-backdrop fade"></div>
      </div>
    </div>
  );
}

// Move all client-side JavaScript into React hooks and proper event handling
// The problematic code has been moved into the React component structure
// using useEffect and proper state management
