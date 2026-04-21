# Testing Guide for SpeakMate

This guide explains how to properly test the matchmaking functionality in the SpeakMate application.

## Prerequisites

### 1. Database Setup

Ensure your Supabase database has the correct schema and Realtime configuration.
The `matches` and `match_queue` tables must be enabled for Realtime updates.

Run the following SQL in your Supabase SQL Editor if you haven't already (or update your local schema):

```sql
-- Enable Realtime for critical tables
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_queue;
```

### 2. Environment Variables

Ensure your `.env.local` file contains the following keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Required for matchmaking logic to bypass RLS)

## Manual Testing Steps

To test matchmaking, you need to simulate two different users.

### Step 1: Open Two Browser Sessions

1. Open your default browser (e.g., Chrome) -> **User A**.
2. Open a different browser (e.g., Firefox) OR an Incognito/Private window -> **User B**.

### Step 2: Login

1. **User A**: Log in or Sign up with `user1@example.com`.
2. **User B**: Log in or Sign up with `user2@example.com`.

### Step 3: Start Matching

1. **User A**: Click "Start Practice" (or similar button) to enter the matchmaking queue.
   - Status should change to "Searching..." or "Waiting for partner...".
   - Check the console logs (F12) for "Joined queue" messages.

2. **User B**: Click "Start Practice".
   - The system will search for a match.
   - Since User A is already waiting, User B should find User A.

### Step 4: Verify Match

1. Both screens should transition to "Match Found" or directly to the call screen.
2. If successful, a new record is created in the `matches` table.

## Troubleshooting

### Debug Page

We have added a debug page to help diagnose matchmaking issues.
Visit: `http://localhost:3000/debug` (replace with your local port)

**Features:**

- **View Queue**: See exactly who is waiting in the queue.
- **Force Match**: Manually trigger the matching logic and see server-side logs.
- **Reset**: Clear your status and rejoin the queue.

### "Still Searching..." (No Match Found)

- **Check Realtime**: Open the browser console. Look for "Subscribed to matches realtime". If you see connection errors, Realtime might be disabled or blocked.
- **Check Database**: Look at the `match_queue` table.
  - Are both users in the queue?
  - Is `status` set to 'waiting'?
- **Check Bandwidth Compatibility**: The matchmaking logic checks for language band compatibility.
  - If User A is Band 5.0 and wants 7.0-8.0, and User B is Band 5.0, they might not match if strict filtering is on.
  - _Tip_: Ensure both users have overlapping target/current bands.

### "Error starting search"

- Check the server logs (terminal where `npm run dev` is running).
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct.

## Automated Testing

(Coming Soon: Cypress/Playwright scripts can automate this flow by launching multiple browser contexts.)
