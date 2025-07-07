# Admin Check API Test

## Endpoint: GET /api/auth/is-admin

### Test Cases:

1. **No Authorization Header**
   - Expected: 401 Unauthorized
   - Response: `{ "error": "Authorization header required" }`

2. **Invalid Token**
   - Expected: 401 Unauthorized  
   - Response: `{ "error": "Invalid authentication token" }`

3. **Valid Token - Non-Admin User**
   - Expected: 200 OK
   - Response: `{ "isAdmin": false }`

4. **Valid Token - Admin User**
   - Expected: 200 OK
   - Response: `{ "isAdmin": true }`

### Usage:
This endpoint is called by the frontend `authService.isAdmin()` method using `UserFetch.get()`, which is used by:
- `useAdmin` hook
- `ProtectedRoute` component (for adminOnly routes)
- `Header` component (to show/hide admin menu)

### Implementation:
- Frontend uses `UserFetch.get<{ isAdmin: boolean }>('/api/auth/is-admin')`
- `UserFetch` automatically handles authentication token from session
- Uses `ky` library for HTTP requests with proper error handling

### Security:
- Uses server-side admin client with service role key
- Validates JWT token on each request
- No direct database access from frontend
- Consistent with other authenticated API calls in the application
