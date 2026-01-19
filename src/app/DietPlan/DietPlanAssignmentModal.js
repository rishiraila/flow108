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
  const [allAssignments, setAllAssignments] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignAllLoading, setAssignAllLoading] = useState(false);
  const [unassignAllLoading, setUnassignAllLoading] = useState(false);
  const [unassignSelectedLoading, setUnassignSelectedLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [unassignSuccess, setUnassignSuccess] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState([]);
  const [unassigningUsers, setUnassigningUsers] = useState(new Set());

  useEffect(() => {
    if (isOpen && planId) {
      fetchUsers();
      fetchAssignedUsers();
      fetchAllAssignments();
      setSelectedUsers([]);
      setSelectedAssignedUsers([]);
      setUnassigningUsers(new Set());
      setAssignError(null);
      setAssignSuccess(false);
    }
  }, [isOpen, planId]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setAssignError(null);
    try {
      const response = await fetch(
        "https://flow108.coinagesoft.com/api/AdminAccount/all-users"
      );
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
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      await dietAssignmentApi.assignToUser(userId, planId);
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
      alert("Diet plan assigned successfully!");
      setAssignSuccess(true);
      onAssignmentSuccess();
      setTimeout(() => {
        setAssignSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAssignError(
        error.message || "Failed to assign plan to selected users"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const assignAllToPlan = async () => {
    setAssignAllLoading(true);
    setAssignError(null);
    setAssignSuccess(false);
    try {
      const { dietAssignmentApi } = await import("../utils/apiClient");
      await dietAssignmentApi.assignAllToPlan(planId);
      alert("Diet plan assigned successfully!");
      setAssignSuccess(true);
      onAssignmentSuccess();
      setTimeout(() => {
        setAssignSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAssignError(error.message || "Failed to assign plan to all users");
    } finally {
      setAssignAllLoading(false);
    }
  };

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
      for (const userId of selectedAssignedUsers) {
        const response = await fetch(
          `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/unassign/${userId}`,
          {
            method: "DELETE",
            headers: {
              accept: "*/*",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to unassign user");
        const result = await response.json();
        if (!result.Status)
          throw new Error(result.Message || "Failed to unassign user");
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
            <h5 className="modal-title">
              {mode === "view"
                ? "View Assigned Users"
                : "Assign Diet Plan to User(s)"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {mode === "view" ? (
              <>
                {assignedUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      No users assigned to this diet plan yet.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Assigned Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedUsers.map((user) => (
                          <tr key={user.UserId}>
                            <td>{user.Name || "N/A"}</td>
                            <td>{user.Email || "N/A"}</td>
                            <td>
                              {new Date(user.AssignedDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                {assignSuccess && (
                  <div className="alert alert-success" role="alert">
                    Plan assigned successfully!
                  </div>
                )}
                {unassignSuccess && (
                  <div className="alert alert-success" role="alert">
                    Users unassigned successfully!
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
                      !assignedUsers.some((assigned) => assigned.Id === user.Id)
                  ).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      All users are already assigned to this diet plan.
                    </p>
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
                                  selectedUsers.length ===
                                    users.filter(
                                      (user) =>
                                        !assignedUsers.some(
                                          (assigned) => assigned.Id === user.Id
                                        )
                                    ).length && users.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(
                                      users
                                        .filter(
                                          (user) =>
                                            !assignedUsers.some(
                                              (assigned) =>
                                                assigned.Id === user.Id
                                            )
                                        )
                                        .map((u) => u.Id)
                                    );
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
                                    onChange={() =>
                                      toggleUserSelection(user.Id)
                                    }
                                  />
                                </td>
                                <td>{user.Name || "N/A"}</td>
                                <td>{user.Email || "N/A"}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex justify-content-end mt-3 gap-2">
                      <button
                        className="btn btn-danger"
                        onClick={unassignAllFromPlan}
                        disabled={unassignAllLoading}
                      >
                        {unassignAllLoading
                          ? "Unassigning..."
                          : "Unassign from All Users"}
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={assignAllToPlan}
                        disabled={assignAllLoading}
                      >
                        {assignAllLoading
                          ? "Assigning..."
                          : "Assign to All Users"}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={assignPlanToSelectedUsers}
                        disabled={assignLoading}
                      >
                        {assignLoading
                          ? "Assigning..."
                          : "Assign Plan to Selected Users"}
                      </button>
                    </div>
                  </>
                )}
                {assignedUsers.length > 0 && (
                  <>
                    <h6 className="mt-4">Assigned Users</h6>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>
                              <input
                                type="checkbox"
                                checked={
                                  selectedAssignedUsers.length ===
                                    assignedUsers.length &&
                                  assignedUsers.length > 0
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAssignedUsers(
                                      assignedUsers.map((u) => u.Id)
                                    );
                                  } else {
                                    setSelectedAssignedUsers([]);
                                  }
                                }}
                              />
                            </th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedUsers.map((user) => (
                            <tr key={user.Id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedAssignedUsers.includes(
                                    user.Id
                                  )}
                                  onChange={() =>
                                    toggleAssignedUserSelection(user.Id)
                                  }
                                />
                              </td>
                              <td>{user.Name || "N/A"}</td>
                              <td>{user.Email || "N/A"}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={async (e) => {
                                    e.preventDefault();

                                    console.log("UNASSIGN CLICKED"); // 🔍 DEBUG (you can remove later)

                                    const confirmed = window.confirm(
                                      `Are you sure you want to unassign the diet plan from ${user.Name}?`
                                    );

                                    if (!confirmed) return;

                                    // 🔒 disable AFTER confirmation
                                    setUnassigningUsers((prev) =>
                                      new Set(prev).add(user.Id)
                                    );
                                    setAssignError(null);

                                    try {
                                      const response = await fetch(
                                        `https://flow108.coinagesoft.com/api/AdminDietPlan/${planId}/unassign/${user.Id}`,
                                        {
                                          method: "DELETE",
                                          headers: { accept: "*/*" },
                                        }
                                      );

                                      if (!response.ok)
                                        throw new Error(
                                          "Failed to unassign user"
                                        );

                                      const result = await response.json();
                                      if (!result.Status) {
                                        throw new Error(
                                          result.Message ||
                                            "Failed to unassign user"
                                        );
                                      }

                                      setUnassignSuccess(true);
                                      await fetchAssignedUsers();
                                      onAssignmentSuccess();

                                      setTimeout(
                                        () => setUnassignSuccess(false),
                                        3000
                                      );
                                    } catch (error) {
                                      setAssignError(
                                        error.message ||
                                          "Failed to unassign user"
                                      );
                                    } finally {
                                      setUnassigningUsers((prev) => {
                                        const next = new Set(prev);
                                        next.delete(user.Id);
                                        return next;
                                      });
                                    }
                                  }}
                                >
                                  Unassign
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                      <button
                        className="btn btn-danger"
                        onClick={unassignPlanFromSelectedUsers}
                        disabled={unassignSelectedLoading}
                      >
                        {unassignSelectedLoading
                          ? "Unassigning..."
                          : "Unassign Selected Users"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
