# Lexica: triết lý, lộ trình 30 ngày, hai nhánh, trung tâm

Bản trong repo của doc đã duyệt ngày 2026-10-17 ("Lexica — Triết lý & lộ trình 30 ngày"). Code nhắc tới file này khi nói về 4 bước, phiên Hôm nay, lộ trình, nhánh Giao tiếp và lớp học.

## Triết lý: từ câu chêm đến câu của mình

Người Việt không thiếu từ tiếng Anh; họ thiếu con đường để một từ đi từ "nghe quen" tới "nói ra được". Lexica bắt đầu từ cách người Việt đang nói (chêm tiếng Anh vào câu tiếng Việt), rồi rút tiếng Việt dần: đoạn văn tiếng Anh, rồi miệng người học.

5 nguyên tắc, mọi quyết định sản phẩm phải qua:

| Nguyên tắc | Trong sản phẩm |
| --- | --- |
| 1. Bắt đầu từ đời mình | Thẻ câu chêm là cửa vào duy nhất cho từ mới |
| 2. Chỉ đếm từ dùng được | Mọi con số tiến độ là 4 bước |
| 3. Tiếng Việt rút dần | Hiểu → Nhớ → Gặp → Dùng không đảo |
| 4. Một nút mỗi ngày | Phiên Hôm nay là đường chính |
| 5. Vui để quay lại, không vui thay cho học | Album, hũ điểm, Ghost đứng sau lớp học |

## 4 bước của một từ (`app/lib/journey/steps.ts`)

| Bước | Tính năng | Qua bước khi |
| --- | --- | --- |
| Hiểu | Thẻ câu chêm + kiểm tra nghĩa | Học thẻ, trả lời đúng kiểm tra nghĩa |
| Nhớ | Ôn tập, kiểm tra trong bộ thẻ | Đúng ở 2 ngày khác nhau, cách nhau ≥ 3 ngày |
| Gặp | Đọc, Ngoài đời | Đọc xong đoạn có từ, hoặc đúng nghĩa trong trích dẫn |
| Dùng | Luyện nói | Máy nghe rõ từ (hoặc cụm) ít nhất 1 lần |

Bước thứ 5, **Đời**: đã dùng thật ngoài đời (tin nhắn, email, câu nói). Không nằm trong phiên Hôm nay vì không đạt được ngay; hiện riêng thành một dòng dưới 4 con số khi đã có từ.

Sai khi ôn: mất Nhớ, giữ Gặp/Dùng. Con số hiển thị là số từ đã tới mỗi bước (từ ở Dùng được đếm cả 4).

## Ra ngoài đời (`app/lib/journey/outside.ts`)

- **Hẹn dùng**: cuối phiên Hôm nay gợi ý 1 từ đã Nhớ (ưu tiên từ đã Gặp/Dùng) và chỗ dùng hợp với người học (theo nghề đã chọn, hoặc tình huống của thẻ Giao tiếp). Hôm sau Home hỏi "Dùng được chưa?": tự xác nhận được, có lời nhắc thành thật; dán câu đã dùng thì máy xem giúp và giữ làm "Câu của bạn". Chưa dùng thì giữ hẹn thêm một ngày hoặc bỏ.
- **Bắt gặp** (`/spot`): dán đoạn đọc được ngoài app, app tô từ đã học (mọi dạng từ, cả cụm), ghi nhận là Gặp. PWA trên Android nhận văn bản chia sẻ thẳng vào đây.
- **Một câu hôm nay** (`/journal`): viết 1 câu về ngày của mình với từ đang học, máy nhận xét nhẹ nhàng (`POST /v1/lexica/sentence`), lưu làm "Câu của bạn" để thẻ hiện câu đó khi ôn.

## Hai nhánh

Chứng chỉ (IELTS, sau này TOEIC/VSTEP) và Giao tiếp (cụm từ đời thường, hội thoại, nói theo tình huống). Cùng 4 bước, cùng màn hình, khác nội dung. Thẻ có `branch` (`cert` mặc định, `talk`); đoạn văn có `kind` (`text`, `dialogue`).

## Lộ trình 30 ngày

- Ngày 0: pitch → chọn nhánh → test level → chọn nhịp (10/15 từ/ngày) → phiên đầu 5 từ → mời cài PWA.
- Mỗi ngày: nút "Bắt đầu hôm nay" chạy Ôn → Học → Đọc → Nói, kết phiên có con số 4 bước và phần thưởng.
- Ngày 7/14/21: mốc tuần. Ngày 30: kiểm tra 30 từ, thẻ chia sẻ. Bỏ ngày thì lộ trình dời theo.

## Bố cục

Trên cùng là việc học hôm nay (thẻ Hôm nay, 4 con số, Luyện thêm); lớp game (ví, Album, rival, chuỗi ngày) giữ nguyên nhưng nằm sau: dải cuối màn trên điện thoại, cột phải hẹp trên máy tính. Phần thưởng hiện ở màn kết phiên.

## Trung tâm (B2B)

Lexica nhận phần "giữa hai buổi học". Thiết kế: Claude Doc "Lexica Lớp học — thiết kế".

- **App giáo viên riêng** `apps/teach` (subdomain, giao diện sáng và mềm), chỉ vào bằng link mời. Năm chỗ: Hôm nay (việc cần giáo viên trước, lời khen, lớp), Lớp của tôi (mỗi lớp 5 tab: Tổng quan, Học viên, Bài giao, Báo cáo, Cài đặt), Học viên, Báo cáo, Trung tâm (quản lý) và Quản trị (quản trị hệ thống).
- **Vai trò**: quản trị hệ thống (tạo trung tâm, đặt số chỗ, mời quản lý, cấp quyền giáo viên độc lập) → quản lý trung tâm (mời và gỡ giáo viên) → giáo viên → lớp → học viên. Giáo viên độc lập tạo được lớp riêng, tối đa 60 em mỗi lớp.
- **Học viên** (app học): vào lớp bằng link `/join/MÃ` hoặc nhập mã; phiên Hôm nay học bài "chỉ từ của bài" trước tiên và chỉ những từ đó; bài "xen kẽ" được học trước trong phiên thường. Gửi về lớp 4 con số, số từ Đời và bước của từng từ được giao.
- **Bảng xếp hạng**: giáo viên bật hoặc tắt, mặc định tắt.
- Dữ liệu và chuẩn mô-đun: xem `docs/CLASSROOM.md` (lõi `packages/classroom`, mô-đun Lexica `packages/classroom-lexica`).

## Trạng thái triển khai (2026-10-17)

| Pha | Đã làm | Ở đâu |
| --- | --- | --- |
| 1. 4 bước | Mỗi thẻ có hành trình Hiểu/Nhớ/Gặp/Dùng; cập nhật từ bộ thẻ, Ôn tập, Đọc, Ngoài đời, Luyện nói; tiến độ cũ tự chuyển từ lịch SRS; đồng bộ cloud | `app/lib/journey/steps.ts`, store `journeys`, `stepHistory` |
| 2. Hôm nay + Home | `/today` chạy Ôn → Học → Đọc → Nói, bỏ chặng trống, kết phiên có 4 con số và phần thưởng; Home: thẻ Hôm nay, 4 con số, Luyện thêm, dải/cột Động lực | `app/today`, `app/lib/journey/today.ts`, `app/components/{TodayCard,MoreList,Motivation,StepNumbers}.tsx` |
| 3. Lộ trình | Chọn nhánh và nhịp, `/path` (30 ô, biểu đồ, mốc), mốc 7/14/21, kiểm tra ngày 30 + ảnh chia sẻ, lộ trình mới/duy trì; onboarding mới; mời cài PWA sau phiên đầu | `app/path`, `app/lib/journey/path.ts`, `OnboardingModal.tsx`, `InstallCard.tsx` |
| 4. Giao tiếp | Thẻ có `branch`; 40 cụm + 4 hội thoại có sẵn; bước "Nói trong tình huống"; câu hỏi "Nghe → Nghĩa"; Studio sinh cụm (trang Giao tiếp) và hội thoại (trang Đọc), xuất bản pack `talk` | `app/data/talkCards.ts`, `app/data/passages.ts`, API `talk.ts`, `talk.service.ts`, `migration_studio_talk.sql`, `seed_studio_talk_cards.sql` |
| 5. Trung tâm | Lớp, mã lớp, giao từ theo bài (từ chưa có thẻ gửi về Studio), bảng lớp, báo cáo tuần (in, chép tin nhắn phụ huynh), xếp hạng theo Dùng, trung tâm có số chỗ và quản lý | `app/class`, `app/teach`, `app/lib/classes.ts`, `app/lib/classSync.ts`, `supabase/migration_classes.sql`, API `word-requests.service.ts` |

Chạy lại `supabase/restore_all.sql` (hoặc 3 file mới: `migration_studio_talk.sql`, `seed_studio_talk_cards.sql`, `migration_classes.sql`) trên Supabase để bật nhánh Giao tiếp ở Studio và lớp học. Bản chạy thử trung tâm: tạo trung tâm ở `/teach` (30 chỗ mặc định; đổi `lexica_orgs.seats` trong SQL khi bán).

## Đọc, nói, giọng đọc (2026-10-18)

- Đọc luôn về chính từ của người học: đoạn có sẵn có ≥ 2 từ học hôm nay (khớp theo chữ, không theo id thẻ); nếu không có, API viết một đoạn đời thường quanh đúng các từ đó (`POST /v1/lexica/reading`, cache theo bộ từ); mất mạng thì đoạn có từ đã Nhớ hoặc trích dẫn, không bao giờ đoạn không liên quan. `app/hooks/useTodayPlan.ts`, `app/lib/content/generated.ts`, API `src/modules/lexica`.
- Luyện nói: ghi âm trực tiếp (WAV 16 kHz) và đo có giọng hay không; nhận dạng của trình duyệt bỏ sót mà bản ghi có giọng thì gửi bản ghi lên `POST /v1/lexica/transcribe`, rồi các lần sau gửi thẳng. `app/lib/pronunciation/speech.ts`.
- Giọng đọc: giọng tự nhiên từ `GET /v1/lexica/tts` (Gemini TTS, cache vĩnh viễn), dự phòng là giọng tốt nhất trên máy (xếp theo tên: Natural/Neural/Google…, bỏ giọng robot). `app/lib/audio/AudioService.ts`.
- Env API: `GEMINI_API_KEY` (bắt buộc), `SUPABASE_SERVICE_ROLE_KEY` (cache vào bucket `lexica-content/cache/`), tuỳ chọn `LEXICA_TTS_MODEL`, `LEXICA_SPEECH_MODEL`. Giới hạn mỗi IP/ngày: 20 bài đọc mới, 150 lần nhận dạng, 300 câu đọc mới (lấy từ cache không tính).

Chưa làm: nhắc giờ học (push chưa có service worker), mức giá B2B, nội dung đủ ~30 đoạn văn/hội thoại mỗi level (việc của Studio).
