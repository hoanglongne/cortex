# Núm vặn: học từ Merid (kế hoạch, 11/2026)

**Tham khảo:** Merid (merid.site), một extension Chrome thay từ tiếng Việt bằng từ tiếng Anh SAT/C1/C2 khi lướt web.
- Chỉ học ý tưởng. Không lấy mã, chữ hay hình của họ.
- **Không làm** việc kiểm tra ngữ cảnh bằng AI: chủ sản phẩm đã bỏ mục này.

## Hiện có
- **Bộ thay từ:**
  - bộ luật cụm từ Việt → Anh chạy ngay trên máy (`app/lib/dial/`), 415 luật, đúng nghĩa 94,8%;
  - chạy trong trang Đọc của Lexica và trong extension (`apps/lexica/extension`).
- **Từ được thay** là từ người học đang học. Chạm vào từ: xem nghĩa và đưa từ vào lượt ôn (`dialTap`).
- **Tín hiệu và đồng bộ:**
  - tín hiệu "đã thấy" và bài kiểm tra hằng tuần (`lib/learner/dialSignal.ts`);
  - đồng bộ giữa các máy qua API (`lxd_` token).
- **Mức độ thay** hiện có trong `app/lib/dial/level.ts`.

## Sáu việc

### N1. Thanh cường độ kèm ước tính
- **Ba mức:**
  - Nhẹ: tối đa 3 từ mỗi trang;
  - Vừa: khoảng 8 từ;
  - Nhiều: khoảng 20 từ.
- **Dòng ước tính dưới thanh:** "≈ N lượt gặp từ mỗi ngày · ≈ M từ mới mỗi tuần".
  - Tính từ số trang người dùng đọc trung bình 7 ngày qua (đếm trên máy) nhân với mức đã chọn.
  - Chưa đủ dữ liệu thì dùng số mặc định và ghi rõ là ước tính.
- **Chỗ hiện:** popup của extension và Cài đặt của Lexica (cùng một giá trị, đồng bộ qua tài khoản).
- **Mã:** mở rộng `level.ts` (giới hạn số từ mỗi trang theo mức), thêm hàm thuần `estimate(pagesPerDay, level)`, có test.

### N2. Cách hiện từ: thay hẳn / chỉ tô sáng / cả hai
- **Thay hẳn:** như hiện nay.
- **Chỉ tô sáng:** giữ chữ tiếng Việt, gạch chân nhẹ. Chạm hoặc di chuột mới hiện từ tiếng Anh. Dành cho người mới.
- **Cả hai:** chữ tiếng Việt, từ tiếng Anh trong ngoặc ngay sau.
- **Mặc định:**
  - người mới (dưới 50 từ đã học): chỉ tô sáng;
  - còn lại: thay hẳn.
- **Tín hiệu "đã thấy":** chỉ tính ở chế độ thay hẳn và cả hai. Ở chế độ chỉ tô sáng, phải chạm mới tính.
- **Mã:** `DialText.tsx` và `content.body.js` nhận thêm `mode`. Hàm dựng đoạn văn (`match.ts` → phần render) tách theo mode, có test.

### N3. "Đã thuộc" và 👍/👎 trên từng từ
Thẻ nghĩa khi chạm vào từ có thêm ba nút:
- **Đã thuộc:**
  - từ không còn được thay trên mọi trang;
  - ghi bằng chứng tầng `recog` loại `right` với trọng số 1 cho mô hình người học;
  - có nút hoàn tác.
- **👍 Thay hay:** ghi nhận luật đó hợp.
- **👎 Thay sai chỗ:**
  - ẩn từ đó trên trang hiện tại;
  - ghi luật bị chê để sửa.
  - Gửi lên máy chủ **chỉ mã luật và số lần**, không gửi câu.
- **Báo cáo cho đội nội dung:** gom số 👎 theo luật (ẩn danh) để sửa luật yếu, thay cho việc tự dán nhãn từng vòng.
- **Mã:** thêm `dialFeedback` vào store, sự kiện PostHog `dial_rule_feedback` (chỉ mã luật và dấu), trang riêng tư ghi rõ.

### N4. Không chạm vào trang nhạy cảm
- **Danh sách chặn cứng** (người dùng không bật lại được): ngân hàng và ví điện tử, email, y tế và bệnh viện, cơ quan nhà nước và thuế, trang đăng nhập và thanh toán.
  - So theo tên miền và theo dấu hiệu trên trang (ô mật khẩu, ô số thẻ).
- **Nút "Không thay ở trang này"** trong popup: lưu tên miền, áp cho cả tên miền phụ, xem và bỏ được trong Cài đặt.
- **Bắt buộc có trước khi lên Chrome Web Store.**
- **Mã:** `extension/src/blocklist.js`, hàm thuần `isBlocked(url, docSignals)`, có test với danh sách tên miền Việt Nam phổ biến (Vietcombank, MoMo, VNeID, Gmail…).

### N6. Thử ngay trên trang giới thiệu và nhiệm vụ đầu tiên
- **Trang giới thiệu Núm vặn** (`/num-van`) có một đoạn văn mẫu:
  - kéo thanh cường độ (N1) thì cùng đoạn văn đổi theo;
  - gạt cách hiện (N2) thì thấy ngay ba kiểu.
- **Sau khi cài extension**, thẻ nhiệm vụ "Đọc một bài báo, chạm 3 từ được thay, lưu 1 từ vào lượt ôn".
  - Xong thì đánh dấu và mở bước tiếp.
- **Đo:**
  - tỉ lệ người cài mà chạm từ trong ngày đầu;
  - tỉ lệ vẫn bật sau 7 ngày.

### N7. Chế độ tiếng Anh → tiếng Anh (sau cùng)
- **Trên trang tiếng Anh:** đổi một số từ thường thành từ học thuật cùng nghĩa mà người học đang học. Ví dụ "a lot of" → "abundant", "show" → "demonstrate". Chỉ đổi khi chắc nghĩa.
- **Giải nghĩa bằng tiếng Anh** cho người đã vững (bật trong Cài đặt).
- **Cần trước:**
  - bộ luật Anh → Anh riêng;
  - nhận diện ngôn ngữ của trang;
  - đo độ đúng như vòng D0 trước khi bật.

## Thứ tự và công sức (ước tính)
| Việc | Phụ thuộc | Công |
|---|---|---|
| N4 (chặn trang nhạy cảm) | — | 1–2 ngày |
| N1 (cường độ) | — | 1–2 ngày |
| N2 (cách hiện) | — | 2 ngày |
| N3 (đã thuộc, 👍/👎) | — | 2 ngày |
| N6 (thử ngay, nhiệm vụ) | N1, N2 | 2 ngày |
| N7 (Anh → Anh) | bộ luật mới | 1–2 tuần |

**Đề xuất:** N4 → N1 → N2 → N3 → N6 → N7.
