"use client";
import React, { useState } from "react";

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// API function to create a forum post
const createForumPost = async (postData) => {
  const formData = new FormData();
  formData.append("Title", postData.Title);
  formData.append("Description", postData.Description);
  formData.append("IsAnonymous", postData.IsAnonymous.toString());
  formData.append("UserId", postData.UserId);

  // Attach media files directly
  postData.Media.forEach((media) => {
    formData.append("Media", media.file); // 👈 send file in Media
    formData.append("MediaType", media.Type.toString()); // 👈 type separately
  });

  const response = await fetch(`${API_BASE_URL}/admin/community/forum/posts`, {
    method: "POST",
    headers: { accept: "*/*" }, // DO NOT set Content-Type (FormData sets it)
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
    Description: "",
    IsAnonymous: false,
    UserId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Default user ID
    Media: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Title.trim() || !formData.Description.trim()) {
      alert("Please fill in both title and description");
      return;
    }

    try {
      setLoading(true);
      await createForumPost(formData);
      alert("✅ Post created successfully!");

      setFormData({
        Title: "",
        Description: "",
        IsAnonymous: false,
        UserId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        Media: [],
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
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      Type: file.type.startsWith("image")
        ? 0
        : file.type.startsWith("video")
        ? 1
        : 2, // 0=Image, 1=Video, 2=Document
    }));
    setFormData({ ...formData, Media: [...formData.Media, ...newMedia] });
  };

  const handleRemoveMedia = (index) => {
    const newMedia = formData.Media.filter((_, i) => i !== index);
    setFormData({ ...formData, Media: newMedia });
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

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.Description}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  placeholder="Enter post description..."
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

              {/* User ID */}
              <div className="mb-3">
                <label className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.UserId}
                  onChange={(e) =>
                    setFormData({ ...formData, UserId: e.target.value })
                  }
                  placeholder="Enter user ID..."
                />
                <small className="text-muted">
                  Default: 3fa85f64-5717-4562-b3fc-2c963f66afa6
                </small>
              </div>

              {/* File Upload */}
              <div className="mb-3">
                <label className="form-label">Upload Media</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                />
                <div className="mt-2">
                  {formData.Media.map((media, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center border rounded p-2 mb-1"
                    >
                      <small>
                        {media.file.name} (
                        {media.Type === 0
                          ? "Image"
                          : media.Type === 1
                          ? "Video"
                          : "Document"}
                        )
                      </small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveMedia(index)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
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
