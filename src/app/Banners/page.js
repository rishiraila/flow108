"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchBanners, addBanner, updateBanner, deleteBanner } from "../utils/api";
import BannerAssignmentModal from "../BannerAssignmentModal";
import Masonry from 'react-masonry-css';

export default function BannersPage() {
  // Character limits
  const CHAR_LIMITS = {
    name: 50,
    title: 100,
    content: 500,
    redirectUrl: 200
  };

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [showAssignBannerModal, setShowAssignBannerModal] = useState(false);
  const [assigningBanner, setAssigningBanner] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({ name: '', title: '', content: '', redirectUrl: '', imageFile: null });
  const [editBanner, setEditBanner] = useState({ name: '', title: '', content: '', redirectUrl: '', imageFile: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [validationErrors, setValidationErrors] = useState({});

  // Load banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const bannerData = await fetchBanners();
      // Transform API data to match component structure
      const transformedBanners = bannerData.map((banner, index) => ({
        id: banner.Id || index + 1,
        name: banner.Name,
        title: banner.Title,
        description: banner.Content || '',
        imageUrl: banner.ImagePath ? `https://flow108.coinagesoft.com${banner.ImagePath}` : '',
        redirectUrl: banner.RedirectUrl || '',
        createdAt: banner.CreatedAt || new Date().toISOString(),
        likes: banner.LikeCount || 0,
      }));
      setBanners(transformedBanners);
      setError(null);
    } catch (err) {
      console.error('Error loading banners:', err);
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateBanner = (banner) => {
    const errors = {};

    if (banner.name.length > CHAR_LIMITS.name) {
      errors.name = `Name must be ${CHAR_LIMITS.name} characters or less`;
    }
    if (banner.title.length > CHAR_LIMITS.title) {
      errors.title = `Title must be ${CHAR_LIMITS.title} characters or less`;
    }
    if (banner.content.length > CHAR_LIMITS.content) {
      errors.content = `Content must be ${CHAR_LIMITS.content} characters or less`;
    }
    if (banner.redirectUrl.length > CHAR_LIMITS.redirectUrl) {
      errors.redirectUrl = `Redirect URL must be ${CHAR_LIMITS.redirectUrl} characters or less`;
    }

    return errors;
  };

  const handleAddBanner = async () => {
    if (!newBanner.name || !newBanner.title || !newBanner.content || !newBanner.redirectUrl || !newBanner.imageFile) {
      alert('Please provide all required fields: name, title, content, redirect URL, and select an image file.');
      return;
    }

    // Validate character limits
    const errors = validateBanner(newBanner);
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      alert('Please fix the following errors:\n\n' + errorMessages);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const result = await addBanner(newBanner.name, newBanner.title, newBanner.content, newBanner.redirectUrl, newBanner.imageFile);
      if (result.status) {
        // Reload banners after successful addition
        await loadBanners();
        setShowAddBannerModal(false);
        setNewBanner({ name: '', title: '', content: '', redirectUrl: '', imageFile: null });
      } else {
        alert('Failed to add banner: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner. Please try again.');
    }
  };

  const handleEditBanner = async () => {
    // Validate character limits
    const errors = validateBanner(editBanner);
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).join('\n');
      alert('Please fix the following errors:\n\n' + errorMessages);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const result = await updateBanner(editingBanner.id, editBanner.name, editBanner.title, editBanner.content, editBanner.redirectUrl, editBanner.imageFile);
      if (result.status) {
        alert("✅ Banner updated successfully!");
        // Reload banners after successful update
        await loadBanners();
        setShowEditBannerModal(false);
        setEditingBanner(null);
        setEditBanner({ name: '', title: '', content: '', redirectUrl: '', imageFile: null });
      } else {
        alert('Failed to update banner: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Failed to update banner. Please try again.');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const result = await deleteBanner(bannerId);
      if (result.status) {
        alert("✅ Banner deleted successfully!");
        await loadBanners();
      } else {
        alert("❌ Failed to delete banner: " + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Something went wrong while deleting");
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'add') {
        setNewBanner({ ...newBanner, imageFile: file });
      } else if (type === 'edit') {
        setEditBanner({ ...editBanner, imageFile: file });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredBanners = useMemo(() => {
    let filtered = banners;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = banners.filter(banner =>
        (banner.name || '').toLowerCase().includes(search) ||
        (banner.title || '').toLowerCase().includes(search) ||
        (banner.description || '').toLowerCase().includes(search)
      );
    }

    // Sort the filtered array
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date_asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'likes_desc':
          return (b.likes || 0) - (a.likes || 0);
        case 'likes_asc':
          return (a.likes || 0) - (b.likes || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [banners, searchQuery, sortOption]);

  const breakpointCols = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats Cards */}
        <div className="row mb-5">
          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary">
                      <i className="tf-icons ri-image-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{banners.length}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Banners</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">+{banners.filter(b => b.imageUrl).length}</span>
                  <small className="text-muted">with images</small>
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning">
                      <i className="ri-heart-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {banners.reduce((sum, banner) => sum + (banner.likes || 0), 0)}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Likes</h6>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info">
                      <i className="ri-calendar-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{new Set(banners.map(b => new Date(b.createdAt).toDateString())).size}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Unique Dates</h6>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger">
                      <i className="ri-star-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{banners.filter(b => (b.likes || 0) > 0).length}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Banners with Likes</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Add Banner Button */}
        <div className="d-flex justify-content-between mb-4">
          <div className="d-flex justify-content-between align-items-center w-100" >
            <h4 className="mb-0">Banners</h4>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddBannerModal(true)}
            >
              <i className="ri-add-line me-1"></i>Add New Banner
            </button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="d-flex justify-content-center mb-4">
          <div
            className="p-3 shadow-sm"
            style={{
              maxWidth: "700px",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "14px",
              border: "1px solid #e9ecef",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Search Bar */}
            <div
              className="d-flex align-items-center px-2 py-1"
              style={{
                flex: "1 1 300px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                transition: "all 0.2s ease",
              }}
            >
              <i className="ri-search-line text-muted" style={{ marginRight: "8px", fontSize: "18px" }}></i>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "15px",
                  color: "#495057",
                }}
                onFocus={(e) => (e.target.parentElement.style.borderColor = "#007bff")}
                onBlur={(e) => (e.target.parentElement.style.borderColor = "#dee2e6")}
              />
            </div>

            {/* Sort Dropdown */}
            <div
              className="d-flex align-items-center justify-content-end"
              style={{ flex: "0 0 180px" }}
            >
              <label className="fw-semibold me-2 text-dark" style={{ fontSize: "14px" }}>
                Sort by:
              </label>
              <select
                className="form-select"
                style={{
                  fontSize: "14px",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  border: "1px solid #dee2e6",
                  backgroundColor: "#f8f9fa",
                  color: "#495057",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#007bff")}
                onBlur={(e) => (e.target.style.borderColor = "#dee2e6")}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="likes_desc">Most Likes</option>
                <option value="likes_asc">Least Likes</option>
              </select>
            </div>
          </div>
        </div>

        <Masonry
          breakpointCols={breakpointCols}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading banners...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              Error loading banners: {error}
            </div>
          ) : filteredBanners.length === 0 ? (
            <div className="text-center py-5">
              <p>No banners match your search.</p>
            </div>
          ) : (
            filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="border"
                style={{
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  fontSize: "14px",
                }}
              >
                {/* Banner content */}
                <div style={{ marginBottom: "10px" }}>
                  <h6
                    style={{
                      margin: "0 0 6px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {banner.title}
                  </h6>
                  {banner.name && (
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "14px",
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      Name: {banner.name}
                    </p>
                  )}
                  {banner.description && (
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {banner.description}
                    </p>
                  )}
                  {/* {banner.redirectUrl && (
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: "12px",
                        color: "#007bff",
                        textDecoration: "underline",
                      }}
                    >
                      URL: {banner.redirectUrl}
                    </p>
                  )} */}
                  {banner.imageUrl ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                          maxHeight: "300px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
                        borderRadius: "8px",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6c757d",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>

                {/* Banner stats */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    padding: "6px 0",
                    borderTop: "1px solid #eee",
                    borderBottom: "1px solid #eee",
                    fontSize: "14px",
                    color: "#6c757d",
                  }}
                >
                  {/* <div style={{ display: "flex", gap: "12px" }}>
                    <span>
                      <i className="bi bi-heart-fill text-danger"></i>{" "}
                      {banner.likes || 0} Likes
                    </span>
                    <span>
                      <small>{formatDate(banner.createdAt)}</small>
                    </span>
                  </div> */}

                  <div className="d-flex justify-content-end gap-2">
                    {/* <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => {
                        setAssigningBanner(banner);
                        setShowAssignBannerModal(true);
                      }}
                    >
                      Assign
                    </button> */}
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setEditingBanner(banner);
                        setEditBanner({
                          name: banner.name,
                          title: banner.title,
                          content: banner.description,
                          redirectUrl: banner.redirectUrl,
                          imageFile: null,
                        });
                        setShowEditBannerModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteBanner(banner.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </Masonry>

        {/* Add Banner Modal */}
        {showAddBannerModal && (
          <div className="modal-backdrop">
            <div className="modal-content-custom">
              <h5 className="mb-3">Add Banner</h5>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                  placeholder="Name"
                  value={newBanner.name}
                  maxLength={CHAR_LIMITS.name}
                  onChange={(e) => setNewBanner({ ...newBanner, name: e.target.value.slice(0, CHAR_LIMITS.name) })}
                />
                <small className={newBanner.name.length >= CHAR_LIMITS.name ? "text-danger" : "text-muted"}>{newBanner.name.length}/{CHAR_LIMITS.name} characters</small>
                {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
              </div>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                  placeholder="Title"
                  value={newBanner.title}
                  maxLength={CHAR_LIMITS.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value.slice(0, CHAR_LIMITS.title) })}
                />
                <small className={newBanner.title.length >= CHAR_LIMITS.title ? "text-danger" : "text-muted"}>{newBanner.title.length}/{CHAR_LIMITS.title} characters</small>
                {validationErrors.title && <div className="invalid-feedback">{validationErrors.title}</div>}
              </div>
              <div className="mb-2">
                <textarea
                  className={`form-control ${validationErrors.content ? 'is-invalid' : ''}`}
                  placeholder="Content"
                  rows="3"
                  value={newBanner.content}
                  maxLength={CHAR_LIMITS.content}
                  onChange={(e) => setNewBanner({ ...newBanner, content: e.target.value.slice(0, CHAR_LIMITS.content) })}
                />
                <small className={newBanner.content.length >= CHAR_LIMITS.content ? "text-danger" : "text-muted"}>{newBanner.content.length}/{CHAR_LIMITS.content} characters</small>
                {validationErrors.content && <div className="invalid-feedback">{validationErrors.content}</div>}
              </div>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.redirectUrl ? 'is-invalid' : ''}`}
                  placeholder="Redirect URL"
                  value={newBanner.redirectUrl}
                  maxLength={CHAR_LIMITS.redirectUrl}
                  onChange={(e) => setNewBanner({ ...newBanner, redirectUrl: e.target.value.slice(0, CHAR_LIMITS.redirectUrl) })}
                />
                <small className={newBanner.redirectUrl.length >= CHAR_LIMITS.redirectUrl ? "text-danger" : "text-muted"}>{newBanner.redirectUrl.length}/{CHAR_LIMITS.redirectUrl} characters</small>
                {validationErrors.redirectUrl && <div className="invalid-feedback">{validationErrors.redirectUrl}</div>}
              </div>
              <input type="file" className="form-control mb-3" accept="image/*"
                onChange={(e) => handleImageUpload(e, 'add')} />
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => setShowAddBannerModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleAddBanner}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Banner Modal */}
        {showEditBannerModal && (
          <div className="modal-backdrop">
            <div className="modal-content-custom">
              <h5 className="mb-3">Edit Banner</h5>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                  placeholder="Name"
                  value={editBanner.name}
                  maxLength={CHAR_LIMITS.name}
                  onChange={(e) => setEditBanner({ ...editBanner, name: e.target.value.slice(0, CHAR_LIMITS.name) })}
                />
                <small className={editBanner.name.length >= CHAR_LIMITS.name ? "text-danger" : "text-muted"}>{editBanner.name.length}/{CHAR_LIMITS.name} characters</small>
                {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
              </div>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.title ? 'is-invalid' : ''}`}
                  placeholder="Title"
                  value={editBanner.title}
                  maxLength={CHAR_LIMITS.title}
                  onChange={(e) => setEditBanner({ ...editBanner, title: e.target.value.slice(0, CHAR_LIMITS.title) })}
                />
                <small className={editBanner.title.length >= CHAR_LIMITS.title ? "text-danger" : "text-muted"}>{editBanner.title.length}/{CHAR_LIMITS.title} characters</small>
                {validationErrors.title && <div className="invalid-feedback">{validationErrors.title}</div>}
              </div>
              <div className="mb-2">
                <textarea
                  className={`form-control ${validationErrors.content ? 'is-invalid' : ''}`}
                  placeholder="Content"
                  rows="3"
                  value={editBanner.content}
                  maxLength={CHAR_LIMITS.content}
                  onChange={(e) => setEditBanner({ ...editBanner, content: e.target.value.slice(0, CHAR_LIMITS.content) })}
                />
                <small className={editBanner.content.length >= CHAR_LIMITS.content ? "text-danger" : "text-muted"}>{editBanner.content.length}/{CHAR_LIMITS.content} characters</small>
                {validationErrors.content && <div className="invalid-feedback">{validationErrors.content}</div>}
              </div>
              <div className="mb-2">
                <input
                  className={`form-control ${validationErrors.redirectUrl ? 'is-invalid' : ''}`}
                  placeholder="Redirect URL"
                  value={editBanner.redirectUrl}
                  maxLength={CHAR_LIMITS.redirectUrl}
                  onChange={(e) => setEditBanner({ ...editBanner, redirectUrl: e.target.value.slice(0, CHAR_LIMITS.redirectUrl) })}
                />
                <small className={editBanner.redirectUrl.length >= CHAR_LIMITS.redirectUrl ? "text-danger" : "text-muted"}>{editBanner.redirectUrl.length}/{CHAR_LIMITS.redirectUrl} characters</small>
                {validationErrors.redirectUrl && <div className="invalid-feedback">{validationErrors.redirectUrl}</div>}
              </div>
              {editingBanner && editingBanner.imageUrl && (
                <div className="mb-3">
                  <label className="form-label">Current Image:</label>
                  <img
                    src={editingBanner.imageUrl}
                    alt="Current Banner"
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}
                  />
                </div>
              )}
              <input type="file" className="form-control mb-3" accept="image/*"
                onChange={(e) => handleImageUpload(e, 'edit')} />
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-secondary" onClick={() => {
                  setShowEditBannerModal(false);
                  setEditingBanner(null);
                  setEditBanner({ name: '', title: '', content: '', redirectUrl: '', imageFile: null });
                }}>Cancel</button>
                <button className="btn btn-success" onClick={handleEditBanner}>Update</button>
              </div>
            </div>
          </div>
        )}

        {/* Banner Assignment Modal */}
        {showAssignBannerModal && assigningBanner && (
          <BannerAssignmentModal
            isOpen={showAssignBannerModal}
            onClose={() => {
              setShowAssignBannerModal(false);
              setAssigningBanner(null);
            }}
            bannerId={assigningBanner.id}
            bannerName={assigningBanner.title}
            onAssignmentSuccess={() => {
              // Optional: Show success message or refresh data
              alert('Banner assigned successfully!');
            }}
          />
        )}

        <style jsx>{`
          .modal-backdrop {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1050;
          }
          .modal-content-custom {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
          }
          .my-masonry-grid {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            margin-left: -16px;
            width: auto;
          }
          .my-masonry-grid_column {
            padding-left: 16px;
            background-clip: padding-box;
          }
          .my-masonry-grid_column > div {
            margin-bottom: 16px;
          }
        `}</style>
      </div>
    </div>
  );
}
