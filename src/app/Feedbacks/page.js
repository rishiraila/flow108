"use client";
import React, { useEffect, useState } from "react";
import authenticatedFetch from "../utils/authenticatedFetch";

export default function Page() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await authenticatedFetch("https://api.flow108.in/api/admin/AdminFeedback/all");
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
      const istDate = new Date(date.getTime() + istOffset);
      return istDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
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
            <h4 className="alert-heading">Error loading feedbacks</h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={fetchFeedbacks}>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Feedbacks</h4>
          <button className="btn btn-primary" onClick={fetchFeedbacks}>
            <i className="ri-refresh-line me-1"></i>
            Refresh
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">All Feedbacks ({feedbacks.length})</h5>
          </div>
          <div className="card-datatable table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-primary">
                <tr>
                  <th>Sr No</th>
                  <th>User Name</th>
                  <th>User Email</th>
                  <th>Feedback Type</th>
                  <th>Message</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="d-flex flex-column align-items-center">
                        <i className="ri-feedback-line ri-3x text-muted mb-2"></i>
                        <span className="text-muted">No feedbacks found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((feedback, index) => (
                    <tr key={feedback.Id || index}>
                      <td>{index + 1}</td>
                      <td>{feedback.UserName || "N/A"}</td>
                      <td>{feedback.UserEmail || "N/A"}</td>
                      <td>
                        <span className={`badge ${
                          feedback.FeedbackType === "Suggestion" ? "bg-info" :
                          feedback.FeedbackType === "Request" ? "bg-warning" :
                          "bg-secondary"
                        }`}>
                          {feedback.FeedbackType || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div style={{ maxWidth: "300px", wordWrap: "break-word" }}>
                          {feedback.Message || "N/A"}
                        </div>
                      </td>
                      <td>{formatDate(feedback.CreatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
