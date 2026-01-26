import { api, authenticatedFetch } from './api';

const CHAT_BASE_URL = '/chat';

export const chatService = {
    /**
     * Create a new chat session
     * @param {string} firstMessage - The initial user message
     * @returns {Promise<{session_id: string}>}
     */
    async createSession(firstMessage) {
        return api.post(`${CHAT_BASE_URL}/sessions`, {
            first_user_message: firstMessage
        });
    },

    /**
     * Get list of chat sessions
     * @param {number} skip 
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async getSessions(skip = 0, limit = 20) {
        return api.get(`${CHAT_BASE_URL}/sessions?skip=${skip}&limit=${limit}`);
    },

    /**
     * Get details of a specific session
     * @param {string} sessionId 
     * @returns {Promise<Object>}
     */
    async getSession(sessionId) {
        return api.get(`${CHAT_BASE_URL}/sessions/${sessionId}`);
    },

    /**
     * Get messages for a session
     * @param {string} sessionId 
     * @returns {Promise<Array>}
     */
    async getMessages(sessionId) {
        return api.get(`${CHAT_BASE_URL}/sessions/${sessionId}/messages`);
    },

    /**
     * Delete a chat session
     * @param {string} sessionId 
     * @returns {Promise<void>}
     */
    async deleteSession(sessionId) {
        return api.delete(`${CHAT_BASE_URL}/sessions/${sessionId}`);
    },

    /**
     * Stream a chat response
     * @param {Object} payload - { prompt, session_id }
     * @param {Function} onChunk - Callback for each text chunk (delta)
     * @param {Function} onComplete - Callback when stream ends
     * @param {Function} onError - Callback for errors
     */
    async streamChatMessage(payload, onChunk, onComplete, onError) {
        try {
            // We use authenticatedFetch directly to handle the stream manually
            const response = await authenticatedFetch(`${CHAT_BASE_URL}/stream`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Streaming failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Process all complete lines
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    // Remove "data: " prefix
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        try {
                            const data = JSON.parse(dataStr);

                            if (data.error) {
                                throw new Error(data.error);
                            }

                            if (data.delta) {
                                onChunk(data.delta);
                            }

                            if (data.event === 'end') {
                                // Stream finished
                                if (onComplete) onComplete(data);
                                return;
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', line, e);
                        }
                    }
                }
            }

            // Should usually be handled by 'end' event, but just in case
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Stream error:', error);
            if (onError) onError(error);
        }
    }
};
