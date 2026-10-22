# Chuyển Cortex từ Vercel + Railway sang VPS (kế hoạch, 10/2026)

**Mục tiêu:**
- hết giới hạn deploy của Vercel;
- bỏ cold start của Railway và Vercel serverless;
- chi phí cố định, hiệu năng tốt cho người học ở Việt Nam.

**Giữ nguyên:** Supabase (database, auth, storage). Nên nâng lên Pro trước khi có người dùng thật.

Giá ước tính trong `docs/BUSINESS_MODEL.md`, mục 1.

## 1. Kiến trúc đích

```
Người dùng (VN)
   │  HTTPS
   ▼
Cloudflare (DNS, CDN, HTTPS, chống DDoS; cache file tĩnh và giọng)
   │  chỉ IP của Cloudflare được vào
   ▼
VPS web, Singapore (4 vCPU / 8GB), Coolify + Traefik
   ├─ lexica      (Next standalone)   lexica.<domain>
   ├─ oratio      (Next standalone)   oratio.<domain>
   ├─ teach       (Next standalone)   teach.<domain>
   ├─ studio      (Next standalone)   studio.<domain>
   ├─ landing     (Next standalone)   <domain>
   ├─ solilo, synapse                 …
   └─ cortex-core-api (NestJS)        api.<domain>

VPS LiveKit, Singapore (2 vCPU / 4GB), KHÔNG qua Cloudflare (cần UDP)
   └─ livekit-server + TURN (TLS 443)  livekit.<domain>, turn.<domain>

Supabase (giữ nguyên; nên cùng vùng Singapore)
```

**Tên miền:**
- Mỗi app một tên miền con.
- Giữ tên miền `*.vercel.app` và Railway chạy song song tới khi chuyển xong (mục 6).

## 2. Chọn và chuẩn bị máy

### 2.1 Mua máy
- **Máy web:** 4 vCPU / 8GB / 80GB+ SSD, vùng Singapore (DigitalOcean, Vultr hoặc Hetzner Singapore). Bật sao lưu tự động.
- **Máy LiveKit:** 2 vCPU / 4GB, Singapore, có IP public. Nên dùng nhà cung cấp cho phép mở dải cổng UDP.
- **Kiểm vùng Supabase:** Project Settings → General → Region. Nếu không phải Singapore thì vẫn chạy được, chỉ thêm độ trễ khi server gọi database.

### 2.2 Bảo mật máy (cả hai máy)
1. Ubuntu 24.04 LTS.
2. Tạo user thường có quyền sudo, chỉ đăng nhập SSH bằng key, tắt đăng nhập root bằng mật khẩu.
3. Bật `ufw`:
   - **Máy web:** mở 22 (chỉ IP của bạn, nếu được), 80 và 443 chỉ cho dải IP của Cloudflare.
   - **Máy LiveKit:** 22, 443/tcp, 7881/tcp, 3478/udp, 50000–60000/udp.
4. Bật `unattended-upgrades` (vá bảo mật tự động) và `fail2ban`.
5. Swap 4GB trên máy web, để không bị tắt app khi build hết RAM.

### 2.3 Cài Coolify (máy web)
- Cài theo hướng dẫn chính thức. Nối với GitHub qua GitHub App của Coolify, chọn repo `hoanglongne/cortex`.
- Bật tự dọn image Docker cũ, và đặt cảnh báo khi ổ đĩa đầy 80% (gửi email hoặc Discord).

## 3. Đóng gói từng app

Hiện repo **chưa có Dockerfile** và các app Next **chưa bật `output: 'standalone'`**.

### 3.1 App Next (lexica, oratio, teach, studio, landing, solilo, synapse)
1. Thêm `output: 'standalone'` vào `next.config` mỗi app.
   - Monorepo cần `outputFileTracingRoot` trỏ về gốc repo.
   - Các gói workspace đã nằm trong `transpilePackages`.
2. Một Dockerfile mẫu dùng chung, `docker/next.Dockerfile`, nhận tham số `APP` (tên thư mục):
   - **Bước deps:** `pnpm fetch` và `pnpm install --frozen-lockfile --filter @cortex/$APP...`.
   - **Bước build:** `pnpm --filter @cortex/$APP build`.
     - Lexica giữ `next build --webpack`.
     - Biến `NEXT_PUBLIC_*` phải có **lúc build**, vì Next chèn giá trị vào code: truyền bằng build args.
   - **Bước chạy:** `node:22-slim`, copy `.next/standalone`, `.next/static`, `public`. Chạy bằng user không phải root, `PORT=3000`, `HOSTNAME=0.0.0.0`.
3. Healthcheck: `GET /` trả 200.
   - Hoặc thêm route `/api/health` nhẹ cho app có route server.

### 3.2 Cortex API (NestJS)
- `docker/api.Dockerfile`: build `apps/cortex-core-api`, chạy `node dist/main`.
- Healthcheck vào route health có sẵn. Redis là tuỳ chọn: không đặt `REDIS_URL` thì báo `off`.
- `STUDIO_CRON` chạy trong chính process API, không cần đổi gì.

### 3.3 Build ở đâu
- **Giai đoạn đầu:** Coolify build ngay trên máy (8GB + swap là đủ). Bật "build one at a time".
- **Khi có nhiều app hơn:**
  - GitHub Actions build image, đẩy lên GitHub Container Registry (ghcr.io, miễn phí cho repo của bạn);
  - Coolify chỉ kéo image về chạy;
  - máy không bị chậm lúc deploy.
- **Chỉ deploy app có thay đổi:** dùng lại logic của `scripts/vercel-ignore.mjs`.
  - Bản Coolify: đặt "Watch paths" cho mỗi app (`apps/<app>/**`, `packages/**`, file gốc của workspace).
  - Bản Actions: dùng `dorny/paths-filter`.

## 4. Biến môi trường

Đặt trong Coolify, mỗi app một bộ. Lấy giá trị từ Vercel/Railway hiện tại (Settings → Environment Variables). **Không** đưa khoá bí mật vào repo hay chat.

| App | Biến |
|---|---|
| Mọi app Next | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (hoặc `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |
| Liên kết giữa các app | `NEXT_PUBLIC_LEXICA_URL`, `NEXT_PUBLIC_ORATIO_URL`, `NEXT_PUBLIC_TEACH_URL`, `NEXT_PUBLIC_CORTEX_HUB_URL`, `NEXT_PUBLIC_CORTEX_API_URL`, `CORTEX_API_URL`, `CORTEX_CORE_API_URL` → **đổi sang tên miền mới** |
| lexica | `NEXT_PUBLIC_VOICE_CACHE_URL`, `NEXT_PUBLIC_CONTENT_MANIFEST_URL`, `NEXT_PUBLIC_PRON_PACK_URL`, `NEXT_PUBLIC_PRON_BETA`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_SERVICE_ROLE_KEY` (nếu route server dùng) |
| oratio | `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ORATIO_DEBUG` |
| cortex-core-api | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_API_KEY`, `GEMMA_ENDPOINT`, `LEXICA_SPEECH_MODEL`, `LEXICA_TTS_MODEL`, `YOUTUBE_API_KEY`, `STUDIO_CRON`, `STUDIO_LLM_PROVIDER`, `STUDIO_LLM_MODEL`, `STUDIO_ALERT_WEBHOOK` |

**Những chỗ cần sửa theo tên miền mới:**
- **CSP của Lexica** (`apps/lexica/vercel.json`: `media-src`, `connect-src` đang cho `*.up.railway.app`):
  - chuyển header sang `next.config` (`headers()`), vì `vercel.json` không còn được đọc;
  - thêm `api.<domain>` và `livekit.<domain>`.
- **Header bảo mật của teach**: cũng chuyển từ `vercel.json` sang `next.config`.
- **Supabase Auth** → URL Configuration: thêm các tên miền mới vào Site URL và Redirect URLs. Thiếu bước này thì đăng nhập hỏng.
- **CORS của Cortex API**: thêm các tên miền mới.

## 5. Những thứ Vercel đang làm hộ, phải thay

| Vercel đang làm | Thay bằng |
|---|---|
| Cron của Oratio (`/api/cron/expire-audio` 03:17, `/api/cron/exam-reminder` 13:10, giờ UTC) | Scheduled Task trong Coolify, hoặc cron trên máy: `curl -H "Authorization: Bearer $CRON_SECRET" https://oratio.<domain>/api/cron/...`. Kiểm lại cách route kiểm `CRON_SECRET`. |
| Header trong `vercel.json` | `headers()` trong `next.config` (mục 4) |
| `ignoreCommand` (bỏ qua app không đổi) | Watch paths / paths-filter (mục 3.3) |
| CDN, HTTPS | Cloudflare (mục 7) |
| Tối ưu ảnh `next/image` | Chạy trong container, cần `sharp` (Next standalone tự kèm). Cloudflare cache kết quả. |
| Preview deploy | Không cần (đã tắt). Nếu muốn thì Coolify có preview theo PR. |

## 6. LiveKit tự chạy (máy riêng)

Oratio chỉ dùng **âm thanh**, không ghi trên server (không egress), nên một máy nhỏ là đủ: khoảng 300–500 người cùng lúc.

1. Tạo cấu hình bằng công cụ chính thức `livekit/generate`:
   - chọn **livekit-server + Caddy (TLS) + TURN**;
   - tên miền `livekit.<domain>` và `turn.<domain>`.
2. Hai bản ghi DNS ở Cloudflare để **DNS only** (mây xám), vì Cloudflare không chuyển được UDP và WebRTC.
3. **Bật TURN qua TLS cổng 443.** Wifi công ty, trường học và một số nhà mạng chặn UDP; thiếu bước này thì một phần người dùng không vào được cuộc gọi.
4. Tạo `LIVEKIT_API_KEY` và `LIVEKIT_API_SECRET` mới, đặt vào Oratio. Đổi `NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.<domain>`.
5. **Thử:**
   - 2 máy ở 2 mạng khác nhau (wifi và 4G);
   - 1 máy trong mạng chặn UDP (hoặc chặn bằng tường lửa) để chắc TURN chạy.
6. **Dự phòng:** giữ tài khoản LiveKit Cloud. Máy LiveKit hỏng thì đổi 3 biến của Oratio về Cloud rồi deploy lại.

## 7. Cloudflare
1. Chuyển DNS của tên miền về Cloudflare (gói Free).
2. Bản ghi A cho từng tên miền con trỏ về máy web, **bật proxy** (mây cam).
3. SSL/TLS: **Full (strict)**.
   - Coolify tự lấy chứng chỉ Let's Encrypt.
   - Hoặc dùng Cloudflare Origin Certificate.
4. **Cache:**
   - `/_next/static/*` và ảnh: cache lâu (Next đã đặt header `immutable`).
   - **File giọng trên Supabase:** đặt một tên miền con, ví dụ `voice.<domain>`, làm proxy tới `…supabase.co/storage/v1/object/public/lexica-content/` với Cache Rule "cache everything", sống 1 năm. Tên file là mã băm nội dung nên không bao giờ cũ. Rồi đặt `NEXT_PUBLIC_VOICE_CACHE_URL` về đó.
     - Lợi: giảm mạnh băng thông Supabase.
     - Nhớ thêm tên miền này vào CSP `media-src`.
5. Bật **Always Use HTTPS**, Brotli, HTTP/3.
6. Chỉ cho IP của Cloudflare vào cổng 80/443 của máy web (mục 2.2), để không ai đi vòng qua Cloudflare.

## 8. Thứ tự chuyển

Chuyển từng app, giữ bản cũ chạy song song. Có lỗi thì trỏ DNS về lại.

| Bước | Việc | Rủi ro | Quay lại |
|---|---|---|---|
| 0 | Mua máy, cài Coolify, Cloudflare. Thêm Dockerfile, `standalone`, chuyển header sang `next.config` (1 PR, Vercel vẫn chạy được) | Không | — |
| 1 | `landing`: ít tính năng, thử cả quy trình | Thấp | DNS về Vercel |
| 2 | `cortex-core-api`: song song Railway, đổi `NEXT_PUBLIC_CORTEX_API_URL` từng app | Trung bình (TTS, chấm, Studio cron) | Đổi biến về Railway |
| 3 | `studio`, `teach`: người dùng là bạn và giáo viên | Thấp | DNS về Vercel |
| 4 | LiveKit tự chạy (mục 6), thử kỹ | Trung bình | Biến về LiveKit Cloud |
| 5 | `oratio` cùng cron | Trung bình | DNS về Vercel, bật lại cron Vercel |
| 6 | `lexica` sau cùng: nhiều người dùng nhất. Kiểm đăng nhập, ghi âm, giọng đọc, push notification, service worker | Cao nhất | DNS về Vercel |
| 7 | Chạy ổn 1–2 tuần thì tắt Vercel và Railway, xoá `vercel.json` | — | — |

**Lưu ý khi đổi tên miền của Lexica:**
- Tiến độ học nằm ở localStorage `lexica-storage`. localStorage **gắn theo tên miền**, nên người học sang tên miền mới sẽ thấy trống nếu chưa đồng bộ.
- **Trước khi đổi**, đảm bảo cloudSync đã sao lưu cho người đăng nhập.
- Cho tên miền cũ chuyển hướng (301) về tên miền mới, và hiện một thông báo "đăng nhập để mang tiến độ sang".
- Nếu giữ đúng tên miền hiện tại (chỉ đổi DNS) thì không bị vấn đề này. **Nên giữ tên miền** nếu Lexica đang dùng tên miền riêng.
- Service worker và push: kiểm tra `sw.js` vẫn được phục vụ với header `Service-Worker-Allowed`. VAPID giữ nguyên khoá.

## 9. Vận hành sau khi chuyển
- **Theo dõi:**
  - UptimeRobot (Free) kiểm từng tên miền và `api.<domain>/health` mỗi 5 phút, báo qua email hoặc Telegram;
  - Coolify báo đầy đĩa, container chết.
- **Sao lưu:**
  - snapshot máy hằng tuần (nhà cung cấp);
  - xuất cấu hình Coolify;
  - database do Supabase lo (Pro có sao lưu hằng ngày).
- **Cập nhật:** vá bảo mật tự động. Cập nhật Coolify và LiveKit mỗi 1–2 tháng, chụp snapshot trước.
- **Khi máy hỏng:** dựng máy mới từ snapshot (~15 phút), hoặc cài lại Coolify và deploy lại từ repo (~30–60 phút). Dữ liệu người học không mất vì nằm trên Supabase.
- **Khi cần mạnh hơn:**
  - nâng máy (vài cú bấm, khởi động lại);
  - xa hơn thì tách Lexica ra máy riêng, hoặc chạy 2 máy web sau Cloudflare Load Balancer.

## 10. Việc của dev (PR đầu tiên, bước 0)
- [ ] `output: 'standalone'` + `outputFileTracingRoot` cho 7 app Next. Kiểm build Vercel vẫn chạy.
- [ ] `docker/next.Dockerfile`, `docker/api.Dockerfile`, `.dockerignore`.
- [ ] Chuyển header từ `vercel.json` sang `next.config` (lexica, teach), thêm tên miền mới vào CSP.
- [ ] Route health nhẹ cho các app Next.
- [ ] CORS của Cortex API đọc danh sách tên miền từ biến môi trường.
- [ ] Workflow (tuỳ chọn) build image lên ghcr.io, chỉ app có thay đổi.
- [ ] Thử chạy toàn bộ bằng `docker compose` trên máy dev.

## Việc của người dùng
- [ ] Chọn nhà cung cấp, mua 2 máy Singapore, gửi IP (không gửi mật khẩu).
- [ ] Chuyển DNS tên miền về Cloudflare.
- [ ] Kiểm vùng Supabase, cân nhắc nâng Pro.
- [ ] Chép biến môi trường từ Vercel/Railway vào Coolify (mục 4).
- [ ] Thêm tên miền mới vào Supabase Auth Redirect URLs.
