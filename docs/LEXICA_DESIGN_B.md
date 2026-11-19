# Lexica: hệ thiết kế hướng B "Thẻ sưu tầm" (11/2026)

Chủ sản phẩm đã chọn hướng B (bản mẫu ngày 18/11/2026):
- **Nền tối** là mặc định.
- **Nền sáng** là giấy kem với cùng viền đen.

Trang trưng bày: `/dev/brand` (bấm Tối / Sáng).

## Nguyên tắc
1. **Phẳng 2D, không gradient, không mờ, không bóng mềm.** Bóng đổ luôn là khối đen lệch xuống phải.
2. **Một thành phần, một kiểu.** Nút chính, ô số, lựa chọn, sticker, thẻ từ đều có đúng một mẫu, dùng lại ở mọi màn. Không tự chế biến thể.
3. **Màu khối mang nghĩa.**
   - Mỗi chủ đề có một màu cố định.
   - Xanh chanh chỉ dùng cho "việc chính / đang chọn / đúng".
   - Vàng dùng cho phần thưởng và chuỗi ngày.
4. **Chữ trên khối màu luôn là đen** (#16150F). Không đặt chữ màu lên nền màu.
5. **Nghiêng có chừng mực:** chỉ thẻ từ và sticker được nghiêng. Góc nghiêng lấy từ `TILTS` (−6…5°), không ngẫu nhiên mỗi lần vẽ.
6. **Không chữ nào bị xuống dòng ở nhãn ngắn.** Kiểm bằng script quét (đã có từ #146).

**Quy tắc màu (sửa ngày 19/11 sau góp ý "lố, loè loẹt"):**
- Mỗi màn **một** khối xanh chanh: việc chính, hoặc đáp án đúng ngay lúc trả lời.
- Trạng thái "đang chọn" dùng khối mực (đen trên nền sáng, kem trên nền tối), không dùng chanh.
- Ô số quan trọng chỉ có một vạch chanh nhỏ.
- Đáp án sai là ô trắng viền đỏ, gạch ngang.
- Sticker mặc định nền trắng; chỉ chuỗi ngày được tô vàng.
- Khối màu chủ đề chỉ cho thẻ từ và phần thưởng, tối đa một khối lớn mỗi màn.

## Biến (tokens)
| Biến | Tối | Sáng |
|---|---|---|
| nền | #101012 | #FBF6EA |
| ô (surface) | #1B1B1F, viền #2C2C33 | #FFFFFF, viền #16150F |
| chữ | #F4F2EA | #16150F |
| chữ phụ | #9C9AA3 | #6A665B |
| chữ mờ nhất (subtle) | #898890 | #706B64 |
| đỏ (lỗi, xoá) | #FF6B5B | #C83524 |
| xanh chanh khi làm chữ/viền | #C6F432 | #3F5A00 |
| viền / bóng của khối "cứng" | #000 | #16150F |
| xanh chanh (chính) | #C6F432 | #C6F432 (chỉ làm nền, chữ đen) |

**Tương phản:** mọi màu chữ trên nền, ô và ô phụ phải đạt WCAG AA (4.5:1). Chữ mờ nhất và màu đỏ ở bảng trên đã được chỉnh ngày 19/11 cho đạt. Chữ trên khối màu chủ đề, màu game và xanh chanh luôn là #16150F.

**Giảm chuyển động:** app theo cài đặt của máy (`MotionConfig reducedMotion="user"`). Các hiệu ứng lặp (nhấp nháy, nảy) dừng. Vòng xoay "đang tải" vẫn chạy. Thẻ nghiêng là nghiêng tĩnh, không động.

**Màu chủ đề** (`lib/brand.ts` `TOPIC_BLOCK`), dùng chung cho cả hai nền:

| Chủ đề | Màu |
|---|---|
| Tiền bạc | #F2C230 |
| Công sở | #5B8DEF |
| Hẹn hò | #FF7BA0 |
| Học hành | #A98BFF |
| Mạng xã hội | #3FD0C9 |
| Ăn uống | #FF8A4C |
| Bạn bè & nhà | #7BD389 |
| Đời sống | #B9BDC6 |

**Hình khối:**
- Khối "cứng" (thẻ, nút chính, phần thưởng): viền 2px, bóng 3px, góc bo 18–26px.
- Ô "mềm":
  - nền tối: viền 1.5px, không bóng;
  - nền sáng: viền 1.5px và bóng 2px.
- Sticker: viền 1.5px, bóng 2px, bo tròn hẳn.
- Lớp trang trí lớn (thẻ chủ đề trong bản mẫu, đồ trang trí) có thể dày hơn; giao diện thao tác thì giữ mảnh như trên để không nặng.

**Chữ:**
- Bricolage Grotesque: 800 cho tiêu đề và số, 700 cho nhãn nút, 500 cho chữ thường.
- JetBrains Mono in hoa cho nhãn nhỏ (tên chủ đề, mốc).
- Cả hai font có tiếng Việt. Font sẽ đóng gói thành file trong `app/fonts`, không tải từ Google lúc chạy.

## Thành phần cơ bản
- **Nút chính:** khối xanh chanh, cứng, chữ đen 800, có thời lượng ở bên phải bằng mono.
- **Nút phụ:** ô mềm.
- **Ô số** (12 chờ ôn, 128 đã hiểu…): ô mềm. Ô quan trọng nhất là xanh chanh.
- **Lựa chọn trong câu hỏi:** ô mềm. Khi chọn hoặc đúng thì thành khối xanh chanh có bóng; khi sai thì khối hồng.
- **Thẻ từ:** khối màu theo chủ đề, nhãn chủ đề mono, biểu tượng chủ đề, từ tiếng Anh 800 ở dưới, viền và bóng đen. Bậc thẻ:
  - Bạc / Holo / Huyền thoại thêm một khung trong;
  - Holo khung xanh chanh, Huyền thoại khung vàng;
  - không dùng hiệu ứng bóng loáng.
- **Sticker:** nhãn bo tròn nhỏ cho chuỗi ngày, combo ("x4 liền!"), số nhiệm vụ, nguồn bài báo.
- **Thanh điều hướng dưới:** biểu tượng nét. Mục đang chọn có ô xanh chanh viền đen quanh biểu tượng.

## Asset trang trí (`components/brand/`)
- `TopicIcon`: 8 biểu tượng chủ đề, nét tròn dày, lưới 56×56.
- `Decor`:
  - `Burst`: sao nổ sau con số lớn hoặc phần thưởng.
  - `Sparkle`: lấp lánh 4 cánh.
  - `Squiggle`: gạch chân lượn sóng.
  - `DoodleArrow`: mũi tên vẽ tay.
  - `Flame`: lửa chuỗi ngày.
  - `Blob`: khối tròn méo sau biểu tượng hoặc ở màn trống.
  - `DotGrid`: lưới chấm cho góc trống.
  - `Sticker`.
- **Đợt 2:**
  - `Star`, `Heart`, `Bolt`, `Crown`, `Check`, `Smiley`: đánh giá, đúng, combo, huyền thoại, màn vui;
  - `Bubble`: bong bóng lời thoại có chữ;
  - `Cloud`, `Rainbow`: màn trống, cột mốc. Cầu vồng là các dải màu đặc, không gradient;
  - `Trophy`: ngày 30, cột mốc;
  - `Speaker`: nghe, giọng mẫu;
  - `Pencil`: Viết, câu của bạn;
  - `Stamp`: con dấu tròn "ĐÃ THUỘC";
  - `Ribbon`: băng rôn "ĐỦ BỘ!";
  - `Tape`: băng dính dán thẻ hoặc ghi chú;
  - `Confetti`: góc ăn mừng;
  - `ScribbleCircle`: khoanh tay quanh từ hoặc đáp án;
  - `PeekEyes`: đôi mắt ló lên ở màn trống.
- **Cần vẽ thêm** (đợt sau):
  - minh hoạ cho màn trống (chưa có từ, chưa có bài);
  - hình cho onboarding;
  - icon ứng dụng và ảnh chia sẻ theo kiểu mới;
  - biểu tượng cho 16 game.

## Áp vào app (từng bước, mỗi bước một PR)
1. **D1. Nền móng:**
   - biến màu cho hai nền, font đóng gói;
   - lớp tiện ích `.lx-hard`, `.lx-soft`, `.lx-sticker`;
   - thay `ThemeSync` / màu nhánh cũ.
2. **D2. Thành phần dùng chung:** Button, Stat, Option, Sticker, WordCard mới, AppNav.
3. **D3. Trang chủ và Hôm nay:** tiêu đề lớn, thẻ xòe, nút mở phiên, tuần học, Album / Blend.
4. **D4. Ôn tập và học từ:** thẻ câu hỏi nghiêng theo chủ đề, lựa chọn 2×2, sticker combo.
5. **D5. Album, Chơi, Blend, tổng kết cuối phiên.**
6. **D6. Phần còn lại:**
   - Từ của tôi, Tôi, Cài đặt, Luyện nói, Viết, các game;
   - asset còn thiếu;
   - ảnh chia sẻ.

**Sau mỗi bước:**
- quét chữ xuống dòng;
- chụp màn hình cả hai nền.

**Đo:**
- tỉ lệ xong phiên đầu;
- quay lại ngày 1 và ngày 7;
- số người mở Album.
