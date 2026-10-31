# Oratio: kế hoạch duy nhất (31/10/2026)

Liên quan: issue #75. Gom `ORATIO_REDESIGN.md`, `ORATIO_TASKS.md`, `apps/oratio/PROJECT_STATUS.md`, `apps/oratio/SPEAKMATE_ROADMAP.md` và đối chiếu với code. **Tài liệu này là nơi quyết định phạm vi và thứ tự.** `ORATIO_REDESIGN.md` vẫn là nguồn thiết kế (hướng D, rubric, hiệu chuẩn); các tài liệu còn lại đã được đánh dấu lỗi thời.

Mọi nhận định về code mình đã đối chiếu trực tiếp (số file, test, lint). Nhận định về việc chạy với người thật là **chưa kiểm chứng**, và mình ghi rõ chỗ nào.

## 1. Kết luận ngắn

1. **Oratio không thiếu tính năng, nó thiếu người dùng thật.** Theo tài liệu, sáu pha thiết kế (P0 đến P3, cùng phần P4 và P5) đã được viết trong hai tuần. Code khớp tài liệu: 12.458 dòng TypeScript, 14 file test (70 test) qua, tsc sạch, một cảnh báo lint. Nhưng chưa ai chạy luồng thật với hai tài khoản trên bản triển khai, và lợi thế cốt lõi (điểm hiệu chuẩn bằng câu neo) **chưa bật** vì chưa có câu neo.
2. **Ngừng thêm tính năng. Chuyển sang kiểm chứng.** Việc đáng làm nhất không phải viết thêm code mà là: xác nhận hạ tầng đã bật, chạy thử với một lớp thật, đo vài con số.
3. **Hướng đề xuất: Oratio là động cơ nói của lớp học**, không phải một chợ ghép người lạ. Lớp học giải bài toán thanh khoản (có sẵn người), cho câu neo tự có (giáo viên chấm), và nối thẳng vào Teach, nơi doanh thu nằm (mục 4).
4. **Gộp Solilo vào Oratio** (xem `SOLILO_SYNAPSE_ANALYSIS.md`). Tính năng của Solilo là tập con của chế độ Tập một mình của Oratio.

## 2. Kiểm kê thật

Ký hiệu: **Có** = code có và có test hoặc build; **Chưa chạy thật** = chưa thử với người dùng thật trên bản triển khai. "Doc nói" là điều tài liệu cũ khẳng định.

| Mảng | Doc nói | Trong code | Tình trạng |
|---|---|---|---|
| Đăng ký, đăng nhập, quên mật khẩu | Chạy thật | `AuthScreen`, `reset-password`, `actions/auth.ts` | Có, chưa chạy thật |
| Ghép cặp (hàng chờ heartbeat, claim nguyên tử, mở rộng band) | Chạy thật | `actions/matchmaking.ts` (533 dòng), `lib/matchmaking/*`, test claim và rules | Có, chưa chạy thật |
| Cuộc gọi LiveKit, 18 câu, đổi vai, thẻ đề Part 2, đồng hồ | Chạy thật | `InCallScreen` (954 dòng), `ExaminerPanel`, `lib/cue-card.ts` | Có, chưa chạy thật (đã từng vỡ "No participant provided", đã sửa) |
| Chấm chéo sau buổi, band do server tính | Chạy thật | `RatingScreen`, `actions/reviews.ts`, `lib/feedback.ts` | Có, chưa chạy thật |
| Tập một mình: ghi âm, nghe lại, Whisper trên máy, chỉ số, nói lại, 4/3/2 | Có (đợt 2) | `SoloPracticeScreen` (535), `lib/client/whisper.ts`, `public/whisper-worker.js`, `lib/transcript-metrics.ts` | Có, chưa chạy thật. Chất lượng Whisper tiny với giọng Việt **chưa đo** |
| Chấm chéo bất đồng bộ: hàng chờ, rubric 1–9, chấm 2 được gửi 1, độ chuẩn | Có (đợt 2) | `ReviewScreen`, `actions/reviews.ts`, `lib/review-scoring.ts`, test | Có, chưa chạy thật |
| **Câu neo (hiệu chuẩn)** | Có script nhập | `scripts/import-anchors.mjs` | **Chưa bật**: chưa có câu neo nào. Hiệu chuẩn hiện chỉ dựa vào đồng thuận số đông |
| Giờ thi chung 20:30–22:00, cuối tuần 12:00–13:00, nhắc bằng push hoặc .ics | Có (đợt 3) | `lib/exam-hours.ts`, `exam-calendar.ts`, `api/cron/exam-reminder` | Có, chưa chạy thật. Cần khoá VAPID và `CRON_SECRET`. Push trên iPhone bị hạn chế |
| Tự ghi âm phần mình trong buổi thi | Có (đợt 3) | `live/useSelfRecording.ts`, `live/MyAnswers.tsx` | Có, chưa chạy thật |
| Tiến bộ (biểu đồ, chỉ số máy đo, hồ sơ người chấm) | Có | `ProgressScreen`, `lib/answer-trends.ts` | Có, chưa chạy thật |
| Nối Lexica: nhận từ nói trong transcript, lên bước Dùng | Có | `lib/transcript-metrics.ts`, `actions/answers.ts`, `apps/lexica/app/lib/oratioSync.ts` | Có, chưa chạy thật. Chiều ngược lại ("gợi ý từ Lexica hợp chủ đề câu hỏi") chỉ có ở mức từ gần đây |
| Nối lớp học (Teach) | Có | `actions/classroom.ts`, `ClassScreen`, `packages/classroom-oratio` | Có, chưa chạy thật. Teach cũng có công cụ "Luyện nói trên lớp" riêng |
| PWA, thanh tab, giao diện hướng D, nhân vật Ơ | Có | `PwaRegister`, `ui/shell.tsx`, `ui/character.tsx` | Có |
| Bảng giờ nói (xếp theo phút), Bạn luyện cùng, Lịch sử | Có | `LeaderboardScreen`, `PartnersScreen`, `CallHistoryScreen` | Có |
| Bạn bè, lời mời, hẹn lịch | Chưa có | Không | Chưa có |
| Upload avatar | Chưa có | Không | Chưa có |
| Test tự động cho server action, e2e hai trình duyệt | Chưa có | Chỉ test hàm thuần | Chưa có |

### Những thứ mình **không xác nhận được** từ máy này (cần bạn)

Đây là danh sách "đã bật chưa", đưa vào checklist của bạn (#86):
1. Ba migration Oratio đã chạy trên Supabase chưa: `migration_2026_10_security.sql`, `migration_2026_10_answers.sql`, `migration_2026_10_live.sql`. Code mới cần các cột, view và hàm trong đó.
2. Biến môi trường trên Vercel của Oratio: `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`; `NEXT_PUBLIC_DEMO_MODE` phải **không** đặt.
3. Hai cron (`exam-reminder`, `expire-audio`) đã được lên lịch chưa.
4. Có bao nhiêu người đã đăng ký Oratio thật.

## 3. Chẩn đoán: vì sao vẫn chưa "chạy"

1. **Thanh khoản là rủi ro số một, và thiết kế hiện chỉ giải một nửa.** Giờ thi chung gom người vào cùng khung giờ, nhưng khung giờ chỉ có ích khi đã có vài chục người. Với 0 đến 50 người dùng, "ghép với người lạ" gần như luôn thất bại, và người dùng đầu tiên sẽ ra đi.
2. **Giá trị lớn nhất của Oratio nằm ở thứ cần người thật mới có.** Chấm chéo hiệu chuẩn cần nhiều người chấm. Câu neo cần giáo viên. Cả hai đều chưa có.
3. **Tách rời Teach.** Teach (nơi có doanh thu) có công cụ "Luyện nói trên lớp" riêng, còn Oratio có phần lớp riêng. Hai bên chưa dùng chung bộ câu trả lời và chấm điểm.
4. **Tài liệu mâu thuẫn.** `PROJECT_STATUS.md` nói "không có AI, không có chấm chéo bất đồng bộ", trong khi code đã có; `SPEAKMATE_ROADMAP.md` và hai file HTML mô tả một kế hoạch cũ với AI trả phí. Người mới đọc sẽ hiểu sai.

## 4. Brainstorm: các hướng, và lựa chọn

Mỗi ý có đánh giá giá trị, công sức (S nhỏ, M vừa, L lớn) và rủi ro. Cột cuối là khuyến nghị của mình.

| # | Ý tưởng | Giải quyết gì | Công sức | Rủi ro | Khuyến nghị |
|---|---|---|---|---|---|
| A | **Oratio là động cơ nói của lớp học.** Giáo viên giao bài nói trong Teach; học viên ghi âm trong Oratio; **bạn cùng lớp chấm chéo trước**, giáo viên chỉ chấm những câu được chọn | Thanh khoản (có sẵn người), nối với nơi có doanh thu, báo cáo phụ huynh có số liệu nói | M (phần lớp đã có, cần gắn bộ câu trả lời và chấm chéo theo lớp) | Quyền riêng tư giọng của học viên dưới 18 tuổi: chỉ giáo viên và bạn cùng lớp nghe | **Làm. Hướng chính** |
| B | **Câu neo tự sinh từ việc giáo viên chấm.** Mỗi lần giáo viên chấm một câu trong lớp, câu đó thành câu neo cho lớp ấy | Bỏ nhu cầu nhờ giáo viên ngoài chấm 60 câu, vì hiệu chuẩn mọc ra từ việc dạy bình thường | S–M (đã có logic neo, chỉ cần nguồn neo mới) | Giáo viên chấm không nhất quán thì neo kém. Cần ngưỡng: chỉ tính khi giáo viên đã chấm ≥ 10 câu | **Làm cùng A** |
| C | **Hẹn thi với bạn thay vì người lạ.** Từ Lexica Buddy bấm "hẹn thi thử Speaking" với bạn học, vào đúng giờ thi chung | Thanh khoản bằng bạn quen, đúng lúc người dùng đã có buddy | S–M (Buddy và giờ thi đều có) | Cần có bạn trước. Tạo vòng lặp Lexica → Oratio | **Làm. Rẻ và khớp hệ sinh thái** |
| D | **Thi thử một mình có giám khảo đọc câu bằng giọng.** Giọng giám khảo đọc câu hỏi (cache giọng tự nhiên đã có), đồng hồ đúng format, ghi âm, Whisper, chỉ số. Không có AI chấm | Làm chế độ Tập giống thi thật hơn, luôn có sẵn, lấp lúc phòng vắng | S–M | Giọng tự nhiên bị giới hạn tốc độ (xem #82); phải có phương án giọng hệ thống | **Làm sau A, C** |
| E | **Tự chấm trước, rồi so với người chấm.** Người học tự chấm 4 tiêu chí (như Solilo), sau đó thấy khoảng chênh với điểm người khác | Dạy hiểu tiêu chí, đánh dấu người tự đánh giá quá cao hoặc quá thấp; giữ phần hay nhất của Solilo | S | Thấp | **Làm** (tích hợp vào Tập và Chấm chéo) |
| F | **Thang nói** (mục 6): nối Lexica Nói → Oratio Tập → Chấm chéo → Phòng thi thành một thang rõ ràng | Mỗi bước sau dựa trên bước trước; người học biết đang ở đâu | S (chủ yếu điều hướng và thông điệp) | Thấp | **Làm** |
| G | Nhắc chỉ số bằng thời gian thực (cảnh báo từ đệm khi đang nói) | Như `FillerFlash` của Solilo | M | Dễ gây bối rối, cần Web Speech ổn định | Hoãn |
| H | AI chấm band | Có điểm ngay | L, tốn tiền | Điểm AI khó tin; ECOSYSTEM_STRATEGY và REDESIGN đã chọn không làm | **Không làm** |
| I | Bạn bè, lời mời, hẹn lịch riêng trong Oratio | Giữ chân | M | Trùng Buddy của Lexica | **Không làm**, dùng Buddy (C) |
| J | Upload avatar | Mỹ quan | S | Quyền riêng tư, kiểm duyệt ảnh | Bỏ |
| K | Thi thử trọn bộ (Listening, Reading, Writing, Speaking) | Dự báo band; trung tâm trả tiền | L | Cần nội dung mới | Sau thí điểm (ECOSYSTEM_STRATEGY mục 3) |

### Phản biện hướng A (để bạn cân nhắc)

- **Lợi:** một giáo viên mang theo cả lớp (đúng ICP của chiến lược), nên ba vấn đề lớn (thanh khoản, neo, doanh thu) cùng được giải.
- **Hại:** biến Oratio thành tính năng của Teach, bớt tính "sản phẩm cho người học tự do". Nếu mục tiêu là người dùng lẻ, hướng này chậm hơn.
- **Cách giữ cả hai:** lớp học là cửa vào, chế độ lẻ (Tập, Hẹn thi với buddy) vẫn luôn có. Lớp chỉ thêm bài giao, chấm chéo trong lớp và báo cáo.

## 5. Phạm vi: giữ, gộp, bỏ

| Quyết định | Mục |
|---|---|
| **Giữ và làm cho chạy thật** | Tập một mình (Whisper, chỉ số, nói lại), Chấm chéo, Phòng thi trong giờ chung, Tiến bộ, nối Lexica, nối lớp |
| **Gộp vào đó** | Solilo (thi thử Part 2 một mình), công cụ "Luyện nói trên lớp" của Teach (dùng chung bộ câu trả lời với Oratio) |
| **Bỏ** | Bạn bè và lời mời riêng (dùng Lexica Buddy), upload avatar, AI chấm band, cảnh báo từ đệm thời gian thực (hoãn), bảng xếp hạng theo band (đã bỏ) |
| **Không đụng** | Các tính năng đã có (đừng viết lại) |

## 6. "Thang nói": nối các mảnh thành một đường

Hiện có ba nơi dạy nói rời nhau. Đề xuất xếp thành một thang, mỗi bậc áp lực hơn bậc trước, và mỗi bậc nhắc bậc kế:

| Bậc | Nơi | Việc | Máy đo | Có chưa |
|---|---|---|---|---|
| 1. Từ và câu | Lexica "Nói" (SpeakDrill) | Đọc to từ và câu, xem đường cao độ | Phát âm, ngữ điệu | Có |
| 2. Một câu trả lời | Oratio Tập | Trả lời một câu, nghe lại | Tốc độ, quãng ngừng, từ Lexica | Có |
| 3. Nói lại | Oratio Tập | Nói lại với mục tiêu cụ thể, 4/3/2 | So lần 1 với lần 2 | Có |
| 4. Người chấm | Oratio Chấm chéo | Người khác chấm theo rubric | Khoảng band, độ tin cậy | Có (neo chưa bật) |
| 5. Phòng thi | Oratio Phòng thi | Thi thử với người thật | Rubric sau buổi | Có |

Việc cần làm cho thang: **bậc 1 chưa dẫn sang bậc 2** (trong Lexica không có nút "thử trả lời cả câu hỏi trong Oratio") và **bậc 3 chưa dẫn sang bậc 4**. Đó là việc điều hướng và thông điệp, không phải code mới lớn.

## 7. Kế hoạch theo bước

Mỗi bước có tiêu chí xong. Đứng trước mọi thứ là bước 0, chỉ bạn làm được.

| Bước | Việc | Ai | Xong khi | Công sức |
|---|---|---|---|---|
| **0. Xác nhận hạ tầng** | Chạy ba migration, đặt biến môi trường, lên lịch hai cron (mục 2) | Bạn | Một tài khoản mới đi được hết luồng Tập và Chấm trên bản triển khai | 1 giờ |
| **1. Kiểm chứng** | Chạy thử với hai tài khoản thật: ghép cặp, 18 câu, đổi vai, chấm, lịch sử, một người tắt tab giữa chừng. Viết test e2e hai trình duyệt cho phần không cần LiveKit (Tập, gửi chấm, Chấm chéo) | Bạn thử, mình viết test | Danh sách lỗi thật, đã sửa | 1 tuần |
| **2. Dọn tài liệu** | Giữ `ORATIO_REDESIGN.md` làm thiết kế và tài liệu này làm kế hoạch; đánh dấu ba tài liệu còn lại là lỗi thời; sửa `PROJECT_STATUS.md` cho đúng | Mình | Không còn tài liệu nói ngược code | 0,5 ngày |
| **3. Hướng A + B: Oratio cho lớp** | Giáo viên giao bài nói (Teach) → học viên ghi âm (Oratio) → chấm chéo trong lớp → giáo viên chấm chọn lọc → câu giáo viên chấm thành neo của lớp → báo cáo phụ huynh có số liệu nói | Mình | Một lớp thí điểm đi hết vòng, có điểm chấm chéo | 2 tuần |
| **4. Hướng C + F** | Nút "Hẹn thi thử" từ Buddy; nút dẫn giữa các bậc của thang nói | Mình | Hai buddy hẹn và vào cùng giờ thi chung | 1 tuần |
| **5. Hướng E + D** | Tự chấm trước, so với người chấm; thi thử một mình có giọng giám khảo | Mình | Có trong Tập, đo được tỉ lệ dùng | 1–2 tuần |
| **6. Thí điểm và đo** | 3 đến 5 lớp, 4 đến 6 tuần (cùng thí điểm với Lexica và Teach) | Bạn dẫn, mình đo | Có số liệu để quyết bước sau | 6 tuần |

### Số đo (từ REDESIGN mục 6, rút gọn cho thí điểm)

- Tỉ lệ ghi được câu đầu tiên trong ngày đầu.
- Số câu trả lời mỗi người mỗi tuần, tỉ lệ nói lại.
- Tỉ lệ quay lại sau 7 ngày.
- Thời gian chờ có điểm của một câu gửi chấm (mục tiêu: dưới 24 giờ trong lớp).
- Độ lệch giữa điểm chấm chéo và điểm giáo viên chấm cùng một câu (đó là cách **chứng minh hiệu chuẩn có tác dụng**, và là bằng chứng bán cho trung tâm).
- Tỉ lệ ghép được trong giờ thi chung (chỉ đo khi đã có ≥ 50 người hoạt động).

## 8. Rủi ro và giả định chưa kiểm chứng

| Giả định | Rủi ro nếu sai | Cách thử |
|---|---|---|
| Whisper tiny đủ chính xác với giọng Việt để đếm từ đệm và từ Lexica | Chỉ số sai làm người học mất tin | Thử 20 bản ghi thật, so tay; có phương án chọn model lớn hơn hoặc chỉ dùng chỉ số từ âm thanh |
| Bạn cùng lớp chấm đủ chuẩn | Điểm chấm chéo vô nghĩa | Đo độ lệch so với giáo viên (mục 7) |
| Học viên đồng ý để bạn cùng lớp nghe giọng mình | Không ai gửi bài | Hỏi ở buổi thí điểm; có chế độ chỉ giáo viên nghe |
| Push nhắc giờ thi đến được điện thoại | Không ai biết có giờ thi | iPhone cần cài PWA; có phương án .ics |
| Giọng giám khảo tự nhiên ổn định | Giọng đổi giữa chừng (như lỗi #82) | Cache trước; tách lỗi hạn mức |
| Vài chục người dùng đầu tiên tới từ lớp | Phụ thuộc thí điểm Teach | Tập trung bước 3, không quảng bá chợ mở |

## 9. Cần bạn quyết

1. **Đồng ý hướng A** (Oratio làm động cơ nói cho lớp, kèm chế độ lẻ) hay muốn ưu tiên người dùng lẻ trước?
2. **Quyền riêng tư:** bạn cùng lớp có được nghe giọng học viên không (kể cả dưới 18 tuổi)? Đề xuất: chỉ trong lớp, giáo viên chọn bật tắt.
3. **Câu neo:** dùng cách B (neo từ giáo viên của lớp) thay cho 60 câu nhờ giáo viên ngoài? Hay vẫn nhờ giáo viên quen chấm 60 câu để có chuẩn chung?
4. **Bước 0:** bạn làm khi nào? Nó chặn mọi thứ phía sau.
5. **Solilo gộp vào Oratio:** đồng ý không? (xem tài liệu Solilo và Synapse)
