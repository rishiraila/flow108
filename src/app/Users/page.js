'use client';
import React, { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', function (event) {
        const confirmDelete = confirm('Are you sure you want to delete this user?');
        if (!confirmDelete) {
          event.preventDefault();
        }
      });
    });
  }, []);

  return (
    <div>
      <div className="content-wrapper">
        {/* <!-- Content --> */}
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row g-6 mb-6">
            {[
              {
                count: 42,
                label: 'User Registered',
                percent: '+18.2%',
                class: 'primary',
                icon: 'ri-user-add-line',
              },
              {
                count: 8,
                label: 'Paid Members',
                percent: '-8.7%',
                class: 'warning',
                icon: 'ri-user-star-line',
              },
              {
                count: 27,
                label: 'Total Questions',
                percent: '+4.3%',
                class: 'danger',
                icon: 'ri-group-line',
              },
              {
                count: 13,
                label: 'Total Posts',
                percent: '-2.5%',
                class: 'info',
                icon: 'ri-article-line',
              },
            ].map((item, index) => (
              <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
                <div className={`card card-border-shadow-${item.class} h-100`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-2">
                      <div className="avatar me-4">
                        <span className={`avatar-initial rounded-3 bg-label-${item.class}`}>
                          <i className={`tf-icons ${item.icon} ri-24px`}></i>
                        </span>
                      </div>
                      <h4 className="mb-0">{item.count}</h4>
                    </div>
                    <h6 className="mb-0 fw-normal">{item.label}</h6>
                    <p className="mb-0">
                      <span className="me-1 fw-medium">{item.percent}</span>
                      <small className="text-muted">than last week</small>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* <!-- Users List Table --> */}
          <div className="card">
            <div className="card-header">
              <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center">
                <h3 className="card-title mb-0 mb-md-0">User List</h3>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addUserModal">
                    <i className="ri-add-line"></i> Add User
                  </button>
                </div>
              </div>
            </div>
            <div className="card-datatable table-responsive">
              <div className="container mt-2">
                <table id="userTable" className="table table-bordered table-striped">
                  <thead className="table-primary">
                    <tr>
                      <th>
                        <input type="checkbox" id="selectAll" />
                      </th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: 'Meera Sharma',
                        email: 'meerasharma@example.com',
                        plan: 'Free Plan',
                        status: 'Active',
                        badge: 'success',
                      },
                      {
                        name: 'Dev Patel',
                        email: 'devpatel@example.com',
                        plan: 'Flow Plan',
                        status: 'Pending',
                        badge: 'danger text-dark',
                      },
                      {
                        name: 'Ananya Desai',
                        email: 'ananyadesai@example.com',
                        plan: 'Diva Plan',
                        status: 'Pending',
                        badge: 'danger text-dark',
                      },
                    ].map((user, index) => (
                      <tr key={index}>
                        <td>
                          <input type="checkbox" className="row-checkbox" />
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.plan}</td>
                        <td>
                          <span className={`badge bg-${user.badge}`}>{user.status}</span>
                        </td>
                        <td>
                          <a href="/UserDetails">
                            <button className="btn btn-sm btn-outline-success me-1">
                              <i className="bi bi-bar-chart-fill"></i>
                            </button>
                          </a>
                          <a href="./userUpdateForm.html">
                            <button className="btn btn-sm btn-outline-primary me-1">
                              <i className="bi bi-pencil"></i>
                            </button>
                          </a>
                          <button className="btn btn-sm btn-outline-danger delete-btn">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* <!-- Add User Modal --> */}
          <div
            className="modal fade"
            id="addUserModal"
            tabIndex="-1"
            aria-labelledby="addUserModalLabel"
            aria-hidden="true"
            data-bs-backdrop="static"
          >
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header text-white rounded-top-4">
                  <h5 className="modal-title" id="addUserModalLabel">
                    Add New User
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-light"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <form id="addUserFormModal">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Name</label>
                      <input type="text" className="form-control rounded-3 shadow-sm" placeholder="Enter name" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input type="email" className="form-control rounded-3 shadow-sm" placeholder="Enter email" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Plan</label>
                      <select className="form-select rounded-3 shadow-sm" required>
                        <option value="">Select plan</option>
                        <option>Diva Plan</option>
                        <option>Flow Plan</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select className="form-select rounded-3 shadow-sm" required>
                        <option value="">Select status</option>
                        <option>Active</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <div className="d-grid">
                      <button type="submit" className="btn btn-primary rounded-3 shadow-sm fw-semibold">
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* End Add Modal */}
        </div>
      </div>
    </div>
  );
}
