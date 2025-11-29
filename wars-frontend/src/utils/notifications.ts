/**
 * Notification Storage Utility
 * Stores notifications in localStorage until backend is ready
 */

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = 'wars_mock_notifications';

/**
 * Get all notifications from localStorage
 */
export const getNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading notifications from localStorage:', error);
    return [];
  }
};

/**
 * Get notifications by userId
 */
export const getNotificationsByUserId = (userId: string): Notification[] => {
  const allNotifications = getNotifications();
  return allNotifications.filter((notif) => notif.userId === userId);
};

/**
 * Get unread notifications count for a user
 */
export const getUnreadCount = (userId: string): number => {
  const userNotifications = getNotificationsByUserId(userId);
  return userNotifications.filter((notif) => !notif.read).length;
};

/**
 * Save a new notification to localStorage
 */
export const saveNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
  const allNotifications = getNotifications();
  
  const newNotification: Notification = {
    ...notificationData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  allNotifications.push(newNotification);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
  } catch (error) {
    console.error('Error saving notification to localStorage:', error);
    throw new Error('Failed to save notification');
  }

  return newNotification;
};

/**
 * Mark notification as read
 */
export const markAsRead = (notificationId: string): boolean => {
  const allNotifications = getNotifications();
  const index = allNotifications.findIndex((notif) => notif.id === notificationId);

  if (index === -1) {
    return false;
  }

  allNotifications[index] = {
    ...allNotifications[index],
    read: true,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    return true;
  } catch (error) {
    console.error('Error updating notification in localStorage:', error);
    throw new Error('Failed to update notification');
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = (userId: string): boolean => {
  const allNotifications = getNotifications();
  let updated = false;

  allNotifications.forEach((notif, index) => {
    if (notif.userId === userId && !notif.read) {
      allNotifications[index] = {
        ...notif,
        read: true,
      };
      updated = true;
    }
  });

  if (updated) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
      return true;
    } catch (error) {
      console.error('Error updating notifications in localStorage:', error);
      throw new Error('Failed to update notifications');
    }
  }

  return false;
};

/**
 * Delete a notification
 */
export const deleteNotification = (notificationId: string): boolean => {
  const allNotifications = getNotifications();
  const filtered = allNotifications.filter((notif) => notif.id !== notificationId);

  if (filtered.length === allNotifications.length) {
    return false; // Notification not found
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting notification from localStorage:', error);
    throw new Error('Failed to delete notification');
  }
};

