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

## 3. Hướng "wow": dùng thứ chỉ Cortex có

Những gì ở mục 6 (trình chiếu, Kahoot, báo cáo phụ huynh) app nào cũng có, nên không đủ khác biệt. Cortex có những thứ người khác không có:
- chấm phát âm ngay trên điện thoại, theo từng âm;
- sổ âm hay sai của từng em;
- bốn bước của từng từ (Hiểu, Nhớ, Gặp, Dùng);
- Studio tự viết bài đọc;
- giọng Kokoro;
- Oratio luyện nói theo cặp;
- điểm từ vựng đã xác minh.

Ghép chúng lại thành 4 tính năng đặc trưng:

### W1. "Radar phát âm" trên lớp
- Giáo viên chiếu một từ hoặc một câu. **Cả lớp nói cùng lúc vào điện thoại.**
- Máy chiếu hiện ngay **bản đồ nhiệt của lớp**, ví dụ: "14/22 em sai âm /θ/ trong *think*, 6 em mất âm cuối /k/".
- Bấm vào một âm thì hiện hình miệng và cặp từ dễ nhầm. Cả lớp nói lại, thanh đỏ chuyển xanh ngay trước mắt.
- Chấm chạy trên điện thoại từng em (đã có), máy chủ chỉ nhận kết quả theo âm qua Supabase Realtime. Không gửi giọng nói đi đâu.
- **Vì sao wow:** giáo viên lần đầu *nhìn thấy* cả lớp phát âm thế nào trong 10 giây. Không app nào ở Việt Nam làm được, và là thứ trung tâm mang ra quảng cáo.

### W2. "Buổi học tự lái"
- Giáo viên gõ: *"Thứ 5, lớp B1, chủ đề Môi trường, 90 phút"*. Cortex dựng **cả buổi** từ dữ liệu thật của lớp:
  1. **Chọn từ:** những từ cả lớp chưa biết, hoặc đang kẹt ở Hiểu.
  2. **Khởi động:** quiz nhanh ôn lại từ buổi trước mà nhiều em sắp quên (theo lịch ôn).
  3. **Trình chiếu từ mới:** giọng Kokoro, câu ví dụ, câu trích ngoài đời.
  4. **Bài đọc viết riêng cho lớp:** Studio viết, chứa đúng những từ đó, đúng trình độ.
  5. **Radar phát âm (W1)** với các từ khó.
  6. **Ghép cặp nói kiểu Oratio** ngay trên lớp: bấm "ghép cặp", máy chiếu hiện ai nói với ai, đồng hồ đếm, đề bài.
  7. **Quiz cuối giờ**, xếp hạng.
  8. **Bài về nhà tự giao.** Sau buổi, báo cáo tự soạn cho phụ huynh.
- Giáo viên chỉ cần bấm "Bắt đầu buổi học" và "Tiếp".
- **Vì sao wow:** giảm khoảng 1–2 giờ soạn bài mỗi buổi. Trung tâm mua vì lý do này.

### W3. "Giọng con, tuần 1 và tuần 8" cho phụ huynh
- Học viên đồng ý thì mỗi tuần lưu một câu mẫu đọc lại (cùng một câu).
- Link phụ huynh có nút **nghe giọng con tuần đầu và tuần này**, kèm:
  - đường điểm phát âm theo từng âm;
  - điểm từ vựng đã xác minh lên bao nhiêu;
  - số từ con đã *dùng* ngoài đời.
- **Vì sao wow:** phụ huynh *nghe thấy* con tiến bộ, không chỉ đọc con số. Đây là thứ được chia sẻ lên Facebook hay Zalo, tức là quảng cáo miễn phí cho trung tâm.
- Cần: tải đoạn ghi âm lên Supabase Storage khi có đồng ý, chính sách riêng tư cập nhật, phụ huynh xác nhận với học viên dưới 16 tuổi.

### W4. "Dự báo" thay cho báo cáo
- Từ dữ liệu ôn tập và điểm:
  - *"Tuần này em A sẽ quên 12 từ nếu không ôn. Giao ôn lại?"* (một chạm);
  - *"Với nhịp hiện tại, cuối khoá lớp đạt khoảng 1150–1200 điểm, tương đương IELTS từ vựng 6.0–6.5"*;
  - *"3 em có dấu hiệu bỏ học: giảm từ 5 xuống 1 ngày mỗi tuần."*
- Trang Hôm nay của giáo viên thành **danh sách việc nên làm**, mỗi dòng có nút hành động.
- **Vì sao wow:** giáo viên và chủ trung tâm thấy *tương lai*, không chỉ quá khứ. Dự báo điểm cuối khoá là thứ chốt sale với phụ huynh.

### Thứ tự đề xuất cho hướng wow
| Đợt | Gồm | Ghi chú |
|---|---|---|
| **W-1** | Radar phát âm (W1) | Ấn tượng nhất, phần khó (chấm âm) đã có sẵn; cần Realtime và màn hình chiếu |
| **W-2** | Buổi học tự lái (W2), gồm trình chiếu, quiz, ghép cặp nói, bài về nhà | Lớn nhất, chia 2–3 PR; dùng lại W1 |
| **W-3** | Dự báo (W4) và trang Hôm nay mới | Thuần dữ liệu đã có |
| **W-4** | Giọng con tuần 1 và tuần 8 (W3) và link phụ huynh | Cần đồng ý ghi âm và lưu trữ |

## 6. Bản đề xuất đầu (nền tảng, làm kèm khi cần)

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

## 7. Thứ tự của bản đầu

| Đợt | Gồm | Vì sao trước | Ước lượng |
|---|---|---|---|
| **T1** | A1 trình chiếu, A3 gọi tên và chia nhóm, E trang Hôm nay có nút hành động | Dùng được ngay buổi dạy tới, không cần dữ liệu mới | 1 PR |
| **T2** | A2 quiz trực tiếp | Tính năng "wow" để trung tâm muốn dùng và học viên muốn vào Lexica | 1–2 PR (realtime) |
| **T3** | B1 giao bài một chạm, B2 bài kiểm tra lớp, B3 biểu đồ điểm lớp | Biến số liệu thành hành động; trung tâm cần điểm để báo cáo | 1–2 PR |
| **T4** | C1 link phụ huynh, C2 báo cáo tự động | Điểm bán hàng lớn với trung tâm ở Việt Nam | 1 PR |
| **T5** | D Oratio chấm và nghe, C3 trang trung tâm | Khi Oratio có người dùng thật | 1–2 PR |

## 8. Cần quyết (bản đầu)
1. Thứ tự trên có hợp không, hay ưu tiên phụ huynh (T4) trước, vì đó là thứ trung tâm hỏi nhiều nhất?
2. Quiz trực tiếp: học viên trả lời bằng **Lexica** (cần tài khoản và lớp), hay bằng một **trang web riêng chỉ cần nhập mã**, kiểu Kahoot, không cần tài khoản?
3. Link phụ huynh: có cần mật khẩu hoặc mã PIN không, hay chỉ cần link khó đoán là đủ?
4. Có muốn gửi báo cáo qua **Zalo OA** tự động không? Cần đăng ký Zalo Official Account và có phí. Nếu không thì giáo viên tự chép link gửi.
