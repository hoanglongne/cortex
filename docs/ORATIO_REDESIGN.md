# Oratio: đại cải tổ

Chủ dự án đã duyệt ngày 2026-10-18, kèm 4 quyết định ở mục 8. File này là nguồn gốc cho mọi quyết định về Oratio, giống `LEXICA_DIRECTION.md` cho Lexica. Đang làm P0.

## 1. Chẩn đoán: vì sao Oratio hiện tại yếu

| Vấn đề | Biểu hiện |
| --- | --- |
| Không có lý do để mở app mỗi ngày | Giá trị duy nhất là một cuộc gọi 30 phút, mà cuộc gọi chỉ có khi đúng lúc có người online |
| Thanh khoản (cold start) | Ít người → chờ lâu → bỏ app → càng ít người. Luyện một mình chỉ là chỗ chờ, chưa phải sản phẩm |
| Học được ít | Sau buổi chỉ có 4 con số do một bạn cùng trình độ chấm. Không ghi âm, không nghe lại, không biết sai ở đâu, không có lần thử thứ hai |
| Điểm không đáng tin | Người chấm chưa được hướng dẫn chấm, không có gì kiểm chứng; band nhảy theo cảm tính |
| UI "quê" | Nền đen + gradient xanh + hạt bay + phát sáng: kiểu template "AI SaaS" chung chung, không nói gì về IELTS hay về việc nói. Mỗi màn một kiểu, nhiều chữ to vô nghĩa, trang trí thay cho thông tin |
| Không nối với Cortex | Lexica dạy từ, Oratio không biết người học có từ gì, cũng không trả lại gì cho Lexica |

## 2. Mục đích

**Oratio là phòng tập IELTS Speaking có người thật nghe và chấm, mỗi ngày, miễn phí.**

Người học Việt không thiếu câu hỏi mẫu hay video bài mẫu. Thứ họ thiếu là ba việc mà sách và AI không cho được:

1. **Nói trước một người thật** mà không sợ: kỹ năng thi Speaking phần lớn là chịu được áp lực bị nghe. Lo âu khi nói ngoại ngữ là rào cản đã được nghiên cứu kỹ (Horwitz, Horwitz & Cope 1986), và cách giảm là tiếp xúc tăng dần, không phải tránh né.
2. **Hiểu giám khảo nghe gì**: người tự chấm người khác theo tiêu chí sẽ hiểu tiêu chí và tự nói tốt hơn. Đây là lợi ích đã được ghi nhận của peer assessment (Topping 1998).
3. **Nói lại cùng một câu cho tới khi tốt hơn**: lặp lại cùng một bài nói làm tăng độ trôi chảy và độ phức tạp (task repetition, Bygate 2001; kỹ thuật 4/3/2 của Maurice 1983 và Nation).

Oratio làm đúng ba việc này, theo đúng format thi.

## 3. Lợi thế cạnh tranh

| Đối thủ | Họ có | Họ thiếu, Oratio có |
| --- | --- | --- |
| App AI chấm Speaking | Có mặt mọi lúc, chấm ngay | Không có người thật nên không luyện được áp lực; "band AI" khó tin; thường thu phí |
| Gia sư 1-1 (Cambly, Preply, trung tâm) | Người thật, chuyên môn | Đắt, phải hẹn lịch, mỗi tuần vài buổi |
| Nhóm Facebook / Discord tìm bạn luyện | Người thật, miễn phí | Tự hẹn, tự tìm câu hỏi, không có format, không có điểm, không lưu lại gì |
| HelloTalk / Tandem | Người thật | Không theo format IELTS, không chấm |

**Lợi thế cốt lõi (khó sao chép): mạng lưới người chấm được hiệu chuẩn.** Mỗi câu trả lời được vài người học chấm. Mỗi người chấm có "độ chuẩn" đo bằng các câu đã biết band (câu neo do giáo viên chấm) và bằng mức đồng thuận với người khác. Điểm hiển thị là khoảng band kèm độ tin cậy, không phải một con số cảm tính. Càng nhiều người dùng thì điểm càng chuẩn và dữ liệu càng giá trị. Đối thủ AI không có mạng người, nhóm Facebook không có hệ thống.

Hai lợi thế phụ:
- **Hệ Cortex**: từ học ở Lexica được "nghe thấy" trong câu trả lời Oratio thì lên bước Dùng ở Lexica. Oratio gợi ý từ Lexica hợp với chủ đề câu hỏi. Không app IELTS nào nối học từ với nói như vậy.
- **Trung tâm (B2B)**: Lexica đã có lớp học. Giáo viên giao bài nói về nhà, học viên ghi âm, bạn cùng lớp chấm chéo trước, giáo viên chỉ chấm các câu được chọn. Chấm Speaking về nhà là việc giáo viên Việt Nam đang làm thủ công qua Zalo.

## 4. Triết lý thiết kế: "Phòng thi lúc tối"

Một căn phòng yên, một tấm thẻ đề, một chiếc đèn ON AIR. Mọi thứ khác đều thừa.

5 nguyên tắc, mọi quyết định giao diện phải qua:

| Nguyên tắc | Trong sản phẩm |
| --- | --- |
| 1. Một việc mỗi màn | Màn trả lời chỉ có câu hỏi, đồng hồ và nút ghi. Không nav, không số liệu phụ |
| 2. Chữ là giao diện | Câu hỏi là nhân vật chính: chữ serif lớn, như in trên giấy thi. Không icon trang trí, không gradient |
| 3. Bình tĩnh trước, áp lực khi mình chọn | Mặc định không có đồng hồ đếm ngược. Áp lực (đồng hồ, người thật, chấm điểm) chỉ xuất hiện khi người học bước vào chế độ đó |
| 4. Chỉ hiện số liệu thật | Không con số giả, không hạt bay, không phát sáng. Chuyển động chỉ để báo trạng thái: đang ghi, đang phát, người kia đang nói |
| 5. Người thật ở trung tâm | Tên, giọng, nhận xét của người thật được trình bày trang trọng như một bài chấm, không như avatar game |

### Ngôn ngữ hình ảnh

- **Thuộc họ Cortex**: dùng chung nền và bộ chữ với Lexica (`apps/lexica/app/globals.css`) để cả hệ là một gia đình:
  - Nền và chữ: `bg #0E0F11`, `surface #16171A`, `ink #EDEEF0`, `muted #9A9DA3`, `line #26282D`.
  - Chữ giao diện: Space Grotesk. Số và nhãn: JetBrains Mono.
- **Màu riêng của Oratio: hổ phách ON AIR** (đề xuất `#FFB23F`), màu đèn phòng thu. Màu này chỉ dùng cho trạng thái "đang nói / đang ghi / đang phát sóng" và cho nút chính. Lexica là xanh chanh (học), Oratio là hổ phách (nói). Đỏ chỉ dùng cho lỗi.
- **Chữ cho nội dung nói** (câu hỏi, transcript, nhận xét): một font serif có hỗ trợ tiếng Việt, ví dụ Literata hoặc Lora (kiểm tra subset `vietnamese` trên Google Fonts trước khi chọn). Serif tạo cảm giác "đề thi", tách nội dung khỏi giao diện.
- **Hai hình ảnh đặc trưng**:
  1. **Thẻ đề**: một tấm thẻ màu giấy (sáng hơn nền một bậc), góc vuông, có dòng kẻ mảnh, trên cùng ghi "PART 2 · CUE CARD" bằng mono. Mọi câu hỏi trong app đều nằm trên thẻ này, Part 1/3 thì thẻ gọn hơn.
  2. **Đèn ON AIR và sóng âm**: khi ghi âm hoặc khi người kia đang nói, một đèn hổ phách nhỏ sáng lên kèm dạng sóng thật lấy từ micro (Web Audio). Không còn thanh nhảy giả.
- **Bỏ hẳn**: gradient xanh, hạt bay, glow, vòng tròn nhấp nháy, emoji, chữ "Partner Found!" kiểu game, các huy hiệu trang trí.
- **Bố cục**: điện thoại là chính (một cột, nút chính ở dưới tầm ngón cái). Trên máy tính thì nội dung tối đa khoảng 720px ở giữa, và phần "trong cuộc gọi" chia hai cột: thẻ đề bên trái, ghi chú và chấm bên phải.
- **Chuyển động**: 150–200 ms, chỉ để chuyển trạng thái. Tôn trọng `prefers-reduced-motion` (đã có).

### Hệ component (làm một lần, dùng khắp app)

`CueCard`, `OnAirLamp`, `LiveWaveform`, `RecordButton` (giữ để ghi / chạm để ghi), `AnswerPlayer` (phát lại, tua, đánh dấu chỗ ngập ngừng), `BandRange` (ví dụ "6.0–6.5" kèm thanh độ tin cậy), `CriterionRow` (4 tiêu chí), `RubricSheet` (thang chấm rút gọn tiếng Việt), `Timer` (đếm lên / đếm xuống, có chế độ ẩn), `Empty`, `ErrorState`, `Toast`, `Sheet` (bottom sheet), `TabBar`.

## 5. Hệ thống sản phẩm: một đơn vị, ba chế độ

**Đơn vị chung là một "câu trả lời"**: một câu hỏi, một bản ghi âm, các chỉ số máy đo, và (tuỳ chọn) điểm của người chấm. Mọi chế độ đều tạo ra câu trả lời, và mọi tiến bộ đều được tính trên câu trả lời. Nhờ vậy không chế độ nào là ngõ cụt.

Ba chế độ, xếp theo mức áp lực tăng dần (đúng nguyên tắc 3):

| Chế độ | Cần ai | Áp lực | Vai trò |
| --- | --- | --- | --- |
| **Tập** (Solo) | Không ai | Thấp | Luyện mỗi ngày, luôn có sẵn. Ghi âm, nghe lại, nói lại |
| **Chấm chéo** (Async) | Người khác, không cần cùng lúc | Vừa | Gửi câu trả lời cho người khác chấm; chấm người khác để được chấm. **Giải quyết bài toán thanh khoản** |
| **Phòng thi** (Live) | Một người, cùng lúc | Cao | Thi thử trọn bộ với người thật, có giờ cố định trong ngày để dễ gặp nhau |

### 5.1 Tập: vòng lặp nói lại

1. App đưa 1 câu hỏi (theo chủ đề người học chọn hoặc ngẫu nhiên). Nút "Hôm nay" chạy 3 câu: Part 1, Part 2, Part 3.
2. Người học ghi âm câu trả lời.
3. **Máy đo trên thiết bị, không cần API trả phí**:
   - Transcript bằng Whisper chạy trong trình duyệt (transformers.js, model tiny/base tải một lần, chạy trong Web Worker). Không tải audio lên đâu.
   - Từ transcript và âm thanh, tính các chỉ số:
     - tốc độ nói (từ/phút);
     - số quãng ngừng dài (> 1 giây, phát hiện bằng năng lượng âm thanh);
     - độ dài trung bình một mạch nói (số từ giữa hai quãng ngừng; đây là thước đo độ trôi chảy hay dùng trong nghiên cứu);
     - từ đệm (um, uh, like, you know…);
     - độ đa dạng từ;
     - các từ Lexica đã dùng.
   - Chỉ hiện chỉ số và giải thích. **Không bao giờ quy ra band**: máy không chấm điểm, người chấm điểm.
4. **Nói lại**: nút "Nói lại câu này". Lần hai có mục tiêu cụ thể, ví dụ "ít hơn 3 quãng ngừng" hoặc "dùng 1 từ Lexica: *mitigate*". Hiện so sánh lần 1 với lần 2. Đây là khoảnh khắc "thấy mình tiến bộ" trong 2 phút. Biến thể 4/3/2 dành cho Part 2: nói cùng bài trong 2 phút, 1 phút 30, rồi 1 phút.
5. Chọn câu tốt nhất để gửi sang Chấm chéo (tuỳ chọn).

### 5.2 Chấm chéo: hiệu chuẩn và trao đổi công bằng

- **Gửi**: người học chọn một câu trả lời (tốt nhất là Part 2) để gửi đi. Bản ghi được lưu ở Supabase Storage (bucket riêng tư, link có hạn, tự xoá sau 30 ngày), chỉ khi người học đồng ý cho từng câu.
- **Chấm**: mở hàng chờ, nghe tối đa 2 phút, chấm 4 tiêu chí theo `RubricSheet` (thang rút gọn bằng tiếng Việt, tự viết lại theo ý của band descriptors công khai, không chép nguyên văn), chọn 1–2 nhận xét có sẵn, và có thể ghi 1 câu góp ý.
- **Trao đổi**: chấm 2 câu thì được 1 lượt gửi. Mỗi tài khoản mới được 1 lượt miễn phí để có điểm đầu tiên ngay.
- **Hiệu chuẩn**:
  - Khoảng 1 trong 5 câu được chấm là **câu neo** đã có band chuẩn (do giáo viên chấm), người chấm không biết câu nào là câu neo.
  - Độ chuẩn của người chấm là tỉ lệ chấm lệch không quá ±0.5 band so với câu neo, cộng thêm mức đồng thuận với số đông.
  - Điểm cuối của một câu trả lời là trung bình có trọng số theo độ chuẩn. Hiện điểm dưới dạng khoảng band kèm độ tin cậy, ví dụ "6.0–6.5 · 4 người chấm".
  - Người chấm thấy độ chuẩn của mình tăng dần. Đó là động lực, và cũng là cách họ học tiêu chí.
- **Thời gian chờ**: câu gửi đi có điểm trong vài giờ. Hàng chờ ưu tiên câu chờ lâu nhất và câu của người hay chấm cho người khác.

### 5.3 Phòng thi: live, có giờ

- **Giờ thi chung** (ví dụ 20:30–22:00 mỗi tối): người dùng được nhắc trước. Gom người vào cùng một khung giờ thì luôn ghép được người. Ngoài giờ thi vẫn ghép được, nhưng app nói rõ là ít người.
- **Format**: giữ đúng format IELTS thật (một giám khảo, một thí sinh, Part 1 khoảng 4–5 phút, Part 2 có 1 phút chuẩn bị và 2 phút nói, Part 3 khoảng 4–5 phút), sau đó đổi vai. Giám khảo có kịch bản (lời mở đầu, cách chuyển phần) để đóng vai cho giống thật.
- **Mỗi người tự ghi âm phần nói của mình** (track micro của chính mình, lưu trên máy, chỉ tải lên nếu người đó gửi sang Chấm chéo). Như vậy sau buổi có transcript và chỉ số như ở chế độ Tập, không cần ghi âm người kia.
- **Chấm sau buổi**: dùng `RubricSheet` như Chấm chéo, và điểm Live cũng được tính trọng số theo độ chuẩn của người chấm.

### 5.4 Tiến bộ (thay cho Profile, Achievements, Leaderboard)

- Một màn duy nhất trả lời câu hỏi "mình đang ở đâu":
  - khoảng band hiện tại theo từng tiêu chí;
  - đường xu hướng theo tuần;
  - chỉ số máy đo theo thời gian (tốc độ, quãng ngừng);
  - số phút đã nói;
  - từ Lexica đã dùng trong khi nói.
- **Hồ sơ người chấm**: số lượt chấm, độ chuẩn.
- **Bỏ** leaderboard toàn cục, vì xếp hạng theo band khuyến khích chấm gian. Nếu cần yếu tố cộng đồng thì dùng bảng của lớp (B2B), hoặc "tuần này cả cộng đồng đã nói X phút".
- Thành tích chỉ giữ vài cột mốc có ý nghĩa (câu trả lời đầu tiên, lần nói lại đầu tiên, lần đầu được chấm, độ chuẩn đạt mức "tin cậy"), hiện như dòng thời gian chứ không phải một bức tường huy hiệu.

### 5.5 Nối với Cortex

- **Lexica → Oratio**: trước khi trả lời, gợi ý tối đa 3 từ người học đang có ở Lexica (bước Nhớ hoặc Gặp) hợp với chủ đề câu hỏi.
- **Oratio → Lexica**: từ Lexica xuất hiện trong transcript thì từ đó lên bước Dùng ở Lexica, qua API sẵn có của Cortex hub (`/actions/log` hoặc một endpoint riêng).
  - Cần Oratio dùng chung Supabase project với hub, hoặc có cơ chế xác thực riêng giữa hai bên.
- **Lớp học**: dùng lại `migration_classes.sql` của Lexica. Giáo viên giao "bài nói" (một bộ câu hỏi và hạn nộp), xem câu trả lời của cả lớp, chấm nhanh những câu được chọn, và thấy độ chuẩn của từng học viên khi chấm chéo.

### 5.6 Điều hướng mới

Thanh dưới có 4 tab:
- **Luyện**: nút Hôm nay; ba chế độ Tập, Chấm chéo, Phòng thi; giờ thi sắp tới.
- **Chấm**: hàng chờ chấm, số lượt gửi còn lại.
- **Tiến bộ**.
- **Tôi**: tài khoản, lớp, cài đặt.

Màn trả lời và màn cuộc gọi chiếm toàn màn hình, không có thanh dưới (nguyên tắc 1).

## 6. Lộ trình

Mỗi pha đều phát hành được và tự đứng được.

| Pha | Nội dung | Xong khi |
| --- | --- | --- |
| **P0. Nền móng thiết kế** (1–1.5 tuần) | Tokens dùng chung với Lexica, bộ font, các component ở mục 4, thanh 4 tab, làm lại Auth và Home theo hệ mới, bỏ toàn bộ trang trí cũ | Mọi màn dùng tokens; không còn gradient, hạt bay hay glow; Lighthouse a11y ≥ 95 trên điện thoại |
| **P1. Tập + nói lại** (2 tuần) | Bảng `answers`, ghi âm bằng `RecordButton`, `AnswerPlayer`, Whisper chạy trên máy (Web Worker, tải model khi người dùng đồng ý), các chỉ số, vòng nói lại, 4/3/2 cho Part 2, nút Hôm nay | Người mới ghi được câu đầu tiên trong vòng 2 phút sau khi đăng ký; lần nói lại hiện so sánh chỉ số |
| **P2. Chấm chéo + hiệu chuẩn** (2–3 tuần) | Storage riêng tư, đồng ý từng câu, hàng chờ chấm, `RubricSheet`, chấm 2 được gửi 1, câu neo, độ chuẩn, điểm có trọng số, `BandRange` | Câu gửi đi có ≥ 3 lượt chấm trong 24 giờ (khi có ≥ 50 người dùng hoạt động); có độ chuẩn cho người chấm |
| **P3. Phòng thi mới** (1.5–2 tuần) | Giờ thi chung, nhắc trước (web push hoặc email), kịch bản giám khảo, timer theo format thật, tự ghi âm phần mình, chấm bằng rubric, giao diện ON AIR | Tỉ lệ ghép được trong giờ thi ≥ 80%; buổi Live tạo câu trả lời có transcript |
| **P4. Tiến bộ + Cortex** (1.5 tuần) | Màn Tiến bộ, gợi ý từ Lexica, đẩy bước Dùng sang Lexica, bỏ leaderboard toàn cục | Từ Lexica dùng trong Oratio lên bước Dùng ở Lexica |
| **P5. Lớp học** (2 tuần) | Bài nói giao về nhà, xem câu trả lời của lớp, giáo viên chấm nhanh, báo cáo tuần | Một giáo viên giao bài, cả lớp nộp, và có điểm chấm chéo |

Các con số cần đo từ P1:
- tỉ lệ ghi được câu đầu tiên trong ngày đầu;
- số câu trả lời trên mỗi người mỗi tuần;
- tỉ lệ nói lại;
- tỉ lệ quay lại sau 7 ngày (D7);
- thời gian chờ có điểm (P2);
- độ chuẩn trung bình của người chấm (P2);
- tỉ lệ ghép được trong giờ thi (P3).

## 7. Rủi ro và cách xử lý

| Rủi ro | Cách xử lý |
| --- | --- |
| Whisper trong trình duyệt nặng hoặc chậm trên điện thoại yếu | Model tiny (~40 MB) là mặc định, chỉ tải khi người dùng đồng ý, có thể tắt. Không có transcript thì vẫn còn chỉ số quãng ngừng và độ dài (lấy từ âm thanh). Web Speech API của Chrome là phương án dự phòng nhưng gửi audio cho Google, nên phải nói rõ với người dùng |
| Không có câu neo chuẩn | Bắt đầu bằng đồng thuận số đông. Cần 1–2 giáo viên chấm khoảng 60 câu neo (20 câu cho mỗi Part, trải từ band 4 đến 8) |
| Quyền riêng tư của giọng nói | Đồng ý cho từng câu, xoá sau 30 ngày, có nút xoá ngay, không bao giờ công khai. Ghi âm Live chỉ lấy giọng của chính mình |
| Chấm ẩu hoặc chấm phá | Câu neo phát hiện người chấm ẩu; người có độ chuẩn thấp bị giảm trọng số và không được tính cho lượt gửi. Có nút báo cáo câu trả lời và báo cáo nhận xét |
| Format IELTS và bản quyền | Không dùng logo, không chép nguyên văn band descriptors hay đề thật đã công bố; câu hỏi tự soạn theo dạng phổ biến (bộ hiện có khoảng 300 câu) |
| Làm quá nhiều cùng lúc | Mỗi pha phát hành riêng. P0 và P1 đã đủ khác biệt để ra mắt lại |

## 8. Quyết định (đã chốt 2026-10-18)

1. Màu ON AIR hổ phách, dùng chung nền và bộ chữ với Lexica: **có**.
2. Lưu ghi âm trên Supabase cho Chấm chéo (đồng ý từng câu, xoá sau 30 ngày): **có**.
3. Câu neo: chủ dự án có giáo viên IELTS quen, nhờ chấm khoảng 60 câu (20 câu cho mỗi Part, band 4–8) khi bắt đầu P2.
4. Giờ thi chung: 20:30–22:00 mỗi tối, thêm 12:00–13:00 thứ Bảy và Chủ nhật (`src/lib/exam-hours.ts`).

## 9. Áp dụng hệ thiết kế (cho người code)

- **Token và font**:
  - Token nằm ở `src/app/globals.css`, gồm các lớp: `bg`, `surface`, `surface-2`, `surface-3`, `paper`, `line`, `line-strong`, `ink`, `ink-2`, `muted`, `subtle`, `onair`, `onair-soft`, `on-onair`, `good`, `danger`, `danger-soft`.
  - Font: `font-sans` (Space Grotesk), `font-mono` (JetBrains Mono), `font-serif` (Literata).
  - Không dùng màu Tailwind có sẵn như `zinc-*`, `blue-*`, `emerald-*`, `amber-*`, cũng không dùng mã hex trong component.
- **Component** (`src/components/ui/`):
  - `button.tsx`: variant primary, secondary, ghost, danger, link.
  - `card.tsx`: `Card`, `Label`, `Stat`, `Notice`, `EmptyState`.
  - `cue-card.tsx`: `CueCard`, dùng cho mọi câu hỏi.
  - `on-air.tsx`: `OnAirLamp` và `LiveWaveform` (vẽ từ `MediaStream` thật).
  - `timer.tsx`: `Part2Timer`, `useElapsed`, `formatClock`.
  - `band.tsx`: `BandRange`, `CriterionRow`, `CRITERION_LABELS`.
  - `shell.tsx`: `TabShell` cho 4 tab, `FlowShell` cho màn toàn màn hình, `Wordmark`.
- **Màn mẫu**: `src/components/HomeScreen.tsx`.
- **Quy tắc**:
  - Mỗi màn có tối đa một nút `primary`.
  - Câu hỏi, transcript và nhận xét viết bằng `font-serif`; con số dùng `font-mono` kèm class `tabular`.
  - Không gradient, không glow, không blur trang trí, không hạt bay, không emoji, không icon trang trí lớn.
  - Chuyển động chỉ để báo trạng thái (`animate-onair`, `animate-enter`).
  - Bố cục mobile trước, chạy được ở 320px; khi màn rộng thì nội dung tối đa `max-w-3xl` (tab) hoặc `max-w-2xl` (flow).
  - Chữ giao diện là tiếng Việt, giữ thuật ngữ IELTS bằng tiếng Anh.

## 10. Hướng D (đã chốt 2026-10-18): thay cho mục 4

Sau 4 vòng mockup, chủ dự án chọn **hướng D: "gọn như Linear, vui như Duolingo" cùng nhân vật Ơ** thay cho "Phòng thi lúc tối". Canvas: https://claude.ai/artifact/AQqgq9CL9RUfthakUB6NEt (hàng D, D2, D3 và Web).

- **Nền tảng**: Oratio là web responsive, cài được thành app qua PWA.
  - Điện thoại: thanh tab dưới đáy.
  - Máy tính: thanh bên.
- **Màu**: sáng là mặc định, có tối và "Theo máy".
  - Chính: cam "giọng nói" `#FF5A1F`, có gờ đáy `#D9440F`.
  - Mực: `#121320`.
  - Phụ: xanh lá `#2BC48A` (đúng, xong), xanh tím `#5B63D3` (nghe, Lexica), vàng `#FFC53D` (chuỗi ngày).
  - Nền tối: `#0E0F1A`, thẻ `#14162A`.
- **Chữ**: Be Vietnam Pro (400–800). Không dùng serif.
- **Hình khối**: bo góc 14–22px, viền 1px `#ECECF1`. Nút chính có gờ đáy kiểu phím bấm.
- **Ơ**: một cục bông trắng có móc chữ ơ trên đầu, nét vẽ tay. Có 5 trạng thái: `idle`, `talk`, `happy`, `nervous`, `listen`.
  - Ơ nói những câu lấy từ dữ liệu thật, không bịa.
  - Tắt được trong mục Tôi.
- **Chỉ hiện tính năng có thật**: tab Chấm chéo chỉ xuất hiện khi P2 xong. Các số liệu trên mockup chỉ để minh hoạ.

### Kế hoạch code (đợt này)

1. **Nền**: token sáng/tối trong `globals.css` (`data-theme` trên `<html>`, mặc định theo máy), font Be Vietnam Pro, component `Character` (Ơ), cập nhật `Button`/`Card`/shell.
2. **Shell responsive**: `TabShell` có tab dưới trên điện thoại và thanh bên trên máy tính (Luyện, Lịch sử, Tiến bộ, Tôi), kèm nút cài app.
3. **PWA**: `manifest.webmanifest`, icon Ơ 192/512, service worker tối thiểu, nút "Cài Oratio lên máy" (`beforeinstallprompt`; trên iOS thì hướng dẫn "Thêm vào màn hình chính").
4. **Làm quen** (lần đầu): Ơ hỏi mức độ tự tin, rồi chọn band mục tiêu (lưu vào profile) và gợi ý cách bắt đầu.
5. **Luyện**: Ơ chào bằng câu lấy từ dữ liệu thật, thẻ "Buổi tập hôm nay" Part 1–2–3, thẻ Phòng thi (tối, sáng lên khi đang trong giờ thi), nhận xét gần đây.
6. **Tập một mình**: thẻ đề có gạch đầu dòng tick được, ghi âm (phím Space), đồng hồ Part 2, Ơ đang nghe.
   - Màn **Xong câu**: thời gian nói và **số lần ngừng dài** đo trên máy từ bản ghi (Web Audio, không cần API), so sánh lần trước với lần này, nút "Nói lại".
7. **Phòng thi**: đang tìm (Ơ nghe, người đang chờ), đã ghép, trong phòng (câu hỏi lớn, phím Enter, sóng âm, **ô ghi chú để chấm**), chấm bạn (hàng 1–9 kèm mô tả band, ghi chú được mang sang), xong buổi.
8. **Tiến bộ**: band và biểu đồ theo thời gian từ điểm được chấm (server action mới), 4 tiêu chí, Ơ gợi ý tiêu chí yếu nhất, số liệu tổng. **Lịch sử**, **Tôi** (giao diện Sáng / Tối / Theo máy, bật tắt Ơ, cài app), **Bảng giờ nói**, **Bạn luyện cùng**, **Đăng nhập**.

Chưa làm trong đợt này: Chấm chéo (P2), transcript/Whisper và từ Lexica trong câu trả lời (P1 phần 2), lọc lịch sử theo tập một mình (chưa lưu buổi tập), tab "Lớp tôi".

### Đợt 2 (2026-10-19): P1 phần 2 và P2

- Bảng `answers`, `answer_reviews`, `review_claims` (`apps/oratio/supabase/migration_2026_10_answers.sql`), bucket riêng tư `oratio-answers`. Người dùng chỉ đọc dòng của mình; server ghi sau khi kiểm tra.
- Tập một mình: lưu mỗi lần nói, chép lời bằng Whisper tiny trên máy (`public/whisper-worker.js`, tải model khi người dùng bật), chỉ số từ transcript, gợi ý và nhận diện từ Lexica, mục tiêu khi nói lại, 4/3/2 cho Part 2, gửi nhờ chấm.
- Chấm chéo: tab Chấm, hàng chờ công bằng có câu neo ẩn, `RubricSheet` band 1–9, độ chuẩn người chấm (câu neo + đồng thuận), điểm có trọng số hiện bằng `BandRange`, chấm 2 được gửi 1 (câu đầu miễn phí).
- Câu neo: `node scripts/import-anchors.mjs <thư mục>` (xem đầu file). Bản ghi gửi đi tự xoá sau 30 ngày (`/api/cron/expire-audio`, cần `CRON_SECRET` trên Vercel).
- Lexica: từ nói trong Oratio lên bước Dùng (`apps/lexica/app/lib/oratioSync.ts`).
- Lịch sử lọc Phòng thi / Tập một mình; Tiến bộ có Máy đo theo tuần, từ Lexica đã nói, hồ sơ người chấm, cột mốc §5.4.

Còn lại: P3 (Phòng thi tự ghi âm phần mình để có transcript, nhắc giờ thi), bảng xếp hạng toàn cục vẫn giữ.
