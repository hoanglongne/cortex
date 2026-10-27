# Hệ sinh thái Cortex: dữ liệu, ứng dụng mới, hai hướng (27/10/2026)

Bản nháp để bàn, viết sau khi xong T1–T5 của Teach. Là giả thuyết cho tới khi có người dùng thật. Liên quan: `BUSINESS_MODEL.md`, `TEACH_PLAN.md`, `CLASSROOM.md`.

---

## 1. Việc phải làm đầu tiên: có người dùng thật

Mọi thứ dưới đây đều cần dữ liệu thật. Hiện chưa có gì để hiệu chỉnh, nên bước 0 là **thí điểm với 3–5 lớp thật** (khoảng 60–100 học viên) trong 4–6 tuần, miễn phí đổi lấy phản hồi. Chọn giáo viên IELTS tự mở lớp hoặc trung tâm nhỏ, vì một giáo viên mang cả lớp.

---

## 2. Thu thập dữ liệu và hiệu chỉnh học liệu

### 2.1 Cái đã có
- PostHog trong Lexica (`sign_up`, `today_start`, `today_complete`, `speak_attempt`, `session_complete`, `recall_check`, …).
- Bảng `lexica_feedback` và trang `/feedback`.
- Số liệu lớp: mỗi em báo bước Hiểu/Nhớ/Gặp/Dùng, nhật ký ôn, nhóm âm sai (chỉ con số).
- Từ Teach T2/T3: mỗi câu trả lời trong Đấu trường và bài kiểm tra lớp đều gắn với một thẻ (`card_id`), có thời gian trả lời. **Đây là mỏ dữ liệu độ khó của từng từ**, chưa ai khai thác.
- Điểm bài kiểm tra thích ứng do máy chủ chấm (`lexica_placement_sessions`).

### 2.2 Cái còn thiếu, theo thứ tự nên làm

| # | Việc | Để làm gì |
|---|---|---|
| 1 | **Bộ sự kiện chung cho cả 3 app** (cùng tên, cùng `user_id` sau đăng nhập, thêm thuộc tính `app`, `track`, `class_id` ẩn danh hoá). Hiện mỗi app một kiểu | Một phễu duy nhất: vào Lexica → vào lớp → chơi Đấu trường → dùng Oratio |
| 2 | **Bảng thống kê theo thẻ** `cortex_card_stats` (cập nhật mỗi đêm): số lượt, tỉ lệ đúng khi ôn, tỉ lệ đúng trong quiz/kiểm tra, thời gian trung vị, số lần bị báo lỗi, theo cấp độ và nhánh | Biết từ nào quá dễ, quá khó, hay gây hiểu nhầm |
| 3 | **Nút "Báo thẻ này có vấn đề"** ngay trên thẻ (sai nghĩa, ví dụ lạ, giọng đọc sai, quá khó) | Giáo viên và học viên chỉ ra lỗi đúng chỗ, không phải đoán |
| 4 | **Bảng "sức khoẻ nội dung" trong Studio**: danh sách thẻ tệ nhất tuần này (tỉ lệ đúng thấp bất thường so với cấp độ, nhiều báo lỗi) kèm nút "viết lại" và "tạm ẩn" | Biến dữ liệu thành việc cho người duyệt nội dung |
| 5 | **Hiệu chỉnh ngân hàng câu của bài kiểm tra**: lưu độ khó ước lượng, so với độ khó quan sát; câu lệch nhiều thì đưa vào hàng xem lại. Cần ít nhất vài trăm lượt trả lời mỗi câu trước khi tin | Điểm đáng tin hơn |
| 6 | **Tập kiểm chứng điểm với điểm thi thật**: hỏi tuỳ chọn "Bạn đã thi IELTS chưa? Điểm Overall/Speaking, ngày thi" và lưu cạnh điểm Lexica gần nhất | Biết điểm Lexica lệch bao nhiêu; chỉ khi có số này mới nên nói "quy ra band" mà không kèm chữ "ước lượng" |
| 7 | **Nhật ký dự báo** `forecast_log`: lưu mỗi dự báo W4 đã hiện (loại, ngày, ngưỡng) và 14–30 ngày sau ghi kết quả thật (em có bỏ học không, từ có quên không) | Chỉnh `THRESHOLDS` bằng số đo, đã ghi trong TEACH_PLAN 2.3 |
| 8 | **Cờ tính năng + thử A/B** (PostHog) cho phiên Hôm nay, độ dài phiên, lời nhắc | Biết thay đổi nào thật sự giúp quay lại |
| 9 | **Phỏng vấn ngắn 15 phút** với 5 giáo viên và 10 học viên mỗi tháng, ghi lại theo mẫu cố định | Dữ liệu định lượng không cho biết "vì sao" |

### 2.3 Chỉ số theo dõi
- Người học: quay lại ngày 1/7/30, số từ đạt bước Dùng mỗi tuần, tỉ lệ hoàn thành phiên Hôm nay.
- Lớp: số em hoạt động mỗi tuần, tỉ lệ nộp bài kiểm tra, tỉ lệ chơi Đấu trường đến cuối.
- Nội dung: tỉ lệ đúng theo thẻ, tỉ lệ báo lỗi, độ lệch điểm so với điểm thi thật.
- Dự báo: độ chính xác khi đối chiếu kết quả thật.

### 2.4 Quyền riêng tư (giữ nguyên nguyên tắc hiện có)
- Chỉ gửi **con số**, không gửi nội dung học viên tạo ra. Thống kê theo thẻ gộp từ nhiều học viên, không truy ngược ra từng em.
- Hỏi đồng ý rõ ràng trước khi dùng dữ liệu để hiệu chỉnh; có cách rút lại. Người dưới 18 tuổi: cần phụ huynh/giáo viên đồng ý.
- Điểm thi thật là dữ liệu nhạy cảm: tuỳ chọn, mã hoá lưu trữ, chỉ dùng gộp.

### 2.5 Thứ tự theo giai đoạn
1. **Trước thí điểm:** mục 1, 2, 3 ở bảng trên (nhỏ, làm được trong 1–2 tuần).
2. **Trong thí điểm:** mục 4, 7, 9.
3. **Sau 500+ học viên:** mục 5, 6, 8.

---

## 3. Ứng dụng mới trong hệ sinh thái

Nguyên tắc chọn: (a) dùng chung dữ liệu và tài khoản, (b) giải quyết một việc giáo viên làm mỗi tuần, (c) có đường ra tiền. Mỗi thứ mới nên là **module** cắm vào lõi lớp học (`packages/classroom`, như `classroom-lexica` và `classroom-oratio`), để Teach thêm được mà không viết lại.

### Theo hướng chứng chỉ (ưu tiên)

| Ưu tiên | Ứng dụng | Vì sao bổ trợ Teach | Ghi chú |
|---|---|---|---|
| 1 | **Writing**: viết Task 1/2, AI chấm sơ bộ theo tiêu chí band, giáo viên xem và sửa | Writing là kỹ năng giáo viên mất nhiều giờ chấm nhất; Teach có sẵn hàng đợi và báo cáo | Cần giữ riêng tư: chỉ giáo viên của lớp mới thấy bài viết, khác với nguyên tắc "chỉ gửi con số", nên phải có đồng ý riêng |
| 2 | **Thi thử trọn bộ (Mock Test)**: ghép Listening, Reading, Writing, Speaking, ra band dự đoán | Dự báo điểm cuối khoá của W4 có số đo thật thay vì chỉ từ vựng; trung tâm trả tiền cho thi thử | Dùng lại bài đọc, Oratio; Listening và Reading cần nội dung mới |
| 3 | **Ngân hàng đề và trình tạo bài cho giáo viên**: giáo viên tạo, chia sẻ, nhân bản bộ câu hỏi | Mở rộng "Kiểm tra" của Teach từ từ vựng sang mọi dạng câu | Có thể thành chợ nội dung giữa giáo viên |
| 4 | **Vận hành trung tâm (CRM nhẹ)**: khách hàng tiềm năng, ghi danh, học phí, xếp lịch, phòng | Trang Trung tâm hiện chỉ tổng quan; đây là việc trung tâm làm hằng ngày và là cái khoá họ ở lại | Dễ nở thành sản phẩm khác; chỉ làm phần liên quan tới lớp và điểm danh đã có |
| 5 | **Cổng phụ huynh gọn**: xem lịch, báo cáo tuần, thông báo vắng, thanh toán | Trang phụ huynh đã có và được khen; đây là kênh giữ trung tâm | Chỉ làm khi có yêu cầu thật |
| 6 | **Cổng xác minh điểm cho nhà tuyển dụng hoặc trường** (mở rộng `/score/<mã>`) | Biến điểm Lexica thành thứ có giá trị bên ngoài | Chỉ làm sau khi có tập kiểm chứng ở mục 2.2/6 |

### Theo hướng giao tiếp
- **Nhập vai tình huống công việc** (phỏng vấn, họp, gọi điện) với AI, giáo viên giao theo bài.
- **Câu lạc bộ nói** ghép người trong Oratio theo chủ đề và trình độ.
- Chỉ làm nếu hướng này giữ lại (mục 4).

### Cảnh báo
Đừng làm nhiều app cùng lúc khi chưa có người dùng. Làm theo thứ tự: **Writing → Mock Test → trình tạo bài**, mỗi bước xác nhận có lớp dùng thật rồi mới sang bước sau.

---

## 4. Tách hai hướng: giao tiếp và chứng chỉ

### 4.1 Hiện trạng
- Lexica đã có hai nhánh nội dung (`cert` và `talk`), lớp học có cài đặt nhánh. Oratio vốn là IELTS. Điểm xác minh, dự báo điểm cuối khoá, bài kiểm tra lớp, Luyện nói theo Part đều là chứng chỉ.
- Tức là phần mạnh nhất đã nghiêng về chứng chỉ; nhánh giao tiếp chủ yếu là nội dung.

### 4.2 Khuyến nghị: một nền tảng, hai "phiên bản", không phải hai mã nguồn
Tách ở **tầng trải nghiệm và thông điệp**, giữ chung **động cơ**.

| Giữ chung | Tách riêng |
|---|---|
| Tài khoản, SRS, 4 bước, lớp học, điểm danh, Đấu trường, báo cáo phụ huynh, Studio | Tên và nhận diện, trang chủ, onboarding, gói bài mặc định, thông điệp tiếp thị, giá |
| Dự báo, bài kiểm tra | Chứng chỉ: điểm band, thi thử, Writing. Giao tiếp: tình huống, nhập vai, độ trôi chảy |

Cụ thể về mặt kỹ thuật:
1. Đưa **`track` (`cert` | `talk`)** lên thành thuộc tính hàng đầu: hồ sơ người học, lớp học, gói nội dung, báo cáo. Hiện `branch` chỉ nằm trong cài đặt Lexica và dữ liệu thẻ.
2. Onboarding hỏi mục tiêu rồi đặt `track`; giao diện, bài mặc định, lời nhắc đổi theo.
3. Trang đích riêng cho mỗi hướng (có thể cùng domain, hai đường dẫn, hoặc hai domain trỏ cùng ứng dụng).
4. Teach lọc lớp, báo cáo và gợi ý theo `track`.

### 4.3 Lộ trình "dần lệch sang chứng chỉ"

| Giai đoạn | Việc | Dấu hiệu chuyển giai đoạn |
|---|---|---|
| **0. Bây giờ** | Chứng chỉ là ưu tiên một cho mọi tính năng mới. Giao tiếp ở mức duy trì: giữ nội dung, sửa lỗi, không thêm tính năng. Tiếp thị chỉ nói chứng chỉ | Hoàn thành thí điểm đầu tiên |
| **1. Sau thí điểm** | Thêm `track` vào hồ sơ, lớp, báo cáo; trang đích riêng cho chứng chỉ; Writing và Mock Test | Có trung tâm trả phí đầu tiên, tỉ lệ quay lại ổn |
| **2. Quyết định về giao tiếp** | Nhìn dữ liệu: bao nhiêu người chọn `talk`, họ quay lại thế nào, ai trả tiền? Có ba lựa chọn: giữ như hiện nay, tách thương hiệu riêng, hoặc đóng băng/dừng | Có ít nhất 3 tháng dữ liệu cho cả hai |
| **3. Tách hẳn nếu đáng** | Trang đích, tên, giá, kênh riêng; động cơ vẫn chung | Hướng giao tiếp có nhu cầu và khách trả tiền riêng |

### 4.4 Tiêu chí quyết định ở giai đoạn 2
- Tỉ lệ quay lại ngày 30 của `talk` có ngang `cert` không?
- Có khách B2B nào (công ty, trung tâm giao tiếp) trả tiền cho `talk` không?
- Chi phí nội dung và duy trì `talk` so với doanh thu?
- Hai hướng có làm thông điệp tiếp thị loãng đi không?

### 4.5 Rủi ro
- Đội nhỏ mà tách thành hai sản phẩm sẽ dàn mỏng sức. Vì thế khuyến nghị tách thông điệp trước, tách sản phẩm sau.
- Người dùng giao tiếp hiện có (nếu có) có thể cảm thấy bị bỏ rơi: thông báo rõ, giữ nội dung cũ chạy.
- "Dừng giao tiếp" là quyết định không đảo ngược dễ: chỉ làm khi có số liệu ở giai đoạn 2.
