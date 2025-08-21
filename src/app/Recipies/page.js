'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function RecipiesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://flow108.coinagesoft.com/api/recipes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle the nested response structure correctly
      const recipesData = data?.data?.Data || data?.Data || [];
      
      // Filter out invalid recipes and parse JSON strings
      const validRecipes = recipesData.filter(recipe => 
        recipe && recipe.Name && recipe.Name !== "string" && recipe.Id
      ).map(recipe => ({
        ...recipe,
        Tags: parseTagsString(recipe.Tags),
        Steps: parseStepsString(recipe.Steps)
      }));
      
      setRecipes(validRecipes);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      
      let errorMessage = 'Failed to fetch recipes';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timeout - please check your connection';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - please check your connection or try again later';
      } else if (err.message.includes('HTTP error')) {
        errorMessage = `Server error (${err.message.match(/\d+/)?.[0] || 'unknown'})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const parseTagsString = (tags) => {
    try {
      if (typeof tags === 'string' && tags.startsWith('[')) {
        return JSON.parse(tags).join(', ');
      }
      return tags || '';
    } catch {
      return tags || '';
    }
  };

  const parseStepsString = (steps) => {
    try {
      if (typeof steps === 'string' && steps.startsWith('[')) {
        return JSON.parse(steps);
      }
      return steps || [];
    } catch {
      return steps || [];
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
      const response = await fetch('https://flow108.coinagesoft.com/api/recipes', {
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

  const handleEditRecipe = async (e) => {
    e.preventDefault();
    
    if (!editingRecipe) return;

    // Parse Steps and Tags from string to array if needed
    let stepsArray = editingRecipe.Steps;
    if (typeof editingRecipe.Steps === 'string') {
      try {
        stepsArray = JSON.parse(editingRecipe.Steps);
      } catch {
        // If it's not valid JSON, split by newlines or commas
        stepsArray = editingRecipe.Steps.split('\n').filter(step => step.trim());
      }
    }

    let tagsArray = editingRecipe.Tags;
    if (typeof editingRecipe.Tags === 'string') {
      try {
        tagsArray = JSON.parse(editingRecipe.Tags);
      } catch {
        // If it's not valid JSON, split by commas
        tagsArray = editingRecipe.Tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    const payload = {
      Id: editingRecipe.Id,
      Name: editingRecipe.Name,
      Description: editingRecipe.Description,
      Calories: parseInt(editingRecipe.Calories, 10),
      Steps: stepsArray,
      ImageUrl: editingRecipe.ImageUrl,
      Tags: tagsArray
    };

    try {
      const response = await fetch(`https://flow108.coinagesoft.com/api/recipes/${editingRecipe.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.Status) {
        alert('Recipe updated successfully!');
        setShowEditModal(false);
        setEditingRecipe(null);
        fetchRecipes(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating recipe:', err);
      alert(`Failed to update recipe: ${err.message}`);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRecipe(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (recipe) => {
    setEditingRecipe({
      ...recipe,
      Tags: typeof recipe.Tags === 'string' ? recipe.Tags : JSON.stringify(recipe.Tags),
      Steps: typeof recipe.Steps === 'string' ? recipe.Steps : JSON.stringify(recipe.Steps)
    });
    setShowEditModal(true);
  };

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
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
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="card-body">
                            <h5 className="card-title">{recipe.Name}</h5>
                            <p className="card-text">{recipe.Description}</p>
                            <p><strong>Calories:</strong> {recipe.Calories}</p>
                            <p><strong>Tags:</strong> {recipe.Tags}</p>
                            <div className="mt-auto">
                              <button 
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openRecipeModal(recipe)}
                              >
                                View Recipe
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(recipe);
                                }}
                              >
                                Edit
                              </button>
                            </div>
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

      {/* Edit Recipe Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Recipe</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditRecipe}>
                  <div className="mb-3">
                    <label>Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="Name"
                      value={editingRecipe?.Name || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea 
                      className="form-control" 
                      name="Description"
                      value={editingRecipe?.Description || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Calories</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="Calories"
                      value={editingRecipe?.Calories || 0}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Steps</label>
                    <textarea 
                      className="form-control" 
                      name="Steps"
                      value={editingRecipe?.Steps || ''}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Image URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="ImageUrl"
                      value={editingRecipe?.ImageUrl || ''}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label>Tags</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="Tags"
                      value={editingRecipe?.Tags || ''}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Recipe</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRecipe.Name}</h5>
                <button type="button" className="btn-close" onClick={closeRecipeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <img 
                      src={selectedRecipe.ImageUrl || '/placeholder.jpg'} 
                      className="img-fluid rounded mb-3" 
                      alt={selectedRecipe.Name}
                      style={{maxHeight: '300px', objectFit: 'cover', width: '100%'}}
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h6>Description</h6>
                    <p>{selectedRecipe.Description}</p>
                    <p><strong>Calories:</strong> {selectedRecipe.Calories}</p>
                    <p><strong>Tags:</strong> {selectedRecipe.Tags}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Ingredients & Steps:</h6>
                  {Array.isArray(selectedRecipe.Steps) && selectedRecipe.Steps.length > 0 ? (
                    <ol>
                      {selectedRecipe.Steps.map((step, index) => (
                        <li key={index} className="mb-2">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>{selectedRecipe.Steps}</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRecipeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
