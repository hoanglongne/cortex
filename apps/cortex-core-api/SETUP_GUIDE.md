# CORTEX HUB - Hướng dẫn Hoàn tất Cài đặt (SETUP_GUIDE.md)

Để hệ thống Core API và toàn bộ Ecosystem hoạt động trơn tru, bạn cần chuẩn bị 3 thành phần chính sau đây.

---

## 1. Supabase (Cơ sở dữ liệu)

Bạn cần truy cập vào [Supabase Dashboard](https://supabase.com/) và thực hiện:

### A. Lấy thông tin kết nối:

- Copy `Project URL` và `anon key`.
- Dán vào file `.env` của `apps/cortex-core-api`.

### B. Tạo các bảng dữ liệu (SQL):

Chạy các câu lệnh SQL sau trong bộ SQL Editor của Supabase:

```sql
-- Bảng lưu Action Logs
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  app_source TEXT NOT NULL,
  action_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lưu Backup State
CREATE TABLE app_backups (
  user_id UUID NOT NULL,
  app_source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, app_source)
);

-- Bảng lưu Insights (Sẽ dùng cho Phase 2)
CREATE TABLE user_insights (
  user_id UUID PRIMARY KEY,
  active_vocabulary TEXT[],
  phonetic_weaknesses JSONB,
  fatigue_index FLOAT DEFAULT 0,
  last_refined TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Redis (Xử lý hàng đợi & Cache)

Hệ thống cần Redis để chạy `EventsGateway` và `BullMQ` sau này.

- **Nếu bạn dùng Docker (Khuyên dùng)**:
  ```bash
  docker run -d --name cortex-redis -p 6379:6379 redis
  ```
- **Nếu bạn dùng MacOS**:
  ```bash
  brew install redis
  brew services start redis
  ```

---

## 3. Cấu hình Biến môi trường (.env)

Tạo file `/Users/macos/Desktop/cortex/cortex-workspace/apps/cortex-core-api/.env` với nội dung:

```env
PORT=3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
REDIS_HOST=localhost
REDIS_PORT=6379
# Option: REDIS_URL=redis://...
# Option: REDIS_PASSWORD=...
# Option: REDIS_TLS=true
```

---

## 🚀 Kiểm tra sau khi Setup

1.  Chạy Server: `pnpm --filter @cortex/api start:dev`.
2.  Mở terminal và thử gọi API:
    ```bash
    curl -X POST http://localhost:3001/actions/log \
      -H "Content-Type: application/json" \
      -d '{"userId": "test-user", "appSource": "lexica", "actionType": "COMPLETE_LESSON", "metadata": {"xpEarned": 100}}'
    ```
3.  Nếu thấy log `[ActionLog] New activity...` và không có lỗi kết nối Supabase/Redis nghĩa là bạn đã thành công!
