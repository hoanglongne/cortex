# Kế hoạch theo đánh giá tổng hợp (10/2026)

Theo dõi việc sửa và cải tiến từ đánh giá tổng hợp các app. Đánh dấu `[x]` khi xong, ghi PR bên cạnh.

## Đợt 1: sửa lỗi (PR #42)
- [x] **Oratio vỡ trang khi ghép phòng** ("No participant provided"): `InCallScreen` gọi `useIsSpeaking` cho bạn ghép cặp khi họ chưa vào phòng. Chỉ đo khi đã có người, bọc màn gọi bằng error boundary.
- [x] **Giao bài: từ nào cũng "chưa có sẵn"** → học viên học từ không liên quan. Project teach thiếu `NEXT_PUBLIC_LEXICA_URL` nên danh sách từ rỗng. Không cho giao khi danh sách từ không tải được; báo rõ khi thiếu cấu hình.
- [x] **Số Hiểu/Nhớ ảo** trên trang học viên: đang đếm cả từ "đã biết sẵn". Tách riêng; giáo viên xem từ của lớp là chính.
- [x] **Tình huống tự ngắt ghi âm** khi vừa nghe thấy từ cần dùng: chỉ dừng khi người nói im lặng.
- [x] **Lexica phát âm chậm**: đo, tải sẵn giọng, nhớ audio đã đọc.

## Đợt 2: trải nghiệm nhỏ (PR #42)
- [x] Thu âm: nhấn giữ để nói, thả ra là dừng; nhắc "nói xong dừng 1–2 giây". Sau khi dùng thử: bỏ giữ-để-nói (khó kiểm soát trên điện thoại), chỉ còn bấm để bắt đầu, bấm Xong để kết thúc (PR #48).
- [x] Đăng ký lần đầu: ô nhập lại mật khẩu (mọi app).
- [x] Album: nói rõ còn bao nhiêu lần ôn đúng để đúc ấn bản.

## Đợt 3: hiệu năng teach và studio (PR #43)
- [x] Đo (Playwright, long task, đếm request) xem lag ở đâu khi chuyển tab. (PR #43)
- [x] Sửa theo số đo: cache dữ liệu dùng chung, tránh tải lại, chia nhỏ component, danh sách dài thì ảo hoá. (PR #43)

## Đợt 4: giao bài bằng nội dung có sẵn của Lexica (PR #43)
- [x] Tab "Chọn từ Lexica" trong form giao bài: duyệt theo nhánh, level, pack Studio; tìm từ; chọn cả pack hoặc từng từ; xem trước. (PR #43)

## Đợt 5: trải nghiệm Lexica (PR #43)
- [x] Viết về hôm nay: kho câu hỏi sâu theo chủ đề và độ sâu, bốc ngẫu nhiên, ưu tiên câu dùng được từ vừa học, nút đổi câu. (PR #43)
- [x] Bắt gặp: làm cả các hướng (người dùng chọn): dán đoạn kèm nơi gặp, săn 5 từ mỗi tuần, bộ sưu tập câu đã gặp, bản đồ nơi gặp. (PR #43)
- [x] Hướng dẫn: gợi ý đúng lúc, trang "Lexica có gì", checklist tuần đầu. (PR #43)

## Đợt 6: chấm phát âm trên máy người học (viết thiết kế trước)
- [x] Thiết kế: `docs/LEXICA_PRONUNCIATION_DESIGN.md` (PR #44). **Đã chốt hướng**: AI chạy trên máy, file mô hình trên Supabase, chỉ tải khi bấm, 3 PR, giáo viên thấy số lần sai theo nhóm âm.
- [x] Bộ ghi âm kiểm định giọng Việt: trang `/ghi-am`, script `evalvi.py`, quy trình `docs/LEXICA_PRONUNCIATION_RECORDING.md` (PR #44). Việc của người dùng: tìm 3–5 người ghi, gửi file zip.
- [x] Thử nghiệm mô hình: `docs/LEXICA_PRONUNCIATION_SPIKE.md` (PR #44). Chọn `whisper-base-en-phoneme-ctc` (MIT, 27MB int8, ~0,3–0,5 giây mỗi lần chấm). Còn kiểm trên giọng Việt và điện thoại thật.
- [x] PR (a) · Mức 1: so khớp từ với câu mẫu (từ thiếu, đổi, nhận sai; độ tin cậy, phương án nhận dạng khác) (PR #45).
- [x] PR (a) · Mức 2: chấm từng âm bằng mô hình trên máy (ẩn sau cờ tới khi qua kiểm định giọng Việt), âm vị qua CMU Pronouncing Dictionary; đoán âm sai; thư viện lỗi hay gặp của người Việt kèm cặp từ dễ nhầm (PR #45). Còn: người dùng đưa gói lên Supabase và gửi bản ghi giọng Việt.
- [x] PR (b) · Mức 3: Web Audio: năng lượng cuối từ (mất âm cuối), cao độ và độ dài (trọng âm, ngữ điệu), tốc độ, ngắt nghỉ; vẽ ngữ điệu so với giọng mẫu (PR #46). Lời nhận xét chỉ hiện cho người thử nghiệm cho tới khi kiểm đủ giọng.
- [x] Giao diện chấm trực quan (`docs/LEXICA_PRONUNCIATION_UI_PLAN.md`): hàng ô âm tô màu, bảng sửa lỗi có hình miệng, trọng âm bằng chấm; gói chấm mở cho mọi người học tự tải; ngưỡng 0,8 (PR #46).
- [x] PR (c) · Mức 4: theo dõi âm hay sai theo thời gian, tự giao bài luyện, tóm tắt cho giáo viên (PR #46). Người dùng chạy lại `packages/classroom-lexica/sql/classroom_lexica.sql`.

## Đợt 7: góp ý sau khi dùng thử (PR #45)
- [x] Buddy: làm lại (tuần học 7 ngày của từng bạn, xếp hạng tuần, nhắc bạn học, mời bằng link); hoạt động gửi lên từ mọi trang; bỏ nút đặt mật khẩu.
- [x] Hội thoại trong Đọc: chế độ Từng lượt (giọng riêng mỗi người, đoán ý câu tiếp), Đóng vai (nói câu của một nhân vật), Cả bài.
- [x] Thanh điều hướng điện thoại ở mọi trang chính: Hôm nay, Luyện, Từ của tôi, Album, Tôi.
- [x] Thống kê từ dữ liệu thật: 7 ngày so với tuần trước, bốn bước 30 ngày, lịch ngày học, lịch ôn, từ cần chú ý. Cài đặt tách ra `/settings`.
- [x] Lỗi: vào lớp bị tính đã học xong bài (bài chỉ tính từ khi được giao).
- [x] Lỗi: luyện nói lặp nội dung (nhớ lúc luyện từng từ, đổi nhóm từ, cặp nghe và cụm).
- [x] Lỗi: Học thêm sau phiên đầu không có Đọc và Nói (thêm lượt học thêm đủ 4 chặng).
- [x] Trang chủ gọn lại, có phần Từ vừa học; danh sách luyện chuyển sang tab Luyện.
- [x] Kế hoạch 100 bài đọc: `docs/LEXICA_READING_PLAN.md`.
- [x] Công cụ "Tạo theo kế hoạch" trong Studio (trang Đọc): bảng đã có / chờ / thiếu, nút "Viết 5 bài còn thiếu"; sự kiện `today_stage` có thêm nguồn bài đọc (PR #45). Việc tiếp: biên tập viên viết và duyệt (bước 2).


## Đợt 8: luyện nói sau khi dùng thử
- [x] Nút ghi âm một kiểu: bấm để bắt đầu, bấm Xong để kết thúc; ô âm sai gọn một dòng (PR #48).
- [x] Laptop: kết quả chấm trượt ra bên phải, sang câu mới thì đề bài trượt về giữa (chuyển động mượt); điện thoại giữ kết quả bên dưới.
- [x] Điểm vui 0–100 cho mỗi lần nói (vòng đếm, câu khen nhẹ nhàng, không lưu, không so sánh).
- [x] Đa dạng bước dùng từ: xoay vòng Nói trong cụm, Nói theo câu thật (câu trích), Nói bằng tiếng Anh (từ câu tiếng Việt của thẻ), Đọc câu của bạn; bước nói từ thỉnh thoảng là "Nghe rồi nhắc lại" (giấu chữ).
- [x] Nghiên cứu giọng đọc thay Gemini: `docs/LEXICA_TTS_RESEARCH.md`. Đề xuất: tạo sẵn audio bằng Kokoro cho nội dung cố định; Kokoro trên máy cho câu tự do.
- [ ] Làm theo đề xuất giọng đọc (chờ người dùng duyệt).

## Đợt 9: luyện nói, góp ý sau khi có giọng Kokoro
- [x] Điểm liên tục thay cho 3 mức (92/70/40): độ khớp chữ, độ tin cậy, thứ hạng phương án nhận dạng; có gói chấm thì nghiêng về âm yếu nhất. Câu khen nhiều câu mỗi mức, không lặp câu liền trước.
- [x] Đồ thị cao độ hiện ở bước nói từ, Nói trong cụm, Nói theo câu thật, Đọc câu của bạn (laptop).
- [x] Bấm Tiếp hoặc Bỏ qua dừng ngay giọng đang phát, kể cả chuỗi 3 giọng; rời bài luyện cũng dừng.
- [x] Bài nghe: thêm 12 cặp âm cuối, chọn giữa mọi nhóm lỗi của từ, tránh 12 cặp vừa nghe.
- [x] Tạo sẵn giọng cho cặp từ, từ gây nhiễu, bài đọc và hội thoại (4.717 đoạn; chạy lại workflow để tạo ~1.450 đoạn mới).
- [ ] Người dùng: thêm `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` cho Cortex API trên Railway (câu tự do vẫn cần API).
- [x] Bấm nghe nhiều lần không còn chạy chồng: mỗi lần bấm dừng giọng cũ (cả chuỗi 3 giọng và "Giọng bạn").
- [x] Bấm Xong: nút đổi ngay sang "Đang chấm…"; chờ API nhận dạng tối đa 6 giây, API lỗi thì bỏ qua cho cả lần truy cập.

## Đợt 10: chuẩn bị beta kín
- [x] Trang Góp ý và báo lỗi (`/feedback`, từ trang Tôi), lưu vào bảng `lexica_feedback` (đọc trong Supabase dashboard). Người dùng chạy `apps/lexica/supabase/migration_feedback.sql`.
- [x] Trang Chính sách riêng tư (`/privacy`) và Điều khoản (`/terms`), bản nháp; dòng đồng ý khi tạo tài khoản. Nên nhờ người am hiểu pháp lý đọc lại trước khi ra mắt công khai.
- [x] Đo thêm: `sign_up`, `sign_in`, `speak_attempt`, `today_complete`, `feedback_sent` (cùng `app_open`, `today_start`, `today_stage` sẵn có) để tính tỷ lệ quay lại và phễu phiên đầu trong PostHog.
- [ ] Hạ tầng ổn định (VPS hoặc Vercel Pro), Cortex API chạy lại.
- [ ] Thử trên 3–4 điện thoại thật (iPhone Safari, Android Chrome, máy rẻ).

## Đợt 11: bài đọc, ELO, bài kiểm tra
- [x] 40 bài đọc mới (12 Cơ bản, 10 Trung cấp, 6 Nâng cao, 4 Chuyên gia, 8 hội thoại) viết quanh những từ chưa có bài nào: số từ có trong bài đọc tăng từ 79 lên hơn 250 trên 610 (test `corePassages`).
- [x] Tìm cụm từ trong bài đọc và Bắt gặp nhận cả dạng chia và cụm bị tách ("looking forward to", "pushed the show back", "ran out of").
- [x] Studio: job "Bài đọc theo kế hoạch" chạy 4h và 16h, mỗi lần viết 5 bài còn thiếu của kế hoạch 100 bài, chờ duyệt (`STUDIO_PASSAGES_PER_RUN`). Cần Cortex API chạy và `STUDIO_CRON=on`.
- [x] ELO không còn cộng trừ theo mỗi lần vuốt, chỉ đổi khi làm bài kiểm tra; bỏ thông báo độ khó tiếng Anh trên trang chủ; trang chọn level ghi "Điểm bài kiểm tra".
- [x] Trang chủ gợi ý đổi level theo tỉ lệ nhớ lại đúng 2 tuần qua (≥85%: thử level cao hơn; <50%: chậm lại).
- [x] Bài kiểm tra thích ứng (PR A trong `docs/LEXICA_LEVEL_TEST_DESIGN.md`): 15–30 câu, 3 dạng, "Không biết", 20 giây mỗi câu, điểm ± sai số và IELTS khoảng; thi lại sau 14 ngày và 100 lượt ôn. Sửa luôn lỗi người đã có level không làm lại bài được.
- [x] Bài kiểm tra PR B: gợi ý thi lại, trang `/score` có biểu đồ, ảnh điểm để chia sẻ. Dạng câu Nghe tuỳ chọn.
- [x] Bài kiểm tra PR C: điểm đã xác minh do Supabase chấm, link `/score/<mã>`, giáo viên thấy điểm. Người dùng chạy `apps/lexica/supabase/migration_placement.sql` rồi `apps/lexica/supabase/placement_bank.sql` (sau `classroom_core.sql`).
