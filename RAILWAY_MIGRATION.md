# Railway Migration Guide - Quick Reference

## Run Migration on Railway PostgreSQL

### Method 1: Railway CLI (Easiest)

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to your project (run in project root)
cd /Users/jay/Documents/W/guruweb
railway link

# Run migration
cd backend
railway run npm run migrate
```

### Method 2: Using psql (No CLI needed)

```bash
# Get your Railway PostgreSQL connection string
# Go to: Railway Dashboard → PostgreSQL → Connect tab
# Copy the "PostgreSQL Connection URL"

# It looks like:
# postgresql://postgres:PASSWORD@HOST:PORT/railway

# Run migration
psql "postgresql://postgres:PASSWORD@HOST:PORT/railway" \
  -f backend/migrations/001_add_refresh_tokens.sql
```

### Method 3: Add to Railway Deployment

**Option A: Temporary start script**

1. Edit `backend/package.json`:
```json
{
  "scripts": {
    "start": "node scripts/run-migration.js && node src/index.js"
  }
}
```

2. Push to GitHub (triggers Railway deploy)
3. Migration runs automatically before app starts
4. After deployment succeeds, revert the change:
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

**Option B: One-time Railway command**

1. Go to Railway Dashboard
2. Select your backend service
3. Go to "Settings" → "Deploy"
4. Under "Custom Start Command", temporarily set:
```
node scripts/run-migration.js && node src/index.js
```
5. Trigger a new deployment
6. After success, remove the custom start command

## Verify Migration Success

After running migration, check if table was created:

```bash
# Using Railway CLI
railway run psql -c "SELECT * FROM refresh_tokens LIMIT 5;"

# Or using connection string
psql "YOUR_CONNECTION_STRING" \
  -c "SELECT * FROM refresh_tokens LIMIT 5;"
```

Expected output:
```
 id | user_id | token | expires_at | created_at | revoked
----+---------+-------+------------+------------+---------
(0 rows)
```

## Environment Variables

Make sure these are set in Railway:

```
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRES_IN=15m
DB_HOST=<provided by Railway>
DB_PORT=<provided by Railway>
DB_NAME=<provided by Railway>
DB_USER=<provided by Railway>
DB_PASSWORD=<provided by Railway>
```

Railway automatically sets the `DATABASE_URL` variable. The migration script will use individual DB_* variables if available, or fall back to DATABASE_URL.

## Common Issues

### "relation 'refresh_tokens' already exists"
✅ Table already created - you're good!

### "password authentication failed"
❌ Check your DATABASE_URL or DB_PASSWORD

### "cannot connect to server"
❌ Check DB_HOST and DB_PORT, or try using DATABASE_URL

### "scripts/run-migration.js not found"
❌ Make sure you're in the backend directory

## Full Deployment Checklist

```bash
# 1. Commit all changes
git add .
git commit -m "Add refresh token authentication"

# 2. Push to GitHub (triggers Railway deploy)
git push origin main

# 3. Run migration on Railway
railway run npm run migrate

# 4. Verify migration
railway run psql -c "\dt refresh_tokens"

# 5. Test your app
# - Login at your Railway frontend URL
# - Check that tokens are stored
# - Wait 15 minutes and verify refresh works

# 6. Monitor logs
railway logs
```

## Rollback (if needed)

```bash
# Drop the refresh_tokens table
railway run psql -c "DROP TABLE refresh_tokens CASCADE;"

# Revert code changes
git revert HEAD
git push origin main
```

## Need Help?

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- PostgreSQL in Railway: https://docs.railway.app/databases/postgresql

---

**Estimated Time:** 5 minutes
**Requires:** Railway account with project deployed
**Risk:** Low - migration is additive, doesn't modify existing tables
