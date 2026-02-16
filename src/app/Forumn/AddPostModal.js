"use client";
import React, { useState } from "react";

const API_BASE_URL = "https://api.flow108.in/api";

// API function to create a forum post
const createForumPost = async (postData) => {
  const formData = new FormData();
  formData.append("Title", postData.Title);

  if (postData.SessionLink) {
    formData.append("SessionLink", postData.SessionLink);
  }

  if (postData.Media?.file) {
    formData.append("Media.Url", postData.Media.file); // ✅ correct
  }

  const response = await fetch(
    "https://api.flow108.in/api/admin/community/forum/posts",
    {
      method: "POST",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to create forum post");
  }

  return response.json();
};





export default function AddPostModal({ onPostCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Title: "",
    SessionLink: "",
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
        SessionLink: "",
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

              {/* SessionLink */}
              <div className="mb-3">
                <label className="form-label">Session Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.SessionLink}
                  onChange={(e) =>
                    setFormData({ ...formData, SessionLink: e.target.value })
                  }
                  placeholder="Enter session link..."
                />
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
