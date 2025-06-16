import React from 'react'

export default function page() {
  return (
    <div>
           <div className="content-wrapper">
          {/* <!-- Content --> */}

          <div className="container-xxl flex-grow-1 container-p-y">

            <div className="row mb-5">
              <div className="col-6 col-sm-6 col-lg-3 mb-2">
                <div className="card card-border-shadow-primary h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar me-4">
                        <span className="avatar-initial rounded-3 bg-label-primary"><i
                            className="tf-icons ri-user-add-line ri-24px"></i></span>
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
                        <span className="avatar-initial rounded-3 bg-label-warning"><i
                            className="ri-user-star-line ri-24px"></i></span>
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
                        <span className="avatar-initial rounded-3 bg-label-danger"><i
                            className="ri-group-line ri-24px"></i></span>
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
                        <span className="avatar-initial rounded-3 bg-label-info"><i
                            className="ri-article-line ri-24px"></i></span>
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

            </div>

            <div className="bs-stepper-content  rounded-0">
              <form id="wizard-checkout-form" onSubmit="return false">
                {/* <!-- Cart --> */}
                <div id="checkout-cart" className="content">
                  <div className="row">
                    {/* <!-- Cart left --> */}
                    <div className="col-xl-8 mb-4 mb-xl-0">



                    </div>
                  </div>
                </div>

                  {/* <!-- Confirmation --> */}
                  <div id="checkout-confirmation" className="content">


                    <div className="row">
                      {/* <!-- Confirmation items --> */}
                      <div className="col-xl-8 mb-4 mb-xl-0">
                        <ul className="list-group">
                          <li className="list-group-item p-5">
                            <div className="d-flex gap-4">
                              <div className="flex-shrink-0">
                                <a href="/WorkoutDetails"><img src="/assets/img/avatars/14.png" alt="google home"
                                    className="w-px-75" /></a>
                              </div>
                              <div className="flex-grow-1">
                                <div className="row d-flex align-items-center">
                                  <div className="col-md-8 pt-2">
                                    <a href="/WorkoutDetails" className="text-body mt-1">
                                      <h6 className="mb-2">Beginner Fitness Plan</h6>
                                    </a>
                                    <div className="text-body mb-2 d-flex flex-wrap">
                                      <span className="me-1">Duration:</span>
                                      <a href="/WorkoutDetails" className="me-1"> 1 Month</a>
                                    </div>
                                    <span className="badge bg-label-success rounded-pill mt-2 mt-sm-0">features: Lorem ipsum
                                      dolor sit amet.</span>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="text-md-end">
                                      <div className="my-2 my-lg-6">
                                        <button className="btn btn-outline-primary" data-bs-toggle="modal"
                                          data-bs-target="#editPlanModal">Edit</button>

                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li className="list-group-item p-5">
                            <div className="d-flex gap-4">
                              <div className="flex-shrink-0">
                                <a href="/WorkoutDetails"><img src="/assets/img/avatars/12.png" alt="google home"
                                    className="w-px-75" /></a>
                              </div>
                              <div className="flex-grow-1">
                                <div className="row d-flex align-items-center">
                                  <div className="col-md-8 pt-2">
                                    <a href="/WorkoutDetails" className="text-body mt-1">
                                      <h6 className="mb-2">Intermediate Strength Plan</h6>
                                    </a>
                                    <div className="text-body mb-2 d-flex flex-wrap">
                                      <span className="me-1">Duration: </span>
                                      <a href="/WorkoutDetails" className="me-1">3 Months</a>
                                    </div>
                                    <span className="badge bg-label-success rounded-pill mt-2 mt-sm-0">features: Lorem ipsum
                                      dolor sit amet.</span>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="text-md-end">
                                      <div className="my-2 my-lg-6">
                                        <button className="btn btn-outline-primary" data-bs-toggle="modal"
                                          data-bs-target="#editPlanModal">Edit</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li className="list-group-item p-5">
                            <div className="d-flex gap-4">
                              <div className="flex-shrink-0">
                                <a href="/WorkoutDetails"> <img src="/assets/img/avatars/20.png" alt="google home"
                                    className="w-px-75" /></a>
                              </div>
                              <div className="flex-grow-1">
                                <div className="row d-flex align-items-center">
                                  <div className="col-md-8 pt-2">
                                    <a href="/WorkoutDetails" className="text-body mt-1">
                                      <h6 className="mb-2">weight loss plan</h6>
                                    </a>
                                    <div className="text-body mb-2 d-flex flex-wrap">
                                      <span className="me-1">Duration:</span>
                                      <a href="/WorkoutDetails" className="me-1">2 Months</a>
                                    </div>
                                    <span className="badge bg-label-success rounded-pill mt-2 mt-sm-0">features: Lorem ipsum
                                      dolor sit amet.</span>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="text-md-end">
                                      <div className="my-2 my-lg-6">
                                        <button className="btn btn-outline-primary" data-bs-toggle="modal"
                                          data-bs-target="#editPlanModal">Edit</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                          <li className="list-group-item p-5">
                            <div className="d-flex gap-4">
                              <div className="flex-shrink-0">
                                <img src="/assets/img/avatars/11.png" alt="google home" className="w-px-75" />
                              </div>
                              <div className="flex-grow-1">
                                <div className="row d-flex align-items-center">
                                  <div className="col-md-8 pt-2">
                                    <a href="javascript:void(0)" className="text-body mt-1">
                                      <h6 className="mb-2">Muscle Building plan</h6>
                                    </a>
                                    <div className="text-body mb-1 d-flex flex-wrap">
                                      <span className="me-1">Duration:</span>
                                      <a href="javascript:void(0)" className="me-1">8 Months</a>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="text-md-end">
                                      <div className="my-2 my-lg-6">
                                        <button className="btn btn-outline-primary" data-bs-toggle="modal"
                                          data-bs-target="#editPlanModal">Edit</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Confirmation total --> */}
                      <div className="col-xl-4">
                        <div className="border rounded-4 p-5">
                          {/* <!-- Add Exercise Plan Form --> */}
                          <h6>Add Exercise Plan</h6>
                          <form id="exerciseForm"> 
                            <div className="mb-3">
                              <label for="planImage" className="form-label">Plan Image</label>
                              <input type="file" className="form-control" id="planImage" name="planImage"
                                accept="image/*" />
                            </div>

                            <div className="mb-3">
                              <label for="planName" className="form-label">Plan Name</label>
                              <input type="text" className="form-control" id="planName" name="planName"
                                placeholder="e.g. Beginner Fitness Plan" required />
                            </div>

                            <div className="mb-3">
                              <label for="duration" className="form-label">Duration</label>
                              <input type="text" className="form-control" id="duration" name="duration"
                                placeholder="e.g. 1 Month" required />
                            </div>

                            <div className="mb-3">
                              <label for="features" className="form-label">Features</label>
                              <textarea className="form-control" id="features" name="features" rows="4"
                                placeholder="e.g. 3 Workouts/Week, Basic Nutrition Guide" required></textarea>
                            </div>

                            <button type="submit" className="btn btn-success w-100">Add Plan</button>
                          </form>
                        </div>
                      </div>

                    </div>
                  </div>
              </form>
            </div>
          </div>
          {/* <!-- / Content --> */}

          {/* <!-- Modal --> */}
          <div className="modal fade" id="editPlanModal" tabindex="-1" aria-labelledby="editPlanModalLabel"
            aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content rounded-3 shadow">
                <div className="modal-header">
                  <h5 className="modal-title" id="editPlanModalLabel">Edit Plan</h5>
                  <button type="button" className="btn-close modal-close" data-bs-dismiss="modal"
                    aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {/* <!-- Your form or edit content --> */}
                  <form id="editPlanForm">
                    <div className="mb-3">
                      <label for="editPlanName" className="form-label">Plan Name</label>
                      <input type="text" className="form-control" id="editPlanName" />
                    </div>
                    <div className="mb-3">
                      <label for="editDuration" className="form-label">Duration</label>
                      <input type="text" className="form-control" id="editDuration" />
                    </div>
                    <div className="mb-3">
                      <label for="editFeatures" className="form-label">Features</label>
                      <textarea className="form-control" id="editFeatures" rows="3"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Save Changes</button>
                  </form>
                </div>
              </div>
            </div>
          </div>


          {/* <!-- Overlay --> */}
          <div className="layout-overlay layout-menu-toggle"></div>

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
          {/* <script>
    // Select all answer buttons
    document.querySelectorAll('.answer-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const parent = btn.closest('.timeline-event');
        const answerForm = parent.querySelector('.answer-form');

        // Toggle the form visibility
        const isVisible = answerForm.style.display === 'block';
        answerForm.style.display = isVisible ? 'none' : 'block';
        btn.textContent = isVisible ? 'Answer' : 'Cancel';
      });
    });

    // Select all submit buttons
    document.querySelectorAll('.submit-answer').forEach((submitBtn) => {
      submitBtn.addEventListener('click', function () {
        const parent = submitBtn.closest('.answer-form');
        const inputField = parent.querySelector('input');
        const answer = inputField.value.trim();

        if (answer) {
          console.log('Submitted Answer:', answer);
          alert('Answer submitted successfully!');
          inputField.value = '';
          // Optional: Hide the form again
          parent.style.display = 'none';
          const answerBtn = parent.closest('.timeline-event').querySelector('.answer-btn');
          answerBtn.textContent = 'Answer';
        } else {
          alert('Please type an answer before submitting.');
        }
      });
    });

    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".toggle-comments").forEach(function (el) {
        el.addEventListener("click", function () {
          const cardBody = el.closest(".card-body");
          const commentSection = cardBody.querySelector(".comments-section");

          if (commentSection) {
            const isVisible = commentSection.style.display === "block";
            commentSection.style.display = isVisible ? "none" : "block";
          }
        });
      });
    });


    document.querySelectorAll('.report-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const postId = this.getAttribute('data-post-id');

        if (confirm(`Are you sure you want to report and delete this post ${postId} ?`)) {
          alert(`Post ${postId} reported and deleted.`);
          // Place your logic here — e.g., hide the post, send a request, etc.
          // document.getElementById(`post-${postId}`).remove();
        } else {
          console.log("User canceled.");
        }
      });
    });
  </script>

<script>
  document.getElementById("exerciseForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission (optional if you don’t want the page to reload)

    // Show alert message
    alert("Exercise plan is added");

    // You can optionally submit the form here manually if needed:
    // this.submit();
  });
</script>


<script>
  const modalElement = document.getElementById('editPlanModal');

  // Show modal when edit button clicked
  document.querySelectorAll('.btn-outline-primary').forEach((btn) => {
    btn.addEventListener('click', () => {
      const listItem = btn.closest('.list-group-item');
      const title = listItem.querySelector('h6')?.textContent.trim() || '';
      const duration = listItem.querySelector('.text-body a:nth-child(2)')?.textContent.trim() || '';
      const features = listItem.querySelector('.badge')?.textContent.replace("features:", "").trim() || '';

      document.getElementById('editPlanName').value = title;
      document.getElementById('editDuration').value = duration;
      document.getElementById('editFeatures').value = features;

      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
    });
  });

  // Handle modal close cleanup
  function cleanupModal() {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Submit form
  document.getElementById('editPlanForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    alert("Plan updated!");
  });

  // Close button
  document.querySelector('.modal-close').addEventListener('click', function () {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
  });

  // Modal hidden event: Cleanup backdrop and body scroll
  modalElement.addEventListener('hidden.bs.modal', function () {
    cleanupModal();
  });
</script> */}
    </div>
  )
}
