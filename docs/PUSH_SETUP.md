# Bật thông báo đẩy cho Lexica (từng bước)

Thông báo đẩy báo cho người học khi: bạn tặng từ, bạn nhờ đặt câu, hoặc **sắp đến giờ học chung** (khoảng 10 phút trước). Gửi từ máy chủ API (Railway), chạy mỗi phút, im lặng từ 22 giờ đến 8 giờ (trừ nhắc giờ học chung).

## Bước 1. SQL

Chạy lại `supabase/teach_all.sql` trong Supabase SQL Editor (đã có `migration_push.sql`). Không cần chạy file nào khác.

## Bước 2. Khoá VAPID

Nếu đã tạo khoá VAPID cho Oratio (xem `docs/ORATIO_SETUP.md`, bước 2) thì **dùng lại đúng cặp khoá đó**, không cần tạo mới. Nếu chưa: chạy `npx web-push generate-vapid-keys`, được Public Key và Private Key.

## Bước 3. Biến môi trường

**Vercel → project lexica → Settings → Environment Variables (Production):**

| Tên | Giá trị |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Key |

Sau đó Redeploy lần mới nhất.

**Railway → service của API (cortex-core-api) → Variables:**

| Tên | Giá trị |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Key |
| `VAPID_PRIVATE_KEY` | Private Key (bí mật, chỉ dán vào Railway) |
| `VAPID_SUBJECT` | `mailto:email-của-bạn@...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Khoá `service_role` (Supabase → Project Settings → API → Reveal). Có thể đã đặt cho Studio |
| `LEXICA_PUSH_CRON` | `on` |

Railway tự khởi động lại API sau khi lưu biến.

## Bước 4. Kiểm tra

1. Xem log của API trên Railway: phải thấy dòng **"Push scheduler enabled"**. Nếu thấy "push disabled" thì thiếu khoá hoặc `SUPABASE_SERVICE_ROLE_KEY`.
2. Mở Lexica trên điện thoại (đã đăng nhập) → **Buddy → Hộp thư**: phải thấy thẻ **"Nhắc mình"** với nút **Bật nhắc**. Bấm, cho phép thông báo.
3. Thử: hẹn một giờ học chung với bạn sau khoảng 15 phút ở **Hộp thư → Giờ học chung → Hẹn giờ**. Khoảng 10 phút trước giờ, cả hai máy nhận thông báo.

## iPhone

Chỉ nhận được khi Lexica được **thêm vào Màn hình chính** (Chia sẻ → Thêm vào Màn hình chính), iOS 16.4 trở lên. Mở Lexica từ biểu tượng đó rồi mới bật nhắc. Trong Safari thường, thẻ "Nhắc mình" chỉ hiện hướng dẫn này.

## Không nhận được thì sao

- Thẻ "Nhắc mình" không hiện: Vercel chưa có `NEXT_PUBLIC_VAPID_PUBLIC_KEY` hoặc chưa redeploy.
- Bấm Bật nhắc báo "Bạn đã từ chối": bật lại trong cài đặt thông báo của trình duyệt cho trang Lexica.
- Bấm được nhưng không bao giờ nhận: kiểm tra log Railway có "Push scheduler enabled", và `SUPABASE_SERVICE_ROLE_KEY` đúng.
- Đổi khoá VAPID thì mọi máy phải bật nhắc lại.
