'use client';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="container-xxl p-4">
      {/* Cards */}
      <div className="row g-3 mb-4">
        {[
          {
            title: 'User Registered',
            count: 42,
            trend: '+18.2%',
            color: 'primary',
            icon: 'ri-user-add-line',
          },
          {
            title: 'Paid Members',
            count: 8,
            trend: '-8.7%',
            color: 'warning',
            icon: 'ri-user-star-line',
          },
          {
            title: 'Total Questions',
            count: 27,
            trend: '+4.3%',
            color: 'danger',
            icon: 'ri-group-line',
          },
          {
            title: 'Total Posts',
            count: 13,
            trend: '-2.5%',
            color: 'info',
            icon: 'ri-article-line',
          },
        ].map((card, i) => (
          <div className="col-6 col-sm-6 col-lg-3 mb-2" key={i}>
            <div className={`card card-border-shadow-${card.color} h-100`}>
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className={`avatar-initial rounded-3 bg-label-${card.color}`}>
                      <i className={`tf-icons ${card.icon} ri-24px`}></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{card.count}</h4>
                </div>
                <h6 className="mb-0 fw-normal">{card.title}</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">{card.trend}</span>
                  <small className="text-muted">than last week</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Messages */}
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">
                Messages and Broadcast <i className="bi bi-chat-dots me-1"></i>
              </h5>
              {/* <button className="btn btn-sm btn-outline-secondary">
                <i className="ri-more-2-line ri-20px"></i>
              </button> */}
            </div>

            <div className="px-4 py-3 border-top border-bottom">
              <div className="d-flex justify-content-between">
                <h6 className="mb-0 text-uppercase fs-6 fw-normal">Messages</h6>
                <div className="d-flex gap-4">
                  <h6 className="mb-0 text-uppercase fs-6 fw-normal">Broadcast</h6>
                  <h6 className="mb-0 text-uppercase fs-6 fw-normal">Actions</h6>
                </div>
              </div>
            </div>

            <div className="card-body pt-4">
              {[
                ['Maven Analytics', 'Business Intelligence', 33],
                ['Bentlee Emblin', 'Digital Marketing', 52],
                ['Benedetto Rossiter', 'UI/UX Design', 12],
                ['Beverlie Krabbe', 'React Native', 8],
              ].map(([name, title, count], i) => (
                <div
                  className="d-flex justify-content-between align-items-center flex-column flex-md-row mb-4"
                  key={i}
                >
                  <div className="d-flex align-items-center w-100 w-md-60 mb-2 mb-md-0">
                    <div>
                      <h6 className="mb-0">{name}</h6>
                      <small>{title}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="alert alert-primary border py-1 px-2 mb-0 text-primary"
                      style={{ fontSize: '0.75rem', background: 'transparent' }}
                    >
                      {count}
                    </span>
                    <button className="btn btn-sm btn-outline-primary">
                      <i className="ri-megaphone-line"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="ri-mail-send-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Form */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between">
              <h5 className="mb-0">Add Notification</h5>
              {/* <button className="btn btn-sm btn-outline-secondary">
                <i className="ri-more-2-line ri-20px"></i>
              </button> */}
            </div>
            <div className="card-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="messageName" className="form-label">
                    Name
                  </label>
                  <input type="text" className="form-control" id="messageName" placeholder="Enter Name" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="messageText" className="form-label">
                    Message
                  </label>
                  <textarea className="form-control" rows="3" placeholder="Enter your message" required></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="messageDuration" className="form-label">
                    Date Duration
                  </label>
                  <input type="date" className="form-control" id="messageDuration" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add Notification
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Notification <i className="bi bi-bell-fill"></i></h5>
          {/* <button className="btn btn-sm btn-outline-secondary">
            <i className="ri-more-2-line ri-20px"></i>
          </button> */}
        </div>

        <div className="px-4 py-3 border-top border-bottom">
          <div className="d-flex justify-content-between">
            <h6 className="mb-0 text-uppercase fs-6 fw-normal">Messages</h6>
            <div className="d-flex gap-4">
              <h6 className="mb-0 text-uppercase fs-6 fw-normal">Broadcast</h6>
              <h6 className="mb-0 text-uppercase fs-6 fw-normal">Actions</h6>
            </div>
          </div>
        </div>

        <div className="card-body pt-4">
          {[
            ['Maven Analytics', 'Business Intelligence', 33],
            ['Bentlee Emblin', 'Digital Marketing', 52],
            ['Benedetto Rossiter', 'UI/UX Design', 12],
            ['Beverlie Krabbe', 'React Native', 8],
          ].map(([name, topic, count], i) => (
            <div
              className="d-flex justify-content-between align-items-center flex-column flex-md-row mb-4"
              key={i}
            >
              <div>
                <h6 className="mb-0">{name}</h6>
                <small>{topic}</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  className="alert alert-primary border py-1 px-2 mb-0 text-primary"
                  style={{ fontSize: '0.75rem', background: 'transparent' }}
                >
                  {count}
                </span>
                <button className="btn btn-sm btn-outline-primary" title="Broadcast">
                  <i className="ri-megaphone-line"></i>
                </button>
                <button className="btn btn-sm btn-outline-danger" title="Send Personally">
                  <i className="ri-mail-send-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 text-center text-muted small">
        © {new Date().getFullYear()}, made with <span className="text-danger">❤</span> by{' '}
        <a href="https://www.coinagesoft.com/" target="_blank" rel="noopener noreferrer">
          Coinage.in
        </a>
      </footer>
    </div>
  );
}
