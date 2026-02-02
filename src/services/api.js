import { authService } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_URL}/api/v1`;

/**
 * Authenticated fetch wrapper that automatically includes JWT token
 * and handles token refresh on 401 errors
 * 
 * @example
 * // Using the helper methods:
 * import { api } from './services/api';
 * 
 * // GET request
 * const users = await api.get('/users/');
 * 
 * // POST request
 * const newUser = await api.post('/users/', { username: 'john', email: 'john@example.com' });
 * 
 * // PUT request
 * const updated = await api.put('/users/me', { full_name: 'John Doe' });
 * 
 * // DELETE request
 * await api.delete('/users/123');
 */
export async function authenticatedFetch(endpoint, options = {}) {
    const token = authService.getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    // Add authorization header
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // If unauthorized, try to refresh token
        if (response.status === 401) {
            try {
                const newToken = await authService.refreshToken();
                
                // Retry request with new token
                const retryHeaders = {
                    ...headers,
                    'Authorization': `Bearer ${newToken}`
                };
                
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    ...config,
                    headers: retryHeaders
                });

                if (!retryResponse.ok && retryResponse.status === 401) {
                    // Token refresh failed, logout user
                    authService.logout();
                    window.location.href = '/';
                    throw new Error('Session expired. Please login again.');
                }

                return retryResponse;
            } catch (refreshError) {
                // Token refresh failed, logout user
                authService.logout();
                window.location.href = '/';
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Helper methods for common HTTP methods
 */
export const api = {
    async get(endpoint, options = {}) {
        const response = await authenticatedFetch(endpoint, {
            ...options,
            method: 'GET'
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Request failed');
        }
        
        return response.json();
    },

    async post(endpoint, data, options = {}) {
        const response = await authenticatedFetch(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Request failed');
        }
        
        return response.json();
    },

    async put(endpoint, data, options = {}) {
        const response = await authenticatedFetch(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Request failed');
        }
        
        return response.json();
    },

    async patch(endpoint, data, options = {}) {
        const response = await authenticatedFetch(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Request failed');
        }
        
        return response.json();
    },

    async delete(endpoint, options = {}) {
        const response = await authenticatedFetch(endpoint, {
            ...options,
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Request failed');
        }
        
        return response.json();
    }
};
