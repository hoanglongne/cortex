# Lexica Push Notifications — Spec

> Gọi người học quay lại đúng lúc có lý do (thẻ đến hạn, chuỗi sắp đứt, quà chưa mở), không spam, không xin quyền vô duyên.

| | |
|---|---|
| Trạng thái | Draft v1, làm trong PR riêng |
| Liên quan | `docs/PRELAUNCH_PLAN.md` (lý do bản push cũ bị gỡ), `docs/LEXICA_ENGAGEMENT_SPEC.md`, `apps/cortex-core-api/src/modules/studio/scheduler.ts` |
| Ước lượng | ~3–4 ngày code + 1 tuần chạy thử nội bộ |

---

## 1. Vì sao bản cũ bị gỡ, và bản mới khác gì

Bản cũ hỏng ở 4 chỗ (xem `PRELAUNCH_PLAN.md`):

| Bản cũ | Bản mới |
|---|---|
| Xin quyền ngay lần mở đầu tiên | Chỉ hỏi sau khi xong **phiên thứ 2**, có màn giải thích trước (pre-prompt) |
| POST tới `/api/push/subscribe` không tồn tại | Endpoint thật trên `cortex-core-api`, lưu vào Supabase |
| Không có VAPID key | Cặp VAPID: public trên Vercel, private chỉ trên Railway |
| `sw.js` không có handler `push` | Thêm worker tuỳ biến vào next-pwa (`worker/index.ts`) |

## 2. Nguyên tắc

1. **Mỗi thông báo phải có lý do cụ thể của riêng người đó.** Không gửi "Học bài đi!" chung chung. Có số liệu: "12 thẻ đến hạn ôn", "Chuỗi 9 ngày còn 3 tiếng".
2. **Tối đa 1 thông báo/ngày**, mặc định. Không gửi trong giờ yên lặng (22:00–08:00 giờ VN, người dùng chỉnh được).
3. **Ai đã học hôm nay thì không nhắc** (trừ loại "có quà", vẫn tính vào trần 1/ngày).
4. **Im lặng dần khi bị lờ.** 3 thông báo liền không mở → giãn ra 2 ngày/lần; 7 lần → 1 tuần/lần; mở lại thì reset.
5. **Server quyết định, không cần app mở.** Mọi thứ tính từ dữ liệu đã sync lên Supabase.

## 3. Kiến trúc

```
 Lexica (Vercel, PWA)                cortex-core-api (Railway)              Supabase
 ───────────────────                 ─────────────────────────              ────────
 pre-prompt → Notification            POST   /v1/push/subscribe  ────────▶ lexica_push_subscriptions
   .requestPermission()               DELETE /v1/push/subscribe            lexica_push_log
 pushManager.subscribe(VAPID pub) ──▶ PUT    /v1/push/prefs                app_backups (đọc)
                                      POST   /v1/push/test (chỉ mình)      lexica_wallet / boxes (đọc)
 sw.js: on 'push' → showNotification
        on 'notificationclick'        PushScheduler (mỗi giờ, phút :05)
          → mở /?src=push&t=<type>      ├─ chọn user tới giờ nhắc
                                        ├─ tính lý do (due / streak / box / drop)
                                        └─ web-push.sendNotification(VAPID priv)
```

Vì sao gửi từ Railway chứ không phải Vercel cron hay Supabase Edge Function: API đã có service role key, đã có khung scheduler (`STUDIO_CRON`), và `web-push` là lib Node thuần. Không thêm hạ tầng mới.

## 4. Dữ liệu (Supabase) — `apps/lexica/supabase/migration_push.sql`

```sql
create table public.lexica_push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  last_ok_at  timestamptz,
  fail_count  int not null default 0
);
create index on public.lexica_push_subscriptions (user_id);

create table public.lexica_push_prefs (
  user_id       uuid primary key references auth.users on delete cascade,
  enabled       boolean not null default true,
  remind_hour   smallint not null default 20 check (remind_hour between 0 and 23), -- giờ VN
  quiet_start   smallint not null default 22,
  quiet_end     smallint not null default 8,
  types         text[] not null default '{due,streak,gift,drop}',
  ignored_streak int not null default 0,   -- số lần gửi liền không mở
  updated_at    timestamptz not null default now()
);

create table public.lexica_push_log (
  id         bigserial primary key,
  user_id    uuid not null,
  type       text not null,
  sent_at    timestamptz not null default now(),
  opened_at  timestamptz,
  payload    jsonb
);
create index on public.lexica_push_log (user_id, sent_at desc);
```

- RLS bật cả 3 bảng. User chỉ `select` được prefs của mình; mọi ghi đi qua API (service role). Không cho client tự ghi subscription để tránh nhét endpoint người khác.
- `lexica_push_log.opened_at` được set khi người dùng bấm thông báo (§6.3) → dùng cho cơ chế im lặng dần và analytics.
- Dọn dẹp: endpoint trả 404/410 → xoá ngay; lỗi khác → `fail_count++`, quá 5 thì xoá.

## 5. Biến môi trường

| Biến | Ở đâu | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Vercel (lexica) | Public, an toàn ở client |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | **Chỉ Railway** | Tạo bằng `npx web-push generate-vapid-keys`. Không bao giờ dán vào chat/commit |
| `VAPID_SUBJECT` | Railway | `mailto:` email liên hệ |
| `LEXICA_PUSH_CRON` | Railway | `on` để bật scheduler; mặc định tắt (giống `STUDIO_CRON`) |

Đổi VAPID key = mọi subscription cũ chết. Tạo một lần, cất kỹ.

## 6. Client (apps/lexica)

### 6.1 Service worker

- next-pwa hỗ trợ `customWorkerDir` (mặc định `worker/`): tạo `apps/lexica/worker/index.ts`, next-pwa tự bundle và `importScripts` vào `sw.js`. Không sửa tay `public/sw.js` (file sinh ra).
- Handler:
  - `push`: parse JSON `{title, body, url, tag, type, logId}` → `self.registration.showNotification(title, {body, icon:'/icons/icon-192.png', badge, tag, data:{url, logId, type}})`. `tag` theo loại để thông báo mới đè cái cũ, không chất đống.
  - `notificationclick`: đóng thông báo; focus tab Lexica đang mở nếu có (`clients.matchAll`), không thì `clients.openWindow(url)`. `url` dạng `/?src=push&t=due&l=<logId>`.
  - `pushsubscriptionchange`: subscribe lại với cùng VAPID key, gọi `POST /v1/push/subscribe` (best-effort).
- PWA đang tắt ở dev → test push bằng `next build && next start`.

### 6.2 Opt-in UX (quan trọng nhất)

- **Thời điểm:** ngay trên `SessionRecap` của phiên thứ 2 trở đi (đếm `session_complete` trong localStorage), một dòng nhỏ dưới nút "Thêm 10 thẻ nữa":
  > 🔔 Nhắc mình lúc 20:00 khi có thẻ đến hạn? **[Bật]** [Để sau]
- Chỉ khi bấm **Bật** mới gọi `Notification.requestPermission()` (trình duyệt chỉ cho hỏi từ thao tác người dùng, và từ chối ở prompt hệ thống là gần như vĩnh viễn — nên phải hỏi bằng pre-prompt của mình trước).
- "Để sau" → ẩn 7 ngày. Từ chối 2 lần → không hỏi nữa, chỉ còn công tắc trong Settings.
- **Settings:** công tắc bật/tắt, chọn giờ nhắc (07:00 / 12:00 / 20:00 / 22:00), chọn loại thông báo. Lưu qua `PUT /v1/push/prefs`.
- Chưa đăng nhập → không hỏi (push gắn với user_id). Có thể dùng chính pre-prompt làm lý do để đăng nhập ở bản sau.

### 6.3 Đo lường khi mở

- Trang chủ đọc `?src=push&t=&l=` → `capture('push_open', {type})` và gọi `POST /v1/push/opened {logId}`, rồi `router.replace('/')` để xoá query.

### 6.4 iOS

- Web Push trên iOS chỉ chạy với **iOS 16.4+ và app đã "Thêm vào Màn hình chính"**. Trong Safari thường, `PushManager` không tồn tại.
- Phát hiện: `'PushManager' in window` + `navigator.standalone`. Trên iOS chưa cài → thay pre-prompt bằng hướng dẫn ngắn "Thêm Lexica vào màn hình chính để nhận nhắc nhở" (Share → Add to Home Screen).
- `manifest.json` đã có; kiểm tra `display: standalone` và icon 192/512.

## 7. Server (apps/cortex-core-api) — module `push`

```
src/modules/push/
  push.module.ts
  push.controller.ts     // subscribe, unsubscribe, prefs, opened, test
  push.service.ts        // web-push wrapper, dọn endpoint chết
  push.scheduler.ts      // vòng lặp mỗi giờ
  push.reasons.ts        // hàm thuần: (snapshot, now) -> Reason | null  (unit test)
  push.copy.ts           // câu chữ theo loại, có biến thể A/B
```

- Auth: dùng guard Supabase JWT đang có (giống `/capture`), lấy `user_id` từ token, không tin body.
- `POST /v1/push/test`: gửi thông báo thử cho chính mình (dùng để debug iOS).
- Rate limit `subscribe` 10/phút/user.

### 7.1 Scheduler

Chạy mỗi giờ (phút :05, lệch khỏi job Studio). Với giờ VN hiện tại `h`:

1. Lấy user có `prefs.enabled` và `remind_hour = h` và `h` ngoài giờ yên lặng, có ít nhất 1 subscription.
2. Bỏ qua nếu đã có log trong 24h qua, hoặc đang trong thời gian giãn do bị lờ (§2.4).
3. Đọc snapshot: `app_backups.raw_data->'state'->'state'` (cardProgress, currentStreak, lastActivityDate) + `lexica_wallet`, hộp chưa mở.
4. `pickReason(snapshot, now)` → chọn **một** lý do theo ưu tiên ở §8. Không có lý do → không gửi.
5. Ghi `lexica_push_log` trước, gửi sau (có `logId` trong payload), cập nhật `ignored_streak`.
6. Xử lý theo lô 100 user, gửi song song tối đa 20.

Ngoại lệ "chuỗi sắp đứt": thêm một lượt kiểm tra lúc **21:00** cho người có chuỗi ≥ 3 ngày, chưa học hôm nay, và chưa nhận thông báo nào hôm nay — bất kể `remind_hour`.

**Giới hạn dữ liệu:** snapshot chỉ mới bằng lần sync gần nhất của client (EngagementSync / backup). Nếu người dùng học trên máy rồi chưa sync, server có thể nhắc nhầm. Giảm rủi ro: client sync ngay sau `session_complete`; server bỏ qua user có `app_backups.updated_at` trong 2h gần nhất (vừa học xong).

## 8. Các loại thông báo

| Ưu tiên | Loại | Điều kiện | Ví dụ |
|---|---|---|---|
| 1 | `streak` | chuỗi ≥ 3, chưa học hôm nay, sau 21:00 | **Chuỗi 9 ngày còn 3 tiếng** · 1 phiên 10 thẻ là giữ được. |
| 2 | `gift` | có hộp chưa mở hoặc ≥ 1 thẻ sẵn sàng đúc | **Bạn có 2 hộp chưa mở** · Mở trong Album. |
| 3 | `due` | ≥ 5 thẻ có `nextReviewAt <= now` | **12 từ đang chờ ôn** · "frugal", "awkward" và 10 từ khác. |
| 4 | `drop` | có drop/Trend mới từ lần học cuối | **Bộ mới: Gen Z slang** · 15 từ vừa lên kệ. |

- Câu chữ: tiêu đề ≤ 40 ký tự, thân ≤ 80. Có tên từ thật của người đó khi có thể (tăng tỉ lệ mở hơn số đếm suông).
- Mỗi loại có 2–3 biến thể; chọn theo hash `user_id` để A/B ổn định, log biến thể vào `payload`.
- Không dùng giọng doạ ("Bạn sắp mất hết!"). Giọng bạn bè, ngắn.

## 9. Analytics

- PostHog: `push_prompt_shown`, `push_prompt_accept`, `push_prompt_later`, `push_permission` (`granted|denied`), `push_open {type, variant}`.
- Server: tỉ lệ mở theo loại/biến thể từ `lexica_push_log` (`opened_at not null / sent`).
- Mục tiêu đánh giá sau 2 tuần: tỉ lệ đồng ý ≥ 40% số người thấy pre-prompt; tỉ lệ mở ≥ 8%; D7 retention nhóm bật push cao hơn nhóm không bật (so sánh có cân nhắc thiên lệch tự chọn — người bật vốn đã chăm hơn).

## 10. Kiểm thử

- Unit (vitest, API): `pickReason` cho đủ các nhánh, giờ yên lặng, giãn do bị lờ, ranh giới ngày VN.
- Unit (lexica): logic đếm phiên & quyết định hiện pre-prompt.
- Thủ công:
  - Chrome desktop + Android Chrome: bật, nhận `/v1/push/test`, bấm mở đúng trang, tắt trong Settings.
  - iPhone iOS 16.4+ đã cài PWA: như trên. Safari chưa cài: thấy hướng dẫn cài, không thấy nút Bật.
  - Thu hồi quyền ở trình duyệt → lần gửi sau nhận 410 → subscription bị xoá.
- Chạy scheduler với `LEXICA_PUSH_CRON=on` trên 1 tài khoản nội bộ 1 tuần trước khi bật cho mọi người.

## 11. Triển khai theo bước

1. **PR A — nền:** migration, module `push` (subscribe/prefs/test), worker SW, nút bật trong Settings. Chưa có scheduler. Kiểm thử gửi tay.
2. **PR B — tự động:** scheduler + `pickReason` + copy, bật `LEXICA_PUSH_CRON` cho tài khoản nội bộ (allowlist user_id qua env).
3. **PR C — opt-in UX:** pre-prompt sau phiên 2, xử lý iOS, analytics. Mở cho mọi người.

## 12. Ước lượng

| Hạng mục | Thời gian |
|---|---|
| Migration + RLS | 0.5 ngày |
| API module + web-push + dọn endpoint | 1 ngày |
| Service worker tuỳ biến + Settings | 0.5 ngày |
| Scheduler + `pickReason` + test | 1 ngày |
| Pre-prompt, iOS, analytics | 0.5–1 ngày |

Chi phí vận hành: gần 0 — Web Push đi qua dịch vụ miễn phí của trình duyệt (FCM/APNs/Mozilla), Railway chỉ tốn vài giây CPU mỗi giờ.

## 13. Việc người dùng cần làm khi tới lúc

- Tạo VAPID key (`npx web-push generate-vapid-keys`), đặt private key vào Railway, public key vào cả Railway và Vercel.
- Chạy `migration_push.sql` trong Supabase SQL Editor.
- Bật `LEXICA_PUSH_CRON=on` trên Railway (cần `SUPABASE_SERVICE_ROLE_KEY` đã có).
