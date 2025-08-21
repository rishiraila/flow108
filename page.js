"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
  const [search, setSearch] = useState("");
   const [formData, setFormData] = useState({
    name: '',
    duration: '',
    description: '',
    meals: {
      Breakfast: false,
      Lunch: false,
      Dinner: false,
      Snacks: false,
    },
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckboxChange = (meal) => {
    setFormData((prev) => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: !prev.meals[meal],
      },
    }));
  };
    const handleSubmit = (e) => {
    e.preventDefault();
    const selectedMeals = Object.keys(formData.meals).filter((key) => formData.meals[key]);
    const newPlan = {
      ...formData,
      meals: selectedMeals,
    };
    console.log('Creating Plan:', newPlan);
    
  };

  const dietPlans = [
    {
      id: 1,
      name: "Weight Loss Plan",
      duration: "1 Month",
      description: "All reviews are from genuine customers",
      meals: ["Breakfast", "Lunch"],
      stats: [
        { label: "Carbs", value: 61.5, cal: "124 Cal" },
        { label: "Proteins", value: 24, cal: "40 Cal" },
        { label: "Nutrition", value: 12, cal: "12 Cal" },
        { label: "Vitamins", value: 7, cal: "7 Cal" },
        { label: "Fats", value: 2, cal: "2 Cal" },
      ],
    },
    {
      id: 2,
      name: "Weight Gain Plan",
      duration: "1.5 Month",
      description: "All reviews are from genuine customers",
      meals: ["Evening Snacks", "Dinner"],
      stats: [
        { label: "Carbs", value: 61.5, cal: "124 Cal" },
        { label: "Proteins", value: 24, cal: "40 Cal" },
        { label: "Nutrition", value: 12, cal: "12 Cal" },
        { label: "Vitamins", value: 7, cal: "7 Cal" },
        { label: "Fats", value: 2, cal: "2 Cal" },
      ],
    },
    {
      id: 3,
      name: "KETO Plan",
      duration: "1.5 Month",
      description: "All reviews are from genuine customers",
      meals: ["Breakfast", "Lunch", "Evening Snacks", "Dinner"],
      stats: [
        { label: "Carbs", value: 61.5, cal: "124 Cal" },
        { label: "Proteins", value: 24, cal: "40 Cal" },
        { label: "Nutrition", value: 12, cal: "12 Cal" },
        { label: "Vitamins", value: 7, cal: "7 Cal" },
        { label: "Fats", value: 2, cal: "2 Cal" },
      ],
    },
  ];

  const filteredPlans = dietPlans.filter((plan) =>
    plan.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-6 g-6">
          {/* Dashboard Cards */}
          {[
            {
              title: "User Registered",
              count: 42,
              trend: "+18.2%",
              color: "primary",
              icon: "ri-user-add-line",
            },
            {
              title: "Paid Members",
              count: 8,
              trend: "-8.7%",
              color: "warning",
              icon: "ri-user-star-line",
            },
            {
              title: "Total Questions",
              count: 27,
              trend: "+4.3%",
              color: "danger",
              icon: "ri-group-line",
            },
            {
              title: "Total Posts",
              count: 13,
              trend: "-2.5%",
              color: "info",
              icon: "ri-article-line",
            },
          ].map((stat, index) => (
            <div key={index} className="col-6 col-sm-6 col-lg-3 mb-2">
              <div className={`card card-border-shadow-${stat.color} h-100`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span
                        className={`avatar-initial rounded-3 bg-label-${stat.color}`}
                      >
                        <i className={`tf-icons ${stat.icon} ri-24px`}></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stat.count}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">{stat.title}</h6>
                  <p className="mb-0">
                    <span className="me-1 fw-medium">{stat.trend}</span>
                    <small className="text-muted">than last week</small>
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="col-md-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0">Diet Plans</h5>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search plans..."
                  style={{ maxWidth: 250, fontSize: 14 }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="card-body">
                <div className="row">
                  {filteredPlans.map((plan) => (
                    <div className="card h-100 my-2" key={plan.id}>
                      <div className="card-body row widget-separator">
                        <div className="col-sm-5 border-end">
                          <h6 className="mb-2">{plan.name}</h6>
                          <p className="mb-2">Duration : {plan.duration}</p>
                          <p className="mb-2">{plan.description}</p>
                          {plan.meals.map((meal) => (
                            <span
                              key={meal}
                              className="badge bg-label-primary rounded-pill me-2 mb-2"
                            >
                              {meal}
                            </span>
                          ))}
                          <p className="my-2 d-flex align-items-center gap-2">
                            <Link href="/Recipies">Recipies</Link>
                            <Link
                              href="/Dietdetails"
                              className="btn btn-sm btn-outline-primary"
                            >
                              View Plan
                            </Link>
                          </p>
                          <hr className="d-sm-none" />
                        </div>
                        <div className="col-sm-7 g-2 text-nowrap d-flex flex-column justify-content-between px-6 gap-3">
                          {plan.stats.map((stat) => (
                            <div
                              className="d-flex align-items-center gap-2"
                              key={stat.label}
                            >
                              <small style={{ width: 80 }}>{stat.label}</small>
                              <div
                                className="progress w-100 rounded-pill"
                                style={{ height: 8 }}
                              >
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${stat.value}%` }}
                                  aria-valuenow={stat.value}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <small className="w-px-20 text-end">
                                {stat.cal}
                              </small>
                            </div>
                          ))}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <button className="btn btn-outline-primary btn-small">
                              <i
                                className="bi bi-person-check"
                                style={{ fontSize: 20 }}
                              ></i>
                            </button>
                            <button className="btn btn-outline-primary">
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger delete-btn"
                              title="Delete"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Add New Diet Plan</h5>
              </div>
              <div className="card-body" style={{ fontSize: "14px" }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter plan name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="duration" className="form-label">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="duration"
                      placeholder="e.g. 1 Month"
                      required
                      value={formData.duration}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      placeholder="Add a brief description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meals Included</label>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {Object.keys(formData.meals).map((meal) => (
                        <div key={meal}>
                          <input
                            type="checkbox"
                            id={`meal-${meal}`}
                            checked={formData.meals[meal]}
                            onChange={() => handleCheckboxChange(meal)}
                          />
                          <label htmlFor={`meal-${meal}`} className="ms-1">
                            {meal}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Create Plan
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Add components like Diet Plan List, Form, Modals here */}
          {/* Due to length, we can modularize into smaller components if needed */}
        </div>
      </div>

      <footer className="content-footer footer bg-footer-theme">
        <div className="container-xxl">
          <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
            <div className="text-body mb-2 mb-md-0">
              © {new Date().getFullYear()}, made with{" "}
              <span className="text-danger">
                <i className="tf-icons ri-heart-fill"></i>
              </span>{" "}
              by
              <Link
                href="https://www.coinagesoft.com/"
                target="_blank"
                className="footer-link"
              >
                {" "}
                Coinage.in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
