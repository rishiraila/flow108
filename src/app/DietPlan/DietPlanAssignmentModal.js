"use client";
import { useState, useEffect } from "react";

export default function DietPlanAssignmentModal({ isOpen, onClose, planId, onAssignmentSuccess }) {
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (isOpen && planId) {
      fetchUsers();
      fetchAssignedUsers();
      setSelectedUsers([]);
      setAssignError(null);
      setAssignSuccess(false);
    }
  }, [isOpen, planId]);

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

  const fetchAssignedUsers = async () => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/users`
      );
      if (!response.ok) {
        console.warn(`Failed to fetch assigned users: ${response.status}`);
        setAssignedUsers([]);
        return;
      }
      const data = await response.json();
      if (data.Status && Array.isArray(data.Data)) {
        setAssignedUsers(data.Data);
      } else {
        setAssignedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      setAssignedUsers([]);
    }
  };

  const assignPlanToUser = async (userId) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/users/${userId}/dietplans/${planId}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: null,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      if (!result.status) {
        throw new Error(result.message || "Failed to assign plan");
      }
      return true;
    } catch (error) {
      throw error;
    }
  };

  const assignPlanToSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      setAssignError("Please select at least one user to assign the plan.");
      return;
    }
    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      for (const userId of selectedUsers) {
        await assignPlanToUser(userId);
      }
      setAssignSuccess(true);
      onAssignmentSuccess();
      setTimeout(() => {
        setAssignSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAssignError(error.message || "Failed to assign plan to selected users");
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
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
            <h5 className="modal-title">Assign Diet Plan to User(s)</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {assignSuccess && (
              <div className="alert alert-success" role="alert">
                Plan assigned successfully!
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
            ) : users.filter(
                (user) =>
                  !assignedUsers.some(
                    (assigned) => assigned.Id === user.Id
                  )
              ).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">All users are already assigned to this diet plan.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.filter(
                              (user) => !assignedUsers.some(
                                (assigned) => assigned.Id === user.Id
                              )
                            ).length && users.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(users.filter(
                                  (user) => !assignedUsers.some(
                                    (assigned) => assigned.Id === user.Id
                                  )
                                ).map((u) => u.Id));
                              } else {
                                setSelectedUsers([]);
                              }
                            }}
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(
                          (user) =>
                            !assignedUsers.some(
                              (assigned) => assigned.Id === user.Id
                            )
                        )
                        .map((user) => (
                          <tr key={user.Id}>
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.Id)}
                                onChange={() => toggleUserSelection(user.Id)}
                              />
                            </td>
                            <td>{user.Name || "N/A"}</td>
                            <td>{user.Email || "N/A"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <button
                    className="btn btn-primary"
                    onClick={assignPlanToSelectedUsers}
                    disabled={assignLoading}
                  >
                    {assignLoading ? "Assigning..." : "Assign Plan to Selected Users"}
                  </button>
                </div>
              </>
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
