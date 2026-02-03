import authenticatedFetch from "./authenticatedFetch";

// Enhanced API client with robust error handling, timeouts, and retry logic

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://flow108.coinagesoft.com/api";

// Configuration
const CONFIG = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second between retries
  enableLogging: process.env.NODE_ENV === "development",
};

// Logger utility
const logger = {
  log: (...args) => CONFIG.enableLogging && console.log("[API]", ...args),
  error: (...args) =>
    CONFIG.enableLogging && console.warn("[API] ERROR:", ...args),
  warn: (...args) =>
    CONFIG.enableLogging && console.warn("[API] WARN:", ...args),
};

// Network connectivity check
const checkNetworkConnectivity = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Enhanced fetch with timeout, retry, and error handling using authenticatedFetch
const enhancedFetch = async (url, options = {}, customConfig = {}) => {
  const config = { ...CONFIG, ...customConfig };

  // 🔒 Force safe default
  const safeOptions = {
    method: options.method || "GET",
    ...options,
  };

  let lastError;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      logger.log(
        `Attempt ${attempt}/${config.maxRetries}: ${safeOptions.method} ${url}`,
      );
      return await authenticatedFetch(url, safeOptions, config);
    } catch (error) {
      lastError = error;

      if (error.message?.includes("HTTP 4")) {
        throw error; // ❌ do not retry client errors
      }

      if (attempt < config.maxRetries) {
        await new Promise((r) => setTimeout(r, config.retryDelay * attempt));
      }
    }
  }

  throw lastError;
};

// Safe API response handler
const handleApiResponse = (response) => {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid API response");
  }

  // If API explicitly returns status
  if (response.Status === false || response.status === false) {
    throw new Error(response.Message || response.message || "API Error");
  }

  // Prefer Data
  if (response.Data !== undefined) return response.Data;
  if (response.data !== undefined) return response.data;

  // DELETE / PATCH often return status only
  return response;
};

// Optimized user count for diet plan (single API call)
export const fetchUserCountForPlan = async (planId) => {
  try {
    logger.log(`Fetching user count for plan: ${planId}`);

    // Try optimized endpoint first
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/user-count`,
    );
    return response.Data || 0;
  } catch (error) {
    logger.warn(`Optimized endpoint failed, trying fallback: ${error.message}`);

    try {
      // Fallback to user mappings
      const response = await enhancedFetch(`${API_BASE_URL}/UserDietPlanMap`);
      const mappings = handleApiResponse(response);

      if (Array.isArray(mappings)) {
        return mappings.filter((mapping) => mapping.DietPlanId === planId)
          .length;
      }

      return 0;
    } catch (fallbackError) {
      logger.error(
        `All user count methods failed for plan ${planId}:`,
        fallbackError,
      );
      return 0; // Graceful degradation
    }
  }
};

// Safe user count fetch
export const fetchUserCount = async () => {
  try {
    logger.log("Fetching total user count");
    const response = await enhancedFetch(`${API_BASE_URL}/Users/count`);
    return response.Data || response.data || 0;
  } catch (error) {
    logger.error("Failed to fetch user count:", error);
    return 0; // Always return 0 instead of throwing
  }
};

// Health check for API connectivity
export const checkApiHealth = async () => {
  try {
    const isConnected = await checkNetworkConnectivity();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Diet plan related APIs
export const dietPlanApi = {
  getAll: async () => {
    const data = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan`);
    return data.Data || data || [];
  },

  getById: async (planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/dietplan/${planId}`,
    );
    return response;
  },

  create: async (planData) => {
    // Use local API route for create
    const response = await enhancedFetch("/api/AdminDietPlan/Dietplan/Create", {
      method: "POST",
      body: JSON.stringify(planData),
    });
    // Return the full response for create operations (includes Status, Message, Data)
    return response;
  },

  update: async (planData) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/update-diet-plan`,
      {
        method: "PUT",
        body: JSON.stringify(planData),
      },
    );
    return handleApiResponse(response);
  },

  delete: async (planId) => {
    console.log("🧹 Deleting plan:", planId);
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/dietplan/${planId}`,
      {
        method: "DELETE",
      },
    );
    console.log("🧹 Delete raw response:", response);

    // For delete operations, the API returns the response directly (not wrapped in Data)
    if (
      response &&
      typeof response === "object" &&
      response.Status !== undefined
    ) {
      return response; // Return the response as-is since it has Status and Message
    }

    // Fallback for unexpected responses
    if (response === null || response === undefined) {
      return { Status: true, Message: "Diet plan deleted successfully" };
    }

    // Try handleApiResponse as last resort
    return handleApiResponse(response);
  },
};

export const mealApi = {
  getByPlan: async (planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/meals`,
    );
    return handleApiResponse(response);
  },

  addToPlan: async (planId, mealData) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/meals`,
      {
        method: "POST",
        body: JSON.stringify(mealData),
      },
    );
    return handleApiResponse(response);
  },

  delete: async (mealId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: "DELETE",
    });
    return handleApiResponse(response);
  },

  getAllMeals: async () => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/GetAllMeals`,
    );
    return handleApiResponse(response);
  },

  recommendMeal: async (recommendationData) => {
    const formData = new FormData();
    formData.append("MealItemId", recommendationData.MealItemId);
    formData.append("MealType", recommendationData.MealType);
    formData.append(
      "RecommendedQuantity",
      recommendationData.RecommendedQuantity,
    );
    formData.append("DietPlanId", recommendationData.DietPlanId);

    // Use local API route instead of calling external API directly
    const response = await enhancedFetch("/api/admin/recommendations/meal", {
      method: "POST",
      body: formData,
    });
    return handleApiResponse(response);
  },

  getRecommendations: async (dietPlanId = null) => {
    const url = dietPlanId
      ? `${API_BASE_URL}/admin/recommendations?dietPlanId=${dietPlanId}`
      : `${API_BASE_URL}/admin/recommendations`;

    const response = await enhancedFetch(url);
    return handleApiResponse(response);
  },

  updateRecommendation: async (id, payload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    return authenticatedFetch(`${API_BASE_URL}/admin/recommendations/${id}`, {
      method: "PATCH",
      body: formData,
    });
  },
  deleteRecommendation: async (recommendationId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/admin/recommendations/${recommendationId}`,
      {
        method: "DELETE",
        headers: { accept: "*/*" },
      },
    );
    return handleApiResponse(response);
  },
};

// Recipe related APIs
export const recipeApi = {
  getAll: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/recipes`);
    return handleApiResponse(response);
  },

  getByMeal: async (mealId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/meals/${mealId}/recipes`,
    );
    return handleApiResponse(response);
  },

  assignToMeal: async (mealId, recipeId, recipeData) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/meals/${mealId}/recipes/${recipeId}`,
      {
        method: "POST",
        body: JSON.stringify(recipeData),
      },
    );
    return handleApiResponse(response);
  },
};

// Diet Plan Assignment related APIs
export const dietAssignmentApi = {
  // Get all diet plan assignments for all users
  getAllAssignments: async () => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/AllDietUserAssignments`,
    );
    return handleApiResponse(response);
  },

  // Get diet plan assignments for a specific user
  getUserAssignments: async (userId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/admin/users/${userId}/diet-assignments`,
    );
    return handleApiResponse(response);
  },

  // Get users assigned to a specific diet plan
 getPlanAssignments: async (planId) => {
  try {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/with-users`
    );

    const allPlans = handleApiResponse(response);

    if (!Array.isArray(allPlans)) return [];

    const plan = allPlans.find(
      (p) => p.DietPlanId?.trim() === planId?.trim()
    );

    return plan?.AssignedUsers || [];
  } catch (error) {
    console.error("Failed to get plan assignments:", error);
    return [];
  }
},


  // Assign diet plan to user
  assignToUser: async (userId, planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/assign/${userId}`,
      {
        method: "POST",
      },
    );
    return handleApiResponse(response);
  },

  // Remove diet plan assignment from user
  removeAssignment: async (userId, planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/admin/users/${userId}/diet-plans/${planId}`,
      {
        method: "DELETE",
      },
    );
    return handleApiResponse(response);
  },
unassignFromPlan: async (planId, userId) => {
  const response = await enhancedFetch(
    `${API_BASE_URL}/AdminDietPlan/${planId}/unassign/${userId}`,
    {
      method: "DELETE",
    }
  );
  return handleApiResponse(response);
},

  // Get user count for a specific diet plan
  getUserCountForPlan: async (planId) => {
    try {
      const response = await enhancedFetch(
        `${API_BASE_URL}/AdminDietPlan/${planId}/user-count`,
      );
      return response.Data || 0;
    } catch (error) {
      logger.warn(`Failed to get user count for diet plan ${planId}:`, error);
      return 0;
    }
  },

  // Assign diet plan to all users
  assignAllToPlan: async (planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/assign-all`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    return handleApiResponse(response);
  },

  // Unassign diet plan from all users
  unassignAllFromPlan: async (planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/unassign-all`,
      {
        method: "DELETE",
      },
    );
    return handleApiResponse(response);
  },
};

// User related APIs
export const userApi = {
  getAll: async () => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminAccount/all-users`,
    );
    return handleApiResponse(response);
  },

  getCount: async () => fetchUserCount(),

  assignPlan: async (userId, planId) => {
    const response = await enhancedFetch(
      `${API_BASE_URL}/AdminDietPlan/${planId}/assign/${userId}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
    return handleApiResponse(response);
  },
};

// Export all APIs
export default {
  dietPlanApi,
  mealApi,
  recipeApi,
  dietAssignmentApi,
  userApi,
  fetchUserCountForPlan,
  fetchUserCount,
  checkApiHealth,
};
