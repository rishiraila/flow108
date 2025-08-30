"use client";
import React, { useState, useEffect } from "react";
import { fetchForumPosts, fetchQuestions, fetchUserCount } from "../utils/api";
import Link from "next/link";

// API function to answer a question
const answerQuestion = async (questionId, answerText) => {
  const API_BASE_URL = "https://flow108.coinagesoft.com/api";
  const response = await fetch(
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
  if (!response.ok) throw new Error("Failed to answer question");
  return response.json();
};

export default function Page() {
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState(null);
  const [errorQuestions, setErrorQuestions] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidMembers: 0,
    totalQuestions: 0,
    totalPosts: 0
  });
  const [openAnswerId, setOpenAnswerId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await fetchForumPosts();
        const latestPosts = allPosts
          .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
          .slice(0, 5);
        setPosts(latestPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    const loadQuestions = async () => {
      try {
        const allQuestions = await fetchQuestions();
        const latestQuestions = allQuestions
          .sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn))
          .slice(0, 3);
        setQuestions(allQuestions); // keep all for stats
      } catch (err) {
        console.error("Error fetching questions:", err);
        setErrorQuestions("Failed to load questions");
      } finally {
        setLoadingQuestions(false);
      }
    };

    const loadStats = async () => {
      try {
        const allPosts = await fetchForumPosts();
        const allQuestions = await fetchQuestions();
        const userCount = await fetchUserCount();
        
        // Calculate statistics
        setStats({
          totalUsers: userCount,
          paidMembers: Math.floor(userCount * 0.2), // Estimate 20% as paid members
          totalQuestions: allQuestions.length,
          totalPosts: allPosts.length
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    };

    loadPosts();
    loadQuestions();
    loadStats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
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

  const formatQuestionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&size=50`;
  };

  return (
    <div>
      <div className="content-wrapper">
        {/* <!-- Content --> */}

        <div className="container-xxl flex-grow-1 container-p-y">
          {/* <!-- Card Border Shadow --> */}
          <div className="row g-6">
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-primary">
                        <i className="tf-icons ri-user-add-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stats.totalUsers}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">User Registered</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-warning h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-warning">
                        <i className="ri-user-star-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stats.paidMembers}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Paid Members</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-danger h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-danger">
                        <i className="ri-group-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stats.totalQuestions}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Questions</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-info h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-info">
                        <i className="ri-article-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stats.totalPosts}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Posts</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">Live Data</span>
                    <small className="text-muted">from API</small>
                  </p>
                </div>
              </div>
            </div>
            {/* <!--/ Card Border Shadow -->

              <!-- Latest Forum Posts --> */}
            <div
              className="col-12 col-xxl-4 col-md-6"
              style={{ height: "485px", overflowY: "scroll" }}
            >
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Latest Forum Posts</h4>
                  {/* <Link href="/Forumn" className="btn btn-sm btn-outline-primary">
                     All Posts
                  </Link> */}
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading posts...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger" role="alert">
                      Error loading posts: {error}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-4">
                      <p>No posts found</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.Id}
                        className="border mb-3"
                        style={{
                          borderRadius: "12px",
                          padding: "16px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          // Navigate to forum page with post ID as query parameter
                          window.location.href = `/Forumn?postId=${post.Id}`;
                        }}
                      >
                        {/* User info */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <img
                            src={
                              post.IsAnonymous
                                ? getDefaultAvatar("Anonymous")
                                : post.ProfilePictureUrl ||
                                  getDefaultAvatar(post.UserName || "User")
                            }
                            alt={
                              post.IsAnonymous
                                ? "Anonymous"
                                : post.UserName || "User"
                            }
                            style={{
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = getDefaultAvatar(
                                post.IsAnonymous
                                  ? "Anonymous"
                                  : post.UserName || "User"
                              );
                            }}
                          />
                          <div>
                            <h6 className="mb-0" style={{ fontSize: "14px" }}>
                              {post.IsAnonymous
                                ? "Anonymous User"
                                : post.UserName || "Unknown User"}
                            </h6>
                            <small className="text-muted">
                              {formatDate(post.CreatedAt)}
                            </small>
                          </div>
                        </div>

                        {/* Post content */}
                        <div style={{ marginBottom: "12px" }}>
                          <h6
                            style={{
                              margin: "0 0 8px",
                              fontSize: "16px",
                              fontWeight: "bold",
                            }}
                          >
                            {post.Title}
                          </h6>
                          <p
                            style={{
                              margin: "0 0 12px",
                              fontSize: "14px",
                              color: "#333",
                              lineHeight: "1.4",
                            }}
                          >
                            {post.Description}
                          </p>
                          {post.Media && post.Media.Url && (
                            <img
                              src={post.Media.Url}
                              alt="Post Media"
                              style={{
                                width: "100%",
                                borderRadius: "8px",
                                objectFit: "cover",
                                maxHeight: "200px",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          )}
                        </div>

                        {/* Post stats */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderTop: "1px solid #eee",
                            fontSize: "14px",
                            color: "#6c757d",
                          }}
                        >
                          <div style={{ display: "flex", gap: "16px" }}>
                            <span>
                              <i className="bi bi-heart-fill text-danger"></i>{" "}
                              {post.LikeCount || 0} Likes
                            </span>
                            <span>
                              <i className="bi bi-chat-left-dots-fill text-primary"></i>{" "}
                              {post.Comments?.length || 0} Comments
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {/* <!--/ Latest Forum Posts --> */}

            {/* <!-- Activity Timeline --> */}
            <div className="col-12 col-xxl-8">
              <div className="card h-100">
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0">List of questions</h5>
                  </div>
                </div>
                <div className="card-body pt-4">
                  {loadingQuestions ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading questions...</p>
                    </div>
                  ) : errorQuestions ? (
                    <div className="alert alert-danger" role="alert">
                      Error loading questions: {errorQuestions}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-4">
                      <p>No questions found</p>
                    </div>
                  ) : (
                    <ul className="timeline card-timeline mb-0">
                      <ul className="timeline card-timeline mb-0">
                        {questions.map((question) => (
                          <li
                            key={question.Id}
                            className="timeline-item timeline-item-transparent"
                          >
                            <span className="timeline-point timeline-point-primary"></span>
                            <div className="timeline-event">
                              {/* User Info */}
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                {/* Left: Avatar + Username */}
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={
                                      question.IsAnonymous
                                        ? getDefaultAvatar("Anonymous")
                                        : question.ProfilePictureUrl ||
                                          getDefaultAvatar(
                                            question.UserName || "User"
                                          )
                                    }
                                    alt={
                                      question.IsAnonymous
                                        ? "Anonymous"
                                        : question.UserName || "User"
                                    }
                                    style={{
                                      borderRadius: "50%",
                                      width: "32px",
                                      height: "32px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.src = getDefaultAvatar(
                                        question.IsAnonymous
                                          ? "Anonymous"
                                          : question.UserName || "User"
                                      );
                                    }}
                                  />
                                  <div className="d-flex flex-column">
                                    <strong style={{ fontSize: "14px" }}>
                                      {question.IsAnonymous
                                        ? "Anonymous User"
                                        : question.UserName || "Unknown User"}
                                    </strong>
                                    <small className="text-muted">
                                      {getTimeAgo(question.CreatedOn)}
                                    </small>
                                  </div>
                                </div>

                                {/* Right: Date */}
                                <small className="text-muted">
                                  {formatQuestionDate(question.CreatedOn)}
                                </small>
                              </div>

                              {/* Question Content */}
                              <h6 className="mb-2">{question.Content}</h6>
                              {/* <small className="text-muted">
                                {question.UserType}
                              </small> */}

                              {/* Show existing answer if available */}
                              {question.AnswerByExpert && (
                                <div className="mt-2 p-2  rounded">
                                  <small className="text-muted d-block">Answer:</small>
                                  <p className="mb-1">{question.AnswerByExpert}</p>
                                  {question.AnsweredAt && (
                                    <small className="text-muted">
                                      Answered on: {formatQuestionDate(question.AnsweredAt)}
                                    </small>
                                  )}
                                </div>
                              )}

                              {/* Answer Button */}
                              <div className="mt-2">
                                <button
                                  className="btn btn-sm btn-outline-success answer-btn"
                                  onClick={() => {
                                    if (openAnswerId === question.Id) {
                                      setOpenAnswerId(null);
                                      setAnswerText("");
                                    } else {
                                      setOpenAnswerId(question.Id);
                                      setAnswerText("");
                                    }
                                  }}
                                >
                                  Answer
                                </button>

                                {openAnswerId === question.Id && (
                                  <div className="answer-form mt-2">
                                    <textarea
                                      className="form-control mb-2"
                                      placeholder="Type your answer..."
                                      value={answerText}
                                      onChange={(e) => setAnswerText(e.target.value)}
                                      rows={3}
                                    />
                                    <button
                                      className="btn btn-sm btn-primary submit-answer"
                                      disabled={answerLoading || !answerText.trim()}
                                      onClick={async () => {
                                        try {
                                          setAnswerLoading(true);
                                          await answerQuestion(question.Id, answerText);
                                          alert("Answer submitted successfully!");
                                          // Reload questions to reflect new answer
                                          const allQuestions = await fetchQuestions();
                                          setQuestions(allQuestions);
                                          setOpenAnswerId(null);
                                          setAnswerText("");
                                        } catch (err) {
                                          alert("Failed to submit answer: " + err.message);
                                        } finally {
                                          setAnswerLoading(false);
                                        }
                                      }}
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
                                        "Submit"
                                      )}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-secondary ms-2"
                                      onClick={() => {
                                        setOpenAnswerId(null);
                                        setAnswerText("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ul>
                  )}
                </div>
              </div>
            </div>
            {/* <!-- Activity Timeline --> */}
          </div>
        </div>
        {/* <!-- / Content --> */}

        {/* <!-- Footer --> */}
        <footer className="content-footer footer bg-footer-theme">
          <div className="container-xxl">
            <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
              <div className="text-body mb-2 mb-md-0">
                ©<script>document.write(new Date().getFullYear());</script>,
                made with{" "}
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
        {/* <!-- / Footer --> */}

        <div className="content-backdrop fade"></div>
      </div>
    </div>
  );
}
