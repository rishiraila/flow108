"use client";
import { useState, useEffect } from "react";

export default function WorkoutPlanAssignmentModal({ 
  isOpen, 
  onClose, 
  planId, 
  onAssignmentSuccess 
}) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

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

  const assignPlanToUser = async (userId) => {
    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/users/${userId}/assign-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            PlanId: planId,
            Phase: "string"
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      if (result.status) {
        setAssignSuccess(true);
        onAssignmentSuccess();
        setTimeout(() => {
          setAssignSuccess(false);
          onClose();
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to assign plan");
      }
    } catch (error) {
      setAssignError(error.message || "Failed to assign plan");
    } finally {
      setAssignLoading(false);
    }
  };

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
            <h5 className="modal-title">Assign Workout Plan to User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {assignSuccess && (
              <div className="alert alert-success" role="alert">
                Workout plan assigned successfully!
              </div>
            )}
            {assignError && (
              <div className="alert alert-danger" role="alert">
                {assignError}
              </div>
            )}
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No users found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.Id}>
                        <td>{user.Name || "N/A"}</td>
                        <td>{user.Email || "N/A"}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => assignPlanToUser(user.Id)}
                            disabled={assignLoading}
                          >
                            {assignLoading ? "Assigning..." : "Assign Plan"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
