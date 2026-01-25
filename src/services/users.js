import { api } from './api';

export const userService = {
    /**
     * Search for a user by email (Admin only)
     */
    async searchUserByEmail(email) {
        return await api.get(`/users/search?email=${encodeURIComponent(email)}`);
    },

    /**
     * Get all users (Admin only)
     */
    async getAllUsers(skip = 0, limit = 100) {
        return await api.get(`/users/?skip=${skip}&limit=${limit}`);
    }
};
