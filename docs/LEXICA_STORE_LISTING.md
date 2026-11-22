# Hồ sơ cửa hàng Lexica (N4, issue #144), bản nháp 22/11/2026

Soạn từ mã và trang `/privacy` hiện tại. **Chưa nộp, chưa có tài khoản cửa hàng nào.** Mọi ô khai báo dưới đây bạn phải tự đọc lại và xác nhận, vì khai sai có thể bị gỡ app. Chỗ tôi chưa chắc ghi là "cần xác nhận".

## 1. Chặn nộp (làm trước khi nộp)
1. **Xóa tài khoản ngay trong app: đã làm (chưa chạy trên Supabase thật).** Nút "Xóa tài khoản" trong Cài đặt (và trang công khai `/xoa-tai-khoan`, địa chỉ web cho Google). Phía máy chủ là hàm `delete_my_account()` trong `apps/lexica/supabase/migration_delete_account.sql`. **Bạn phải chạy file SQL này trên Supabase SQL Editor trước**, nếu không nút báo "Chưa xóa được". Đã thử hàm trên Postgres 16 tạm (xóa theo cascade, đặt NULL cho cột không có quy tắc xóa, chạy lại được, từ chối khi chưa đăng nhập), chưa thử trên Supabase thật. Giáo viên xóa tài khoản thì các lớp họ tạo cũng bị xóa theo (app đã cảnh báo). Chưa kiểm tra các bảng của Oratio/Teach/Studio dùng chung dự án Supabase (cột `created_by`, `reviewer_id` được đặt NULL tự động).
2. **Hỏi bạn micro (đã thêm):** `NSMicrophoneUsageDescription` (iOS) và `RECORD_AUDIO` (Android) đã có trong mã. Chưa thử xin quyền trên máy thật.
3. **Nhận dạng giọng nói trong WebView:** mã dùng `SpeechRecognition` của trình duyệt, mà iOS WKWebView không có. Luật dự phòng là gửi âm thanh tới máy chủ Cortex. **Cần xác nhận luyện nói chạy được trong app** trước khi quảng cáo tính năng này.
4. **Đăng nhập bằng Apple: không bắt buộc.** Lexica chỉ đăng nhập bằng email, không có đăng nhập qua Google/Facebook, nên luật 4.8 không áp dụng. Có thể bỏ mục này khỏi issue #144.
5. **Không có mua hàng trong app.** Không nút mua, không nhắc giá (đúng quyết định đã chốt). Giữ nguyên, nếu không sẽ phải làm IAP.

## 2. Thông tin chung
| Mục | Nội dung đề xuất |
|---|---|
| Tên | Lexica |
| Phụ đề iOS (30 ký tự) | Học từ tiếng Anh mỗi ngày |
| Danh mục | Giáo dục |
| Ngôn ngữ chính | Tiếng Việt (thêm tiếng Anh nếu muốn) |
| Chính sách riêng tư | `https://lexica.cortexlearn.app/privacy` |
| Điều khoản | `https://lexica.cortexlearn.app/terms` |
| Hỗ trợ | `https://lexica.cortexlearn.app/feedback` (cần xác nhận đây là trang công khai mở được khi chưa đăng nhập) |
| Giá | Miễn phí |
| Độ tuổi | 4+ (không nội dung nhạy cảm, không quảng cáo, không mạng xã hội mở). **Cần xác nhận** các câu hỏi của bảng phân loại: Lexica có "Bạn học" và thách đấu giữa người dùng, nhưng không có chat tự do |

## 3. Mô tả
**Mô tả ngắn (Google, 80 ký tự):**
> Mỗi ngày một phiên ngắn: hiểu, nhớ, gặp, dùng từ tiếng Anh.

**Mô tả đầy đủ:**
> Lexica giúp bạn học từ vựng tiếng Anh bằng những phiên ngắn mỗi ngày, không cần ngồi học cả buổi.
>
> • Hôm nay: một phiên gồm ôn từ cũ, học từ mới, đọc một đoạn ngắn và luyện nói. Lịch ôn tự tính để bạn gặp lại từ đúng lúc sắp quên.
> • Đọc: đoạn văn 1–2 phút, từ mới được tô màu, chạm vào để xem nghĩa và thêm vào phiên học.
> • Chơi: nhiều trò chơi từ vựng ngắn. Từ sai quay lại phần ôn, từ đúng được tính một lần nhớ.
> • Blend: dán link bài báo hoặc đoạn tiếng Việt, Lexica đổi vài từ bạn đang học sang tiếng Anh ngay trong câu, để bạn gặp từ trong ngữ cảnh thật. Dùng nút Chia sẻ để gửi bài từ trình duyệt hoặc app báo sang Lexica.
> • Luyện nói: nói thành tiếng và xem phát âm của mình.
> • Lớp học: vào lớp bằng mã của giáo viên để giáo viên theo dõi tiến độ (chỉ thấy số liệu, không thấy câu bạn viết hay giọng bạn).
>
> Học không cần tài khoản. Đăng nhập (email) để sao lưu tiến độ và học tiếp trên máy khác. Không quảng cáo.

(Không hứa kết quả điểm thi. Nếu muốn nhắc IELTS, chỉ ghi "có từ vựng IELTS", không nói "tăng band".)

**Từ khóa iOS (100 ký tự):** `từ vựng,tiếng anh,học từ,ielts,ôn tập,flashcard,đọc,phát âm,giao tiếp`

## 4. Ảnh
Đã có 3 ảnh iPhone 6.9" (1320×2868) trong `apps/lexica/store/ios-6.9/`: Hôm nay, Đọc, Blend. Chụp từ bản tĩnh trong trình duyệt, không có dữ liệu người học nên màn **Chơi** hiện "bạn có 0 từ" và tôi bỏ. Lưu ý:
- Ảnh Blend có nhãn "THỬ NGHIỆM". Có thể bỏ nhãn đó khỏi app trước khi nộp, hoặc bỏ ảnh này.
- Nên chụp lại trên máy thật có dữ liệu mẫu, 5–8 ảnh, trước khi nộp. Apple cần ít nhất 1 bộ ảnh 6.9"; Google cần ít nhất 2 ảnh điện thoại và một ảnh bìa 1024×500 (chưa làm).

## 5. Ghi chú cho người duyệt Apple (App Review Information)
> Lexica is a vocabulary-learning app for Vietnamese speakers learning English. It is not a website wrapper: all screens are bundled in the app and work offline. Native features: Share extension (send a news link or text from Safari or any app into Lexica's reading mode), custom URL scheme (lexica://), offline notice, microphone for pronunciation practice. No account is needed to use the app; sign-in is by email only, to back up progress.
> There are no in-app purchases and no external payment links.
> To try the main feature: open "Blend", paste any Vietnamese text, tap "Đọc"; or share a news article link to Lexica from Safari.

(Ghi chú này nhằm luật 4.2. Cần xác nhận từng câu đúng với bản nộp thực tế. **Nếu bạn cung cấp tài khoản thử, ghi vào mục "Sign-in required", không đưa mật khẩu vào repo.**)

## 6. App Privacy (Apple) và Data safety (Google), cần xác nhận
Dựa trên `/privacy`. "Liên kết với danh tính" nghĩa là gắn với tài khoản hoặc mã người dùng.

| Dữ liệu | Thu? | Liên kết danh tính | Dùng để | Ghi chú |
|---|---|---|---|---|
| Email | Có (khi đăng nhập) | Có | Chức năng app, tài khoản | Supabase |
| Mã người dùng | Có | Có | Chức năng app, phân tích | |
| Tiến độ học, câu viết, Album, Bạn học | Có (khi đăng nhập và sao lưu) | Có | Chức năng app | Nội dung do người dùng tạo |
| Âm thanh (luyện nói) | Gửi đi tạm, không lưu | Không | Chức năng app | Gửi tới dịch vụ nhận dạng (Google Gemini), bỏ đi sau khi chuyển thành chữ. **Cần xác nhận** khai là "thu" hay "xử lý tạm" theo hướng dẫn của từng cửa hàng |
| Câu viết gửi nhờ AI nhận xét | Gửi đi | Có thể | Chức năng app | Google Gemini |
| Sự kiện sử dụng (PostHog) | Có | Có (mã ngẫu nhiên, kèm mã tài khoản khi đăng nhập) | Phân tích | |
| Báo lỗi (Sentry) | Có | Không (không gửi tài khoản) | Chẩn đoán | |
| Góp ý | Có | Có thể (liên hệ nếu để lại) | Hỗ trợ | |

- **Theo dõi (tracking) xuyên app, quảng cáo, bán dữ liệu: không.** Đúng theo `/privacy`.
- **Mã hóa khi truyền: có** (HTTPS). Google yêu cầu khai.
- **Xóa dữ liệu:** có nút trong app và trang `/xoa-tai-khoan` (mục 1.1).
- **Quyền dùng:** micro (luyện nói), mạng. Thông báo đẩy chỉ khai khi bật tính năng.
- Trang `/privacy` hiện nói về "trình duyệt". **Cần sửa lại một vài câu cho đúng khi là app** (ví dụ "lưu trong trình duyệt" thành "lưu trên máy") và ghi rõ app iOS/Android.

## 7. Việc còn lại cho bạn
1. Chạy `migration_delete_account.sql` trên Supabase và thử xóa một tài khoản thử.
2. Đăng ký Apple Developer, Google Play Console (Play yêu cầu người dùng cá nhân mới phải thử nghiệm kín trước khi lên bản chính thức, **cần xác nhận điều kiện hiện hành**).
3. Xác nhận từng ô ở mục 2 và 6, chụp ảnh trên máy thật, tạo ảnh bìa Google.
