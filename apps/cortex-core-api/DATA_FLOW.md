# CORTEX HUB - Luồng Dữ liệu Hệ thống (DATA_FLOW.md)

Tài liệu này mô tả chi tiết cách dữ liệu di chuyển từ các App con (Lexica, Oratio, Solilo) qua Core API (Cortex) và phản hồi ngược lại người dùng.

---

## 🔄 1. Luồng Ghi nhận Hoạt động & Phần thưởng (Action & Reward Flow)

Đây là luồng dữ liệu quan trọng nhất để tạo sự kết nối trong ecosystem.

1.  **Trigger**: Người dùng hoàn thành một bài học ở **Lexica**.
2.  **Request**: App Lexica gọi API `POST /actions/log` với payload chứa `actionType: 'COMPLETE_STORY'` và `userId`.
3.  **Processing (Cortex)**:
    - **Lưu trữ**: `SupabaseService` lưu log này vào bảng `action_logs`.
    - **Kiểm tra**: `ActionsController` nhận thấy đây là hành động "COMPLETE".
4.  **Broadcast**: `RewardHelper` được gọi -> Kích hoạt `EventsGateway` (Socket.io).
5.  **Real-time**: 
    - Server phát sự kiện `user:milestone_reward` tới riêng người dùng đó.
    - Server phát sự kiện `ecosystem:milestone_reached` tới tất cả mọi người đang online.
6.  **UI Feedback**: Các app đang mở sẽ nổ pháo hoa (`confetti`) ngay lập tức.

---

## 💾 2. Luồng Sao lưu & Tinh chỉnh (Backup & Refinement Flow)

Đảm bảo dữ liệu không bị mất và trở nên thông minh hơn.

1.  **Backup**: Định kỳ (hoặc khi thoát app), App con gửi toàn bộ State (JSON) về `POST /v1/sync/backup`.
2.  **Storage**: Cortex lưu vào bảng `app_backups` (Supabase).
3.  **Refinement (Giai đoạn 2)**:
    - Các Worker (BullMQ) quét qua dữ liệu JSON thô.
    - Trích xuất ra các `weak_points` (âm tiết sai, từ vựng hay quên).
    - Cập nhật vào bảng `refined_insights`.

---

## 🧠 3. Luồng Gợi ý Thích ứng (Adaptive Recommendation Flow)

Cortex điều phối việc "học cái gì tiếp theo".

1.  **Startup**: Người dùng mở app **Solilo**.
2.  **Request**: Solilo gọi `GET /v1/insights/:userId`.
3.  **Response**: Cortex trả về danh sách từ vựng người dùng vừa học tốt ở **Lexica** nhưng chưa dùng bao giờ.
4.  **Adaptation**: Solilo ưu tiên hiển thị các Cue Card chứa những từ vựng đó.

---

## 📡 4. Sơ đồ các thành phần

```text
[ App Con ] <---(Socket.io)---> [ Events Gateway ]
     |                                 ^
(HTTP POST)                            |
     |                                 |
[ Actions Controller ] ------> [ Reward Helper ]
     |
[ Supabase Service ] --------> [ PostgreSQL ]
     |
[ Redis Service ] -----------> [ Cache / Queue ]
```
