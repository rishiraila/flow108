"use client";

import React, { useState, useEffect } from "react";
import ApiSettings from "./components/ApiSettings";
import ThemeSettings from "./components/ThemeSettings";
import PreferenceSettings from "./components/PreferenceSettings";
import NotificationSettings from "./components/NotificationSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("api");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from localStorage or default configuration
      const savedSettings = localStorage.getItem("adminSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Set default settings
        setSettings({
          api: {
            baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://flow108.coinagesoft.com/api',
            timeout: 10000,
            maxRetries: 3,
            retryDelay: 1000
          },
          theme: {
            mode: 'light',
            primaryColor: '#666cff',
            accentColor: '#6d788d'
          },
          preferences: {
            itemsPerPage: 10,
            autoRefresh: true,
            refreshInterval: 30000
          },
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category, newSettings) => {
    try {
      const updatedSettings = {
        ...settings,
        [category]: newSettings
      };
      
      setSettings(updatedSettings);
      localStorage.setItem("adminSettings", JSON.stringify(updatedSettings));
      
      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
      
      // If API settings changed, we might need to update the API client
      if (category === "api") {
        // This would trigger a refresh or update of API configuration
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const tabs = [
    { id: "api", label: "API Configuration", icon: "ri-server-line" },
    { id: "theme", label: "Theme", icon: "ri-palette-line" },
    { id: "preferences", label: "Preferences", icon: "ri-settings-4-line" },
    { id: "notifications", label: "Notifications", icon: "ri-notification-3-line" }
  ];

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="text-center p-5">
            <div className="spinner-border" role="status"></div>
            <p className="mt-3">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="row">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-header">
                  <h4 className="card-title mb-0">Settings</h4>
                  <p className="card-subtitle">Manage application configuration and preferences</p>
                </div>
                <div className="card-body">
                  {/* Tab Navigation */}
                  <div className="nav-align-top mb-4">
                    <ul className="nav nav-tabs" role="tablist">
                      {tabs.map((tab) => (
                        <li key={tab.id} className="nav-item">
                          <button
                            type="button"
                            className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            <i className={`${tab.icon} me-2`}></i>
                            {tab.label}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {saveStatus && (
                        <div className={`alert ${saveStatus.includes("Error") ? "alert-danger" : "alert-success"} mb-4`}>
                          {saveStatus}
                        </div>
                      )}

                      <div className={`tab-pane fade ${activeTab === "api" ? "show active" : ""}`}>
                        <ApiSettings 
                          settings={settings.api} 
                          onSave={(newSettings) => saveSettings("api", newSettings)} 
                        />
                      </div>

                      <div className={`tab-pane fade ${activeTab === "theme" ? "show active" : ""}`}>
                        <ThemeSettings 
                          settings={settings.theme} 
                          onSave={(newSettings) => saveSettings("theme", newSettings)} 
                        />
                      </div>

                      <div className={`tab-pane fade ${activeTab === "preferences" ? "show active" : ""}`}>
                        <PreferenceSettings 
                          settings={settings.preferences} 
                          onSave={(newSettings) => saveSettings("preferences", newSettings)} 
                        />
                      </div>

                      <div className={`tab-pane fade ${activeTab === "notifications" ? "show active" : ""}`}>
                        <NotificationSettings 
                          settings={settings.notifications} 
                          onSave={(newSettings) => saveSettings("notifications", newSettings)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
