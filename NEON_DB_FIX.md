# Neon Database Connection Fix

## Issue
Neon free tier databases go to "IDLE" status after inactivity, causing connection failures during login/signup.

## Solutions Applied

### 1. Keep-alive Fix (✅ Completed)
- Modified `utils/keepalive.js` to ping `/wake-up` instead of `/health`
- This avoids unnecessary database queries while keeping the server awake
- Set `KEEPALIVE_DB_PING=true` only if you want to deliberately wake the DB

### 2. Database Connection Retry (🔄 In Progress)
- Adding retry logic to handle IDLE database wake-up
- Adding connection debugging endpoint

### 3. Manual Steps for Immediate Fix

#### Option A: Wake up database manually
1. Go to your Neon dashboard: https://console.neon.tech
2. Click on your **production** branch (currently IDLE)
3. Look for a "Resume" or "Wake Up" button and click it
4. Wait 30-60 seconds for the database to become ACTIVE

#### Option B: Check connection string
1. In Neon dashboard, click on your **production** branch
2. Go to "Connection Details" or "Settings"
3. Copy the connection string (starts with `postgres://...`)
4. Make sure it matches your `DATABASE_URL` in Render environment variables

### 4. Environment Variables for Render
```
# Keep server awake without hitting DB
KEEPALIVE_DB_PING=false

# Or explicitly set the keepalive path
KEEPALIVE_PATH=/wake-up

# Make sure DATABASE_URL matches Neon connection string
DATABASE_URL=postgres://...your-neon-connection-string...
```

## Testing
Once database is ACTIVE:
- Try login/signup again
- Check server logs for successful database connections
- Verify keep-alive is pinging `/wake-up` instead of `/health`