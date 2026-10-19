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

## Đợt 6: chấm phát âm không dùng AI (viết thiết kế trước)
Thiết kế: `docs/LEXICA_PRONUNCIATION_DESIGN.md` (PR #44), **chờ duyệt**: 5 câu hỏi ở mục 9.
- [ ] Mức 1: so khớp từ với câu mẫu (từ thiếu, đổi, nhận sai; độ tin cậy, phương án nhận dạng khác).
- [ ] Mức 2: âm vị qua CMU Pronouncing Dictionary; đoán âm sai; thư viện lỗi hay gặp của người Việt kèm cặp từ dễ nhầm.
- [ ] Mức 3: Web Audio: năng lượng cuối từ (mất âm cuối), cao độ và độ dài (trọng âm, ngữ điệu), tốc độ, ngắt nghỉ; vẽ ngữ điệu so với giọng mẫu.
- [ ] Mức 4: theo dõi âm hay sai theo thời gian, tự giao bài luyện, tóm tắt cho giáo viên.
