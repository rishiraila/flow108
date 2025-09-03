"use client";

import React, { createContext, useState, useContext } from "react";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [confirm, setConfirm] = useState(null);

  const showConfirm = (message, onConfirm, onCancel) => {
    setConfirm({ message, onConfirm, onCancel });
  };

  const handleConfirm = () => {
    if (confirm?.onConfirm) confirm.onConfirm();
    setConfirm(null);
  };

  const handleCancel = () => {
    if (confirm?.onCancel) confirm.onCancel();
    setConfirm(null);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title d-flex align-items-center">
                  <i className="ri-alert-line me-2"></i>
                  Confirm Action
                </h5>
                <button type="button" className="btn-close btn-close-dark" onClick={handleCancel}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="mb-3">
                  <i className="ri-question-line text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <p className="mb-0 fs-5">{confirm.message}</p>
              </div>
              <div className="modal-footer justify-content-center border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 me-3"
                  onClick={handleCancel}
                >
                  <i className="ri-close-line me-1"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirm}
                >
                  <i className="ri-check-line me-1"></i>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
