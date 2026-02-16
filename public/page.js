"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function RecipiesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    Name: "",
    Description: "",
    Calories: 0,
    Steps: "",
    ImageUrl: "",
    Tags: ""
  });

  // Fetch recipes from API
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.flow108.in/api/recipes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.Status && data.Data) {
        setRecipes(data.Data);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    
    const payload = {
      Name: newRecipe.Name,
      Description: newRecipe.Description,
      Calories: parseInt(newRecipe.Calories, 10),
      Steps: newRecipe.Steps,
      ImageUrl: newRecipe.ImageUrl,
      Tags: newRecipe.Tags
    };

    try {
      const response = await fetch('https://api.flow108.in/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.Status) {
        alert('Recipe added successfully!');
        setShowAddModal(false);
        setNewRecipe({
          Name: "",
          Description: "",
          Calories: 0,
          Steps: "",
          ImageUrl: "",
          Tags: ""
        });
        fetchRecipes(); // Refresh the list
      }
    } catch (err) {
      console.error('Error adding recipe:', err);
      alert('Failed to add recipe');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row mb-6 g-6">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recipes</h5>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowAddModal(true)}
                >
                  Add Recipe
                </button>
              </div>
              <div className="card-body">
                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading recipes...</p>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}
                
                {!loading && !error && recipes.length === 0 && (
                  <div className="text-center py-4">
                    <p>No recipes found.</p>
                  </div>
                )}
                
                {!loading && !error && recipes.length > 0 && (
                  <div className="row">
                    {recipes.map((recipe) => (
                      <div key={recipe.Id} className="col-md-4 mb-4">
                        <div className="card h-100">
                          <img 
                            src={recipe.ImageUrl || '/placeholder.jpg'} 
                            className="card-img-top" 
                            alt={recipe.Name}
                            style={{height: '200px', objectFit: 'cover'}}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{recipe.Name}</h5>
                            <p className="card-text">{recipe.Description}</p>
                            <p><strong>Calories:</strong> {recipe.Calories}</p>
                            <p><strong>Tags:</strong> {recipe.Tags}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Recipe Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Recipe</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddRecipe}>
                  <div className="mb-3">
                    <label>Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="Name"
                      value={newRecipe.Name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea 
                      className="form-control" 
                      name="Description"
                      value={newRecipe.Description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Calories</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="Calories"
                      value={newRecipe.Calories}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Steps</label>
                    <textarea 
                      className="form-control" 
                      name="Steps"
                      value={newRecipe.Steps}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Image URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="ImageUrl"
                      value={newRecipe.ImageUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Tags</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="Tags"
                      value={newRecipe.Tags}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add Recipe</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
