import { api } from './api';

export const usersService = {
    async updateMe(data) {
        return api.put('/users/me', data);
    },

    async getMe() {
        return api.get('/users/me');
    }
};
