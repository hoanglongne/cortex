# Lexica: triết lý, lộ trình 30 ngày, hai nhánh, trung tâm

Bản trong repo của doc đã duyệt ngày 2026-10-17 ("Lexica — Triết lý & lộ trình 30 ngày"). Code nhắc tới file này khi nói về 4 bước, phiên Hôm nay, lộ trình, nhánh Giao tiếp và lớp học.

## Triết lý: từ câu chêm đến câu của mình

Người Việt không thiếu từ tiếng Anh; họ thiếu con đường để một từ đi từ "nghe quen" tới "nói ra được". Lexica bắt đầu từ cách người Việt đang nói (chêm tiếng Anh vào câu tiếng Việt), rồi rút tiếng Việt dần: đoạn văn tiếng Anh, rồi miệng người học.

5 nguyên tắc, mọi quyết định sản phẩm phải qua:

| Nguyên tắc | Trong sản phẩm |
| --- | --- |
| 1. Bắt đầu từ đời mình | Thẻ câu chêm là cửa vào duy nhất cho từ mới |
| 2. Chỉ đếm từ dùng được | Mọi con số tiến độ là 4 bước |
| 3. Tiếng Việt rút dần | Hiểu → Nhớ → Gặp → Dùng không đảo |
| 4. Một nút mỗi ngày | Phiên Hôm nay là đường chính |
| 5. Vui để quay lại, không vui thay cho học | Album, hũ điểm, Ghost đứng sau lớp học |

## 4 bước của một từ (`app/lib/journey/steps.ts`)

| Bước | Tính năng | Qua bước khi |
| --- | --- | --- |
| Hiểu | Thẻ câu chêm + kiểm tra nghĩa | Học thẻ, trả lời đúng kiểm tra nghĩa |
| Nhớ | Ôn tập, kiểm tra trong bộ thẻ | Đúng ở 2 ngày khác nhau, cách nhau ≥ 3 ngày |
| Gặp | Đọc, Ngoài đời | Đọc xong đoạn có từ, hoặc đúng nghĩa trong trích dẫn |
| Dùng | Luyện nói | Máy nghe rõ từ (hoặc cụm) ít nhất 1 lần |

Sai khi ôn: mất Nhớ, giữ Gặp/Dùng. Con số hiển thị là số từ đã tới mỗi bước (từ ở Dùng được đếm cả 4).

## Hai nhánh

Chứng chỉ (IELTS, sau này TOEIC/VSTEP) và Giao tiếp (cụm từ đời thường, hội thoại, nói theo tình huống). Cùng 4 bước, cùng màn hình, khác nội dung. Thẻ có `branch` (`cert` mặc định, `talk`); đoạn văn có `kind` (`text`, `dialogue`).

## Lộ trình 30 ngày

- Ngày 0: pitch → chọn nhánh → test level → chọn nhịp (10/15 từ/ngày) → phiên đầu 5 từ → mời cài PWA.
- Mỗi ngày: nút "Bắt đầu hôm nay" chạy Ôn → Học → Đọc → Nói, kết phiên có con số 4 bước và phần thưởng.
- Ngày 7/14/21: mốc tuần. Ngày 30: kiểm tra 30 từ, thẻ chia sẻ. Bỏ ngày thì lộ trình dời theo.

## Bố cục

Trên cùng là việc học hôm nay (thẻ Hôm nay, 4 con số, Luyện thêm); lớp game (ví, Album, rival, chuỗi ngày) giữ nguyên nhưng nằm sau: dải cuối màn trên điện thoại, cột phải hẹp trên máy tính. Phần thưởng hiện ở màn kết phiên.

## Trung tâm (B2B)

Lexica nhận phần "giữa hai buổi học". Giáo viên tạo lớp, phát mã, giao từ theo bài, xem bảng lớp (4 con số, chuỗi ngày, ai bỏ học quá 3 ngày) và báo cáo tuần. Học viên vào lớp bằng mã, phiên Hôm nay ưu tiên từ lớp giao, xếp hạng lớp theo số từ Dùng. Dữ liệu: `apps/lexica/supabase/migration_classes.sql`.
