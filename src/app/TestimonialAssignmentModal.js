"use client";
import { useState, useEffect } from "react";

export default function TestimonialAssignmentModal({ isOpen, onClose, testimonialId, testimonialTitle, onAssignmentSuccess }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assignToAll, setAssignToAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setAssignError(null);
    try {
      const response = await fetch("https://flow108.coinagesoft.com/api/AdminAccount/all-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.Data || []);
    } catch (error) {
      setAssignError(error.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignTestimonial = async () => {
    if (!assignToAll && selectedUsers.length === 0) {
      setAssignError("Please select at least one user or choose 'Assign to All Users'");
      return;
    }

    const userIdsToAssign = assignToAll ? users.map(u => u.Id) : selectedUsers;

    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      const formData = new FormData();
      formData.append("TestimonialId", testimonialId);

      // Append each user ID as a separate 'UserIds' field
      userIdsToAssign.forEach(userId => {
        formData.append('UserIds', userId);
      });

      if (assignToAll) {
        formData.append('AssignToAll', 'true');
      }

      const response = await fetch("https://flow108.coinagesoft.com/api/admin/testimonials/assign", {
        method: "POST",
        headers: {
          accept: "*/*",
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to assign testimonial");

      const result = await response.json();
      if (result.status) {
        setAssignSuccess(true);
        onAssignmentSuccess();
        setTimeout(() => {
          setAssignSuccess(false);
          onClose();
          // Reset state
          setSelectedUsers([]);
          setAssignToAll(false);
          setSearchQuery('');
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to assign testimonial");
      }
    } catch (error) {
      setAssignError(error.message || "Failed to assign testimonial");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user =>
    (user.Name || user.Email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Assign Testimonial: {testimonialTitle}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {assignSuccess && (
              <div className="alert alert-success" role="alert">
                Testimonial assigned successfully!
              </div>
            )}
            {assignError && (
              <div className="alert alert-danger" role="alert">
                {assignError}
              </div>
            )}

            {/* Assign to All Option */}
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="assignToAll"
                  checked={assignToAll}
                  onChange={(e) => {
                    setAssignToAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedUsers([]);
                    }
                  }}
                />
                <label className="form-check-label fw-bold" htmlFor="assignToAll">
                  Assign to All Users
                </label>
              </div>
            </div>

            {!assignToAll && (
              <>
                {/* Search Bar */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* User Selection */}
                {loadingUsers ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No users found.</p>
                  </div>
                ) : (
                  <div className="border rounded p-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <div className="mb-2">
                      <small className="text-muted">
                        Selected: {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                      </small>
                    </div>
                    {filteredUsers.map((user) => (
                      <div key={user.Id} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`user-${user.Id}`}
                          checked={selectedUsers.includes(user.Id)}
                          onChange={() => handleUserSelection(user.Id)}
                        />
                        <label className="form-check-label" htmlFor={`user-${user.Id}`}>
                          <div>
                            <strong>{user.Name || "N/A"}</strong>
                            <br />
                            <small className="text-muted">{user.Email || "N/A"}</small>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleAssignTestimonial}
              disabled={assignLoading || (!assignToAll && selectedUsers.length === 0)}
            >
              {assignLoading ? "Assigning..." : "Assign Testimonial"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
