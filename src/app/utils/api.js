// API utility functions for diet plan management

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// Common fetch wrapper with error handling and timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Don't set Content-Type header automatically for multipart/form-data requests
    const headers = options.body instanceof FormData 
      ? { ...options.headers } // Don't set Content-Type for FormData (let browser set it)
      : {
          "Content-Type": "application/json",
          ...options.headers,
        };

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: headers,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout - please check your connection");
    }
    throw error;
  }
};

// Handle API response
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const data = await response.json();
  return data;
};

// Fetch diet plan details
export const fetchDietPlan = async (planId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${planId}`
    );
    const data = await handleApiResponse(response);
    return data.Data;
  } catch (error) {
    console.error("Error fetching diet plan:", error);
    throw new Error(`Failed to fetch diet plan: ${error.message}`);
  }
};

// Fetch meals for a diet plan
export const fetchMealsByPlan = async (planId) => {
  try {
    const plan = await fetchDietPlan(planId);
    return plan.Meals || [];
  } catch (error) {
    console.error("Error fetching meals by plan:", error);
    throw new Error(`Failed to fetch meals: ${error.message}`);
  }
};

// Fetch recipes for a meal
export const fetchRecipesByMeal = async (mealId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/meals/${mealId}/recipes`
    );
    const data = await handleApiResponse(response);
    return data.Data || [];
  } catch (error) {
    console.error("Error fetching recipes by meal:", error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

// Fetch all diet plan user assignments
export const fetchAllDietUserAssignments = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/AllDietUserAssignments`
    );
    const data = await handleApiResponse(response);
    
    // The API should return data in the same format as workout assignments
    // { status: true, message: "Assignments fetched successfully", data: [...] }
    return data;
  } catch (error) {
    console.error("Error fetching diet plan assignments:", error);
    throw new Error(`Failed to fetch diet plan assignments: ${error.message}`);
  }
};

// Fetch diet plan assignments for a specific user
export const fetchUserDietAssignments = async (userId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/users/${userId}/diet-assignments`
    );
    const data = await handleApiResponse(response);
    return data.Data || [];
  } catch (error) {
    console.error("Error fetching user diet assignments:", error);
    throw new Error(`Failed to fetch user diet assignments: ${error.message}`);
  }
};

// Assign diet plan to user
export const assignDietPlanToUser = async (userId, planId, phase = "string") => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/users/${userId}/assign-diet-plan`,
      {
        method: "POST",
        body: JSON.stringify({
          PlanId: planId,
          Phase: phase
        }),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error assigning diet plan to user:", error);
    throw new Error(`Failed to assign diet plan: ${error.message}`);
  }
};

// Remove diet plan assignment from user
export const removeDietPlanAssignment = async (userId, planId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/users/${userId}/diet-plans/${planId}`,
      {
        method: "DELETE",
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error removing diet plan assignment:", error);
    throw new Error(`Failed to remove diet plan assignment: ${error.message}`);
  }
};

// Unassign user from diet plan
export const unassignUserFromDietPlan = async (dietPlanId, userId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${dietPlanId}/unassign/${userId}`,
      {
        method: "DELETE",
        headers: {
          accept: "*/*",
        },
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error unassigning user from diet plan:", error);
    throw new Error(`Failed to unassign user from diet plan: ${error.message}`);
  }
};

// Removed duplicate fetchForumPosts function to fix redeclaration error
export const fetchUserProfile = async (userId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/profile/profile/${userId}`
    );
    const data = await handleApiResponse(response);

    return {
      name: data.UserName || data.GivenName || "Unknown User",
      email: data.Email || "",
      avatar: data.ProfilePhotoUrl && data.ProfilePhotoUrl.trim() !== ""
        ? data.ProfilePhotoUrl
        : getDefaultAvatar(data.UserName),
    };
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    return { name: "Unknown User", avatar: getDefaultAvatar("Unknown") };
  }
};

// Fetch all recipes
export const fetchAllRecipes = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/recipes`);
    const data = await response.json();

    const recipesData = data?.data?.Data || data?.Data || [];

    const validRecipes = recipesData
      .filter((recipe) => recipe && recipe.Id && recipe.Name && recipe.Name !== "string")
      .map((recipe) => ({
        Id: recipe.Id,
        Name: recipe.Name,
        Description: recipe.Description || "",
        Calories: recipe.Calories || 0,
        ImageUrl: recipe.ImageUrl || "",
        Steps: recipe.Steps || [],
        Tags: recipe.Tags || [],
      }));

    return validRecipes;
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminAccount/all-users`
    );
    const data = await handleApiResponse(response);
    const users = data.Data || [];

    // Build lookup object { userId: { name, avatar } }
    const userMap = {};
    users.forEach((u) => {
      userMap[u.Id] = {
        name: u.Name || u.FullName || u.UserName || "Unknown",
        avatar: u.ProfileImage || getDefaultAvatar(u.Name || u.FullName || u.UserName),
      };
    });
    return userMap;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return {};
  }
};

// Add meal to diet plan
export const addMealToPlan = async (planId, mealData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${planId}/meals`,
      {
        method: "POST",
        body: JSON.stringify(mealData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error adding meal to plan:", error);
    throw new Error(`Failed to add meal: ${error.message}`);
  }
};

// Add single meal (multipart/form-data) to AdminDietPlan/addMeal endpoint
export const addSingleMeal = async (mealData) => {
  try {
    const formData = new FormData();
    formData.append('MealType', mealData.MealType);
    formData.append('FoodItem', mealData.FoodItem);
    formData.append('Quantity', mealData.Quantity);
    formData.append('Calories', mealData.Calories.toString());
    formData.append('Carbs', mealData.Carbs.toString());
    formData.append('Protein', mealData.Protein.toString());
    formData.append('Fats', mealData.Fats.toString());

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/addMeal`,
      {
        method: "POST",
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error adding single meal:", error);
    throw new Error(`Failed to add single meal: ${error.message}`);
  }
};

// Assign recipe to meal
export const assignRecipeToMeal = async (mealId, recipeId, recipeData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/meals/${mealId}/recipes/${recipeId}`,
      {
        method: "POST",
        body: JSON.stringify(recipeData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error assigning recipe to meal:", error);
    throw new Error(`Failed to assign recipe: ${error.message}`);
  }
};

// Delete meal from plan
export const deleteMealFromPlan = async (mealId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/meals/${mealId}`, {
      method: "DELETE",
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting meal from plan:", error);
    throw new Error(`Failed to delete meal: ${error.message}`);
  }
};

// Import meals from Excel file
export const importMeals = async (planId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/${planId}/import-meals`,
      {
        method: "POST",
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error importing meals:", error);
    throw new Error(`Failed to import meals: ${error.message}`);
  }
};

// Import meals from Excel file (general import endpoint)
export const importMealsFromExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/import`,
      {
        method: "POST",
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error importing meals from Excel:", error);
    throw new Error(`Failed to import meals: ${error.message}`);
  }
};

// Fetch user count
export const fetchUserCount = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/Users/count`);
    const data = await handleApiResponse(response);
    return data.Data || 0;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0; // Return 0 instead of throwing for user count
  }
};

export const fetchForumPosts = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/community/forum/posts`
    );
    const data = await handleApiResponse(response);

    // The API response has posts inside `data.data`
    const posts = Array.isArray(data.data) ? data.data : [];

    // Convert relative image URLs to absolute URLs
    const baseDomain = "https://flow108.coinagesoft.com";
    return posts.map(post => {
      const updatedPost = { ...post };

      // Convert Media.Url if it's a relative path
      if (post.Media && post.Media.Url && post.Media.Url.startsWith('/')) {
        updatedPost.Media = {
          ...post.Media,
          Url: baseDomain + post.Media.Url
        };
      }

      // Convert ProfilePictureUrl if it's a relative path
      if (post.ProfilePictureUrl && post.ProfilePictureUrl.startsWith('/')) {
        updatedPost.ProfilePictureUrl = baseDomain + post.ProfilePictureUrl;
      }

      return updatedPost;
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    throw new Error(`Failed to fetch forum posts: ${error.message}`);
  }
};

// Fetch forum comments
export const fetchForumComments = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/community/forum/comments`
    );
    const data = await handleApiResponse(response);

    // The API response has comments inside `data`
    const comments = Array.isArray(data.data) ? data.data : [];
    return comments;
  } catch (error) {
    console.error("Error fetching forum comments:", error);
    throw new Error(`Failed to fetch forum comments: ${error.message}`);
  }
};

// Fetch all questions
export const fetchQuestions = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/community/questions`
    );
    const data = await handleApiResponse(response);
    return data.data || [];
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
};

// Fetch all workout plans
export const fetchWorkoutPlans = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan`
    );
    const data = await handleApiResponse(response);
    
    // API returns { status, message, data: [...] }
    const plans = data.data || data.Data || [];
    
    // Convert relative image URLs to absolute URLs for workout plans
    const baseDomain = "https://flow108.coinagesoft.com";
    return plans.map(plan => {
      const updatedPlan = { ...plan };
      
      // Convert Image if it's a relative path
      if (plan.Image && plan.Image.startsWith('/')) {
        updatedPlan.Image = baseDomain + plan.Image;
      }
      
      return updatedPlan;
    });
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    throw new Error(`Failed to fetch workout plans: ${error.message}`);
  }
};

// Add new workout plan
export const addWorkoutPlan = async (workoutData) => {
  try {
    // Create FormData object for multipart/form-data
    const formData = new FormData();

    // Append all fields to formData
    Object.keys(workoutData).forEach(key => {
      if (workoutData[key] !== undefined && workoutData[key] !== null) {
        formData.append(key, workoutData[key]);
      }
    });

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
        },
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error adding workout plan:", error);
    throw new Error(`Failed to add workout plan: ${error.message}`);
  }
};

/**
 * Update an existing workout plan
 * @param {string} workoutId - The UUID of the workout plan to update
 * @param {Object} workoutData - The workout data to update (should include Name field)
 * @returns {Promise<Object>} - Returns the updated workout plan data with status, message, and data properties
 * @throws {Error} - Throws an error if the update fails
 *
 * Example response format:
 * {
 *   "status": true,
 *   "message": "Workout plan updated successfully.",
 *   "data": {
 *     "Id": "56166e2f-0c64-4271-81bd-ee7de92f8cc6",
 *     "Name": "weight",
 *     "CreatedOn": "2025-08-30T04:42:08.0233543",
 *     "ModifiedOn": "2025-08-30T05:36:08.7306108Z"
 *   }
 * }
 */
export const updateWorkoutPlan = async (id, planData) => {
  try {
    const formData = new FormData();

    Object.keys(planData).forEach((key) => {
      if (Array.isArray(planData[key])) {
        planData[key].forEach((item) => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, planData[key]);
      }
    });

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan/${id}`,
      {
        method: "PATCH",
        headers: {
          accept: "*/*",
        },
        body: formData,
      }
    );

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error updating workout plan:", error);
    throw new Error(`Failed to update workout plan: ${error.message}`);
  }
};



// Delete workout plan
export const deleteWorkoutPlan = async (workoutId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan/${workoutId}`,
      {
        method: "DELETE",
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    throw new Error(`Failed to delete workout plan: ${error.message}`);
  }
};

// Fetch workouts of a specific workout plan
export const fetchWorkoutsByPlan = async (planId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan/${planId}/workouts`
    );
    const data = await handleApiResponse(response);
    
    // API returns { status, data: { PlanId, PlanName, Workouts: [...] } }
    const result = data.data || data.Data || { Workouts: [] };
    
    // Convert relative image URLs to absolute URLs for workouts
    const baseDomain = "https://flow108.coinagesoft.com";
    if (result.Workouts && Array.isArray(result.Workouts)) {
      result.Workouts = result.Workouts.map(workout => {
        const updatedWorkout = { ...workout };
        
        // Convert Image if it's a relative path
        if (workout.Image && workout.Image.startsWith('/')) {
          updatedWorkout.Image = baseDomain + workout.Image;
        }
        
        return updatedWorkout;
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching workouts by plan:", error);
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }
};

// Assign users to workout plan
export const assignUsersToWorkout = async (workoutId, userIds) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout_plan/${workoutId}/assign-users`,
      {
        method: "POST",
        body: JSON.stringify({ userIds }),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error assigning users to workout:", error);
    throw new Error(`Failed to assign users to workout: ${error.message}`);
  }
};

// Assign workout to workout plan
export const assignWorkoutToPlan = async (planId, workoutId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout-plans/${planId}/assign-workout`,
      {
        method: "POST",
        body: JSON.stringify({ WorkoutId: workoutId }),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error assigning workout to plan:", error);
    throw new Error(`Failed to assign workout to plan: ${error.message}`);
  }
};

// Fetch all workouts
export const fetchAllWorkouts = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workouts`
    );
    const data = await handleApiResponse(response);
    
    // API returns { status, message, data: [...] }
    const workouts = data.data || data.Data || [];
    
    // Convert relative image URLs to absolute URLs
    const baseDomain = "https://flow108.coinagesoft.com";
    return workouts.map(workout => {
      const updatedWorkout = { ...workout };
      
      // Convert Image if it's a relative path
      if (workout.Image && workout.Image.startsWith('/')) {
        updatedWorkout.Image = baseDomain + workout.Image;
      }
      
      return updatedWorkout;
    });
  } catch (error) {
    console.error("Error fetching workouts:", error);
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }
};

// Add new workout
export const addWorkout = async (workoutData) => {
  try {
    // Create FormData object for multipart/form-data
    const formData = new FormData();

    // Append all fields to formData, but only append Image if it's a File object
    Object.keys(workoutData).forEach(key => {
      if (workoutData[key] !== undefined && workoutData[key] !== null && workoutData[key] !== "") {
        if (key === 'Image' && !(workoutData[key] instanceof File)) {
          // Don't append Image if it's not a File object
          return;
        }
        formData.append(key, workoutData[key]);
      }
    });

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workouts`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
        },
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error adding workout:", error);
    throw new Error(`Failed to add workout: ${error.message}`);
  }
};

// Update workout
export const updateWorkout = async (workoutId, workoutData) => {
  try {
    // Create FormData object for multipart/form-data
    const formData = new FormData();

    // Append all fields to formData, but only append Image if it's a File object
    Object.keys(workoutData).forEach(key => {
      if (workoutData[key] !== undefined && workoutData[key] !== null && workoutData[key] !== "") {
        if (key === 'Image' && !(workoutData[key] instanceof File)) {
          // Don't append Image if it's not a File object
          return;
        }
        formData.append(key, workoutData[key]);
      }
    });

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workouts/${workoutId}`,
      {
        method: "PATCH",
        headers: {
          accept: "*/*",
        },
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error updating workout:", error);
    throw new Error(`Failed to update workout: ${error.message}`);
  }
};

// Delete workout
export const deleteWorkout = async (workoutId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workouts/${workoutId}`,
      {
        method: "DELETE",
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting workout:", error);
    throw new Error(`Failed to delete workout: ${error.message}`);
  }
};

// Remove workout from workout plan
export const removeWorkoutFromPlan = async (planId, workoutId) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/workout-plans/${planId}/remove-workout/${workoutId}`,
      {
        method: "DELETE",
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error removing workout from plan:", error);
    throw new Error(`Failed to remove workout from plan: ${error.message}`);
  }
};

// Helper function for default avatar (needed by fetchUserProfile)
const getDefaultAvatar = (name) => {
  // Simple default avatar implementation
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

// Fetch all workout user assignments
export const fetchAllWorkoutUserAssignments = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/AllUserAssignments`
    );
    const data = await handleApiResponse(response);

    // The API returns data in the format: { status, message, data: [...] }
    const userAssignments = data.data || [];

    // Transform the nested structure into a flat list of assignments
    const flatAssignments = [];

    userAssignments.forEach(user => {
      if (user.Plans && Array.isArray(user.Plans)) {
        user.Plans.forEach(plan => {
          flatAssignments.push({
            AssignmentId: `${user.UserId}-${plan.PlanId}`, // Create a unique ID
            UserId: user.UserId,
            WorkoutPlanId: plan.PlanId,
            PlanName: plan.PlanName,
            AssignedDate: plan.AssignedOn,
            Status: 'Active', // Default status since API doesn't provide it
            userName: user.Name,
            userEmail: user.Email
          });
        });
      }
    });

    return flatAssignments;
  } catch (error) {
    console.error("Error fetching workout user assignments:", error);
    throw new Error(`Failed to fetch workout user assignments: ${error.message}`);
  }
};

// Nutrition/Calories Counter API Functions

// Upload nutrition file for processing
export const uploadNutritionFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('nutritionFile', file);

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/nutrition/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error uploading nutrition file:", error);
    throw new Error(`Failed to upload nutrition file: ${error.message}`);
  }
};

// Fetch processed nutrition data
export const fetchNutritionData = async (userId = null) => {
  try {
    const url = userId
      ? `${API_BASE_URL}/nutrition/data?userId=${userId}`
      : `${API_BASE_URL}/nutrition/data`;

    const response = await fetchWithTimeout(url);
    const data = await handleApiResponse(response);

    return data.data || [];
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    throw new Error(`Failed to fetch nutrition data: ${error.message}`);
  }
};

// Process and store nutrition data
export const processNutritionData = async (nutritionData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/nutrition/process`,
      {
        method: 'POST',
        body: JSON.stringify(nutritionData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error processing nutrition data:", error);
    throw new Error(`Failed to process nutrition data: ${error.message}`);
  }
};

// Get nutrition summary/stats
export const fetchNutritionSummary = async (userId = null) => {
  try {
    const url = userId
      ? `${API_BASE_URL}/nutrition/summary?userId=${userId}`
      : `${API_BASE_URL}/nutrition/summary`;

    const response = await fetchWithTimeout(url);
    const data = await handleApiResponse(response);

    return data.data || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      dailyGoals: {
        calories: 2500,
        protein: 150,
        carbs: 250,
        fats: 80
      }
    };
  } catch (error) {
    console.error("Error fetching nutrition summary:", error);
    throw new Error(`Failed to fetch nutrition summary: ${error.message}`);
  }
};

// Update meal in diet plan
export const updateMeal = async (mealId, mealData) => {
  try {
    const formData = new FormData();
    formData.append('MealType', mealData.MealType);
    formData.append('FoodItem', mealData.FoodItem);
    formData.append('Quantity', mealData.Quantity);
    formData.append('Calories', mealData.Calories.toString());
    formData.append('Carbs', mealData.Carbs.toString());
    formData.append('Protein', mealData.Protein.toString());
    formData.append('Fats', mealData.Fats.toString());

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/AdminDietPlan/update/meal/${mealId}`,
      {
        method: "PATCH",
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error updating meal:", error);
    throw new Error(`Failed to update meal: ${error.message}`);
  }
};

// Fetch all meals
export const fetchAllMeals = async () => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/AdminDietPlan/GetAllMeals`);
    const data = await handleApiResponse(response);
    return data.Data || [];
  } catch (error) {
    console.error("Error fetching all meals:", error);
    throw new Error(`Failed to fetch all meals: ${error.message}`);
  }
};

