"use client";
import React, { useState } from "react";

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// API function to create a forum post
const createForumPost = async (postData) => {
  const formData = new FormData();
  formData.append("Title", postData.Title);
  formData.append("IsAnonymous", postData.IsAnonymous.toString());

  // Attach media file if present
  if (postData.Media && postData.Media.file) {
    formData.append("Media.Url", postData.Media.file);
  }

  const response = await fetch(`${API_BASE_URL}/admin/community/forum/posts?adminId=17de4552-dbcc-44cc-92e6-71eff2078364`, {
    method: "POST",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }, // DO NOT set Content-Type (FormData sets it)
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to create forum post");

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
};

export default function AddPostModal({ onPostCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Title: "",
    IsAnonymous: false,
    Media: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      setLoading(true);
      await createForumPost(formData);
      alert("✅ Post created successfully!");

      setFormData({
        Title: "",
        IsAnonymous: false,
        Media: null,
      });

      const modal = document.getElementById("addPostModal");
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) modalInstance.hide();
      }

      if (onPostCreated) onPostCreated();
    } catch (err) {
      alert("❌ Failed to create post: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, Media: { file } });
    }
  };

  const handleRemoveMedia = () => {
    setFormData({ ...formData, Media: null });
  };

  return (
    <div
      className="modal fade"
      id="addPostModal"
      tabIndex="-1"
      aria-labelledby="addPostModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="addPostModalLabel">
              Create New Post
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-3">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.Title}
                  onChange={(e) =>
                    setFormData({ ...formData, Title: e.target.value })
                  }
                  placeholder="Enter post title..."
                  required
                />
              </div>



              {/* Anonymous toggle */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={formData.IsAnonymous}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        IsAnonymous: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">Post Anonymously</label>
                </div>
              </div>



              {/* File Upload */}
              <div className="mb-3">
                <label className="form-label">Upload Media</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
                {formData.Media && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between align-items-center border rounded p-2 mb-1">
                      <small>{formData.Media.file.name}</small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleRemoveMedia}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                      ></span>
                      Creating...
                    </>
                  ) : (
                    "Create Post"
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
  );
}
