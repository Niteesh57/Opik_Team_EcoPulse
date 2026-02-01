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
     * Handles all backend events: session, status, tool_start, tool_end, wait_for_user, delta, end, error
     * 
     * @param {Object} payload - { message, thread_id (optional) }
     * @param {Object} callbacks - Event handlers for each event type
     */
    async streamChatMessage(payload, callbacks = {}) {
        const {
            onSession = () => { },
            onStatus = () => { },
            onToolStart = () => { },
            onToolEnd = () => { },
            onWaitForUser = () => { },
            onDelta = () => { },
            onComplete = () => { },
            onError = () => { }
        } = callbacks;

        try {
            const response = await authenticatedFetch(`${CHAT_BASE_URL}/stream`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData) {
                        // Handle FastAPI validation errors (detail can be array or string)
                        if (typeof errorData.detail === 'string') {
                            errorMessage = errorData.detail;
                        } else if (Array.isArray(errorData.detail)) {
                            // FastAPI 422 validation errors
                            errorMessage = errorData.detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
                        } else if (errorData.detail) {
                            errorMessage = JSON.stringify(errorData.detail);
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else {
                            errorMessage = JSON.stringify(errorData);
                        }
                    }
                } catch (parseError) {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep incomplete line in buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    // Handle SSE format: "data: {...}"
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        try {
                            const data = JSON.parse(dataStr);

                            // Handle error from stream
                            if (data.error) {
                                onError(new Error(data.error));
                                return;
                            }

                            // Handle all event types from backend
                            switch (data.event) {
                                case 'session':
                                    // Initial session info
                                    onSession({
                                        sessionId: data.session_id,
                                        messageId: data.message_id,
                                        threadId: data.thread_id,
                                        createdSession: data.created_session
                                    });
                                    break;

                                case 'status':
                                    // Status updates: "reasoning", "writing"
                                    onStatus({
                                        status: data.status,
                                        message: data.message
                                    });
                                    break;

                                case 'tool_start':
                                    // Tool execution started
                                    onToolStart({
                                        tool: data.tool,
                                        description: data.description,
                                        args: data.args
                                    });
                                    break;

                                case 'tool_end':
                                    // Tool execution completed
                                    onToolEnd({
                                        tool: data.tool,
                                        resultPreview: data.result_preview
                                    });
                                    break;

                                case 'wait_for_user':
                                    // Agent is waiting for user input (interrupt)
                                    onWaitForUser({
                                        expected: data.expected,
                                        question: data.question,
                                        sessionId: data.session_id
                                    });
                                    break;

                                case 'end':
                                    // Stream completed
                                    onComplete({
                                        sessionId: data.session_id,
                                        messageId: data.message_id,
                                        assistantMessageId: data.assistant_message_id
                                    });
                                    return;

                                default:
                                    // Handle delta (text chunks) - no event field, just delta
                                    if (data.delta !== undefined) {
                                        onDelta(data.delta);
                                    }
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse SSE data:', dataStr, parseError);
                        }
                    }
                }
            }

            // Process any remaining buffer
            if (buffer.trim() && buffer.startsWith('data: ')) {
                try {
                    const data = JSON.parse(buffer.slice(6));
                    if (data.event === 'end') {
                        onComplete({
                            sessionId: data.session_id,
                            messageId: data.message_id,
                            assistantMessageId: data.assistant_message_id
                        });
                        return;
                    } else if (data.delta !== undefined) {
                        onDelta(data.delta);
                    }
                } catch (e) {
                    // Ignore parse errors on final buffer
                }
            }

            // Fallback completion if no explicit end event
            onComplete({});

        } catch (error) {
            console.error('Stream error:', error);
            onError(error);
        }
    }
};
