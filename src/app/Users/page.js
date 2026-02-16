"use client";
import React, { useEffect, useState } from "react";
import { fetchForumPosts, fetchQuestions } from "../utils/api";
import { userApi } from "../utils/apiClient";

export default function Page() {
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("userList");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [subAdminEmail, setSubAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [subAdmins, setSubAdmins] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [confirmSubAdminEmail, setConfirmSubAdminEmail] = useState("");

  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    paidMembers: 0,
    totalQuestions: 0,
    totalPosts: 0,
  });

  const usersPerPage = 10;

  const [newUser, setNewUser] = useState({
    OID: "1", // static
    Email: "",
    Name: "",
    GivenName: "",
    FamilyName: "",
    // ProfilePictureUrl: "",
    IsEmailVerified: false,
    IsApproved: true,
  });

  const fetchSubAdmins = async () => {
    try {
      setLoadingAdmins(true);

      const res = await fetch(
        "https://api.flow108.in/api/AdminAccount/sub-admins",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.Status === true) {
        setSubAdmins(data.Data || []);
      } else {
        alert(data.Message || "Failed to fetch sub-admins");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching sub-admins");
    } finally {
      setLoadingAdmins(false);
    }
  };
  const handleAddSubAdmin = async () => {
    const email = subAdminEmail.trim().toLowerCase();
    const confirmEmail = confirmSubAdminEmail.trim().toLowerCase();

    if (!email || !confirmEmail) {
      alert("Both email fields are required");
      return;
    }

    if (email !== confirmEmail) {
      alert("Email and Confirm Email do not match");
      return;
    }

    try {
      setAddingAdmin(true);

      const res = await fetch(
        `https://api.flow108.in/api/AdminAccount/sub-admin?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.Status === true) {
        alert("Sub-admin added successfully");
        setSubAdminEmail("");
        setConfirmSubAdminEmail("");
        fetchSubAdmins();
      } else {
        alert(data.Message || "Failed to add sub-admin");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding sub-admin");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      // Use apiClient for delete request (includes JWT token)
      const response = await fetch(
        `https://api.flow108.in/api/AdminAccount/delete-user-by-email?email=${encodeURIComponent(
          email,
        )}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.Status === true && data.Data === true) {
        alert("User deleted successfully.");
        await fetchUsers();

        // Check if current page is now empty and adjust pagination
        const filteredUsers = Array.isArray(users)
          ? [...users]
              .filter((user) => {
                const approved = normalizeApproved(user.IsApproved);
                return view === "userList" ? approved : !approved;
              })
              .filter((user) => {
                const term = searchTerm.toLowerCase();
                return (
                  user.Name?.toLowerCase().includes(term) ||
                  user.Email?.toLowerCase().includes(term)
                );
              })
          : [];

        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;

        // If current page is empty or exceeds total pages, adjust to previous page or last page
        if (indexOfFirstUser >= filteredUsers.length && currentPage > 1) {
          setCurrentPage(Math.min(currentPage - 1, totalPages));
        } else if (totalPages > 0 && currentPage > totalPages) {
          setCurrentPage(totalPages);
        }
      } else {
        alert("Failed to delete user.");
        console.error("API error:", data);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      setLoadingUsers(true);
      const usersArray = await userApi.getAll();
      setUsers((prev) => (Array.isArray(usersArray) ? usersArray : prev));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch all users from API using apiClient (includes JWT token)
      const usersArray = await userApi.getAll();
      const normalizedUsers = Array.isArray(usersArray) ? usersArray : [];
      const totalUsers = normalizedUsers.length;
      const paidMembers = normalizedUsers.filter((user) =>
        normalizeApproved(user.IsApproved),
      ).length;

      // Get total questions and posts for the other stats
      const allQuestions = await fetchQuestions();
      const allPosts = await fetchForumPosts();

      // Set stats with all four values
      setStats({
        totalUsers,
        paidMembers,
        totalQuestions: allQuestions.length,
        totalPosts: allPosts.length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  useEffect(() => {
    setSearchTerm("");
    setAppliedSearchTerm("");

    const token = localStorage.getItem("adminToken");
    if (!token) return;

    fetchUsers();
    loadStats();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      setCurrentPage(1);
    }
  }, [users, view]);

  useEffect(() => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
    if (view === "manageAdmins") {
      fetchSubAdmins();
    }
  }, [view]);
  const isBlank = (value) => !value || value.trim() === "";
  const normalizeApproved = (value) => {
    if (value === true) return true;
    if (value === false) return false;

    if (typeof value === "number") return value === 1;

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1") return true;
      if (normalized === "false" || normalized === "0") return false;
    }

    return false;
  };
  const resetAddAdminForm = () => {
    setSubAdminEmail("");
    setConfirmSubAdminEmail("");
  };
  const applySearch = () => {
    setAppliedSearchTerm(searchTerm.trim());
    setCurrentPage(1);
  };
  const clearSearch = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    // 🔒 Trim & normalize values
    const email = newUser.Email.trim().toLowerCase();
    const name = newUser.Name.trim();
    const givenName = newUser.GivenName.trim();
    const familyName = newUser.FamilyName.trim();

    // ❌ Validation: Email
    if (isBlank(email)) {
      alert("Email cannot be empty or contain only spaces.");
      return;
    }

    // ❌ Validation: Check for leading/trailing spaces in original email
    if (newUser.Email !== newUser.Email.trim()) {
      alert("Email cannot have leading or trailing spaces.");
      return;
    }

    // ❌ Validation: Name
    if (isBlank(name)) {
      alert("Name cannot be empty or contain only spaces.");
      return;
    }

    // ❌ Validation: Given Name (only in Add User view)
    if (view === "userList" && newUser.GivenName && isBlank(givenName)) {
      alert("Given Name cannot contain only spaces.");
      return;
    }

    // ❌ Validation: Family Name (only in Add User view)
    if (view === "userList" && newUser.FamilyName && isBlank(familyName)) {
      alert("Family Name cannot contain only spaces.");
      return;
    }

    const url = isEditing
      ? `https://api.flow108.in/api/AdminAccount/update-user/${editUserId}`
      : "https://api.flow108.in/api/AdminAccount/add-user";

    const method = isEditing ? "PATCH" : "POST";

    const body = isEditing
      ? {
          Email: email,
          Name: name,
          GivenName: givenName,
          FamilyName: familyName,
          IsEmailVerified: newUser.IsEmailVerified,
          IsApproved: newUser.IsApproved,
        }
      : view === "requestApproval"
        ? {
            OID: "1",
            Email: email,
            Name: name,
            GivenName: "",
            FamilyName: "",
            IsEmailVerified: false,
            IsApproved: newUser.IsApproved,
          }
        : {
            ...newUser,
            Email: email,
            Name: name,
            GivenName: givenName,
            FamilyName: familyName,
          };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.Status === true) {
        alert(
          isEditing ? "User updated successfully." : "User added successfully.",
        );

        await fetchUsers();

        setSearchTerm("");
        setAppliedSearchTerm("");
        setCurrentPage(1);

        setNewUser({
          OID: "1",
          Email: "",
          Name: "",
          GivenName: "",
          FamilyName: "",
          IsEmailVerified: false,
          IsApproved: true,
        });

        setIsEditing(false);
        setEditUserId(null);

        const modalEl = document.getElementById("addUserModal");
        bootstrap.Modal.getInstance(modalEl)?.hide();
      } else {
        alert(data.Message || "Failed to save user.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred.");
    }
  };
  const handleDeleteSubAdmin = async (email) => {
    if (!confirm(`Remove sub-admin: ${email}?`)) return;

    try {
      const res = await fetch(
        `https://api.flow108.in/api/AdminAccount/sub-admin?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.Status === true) {
        alert("Sub-admin deleted successfully");
        fetchSubAdmins(); // 🔄 refresh list
      } else {
        alert(data.Message || "Failed to delete sub-admin");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting sub-admin");
    }
  };

  const handleStatusChange = async (userId, isApproved) => {
    try {
      const res = await fetch(
        `https://api.flow108.in/api/AdminAccount/update-user/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ IsApproved: isApproved }),
        },
      );

      if (res.ok) {
        fetchUsers(); // Refresh the table after update
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update status.");
      }
    } catch (error) {
      alert("Error while updating status.");
      console.error(error);
    }
  };

  const normalizedSearchTerm = appliedSearchTerm.trim().toLowerCase();

  const approvedUsersCount = Array.isArray(users)
    ? users.reduce(
        (count, user) => count + (normalizeApproved(user.IsApproved) ? 1 : 0),
        0,
      )
    : 0;
  const pendingUsersCount = Array.isArray(users)
    ? users.reduce(
        (count, user) => count + (!normalizeApproved(user.IsApproved) ? 1 : 0),
        0,
      )
    : 0;

  const sortedUsers = Array.isArray(users)
    ? [...users]
        .filter((user) => {
          const approved = normalizeApproved(user.IsApproved);

          if (view === "userList") return approved;
          if (view === "requestApproval") return !approved;
          return true;
        })

        .filter((user) => {
          const term = normalizedSearchTerm;
          if (!term) return true;
          return (
            user.Name?.toLowerCase().includes(term) ||
            user.Email?.toLowerCase().includes(term)
          );
        })
        .sort((a, b) => {
          if (!sortColumn) return 0;

          let valA = a[sortColumn] ?? "";
          let valB = b[sortColumn] ?? "";

          if (sortColumn === "IsApproved") {
            valA = normalizeApproved(a.IsApproved) ? 1 : 0;
            valB = normalizeApproved(b.IsApproved) ? 1 : 0;
          } else if (sortColumn === "Plan") {
            valA = a.Plan || "";
            valB = b.Plan || "";
          } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
          }

          if (valA < valB) return sortDirection === "asc" ? -1 : 1;
          if (valA > valB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
    : [];

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getSortArrow = (col) => {
    if (sortColumn !== col) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats */}
        <div className="row g-6 mb-6">
          {[
            {
              count: stats.totalUsers,
              label: "User Registered",
              class: "primary",
              icon: "ri-user-add-line",
            },
            {
              count: stats.paidMembers,
              label: "Paid Members",
              class: "warning",
              icon: "ri-user-star-line",
            },
            {
              count: stats.totalQuestions,
              label: "Total Questions",
              class: "danger",
              icon: "ri-group-line",
            },
            {
              count: stats.totalPosts,
              label: "Total Posts",
              class: "info",
              icon: "ri-article-line",
            },
          ].map((item, index) => (
            <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className={`card card-border-shadow-${item.class} h-100`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span
                        className={`avatar-initial rounded-3 bg-label-${item.class}`}
                      >
                        <i className={`tf-icons ${item.icon} ri-24px`}></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{item.count}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">{item.label}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <h4 className="mb-3 mt-4 fw-bold">Manage Users</h4>
        <div className="d-flex gap-3 mb-3">
          <button
            className={`btn ${view === "userList" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setView("userList")}
          >
            User List{loadingUsers ? " (...)" : ` (${approvedUsersCount})`}
          </button>

          <button
            className={`btn ${view === "requestApproval" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setView("requestApproval")}
          >
            User Request Approval
            {loadingUsers ? " (...)" : ` (${pendingUsersCount})`}
          </button>

          <button
            className={`btn ${view === "manageAdmins" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setView("manageAdmins")}
          >
            Manage Admins
          </button>
        </div>

        {/* User Table */}
        <div className="card">
          <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center">
            <h3 className="card-title mb-0 mb-md-0">
              {view === "userList" ? "User List" : "User Request Approval"}
            </h3>

            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={
                  view === "manageAdmins"
                    ? "Search by Email"
                    : "Search by Name or Email"
                }
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
              />
              {view !== "manageAdmins" && (
                <>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={applySearch}
                  >
                    Search
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={clearSearch}
                    disabled={!searchTerm && !appliedSearchTerm}
                  >
                    Clear
                  </button>
                </>
              )}

              {view !== "manageAdmins" && (
                <button
                  className="btn btn-sm btn-primary w-75"
                  data-bs-toggle="modal"
                  data-bs-target="#addUserModal"
                >
                  <i className="ri-add-line"></i>{" "}
                  {view === "userList" ? "Add User" : "Add Request"}
                </button>
              )}

              {view === "manageAdmins" && (
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#addAdminModal"
                >
                  <i className="ri-user-add-line"></i> Add Admin
                </button>
              )}
            </div>
          </div>

          <div className="card-datatable table-responsive">
            <div className="container mt-2">
              <table className="table table-bordered table-striped">
                <thead className="table-primary">
                  <tr>
                    <th>Sr No</th>

                    {view === "manageAdmins" ? (
                      <>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </>
                    ) : (
                      <>
                        <th
                          onClick={() => handleSort("Name")}
                          style={{ cursor: "pointer" }}
                        >
                          User{getSortArrow("Name")}
                        </th>
                        <th
                          onClick={() => handleSort("Email")}
                          style={{ cursor: "pointer" }}
                        >
                          Email{getSortArrow("Email")}
                        </th>
                        <th>Actions</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {view === "manageAdmins" ? (
                    loadingAdmins ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : subAdmins.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No sub-admins found
                        </td>
                      </tr>
                    ) : (
                      subAdmins.map((admin, index) => (
                        <tr key={admin.Id}>
                          <td>{index + 1}</td>
                          <td>{admin.Email}</td>
                          <td>{admin.Role}</td>
                          <td>
                            <span
                              className={`badge ${admin.IsActive ? "bg-success" : "bg-secondary"}`}
                            >
                              {admin.IsActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteSubAdmin(admin.Email)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : loadingUsers ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr key={user.Id}>
                        <td>{indexOfFirstUser + index + 1}</td>
                        <td>{user.Name}</td>
                        <td>{user.Email}</td>
                        <td>
                          {view !== "requestApproval" && (
                            <a href={`/UserDetails?id=${user.Id}`}>
                              <button className="btn btn-sm btn-outline-success me-1">
                                <i className="bi bi-bar-chart-fill"></i>
                              </button>
                            </a>
                          )}

                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => {
                              setNewUser({
                                OID: "1",
                                Email: user.Email,
                                Name: user.Name,
                                GivenName: user.GivenName,
                                FamilyName: user.FamilyName,
                                IsEmailVerified: user.IsEmailVerified,
                                IsApproved: user.IsApproved,
                              });
                              setIsEditing(true);
                              setEditUserId(user.Id);
                              const modalEl =
                                document.getElementById("addUserModal");
                              const modal = new bootstrap.Modal(modalEl);
                              modal.show();
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user.Email)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        <div
          className="modal fade"
          id="addUserModal"
          tabIndex="-1"
          aria-labelledby="addUserModalLabel"
          aria-hidden="true"
          data-bs-backdrop="static"
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header text-white rounded-top-4">
                <h5 className="modal-title" id="addUserModalLabel">
                  {view === "userList" ? "Add New User" : "Add User Request"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-light"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <form id="addUserFormModal" onSubmit={handleSubmitUser}>
                  {/* Email - shown in both views */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={newUser.Email}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          Email: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Name - shown in both views */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={newUser.Name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, Name: e.target.value })
                      }
                    />
                  </div>

                  {/* Additional fields only shown in Add User view */}
                  {view === "userList" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Given Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={newUser.GivenName}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              GivenName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Family Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={newUser.FamilyName}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              FamilyName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Email Verified
                        </label>
                        <select
                          className="form-select"
                          value={newUser.IsEmailVerified ? "true" : "false"}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              IsEmailVerified: e.target.value === "true",
                            })
                          }
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* IsApproved - shown in both views */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Approved</label>
                    <select
                      className="form-select"
                      value={newUser.IsApproved ? "true" : "false"}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          IsApproved: e.target.value === "true",
                        })
                      }
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary fw-semibold"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="addAdminModal"
          tabIndex="-1"
          aria-hidden="true"
          data-bs-backdrop="static"
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Add Sub-Admin</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Admin Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter admin email"
                    value={subAdminEmail}
                    onChange={(e) => setSubAdminEmail(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold">
                    Confirm Email
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Re-enter admin email"
                    value={confirmSubAdminEmail}
                    onChange={(e) => setConfirmSubAdminEmail(e.target.value)}
                  />
                </div>

                {confirmSubAdminEmail &&
                  subAdminEmail !== confirmSubAdminEmail && (
                    <small className="text-danger">Emails do not match</small>
                  )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={resetAddAdminForm}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  disabled={addingAdmin}
                  onClick={async () => {
                    await handleAddSubAdmin();
                    const modal = bootstrap.Modal.getInstance(
                      document.getElementById("addAdminModal"),
                    );
                    modal.hide();
                  }}
                >
                  {addingAdmin ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
