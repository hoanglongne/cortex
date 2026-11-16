# Lexica: kế hoạch thay SM-2 bằng FSRS (11/2026)

Liên quan: #143 (mô hình người học, đang chạy song song), `docs/LEXICA_LEARNER_MODEL.md`.

## 1. Vì sao đổi
| | SM-2 (hiện tại, `lib/srs.ts`) | FSRS (`lib/learner/fsrs.ts`) |
|---|---|---|
| Trả lời câu hỏi | "Khi nào ôn lại?" theo luật cố định | "Hôm nay còn nhớ bao nhiêu %?" rồi suy ra ngày ôn |
| Sai một lần | Về 1 ngày, giảm độ dễ | Độ vững giảm có tính toán; từ đã rất vững không bị đẩy về số 0 |
| Ôn sớm hay ôn muộn | Không tính | Tính theo thời gian đã trôi qua thật |
| Chỉnh mục tiêu | Không có | Chọn mức nhớ mong muốn (ví dụ 90%) → khoảng cách tự đổi |
| Học từ dữ liệu | Không | Fit lại được trọng số theo người học Lexica |

Trên dữ liệu Anki, FSRS cho số lần ôn ít hơn ở cùng mức nhớ. **Với Lexica thì chưa biết**, nên kế hoạch dưới đây được xây quanh việc đo trước, đổi sau.

## 2. Nguyên tắc
1. **Không đổi trên lý thuyết.** Chỉ chuyển khi số liệu `/dev/learner` (log loss trên câu trả lời thật) cho thấy FSRS đoán tốt hơn.
2. **Không phá lịch của người đang học.** Từ đang có lịch SM-2 được chuyển êm: ngày ôn tới không nhảy đột ngột.
3. **Luôn quay lại được.** Có cờ tắt FSRS; khi tắt, lịch SM-2 vẫn còn nguyên vì vẫn được cập nhật song song.
4. **Người học không phải làm gì.** Trừ một tuỳ chọn "mức nhớ mục tiêu" cho người muốn chỉnh.

## 3. Các chặng

### F0: đo (đang chạy, từ #143)
- **Đã có:** mọi câu trả lời nhận ra có chấm đều được dùng để chấm cả hai mô hình (log loss, Brier), trước khi cập nhật.
- **Cần thêm:**
  - [ ] Gửi số đo **ẩn danh, chỉ con số** (n, tổng log loss mỗi mô hình) lên PostHog mỗi tuần, để xem trên **tất cả** người học chứ không chỉ một máy.
  - [ ] Bảng theo dõi: log loss FSRS vs SM-2 theo tuần, theo trình độ.
- **Qua chặng khi:** ≥ 50 người học, mỗi người ≥ 30 câu, và FSRS có log loss thấp hơn ở **≥ 70% người học**. Mức chênh trung bình phải có ý nghĩa: khoảng tin cậy bootstrap 95% không chứa 0.
- **Nếu FSRS không thắng:** dừng, xem lại cách suy bằng chứng (có thể đang tính sai đúng/sai) trước khi nghĩ tới đổi.

### F1: fit trọng số (song song với F0)
- **Đầu vào:** nhật ký bằng chứng ẩn danh, mỗi dòng gồm mã từ, kết quả và khoảng ngày giữa hai lần ôn. Không có nội dung.
- **Cách làm:** dùng công cụ tối ưu FSRS mã nguồn mở (fsrs-optimizer) chạy ngoài app, ra bộ 17 trọng số cho Lexica.
- **Kiểm tra:**
  - so trọng số mới với trọng số mặc định trên dữ liệu chưa dùng để fit;
  - chỉ giữ bộ mới nếu tốt hơn.
- **Cá nhân hoá:**
  - lúc đầu dùng chung một bộ cho mọi người;
  - fit riêng cho từng người chỉ khi họ có ≥ 1.000 câu trả lời (FSRS cần nhiều dữ liệu).
- **Trước khi làm:** cần ý kiến của chủ sản phẩm về việc gom nhật ký ẩn danh. Dù chỉ có con số, cũng phải nói trong trang riêng tư.

### F2: chuyển dần (khi F0 đạt)
- **Cờ `scheduler`:** `'sm2' | 'fsrs'`, theo từng người.
  - Mặc định vẫn `sm2`.
  - Bật cho 10% người học mới trước, rồi 50%, rồi 100%.
- **Ánh xạ khi bật:**
  - **Từ có lịch SM-2:** đã có trí nhớ FSRS từ `seedFromSm2` và các lần ôn sau đó.
  - **Ngày ôn tới:**
    - lấy ngày **gần hơn** giữa lịch SM-2 cũ và ngày FSRS tính ra ở mức nhớ mục tiêu;
    - tối đa giãn thêm 50% mỗi lần ôn trong 2 tuần đầu, để không có từ nào "biến mất" khỏi lượt ôn.
  - **Từ mới:** dùng FSRS từ đầu.
- **Thứ chỉ đổi ở một chỗ:**
  - `getDueCards` và việc tính `nextReviewAt` đọc từ FSRS khi cờ bật;
  - còn lại (game, Arena, Núm vặn) không cần đổi vì đều đi qua `cardProgress.nextReviewAt`.
- **SM-2 vẫn được cập nhật song song** trong suốt F2, để tắt cờ là quay về được ngay.
- **Đo khi bật (A/B theo người, không theo từ):**
  - tỉ lệ đúng ở lượt ôn đến hạn;
  - số lượt ôn mỗi ngày;
  - tỉ lệ quay lại ngày 7 và 30;
  - phản hồi "quá nhiều/quá ít từ để ôn".
- **Dừng hoặc quay lại khi:** tỉ lệ đúng ở lượt ôn thấp hơn nhóm SM-2 quá 3 điểm %, hoặc số lượt ôn mỗi ngày tăng > 30%.

### F3: tầng nhớ lại và dùng
- **Khi FSRS đã quyết lịch tầng nhận ra:** mở lịch riêng cho tầng `recall` (gõ từ, điền từ) với từ đã mở khoá (`unlocked`).
- **Tầng `produce`:** không có lịch ép buộc, chỉ gợi ý.
  - "3 từ nên thử nói hôm nay": từ có tầng nhận ra vững nhưng tầng dùng chưa có hoặc đang yếu. Ghép với Biết – Dùng (#137) và Oratio.
- **Cần làm trước:** bài tập riêng cho tầng `recall`. Hiện các game gõ từ vẫn bị tính vào `recog`, phải tách nguồn.

### F4: tuỳ chọn cho người học
- **"Mức nhớ mục tiêu"** trong Cài đặt: 85% (ít ôn), 90% (mặc định), 95% (thi sắp tới). Kèm câu giải thích: mức cao hơn thì ôn nhiều hơn.
- **"Ngày thi":** khi có ngày thi, ưu tiên từ có khả năng nhớ ở ngày thi thấp nhất (FSRS tính được, SM-2 thì không).

## 4. Rủi ro
| Rủi ro | Giảm bằng |
|---|---|
| Bằng chứng suy từ store bị sai (đếm nhầm đúng/sai) làm FSRS học sai | F0 kiểm tra từng nguồn bằng unit test và số liệu; xem tỉ lệ đúng theo nguồn |
| Trọng số mặc định không hợp người Việt học từ học thuật | F1 fit lại trước F2 |
| Lượt ôn tăng đột ngột khi chuyển | Ánh xạ "ngày gần hơn" và giới hạn giãn trong 2 tuần đầu; tung dần theo % |
| Bản sao lưu vượt 512 KB vì nhật ký | Nhật ký đã giới hạn 1.500 dòng; nếu cần thêm thì chuyển nhật ký sang bảng riêng |
| Người học thấy "lịch lạ" | Thông báo một lần khi bật: "Lexica giờ tính lịch ôn theo trí nhớ của chính bạn" |

## 5. Ước lượng
- **F0 (thêm gửi số đo):** 1–2 ngày công, rồi chờ 3–6 tuần để có dữ liệu.
- **F1:** 2–3 ngày công, khi đủ dữ liệu.
- **F2:** 3–5 ngày công, cộng 4–6 tuần tung dần.
- **F3, F4:** mỗi chặng khoảng 1 tuần công.

Các con số là ước tính của mình. Thời gian chờ dữ liệu phụ thuộc số người dùng thật.

## 6. Cần chủ sản phẩm quyết
1. Đồng ý gửi số đo ẩn danh (chỉ con số) lên PostHog cho F0 không?
2. Đồng ý gom nhật ký ẩn danh (mã từ, kết quả, khoảng ngày) để fit trọng số ở F1 không?
3. Ngưỡng chuyển: "≥ 50 người học, FSRS thắng ở ≥ 70%" có hợp không?
