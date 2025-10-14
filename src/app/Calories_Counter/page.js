"use client";
import { useState, useEffect } from "react";
import { importMealsFromExcel, fetchAllMeals, addSingleMeal, updateMeal, deleteMealFromPlan } from "../utils/api";
import EditMealModal from "../DietPlan/EditMealModal";

// Dummy data for meal calculations
const dummyMeals = [
  {
    id: 1,
    name: "Breakfast",
    time: "08:00 AM",
    items: [
      { name: "Oatmeal with Berries", calories: 320, protein: 12, carbs: 45, fats: 8 },
      { name: "Greek Yogurt", calories: 150, protein: 15, carbs: 8, fats: 6 },
      { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0 }
    ],
    totalCalories: 575,
    totalProtein: 28,
    totalCarbs: 80,
    totalFats: 14
  },
  {
    id: 2,
    name: "Lunch",
    time: "12:30 PM",
    items: [
      { name: "Grilled Chicken Salad", calories: 420, protein: 35, carbs: 15, fats: 22 },
      { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fats: 4 },
      { name: "Avocado", calories: 234, protein: 3, carbs: 12, fats: 21 }
    ],
    totalCalories: 876,
    totalProtein: 46,
    totalCarbs: 66,
    totalFats: 47
  },
  {
    id: 3,
    name: "Snack",
    time: "03:00 PM",
    items: [
      { name: "Apple", calories: 95, protein: 0, carbs: 25, fats: 0 },
      { name: "Almonds (20g)", calories: 116, protein: 4, carbs: 4, fats: 10 }
    ],
    totalCalories: 211,
    totalProtein: 4,
    totalCarbs: 29,
    totalFats: 10
  },
  {
    id: 4,
    name: "Dinner",
    time: "07:00 PM",
    items: [
      { name: "Salmon Fillet", calories: 412, protein: 39, carbs: 0, fats: 25 },
      { name: "Sweet Potato", calories: 112, protein: 2, carbs: 26, fats: 0 },
      { name: "Broccoli", calories: 55, protein: 4, carbs: 11, fats: 1 }
    ],
    totalCalories: 579,
    totalProtein: 45,
    totalCarbs: 37,
    totalFats: 26
  }
];

const dailyGoals = {
  calories: 2500,
  protein: 150,
  carbs: 250,
  fats: 80
};

export default function CaloriesCounter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [meals, setMeals] = useState(dummyMeals);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [mealsError, setMealsError] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    calories: '',
    carbs: '',
    protein: '',
    fats: '',
    meal: 'Breakfast'
  });

  // Edit meal states
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Pagination, searching, sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch meals from API on component mount
  useEffect(() => {
    const loadMeals = async () => {
      setIsLoadingMeals(true);
      setMealsError(null);
      try {
        const apiMeals = await fetchAllMeals();
        const transformedMeals = transformMealsData(apiMeals);
        setMeals(transformedMeals);
      } catch (error) {
        console.error('Error loading meals:', error);
        setMealsError('Failed to load meals from server. Using sample data.');
        // Keep dummy data as fallback
      } finally {
        setIsLoadingMeals(false);
      }
    };

    loadMeals();
  }, []);

  // Transform API data to match component structure
  const transformMealsData = (apiMeals) => {
    // Ensure apiMeals is an array
    if (!Array.isArray(apiMeals)) {
      console.error('apiMeals is not an array:', apiMeals);
      return [];
    }

    // Group meals by Category
    const groupedMeals = {};

    apiMeals.forEach(meal => {
      const category = meal.Category || 'Vegetarian'; // Use Category from API response
      if (!groupedMeals[category]) {
        groupedMeals[category] = {
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          time: getMealTime(category),
          items: []
        };
      }

      // Add item to the category
      groupedMeals[category].items.push({
        id: meal.Id,
        name: meal.FoodItem || 'Unknown Item',
        quantity: meal.Quantity || '1 serving',
        calories: meal.Calories || 0,
        carbs: meal.Carbs || 0,
        protein: meal.Protein || 0,
        fats: meal.Fats || 0,
        category: meal.Category || 'Vegetarian'
      });
    });

    // Calculate totals for each category
    Object.values(groupedMeals).forEach(meal => {
      meal.totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
      meal.totalProtein = meal.items.reduce((sum, item) => sum + item.protein, 0);
      meal.totalCarbs = meal.items.reduce((sum, item) => sum + item.carbs, 0);
      meal.totalFats = meal.items.reduce((sum, item) => sum + item.fats, 0);
    });

    // Convert to array and sort by category
    const categoryOrder = ['Vegetarian', 'Non-vegetarian', 'Egg'];
    return Object.values(groupedMeals).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.name);
      const bIndex = categoryOrder.indexOf(b.name);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  };

  // Get default time for category (not applicable, return empty)
  const getMealTime = (category) => {
    return '';
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    if (file) {
      const allowedTypes = ['image/svg+xml', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const allowedExtensions = ['.svg', '.xlsx', '.xls'];

      const isValidType = allowedTypes.includes(file.type) ||
        allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (isValidType) {
        setSelectedFile(file);
        setUploadStatus('success');
        setImportMessage(null);
      } else {
        setUploadStatus('error');
      }
    }
  };

  // Handle import data
  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const result = await importMealsFromExcel(selectedFile);

      // Parse the success message from API response
      const successMessage = result.Message || 'Meals imported successfully';
      setImportMessage({ type: 'success', text: `${successMessage} from ${selectedFile.name}` });

      // Refresh meals data after successful import
      try {
        const apiMeals = await fetchAllMeals();
        const transformedMeals = transformMealsData(apiMeals);
        setMeals(transformedMeals);
      } catch (refreshError) {
        console.error('Error refreshing meals after import:', refreshError);
        // Don't show error for refresh failure, just log it
      }

      setActiveTab('calculator');
    } catch (error) {
      setImportMessage({ type: 'error', text: error.message || 'Failed to import data. Please try again.' });
    } finally {
      setIsImporting(false);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Calculate daily totals from meals
  const calculateDailyTotals = () => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.totalCalories,
      protein: totals.protein + meal.totalProtein,
      carbs: totals.carbs + meal.totalCarbs,
      fats: totals.fats + meal.totalFats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const dailyTotals = calculateDailyTotals();

  // Calculate percentage of daily goal
  const calculatePercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Flatten meals data for table display
  const allItems = meals.flatMap(meal =>
    meal.items.map(item => ({
      ...item,
      mealName: meal.name,
      mealTime: meal.time,
      mealId: meal.id
    }))
  );

  // Calculate food item statistics
  const totalFoodItems = allItems.length;
  const vegTotal = allItems.filter(item => item.category === 'Vegetarian').length;
  const eggTotal = allItems.filter(item => item.category === 'Egg').length;
  const nonVegTotal = allItems.filter(item => item.category === 'Non- vegetarian').length;

  // Filter items
  const filteredItems = allItems.filter(item =>
    (selectedMeal === '' || item.mealName.toLowerCase() === selectedMeal.toLowerCase()) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.mealName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Paginate items
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Handle input changes for new item form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newItem.name && newItem.quantity && newItem.calories) {
      const item = {
        name: newItem.name,
        quantity: newItem.quantity,
        calories: parseInt(newItem.calories),
        carbs: parseInt(newItem.carbs) || 0,
        protein: parseInt(newItem.protein) || 0,
        fats: parseInt(newItem.fats) || 0
      };

      // Call API to add single meal
      try {
        await addSingleMeal({
          MealType: newItem.meal,
          FoodItem: newItem.name,
          Quantity: newItem.quantity,
          Calories: item.calories,
          Carbs: item.carbs,
          Protein: item.protein,
          Fats: item.fats
        });

        // Update local state after successful API call
        const updatedMeals = meals.map(meal => {
          if (meal.name === newItem.meal) {
            return {
              ...meal,
              items: [...meal.items, item],
              totalCalories: meal.totalCalories + item.calories,
              totalCarbs: meal.totalCarbs + item.carbs,
              totalProtein: meal.totalProtein + item.protein,
              totalFats: meal.totalFats + item.fats
            };
          }
          return meal;
        });

        setMeals(updatedMeals);
        setShowModal(false);
        setNewItem({
          name: '',
          quantity: '',
          calories: '',
          carbs: '',
          protein: '',
          fats: '',
          meal: 'Breakfast'
        });
      } catch (error) {
        console.error("Failed to add meal via API:", error);
        alert("Failed to add meal. Please try again.");
      }
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setNewItem({
      name: '',
      quantity: '',
      calories: '',
      carbs: '',
      protein: '',
      fats: '',
      meal: 'Breakfast'
    });
  };

  // Handle edit item
  const handleEditItem = (item) => {
    // Transform item to match EditMealModal expected format
    const mealForEdit = {
      Id: item.id,
      MealType: item.mealName,
      FoodItem: item.name,
      Quantity: item.quantity,
      Calories: item.calories,
      Carbs: item.carbs,
      Protein: item.protein,
      Fats: item.fats
    };
    setEditingMeal(mealForEdit);
    setShowEditMealModal(true);
  };

  // Handle delete item
  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteMealFromPlan(item.id);
        // Update local state
        const updatedMeals = meals.map(meal => {
          if (meal.name === item.mealName) {
            return {
              ...meal,
              items: meal.items.filter(i => i.id !== item.id),
              totalCalories: meal.totalCalories - item.calories,
              totalCarbs: meal.totalCarbs - item.carbs,
              totalProtein: meal.totalProtein - item.protein,
              totalFats: meal.totalFats - item.fats
            };
          }
          return meal;
        });
        setMeals(updatedMeals);
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Failed to delete meal');
      }
    }
  };

  // Handle save edited meal
  const handleSaveEditedMeal = async (updatedMeal) => {
    try {
      await updateMeal(editingMeal.Id, updatedMeal);
      // Update local state
      const updatedItem = {
        id: editingMeal.Id,
        name: updatedMeal.FoodItem,
        quantity: updatedMeal.Quantity,
        calories: updatedMeal.Calories,
        carbs: updatedMeal.Carbs,
        protein: updatedMeal.Protein,
        fats: updatedMeal.Fats,
        mealName: updatedMeal.MealType
      };

      const updatedMeals = meals.map(meal => {
        if (meal.name === editingMeal.mealName) {
          return {
            ...meal,
            items: meal.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            ),
            totalCalories: meal.items.reduce((sum, item) => sum + (item.id === updatedItem.id ? updatedItem.calories : item.calories), 0),
            totalProtein: meal.items.reduce((sum, item) => sum + (item.id === updatedItem.id ? updatedItem.protein : item.protein), 0),
            totalCarbs: meal.items.reduce((sum, item) => sum + (item.id === updatedItem.id ? updatedItem.carbs : item.carbs), 0),
            totalFats: meal.items.reduce((sum, item) => sum + (item.id === updatedItem.id ? updatedItem.fats : item.fats), 0)
          };
        }
        return meal;
      });

      setMeals(updatedMeals);
      setShowEditMealModal(false);
      setEditingMeal(null);
      // Refresh meals from server to reflect latest data
      try {
        const apiMeals = await fetchAllMeals();
        const transformedMeals = transformMealsData(apiMeals);
        setMeals(transformedMeals);
        alert('Meal updated successfully');
      } catch (error) {
        console.error('Error refreshing meals after update:', error);
        alert('Meal updated but failed to refresh data');
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('Failed to update meal');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-calculator me-2"></i>
              Calories Counter
            </h2>
            <div className="badge bg-primary fs-6 px-3 py-2">
              Daily Progress: {Math.round((dailyTotals.calories / dailyGoals.calories) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
                type="button"
              >
                <i className="bi bi-cloud-upload me-2"></i>
                File Upload
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculator')}
                type="button"
              >
                <i className="bi bi-calculator me-2"></i>
                Meal Calculator
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'upload' && (
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-arrow-up me-2"></i>
                  Upload Nutrition Data
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="bi bi-file-earmark-spreadsheet display-4 text-primary"></i>
                  </div>
                  <h6>Supported File Types</h6>
                  <p className="text-muted">SVG files or Excel spreadsheets (.xlsx, .xls)</p>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-3 p-4 text-center mb-3 ${
                    dragActive ? 'border-primary bg-light' : 'border-secondary'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="fileUpload"
                    className="d-none"
                    accept=".svg,.xlsx,.xls"
                    onChange={handleFileInput}
                  />

                  {selectedFile ? (
                    <div className="py-3">
                      <i className="bi bi-file-earmark-check display-4 text-success mb-3"></i>
                      <h6 className="mb-2">{selectedFile.name}</h6>
                      <p className="text-muted mb-3">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {uploadStatus === 'success' && (
                        <div className="alert alert-success py-2 mb-3">
                          <i className="bi bi-check-circle me-2"></i>
                          File uploaded successfully!
                        </div>
                      )}

                      {uploadStatus === 'processed' && (
                        <div className="alert alert-info py-2 mb-3">
                          <i className="bi bi-info-circle me-2"></i>
                          File processed and data extracted successfully!
                        </div>
                      )}

                      {uploadStatus === 'error' && (
                        <div className="alert alert-danger py-2 mb-3">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Invalid file type. Please upload SVG or Excel files only.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-3">
                      <i className="bi bi-cloud-arrow-up display-4 text-muted mb-3"></i>
                      <h6 className="mb-2">Drag and drop your file here</h6>
                      <p className="text-muted mb-3">or click to browse files</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => document.getElementById('fileUpload').click()}
                      >
                        <i className="bi bi-folder me-2"></i>
                        Choose File
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadStatus === 'success' && (
                  <div className="mb-3">
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <small className="text-muted">File uploaded successfully!</small>
                  </div>
                )}

                {/* Import Message */}
                {importMessage && (
                  <div className={`alert ${importMessage.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 mb-3`}>
                    <i className={`bi ${importMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                    {importMessage.text}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadStatus(null);
                      setImportMessage(null);
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset
                  </button>

                  {selectedFile && uploadStatus === 'success' && (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleImport}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Importing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Import Data
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Calculator Tab */}
      {activeTab === 'calculator' && (
        <>
          {/* Loading/Error Messages */}
          {isLoadingMeals && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info">
                  <i className="bi bi-hourglass-split me-2"></i>
                  Loading meals from server...
                </div>
              </div>
            </div>
          )}

          {mealsError && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {mealsError}
                </div>
              </div>
            </div>
          )}

          {/* Daily Summary Cards */}
          <div className="row mb-5">
            <div className="col-12 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-primary">
                        <i className="tf-icons ri-list-unordered ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{totalFoodItems}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Total Food Items</h6>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-success">
                        <i className="tf-icons ri-leaf-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{vegTotal}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Vegetarian Items</h6>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-warning h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-warning">
                        <i className="tf-icons ri-egg-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{eggTotal}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Egg Items</h6>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3 mb-2">
              <div className="card card-border-shadow-danger h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div className="avatar me-4">
                      <span className="avatar-initial rounded-3 bg-label-danger">
                        <i className="tf-icons ri-restaurant-line ri-24px"></i>
                      </span>
                    </div>
                    <h4 className="mb-0">{nonVegTotal}</h4>
                  </div>
                  <h6 className="mb-0 fw-normal">Non-vegetarian</h6>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Table */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-table me-2"></i>
                    Nutrition Details
                  </h5>
                  <div className="d-flex gap-2">
                    <div className="input-group" style={{ width: '250px' }}>
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search food items..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    {/* <select
                      className="form-select"
                      style={{ width: '150px' }}
                      value={selectedMeal}
                      onChange={(e) => {
                        setSelectedMeal(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Meals</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snack">Snack</option>
                      <option value="Dinner">Dinner</option>
                    </select> */}
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('mealName')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-clock me-1"></i>
                            Category {sortBy === 'mealName' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-egg me-1"></i>
                            Food Item {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('quantity')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-speedometer me-1"></i>
                            Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('calories')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-fire me-1"></i>
                            Calories {sortBy === 'calories' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('carbs')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-bread-slice me-1"></i>
                            Carbs (g) {sortBy === 'carbs' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('protein')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-egg-fried me-1"></i>
                            Protein (g) {sortBy === 'protein' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold" onClick={() => handleSort('fats')} style={{cursor: 'pointer'}}>
                            <i className="bi bi-droplet me-1"></i>
                            Fats (g) {sortBy === 'fats' && (sortOrder === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="border-0 fw-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item, index) => (
                          <tr key={`${item.mealId}-${index}`}>
                            <td>
                              <span className="fw-medium">{item.mealName}</span>
                              <br />
                              {/* <small className="text-muted">{item.mealTime}</small> */}
                            </td>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td className="fw-bold text-primary">{item.calories}</td>
                            <td>{item.carbs}</td>
                            <td>{item.protein}</td>
                            <td>{item.fats}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditItem(item)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <div className="row">
                        <div className="col-3">
                          <small className="text-muted">
                            <strong>{totalFoodItems}</strong> Total Items
                          </small>
                        </div>
                        <div className="col-3">
                          <small className="text-muted">
                            <strong>{vegTotal}</strong> Vegetarian
                          </small>
                        </div>
                        <div className="col-3">
                          <small className="text-muted">
                            <strong>{eggTotal}</strong> Egg
                          </small>
                        </div>
                        <div className="col-3">
                          <small className="text-muted">
                            <strong>{nonVegTotal}</strong> Non-Veg
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-download me-1"></i>
                          Export
                        </button>
                        <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>
                          <i className="bi bi-plus-circle me-1"></i>
                          Add Item
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-center">
                      {totalPages > 1 && (
                        <nav aria-label="Table pagination">
                          <ul className="pagination pagination-sm mb-0 justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Cards */}
          {/* <div className="row">
            {meals.map((meal) => (
              <div key={meal.id} className="col-lg-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">
                        <i className="bi bi-clock me-2"></i>
                        {meal.name}
                      </h5>
                      <small className="text-muted">{meal.time}</small>
                    </div>
                    <div className="text-end">
                      <h4 className="text-primary mb-0">{meal.totalCalories}</h4>
                      <small className="text-muted">calories</small>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-3">
                        <div className="text-center">
                          <div className="fw-bold text-warning">{meal.totalProtein}g</div>
                          <small className="text-muted">Protein</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <div className="fw-bold text-info">{meal.totalCarbs}g</div>
                          <small className="text-muted">Carbs</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <div className="fw-bold text-success">{meal.totalFats}g</div>
                          <small className="text-muted">Fats</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <div className="fw-bold text-danger">{meal.totalCalories}</div>
                          <small className="text-muted">Total</small>
                        </div>
                      </div>
                    </div>

                   
                    <div className="accordion" id={`accordion-${meal.id}`}>
                      <div className="accordion-item border-0">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed bg-light"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-${meal.id}`}
                          >
                            <i className="bi bi-list-ul me-2"></i>
                            View Food Items ({meal.items.length})
                          </button>
                        </h2>
                        <div
                          id={`#collapse-${meal.id}`}
                          className="accordion-collapse collapse"
                          data-bs-parent={`#accordion-${meal.id}`}
                        >
                          <div className="accordion-body">
                            <div className="list-group list-group-flush">
                              {meal.items.map((item, index) => (
                                <div key={index} className="list-group-item border-0 px-0">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h6 className="mb-1">{item.name}</h6>
                                      <small className="text-muted">
                                        P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                                      </small>
                                    </div>
                                    <span className="badge bg-primary">{item.calories} cal</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Add Meal Button */}
          {/* <div className="row">
            <div className="col-12 text-center">
              <button type="button" className="btn btn-primary btn-lg">
                <i className="bi bi-plus-circle me-2"></i>
                Add New Meal
              </button>
            </div>
          </div> */}
        </>
      )}

      {/* Modal for Adding New Item */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Food Item</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">
                          <i className="bi bi-egg me-1"></i>Food Item Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={newItem.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="quantity" className="form-label">
                          <i className="bi bi-speedometer me-1"></i>Quantity
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="quantity"
                          name="quantity"
                          value={newItem.quantity}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <label htmlFor="calories" className="form-label">
                          <i className="bi bi-fire me-1"></i>Calories
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="calories"
                          name="calories"
                          value={newItem.calories}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="carbs" className="form-label">
                          <i className="bi bi-bread-slice me-1"></i>Carbs (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="carbs"
                          name="carbs"
                          value={newItem.carbs}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <label htmlFor="protein" className="form-label">
                          <i className="bi bi-egg-fried me-1"></i>Protein (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="protein"
                          name="protein"
                          value={newItem.protein}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="fats" className="form-label">
                          <i className="bi bi-droplet me-1"></i>Fats (g)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="fats"
                          name="fats"
                          value={newItem.fats}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="row g-3 mt-2">
                      <div className="col-12">
                        <label htmlFor="meal" className="form-label">
                          <i className="bi bi-clock me-1"></i>Meal
                        </label>
                        <select
                          className="form-select"
                          id="meal"
                          name="meal"
                          value={newItem.meal}
                          onChange={handleInputChange}
                        >
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Snack">Snack</option>
                          <option value="Dinner">Dinner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Meal Modal */}
      {showEditMealModal && (
        <EditMealModal
          isOpen={showEditMealModal}
          onClose={() => setShowEditMealModal(false)}
          meal={editingMeal}
          onSave={handleSaveEditedMeal}
        />
      )}
    </div>
  );
}
