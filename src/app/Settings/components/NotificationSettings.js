"use client";

import React, { useState } from "react";

export default function NotificationSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);

  const notificationTypes = [
    {
      id: 'newUser',
      label: 'New User Registration',
      description: 'Notify when a new user signs up'
    },
    {
      id: 'newQuestion',
      label: 'New Questions',
      description: 'Notify when users post new questions'
    },
    {
      id: 'newPost',
      label: 'Forum Posts',
      description: 'Notify when users create new forum posts'
    },
    {
      id: 'workoutCompleted',
      label: 'Workout Completions',
      description: 'Notify when users complete workouts'
    },
    {
      id: 'dietPlanAssigned',
      label: 'Diet Plan Assignments',
      description: 'Notify when diet plans are assigned to users'
    },
    {
      id: 'systemAlerts',
      label: 'System Alerts',
      description: 'Important system notifications and alerts'
    }
  ];

  const handleChange = (channel, type, value) => {
    setFormData(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }));
    setIsDirty(true);
  };

  const handleChannelToggle = (channel, enabled) => {
    setFormData(prev => ({
      ...prev,
      [channel]: enabled
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData(settings);
    setIsDirty(false);
  };

  const handleToggleAll = (channel, enable) => {
    const updatedSettings = { ...formData };
    
    notificationTypes.forEach(type => {
      if (updatedSettings[channel] && typeof updatedSettings[channel] === 'object') {
        updatedSettings[channel][type.id] = enable;
      }
    });
    
    setFormData(updatedSettings);
    setIsDirty(true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 mb-4">
            <h6 className="mb-3">Notification Channels</h6>
            
            <div className="row">
              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotifications"
                        checked={formData.email !== false}
                        onChange={(e) => handleChannelToggle("email", e.target.checked)}
                      />
                      <label className="form-check-label fw-bold" htmlFor="emailNotifications">
                        <i className="ri-mail-line me-2"></i>
                        Email Notifications
                      </label>
                    </div>
                  </div>
                  {formData.email !== false && (
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Notification Types</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleToggleAll("email", true)}
                        >
                          Enable All
                        </button>
                      </div>
                      {notificationTypes.map(type => (
                        <div key={type.id} className="form-check form-switch mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`email-${type.id}`}
                            checked={formData.email && formData.email[type.id] !== false}
                            onChange={(e) => handleChange("email", type.id, e.target.checked)}
                          />
                          <label className="form-check-label small" htmlFor={`email-${type.id}`}>
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smsNotifications"
                        checked={formData.sms !== false}
                        onChange={(e) => handleChannelToggle("sms", e.target.checked)}
                      />
                      <label className="form-check-label fw-bold" htmlFor="smsNotifications">
                        <i className="ri-message-2-line me-2"></i>
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                  {formData.sms !== false && (
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Notification Types</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleToggleAll("sms", true)}
                        >
                          Enable All
                        </button>
                      </div>
                      {notificationTypes.map(type => (
                        <div key={type.id} className="form-check form-switch mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`sms-${type.id}`}
                            checked={formData.sms && formData.sms[type.id] !== false}
                            onChange={(e) => handleChange("sms", type.id, e.target.checked)}
                          />
                          <label className="form-check-label small" htmlFor={`sms-${type.id}`}>
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-header">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pushNotifications"
                        checked={formData.push !== false}
                        onChange={(e) => handleChannelToggle("push", e.target.checked)}
                      />
                      <label className="form-check-label fw-bold" htmlFor="pushNotifications">
                        <i className="ri-notification-3-line me-2"></i>
                        Push Notifications
                      </label>
                    </div>
                  </div>
                  {formData.push !== false && (
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Notification Types</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleToggleAll("push", true)}
                        >
                          Enable All
                        </button>
                      </div>
                      {notificationTypes.map(type => (
                        <div key={type.id} className="form-check form-switch mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`push-${type.id}`}
                            checked={formData.push && formData.push[type.id] !== false}
                            onChange={(e) => handleChange("push", type.id, e.target.checked)}
                          />
                          <label className="form-check-label small" htmlFor={`push-${type.id}`}>
                            {type.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 mb-4">
            <h6 className="mb-3">Notification Preferences</h6>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="quietHoursStart" className="form-label">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  className="form-control"
                  id="quietHoursStart"
                  value={formData.quietHours?.start || '22:00'}
                  onChange={(e) => handleChange("quietHours", { ...formData.quietHours, start: e.target.value })}
                />
                <div className="form-text">
                  Start time for do-not-disturb mode
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="quietHoursEnd" className="form-label">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  className="form-control"
                  id="quietHoursEnd"
                  value={formData.quietHours?.end || '07:00'}
                  onChange={(e) => handleChange("quietHours", { ...formData.quietHours, end: e.target.value })}
                />
                <div className="form-text">
                  End time for do-not-disturb mode
                </div>
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="urgentOverride"
                checked={formData.urgentOverride !== false}
                onChange={(e) => handleChange("urgentOverride", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="urgentOverride">
                Allow Urgent Notifications During Quiet Hours
              </label>
              <div className="form-text">
                Critical alerts will still come through during quiet hours
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isDirty}
          >
            Save Notification Settings
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={!isDirty}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-4">
        <h6 className="mb-3">Current Notification Settings</h6>
        <div className="card">
          <div className="card-body">
            <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
              {JSON.stringify({
                email: formData.email !== false ? 'Enabled' : 'Disabled',
                sms: formData.sms !== false ? 'Enabled' : 'Disabled',
                push: formData.push !== false ? 'Enabled' : 'Disabled',
                quietHours: formData.quietHours ? `${formData.quietHours.start} - ${formData.quietHours.end}` : 'Not set',
                urgentOverride: formData.urgentOverride !== false ? 'Enabled' : 'Disabled'
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
