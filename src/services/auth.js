const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE = `${API_URL}/api/v1/auth`;
const USER_API_BASE = `${API_URL}/api/v1/users`;
const ROOM_API_BASE = `${API_URL}/api/v1/rooms`;

export const authService = {
    async login(username, password) {
        try {
            // 1. Get Token
            const tokenResponse = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!tokenResponse.ok) {
                const err = await tokenResponse.json().catch(() => ({}));
                throw new Error(err.detail || 'Login failed');
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // Save tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', tokenData.refresh_token);

            // 2. Get User Details
            const userResponse = await fetch(`${USER_API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!userResponse.ok) {
                // Clear invalid token
                this.logout();
                throw new Error('Failed to fetch user profile');
            }

            const userData = await userResponse.json();

            // Map to internal role format
            const user = {
                ...userData,
                role: userData.is_superuser ? 'admin' : 'user'
            };

            return { user, token: accessToken };

        } catch (error) {
            console.error("Auth Error:", error);
            throw error;
        }
    },

    async verifyToken() {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const userResponse = await fetch(`${USER_API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!userResponse.ok) {
                // Token is invalid or expired
                this.logout();
                return null;
            }

            const userData = await userResponse.json();

            // Map to internal role format
            const user = {
                ...userData,
                role: userData.is_superuser ? 'admin' : 'user'
            };

            return user;

        } catch (error) {
            console.error("Token verification failed:", error);
            this.logout();
            return null;
        }
    },

    async refreshToken() {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${API_BASE}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                this.logout();
                throw new Error('Token refresh failed');
            }

            const tokenData = await response.json();
            localStorage.setItem('access_token', tokenData.access_token);
            localStorage.setItem('refresh_token', tokenData.refresh_token);

            return tokenData.access_token;

        } catch (error) {
            console.error("Token refresh error:", error);
            this.logout();
            throw error;
        }
    },

    async signup(username, email, password, fullName = null) {
        const response = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name: fullName }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Signup failed');
        }

        // Auto-login to establish session
        return this.login(username, password);
    },

    async signupAdmin(username, email, password, fullName = null) {
        const response = await fetch(`${API_BASE}/signup-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name: fullName }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Admin signup failed');
        }

        // Auto-login to establish session
        return this.login(username, password);
    },

    async logout() {
        const token = localStorage.getItem('access_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        if (token) {
            try {
                await fetch(`${API_BASE}/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                // Ignore logout errors
            }
        }
    },

    getToken() {
        return localStorage.getItem('access_token');
    },

    async checkUserRoomStatus() {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${ROOM_API_BASE}/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // User hasn't joined any room
                    return null;
                }
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.detail || 'Failed to check room status';
                throw new Error(errorMessage);
            }

            return await response.json();

        } catch (error) {
            console.error("Room status check failed:", error);
            // Check if it's a room-not-found type error
            if (error.message?.includes('not found') || error.message?.includes('No room found')) {
                return null;
            }
            return null;
        }
    },

    async verifyUserAndRoomStatus() {
        const user = await this.verifyToken();
        if (!user) {
            return { user: null, roomStatus: null };
        }

        // For admin users, they don't need to join a room
        if (user.role === 'admin') {
            return { user, roomStatus: { hasRoom: true, isAdmin: true } };
        }

        // For regular users, check if they've joined a room
        const roomStatus = await this.checkUserRoomStatus();
        return { 
            user, 
            roomStatus: roomStatus ? { hasRoom: true, room: roomStatus } : { hasRoom: false }
        };
    }
};
