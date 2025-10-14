'use client';
import React, { useState, useEffect } from 'react';
import { fetchBanners, addBanner } from '../utils/api';

export default function BannersTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'John Doe',
      message: 'Great service! Highly recommend.',
      date: '2023-10-01',
      imageUrl: '',
    },
    {
      id: 2,
      name: 'Jane Smith',
      message: 'Amazing experience, will come back.',
      date: '2023-10-05',
      imageUrl: '',
    },
  ]);

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', message: '', imageUrl: '' });
  const [newBanner, setNewBanner] = useState({ title: '', description: '', imageFile: null });

  // Load banners on component mount
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        const bannerData = await fetchBanners();
        // Transform API data to match component structure
        const transformedBanners = bannerData.map((banner, index) => ({
          id: banner.Id || index + 1,
          title: banner.Name,
          description: '', // API doesn't have description
          imageUrl: banner.ImagePath ? `https://flow108.coinagesoft.com${banner.ImagePath}` : '',
        }));
        setBanners(transformedBanners);
        setError(null);
      } catch (err) {
        console.error('Error loading banners:', err);
        setError('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  const handleAddTestimonial = () => {
    const id = testimonials.length + 1;
    const date = new Date().toISOString().split('T')[0];
    setTestimonials([...testimonials, { ...newTestimonial, id, date }]);
    setShowAddTestimonialModal(false);
    setNewTestimonial({ name: '', message: '', imageUrl: '' });
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.imageFile) {
      alert('Please provide a title and select an image file.');
      return;
    }

    try {
      const result = await addBanner(newBanner.title, newBanner.imageFile);
      if (result.status) {
        // Reload banners after successful addition
        const bannerData = await fetchBanners();
        const transformedBanners = bannerData.map((banner, index) => ({
          id: banner.Id || index + 1,
          title: banner.Name,
          description: '',
          imageUrl: banner.ImagePath ? `https://flow108.coinagesoft.com${banner.ImagePath}` : '',
        }));
        setBanners(transformedBanners);
        setShowAddBannerModal(false);
        setNewBanner({ title: '', description: '', imageFile: null });
      } else {
        alert('Failed to add banner: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner. Please try again.');
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'testimonial') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewTestimonial({ ...newTestimonial, imageUrl: event.target.result });
        };
        reader.readAsDataURL(file);
      } else if (type === 'banner') {
        setNewBanner({ ...newBanner, imageFile: file });
      }
    }
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
                    <i className="tf-icons ri-image-line ri-24px"></i>
                  </span>
                </div>
                <h4 className="mb-0">{banners.length}</h4>
              </div>
              <h6 className="mb-0 fw-normal">Total Banners</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+{banners.filter(b => b.imageUrl).length}</span>
                <small className="text-muted">with images</small>
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
                    <i className="ri-star-line ri-24px"></i>
                  </span>
                </div>
                <h4 className="mb-0">{testimonials.length}</h4>
              </div>
              <h6 className="mb-0 fw-normal">Total Testimonials</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+{testimonials.filter(t => t.imageUrl).length}</span>
                <small className="text-muted">with images</small>
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
                    <i className="ri-eye-line ri-24px"></i>
                  </span>
                </div>
                <h4 className="mb-0">{banners.length + testimonials.length}</h4>
              </div>
              <h6 className="mb-0 fw-normal">Total Items</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+{banners.filter(b => b.imageUrl).length + testimonials.filter(t => t.imageUrl).length}</span>
                <small className="text-muted">with images</small>
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
                    <i className="ri-calendar-line ri-24px"></i>
                  </span>
                </div>
                <h4 className="mb-0">{new Set(testimonials.map(t => t.date)).size}</h4>
              </div>
              <h6 className="mb-0 fw-normal">Unique Dates</h6>
              <p className="mb-0">
                <span className="me-1 fw-medium">+{testimonials.length}</span>
                <small className="text-muted">testimonials</small>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Testimonials</h5>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddTestimonialModal(true)}>
            Add Testimonial
          </button>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Message</th>
                <th>Date</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td>{testimonial.name}</td>
                  <td>{testimonial.message}</td>
                  <td>{testimonial.date}</td>
                  <td>
                    {testimonial.imageUrl ? (
                      <img src={testimonial.imageUrl} alt={testimonial.name} style={{ width: '100px', height: 'auto' }} />
                    ) : (
                      'No Image'
                    )}
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No testimonials available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banners Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Banners</h5>
          <button className="btn btn-sm btn-primary" onClick={() => setShowAddBannerModal(true)}>
            Add Banner
          </button>
        </div>
        <div className="card-body table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>{banner.title}</td>
                  <td>{banner.description}</td>
                  <td>
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} style={{ width: '100px', height: 'auto' }} />
                    ) : (
                      'No Image'
                    )}
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No banners available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Testimonial Modal */}
      {showAddTestimonialModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h5 className="mb-3">Add Testimonial</h5>
            <input className="form-control mb-2" placeholder="Name" value={newTestimonial.name}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })} />
            <textarea className="form-control mb-2" placeholder="Message" rows="3" value={newTestimonial.message}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })} />
            <input type="file" className="form-control mb-3" accept="image/*"
              onChange={(e) => handleImageUpload(e, 'testimonial')} />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowAddTestimonialModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddTestimonial}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Banner Modal */}
      {showAddBannerModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h5 className="mb-3">Add Banner</h5>
            <input className="form-control mb-2" placeholder="Title" value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} />
            <textarea className="form-control mb-2" placeholder="Description" rows="2" value={newBanner.description}
              onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })} />
            <input type="file" className="form-control mb-3" accept="image/*"
              onChange={(e) => handleImageUpload(e, 'banner')} />
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={() => setShowAddBannerModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddBanner}>Add</button>
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
