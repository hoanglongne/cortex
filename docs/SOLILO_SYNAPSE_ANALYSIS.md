# Solilo và Synapse: phân tích và quyết định (31/10/2026)

Liên quan: issue #76. Đã đọc `apps/solilo`, `apps/synapse`, module `synapse` của `cortex-core-api`, và đối chiếu với Oratio, Lexica, Studio. Phần "ý tưởng cho Writing và Listening" ở mục 5 trả lời yêu cầu "nếu không cứu được thì đề xuất luyện viết, luyện nghe".

> **Quyết định của chủ dự án (31/10/2026):** Solilo gộp vào Oratio (đúng như dưới đây). **Synapse giữ riêng** (lựa chọn B ở mục 3.3, không phải A); kế hoạch phát triển ở `docs/SYNAPSE_PLAN.md`.

## 1. Kết luận ngắn

| Dự án | Đề xuất | Lý do một dòng |
|---|---|---|
| **Solilo** | **Gộp vào Oratio rồi dừng.** Rút ba thứ đáng giữ | Chức năng chính (một mình luyện Part 2) đã có và mạnh hơn trong Oratio Tập. Còn lại ba ý hay: nhận từ đệm theo thời gian thực, tự chấm theo rubric có lời dẫn, ngôn ngữ giao diện |
| **Synapse** | **Đóng băng, không dừng.** Lấy "kịch bản soạn sẵn" làm chế độ truyện trong Lexica, chạy bằng nội dung dựng sẵn thay vì gọi AI mỗi lượt | Ý tưởng đúng (học cụm động từ qua chọn lựa có hậu quả) nhưng cách chạy (AI mỗi lượt, 4 lớp dự phòng) đắt, mong manh, và đứng riêng một app không ai mở mỗi ngày |
| **Module `synapse` ở API** | **Không xoá.** Studio đang nhập hằng số `DEFAULT_GEMINI_MODEL` từ file của nó | Xoá sẽ làm Studio lỗi. Chuyển hằng số sang nơi chung rồi mới thu gọn được |

Mình đề nghị **dừng đầu tư thêm vào cả hai app riêng**, trong khi nội dung và ý tưởng của chúng được tái dùng ở nơi người học thật sự có mặt (Oratio, Lexica).

## 2. Solilo

### 2.1 Hiện trạng (đối chiếu code)

- Mô phỏng IELTS Speaking Part 2: 1 phút chuẩn bị có ô ghi chú, 2 phút ghi âm có sóng âm, sau đó **tự chấm 4 tiêu chí bằng thanh trượt**, ra band trung bình và một nút sang Oratio.
- 3.567 dòng TypeScript, một trang duy nhất, máy trạng thái 5 pha (`IDLE`, `PREPARATION`, `RECORDING`, `EVALUATION`, `RESULT`).
- **Không lưu gì**: không đăng nhập, không lịch sử, không tiến bộ. Mất hết khi tải lại trang.
- Chỉ **12 đề Part 2** (`cueCards.ts`). Oratio có khoảng 68 đề Part 2 và khoảng 300 câu cả ba Part.
- Lần cập nhật code cuối: **24/04/2026** (CortexWidget).
- **Hỏng ở bản triển khai**: `lib/cortex.ts` gọi `http://localhost:3001` (không chạy được trên người dùng thật), và nút sang Oratio dùng `https://oratio.app` (địa chỉ cứng, có thể không phải địa chỉ thật của bạn).
- Có hai thứ khá công phu: (1) `useFillerTracker` đếm **từ đệm theo thời gian thực** bằng Web Speech API, kể cả đọc kết quả tạm vì API hay xoá "um" khỏi kết quả cuối; (2) `rubric.ts` và `GuidedRatingSlider` cho thanh trượt kèm mô tả từng mức.

### 2.2 So với Oratio Tập

| Tính năng | Solilo | Oratio Tập |
|---|---|---|
| Đồng hồ Part 2 (1 + 2 phút) | Có | Có |
| Ghi âm, nghe lại | Có | Có |
| Lưu lịch sử, theo dõi tiến bộ | **Không** | Có (bảng `answers`, màn Tiến bộ) |
| Chép lời (transcript) | Không (chỉ để đếm từ đệm lúc nói) | Có (Whisper trên máy) |
| Chỉ số (tốc độ, quãng ngừng, từ vựng) | Không | Có |
| Nói lại, 4/3/2 | Không | Có |
| Gửi người khác chấm, chấm chéo | Không | Có |
| Nối lớp học, nối Lexica | Không | Có |
| Câu hỏi | 12 | ~300 (68 đề Part 2) |
| Từ đệm **theo thời gian thực** | **Có** | Chỉ sau khi nói (từ transcript) |
| Tự chấm 4 tiêu chí có lời dẫn | **Có** | Không (chỉ người khác chấm) |
| Đa ngôn ngữ (Anh/Việt) | Có | Tiếng Việt |

Solilo hơn Oratio ở **hai chỗ nhỏ** và kém ở mọi chỗ còn lại. Đứng riêng nó không có lý do tồn tại, và còn trùng đúng nhánh luyện nói một mình mà Oratio đã đầu tư (issue #75 cũng ghi trùng này).

### 2.3 Đề xuất: gộp, và rút gì

1. **Tự chấm có lời dẫn → Oratio** (ý E trong `ORATIO_PLAN.md`): sau khi nói, người học tự chấm 4 tiêu chí bằng `rubric.ts`, rồi xem **chênh lệch với điểm người chấm sau này**. Đó là cách dạy hiểu tiêu chí, và là bản nâng cấp của Solilo (Solilo chỉ cho tự chấm, không cho biết mình lệch bao nhiêu).
2. **Từ đệm thời gian thực → thử nghiệm tuỳ chọn trong Oratio Tập** (ý G, hoãn): `useFillerTracker` có thể chuyển thành tuỳ chọn "nhắc khi nói". Rủi ro: Web Speech API chỉ chắc chắn trên Chrome và Android, và nhắc giữa lúc nói dễ làm người học mất mạch. Nên thử với một lớp rồi quyết.
3. **12 đề của Solilo**: so với bộ của Oratio, thêm đề nào chưa có (kiểm tra trùng lặp), rồi bỏ.
4. **Dừng Solilo**: để trang cũ trỏ sang Oratio Tập (chuyển hướng), gỡ khỏi lưới "app đang chạy" trên landing (chuyển sang "đang nghĩ tới" hoặc bỏ). Không xoá mã ngay: giữ một nhánh lưu để lấy `useFillerTracker`.

### 2.4 Việc cần làm

- [ ] Gộp: chuyển hướng Solilo sang Oratio Tập, đổi trạng thái trên landing
- [ ] Đưa tự chấm có lời dẫn (`rubric.ts`) vào Oratio, hiển thị chênh lệch với người chấm
- [ ] Đối chiếu 12 đề với bộ của Oratio, thêm đề thiếu
- [ ] (hoãn) Thử `useFillerTracker` như tuỳ chọn trong Tập

## 3. Synapse

### 3.1 Hiện trạng (đối chiếu code)

- Học **cụm động từ** (phrasal verbs, "speak out", "hold back") qua **truyện tương tác kiểu cuối kỳ hồi hộp**: người chơi gặp một tình huống, chọn **một trong bốn tiểu từ** (giới từ) để hoàn thành cụm; chọn sai thì hậu quả được kể ra. Giao diện "terminal" tối, chữ xanh lá hoặc hổ phách.
- Ứng dụng 2.233 dòng (một trang, luồng Chọn thế giới → Chọn nhiệm vụ → Briefing → Chơi). Lần cập nhật code cuối: **25/05/2026**.
- **Phần nặng nằm ở API**: module `synapse` của `cortex-core-api` dài 1.692 dòng. `synapse.service.ts` (753 dòng) gọi AI mỗi lượt, nén lịch sử, và có **cơ chế dự phòng 4 lớp** (Gemini, Groq, Gemma chạy cục bộ, rồi kịch bản cứng). `world-bibles.ts` (624 dòng) mô tả 4 thế giới và 11 nhiệm vụ.
- **Chỉ có 6 kịch bản soạn sẵn** (`correctExpression` xuất hiện 6 lần: *speak out*, *stand firm*, *reach out*, *hold back*, *take a stand*…). Phần còn lại AI tự viết mỗi lượt.
- Bảng `synapse_logs` (lưu lịch sử chơi) **chưa làm**; không có tài khoản bắt buộc, không có tiến bộ.
- **Studio phụ thuộc vào nó**: `studio-llm.ts` nhập `DEFAULT_GEMINI_MODEL` từ `synapse/llm.provider.ts`.

### 3.2 Đánh giá

**Phần đáng giữ.** "Chọn cụm đúng thì câu chuyện đi tiếp, chọn sai thì có hậu quả" là một vòng chơi thật sự cuốn, và **khác hẳn** kiểu "chọn một trong bốn" nhàm của bài tập thường: người chơi quan tâm kết quả của lựa chọn. Cụm động từ cũng là chỗ người Việt hay thiếu. Sáu kịch bản soạn sẵn (có `wrongOptions` kèm hậu quả cụ thể từng đáp án sai) là **chất lượng nội dung tốt nhất** của cả dự án, tốt hơn văn AI tự sinh.

**Vấn đề.**
1. **Tốn và mỏng manh**: gọi AI mỗi lượt cho mỗi người chơi, nên chi phí tăng theo số lượt, và cần hệ dự phòng 4 lớp vì từng lỗi API (commit "Fix synapse LLM API" hai lần trong một ngày).
2. **Không ai mở mỗi ngày**: không tiến bộ, không lịch ôn, không lớp học, không lý do quay lại. Một app chỉ chơi một lần rồi thôi.
3. **Chất lượng không kiểm soát**: AI sinh nội dung tự do cho người học, không có bước duyệt. Studio của bạn đã có quy trình duyệt, Synapse thì không dùng.
4. **Lệch hướng cert**: cụm động từ có ích cho Speaking và Listening nhưng không phải ưu tiên của IELTS bằng từ học thuật. Nó hợp hơn với hướng **Giao tiếp**, là hướng giữ ở mức duy trì (ECOSYSTEM_STRATEGY mục 4).

### 3.3 Ba lựa chọn

| | A. Đưa vào Lexica thành "Truyện" | B. Giữ app riêng, làm tiếp | C. Dừng hẳn |
|---|---|---|---|
| Ý | Chế độ chơi mới trong Lexica; truyện **dựng sẵn bằng Studio** (AI chỉ chạy lúc dựng, có duyệt, có cache) | Làm nốt `synapse_logs`, SFX, thế giới mới | Gỡ app, giữ nội dung |
| Giá trị | Có lý do mở mỗi ngày (cùng lịch ôn, từ vào bước Gặp), chơi được ngoại tuyến, chi phí cố định | Giữ nguyên trải nghiệm terminal | Tiết kiệm công |
| Công sức | M–L | L (và vẫn thiếu lý do quay lại) | S |
| Rủi ro | Cần nội dung (có thể ~20 truyện để bắt đầu) | Dàn mỏng sức | Mất ý tưởng hay |
| **Khuyến nghị** | **Chọn** | Không | Chỉ nếu không có sức làm A |

### 3.4 Đề xuất chi tiết cho A ("Truyện sinh tồn" trong Lexica)

- **Luật chơi**: mỗi truyện 5 đến 6 cảnh. Mỗi cảnh có một tình huống, bốn lựa chọn (một cụm đúng, ba cụm sai kèm hậu quả riêng). Sai thì mất "độ an toàn", hết thì thua; đúng liên tục thì câu chuyện về cái kết tốt. Cụm đúng của cảnh là **một thẻ cụm** của Lexica (bộ thẻ Giao tiếp đã có cụm kiểu "look forward to", "push back", và `phrases.ts` đã nhận ra cụm trong văn bản). Cần thêm cụm động từ vào bộ thẻ cho đủ, mình chưa đếm hiện có bao nhiêu.
- **Dựng nội dung**: dùng quy trình Studio có sẵn (soạn bằng AI, có bước duyệt, đóng gói thành gói nội dung như các bài đọc). Lấy **sáu kịch bản soạn sẵn** của Synapse làm mẫu chất lượng và làm ví dụ cho prompt. Tách riêng "truyện" khỏi gọi AI trực tiếp.
- **Gắn vào hệ**: kết quả ghi vào `reviewLog` như các game khác (`applyGame`); cụm đúng được tính một lần "Gặp"; truyện ưu tiên dùng **từ học hôm nay**; có thể thách đấu bạn (cùng truyện, so điểm) và làm bài giao cho lớp.
- **Liên quan #63** (Đấu trường T2c có "Sống sót"): cùng một ý, nên làm chung engine.
- **Còn gì của app Synapse**: giữ giao diện terminal làm *giao diện tuỳ chọn* của chế độ truyện (rất khác biệt so với phần còn lại của Lexica), hoặc bỏ. Nếu không có thời gian, bỏ.

### 3.5 Việc cần làm

- [ ] Chuyển `DEFAULT_GEMINI_MODEL` sang một nơi chung (ví dụ `modules/shared`), cập nhật `studio-llm.ts`, để module `synapse` có thể thu gọn về sau
- [ ] Đóng băng Synapse: không làm tính năng mới, gỡ khỏi lưới "app đang chạy" trên landing (đã chuyển Dialecta sang "đang nghĩ tới"; Synapse và Solilo cũng nên chuyển)
- [ ] Thiết kế định dạng "gói truyện" (cảnh, đáp án đúng, hậu quả từng đáp án sai) và prompt Studio để dựng, dùng sáu kịch bản làm mẫu
- [ ] Làm engine "Truyện" trong Lexica (`/play/story`) cùng khung game hiện có
- [ ] Dựng 20 truyện đầu, duyệt, đóng gói

## 4. Tác động lên landing

Landing (`apps/landing/src/data/ecosystem.ts`) hiện ghi Solilo là **Live** và Synapse không có trong danh sách. Nếu bạn duyệt đề xuất, đổi: Solilo → "đã gộp vào Oratio" (trang `/apps/solilo` chuyển hướng), Synapse → "đang nghĩ tới" (thành chế độ Truyện của Lexica). Mình sẽ làm khi bạn duyệt.

## 5. Ý tưởng cho Writing và Listening

Hai kỹ năng chứng chỉ chưa có (ECOSYSTEM_STRATEGY mục 3). Mình xếp theo giá trị trên công sức, dựa vào cái **đã có sẵn** trong hệ.

### 5.1 Listening (làm trước: rẻ, chấm tự động được)

Hạ tầng sẵn có: giọng tự nhiên có bộ nhớ đệm (Gemini TTS, 3 giọng), bài đọc và hội thoại do Studio dựng, từ vựng của người học.

| # | Ý | Cách chơi | Công sức |
|---|---|---|---|
| L1 | **Nghe chép** (dictation) | Nghe một câu (tốc độ thường hoặc chậm), gõ lại; so từng từ, tô chỗ nghe sai. Câu lấy từ chính các bài đọc có từ vừa học | S |
| L2 | **Nghe và điền** | Nghe một đoạn hội thoại hoặc độc thoại ngắn, điền vào chỗ trống như dạng bài IELTS (form, note completion). Chấm tự động | M |
| L3 | **Âm nối và âm rút** | Mini-bài: "gonna", "wanna", âm nuốt, âm nối. Nghe rồi chọn câu đúng. Nối với Sổ âm (SoundBook) đã có của Lexica | S–M |
| L4 | **Nghe nhanh dần** | Cùng một đoạn ở 0,8×, 1×, 1,2×; thấy mình nghe được bao nhiêu phần | S |

**Giới hạn phải nói thẳng**: giọng tổng hợp chỉ có vài giọng, không phải các giọng Anh, Úc, Mỹ, New Zealand như IELTS thật, nên đây là luyện **nghe hiểu và nghe chép**, không phải thi thử Listening. Cần ghi chú rõ như vậy khi hiển thị.

### 5.2 Writing (làm sau: cần quyết định riêng tư)

Bị chặn bởi quyết định riêng tư của #64 (bài viết của học viên có được người khác đọc không). Đề xuất một **thang từ nhỏ đến lớn**, mỗi bậc dùng cái đã có:

| Bậc | Ý | Có sẵn | Công sức |
|---|---|---|---|
| W1 | **Câu của bạn** (đã có): viết một câu với từ mới, nhận phản hồi | Có (API `sentence`) | Đã có |
| W2 | **Nâng cấp câu** (đã có ở dạng chọn): sau đó cho **viết lại** một câu theo cách trang trọng hơn | Có dữ liệu `upgradeModule` | S–M |
| W3 | **Đoạn văn có khung**: sắp xếp và viết đoạn theo khung (nêu ý, giải thích, ví dụ, kết) với danh sách tự kiểm | Mới, tĩnh | M |
| W4 | **Task 1: mô tả biểu đồ** với biểu đồ sinh bằng chương trình (không vướng bản quyền đề thi), danh sách "đã nêu xu hướng chưa, có so sánh số chưa" | Mới | M |
| W5 | **Chấm chéo Writing trong lớp**: dùng lại đúng động cơ của Oratio Chấm chéo (rubric, độ chuẩn, câu neo từ giáo viên), nhưng chỉ trong lớp | Tái dùng ~70% logic Oratio | L |
| W6 | **Giáo viên xem và sửa** trong Teach, có AI chấm sơ bộ làm gợi ý | Teach có sẵn lớp | L |

Điểm đáng nói: **động cơ chấm chéo hiệu chuẩn của Oratio chính là thứ Writing cần**, nên làm Oratio Chấm chéo cho lớp (hướng A trong `ORATIO_PLAN.md`) trước sẽ làm W5 rẻ hơn nhiều.

### 5.3 Thứ tự đề xuất

1. L1 Nghe chép (nhỏ, nhanh thấy giá trị).
2. W1, W2 mở rộng (đã gần có).
3. L2, L3.
4. W5 (sau khi chấm chéo trong lớp chạy và có quyết định riêng tư).
5. W4 Task 1.

## 6. Cần bạn quyết

1. **Solilo gộp vào Oratio** (chuyển hướng, chuyển trạng thái trên landing, rút tự chấm có lời dẫn): đồng ý?
2. **Synapse**: chọn A (Truyện trong Lexica, nội dung dựng sẵn), B (giữ app riêng) hay C (dừng)? Mình đề nghị A.
3. Nếu A: có làm **giao diện terminal** cho chế độ Truyện (khác biệt) hay dùng giao diện chung của phần Chơi?
4. **Listening và Writing**: bắt đầu bằng L1 Nghe chép? Còn quyết định riêng tư cho Writing (#64) thì khi nào bạn quyết?
5. Trang landing: đổi trạng thái Solilo và Synapse như mục 4?
