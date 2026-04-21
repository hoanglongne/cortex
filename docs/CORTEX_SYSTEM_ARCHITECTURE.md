# CORTEX HUB System Architecture & Shared Context

## 1. Tầm nhìn Hệ sinh thái (Ecosystem Vision)

CORTEX HUB là một hệ sinh thái EdTech đa nền tảng, tập trung vào việc tối ưu hóa lộ trình học ngôn ngữ (IELTS) thông qua việc kết nối các ứng dụng chuyên biệt:

- **Lexica**: Học từ vựng thông qua thuật toán ELO và Spaced Repetition (SRS).
- **Oratio**: Luyện nói đối kháng (P2P) và giả lập phòng thi IELTS.
- **Solilo**: Luyện nói cá nhân, tập trung vào fluency và phát âm.
- **Cortex Core API**: Trái tim của hệ thống, quản lý dữ liệu người dùng và tiến trình học tập tập trung.

## 2. Hạ tầng Kỹ thuật (Technical Infrastructure)

Hệ thống được xây dựng trên bộ khung hiện đại nhằm đảm bảo hiệu năng và khả năng mở rộng:

- **Database**: PostgreSQL (qua Supabase) cho lưu trữ dữ liệu ổn định và JSONB linh hoạt.
- **Cache & Queue**: Redis (ioredis) cho xử lý dữ liệu nóng và hàng đợi tác vụ ngầm.
- **Real-time**: Socket.io cho kết nối tức thì giữa Server và các ứng dụng con.
- **Logging**: Pino cho hệ thống giám sát và gỡ lỗi siêu tốc.

## 3. Kiến trúc Shared Types (`@cortex/types`)

Để đảm bảo tất cả các ứng dụng có thể "nói cùng một ngôn ngữ", chúng ta sử dụng gói `@cortex/types` làm chuẩn dữ liệu duy nhất.

### Các Model Dữ liệu Chính:

- **`User`**: Thông tin người dùng cơ bản, band điểm mục tiêu và hiện tại.
- **`AssessmentMetrics`**: Chuẩn hóa các tiêu chí chấm điểm (Fluency, Vocab, Grammar, Pronunciation).
- **`LinguisticProfile`**: Theo dõi "trình độ thực tế" thông qua chỉ số ELO cho từng kỹ năng.
- **`UserProgress`**: Quản lý Streak, tổng thời gian học và cấp độ tổng quát.
- **`ActionLog`**: Nhật ký hoạt động xuyên suốt hệ sinh thái để phục vụ phân tích AI.

## 3. Chiến lược Tích hợp (Integration Strategy)

Hệ thống sử dụng **Mapper Pattern** để kết nối các ứng dụng hiện có với chuẩn dữ liệu chung mà không làm hỏng logic nội bộ của từng app.

### Quy trình trao đổi dữ liệu:

1. **Local App**: Xử lý dữ liệu theo định dạng riêng (ví dụ: `easy/medium/hard` trong Oratio).
2. **Mapper**: Chuyển đổi dữ liệu local sang `@cortex/types` (ví dụ: `easy` -> `beginner`).
3. **Core API**: Nhận dữ liệu chuẩn hóa và lưu trữ vào database tập trung.

## 4. Danh mục Ứng dụng & Vai trò

| Ứng dụng     | Vai trò chính       | Dữ liệu chia sẻ               |
| :----------- | :------------------ | :---------------------------- |
| **Lexica**   | Xây dựng vốn từ     | Vocab ELO, Mastery Level      |
| **Oratio**   | Thực hành giao tiếp | Band Score, Speaking Metrics  |
| **Solilo**   | Tự luyện Speaking   | Pronunciation, Fluency        |
| **Core API** | Central Brain       | Toàn bộ tiến trình người dùng |

## 5. Hướng dẫn Mở rộng

Khi thêm một tính năng mới hoặc một ứng dụng mới vào hệ sinh thái:

1. Kiểm tra xem dữ liệu mới có thể đưa vào `@cortex/types` không.
2. Nếu là dữ liệu chung, cập nhật interface trong `packages/cortex-types/index.ts`.
3. Viết Mapper tương ứng trong ứng dụng mới để đồng bộ hóa.
