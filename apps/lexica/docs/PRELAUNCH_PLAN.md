# Lexica – Prelaunch Plan

_Soạn ngày 2026-10-03, dựa trên code ở `main`. Đánh dấu `[x]` khi xong._

## Mục tiêu của đợt launch này

Lexica là **funnel miễn phí dẫn sang Oratio** (xem `docs/context/product.md`). Đợt đầu là **soft launch cho 50–100 người học IELTS**, không phải ra mắt rộng. Câu hỏi cần trả lời:

1. Người dùng có **quay lại** không? (Retention D1 / D7)
2. Energy 30 swipe/ngày có **vừa** không, hay quá ít/quá nhiều?
3. Story mode có kéo người dùng học tiếp, và có ai **bấm CTA sang Oratio** không?

| Chỉ số | Mục tiêu soft launch | Event đo |
|---|---|---|
| Hoàn thành onboarding + placement test | ≥ 70% người mở app | `test_completed`, `level_selected` |
| Retention D1 | ≥ 35% | phiên mới ở ngày thứ 2 |
| Retention D7 | ≥ 15% | phiên mới ở ngày thứ 8 |
| Swipe trung bình / người / ngày | 20–30 | `swipe` |
| Tỉ lệ người dùng hết energy | 30–60% (thấp hơn = quá nhiều, cao hơn = quá ít) | `energy_depleted` |
| Mở khoá ít nhất 1 story | ≥ 25% | `story_part1_unlocked` |
| Bấm CTA sang Oratio | ≥ 5% | `oratio_cta_click` |

---

## Giai đoạn 0 – Lỗi chặn launch (bắt buộc)

Phát hiện khi rà code, phải xử lý trước khi có người dùng thật.

- [ ] **Push notification đang hỏng và gây phiền.** `app/page.tsx` gọi `registerPushNotifications()` ngay khi mở app, tức là xin quyền thông báo ở lần đầu tiên, trước khi người dùng hiểu app làm gì (trình duyệt sẽ nhớ lựa chọn "Chặn"). Hàm này gửi subscription tới `/api/push/subscribe`, **route không tồn tại** (404). `NEXT_PUBLIC_VAPID_PUBLIC_KEY` không có trong `.env.local.example`, và `sw.js` do next-pwa sinh ra không xử lý sự kiện `push`.
  - Đề xuất: **tắt hẳn push cho soft launch**. Sau này làm lại: xin quyền sau phiên học thứ 2, có route lưu subscription và service worker xử lý `push`.
- [ ] **Analytics và Cortex sync trỏ về `localhost` khi thiếu env.** Các file `app/lib/analytics.ts`, `app/store/lexicaStore.ts`, `CortexSection.tsx` và `CortexWidget.tsx` mặc định dùng `http://localhost:3001`. Trên production, nếu quên set env thì mọi event bị mất mà không có thông báo nào.
  - Đề xuất: không có `NEXT_PUBLIC_CORTEX_API_URL` thì không gửi gì (không dùng localhost làm fallback), và kiểm tra env trên Vercel trước khi launch.
- [ ] **Chưa đo được gì.** `analytics.ts` chỉ gửi event về Cortex API, và chỉ khi có `cortex_user_id`, tức là người dùng **chưa đăng nhập thì không có event nào**. Đây lại chính là nhóm cần đo nhất trong funnel.
  - Đề xuất: thay phần thân hàm `send()` bằng một nhà cung cấp analytics có funnel và retention sẵn (PostHog free tier, hoặc Plausible/Umami nếu chỉ cần đếm), dùng anonymous id. Vẫn giữ việc gửi về Cortex cho người đã đăng nhập.
- [ ] **`manifest.json` khai báo `share_target` tới `/share`, nhưng route này không tồn tại.** Hoặc bỏ khai báo đi, hoặc làm trang `/share`.
- [ ] **Icon PWA chỉ có SVG.** iOS cần `apple-touch-icon` dạng PNG (180×180); Android cần PNG 192 và 512, cộng một bản maskable riêng. Thiếu những file này thì icon "Thêm vào màn hình chính" sẽ xấu hoặc không hiện.

## Giai đoạn 1 – Hoàn thiện trải nghiệm cốt lõi (nên làm)

- [ ] **Dữ liệu chỉ nằm trong `localStorage`**: đổi máy hoặc xoá dữ liệu trình duyệt là mất hết tiến trình. Cortex API giờ đã có `POST /v1/sync/backup` (xem `apps/cortex-core-api/SETUP_GUIDE.md`). Với người đã đăng nhập, backup trạng thái `lexica-storage` sau mỗi phiên và khôi phục khi đăng nhập trên máy mới.
- [ ] **Voice mode trên iOS Safari**: test thật trên iPhone. Nếu Web Speech API không chạy, phải có lối thoát rõ ràng về chế độ swipe tay.
- [ ] **Kiểm tra lại nội dung**: khoảng 570 thẻ (~240 beginner, ~140 intermediate, ~100 advanced, ~90 expert) và 3 story pack. Rà chính tả, IPA và nghĩa; nhờ 1 người dạy IELTS xem nhanh 50 thẻ ngẫu nhiên.
- [ ] **Cân bằng nội dung**: phần expert/advanced mỏng hơn beginner. Người dùng trình độ cao có thể học hết sau 3–4 ngày (30 swipe/ngày). Cần quyết định: thêm thẻ, hoặc chỉ nhắm tới band 5–6.5 cho đợt này.
- [ ] **Chọn hướng cho boss card**: hoặc làm hẳn thành hệ thống, hoặc ẩn đi cho launch (`docs/context/source-of-truth.md` ghi là mới làm một phần).

## Giai đoạn 2 – Vận hành và pháp lý

- [ ] **Trang Privacy Policy + Terms.** App thu email (đăng nhập OTP qua Supabase) và dùng **micro**. Đây là yêu cầu tối thiểu, và cũng cần khi muốn đưa lên store sau này.
- [ ] **Theo dõi lỗi**: thêm Sentry (free tier) cho Lexica. Hiện lỗi chỉ được `console.error`.
- [ ] **Uptime**: trỏ một uptime monitor (UptimeRobot hoặc Better Stack, đều có bản free) vào `GET /health` của Cortex API. Endpoint này trả về 503 khi Supabase hoặc Redis down.
- [ ] **Supabase**: chạy `apps/cortex-core-api/supabase/migration_phase1_core.sql`. Kiểm tra lại RLS cho `action_logs`, `app_backups` và `user_vocabulary`: Cortex API đang dùng **publishable key**, nên phải chắc người dùng không đọc được dữ liệu của người khác qua chính key đó.
- [ ] **Biến môi trường trên Vercel** (project `cortex-lexica`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CORTEX_API_URL`, `NEXT_PUBLIC_CORTEX_HUB_URL`, cùng key analytics.
- [ ] **Domain riêng + OG image** để link chia sẻ trông đáng tin (hiện chỉ có metadata title trong `app/layout.tsx`).

## Giai đoạn 3 – Kiểm thử trước launch

- [ ] Chạy E2E có sẵn: `pnpm --filter @cortex/lexica test:e2e` (onboarding, core flow, dead-end).
- [ ] Test tay trên 3 thiết bị: iPhone Safari, Android Chrome, desktop Chrome. Kiểm tra các luồng: cài PWA, onboarding, placement test, swipe hết energy, qua ngày mới (energy reset lúc 0h), mở story, bấm CTA sang Oratio.
- [ ] **Closed beta 5–10 người quen** trong 1 tuần. Hỏi 3 câu: "Bạn có mở lại app hôm sau không, vì sao?", "Chỗ nào làm bạn bối rối?", "30 swipe có ít không?".
- [ ] Sửa các lỗi nghiêm trọng từ beta trước khi mở rộng.

## Giai đoạn 4 – Soft launch

- [ ] Đăng ở 2–3 nơi người học IELTS Việt Nam hay lui tới, chẳng hạn các nhóm Facebook học IELTS hoặc cộng đồng tự học. Viết bài theo kiểu kể chuyện mình làm app, kèm GIF swipe; tránh giọng quảng cáo.
- [ ] Đặt sẵn kênh nhận góp ý: một nút "Góp ý" trong app trỏ tới Google Form hoặc Zalo/Discord.
- [ ] Không chạy quảng cáo trả phí cho tới khi D7 đạt mục tiêu.

## Sau launch – 2 tuần đầu

- [ ] Mỗi tuần xem lại bảng chỉ số ở đầu tài liệu.
- [ ] Nếu **D1 thấp**: xem lại onboarding và phiên học đầu tiên (người dùng bỏ đi ở đâu?).
- [ ] Nếu **D1 ổn nhưng D7 thấp**: cần một lý do để quay lại, ví dụ streak, push notification làm đúng cách (Giai đoạn 0), hoặc nhắc thẻ SRS tới hạn.
- [ ] Nếu **ít người hết energy**: phiên học có thể đang nhàm. Nếu **hết energy quá nhiều**: thử nâng lên 40.
- [ ] Chỉ khi có người bấm CTA sang Oratio mới đầu tư tiếp vào phần nối Lexica → Oratio.

## Thứ tự đề xuất

| Tuần | Việc |
|---|---|
| 1 | Giai đoạn 0 (toàn bộ) + analytics thật |
| 2 | Giai đoạn 1: sync backup, test iOS voice, rà nội dung |
| 3 | Giai đoạn 2 + closed beta |
| 4 | Sửa lỗi từ beta, soft launch |
