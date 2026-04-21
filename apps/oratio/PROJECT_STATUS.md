# SpeakMate (Oratio) — Project Status & Issues Tracker

> Last updated: 2026-03-20

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js | 16.1.1 |
| UI | React | 19.2.3 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | v4 |
| DB / Auth / Realtime | Supabase | ^2.90.1 |
| Audio Realtime | LiveKit (client + server) | ^2.16.1 |
| UI Components | Shadcn/UI (Radix + CVA) | new-york |
| Icons | lucide-react | ^0.562.0 |
| UUID | uuid | ^13.0.0 |

---

## Features — Implemented & Working

- [x] **Authentication** — Sign up / Sign in / Sign out, email confirmation, session management (cookie), middleware refresh
- [x] **Profile auto-creation** — DB trigger tạo profile khi user đăng ký
- [x] **Matchmaking** — Queue system, tìm partner theo band score, realtime detection, polling fallback *(đã fix bug polling 2026-03-20)*
- [x] **Audio Call (LiveKit)** — ✅ FULLY INTEGRATED (2026-03-21) — Token generation server-side, room connection, real mute/unmute, audio streaming, partner detection
- [x] **Room Authorization** — Chỉ user trong match mới lấy được LiveKit token
- [x] **Row Level Security (RLS)** — 4 bảng đều có policy
- [x] **Debug tools** — `/debug` page + debug matchmaking functions
- [x] **endCall()** — Cập nhật match status → finished
- [x] **submitFeedback()** — Lưu feedback vào session_feedback table
- [x] **getMatchHistory()** — Lấy lịch sử match

---

## Features — UI Only (Mock Data)

- [ ] **Call History** — UI hoàn chỉnh, data hardcoded trong component
- [ ] **Call Summary / AI Scoring** — Hiển thị điểm nhưng dùng `generateMockScores()` random
- [ ] **Leaderboard** — 3 tab (Global / Weekly / Friends), dữ liệu mock
- [ ] **Achievements** — 20+ achievement cards, dữ liệu mock
- [ ] **Friends** — Add/remove, status indicators, dữ liệu mock
- [ ] **Profile Screen** — Stats display, phần lớn mock

---

## Features — Not Started

- [ ] **AI Scoring / Transcription** — Cần integrate Deepgram/AssemblyAI
- [ ] **Audio Recording** — Cần cho AI phân tích
- [ ] **Notifications backend** — UI button có, backend chưa
- [ ] **Messages** — Chưa triển khai
- [ ] **Streak calculation** — DB có field nhưng chưa có logic tính
- [ ] **Automated Tests** — Cypress/Playwright planned

---

## Bugs & Issues

### ~~Critical~~ — Fixed

- [x] ~~**Matchmaking polling never fires**~~ *(Fixed 2026-03-20)*
  - **Root cause**: `onMatchFound` callback trong `AppFlow.tsx` là inline arrow function → tạo reference mới mỗi render. Nó nằm trong dependency array của polling `useEffect` trong `useMatchmaking.ts`. Timer `searchTime` update mỗi 1 giây → re-render → useEffect restart → polling timeout 2s bị cancel trước khi chạy → `findMatch()` chỉ gọi 1 lần duy nhất.
  - **Fix**: Dùng `useRef` để lưu `onMatchFound` callback, loại bỏ khỏi dependency arrays.
  - **Files**: `src/hooks/useMatchmaking.ts`

- [x] ~~**Queue timestamp churn**~~ *(Fixed 2026-03-20)*
  - **Root cause**: Mỗi polling cycle, `findMatch()` update `created_at` của queue entry → xáo trộn FIFO order → ảnh hưởng matching priority.
  - **Fix**: Bỏ update `created_at` khi user đã trong queue.
  - **Files**: `src/actions/matchmaking.ts`

- [x] ~~**First user never detects match (.single() bug)**~~ *(Fixed 2026-03-20)*
  - **Root cause**: Step 2 trong `findMatch()` và `checkMatchStatus()` dùng `.single()`. PostgREST trả error `PGRST116` cho cả 0 rows lẫn >1 rows. Code silently ignore error này. Nếu có match cũ (pending) từ lần test trước chưa clean up, `.single()` fail → function nghĩ user chưa match → re-join queue → "waiting" mãi mãi.
  - **Fix**: Thay `.single()` bằng `.order().limit(1)` + array access. Thêm logging cho step 2.
  - **Files**: `src/actions/matchmaking.ts`

### High Priority

- [ ] **Race condition khi 2 user poll đồng thời**
  - Cả hai có thể tìm thấy nhau cùng lúc → tạo 2 match → 2 phòng khác nhau
  - Fix: Cần database-level locking hoặc atomic match creation (Supabase RPC function)

- [ ] **Demo Mode hardcoded**
  - File: `src/components/AppFlow.tsx`
  - `const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL` → nếu thiếu env var, app bỏ qua auth
  - Fix: Dùng explicit feature flag

- [ ] **Loose band matching ±2.0**
  - File: `src/actions/matchmaking.ts`
  - Cho phép ghép user chênh lệch lớn về trình độ
  - Fix: Tăng dần loose threshold theo thời gian chờ, không mặc định 2.0

- [ ] **Không có rate limiting trên matchmaking**
  - User có thể spam `findMatch()` liên tục
  - Fix: Cooldown server-side (1 request / 5 giây)

### Medium Priority

- [ ] **LiveKit token route thiếu try-catch**
  - File: `src/app/api/livekit/get-token/route.ts`
  - Lỗi token signing → 500 không rõ ràng

- [ ] **ESLint suppression** — Nhiều `@typescript-eslint/no-explicit-any`
  - Files: `matchmaking.ts`, `server.ts`
  - Fix: Thay `any` bằng proper types

- [ ] **Render-time state update trong AppFlow**
  - Auth check chạy ngoài useEffect → potential hydration mismatch
  - Fix: Wrap trong useEffect

- [ ] **Profile auto-creation silent failure**
  - File: `findMatch()` — nếu profile insert fail, continues with defaults

- [ ] **Mock scores random**
  - File: `AppFlow.tsx` — `generateMockScores()` trả về random 5.5-9
  - Cần AI scoring thật

### Low Priority

- [ ] **Hard-coded topics** — 8 static topics trong `InCallScreen.tsx`
- [ ] **No loading skeletons** — Chỉ hiện "Loading..." text
- [ ] **Mobile responsiveness gaps** — Một số component giả định desktop
- [ ] **No accessibility (a11y)** — Thiếu aria-labels, keyboard navigation
- [ ] **No env var validation at startup** — Missing vars → silent failures
- [ ] **No input sanitization** — Comments field không giới hạn length
- [ ] **Forgot password** — UI button có, navigation chưa hoàn chỉnh

---

## Database Schema

4 bảng: `profiles`, `match_queue`, `matches`, `session_feedback`
- Realtime enabled cho `matches` và `match_queue`
- Trigger: auto-create profile on signup, update stats on match finish
- Full RLS policies trên tất cả bảng

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=  # Example: wss://your-project.livekit.cloud
```

**LiveKit Setup**: Sign up at [livekit.io](https://livekit.io), create a project, copy API Key/Secret/URL vào .env.local

---

## LiveKit Integration Details (2026-03-21)

**How it works**:

1. **Match Found** → `AppFlow` calls `getToken(roomId, username)` to fetch JWT from `/api/livekit/get-token`
2. **API Route** verifies user is in the match (query DB), generates token with `livekit-server-sdk`, updates match status → "active"
3. **InCallScreen** wraps content in `<LiveKitRoom>` with token + serverUrl
4. **Real Audio**:
   - Mute button → `localParticipant.setMicrophoneEnabled()`
   - Partner detection → `useRemoteParticipants()` hook
   - Audio streaming → `<RoomAudioRenderer />` (invisible component)
5. **Demo Mode Fallback**: If no token/roomId, uses mock UI (no real audio)

**Test**: 
- Cần set đầy đủ env vars (LIVEKIT_API_KEY, LIVEKIT_API_SECRET, NEXT_PUBLIC_LIVEKIT_URL)
- Match với partner thật trên 2 browser khác nhau
- Microphone permission sẽ được hỏi khi vào call

---

## Testing Notes

- Test matchmaking cần **2 browser khác nhau** (Chrome + Firefox/Safari) vì cùng browser = cùng cookie session = cùng user
- Hoặc dùng 1 browser normal + 1 incognito
- Debug page: `/debug` — có các tool force join queue, force match, analyze compatibility
