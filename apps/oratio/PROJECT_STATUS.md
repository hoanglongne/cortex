# Oratio: trạng thái

> Cập nhật 2026-10-18. Xem `README.md` để cài đặt và `../../docs/ORATIO_TASKS.md` để biết việc đã làm và còn lại.

## Chạy thật
- Đăng ký, đăng nhập, quên mật khẩu (`/reset-password`).
- Ghép cặp: hàng chờ có heartbeat, claim nguyên tử, khoảng band mở rộng dần, sau 90 giây thì nhận mọi band; mỗi người chỉ ở một trận.
- Cuộc gọi LiveKit chỉ âm thanh: 18 câu hỏi thật (khoảng 300 câu trong `ielts_questions`), tự đổi vai sau mỗi lượt, đổi vai thủ công có xác nhận. Thẻ đề Part 2 có gạch đầu dòng và đồng hồ 1+2 phút. Thí sinh xem được câu hỏi.
- Đánh giá chéo theo 4 tiêu chí. Server tự tính band tổng và chỉ cho đánh giá một lần cho buổi mà cả hai đã vào phòng.
- Lịch sử (điểm nhận và điểm cho, câu hỏi đã hỏi), xếp hạng theo phút luyện (7 ngày / 30 ngày / tất cả), hồ sơ với điểm trung bình theo tiêu chí, thành tích tính từ số liệu thật, danh sách người đã luyện cùng.
- Luyện một mình: 8 câu, ghi âm ngay trên trình duyệt (không tải lên).

## Chưa có
- Không có AI, transcript hay sửa lỗi.
- Không có bạn bè, lời mời hay hẹn lịch luyện.
- Không có upload avatar.
- Tích hợp với Cortex hub là tuỳ chọn (`CORTEX_API_URL`).
