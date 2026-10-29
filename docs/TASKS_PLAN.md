# Quản lý việc: GitHub Issues bây giờ, Cortex Tasks về sau (29/10/2026)

## 1. Bây giờ: GitHub Issues (repo `hoanglongne/cortex`)

Nguồn thật duy nhất của mọi việc. Claude đọc và ghi trực tiếp, bạn xem trên web hoặc điện thoại.

### Nhãn
- **Theo app:** `lexica`, `teach`, `oratio`, `studio`, `core`, `marketing`, `strategy`.
- **Việc của ai:** `việc-của-bạn`, `việc-của-claude` (người hoặc agent khác: dùng assignee).
- **Trạng thái đặc biệt:** `chờ-bạn-duyệt` (Claude xong, cần bạn xem/quyết).
- **Mức độ:** `gấp`, `sau`.
- **Loại** (issue type): Task (việc cụ thể), Bug, Feature.

### Quy ước làm việc với Claude
1. Bạn viết issue (hoặc nói trong chat để Claude viết), gắn `việc-của-claude`.
2. Đầu phiên, Claude đọc issue đang mở gắn `việc-của-claude` và nói việc nào sẽ làm.
3. Khi làm: Claude ghi tiến độ vào comment của issue, tham chiếu issue trong commit và PR (`Closes #n`).
4. Xong: Claude thêm `chờ-bạn-duyệt`, bạn duyệt rồi đóng.
5. Việc cần quyết định của bạn: issue `việc-của-bạn` + `chờ-bạn-duyệt`, Claude nêu phương án và khuyến nghị trong mô tả.
6. **Không tạo việc lặt vặt cho chủ dự án.** Việc nhỏ của bạn (đặt biến, chạy SQL, bấm vài nút) gộp thành **một issue** có checklist, và chỉ tạo khi chúng thật sự chặn công việc. Không đưa vào issue những việc bạn đã nói không cần quan tâm (ví dụ tìm lớp thí điểm).
7. Mỗi phiên kết thúc, việc chưa xong phải có issue (không để việc chỉ nằm trong chat).

### Giới hạn
Claude chỉ làm việc trong phiên bạn mở (hoặc phiên có đăng ký theo dõi PR, hoặc lịch hẹn). Giao việc nghĩa là viết issue rồi nhắn "xem việc tồn". Bảng Project (kéo thả cột) do bạn tạo một lần trên GitHub.

---

## 2. Dài hạn: Cortex Tasks (app riêng trong hệ sinh thái)

Chưa làm. Ghi lại để khi bắt đầu thì không phải nghĩ lại từ đầu.

### Vì sao còn cần, khi đã có GitHub Issues
- Việc không gắn với code: marketing, thí điểm, quan hệ trung tâm, nội dung Studio.
- Giao việc cho người không dùng GitHub (cộng tác viên, giáo viên, người duyệt nội dung).
- Gắn việc với dữ liệu trong hệ sinh thái (lớp thật, cảnh báo nội dung, báo lỗi thẻ từ học viên) và biến nó thành việc tự động.
- Một giao diện hợp với cách làm của bạn.

### Điều kiện để bắt đầu (đủ hai trong ba)
1. GitHub Issues đã bộc lộ giới hạn rõ khi dùng (không chỉ là cảm giác).
2. Có từ hai người hoặc agent ngoài bạn và Claude cùng làm việc.
3. Có việc tự sinh ra từ dữ liệu (ví dụ "thẻ này bị báo lỗi 5 lần" thành một việc cho người duyệt nội dung).

### Yêu cầu bắt buộc: Claude kết nối trực tiếp
- **Máy chủ MCP** (Model Context Protocol) của chính Cortex Tasks, để mọi phiên Claude (và agent khác) thêm vào là dùng được: tạo, đọc, sửa, gán, bình luận, đổi trạng thái, tìm việc của tôi.
- Xác thực bằng token riêng cho từng agent (thu hồi được), ghi rõ ai đã làm gì.
- Phản hồi gọn để agent đọc nhanh; thao tác có tính nguyên tử (nhận việc không bị hai agent cùng nhận).

### Dữ liệu (đề xuất)
- `task`: tiêu đề, mô tả, trạng thái (`todo`, `doing`, `review`, `done`), app, mức độ, hạn, người giao, người nhận.
- Người nhận có loại: `human`, `agent`; gồm cả "Claude".
- `task_event`: lịch sử (ai đổi gì lúc nào), bình luận, liên kết (PR, issue GitHub, thẻ, lớp).
- Quan hệ: việc cha/con, bị chặn bởi việc khác.

### Giao diện
Bảng cột kéo thả, danh sách "việc của tôi", chế độ điện thoại; trang "Claude đang làm gì" (dòng thời gian). Dùng cùng hệ thiết kế và tài khoản như Teach.

### Tích hợp
- Hai chiều với GitHub: tạo issue/PR sinh việc, đóng issue đóng việc.
- Nguồn tự động: báo lỗi thẻ, cảnh báo nội dung (ECOSYSTEM_STRATEGY mục 2), lỗi build.
- Thông báo: email hoặc Zalo/Telegram cho người nhận việc.

### Lộ trình
1. **Nhập dữ liệu thử:** xuất Issues hiện có sang định dạng của Tasks (đảm bảo chuyển đổi được).
2. **Tối thiểu dùng được:** bảng + MCP cho bạn và Claude, nhập từ GitHub.
3. **Nhiều người:** vai trò, người dùng ngoài, thông báo.
4. **Tự động:** nguồn việc từ dữ liệu hệ sinh thái.

### Rủi ro
Xây công cụ cho chính mình dễ biến thành nơi tiêu thời gian. Giữ phạm vi nhỏ; chỉ làm khi đã đủ điều kiện ở trên.
