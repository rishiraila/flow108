"use client";

import React, { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const [closing, setClosing] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setClosing(false);
    setTimeout(() => {
      setClosing(true);
      setTimeout(() => setAlert(null), 500);
    }, 5000); // auto-close after 5s
  };

  const closeAlert = () => {
    setClosing(true);
    setTimeout(() => setAlert(null), 500);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed ${closing ? 'slide-out-right' : 'slide-in-right'}`}
          style={{ top: "20px", right: "20px", zIndex: 1050, minWidth: "300px" }}
          role="alert"
        >
          <strong>{alert.type === "success" ? "Success!" : "Info!"}</strong>{" "}
          {alert.message}
          <button type="button" className="btn-close" onClick={closeAlert}></button>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
