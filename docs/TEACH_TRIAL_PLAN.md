# Teach: "Buổi học thử", điểm riêng của Teach (24/11/2026)

Chủ dự án chọn hướng này làm điểm khác biệt (xem `TEACH_MARKET_RESEARCH.md` mục 8). Nỗi lo số một của trung tâm mới là **có học viên**; phần mềm quản lý thường không giúp chỗ này. Buổi học thử dùng lại thứ đã có, không tốn AI.

## Luồng
1. Giáo viên bấm **"Mở buổi học thử"** trong Teach: đặt tên ("Học thử IELTS thứ Bảy"), chọn lớp muốn mời vào (tuỳ chọn). Nhận **mã, link và mã QR** để chiếu hoặc gửi Zalo.
2. Phụ huynh hoặc học viên mở link (Lexica, **không cần tài khoản**): nhập tên, số điện thoại (tuỳ chọn, có câu đồng ý), rồi:
   - làm **bài xếp lớp** (bài thích ứng do máy chủ chấm, đã có) và nhận **trang điểm có mã xác minh** để chia sẻ;
   - và/hoặc vào **Đấu trường** của buổi đó (đã có chế độ khách).
3. Giáo viên thấy **danh sách khách học thử**: tên, điện thoại, trình độ, điểm, giờ vào. Mỗi dòng có **"Mời vào lớp"** (chép tin nhắn kèm link vào lớp, như các tin nhắn đã có) và **"Đã ghi danh"**.
4. Khi khách vào lớp thật, dòng đó đóng lại. Trang Hôm nay nhắc "3 khách học thử chưa trả lời".

## Cái đã có
| Mảnh | Ở đâu |
|---|---|
| Bài xếp lớp thích ứng, chấm ở máy chủ, mã công khai `/score/<mã>` | `migration_placement.sql`, `app/score` |
| Khách không tài khoản (người dùng ẩn danh) | `guestSupabase.ts`, `classroom_arena.sql` |
| Đấu trường có mã QR | Teach `/classes/[id]`, Đấu trường |
| Chép tin nhắn gửi Zalo | `CopyChip` |
| Vào lớp bằng mã | `classroom_class_join` |

## Cái phải làm, theo lát cắt (mỗi lát chạy được riêng)
| Lát | Làm gì | Ước tính |
|---|---|---|
| **T1** | SQL: `cortex_trials`, `cortex_trial_guests`; hàm tạo/đóng buổi, khách đăng ký (người dùng ẩn danh), giáo viên đọc danh sách. Chỉ giáo viên của trung tâm đó thấy khách. Trong Teach: nút "Mở buổi học thử", mã, link, QR, danh sách | 1 tuần |
| **T2** | Lexica `/thu?code=`: trang khách (tên, số điện thoại tuỳ chọn, đồng ý), chạy bài xếp lớp **bằng phiên khách** (hiện bài xếp lớp dùng phiên của người học, cần chỉnh), gắn kết quả vào khách | 1–1,5 tuần |
| **T3** | "Mời vào lớp", "Đã ghi danh", nhắc ở Hôm nay, xuất Excel danh sách | 3–4 ngày |
| **T4** | Đấu trường cho buổi thử (dùng chế độ khách có sẵn) | 2–3 ngày |

## Quyền riêng tư (quan trọng, vì có số điện thoại và có thể là trẻ em)
- Số điện thoại **không bắt buộc**; có câu đồng ý nói rõ ai thấy (chỉ trung tâm mở buổi) và bao lâu.
- Người dưới 16 tuổi: ô "phụ huynh nhập" thay vì em tự nhập số.
- **Tự xoá sau 90 ngày** nếu không ghi danh; giáo viên xoá ngay được; khách xin xoá qua trang Góp ý.
- Khách chỉ là người dùng ẩn danh, không có hồ sơ Lexica, không đồng bộ gì.
- Cập nhật `/privacy` khi làm T2.

## Rủi ro
- **Gửi tin lung tung:** mã buổi thử bị lộ thì ai cũng điền được. Mỗi buổi có hạn (ví dụ 7 ngày) và trần số khách (ví dụ 200); giáo viên đóng buổi bất cứ lúc nào.
- **Điện thoại rác:** không xác minh số (không gửi SMS). Chấp nhận, vì mục đích là giáo viên gọi lại người thật tới buổi học.
- **Bài xếp lớp chỉ đo từ vựng**, không phải trình độ IELTS 4 kỹ năng. Trang kết quả phải ghi rõ là "vốn từ", không nói band, như `/score` đang làm.
- **Chưa kiểm:** trung tâm mới có muốn dùng cách này để tuyển sinh không. Đo bằng: số buổi mở, số khách mỗi buổi, số khách được mời vào lớp.

## Cần quyết
1. Có thu **số điện thoại** không, hay chỉ tên và để giáo viên hỏi trực tiếp? (Có số thì hữu ích hơn, nhưng thêm trách nhiệm dữ liệu.)
2. Bắt đầu từ T1 và T2 cùng nhau (để thấy trọn luồng) hay T1 trước?
