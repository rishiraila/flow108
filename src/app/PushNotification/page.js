'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { createNotification, listNotifications, editNotification, deleteNotification } from '../utils/notificationApi';
import { fetchAllUsers } from '../utils/api';
import { useAlert } from '../utils/alertcontxt';
import { useConfirm } from '../utils/confirmContext';

export default function PushNotificationPage() {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0
  });

  const [formData, setFormData] = useState({
    Title: '',
    Message: '',
    ScheduledTime: '',
    TargetUserIds: [],
    SendToAll: false,
    SendNow: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('CreatedOn_desc');

  // Filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter(notification =>
      notification.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.Message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'CreatedOn_asc':
          return new Date(a.CreatedOn) - new Date(b.CreatedOn);
        case 'CreatedOn_desc':
          return new Date(b.CreatedOn) - new Date(a.CreatedOn);
        case 'Status':
          return a.Status.localeCompare(b.Status);
        case 'Title':
          return a.Title.localeCompare(b.Title);
        default:
          return 0;
      }
    });

    return filtered; // Show all filtered notifications in scroll view
  }, [notifications, searchTerm, sortBy]);

  // Fetch notifications and users on load
  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  // Calculate stats when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      const newStats = calculateStats(notifications);
      setStats(newStats);
    } else {
      setStats({
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0
      });
    }
  }, [notifications]);

  const calculateStats = (notifs) => {
    const total = notifs.length;
    const sent = notifs.filter(n => n.Status === 'Sent').length;
    const pending = notifs.filter(n => n.Status === 'Pending').length;
    const failed = notifs.filter(n => n.Status === 'Failed').length;
    return { total, sent, pending, failed };
  };

  const fetchNotifications = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      const data = await listNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setApiError(err.message || 'Failed to fetch notifications');
    } finally {
      setApiLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'TargetUserIds') {
      const selected = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selected
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert datetime-local to API format or empty string if not set
      const scheduledTime = formData.ScheduledTime ? new Date(formData.ScheduledTime).toISOString().slice(0, 19) : '';

      const payload = {
        Title: formData.Title,
        Message: formData.Message,
        ScheduledTime: scheduledTime,
        TargetUserIds: formData.TargetUserIds,
        SendToAll: formData.SendToAll,
        SendNow: formData.SendNow
      };

      await createNotification(payload);

      // Reset form
      setFormData({
        Title: '',
        Message: '',
        ScheduledTime: '',
        TargetUserIds: [],
        SendToAll: false,
        SendNow: false
      });

      // Refresh notifications
      fetchNotifications();

      showAlert('Notification created successfully!', 'success');
    } catch (err) {
      console.error('Error creating notification:', err);
      showAlert(err.message || 'Failed to create notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification({
      ...notification,
      ScheduledTime: notification.ScheduledTime ? new Date(notification.ScheduledTime).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
    setEditError(null);
    setEditSuccess(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const scheduledTime = new Date(editingNotification.ScheduledTime).toISOString().slice(0, 19);

      const payload = {
        Title: editingNotification.Title,
        Message: editingNotification.Message,
        ScheduledTime: scheduledTime,
        TargetUserId: editingNotification.TargetUserId
      };

      await editNotification(editingNotification.Id, payload);

      showAlert('Notification updated successfully!', 'success');

      // Refresh notifications
      fetchNotifications();

      // Close modal
      setShowEditModal(false);
      setEditingNotification(null);
    } catch (err) {
      console.error('Error updating notification:', err);
      setEditError(err.message || 'Failed to update notification');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) return;

    try {
      setDeleteLoading(true);

      await deleteNotification(id);

      // Remove from state
      setNotifications(prev => prev.filter(n => n.Id !== id));

      window.alert('Notification deleted successfully!');
    } catch (err) {
      console.error('Error deleting notification:', err);
      window.alert(err.message || 'Failed to delete notification');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-6 g-6">
          {/* Stats Cards */}
          {[
            {
              title: 'Total Notifications',
              count: stats.total,
              color: 'primary',
              icon: 'ri-notification-3-line',
            },
            {
              title: 'Sent',
              count: stats.sent,
              color: 'success',
              icon: 'ri-check-circle-line',
            },
            {
              title: 'Pending',
              count: stats.pending,
              color: 'warning',
              icon: 'ri-time-line',
            },
            {
              title: 'Failed',
              count: stats.failed,
              color: 'danger',
              icon: 'ri-error-warning-line',
            },
          ].map((stat, i) => (
            <div className="col-6 col-sm-6 col-lg-3 mb-2" key={i}>
              <div className={`card card-border-shadow-${stat.color} h-100`}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className={`avatar-initial rounded-3 bg-label-${stat.color}`}>
                        <i className={`tf-icons ${stat.icon} ri-24px`}></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{stat.count}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">{stat.title}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Create Notification</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="Title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="Title"
                      name="Title"
                      placeholder="Enter notification title"
                      required
                      value={formData.Title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="Message" className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      id="Message"
                      name="Message"
                      rows="3"
                      placeholder="Enter notification message"
                      required
                      value={formData.Message}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ScheduledTime" className="form-label">Scheduled Time (optional)</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="ScheduledTime"
                      name="ScheduledTime"
                      value={formData.ScheduledTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="TargetUserIds" className="form-label">Target Users (hold Ctrl to select multiple)</label>
                    <select
                      className="form-select"
                      id="TargetUserIds"
                      name="TargetUserIds"
                      multiple
                      value={formData.TargetUserIds}
                      onChange={handleInputChange}
                      style={{ height: '150px' }}
                    >
                      {Object.entries(users).map(([id, user]) => (
                        <option key={id} value={id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="SendToAll"
                        name="SendToAll"
                        checked={formData.SendToAll}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="SendToAll">
                        Send to all users
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="SendNow"
                        name="SendNow"
                        checked={formData.SendNow}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="SendNow">
                        Send immediately
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Notification'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-3">Notifications</h5>
                <div className="d-flex gap-3 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ width: '200px' }}
                  >
                    <option value="CreatedOn_desc">Newest First</option>
                    <option value="CreatedOn_asc">Oldest First</option>
                    <option value="Status">Status</option>
                    <option value="Title">Title</option>
                  </select>
                </div>
              </div>
              <div className="card-body">
                {apiLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading notifications...</p>
                  </div>
                )}

                {apiError && (
                  <div className="alert alert-danger" role="alert">
                    {apiError}
                  </div>
                )}

                {!apiLoading && !apiError && notifications.length === 0 && (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-bell-slash display-1 text-muted"></i>
                    </div>
                    <h5 className="text-muted mb-2">No Notifications Found</h5>
                    <p className="text-muted mb-4">
                      There are no notifications available yet. Create your first notification to get started!
                    </p>
                  </div>
                )}

                <div className="row" style={{ maxHeight: '530px', overflowY: 'auto' }}>
                  {!apiLoading &&
                    filteredNotifications.map((notification) => (
                      <div className="card mb-3" key={notification.Id}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{notification.Title}</h6>
                              <p className="mb-2 text-muted small">{notification.Message}</p>
                              <div className="d-flex gap-2 mb-2">
                                <small className="text-muted">
                                  <i className="ri-calendar-line me-1"></i>
                                  {notification.CreatedOn ? new Date(notification.CreatedOn).toLocaleString() : 'N/A'}
                                </small>
                                <small className={`badge bg-${notification.Status === 'Sent' ? 'success' : notification.Status === 'Pending' ? 'warning' : 'danger'}`}>
                                  {notification.Status}
                                </small>
                              </div>
                              <small className="text-muted">
                                Recipients: {notification.Recipients ? notification.Recipients.map(recipient => users[recipient.UserId]?.name || recipient.UserId).join(', ') : (users[notification.TargetUserId]?.name || notification.TargetUserId)}
                              </small>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditNotification(notification)}
                                title="Edit"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteNotification(notification.Id)}
                                title="Delete"
                              >
                                <i className="ri-delete-bin-line"></i>
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
        </div>

        {/* Edit Modal */}
        {showEditModal && editingNotification && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Notification</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {editError && (
                    <div className="alert alert-danger" role="alert">
                      {editError}
                    </div>
                  )}
                  <form onSubmit={handleEditSubmit}>
                    <div className="mb-3">
                      <label htmlFor="editTitle" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editTitle"
                        name="Title"
                        placeholder="Enter notification title"
                        required
                        value={editingNotification.Title || ''}
                        onChange={handleEditFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editMessage" className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        id="editMessage"
                        name="Message"
                        rows="3"
                        placeholder="Enter notification message"
                        required
                        value={editingNotification.Message || ''}
                        onChange={handleEditFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editScheduledTime" className="form-label">Scheduled Time</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="editScheduledTime"
                        name="ScheduledTime"
                        required
                        value={editingNotification.ScheduledTime || ''}
                        onChange={handleEditFormChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editTargetUserId" className="form-label">Target User</label>
                      <select
                        className="form-select"
                        id="editTargetUserId"
                        name="TargetUserId"
                        required
                        value={editingNotification.TargetUserId || ''}
                        onChange={handleEditFormChange}
                      >
                        <option value="">Select a user</option>
                        {Object.entries(users).map(([id, user]) => (
                          <option key={id} value={id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={editLoading}
                      >
                        {editLoading ? 'Updating...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="content-footer footer bg-footer-theme">
          <div className="container-xxl">
            <div className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
              <div className="text-body mb-2 mb-md-0">
                © {new Date().getFullYear()}, made with{' '}
                <span className="text-danger">
                  <i className="tf-icons ri-heart-fill"></i>
                </span>{' '}
                by
                <a
                  href="https://www.coinagesoft.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {' '}
                  Coinage.in
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
