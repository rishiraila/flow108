"use client";
import React, { useEffect, useState } from "react";
import TestimonialAssignmentModal from "../TestimonialAssignmentModal";
import authenticatedFetch, { API_BASE_URL } from "../utils/authenticatedFetch";

// API functions for testimonials
const fetchTestimonials = async () => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/testimonials`, {
    method: "GET",
    headers: {
      accept: "*/*",
    },
  });
  return data.data || [];
};

const createTestimonial = async (formData) => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/testimonials`, {
    method: "POST",
    headers: {
      accept: "*/*",
    },
    body: formData,
  });
  return data;
};

const updateTestimonial = async (id, formData) => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/testimonials/${id}`, {
    method: "PATCH",
    headers: {
      accept: "*/*",
    },
    body: formData,
  });
  return data;
};

const deleteTestimonial = async (id) => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/testimonials/${id}`, {
    method: "DELETE",
    headers: {
      accept: "*/*",
    },
  });
  return data;
};

const assignTestimonial = async (testimonialId, userIds, assignToAll = false) => {
  const formData = new FormData();
  formData.append("TestimonialId", testimonialId);

  // Append each user ID as a separate 'UserIds' field
  userIds.forEach(userId => {
    formData.append('UserIds', userId);
  });

  if (assignToAll) {
    formData.append('AssignToAll', 'true');
  }

  const data = await authenticatedFetch(`${API_BASE_URL}/admin/testimonials/assign`, {
    method: "POST",
    headers: {
      accept: "*/*",
    },
    body: formData,
  });
  return data;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    Title: "",
    Description: "",
    ImagePath: null,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [editTestimonial, setEditTestimonial] = useState({
    Title: "",
    Description: "",
    ImagePath: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedTestimonialForAssignment, setSelectedTestimonialForAssignment] = useState(null);
  const [currentEditImageUrl, setCurrentEditImageUrl] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (!selectedTestimonial && editPreviewImage) {
      URL.revokeObjectURL(editPreviewImage);
      setEditPreviewImage(null);
    }
  }, [selectedTestimonial]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await fetchTestimonials();
      setTestimonials(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.Title || !newTestimonial.Description || !newTestimonial.ImagePath) {
      alert("Please fill all fields and select an image");
      return;
    }

    try {
      setCreateLoading(true);
      const formData = new FormData();
      formData.append("Title", newTestimonial.Title);
      formData.append("Description", newTestimonial.Description);
      formData.append("ImagePath", newTestimonial.ImagePath);

      await createTestimonial(formData);
      setNewTestimonial({
        Title: "",
        Description: "",
        ImagePath: null,
      });
      loadTestimonials();

      // Close modal
      const modal = document.getElementById("addTestimonialModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();

      // Reset file input
      const fileInput = document.getElementById("imageInput");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      alert("Failed to add testimonial: " + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTestimonial({
        ...newTestimonial,
        ImagePath: file,
      });
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (editPreviewImage) {
        URL.revokeObjectURL(editPreviewImage);
      }
      const previewUrl = URL.createObjectURL(file);
      setEditPreviewImage(previewUrl);
      setEditTestimonial({
        ...editTestimonial,
        ImagePath: file,
      });
    }
  };

  const handleEditTestimonial = async (e) => {
    e.preventDefault();
    if (!selectedTestimonial) return;

    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append("Title", editTestimonial.Title);
      formData.append("Description", editTestimonial.Description);
      if (editTestimonial.ImagePath) {
        formData.append("ImagePath", editTestimonial.ImagePath);
      }

      await updateTestimonial(selectedTestimonial.Id, formData);
      loadTestimonials();

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editTestimonialModal")
      );
      modal?.hide();

      setSelectedTestimonial(null);
      setCurrentEditImageUrl(null);
    } catch (err) {
      alert("Failed to update testimonial: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this testimonial? This action cannot be undone."
      )
    ) {
      try {
        setDeleteLoading(true);
        await deleteTestimonial(id);
        loadTestimonials();
        alert("Testimonial deleted successfully.");
      } catch (err) {
        alert("Failed to delete testimonial: " + err.message);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const openEditModal = (testimonial) => {
    if (editPreviewImage) {
      URL.revokeObjectURL(editPreviewImage);
      setEditPreviewImage(null);
    }
    setSelectedTestimonial(testimonial);
    setEditTestimonial({
      Title: testimonial.Title,
      Description: testimonial.Description,
      ImagePath: null,
    });
    setCurrentEditImageUrl(testimonial.ImagePath ? `https://api.flow108.in${testimonial.ImagePath}` : null);
    setEditPreviewImage(null);

    const modal = new bootstrap.Modal(
      document.getElementById("editTestimonialModal")
    );
    modal.show();
  };

  const openAssignmentModal = (testimonial) => {
    setSelectedTestimonialForAssignment(testimonial);
    setAssignmentModalOpen(true);
  };

  const handleAssignmentSuccess = () => {
    // Optionally refresh testimonials or show success message
    alert("Testimonial assigned successfully!");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate stats
  const calculateStats = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let total = testimonials.length;
    let thisMonthCount = 0;
    let thisWeekCount = 0;
    let todayCount = 0;

    testimonials.forEach(testimonial => {
      const createdDate = new Date(testimonial.CreatedOn || new Date());
      if (createdDate >= thisMonth) thisMonthCount++;
      if (createdDate >= thisWeek) thisWeekCount++;
      if (createdDate >= today) todayCount++;
    });

    return { total, thisMonthCount, thisWeekCount, todayCount };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="container p-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-4">
        <div className="alert alert-danger">
          Error loading testimonials: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats Cards */}
        <div className="row mb-5">
          <div className="col-12 col-sm-6 col-lg-3 mb-4">
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary">
                      <i className="tf-icons ri-star-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.total}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Testimonials</h6>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4">
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info">
                      <i className="tf-icons ri-calendar-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.thisMonthCount}</h4>
                </div>
                <h6 className="mb-0 fw-normal">This Month</h6>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4">
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning">
                      <i className="tf-icons ri-calendar-event-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.thisWeekCount}</h4>
                </div>
                <h6 className="mb-0 fw-normal">This Week</h6>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-lg-3 mb-4">
            <div className="card card-border-shadow-success h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-success">
                      <i className="tf-icons ri-calendar-todo-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.todayCount}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Today</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Add Testimonial Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Testimonials</h4>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#addTestimonialModal"
          >
            <i className="ri-add-line me-1"></i>Add Testimonial
          </button>
        </div>

        {/* Testimonials List */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Testimonials ({testimonials.length})</h5>
              </div>

              <div className="card-body">
                <div className="row">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.Id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body d-flex flex-column">
                          {testimonial.ImagePath && (
                            <div className="text-center mb-3">
                              <img
                                src={`https://api.flow108.in${testimonial.ImagePath}`}
                                alt={testimonial.Title}
                                className="img-fluid rounded"
                                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          )}
                          <h6 className="card-title fw-bold">{testimonial.Title}</h6>
                          <p className="card-text text-muted flex-grow-1" style={{ fontSize: "0.9rem" }}>
                            {testimonial.Description.length > 100
                              ? `${testimonial.Description.substring(0, 100)}...`
                              : testimonial.Description}
                          </p>
                          <small className="text-muted mb-3">
                            Created: {formatDate(testimonial.CreatedOn || new Date().toISOString())}
                          </small>
                          <div className="mt-auto">
                            <div className=" d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary flex-fill"
                                onClick={() => openEditModal(testimonial)}
                              >
                                <i className="ri-edit-line me-1"></i>
                              </button>
                              {/* <button
                                className="btn btn-sm btn-outline-success flex-fill"
                                onClick={() => openAssignmentModal(testimonial)}
                              >
                                <i className="ri-user-add-line me-1"></i>Assign
                              </button> */}
                              <button
                                className="btn btn-sm btn-outline-danger flex-fill"
                                onClick={() => handleDeleteTestimonial(testimonial.Id)}
                                disabled={deleteLoading}
                              >
                                <i className="ri-delete-bin-line me-1"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Testimonial Modal */}
      <div
        className="modal fade"
        id="addTestimonialModal"
        tabIndex="-1"
        aria-labelledby="addTestimonialModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addTestimonialModalLabel">
                Add New Testimonial
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddTestimonial}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTestimonial.Title}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        Title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newTestimonial.Description}
                    onChange={(e) =>
                      setNewTestimonial({
                        ...newTestimonial,
                        Description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="imageInput"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Creating...
                      </>
                    ) : (
                      "Add Testimonial"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Testimonial Modal */}
      <div
        className="modal fade"
        id="editTestimonialModal"
        tabIndex="-1"
        aria-labelledby="editTestimonialModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editTestimonialModalLabel">
                Edit Testimonial
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditTestimonial}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTestimonial.Title}
                    onChange={(e) =>
                      setEditTestimonial({
                        ...editTestimonial,
                        Title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editTestimonial.Description}
                    onChange={(e) =>
                      setEditTestimonial({
                        ...editTestimonial,
                        Description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Current Image</label>
                  {(currentEditImageUrl || editPreviewImage) && (
                    <img
                      src={editPreviewImage || currentEditImageUrl}
                      alt="Preview"
                      className="img-fluid rounded mb-2"
                      style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  )}
                  <label className="form-label mt-3">New Image (Optional - leave empty to keep current)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="editImageInput"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      "Update Testimonial"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Assignment Modal */}
      {assignmentModalOpen && selectedTestimonialForAssignment && (
        <TestimonialAssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => {
            setAssignmentModalOpen(false);
            setSelectedTestimonialForAssignment(null);
          }}
          testimonialId={selectedTestimonialForAssignment.Id}
          testimonialTitle={selectedTestimonialForAssignment.Title}
          onAssignmentSuccess={handleAssignmentSuccess}
        />
      )}

      {/* Footer */}
      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl">
          <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
            <div className="text-body mb-2 mb-md-0">
              © {new Date().getFullYear()}, made with{" "}
              <span className="text-danger">
                <i className="tf-icons ri-heart-fill"></i>
              </span>{" "}
              by
              <a
                href="https://www.coinagesoft.com/"
                target="_blank"
                className="footer-link"
              >
                Coinage.in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
