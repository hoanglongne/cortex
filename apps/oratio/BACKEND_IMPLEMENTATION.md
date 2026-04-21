# SpeakMate Backend Implementation

## 🎯 Overview

This document tracks the backend implementation for SpeakMate's core features:

- **Authentication** via Supabase Auth
- **Realtime Matchmaking** via Supabase Realtime
- **Audio Calls** via LiveKit

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase Auth                       |
| Realtime    | Supabase Realtime Subscriptions     |
| Audio/Video | LiveKit                             |
| API         | Next.js Server Actions + API Routes |

---

## 📊 Database Schema

### Tables

#### 1. `profiles`

Extends Supabase auth.users with app-specific data.

| Column          | Type                       | Description             |
| --------------- | -------------------------- | ----------------------- |
| id              | uuid (PK, FK → auth.users) | User ID                 |
| username        | text                       | Display name            |
| target_band     | decimal(2,1)               | Target IELTS band score |
| current_band    | decimal(2,1)               | Current estimated band  |
| avatar_url      | text                       | Profile picture URL     |
| native_language | text                       | User's native language  |
| country         | text                       | User's country          |
| total_sessions  | integer                    | Total practice sessions |
| total_minutes   | integer                    | Total practice time     |
| current_streak  | integer                    | Current practice streak |
| created_at      | timestamptz                | Account creation date   |
| updated_at      | timestamptz                | Last profile update     |

#### 2. `match_queue`

Temporary queue for users waiting to be matched.

| Column          | Type                 | Description                         |
| --------------- | -------------------- | ----------------------------------- |
| id              | uuid (PK)            | Queue entry ID                      |
| user_id         | uuid (FK → profiles) | User waiting                        |
| target_band_min | decimal(2,1)         | Min band preference                 |
| target_band_max | decimal(2,1)         | Max band preference                 |
| status          | enum                 | 'waiting' / 'matched' / 'cancelled' |
| created_at      | timestamptz          | When user joined queue              |

#### 3. `matches`

Records of matched practice sessions.

| Column     | Type                 | Description                                     |
| ---------- | -------------------- | ----------------------------------------------- |
| id         | uuid (PK)            | Match ID                                        |
| user1_id   | uuid (FK → profiles) | First user                                      |
| user2_id   | uuid (FK → profiles) | Second user                                     |
| room_id    | text                 | LiveKit room name                               |
| status     | enum                 | 'pending' / 'active' / 'finished' / 'cancelled' |
| topic      | text                 | Current speaking topic                          |
| started_at | timestamptz          | Call start time                                 |
| ended_at   | timestamptz          | Call end time                                   |
| created_at | timestamptz          | Match creation time                             |

#### 4. `session_feedback`

Post-call ratings and feedback.

| Column            | Type                 | Description             |
| ----------------- | -------------------- | ----------------------- |
| id                | uuid (PK)            | Feedback ID             |
| match_id          | uuid (FK → matches)  | Related match           |
| from_user_id      | uuid (FK → profiles) | Who gave feedback       |
| to_user_id        | uuid (FK → profiles) | Who received feedback   |
| overall_rating    | integer              | 1-5 stars               |
| would_match_again | boolean              | Would practice again    |
| feedback_tags     | text[]               | Quick feedback tags     |
| comments          | text                 | Additional comments     |
| scores            | jsonb                | AI-estimated scores     |
| created_at        | timestamptz          | When feedback was given |

---

## 🔐 Row Level Security (RLS) Policies

### profiles

- **SELECT**: Users can read any profile (public profiles)
- **UPDATE**: Users can only update their own profile
- **INSERT**: Auto-created via trigger on auth.users insert

### match_queue

- **SELECT**: Users can only see their own queue entry
- **INSERT**: Users can only insert themselves
- **UPDATE**: Users can only update their own entry
- **DELETE**: Users can only delete their own entry

### matches

- **SELECT**: Users can only see matches they're part of
- **INSERT**: Only server (service role) can insert
- **UPDATE**: Users can only update matches they're part of

### session_feedback

- **SELECT**: Users can see feedback they gave or received
- **INSERT**: Users can only give feedback for matches they participated in
- **UPDATE**: Users can only update feedback they gave

---

## 🔄 Matchmaking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS "START MATCHING"              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  findMatch() Server Action                   │
│                                                              │
│  1. Check auth (get current user)                           │
│  2. Query match_queue for compatible waiting users          │
│  3. If found → Create match, remove both from queue         │
│  4. If not found → Insert user into queue                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │  MATCH FOUND    │             │  NO MATCH YET   │
    │  Return roomId  │             │  Status: waiting│
    └─────────────────┘             └─────────────────┘
              │                               │
              │                               ▼
              │                  ┌─────────────────────────┐
              │                  │ Subscribe to Realtime   │
              │                  │ Listen for matches table│
              │                  │ where user_id = me      │
              │                  └─────────────────────────┘
              │                               │
              │                               ▼
              │                  ┌─────────────────────────┐
              │                  │ When match created      │
              │                  │ Get room_id from match  │
              │                  └─────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    GET LIVEKIT TOKEN                         │
│                                                              │
│  POST /api/livekit/get-token                                │
│  { roomName: room_id, participantName: username }           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    JOIN LIVEKIT ROOM                         │
│                                                              │
│  <LiveKitRoom token={token} serverUrl={LIVEKIT_URL}>        │
│    <AudioConference />                                       │
│  </LiveKitRoom>                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   ├── middleware.ts      # Auth middleware
│   │   └── database.types.ts  # Generated types
│   ├── livekit/
│   │   └── server.ts          # LiveKit server utils
│   └── types/
│       └── database.ts        # Custom type definitions
├── app/
│   └── api/
│       └── livekit/
│           └── get-token/
│               └── route.ts   # Token generation endpoint
├── actions/
│   ├── auth.ts               # Auth server actions
│   └── matchmaking.ts        # Matchmaking server actions
├── hooks/
│   ├── useMatchmaking.ts     # Matchmaking hook
│   ├── useSupabase.ts        # Supabase client hook
│   └── useLiveKit.ts         # LiveKit integration hook
└── supabase/
    └── schema.sql            # Database schema
```

---

## 🚀 Implementation Checklist

### Phase 1: Infrastructure ✅

- [x] Create tracking document
- [x] Install dependencies (@supabase/ssr, livekit-server-sdk, @livekit/components-react)
- [x] Set up environment variables template
- [x] Configure Supabase clients (browser + server)

### Phase 2: Database ✅

- [x] Create schema.sql with all tables
- [x] Define RLS policies
- [x] Create database trigger for auto-creating profiles
- [x] Generate TypeScript types

### Phase 3: Authentication ✅

- [x] Set up Supabase Auth middleware
- [x] Create useSupabaseAuth hook (signIn, signUp, signOut)
- [x] Add auth state to AppFlow
- [x] Create AuthScreen component

### Phase 4: Matchmaking ✅

- [x] Implement findMatch server action
- [x] Implement cancelMatch server action
- [x] Create useMatchmaking hook with realtime subscription
- [x] Integrate with MatchmakingScreen

### Phase 5: LiveKit Integration ✅

- [x] Create get-token API route
- [x] Create useLiveKitToken hook
- [x] Build LiveKitRoom wrapper component
- [x] Integrate with InCallScreen

### Phase 6: Post-Call ✅

- [x] Implement endCall server action
- [x] Implement submitFeedback server action
- [x] Auto-update session statistics via database trigger

---

## 💡 Enhancement Ideas

### 1. **Smart Matching Algorithm**

Instead of FIFO queue, implement scoring:

- Band score proximity (prefer closer bands)
- Same native language penalty (practice with diverse speakers)
- Time zone compatibility
- Previous positive interactions bonus

### 2. **Scheduled Practice Sessions**

Allow users to:

- Schedule practice at specific times
- Get matched with users who also scheduled that time
- Recurring practice sessions

### 3. **Topic Voting**

Before call starts:

- Both users see 3 random topics
- Each votes for preferred topic
- Selected topic shown in call

### 4. **AI Speaking Analysis** (Future)

- Record audio (with consent)
- Send to Whisper for transcription
- Analyze with GPT-4 for:
  - Grammar corrections
  - Vocabulary suggestions
  - Fluency metrics

### 5. **Partner Preferences**

Allow users to filter by:

- Native language
- Country/region
- Preferred topics
- Practice style (casual vs structured)

### 6. **Waitlist Notifications**

If no match found after X seconds:

- Option to get notified when a match is available
- Push notification or email

### 7. **Voice Activity Detection (VAD)**

- Use LiveKit's VAD to track speaking time
- Calculate turn-taking balance (50/50 ideal)
- Provide feedback on conversation dynamics

### 8. **Pronunciation Scoring (AI-Powered)**

- Optional: Record audio chunks
- Send to Whisper API for transcription
- Compare with expected pronunciation using phoneme analysis
- Provide real-time pronunciation feedback

### 9. **Vocabulary Tracker**

- Extract unique words from transcriptions
- Track vocabulary growth over time
- Suggest new vocabulary based on IELTS word lists

### 10. **Speaking Part Simulator**

- Simulate IELTS Part 1, 2, 3 formats
- Timed speaking with topic cards
- AI evaluator for band score estimation

---

## 🔧 Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LiveKit
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

---

## ✅ Implemented Files

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          ✅ Browser client
│   │   ├── server.ts          ✅ Server client + Admin client
│   │   └── middleware.ts      ✅ Auth middleware
│   └── types/
│       └── database.ts        ✅ All TypeScript types
├── app/
│   └── api/
│       └── livekit/
│           └── get-token/
│               └── route.ts   ✅ Token generation endpoint
├── actions/
│   ├── auth.ts               ✅ Auth server actions
│   └── matchmaking.ts        ✅ Matchmaking server actions
├── hooks/
│   ├── useMatchmaking.ts     ✅ Matchmaking + LiveKit token hooks
│   └── useSupabase.ts        ✅ Supabase auth hook
├── components/
│   └── LiveKitRoom.tsx       ✅ LiveKit room wrapper
├── middleware.ts             ✅ Next.js auth middleware
└── supabase/
    └── schema.sql            ✅ Database schema with RLS
```

---

## 📝 Notes

- All timestamps should be in UTC
- Use database transactions for match creation to prevent race conditions
- Implement proper error handling and retry logic
- Consider rate limiting on matchmaking to prevent abuse
- Add monitoring/logging for debugging production issues
