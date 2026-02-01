import { api } from './api';

/**
 * Neighbors Service - API functions for near people / community members
 */
export const neighborsService = {
    /**
     * Get all near people (neighbors) for current user
     */
    async getNeighbors(skip = 0, limit = 100) {
        return api.get(`/near-people/?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get all members in the same community
     */
    async getRoomMembers(skip = 0, limit = 50) {
        return api.get(`/near-people/members?skip=${skip}&limit=${limit}`);
    },

    /**
     * Search for users in the same community
     */
    async searchMembers(query, skip = 0, limit = 20) {
        return api.get(`/near-people/search?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`);
    },

    /**
     * Add a user as neighbor
     */
    async addNeighbor(nearUserId, nickname = null, notes = null) {
        const data = { near_user_id: nearUserId };
        if (nickname) data.nickname = nickname;
        if (notes) data.notes = notes;
        return api.post('/near-people/add', data);
    },

    /**
     * Update neighbor details
     */
    async updateNeighbor(nearPersonId, data) {
        return api.put(`/near-people/${nearPersonId}`, data);
    },

    /**
     * Remove a neighbor
     */
    async removeNeighbor(nearPersonId) {
        return api.delete(`/near-people/${nearPersonId}`);
    }
};
