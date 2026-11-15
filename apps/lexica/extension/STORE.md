# Lexica Núm vặn: hồ sơ Chrome Web Store (issue #141)

## Việc chủ sản phẩm làm
1. Đăng ký tài khoản nhà phát triển Chrome Web Store (phí một lần, khoảng 5 USD) bằng tài khoản Google.
2. Tạo file cài: trong `apps/lexica` chạy `node extension/build.mjs`, rồi nén **nội dung** thư mục `extension/dist` (không nén thư mục cha).
3. Vào Developer Dashboard → New item → tải file zip lên, điền các mục dưới đây, nộp duyệt.

## Tên và mô tả
- **Tên:** Lexica Núm vặn
- **Mô tả ngắn (≤ 132 ký tự):** Đọc web tiếng Việt, từ bạn đang học hiện bằng tiếng Anh ngay trong câu. Chạm để xem nghĩa và nghe phát âm.
- **Mô tả dài:**
  > Núm vặn biến những trang tiếng Việt bạn vẫn đọc mỗi ngày thành bài học tiếng Anh.
  >
  > - Bật trên trang bạn muốn (VnExpress, Tuổi Trẻ, Thanh Niên…). Những từ bạn đang học hiện bằng tiếng Anh ngay trong câu, đúng kiểu câu chêm.
  > - Kéo "Mức tiếng Anh" để đổi ít hay nhiều từ.
  > - Chạm vào từ để xem cụm tiếng Việt gốc, phiên âm, nghĩa và nghe phát âm.
  > - Nối với Lexica: mở lexica.cortexlearn.app một lần trên trình duyệt này, tiện ích ưu tiên từ bạn sắp quên; từ bạn chạm sẽ vào lượt ôn tới trong Lexica.
  >
  > Riêng tư: việc đổi từ chạy hoàn toàn trên máy bạn. Tiện ích không gửi nội dung trang hay địa chỉ trang đi đâu, và không chạy trên trang đăng nhập, thanh toán, email hay ô nhập chữ.
- **Danh mục:** Education. **Ngôn ngữ:** Tiếng Việt.

## Quyền và lý do (mục "Privacy practices")
| Quyền | Lý do điền vào form |
|---|---|
| `storage` | Lưu trang bạn đã bật, mức tiếng Anh, lịch ôn lấy từ Lexica và các từ đã chạm chờ gửi cho Lexica. |
| `activeTab` | Biết trang đang mở để popup bật/tắt đúng trang đó. |
| Content script trên `http(s)://*/*` | Đổi từ trên trang bạn đã bật. Trên trang chưa bật, script không làm gì. |
| Content script trên `lexica.cortexlearn.app` | Đọc lịch ôn của bạn và chuyển cho Lexica các từ đã chạm, ngay trong trình duyệt. |

- **Mục đích duy nhất (single purpose):** hiện từ tiếng Anh bạn đang học trong trang tiếng Việt bạn đọc.
- **Dữ liệu thu thập:** không. Đánh dấu: không bán, không dùng cho mục đích khác, không dùng để xét tín dụng.
- **Remote code:** không. Toàn bộ mã nằm trong gói.
- **Chính sách riêng tư:** https://lexica.cortexlearn.app/privacy (mục "Núm vặn: đọc bài và tiện ích Chrome").

## Hình ảnh cần chuẩn bị
- Icon 128×128: `extension/dist/icon-128.png` (đã có).
- Ít nhất 1 ảnh chụp 1280×800: một bài báo có câu chêm và ô nghĩa đang mở.
- Ảnh quảng bá nhỏ 440×280 (tuỳ chọn): logo Lexica + chữ "Đọc báo, học từ".

## Rủi ro khi duyệt
- Quyền đọc mọi trang (`http(s)://*/*`) làm việc duyệt lâu hơn và có thể bị hỏi thêm. Nếu bị từ chối, chuyển sang `optional_host_permissions` và xin quyền theo từng trang khi người dùng bấm "Bật trên trang này".
