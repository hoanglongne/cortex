# Núm vặn, chặng D0: kết quả thử bộ máy thay từ (12/11/2026)

Thuộc kế hoạch `docs/LEXICA_WOW_PLAN.md` mục 2.9. Câu hỏi của chặng này: **luật thay từ chạy trên máy (lớp 1) có thay đúng nghĩa ≥ 95% trên báo thật không?**

## Đã làm
- **Bộ máy khớp:** `apps/lexica/app/lib/dial/match.ts`
  - Khớp theo từng tiếng; dấu thanh đặt kiểu cũ hay kiểu mới đều nhận ("hoà" = "hòa").
  - Ưu tiên cụm dài nhất, không khớp vượt qua dấu câu.
  - Bỏ qua tên riêng: chữ hoa ở giữa câu ("Bộ Tài chính").
  - Ba kiểu luật ngữ cảnh:
    - `notBefore`: bỏ khi có cụm đứng ngay trước ("tính minh bạch");
    - `notAfter`: bỏ khi có cụm đứng ngay sau ("đa dạng hoá");
    - `onlyAfter`: chỉ khớp sau một danh từ cho trước, dùng cho chữ nhiều nghĩa ("tác động tiêu cực").
  - Có unit test: `apps/lexica/__tests__/unit/dialMatch.test.ts`.
- **Luật cho 75 thẻ:** `apps/lexica/app/lib/dial/rules.ts`. Mỗi luật sửa vì một lỗi thật đều có chú thích lý do.
- **Script thử:** `apps/lexica/scripts/dial-d0/`
  - `fetch.mjs`: tải bài từ RSS của Thanh Niên, VnExpress, Tuổi Trẻ, loại đoạn trùng, loại bài đã có trong bộ khác. **Nội dung bài báo không đưa vào repo.**
  - `run.mjs`: chạy bộ máy, xuất từng chỗ thay kèm câu để chấm.

## Cách chấm
- **Ba bộ bài, không trùng nhau:**
  - **dev** (35 bài): dùng để sửa luật.
  - **test** (58 bài mới): chấm sau vòng sửa luật 1.
  - **test2** (86 bài mới): chấm sau vòng sửa luật 2.
- **Một chỗ thay là "sai"** khi từ tiếng Anh sai nghĩa trong câu đó. Ví dụ "triển khai quân đội" mà hiện *implement* (phải là *deploy*).
- **Sai từ loại không tính là sai:** từ đúng nghĩa nhưng dạng khác, như *transparent* đứng ở chỗ của danh từ *transparency*. Xem mục "Vấn đề từ loại".
- **Người chấm:** Claude, đồng thời là người viết luật. Đây là thiên lệch rõ ràng, xem mục "Giới hạn".

## Kết quả
| Vòng | Bộ bài | Số bài | Số chỗ thay | Sai nghĩa | Đúng nghĩa |
|---|---|---|---|---|---|
| 1 | test | 58 | 242 | 20 | **91,7%** |
| 2 | test2 | 86 | 430 | 21 | **95,1%** |

- Vòng 2 vừa qua ngưỡng 95% của kế hoạch, nhưng sát ngưỡng và chỉ có một người chấm. Chưa nên coi là đạt chắc chắn.
- **Mật độ:** khoảng 6 chỗ thay trên 1.000 tiếng, tức vài từ mỗi bài. 47–50 trên 75 luật có xuất hiện trong bài.
- Sau vòng 2 mình đã sửa thêm luật theo lỗi tìm được. Số đo cho bản luật mới **chưa có**, cần một bộ bài mới nữa (bài đã dùng để sửa luật thì không dùng để chấm lại).

## Các nhóm lỗi
| Nhóm | Ví dụ | Cách đã xử lý |
|---|---|---|
| Một chữ tiếng Việt, hai từ tiếng Anh | "triển khai quân" = deploy; "hiệu quả sử dụng vốn" = efficiency; "cơ hội ghi bàn" = chance | `notAfter`, `notBefore` theo cụm đi kèm |
| Chữ mang nghĩa riêng trong tiếng Việt | "phòng chống tiêu cực" = tham nhũng, gian lận; "không chủ quan" = không lơ là; "từ bỏ cuộc sống" = tự tử | `onlyAfter`, hoặc loại cụm |
| Tách từ sai | "khách quan sát" là "khách / quan sát" | `notAfter: ['sát']`. Lỗi kiểu này sẽ còn, cần thêm bộ tách từ |
| Bóng đá | "cơ hội" gần như luôn là *chance* | Tạm loại theo cụm. Nên thêm luật theo chuyên mục bài |
| Bỏ hẳn luật quá rộng | "ảnh hưởng" phần lớn là *affect*; "hợp tác" là *cooperate*; "bất ngờ" là *suddenly* | Thu hẹp: "tầm ảnh hưởng" → influence; bỏ "hợp tác"; "bất ngờ" chỉ còn dạng "ngoài dự kiến" |

## Vấn đề từ loại (chưa giải)
Tiếng Việt dùng cùng một chữ cho tính từ, danh từ và trạng từ. "Hiệu quả" có thể là *effective*, *effectively* hay *effectiveness*. Câu chêm hiện tại luôn dùng dạng gốc, nên ước khoảng 5–10% chỗ thay đúng nghĩa nhưng sai từ loại.

Hai hướng:
1. Chấp nhận, vì câu chêm vẫn theo ngữ pháp tiếng Việt và người học chủ yếu cần nhận ra nghĩa.
2. Thêm dạng từ cho thẻ (`forms: { noun, adverb }`) và luật chọn dạng theo chữ đứng trước ("tính", "sự" → danh từ).

Đề xuất: làm hướng 1 cho D1, ghi nhận phản hồi người dùng, rồi mới quyết hướng 2.

## Giới hạn của số đo này
- **Một người chấm, và cũng là người viết luật.** Cần người thứ hai (chủ sản phẩm) chấm lại ít nhất 100 chỗ thay ngẫu nhiên. Nếu hai người lệch nhau nhiều, số 95,1% không đáng tin.
- **Chỉ báo chính thống.** Facebook, diễn đàn, văn nói chưa thử; văn bản không dấu sẽ không khớp gì.
- **Thời điểm:** cả ba bộ bài lấy trong cùng một ngày, nhiều bài cùng chủ đề (Nvidia, APEC, lũ lụt). Cần bài ở nhiều ngày khác nhau.
- **Mới có 75 trên khoảng 570 thẻ.** Thẻ khó (cấp Chuyên gia) gần như không xuất hiện trên báo, nên Núm vặn hợp với từ phổ thông hơn.

## Đề xuất bước tiếp
1. **Chủ sản phẩm chấm lại** 100 chỗ thay ngẫu nhiên của test2 (mình chuẩn bị trang chấm).
2. **Chấm vòng 3** trên bộ bài mới lấy vào một ngày khác, gồm cả Facebook hoặc diễn đàn nếu lấy được.
3. Nếu vòng 3 ≥ 95% với cả hai người chấm: viết luật cho các thẻ còn lại (ưu tiên cấp Cơ bản, Trung cấp) và sang D1 (trình đọc trong app).
4. Nếu không đạt: thêm bộ tách từ tiếng Việt chạy trên máy, hoặc dùng lớp 2 (hỏi máy chủ) làm chính cho người dùng premium.
