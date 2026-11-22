# Lexica Blend: hồ sơ Chrome Web Store (issue #141)

Các bước dưới đây theo tài liệu chính thức của Google, đọc ngày 20/11/2026:
- developer.chrome.com/docs/webstore/register
- developer.chrome.com/docs/webstore/set-up-account
- developer.chrome.com/docs/webstore/publish
- developer.chrome.com/docs/webstore/review-process

Giao diện trang của Google có thể đổi chữ; tên các mục ghi bằng tiếng Anh như trên trang.

## Bước 1. Đăng ký tài khoản nhà phát triển (một lần)
1. **Chọn email cho tài khoản.** Google khuyên dùng một tài khoản Google **mới, chỉ để đăng tiện ích**.
   - Mọi thư quan trọng sẽ gửi về email này: duyệt, từ chối, gỡ tiện ích.
   - **Sau khi tạo không đổi được email.** Muốn đổi phải tạo tài khoản mới rồi chuyển tiện ích sang.
   - Gợi ý: tạo một Gmail riêng cho Cortex, ví dụ dùng chung cho mọi ứng dụng của Cortex.
2. Đăng nhập email đó, mở **Chrome Web Store Developer Dashboard**: https://chrome.google.com/webstore/devconsole
3. Lần đầu mở sẽ hiện màn đăng ký:
   - đồng ý **Developer Agreement** và các chính sách;
   - trả **phí đăng ký một lần**: thường là 5 USD, trả bằng thẻ qua Google Payments. Trang của Google không ghi số tiền, nên xem đúng số trên màn hình lúc trả.
   - Trả xong, màn này không hiện lại nữa.
4. **Việt Nam có trong danh sách nước được đăng ký.**

## Bước 2. Điền thông tin tài khoản (trang Account, menu bên trái)
- **Publisher name (bắt buộc):** tên hiện ở dòng "Offered by:" trên trang tiện ích. Gợi ý: `Cortex Learn` (hoặc tên bạn muốn công khai).
- **Verify your email (bắt buộc):** bấm *Add email*, nhập email liên hệ, bấm *Verify email*, rồi mở thư và bấm link xác minh.
  - Email này hiện công khai ở phần liên hệ của tiện ích. Nên dùng email hỗ trợ chung, không dùng email cá nhân.
- **Physical address:** chỉ bắt buộc khi tiện ích có bán hàng hoặc thu phí. Blend miễn phí nên không cần.
- **Trader / Non-trader:** Google có thể hỏi bạn là "trader" (kinh doanh) hay "non-trader" (cá nhân, không vì mục đích kinh doanh). Đây là quy định của EU.
  - Chọn **trader** thì phải xác minh tên pháp lý và thông tin liên hệ, và các thông tin này **hiện công khai** cho người dùng.
  - Lexica là sản phẩm của Cortex nên có thể bị coi là kinh doanh. Bạn tự quyết, vì đây là cam kết pháp lý của chủ tài khoản.
- **Trusted tester accounts (không bắt buộc):** danh sách email (cách nhau bằng dấu phẩy) được cài thử bản "Private" trước khi mở công khai.
- **Notifications:** bật thông báo khi tiện ích được duyệt hoặc được đăng.

## Bước 3. Tạo file cài
1. Trong `apps/lexica` chạy `node extension/build.mjs`.
2. Vào thư mục `extension/dist`, nén **nội dung bên trong** (không nén thư mục `dist`):
   - macOS/Linux: `cd extension/dist && zip -r ../lexica-blend.zip .`
   - Windows: mở `dist`, chọn hết các file, chuột phải, chọn *Compress to ZIP file*.
3. Mỗi lần nộp bản mới phải **tăng `version`** trong `extension/src/manifest.json` (ví dụ 0.5.0 lên 0.5.1). Google không nhận bản có số phiên bản bằng hoặc thấp hơn bản cũ.

## Bước 4. Tạo tiện ích trên Dashboard
1. Dashboard → **Add new item** → *Choose file* → chọn file zip → *Upload*.
   - Tài khoản mới được đăng tối đa **2 tiện ích**. Blend chỉ dùng 1.
2. Điền 5 thẻ bên trái theo các mục ở dưới:
   - **Package:** chỉ xem, không sửa được.
   - **Store listing:** mô tả, danh mục, ngôn ngữ, ảnh. Xem mục "Tên và mô tả" và "Hình ảnh".
   - **Privacy:** mục đích duy nhất, lý do từng quyền, mã từ xa, dữ liệu thu thập, link chính sách riêng tư. Xem mục "Quyền và lý do".
   - **Distribution:**
     - **Visibility:**
       - *Public:* ai cũng thấy;
       - *Unlisted:* không hiện khi tìm kiếm, ai có link mới cài được;
       - *Private:* chỉ tester trong danh sách.
       - Cả ba đều qua cùng một vòng duyệt.
     - Gợi ý: lần đầu chọn **Unlisted** để tự cài và gửi link cho vài người thử, ổn rồi mới chuyển *Public*.
     - **Regions:** để *All regions*, hoặc chỉ chọn Việt Nam.
     - Miễn phí: không bật bán.
   - **Test instructions:** không bắt buộc. Nên ghi cho người duyệt:
     > Mở một trang tiếng Việt (ví dụ vnexpress.net), bấm biểu tượng Blend, chọn "Bật trên trang này", cho phép quyền trang. Các từ tiếng Anh hiện trong câu; chạm một từ để xem nghĩa. Không cần tài khoản.
3. Bấm **Submit for review**.
   - Hộp xác nhận có ô "publish automatically". Bỏ chọn nếu muốn tự bấm đăng sau khi duyệt xong.
   - Nếu bỏ chọn: có **30 ngày** để bấm đăng, quá hạn thì phải nộp duyệt lại.

## Bước 5. Chờ duyệt
- Phần lớn tiện ích được duyệt **trong vài ngày**, có khi **vài tuần**. Quá **3 tuần** thì liên hệ hỗ trợ của Google.
- Duyệt lâu hơn với tiện ích **xin quyền rộng** như `https://*/*`.
  - Blend chỉ khai quyền này ở dạng `optional_host_permissions`: chỉ xin khi người dùng bấm, cho đúng trang đó.
  - Nhắc lại điều này trong ô lý do quyền.
- Bị từ chối: Google gửi email nêu lý do. Sửa, tăng `version`, nộp lại.

## Cập nhật bản mới sau này
1. Tăng `version` trong `extension/src/manifest.json`.
2. Build và nén lại như Bước 3.
3. Dashboard → chọn Blend → thẻ **Package** → **Upload new package** → sửa listing nếu cần → **Submit for review**. Mỗi bản mới đều phải duyệt lại.

## Tên và mô tả
- **Tên:** Lexica Blend
- **Mô tả ngắn (≤ 132 ký tự):** Đọc web tiếng Việt, từ bạn đang học hiện bằng tiếng Anh ngay trong câu. Chạm để xem nghĩa và nghe phát âm.
- **Mô tả dài:**
  > Blend biến những trang tiếng Việt bạn vẫn đọc mỗi ngày thành bài học tiếng Anh.
  >
  > - Bật trên trang bạn muốn (VnExpress, Tuổi Trẻ, Thanh Niên…). Những từ bạn đang học hiện bằng tiếng Anh ngay trong câu, đúng kiểu câu chêm.
  > - Chọn "Cường độ" (Nhẹ, Vừa, Nhiều) để đổi ít hay nhiều từ, và "Cách hiện": thay hẳn, chỉ tô sáng, hoặc cả hai.
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
- Dựng lại cả hai ảnh (sau khi đổi giao diện): trong `apps/lexica` chạy `node extension/store/make.mjs`. Ảnh dùng đúng `src/content.css` của tiện ích.

- Ảnh quảng bá lớn 1400×560 (marquee): không bắt buộc, chưa làm.

Theo Google, chỉ **icon 128×128** và **ít nhất 1 ảnh chụp 1280×800** là bắt buộc (tối đa 5 ảnh). Ảnh nhỏ 440×280 và video YouTube không bắt buộc.

## Rủi ro khi duyệt
- Đã dùng quyền theo từng trang nên rủi ro thấp hơn. Vẫn có thể bị hỏi vì `optional_host_permissions` rộng. Trả lời: chỉ xin khi người dùng bấm, cho đúng trang đó.
- `manifest.json` còn khớp `http://localhost:3000/*` và `https://cortex-lexica.vercel.app/*` trong content script nối với Lexica. Hai địa chỉ này chỉ dùng khi phát triển. Nên bỏ trước khi nộp để danh sách trang gọn và dễ giải thích.
