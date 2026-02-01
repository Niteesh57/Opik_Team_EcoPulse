import { api } from './api';

/**
 * Events Service - API functions for event management
 */
export const eventsService = {
    /**
     * Get all events, optionally filtered by room
     */
    async getEvents(roomId = null, skip = 0, limit = 20) {
        const params = new URLSearchParams({ skip, limit });
        if (roomId) params.append('room_id', roomId);
        return api.get(`/events/?${params.toString()}`);
    },

    /**
     * Get events the current user has joined
     */
    async getUserEvents(skip = 0, limit = 20) {
        return api.get(`/events/user?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get a single event by ID
     */
    async getEvent(eventId) {
        return api.get(`/events/${eventId}`);
    },

    /**
     * Create a new event
     */
    async createEvent(eventData) {
        return api.post('/events/', eventData);
    },

    /**
     * Update an existing event
     */
    async updateEvent(eventId, eventData) {
        return api.put(`/events/${eventId}`, eventData);
    },

    /**
     * Delete an event
     */
    async deleteEvent(eventId) {
        return api.delete(`/events/${eventId}`);
    },

    /**
     * Join an event
     */
    async joinEvent(eventId) {
        return api.post(`/events/${eventId}/join`);
    },

    /**
     * Leave an event
     */
    async leaveEvent(eventId) {
        return api.delete(`/events/${eventId}/leave`);
    },

    /**
     * Get event attendees
     */
    async getEventAttendees(eventId) {
        return api.get(`/events/${eventId}/attendees`);
    },

    /**
     * Get event chat messages
     */
    async getEventMessages(eventId, skip = 0, limit = 50) {
        return api.get(`/messages/${eventId}?skip=${skip}&limit=${limit}`);
    }
};
