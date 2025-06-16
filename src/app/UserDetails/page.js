'use client';
import React, { useEffect } from 'react';

export default function Page() {

  useEffect(() => {
    document.querySelectorAll('.btn-outline-danger').forEach(button => {
      button.addEventListener('click', function () {
        const confirmDelete = confirm('Are you sure you want to delete this answer?');
        if (confirmDelete) {
          const timelineItem = this.closest('.timeline-item');
          if (timelineItem) {
            timelineItem.remove();
          }
        }
      });
    });
  }, []);

 

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
                        <div className="row g-6 mb-6">
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
                                        <h6 className="mb-0 fw-normal">Period Insight </h6>
                                        <p className="mb-0">
                                            <small className="text-muted">Current cycle duration in days </small>
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
                                                <span className="avatar-initial rounded-3 bg-label-danger"><i
                                                        className="ri-group-line ri-24px"></i></span>
                                            </div>
                                            <h4 className="mb-0">27</h4>
                                        </div>
                                        <h6 className="mb-0 fw-normal">Exercise Progress</h6>
                                        <p className="mb-0">
                                            <span className="me-1 fw-medium">+4.3%</span>
                                            <small className="text-muted"> completed workout sessions</small>
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
                                        <h6 className="mb-0 fw-normal">Diet Breach</h6>
                                        <p className="mb-0">
                                            {/* <!-- <span className="me-1 fw-medium">-2.5%</span> --> */}
                                            <small className="text-muted">total number of days diet followed</small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <!-- period insight table --> */}
                        <div id="wrapper-userTablePeriod">
                            <h4 className="mb-3">User Period Table</h4>

                            <table id="userTablePeriod" className="table table-bordered table-striped">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Estemated BMI</th>
                                        <th>Approx Cycle Duration</th>
                                        <th>Current Cycles </th>
                                        <th>Current Cycle Duration</th>
                                        <th>Start Date</th>
                                        <th>Density</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>365</td>
                                        <td>40</td>
                                        <td>10</td>
                                        <td>30</td>
                                        <td>29-02-2025</td>
                                        <td><span className="badge bg-danger text-dark">High</span></td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>205</td>
                                        <td>40</td>
                                        <td>11</td>
                                        <td>28</td>
                                        <td>25-03-2025</td>
                                        <td><span className="badge bg-danger text-dark">Low</span></td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>136</td>
                                        <td>40</td>
                                        <td>12</td>
                                        <td>29</td>
                                        <td>22-04-2025</td>
                                        <td><span className="badge bg-danger text-dark">Regular </span></td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>

                        {/* <!-- weight insight table --> */}
                        <div id="wrapper-userTableWeight">
                            <h4 className="mb-3">User Weight Table</h4>
                            <table id="userTableWeight" className="table table-bordered table-striped">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Estemated BMI</th>
                                        <th>target Weight </th>
                                        <th>Reg. Weight </th>
                                        <th>Current Weight </th>
                                        <th>Latest Update Date</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>365</td>
                                        <td>52</td>
                                        <td>68</td>
                                        <td><span className="badge bg-primary text-dark">64</span></td>
                                        <td>29-02-2025</td>
                                    </tr>

                                    <tr>
                                        <td>2</td>
                                        <td>239</td>
                                        <td>52</td>
                                        <td>68</td>
                                        <td><span className="badge bg-primary text-dark">61</span></td>
                                        <td>29-02-2025</td>
                                    </tr>

                                    <tr>
                                        <td>3</td>
                                        <td>260</td>
                                        <td>52</td>
                                        <td>68</td>
                                        <td><span className="badge bg-primary text-dark">60</span></td>
                                        <td>29-02-2025</td>
                                    </tr>


                                </tbody>
                            </table>
                        </div>

                        {/* <!-- exercise insight table --> */}
                        <div id="wrapper-userTableExercise">
                            <h4 className="mb-3">User Exercise Table</h4>
                            <table id="userTableExercise" className="table table-bordered table-striped">
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
                                        <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                        <td><span className="badge text-bg-danger">3</span></td>
                                        <td>7</td>
                                        <td>27-02-2025</td>

                                    </tr>

                                    <tr>
                                        <td>2</td>
                                        <td>365</td>
                                        <td>52</td>
                                        <td>68</td>
                                        <td>64</td>
                                        <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                        <td><span className="badge text-bg-danger">1</span></td>
                                        <td>9</td>
                                        <td>28-02-2025</td>

                                    </tr>

                                    <tr>
                                        <td>3</td>
                                        <td>365</td>
                                        <td>52</td>
                                        <td>68</td>
                                        <td>64</td>
                                        <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                        <td><span className="badge text-bg-danger">2</span></td>
                                        <td>8</td>
                                        <td>29-02-2025</td>
                                    </tr>



                                </tbody>
                            </table>
                        </div>
                       
                          
                        {/* <!-- diet insight table --> */}
                            <div id="wrapper-userTableDiet">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0">User Diet Table</h4>
                                    <a href="./dietdetails.html" className="btn btn-sm btn-outline-primary">
                                      <i className="bi bi-bar-chart"></i> Calories Chart
                                    </a>
                                  </div>
                                  
                                  
                                <table id="userTableDiet" className="table table-bordered table-striped">
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
                                            <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                            <td><span className="badge text-bg-warning">Omlet</span></td>
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
                                            <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                            <td><span className="badge text-bg-warning">Chicken </span></td>
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
                                            <td><span className="badge rounded-pill text-bg-info">Yogic</span></td>
                                            <td><span className="badge text-bg-warning">Parathas</span></td>
                                            <td>Dinner</td>
                                            <td>28-02-2025</td>
                                        </tr>



                                    </tbody>
                                </table>
                            </div>

                        <div className="row g-6 mb-6">

                            {/* <!-- Activity Timeline --> */}
                            <div className="col-12 col-xxl-4">
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
                                                        <h6 className="mb-0">How much water should I drink daily?</h6>
                                                        <small className="text-muted">12 min ago</small>
                                                    </div>
                                                    <p className="mb-2">Shreyas Kshirsagar | 17-04-2025 </p>

                                                    <button className="btn btn-sm btn-outline-success answer-btn">Answer
                                                    </button>

                                                    <div className="answer-form mt-2" style={{display: "none"}}>
                                                        <input type="text" className="form-control mb-2"
                                                            placeholder="Type your answer..." />
                                                        <button
                                                            className="btn btn-sm btn-primary submit-answer ">Submit</button>
                                                    </div>

                                                </div>
                                            </li>
                                            <li className="timeline-item timeline-item-transparent">
                                                <span className="timeline-point timeline-point-success"></span>
                                                <div className="timeline-event">
                                                    <div className="timeline-header mb-3">
                                                        <h6 className="mb-0">What is the best diet for weight loss?</h6>
                                                        <small className="text-muted">45 min ago</small>
                                                    </div>

                                                    <p className="mb-2">Rishikesh Raila | 01-04-2025 </p>

                                                    <button className="btn btn-sm btn-outline-success answer-btn">Answer
                                                    </button>

                                                    <div className="answer-form mt-2" style={{display: "none"}}>
                                                        <input type="text" className="form-control mb-2"
                                                            placeholder="Type your answer..." />
                                                        <button
                                                            className="btn btn-sm btn-primary submit-answer ">Submit</button>
                                                    </div>

                                                </div>
                                            </li>
                                            <li className="timeline-item timeline-item-transparent">
                                                <span className="timeline-point timeline-point-info"></span>
                                                <div className="timeline-event">
                                                    <div className="timeline-header mb-3">
                                                        <h6 className="mb-0">What are some healthy snack options?</h6>
                                                        <small className="text-muted">2 Day Ago</small>
                                                    </div>
                                                    <p className="mb-2">Shivraj Babar | 29-03-2025 </p>

                                                    <button className="btn btn-sm btn-outline-success answer-btn">Answer
                                                    </button>

                                                    <div className="answer-form mt-2" style={{display: "none"}}>
                                                        <input type="text" className="form-control mb-2"
                                                            placeholder="Type your answer..." />
                                                        <button
                                                            className="btn btn-sm btn-primary submit-answer ">Submit</button>
                                                    </div>

                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Activity Timeline --> */}

                            {/* <!-- Activity Timeline --> */}
                            <div className="col-12 col-xxl-8">
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
                                                        <h6 className="mb-0">How much water should I drink daily?</h6>
                                                        <small className="text-muted">12 min ago</small>
                                                    </div>

                                                    <p className="mb-2">Shreyas Kshirsagar | 17-04-2025 </p>

                                                    <p className="answer"><b>Admin </b>On average, adults should drink about 8 glasses (2 liters) of water per day. However, needs vary depending on body size, activity level, and climate.</p>

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
                                                        <h6 className="mb-0">What is the best diet for weight loss?</h6>
                                                        <small className="text-muted">45 min ago</small>
                                                    </div>

                                                    <p className="mb-2">Rishikesh Raila | 01-04-2025 </p>

                                                    <p className="answer"><b>Admin </b>There’s no one-size-fits-all. Effective diets include Mediterranean, low-carb, intermittent fasting, and calorie-controlled diets. The best one is sustainable and matches your lifestyle.</p>

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
                                                        <h6 className="mb-0">What are some healthy snack options?</h6>
                                                        <small className="text-muted">2 Day Ago</small>
                                                    </div>

                                                    <p className="mb-2">Shivraj Babar | 29-03-2025 </p>

                                                    <p className="answer"><b>Admin </b>Try nuts, fruits, Greek yogurt, boiled eggs, vegetable sticks with hummus, or a smoothie. Avoid processed snacks high in sugar or sodium.</p>

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
                            </div>
                            {/* <!-- Activity Timeline --> */}

                        </div>

                    </div>
  )
}


