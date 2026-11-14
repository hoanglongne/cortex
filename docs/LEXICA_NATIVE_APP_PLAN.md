# Lexica thành app iOS và Android (kế hoạch, 11/2026)

**Mục tiêu:** đưa Núm vặn ra khỏi Lexica, vào nơi người học vốn đọc và viết trên điện thoại. Web app (PWA) không làm được việc này. App gốc làm được:

| Việc | PWA hiện tại | App gốc |
|---|---|---|
| Nhận bài qua nút Chia sẻ | Android: có (đã làm, `share_target`). iPhone: **không** | Cả hai |
| Núm vặn ngay trong trình duyệt | Không | iPhone: **Safari Web Extension**. Android: Firefox có tiện ích; Chrome Android không |
| Bàn phím Lexica (chiều viết, gõ tiếng Việt xen chỗ bí → gợi ý từ) | Không | Cả hai (bàn phím tuỳ chỉnh) |
| Thông báo đẩy ổn định | iPhone chỉ khi đã "Thêm vào màn hình chính" | Cả hai |
| Có mặt trên App Store, Google Play | Không | Có |

**Trạng thái:** kế hoạch, chưa có code. Các chi tiết về chính sách cửa hàng, phí và giới hạn hệ điều hành là theo hiểu biết của mình, **phải đọc lại tài liệu chính thức của Apple và Google trước khi làm**.

---

## 1. Chọn cách đóng gói

| Cách | Mô tả | Ưu | Nhược |
|---|---|---|---|
| **A. Capacitor, nạp web đang chạy** | App là một khung web view mở `lexica.app` (hoặc tên miền thật), cộng các phần gốc (chia sẻ, tiện ích, bàn phím) | Dùng lại 100% code Next.js; cập nhật web là app cập nhật theo | Apple có thể từ chối app "chỉ là trang web bọc lại" (guideline 4.2). Cần offline tối thiểu |
| **B. Capacitor, đóng gói tĩnh** | `next build` xuất tĩnh vào app, API gọi về máy chủ | Chạy offline tốt, ít rủi ro 4.2 hơn | Lexica đang dùng route máy chủ của Next (`/api/...`): phải chuyển các route này sang `cortex-core-api` |
| C. Viết lại bằng React Native / Swift / Kotlin | App gốc hoàn toàn | Trải nghiệm tốt nhất | Viết lại toàn bộ, nhiều tháng. **Không làm** |

**Đề xuất: A trước, chuyển dần sang B.**
- A ra nhanh nhất để kiểm chứng.
- Rủi ro 4.2 giảm được vì app có thật các phần gốc (tiện ích Safari, nút chia sẻ, bàn phím, thông báo đẩy), không chỉ là trang web.
- Nếu Apple vẫn từ chối, chuyển sang B. Việc chuyển các route `/api/dial/article`, `/api/word-index` sang `cortex-core-api` nên làm sớm, kể cả khi không cần B.

---

## 2. Các phần gốc cần xây

### 2.1 Nhận bài qua nút Chia sẻ
- **iPhone, Share Extension** (một target Swift nhỏ trong project Xcode):
  - nhận URL hoặc chữ từ Safari, Facebook, app báo;
  - mở app chính bằng `lexica://num-van?url=…`, hoặc ghi vào App Group rồi mở app.
  - Facebook thường chỉ chia sẻ link bài viết, mà link Facebook thì máy chủ không tải được (cần đăng nhập). Với Facebook, phải hướng dẫn người dùng chọn chữ rồi chia sẻ chữ.
- **Android:** khai báo `intent-filter` `ACTION_SEND` kiểu `text/plain` trong `AndroidManifest.xml`. Capacitor chuyển nội dung nhận được sang route `/num-van`.
- **Dùng lại:** trang `/num-van` và `/api/dial/article` đã có.

### 2.2 Núm vặn trong trình duyệt
- **iPhone, Safari Web Extension:**
  - Apple cho phép tiện ích Safari trên iOS, đóng gói kèm trong app.
  - Định dạng gần như giống tiện ích Chrome (WebExtension). **Content script, matcher và rules đã có ở `apps/lexica/extension` dùng lại được.** Phải sửa phần `chrome.storage` (dùng `browser.storage`), popup, và cách bật theo trang.
  - Người dùng phải tự bật tiện ích trong Cài đặt → Safari → Tiện ích. Cần màn hướng dẫn từng bước trong app.
- **Android:**
  - Chrome Android không cho tiện ích. Firefox Android và Samsung Internet có, nhưng ít người Việt dùng.
  - Hướng chính trên Android là nút Chia sẻ (2.1).
  - Lựa chọn mạnh hơn: dịch vụ trợ năng (Accessibility Service) đọc và phủ chữ lên mọi app. **Không làm**: Google siết rất chặt quyền này với app không phục vụ người khuyết tật, rủi ro bị gỡ khỏi Play cao, và về riêng tư là đọc mọi thứ trên màn hình.

### 2.3 Bàn phím Lexica (chiều viết)
- Bàn phím tuỳ chỉnh: người dùng gõ tiếng Anh, chỗ nào bí thì gõ tiếng Việt. Thanh gợi ý hiện từ tiếng Anh đang học. Chọn gợi ý thì ghi bằng chứng "dùng ngoài đời" (tầng `wild` trong `docs/LEXICA_WOW_PLAN.md` mục 1).
- **iPhone:** Custom Keyboard Extension (Swift). Mặc định không có mạng và bị giới hạn bộ nhớ (vài chục MB). Matcher phải chạy bằng Swift, hoặc JavaScriptCore chạy lại `match.ts` đã biên dịch. Cần "Full Access" chỉ khi gửi dữ liệu đi; **thiết kế để không cần**.
- **Android:** InputMethodService (Kotlin).
- **Rủi ro:** bàn phím là phần nhạy cảm nhất về riêng tư (thấy mọi thứ người dùng gõ). Phải xử lý hoàn toàn trên máy, không ghi lại nội dung gõ, chỉ ghi `{wordId, at}`. Ghi rõ điều này trong mô tả trên cửa hàng.
- **Làm sau cùng**, sau khi chia sẻ và tiện ích Safari đã có người dùng.

### 2.4 Thông báo đẩy
- Dùng `@capacitor/push-notifications` (APNs cho iPhone, FCM cho Android).
- Nối vào hệ thống thông báo đã có (`docs/LEXICA_PUSH_SPEC.md`): máy chủ chọn kênh theo loại thiết bị.

### 2.5 Đăng nhập
- Supabase Auth trong web view dùng được. Đăng nhập Google hoặc Apple cần deep link quay lại app (`lexica://auth-callback`).
- **Apple bắt buộc có "Sign in with Apple"** nếu app có đăng nhập bằng bên thứ ba như Google (guideline 4.8). Cần bật nhà cung cấp Apple trong Supabase.

---

## 3. Tiền và cửa hàng
- **Gói trả tiền mua trong app:**
  - Apple và Google yêu cầu dùng thanh toán trong app (IAP) cho nội dung số. Phí khoảng 15% (chương trình doanh nghiệp nhỏ) đến 30%.
  - Có thể vẫn bán qua web với giá riêng, nhưng quy định về việc dẫn link ra ngoài app thay đổi theo từng nước. Phải kiểm tra quy định hiện hành cho Việt Nam.
  - Đề xuất dùng RevenueCat hoặc tương tự để gộp IAP hai bên với gói trên web, và đồng bộ quyền premium về Supabase.
- **Phí tài khoản nhà phát triển:** Apple khoảng 99 USD/năm, Google khoảng 25 USD một lần.
- **Máy để build iOS:** cần macOS và Xcode. Không có máy Mac thì dùng máy ảo macOS trên CI (GitHub Actions macOS runner, Codemagic, Bitrise). Phí theo phút.
- **Hồ sơ riêng tư:**
  - App Privacy (Apple), Data safety (Google): khai báo đúng những gì thu (tài khoản, tiến độ học, ghi âm nếu có Oratio, giọng nói nếu có Giọng bạn).
  - Ghi âm và giọng nói phải xin quyền micro, kèm mô tả lý do bằng tiếng Việt.

---

## 4. Lộ trình

| Chặng | Nội dung | Ước tính | Xong khi |
|---|---|---|---|
| **N0: chuẩn bị** | Tài khoản Apple và Google; chọn tên miền chính thức; chuyển `/api/dial/article` sang `cortex-core-api`; CI build iOS trên macOS | 1 tuần | Build được app trống chạy trên máy thật |
| **N1: khung app** | Capacitor (cách A), icon và màn khởi động từ logo mới, deep link, Sign in with Apple, offline tối thiểu (màn "mất mạng"), thông báo đẩy | 2–3 tuần | Bản TestFlight và Play Internal Testing cho 10–20 người |
| **N2: Chia sẻ** | Share Extension iPhone, intent Android → `/num-van` | 1–2 tuần | Chia sẻ từ Safari, Chrome, VnExpress app mở đúng bài trên cả hai |
| **N3: Safari Web Extension** | Chuyển tiện ích Chrome sang Safari, màn hướng dẫn bật tiện ích, đồng bộ mức và trang đã bật với app | 2 tuần | Đọc VnExpress trong Safari có câu chêm |
| **N4: Nộp cửa hàng** | Ảnh cửa hàng, mô tả, hồ sơ riêng tư, IAP cho gói premium | 1–2 tuần + thời gian duyệt | Được duyệt trên cả hai cửa hàng |
| **N5: Bàn phím** | Bàn phím iPhone và Android cho chiều viết | 4–6 tuần | Sau khi N2, N3 có số liệu dùng thật |

Các ước tính là của mình, cho một người làm toàn thời gian quen Capacitor. **Phần Swift/Kotlin (N2, N3, N5) là phần dễ trượt nhất.**

**Phụ thuộc:**
- Núm vặn phải có luật cho nhiều thẻ hơn (hiện 75/570) và nối với lịch ôn. Nếu không, tiện ích và nút chia sẻ có nhưng mỗi bài chỉ đổi vài từ.
- Tên miền và thương hiệu chính thức (logo đã có).

## 5. Rủi ro
| Rủi ro | Mức | Giảm bằng |
|---|---|---|
| Apple từ chối vì "chỉ là web bọc lại" (4.2) | Vừa | Có phần gốc thật (chia sẻ, tiện ích Safari, thông báo); nếu vẫn bị từ chối thì chuyển sang cách B |
| Người dùng không bật tiện ích Safari (phải vào Cài đặt) | Cao | Màn hướng dẫn có ảnh; nút chia sẻ vẫn chạy khi không bật tiện ích |
| Phí IAP ăn vào giá gói | Vừa | Giá trong app khác giá web; RevenueCat để quản lý |
| Bàn phím bị nghi ngờ về riêng tư | Cao | Xử lý trên máy, không cần Full Access, nói rõ trong mô tả; làm sau cùng |
| Bảo trì hai phần gốc (Swift, Kotlin) | Vừa | Giữ phần gốc thật mỏng; mọi logic (matcher, rules) ở TypeScript dùng chung |

## 6. Đã chốt (14/11/2026)
- **Cách A (Capacitor nạp web)**, đã nêu rõ nhược điểm (mục 7).
- **Tên miền:** một tên miền Cortex dưới 30 USD/năm; Lexica là tên miền con (`lexica.<tên miền>`). Chưa mua.
- **Tài khoản nhà phát triển:** cá nhân (không cần D-U-N-S). Tên người bán trên App Store sẽ là tên cá nhân.
- **Build iOS:** dùng máy Mac của chủ sản phẩm.
- **Gói trả tiền:** ban đầu chỉ bán trên web. App không có nút mua, không nhắc giá, không dẫn link ra trang thanh toán, trừ khi quy định cho Việt Nam cho phép (kiểm tra lại trước khi nộp).

## 7. Nhược điểm của cách A, nói thẳng
1. **Rủi ro bị Apple từ chối (4.2).** App chủ yếu là web view. Phần gốc (chia sẻ, tiện ích Safari) giảm rủi ro, không xoá được. Bị từ chối thì mất 1–3 vòng duyệt, hoặc phải chuyển sang cách B.
2. **Không mạng là không dùng được.** App nạp web từ máy chủ: mất mạng thì chỉ còn màn "mất mạng" (service worker giúp được phần đã tải). Người học trên xe buýt, vùng sóng yếu sẽ thấy rõ.
3. **Cảm giác "không phải app thật".** Cuộn, chuyển trang, bàn phím, vuốt quay lại vẫn là của trình duyệt. Người dùng iPhone khó tính sẽ nhận ra.
4. **Máy chủ sập là app sập.** Vercel hoặc tên miền lỗi thì app trên cửa hàng cũng trắng màn hình.
5. **Khó kiểm soát phiên bản.** Web cập nhật là mọi app cập nhật ngay, kể cả khi bản web mới hỏng phần gốc (ví dụ đổi đường dẫn `/num-van` làm nút chia sẻ hỏng). Cần test phần gốc trước mỗi lần deploy web.
6. **Phần gốc vẫn phải viết bằng Swift/Kotlin.** Chia sẻ, tiện ích Safari, bàn phím không làm bằng web được. Đây là phần tốn công và dễ lỗi nhất, Capacitor không giúp.
7. **Hiệu năng của tác vụ nặng.** Chấm phát âm và Whisper trên máy chạy trong web view chậm hơn và tốn pin hơn so với chạy gốc. Trên iPhone, WebGPU trong web view có thể bị hạn chế.
8. **Bán trên web làm app kém tiện.** Người dùng iPhone không mua được trong app, phải tự lên web. Tỉ lệ chuyển đổi sẽ thấp hơn so với có IAP.
9. **Tài khoản cá nhân.** Tên và có thể địa chỉ cá nhân của bạn hiện công khai trên cửa hàng. Sau này đổi sang công ty phải chuyển app, khá phiền.

## 8. Câu hỏi cũ
1. Có đồng ý cách A (Capacitor nạp web) để ra nhanh không?
2. Tên miền chính thức của Lexica là gì? Deep link và Sign in with Apple cần nó.
3. Ai đứng tên tài khoản nhà phát triển: cá nhân hay công ty? Công ty cần mã D-U-N-S với Apple.
4. Có máy Mac không, hay dùng máy build trên CI?
5. Gói premium trên app bán qua IAP ngay, hay giai đoạn đầu chỉ bán trên web?
