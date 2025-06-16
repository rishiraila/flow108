'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function RecipiesPage() {
  const [modals, setModals] = useState({
    chicken: false,
    mushroom: false,
    sprouts: false,
    addRecipe: false,
  });

  const openModal = (key) => {
    setModals((prev) => ({ ...prev, [key]: true }));
  };

  useEffect(() => {
    Object.entries(modals).forEach(([key, show]) => {
      if (show) {
        const id = `${key}Modal`;
        const modal = new window.bootstrap.Modal(document.getElementById(id));
        modal.show();
        const handler = () => setModals((prev) => ({ ...prev, [key]: false }));
        document.getElementById(id)?.addEventListener('hidden.bs.modal', handler);
        return () =>
          document.getElementById(id)?.removeEventListener('hidden.bs.modal', handler);
      }
    });
  }, [modals]);

  const recipeData = [
    {
      key: 'chicken',
      title: 'Chicken Curry Rice',
      image: '/assets/img/avatars/chicken-7249273_1280.jpg',
      badge: 'Lunch',
      badgeColor: 'primary',
      duration: '45–60 minutes',
      desc: 'Chicken Curry Rice is a flavorful dish rich in protein and spices. Easy to make, nutritious, perfect for meal prep, and satisfying.',
      level: 'Low',
      steps: [
        'Marinate chicken with yogurt, turmeric, chili, and salt',
        'Heat oil and sauté onions until golden brown',
        'Add ginger-garlic paste and cook till fragrant',
        'Mix in tomatoes and cook until soft and pulpy',
        'Add spices like cumin, coriander, and garam masala',
        'Stir in marinated chicken and cook until sealed',
        'Pour in water and simmer until chicken is tender',
        'Cook rice separately with a pinch of salt',
        'Serve hot chicken curry over freshly steamed rice',
        'Garnish with coriander leaves and a dash of lemon juice',
      ],
    },
    {
      key: 'mushroom',
      title: 'Mushroom Curry',
      image: '/assets/img/avatars/mushrooms-2459679_1280.jpg',
      badge: 'Dinner',
      badgeColor: 'danger',
      duration: '45 minutes',
      desc: 'Mushroom curry is a vegetarian dish packed with earthy flavors and creamy texture. Easy, nutritious, and perfect for dinner.',
      level: 'Medium',
      steps: [
        'Clean and slice mushrooms evenly',
        'Heat oil and sauté onions till golden',
        'Add ginger-garlic paste and cook until the raw smell disappears',
        'Mix in chopped tomatoes and cook until soft',
        'Stir in turmeric, cumin, coriander, and garam masala',
        'Add mushrooms and cook until they release water',
        'Pour in water or coconut milk for a creamy base',
        'Let simmer 10–15 mins, adjust salt/spices',
        'Garnish with coriander and serve hot',
      ],
    },
    {
      key: 'sprouts',
      title: 'Sprouts Salad',
      image: '/assets/img/avatars/gastronomy-2760200_1280.jpg',
      badge: 'Evening Snacks / Breakfast',
      badgeColor: 'success',
      duration: '10–15 minutes',
      desc: 'Sprouts Salad is a healthy, crunchy, and refreshing dish packed with protein and nutrients. Quick, light, and ideal for weight loss.',
      level: 'Easy',
      steps: [
        'Rinse and soak green gram overnight',
        'Steam or lightly boil sprouts (optional)',
        'Chop onions, tomatoes, cucumbers, chilies',
        'Combine with sprouts in a bowl',
        'Add lemon juice, salt, chaat masala',
        'Add coriander/mint for freshness',
        'Add pepper, cumin powder',
        'Toss and chill 10 mins',
        'Top with peanuts or pomegranate',
        'Serve cold',
      ],
    },
  ];

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="app-academy">
          <div className="card mb-6">
            <div className="card-header d-flex flex-wrap justify-content-between gap-4">
              <div>
                <h5 className="mb-0">Recipies</h5>
                <p className="mb-0 text-body">Stay tuned for more recipies</p>
              </div>
              <div className="d-flex gap-3 align-items-center">
                <select className="form-select form-select-sm w-px-250">
                  <option>All Recipes</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                </select>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => openModal('addRecipe')}
                >
                  Add Recipe
                </button>
              </div>
            </div>

            <div className="card-body mt-1">
              <div className="row gy-6">
                {recipeData.map((r) => (
                  <div key={r.key} className="col-sm-6 col-lg-4">
                    <div className="card shadow-none border p-2 h-100 rounded-3">
                      <div className="rounded-4 text-center mb-4">
                        <Image
                          src={r.image}
                          width={500}
                          height={300}
                          alt={r.title}
                          className="img-fluid rounded"
                          style={{ objectFit: 'cover', maxHeight: '300px', width: '100%' }}
                        />
                      </div>
                      <div className="card-body p-3 pt-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className={`badge rounded-pill bg-label-${r.badgeColor}`}>
                            {r.badge}
                          </span>
                        </div>
                        <h5>{r.title}</h5>
                        <p>{r.desc}</p>
                        <p className="d-flex align-items-center mb-1">
                          <i className="ri-time-line ri-20px me-1"></i>
                          {r.duration}
                        </p>
                        <p>
                          <button
                            onClick={() => openModal(r.key)}
                            className="btn btn-link p-0 text-decoration-underline text-primary fw-bold"
                          >
                            Recipe
                          </button>
                        </p>
                        <div className="d-flex justify-content-end gap-2 mt-3">
                          <button className="btn btn-outline-primary">
                            <i className="ri-pencil-line ri-16px"></i>
                          </button>
                          <button className="btn btn-outline-danger">
                            <i className="ri-delete-bin-line ri-16px"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recipe Modal */}
                    <div
                      className="modal fade"
                      id={`${r.key}Modal`}
                      tabIndex="-1"
                      aria-labelledby={`${r.key}ModalLabel`}
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow">
                          <div className="modal-header border-0 pb-0">
                            <h5 className="modal-title fw-bold" id={`${r.key}ModalLabel`}>
                              {r.title}
                            </h5>
                            <button
                              type="button"
                              className="btn-close"
                              data-bs-dismiss="modal"
                              aria-label="Close"
                            ></button>
                          </div>
                          <div className="modal-body p-4">
                            <div className="text-center mb-4">
                              <Image
                                src={r.image}
                                width={800}
                                height={300}
                                alt={r.title}
                                className="img-fluid rounded-4 shadow-sm"
                                style={{
                                  objectFit: 'cover',
                                  maxHeight: '300px',
                                  width: '100%',
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className={`badge rounded-pill bg-label-${r.badgeColor}`}>
                                {r.level}
                              </span>
                            </div>
                            <p className="mb-3">{r.desc}</p>
                            <h6 className="fw-bold mb-2">Steps:</h6>
                            <ul className="ps-3 mb-0">
                              {r.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Recipe Modal */}
                <div
                  className="modal fade"
                  id="addRecipeModal"
                  tabIndex="-1"
                  aria-labelledby="addRecipeModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4 shadow">
                      <div className="modal-header">
                        <h5 className="modal-title" id="addRecipeModalLabel">
                          Add New Recipe
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          alert('Recipe added!');
                          const modal = window.bootstrap.Modal.getInstance(
                            document.getElementById('addRecipeModal')
                          );
                          modal.hide();
                        }}
                      >
                        <div className="modal-body p-4">
                          <div className="mb-3">
                            <label className="form-label">Recipe Name</label>
                            <input type="text" className="form-control" required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows="3" required></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Duration</label>
                            <input type="text" className="form-control" placeholder="e.g. 30 mins" required />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Steps</label>
                            <textarea className="form-control" rows="4" placeholder="Steps separated by new line" required></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Intensity</label>
                            <select className="form-select" required>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Upload Image</label>
                            <input type="file" className="form-control" accept="image/*" />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button className="btn btn-secondary" data-bs-dismiss="modal">
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Add Recipe
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                {/* Trigger for modal */}
                {modals.addRecipe && (
                  <script>
                    {`new bootstrap.Modal(document.getElementById("addRecipeModal")).show();`}
                  </script>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
