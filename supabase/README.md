# Supabase – dựng lại database

Lexica, Oratio và Cortex Core API **dùng chung một project Supabase**: bảng `public.profiles` được cả Oratio (`username`, `current_band`...) lẫn Lexica (`nickname`) dùng.

## Khôi phục nhanh

1. Vào Supabase Dashboard → **SQL Editor** → New query.
2. Dán toàn bộ nội dung [`restore_all.sql`](restore_all.sql) rồi bấm **Run**.
3. Vào **Database → Replication** (hoặc Realtime), kiểm tra `matches`, `match_queue` và `linguistic_profiles` đã bật realtime.
4. Nếu đây là **project mới** (URL/key khác project cũ), cập nhật env trên Vercel cho từng app và cho Cortex API:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Lexica, Oratio, landing)
   - `SUPABASE_SERVICE_ROLE_KEY` (Oratio, dùng cho server actions ghép cặp)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Cortex API)
5. Bật lại các nhà cung cấp đăng nhập trong **Authentication → Providers** (Email OTP cho Lexica, email/password cho Oratio) và đặt **Site URL / Redirect URLs** về domain các app.

File chạy lại nhiều lần vẫn an toàn (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`...), kể cả khi database còn sót một phần bảng. Đã kiểm tra trên Postgres 16: chạy 2 lần liên tiếp trong cùng một transaction không lỗi.

## File này **không** có

- **Dữ liệu người dùng** (tài khoản, tiến trình học, lịch sử trận, vocab đã học). Repo chưa từng lưu dữ liệu này. Nếu project cũ chỉ bị **pause**, dữ liệu vẫn còn: xem bên dưới.
- Tài khoản trong `auth.users`: người dùng phải đăng ký lại.

## Dữ liệu seed có trong file

- 302 câu hỏi IELTS Speaking (Part 1/2/3) cho Oratio, từ `apps/oratio/supabase/seed_questions_v2.sql`. Lưu ý: file seed này `DELETE FROM ielts_questions` trước khi chèn lại.
- Từ vựng và story của Lexica nằm trong code (`apps/lexica/app/data/`), không cần seed.

## Database "biến mất": nguyên nhân hay gặp

Project Supabase **gói Free bị tự động pause sau ~7 ngày không có request**. Project đang pause trông như mất hết dữ liệu (API lỗi, dashboard báo paused). Kiểm tra theo thứ tự:

1. Dashboard có nút **Restore / Resume project** không? Nếu có, bấm vào, dữ liệu sẽ trở lại nguyên vẹn. **Đừng chạy `restore_all.sql` trước bước này.**
2. Project pause quá lâu (khoảng 90 ngày) thì không resume được nữa, nhưng dashboard thường vẫn cho **tải bản backup** về: Database → Backups.
3. Chỉ khi cả hai cách trên không được mới tạo project mới và chạy `restore_all.sql`.

Để tránh bị pause lần nữa: gắn uptime monitor vào `GET /health` của Cortex API. Endpoint này truy vấn Supabase mỗi lần được gọi, nên project luôn có hoạt động.

## Sửa SQL

`restore_all.sql` được **sinh tự động**, đừng sửa trực tiếp. Hãy sửa file gốc trong `apps/*/supabase/`, thêm file mới vào danh sách trong [`build-restore.sh`](build-restore.sh), rồi chạy:

```sh
supabase/build-restore.sh
```

Không đưa `apps/oratio/supabase/fix_current_match_roles.sql` vào: đó là script debug thủ công, cần điền tay `YOUR_MATCH_ID`. `seed_questions.sql` (v1) cũng được bỏ vì v2 thay thế nó.
