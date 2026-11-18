# Lexica Blend: hồ sơ Chrome Web Store (issue #141)

## Việc chủ sản phẩm làm
1. Đăng ký tài khoản nhà phát triển Chrome Web Store (phí một lần, khoảng 5 USD) bằng tài khoản Google.
2. Tạo file cài: trong `apps/lexica` chạy `node extension/build.mjs`, rồi nén **nội dung** thư mục `extension/dist` (không nén thư mục cha).
3. Vào Developer Dashboard → New item → tải file zip lên, điền các mục dưới đây, nộp duyệt.

## Tên và mô tả
- **Tên:** Lexica Blend
- **Mô tả ngắn (≤ 132 ký tự):** Đọc web tiếng Việt, từ bạn đang học hiện bằng tiếng Anh ngay trong câu. Chạm để xem nghĩa và nghe phát âm.
- **Mô tả dài:**
  > Blend biến những trang tiếng Việt bạn vẫn đọc mỗi ngày thành bài học tiếng Anh.
  >
  > - Bật trên trang bạn muốn (VnExpress, Tuổi Trẻ, Thanh Niên…). Những từ bạn đang học hiện bằng tiếng Anh ngay trong câu, đúng kiểu câu chêm.
  > - Kéo "Mức tiếng Anh" để đổi ít hay nhiều từ.
  > - Chạm vào từ để xem cụm tiếng Việt gốc, phiên âm, nghĩa và nghe phát âm.
  > - Nối với Lexica: mở lexica.cortexlearn.app một lần trên trình duyệt này, tiện ích ưu tiên từ bạn sắp quên; từ bạn chạm sẽ vào lượt ôn tới trong Lexica.
  >
  > Riêng tư: việc đổi từ chạy hoàn toàn trên máy bạn. Tiện ích không gửi nội dung trang hay địa chỉ trang đi đâu, và không chạy trên trang đăng nhập, thanh toán, email hay ô nhập chữ.
- **Danh mục:** Education. **Ngôn ngữ:** Tiếng Việt.

## Quyền và lý do (mục "Privacy practices")
Từ bản 0.3, tiện ích **không xin quyền đọc mọi trang lúc cài**. Nó xin quyền **từng trang** khi người dùng bấm "Bật trên trang này".

| Quyền | Lý do điền vào form |
|---|---|
| `storage` | Lưu trang bạn đã bật, mức tiếng Anh, lịch ôn lấy từ Lexica và các từ đã chạm chờ gửi cho Lexica. |
| `activeTab` | Biết trang đang mở để popup bật/tắt đúng trang đó. |
| `scripting` | Chạy phần đổi từ trên đúng những trang người dùng đã bật (đăng ký content script theo từng trang). |
| `optional_host_permissions` (`http(s)://*/*`) | Chỉ được xin khi người dùng bấm "Bật trên trang này", cho đúng trang đó; tắt là trả lại quyền. |
| Content script trên `lexica.cortexlearn.app` | Đọc lịch ôn của bạn và chuyển cho Lexica các từ đã chạm, ngay trong trình duyệt; nhận mã tiện ích khi bạn đã đăng nhập. |
| `host_permissions`: API Cortex (`cortexapi-production-964a.up.railway.app`) | Với tài khoản: lấy lịch ôn và gửi các từ đã chạm (chỉ mã từ và thời điểm) để dùng trên mọi máy. |

- **Mục đích duy nhất (single purpose):** hiện từ tiếng Anh bạn đang học trong trang tiếng Việt bạn đọc.
- **Dữ liệu thu thập:** khi đã đăng nhập Lexica, tiện ích gửi về máy chủ Lexica **mã từ đã chạm và thời điểm** (để đưa vào lượt ôn). Không gửi nội dung trang, địa chỉ trang hay lịch sử duyệt web. Mục "User activity" trong form: không chọn; "Website content": không. Đánh dấu: không bán, không dùng cho mục đích khác, không dùng để xét tín dụng.
- **Remote code:** không. Toàn bộ mã nằm trong gói.
- **Chính sách riêng tư:** https://lexica.cortexlearn.app/privacy (mục "Blend: đọc bài và tiện ích Chrome").

## Hình ảnh (đã có trong `extension/store/`)
- Icon 128×128: `extension/dist/icon-128.png`.
- Ảnh chụp 1280×800: `store/screenshot-1280x800.png`. Đây là một trang demo tự viết, không phải trang báo thật, để không dùng thương hiệu của báo khác.
- Ảnh quảng bá nhỏ 440×280: `store/promo-440x280.png`.

## Rủi ro khi duyệt
- Đã dùng quyền theo từng trang nên rủi ro thấp hơn. Vẫn có thể bị hỏi vì `optional_host_permissions` rộng. Trả lời: chỉ xin khi người dùng bấm, cho đúng trang đó.
