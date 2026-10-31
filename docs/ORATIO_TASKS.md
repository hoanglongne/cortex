> **Đã gộp (31/10/2026):** phần "Đã sửa" vẫn đúng; phần "Còn lại" đã được thay bằng `docs/ORATIO_PLAN.md`.

# Oratio: rà soát và việc cần làm

Rà soát ngày 2026-10-18. Đã sửa trong cùng ngày, trên nhánh `long/serene-turing-6gfppj`. Phần "Còn lại" là việc chưa làm, có thể giao cho AI khác.

**Bắt buộc trước khi deploy:** chạy `apps/oratio/supabase/migration_2026_10_security.sql` trên Supabase. Code mới cần các cột, view và hàm có trong file này.

## Đã sửa

### Bảo mật
- [x] Email của mọi user bị lộ qua `profiles` (SELECT `USING(true)`). Giờ mỗi user chỉ đọc hàng của mình; thông tin công khai của người khác đọc qua view `public_profiles` (không có email).
- [x] User tự sửa được số buổi, số phút, band. Giờ chỉ sửa được tên, avatar, quốc gia, ngôn ngữ mẹ đẻ và band mục tiêu (dùng column grants).
- [x] User sửa được mọi cột của trận, hàng chờ và feedback (kể cả sửa feedback sau khi đã gửi). Giờ client chỉ đọc; mọi thao tác ghi đi qua server actions.
- [x] `actions/questions.ts` không kiểm tra đăng nhập hay thành viên trận. Giờ action nào cũng kiểm tra; chỉ giám khảo được sang câu, chỉ người kia được trả lời yêu cầu đổi vai, và các lệnh ghi đều có điều kiện nên bấm trùng lúc không bị áp dụng hai lần. `initializeRoles`, `setCurrentQuestion` và `getRandomQuestion` không còn là endpoint công khai.
- [x] `submitFeedback` tin dữ liệu client gửi lên. Giờ server tự xác định người được chấm, tự tính band tổng (trung bình làm tròn 0.5), kiểm tra điểm là số nguyên 1–9, giới hạn tag và comment, chỉ cho chấm buổi đã thật sự diễn ra và chỉ một lần.
- [x] Band tính từ feedback giờ cần 3 người chấm khác nhau trong 30 ngày (mỗi người một phiếu).
- [x] Đã gỡ trang `/debug`, các action debug và `api/cleanup-queue`. `findMatch` không còn trả log server về client.
- [x] Open redirect ở `/auth/callback`.
- [x] Token LiveKit: tên hiển thị lấy từ profile chứ không lấy từ client; TTL giảm từ 2 giờ xuống 15 phút; `roomName` được kiểm tra định dạng.
- [x] Các hàm `SECURITY DEFINER` đã có `search_path`. Bộ lọc PostgREST ghép chuỗi (`excludeIds`) đã được thay bằng lọc trong JS.

### Dữ liệu và luồng
- [x] Từ chối trận làm `total_minutes` thành NULL và cộng thêm buổi. Giờ từ chối là `cancelled`. Một buổi chỉ được tính khi cả hai đã vào phòng (`started_at` được ghi khi người thứ hai vào) và kéo dài ít nhất 1 phút, tối đa 90 phút. Migration đã sửa lại dữ liệu cũ.
- [x] Trận bỏ dở làm user bị kẹt. Giờ: trận pending quá 60 giây bị huỷ; trận một người không vào trong 3 phút bị huỷ; cuộc gọi không còn tín hiệu hoạt động trong 60 giây được kết thúc tại lần hoạt động cuối. Nếu user tải lại trang giữa cuộc gọi thì quay lại đúng trận đó.
- [x] Một user có thể ở hai trận cùng lúc. Giờ user luôn claim cả hàng chờ của chính mình, và có trigger DB (`prevent_double_match`) chặn trận mở thứ hai.
- [x] Số người online đếm sai (lọc theo `created_at`). Giờ đếm theo heartbeat `last_seen_at`. Đã bỏ con số giả "142 Learners Online".
- [x] Leaderboard: 3 tab trả cùng một dữ liệu và band lấn át điểm. Giờ xếp theo phút luyện trong 7 ngày, 30 ngày hoặc tất cả, qua hàm SQL `leaderboard()`.
- [x] Cortex hub: trước đây gọi `localhost` không có token, và payload ghi đè hồ sơ ngôn ngữ của người chấm. Giờ là tuỳ chọn qua `CORTEX_API_URL`, gửi kèm token của user, và chỉ báo "đã xong một buổi" (không gửi transcript).
- [x] `seed_questions_v2.sql` không còn xoá dữ liệu: chỉ thêm câu chưa có, không đụng đến lịch sử trận.
- [x] `schema.sql` đã khớp với code (`swap_requested_by`, các cột mới, policy an toàn).

### Sản phẩm và UX
- [x] Lúc vắng người: sau 90 giây chờ thì ghép với mọi band. Sau 45 giây app gợi ý chuyển sang **Luyện một mình** (8 câu thật, đồng hồ Part 2, ghi âm và nghe lại ngay trên trình duyệt, không tải lên). Nút này cũng có ở Home.
- [x] Thí sinh xem được câu hỏi: thẻ đề Part 2 hiện đầy đủ gạch đầu dòng; Part 1 và 3 có nút "Hiện câu hỏi". Có đồng hồ Part 2 (1 phút chuẩn bị, 2 phút nói) cho cả hai người.
- [x] Lỗi token không còn rơi im lặng vào "Connected (Demo)": giờ hiện màn lỗi với nút Thử lại và Rời. Có thông báo khi không dùng được micro. Nếu bạn kia chưa vào sau 60 giây thì có nút "Rời phòng" (buổi đó không được tính).
- [x] Gộp "End call" và "Finish & Rate" thành một nút Kết thúc; bỏ nút ⋮ không có chức năng.
- [x] Từ chối: người kia được báo trên Home, và "Tìm bạn khác" sẽ tìm lại luôn.
- [x] Dữ liệu hiển thị sai: Home giờ hiện điểm mình **được chấm**; Summary hiện danh sách câu thật thay cho topic gắn cứng; History có topic và danh sách câu; band picker luôn khớp với khoảng band đang tìm (mặc định "Bất kỳ").
- [x] Màn giả: Friends được thay bằng **Bạn luyện cùng** (lấy từ lịch sử thật); Achievements tính từ số liệu thật; Profile hiện điểm trung bình theo tiêu chí từ feedback thật và có form sửa tên và band mục tiêu; đã bỏ mọi nút không có chức năng.
- [x] Đăng ký có thông báo "kiểm tra email"; quên mật khẩu chạy thật.
- [x] Toàn bộ giao diện bằng tiếng Việt (giữ các thuật ngữ IELTS), `lang="vi"`, ngày tháng theo `vi-VN`.
- [x] Accessibility: aria-label cho nút chỉ có icon, card dùng `<button>`, label gắn với input, hỗ trợ `prefers-reduced-motion`, tăng độ tương phản chữ. Mobile: band picker và lưới chấm điểm không còn tràn ở 320px.
- [x] Landing: trang Oratio trước đây quảng cáo "tranh biện với AI". Giờ mô tả đúng sản phẩm; các câu nhắc tới Oratio ở trang Lexica, Solilo và Dialecta cũng đã sửa.
- [x] Next 16: `middleware.ts` đổi thành `proxy.ts`. Docs: viết lại `README.md` và `PROJECT_STATUS.md`; các tài liệu cũ được đánh dấu lỗi thời.

## Còn lại (chưa làm)

1. **Thử với 2 tài khoản thật** trên bản deploy: ghép cặp, vào phòng, 18 câu, đổi vai, chấm điểm, lịch sử; từ chối; một người tắt tab giữa chừng. Mình mới chạy được typecheck, lint, unit test và build, chưa thử luồng thật trên trình duyệt.
2. **Cron dọn trận** (tuỳ chọn): bật `pg_cron` rồi chạy dòng `cron.schedule(...)` có sẵn trong comment ở cuối migration. Không có cron thì app vẫn dọn trận của từng user mỗi khi họ tìm trận.
3. **Giá trị học sau buổi** (cần quyết định hướng sản phẩm; không dùng API trả phí):
   - Ghi âm phần của chính mình trong cuộc gọi (MediaRecorder trên track local) để nghe lại trong Summary.
   - Câu trả lời mẫu hoặc gợi ý ý cho từng câu hỏi (nội dung soạn sẵn, ví dụ qua Studio).
   - Theo dõi tiến bộ theo từng tiêu chí qua thời gian (biểu đồ từ `session_feedback`).
4. **Hẹn giờ luyện / thông báo** khi có người online (giải quyết tận gốc chuyện vắng người): ví dụ "khung giờ luyện chung" mỗi tối, hoặc web push.
5. **Bạn bè và luyện lại với người cũ**: hiện chỉ có danh sách người đã luyện cùng; chưa có lời mời hay ghép riêng.
6. **Upload avatar** (Supabase Storage). Hiện avatar chỉ là chữ cái đầu.
7. **Liên kết với Lexica**: chưa có. Nếu làm, nên dựa trên dữ liệu thật (ví dụ gợi ý từ Lexica liên quan tới topic câu hỏi), không hứa "dùng từ để tranh luận" như landing cũ.
8. **Test tự động cho server actions** (mock Supabase) và một test e2e 2 trình duyệt bằng Playwright.
