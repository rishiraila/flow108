import React from 'react'

export default function page() {
  return (
    <div>
        <div className="content-wrapper">
          {/* <!-- Content --> */}

          <div className="container-xxl flex-grow-1 container-p-y">
            <div className="app-academy">
              <div className="card mb-6">
                <div className="card-header d-flex flex-wrap justify-content-between gap-4">
                  <div className="card-title mb-0 me-1">
                    <h5 className="mb-0">Exercises</h5>
                    <p className="mb-0 text-body">
                      Total 6 course you have purchased
                    </p>
                  </div>
                  <div className="d-flex justify-content-md-end align-items-center gap-6 flex-wrap">
                    <select className="form-select form-select-sm w-px-250">
                      <option value="all courses">All exercise</option>
                      <option value="ui/ux">UI/UX</option>
                      <option value="seo">SEO</option>
                      <option value="web">Web</option>
                      <option value="music">Music</option>
                      <option value="painting">Painting</option>
                    </select>

                    <div className="form-check form-switch mb-0">
                      <button className="btn btn-outline-primary" id="openExerciseForm" data-bs-toggle="modal" data-bs-target="#exerciseModal">
                        Add Exercise
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body mt-1">
                  <div className="row gy-6 mb-6">
                    <div className="col-sm-6 col-lg-4">
                      <div className="card p-2 h-100 shadow-none border rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/plank-2793016_1280.jpg"
                              alt="tutor image 1" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-primary">Low</span>
                            <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                              4.4
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal">(1.23k)</span>
                            </p>
                          </div>
                          <a  className="h5">Jumping Jacks
                          </a>
                          <p className="mt-1">
                            A cardio warm-up that increases heart rate and
                            warms up the body.
                          </p>
                          <p className="d-flex align-items-center mb-1">
                            <i className="ri-time-line ri-20px me-1"></i>1-2
                            minutes
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-75"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                      <div className="card shadow-none border p-2 h-100 rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/meagan-stone-r951FqxHTao-unsplash.jpg" alt="tutor image 2" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-primary">Low</span>
                            <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                              4.4
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal">(1.23k)</span>
                            </p>
                          </div>
                          <a className="h5" >Squats</a>
                          <p className="mt-1">
                            Introductory course for design and framework
                            basics in web development.
                          </p>
                          <p className="d-flex align-items-center mb-1">
                            <i className="ri-time-line ri-20px me-1"></i>16 hours
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-25"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> -->
                          <!-- Action Buttons Aligned to Right --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                      <div className="card shadow-none border p-2 h-100 rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/woman-4127336_1280.jpg" alt="tutor image 3" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-success">Burpees</span>
                            <p className="d-flex align-items-center justify-content-center fw-medium gap-1 mb-0">
                              5
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal"> (12)</span>
                            </p>
                          </div>
                          <a className="h5" >Cool-down Stretch</a>
                          <p className="mt-1">
                            Keyword suggestion tool provides comprehensive
                            details & keyword suggestions.
                          </p>
                          <p className="d-flex align-items-center mb-1">
                            <i className="ri-time-line ri-20px me-1"></i>7 hours
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-50"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                      <div className="card shadow-none border p-2 h-100 rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/nikola-murniece-XpBI38qtskw-unsplash.jpg"
                              alt="tutor image 4" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-info">Music</span>
                            <p className="d-flex align-items-center justify-content-center gap-1 mb-0">
                              3.8
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal"> (634)</span>
                            </p>
                          </div>
                          <a className="h5" >Burpees</a>
                          <p className="mt-1">
                            20 more lessons like this about music production,
                            writing, mixing, mastering
                          </p>
                          <p className="d-flex align-items-center mb-1">
                            <i className="ri-time-line ri-20px me-1"></i>30
                            minutes
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-75"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                      <div className="card shadow-none border p-2 h-100 rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/plank-2793016_1280.jpg" alt="tutor image 5" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-warning">Painting</span>
                            <p className="d-flex align-items-center justify-content-center gap-1 mb-0">
                              4.7
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal"> (34)</span>
                            </p>
                          </div>
                          <a className="h5" >Plank</a>
                          <p className="mt-1">
                            Easy-to-follow video & guides show you how to draw
                            animals, people & more.
                          </p>
                          <p className="d-flex align-items-center text-success mb-1">
                            <i className="ri-check-line ri-20px me-1"></i>Completed
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-100"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4">
                      <div className="card shadow-none border p-2 h-100 rounded-3">
                        <div className="rounded-4 text-center mb-5">
                          <a ><img className="img-fluid"
                              src="/assets/img/avatars/meagan-stone-r951FqxHTao-unsplash.jpg" alt="tutor image 6" /></a>
                        </div>
                        <div className="card-body p-3 pt-0">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="badge rounded-pill bg-label-danger">UI/UX</span>
                            <p className="d-flex align-items-center justify-content-center gap-1 mb-0">
                              3.6
                              <span className="text-warning"><i className="ri-star-s-fill ri-24px me-1"></i></span><span
                                className="fw-normal"> (2.5k)</span>
                            </p>
                          </div>
                          <a className="h5" >Lunges</a>
                          <p className="mt-1">
                            This guide will help you develop a systematic
                            approach user interface.
                          </p>
                          <p className="d-flex align-items-center mb-1">
                            <i className="ri-time-line ri-20px me-1"></i>16 hours
                          </p>
                          {/* <!-- <div className="progress rounded-pill mb-4" style="height: 8px">
                              <div
                                className="progress-bar w-25"
                                role="progressbar"
                                aria-valuenow="25"
                                aria-valuemin="0"
                                aria-valuemax="100"></div>
                            </div> --> */}
                          <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary d-flex align-items-center" data-bs-toggle="modal"
                              data-bs-target="#editExerciseModal">
                              <i className="ri-pencil-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>
                            {/* <!-- Delete Button --> */}
                            <button className="btn btn-outline-danger d-flex align-items-center">
                              <i className="ri-delete-bin-line ri-16px lh-1 scaleX-n1-rtl"></i>
                            </button>

                            {/* <!-- Edit Button --> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- Modal --> */}
          <div className="modal fade" id="editExerciseModal" tabindex="-1" aria-labelledby="editExerciseModalLabel"
            aria-hidden="true"
            data-bs-backdrop="static" data-bs-keyboard="false">
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content rounded-3 shadow">
                <div className="modal-header">
                  <h5 className="modal-title" id="editExerciseModalLabel">
                    Edit Exercise
                  </h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form id="editExerciseForm">
                    <div className="mb-3">
                      <label for="exerciseName" className="form-label">Exercise Name</label>
                      <input type="text" className="form-control" id="exerciseName" value="Jumping Jacks" />
                    </div>
                    <div className="mb-3">
                      <label for="exerciseDesc" className="form-label">Description</label>
                      <textarea className="form-control" id="exerciseDesc" rows="3">
A cardio warm-up that increases heart rate.</textarea>
                    </div>
                    <div className="mb-3">
                      <label for="exerciseIntensity" className="form-label">Intensity</label>
                      <select className="form-select" id="exerciseIntensity">
                        <option value="Low" selected>Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label for="exerciseDuration" className="form-label">Duration</label>
                      <input type="text" className="form-control" id="exerciseDuration" value="1-2 minutes" />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Save Changes
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="modal fade" id="exerciseModal" tabindex="-1" aria-labelledby="exerciseModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false"
          >
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content bg-light">
                <div className="modal-header">
                  <h5 className="modal-title" id="exerciseModalLabel">Add New Exercise</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
          
                <form id="exerciseForm">
                  <div className="modal-body">
                    <div className="mb-3">
                      <label for="exerciseMedia" className="form-label">Image/Video</label>
                      <input type="file" className="form-control" id="exerciseMedia" accept="image/*,video/*" />
                    </div>
                    <div className="mb-3">
                      <label for="exerciseName" className="form-label">Exercise Name</label>
                      <input type="text" className="form-control" id="exerciseName" placeholder="Enter exercise name" required />
                    </div>
                    <div className="mb-3">
                      <label for="exerciseDesc" className="form-label">Description</label>
                      <textarea className="form-control" id="exerciseDesc" rows="3" placeholder="Describe the exercise" required></textarea>
                    </div>
                    <div className="mb-3">
                      <label for="exerciseIntensity" className="form-label">Intensity</label>
                      <select className="form-select" id="exerciseIntensity" required>
                        <option value="">Select intensity</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label for="exerciseDuration" className="form-label">Duration (in minutes)</label>
                      <input type="number" className="form-control" id="exerciseDuration" placeholder="e.g. 30" required />
                    </div>
                  </div>
          
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" className="btn btn-success">Add Exercise</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <!-- Overlay --> */}
          <div id="overlay" className="overlay"></div>
          {/* <!-- / Content --> */}
          {/* <!-- / Content --> */}

          {/* <!-- Footer --> */}
          <footer className="content-footer footer bg-footer-theme">
            <div className="container-xxl">
              <div
                className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
                <div className="text-body mb-2 mb-md-0">
                  ©
                  <script>
                    document.write(new Date().getFullYear());
                  </script>
                  , made with <span className="text-danger"><i className="tf-icons ri-heart-fill"></i></span> by
                  <a href="https://www.coinagesoft.com/" target="_blank" className="footer-link">Coinage.in</a>
                </div>
               
              </div>
            </div>
          </footer>
          {/* <!-- / Footer --> */}

          <div className="content-backdrop fade"></div>
        </div>
    </div>
  )
}
