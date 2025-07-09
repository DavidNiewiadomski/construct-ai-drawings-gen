import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationHook {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export function useNotifications(): NotificationHook {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('app-notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50

    // Show toast for immediate feedback
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default'
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('app-notifications');
  }, []);

  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    showToast
  };
}

// Predefined notification helpers
export const NotificationHelpers = {
  fileUploaded: (filename: string) => ({
    type: 'success' as const,
    title: 'File Uploaded',
    message: `${filename} has been uploaded successfully.`
  }),

  fileProcessed: (filename: string, componentsFound: number) => ({
    type: 'success' as const,
    title: 'Processing Complete',
    message: `${filename} processed. Found ${componentsFound} components.`
  }),

  fileError: (filename: string, error: string) => ({
    type: 'error' as const,
    title: 'Upload Failed',
    message: `Failed to upload ${filename}: ${error}`
  }),

  backingSaved: () => ({
    type: 'success' as const,
    title: 'Changes Saved',
    message: 'Backing placements have been saved successfully.'
  }),

  exportReady: (format: string) => ({
    type: 'success' as const,
    title: 'Export Complete',
    message: `Your ${format} export is ready for download.`
  }),

  collaboratorJoined: (name: string) => ({
    type: 'info' as const,
    title: 'Collaborator Joined',
    message: `${name} is now viewing this project.`
  }),

  commentAdded: (author: string) => ({
    type: 'info' as const,
    title: 'New Comment',
    message: `${author} added a comment to your drawing.`
  }),

  approvalRequired: (reviewer: string) => ({
    type: 'warning' as const,
    title: 'Approval Required',
    message: `${reviewer} needs to review your drawings.`
  }),

  approvalReceived: (reviewer: string, status: string) => ({
    type: status === 'approved' ? 'success' as const : 'warning' as const,
    title: `Drawing ${status}`,
    message: `${reviewer} has ${status} your drawings.`
  }),

  standardsUpdated: () => ({
    type: 'info' as const,
    title: 'Standards Updated',
    message: 'Company backing standards have been updated.'
  }),

  systemMaintenance: (scheduledTime: string) => ({
    type: 'warning' as const,
    title: 'Scheduled Maintenance',
    message: `System maintenance scheduled for ${scheduledTime}.`
  })
};

// Hook for system-wide notifications (connection status, etc.)
export function useSystemNotifications() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Online/offline status
    const handleOnline = () => {
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'You are back online.'
      });
    };

    const handleOffline = () => {
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You are currently offline. Changes will sync when reconnected.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab - could check for updates
        // This is where you might sync data or check for new notifications
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addNotification]);
}