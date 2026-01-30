"use client";
import React, { useState } from "react";
import authenticatedFetch from "../utils/authenticatedFetch";

const API_BASE_URL = 'https://flow108.coinagesoft.com/api';

// Get admin ID from localStorage (assuming it's stored there)
const getAdminId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminId') || localStorage.getItem('userId');
  }
  return null;
};

// API function
const createAdminQuestion = async (questionData) => {
  const adminId = getAdminId();
  if (!adminId) {
    throw new Error('Admin ID not found. Please log in again.');
  }

  const data = await authenticatedFetch(`${API_BASE_URL}/admin/community/questions/admin`, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...questionData,
      AdminId: adminId
    }),
  });
  return data;
};

export default function AdminQuestionModal({ onQuestionCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Content: "",
    IsAnonymous: false,
    Visibility: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Content.trim()) {
      alert('Please enter question content');
      return;
    }

    try {
      setLoading(true);
      await createAdminQuestion({
        ...formData,
        TargetUserId: null // Hardcoded as per request
      });
      alert('Admin question created successfully!');

      // Reset form
      setFormData({
        Content: "",
        IsAnonymous: false,
        Visibility: 1
      });

      // Close modal using Bootstrap's API
      const modal = document.getElementById('adminQuestionModal');
      if (modal) {
        const modalInstance = bootstrap.Modal.getInstance(modal);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      onQuestionCreated();
    } catch (err) {
      alert('Failed to create admin question: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade" id="adminQuestionModal" tabIndex="-1" aria-labelledby="adminQuestionModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="adminQuestionModalLabel">Post Admin Question</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Question Content</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.Content}
                  onChange={(e) => setFormData({ ...formData, Content: e.target.value })}
                  placeholder="Enter your admin question here..."
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.IsAnonymous}
                        onChange={(e) => setFormData({ ...formData, IsAnonymous: e.target.checked })}
                      />
                      <label className="form-check-label">
                        Post Anonymously
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Visibility</label>
                    <select
                      className="form-select"
                      value={formData.Visibility}
                      onChange={(e) => setFormData({ ...formData, Visibility: parseInt(e.target.value) })}
                    >
                      <option value={1}>Public</option>
                      <option value={0}>Private</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Posting...
                    </>
                  ) : 'Post Question'}
                </button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
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
