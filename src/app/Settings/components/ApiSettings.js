"use client";

import React, { useState } from "react";

export default function ApiSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "timeout" || field === "maxRetries" || field === "retryDelay" 
        ? parseInt(value) || 0 
        : value
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

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info">
            <i className="ri-information-line me-2"></i>
            Changing API settings will reload the application to apply the new configuration.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="baseUrl" className="form-label">
              API Base URL
            </label>
            <input
              type="url"
              className="form-control"
              id="baseUrl"
              value={formData.baseUrl}
              onChange={(e) => handleChange("baseUrl", e.target.value)}
              placeholder="https://api.example.com"
              required
            />
            <div className="form-text">
              The base URL for all API requests
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="timeout" className="form-label">
              Timeout (ms)
            </label>
            <input
              type="number"
              className="form-control"
              id="timeout"
              value={formData.timeout}
              onChange={(e) => handleChange("timeout", e.target.value)}
              min="1000"
              max="60000"
              step="1000"
              required
            />
            <div className="form-text">
              Request timeout in milliseconds
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="maxRetries" className="form-label">
              Max Retries
            </label>
            <input
              type="number"
              className="form-control"
              id="maxRetries"
              value={formData.maxRetries}
              onChange={(e) => handleChange("maxRetries", e.target.value)}
              min="0"
              max="10"
              required
            />
            <div className="form-text">
              Maximum number of retry attempts
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="retryDelay" className="form-label">
              Retry Delay (ms)
            </label>
            <input
              type="number"
              className="form-control"
              id="retryDelay"
              value={formData.retryDelay}
              onChange={(e) => handleChange("retryDelay", e.target.value)}
              min="100"
              max="5000"
              step="100"
              required
            />
            <div className="form-text">
              Delay between retry attempts in milliseconds
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isDirty}
          >
            Save API Settings
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
        <h6 className="mb-3">Current API Configuration</h6>
        <div className="card">
          <div className="card-body">
            <pre className="mb-0" style={{ fontSize: '0.875rem' }}>
              {JSON.stringify({
                baseUrl: formData.baseUrl,
                timeout: formData.timeout + 'ms',
                maxRetries: formData.maxRetries,
                retryDelay: formData.retryDelay + 'ms'
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
