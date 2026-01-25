# JWT Authentication Setup

## Overview
This application uses JWT (JSON Web Token) based authentication with automatic token refresh and session management.

## Features

### 1. **Secure Login**
- Users authenticate with username and password
- JWT access token and refresh token are returned
- Tokens are stored in localStorage
- User profile is fetched and stored in state

### 2. **Automatic Token Verification**
- On app load, the JWT token is verified by calling `/api/v1/users/me`
- If token is invalid or expired, user is automatically logged out
- Valid tokens keep the user authenticated

### 3. **Token Refresh**
- When an API request returns 401 (Unauthorized), the system automatically attempts to refresh the token
- If refresh succeeds, the original request is retried
- If refresh fails, user is logged out and redirected to login

### 4. **Protected Routes**
- All routes except login are protected
- Unauthenticated users are redirected to login page
- Users can only access routes matching their role (admin/user)

## File Structure

```
src/
├── services/
│   ├── auth.js       # Authentication service
│   └── api.js        # Authenticated API wrapper
├── components/
│   ├── Login.jsx     # Login/Signup component
│   ├── UserDashboard.jsx
│   └── AdminDashboard.jsx
└── App.jsx           # Main app with auth routing
```

## Usage

### Making Authenticated API Calls

Use the `api` helper from `services/api.js`:

```javascript
import { api } from './services/api';

// GET request
const userData = await api.get('/users/me');

// POST request
const result = await api.post('/users/', {
  username: 'john',
  email: 'john@example.com',
  password: 'securepass123'
});

// PUT request
const updated = await api.put('/users/me', {
  full_name: 'John Doe'
});

// DELETE request
await api.delete('/users/123');
```

### Authentication Flow

1. **User logs in** → `authService.login(username, password)`
   - Calls `/api/v1/auth/login`
   - Stores access_token and refresh_token
   - Fetches user profile from `/api/v1/users/me`
   - Returns user data with role

2. **App checks auth on load** → `authService.verifyToken()`
   - Reads token from localStorage
   - Calls `/api/v1/users/me` to verify
   - Returns user data if valid, null if invalid

3. **API request with expired token**
   - Request returns 401
   - `authenticatedFetch` automatically calls `/api/v1/auth/refresh`
   - New tokens are stored
   - Original request is retried
   - If refresh fails, user is logged out

4. **User logs out** → `authService.logout()`
   - Removes tokens from localStorage
   - Calls `/api/v1/auth/logout` endpoint
   - Redirects to login page

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | Login and get JWT tokens |
| `/api/v1/auth/signup` | POST | Register new user |
| `/api/v1/auth/signup-admin` | POST | Register admin user |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/logout` | POST | Logout (client-side token cleanup) |
| `/api/v1/users/me` | GET | Get current user profile (requires auth) |

## Security Features

- ✅ JWT tokens stored in localStorage
- ✅ Automatic token verification on app load
- ✅ Automatic token refresh on expiry
- ✅ Automatic logout on authentication failure
- ✅ Protected routes with role-based access
- ✅ Bearer token authentication header on all API requests
- ✅ Session cleanup on logout

## Environment Setup

The API base URL is set to `/api/v1` by default. Configure your proxy in `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

## Troubleshooting

**Issue: User gets logged out immediately**
- Check if backend is running
- Verify `/api/v1/users/me` endpoint is accessible
- Check browser console for error messages

**Issue: Token refresh not working**
- Verify refresh token is being stored
- Check `/api/v1/auth/refresh` endpoint
- Ensure refresh_token is sent correctly

**Issue: CORS errors**
- Configure CORS on backend to allow credentials
- Ensure proxy is configured in vite.config.js
