"use client";

import React, { useState } from "react";

export default function ThemeSettings({ settings, onSave }) {
  const [formData, setFormData] = useState(settings);
  const [isDirty, setIsDirty] = useState(false);

  const themes = [
    { id: 'light', label: 'Light', icon: 'ri-sun-line' },
    { id: 'dark', label: 'Dark', icon: 'ri-moon-line' },
    { id: 'auto', label: 'Auto (System)', icon: 'ri-computer-line' }
  ];

  const colorOptions = [
    { value: '#666cff', label: 'Primary Purple' },
    { value: '#6d788d', label: 'Secondary Gray' },
    { value: '#72e128', label: 'Success Green' },
    { value: '#26c6f9', label: 'Info Blue' },
    { value: '#fdb528', label: 'Warning Orange' },
    { value: '#ff4d49', label: 'Danger Red' },
    { value: '#4b4b4b', label: 'Dark Gray' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsDirty(false);
    // Apply theme changes immediately
    applyThemeChanges(formData);
  };

  const handleReset = () => {
    setFormData(settings);
    setIsDirty(false);
  };

  const applyThemeChanges = (newSettings) => {
    // Apply theme mode
    if (newSettings.mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (newSettings.mode === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else if (newSettings.mode === 'auto') {
      // Auto mode - follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    // Apply custom colors if needed
    if (newSettings.primaryColor && newSettings.accentColor) {
      document.documentElement.style.setProperty('--bs-primary', newSettings.primaryColor);
      document.documentElement.style.setProperty('--bs-secondary', newSettings.accentColor);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-4">
            <label className="form-label">Theme Mode</label>
            <div className="d-flex gap-3">
              {themes.map(theme => (
                <div key={theme.id} className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="themeMode"
                    id={`theme-${theme.id}`}
                    value={theme.id}
                    checked={formData.mode === theme.id}
                    onChange={(e) => handleChange("mode", e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`theme-${theme.id}`}>
                    <i className={`${theme.icon} me-1`}></i>
                    {theme.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="primaryColor" className="form-label">
              Primary Color
            </label>
            <div className="input-group">
              <input
                type="color"
                className="form-control form-control-color"
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                title="Choose primary color"
              />
              <select
                className="form-select"
                value={formData.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
              >
                <option value="">Select a color</option>
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="accentColor" className="form-label">
              Accent Color
            </label>
            <div className="input-group">
              <input
                type="color"
                className="form-control form-control-color"
                id="accentColor"
                value={formData.accentColor}
                onChange={(e) => handleChange("accentColor", e.target.value)}
                title="Choose accent color"
              />
              <select
                className="form-select"
                value={formData.accentColor}
                onChange={(e) => handleChange("accentColor", e.target.value)}
              >
                <option value="">Select a color</option>
                {colorOptions.map(color => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!isDirty}
          >
            Save Theme Settings
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
        <h6 className="mb-3">Theme Preview</h6>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Primary Color</h6>
              </div>
              <div className="card-body">
                <div 
                  className="color-preview" 
                  style={{
                    backgroundColor: formData.primaryColor,
                    height: '60px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {formData.primaryColor}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Accent Color</h6>
              </div>
              <div className="card-body">
                <div 
                  className="color-preview" 
                  style={{
                    backgroundColor: formData.accentColor,
                    height: '60px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {formData.accentColor}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
