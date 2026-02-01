import { api } from './api';

/**
 * Champions Service - API functions for leaderboard/champions management
 */
export const championsService = {
    /**
     * Get champions/leaderboard
     */
    async getChampions(skip = 0, limit = 10) {
        return api.get(`/champions/?skip=${skip}&limit=${limit}`);
    }
};
