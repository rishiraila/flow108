"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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
    isActive: false, 
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    fetch("https://flow108.coinagesoft.com/api/admin/plans")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);
        setPlans(data);
      })
      .catch((err) => console.error("Error fetching plans:", err));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
   const payload = {
  title: newPlan.title,
  price: newPlan.price,
  planDate: new Date().toISOString(),
  isActive: newPlan.isActive, 
  features: newPlan.features.map((text) => ({ featureText: text })),
};

    try {
      const res = await fetch(
        "https://flow108.coinagesoft.com/api/admin/plans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to add plan");

      window.bootstrap.Modal.getInstance(
        document.getElementById("addPlanModal")
      ).hide();

      setNewPlan({ title: "", price: "", features: [""] });
      fetchPlans();
      showToast("Plan added successfully!");
    } catch (error) {
      console.error("Error adding plan:", error.message);
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
    setEditTitle(plan.Title); // <-- FIX
    setEditPrice(plan.Price); // <-- FIX
    setEditFeatures((plan.Features || []).map((f) => f.FeatureText)); // <-- FIX
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
        `https://flow108.coinagesoft.com/api/UserPlans/${selectedPlan.Id}`, // ✅ FIXED HERE
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} ${errorText}`);
      }

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
        `https://flow108.coinagesoft.com/api/admin/plans/${planId}`,
        {
          method: "DELETE",
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
      {/* Toast */}
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
      </div>

      <div className="content-wrapper">
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

              {/* Plan Cards */}
              <div className="pricing-plans row mx-4 gy-3 px-lg-12 mt-4">
                {plans.map((plan) => (
                  <div key={plan.Id} className="col-12 col-md-6 col-lg-4 mb-4">
                    <div className="card border shadow-none">
                      <div className="card-body pt-12">
                        <div className="mt-3 mb-5 text-center">
                          <Image
                            src="/assets/img/illustrations/pricing-basic.png"
                            alt="Basic Image"
                            width={100} // required
                            height={100} // required
                            style={{ objectFit: "contain" }} // optional
                          />
                        </div>

                        {/* ✅ FIX: use plan.Title */}
                        <h4 className="card-title text-center text-capitalize mb-2">
                          {plan.Title}
                        </h4>

                        {/* ✅ FIX: use plan.Price */}
                        <p
                          className="text-center mb-5"
                          style={{ fontWeight: "bold", fontSize: "20px" }}
                        >
                          ₹ {plan.Price}
                        </p>

                        {/* ✅ FIX: use plan.Features and f.FeatureText */}
                        <ul className="list-group ps-6 my-5 pt-4">
                          {(plan.Features || []).map((f, i) => (
                            <li key={f.Id || i} className="mb-4">
                              {f.FeatureText || "-"}
                            </li>
                          ))}
                        </ul>

                        <div className="d-flex justify-content-center gap-1 mt-3">
                          <a href="#" className="btn btn-primary btn-small">
                            <i
                              className="bi bi-person-check"
                              style={{ fontSize: "20px" }}
                            ></i>
                          </a>
                          <a
                            href="#"
                            className="btn btn-outline-primary"
                            onClick={() => handleEditClick(plan)}
                          >
                            <i
                              className="bi bi-pencil"
                              style={{ fontSize: "15px" }}
                            ></i>
                          </a>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteClick(plan.Id)}
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

              {/* Add Plan Modal */}
              <div
                className="modal fade"
                id="addPlanModal"
                tabIndex="-1"
                aria-hidden="true"
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <form onSubmit={handleAddPlan}>
                      <div className="modal-header">
                        <h5 className="modal-title">Add New Plan</h5>
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
                          value={newPlan.title || ""}
                          onChange={(e) =>
                            setNewPlan({ ...newPlan, title: e.target.value })
                          }
                          required
                        />
                        <input
                          type="number"
                          className="form-control mb-2"
                          placeholder="Price"
                          value={newPlan.price || ""}
                          onChange={(e) =>
                            setNewPlan({ ...newPlan, price: e.target.value })
                          }
                          required
                        />
                        {newPlan.features.map((feature, index) => (
                          <input
                            key={`new-feature-${index}`}
                            type="text"
                            className="form-control mb-2"
                            placeholder={`Feature ${index + 1}`}
                            value={feature || ""}
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
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="isActiveCheckbox"
                            checked={newPlan.isActive}
                            onChange={(e) =>
                              setNewPlan({
                                ...newPlan,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="isActiveCheckbox"
                          >
                            Is Active?
                          </label>
                        </div>
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

              {/* Edit Plan Modal */}
              <div
                className="modal fade"
                id="editPlanModal"
                tabIndex="-1"
                aria-hidden="true"
              >
                <div className="modal-dialog">
                  <form className="modal-content" onSubmit={saveEditedPlan}>
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Plan</h5>
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
                        value={editTitle || ""}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                      <input
                        type="number"
                        className="form-control mb-2"
                        placeholder="Price"
                        value={editPrice || ""}
                        onChange={(e) => setEditPrice(e.target.value)}
                        required
                      />
                      {editFeatures.map((feature, index) => (
                        <input
                          key={`edit-feature-${index}`}
                          type="text"
                          className="form-control mb-2"
                          placeholder={`Feature ${index + 1}`}
                          value={feature || ""}
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
              {/* End Edit Plan Modal */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
