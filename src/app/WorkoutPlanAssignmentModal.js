"use client";
import { useState, useEffect } from "react";
import { fetchAllWorkoutUserAssignments } from "./utils/api";
import { useAlert } from "./utils/alertcontxt";

export default function WorkoutPlanAssignmentModal({ 
  isOpen, 
  onClose, 
  planId, 
  onAssignmentSuccess 
}) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("https://flow108.coinagesoft.com/api/AdminAccount/all-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      let allUsers = data.Data || [];

      try {
        const assignments = await fetchAllWorkoutUserAssignments();
        const assignedUserIds = assignments
          .filter(assignment => assignment.WorkoutPlanId === planId)
          .map(assignment => assignment.UserId);

        allUsers = allUsers.filter(user => !assignedUserIds.includes(user.Id));
      } catch (assignmentError) {
        console.warn("Failed to fetch assignments:", assignmentError);
      }

      setUsers(allUsers);
    } catch (error) {
      showAlert("error", error.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const assignPlanToUser = async (userId) => {
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
      showAlert("error", "Please select at least one user to assign the plan.");
      return;
    }
    setAssignLoading(true);
    try {
     for (const userId of selectedUsers) {
    await assignPlanToUser(userId);
   }
   showAlert("success", "Workout plan assigned successfully!");
   onAssignmentSuccess();
   setTimeout(() => onClose(), 4000);
    } catch (error) {
      showAlert("error", error.message || "Failed to assign plan to selected users");
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
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
            <h5 className="modal-title">Assign Workout Plan to User(s)</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
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
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(users.map((u) => u.Id));
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
                      {users.map((user) => (
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
