import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  getNotificationsByUserId,
  saveNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  type Notification,
} from '../utils/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (message: string, userId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const userNotifications = getNotificationsByUserId(user.id);
    // Sort by most recent first
    const sorted = userNotifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotifications(sorted);
    setUnreadCount(getUnreadCount(user.id));
  }, [user?.id]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const addNotification = useCallback(
    (message: string, userId: string) => {
      try {
        saveNotification({
          userId,
          message,
        });
        
        // Only refresh if it's for the current user
        if (userId === user?.id) {
          refreshNotifications();
        }
      } catch (error) {
        console.error('Failed to add notification:', error);
      }
    },
    [user?.id, refreshNotifications]
  );

  const markNotificationAsRead = useCallback(
    (notificationId: string) => {
      try {
        markAsRead(notificationId);
        refreshNotifications();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [refreshNotifications]
  );

  const markAllNotificationsAsRead = useCallback(() => {
    if (!user?.id) return;
    
    try {
      markAllAsRead(user.id);
      refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user?.id, refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

