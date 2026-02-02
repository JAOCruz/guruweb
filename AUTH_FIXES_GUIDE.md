# Authentication Fixes - Implementation Guide

This guide explains the critical authentication fixes that have been implemented and how to deploy them.

## What Was Fixed

### Critical Issues Addressed:

1. **✅ Token Refresh Mechanism**
   - Implemented refresh tokens with 30-day expiration
   - Access tokens now expire after 15 minutes (configurable)
   - Automatic token refresh when access token expires
   - Token rotation on refresh for enhanced security

2. **✅ Automatic Token Refresh**
   - Frontend automatically refreshes expired access tokens
   - Queues multiple requests during refresh to prevent race conditions
   - Seamless user experience - no interruptions

3. **✅ Fixed Silent Error Handling**
   - User loading errors now logged properly
   - Better error messages for debugging
   - Proper cleanup of tokens on auth failures

4. **⚠️ HttpOnly Cookies (Optional - Not Yet Implemented)**
   - Currently using localStorage (vulnerable to XSS)
   - HttpOnly cookies would provide better security
   - Requires backend and frontend coordination
   - See "Future Enhancements" section below

## Changes Made

### Backend Changes:

#### New Files:
- `backend/src/models/RefreshToken.js` - Refresh token management
- `backend/migrations/001_add_refresh_tokens.sql` - Database migration
- `backend/scripts/run-migration.js` - Migration runner

#### Modified Files:
- `backend/src/controllers/authController.js`
  - Added `refresh()` endpoint
  - Added `logout()` endpoint
  - Modified `login()` to issue refresh tokens
  - Changed default access token expiration to 15m

- `backend/src/routes/auth.js`
  - Added POST `/api/auth/refresh`
  - Added POST `/api/auth/logout`

- `backend/package.json`
  - Added `migrate` script

### Frontend Changes:

#### Modified Files:
- `frontend/src/services/api.ts`
  - Added token refresh interceptor
  - Queue system for requests during refresh
  - Automatic retry of failed requests
  - Added `logout()` and `refresh()` API methods

- `frontend/src/context/AuthContext.tsx`
  - Updated `login()` to store refresh token
  - Updated `logout()` to revoke refresh token
  - Fixed silent error handling in `loadUser()`
  - Better error logging

## Deployment Instructions

### Step 1: Run Database Migration

You need to create the `refresh_tokens` table in your PostgreSQL database.

#### Option A: Local Development (Docker)

```bash
# Navigate to backend directory
cd backend

# Run migration script
npm run migrate
```

#### Option B: Railway Production Database

You have 3 options for Railway:

**Option 1: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migration
railway run node scripts/run-migration.js
```

**Option 2: Using Railway Dashboard + psql**

1. Go to your Railway project dashboard
2. Click on your PostgreSQL service
3. Go to "Connect" tab and copy the connection string
4. Run migration using psql:

```bash
# Set DATABASE_URL from Railway
export DATABASE_URL="postgresql://postgres:..."

# Run psql with the migration file
psql $DATABASE_URL < backend/migrations/001_add_refresh_tokens.sql
```

**Option 3: Manually via Railway Web Terminal**

1. Go to Railway dashboard
2. Open your backend service
3. Go to "Settings" → "Deploy"
4. Add a one-time deploy command:
   ```bash
   npm run migrate
   ```

Or add it to your `package.json` start script temporarily:
```json
"start": "node scripts/run-migration.js && node src/index.js"
```

### Step 2: Update Environment Variables

Update your `.env` file (both local and Railway):

```bash
# Optional: Change access token expiration (default: 15m)
JWT_EXPIRES_IN=15m

# Refresh token expiration is set to 30 days in code
# You can modify it in backend/src/controllers/authController.js
```

### Step 3: Deploy Backend

```bash
# If using Railway
git add .
git commit -m "Add refresh token authentication"
git push origin main

# Railway will auto-deploy if connected to GitHub
```

### Step 4: Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to your hosting platform
# Or push to trigger automatic deployment
```

### Step 5: Test the Implementation

1. **Login Test**
   - Log in to your application
   - Check browser DevTools → Application → Local Storage
   - Verify both `token` and `refreshToken` are stored

2. **Token Refresh Test**
   - Wait 15 minutes (or temporarily change JWT_EXPIRES_IN to "1m" for testing)
   - Make any API request
   - Check Network tab - should see a refresh request
   - Original request should succeed after refresh

3. **Logout Test**
   - Click logout
   - Verify tokens are removed from localStorage
   - Check that refresh token is revoked in database:
     ```sql
     SELECT * FROM refresh_tokens WHERE revoked = TRUE;
     ```

## Verification Queries

Check refresh tokens in your database:

```sql
-- View all refresh tokens
SELECT
  rt.id,
  u.username,
  rt.expires_at,
  rt.revoked,
  rt.created_at
FROM refresh_tokens rt
JOIN users u ON u.id = rt.user_id
ORDER BY rt.created_at DESC;

-- Check expired tokens
SELECT COUNT(*) FROM refresh_tokens
WHERE expires_at < NOW() OR revoked = TRUE;

-- Clean up expired/revoked tokens
DELETE FROM refresh_tokens
WHERE expires_at < NOW() OR revoked = TRUE;
```

## API Endpoints

### POST `/api/auth/login`
**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "a1b2c3...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "dataColumn": null
  }
}
```

### POST `/api/auth/refresh`
**Request:**
```json
{
  "refreshToken": "a1b2c3..."
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "d4e5f6..."
}
```

### POST `/api/auth/logout`
**Request:**
```json
{
  "refreshToken": "a1b2c3..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Token Lifecycle

```
Login
  ↓
Access Token (15 min) + Refresh Token (30 days)
  ↓
User makes requests with Access Token
  ↓
Access Token expires (15 min)
  ↓
Frontend detects 401 error
  ↓
Automatically calls /api/auth/refresh
  ↓
Receives new Access Token + new Refresh Token
  ↓
Original request retried with new token
  ↓
Continue using app seamlessly
  ↓
After 30 days: Refresh Token expires
  ↓
User must log in again
```

## Security Improvements Made

1. **Short-lived access tokens (15 min)** - Reduces window of token theft
2. **Long-lived refresh tokens (30 days)** - Better UX, stored separately
3. **Token rotation** - New refresh token issued on each refresh
4. **Refresh token revocation** - Tokens invalidated on logout
5. **Database-backed refresh tokens** - Can revoke tokens server-side
6. **Better error handling** - No more silent failures

## Future Enhancements

### Move to HttpOnly Cookies (Recommended)

**Why?**
- localStorage is vulnerable to XSS attacks
- HttpOnly cookies can't be accessed by JavaScript
- More secure for production apps

**How to implement:**

1. **Backend changes:**
   ```javascript
   // In authController.login
   res.cookie('refreshToken', refreshToken, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production', // HTTPS only
     sameSite: 'strict',
     maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
   });
   ```

2. **Frontend changes:**
   - Remove refreshToken from localStorage
   - Let browser handle cookies automatically
   - Update axios to include credentials:
     ```javascript
     api.defaults.withCredentials = true;
     ```

3. **CORS configuration:**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

## Troubleshooting

### Migration fails with "relation already exists"
The table already exists. You can safely ignore or drop and recreate:
```sql
DROP TABLE IF EXISTS refresh_tokens CASCADE;
```

### Users getting logged out immediately
- Check that JWT_SECRET matches between deployments
- Verify refresh tokens table was created
- Check Railway logs for errors

### 401 errors not triggering refresh
- Check browser console for errors
- Verify refresh token is in localStorage
- Check that refresh endpoint is accessible

### Refresh token expired
- User hasn't logged in for 30 days
- This is expected behavior - user must login again
- Consider increasing expiration in `RefreshToken.create(userId, 30)`

## Rollback Plan

If you need to rollback these changes:

1. **Keep new code but don't run migration:**
   - Backend will fall back to regular tokens
   - Users will get logged out after 7 days (or JWT_EXPIRES_IN)

2. **Remove refresh token code:**
   ```bash
   git revert <commit-hash>
   ```

3. **Clean up database:**
   ```sql
   DROP TABLE IF EXISTS refresh_tokens;
   ```

## Maintenance

### Periodic cleanup of expired tokens

Add to your backend startup or create a cron job:

```javascript
// In backend/src/index.js
const RefreshToken = require('./models/RefreshToken');

// Run cleanup every 24 hours
setInterval(async () => {
  await RefreshToken.cleanup();
  console.log('Cleaned up expired refresh tokens');
}, 24 * 60 * 60 * 1000);
```

Or use Railway's cron jobs feature to run:
```bash
node -e "require('./src/models/RefreshToken').cleanup()"
```

## Questions?

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check browser console for errors
3. Verify environment variables are set
4. Test locally with Docker first

---

**Status:** Ready for deployment
**Breaking Changes:** No - existing sessions will be logged out once
**Requires Migration:** Yes - run database migration first
**Estimated Downtime:** None
