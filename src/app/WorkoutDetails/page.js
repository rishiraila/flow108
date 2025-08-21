'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function WorkoutDetailsPage() {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('workoutId');

  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails();
    }
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    try {
      const response = await fetch(`https://flow108.coinagesoft.com/api/AdminWorkout/${workoutId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout details');
      }

      const data = await response.json();
      setWorkout(data.Data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="alert alert-warning" role="alert">
          No workout details found.
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">{workout.Name}</h5>
                <p className="text-muted mb-0">{workout.Description}</p>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <img 
                      src={workout.ImageUrl || '/assets/img/avatars/default-workout.jpg'} 
                      alt={workout.Name}
                      className="img-fluid rounded mb-3"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="d-flex flex-wrap gap-4 mb-3">
                      <div>
                        <span className="text-muted">Duration:</span>
                        <h6 className="mb-0">{workout.Duration} minutes</h6>
                      </div>
                      <div>
                        <span className="text-muted">Intensity:</span>
                        <h6 className="mb-0">
                          <span className={`badge bg-${workout.Intensity === 'High' ? 'danger' : workout.Intensity === 'Medium' ? 'warning' : 'success'}`}>
                            {workout.Intensity}
                          </span>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Workout Steps</h5>
                <p className="text-muted mb-0">Follow these steps to complete your workout</p>
              </div>
              <div className="card-body">
                <div className="timeline timeline-dashed">
                  {workout.Steps && workout.Steps.map((step, index) => (
                    <div key={step.Id} className="timeline-item timeline-item-primary">
                      <span className="timeline-indicator timeline-indicator-primary">
                        <i className="ri-checkbox-blank-circle-fill"></i>
                      </span>
                      <div className="timeline-event">
                        <div className="timeline-header">
                          <h6 className="mb-0">Step {step.Order}: {step.Title}</h6>
                          <small className="text-muted">{step.Duration} minutes</small>
                        </div>
                        <p className="mb-2">{step.Description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <button className="btn btn-primary" onClick={() => window.history.back()}>
                <i className="ri-arrow-left-line me-1"></i>
                Back to Workouts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
