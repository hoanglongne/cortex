# Kế hoạch làm lại Teach (10/2026)

Bản nháp chờ duyệt. Chưa code gì.

## 1. Teach hiện có gì
- **Hôm nay:** việc cần để ý, em đáng khen, danh sách lớp.
- **Lớp:**
  - Tổng quan: bài đang làm, nhịp tuần, số liệu từng app.
  - Bài tập: giao từ Lexica hoặc câu hỏi Oratio, có hạn nộp, xem cả lớp tới đâu.
  - Học viên: lọc theo trạng thái, mời bằng link hoặc mã.
  - Báo cáo tuần: in được, có đoạn nhắn phụ huynh.
  - Cài đặt: bật bảng xếp hạng, lưu trữ lớp.
- **Trang một em:** bốn bước của từ, âm hay sai, điểm từ vựng đã xác minh, 30 ngày học, ghi chú riêng.
- **Học viên, Báo cáo, Trung tâm:** danh sách gộp, báo cáo tuần, chỗ ngồi và giáo viên.

## 2. Vì sao chán
1. **Chỉ để xem, không để làm.** Mọi màn hình đều là con số. Không có gì giáo viên dùng **trong giờ dạy**.
2. **Không tiết kiệm thời gian.** Giao bài vẫn phải tự chọn từng từ. Báo cáo phụ huynh vẫn phải tự gửi. Không có gì tự chạy.
3. **Số liệu không dẫn tới hành động.** Thấy "em A kẹt ở Nhớ" nhưng không có nút "giao em A ôn lại 10 từ đó".
4. **Không có khoảnh khắc vui.** Không thi đua trực tiếp, không có gì để giáo viên khoe với lớp hay với phụ huynh.
5. **Oratio trong teach mỏng:** chỉ có thanh điểm theo tiêu chí, giáo viên không nghe được bài nói, không chấm, không nhận xét.

## 3. Đề xuất: 4 nhóm tính năng

### A. Dạy trên lớp (biến teach thành công cụ trên lớp)
1. **Trình chiếu từ của bài:** chế độ toàn màn hình cho máy chiếu. Mỗi từ một slide: từ, phiên âm, giọng đọc Kokoro, câu ví dụ, ảnh hoặc câu trích. Phím mũi tên để chuyển, ẩn hoặc hiện nghĩa để hỏi lớp.
2. **Quiz trực tiếp kiểu Kahoot:**
   - Giáo viên mở quiz từ một bài giao; màn hình chiếu hiện mã phòng và câu hỏi.
   - Học viên trả lời trên điện thoại bằng Lexica (đã có tài khoản và lớp).
   - Bảng xếp hạng sau mỗi câu, vinh danh top 3 cuối giờ.
   - Câu hỏi dùng lại bộ máy của bài kiểm tra: chọn nghĩa, điền cụm, nghe.
   - Kỹ thuật: Supabase Realtime (đã dùng cho Oratio), bảng `class_live_*`.
3. **Gọi tên ngẫu nhiên và chia nhóm:** quay tên một em để trả lời; chia nhóm 2–4 em theo trình độ hoặc ngẫu nhiên. Nhỏ, nhưng giáo viên dùng mỗi buổi.

### B. Giao bài thông minh, kiểm tra
1. **Giao bài một chạm theo gợi ý:**
   - "15 từ cả lớp hay quên nhất tuần này";
   - "từ còn ở Hiểu sau 7 ngày";
   - "gói Studio cùng chủ đề với bài trước".
   
   Kèm giao riêng cho một em hoặc một nhóm, từ chính trang của em đó.
2. **Bài kiểm tra từ vựng của lớp:** dùng máy chấm đã có (chạy trên Supabase), giới hạn trong từ đã giao, có giờ mở và đóng, chấm tự động, xuất bảng điểm (CSV / Google Sheets).
3. **Theo dõi điểm từ vựng đã xác minh của lớp theo thời gian:** biểu đồ đầu khoá so với hiện tại. Đây là thứ trung tâm dùng để chứng minh hiệu quả với phụ huynh.
4. **Bài giao theo lịch:** giao trước cả tuần, tự mở theo ngày.

### C. Phụ huynh và trung tâm
1. **Link báo cáo cho phụ huynh:**
   - mỗi em một link riêng (giống trang `/score/<mã>`), không cần tài khoản;
   - nội dung: tuần này học mấy ngày, bao nhiêu từ lên Nhớ hoặc Dùng, điểm từ vựng, lời nhận xét của giáo viên.
   - Gửi qua Zalo bằng một nút "Chép link" hoặc "Chia sẻ".
2. **Báo cáo tự động hằng tuần:** tối Chủ nhật tự tạo báo cáo cho cả lớp, sáng thứ Hai giáo viên duyệt rồi bấm gửi tất cả.
3. **Trang trung tâm:**
   - so sánh lớp: mức tiến bộ điểm từ vựng, tỉ lệ đi học đều;
   - giáo viên nào lớp đang chững lại;
   - xuất báo cáo tháng cho chủ trung tâm.

### D. Oratio trong teach
1. **Nghe lại bài nói** của học viên (bản ghi đã có, đang tự xoá sau một thời gian).
2. **Giáo viên chấm band và nhận xét** theo 4 tiêu chí IELTS, đặt cạnh điểm máy chấm. Học viên thấy nhận xét trong Oratio.
3. **Ngân hàng đề của lớp:** giáo viên thêm câu hỏi riêng, giao cho buổi tới.

### E. Làm mới giao diện (làm kèm các nhóm trên)
- Trang Hôm nay theo dạng "việc cần làm" có nút hành động ngay trên từng dòng: "Nhắc em", "Giao ôn lại", "Gửi phụ huynh".
- Cùng phong cách Lexica vừa làm: gọn, ít màu, chữ rõ.
- Bản điện thoại dùng được: giáo viên hay xem trên đường đi dạy.

## 4. Thứ tự đề xuất

| Đợt | Gồm | Vì sao trước | Ước lượng |
|---|---|---|---|
| **T1** | A1 trình chiếu, A3 gọi tên và chia nhóm, E trang Hôm nay có nút hành động | Dùng được ngay buổi dạy tới, không cần dữ liệu mới | 1 PR |
| **T2** | A2 quiz trực tiếp | Tính năng "wow" để trung tâm muốn dùng và học viên muốn vào Lexica | 1–2 PR (realtime) |
| **T3** | B1 giao bài một chạm, B2 bài kiểm tra lớp, B3 biểu đồ điểm lớp | Biến số liệu thành hành động; trung tâm cần điểm để báo cáo | 1–2 PR |
| **T4** | C1 link phụ huynh, C2 báo cáo tự động | Điểm bán hàng lớn với trung tâm ở Việt Nam | 1 PR |
| **T5** | D Oratio chấm và nghe, C3 trang trung tâm | Khi Oratio có người dùng thật | 1–2 PR |

## 5. Cần quyết
1. Thứ tự trên có hợp không, hay ưu tiên phụ huynh (T4) trước, vì đó là thứ trung tâm hỏi nhiều nhất?
2. Quiz trực tiếp: học viên trả lời bằng **Lexica** (cần tài khoản và lớp), hay bằng một **trang web riêng chỉ cần nhập mã**, kiểu Kahoot, không cần tài khoản?
3. Link phụ huynh: có cần mật khẩu hoặc mã PIN không, hay chỉ cần link khó đoán là đủ?
4. Có muốn gửi báo cáo qua **Zalo OA** tự động không? Cần đăng ký Zalo Official Account và có phí. Nếu không thì giáo viên tự chép link gửi.
