# Oratio: bật Chấm chéo, Giờ thi và nhắc giờ thi (từng bước)

Làm một lần. Mất khoảng 15 phút. Mỗi bước có cách kiểm tra đã xong.

## Bước 1. Chạy SQL (1 file)

1. Mở https://supabase.com/dashboard, chọn project của Cortex.
2. Menu trái: **SQL Editor** → **New query**.
3. Mở file **`supabase/oratio_2026_10.sql`** trong repo (trên GitHub: thư mục `supabase`, file `oratio_2026_10.sql`, bấm **Raw** rồi chọn hết và chép).
4. Dán toàn bộ vào ô SQL → bấm **Run**.
5. Kết quả mong đợi: dòng "Success. No rows returned". Chạy lại lần nữa cũng không sao.

File này gom đúng 3 migration theo thứ tự: `migration_2026_10_answers.sql`, `migration_2026_10_security.sql`, `migration_2026_10_live.sql`. Bạn không cần tìm từng file.

**Kiểm tra:** Supabase → **Table Editor**, phải thấy các bảng `answers`, `answer_reviews`, `review_claims`, `push_subscriptions`.

Lưu ý: bước này phải chạy **sau** `supabase/teach_all.sql` (bạn đã chạy rồi). Sau này nếu chạy lại migration nào của Lexica đụng tới `profiles`, chạy lại file này một lần nữa.

## Bước 2. Tạo khoá thông báo đẩy (VAPID)

Trên máy bạn, mở terminal (ở bất kỳ thư mục nào) và chạy:

```
npx web-push generate-vapid-keys
```

Nó in ra hai dòng:

```
Public Key:  Bxxxxxxxx...
Private Key: yyyyyyyy...
```

- **Public Key** dùng cho `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- **Private Key** dùng cho `VAPID_PRIVATE_KEY`. Đây là bí mật: chỉ dán vào Vercel, đừng gửi cho ai, đừng dán vào chat hay commit.

Chạy **một lần duy nhất** rồi cất lại. Đổi khoá sau này thì mọi thiết bị đã bật nhắc phải bật lại.

## Bước 3. Tạo mã bí mật cho cron

Vercel tự gọi hai đường dẫn nhắc giờ và dọn file ghi âm mỗi ngày. Mã này để chỉ Vercel gọi được, người ngoài thì không.

Trong terminal chạy `openssl rand -hex 32` (Mac/Linux), hoặc vào https://www.uuidgenerator.net lấy một UUID. Chuỗi in ra chính là **`CRON_SECRET`**.

## Bước 4. Đặt biến môi trường trên Vercel

Vercel → project **oratio** → **Settings** → **Environment Variables**. Thêm từng biến, chọn **Production**:

| Tên | Giá trị | Lấy ở đâu |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Key ở bước 2 | |
| `VAPID_PRIVATE_KEY` | Private Key ở bước 2 | |
| `VAPID_SUBJECT` | `mailto:email-của-bạn@...` | email liên hệ của bạn |
| `CRON_SECRET` | chuỗi ở bước 3 | |
| `SUPABASE_SERVICE_ROLE_KEY` | Khoá `service_role` | Supabase → Project Settings → API → **service_role** (bấm Reveal). Bí mật, chỉ dán vào Vercel |
| `NEXT_PUBLIC_SITE_URL` | `https://tên-miền-oratio` | có **https://** ở đầu |
| `NEXT_PUBLIC_CORTEX_API_URL` | địa chỉ Cortex API trên Railway | cùng giá trị Lexica đang dùng. Cho giọng giám khảo tự nhiên; thiếu thì chỉ dùng giọng đã lưu sẵn hoặc giọng hệ thống |

Các biến `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` và LiveKit đã có từ trước, không cần đổi.

Sau khi thêm xong: **Deployments** → bấm menu `…` của lần deploy mới nhất → **Redeploy** (biến chỉ có hiệu lực ở lần deploy sau khi đặt).

## Bước 5. Hai cron (không cần làm gì thêm)

Hai cron đã khai báo sẵn trong `apps/oratio/vercel.json` và Vercel tự bật khi deploy production:

| Việc | Giờ chạy (giờ Việt Nam) |
|---|---|
| `/api/cron/exam-reminder`: nhắc "Giờ thi mở lúc 20:30" cho người đã bật | 20:10 mỗi ngày |
| `/api/cron/expire-audio`: xoá file ghi âm quá 30 ngày | 10:17 mỗi ngày |

Vercel tự gửi kèm `CRON_SECRET` mà bạn đặt ở bước 4.

**Kiểm tra:** Vercel → project oratio → **Settings** → **Cron Jobs**: phải thấy hai dòng trên. Bấm **Run** cạnh từng dòng để chạy thử; kết quả không phải lỗi 401 hay 500 là đúng (401 nghĩa là `CRON_SECRET` chưa đặt hoặc chưa redeploy; 500 "VAPID keys not set" nghĩa là chưa đặt khoá ở bước 4).

Gói Vercel miễn phí (Hobby) chỉ cho cron chạy tối đa một lần mỗi ngày: hai cron trên đúng như vậy nên không vấn đề.

## Xong khi nào

- Bảng ở bước 1 có đủ.
- Cron Jobs hiện hai dòng và chạy thử không lỗi.
- Vào Oratio trên điện thoại, bật "Nhắc giờ thi" (ở phần Giờ thi), thấy hỏi quyền thông báo.
