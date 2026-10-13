# Radar — cách dùng nhanh

Radar là hộp chứa các bài bạn lượm được khi lướt Threads, Facebook, TikTok.
Bạn gửi bài vào → mở Radar → chọn bài đáng làm thành trend → AI sinh nháp → duyệt như thường.

---

## 1. Gửi bài vào Radar

| Ở đâu | Làm gì |
|---|---|
| **Threads trên laptop** | Bấm **+ Lexica** cạnh giờ đăng bài → gõ ghi chú (nếu muốn) → **Enter**. Shift + bấm = gửi luôn, không ghi chú. |
| **Trang khác trên laptop** | Bôi đen chữ, hoặc chuột phải vào link / trang → **Gửi … vào Lexica Studio**. Hoặc bấm icon chữ **L** trên thanh Chrome. |
| **iPhone** | Trong app: **Chia sẻ** → **Gửi Lexica** → gõ ghi chú (hoặc bỏ trống) → OK. |
| **Android** | Trong app: **Chia sẻ** → **Studio** → **Gửi**. |
| **Trong Studio** | Dán link hoặc nội dung vào ô trên cùng trang Radar → **Thêm**. |

Mẹo: **ghi chú** là thứ giúp AI hiểu trend nhất — ghi ngắn *ai hay nói, nói khi nào, vì sao hot*.

---

## 2. Xử lý trong Radar

Mỗi bài có 3 nút:

- **Tạo trend** — câu trend và ngữ cảnh đã được điền sẵn từ bài + ghi chú.
  Rút gọn **câu trend** thành câu người ta hay nói, giữ tick **Sinh nháp luôn** → **Tạo trend**.
  Xong vào **Duyệt** để duyệt nháp.
- **Sửa** — khi bài hiện *"Chưa đọc được nội dung"* (hay gặp với Facebook): dán nội dung bài vào.
- **Bỏ qua** — bài không dùng. Xem lại ở bộ lọc **Đã bỏ qua** → **Khôi phục**.

Bài không xử lý vẫn được hệ thống gom cụm và chấm điểm tự động (Hệ thống → Chạy pipeline).

---

## 3. Mã gửi bài (chỉ làm một lần cho mỗi thiết bị)

Studio → **Hệ thống** → **Mã gửi bài** → đặt tên thiết bị → **Tạo mã** → **Chép** ngay (chỉ hiện 1 lần).

- **Chrome:** dán vào trang cài đặt của extension → **Lưu và kiểm tra**.
- **iPhone:** dán vào phím tắt *Gửi Lexica* (dòng `Authorization: Bearer lxs_…`).
- Mất máy → bấm **Thu hồi** ở mã đó. Không bao giờ dán mã vào chat.

---

## 4. Khi có trục trặc

| Hiện tượng | Cách xử lý |
|---|---|
| Không thấy nút **+ Lexica** trên Threads | Tải lại trang. Vẫn không có → dùng chuột phải hoặc icon **L**. |
| Extension báo *"Mã gửi bài sai hoặc đã bị thu hồi"* | Tạo mã mới trong Studio, dán lại vào extension / phím tắt. |
| Extension báo *"Không gọi được API"* | Kiểm tra địa chỉ API trong cài đặt extension (đổi domain Railway thì phải sửa ở đây và trong phím tắt iPhone). |
| Bài vào Radar nhưng không có nội dung | Bấm **Sửa** → dán nội dung, hoặc lần sau bôi đen chữ rồi gửi. |
| Mở Studio rất lâu | Server Railway đang "ngủ" dậy — đợi chút; tắt *App Sleeping* trong Railway nếu muốn hết hẳn. |
| Vừa `git pull` extension mới | `chrome://extensions` → bấm nút tải lại ở thẻ Lexica Capture → tải lại tab Threads. |
