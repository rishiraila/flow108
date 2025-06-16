"use client";
// import usesta from "react";
import { useState } from "react";
export default function Page() {
  const [showDropdown, setShowDropdown] = useState(false);

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
                    <h4 className="mb-0">42</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">User Registered</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">+18.2%</span>
                    <small className="text-muted">than last week</small>
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
                    <h4 className="mb-0">8</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Paid Members</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">-8.7%</span>
                    <small className="text-muted">than last week</small>
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
                    <h4 className="mb-0">27</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Questions</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">+4.3%</span>
                    <small className="text-muted">than last week</small>
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
                    <h4 className="mb-0">13</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Posts</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">-2.5%</span>
                    <small className="text-muted">than last week</small>
                  </p>
                </div>
              </div>
            </div>
            {/* <!--/ Card Border Shadow --> */}

            {/* <!-- Popular Instructors --> */}
            <div className="col-md-8 col-xxl-8">
              <div className="card h-100">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <div className="card-title mb-0">
                    <h5 className="m-0 me-2">Users</h5>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="input-group w-auto">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search users..."
                        id="userSearchInput"
                      />
                      <span className="input-text  ">
                        {/* <!-- <i className="ri-search-line"></i> --> */}
                      </span>
                      <button
                        className="btn btn-primary d-flex align-items-center"
                        data-bs-toggle="modal"
                        data-bs-target="#addPostModal"
                      >
                        <i className="ri-plus-line ri-16px lh-1 scaleX-n1-rtl"></i>
                        Add Post
                      </button>
                    </div>
                  </div>
                </div>

                {/* <!-- Column Headers (Desktop only) --> */}
                <div
                  className="px-4 py-3 border border-start-0 border-end-0 d-none d-md-block"
                  style={{ fontSize: "12px" }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap text-uppercase fw-normal">
                    <div style={{ width: "25%" }}>Users</div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      Posts
                    </div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      Likes
                    </div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      Comments
                    </div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      Action
                    </div>
                  </div>
                </div>

                <div className="card-body pt-4">
                  {/* <!-- Repeatable User Row --> */}
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
                  >
                    {/* <!-- Desktop layout --> */}
                    <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap">
                      <div
                        className="d-flex align-items-center gap-3"
                        style={{ width: "25%" }}
                      >
                        <img
                          src="/assets/img/avatars/1.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate">Sandeep Reddy</h6>
                          <small className="text-truncate">
                            Clinical Dietitian{" "}
                          </small>
                        </div>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">33</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">120</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">18</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#forumPostsModal"
                        >
                          See
                        </button>
                      </div>
                    </div>

                    {/* <!-- Mobile layout --> */}
                    <div className="d-block d-md-none">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <img
                          src="/assets/img/avatars/1.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0">Maven Analytics</h6>
                          <small>Business Intelligence</small>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        <div>
                          <strong>Posts:</strong> 33
                        </div>
                        <div>
                          <strong>Likes:</strong> 120
                        </div>
                        <div>
                          <strong>Comments:</strong> 18
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#forumPostsModal"
                          >
                            See
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <!-- Duplicate for another user --> */}
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
                  >
                    {/* <!-- Desktop --> */}
                    <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap">
                      <div
                        className="d-flex align-items-center gap-3"
                        style={{ width: "25%" }}
                      >
                        <img
                          src="/assets/img/avatars/2.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate">Neha Sharma</h6>
                          <small className="text-truncate">
                            Personal Trainer
                          </small>
                        </div>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">52</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">95</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">24</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#forumPostsModal"
                        >
                          See
                        </button>
                      </div>
                    </div>

                    {/* <!-- Mobile --> */}
                    <div className="d-block d-md-none">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <img
                          src="/assets/img/avatars/2.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0">Bentlee Emblin</h6>
                          <small>Digital Marketing</small>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        <div>
                          <strong>Posts:</strong> 52
                        </div>
                        <div>
                          <strong>Likes:</strong> 95
                        </div>
                        <div>
                          <strong>Comments:</strong> 24
                        </div>
                        <div className="mt-2">
                          <button
                            className="btn btn-outline-info btn-sm see-posts-btn"
                            data-username="JohnDoe"
                          >
                            See
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
                  >
                    {/* <!-- Desktop --> */}
                    <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap">
                      <div
                        className="d-flex align-items-center gap-3"
                        style={{ width: "25%" }}
                      >
                        <img
                          src="/assets/img/avatars/3.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate">Manoj Kulkarni</h6>
                          <small className="text-truncate">
                            Panchakarma Specialist
                          </small>
                        </div>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">12</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">75</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">14</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#forumPostsModal"
                        >
                          See
                        </button>
                      </div>
                    </div>

                    {/* <!-- Mobile --> */}
                    <div className="d-block d-md-none">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <img
                          src="/assets/img/avatars/3.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0">John Deo</h6>
                          <small>Digital Marketing</small>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        <div>
                          <strong>Posts:</strong> 41
                        </div>
                        <div>
                          <strong>Likes:</strong> 60
                        </div>
                        <div>
                          <strong>Comments:</strong> 30
                        </div>
                        <div className="mt-2">
                          <button className="btn btn-sm btn-outline-primary">
                            See
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
                  >
                    {/* <!-- Desktop --> */}
                    <div className="d-none d-md-flex justify-content-between align-items-center flex-wrap">
                      <div
                        className="d-flex align-items-center gap-3"
                        style={{ width: "25%" }}
                      >
                        <img
                          src="/assets/img/avatars/4.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate">Pooja Nair</h6>
                          <small className="text-truncate">
                            CrossFit Level-1 Trainer
                          </small>
                        </div>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">17</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">15</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <h6 className="mb-0">24</h6>
                      </div>
                      <div className="text-center" style={{ width: "15%" }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          data-bs-toggle="modal"
                          data-bs-target="#forumPostsModal"
                        >
                          See
                        </button>
                      </div>
                    </div>

                    {/* <!-- Mobile --> */}
                    <div className="d-block d-md-none">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <img
                          src="/assets/img/avatars/3.png"
                          alt="Avatar"
                          style={{ width: "40px", height: "40px" }}
                          className="rounded-circle"
                        />
                        <div>
                          <h6 className="mb-0">Norbit Smith</h6>
                          <small>Digital Marketing</small>
                        </div>
                      </div>
                      <div style={{ fontSize: "14px" }}>
                        <div>
                          <strong>Posts:</strong> 41
                        </div>
                        <div>
                          <strong>Likes:</strong> 60
                        </div>
                        <div>
                          <strong>Comments:</strong> 30
                        </div>
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#forumPostsModal"
                          >
                            See
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <!-- More rows can be added following the same pattern --> */}
                </div>
              </div>
            </div>
            {/* <!--/ Popular Instructors --> */}

            <div className="col-md-4 col-xxl-4">
              <div className="row gy-4 mb-6">
                <div className="card h-100">
                  <div className="card-header d-flex align-items-center justify-content-between px-5 py-5 border border-start-0 border-end-0 border-top-0">
                    <div className="card-title mb-0">
                      <h5 className="m-0 me-2">Recent Posts</h5>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                        type="button"
                        id="popularInstructors"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="ri-more-2-line ri-20px"></i>
                      </button>
                      <div
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby="popularInstructors"
                      >
                        <a className="dropdown-item" href="javascript:void(0);">
                          Select All
                        </a>
                        <a className="dropdown-item" href="javascript:void(0);">
                          Refresh
                        </a>
                        <a className="dropdown-item" href="javascript:void(0);">
                          Share
                        </a>
                      </div>
                    </div>
                  </div>

                  <div
                    className="card-body pt-5"
                    style={{ overflowY: "scroll", height: "90vh" }}
                  >
                    {/* <!-- Post Card with Admin Dropdown --> */}
                    <div
                      className="border"
                      style={{
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "24px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <img
                          src="/assets/img/avatars/woman-4127336_1280.jpg"
                          alt="User"
                          style={{
                            borderRadius: "50%",
                            width: "50px",
                            height: "50px",
                          }}
                        />
                        <div>
                          <h6 style={{ margin: "0", fontSize: "16px" }}>
                            Rahul Verma
                          </h6>
                          <small>2 hours ago</small>
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <p style={{ margin: "0 0 12px", fontSize: "14px" }}>
                          Exploring the beauty of nature 🌿 — such a peaceful
                          moment!
                        </p>
                        <img
                          src="/assets/img/avatars/the-worthy-goods-Tuy2n9md0AI-unsplash.jpg"
                          alt="Post"
                          style={{ width: "100%", borderRadius: "8px" }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
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
                            <i className="bi bi-heart-fill"></i> 120 Likes
                          </span>
                          <span>
                            <i className="bi bi-chat-left-dots-fill"></i> 34
                            Comments
                          </span>
                        </div>
                        <div className="position-relative">
                          <button
                            onClick={() => toggleDropdown()}
                            className="btn btn-sm text-muted p-0 border-0 bg-transparent fs-3"
                          >
                            ⋯
                          </button>
                          <div
                            className="admin-dropdown dropdown-menu show"
                            style={{
                              display: "none",
                              position: "absolute",
                              top: "24px",
                              right: 0,
                            }}
                          >
                            <a
                              href="./updatePost.html"
                              className="dropdown-item"
                            >
                              Update Post
                            </a>
                            <a
                              href="javascript:void(0);"
                              onClick={() => alert("Delete clicked")}
                              className="dropdown-item text-danger"
                            >
                              Delete Post
                            </a>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{ paddingTop: "12px" }}
                        className="border border-bottom-0 border-start-0 border-end-0"
                      >
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="border bg-light"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "20px",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      className="border"
                      style={{
                        borderRadius: "12px",
                        padding: "16px",
                        marginBottom: "24px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <img
                          src="/assets//img/avatars/nikola-murniece-XpBI38qtskw-unsplash.jpg"
                          alt="User"
                          style={{
                            borderRadius: "50%",
                            width: "50px",
                            height: "50px",
                          }}
                        />
                        <div>
                          <h6 style={{ margin: "0", fontSize: "16px" }}>
                            Karan Arora
                          </h6>
                          <small>2 hours ago</small>
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: "14px",
                            color: "#333",
                          }}
                        >
                          Exploring the beauty of nature 🌿 — such a peaceful
                          moment!
                        </p>
                        <img
                          src="/assets/img/avatars/meagan-stone-r951FqxHTao-unsplash.jpg"
                          alt="Post"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            objectFit: "cover",
                            maxHeight: "300px",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
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
                            <i className="bi bi-heart-fill"></i> 120 Likes
                          </span>
                          <span>
                            <i className="bi bi-chat-left-dots-fill"></i> 34
                            Comments
                          </span>
                        </div>

                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => console.log("Toggle dropdown")}
                            className="btn btn-sm text-muted p-0 border-0 bg-transparent"
                            style={{ fontSize: "20px", cursor: "pointer" }}
                          >
                            ⋯
                          </button>

                          <div
                            className="admin-dropdown dropdown-menu"
                            style={{
                              display: "none", // toggle to 'block' dynamically
                              position: "absolute",
                              top: "24px",
                              right: "0",
                              backgroundColor: "#fff",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                              borderRadius: "6px",
                              zIndex: 10,
                            }}
                          >
                            <a
                              href="./updatePost.html"
                              className="dropdown-item"
                              style={{
                                padding: "8px 16px",
                                display: "block",
                                textDecoration: "none",
                                color: "#333",
                              }}
                            >
                              Update Post
                            </a>
                            <a
                              href="#"
                              onClick={() => alert("Delete clicked")}
                              className="dropdown-item"
                              style={{
                                padding: "8px 16px",
                                display: "block",
                                textDecoration: "none",
                                color: "red",
                              }}
                            >
                              Delete Post
                            </a>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{ paddingTop: "12px" }}
                        className="border border-bottom-0 border-start-0 border-end-0"
                      >
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="border bg-light"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: "20px",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- / Content --> */}
        <div
          className="modal fade"
          id="addPostModal"
          tabindex="-1"
          aria-labelledby="addPostModalLabel"
          aria-hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-3 shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="addPostModalLabel">
                  Add New Post
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form id="addPostForm">
                  <div className="mb-3">
                    <label for="postImage" className="form-label">
                      Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="postImage"
                      accept="image/*"
                    />
                  </div>
                  <div className="mb-3">
                    <label for="postName" className="form-label">
                      Post Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="postName"
                      placeholder="Enter post title"
                    />
                  </div>
                  <div className="mb-3">
                    <label for="postDescription" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="postDescription"
                      rows="3"
                      placeholder="Brief description of the post"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label for="postUrl" className="form-label">
                      URL
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="postUrl"
                      placeholder="Enter related URL (optional)"
                    />
                  </div>
                  <div className="mb-3">
                    <label for="postComment" className="form-label">
                      Comment
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="postComment"
                      placeholder="Add a comment (optional)"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Save Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

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
      <div
        className="modal fade"
        id="forumPostsModal"
        tabindex="-1"
        aria-labelledby="forumPostsModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal fade"
          id="forumPostsModal"
          tabIndex="-1"
          aria-labelledby="forumPostsModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Forum Posts</h5>
                <div className="d-flex align-items-center ms-auto gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="postSearch"
                    placeholder="Search..."
                    style={{ minWidth: "200px" }}
                  />
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              <div className="modal-body">
                <div className="row" id="postContainer">
                  {[1, 2, 3].map((_, index) => (
                    <div className="col-md-4 mb-4 post-card" key={index}>
                      <div className="card h-100">
                        <div className="card-body">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <img
                              src="/assets/img/avatars/woman-4127336_1280.jpg"
                              alt="User"
                              style={{
                                borderRadius: "50%",
                                width: "50px",
                                height: "50px",
                              }}
                            />
                            <div>
                              <h6 style={{ margin: 0, fontSize: "16px" }}>
                                Rahul Verma
                              </h6>
                              <small>2 hours ago</small>
                            </div>
                          </div>

                          <p style={{ fontSize: "14px" }}>
                            Exploring the beauty of nature 🌿 — such a peaceful
                            moment!
                          </p>

                          <img
                            src="/assets/img/avatars/the-worthy-goods-Tuy2n9md0AI-unsplash.jpg"
                            alt="Post"
                            style={{ width: "100%", borderRadius: "8px" }}
                          />

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "12px",
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
                                <i className="bi bi-heart-fill"></i> 120 Likes
                              </span>
                              <span>
                                <i className="bi bi-chat-left-dots-fill"></i> 34
                                Comments
                              </span>
                            </div>
                            <div className="position-relative">
                              <button
                                onClick={() => alert("Options toggled")}
                                className="btn btn-sm text-muted p-0 border-0 bg-transparent fs-3"
                              >
                                ⋯
                              </button>
                              <div
                                className="admin-dropdown dropdown-menu show"
                                style={{
                                  display: "none",
                                  position: "absolute",
                                  top: "24px",
                                  right: 0,
                                }}
                              >
                                <a
                                  href="./updatePost.html"
                                  className="dropdown-item"
                                >
                                  Update Post
                                </a>
                                <a
                                  href="#"
                                  onClick={() => alert("Delete clicked")}
                                  className="dropdown-item text-danger"
                                >
                                  Delete Post
                                </a>
                              </div>
                            </div>
                          </div>
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
    </div>
  );
}
