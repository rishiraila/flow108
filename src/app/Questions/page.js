"use client";
import React, { useEffect, useState } from "react";
import AdminQuestionModal from "./AdminQuestionModal";
import authenticatedFetch from "../utils/authenticatedFetch";

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// API functions for questions
const fetchQuestions = async () => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/community/questions`, {
    method: "GET",
    headers: {
      accept: "*/*",
    },
  });
  return data.data || [];
};

const answerQuestion = async (questionId, answerText) => {
  const data = await authenticatedFetch(
    `${API_BASE_URL}/admin/community/questions/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerText),
    }
  );
  return data;
};

const createQuestion = async (questionData) => {
  const data = await authenticatedFetch(`${API_BASE_URL}/admin/community/questions`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(questionData),
  });
  return data;
};

const fetchQuestionById = async (id) => {
  const data = await authenticatedFetch(
    `${API_BASE_URL}/admin/community/questions/${id}`,
    {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    }
  );
  return data.data || null;
};

const updateQuestion = async (id, questionData) => {
  const data = await authenticatedFetch(
    `${API_BASE_URL}/admin/community/questions/${id}`,
    {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    }
  );
  return data;
};

const deleteQuestion = async (id) => {
  const data = await authenticatedFetch(
    `${API_BASE_URL}/admin/community/questions/delete/${id}`,
    {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
    }
  );
  return data;
};

export default function QuestionsPage() {
  const [filterType, setFilterType] = useState("all"); // values: "all", "public", "private"
  const [sortOption, setSortOption] = useState("new"); // values: "new", "old"

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    Content: "",
    IsAnonymous: false,
    Visibility: 1,
    ViewCount: 0,
    LikeCount: 0,
    UserId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editQuestion, setEditQuestion] = useState({
    Content: "",
    IsAnonymous: false,
    Visibility: 0,
  });
  const [viewLoading, setViewLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [questionToAnswer, setQuestionToAnswer] = useState(null);
  const [openAnswerId, setOpenAnswerId] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, [filterType]);

  const sortedQuestions = React.useMemo(() => {
    const sorted = [...questions].sort((a, b) => {
      if (sortOption === "new") {
        return new Date(b.CreatedOn) - new Date(a.CreatedOn);
      } else if (sortOption === "old") {
        return new Date(a.CreatedOn) - new Date(b.CreatedOn);
      }
      return 0;
    });
    return sorted;
  }, [questions, sortOption]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let data = [];

      if (filterType === "public") {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/admin/community/questions/public/all`
        );
        data = response.data || [];
      } else if (filterType === "private") {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/admin/community/questions/private/all`
        );
        data = response.data || [];
      } else if (filterType === "unanswered") {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/admin/community/questions/unanswered`
        );
        data = response.data || [];
      } else {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/admin/community/questions`
        );
        data = response.data || [];
      }

      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await createQuestion(newQuestion);
      setNewQuestion({
        Content: "",
        IsAnonymous: false,
        Visibility: 0,
        ViewCount: 0,
        LikeCount: 0,
        UserId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      });
      loadQuestions();

      // Close modal
      const modal = document.getElementById("addQuestionModal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    } catch (err) {
      alert("Failed to add question: " + err.message);
    }
  };

  const handleViewQuestion = async (id) => {
    try {
      setViewLoading(true);
      const question = await fetchQuestionById(id);
      setSelectedQuestion(question);
      setEditQuestion({
        Content: question.Content,
        IsAnonymous: question.IsAnonymous,
        Visibility: question.Visibility,
      });

      // Open view modal
      const modal = new bootstrap.Modal(
        document.getElementById("viewQuestionModal")
      );
      modal.show();
    } catch (err) {
      alert("Failed to load question: " + err.message);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    try {
      setEditLoading(true);
      await updateQuestion(selectedQuestion.Id, editQuestion);
      loadQuestions();

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("viewQuestionModal")
      );
      modal?.hide();

      setSelectedQuestion(null);
    } catch (err) {
      alert("Failed to update question: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      try {
        await deleteQuestion(id);
        loadQuestions();
        alert("Question deleted successfully.");
      } catch (err) {
        alert("Failed to delete question: " + err.message);
      }
    }
  };

  const handleAnswerQuestion = (questionId) => {
    setOpenAnswerId(openAnswerId === questionId ? null : questionId);
    setAnswerText("");
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!answerText.trim()) return;

    try {
      setAnswerLoading(true);
      await answerQuestion(questionId, answerText);
      alert("Answer submitted successfully!");
      loadQuestions();

      // Reset states
      setOpenAnswerId(null);
      setAnswerText("");
    } catch (err) {
      alert("Failed to submit answer: " + err.message);
    } finally {
      setAnswerLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&size=50`;
  };

  if (loading) {
    return (
      <div className="container p-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container p-4">
        <div className="alert alert-danger">
          Error loading questions: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats Cards - Similar to Exercise page */}
        <div className="row mb-5">
          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary">
                      <i className="tf-icons ri-question-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{questions.length}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Questions</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">Live Data</span>
                  <small className="text-muted">from API</small>
                </p> */}
              </div>
            </div>
          </div>

          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning">
                      <i className="ri-heart-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {questions.reduce((sum, q) => sum + q.LikeCount, 0)}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Likes</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">Live Data</span>
                  <small className="text-muted">from API</small>
                </p> */}
              </div>
            </div>
          </div>

          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info">
                      <i className="ri-user-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {questions.filter((q) => q.IsAnonymous).length}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Anonymous Questions</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">Live Data</span>
                  <small className="text-muted">from API</small>
                </p> */}
              </div>
            </div>
          </div>

          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger">
                      <i className="ri-admin-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {
                      questions.filter((q) => q.CreatedByExpert === "Expert")
                        .length
                    }
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Admin Questions</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">Live Data</span>
                  <small className="text-muted">from API</small>
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* Add Question Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Community Questions</h4>
          <div className="d-flex gap-2">
            {/* <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addQuestionModal"
            >
              <i className="ri-add-line me-1"></i>Add Regular Question
            </button> */}
            <button
              className="btn btn-primary"
              onClick={() => {
                const modal = new bootstrap.Modal(
                  document.getElementById("adminQuestionModal")
                );
                modal.show();
              }}
            >
              <i className="ri-admin-line me-1"></i>Post Admin Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                  <h5 className="mb-0">All Questions ({questions.length})</h5>
                  <div className="btn-group" role="group">
                    <button
                      className={`btn btn-outline-secondary ${
                        sortOption === "new" ? "active" : ""
                      }`}
                      onClick={() => setSortOption("new")}
                    >
                      <i className="ri-sort-desc me-1"></i>Newest
                    </button>
                    <button
                      className={`btn btn-outline-secondary ${
                        sortOption === "old" ? "active" : ""
                      }`}
                      onClick={() => setSortOption("old")}
                    >
                      <i className="ri-sort-asc me-1"></i>Oldest
                    </button>
                  </div>
                </div>
                <div className="btn-group mt-2" role="group">
                  <button
                    className={`btn btn-outline-primary ${
                      filterType === "all" ? "active" : ""
                    }`}
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn btn-outline-success ${
                      filterType === "public" ? "active" : ""
                    }`}
                    onClick={() => setFilterType("public")}
                  >
                    Public
                  </button>
                  <button
                    className={`btn btn-outline-warning ${
                      filterType === "private" ? "active" : ""
                    }`}
                    onClick={() => setFilterType("private")}
                  >
                    Private
                  </button>
                  <button
                    className={`btn btn-outline-danger ${
                      filterType === "unanswered" ? "active" : ""
                    }`}
                    onClick={() => setFilterType("unanswered")}
                  >
                    Unanswered
                  </button>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  {sortedQuestions.map((question) => (
                    <div key={question.Id} className="col-md-6 mb-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{question.Content}</h6>
                          <div className="d-flex align-items-center mb-2">
                            <img
                              src={
                                question.ProfilePictureUrl ||
                                getDefaultAvatar(question.UserName || "User")
                              }
                              alt={question.UserName || "User"}
                              className="rounded-circle me-2"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover"
                              }}
                              onError={(e) => {
                                e.target.src = getDefaultAvatar(
                                  question.UserName || "User"
                                );
                              }}
                            />
                            <div>
                              <small className="d-block fw-medium">
                                {question.UserName || "User"}
                              </small>
                              <small className="text-muted">
                                {formatDate(question.CreatedOn)}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">
                              Likes:{" "}
                              {question.LikeCount}
                            </small>
                            <small className="text-muted">
                              {getTimeAgo(question.CreatedOn)}
                            </small>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`badge ${
                                question.Visibility === "Public"
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {question.Visibility}
                            </span>
                            {/* <span
                              className={`badge ms-2 ${
                                question.IsActive ? "bg-success" : "bg-danger"
                              }`}
                            >
                              {question.IsActive ? "Active" : "Inactive"}
                            </span> */}
                            {question.AnswerByExpert && (
                              <span className="badge bg-info ms-2">
                                <i className="ri-check-line me-1"></i>Answered
                              </span>
                            )}
                          </div>
                          {question.AnswerByExpert && (
                            <div className="mt-2 p-2  rounded">
                              <small className="text-muted">Answer:</small>
                              <p className="mb-0">{question.AnswerByExpert}</p>
                              <small className="text-muted">
                                Answered on: {formatDate(question.AnsweredAt)}
                              </small>
                            </div>
                          )}
                          <div className="mt-3">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleViewQuestion(question.Id)}
                              disabled={viewLoading}
                            >
                              <i className="ri-edit-line me-1"></i>Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success me-2"
                              onClick={() => handleAnswerQuestion(question.Id)}
                            >
                              <i className="ri-message-line me-1"></i>Answer
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteQuestion(question.Id)}
                            >
                              <i className="ri-delete-bin-line me-1"></i>Delete
                            </button>
                          </div>
                          {openAnswerId === question.Id && (
                            <div className="mt-3">
                              <div className="mb-2">
                                <label className="form-label">
                                  Your Answer
                                </label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={answerText}
                                  onChange={(e) =>
                                    setAnswerText(e.target.value)
                                  }
                                  placeholder="Enter your answer here..."
                                />
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    handleSubmitAnswer(question.Id)
                                  }
                                  disabled={answerLoading || !answerText.trim()}
                                >
                                  {answerLoading ? (
                                    <>
                                      <span
                                        className="spinner-border spinner-border-sm me-1"
                                        role="status"
                                      ></span>
                                      Saving...
                                    </>
                                  ) : (
                                    "Go"
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setOpenAnswerId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      <div
        className="modal fade"
        id="addQuestionModal"
        tabIndex="-1"
        aria-labelledby="addQuestionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addQuestionModalLabel">
                Add New Question
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddQuestion}>
                <div className="mb-3">
                  <label className="form-label">Question Content</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newQuestion.Content}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        Content: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={newQuestion.IsAnonymous}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          IsAnonymous: e.target.checked,
                        })
                      }
                    />
                    <label className="form-check-label">Post Anonymously</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Visibility</label>
                  <select
                    className="form-select"
                    value={newQuestion.Visibility}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        Visibility: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={0}>Public</option>
                    <option value={1}>Private</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newQuestion.UserId}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, UserId: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    Submit Question
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* View/Edit Question Modal */}
      <div
        className="modal fade"
        id="viewQuestionModal"
        tabIndex="-1"
        aria-labelledby="viewQuestionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewQuestionModalLabel">
                Edit Question
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {viewLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                selectedQuestion && (
                  <form onSubmit={handleEditQuestion}>
                    <div className="mb-3">
                      <label className="form-label">Question Content</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editQuestion.Content}
                        onChange={(e) =>
                          setEditQuestion({
                            ...editQuestion,
                            Content: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={editQuestion.IsAnonymous}
                          onChange={(e) =>
                            setEditQuestion({
                              ...editQuestion,
                              IsAnonymous: e.target.checked,
                            })
                          }
                        />
                        <label className="form-check-label">
                          Post Anonymously
                        </label>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Visibility</label>
                      <select
                        className="form-select"
                        value={editQuestion.Visibility}
                        onChange={(e) =>
                          setEditQuestion({
                            ...editQuestion,
                            Visibility: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={1}>Public</option>
                        <option value={0}>Private</option>
                      </select>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                            ></span>
                            Updating...
                          </>
                        ) : (
                          "Update Question"
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <AdminQuestionModal onQuestionCreated={loadQuestions} />

      {/* Footer */}
      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl">
          <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
            <div className="text-body mb-2 mb-md-0">
              © {new Date().getFullYear()}, made with{" "}
              <span className="text-danger">
                <i className="tf-icons ri-heart-fill"></i>
              </span>{" "}
              by
              <a
                href="https://www.coinagesoft.com/"
                target="_blank"
                className="footer-link"
              >
                Coinage.in
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
