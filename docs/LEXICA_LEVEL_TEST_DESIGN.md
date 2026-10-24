# Bài kiểm tra từ vựng mới và điểm Lexica (thiết kế, 10/2026)

**Mục tiêu:**
- bài kiểm tra đầu vào **sâu hơn và khó đoán mò**;
- người học **thi lại (challenge)** sau một thời gian học để lấy điểm mới;
- điểm thành **một thứ để khoe**: "Lexica 1320" nghe như "IELTS 7.5".

**Trạng thái:** chờ người dùng duyệt. Phần ELO đã sửa trong Đợt 11:
- ELO không còn cộng trừ theo mỗi lần vuốt, chỉ đổi khi làm bài kiểm tra;
- trang chủ gợi ý đổi level theo tỉ lệ nhớ lại đúng.

## 1. Bài hiện tại có gì chưa ổn
- Chỉ có vài câu cố định, nên làm lại vẫn gặp đúng những câu cũ.
- Đáp án đúng phần lớn nằm ở vị trí thứ hai, nên đoán mò cũng ra điểm.
- Chỉ có một dạng câu: đọc câu tiếng Việt chứa từ tiếng Anh rồi chọn nghĩa. Câu tiếng Việt thường đã gợi ý luôn nghĩa.
- Không có lựa chọn "Không biết", nên người học buộc phải đoán.
- Điểm ra là một con số ELO, không kèm khoảng sai số, không có ý nghĩa với người ngoài.

## 2. Thiết kế mới

### 2.1 Câu hỏi thích ứng
- **Ngân hàng câu:** toàn bộ thẻ trong bộ từ (khoảng 610 thẻ và các pack Studio). Mỗi thẻ đã có `elo` làm độ khó.
- **Chọn câu theo trình độ đang ước lượng:**
  - mỗi câu chọn từ có độ khó gần nhất với trình độ hiện tại;
  - không chọn hai từ cùng chủ đề liền nhau.
- **Cập nhật sau mỗi câu** theo mô hình Rasch / Elo:
  - xác suất đúng = 1 / (1 + 10^((độ khó − trình độ)/400));
  - hệ số K lớn ở đầu bài, nhỏ dần về cuối.
- **Dừng** khi sai số đủ nhỏ (khoảng ±40 điểm), hoặc sau 30 câu. Thường khoảng 20–25 câu, mất 6–8 phút.

### 2.2 Năm dạng câu, xoay vòng

| Dạng | Ví dụ | Đo gì |
|---|---|---|
| Chọn nghĩa | "feasible" → 4 nghĩa tiếng Việt | Nhận biết |
| Điền vào câu tiếng Anh | "The plan is ___ if we cut costs." → 4 từ | Hiểu trong ngữ cảnh |
| Cụm từ đi kèm | "___ a decision" → make / do / take / get | Dùng tự nhiên |
| Nghe | Nghe giọng Kokoro, chọn từ vừa nghe | Nhận ra khi nghe |
| Từ thật hay từ bịa | "fendle" có phải từ tiếng Anh không? (kiểu bài LexTALE) | Phát hiện người "tự nhận biết" quá mức |

- Mỗi câu đều có nút **"Không biết"**. Chọn câu này không bị trừ như trả lời sai, nhưng cũng không được cộng điểm.
- **Đáp án nhiễu** lấy từ cùng level và cùng loại từ. Vị trí đáp án đúng được xáo ngẫu nhiên.
- **Mỗi câu có giới hạn thời gian** (khoảng 20 giây), để không tra từ điển được.

### 2.3 Kết quả
- **Điểm Lexica:** một số từ 800 đến 1600, kèm khoảng sai số. Ví dụ "1320 ± 35".
- Đi kèm:
  - **Level gợi ý** trong Lexica;
  - **CEFR ước lượng** (A2 … C1);
  - **Band IELTS từ vựng ước lượng** theo bảng trong `lib/levels.ts`, ghi rõ là ước lượng, không phải điểm IELTS;
  - **Số từ ước lượng biết**, ví dụ "khoảng 4.500 từ";
  - **Điểm mạnh và yếu theo dạng câu**, ví dụ "nhận nghĩa tốt, nghe còn yếu".

### 2.4 Thi lại (challenge)
- **Mở khi:**
  - đã qua **14 ngày** kể từ lần thi trước;
  - **và** đã ôn ít nhất **100 lượt** kể từ lần thi trước.
  
  Cách này chống thi đi thi lại để "cày" điểm.
- **Trước khi thi**, trang chủ hiện: "Bạn đã học thêm 120 từ từ lần trước. Thử thi lại?"
- **Sau khi thi** có biểu đồ điểm qua các lần thi. Điểm mới thay level gợi ý; người học tự quyết có đổi level không.

### 2.5 Điểm để khoe
- **Thẻ điểm:** một ảnh đẹp có tên, điểm, CEFR ước lượng và ngày thi, kèm nút chia sẻ (ảnh hoặc link).
- **Link xác minh** `lexica…/score/<mã>`: ai mở cũng thấy điểm thật, ngày thi, và đó là bài đã được máy chủ chấm.
- **Hai loại điểm:**
  - **Điểm luyện tập:** chấm ngay trên máy. Có ngay, nhưng có thể gian lận, nên không có link xác minh.
  - **Điểm đã xác minh:**
    - máy chủ chọn câu và chấm, ngân hàng câu không gửi xuống máy;
    - có giới hạn thời gian từng câu và chỉ được thi lại theo luật ở mục 2.4;
    - chỉ loại này mới có link xác minh và hiện trong lớp học.
- **Lớp học:** giáo viên thấy điểm đã xác minh của học viên và mức tiến bộ, đúng kiểu số liệu lớp đang có.

## 3. Cách làm (đề xuất 3 PR)

1. **PR A: bài kiểm tra thích ứng trên máy, ra điểm luyện tập.**
   - Code: `lib/placement/` (chọn câu, cập nhật trình độ, dừng, tạo câu và đáp án nhiễu), có unit test, mô phỏng người học ảo để kiểm độ chính xác.
   - Giao diện: làm lại `/test`, trang kết quả mới.
   - Không cần máy chủ.
2. **PR B: thi lại và lịch sử điểm.**
   - Lưu các lần thi trong store và đồng bộ qua cloudSync.
   - Gợi ý thi lại trên trang chủ, biểu đồ điểm, thẻ điểm để chia sẻ (ảnh).
3. **PR C: điểm đã xác minh.**
   - Cortex API: `/v1/lexica/placement/start` và `/v1/lexica/placement/answer`. Ngân hàng câu và cách chấm nằm ở máy chủ.
   - Bảng `lexica_scores`, chỉ đọc ghi qua security definer function, có trang `/score/<mã>` công khai.
   - Teach thấy điểm của lớp.
   - Cần Cortex API chạy ổn trước.

## 4. Đã chốt (24/10/2026)
1. Thi lại: 14 ngày **và** 100 lượt ôn kể từ lần trước.
2. Chỉ hiện **mức tương đương trong một khoảng** ("IELTS từ vựng khoảng 6.0–6.5"), không bao giờ một con số.
3. Dạng câu Nghe: chưa chốt, làm sau (đã giải thích lại cho người dùng).
4. Giữ thang điểm như ELO hiện tại (800–1500).

## 5. Tiến độ
- [x] PR A: bài kiểm tra thích ứng trên máy (`lib/placement/engine.ts`, `components/PlacementTest.tsx`, `components/PlacementResultView.tsx`). 3 dạng câu: chọn nghĩa, điền từ vào cụm, từ thật hay từ bịa. Có "Không biết" và 20 giây mỗi câu. Kết quả gồm điểm ± sai số, IELTS khoảng, vốn từ ước lượng, theo dạng câu. Lịch sử các lần thi lưu trong store; luật thi lại đã áp dụng.
- [ ] PR B: gợi ý thi lại trên trang chủ, biểu đồ điểm, thẻ điểm để chia sẻ.
- [ ] PR C: điểm đã xác minh (máy chủ chấm, link công khai, giáo viên xem).
- [ ] Dạng câu Nghe (chờ quyết).
