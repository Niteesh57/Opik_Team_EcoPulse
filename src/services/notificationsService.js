import { api } from './api';

/**
 * Notifications Service - API functions for notification management
 */
export const notificationsService = {
    /**
     * Get user notifications
     */
    async getNotifications(skip = 0, limit = 50) {
        return api.get(`/notifications/?skip=${skip}&limit=${limit}`);
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        return api.post('/notifications/read-all');
    },

    /**
     * Update a notification (e.g. mark as read or update value)
     */
    async updateNotification(id, data) {
        return api.put(`/notifications/${id}`, data);
    },

    /**
     * Mark a single notification as read
     */
    async markAsRead(id) {
        return this.updateNotification(id, { read: true });
    },

    /**
     * Create a notification (if needed from frontend, usually backend triggers this)
     */
    async createNotification(data) {
        return api.post('/notifications/', data);
    }
};
