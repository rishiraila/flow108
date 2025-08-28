"use client";
import { useState, useEffect } from "react";
import { fetchForumPosts } from "../utils/api";
import AddPostModal from "./AddPostModal";

export default function Page() {
  const [showDropdown, setShowDropdown] = useState(null); // track dropdown for each post
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingPost, setEditingPost] = useState(null); // store the post being edited
  const [editForm, setEditForm] = useState({
    Title: "",
    Description: "",
    IsAnonymous: false,
    Media: [],
  });

  const loadPosts = async () => {
    try {
      const response = await fetchForumPosts();
      console.log("API response from fetchForumPosts:", response);

      if (Array.isArray(response)) {
        setPosts(response);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Something went wrong while fetching posts");
    } finally {
      setLoading(false);
    }
  };
  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `https://flow108.coinagesoft.com/api/admin/community/forum/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // remove deleted comment from state without refetch
        setPosts((prev) =>
          prev.map((p) => ({
            ...p,
            Comments: p.Comments.filter((c) => c.Id !== commentId),
          }))
        );
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
const updatePost = async () => {
  if (!editingPost) return;

  try {
    const formData = new FormData();
    formData.append("Title", editForm.Title);
    formData.append("Description", editForm.Description);
    formData.append("IsAnonymous", editForm.IsAnonymous);

    // If you want to handle media uploads, append them here:
    // editForm.Media.forEach((m, i) => {
    //   formData.append(`Media[${i}].Url`, m.Url);
    //   formData.append(`Media[${i}].Type`, m.Type);
    // });

    const res = await fetch(
      `https://flow108.coinagesoft.com/api/admin/community/forum/posts/${editingPost.Id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "*/*",
        },
        body: formData,
      }
    );

    if (res.ok) {
      alert("✅ Post updated successfully!");
      loadPosts();
      setEditingPost(null);
      bootstrap.Modal.getInstance(
        document.getElementById("editPostModal")
      ).hide();
    } else {
      alert("❌ Failed to update post");
    }
  } catch (err) {
    console.error("Error updating post:", err);
    alert("Something went wrong while updating");
  }
};

  const deletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/admin/community/forum/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        }
      );

      const result = await res.json();

      if (res.ok && result.status) {
        alert("✅ " + result.message);
        loadPosts(); // reload posts
      } else {
        alert("❌ " + (result.message || "Failed to delete post"));
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Something went wrong while deleting");
    }
  };
  const postComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content || content.trim() === "")
      return alert("Please enter a comment");

    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/admin/community/forum/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            Content: content,
            UserId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            PostId: postId,
          }),
        }
      );

      const result = await res.json();

      if (res.ok && result.status) {
        alert("✅ " + result.message);
        setCommentInputs({ ...commentInputs, [postId]: "" }); // clear input
        loadPosts(); // refresh comments
      } else {
        alert("❌ " + (result.message || "Failed to post comment"));
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Something went wrong while posting comment");
    }
  };
  useEffect(() => {
    loadPosts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const toggleDropdown = (postId) => {
    setShowDropdown(showDropdown === postId ? null : postId);
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=random&size=50`;
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats Cards - Similar to Questions page */}
        <div className="row mb-5">
          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary">
                      <i className="tf-icons ri-chat-3-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{posts.length}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Posts</h6>
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
                    {posts.reduce(
                      (sum, post) => sum + (post.LikeCount || 0),
                      0
                    )}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Likes</h6>
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
                    {posts.filter((post) => post.IsAnonymous).length}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Anonymous Posts</h6>
              </div>
            </div>
          </div>

          <div className="col-6 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger">
                      <i className="ri-message-2-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {posts.reduce(
                      (sum, post) => sum + (post.Comments?.length || 0),
                      0
                    )}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Comments</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Add Post Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Community Forum</h4>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#addPostModal"
          >
            <i className="ri-add-line me-1"></i>Add New Post
          </button>
        </div>

        <div className="row g-6">
          <div className="col-md-8 col-xxl-8">
            <div className="card h-100">
              <div className="card-body pt-4">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading posts...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    Error loading posts: {error}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-5">
                    <p>No posts found</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.Id}
                      className="border"
                      style={{
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "24px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
                              : post.User?.ProfilePictureUrl ||
                                getDefaultAvatar(post.User?.Name || "User")
                          }
                          alt={
                            post.IsAnonymous
                              ? "Anonymous"
                              : post.User?.Name || "User"
                          }
                          style={{
                            borderRadius: "50%",
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = getDefaultAvatar(
                              post.IsAnonymous
                                ? "Anonymous"
                                : post.User?.Name || "User"
                            );
                          }}
                        />
                        <div>
                          <h6 style={{ margin: "0", fontSize: "16px" }}>
                            {post.IsAnonymous
                              ? "Anonymous User"
                              : post.User?.Name || "Unknown User"}
                          </h6>
                          <small style={{ color: "#6c757d" }}>
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
                          }}
                        >
                          {post.Description}
                        </p>

                        {/* Media gallery */}
                        {post.Media && post.Media.length > 0 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                post.Media.length > 1
                                  ? "repeat(2, 1fr)"
                                  : "1fr",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            {post.Media.map(
                              (media, index) =>
                                media.Url && (
                                  <div
                                    key={index}
                                    style={{ position: "relative" }}
                                  >
                                    {media.Type === 0 ? ( // Image
                                      <img
                                        src={media.Url}
                                        alt={`Post media ${index + 1}`}
                                        style={{
                                          width: "100%",
                                          borderRadius: "8px",
                                          objectFit: "cover",
                                          maxHeight: "300px",
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                        }}
                                      />
                                    ) : media.Type === 1 ? ( // Video
                                      <video
                                        controls
                                        style={{
                                          width: "100%",
                                          borderRadius: "8px",
                                          maxHeight: "300px",
                                        }}
                                      >
                                        <source
                                          src={media.Url}
                                          type="video/mp4"
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    ) : (
                                      // Document or other
                                      <div
                                        style={{
                                          padding: "16px",
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "8px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <i className="ri-file-text-line ri-2x text-muted"></i>
                                        <p
                                          style={{
                                            margin: "8px 0 0",
                                            fontSize: "12px",
                                          }}
                                        >
                                          <a
                                            href={media.Url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            View Document
                                          </a>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Post stats */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                          padding: "8px 0",
                          borderTop: "1px solid #eee",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            fontSize: "14px",
                            color: "#6c757d",
                          }}
                        >
                          <span>
                            <i className="bi bi-heart-fill text-danger"></i>{" "}
                            {post.LikeCount || 0} Likes
                          </span>
                          <span>
                            <i className="bi bi-chat-left-dots-fill text-primary"></i>{" "}
                            {post.Comments?.length || 0} Comments
                          </span>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setEditingPost(post);
                              setEditForm({
                                Title: post.Title,
                                Description: post.Description,
                                IsAnonymous: post.IsAnonymous,
                                Media: post.Media || [],
                              });
                              new bootstrap.Modal(
                                document.getElementById("editPostModal")
                              ).show();
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deletePost(post.Id)} // delete function
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Comments section */}
                      {post.Comments && post.Comments.length > 0 && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "8px",
                          }}
                        >
                          <h6
                            style={{
                              margin: "0 0 8px",
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#333",
                            }}
                          >
                            Comments ({post.Comments.length})
                          </h6>
                          {post.Comments.map((comment) => (
                            <div
                              key={comment.Id}
                              style={{
                                padding: "8px",
                                marginBottom: "8px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                border: "1px solid #e9ecef",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginBottom: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    backgroundColor: "#dee2e6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "#6c757d",
                                  }}
                                >
                                  {comment.UserId
                                    ? comment.UserId.substring(
                                        0,
                                        2
                                      ).toUpperCase()
                                    : "U"}
                                </div>
                                <small style={{ color: "#6c757d" }}>
                                  {comment.UserId
                                    ? `User ${comment.UserId.substring(0, 8)}`
                                    : "Unknown User"}
                                </small>
                                <small style={{ color: "#adb5bd" }}>
                                  {formatDate(comment.CreatedAt)}
                                </small>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginTop: "4px",
                                }}
                              >
                                <p
                                  style={{
                                    margin: "0",
                                    fontSize: "14px",
                                    color: "#333",
                                    lineHeight: "1.4",
                                    flex: 1,
                                  }}
                                >
                                  {comment.Content}
                                </p>

                                <button
                                  className="btn btn-outline-danger btn-sm ms-2"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "⚠️ Are you sure you want to delete this comment?"
                                      )
                                    ) {
                                      deleteComment(comment.Id);
                                      alert("🗑️ Comment deleted successfully!");
                                    }
                                  }}
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment input */}
                      {/* Comment input */}
                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="text"
                          value={commentInputs[post.Id] || ""} // track input for each post
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post.Id]: e.target.value,
                            })
                          }
                          placeholder="Add a comment..."
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            fontSize: "14px",
                          }}
                        />
                        <button
                          onClick={() => postComment(post.Id)} // call API
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div
  className="modal fade"
  id="editPostModal"
  tabIndex="-1"
  aria-hidden="true"
>
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Edit Post</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
        ></button>
      </div>

      <div className="modal-body">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={editForm.Title}
            onChange={(e) =>
              setEditForm({ ...editForm, Title: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={editForm.Description}
            onChange={(e) =>
              setEditForm({ ...editForm, Description: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={editForm.IsAnonymous}
            onChange={(e) =>
              setEditForm({ ...editForm, IsAnonymous: e.target.checked })
            }
          />
          <label className="form-check-label">Post Anonymously</label>
        </div>
      </div>

      <div className="modal-footer">
        <button
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Cancel
        </button>
        <button className="btn btn-primary" onClick={updatePost}>
          Save Changes
        </button>
      </div>
    </div>
  </div>
</div>

        <AddPostModal onPostCreated={loadPosts} />
      </div>
    </div>
  );
}
