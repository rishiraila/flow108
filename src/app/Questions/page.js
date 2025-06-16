"use client";
import React, { useEffect, useState } from "react";

const questionsData = [
  {
    id: 1,
    text: "How much water should I drink daily?",
    author: "Shreyas Kshirsagar",
    date: "17-04-2025",
    timeAgo: "12 min ago",
    answer:
      "On average, adults should drink about 8 glasses (2 liters) of water per day. However, needs vary depending on body size, activity level, and climate.",
  },
  {
    id: 2,
    text: "What is the best diet for weight loss?",
    author: "Rishikesh Raila",
    date: "01-04-2025",
    timeAgo: "45 min ago",
    answer:
      "There’s no one-size-fits-all. Effective diets include Mediterranean, low-carb, intermittent fasting, and calorie-controlled diets. The best one is sustainable and matches your lifestyle.",
  },
  {
    id: 3,
    text: "What are some healthy snack options?",
    author: "Shivraj Babar",
    date: "29-03-2025",
    timeAgo: "2 Day Ago",
    answer:
      "Try nuts, fruits, Greek yogurt, boiled eggs, vegetable sticks with hummus, or a smoothie. Avoid processed snacks high in sugar or sodium.",
  },
];

export default function DashboardPage() {
  const [questions, setQuestions] = useState(questionsData);
  const [editingId, setEditingId] = useState(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [answerInput, setAnswerInput] = useState({});
  const [showAnswerForm, setShowAnswerForm] = useState({});

  const handleEditClick = (id, currentAnswer) => {
    setEditingId(id);
    setEditAnswer(currentAnswer);
  };

  const handleSaveAnswer = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer: editAnswer } : q))
    );
    setEditingId(null);
  };

  const handleToggleAnswerForm = (id) => {
    setShowAnswerForm((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmitAnswer = (id) => {
    if (!answerInput[id]) return alert("Please type an answer");
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer: answerInput[id] } : q))
    );
    setAnswerInput((prev) => ({ ...prev, [id]: "" }));
    setShowAnswerForm((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="container p-4">
      <div className="row g-3">
        {/* Card 1 */}
        <div className="col-6 col-sm-6 col-lg-3 mb-2">
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
              <h6 className="mb-0 fw-normal">User Registered</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+18.2%</span>
                <small className="text-muted">than last week</small>
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
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
              <h6 className="mb-0 fw-normal">Paid Members</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">-8.7%</span>
                <small className="text-muted">than last week</small>
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
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
              <h6 className="mb-0 fw-normal">Total Questions</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+4.3%</span>
                <small className="text-muted">than last week</small>
              </p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-6 col-sm-6 col-lg-3 mb-2">
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
              <h6 className="mb-0 fw-normal">Total Posts</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">-2.5%</span>
                <small className="text-muted">than last week</small>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Unanswered Questions */}
        <div className="col-12 col-xxl-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">List of Questions</h5>
            </div>
            <div className="card-body pt-4">
              <ul className="timeline card-timeline mb-0">
                {/* Question 1 */}
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-primary"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0 question-text">
                        How much water should I drink daily?
                      </h6>
                      <small className="text-muted">12 min ago</small>
                    </div>
                    <p className="mb-2">Shreyas Kshirsagar | 17-04-2025</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-success">
                        Answer
                      </button>
                      <button className="btn btn-sm btn-outline-warning">
                        Edit Question
                      </button>
                    </div>
                    <div
                      className="answer-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Type your answer..."
                      />
                      <button className="btn btn-sm btn-primary">Submit</button>
                    </div>
                    <div
                      className="edit-question-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input type="text" className="form-control mb-2" />
                      <button className="btn btn-sm btn-success">Save</button>
                    </div>
                  </div>
                </li>

                {/* Question 2 */}
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-success"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0 question-text">
                        What is the best diet for weight loss?
                      </h6>
                      <small className="text-muted">45 min ago</small>
                    </div>
                    <p className="mb-2">Rishikesh Raila | 01-04-2025</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-success">
                        Answer
                      </button>
                      <button className="btn btn-sm btn-outline-warning">
                        Edit Question
                      </button>
                    </div>
                    <div
                      className="answer-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Type your answer..."
                      />
                      <button className="btn btn-sm btn-primary">Submit</button>
                    </div>
                    <div
                      className="edit-question-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input type="text" className="form-control mb-2" />
                      <button className="btn btn-sm btn-success">Save</button>
                    </div>
                  </div>
                </li>

                {/* Question 3 */}
                <li className="timeline-item timeline-item-transparent">
                  <span className="timeline-point timeline-point-info"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-3">
                      <h6 className="mb-0 question-text">
                        What are some healthy snack options?
                      </h6>
                      <small className="text-muted">2 Day Ago</small>
                    </div>
                    <p className="mb-2">Shivraj Babar | 29-03-2025</p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-success">
                        Answer
                      </button>
                      <button className="btn btn-sm btn-outline-warning">
                        Edit Question
                      </button>
                    </div>
                    <div
                      className="answer-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Type your answer..."
                      />
                      <button className="btn btn-sm btn-primary">Submit</button>
                    </div>
                    <div
                      className="edit-question-form mt-2"
                      style={{ display: "none" }}
                    >
                      <input type="text" className="form-control mb-2" />
                      <button className="btn btn-sm btn-success">Save</button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Answered Questions */}
        <div className="col-12 col-xl-8">
          <div className="card">
            <div className="card-header">
              <h5>Answered Questions</h5>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {questions.map(
                  (q) =>
                    q.answer && (
                      <li className="list-group-item" key={q.id}>
                        <h6>{q.text}</h6>
                        <small>
                          {q.author} | {q.date}
                        </small>
                        <div className="mt-2">
                          {editingId === q.id ? (
                            <>
                              <input
                                type="text"
                                className="form-control mb-2"
                                value={editAnswer}
                                onChange={(e) => setEditAnswer(e.target.value)}
                              />
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSaveAnswer(q.id)}
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <p className="mb-2">
                              <b>Admin:</b> {q.answer}
                            </p>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEditClick(q.id, q.answer)}
                          >
                            Edit
                          </button>
                          <button className="btn btn-outline-danger btn-sm">
                            Delete
                          </button>
                        </div>
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-5 text-center text-muted small">
        © {new Date().getFullYear()}, made with{" "}
        <span className="text-danger">❤</span> by{" "}
        <a
          href="https://www.coinagesoft.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Coinage.in
        </a>
      </footer>
    </div>
  );
}
