"use client";
// import React from "react";
import React, { useRef, useState, useEffect } from "react";

export default function Page() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editFeatures, setEditFeatures] = useState([""]);

  const [newPlan, setNewPlan] = useState({
    title: "",
    price: "",
    features: [""],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    fetch("https://flow108.coinagesoft.com/api/admin/AdminPlan")
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error("Error fetching plans:", err));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    const payload = {
      title: newPlan.title,
      price: newPlan.price,
      planDate: new Date().toISOString(),
      features: newPlan.features.map((text) => ({ featureText: text })),
    };

    try {
      const res = await fetch("https://flow108.coinagesoft.com/api/admin/AdminPlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add plan");

      window.bootstrap.Modal.getInstance(
        document.getElementById("addPlanModal")
      ).hide();

      setNewPlan({ title: "", price: "", features: [""] });
      fetchPlans();
      showToast("Plan added successfully!");
    } catch (error) {
      console.error("Error adding plan:", error.message);
      alert("Failed to add plan.");
      showToast("Failed to add plan.", false);
    }
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...newPlan.features];
    updated[index] = value;
    setNewPlan({ ...newPlan, features: updated });
  };

  const addFeatureInput = () => {
    setNewPlan({ ...newPlan, features: [...newPlan.features, ""] });
  };

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setEditTitle(plan.title);
    setEditPrice(plan.price);
    setEditFeatures((plan.features || []).map((f) => f.featureText));
    const modal = new window.bootstrap.Modal(
      document.getElementById("editPlanModal")
    );
    modal.show();
  };

  const handleEditFeatureChange = (index, value) => {
    const updated = [...editFeatures];
    updated[index] = value;
    setEditFeatures(updated);
  };

  const addEditFeatureInput = () => {
    setEditFeatures([...editFeatures, ""]);
  };

  const saveEditedPlan = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const payload = {
      title: editTitle,
      price: editPrice,
      planDate: new Date().toISOString(),
      features: editFeatures.map((text) => ({ featureText: text })),
    };

    try {
      const res = await fetch(
        `http://4.213.95.138/api/admin/AdminPlan/${selectedPlan.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      window.bootstrap.Modal.getInstance(
        document.getElementById("editPlanModal")
      ).hide();

      setSelectedPlan(null);
      setEditTitle("");
      setEditPrice("");
      setEditFeatures([""]);

      fetchPlans();
      showToast("Plan updated successfully!");
    } catch (err) {
      console.error("Update error:", err.message);
      alert("Failed to update the plan.");
      showToast("Failed to update plan.", false);
    }
  };
  const showToast = (message, isSuccess = true) => {
    const toastEl = document.getElementById("liveToast");
    const toastBody = document.getElementById("toastBody");

    if (toastEl && toastBody) {
      toastBody.innerText = message;
      toastEl.classList.remove("bg-success", "bg-danger");
      toastEl.classList.add(isSuccess ? "bg-success" : "bg-danger");

      const bsToast = new window.bootstrap.Toast(toastEl);
      bsToast.show();
    }
  };
  const handleDeleteClick = async (planId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plan?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://4.213.95.138/api/admin/AdminPlan/${planId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      showToast("Plan deleted successfully!");
      fetchPlans();
    } catch (err) {
      console.error("Delete error:", err.message);
      showToast("Failed to delete the plan.", false);
    }
  };

  return (
    <div>
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div
          id="liveToast"
          className="toast align-items-center text-white bg-success border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body" id="toastBody">
              Success!
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>{" "}
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
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#addPlanModal"
                  >
                    Add Plan
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

              {/* <!-- Pricing Cards --> */}
              <div className="pricing-plans row mx-4 gy-3 px-lg-12 mt-4">
                {/* <!-- Basic Plan --> */}
                {plans.map((plan) => (
                  <div className="col-12 col-md-6 col-lg-4 mb-4" key={plan.id}>
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
                          {plan.title}
                        </h4>
                        <p
                          className="text-center mb-5"
                          style={{ fontWeight: "bold", fontSize: "20px" }}
                        >
                          ₹ {plan.price}
                        </p>
                        <div className="text-center"></div>
                        <ul className="list-group ps-6 my-5 pt-4">
                          {(plan.features || []).map((f, i) => (
                            <li key={i} className="mb-4">
                              {f.featureText || "-"}
                            </li>
                          ))}
                        </ul>
                        <div className="d-flex justify-content-center gap-1 mt-3">
                          <a
                            href="#"
                            className="btn btn-primary btn-small"
                            onClick={() => console.log("Assign clicked")}
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
                            onClick={() => handleEditClick(plan)}
                          >
                            {" "}
                            <i
                              className="bi bi-pencil "
                              style={{ fontSize: "15px" }}
                            ></i>
                          </a>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteClick(plan.id)}
                          >
                            <i
                              className="bi bi-trash"
                              style={{ fontSize: "15px" }}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* <!-- End Pricing Cards --> */}
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="addPlanModal"
          tabIndex="-1"
          aria-labelledby="addPlanModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddPlan}>
                <div className="modal-header">
                  <h5 className="modal-title" id="addPlanModalLabel">
                    Add New Plan
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Plan Title"
                    value={newPlan.title}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, title: e.target.value })
                    }
                    required
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Price"
                    value={newPlan.price}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, price: e.target.value })
                    }
                    required
                  />
                  {newPlan.features.map((feature, index) => (
                    <input
                      key={index}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      required
                    />
                  ))}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={addFeatureInput}
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    Save Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Assign Plan Modal */}
      {/* <div
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
      </div> */}
      {/* Edit Plan Modal */}
      <div
        className="modal fade"
        id="editPlanModal"
        tabIndex="-1"
        aria-labelledby="editPlanModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={saveEditedPlan}>
            <div className="modal-header">
              <h5 className="modal-title" id="editPlanModalLabel">
                Edit Plan
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Plan Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Price"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
              {editFeatures.map((feature, index) => (
                <input
                  key={index}
                  type="text"
                  className="form-control mb-2"
                  placeholder={`Feature ${index + 1}`}
                  value={feature}
                  onChange={(e) =>
                    handleEditFeatureChange(index, e.target.value)
                  }
                  required
                />
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={addEditFeatureInput}
              >
                + Add Point
              </button>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
