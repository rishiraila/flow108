// Notification API functions

const API_BASE_URL = "https://flow108.coinagesoft.com/api";

// Common fetch wrapper with error handling and timeout
const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
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

    // Add Authorization header if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

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

// Create notification
export const createNotification = async (notificationData) => {
  try {
    const formData = new FormData();

    formData.append('Title', notificationData.Title);
    formData.append('Message', notificationData.Message);
    formData.append('ScheduledTime', notificationData.ScheduledTime || '');
    formData.append('SendToAll', notificationData.SendToAll.toString());
    formData.append('SendNow', notificationData.SendNow.toString());

    // Append each TargetUserId
    if (notificationData.TargetUserIds && Array.isArray(notificationData.TargetUserIds)) {
      notificationData.TargetUserIds.forEach(id => {
        formData.append('TargetUserIds', id);
      });
    }

    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/notifications/create`,
      {
        method: "POST",
        body: formData,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// List notifications
export const listNotifications = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/notifications/list`
    );
    const data = await handleApiResponse(response);
    return data.data || [];
  } catch (error) {
    console.error("Error listing notifications:", error);
    throw new Error(`Failed to list notifications: ${error.message}`);
  }
};

// Edit notification
export const editNotification = async (id, notificationData) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/notifications/edit/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(notificationData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error editing notification:", error);
    throw new Error(`Failed to edit notification: ${error.message}`);
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/admin/notifications/delete/${id}`,
      {
        method: "DELETE",
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
};
