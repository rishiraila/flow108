"use client";
import { useState, useEffect } from "react";

export default function DietPlanAssignmentModal({
  isOpen,
  onClose,
  planId,
  onAssignmentSuccess,
  mode = "assign",
}) {
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignAllLoading, setAssignAllLoading] = useState(false);

  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  // const [selectedAssignedUsers, setSelectedAssignedUsers] = useState([]);
  // const [unassigningUsers, setUnassigningUsers] = useState(new Set());

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
    try {
      const { userApi } = await import("../utils/apiClient");
      const data = await userApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setAssignError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      const data = await dietAssignmentApi.getPlanAssignments(planId);
      setAssignedUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      setAssignedUsers([]);
    }
  };

  const fetchAllAssignments = async () => {
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      const assignments = await dietAssignmentApi.getAllAssignments();
      setAllAssignments(assignments);
    } catch (error) {
      console.error("Error fetching all assignments:", error);
      setAllAssignments([]);
    }
  };

  const assignPlanToUser = async (userId) => {
    const { dietAssignmentApi } = await import("../utils/apiClient");
    await dietAssignmentApi.assignToUser(userId, planId);
    return true;
  };

  const assignPlanToSelectedUsers = async () => {
    if (selectedUsers.length === 0) {
      setAssignError("Please select at least one user.");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);

    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");

      for (const userId of selectedUsers) {
        await dietAssignmentApi.assignToUser(userId, planId);
      }

      alert("Diet plan assigned successfully!");
      onAssignmentSuccess();
      onClose();
    } catch (error) {
      setAssignError("Failed to assign diet plan.");
    } finally {
      setAssignLoading(false);
    }
  };

  const assignAllToPlan = async () => {
    setAssignAllLoading(true);
    setAssignError(null);

    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      await dietAssignmentApi.assignAllToPlan(planId);

      alert("Diet plan assigned to all users!");
      onAssignmentSuccess();
      onClose();
    } catch (error) {
      setAssignError("Failed to assign diet plan to all users.");
    } finally {
      setAssignAllLoading(false);
    }
  };

  const assignedUserIds = new Set(assignedUsers.map((u) => u.UserId || u.Id));

  const availableUsers = users.filter((user) => !assignedUserIds.has(user.Id));

  const unassignAllFromPlan = async () => {
    setUnassignAllLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    setUnassignSuccess(false);
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      await dietAssignmentApi.unassignAllFromPlan(planId);
      setUnassignSuccess(true);
      onAssignmentSuccess();
      setTimeout(() => {
        setUnassignSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAssignError(error.message || "Failed to unassign plan from all users");
    } finally {
      setUnassignAllLoading(false);
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

  const toggleAssignedUserSelection = (userId) => {
    setSelectedAssignedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const unassignPlanFromSelectedUsers = async () => {
    if (selectedAssignedUsers.length === 0) {
      setAssignError("Please select at least one user to unassign.");
      return;
    }
    setUnassignSelectedLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    setUnassignSuccess(false);
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      for (const userId of selectedAssignedUsers) {
        await dietAssignmentApi.removeAssignment(userId, planId);
      }
      alert("Selected users unassigned successfully!");
      setUnassignSuccess(true);
      onAssignmentSuccess();
      setTimeout(() => {
        setUnassignSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAssignError(error.message || "Failed to unassign selected users");
    } finally {
      setUnassignSelectedLoading(false);
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
            <h5 className="modal-title">Assign Diet Plan to User(s)</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {assignError && (
              <div className="alert alert-danger">{assignError}</div>
            )}

            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading users...</p>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-4 text-muted">
                All users are already assigned to this diet plan.
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
                            checked={
                              selectedUsers.length === availableUsers.length &&
                              availableUsers.length > 0
                            }
                            onChange={(e) =>
                              setSelectedUsers(
                                e.target.checked
                                  ? availableUsers.map((u) => u.Id)
                                  : [],
                              )
                            }
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableUsers.map((user) => (
                        <tr key={user.Id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.Id)}
                              onChange={() => toggleUserSelection(user.Id)}
                            />
                          </td>
                          <td>{user.Name || "N/A"}</td>
                          <td>{user.Email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-success"
                    onClick={assignAllToPlan}
                    disabled={assignAllLoading}
                  >
                    {assignAllLoading ? "Assigning..." : "Assign to All Users"}
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={assignPlanToSelectedUsers}
                    disabled={assignLoading}
                  >
                    {assignLoading ? "Assigning..." : "Assign Selected Users"}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
