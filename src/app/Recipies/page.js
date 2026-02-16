"use client";

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
    ImageFile: null,
    Tags: "",
    Category: "", // added category
  });

  // Fetch recipes from API
  useEffect(() => {
    fetchRecipes();
  }, []);
  const getImageUrl = (url) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url; // already absolute
    return `https://api.flow108.in${url}`; // prepend API domain
  };
  const handleDeleteRecipe = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const response = await fetch(
        `https://api.flow108.in/receipe/${id}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.Status) {
        alert("Recipe deleted successfully!");
        fetchRecipes(); // Refresh the list
      } else {
        alert("Failed to delete recipe");
      }
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Error deleting recipe");
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        "https://api.flow108.in/api/recipes",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle the nested response structure correctly
      const recipesData = data?.data?.Data || data?.Data || [];

      // Filter out invalid recipes and parse JSON strings
      const validRecipes = recipesData
        .filter(
          (recipe) =>
            recipe && recipe.Name && recipe.Name !== "string" && recipe.Id
        )
        .map((recipe) => ({
          ...recipe,
          Tags: parseTagsString(recipe.Tags),
          Steps: parseStepsString(recipe.Steps),
        }));

      setRecipes(validRecipes);
      setError(null);
    } catch (err) {
      console.error("Error fetching recipes:", err);

      let errorMessage = "Failed to fetch recipes";

      if (err.name === "AbortError") {
        errorMessage = "Request timeout - please check your connection";
      } else if (err.message.includes("Failed to fetch")) {
        errorMessage =
          "Network error - please check your connection or try again later";
      } else if (err.message.includes("HTTP error")) {
        errorMessage = `Server error (${
          err.message.match(/\d+/)?.[0] || "unknown"
        })`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const parseTagsString = (tags) => {
    try {
      if (typeof tags === "string" && tags.startsWith("[")) {
        return JSON.parse(tags).join(", ");
      }
      return tags || "";
    } catch {
      return tags || "";
    }
  };

  const parseStepsString = (steps) => {
    try {
      if (typeof steps === "string" && steps.startsWith("[")) {
        return JSON.parse(steps);
      }
      return steps || [];
    } catch {
      return steps || [];
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Name", newRecipe.Name);
    formData.append("Description", newRecipe.Description);
    formData.append("Calories", Number(newRecipe.Calories)); // must be integer
    formData.append("Category", newRecipe.Category);

    // Append each step
    const stepsArray = newRecipe.Steps.split("\n").filter((step) =>
      step.trim()
    );
    stepsArray.forEach((step) => {
      formData.append("Steps", step.trim());
    });

    // Append each tag
    const tagsArray = newRecipe.Tags.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    tagsArray.forEach((tag) => {
      formData.append("Tags", tag);
    });

    // Append image file with correct field name
    if (newRecipe.ImageFile) {
      formData.append("ImageUrl", newRecipe.ImageFile);
    }

    try {
      const response = await fetch(
        "https://api.flow108.in/api/recipes",
        {
          method: "POST",
          headers: {
            accept: "*/*", // don't set Content-Type, browser will handle it
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.Status) {
        alert("Recipe added successfully!");
        setShowAddModal(false);
        setNewRecipe({
          Name: "",
          Description: "",
          Calories: 0,
          Steps: "",
          ImageFile: null,
          Tags: "",
          Category: "",
        });
        fetchRecipes(); // refresh list
      } else {
        alert(result.Message || "Failed to add recipe");
      }
    } catch (err) {
      console.error("Error adding recipe:", err);
      alert("Failed to add recipe");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setNewRecipe((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewRecipe((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditRecipe = async (e) => {
    e.preventDefault();

    if (!editingRecipe) return;

    // Parse Steps and Tags from string to array if needed
    let stepsArray = editingRecipe.Steps;
    if (typeof editingRecipe.Steps === "string") {
      try {
        stepsArray = JSON.parse(editingRecipe.Steps);
      } catch {
        // If it's not valid JSON, split by newlines or commas
        stepsArray = editingRecipe.Steps.split("\n").filter((step) =>
          step.trim()
        );
      }
    }

    let tagsArray = editingRecipe.Tags;
    if (typeof editingRecipe.Tags === "string") {
      try {
        tagsArray = JSON.parse(editingRecipe.Tags);
      } catch {
        // If it's not valid JSON, split by commas
        tagsArray = editingRecipe.Tags.split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      }
    }

    const formData = new FormData();
    formData.append("Name", editingRecipe.Name);
    formData.append("Description", editingRecipe.Description);
    formData.append("Calories", parseInt(editingRecipe.Calories, 10));
    formData.append("Category", editingRecipe.Category || "");

    // Append each step
    stepsArray.forEach((step) => {
      formData.append("Steps", step);
    });

    // Append each tag
    tagsArray.forEach((tag) => {
      formData.append("Tags", tag);
    });

    // Append image file if a new file is selected
    if (editingRecipe.Image instanceof File) {
      formData.append("ImageUrl", editingRecipe.Image);
    } else if (editingRecipe.ImageUrl) {
      // If no new file, append existing image URL as string
      formData.append("ImageUrl", editingRecipe.ImageUrl);
    }

    try {
      const response = await fetch(
        `https://api.flow108.in/api/recipes/${editingRecipe.Id}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      if (result.Status) {
        alert("Recipe updated successfully!");
        setShowEditModal(false);
        setEditingRecipe(null);
        fetchRecipes(); // Refresh the list
      }
    } catch (err) {
      console.error("Error updating recipe:", err);
      alert(`Failed to update recipe: ${err.message}`);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const openEditModal = (recipe) => {
    setEditingRecipe({
      ...recipe,
      Tags:
        typeof recipe.Tags === "string"
          ? recipe.Tags
          : JSON.stringify(recipe.Tags),
      Steps:
        typeof recipe.Steps === "string"
          ? recipe.Steps
          : JSON.stringify(recipe.Steps),
      Category: recipe.Category || "", // add category when opening edit modal
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

                {error && <div className="alert alert-danger">{error}</div>}

                {!loading && !error && recipes.length === 0 && (
                  <div className="text-center py-4">
                    <p>No recipes found.</p>
                  </div>
                )}

                {!loading && !error && recipes.length > 0 && (
                  <div className="row">
                    {recipes.map((recipe) => (
                      <div key={recipe.Id} className="col-md-4 mb-4">
                        <div className="card h-100 d-flex flex-column">
                          <img
                            src={getImageUrl(recipe.ImageUrl)}
                            className="card-img-top"
                            alt={recipe.Name}
                            style={{ height: "200px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src = "/placeholder.jpg";
                            }}
                          />

                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{recipe.Name}</h5>
                            <p className="card-text">{recipe.Description}</p>
                            <p>
                              <strong>Calories:</strong> {recipe.Calories}
                            </p>
                            <p>
                              <strong>Category:</strong> {recipe.Category}
                            </p>
                            <p>
                              <strong>Tags:</strong> {recipe.Tags}
                            </p>

                            {/* 👇 push buttons to bottom with mt-auto */}
                            <div className="mt-auto d-flex justify-content-between">
                              <button
                                className="btn btn-sm btn-primary"
                                title="View Recipe"
                                onClick={() => openRecipeModal(recipe)}
                              >
                                <i className="bi bi-eye me-1"></i> View Recipe
                              </button>

                              <div>
                                <button
                                  className="btn btn-sm btn-outline-secondary me-2"
                                  title="Edit Recipe"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(recipe);
                                  }}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Recipe"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRecipe(recipe.Id);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
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
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Recipe</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddRecipe}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Name"
                        value={newRecipe.Name}
                        onChange={handleInputChange}
                        placeholder="Enter recipe name"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Calories *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          name="Calories"
                          value={newRecipe.Calories}
                          onChange={handleInputChange}
                          placeholder="e.g., 250"
                          required
                        />
                        <span className="input-group-text">🔥</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      name="Description"
                      value={newRecipe.Description}
                      onChange={handleInputChange}
                      placeholder="Describe the recipe..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        name="Category"
                        value={newRecipe.Category}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Veg">Veg</option>
                        <option value="NonVeg">Non-Veg</option>
                        <option value="Eggs">Eggs</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tags</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Tags"
                        value={newRecipe.Tags}
                        onChange={handleInputChange}
                        placeholder="e.g., healthy, quick, spicy"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Steps *</label>
                    <textarea
                      className="form-control"
                      name="Steps"
                      value={newRecipe.Steps}
                      onChange={handleInputChange}
                      placeholder="Enter cooking steps, one per line..."
                      rows={4}
                      required
                    />
                    <div className="form-text">
                      Enter each step on a new line
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Recipe Image</label>
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <i className="bi bi-image fs-1 text-muted"></i>
                        </div>
                        <input
                          type="file"
                          className="form-control"
                          name="ImageFile"
                          accept="image/*"
                          onChange={handleInputChange}
                        />
                        <div className="form-text mt-2">
                          Upload an image for this recipe (optional)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
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
        </div>
      )}

      {/* Edit Recipe Modal */}
      {showEditModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Recipe</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditRecipe}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Name"
                        value={editingRecipe?.Name || ""}
                        onChange={handleEditInputChange}
                        placeholder="Enter recipe name"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Calories *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          name="Calories"
                          value={editingRecipe?.Calories || 0}
                          onChange={handleEditInputChange}
                          placeholder="e.g., 250"
                          required
                        />
                        <span className="input-group-text">🔥</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      name="Description"
                      value={editingRecipe?.Description || ""}
                      onChange={handleEditInputChange}
                      placeholder="Describe the recipe..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category *</label>
                      <select
                        name="Category"
                        value={editingRecipe?.Category || ""}
                        onChange={handleEditInputChange}
                        className="form-control"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Veg">Veg</option>
                        <option value="NonVeg">Non-Veg</option>
                        <option value="Eggs">Eggs</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tags</label>
                      <input
                        type="text"
                        className="form-control"
                        name="Tags"
                        value={editingRecipe?.Tags || ""}
                        onChange={handleEditInputChange}
                        placeholder="e.g., healthy, quick, spicy"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Steps *</label>
                    <textarea
                      className="form-control"
                      name="Steps"
                      value={editingRecipe?.Steps || ""}
                      onChange={handleEditInputChange}
                      placeholder="Enter cooking steps, one per line..."
                      rows={4}
                      required
                    />
                    <div className="form-text">
                      Enter each step on a new line
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Recipe Image</label>
                    <div className="card">
                      <div className="card-body text-center">
                        <div className="mb-2">
                          <i className="bi bi-image fs-1 text-muted"></i>
                        </div>
                        <input
                          type="file"
                          className="form-control"
                          name="Image"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setEditingRecipe((prev) => ({
                              ...prev,
                              Image: file,
                            }));
                          }}
                        />
                        <div className="form-text mt-2">
                          Upload a new image for this recipe (optional)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Recipe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {showRecipeModal && selectedRecipe && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRecipe.Name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRecipeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <img
                      src={getImageUrl(selectedRecipe.ImageUrl)}
                      className="img-fluid rounded mb-3"
                      alt={selectedRecipe.Name}
                      style={{
                        maxHeight: "300px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h6>Description</h6>
                    <p>{selectedRecipe.Description}</p>
                    <p>
                      <strong>Calories:</strong> {selectedRecipe.Calories}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedRecipe.Category}
                    </p>
                    <p>
                      <strong>Tags:</strong> {selectedRecipe.Tags}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h6>Ingredients & Steps:</h6>
                  {Array.isArray(selectedRecipe.Steps) &&
                  selectedRecipe.Steps.length > 0 ? (
                    <ol>
                      {selectedRecipe.Steps.map((step, index) => (
                        <li key={index} className="mb-2">
                          {step}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>{selectedRecipe.Steps}</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeRecipeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
