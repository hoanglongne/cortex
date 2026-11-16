# Lexica: mô hình người học 4 tầng và tín hiệu Núm vặn (issue #143, #142)

## Mô hình người học (#143)
- **Mã:** `apps/lexica/app/lib/learner/`. Thuần, có unit test.
  - `fsrs.ts`: mô hình trí nhớ FSRS-4.5.
    - Độ vững S là số ngày tới lúc xác suất nhớ còn 90%. Độ khó D từ 1 đến 10.
    - Trọng số là bộ mặc định của FSRS-4.5, **chưa khớp với dữ liệu người học Lexica**.
  - `model.ts`: 4 tầng, nhật ký bằng chứng, và điểm dự đoán.
    - **4 tầng:** `recog` (nhận ra), `recall` (tự nhớ lại), `produce` (dùng trong câu), `wild` (dùng ngoài đời).
    - **Nhật ký bằng chứng:** mỗi dòng có thẻ, tầng, nguồn, kết quả, trọng số và thời điểm. Giữ 1.500 dòng gần nhất, vì bản sao lưu bị giới hạn 512 KB.
    - **Trọng số:** chỉ bằng chứng có trọng số ≥ 1 (câu trả lời có chấm) mới đổi trí nhớ. Tín hiệu yếu chỉ được ghi lại.
    - **Mở tầng:** một tầng chỉ được tính tới khi tầng trước giữ được ≥ 85% sau một tuần (`unlocked`).
- **Chạy song song (shadow):**
  - Lịch ôn vẫn do SM-2 (`lib/srs.ts`) quyết. FSRS chỉ dự đoán.
  - Mỗi câu trả lời "nhận ra" có chấm được dùng để chấm cả hai mô hình (log loss và Brier) **trước khi** cập nhật. Kết quả xem ở `/dev/learner`.
  - **Chỉ chuyển sang FSRS khi:** có ≥ 30 câu, FSRS có log loss thấp hơn SM-2 trên nhiều người học, và có quyết định riêng. Chưa làm.
- **Không phải sửa các đường ôn tập hiện có.** Bằng chứng được suy ra từ thay đổi của store (`evidenceFromChange`):
  - số câu đúng/sai tăng → `recog`;
  - một lần luyện nói → `produce` (bị tính sai khi lần luyện đó làm tăng số lần nói chưa rõ);
  - một câu tự viết → `produce`;
  - đánh dấu "đã dùng ngoài đời" → `wild`;
  - chạm từ trong Núm vặn → `recog` sai.
- **Từ học trước khi có mô hình:** tầng `recog` được khởi tạo từ lịch SM-2 (`seedFromSm2`).
- **Đồng bộ:** trạng thái `learner` nằm trong store đã lưu, nên đồng bộ theo bản sao lưu có sẵn. Không cần SQL mới.
- **Giao diện:** mục "Bốn tầng của từ" trong "Từ của tôi".
  - Số từ đã có ở mỗi tầng.
  - Với từng từ: 4 vạch, mỗi vạch là khả năng còn nhớ ở tầng đó hôm nay.

## Tín hiệu Núm vặn (#142)
`apps/lexica/app/lib/learner/dialSignal.ts`
- **"Đọc lướt":**
  - Từ đã đổi sang tiếng Anh nằm trên màn hình ≥ 1,5 giây, trang đang mở, và không bị chạm.
  - Mỗi từ ghi một lần cho mỗi lần mở trang, ở tầng `recog` với trọng số nhỏ.
  - **Không bao giờ đổi trí nhớ**, và không bao giờ đẩy từ lên tầng `recall`/`produce`.
  - Có trong trình đọc bài (chế độ Núm vặn) và `/num-van`.
  - Tiện ích Chrome chưa ghi tín hiệu này, để không gửi thêm dữ liệu duyệt web.
- **Kiểm tra hằng tuần:**
  - Trên `/num-van` hiện thẻ "Kiểm tra nhanh tuần này" khi có ≥ 3 từ thoả cả hai điều kiện: đã "đọc lướt" trong 7 ngày, và chưa bị chạm, trả lời sai hay đã kiểm tra kể từ đó.
  - Mỗi lần hỏi tối đa 6 từ, trắc nghiệm nghĩa.
  - Đúng/sai được ghi như câu trả lời có chấm. Từ sai được đưa vào lượt ôn.
- **Hiệu chỉnh trọng số "đọc lướt"** (`seenWeight`):
  - dưới 10 câu kiểm tra: 0,2;
  - tỉ lệ đúng < 70%: 0,02 (gần như bỏ qua);
  - từ 70% đến 100%: tăng dần, tối đa 0,3.
- **Thí nghiệm A/B:**
  - Chia từ của mỗi người 50/50, cố định theo mã ngẫu nhiên (`dialGroup`).
  - Báo cáo tỉ lệ nhớ ở ngày 14 và 30 theo nhóm (`experimentReport`).
  - **Đang tắt** (`DIAL_EXPERIMENT = false`). Bật nghĩa là bỏ bớt thẻ ôn của một nửa số từ, nên cần chủ sản phẩm quyết. Lúc bật cần thêm phần loại các từ nhóm "dial" khỏi bộ thẻ ôn.

## Chưa làm
- Fit lại trọng số FSRS từ dữ liệu thật, khi đủ người học.
- Cho FSRS quyết lịch ôn: chỉ khi `/dev/learner` cho thấy nó dự đoán tốt hơn.
- Bài tập riêng cho tầng `recall`. Hiện các game gõ từ vẫn được tính vào `recog`.
