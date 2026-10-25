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

**Thứ tự làm:** T1 → W4 → T4 → T2.

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

---

## 5. Để sau
- **T3** giao bài thông minh và bài kiểm tra lớp.
- **T5** Oratio trong teach.
- **"Nghe con đọc"** cho phụ huynh, khi đã có đồng ý ghi âm.
