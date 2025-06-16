'use client';
import React, { useState } from 'react';

export default function DashboardPage() {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      name: 'Email Marketing Campaign',
      code: 'EMC2023',
      discount: 24,
      validity: '2023-12-31',
      usage: 'New Subscribers',
    },
    {
      id: 2,
      name: 'Google Workspace',
      code: 'GW2023',
      discount: -12,
      validity: '2024-01-31',
      usage: 'Enterprise Customers',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ name: '', code: '', discount: '', validity: '', usage: '' });
  const [editCoupon, setEditCoupon] = useState(null);

  const handleAddCoupon = () => {
    const id = coupons.length + 1;
    setCoupons([...coupons, { ...newCoupon, id }]);
    setShowAddModal(false);
    setNewCoupon({ name: '', code: '', discount: '', validity: '', usage: '' });
  };

  const handleDeleteCoupon = (id) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter((c) => c.id !== id));
    }
  };

  const handleEditClick = (coupon) => {
    setEditCoupon(coupon);
    setShowEditModal(true);
  };

  const handleUpdateCoupon = () => {
    setCoupons(coupons.map((c) => (c.id === editCoupon.id ? editCoupon : c)));
    setShowEditModal(false);
    setEditCoupon(null);
  };

  return (
    <div className="container-xxl p-4">
      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
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

        <div className="col-sm-6 col-lg-3">
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

        <div className="col-sm-6 col-lg-3">
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

        <div className="col-sm-6 col-lg-3">
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

      {/* Coupons Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Coupons</h5>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>
            Add Coupon
          </button>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th className="text-end">Discount</th>
                <th className="text-end">Validity</th>
                <th>Usage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.name}</td>
                  <td>
                    <span className="badge bg-primary">{coupon.code}</span>
                  </td>
                  <td className={`text-end fw-bold ${coupon.discount >= 0 ? 'text-success' : 'text-danger'}`}>
                    {coupon.discount}%
                  </td>
                  <td className="text-end">{coupon.validity}</td>
                  <td>{coupon.usage}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditClick(coupon)}>
                      <i className="ri-edit-2-line"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCoupon(coupon.id)}>
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No coupons available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h5 className="mb-3">Add Coupon</h5>
            <input className="form-control mb-2" placeholder="Name" value={newCoupon.name}
              onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })} />
            <input className="form-control mb-2" placeholder="Code" value={newCoupon.code}
              onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} />
            <input className="form-control mb-2" type="number" placeholder="Discount %" value={newCoupon.discount}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })} />
            <input className="form-control mb-2" type="date" value={newCoupon.validity}
              onChange={(e) => setNewCoupon({ ...newCoupon, validity: e.target.value })} />
            <input className="form-control mb-3" placeholder="Usage" value={newCoupon.usage}
              onChange={(e) => setNewCoupon({ ...newCoupon, usage: e.target.value })} />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddCoupon}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && editCoupon && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h5 className="mb-3">Edit Coupon</h5>
            <input className="form-control mb-2" placeholder="Name" value={editCoupon.name}
              onChange={(e) => setEditCoupon({ ...editCoupon, name: e.target.value })} />
            <input className="form-control mb-2" placeholder="Code" value={editCoupon.code}
              onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value })} />
            <input className="form-control mb-2" type="number" placeholder="Discount %" value={editCoupon.discount}
              onChange={(e) => setEditCoupon({ ...editCoupon, discount: e.target.value })} />
            <input className="form-control mb-2" type="date" value={editCoupon.validity}
              onChange={(e) => setEditCoupon({ ...editCoupon, validity: e.target.value })} />
            <input className="form-control mb-3" placeholder="Usage" value={editCoupon.usage}
              onChange={(e) => setEditCoupon({ ...editCoupon, usage: e.target.value })} />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleUpdateCoupon}>Update</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .modal-content-custom {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
