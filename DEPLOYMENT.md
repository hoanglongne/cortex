# Cortex Ecosystem Deployment Strategy

Tài liệu này hướng dẫn chiến lược triển khai (deployment) tối ưu cho toàn bộ hệ sinh thái Cortex, bao gồm backend NestJS và các ứng dụng frontend Next.js.

## 1. Kiến trúc tổng thể (Architecture)

Hệ thống được thiết kế theo mô hình **Monorepo (pnpm + Turbo)**, cho phép quản lý nhiều ứng dụng trong cùng một repository nhưng triển khai độc lập.

- **Backend Hub**: `cortex-core-api` (NestJS) - Cung cấp API, xử lý LLM, Realtime (Socket.io), và kết nối Database.
- **Frontend Apps**: `landing`, `lexica`, `synapse`, `oratio`, `solilo` (Next.js) - Các ứng dụng người dùng cuối.

---

## 2. Triển khai Frontend (Vercel - Khuyên dùng)

Vercel là lựa chọn tốt nhất cho các ứng dụng Next.js trong monorepo nhờ sự tích hợp sâu với Turbo.

### Chiến lược Domain (Phương án Miễn phí):

Nếu bạn chưa có domain riêng, hãy sử dụng các domain mặc định của nhà cung cấp:

- **Main App**: `cortex-landing.vercel.app`
- **Sub-apps**: `cortex-lexica.vercel.app`, `cortex-synapse.vercel.app`, v.v.
- **Backend**: `cortex-api.up.railway.app`

**Lưu ý**: Vì các subdomain `.vercel.app` không thể chia sẻ Cookie trực tiếp, bạn **PHẢI** sử dụng `postMessage` thông qua Iframe Auth Bridge để truyền `access_token` giữa các app.

### Cách thiết lập trên Vercel:

1. Kết nối repository GitHub với Vercel.
2. Tạo 5 project riêng biệt trên Vercel tương ứng với 5 app frontend.
3. Trong phần **Project Settings > General**:
   - **Root Directory**: `apps/[tên-app]`
   - **Build Command**: `cd ../.. && npx turbo run build --filter=[tên-app]`
   - **Install Command**: `pnpm install` (Vercel tự động nhận diện pnpm).
4. Thiết lập biến môi trường (Environment Variables) cho từng app (ví dụ: `NEXT_PUBLIC_API_URL` trỏ về backend).

---

## 3. Triển khai Backend (Railway / Render / Fly.io)

Backend NestJS cần một runtime Node.js ổn định và hỗ trợ WebSockets/Redis.

### Lựa chọn khuyên dùng: **Railway**

- **Ưu điểm**: Setup cực nhanh, hỗ trợ monorepo tốt, tích hợp sẵn Redis.
- **Cách thiết lập**:
  1. Tạo project mới trên Railway và kết nối GitHub.
  2. Chọn thư mục `apps/cortex-core-api`.
  3. Railway sẽ tự động nhận diện NestJS. Nếu cần, thiết lập Build Command: `pnpm build` và Start Command: `pnpm start:prod`.
  4. Thêm biến môi trường: `DATABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `REDIS_URL`, v.v.

---

## 4. Cơ sở hạ tầng phụ trợ (Infrastructure)

- **Database & Auth**: **Supabase** (Managed Postgres & Auth).
- **Caching & Realtime**: **Upstash Redis** hoặc **Railway Redis**.
- **Realtime Media (Oratio)**: **LiveKit Cloud**.
- **LLM APIs**: Google AI Studio (Gemini), Groq Cloud (Llama/Gemma).

---

## 5. Quy trình CI/CD (GitHub Actions)

Tạo file `.github/workflows/ci.yml` để tự động hóa việc kiểm tra mã nguồn:

```yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm turbo run build lint check-types
```

---

## 6. Lưu ý về Auth Bridge (Cực kỳ quan trọng)

Vì các ứng dụng chạy trên các subdomain khác nhau, việc chia sẻ phiên đăng nhập (Session) cần được xử lý qua **Iframe Auth Bridge**:

1. App `landing` (hoặc `hub`) giữ session chính từ Supabase.
2. Các app con (`lexica`, `synapse`) nhúng một iframe ẩn từ `landing` để nhận token qua `postMessage`.
3. Đảm bảo cấu hình **CORS** trên backend và **Allowed Origins** trên Supabase cho phép tất cả các subdomain của bạn.

---

## 7. Môi trường Staging

Trước khi deploy production, bạn nên có một môi trường Staging:

- Vercel tự động tạo **Preview Deployments** cho mỗi Pull Request.
- Bạn có thể tạo một project backend riêng trên Railway (`cortex-api-staging`) kết nối với một branch `develop`.
