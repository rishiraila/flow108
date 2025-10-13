"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchForumPosts, fetchForumComments, fetchAllUsers } from "../utils/api";
import AddPostModal from "./AddPostModal";
import Masonry from 'react-masonry-css';

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
  const [showCommentsMap, setShowCommentsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

  const loadPosts = async () => {
    try {
      // Fetch posts, comments, and users concurrently
      const [postsResponse, commentsResponse, usersResponse] = await Promise.all([
        fetchForumPosts(),
        fetchForumComments(),
        fetchAllUsers()
      ]);

      console.log("API response from fetchForumPosts:", postsResponse);
      console.log("API response from fetchForumComments:", commentsResponse);
      console.log("API response from fetchAllUsers:", usersResponse);

      if (Array.isArray(postsResponse)) {
        // Group comments by PostId
        const commentsByPostId = {};
        if (Array.isArray(commentsResponse)) {
          commentsResponse.forEach(comment => {
            if (!commentsByPostId[comment.PostId]) {
              commentsByPostId[comment.PostId] = [];
            }
            const user = usersResponse[comment.UserId];
            commentsByPostId[comment.PostId].push({
              ...comment,
              UserName: comment.IsAnonymous ? `${user?.name || "User"} (Anonymous)` : (user?.name || "Unknown User"),
              UserAvatar: comment.IsAnonymous ? getDefaultAvatar("Anonymous") : (user?.avatar || getDefaultAvatar(user?.name || "User"))
            });
          });
        }

        // Associate comments with posts
        const postsWithComments = postsResponse.map(post => ({
          ...post,
          Comments: commentsByPostId[post.Id] || []
        }));

        // Sort posts by date (most recent first)
        const sortedPosts = postsWithComments.sort((a, b) =>
          new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );

        setPosts(sortedPosts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts, comments, or users:", err);
      setError("Something went wrong while fetching posts, comments, or users");
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
      // Get UserId dynamically, e.g. from localStorage or user context
      const userId = localStorage.getItem("userId") || "3fa85f64-5717-4562-b3fc-2c963f66afa6";

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
            UserId: userId,
            PostId: postId,
          }),
        }
      );

      const result = await res.json();

      if (res.ok && result.status) {
        alert("✅ " + result.message);

        setCommentInputs({ ...commentInputs, [postId]: "" }); // clear input
        loadPosts(); // refresh comments with real data
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
    
    // Check for postId in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('postId');
    
    if (postId) {
      // Store the postId to show comments for this specific post after loading
      setTimeout(() => {
        setShowCommentsMap((prev) => ({
          ...prev,
          [postId]: true,
        }));
        
        // Scroll to the post after a short delay to ensure it's rendered
        setTimeout(() => {
          const postElement = document.querySelector(`[data-post-id="${postId}"]`);
          if (postElement) {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            postElement.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.5)';
            postElement.style.transition = 'box-shadow 0.3s ease';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
              postElement.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
            }, 2000);
          }
        }, 500);
      }, 1000);
    }
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

  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const downloadMedia = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'media';
    link.click();
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post =>
      (post.Title && post.Title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.Description && post.Description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.UserName && post.UserName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    switch (sortOption) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
        break;
      case 'likes_desc':
        filtered.sort((a, b) => (b.LikeCount || 0) - (a.LikeCount || 0));
        break;
      case 'likes_asc':
        filtered.sort((a, b) => (a.LikeCount || 0) - (b.LikeCount || 0));
        break;
      case 'comments_desc':
        filtered.sort((a, b) => (b.Comments?.length || 0) - (a.Comments?.length || 0));
        break;
      case 'comments_asc':
        filtered.sort((a, b) => (a.Comments?.length || 0) - (b.Comments?.length || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [posts, searchQuery, sortOption]);

  const breakpointCols = { default: 3, 1100: 2, 700: 1 };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Stats Cards - Responsive layout */}
        <div className="row mb-5">
          <div className="col-12 col-sm-6 col-lg-3 mb-2">
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

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning">
                      <i className="ri-heart-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {posts.reduce((sum, post) => sum + (post.LikeCount || 0), 0)}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Likes</h6>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info">
                      <i className="ri-user-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{posts.filter((post) => post.IsAnonymous).length}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Anonymous Posts</h6>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 mb-2">
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger">
                      <i className="ri-message-2-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">
                    {posts.reduce((sum, post) => sum + (post.Comments?.length || 0), 0)}
                  </h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Comments</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Add Post Button - Responsive */}
        <div className="d-flex justify-content-between mb-4">
          <div className="d-flex justify-content-between align-items-center w-100" >
            <h4 className="mb-0">Community Forum</h4>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addPostModal"
            >
              <i className="ri-add-line me-1"></i>Add New Post
            </button>
          </div>
        </div>

        {/* Search and Sort */}
      {/* Search and Sort */}
{/* Search and Sort - Modern design */}
<div className="d-flex justify-content-center mb-4">
  <div
    className="p-3 shadow-sm"
    style={{
      maxWidth: "700px",
      width: "100%",
      backgroundColor: "white",
      borderRadius: "14px",
      border: "1px solid #e9ecef",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
    }}
  >
    {/* Search Bar */}
    <div
      className="d-flex align-items-center px-2 py-1"
      style={{
        flex: "1 1 300px",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        transition: "all 0.2s ease",
      }}
    >
      <i className="ri-search-line text-muted" style={{ marginRight: "8px", fontSize: "18px" }}></i>
      <input
        type="text"
        placeholder="Search by title, description, or username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "15px",
          color: "#495057",
        }}
        onFocus={(e) => (e.target.parentElement.style.borderColor = "#007bff")}
        onBlur={(e) => (e.target.parentElement.style.borderColor = "#dee2e6")}
      />
    </div>

    {/* Sort Dropdown */}
    <div
      className="d-flex align-items-center justify-content-end"
      style={{ flex: "0 0 180px" }}
    >
      <label className="fw-semibold me-2 text-dark" style={{ fontSize: "14px" }}>
        Sort by:
      </label>
      <select
        className="form-select"
        style={{
          fontSize: "14px",
          borderRadius: "8px",
          padding: "6px 10px",
          border: "1px solid #dee2e6",
          backgroundColor: "#f8f9fa",
          color: "#495057",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        onFocus={(e) => (e.target.style.borderColor = "#007bff")}
        onBlur={(e) => (e.target.style.borderColor = "#dee2e6")}
      >
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="likes_desc">Most Likes</option>
        <option value="likes_asc">Least Likes</option>
        <option value="comments_desc">Most Comments</option>
        <option value="comments_asc">Least Comments</option>
      </select>
    </div>
  </div>
</div>


        <Masonry
          breakpointCols={breakpointCols}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
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
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-5">
              <p>No posts match your search.</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const showComments = showCommentsMap[post.Id] || false;
              return (
                <div
                  key={post.Id}
                  data-post-id={post.Id}
                  className="border"
                  style={{
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
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
                        e.target.src = getDefaultAvatar(post.UserName || "User");
                      }}
                    />
                    <div>
                      <h6 style={{ margin: 0, fontSize: "16px" }}>
                        {post.UserName} {post.IsAnonymous ? "(Anonymous)" : ""}
                      </h6>
                      <small>{formatDate(post.CreatedAt)}</small>
                    </div>
                  </div>

                  {/* Post content */}
                  <div style={{ marginBottom: "10px" }}>
                    <h6
                      style={{
                        margin: "0 0 6px",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {post.Title}
                    </h6>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {post.Description}
                    </p>
                    {post.Media && post.Media.Url && (
                      <div style={{ position: "relative" }}>
                        {isVideo(post.Media.Url) ? (
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
                        )}
                        <button
                          onClick={() => downloadMedia(post.Media.Url)}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            cursor: "pointer",
                          }}
                          title="Download Media"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post stats */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      padding: "6px 0",
                      borderTop: "1px solid #eee",
                      borderBottom: "1px solid #eee",
                      fontSize: "14px",
                      color: "#6c757d",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px" }}>
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
                      {/* <button
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
                      </button> */}

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deletePost(post.Id)} // delete function
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Comment toggle button */}
                  <div style={{ marginBottom: "10px" }}>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        setShowCommentsMap((prev) => ({
                          ...prev,
                          [post.Id]: !prev[post.Id],
                        }))
                      }
                    >
                      {showComments ? "Hide Comments" : "Show Comments"}
                    </button>
                  </div>

                  {/* Comments section */}
                  {showComments && post.Comments && post.Comments.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        maxHeight: "200px",
                        overflowY: "auto",
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
                            <img
                              src={comment.UserAvatar || getDefaultAvatar(comment.UserName || "User")}
                              alt={comment.UserName || "User"}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.src = getDefaultAvatar(comment.UserName || "User");
                              }}
                            />
                            <small style={{ color: "#6c757d", fontWeight: "bold" }}>
                              {comment.UserName || ""}
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
              );
            })
          )}
        </Masonry>
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
                      setEditForm({
                        ...editForm,
                        IsAnonymous: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label">Post Anonymously</label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" data-bs-dismiss="modal">
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
