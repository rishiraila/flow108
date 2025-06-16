'use client';

import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

export default function DietTablePage() {
  const [foodData, setFoodData] = useState([
    {
      section: 'Early Morning',
      items: [
        {
          food: 'Jeera water',
          quantity: '1 glass',
          fats: 0,
          carbs: 0,
          protein: 0,
          calories: 0,
          recipe: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
          category: 'veg',
        },
      ],
    },
    {
      section: 'Breakfast',
      items: [],
    },
    {
      section: 'Lunch',
      items: [],
    },
    {
      section: 'Dinner',
      items: [],
    },
  ]);

  const [modalState, setModalState] = useState({ show: false, mode: 'add', section: '', index: null });
  const [formData, setFormData] = useState({
    food: '',
    quantity: '',
    fats: '',
    carbs: '',
    protein: '',
    calories: '',
    recipe: '',
    category: 'veg',
  });

  const handleEdit = (section, index) => {
    const item = foodData.find((s) => s.section === section).items[index];
    setFormData(item);
    setModalState({ show: true, mode: 'edit', section, index });
  };

  const handleDelete = (section, index) => {
    setFoodData((prev) =>
      prev.map((s) =>
        s.section === section ? { ...s, items: s.items.filter((_, i) => i !== index) } : s
      )
    );
  };

  const handleAddClick = (section) => {
    setFormData({
      food: '',
      quantity: '',
      fats: '',
      carbs: '',
      protein: '',
      calories: '',
      recipe: '',
      category: 'veg',
    });
    setModalState({ show: true, mode: 'add', section, index: null });
  };

  const handleSave = () => {
    const { section, mode, index } = modalState;

    if (mode === 'edit') {
      setFoodData((prev) =>
        prev.map((s) =>
          s.section === section
            ? {
                ...s,
                items: s.items.map((item, i) => (i === index ? formData : item)),
              }
            : s
        )
      );
    } else {
      setFoodData((prev) =>
        prev.map((s) =>
          s.section === section ? { ...s, items: [...s.items, formData] } : s
        )
      );
    }

    setModalState({ ...modalState, show: false });
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Diet Table</h2>
      <div className="card">
        <div className="card-body">
          {foodData.map((section) => (
            <div key={section.section} className="mb-5">
              <h5 className="table-warning text-center position-relative fw-bold py-2">
                {section.section}
                <button
                  className="btn btn-sm btn-success position-absolute end-0 me-3"
                  onClick={() => handleAddClick(section.section)}
                >
                  + Add
                </button>
              </h5>
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Food</th>
                    <th>Qty</th>
                    <th>Fats</th>
                    <th>Carbs</th>
                    <th>Protein</th>
                    <th>Calories</th>
                    <th>Recipe</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, index) => (
                    <tr
                      key={index}
                      className={`bg-opacity-25 ${
                        item.category === 'veg'
                          ? 'bg-success'
                          : item.category === 'egg'
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                    >
                      <td>{item.food}</td>
                      <td>{item.quantity}</td>
                      <td>{item.fats}</td>
                      <td>{item.carbs}</td>
                      <td>{item.protein}</td>
                      <td>{item.calories}</td>
                      <td>
                        <a href={item.recipe} target="_blank">
                          View
                        </a>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(section.section, index)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(section.section, index)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalState.show && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalState.mode === 'edit' ? 'Edit Food' : 'Add Food'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalState({ ...modalState, show: false })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {['food', 'quantity', 'fats', 'carbs', 'protein', 'calories', 'recipe'].map((key) => (
                    <div className="col-md-6" key={key}>
                      <label className="form-label text-capitalize">{key}</label>
                      <input
                        type={key === 'recipe' ? 'text' : 'text'}
                        className="form-control"
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="veg">Veg</option>
                      <option value="egg">Egg</option>
                      <option value="nonveg">Non-Veg</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalState({ ...modalState, show: false })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
