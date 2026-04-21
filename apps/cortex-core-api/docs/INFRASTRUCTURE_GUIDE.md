# Hướng dẫn Hạ tầng Core API (INFRASTRUCTURE_GUIDE.md)

Tài liệu này hướng dẫn chi tiết các thành phần hạ tầng cốt lõi đã được thiết lập trong **cortex-core-api**.

## 1. Supabase (Database Layer)

Chúng ta sử dụng trực tiếp `@supabase/supabase-js` để tương tác với PostgreSQL.

- **Module**: `SupabaseModule`
- **Service**: `SupabaseService`
- **Tính năng**:
  - `upsertData(table, data)`: Tự động cập nhật hoặc thêm mới dữ liệu.
  - `getData(table, query)`: Truy vấn dữ liệu linh hoạt (đã hỗ trợ lọc theo `userId`).
- **Lợi ích**: Không cần Prisma, linh hoạt với dữ liệu JSONB từ các app con.

## 2. Redis (Caching & Queue Layer)

Sử dụng `ioredis` để quản lý các dữ liệu tạm thời và chuẩn bị cho việc xử lý ngầm.

- **Module**: `RedisModule`
- **Service**: `RedisService`
- **Tính năng**:
  - `set(key, value, ttl)`: Lưu cache với thời gian hết hạn.
  - `get<T>(key)`: Lấy dữ liệu cache và tự động parse JSON.
  - `del(key)`: Xóa cache.
- **Ứng dụng**: Lưu session người dùng, cache ELO nóng, quản lý hàng đợi BullMQ.

## 3. Real-time Events (Communication Layer)

Sử dụng **Socket.io** để kết nối trực tiếp với các ứng dụng Frontend.

- **Module**: `EventsModule`
- **Gateway**: `EventsGateway` (Namespace: `/events`)
- **Tính năng**:
  - `broadcastEvent(event, payload)`: Gửi tin nhắn cho toàn bộ ecosystem.
  - `sendToUser(userId, event, payload)`: Gửi tin nhắn cá nhân hóa.
- **Lợi ích**: Cập nhật thông báo, điểm số và hiệu ứng ngay lập tức mà không cần reload trang.

## 4. Hệ thống Giám sát (Logging)

Tích hợp `pino` và `pino-pretty`.

- **Mục tiêu**: Theo dõi log hệ thống với tốc độ cao và định dạng dễ đọc trong môi trường dev.

## 5. Cấu hình Môi trường (.env)

Các biến cần thiết để hạ tầng hoạt động:

```env
SUPABASE_URL=...
SUPABASE_KEY=...
REDIS_HOST=localhost
REDIS_PORT=6379
```
