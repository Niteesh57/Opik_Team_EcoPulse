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
     * Stream a chat response with enhanced events
     * @param {Object} payload - { message, thread_id (optional) }
     * @param {Object} callbacks - { onSession, onStatus, onToolStart, onToolEnd, onDelta, onComplete, onError }
     */
    async streamChatMessage(payload, callbacks = {}) {
        const {
            onSession = () => { },
            onStatus = () => { },
            onToolStart = () => { },
            onToolEnd = () => { },
            onDelta = () => { },
            onComplete = () => { },
            onError = () => { }
        } = callbacks;

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

                            // Handle different event types
                            switch (data.event) {
                                case 'session':
                                    onSession({
                                        sessionId: data.session_id,
                                        messageId: data.message_id,
                                        threadId: data.thread_id,
                                        createdSession: data.created_session
                                    });
                                    break;

                                case 'status':
                                    onStatus({
                                        status: data.status,
                                        message: data.message
                                    });
                                    break;

                                case 'tool_start':
                                    onToolStart({
                                        tool: data.tool,
                                        description: data.description,
                                        args: data.args
                                    });
                                    break;

                                case 'tool_end':
                                    onToolEnd({
                                        tool: data.tool,
                                        resultPreview: data.result_preview
                                    });
                                    break;

                                case 'end':
                                    onComplete({
                                        sessionId: data.session_id,
                                        messageId: data.message_id,
                                        assistantMessageId: data.assistant_message_id
                                    });
                                    return;

                                default:
                                    // Handle delta (text chunks)
                                    if (data.delta) {
                                        onDelta(data.delta);
                                    }
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', line, e);
                        }
                    }
                }
            }

            // Fallback completion
            onComplete({});

        } catch (error) {
            console.error('Stream error:', error);
            onError(error);
        }
    }
};
