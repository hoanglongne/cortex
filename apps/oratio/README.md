# Oratio

Thi thử IELTS Speaking với người học thật. Hai người được ghép theo band, vào một cuộc gọi thoại (LiveKit, chỉ âm thanh), lần lượt làm giám khảo và thí sinh qua 18 câu hỏi Part 1–2–3, rồi chấm nhau theo 4 tiêu chí IELTS. Khi chưa có ai online thì có chế độ luyện một mình (câu hỏi thật, đồng hồ Part 2, ghi âm để nghe lại). Không có AI.

Stack: Next.js 16 (App Router, server actions), Supabase (Auth, Postgres, Realtime), LiveKit.

## Chạy local

```bash
pnpm install
pnpm --filter @cortex/oratio dev
```

Biến môi trường (`apps/oratio/.env.local`, không commit):

| Biến | Ở đâu | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | |
| `SUPABASE_SERVICE_ROLE_KEY` | chỉ server (Vercel env, không có `NEXT_PUBLIC_`) | server actions ghi DB bằng key này sau khi tự kiểm tra quyền |
| `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | chỉ server | |
| `NEXT_PUBLIC_LIVEKIT_URL` | client + server | `wss://…` |
| `CORTEX_API_URL` | chỉ server, tuỳ chọn | gửi "đã xong một buổi" sang Cortex hub; chỉ dùng được khi Oratio và hub chung một Supabase project |
| `ORATIO_DEBUG=true` | tuỳ chọn | log matchmaking ra console server |
| `NEXT_PUBLIC_DEMO_MODE=true` | chỉ dev | bỏ qua đăng nhập và cuộc gọi thật |

## Database (Supabase SQL Editor)

Database mới: `supabase/schema.sql` → `supabase/seed_questions_v2.sql` → `supabase/migration_2026_10_security.sql`.

Database đang chạy: chỉ cần chạy `supabase/migration_2026_10_security.sql` (chạy lại nhiều lần vẫn an toàn). Các file `migration_add_*`, `migration_queue_heartbeat.sql`, `migration_replica_identity.sql`, `fix_rating_constraint.sql` là lịch sử, đã được gộp vào schema và migration trên.

Nguyên tắc: client chỉ **đọc** dữ liệu của chính mình (RLS). Mọi thao tác ghi vào `match_queue`, `matches` và `session_feedback` đều đi qua server actions (`src/actions/*`). Các action này kiểm tra người dùng có trong trận không và có đúng vai không. User chỉ sửa được tên, avatar, quốc gia, ngôn ngữ mẹ đẻ và band mục tiêu. Thông tin công khai của người khác đọc qua view `public_profiles` (không có email).

## Cấu trúc

- `src/components/AppFlow.tsx`: điều hướng giữa các màn hình (một trang, không có route).
- `src/actions/matchmaking.ts`: ghép cặp, kết thúc cuộc gọi, lịch sử, đánh giá.
- `src/actions/questions.ts`: câu hỏi trong cuộc gọi, đổi vai, bộ câu luyện một mình.
- `src/app/api/livekit/get-token/route.ts`: token vào phòng gọi. `started_at` chỉ được ghi khi cả hai người đã vào phòng.
- `src/lib/matchmaking/*`, `src/lib/feedback.ts`, `src/lib/cue-card.ts`: logic thuần, có unit test trong `__tests__/`.

## Kiểm tra

```bash
pnpm --filter @cortex/oratio check-types
pnpm --filter @cortex/oratio lint
pnpm --filter @cortex/oratio test
```
