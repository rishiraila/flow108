"use client";
import React, { useState } from "react";

export default function SuperUsersPage() {
  const [superUsers, setSuperUsers] = useState([
    {
      Id: 1,
      Name: "Rishikesh Raila",
      Email: "rishi@example.com",
      Phone: "9876543210",
      Role: "Admin",
    },
    {
      Id: 2,
      Name: "Shivraj Babar",
      Email: "shivraj@example.com",
      Phone: "9998887777",
      Role: "User",
    },
    {
      Id: 3,
      Name: "Sneha Patil",
      Email: "sneha@example.com",
      Phone: "9080706050",
      Role: "Admin",
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setSuperUsers((prev) =>
      prev.map((user) => (user.Id === id ? { ...user, Role: newStatus } : user))
    );
  };

  const handleDelete = (email) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setSuperUsers((prev) => prev.filter((user) => user.Email !== email));
    }
  };

  const handleChangePassword = (email) => {
    alert(`Change password for: ${email}`);
  };

  return (
    <div className="container-xxl py-4">
      <h4 className="mb-4 fw-bold">Super Users</h4>
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-primary">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>User Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {superUsers.map((user) => (
                <tr key={user.Id}>
                  <td>{user.Name}</td>
                  <td>{user.Email}</td>
                  <td>{user.Phone}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={user.Role}
                      onChange={(e) =>
                        handleStatusChange(user.Id, e.target.value)
                      }
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      title="Edit User"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger me-1"
                      title="Delete User"
                      onClick={() => handleDelete(user.Email)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-warning"
                      title="Change Password"
                      onClick={() => handleChangePassword(user.Email)}
                    >
                      <i className="bi bi-key"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {superUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No super users available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
