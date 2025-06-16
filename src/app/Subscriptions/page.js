"use client";
// import React from "react";
import React, { useRef, useState, useEffect } from 'react';

export default function Page() {
  const [keyPoints, setKeyPoints] = useState(['']);
  const [editPlan, setEditPlan] = useState({ name: '', desc: '', price: '', points: [] });
  const [users] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Carol Brown", email: "carol@example.com" }
  ]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const assignModalRef = useRef(null);
  const editModalRef = useRef(null);

  // Bootstrap modal support (client only)
  useEffect(() => {
    if (typeof window !== "undefined" && window.bootstrap) {
      assignModalRef.current = new window.bootstrap.Modal(document.getElementById('assignPlanModal'));
      editModalRef.current = new window.bootstrap.Modal(document.getElementById('editPlanModal'));
    }
  }, []);

  const addKeyPoint = () => {
    setKeyPoints([...keyPoints, '']);
  };

  const handleKeyPointChange = (index, value) => {
    const updated = [...keyPoints];
    updated[index] = value;
    setKeyPoints(updated);
  };

  const openEditPlanSidebar = (name, desc, points, price) => {
    setEditPlan({ name, desc, price, points });
    editModalRef.current?.show();
  };

  const closeEditSidebar = () => {
    editModalRef.current?.hide();
  };

  const addKeyPointInput = () => {
    setEditPlan(prev => ({
      ...prev,
      points: [...prev.points, '']
    }));
  };

  const handleEditPointChange = (index, value) => {
    const updatedPoints = [...editPlan.points];
    updatedPoints[index] = value;
    setEditPlan(prev => ({ ...prev, points: updatedPoints }));
  };

  const saveEditedPlan = () => {
    console.log("Updated Plan:", editPlan);
    closeEditSidebar();
  };

  const openAssignSidebar = () => {
    assignModalRef.current?.show();
    setFilteredUsers(users);
  };

  const closeAssignSidebar = () => {
    assignModalRef.current?.hide();
  };

  const filterUsers = (search) => {
    const lower = search.toLowerCase();
    setFilteredUsers(users.filter(user =>
      user.name.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower)
    ));
  };

  const toggleAll = (checked) => {
    setSelectAll(checked);
    setSelectedUsers(checked ? users.map(u => u.id.toString()) : []);
  };

  const toggleUserCheckbox = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(uid => uid !== id)
        : [...prev, id]
    );
  };

  const assignPlan = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    alert("Plan assigned to user IDs: " + selectedUsers.join(", "));
    closeAssignSidebar();
  };

  // ⬇️ JSX content continues below this logic
  return (
    <div>
      {" "}
      <div className="content-wrapper">
        {/* <!-- Content --> */}

        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="card">
            <div className="pb-sm-12 pb-2 rounded-top">
              <div className="container py-12">
                <div
                  className="ms-auto text-end"
                  style={{ position: "relative" }}
                >
                  <button
                    id="openSidebarBtn"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#addPlanModal"
                  >
                    Add Plan
                  </button>
                </div>
              </div>

              <div
                id="sidebar"
                className="bg-light"
                style={{
                  position: "fixed",
                  top: 0,
                  right: "-400px",
                  width: "350px",
                  height: "100%",
                  padding: "20px",
                  transition: "right 0.3s ease",
                  overflowY: "auto",
                  zIndex: 999999999,
                  // background: '#fff',
                  // boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                }}
              >
                <h5 style={{ marginBottom: "20px" }}>Add New Plan</h5>

                {/* <!-- Plan Name --> */}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "5px",
                    }}
                  >
                    Plan Name
                  </label>
                  <input type="text" className="form-control" />
                </div>

                {/* <!-- Short Description --> */}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: "5px",
                    }}
                  >
                    Short Description
                  </label>
                  <textarea className="form-control" rows="3"></textarea>
                </div>

                {/* <!-- Key Points --> */}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: "5px",
                    }}
                  >
                    Key Points
                  </label>
                  <div id="keyPointsContainer">
                    <input type="text" className="form-control" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onclick="addKeyPoint()"
                  >
                    Add Key Point
                  </button>
                </div>

                {/* <!-- Price --> */}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: "5px",
                    }}
                  >
                    Price
                  </label>
                  <input type="number" className="form-control" />
                </div>

                {/* <!-- Buttons --> */}
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-evenly",
                  }}
                >
                  <button
                    type="button"
                    id="savePlanBtn"
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    id="closeSidebarBtn"
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <h4 className="text-center mb-2" style={{ marginTop: "-7%" }}>
                Subscriptions Plans
              </h4>
              <p className="text-center mb-2">
                All plans include 40+ advanced tools and features to boost your
                product. Choose the best plan to fit your needs.
              </p>

              {/* <!-- Assign Plan Sidebar --> */}
              <div
                id="assignPlanSidebar"
                className="bg-light"
                style={{
                  position: "fixed",
                  top: 0,
                  right: "-400px",
                  width: "350px",
                  height: "100%",
                  padding: "20px",
                  overflowY: "auto",
                  transition: "right 0.3s ease",
                  zIndex: 99999,
                }}
              >
                <h5 style={{ marginBottom: "15px" }}>Assign Plan to Users</h5>

                <input
                  type="text"
                  id="userSearch"
                  placeholder="Search user..."
                  className="form-control mb-3"
                  onkeyup="filterUsers()"
                />

                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            id="selectAll"
                            onclick="toggleAll(this)"
                          />
                        </th>
                        <th style={{ fontSize: "12px" }}>Name</th>
                        <th style={{ fontSize: "12px" }}>Email</th>
                      </tr>
                    </thead>
                    <tbody id="userTableBody">
                      {/* <!-- Users will be injected here --> */}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-primary mt-3 w-100"
                  onclick="assignPlan()"
                >
                  Assign Plan
                </button>
                <button
                  className="btn btn-dark mt-2 w-100"
                  onclick="closeAssignSidebar()"
                >
                  Cancel
                </button>
              </div>

              {/* <!-- Pricing Cards --> */}
              <div className="pricing-plans row mx-4 gy-3 px-lg-12 mt-4">
                {/* <!-- Basic Plan --> */}
                <div className="col-lg mb-lg-0 mb-3">
                  <div className="card border shadow-none">
                    <div className="card-body pt-12">
                      <div className="mt-3 mb-5 text-center">
                        <img
                          src="/assets/img/illustrations/pricing-basic.png"
                          alt="Basic Image"
                          height="100"
                        />
                      </div>
                      <h4 className="card-title text-center text-capitalize mb-2">
                        The Free Plan
                      </h4>
                      <p className="text-center mb-5">
                        A simple start for everyone
                      </p>
                      <div className="text-center"></div>
                      <ul className="list-group ps-6 my-5 pt-4">
                        <li className="mb-4">100 responses a month</li>
                        <li className="mb-4">Unlimited forms and surveys</li>
                        <li className="mb-4">Unlimited fields</li>
                        <li className="mb-4">Basic form creation tools</li>
                        <li className="mb-0">Up to 2 subdomains</li>
                      </ul>
                      <div className="d-flex justify-content-center gap-1 mt-3">
                        <a
                          href="#"
                          className="btn btn-primary btn-small"
                          onclick="openAssignSidebar()"
                        >
                          {" "}
                          <i
                            className="bi bi-person-check"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </a>
                        <a
                          href="#"
                          className="btn btn-outline-primary "
                          onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
   ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
                        >
                          {" "}
                          <i
                            className="bi bi-pencil "
                            style={{ fontSize: "15px" }}
                          ></i>
                        </a>
                      </div>

                      <div
                        id="editPlanSidebar"
                        className="bg-light"
                        style={{
                          position: "fixed",
                          top: 0,
                          right: "-400px",
                          width: "350px",
                          height: "100%",
                          padding: "20px",
                          overflowY: "auto",
                          transition: "right 0.3s ease",
                          zIndex: 99999,
                          // background: '#fff',
                          // boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                        }}
                      >
                        <h5 style={{ marginBottom: "15px" }}>Edit Plan</h5>

                        <label>Plan Name</label>
                        <input
                          type="text"
                          id="editPlanName"
                          className="form-control my-2"
                        />

                        <label>Short Description</label>
                        <textarea
                          id="editPlanDesc"
                          className="form-control my-2"
                        ></textarea>

                        <label>Key Points</label>
                        <div
                          id="editKeyPoints"
                          style={{ marginBottom: "10px" }}
                        ></div>
                        <button
                          onclick="addKeyPointInput()"
                          style={{ marginBottom: "10px" }}
                          className="btn btn-outline-dark"
                        >
                          + Add Point
                        </button>

                        <label>Price</label>
                        <input
                          type="number"
                          id="editPlanPrice"
                          className="form-control my-2"
                        />

                        <button
                          onclick="saveEditedPlan()"
                          className="btn btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onclick="closeEditSidebar()"
                          style={{ marginLeft: "10px" }}
                          className="btn btn-dark"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg mb-lg-0 mb-3">
                  <div className="card border shadow-none">
                    <div className="card-body pt-12">
                      <div className="mt-3 mb-5 text-center">
                        <img
                          src="/assets/img/illustrations/pricing-standard.png"
                          alt="Basic Image"
                          height="100"
                        />
                      </div>
                      <h4 className="card-title text-center text-capitalize mb-2">
                        The Flow Plan
                      </h4>
                      <p className="text-center mb-5">
                        A simple start for everyone
                      </p>
                      <div className="text-center"></div>
                      <ul className="list-group ps-6 my-5 pt-4">
                        <li className="mb-4">100 responses a month</li>
                        <li className="mb-4">Unlimited forms and surveys</li>
                        <li className="mb-4">Unlimited fields</li>
                        <li className="mb-4">Basic form creation tools</li>
                        <li className="mb-0">Up to 2 subdomains</li>
                      </ul>
                      <div className="d-flex justify-content-center gap-1 mt-3">
                        <a
                          href="#"
                          className="btn btn-primary "
                          onclick="openAssignSidebar()"
                        >
                          {" "}
                          <i
                            className="bi bi-person-check "
                            style={{ fontSize: "20px" }}
                          ></i>
                        </a>
                        <a
                          href="#"
                          className="btn btn-outline-primary"
                          onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
   ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
                        >
                          {" "}
                          <i
                            className="bi bi-pencil "
                            style={{ fontSize: "15px" }}
                          ></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Enterprise Plan --> */}
                <div className="col-lg">
                  <div className="card border shadow-none">
                    <div className="card-body pt-12">
                      <div className="mt-3 mb-5 text-center">
                        <img
                          src="/assets/img/illustrations/pricing-enterprise.png"
                          alt="Enterprise Image"
                          height="100"
                        />
                      </div>
                      <h4 className="card-title text-center text-capitalize mb-2">
                        The Diva Plan
                      </h4>
                      <p className="text-center mb-5">
                        Solution for big organizations
                      </p>
                      <div className="text-center"></div>
                      <ul className="list-group ps-6 my-5 pt-4">
                        <li className="mb-4">PayPal payments</li>
                        <li className="mb-4">Logic Jumps</li>
                        <li className="mb-4">File upload with 5GB storage</li>
                        <li className="mb-4">Custom domain support</li>
                        <li className="mb-0">Stripe integration</li>
                      </ul>
                      <div className="d-flex justify-content-center gap-1 mt-3">
                        <a
                          href="#"
                          className="btn btn-primary "
                          onclick="openAssignSidebar()"
                        >
                          {" "}
                          <i
                            className="bi bi-person-check "
                            style={{ fontSize: "20px" }}
                          ></i>
                        </a>
                        <a
                          href="#"
                          className="btn btn-outline-primary"
                          onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
   ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
                        >
                          {" "}
                          <i
                            className="bi bi-pencil "
                            style={{ fontSize: "15px" }}
                          ></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- End Pricing Cards --> */}
            </div>
          </div>
        </div>

        <div
          className="modal fade"
          id="addPlanModal"
          tabindex="-1"
          aria-hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Add Plan</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control my-2"
                  placeholder="Enter Plan Name"
                />
                <textarea
                  className="form-control my-2"
                  rows="3"
                  placeholder="Enter Description"
                ></textarea>
                <input
                  type="number"
                  className="form-control my-2"
                  placeholder="Enter Price in ₹"
                />
                <div id="keyPointsContainer"></div>
                <button
                  className="btn btn-outline-primary btn-sm mt-2 submit"
                  id="addKeyPointBtn"
                >
                  Save plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Edit Plan Modal --> */}
        {/* <!-- Modal --> */}

        {/* <!-- Add this at the bottom of your HTML file --> */}

        {/* <!-- Assign Plan Modal --> */}
      </div>
      {/* Assign Plan Modal */}
      <div
        className="modal fade"
        id="assignPlanModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content p-3">
            <div className="modal-header">
              <h5 className="modal-title">Assign Plan to Users</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-3"
                id="userSearch"
                placeholder="Search by Name or Email..."
                onKeyUp={() => filterUsers()}
              />
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onClick={(e) => toggleAll(e.target)}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody id="userTableBody"></tbody>
              </table>
              <button className="btn btn-primary" onClick={assignPlan}>
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Plan Modal */}
      <div
        className="modal fade"
        id="editPlanModal"
        tabIndex="-1"
        aria-labelledby="editPlanModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form id="editPlanForm">
              <div className="modal-header">
                <h5 className="modal-title" id="editPlanModalLabel">
                  Edit Subscription Plan
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="planName" className="form-label">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="planName"
                    name="plan_name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="planPrice" className="form-label">
                    Price
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="planPrice"
                    name="price"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Key Points</label>
                  <div id="keyPointsContainer">
                    <input
                      type="text"
                      name="key_points[]"
                      className="form-control mb-2"
                      placeholder="Enter key point"
                    />
                  </div>
                  {/* <button type="button" className="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#editPlanModal" onClick={addKeyPoint}>Add Key Point</button> */}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// export default function page() {
//   return (
//     <div>
//       {" "}
//       <div className="content-wrapper">
//         {/* <!-- Content --> */}

//         <div className="container-xxl flex-grow-1 container-p-y">
//           <div className="card">
//             <div className="pb-sm-12 pb-2 rounded-top">
//               <div className="container py-12">
//                 <div
//                   className="ms-auto text-end"
//                   style={{ position: "relative" }}
//                 >
//                   <button
//                     id="openSidebarBtn"
//                     className="btn btn-primary"
//                     data-bs-toggle="modal"
//                     data-bs-target="#addPlanModal"
//                   >
//                     Add Plan
//                   </button>
//                 </div>
//               </div>

//               <div
//                 id="sidebar"
//                 className="bg-light"
//                 style={{
//                   position: "fixed",
//                   top: 0,
//                   right: "-400px",
//                   width: "350px",
//                   height: "100%",
//                   padding: "20px",
//                   transition: "right 0.3s ease",
//                   overflowY: "auto",
//                   zIndex: 999999999,
//                   // background: '#fff',
//                   // boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
//                 }}
//               >
//                 <h5 style={{ marginBottom: "20px" }}>Add New Plan</h5>

//                 {/* <!-- Plan Name --> */}
//                 <div style={{ marginBottom: "15px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       fontWeight: "600",
//                       marginBottom: "5px",
//                     }}
//                   >
//                     Plan Name
//                   </label>
//                   <input type="text" className="form-control" />
//                 </div>

//                 {/* <!-- Short Description --> */}
//                 <div style={{ marginBottom: "15px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       fontWeight: 600,
//                       marginBottom: "5px",
//                     }}
//                   >
//                     Short Description
//                   </label>
//                   <textarea className="form-control" rows="3"></textarea>
//                 </div>

//                 {/* <!-- Key Points --> */}
//                 <div style={{ marginBottom: "15px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       fontWeight: 600,
//                       marginBottom: "5px",
//                     }}
//                   >
//                     Key Points
//                   </label>
//                   <div id="keyPointsContainer">
//                     <input type="text" className="form-control" />
//                   </div>
//                   <button
//                     type="button"
//                     className="btn btn-sm btn-primary"
//                     onclick="addKeyPoint()"
//                   >
//                     Add Key Point
//                   </button>
//                 </div>

//                 {/* <!-- Price --> */}
//                 <div style={{ marginBottom: "15px" }}>
//                   <label
//                     style={{
//                       display: "block",
//                       fontWeight: 600,
//                       marginBottom: "5px",
//                     }}
//                   >
//                     Price
//                   </label>
//                   <input type="number" className="form-control" />
//                 </div>

//                 {/* <!-- Buttons --> */}
//                 <div
//                   style={{
//                     marginTop: "20px",
//                     display: "flex",
//                     justifyContent: "space-evenly",
//                   }}
//                 >
//                   <button
//                     type="button"
//                     id="savePlanBtn"
//                     className="btn btn-primary"
//                   >
//                     Save
//                   </button>
//                   <button
//                     type="button"
//                     id="closeSidebarBtn"
//                     className="btn btn-danger"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>

//               <h4 className="text-center mb-2" style={{ marginTop: "-7%" }}>
//                 Subscriptions Plans
//               </h4>
//               <p className="text-center mb-2">
//                 All plans include 40+ advanced tools and features to boost your
//                 product. Choose the best plan to fit your needs.
//               </p>

//               {/* <!-- Assign Plan Sidebar --> */}
//               <div
//                 id="assignPlanSidebar"
//                 className="bg-light"
//                 style={{
//                   position: "fixed",
//                   top: 0,
//                   right: "-400px",
//                   width: "350px",
//                   height: "100%",
//                   padding: "20px",
//                   overflowY: "auto",
//                   transition: "right 0.3s ease",
//                   zIndex: 99999,
//                 }}
//               >
//                 <h5 style={{ marginBottom: "15px" }}>Assign Plan to Users</h5>

//                 <input
//                   type="text"
//                   id="userSearch"
//                   placeholder="Search user..."
//                   className="form-control mb-3"
//                   onkeyup="filterUsers()"
//                 />

//                 <div
//                   style={{
//                     maxHeight: "300px",
//                     overflowY: "auto",
//                   }}
//                 >
//                   <table className="table table-bordered table-sm">
//                     <thead>
//                       <tr>
//                         <th>
//                           <input
//                             type="checkbox"
//                             id="selectAll"
//                             onclick="toggleAll(this)"
//                           />
//                         </th>
//                         <th style={{ fontSize: "12px" }}>Name</th>
//                         <th style={{ fontSize: "12px" }}>Email</th>
//                       </tr>
//                     </thead>
//                     <tbody id="userTableBody">
//                       {/* <!-- Users will be injected here --> */}
//                     </tbody>
//                   </table>
//                 </div>

//                 <button
//                   className="btn btn-primary mt-3 w-100"
//                   onclick="assignPlan()"
//                 >
//                   Assign Plan
//                 </button>
//                 <button
//                   className="btn btn-dark mt-2 w-100"
//                   onclick="closeAssignSidebar()"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               {/* <!-- Pricing Cards --> */}
//               <div className="pricing-plans row mx-4 gy-3 px-lg-12 mt-4">
//                 {/* <!-- Basic Plan --> */}
//                 <div className="col-lg mb-lg-0 mb-3">
//                   <div className="card border shadow-none">
//                     <div className="card-body pt-12">
//                       <div className="mt-3 mb-5 text-center">
//                         <img
//                           src="/assets/img/illustrations/pricing-basic.png"
//                           alt="Basic Image"
//                           height="100"
//                         />
//                       </div>
//                       <h4 className="card-title text-center text-capitalize mb-2">
//                         The Free Plan
//                       </h4>
//                       <p className="text-center mb-5">
//                         A simple start for everyone
//                       </p>
//                       <div className="text-center"></div>
//                       <ul className="list-group ps-6 my-5 pt-4">
//                         <li className="mb-4">100 responses a month</li>
//                         <li className="mb-4">Unlimited forms and surveys</li>
//                         <li className="mb-4">Unlimited fields</li>
//                         <li className="mb-4">Basic form creation tools</li>
//                         <li className="mb-0">Up to 2 subdomains</li>
//                       </ul>
//                       <div className="d-flex justify-content-center gap-1 mt-3">
//                         <a
//                           href="#"
//                           className="btn btn-primary btn-small"
//                           onclick="openAssignSidebar()"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-person-check"
//                             style={{ fontSize: "20px" }}
//                           ></i>
//                         </a>
//                         <a
//                           href="#"
//                           className="btn btn-outline-primary "
//                           onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
//    ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-pencil "
//                             style={{ fontSize: "15px" }}
//                           ></i>
//                         </a>
//                       </div>

//                       <div
//                         id="editPlanSidebar"
//                         className="bg-light"
//                         style={{
//                           position: "fixed",
//                           top: 0,
//                           right: "-400px",
//                           width: "350px",
//                           height: "100%",
//                           padding: "20px",
//                           overflowY: "auto",
//                           transition: "right 0.3s ease",
//                           zIndex: 99999,
//                           // background: '#fff',
//                           // boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
//                         }}
//                       >
//                         <h5 style={{ marginBottom: "15px" }}>Edit Plan</h5>

//                         <label>Plan Name</label>
//                         <input
//                           type="text"
//                           id="editPlanName"
//                           className="form-control my-2"
//                         />

//                         <label>Short Description</label>
//                         <textarea
//                           id="editPlanDesc"
//                           className="form-control my-2"
//                         ></textarea>

//                         <label>Key Points</label>
//                         <div
//                           id="editKeyPoints"
//                           style={{ marginBottom: "10px" }}
//                         ></div>
//                         <button
//                           onclick="addKeyPointInput()"
//                           style={{ marginBottom: "10px" }}
//                           className="btn btn-outline-dark"
//                         >
//                           + Add Point
//                         </button>

//                         <label>Price</label>
//                         <input
//                           type="number"
//                           id="editPlanPrice"
//                           className="form-control my-2"
//                         />

//                         <button
//                           onclick="saveEditedPlan()"
//                           className="btn btn-primary"
//                         >
//                           Save
//                         </button>
//                         <button
//                           onclick="closeEditSidebar()"
//                           style={{ marginLeft: "10px" }}
//                           className="btn btn-dark"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-lg mb-lg-0 mb-3">
//                   <div className="card border shadow-none">
//                     <div className="card-body pt-12">
//                       <div className="mt-3 mb-5 text-center">
//                         <img
//                           src="/assets/img/illustrations/pricing-standard.png"
//                           alt="Basic Image"
//                           height="100"
//                         />
//                       </div>
//                       <h4 className="card-title text-center text-capitalize mb-2">
//                         The Flow Plan
//                       </h4>
//                       <p className="text-center mb-5">
//                         A simple start for everyone
//                       </p>
//                       <div className="text-center"></div>
//                       <ul className="list-group ps-6 my-5 pt-4">
//                         <li className="mb-4">100 responses a month</li>
//                         <li className="mb-4">Unlimited forms and surveys</li>
//                         <li className="mb-4">Unlimited fields</li>
//                         <li className="mb-4">Basic form creation tools</li>
//                         <li className="mb-0">Up to 2 subdomains</li>
//                       </ul>
//                       <div className="d-flex justify-content-center gap-1 mt-3">
//                         <a
//                           href="#"
//                           className="btn btn-primary "
//                           onclick="openAssignSidebar()"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-person-check "
//                             style={{ fontSize: "20px" }}
//                           ></i>
//                         </a>
//                         <a
//                           href="#"
//                           className="btn btn-outline-primary"
//                           onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
//    ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-pencil "
//                             style={{ fontSize: "15px" }}
//                           ></i>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 {/* <!-- Enterprise Plan --> */}
//                 <div className="col-lg">
//                   <div className="card border shadow-none">
//                     <div className="card-body pt-12">
//                       <div className="mt-3 mb-5 text-center">
//                         <img
//                           src="/assets/img/illustrations/pricing-enterprise.png"
//                           alt="Enterprise Image"
//                           height="100"
//                         />
//                       </div>
//                       <h4 className="card-title text-center text-capitalize mb-2">
//                         The Diva Plan
//                       </h4>
//                       <p className="text-center mb-5">
//                         Solution for big organizations
//                       </p>
//                       <div className="text-center"></div>
//                       <ul className="list-group ps-6 my-5 pt-4">
//                         <li className="mb-4">PayPal payments</li>
//                         <li className="mb-4">Logic Jumps</li>
//                         <li className="mb-4">File upload with 5GB storage</li>
//                         <li className="mb-4">Custom domain support</li>
//                         <li className="mb-0">Stripe integration</li>
//                       </ul>
//                       <div className="d-flex justify-content-center gap-1 mt-3">
//                         <a
//                           href="#"
//                           className="btn btn-primary "
//                           onclick="openAssignSidebar()"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-person-check "
//                             style={{ fontSize: "20px" }}
//                           ></i>
//                         </a>
//                         <a
//                           href="#"
//                           className="btn btn-outline-primary"
//                           onclick="openEditPlanSidebar('The Free Plan', 'A simple start for everyone', 
//    ['100 responses a month','Unlimited forms and surveys','Unlimited fields','Basic form creation tools','Up to 2 subdomains'], '0')"
//                         >
//                           {" "}
//                           <i
//                             className="bi bi-pencil "
//                             style={{ fontSize: "15px" }}
//                           ></i>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {/* <!-- End Pricing Cards --> */}
//             </div>
//           </div>
//         </div>

//         <div
//           className="modal fade"
//           id="addPlanModal"
//           tabindex="-1"
//           aria-hidden="true"
//           data-bs-backdrop="static"
//           data-bs-keyboard="false"
//         >
//           <div className="modal-dialog modal-dialog-scrollable">
//             <div className="modal-content p-3">
//               <div className="modal-header">
//                 <h5 className="modal-title">Add Plan</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   data-bs-dismiss="modal"
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <input
//                   type="text"
//                   className="form-control my-2"
//                   placeholder="Enter Plan Name"
//                 />
//                 <textarea
//                   className="form-control my-2"
//                   rows="3"
//                   placeholder="Enter Description"
//                 ></textarea>
//                 <input
//                   type="number"
//                   className="form-control my-2"
//                   placeholder="Enter Price in ₹"
//                 />
//                 <div id="keyPointsContainer"></div>
//                 <button
//                   className="btn btn-outline-primary btn-sm mt-2 submit"
//                   id="addKeyPointBtn"
//                 >
//                   Save plan
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* <!-- Edit Plan Modal --> */}
//         {/* <!-- Modal --> */}

//         {/* <!-- Add this at the bottom of your HTML file --> */}

//         {/* <!-- Assign Plan Modal --> */}
//       </div>
//       {/* Assign Plan Modal */}
//       <div
//         className="modal fade"
//         id="assignPlanModal"
//         tabIndex="-1"
//         aria-hidden="true"
//         data-bs-backdrop="static"
//         data-bs-keyboard="false"
//       >
//         <div className="modal-dialog modal-lg modal-dialog-scrollable">
//           <div className="modal-content p-3">
//             <div className="modal-header">
//               <h5 className="modal-title">Assign Plan to Users</h5>
//               <button
//                 type="button"
//                 className="btn-close"
//                 data-bs-dismiss="modal"
//               ></button>
//             </div>
//             <div className="modal-body">
//               <input
//                 type="text"
//                 className="form-control mb-3"
//                 id="userSearch"
//                 placeholder="Search by Name or Email..."
//                 onKeyUp={() => filterUsers()}
//               />
//               <table className="table table-bordered table-sm">
//                 <thead>
//                   <tr>
//                     <th>
//                       <input
//                         type="checkbox"
//                         onClick={(e) => toggleAll(e.target)}
//                       />
//                     </th>
//                     <th>Name</th>
//                     <th>Email</th>
//                   </tr>
//                 </thead>
//                 <tbody id="userTableBody"></tbody>
//               </table>
//               <button className="btn btn-primary" onClick={assignPlan}>
//                 Assign Selected
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Edit Plan Modal */}
//       <div
//         className="modal fade"
//         id="editPlanModal"
//         tabIndex="-1"
//         aria-labelledby="editPlanModalLabel"
//         aria-hidden="true"
//       >
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <form id="editPlanForm">
//               <div className="modal-header">
//                 <h5 className="modal-title" id="editPlanModalLabel">
//                   Edit Subscription Plan
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   data-bs-dismiss="modal"
//                   aria-label="Close"
//                 ></button>
//               </div>

//               <div className="modal-body">
//                 <div className="mb-3">
//                   <label htmlFor="planName" className="form-label">
//                     Plan Name
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     id="planName"
//                     name="plan_name"
//                     required
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label htmlFor="planPrice" className="form-label">
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     id="planPrice"
//                     name="price"
//                     required
//                   />
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label">Key Points</label>
//                   <div id="keyPointsContainer">
//                     <input
//                       type="text"
//                       name="key_points[]"
//                       className="form-control mb-2"
//                       placeholder="Enter key point"
//                     />
//                   </div>
//                   {/* <button type="button" className="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#editPlanModal" onClick={addKeyPoint}>Add Key Point</button> */}
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   data-bs-dismiss="modal"
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-success">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
