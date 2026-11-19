# Lexica: kế hoạch đổi toàn bộ giao diện sang hướng B (11/2026)

Liên quan:
- quy tắc thiết kế: `docs/LEXICA_DESIGN_B.md`;
- trang trưng bày: `/dev/brand`;
- issue: #168.

## 1. Hiện trạng (đếm ngày 19/11/2026)
- **Quy mô:**
  - 43 trang (không tính `/dev`);
  - 67 component dùng chung;
  - 16 game trong `app/play`.
- **Màu đã đi qua biến** (`bg-surface`, `border-line`, `bg-accent`…). Đổi giá trị biến là cả app đổi theo. Đây là lợi thế lớn nhất.
- **Kiểu khung đang lặp lại**, chép tay ở mọi nơi:

| Kiểu | Số lần |
|---|---|
| Khung "rounded-2xl border border-line bg-surface" | 96 |
| Khung "rounded-xl border border-line" | 98 |
| Nền phụ `bg-surface-2` | 119 |
| Nhãn mono in hoa | 53 |
| Viền `border-accent` | 166 |
| Nút `bg-accent text-on-accent` | 76 |

  Vì chép tay nên màn này màn kia lệch nhau một chút. Đây là lý do UI "không đồng nhất".
- **Biểu tượng:** 99 file dùng lucide-react, nét mảnh. Hướng B cần nét dày và tròn hơn.

## 2. Cách làm: ba lớp, từ dưới lên
1. **Biến (tokens).** Đổi giá trị màu, font, góc bo cho cả hai nền. Mọi trang đổi màu ngay, không cần sửa từng trang.
2. **Thành phần dùng chung.** Thay các kiểu khung chép tay bằng một bộ component, đổi bằng script tìm-và-thay có kiểm tra:
   - `Card` (mềm / cứng);
   - `Button` (chính / phụ / nguy hiểm);
   - `Stat`, `Option`, `Chip`, `Sticker`, `SectionTitle`, `WordCard`, `TopicCard`;
   - `EmptyState`, `Sheet` (bảng trượt từ dưới lên).
3. **Bố cục từng màn.** Chỉ những màn chính mới vẽ lại bố cục theo bản mẫu. Các màn phụ chỉ cần lớp 1 và 2 là đã đồng nhất.

**Luật cứng cho mọi PR:**
- không thêm kiểu khung mới ngoài bộ component;
- không gradient;
- không chữ xuống dòng ở nhãn ngắn.

Có một bài kiểm tự động (mục 6) chặn những lỗi này.

## 3. Các chặng
| Chặng | Nội dung | Đụng tới | Ước tính |
|---|---|---|---|
| **D1. Nền móng** | Biến màu cho hai nền theo bảng trong `LEXICA_DESIGN_B.md`. Font Bricolage Grotesque đóng gói vào `app/fonts` (có bộ chữ tiếng Việt). Lớp tiện ích `.lx-hard`, `.lx-soft`, `.lx-sticker`. Ô "Giao diện" giữ Tối / Sáng / Theo máy, mặc định Tối. | `globals.css`, `fonts.css`, `layout.tsx`, `ThemeSync` | 1–2 ngày |
| **D2. Bộ component** | Viết bộ component ở mục 2, kèm trang `/dev/brand` hiển thị từng cái. Script đổi 96 + 98 khung chép tay sang `Card`, 76 nút sang `Button`. Đổi lucide sang nét dày hơn (`strokeWidth` 2.5) ở một chỗ dùng chung. | `components/ui/*`, khoảng 120 file đổi tự động | 3–4 ngày |
| **D3. Trang chủ** | Tiêu đề lớn ("3 thẻ mới đang chờ mở."), thẻ xòe theo chủ đề, nút mở phiên, ô số, khối Album và Blend, tuần học. Làm cho điện thoại và máy tính. Thanh điều hướng dưới kiểu mới. | `page.tsx`, `TodayCard`, `HomeHeader`, `AppNav`, `StepNumbers` | 2–3 ngày |
| **D4. Phiên học** | Ôn tập: thẻ câu hỏi màu chủ đề nghiêng nhẹ, lựa chọn 2×2, sticker "x4 liền!". Học từ mới: bộ thẻ quẹt dùng `WordCard` mới. Đọc, Nói. Màn tổng kết với `Burst`. | `ReviewSession`, `SwipeDeck`, `VocabCard`, `PassageReader`, `SpeakDrill`, `RecapHero`, `today/page` | 4–5 ngày |
| **D5. Sưu tầm và chơi** | Album dạng lá bài theo bộ, có tab, `Ribbon` "ĐỦ BỘ!", `Stamp`. Trang Chơi với thử thách lớn và 4 game hợp với bạn. Khung chung của game (`play/Shell`). Blend: sticker trong câu, bảng nghĩa trắng viền đen. | `album`, `play/*`, `blend/*`, `DialText` | 4–5 ngày |
| **D6. Phần còn lại và asset** | Từ của tôi, Tôi, Cài đặt, Luyện, Viết, Lớp, Bạn học, Lộ trình, Kiểm tra trình độ, onboarding (`TryFirst` dùng `WordCard` mới). Màn trống dùng `Cloud` / `PeekEyes` / `Smiley`. Icon app và ảnh chia sẻ theo kiểu mới. 16 biểu tượng game. | Còn lại | 4–6 ngày |

**Tổng:** khoảng 3–4 tuần công, chia thành 6 PR. Sau mỗi PR, app vẫn chạy được và nhìn hợp lý.

## 4. Thứ tự và vì sao
- **D1 và D2 trước:** đổi một chỗ ăn cả app. Sau D2, màn nào chưa vẽ lại cũng đã cùng một kiểu khung, cùng kiểu nút.
- **D3 và D4 tiếp theo:** trang chủ và phiên học là nơi người học ở lâu nhất. Đo tỉ lệ xong phiên đầu ngay sau D4.
- **D5:** Album và Chơi là nơi hướng B "sáng" nhất.
- **D6:** các màn ít dùng, cộng phần asset còn lại.

## 5. Những chỗ đổi hành vi (cần chủ sản phẩm biết)
- **Màu nhánh Giao tiếp (xanh trời) sẽ bỏ.** Hướng B dùng nhiều màu chủ đề; thêm một màu nhấn theo nhánh sẽ rối. Nhánh chỉ hiện bằng sticker "Chứng chỉ" / "Giao tiếp".
- **Giao diện sáng kiểu cũ** (nền giấy ấm, ô liu) được thay bằng bản sáng hướng B.
- **Thẻ từ phẳng ở #146 được thay bằng thẻ khối màu theo chủ đề.** Bậc thẻ hiện bằng khung trong; không có hiệu ứng bóng loáng.
- **Font Space Grotesk được thay bằng Bricolage Grotesque.** Font mono vẫn là JetBrains Mono.

## 6. Kiểm tra chất lượng
Đưa vào CI hoặc chạy trước mỗi PR:
- **Quét chữ xuống dòng:** script đã dùng ở #146, chạy 20 trang × 6 độ rộng, phải sạch.
- **Chụp màn hình so sánh:** các màn chính ở cả hai nền, điện thoại và máy tính, đính vào PR.
- **Kiểm tương phản:** chữ trên mọi màu chủ đề và trên xanh chanh phải đạt WCAG AA. Tất cả dùng chữ đen #16150F.
- **Cấm gradient:** grep `gradient` trong `app/` phải trống, trừ dòng kẻ của chữ viết tay nếu có.
- **"Giảm chuyển động":** thẻ không nghiêng động, không có hoa giấy bay.
- **Test e2e hiện có** (onboarding, luồng Hôm nay) phải qua. Hai test cũ đang lỗi ở trang chủ (2 khối "4 con số" trùng) sẽ sửa luôn ở D3.

## 7. Rủi ro
| Rủi ro | Giảm bằng |
|---|---|
| Script đổi khung tự động làm vỡ bố cục vài chỗ | Đổi theo từng thư mục; chụp màn hình trước và sau; sửa tay chỗ lệch |
| Viền dày và bóng đổ làm màn nhỏ chật | Ô "mềm" (viền 2px, không bóng ở nền tối) cho danh sách dày; khối "cứng" chỉ cho thứ quan trọng |
| Nhiều màu khối làm rối | Mỗi màn tối đa một khối màu lớn và một màu chính (xanh chanh) |
| Font mới tăng dung lượng tải | Chỉ đóng gói 3 độ đậm (500/700/800), bộ chữ Latin và tiếng Việt |
| Người dùng cũ bất ngờ | Thông báo một lần "Lexica có giao diện mới"; giữ lựa chọn nền đã chọn |

## 8. Đo sau khi xong
So 2 tuần trước và sau D4, rồi sau D6:
- tỉ lệ xong phiên đầu;
- tỉ lệ quay lại ngày 1 và ngày 7;
- số người mở Album;
- số phiên mỗi tuần.
