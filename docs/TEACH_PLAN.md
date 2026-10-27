# Kế hoạch làm lại Teach (10/2026)

## 0. Đã chốt (25/10/2026)
- **Làm:**
  - T1: dạy trên lớp;
  - W4: dự báo, làm đến nơi đến chốn;
  - T4: phụ huynh, bắt buộc với LMS;
  - T2: quiz trực tiếp, lên kế hoạch kỹ trước.
- **Để sau:**
  - T3: giao bài thông minh, kiểm tra lớp (dễ làm nửa vời);
  - T5: Oratio trong teach.
- **Bỏ:**
  - W1 radar phát âm cả lớp: nhiều em nói cùng lúc thì không chấm chuẩn được, và làm em yếu tự ti;
  - W2 buổi học tự lái: khó đạt, lợi thế không rõ.
- **W3** (giọng con cho phụ huynh): ý hay nhưng còn chung chung, và phụ huynh nhiều người không rành tiếng Anh. Phần đáng giữ là **nói cho phụ huynh hiểu con làm được gì bằng tiếng Việt dễ hiểu**, đưa vào T4 (mục 3.2).

**Thứ tự làm:** T1 → W4 → T4 → Buổi học → T2. T1, W4, T4 đã merge (PR #54); Buổi học (mục 3.7), T2a, T2b (mục 4.8, 4.9), T3 và T5 (mục 5) đã làm, chưa có PR.

---

## 1. T1: Dạy trên lớp

### 1.1 Trình chiếu từ của bài
- **Mở từ:** một bài giao Lexica, hoặc một nhóm từ tự chọn. Nút "Trình chiếu" trên mỗi bài giao.
- **Toàn màn hình, chữ to cho máy chiếu**, luôn nền tối (dễ nhìn trên máy chiếu).
- **Mỗi từ một slide:**
  - từ, phiên âm, trọng âm;
  - nút phát giọng Kokoro (bình thường, chậm);
  - câu ví dụ, cụm đi kèm, câu trích ngoài đời nếu có.
- **Phím tắt:**
  - ← →: chuyển từ;
  - Space: hiện hoặc ẩn nghĩa tiếng Việt, để giáo viên hỏi lớp trước;
  - S: phát giọng;
  - F: toàn màn hình.
- **Thanh dưới:** "Từ 3/12", và **số em trong lớp đã ở bước Nhớ của từ này**, ví dụ "8/20 em đã nhớ". Giáo viên biết từ nào cần giảng kỹ.
- **Chế độ "Đoán nghĩa":** hiện câu ví dụ có chỗ trống, lớp đoán từ, rồi mở đáp án.

### 1.2 Gọi tên và chia nhóm
- **Gọi tên ngẫu nhiên:** vòng quay tên trong lớp. Có tuỳ chọn "ưu tiên em ít được gọi", nhớ trong buổi và trong tuần. Bấm "Đổi em khác" khi em vắng.
- **Chia nhóm:** 2–6 em mỗi nhóm.
  - Ngẫu nhiên;
  - Đồng đều trình độ: mỗi nhóm có em mạnh và em yếu, xếp theo điểm từ vựng đã xác minh hoặc số từ Nhớ;
  - Cùng trình độ.
- **Đánh dấu em vắng** trước khi chia hoặc gọi, để không bị gọi trúng.
- Hiện to trên máy chiếu, giữ được giữa các buổi nếu giáo viên muốn.

### 1.3 Trang Hôm nay có nút hành động
- Trang Hôm nay thành danh sách việc nên làm, lấy từ W4 (mục 2.4). Mỗi dòng có nút làm ngay: "Giao ôn lại", "Nhắn em", "Gửi phụ huynh", "Xem".
- Làm cùng W4, vì phần lõi là dữ liệu của W4.

**Kỹ thuật:** chỉ phía giao diện, dùng lại dữ liệu bảng lớp và từ của Lexica (`wordIndex`). Giọng lấy từ voice cache. Không cần SQL mới, trừ danh sách vắng (lưu tạm trên máy giáo viên).

---

## 2. W4: Dự báo (làm đến nơi)

Mục tiêu: mỗi con số dự báo đều **có cơ sở, nói rõ độ tin cậy, và đi kèm một hành động**. Thiếu dữ liệu thì im lặng, không đoán bừa.

### 2.1 Dữ liệu cần thêm
Lexica gửi thêm trong báo cáo lớp. Chỉ là con số, đúng nguyên tắc riêng tư:

| Trường | Ý nghĩa |
|---|---|
| `review.overdue` | Số từ đã quá hạn ôn |
| `review.due7` | Số từ sẽ đến hạn trong 7 ngày tới |
| `review.recall14` | `[đúng, tổng]` số lần nhớ lại khi ôn trong 14 ngày |
| `review.atRisk` | Từ của **bài lớp giao** đang quá hạn quá 3 ngày (danh sách mã thẻ), để "giao ôn lại" đúng những từ đó |

Máy chủ đã có sẵn:
- `cortex_class_activity_daily`: ngày học của từng em;
- `lexica_placement_sessions`: điểm từ vựng đã xác minh theo thời gian.

Lớp cần thêm **ngày kết thúc khoá** (cài đặt lớp, không bắt buộc) để dự báo điểm cuối khoá.

### 2.2 Các dự báo

| Dự báo | Cách tính | Khi nào hiện | Hành động |
|---|---|---|---|
| **Sắp quên** | `overdue` cộng các từ của bài giao trong `atRisk` | Từ 5 từ trở lên | "Giao ôn lại N từ cho em" (một chạm: tạo bài giao riêng cho em, chế độ "chỉ từ của bài") |
| **Sắp bỏ học** | Số ngày học tuần này so với trung bình 3 tuần trước, cộng số ngày liền không học | Giảm từ 50% trở lên và có ít nhất 3 tuần dữ liệu, hoặc 5 ngày liền không học | "Nhắn em" (mẫu tin nhắn tiếng Việt, chép gửi Zalo), "Báo phụ huynh" |
| **Nhớ kém** | `recall14` dưới 60% với ít nhất 30 lượt | Có | "Giảm số từ mới mỗi ngày cho em" (gợi ý cài đặt), "Giao ôn lại" |
| **Tiến nhanh** | `recall14` từ 90% trở lên, đi học đều, điểm tăng | Có | "Khen em" (thẻ khen gửi về Lexica), "Gợi ý lên level" |
| **Điểm cuối khoá** | Hồi quy tuyến tính trên các điểm đã xác minh của em (ít nhất 2 lần, cách nhau từ 14 ngày), tốc độ tăng mỗi tuần, chặn trong khoảng hợp lý (tối đa +25 điểm/tuần), kéo tới ngày kết thúc khoá | Có ngày kết thúc khoá và đủ 2 lần thi | Hiện **khoảng**, ví dụ "1150–1200 · IELTS từ vựng khoảng 6.0–6.5", ghi "dự báo nếu giữ nhịp hiện tại" |
| **Cả lớp** | Trung bình các dự báo trên, cộng "lớp sẽ đạt mục tiêu?" nếu giáo viên đặt điểm mục tiêu | Có | Danh sách em kéo lớp xuống |

### 2.3 Làm cho đáng tin
- Mọi ngưỡng nằm trong một file (`packages/classroom-lexica/forecast.ts`) với hàm thuần và unit test, gồm cả trường hợp thiếu dữ liệu.
- **Mỗi dự báo có nút "Vì sao?"** nói rõ dựa trên số liệu nào. Ví dụ: "3 tuần trước em học 5, 4, 5 ngày; tuần này 1 ngày".
- **Kiểm chứng lùi:** khi đủ dữ liệu thật (vài lớp, 4–6 tuần), chạy lại dự báo trên số liệu cũ để xem "sắp bỏ học" có đúng không, rồi chỉnh ngưỡng. Ghi kết quả vào file này.
- **Không dự báo khi dữ liệu mỏng.** Hiện "Chưa đủ dữ liệu, cần thêm N ngày".

### 2.4 Chỗ hiện
- **Trang Hôm nay:** danh sách việc, xếp theo mức gấp. Mỗi dòng có tên em, lớp, lý do một dòng và nút hành động. Đã xử lý thì ẩn trong 7 ngày.
- **Trang một em:** khung "Sắp tới" với các dự báo của em.
- **Tổng quan lớp:** "Cả lớp" (mục 2.2) và biểu đồ dự báo điểm.
- **Trang trung tâm:** lớp nào đang có nhiều em sắp bỏ học.

### 2.5 PR
1. Lexica gửi `review.*`; cập nhật `classroom_lexica.sql` (lọc và giữ trường mới); `forecast.ts` kèm test.
2. Teach: trang Hôm nay mới, khung "Sắp tới", "Vì sao?", hành động một chạm (giao ôn lại riêng cho em: SQL giao bài cho một học viên). Thêm ngày kết thúc khoá và điểm mục tiêu trong cài đặt lớp.

### 2.6 Trạng thái (25/10/2026): đã làm, chưa có PR
- **Đã làm đủ 6 dự báo**, theo các ngưỡng trong bảng 2.2, cùng "Vì sao?", "Chưa đủ dữ liệu, cần thêm …" và hành động cho từng dự báo.
- **Khác so với bảng trên:**
  - **Sắp quên:** chỉ tính `overdue`, vì `atRisk` đã nằm trong đó. "Giao ôn lại" chỉ hiện khi em có từ của bài lớp trong `atRisk`, vì máy chủ chỉ giữ những từ đó. Nếu trong 7 ngày đã giao bài ôn riêng cho em thì không hiện lại nút, chỉ ghi "Đã giao bài … ngày …".
  - **Nhớ kém và Tiến nhanh:** "Giảm số từ mới" và "Gợi ý lên level" là lời khuyên trong "Vì sao?". Teach chưa đổi được cài đặt Lexica của em.
  - **Mỗi dự báo cần giáo viên đều có ít nhất một nút** (26/10): "Nhớ kém" luôn có "Nhắn em" (lời khuyên viết cho em), kể cả khi em không có từ của bài lớp để giao ôn lại; "Cuối khoá dưới mục tiêu" có "Nhắn em" (khoảng điểm và mục tiêu) và "Giao ôn lại" khi có từ của bài lớp. Dự báo "Cuối khoá" khác (chắc đạt, có thể) chỉ để đọc.
  - **Khen em:** chép tin nhắn, chưa có thẻ khen gửi về Lexica.
  - **Điểm cuối khoá:**
    - khoảng điểm = độ lệch của lần thi cuối (tối thiểu 25) cộng 8 điểm cho mỗi tuần còn lại;
    - chỉ dùng các lần thi trong 180 ngày;
    - so với mục tiêu: chắc đạt, có thể, khó đạt.
  - **"Đã xử lý":** lưu trên máy giáo viên, ẩn việc đó 7 ngày.
- **Kiểm chứng lùi:** chưa làm, chờ dữ liệu thật.

---

## 3. T4: Phụ huynh

### 3.1 Link riêng cho phụ huynh
- **Mỗi học viên một link khó đoán**, ví dụ `teach…/p/<mã 12 ký tự>`. Giáo viên bấm "Lấy link phụ huynh" ở trang em, chép gửi Zalo. Có nút tạo lại link (link cũ hết hiệu lực).
- **Không cần tài khoản.** Có thêm **mã PIN 4 số** nếu trung tâm muốn (cài đặt lớp).
- **Chỉ hiện thứ dành cho phụ huynh**, không hiện ghi chú riêng của giáo viên.

### 3.2 Phụ huynh thấy gì: viết cho người không rành tiếng Anh
Lấy ý hay của W3: **nói con làm được gì bằng tiếng Việt đời thường**, thay vì thuật ngữ.
- **Câu tóm tắt đầu trang**, ghép từ số liệu thật. Ví dụ: *"Tuần này con học 5/7 ngày. Con nhớ thêm 23 từ mới và đã dùng được 6 từ khi nói. Con còn hay nhầm âm 'th' (như trong 'think'), cô đang cho con luyện thêm."*
- **"Con làm được gì":** 3 việc cụ thể trong tuần, mỗi việc kèm ví dụ thật. Ví dụ:
  - "Con đọc hiểu một đoạn văn 150 từ về Môi trường";
  - "Con nói rõ 12 từ mới, máy nghe đúng";
  - "Con tự đặt câu với từ *sustainable*", kèm câu của con (chỉ khi con cho phép).
- **Một con số chính:** điểm từ vựng đã xác minh và mức tương đương (khoảng IELTS), với mũi tên lên xuống so với lần trước. Không bày nhiều số.
- **Lời nhận xét của giáo viên** (mục 3.3).
- **"Phụ huynh có thể giúp":** một gợi ý cụ thể, sinh theo tình hình. Ví dụ: "Con hay học buổi tối, nhắc con mở Lexica 10 phút trước 21h", hoặc "Hỏi con nghĩa của 3 từ: …".
- **Lịch sử:** các tuần trước, gập lại.
- Nút "Nghe con đọc": để sau, cần đồng ý ghi âm (xem mục 0).

### 3.3 Báo cáo tuần tự động
- **Tối Chủ nhật** hệ thống soạn sẵn báo cáo tuần cho từng em: câu tóm tắt, việc làm được, gợi ý.
- **Sáng thứ Hai** giáo viên vào "Báo cáo tuần": xem lần lượt từng em, sửa hoặc thêm một câu nhận xét (có gợi ý nhanh: "Con chăm", "Cần đều hơn"…), bấm **"Duyệt"**.
- **Gửi:**
  - **Chép tất cả link vào tin nhắn Zalo**, mỗi phụ huynh một dòng;
  - hoặc **tự gửi qua email** nếu có email phụ huynh (Supabase gửi mail).
  
  Zalo OA tự động để sau, vì cần đăng ký và có phí.
- **Theo dõi:** phụ huynh đã mở link chưa (đếm lượt mở), giáo viên thấy "15/20 phụ huynh đã xem".

### 3.4 Dữ liệu và bảo mật
- **Bảng mới:**
  - `cortex_parent_links`: học viên, lớp, mã, PIN đã băm, ngày tạo, ngày thu hồi;
  - `cortex_weekly_reports`: lớp, học viên, tuần, nội dung đã soạn, nhận xét, đã duyệt, số lượt mở.
- **Đọc ghi:**
  - phụ huynh đọc qua hàm security definer theo mã (và PIN), chỉ trả nội dung đã duyệt;
  - giáo viên đọc ghi qua `classroom_can_teach`.
- **Soạn báo cáo:** một hàm SQL chạy theo lịch (`pg_cron` của Supabase), hoặc job của Cortex API khi API ổn.
- **Học viên đồng ý chia sẻ câu tự viết:** một công tắc trong Lexica, mặc định tắt.

### 3.5 PR
1. Bảng, hàm, trang phụ huynh `/p/<mã>`, nút lấy link.
2. Báo cáo tuần: soạn tự động, trang duyệt, gửi và chép link, đếm lượt xem.

### 3.6 Trạng thái (26/10/2026): đã làm, chưa có PR
- **Đã chốt với người dùng:**
  1. Báo cáo soạn ngay khi giáo viên mở tab "Báo cáo", từ số liệu của đúng tuần đã xong (thứ Hai đến Chủ nhật, `classroom_week_metrics`), nên mở hôm nào cũng ra cùng kết quả. Không dùng `pg_cron`.
  2. Email để sau. Chỉ làm "Chép link gửi Zalo".
  3. Không đưa câu con tự viết (giữ đúng quy ước riêng tư). Ví dụ thật lấy từ từ của bài lớp.
  4. PIN do từng lớp bật hoặc tắt, mặc định tắt. Mỗi link có PIN riêng, chỉ hiện một lần khi tạo.
- **SQL** (`packages/classroom/sql/classroom_parents.sql`):
  - bảng `cortex_parent_links`, `cortex_weekly_reports`; cột `cortex_classes.parent_pin`;
  - hàm cho giáo viên: `classroom_parents`, `classroom_parent_pin_set`, `classroom_parent_link_new`, `classroom_parent_link_revoke`, `classroom_week_metrics`, `classroom_report_approve`;
  - hàm cho phụ huynh: `parent_view` (anon).
  - Máy chủ lọc nội dung báo cáo (`cortex_clean_report`). Sai PIN 5 lần thì khoá 15 phút. Phụ huynh không thấy ghi chú riêng của giáo viên.
- **Soạn báo cáo** (thuần, có test `apps/teach/__tests__/parentReport.test.ts`):
  - `packages/classroom-lexica/parentWeek.ts`: phần của Lexica trong tuần (từ mới Nhớ, Dùng, Đời; từ của bài lớp làm ví dụ; âm hay nhầm kèm từ ví dụ; điểm đã xác minh);
  - `apps/teach/app/lib/parentReport.ts`: câu tóm tắt, tối đa 3 việc làm được, một gợi ý cho phụ huynh, lời nhắn của giáo viên.
  - Tuần đầu vào lớp chỉ nói tổng số; tuần không có số liệu thì nói thẳng là chưa có.
- **Teach:**
  - tab "Báo cáo" của lớp thành nơi duyệt: chọn tuần, xem trước đúng như phụ huynh thấy, lời nhắn có gợi ý nhanh, "Duyệt", "Duyệt N báo cáo còn lại", "Chép N link gửi Zalo", đếm phụ huynh đã xem;
  - khung "Phụ huynh" ở trang một em;
  - "Link cho phụ huynh" (PIN) trong cài đặt lớp;
  - trang `/p/<mã>` (không cần tài khoản, `noindex`).
- **Để sau:** gửi email, câu con tự viết (cần công tắc đồng ý trong Lexica), "Nghe con đọc", soạn tự động tối Chủ nhật bằng `pg_cron`, phần của Oratio trong báo cáo.

### 3.7 Buổi học và điểm danh (27/10/2026): đã làm, chưa có PR
Thêm theo yêu cầu người dùng ("teach vẫn thiếu tính năng"): việc giáo viên làm mỗi buổi, và làm số liệu ở chỗ khác tốt hơn.
- **Cách hiểu:**
  - lớp có **lịch học tuần** (mỗi thứ tối đa một buổi: giờ bắt đầu, độ dài);
  - một **buổi** là một ngày của lớp: có khi giáo viên điểm danh, ghi "buổi này học gì", hoặc báo nghỉ (nghỉ lễ);
  - mỗi em một dấu: Có mặt, Muộn, Vắng, Có phép.
- **SQL** (`packages/classroom/sql/classroom_attendance.sql`):
  - cột `cortex_classes.schedule`; bảng `cortex_class_sessions`, `cortex_attendance` (RLS bật, không policy);
  - hàm `classroom_schedule_set`, `classroom_attendance(lớp[], từ, đến)` (một lần gọi cho mọi lớp), `classroom_attendance_mark` (hôm nay hoặc 120 ngày trước), `classroom_session_set` (ghi chủ đề, báo nghỉ: xoá điểm danh buổi đó).
  - Chỉ giáo viên của lớp đọc ghi. Phụ huynh chỉ thấy qua báo cáo đã duyệt.
- **Quy tắc** (`packages/classroom/attendance.ts`, có test):
  - "Chưa điểm danh" chỉ tính từ buổi điểm danh đầu tiên và trong 14 ngày, nên giáo viên không dùng điểm danh thì không bị nhắc;
  - chỉ tính buổi có dấu của em (em vào lớp sau thì không bị tính vắng);
  - "vắng liền": số buổi Vắng liên tiếp đến buổi gần nhất; Có phép không tính và không ngắt chuỗi. Từ 2 buổi thì hiện ở Hôm nay (trong 21 ngày).
- **Teach:**
  - tab **Buổi học**: Sắp tới (nghỉ buổi này / vẫn học), Đã qua (đếm có mặt, nút Điểm danh hoặc Sửa), điểm danh buổi bù, lịch học, chuyên cần 8 tuần;
  - khung **Điểm danh**: mặc định cả lớp có mặt, bấm em ngoại lệ, ghi buổi học gì, lưu một lần;
  - **Trên lớp**: bấm tên em vắng như trước, rồi "Lưu" thành điểm danh hôm nay (giữ Muộn, Có phép đã có);
  - **Hôm nay**: "Buổi dạy hôm nay" ở đầu trang; "Nên để ý" có em vắng 2 buổi liền (chép tin cho phụ huynh, cho em) và lớp chưa điểm danh. Em đã có dự báo bỏ học thì dòng vắng gộp vào thẻ dự báo đó;
  - trang một em: khung **Trên lớp** (chấm từng buổi, số buổi có mặt);
  - **báo cáo phụ huynh**: "Tuần này con đi học đủ 3/3 buổi trên lớp và tự học ở nhà 5/7 ngày"; vắng không báo thì gợi ý cho phụ huynh nói đến việc học bù.
- **Để sau:** tỉ lệ đi học của từng lớp ở trang trung tâm; học viên tự điểm danh bằng mã trong Lexica; xuất bảng điểm danh ra Excel.

---

## 4. T2: Quiz trực tiếp "Đấu trường từ vựng" (kế hoạch kỹ)

### 4.1 Khác Kahoot ở đâu
Kahoot chỉ là trò chơi trong giờ; chơi xong là hết. Đấu trường của Cortex **nối vào việc học**:
- **Câu hỏi lấy từ chính từ của lớp:**
  - từ của bài giao;
  - từ cả lớp sắp quên (W4);
  - dạng câu của bài kiểm tra: chọn nghĩa, điền cụm, nghe, từ thật hay bịa, nghe rồi chọn câu đúng.
- **Chơi xong, từng em tự có bài ôn:**
  - từ em trả lời sai được đẩy vào hàng ôn của em trong Lexica;
  - từ em trả lời đúng nhanh được tính là một lần nhớ lại đúng (đi tiếp các bước Hiểu, Nhớ, Gặp, Dùng);
  - giáo viên không phải làm gì.
- **Giáo viên có ngay bảng phân tích:** câu nào cả lớp sai nhiều, em nào đoán bừa (trả lời quá nhanh và sai), từ nào nên giảng lại. Bấm một nút để mở trình chiếu (T1) đúng những từ đó.
- **Công bằng cho em yếu:** chế độ đội và chế độ "tiến bộ" bên dưới, để em yếu vẫn có cơ hội thắng, tránh tự ti.

### 4.2 Các chế độ chơi
| Chế độ | Luật | Dùng khi |
|---|---|---|
| **Cổ điển** | Ai cũng trả lời mọi câu; đúng và nhanh thì điểm cao; bảng xếp hạng sau mỗi câu, top 5 | Khởi động, ôn cuối giờ |
| **Đội** | Chia đội (dùng chia nhóm của T1, đồng đều trình độ); điểm đội là trung bình điểm thành viên, nên em yếu cũng góp sức; hiện thanh đua giữa các đội | Lớp đông, tránh em yếu bị lộ |
| **Sống sót** | Sai một câu là "bị loại" khỏi top, nhưng vẫn chơi tiếp để gỡ lại vị trí; còn lại ai là "người sống sót" | Cuối khoá, lớp mạnh |
| **Tiến bộ** | Điểm tính theo mức hơn **chính mình**: câu khó vượt trình độ (theo điểm từ vựng) được nhiều điểm hơn | Lớp chênh trình độ |

Bảng xếp hạng có thể **ẩn tên** (chỉ hiện top 3 với tên, còn lại hiện số), để không ai bị bêu.

### 4.3 Luồng chơi
1. **Giáo viên** (teach, máy chiếu) chọn nguồn câu hỏi (bài giao, từ sắp quên, tự chọn), số câu (10–20), chế độ, thời gian mỗi câu (10–30 giây), rồi bấm "Mở phòng".
2. **Máy chiếu** hiện mã phòng 6 số và mã QR, cùng danh sách em đã vào, cập nhật trực tiếp.
3. **Học viên** vào bằng một trong hai cách (xem mục 4.6):
   - mở Lexica → nút "Vào đấu trường", hoặc quét QR;
   - nhập mã ở trang `lexica…/play`.
4. **Mỗi câu:**
   - máy chiếu hiện câu hỏi to và đồng hồ; câu Nghe thì máy chiếu phát giọng cho cả lớp;
   - điện thoại học viên chỉ hiện 4 nút màu, chữ ngắn;
   - hết giờ hoặc mọi em đã trả lời thì máy chiếu hiện đáp án, số em chọn mỗi đáp án, rồi bảng xếp hạng;
   - điện thoại hiện đúng hay sai, điểm, hạng.
5. **Kết thúc:** bục vinh danh top 3 (có hiệu ứng), "Em tiến bộ nhất buổi", "Câu khó nhất"; điện thoại hiện "Em sai 4 từ, đã thêm vào bài ôn của em".
6. **Sau đó:** giáo viên xem bảng phân tích (mục 4.1), lưu buổi chơi vào lịch sử lớp.

### 4.4 Kỹ thuật
- **Thời gian thực:** Supabase Realtime.
  - Kênh `arena:<mã>`: *broadcast* cho sự kiện (câu mới, khoá câu, kết quả), *presence* cho danh sách người chơi.
  - Đã dùng Realtime cho Oratio nên dự án có sẵn.
- **Máy chủ là trọng tài:**
  - câu hỏi và đáp án nằm trong bảng `arena_questions`, chỉ hàm SQL đọc được;
  - học viên gửi câu trả lời qua hàm `arena_answer(phòng, câu, lựa chọn)`;
  - máy chủ ghi thời điểm, tính điểm theo thời gian máy chủ (không tin đồng hồ điện thoại), từ chối câu trả lời sau khi khoá.
  - Máy chiếu chỉ phát tín hiệu "mở câu" và "khoá câu", qua hàm SQL có kiểm tra quyền giáo viên.
- **Điểm:** đúng thì `1000 × (1 − 0.5 × thời gian dùng / thời gian cho phép)`; chuỗi đúng liên tiếp được thưởng nhỏ; chế độ Tiến bộ nhân thêm theo độ khó so với trình độ em.
- **Quy mô:** một phòng tới 60 em. Presence và broadcast của Supabase chịu được; mỗi câu chỉ có khoảng 60 lượt gọi hàm.
- **Mất mạng:** học viên vào lại phòng thì tiếp tục câu hiện tại. Máy chiếu tải lại trang thì lấy lại trạng thái từ bảng.
- **Nối vào Lexica:** khi kết thúc, hàm `arena_finish` ghi kết quả từng em vào bảng `arena_results`; Lexica của em đọc lần mở sau (hoặc qua Realtime) để thêm từ sai vào hàng ôn và tính lần nhớ đúng.
- **Bảng:** `arena_rooms`, `arena_players`, `arena_questions`, `arena_answers`, `arena_results`. Bảng bật RLS, chỉ đi qua hàm.

### 4.5 Rủi ro và cách xử lý
| Rủi ro | Cách xử lý |
|---|---|
| Wifi lớp yếu, trễ vài trăm ms | Tính điểm theo thời điểm máy chủ nhận; chênh trễ nhỏ so với 10–30 giây mỗi câu. Hiện "đã gửi" ngay trên điện thoại |
| Em không có điện thoại | Chơi theo đội, mỗi đội một máy; hoặc giáo viên bật "ghép đôi chung máy" |
| Em đoán bừa cho nhanh | Sai thì không có điểm; trả lời dưới 1 giây và sai nhiều lần thì giáo viên thấy trong bảng phân tích |
| Em yếu tự ti | Chế độ Đội và Tiến bộ, ẩn tên ngoài top 3, câu "em tiến bộ nhất" |
| Supabase Realtime giới hạn ở gói Free | Gói Free giới hạn kết nối đồng thời (khoảng 200); vài lớp chơi cùng lúc vẫn ổn, trung tâm lớn thì cần gói Pro (đã tính trong `BUSINESS_MODEL.md`) |

### 4.6 Cần quyết
1. **Học viên vào bằng gì?**
   - **Đề xuất:** qua **Lexica** (đã đăng nhập, đã ở lớp), vì như vậy mới nối được kết quả vào việc học (mục 4.1), và đây là lý do học viên mở Lexica.
   - Thêm một trang `play` nhập mã, cho khách hoặc em chưa có tài khoản: chơi được nhưng không lưu vào việc học.
2. **Chế độ nào làm trước?** Đề xuất: Cổ điển và Đội ở PR đầu; Sống sót và Tiến bộ ở PR sau.

### 4.7 PR
1. **T2a:** bảng và hàm SQL, luồng phòng (mở, vào, câu, khoá, kết thúc), màn hình máy chiếu, màn hình điện thoại trong Lexica, chế độ Cổ điển.
2. **T2b:** chế độ Đội, bảng phân tích cho giáo viên, đẩy từ sai vào hàng ôn, bục vinh danh.
3. **T2c:** chế độ Sống sót và Tiến bộ, trang `play` cho khách, lịch sử buổi chơi.

### 4.8 Trạng thái T2a (27/10/2026): đã làm, chưa có PR
- **Theo đề xuất ở 4.6:** học viên vào qua Lexica (đã đăng nhập, phải là học viên của lớp); chế độ Cổ điển trước.
- **SQL** (`packages/classroom/sql/classroom_arena.sql`, chạy sau `classroom_core.sql`):
  - bảng `cortex_arena_rooms`, `cortex_arena_questions`, `cortex_arena_players`, `cortex_arena_answers` (RLS bật, không policy);
  - giáo viên: `arena_open` (mỗi lớp một phòng đang chạy, mã 6 số, 3–30 câu, 10–60 giây), `arena_next`, `arena_lock`, `arena_finish`, `arena_host_state`;
  - học viên: `arena_open_rooms`, `arena_join`, `arena_state` (không có đáp án khi câu còn mở), `arena_answer`.
  - Điểm: đúng thì `1000 × (1 − 0.5 × thời gian / thời gian cho phép)`, cộng 50 cho mỗi câu đúng liền trước đó (tối đa 200). Trả lời trễ quá 1,5 giây sau hết giờ thì bị từ chối. Không trả lời thì mất chuỗi đúng.
- **Thời gian thực:** kênh Supabase Realtime `arena:<id phòng>` chỉ báo "có thay đổi" (không mang đáp án); hai bên gọi hàm SQL để lấy trạng thái, kèm hỏi lại mỗi 2,5–3 giây khi mất kết nối. Đồng hồ hai bên tính theo giờ máy chủ (`timeLeft`).
- **Câu hỏi** (`apps/teach/app/lib/arena.ts`, có test): xen kẽ "từ → chọn nghĩa" và "nghĩa → chọn từ"; đáp án sai lấy cùng cấp độ, cùng nhánh trước, không bao giờ có hai đáp án đúng. Nguồn: một bài giao, từ cả lớp sắp quên (W4), mọi bài của lớp, hoặc các từ khó của ván trước.
- **Teach** ("Trên lớp" → "Đấu trường", `components/arena/Arena.tsx`): chọn từ, số câu, giây mỗi câu, ẩn tên ngoài top 3 → phòng chờ (mã to, danh sách em đã vào) → câu hỏi (đồng hồ, số em đã trả lời, tự khoá khi hết giờ hoặc cả lớp đã trả lời) → đáp án, số em chọn từng ý, top dẫn đầu → bục vinh danh, "Câu khó nhất", "Chơi lại N từ khó".
- **Lexica** (`app/arena/`): trang `/arena` (một chạm vào phòng của lớp, hoặc nhập mã; link `?code=`), 4 nút màu có hình, "Đã gửi", đúng/sai và điểm sau khi khoá, hạng cuối ván; trang Lớp học có thẻ "Vào đấu trường" khi lớp đang mở phòng.

### 4.9 Trạng thái T2b (27/10/2026): đã làm, chưa có PR
- **Chế độ Đội** (2–4 đội, tên theo màu: Xanh lá, Cam, Xanh dương, Vàng):
  - Teach chia đều sức ngay ở phòng chờ (em mạnh nhất chia lần lượt qua lại giữa các đội: `arenaTeams`), có nút "Chia đều lại"; em vào sau vào đội ít người nhất (cả ở máy chủ khi đã bắt đầu);
  - điểm đội là **điểm trung bình** của thành viên; máy chiếu hiện thanh đua giữa các đội sau mỗi câu và đội thắng ở cuối; điện thoại hiện đội và hạng của đội.
  - SQL: `cortex_arena_rooms.teams`, `cortex_arena_players.team`, `arena_teams_set`, `arena_open(…, p_mode, p_teams)`.
- **Từ sai vào bài ôn** (`apps/lexica/app/lib/arenaReview.ts`, có test): khi ván kết thúc (và mỗi lần mở trang Lớp học), Lexica đọc `arena_my_results` (14 ngày):
  - từ đã học mà trả lời sai: ôn lại ngay (như trả lời sai trong phần Ôn);
  - từ đã học mà đúng nhanh (dưới 60% thời gian): tính là một lần nhớ đúng;
  - từ chưa học mà sai: vào thẻ mới của phiên Hôm nay;
  - mỗi ván chỉ áp một lần (`arenaApplied` trong store).
  - Điện thoại báo "Em sai N từ, đã thêm vào bài ôn của em".
- **Phân tích cho giáo viên** (cuối ván, ẩn sẵn vì máy chiếu đang bật): từng em đúng bao nhiêu câu, mất bao lâu mỗi câu, cờ "Đoán vội" (ít nhất 2 câu sai trả lời dưới 1,5 giây và chiếm từ một phần ba số câu: `guessers`).
- **Giảng lại:** nút "Giảng lại N từ" mở Trình chiếu từ với đúng các từ cả lớp sai nhiều (`/present/<lớp>?tool=slides&words=…`).
- **Còn lại cho T2c:** chế độ Sống sót, Tiến bộ; mã QR; trang `play` cho khách; lịch sử các ván; câu Nghe.

---

## 5. T3 và T5 (27/10/2026): đã làm, chưa có PR

### 5.1 T3: Giao bài thông minh và bài kiểm tra lớp
- **Gợi ý giao bài** (đầu tab "Bài giao", `apps/teach/app/lib/suggest.ts`, có test), mỗi gợi ý một lần bấm:
  - **từ cả lớp chưa vững**: từ của bài giao từ một tuần trước mà chưa tới nửa lớp nhớ (cần ít nhất 3 em có số liệu) → giao cả lớp ôn;
  - **ôn riêng cho từng em**: từ của lớp em sắp quên (W4 `atRisk`, ít nhất 3 từ) → mỗi em một bài riêng; bỏ qua em đã có bài ôn riêng trong tuần.
- **Bài kiểm tra lớp** (tab "Kiểm tra"; SQL `packages/classroom/sql/classroom_tests.sql`):
  - giáo viên chọn nguồn từ (một bài, mọi bài, từ cả lớp sắp quên), 10/20/30 câu, hạn nộp; câu hỏi như Đấu trường (từ ↔ nghĩa);
  - học viên làm trong Lexica (`/class/test/<id>`; thẻ "Bài kiểm tra" ở trang Lớp học): từng câu, lưu ngay khi chọn, nộp một lần; sau khi nộp mới thấy đáp án; từ sai vào bài ôn, câu đúng tính là nhớ đúng;
  - máy chủ giữ đáp án và chấm; bài đã đóng thì không làm tiếp nhưng xem được đáp án;
  - giáo viên thấy điểm từng em, ai chưa làm, câu sai nhiều nhất; "Giao ôn từ sai cho N em" (mỗi em đúng những từ em sai), "Giảng lại N từ", đóng/mở lại, xoá.

### 5.2 T5: Oratio trong Teach
- Phần đã có từ trước: giao chủ đề, câu hỏi, mục tiêu buổi/phút; band bạn luyện chấm; band mục tiêu của lớp.
- **"Luyện nói" trên lớp** (Trên lớp → Luyện nói, `components/present/Speaking.tsx`, `lib/speaking.ts` có test):
  - câu hỏi IELTS của Oratio theo Part và chủ đề, hoặc theo bài giao Oratio; không lặp câu trong buổi;
  - đồng hồ như đi thi: Part 1 30 giây, Part 2 một phút chuẩn bị rồi hai phút nói (có tiếng báo), Part 3 60 giây; thẻ đề Part 2 tách thành đề và các ý;
  - ghép cặp: em mạnh với em đang cố gắng, một em nói một em chấm, "Đổi vai";
  - tiêu chí chấm: 4 tiêu chí với mô tả band (5–8, mặc định theo band mục tiêu của lớp). Mô tả band và cách đọc thẻ đề nay dùng chung ở `packages/classroom-oratio/descriptors.ts` (Oratio dùng lại).
- **Báo cáo phụ huynh có phần Oratio**: "Con luyện nói tiếng Anh 3 buổi (25 phút) với bạn học trên Oratio"; tuần không nói thì gợi ý phụ huynh nhắc con (`oratioWeek`).

### 5.3 Để sau
- T2c: chế độ Sống sót, Tiến bộ; mã QR; trang `play` cho khách; lịch sử các ván; câu Nghe.
- Bài kiểm tra: giới hạn thời gian, câu Nghe, xuất bảng điểm ra Excel.
- Oratio: dự báo cho kỹ năng nói (như W4), giáo viên nghe bài ghi âm (cần học viên đồng ý chia sẻ).
- "Nghe con đọc" cho phụ huynh, khi đã có đồng ý ghi âm.
