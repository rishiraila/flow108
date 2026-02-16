// Centralized authenticated fetch utility that always includes JWT token

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.flow108.in/api";

// Configuration
const CONFIG = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  enableLogging: process.env.NODE_ENV === "development",
};

// Logger utility
const logger = {
  log: (...args) =>
    CONFIG.enableLogging && console.log("[AUTH_FETCH]", ...args),
  warn: (...args) =>
    CONFIG.enableLogging && console.warn("[AUTH_FETCH] WARN:", ...args),
  error: (...args) =>
    CONFIG.enableLogging && console.warn("[AUTH_FETCH] ERROR:", ...args),
};

// Get JWT token from localStorage
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwt");
  }
  return null;
};

// Enhanced fetch with timeout, retry, JWT token, and error handling
const authenticatedFetch = async (url, options = {}, customConfig = {}) => {
  const config = { ...CONFIG, ...customConfig };
  let lastError;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout
    );

    try {
      logger.log(`Attempt ${attempt}/${config.maxRetries}: ${url}`);

      const token = getAuthToken();
      logger.log(`Token found: ${!!token}`);

      const defaultHeaders =
        options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" };

      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...authHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");

        // Handle 401 Unauthorized - clear token and redirect to login
        if (response.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.href = "/AdminLogin";
            return; // Prevent further execution
          }
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");

      // Handle empty or non-JSON responses safely
      if (!contentType || !contentType.includes("application/json")) {
        logger.log(`Success (no JSON body): ${url}`);
        return { Status: true, Message: "Success" };
      }

      const data = await response.json();

      // Check for API error status
      if (data && typeof data === 'object' && (data.status === false || data.Status === false)) {
        throw new Error(data.message || data.Message || "API Error");
      }

      logger.log(`Success: ${url}`);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      if (error.name === "AbortError") {
        logger.warn(`Timeout on attempt ${attempt}: ${url}`);
        lastError = new Error("Request timeout");
      } else if (error.message.includes("Failed to fetch")) {
        logger.warn(`Network error on attempt ${attempt}: ${url}`);
        lastError = new Error("Network error");
      } else {
        logger.warn(`API error on attempt ${attempt}: ${error.message}`);
      }

      // Do not retry client errors
      if (error.message.includes("HTTP 4")) {
        throw lastError;
      }

      if (attempt < config.maxRetries) {
        await new Promise((r) =>
          setTimeout(r, config.retryDelay * attempt)
        );
      }
    }
  }

  logger.error(`All attempts failed: ${url}`, lastError);
  throw lastError;
};

// Exports
export default authenticatedFetch;
export { getAuthToken, API_BASE_URL };
