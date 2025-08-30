"use client";
import { useEffect, useState } from "react";
import { fetchAllDietUserAssignments } from "../utils/api";

export default function DietAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAllDietUserAssignments();
      
      // Handle different response structures
      let assignmentsData = [];
      
      if (response.data && Array.isArray(response.data)) {
        assignmentsData = response.data;
      } else if (response.Data && Array.isArray(response.Data)) {
        assignmentsData = response.Data;
      } else if (Array.isArray(response)) {
        assignmentsData = response;
      }
      
      setAssignments(assignmentsData);
    } catch (err) {
      console.error("Error fetching diet assignments:", err);
      setError(err.message || "Failed to fetch diet plan assignments");
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (assignment.UserName?.toLowerCase().includes(searchLower)) ||
      (assignment.UserEmail?.toLowerCase().includes(searchLower)) ||
      (assignment.DietPlanName?.toLowerCase().includes(searchLower)) ||
      (assignment.DietPlanId?.toLowerCase().includes(searchLower)) ||
      (assignment.UserId?.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading diet plan assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Assignments</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={fetchAssignments}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Diet Plan Assignments</h5>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search assignments..."
                    style={{ width: "250px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-primary"
                    onClick={fetchAssignments}
                    title="Refresh assignments"
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div className="card-body">
                {assignments.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-people display-1 text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-2">No Diet Plan Assignments Found</h5>
                    <p className="text-muted">
                      There are no diet plan assignments available yet.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Diet Plan</th>
                          <th>Plan ID</th>
                          <th>Assigned On</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssignments.map((assignment) => (
                          <tr key={`${assignment.UserId}-${assignment.DietPlanId}`}>
                            <td>
                              <div className="d-flex align-items-center">
                                {assignment.ProfilePictureUrl ? (
                                  <img
                                    src={assignment.ProfilePictureUrl}
                                    alt={assignment.UserName}
                                    className="rounded-circle me-2"
                                    style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                  />
                                ) : (
                                  <div
                                    className="rounded-circle me-2 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      backgroundColor: "#007bff",
                                      color: "white",
                                      fontSize: "12px"
                                    }}
                                  >
                                    {assignment.UserName?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                )}
                                <div>
                                  <div className="fw-medium">{assignment.UserName || "Unknown User"}</div>
                                  <small className="text-muted">ID: {assignment.UserId}</small>
                                </div>
                              </div>
                            </td>
                            <td>{assignment.UserEmail || "N/A"}</td>
                            <td>
                              <div className="fw-medium">{assignment.DietPlanName || "Unknown Plan"}</div>
                              {assignment.DietPlanDescription && (
                                <small className="text-muted">{assignment.DietPlanDescription}</small>
                              )}
                            </td>
                            <td>
                              <code>{assignment.DietPlanId}</code>
                            </td>
                            <td>
                              {assignment.AssignedDate ? (
                                new Date(assignment.AssignedDate).toLocaleDateString()
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td>
                              <span className={`badge ${assignment.IsActive ? 'bg-success' : 'bg-secondary'}`}>
                                {assignment.IsActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredAssignments.length === 0 && searchTerm && (
                      <div className="text-center py-4">
                        <p className="text-muted">No assignments match your search criteria.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {assignments.length > 0 && (
                <div className="card-footer">
                  <div className="row">
                    <div className="col-md-6">
                      <small className="text-muted">
                        Showing {filteredAssignments.length} of {assignments.length} assignments
                      </small>
                    </div>
                    <div className="col-md-6 text-end">
                      <small className="text-muted">
                        Last updated: {new Date().toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
