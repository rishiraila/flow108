"use client";
import React, { useState, useEffect } from "react";
import { fetchForumPosts, fetchUserCount } from "../utils/api";
import { userApi } from "../utils/apiClient";
import Link from "next/link";
import authenticatedFetch from "../utils/authenticatedFetch";


// API function to answer a question
const answerQuestion = async (questionId, answerText) => {
  return authenticatedFetch(
    `https://api.flow108.in/api/admin/community/questions/${questionId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answerText),
    }
  );
};

const fetchQuestions = async () => {
  const data = await authenticatedFetch(
    "https://api.flow108.in/api/admin/community/questions",
    { method: "GET" }
  );
  return data.data || [];
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
    pendingApprovals: 0,
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
        const baseUrl = "https://api.flow108.in";
        const normalizedPosts = allPosts.map(post => ({
          ...post,
          Media: post.Media?.Url
            ? { ...post.Media, Url: baseUrl + post.Media.Url }
            : null,
        }));
        const latestPosts = normalizedPosts
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
        const sortedQuestions = allQuestions.sort((a, b) => new Date(b.CreatedOn) - new Date(a.CreatedOn));
        setQuestions(sortedQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setErrorQuestions("Failed to load questions");
      } finally {
        setLoadingQuestions(false);
      }
    };

    const loadStats = async () => {
      try {
        // Fetch all users from API using apiClient (includes JWT token)
        const usersArray = await userApi.getAll();
        const totalUsers = usersArray.length;
        const pendingApprovals = usersArray.filter(user => !user.IsApproved).length;

        // Get total questions and posts for the other stats
        const allQuestions = await fetchQuestions();
        const allPosts = await fetchForumPosts();

        // Set stats with all four values
        setStats({
          totalUsers,
          pendingApprovals,
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

  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
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
                      <i className="ri-time-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.pendingApprovals}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Pending Approvals</h6>
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
                      <i className="ri-question-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.totalQuestions}</h4>
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
            <div className="card card-border-shadow-success h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-success">
                      <i className="ri-chat-1-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{stats.totalPosts}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Posts</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">Live Data</span>
                  <small className="text-muted">from API</small>
                </p> */}
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
                              post.ProfilePictureUrl ||
                              getDefaultAvatar(post.UserName || "User")
                            }
                            alt={post.UserName || "User"}
                            style={{
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = getDefaultAvatar(
                                post.UserName || "User"
                              );
                            }}
                          />
                          <div>
                            <h6 className="mb-0" style={{ fontSize: "14px" }}>
                              {post.UserName} {post.IsAnonymous ? "(Anonymous)" : ""}
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
                            isVideo(post.Media.Url) ? (
                              <video
                                src={post.Media.Url}
                                controls
                                style={{
                                  width: "100%",
                                  borderRadius: "8px",
                                  objectFit: "contain",
                                  maxHeight: "fit-content",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <img
                                src={post.Media.Url}
                                alt="Post Media"
                                style={{
                                  width: "100%",
                                  borderRadius: "8px",
                                  objectFit: "contain",
                                  maxHeight: "fit-content",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )
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
            <div className="col-12 col-xxl-8" style={{ height: "485px", overflowY: "scroll" }}>
              <div className="card">
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
                                      question.ProfilePictureUrl ||
                                      getDefaultAvatar(question.UserName || "User")
                                    }
                                    alt={question.UserName || "User"}
                                    style={{
                                      borderRadius: "50%",
                                      width: "32px",
                                      height: "32px",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.src = getDefaultAvatar(
                                        question.UserName || "User"
                                      );
                                    }}
                                  />
                                  <div className="d-flex flex-column">
                                    <strong style={{ fontSize: "14px" }}>
                                      {question.UserName || "User"}
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
                              {question.Media && question.Media.Url && (
                                isVideo(question.Media.Url) ? (
                                  <video
                                    src={question.Media.Url}
                                    controls
                                    style={{
                                      width: "100%",
                                      borderRadius: "8px",
                                      objectFit: "contain",
                                      maxHeight: "fit-content",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={question.Media.Url}
                                    alt="Question Media"
                                    style={{
                                      width: "100%",
                                      borderRadius: "8px",
                                      objectFit: "contain",
                                      maxHeight: "fit-content",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )
                              )}

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
  );
}
