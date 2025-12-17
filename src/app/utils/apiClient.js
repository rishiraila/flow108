// Enhanced API client with robust error handling, timeouts, and retry logic

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow108.coinagesoft.com/api';

// Configuration
const CONFIG = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second between retries
  enableLogging: process.env.NODE_ENV === 'development'
};

// Logger utility
const logger = {
  log: (...args) => CONFIG.enableLogging && console.log('[API]', ...args),
  error: (...args) => CONFIG.enableLogging && console.warn('[API] ERROR:', ...args),
  warn: (...args) => CONFIG.enableLogging && console.warn('[API] WARN:', ...args)
};

// Network connectivity check
const checkNetworkConnectivity = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Enhanced fetch with timeout, retry, and error handling
const enhancedFetch = async (url, options = {}, customConfig = {}) => {
  const config = { ...CONFIG, ...customConfig };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      logger.log(`Attempt ${attempt}/${config.maxRetries}: ${url}`);
      
      const defaultHeaders = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      logger.log(`Success: ${url}`);
      return data;
      
    } catch (error) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        logger.warn(`Timeout on attempt ${attempt}: ${url}`);
        lastError = new Error('Request timeout - please check your connection');
      } else if (error.message.includes('Failed to fetch')) {
        logger.warn(`Network error on attempt ${attempt}: ${url}`);
        lastError = new Error('Network error - please check your connection');
      } else {
        logger.warn(`API error on attempt ${attempt}: ${error.message}`);
      }
      
      // Don't retry for 4xx errors (client errors)
      if (error.message.includes('HTTP 4')) {
        throw lastError;
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
      }
    }
  }
  
  logger.error(`All attempts failed: ${url}`, lastError);
  throw lastError;
};

// Safe API response handler
const handleApiResponse = (response) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  // Handle different response structures
  const data = response.Data || response.data?.Data || response.data || response;
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object') {
    return data;
  }
  
  throw new Error('Unexpected API response structure');
};

// Optimized user count for diet plan (single API call)
export const fetchUserCountForPlan = async (planId) => {
  try {
    logger.log(`Fetching user count for plan: ${planId}`);
    
    // Try optimized endpoint first
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/user-count`);
    return response.Data || 0;
    
  } catch (error) {
    logger.warn(`Optimized endpoint failed, trying fallback: ${error.message}`);
    
    try {
      // Fallback to user mappings
      const response = await enhancedFetch(`${API_BASE_URL}/UserDietPlanMap`);
      const mappings = handleApiResponse(response);
      
      if (Array.isArray(mappings)) {
        return mappings.filter(mapping => mapping.DietPlanId === planId).length;
      }
      
      return 0;
    } catch (fallbackError) {
      logger.error(`All user count methods failed for plan ${planId}:`, fallbackError);
      return 0; // Graceful degradation
    }
  }
};

// Safe user count fetch
export const fetchUserCount = async () => {
  try {
    logger.log('Fetching total user count');
    const response = await enhancedFetch(`${API_BASE_URL}/Users/count`);
    return response.Data || response.data || 0;
  } catch (error) {
    logger.error('Failed to fetch user count:', error);
    return 0; // Always return 0 instead of throwing
  }
};

// Health check for API connectivity
export const checkApiHealth = async () => {
  try {
    const isConnected = await checkNetworkConnectivity();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Diet plan related APIs
export const dietPlanApi = {
  getAll: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan`);
    return handleApiResponse(response);
  },
  
  getById: async (planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}`);
    return handleApiResponse(response);
  },
  
  create: async (planData) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/Dietplan/Create`, {
      method: 'POST',
      body: JSON.stringify(planData)
    });
    return handleApiResponse(response);
  },
  
  update: async (planData) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/update-diet-plan`, {
      method: 'PUT',
      body: JSON.stringify(planData)
    });
    return handleApiResponse(response);
  },
  
  delete: async (planId) => {
    console.log("🧹 Deleting plan:", planId);
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/dietplan/${planId}`, {
      method: 'DELETE'
    });
    console.log("🧹 Delete raw response:", response);

    // For delete operations, the API returns the response directly (not wrapped in Data)
    if (response && typeof response === 'object' && response.Status !== undefined) {
      return response; // Return the response as-is since it has Status and Message
    }

    // Fallback for unexpected responses
    if (response === null || response === undefined) {
      return { Status: true, Message: 'Diet plan deleted successfully' };
    }

    // Try handleApiResponse as last resort
    return handleApiResponse(response);
  }

};

export const mealApi = {
  getByPlan: async (planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/meals`);
    return handleApiResponse(response);
  },

  addToPlan: async (planId, mealData) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/meals`, {
      method: 'POST',
      body: JSON.stringify(mealData)
    });
    return handleApiResponse(response);
  },

  delete: async (mealId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/meals/${mealId}`, {
      method: 'DELETE'
    });
    return handleApiResponse(response);
  },

  getAllMeals: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/GetAllMeals`);
    return handleApiResponse(response);
  }
};

// Recipe related APIs
export const recipeApi = {
  getAll: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/recipes`);
    return handleApiResponse(response);
  },
  
  getByMeal: async (mealId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/meals/${mealId}/recipes`);
    return handleApiResponse(response);
  },
  
  assignToMeal: async (mealId, recipeId, recipeData) => {
    const response = await enhancedFetch(`${API_BASE_URL}/meals/${mealId}/recipes/${recipeId}`, {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
    return handleApiResponse(response);
  }
};

// Diet Plan Assignment related APIs
export const dietAssignmentApi = {
  // Get all diet plan assignments for all users
  getAllAssignments: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/admin/AllDietUserAssignments`);
    return handleApiResponse(response);
  },
  
  // Get diet plan assignments for a specific user
  getUserAssignments: async (userId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/admin/users/${userId}/diet-assignments`);
    return handleApiResponse(response);
  },

  // Get users assigned to a specific diet plan
  getPlanAssignments: async (planId) => {
    try {
      // Check API health before making the request
      const healthCheck = await checkApiHealth();
      if (!healthCheck.connected) {
        logger.warn(`API health check failed: ${healthCheck.error || 'Unknown error'}`);
        return []; // Return empty array for offline/network issues
      }

      // Use fallback endpoint primarily due to primary endpoint network issues
      const response = await enhancedFetch(`${API_BASE_URL}/admin/AllDietUserAssignments`);
      const allAssignments = handleApiResponse(response);

      // Filter assignments for this specific plan
      if (Array.isArray(allAssignments)) {
        const filteredAssignments = allAssignments.filter(assignment => assignment.DietPlanId === planId);
        logger.log(`Found ${filteredAssignments.length} assignments for plan ${planId}`);
        return filteredAssignments;
      }

      logger.warn(`No assignments found for plan ${planId}`);
      return [];
    } catch (error) {
      logger.error(`Failed to get assignments for plan ${planId}:`, error.message || error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  },
  
  // Assign diet plan to user
  assignToUser: async (userId, planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/assign/${userId}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return handleApiResponse(response);
  },
  
  // Remove diet plan assignment from user
  removeAssignment: async (userId, planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/admin/users/${userId}/diet-plans/${planId}`, {
      method: 'DELETE'
    });
    return handleApiResponse(response);
  },
  
  // Get user count for a specific diet plan
  getUserCountForPlan: async (planId) => {
    try {
      const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/user-count`);
      return response.Data || 0;
    } catch (error) {
      logger.warn(`Failed to get user count for diet plan ${planId}:`, error);
      return 0;
    }
  },

  // Assign diet plan to all users
  assignAllToPlan: async (planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/assign-all`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return handleApiResponse(response);
  },

  // Unassign diet plan from all users
  unassignAllFromPlan: async (planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/unassign-all`, {
      method: 'DELETE'
    });
    return handleApiResponse(response);
  }
};

// User related APIs
export const userApi = {
  getAll: async () => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminAccount/all-users`);
    return handleApiResponse(response);
  },
  
  getCount: async () => fetchUserCount(),
  
  assignPlan: async (userId, planId) => {
    const response = await enhancedFetch(`${API_BASE_URL}/AdminDietPlan/${planId}/assign/${userId}`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    return handleApiResponse(response);
  }
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
  checkApiHealth
};
