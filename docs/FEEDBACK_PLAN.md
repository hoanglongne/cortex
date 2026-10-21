# Kế hoạch theo đánh giá tổng hợp (10/2026)

Theo dõi việc sửa và cải tiến từ đánh giá tổng hợp các app. Đánh dấu `[x]` khi xong, ghi PR bên cạnh.

## Đợt 1: sửa lỗi (PR #42)
- [x] **Oratio vỡ trang khi ghép phòng** ("No participant provided"): `InCallScreen` gọi `useIsSpeaking` cho bạn ghép cặp khi họ chưa vào phòng. Chỉ đo khi đã có người, bọc màn gọi bằng error boundary.
- [x] **Giao bài: từ nào cũng "chưa có sẵn"** → học viên học từ không liên quan. Project teach thiếu `NEXT_PUBLIC_LEXICA_URL` nên danh sách từ rỗng. Không cho giao khi danh sách từ không tải được; báo rõ khi thiếu cấu hình.
- [x] **Số Hiểu/Nhớ ảo** trên trang học viên: đang đếm cả từ "đã biết sẵn". Tách riêng; giáo viên xem từ của lớp là chính.
- [x] **Tình huống tự ngắt ghi âm** khi vừa nghe thấy từ cần dùng: chỉ dừng khi người nói im lặng.
- [x] **Lexica phát âm chậm**: đo, tải sẵn giọng, nhớ audio đã đọc.

## Đợt 2: trải nghiệm nhỏ (PR #42)
- [x] Thu âm: nhấn giữ để nói, thả ra là dừng; nhắc "nói xong dừng 1–2 giây".
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
- [ ] PR (b) · Mức 3: Web Audio: năng lượng cuối từ (mất âm cuối), cao độ và độ dài (trọng âm, ngữ điệu), tốc độ, ngắt nghỉ; vẽ ngữ điệu so với giọng mẫu.
- [ ] PR (c) · Mức 4: theo dõi âm hay sai theo thời gian, tự giao bài luyện, tóm tắt cho giáo viên.

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

