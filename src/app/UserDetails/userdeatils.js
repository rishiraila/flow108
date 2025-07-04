"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function UserDetailsClient() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [weightData, setWeightData] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [estimatedDate, setEstimatedDate] = useState(null);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(periodData.length / itemsPerPage);
  const paginatedData = periodData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [weightPage, setWeightPage] = useState(1);
  const weightPerPage = 5;
  const totalWeightPages = Math.ceil(weightData.length / weightPerPage);
  const paginatedWeightData = weightData.slice(
    (weightPage - 1) * weightPerPage,
    weightPage * weightPerPage
  );

  const activityByDate = activityData.reduce((acc, item) => {
    const date = new Date(item.Date).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(...item.Entries);
    return acc;
  }, {});
  const markersByDate = useMemo(() => {
    const map = {};
    for (const item of activityData) {
      const date = new Date(item.Date).toISOString().split("T")[0];
      if (!map[date]) {
        map[date] = {
          diet: false,
          exercise: false,
          period: false,
          estimate: false,
          entries: [],
        };
      }
      for (const entry of item.Entries) {
        if (/diet/i.test(entry.Title) && /breached/i.test(entry.Title))
          map[date].diet = true;

        if (/exercise|workout/i.test(entry.Title)) map[date].exercise = true;
        if (/period/i.test(entry.Title) && !/estimate/i.test(entry.Title))
          map[date].period = true;
        if (/estimated period/i.test(entry.Title)) map[date].estimate = true;
        map[date].entries.push(entry);
      }
    }
    return map;
  }, [activityData]);

  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split("T")[0];
    const marker = markersByDate[dateStr];
    const isEstimated =
      estimatedDate && dateStr === estimatedDate.toISOString().split("T")[0];

    if (!marker && !isEstimated) return null;

    return (
      <div className="d-flex flex-column align-items-center ">
        <div className="d-flex ">
          {marker?.diet && (
            <img
              src="/dietfollow.svg"
              alt="Diet Breached"
              width={10}
              height={10}
            />
          )}
          {marker?.exercise && (
            <img src="/Exercised.svg" alt="Exercise" width={10} height={10} />
          )}
        </div>

        {/* For actual period */}
        {marker?.period && (
          <img
            src="/perioddate.svg"
            alt="Period"
            width={20}
            height={20}
            className=""
          />
        )}

        {/* For estimated period */}
        {isEstimated && (
          <img
            src="/estimateperioddate.svg"
            alt="Estimated Period"
            width={20}
            height={20}
            className=""
          />
        )}
      </div>
    );
  };

  useEffect(() => {
    if (userId) {
      fetchProfileData(userId);
      fetchPeriodData(userId);
      fetchWeightData(userId);
      fetchActivityData(userId);
    }
  }, [userId]);

  const fetchProfileData = async (uid) => {
    try {
      const res = await fetch(
        "https://flow108.coinagesoft.com/api/admin/AdminOnBoarding/users"
      );
      const allUsers = await res.json();
      const profile = allUsers.find((user) => user.UserId === uid);
      setProfileData(profile || null);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  const fetchActivityData = async (uid) => {
    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/user/activity/report?userId=${uid}`
      );
      const data = await res.json();
      setActivityData(data.Events || []);
      // Don't use data.EstimatedNextPeriodDate
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };
  useEffect(() => {
    if (activityData.length > 0) {
      // Flatten all entries with their dates
      const allPeriodLogs = activityData
        .flatMap((event) =>
          event.Entries.map((entry) => ({
            date: new Date(event.Date),
            title: entry.Title,
          }))
        )
        .filter((log) => /period logged/i.test(log.title));

      // Sort by date descending
      const sorted = allPeriodLogs.sort((a, b) => b.date - a.date);

      if (sorted.length > 0) {
        const lastPeriodDate = sorted[0].date;
        const estimated = new Date(lastPeriodDate);
        estimated.setDate(estimated.getDate() + 28); // add 28 days
        setEstimatedDate(estimated);
      }
    }
  }, [activityData]);

  const fetchWeightData = async (uid) => {
    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/admin-activity/weight/${uid}`
      );
      const data = await res.json();
      setWeightData(data);
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };

  const fetchPeriodData = async (uid) => {
    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/admin-activity/period/${uid}`
      );
      const data = await res.json();
      setPeriodData(data);
    } catch (error) {
      console.error("Error fetching period data:", error);
    }
  };

  const calculateDuration = (startDateStr) => {
    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const approxCycleDuration = 28;

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row g-6 mb-6">
        {/* <div className="col-6 col-sm-6 col-lg-3 mb-2">
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
              <h6 className="mb-0 fw-normal">Period Insight </h6>
              <p className="mb-0">
                <small className="text-muted">
                  Current cycle duration in days{" "}
                </small>
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
              <h6 className="mb-0 fw-normal">Weight Insight</h6>
              <p className="mb-0">
                <small className="text-muted">Weight today at 31.8 BMI</small>
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
              <h6 className="mb-0 fw-normal">Exercise Progress</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+4.3%</span>
                <small className="text-muted">
                  {" "}
                  completed workout sessions
                </small>
              </p>
            </div>
          </div>
        </div> */}
        {/* <div className="col-6 col-sm-6 col-lg-3 mb-2">
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
              <h6 className="mb-0 fw-normal">Diet Breach</h6>
              <p className="mb-0">

                <small className="text-muted">
                  total number of days diet followed
                </small>
              </p>
            </div>
          </div>
        </div> */}
      </div>
      {profileData && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header  text-white rounded-top">
            <h5 className="mb-0">
              <i className="bi bi-person-badge me-2"></i>User Profile
              Information
            </h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4 mb-2">
                <strong>Email:</strong>
                <p className="mb-0 text-muted">{profileData.Email}</p>
              </div>
              <div className="col-md-4 mb-2">
                <strong>Date of Birth:</strong>
                <p className="mb-0 text-muted">
                  {new Date(profileData.Stage1?.DateOfBirth).toLocaleDateString(
                    "en-GB"
                  )}
                </p>
              </div>
              <div className="col-md-4 mb-2">
                <strong>Height:</strong>
                <p className="mb-0 text-muted">
                  {profileData.Stage1?.HeightCm} cm
                </p>
              </div>
            </div>

            <hr />

            <div className="row mb-3">
              <div className="col-md-4 mb-2">
                <strong>Initial Weight:</strong>
                <p className="mb-0 text-muted">
                  {profileData.Stage1?.WeightKg} kg
                </p>
              </div>
              <div className="col-md-4 mb-2">
                <strong>Last Period Date:</strong>
                <p className="mb-0 text-muted">
                  {new Date(
                    profileData.Stage2?.LastPeriodDate
                  ).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div className="col-md-4 mb-2">
                <strong>Cycle Duration:</strong>
                <p className="mb-0 text-muted">
                  {profileData.Stage2?.CycleDurationDays} days
                </p>
              </div>
            </div>

            <hr />

            <div className="row mb-3">
              <div className="col-md-4 mb-2">
                <strong>Period Length:</strong>
                <p className="mb-0 text-muted">
                  {profileData.Stage2?.PeriodDurationDays} days
                </p>
              </div>
              <div className="col-md-4 mb-2">
                <strong>Severity:</strong>
                <ul className="mb-0 list-unstyled">
                  {profileData.Stage2?.Severity?.map((s, i) => (
                    <li key={i} className="mb-1">
                      <span className="badge bg-danger">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-md-4 mb-2">
                <strong>Goals:</strong>
                <div>
                  {profileData.Stage3?.Goal?.map((goal, i) => (
                    <span key={i} className="">
                      <li key={i}>{goal}</li>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <hr />

            <div className="d-flex gap-3">
              <div>
                <strong>Stage 1:</strong>{" "}
                <span
                  className={`badge ${
                    profileData.Stage1Completed ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {profileData.Stage1Completed ? "Completed" : "Pending"}
                </span>
              </div>
              <div>
                <strong>Stage 2:</strong>{" "}
                <span
                  className={`badge ${
                    profileData.Stage2Completed ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {profileData.Stage2Completed ? "Completed" : "Pending"}
                </span>
              </div>
              <div>
                <strong>Stage 3:</strong>{" "}
                <span
                  className={`badge ${
                    profileData.Stage3Completed ? "bg-success" : "bg-secondary"
                  }`}
                >
                  {profileData.Stage3Completed ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4 mt-4 align-items-start mb-4">
        {/* 📅 Calendar on Left */}
        <div className="col-lg-6">
          <div className="card p-4 shadow-sm border rounded-4">
            <h5 className="mb-3">Activity Calendar</h5>
            <Calendar
              onClickDay={(value) => setSelectedDate(value)}
              tileContent={tileContent}
              calendarType="gregory"
              className="custom-calendar w-100 rounded border p-2"
              value={selectedDate} // Highlight the selected date
            />

            <hr className="my-3" />
            <h6 className="mb-2">Icon Legends:</h6>
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <img src="/dietfollow.svg" alt="Diet" width={12} height={12} />
                <span className="text-muted small">Diet Followed</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/Exercised.svg"
                  alt="Exercise"
                  width={12}
                  height={12}
                />
                <span className="text-muted small">Exercise Done</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/perioddate.svg"
                  alt="Period"
                  width={14}
                  height={14}
                />
                <span className="text-muted small">Period/Estimate</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/estimateperioddate.svg"
                  alt="Estimated"
                  width={14}
                  height={14}
                />
                <span className="text-muted small">Estimated Period Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📘 Diary Modal on Right */}
        <div className="col-lg-6 position-relative">
          <div className="card border-0 shadow-lg rounded-4 p-4 bg-white h-100 position-relative">
            {selectedDate ? (
              <>
                {/* Close Button */}
                <button
                  className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 mt-3 me-3 rounded-circle"
                  style={{ width: "32px", height: "32px", zIndex: 10 }}
                  onClick={() => setSelectedDate(null)}
                >
                  &times;
                </button>

                {/* Header */}
                <div className="mb-4 pb-3 border-bottom">
                  <h4 className="fw-bold text-primary mb-1 ">
                    Diary – {selectedDate.toLocaleDateString("en-GB")}
                  </h4>
                  <p className="text-muted small mb-0">
                    Activity summary for the day
                  </p>
                </div>

                {/* Activity Log */}
                <h6 className="fw-bold text-secondary mb-3">Activity Log</h6>
                <div className="d-flex flex-column gap-3">
  {/* Show estimated period if date matches */}
  {estimatedDate &&
    selectedDate.toISOString().split("T")[0] ===
      estimatedDate.toISOString().split("T")[0] && (
      <div
        style={{
          backgroundColor: "#ffe6f0",
          borderLeft: "4px solid #ff80aa",
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        <strong className="text-danger">Estimated Period Date</strong>
        <p className="text-muted mb-0 small">
          Based on the last logged period and 28-day cycle.
        </p>
      </div>
  )}

  {/* Show each activity with consistent styled box */}
  {markersByDate[
    selectedDate.toISOString().split("T")[0]
  ]?.entries.map((entry, i) => {
    const title = entry.Title.toLowerCase();

    let styles = {
      backgroundColor: "#f8f9fa", // default grey
      borderLeft: "4px solid #ccc", // default border
    };
    let label = "";
    let labelColor = "";

    if (/period/i.test(title)) {
      styles.backgroundColor = "#ffe6f0";
      styles.borderLeft = "4px solid #ff80aa";
      label = "Period Log";
      labelColor = "text-danger";
    } else if (/diet/i.test(title)) {
      styles.backgroundColor = "#e6fff2";
      styles.borderLeft = "4px solid #28a745";
      label = "Diet Entry";
      labelColor = "text-success";
    } else if (/exercise|workout/i.test(title)) {
      styles.backgroundColor = "#f0f0f0";
      styles.borderLeft = "4px solid #6c757d";
      label = "Exercise Log";
      labelColor = "text-secondary";
    }

    return (
      <div
        key={i}
        style={{
          ...styles,
          padding: "10px",
          borderRadius: "6px",
        }}
      >
        {label && (
          <strong className={labelColor}>{label}</strong>
        )}
        <div className="fw-semibold text-dark mb-1">{entry.Title}</div>
        <div className="text-muted small">{entry.Description}</div>
      </div>
    );
  })}
</div>

              </>
            ) : (
              <div className="text-center text-muted py-5">
                <p className="mb-0">
                  Select a past date from the calendar to view activity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <!-- period insight table --> */}
      <div className="card border-0 mt-4 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold text-dark">User Period Table</h4>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-primary">
              <tr>
                <th>Sr No.</th>
                <th>Approx Cycle Duration</th>
                <th>Current Cycles</th>
                <th>Current Cycle Duration</th>
                <th>Start Date</th>
                <th>Density</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => {
                const daysSinceStart = calculateDuration(item.StartDate);
                const currentCycles = Math.floor(
                  daysSinceStart / approxCycleDuration
                );
                const currentCycleDuration =
                  daysSinceStart % approxCycleDuration;
                const formattedDate = new Date(
                  item.StartDate
                ).toLocaleDateString("en-GB");

                const severityValue =
                  typeof item.Severity === "string"
                    ? item.Severity.toLowerCase()
                    : "";

                const badgeColor =
                  severityValue === "high"
                    ? "danger"
                    : severityValue === "low"
                    ? "warning"
                    : "info";

                return (
                  <tr key={index}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{approxCycleDuration} days</td>
                    <td>{currentCycles}</td>
                    <td>{currentCycleDuration}</td>
                    <td>{formattedDate}</td>
                    <td>
                      <span className={`badge bg-${badgeColor} text-dark`}>
                        {item.Severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-end mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* <!-- weight insight table --> */}
      <div className="card border-0 mt-4 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold text-dark">User Weight Table</h4>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-primary">
              <tr>
                <th>Sr No.</th>
                <th>Estimated BMI</th>
                <th>Reg. Weight</th>
                <th>Current Weight</th>
                <th>Latest Update Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWeightData.length > 0 ? (
                paginatedWeightData.map((entry, index) => {
                  const formattedDate = new Date(entry.Date).toLocaleDateString(
                    "en-GB"
                  );
                  const firstWeight = weightData[0].Weight;
                  const currentWeight = entry.Weight;

                  return (
                    <tr key={index}>
                      <td>{(weightPage - 1) * weightPerPage + index + 1}</td>
                      <td>{entry.BMI.toFixed(2)}</td>
                      <td>{firstWeight}</td>
                      <td>{currentWeight}</td>
                      <td>{formattedDate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No weight data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalWeightPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-end mb-0">
              <li className={`page-item ${weightPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setWeightPage((prev) => prev - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalWeightPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    weightPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setWeightPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  weightPage === totalWeightPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setWeightPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* <!-- exercise insight table --> */}
      {/* <div id="wrapper-userTableExercise">
        <h4 className="mb-3">User Exercise Table</h4>
        <table
          id="userTableExercise"
          className="table table-bordered table-striped"
        >
          <thead className="table-primary">
            <tr>
              <th>Sr No.</th>
              <th>Estemated BMI</th>
              <th>target Weight</th>
              <th>Reg. Weight </th>
              <th>Current Weight </th>
              <th>Workout Plan</th>
              <th>Incomplete Exercises </th>
              <th>Total Completed exercises</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>365</td>
              <td>52</td>
              <td>68</td>
              <td>64</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-danger">3</span>
              </td>
              <td>7</td>
              <td>27-02-2025</td>
            </tr>

            <tr>
              <td>2</td>
              <td>365</td>
              <td>52</td>
              <td>68</td>
              <td>64</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-danger">1</span>
              </td>
              <td>9</td>
              <td>28-02-2025</td>
            </tr>

            <tr>
              <td>3</td>
              <td>365</td>
              <td>52</td>
              <td>68</td>
              <td>64</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-danger">2</span>
              </td>
              <td>8</td>
              <td>29-02-2025</td>
            </tr>
          </tbody>
        </table>
      </div> */}

      {/* <!-- diet insight table --> */}
      {/* <div id="wrapper-userTableDiet">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">User Diet Table</h4>
          <a
            href="./dietdetails.html"
            className="btn btn-sm btn-outline-primary"
          >
            <i className="bi bi-bar-chart"></i> Calories Chart
          </a>
        </div>

        <table
          id="userTableDiet"
          className="table table-bordered table-striped"
        >
          <thead className="table-primary">
            <tr>
              <th>Sr No.</th>
              <th>Estemated BMI</th>
              <th>target Weight</th>
              <th>Current Weight </th>
              <th>Target Calories</th>
              <th>Total Calories</th>
              <th>Diet Plan</th>
              <th>Recipie name</th>
              <th>Recipie Time [ Lunch / Dinner ]</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>365</td>
              <td>52</td>
              <td>64</td>
              <td>164</td>
              <td>204</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-warning">Omlet</span>
              </td>
              <td>Lunch</td>
              <td>26-02-2025</td>
            </tr>

            <tr>
              <td>2</td>
              <td>365</td>
              <td>52</td>
              <td>64</td>
              <td>164</td>
              <td>204</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-warning">Chicken </span>
              </td>
              <td>Breakfast</td>
              <td>27-02-2025</td>
            </tr>

            <tr>
              <td>3</td>
              <td>365</td>
              <td>52</td>
              <td>64</td>
              <td>164</td>
              <td>204</td>
              <td>
                <span className="badge rounded-pill text-bg-info">Yogic</span>
              </td>
              <td>
                <span className="badge text-bg-warning">Parathas</span>
              </td>
              <td>Dinner</td>
              <td>28-02-2025</td>
            </tr>
          </tbody>
        </table>
      </div> */}

      <div className="row g-6 mb-6">
        {/* <!-- Activity Timeline --> */}
        {/* <div className="col-12 col-xxl-4">
          <div className="card h-100">
            <div className="card-header">
              <div className="d-flex justify-content-between">
                <h5 className="mb-0">List of Questions</h5>
              </div>
            </div>
            <div className="card-body pt-4">
              <ul className="timeline card-timeline mb-0">
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-primary"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0">
                        How much water should I drink daily?
                      </h6>
                      <small className="text-muted">12 min ago</small>
                    </div>
                    <p className="mb-2">Shreyas Kshirsagar | 17-04-2025 </p>

                    <button className="btn btn-sm btn-outline-success answer-btn">
                      Answer
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
                        What is the best diet for weight loss?
                      </h6>
                      <small className="text-muted">45 min ago</small>
                    </div>

                    <p className="mb-2">Rishikesh Raila | 01-04-2025 </p>

                    <button className="btn btn-sm btn-outline-success answer-btn">
                      Answer
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
                        What are some healthy snack options?
                      </h6>
                      <small className="text-muted">2 Day Ago</small>
                    </div>
                    <p className="mb-2">Shivraj Babar | 29-03-2025 </p>

                    <button className="btn btn-sm btn-outline-success answer-btn">
                      Answer
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
        </div> */}
        {/* <!-- Activity Timeline --> */}

        {/* <!-- Activity Timeline --> */}
        {/* <div className="col-12 col-xxl-8">
          <div className="card h-100">
            <div className="card-header">
              <div className="d-flex justify-content-between">
                <h5 className="mb-0">Answered Questions</h5>
              </div>
            </div>
            <div className="card-body pt-4">
              <ul className="timeline card-timeline mb-0">
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-primary"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0">
                        How much water should I drink daily?
                      </h6>
                      <small className="text-muted">12 min ago</small>
                    </div>

                    <p className="mb-2">Shreyas Kshirsagar | 17-04-2025 </p>

                    <p className="answer">
                      <b>Admin </b>On average, adults should drink about 8
                      glasses (2 liters) of water per day. However, needs vary
                      depending on body size, activity level, and climate.
                    </p>

                    <button className="btn btn-outline-primary editBtn">
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="btn btn-outline-danger">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </li>
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-success"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0">
                        What is the best diet for weight loss?
                      </h6>
                      <small className="text-muted">45 min ago</small>
                    </div>

                    <p className="mb-2">Rishikesh Raila | 01-04-2025 </p>

                    <p className="answer">
                      <b>Admin </b>There’s no one-size-fits-all. Effective diets
                      include Mediterranean, low-carb, intermittent fasting, and
                      calorie-controlled diets. The best one is sustainable and
                      matches your lifestyle.
                    </p>

                    <button className="btn btn-outline-primary editBtn">
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="btn btn-outline-danger">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </li>
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-info"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0">
                        What are some healthy snack options?
                      </h6>
                      <small className="text-muted">2 Day Ago</small>
                    </div>

                    <p className="mb-2">Shivraj Babar | 29-03-2025 </p>

                    <p className="answer">
                      <b>Admin </b>Try nuts, fruits, Greek yogurt, boiled eggs,
                      vegetable sticks with hummus, or a smoothie. Avoid
                      processed snacks high in sugar or sodium.
                    </p>

                    <button className="btn btn-outline-primary editBtn">
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button className="btn btn-outline-danger">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div> */}
        {/* <!-- Activity Timeline --> */}
      </div>
    </div>
  );
}
