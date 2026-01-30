"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import authenticatedFetch from "../utils/authenticatedFetch";

export default function UserDetailsClient() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const calculateAge = (dobString) => {
    if (!dobString) return "N/A";
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const [weightData, setWeightData] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [dietLogs, setDietLogs] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [combinedActivityData, setCombinedActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [estimatedDate, setEstimatedDate] = useState(null);
  const [periodCycles, setPeriodCycles] = useState([]);
  // Period table pagination
  const periodsPerPage = 5;

  // Period table states
  const [periodSearchTerm, setPeriodSearchTerm] = useState("");
  const [periodSortColumn, setPeriodSortColumn] = useState("");
  const [periodSortDirection, setPeriodSortDirection] = useState("asc");

  // Weight table states
  const [weightSearchTerm, setWeightSearchTerm] = useState("");
  const [weightSortColumn, setWeightSortColumn] = useState("");
  const [weightSortDirection, setWeightSortDirection] = useState("asc");

  // Diet table states
  const [dietPage, setDietPage] = useState(1);
  const dietPerPage = 5;
  const [dietSearchTerm, setDietSearchTerm] = useState("");
  const [dietSortColumn, setDietSortColumn] = useState("");
  const [dietSortDirection, setDietSortDirection] = useState("asc");

  // Workout table states
  const [workoutPage, setWorkoutPage] = useState(1);
  const workoutPerPage = 5;
  const [workoutSearchTerm, setWorkoutSearchTerm] = useState("");
  const [workoutSortColumn, setWorkoutSortColumn] = useState("");
  const [workoutSortDirection, setWorkoutSortDirection] = useState("asc");

  // Activity table states
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 5;

  // Filtered and sorted diet data
  const filteredDietLogs = useMemo(() => {
    let data = Array.isArray(dietLogs) ? dietLogs : [];

    if (dietSearchTerm) {
      const lowerSearch = dietSearchTerm.toLowerCase();
      data = data.filter(
        (log) =>
          (log.MealItem?.FoodItem || "").toLowerCase().includes(lowerSearch) ||
          (log.MealName || "").toLowerCase().includes(lowerSearch) ||
          (log.Quantity || "").toString().includes(lowerSearch) ||
          (log.TotalCalories || "").toString().includes(lowerSearch) ||
          log.LogDate.toLowerCase().includes(lowerSearch)
      );
    }

    if (dietSortColumn) {
      data = [...data].sort((a, b) => {
        let aVal, bVal;
        switch (dietSortColumn) {
          case "LogDate":
            aVal = new Date(a.LogDate);
            bVal = new Date(b.LogDate);
            break;
          case "FoodItem":
            aVal = a.MealItem?.FoodItem || "";
            bVal = b.MealItem?.FoodItem || "";
            break;
          case "MealName":
            aVal = a.MealName || "";
            bVal = b.MealName || "";
            break;
          case "Quantity":
            aVal = parseFloat(a.Quantity) || 0;
            bVal = parseFloat(b.Quantity) || 0;
            break;
          case "TotalCalories":
            aVal = parseFloat(a.TotalCalories) || 0;
            bVal = parseFloat(b.TotalCalories) || 0;
            break;
          default:
            aVal = "";
            bVal = "";
        }
        if (aVal < bVal) return dietSortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return dietSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [dietLogs, dietSearchTerm, dietSortColumn, dietSortDirection]);

  const totalDietPages = Math.ceil(filteredDietLogs.length / dietPerPage);
  const paginatedDietLogs = filteredDietLogs.slice(
    (dietPage - 1) * dietPerPage,
    dietPage * dietPerPage
  );

  // Filtered and sorted workout data
  const filteredWorkouts = useMemo(() => {
    let data = Array.isArray(workouts) ? workouts : [];

    if (workoutSearchTerm) {
      const lowerSearch = workoutSearchTerm.toLowerCase();
      data = data.filter(
        (workout) =>
          (workout.ActivityName || "").toLowerCase().includes(lowerSearch) ||
          (workout.ActivityCategory || "")
            .toLowerCase()
            .includes(lowerSearch) ||
          workout.LoggedDate.toLowerCase().includes(lowerSearch) ||
          workout.DurationInMinutes.toString().includes(lowerSearch)
      );
    }

    if (workoutSortColumn) {
      data = [...data].sort((a, b) => {
        let aVal, bVal;
        switch (workoutSortColumn) {
          case "LoggedDate":
            aVal = new Date(a.LoggedDate);
            bVal = new Date(b.LoggedDate);
            break;
          case "ActivityName":
            aVal = a.ActivityName || "";
            bVal = b.ActivityName || "";
            break;
          case "ActivityCategory":
            aVal = a.ActivityCategory || "";
            bVal = b.ActivityCategory || "";
            break;
          case "DurationInMinutes":
            aVal = parseFloat(a.DurationInMinutes) || 0;
            bVal = parseFloat(b.DurationInMinutes) || 0;
            break;
          default:
            aVal = "";
            bVal = "";
        }
        if (aVal < bVal) return workoutSortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return workoutSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [workouts, workoutSearchTerm, workoutSortColumn, workoutSortDirection]);

  const totalWorkoutPages = Math.ceil(filteredWorkouts.length / workoutPerPage);
  const paginatedWorkouts = filteredWorkouts.slice(
    (workoutPage - 1) * workoutPerPage,
    workoutPage * workoutPerPage
  );

  const itemsPerPage = 5;
  const totalPeriodPages = Math.ceil(periodCycles.length / periodsPerPage);

  const paginatedPeriodCycles = useMemo(() => {
    const start = (currentPage - 1) * periodsPerPage;
    const end = start + periodsPerPage;
    return periodCycles.slice(start, end);
  }, [periodCycles, currentPage]);

  // Filtered and sorted period data
  const filteredPeriodData = useMemo(() => {
    let data = Array.isArray(periodData) ? periodData : [];

    if (periodSearchTerm) {
      const lowerSearch = periodSearchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.StartDate.toLowerCase().includes(lowerSearch) ||
          (item.Severity && item.Severity.toLowerCase().includes(lowerSearch))
      );
    }

    if (periodSortColumn) {
      data = [...data].sort((a, b) => {
        let aVal, bVal;
        switch (periodSortColumn) {
          case "StartDate":
            aVal = new Date(a.StartDate);
            bVal = new Date(b.StartDate);
            break;
          case "Severity":
            aVal = a.Severity || "";
            bVal = b.Severity || "";
            break;
          default:
            aVal = "";
            bVal = "";
        }
        if (aVal < bVal) return periodSortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return periodSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [periodData, periodSearchTerm, periodSortColumn, periodSortDirection]);

  const totalPages = Math.ceil(filteredPeriodData.length / itemsPerPage);
  const paginatedData = filteredPeriodData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [weightPage, setWeightPage] = useState(1);
  const weightPerPage = 5;

  // Filtered and sorted weight data
  const filteredWeightData = useMemo(() => {
    let data = Array.isArray(weightData) ? weightData : [];

    if (weightSearchTerm) {
      const lowerSearch = weightSearchTerm.toLowerCase();
      data = data.filter(
        (entry) =>
          entry.Date.toLowerCase().includes(lowerSearch) ||
          entry.Weight.toString().includes(lowerSearch) ||
          entry.BMI.toString().includes(lowerSearch)
      );
    }

    if (weightSortColumn) {
      data = [...data].sort((a, b) => {
        let aVal, bVal;
        switch (weightSortColumn) {
          case "Date":
            aVal = new Date(a.Date);
            bVal = new Date(b.Date);
            break;
          case "Weight":
            aVal = parseFloat(a.Weight);
            bVal = parseFloat(b.Weight);
            break;
          case "BMI":
            aVal = parseFloat(a.BMI);
            bVal = parseFloat(b.BMI);
            break;
          default:
            aVal = "";
            bVal = "";
        }
        if (aVal < bVal) return weightSortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return weightSortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [weightData, weightSearchTerm, weightSortColumn, weightSortDirection]);

  const totalWeightPages = Math.ceil(filteredWeightData.length / weightPerPage);
  const paginatedWeightData = filteredWeightData.slice(
    (weightPage - 1) * weightPerPage,
    weightPage * weightPerPage
  );

  // Activities for table
  const activities = useMemo(() => {
    if (combinedActivityData.length === 0) return [];

    return combinedActivityData
      .flatMap((event) =>
        event.Entries.map((entry) => ({
          date: new Date(event.Date),
          title: entry.Title,
          description: entry.Description,
        }))
      )
      .sort((a, b) => b.date - a.date);
  }, [combinedActivityData]);

  const totalActivityPages = Math.ceil(activities.length / activityPerPage);
  const paginatedActivities = activities.slice(
    (activityPage - 1) * activityPerPage,
    activityPage * activityPerPage
  );

  useEffect(() => {
    const workoutEntries = (Array.isArray(workouts) ? workouts : []).map(
      (workout) => ({
        Date: workout.LoggedDate,
        Entries: [
          {
            Title: `Workout: ${workout.ActivityName}`,
            Description: `${workout.ActivityCategory && workout.ActivityCategory !== 'undefined' ? `Category: ${workout.ActivityCategory}, ` : ''}Duration: ${workout.DurationInMinutes} minutes`,
          },
        ],
      })
    );
    const dietEntries = (Array.isArray(dietLogs) ? dietLogs : []).map(
      (diet) => ({
        Date: diet.LogDate,
        Entries: [
          {
            Title: `Diet: ${diet.MealItem?.FoodItem || diet.MealName}`,
            Description: `Meal: ${diet.MealName}, Quantity: ${diet.Quantity}, Calories: ${diet.TotalCalories}`,
          },
        ],
      })
    );
    setCombinedActivityData([
      ...(Array.isArray(activityData) ? activityData : []),
      ...workoutEntries,
      ...dietEntries,
    ]);
  }, [activityData, workouts, dietLogs]);

  // const activityByDate = combinedActivityData.reduce((acc, item) => {
  //   const date = new Date(item.Date).toISOString().split("T")[0];
  //   if (!acc[date]) acc[date] = [];
  //   acc[date].push(...item.Entries);
  //   return acc;
  // }, {});
  const markersByDate = useMemo(() => {
    const map = {};
    for (const item of combinedActivityData) {
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
        if (/diet/i.test(entry.Title)) map[date].diet = true;

        if (/exercise|workout/i.test(entry.Title)) map[date].exercise = true;
        if (/period/i.test(entry.Title) && !/estimate/i.test(entry.Title))
          map[date].period = true;
        if (/estimated period/i.test(entry.Title)) map[date].estimate = true;
        map[date].entries.push(entry);
      }
    }
    return map;
  }, [combinedActivityData]);

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
              alt="Diet Followed"
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
    setCurrentPage(1);
  }, [periodCycles]);

  useEffect(() => {
    if (userId) {
      fetchProfileData(userId);
      // fetchPeriodData(userId);
      fetchWeightData(userId);
      fetchActivityData(userId);
      fetchDietLogs(userId);
      fetchWorkoutData(userId);
    }
  }, [userId]);

  const fetchProfileData = async (uid) => {
    try {
      const allUsers = await authenticatedFetch(
        "https://flow108.coinagesoft.com/api/admin/AdminOnBoarding/users"
      );
      const profile = allUsers.find((user) => user.UserId === uid);
      setProfileData(profile || null);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };
  function extractPeriodCycles(events) {
    const BLEED_WINDOW_DAYS = 8;
    let dates = [];

    events.forEach((event) => {
      event.Entries?.forEach((entry) => {
        if (entry.Title?.toLowerCase().includes("period logged")) {
          const d = new Date(event.Date);
          dates.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
        }
      });
    });

    if (!dates.length) return [];

    // sort & unique
    dates = [...new Set(dates.map((d) => d.toISOString()))]
      .map((d) => new Date(d))
      .sort((a, b) => a - b);

    // group bleeding days
    const groups = [];
    let current = [dates[0]];

    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i] - current[0]) / (1000 * 60 * 60 * 24);

      if (diff <= BLEED_WINDOW_DAYS) {
        current.push(dates[i]);
      } else {
        groups.push(current);
        current = [dates[i]];
      }
    }
    groups.push(current);

    // build cycles
    const cycles = [];

    for (let i = 0; i < groups.length - 1; i++) {
      const start = groups[i][0];
      const nextStart = groups[i + 1][0];
      cycles.push({
        startDate: start,
        cycleLength: Math.round((nextStart - start) / (1000 * 60 * 60 * 24)),
      });
    }

    // last (current) cycle
    const lastStart = groups[groups.length - 1][0];
    cycles.push({
      startDate: lastStart,
      cycleLength: Math.round((new Date() - lastStart) / (1000 * 60 * 60 * 24)),
    });

    return cycles;
  }

  const fetchActivityData = async (uid) => {
    const data = await authenticatedFetch(
      `https://flow108.coinagesoft.com/api/user/activity/report?userId=${uid}`
    );

    setActivityData(data.Events || []);
    setPeriodCycles(extractPeriodCycles(data.Events || []));
  };

  useEffect(() => {
    if (periodCycles.length > 0) {
      const last = periodCycles[periodCycles.length - 1];
      const estimated = new Date(last.startDate);
      estimated.setDate(estimated.getDate() + last.cycleLength);
      setEstimatedDate(estimated);
    }
  }, [periodCycles]);

  const fetchWeightData = async (uid) => {
    try {
      const data = await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/admin-activity/weight/${uid}`
      );
      setWeightData(data);
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  };

  const fetchDietLogs = async (uid) => {
    try {
      const data = await authenticatedFetch(
        `https://flow108.coinagesoft.com/api/AdminDietPlan/allLogs/${uid}`
      );
      setDietLogs(data);
    } catch (error) {
      console.error("Error fetching diet logs:", error);
    }
  };

  const fetchWorkoutData = async (uid) => {
    try {
      const res = await fetch(
        `https://flow108.coinagesoft.com/api/user/activity/user/${uid}/activities`
      );
      const data = await res.json();
      setWorkouts(data.Data.Workouts || []);
    } catch (error) {
      console.error("Error fetching workout data:", error);
    }
  };

  // const calculateDuration = (startDateStr) => {
  //   const start = new Date(startDateStr);
  //   const now = new Date();
  //   const diffTime = Math.abs(now - start);
  //   return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  // };

  // Check if periods are consecutive
  // const isConsecutivePeriods = useMemo(() => {
  //   if (!periodData || periodData.length < 2) return false;
  //   const sorted = [...periodData].sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
  //   for (let i = 1; i < sorted.length; i++) {
  //     const prevDate = new Date(sorted[i - 1].StartDate);
  //     const currDate = new Date(sorted[i].StartDate);
  //     const diffTime = Math.abs(currDate - prevDate);
  //     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //     if (diffDays !== 1) return false;
  //   }
  //   return true;
  // }, [periodData]);

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      {profileData && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-header  text-white rounded-top">
            <h5 className="mb-0">
              <i className="bi bi-person-badge me-2"></i>User Profile
              Information
            </h5>
          </div>
          <div className="card-body">
            {/* User Identification */}
            {/* <div className="mb-4">
              <h6 className="text-primary fw-bold">User Identification</h6>
              <div className="row mb-3">
                <div className="col-md-6 mb-2">
                  <strong>Name:</strong>
                  <p className="mb-0 text-muted">{profileData.GivenName || 'N/A'}</p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Email:</strong>
                  <p className="mb-0 text-muted">{profileData.Email || 'N/A'}</p>
                </div>
              </div>
            </div> */}

            <hr />

            {/* Stage 1 Detail */}
            <div className="mb-4">
              <h6 className="text-primary fw-bold">
                Stage 1: Basic Information
              </h6>
              <div className="row mb-3">
                <div className="col-md-3 mb-2">
                  <strong>Email:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Email || "N/A"}
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Age:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage1?.Age || "N/A"}
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Height:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage1?.HeightCm || "N/A"} cm
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Weight:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage1?.WeightKg || "N/A"} kg
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Activity Level:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage1?.ActivityLevel || "N/A"}
                  </p>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Calculated Calories:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage1?.CalculatedCalories || "N/A"}
                  </p>
                </div>
              </div>
              {/* <div className="row mb-3">
                <div className="col-md-6 mb-2">
                  <strong>Calculated Calories:</strong>
                  <p className="mb-0 text-muted">{profileData.Stage1?.CalculatedCalories || 'N/A'}</p>
                </div>
              </div> */}
            </div>

            <hr />

            {/* Stage 2 Details */}
            <div className="mb-4">
              <h6 className="text-primary fw-bold">
                Stage 2: Period Information
              </h6>
              <div className="row mb-3">
                <div className="col-md-3 mb-2">
                  <strong>Last Period Date:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage2?.LastPeriodDate
                      ? new Date(
                          profileData.Stage2.LastPeriodDate
                        ).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Period Duration:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage2?.PeriodDurationDays || "N/A"} days
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Cycle Duration:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage2?.CycleDurationDays || "N/A"} days
                  </p>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>Target Weight:</strong>
                  <p className="mb-0 text-muted">
                    {profileData.Stage2?.TargetWeight || "N/A"} kg
                  </p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6 mb-2">
                  <strong>Severity:</strong>
                  <ul className="mb-0 list-unstyled">
                    {profileData.Stage2?.Severity?.length > 0 ? (
                      profileData.Stage2.Severity.map((s, i) => (
                        <li key={i} className="mb-1">
                          <span className="badge bg-danger">{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted">N/A</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <hr />

            {/* Stage 3 Details */}
            <div className="mb-4">
              <h6 className="text-primary fw-bold">Stage 3: Goals</h6>
              <div className="row mb-3">
                <div className="col-md-12 mb-2">
                  <strong>Goals:</strong>
                  <div>
                    {profileData.Stage3?.Goal?.length > 0 ? (
                      profileData.Stage3.Goal.map((goal, i) => (
                        <span key={i} className="me-2 mb-1 d-inline-block">
                          <span className="badge bg-success">{goal}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </div>
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
                        <strong className="text-danger">
                          Estimated Period Date
                        </strong>
                        <p className="text-muted mb-0 small">
                          Based on the user’s historical cycle pattern.
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
                      styles.backgroundColor = "#e3f2fd";
                      styles.borderLeft = "4px solid #2196f3";
                      label = "Diet Log";
                      labelColor = "text-primary";
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
                        <div className="fw-semibold text-dark mb-1">
                          {entry.Title}
                        </div>
                        <div className="text-muted small">
                          {entry.Description}
                        </div>
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
                <th>Cycle Start Date</th>
                <th>Cycle Length (days)</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {periodCycles.length > 0 ? (
                paginatedPeriodCycles.map((cycle, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * periodsPerPage + index + 1}</td>

                    <td>
                      {new Date(cycle.startDate).toLocaleDateString("en-GB")}
                    </td>
                    <td>{cycle.cycleLength}</td>
                    <td>
                      {profileData?.Stage2?.Severity?.length > 0
                        ? profileData.Stage2.Severity.map((s, i) => (
                            <span key={i} className="badge bg-danger me-1">
                              {s}
                            </span>
                          ))
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          index === periodCycles.length - 1
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                      >
                        {index === periodCycles.length - 1
                          ? "Current Cycle"
                          : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No period history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPeriodPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
              </li>

              {Array.from({ length: totalPeriodPages }, (_, i) => (
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
                  currentPage === totalPeriodPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p + 1)}
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
            <ul className="pagination justify-content-center mb-0">
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

      {/* <!-- diet insight table --> */}
      <div className="card border-0 mt-4 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold text-dark">User Diet Table</h4>
          <a
            href="/Calories_Counter"
            className="btn btn-sm btn-outline-primary"
          >
            <i className="bi bi-bar-chart"></i> Calories Chart
          </a>
        </div>

        <div className="table-responsive">
          <table
            id="userTableDiet"
            className="table table-bordered table-striped mb-0"
          >
            <thead className="table-primary">
              <tr>
                <th>Sr No.</th>
                <th>Recipe Name</th>
                <th>Meal Type</th>
                <th>Quantity Consumed</th>
                <th>Calories</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDietLogs.length > 0 ? (
                paginatedDietLogs.map((log, index) => {
                  const formattedDate = new Date(
                    log.LogDate
                  ).toLocaleDateString("en-GB");
                  return (
                    <tr key={index}>
                      <td>{(dietPage - 1) * dietPerPage + index + 1}</td>
                      <td>{log.MealItem?.FoodItem || "N/A"}</td>
                      <td>{log.MealName || "N/A"}</td>
                      <td>{log.Quantity || "N/A"}</td>
                      <td>{log.TotalCalories || "N/A"}</td>
                      <td>{formattedDate}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No diet logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalDietPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-center mb-0">
              <li className={`page-item ${dietPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setDietPage((prev) => prev - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalDietPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${dietPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setDietPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  dietPage === totalDietPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setDietPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* <!-- activity insight table --> */}
      <div className="card border-0 mt-4 shadow-sm rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 fw-bold text-dark">User Activity Table</h4>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped mb-0">
            <thead className="table-primary">
              <tr>
                <th>Sr No.</th>
                <th>Date</th>
                <th>Title</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity, index) => {
                  const formattedDate =
                    activity.date.toLocaleDateString("en-GB");
                  return (
                    <tr key={index}>
                      <td>
                        {(activityPage - 1) * activityPerPage + index + 1}
                      </td>
                      <td>{formattedDate}</td>
                      <td>{activity.title}</td>
                      <td>{activity.description}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No activity data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalActivityPages > 1 && (
          <nav className="mt-3">
            <ul className="pagination justify-content-center mb-0">
              <li
                className={`page-item ${activityPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setActivityPage((prev) => prev - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalActivityPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    activityPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setActivityPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  activityPage === totalActivityPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setActivityPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* <!-- workout insight table --> */}
     
    </div>
  );
}
