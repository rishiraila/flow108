import authenticatedFetch from "./authenticatedFetch";

// Notification API functions

const API_BASE_URL = "https://flow108.coinagesoft.com/api";



// Create notification
export const createNotification = async (notificationData) => {
  try {
    const formData = new FormData();

    formData.append('Title', notificationData.Title);
    formData.append('Message', notificationData.Message);
    formData.append('ScheduledTime', notificationData.ScheduledTime || '');
    formData.append('SendToAll', notificationData.SendToAll.toString());
    formData.append('SendNow', notificationData.SendNow.toString());

    // Append the image file if present
    if (notificationData.Image) {
      formData.append('ImageFile', notificationData.Image);
    }

    // Append each TargetUserId
    if (notificationData.TargetUserIds && Array.isArray(notificationData.TargetUserIds)) {
      notificationData.TargetUserIds.forEach(id => {
        formData.append('TargetUserIds', id);
      });
    }

    const data = await authenticatedFetch(`${API_BASE_URL}/admin/notifications/create`, {
      method: "POST",
      body: formData,
    });
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

// List notifications
export const listNotifications = async () => {
  try {
    const data = await authenticatedFetch(`${API_BASE_URL}/admin/notifications/list`);
    return data.data || [];
  } catch (error) {
    console.error("Error listing notifications:", error);
    throw new Error(`Failed to list notifications: ${error.message}`);
  }
};

// Edit notification
export const editNotification = async (id, notificationData) => {
  try {
    const data = await authenticatedFetch(`${API_BASE_URL}/admin/notifications/edit/${id}`, {
      method: "PUT",
      body: JSON.stringify(notificationData),
    });
    return data;
  } catch (error) {
    console.error("Error editing notification:", error);
    throw new Error(`Failed to edit notification: ${error.message}`);
  }
};

// Delete notification
export const deleteNotification = async (id) => {
  try {
    const data = await authenticatedFetch(`${API_BASE_URL}/admin/notifications/delete/${id}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
};
