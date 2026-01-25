import { api } from './api';

export const roomService = {
    /**
     * Create a new room (Admin only)
     */
    async createRoom(roomData) {
        return await api.post('/rooms/', roomData);
    },

    /**
     * Get all rooms created by current user
     */
    async getMyRooms(skip = 0, limit = 100) {
        return await api.get(`/rooms/my-rooms?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get all rooms
     */
    async getAllRooms(skip = 0, limit = 100) {
        return await api.get(`/rooms/?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get room by room_id
     */
    async getRoom(roomId) {
        return await api.get(`/rooms/${roomId}`);
    },

    /**
     * Update room (Admin only)
     */
    async updateRoom(roomId, roomData) {
        return await api.put(`/rooms/${roomId}`, roomData);
    },

    /**
     * Delete room (Admin only)
     */
    async deleteRoom(roomId) {
        return await api.delete(`/rooms/${roomId}`);
    },

    /**
     * Join a room using room_id and optional room_number
     */
    async joinRoom(roomId, roomNumber = null) {
        try {
            const payload = { room_id: roomId };
            if (roomNumber) {
                payload.room_number = roomNumber;
            }
            return await api.post('/rooms/join', payload);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to join room';
            throw new Error(errorMessage);
        }
    },

    /**
     * Check if user has already joined any room
     */
    async checkUserRoom() {
        try {
            return await api.get('/rooms/check');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Failed to check room membership';
            throw new Error(errorMessage);
        }
    },

    /**
     * Get all rooms the current user has joined
     */
    async getMyJoinedRooms() {
        return await api.get('/rooms/my-joined-rooms');
    },

    /**
     * Leave a room
     */
    async leaveRoom(roomId) {
        return await api.delete(`/rooms/leave/${roomId}`);
    }
};
