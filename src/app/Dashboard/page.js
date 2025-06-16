import React from "react";

export default function page() {
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
            {/* <!--/ Card Border Shadow -->

              <!-- Upcoming Webinar --> */}
            <div
              className="col-12 col-xxl-4 col-md-6"
              style={{ height: "485px", overflowY: "scroll" }}
            >
              <div className="card ">
                <h4 className="text-center pt-4">Forum Posts </h4>

                <div className="card-body">
                  <div className="dropdown text-end me-2">
                    <button
                      className="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                      type="button"
                      id="salesOverview"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="ri-more-2-line ri-20px"></i>
                    </button>
                  </div>
                  <div
                    className="border-bottom pb-4"
                    style={{ marginTop: "-12%" }}
                  >
                    <div className=" text-center mb-6 pt-2 rounded-3">
                      <img
                        className="img-fluid rounded-3"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          objectFit: "contain",
                        }}
                        src="/assets/img/avatars/the-worthy-goods-Tuy2n9md0AI-unsplash.jpg"
                        alt="Boy card image"
                      />
                    </div>
                    <h5
                      style={{ zIndex: 999, float: "right", marginRight: "3%" }}
                      className="onImage"
                    >
                      {/* <!-- <i className="bi bi-heart me-3"></i> -->
                        <!-- <i className="bi bi-send me-2"></i> --> */}
                    </h5>
                    <h5 className="mb-1">Welcome to HealthyLife India</h5>
                    {/* <!-- className="mb-6" --> */}
                    <p>
                      Are you ready to take charge of your health the natural
                      Indian way?
                    </p>
                    <p
                      className="toggle-comments"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-chat-left-dots me-2"></i>Comments{" "}
                    </p>
                    {/* <!-- <div className="comments-section mt-2" style="display: none;">
                        <p className="">User1: This is amazing!</p>
                        <p className="">User2: Looking forward to it!</p>
                    /  </div> --> */}
                    <div
                      className="comments-section mt-2 bg-body-tertiary"
                      style={{
                        display: "none",
                        padding: "10px 15px",
                        borderRadius: "12px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {/* <!-- Comment 1 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U1
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            user1{" "}
                            <span
                              style={{ fontWeight: "400" }}
                              className="text-secondary"
                            >
                              Whether you’re managing weight, controlling sugar
                              levels, or just want to eat better — HealthyLife
                              India is here for every step of your wellness
                              journey.
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* <!-- Comment 2 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U2
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            user2{" "}
                            <span
                              style={{ fontWeight: "400" }}
                              className="text-secondary"
                            >
                              From custom meal plans to expert fitness tips,
                              from yoga & meditation guidance to home-cooked
                              diet hacks, we bring everything you need to live a
                              healthier, happier life
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body ">
                  <div className="dropdown text-end me-2">
                    <button
                      className="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                      type="button"
                      id="salesOverview"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="ri-more-2-line ri-20px"></i>
                    </button>
                  </div>
                  <div
                    className="border-bottom pb-4"
                    style={{ marginTop: "-12%" }}
                  >
                    <div className=" text-center mb-6 pt-2 rounded-3">
                      <img
                        className="img-fluid rounded-3"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          objectFit: "contain",
                        }}
                        src="/assets/img/avatars/meagan-stone-r951FqxHTao-unsplash.jpg"
                        alt="Boy card image"
                      />
                    </div>
                    <h5
                      style={{
                        zIndex: 999,
                        float: "right",
                        marginRight: "3%",
                      }}
                      className="onImage"
                    ></h5>
                    <h5 className="mb-1">Desi Diet, Fit Life</h5>
                    {/* <!-- className="mb-6" --> */}
                    <p>
                      “Why go western when our Indian kitchen is already a
                      pharmacy?”
                    </p>
                    <p
                      className="toggle-comments"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-chat-left-dots me-2"></i>Comments{" "}
                    </p>
                    {/* <!-- <div className="comments-section mt-2" style="display: none;">
                        <p className="">User1: This is amazing!</p>
                        <p className="">User2: Looking forward to it!</p>
                       
                      </div> --> */}
                    <div
                      className="comments-section mt-2 bg-body-tertiary"
                      style={{
                        display: "none",
                        padding: "10px 15px",
                        borderRadius: "12px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {/* <!-- Comment 1 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U1
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            user1{" "}
                            <span
                              style={{ fontWeight: "400" }}
                              className="text-secondary"
                            >
                              Eat better with everyday Indian foods like dal,
                              sabzi, dahi, roti & desi spices.
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* <!-- Comment 2 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U2
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            user2{" "}
                            <span
                              style={{ fontWeight: "400" }}
                              className="text-secondary"
                            >
                              {" "}
                              Start your personalized Indian diet today!
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body ">
                  <div className="dropdown text-end me-2">
                    <button
                      className="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                      type="button"
                      id="salesOverview"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <i className="ri-more-2-line ri-20px"></i>
                    </button>
                  </div>
                  <div
                    className="border-bottom pb-4"
                    style={{ marginTop: "-12%" }}
                  >
                    <div className=" text-center mb-6 pt-2 rounded-3">
                      <img
                        className="img-fluid rounded-3"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          objectFit: "contain",
                        }}
                        src="/assets/img/avatars/fotos-c6yqukFgVDo-unsplash.jpg"
                        alt="Boy card image"
                      />
                    </div>
                    <h5
                      style={{
                        zIndex: 999,
                        float: "right",
                        marginRight: "3%",
                      }}
                      className="onImage"
                    >
                      {/* <!-- <i className="bi bi-heart me-3"></i> -->
                        <!-- <i className="bi bi-send me-2"></i> --> */}
                    </h5>
                    <h5 className="mb-1">Lose Weight with Ghar Ka Khana</h5>
                    {/* <!-- className="mb-6" --> */}
                    <p>You don’t need fancy meals to get fit.</p>
                    <p
                      className="toggle-comments"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-chat-left-dots me-2"></i>Comments{" "}
                    </p>
                    {/* <!-- <div className="comments-section mt-2" style="display: none;">
                        <p className="">User1: This is amazing!</p>
                        <p className="">User2: Looking forward to it!</p>
                      </div> --> */}
                    <div
                      className="comments-section mt-2 bg-body-tertiary"
                      style={{
                        display: "none",
                        padding: "10px 15px",
                        borderRadius: "12px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {/* <!-- Comment 1 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U1
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            user1{" "}
                            <span style={{ fontWeight: "400" }} className="">
                              Khichdi, dal-rice, roti-sabzi, and sprouts can do
                              wonders when eaten right!
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* <!-- Comment 2 --> */}
                      <div
                        className="comment d-flex align-items-start mb-2"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          className="bg-primary text-white"
                          style={{
                            flexShrink: 0,
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginRight: "10px",
                          }}
                        >
                          U2
                        </div>
                        <div
                          className="comment-body"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "10px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}
                        >
                          <p
                            className="username mb-1 fw-semibold"
                            style={{
                              margin: "0",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            user2{" "}
                            <span style={{ fontWeight: "400" }} className="">
                              Start your ghar ka khana journey with us.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--/ Upcoming Webinar --> */}

            {/* <!-- Activity Timeline --> */}
            <div className="col-12 col-xxl-8">
              <div className="card h-100">
                <div className="card-header">
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0">List of questions</h5>
                  </div>
                </div>
                <div className="card-body pt-4">
                  <ul className="timeline card-timeline mb-0">
                    <li className="timeline-item timeline-item-transparent">
                      <span className="timeline-point timeline-point-primary"></span>
                      <div className="timeline-event">
                        <div className="timeline-header mb-3">
                          <h6 className="mb-0">
                            {" "}
                            How can I boost my metabolism naturally?
                          </h6>
                          <small className="text-muted">12 min ago</small>
                        </div>
                        <p className="mb-2">Shreyas Kshirsagar | 17-04-2025 </p>

                        <button className="btn btn-sm btn-outline-success answer-btn">
                          Answer{" "}
                        </button>

                        <div
                          className="answer-form mt-2"
                          style={{ display: "none" }}
                        >
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Type your answer..."
                          />
                          <button className="btn btn-sm btn-primary submit-answer ">
                            Submit
                          </button>
                        </div>
                      </div>
                    </li>
                    <li className="timeline-item timeline-item-transparent">
                      <span className="timeline-point timeline-point-success"></span>
                      <div className="timeline-event">
                        <div className="timeline-header mb-3">
                          <h6 className="mb-0">
                            Is it okay to eat dinner after 9 PM?
                          </h6>
                          <small className="text-muted">45 min ago</small>
                        </div>

                        <p className="mb-2">Rishikesh Raila | 01-04-2025 </p>

                        <button className="btn btn-sm btn-outline-success answer-btn">
                          Answer{" "}
                        </button>

                        <div
                          className="answer-form mt-2"
                          style={{ display: "none" }}
                        >
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Type your answer..."
                          />
                          <button className="btn btn-sm btn-primary submit-answer ">
                            Submit
                          </button>
                        </div>
                      </div>
                    </li>
                    <li className="timeline-item timeline-item-transparent">
                      <span className="timeline-point timeline-point-info"></span>
                      <div className="timeline-event">
                        <div className="timeline-header mb-3">
                          <h6 className="mb-0">
                            What are some healthy Indian snacks?
                          </h6>
                          <small className="text-muted">2 Day Ago</small>
                        </div>
                        <p className="mb-2">Shivraj Babar | 29-03-2025 </p>

                        <button className="btn btn-sm btn-outline-success answer-btn">
                          Answer{" "}
                        </button>

                        <div
                          className="answer-form mt-2"
                          style={{ display: "none" }}
                        >
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Type your answer..."
                          />
                          <button className="btn btn-sm btn-primary submit-answer ">
                            Submit
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
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
