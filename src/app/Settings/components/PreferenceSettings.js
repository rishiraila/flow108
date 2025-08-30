"use client";

import React, { useState } from "react";

export default function PreferenceSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);

  const itemsPerPageOptions = [5, 10, 15, 20, 25, 50];
  const refreshIntervalOptions = [
    { value: 15000, label: '15 seconds' },
    { value: 30000, label: '30 seconds' },
    { value: 60000, label: '1 minute' },
    { value: 120000, label: '2 minutes' },
    { value: 300000, label: '5 minutes' }
  ];

  const handleChange = (field, value) => {
    const newValue = typeof value === 'boolean' ? value : 
                    (field === 'itemsPerPage' || field === 'refreshInterval' ? parseInt(value) : value);
    
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsDirty(false);
    // Apply preference changes immediately
    applyPreferenceChanges(formData);
  };

  const handleReset = () => {
    setFormData(settings);
    setIsDirty(false);
  };

  const applyPreferenceChanges = (newSettings) => {
    // Store preferences in localStorage for other components to access
    localStorage.setItem('userPreferences', JSON.stringify(newSettings));
    
    // Dispatch event for other components to listen to
    window.dispatchEvent(new CustomEvent('preferencesChanged', {
      detail: newSettings
    }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-4">
            <h6 className="mb-3">Display Preferences</h6>
            
            <div className="mb-3">
              <label htmlFor="itemsPerPage" className="form-label">
                Items Per Page
              </label>
              <select
                className="form-select"
                id="itemsPerPage"
                value={formData.itemsPerPage}
                onChange={(e) => handleChange("itemsPerPage", e.target.value)}
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option} items
                  </option>
                ))}
              </select>
              <div className="form-text">
                Number of items to display per page in lists and tables
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="autoRefresh"
                checked={formData.autoRefresh}
                onChange={(e) => handleChange("autoRefresh", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="autoRefresh">
                Enable Auto Refresh
              </label>
              <div className="form-text">
                Automatically refresh data at regular intervals
              </div>
            </div>

            {formData.autoRefresh && (
              <div className="mb-3">
                <label htmlFor="refreshInterval" className="form-label">
                  Refresh Interval
                </label>
                <select
                  className="form-select"
                  id="refreshInterval"
                  value={formData.refreshInterval}
                  onChange={(e) => handleChange("refreshInterval", e.target.value)}
                  disabled={!formData.autoRefresh}
                >
                  {refreshIntervalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  How often to automatically refresh data
                </div>
              </div>
            )}
          </div>

          <div className="col-md-6 mb-4">
            <h6 className="mb-3">Interface Preferences</h6>
            
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="compactMode"
                checked={formData.compactMode || false}
                onChange={(e) => handleChange("compactMode", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="compactMode">
                Compact Mode
              </label>
              <div className="form-text">
                Use more compact spacing for lists and tables
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="showAvatars"
                checked={formData.showAvatars !== false}
                onChange={(e) => handleChange("showAvatars", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showAvatars">
                Show User Avatars
              </label>
              <div className="form-text">
                Display user profile pictures where available
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="animations"
                checked={formData.animations !== false}
                onChange={(e) => handleChange("animations", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="animations">
                Enable Animations
              </label>
              <div className="form-text">
                Enable smooth transitions and animations
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <h6 className="mb-3">Data Preferences</h6>
            
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="cacheData"
                checked={formData.cacheData || true}
                onChange={(e) => handleChange("cacheData", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="cacheData">
                Cache API Responses
              </label>
              <div className="form-text">
                Store API responses locally to reduce server requests
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="offlineMode"
                checked={formData.offlineMode || false}
                onChange={(e) => handleChange("offlineMode", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="offlineMode">
                Enable Offline Mode
              </label>
              <div className="form-text">
                Allow viewing cached data when offline
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
            Save Preferences
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
        <h6 className="mb-3">Current Preferences</h6>
        <div className="card">
          <div className="card-body">
            <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
              {JSON.stringify({
                itemsPerPage: formData.itemsPerPage + ' items per page',
                autoRefresh: formData.autoRefresh ? 'Enabled' : 'Disabled',
                refreshInterval: formData.autoRefresh ? (formData.refreshInterval / 1000) + ' seconds' : 'N/A',
                compactMode: formData.compactMode ? 'Enabled' : 'Disabled',
                showAvatars: formData.showAvatars !== false ? 'Enabled' : 'Disabled',
                animations: formData.animations !== false ? 'Enabled' : 'Disabled',
                cacheData: formData.cacheData !== false ? 'Enabled' : 'Disabled',
                offlineMode: formData.offlineMode ? 'Enabled' : 'Disabled'
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
