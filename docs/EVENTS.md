# Bộ sự kiện chung (issue #61)

Bốn app (Lexica, Oratio, Teach, Synapse) gửi sự kiện theo **cùng một quy ước**, nên một phễu đọc xuyên cả bốn: vào Lexica → vào lớp → chơi Đấu trường → luyện nói ở Oratio. Mã nằm ở `packages/events` (`@cortex/events`).

## Bật lên
Đặt cùng một khoá PostHog cho **cả 4 project Vercel** (lexica, oratio, teach, synapse):

| Biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | khoá dự án PostHog (giống nhau ở cả 4 app) |
| `NEXT_PUBLIC_POSTHOG_HOST` | tuỳ chọn, mặc định `https://us.i.posthog.com` |

Không có khoá thì không gửi gì và app chạy bình thường. Sau khi đặt, Redeploy từng project.

## Quy ước
- **Người dùng là một người, không phải bốn.** Sau khi đăng nhập, `distinct_id` là Cortex user id (giống nhau ở mọi app vì dùng chung một Supabase). Trước đăng nhập là một id ẩn danh của trình duyệt; khi đăng nhập app gửi `$identify` một lần để nối hai phần lại.
- **Mỗi sự kiện có `app`** (`lexica | oratio | teach | synapse`) và, nếu có nghĩa, **`track`** (`vocab | speaking | story | class | teaching`).
- **Lớp học ẩn danh hoá:** thuộc tính `class` là 12 ký tự đầu của SHA-256("cortex-class-v1:" + id lớp), tính ngay trên máy; id thật không rời máy.
- **Chỉ con số, cờ và nhãn ngắn.** Khoá có chữ `text`, `transcript`, `answer`, `note`, `message`, `email`, `name`, `sentence`, `audio`, `content` và chuỗi dài hơn 80 ký tự bị loại tự động. Nội dung học viên viết hay nói không bao giờ được gửi.

## Sự kiện dùng chung
| Sự kiện | Khi nào | Thuộc tính | Gửi từ |
|---|---|---|---|
| `app_open` | mở app | — | cả 4 app |
| `sign_up` | tạo tài khoản | `method`, `confirm` | Lexica |
| `sign_in` | đăng nhập | `method` | Lexica; Oratio, Teach, Synapse tự gửi khi phiên đăng nhập đổi từ chưa có sang có trong lúc trang mở |
| `class_joined` | vào lớp | `via` (`code`/`link`), `class` | Lexica, Oratio |
| `class_created` | giáo viên tạo lớp | `apps`, `class` | Teach |
| `practice_started` | bắt đầu một buổi luyện | `mode`, … | Oratio (`mock_exam`), Synapse (`mission`/`review`) |
| `practice_completed` | xong một buổi luyện hoặc một lần nói | `mode`, … | Oratio (`mock_exam`; `take` kèm `part`, `retake`, `seconds`; `live`), Synapse (`mission`/`review`, `ending`) |
| `arena_joined` | vào phòng Đấu trường | — | Lexica |
| `arena_finished` | thấy kết quả ván Đấu trường | — | Lexica |
| `cross_app_click` | bấm sang app khác | `from`, `to`, `where` | Lexica (thang nói, hẹn thi Buddy, truyện) |
| `class_left` | rời lớp | `class` | Lexica |
| `assignment_created` | giáo viên giao bài | `app`, `kind`, `source` (`manual`/`suggestion`/`forecast`), `scope` (`class`/`student`), `class` | Teach |
| `test_created` | giáo viên tạo bài kiểm tra | `questions`, `class` | Teach |
| `test_started` | học viên mở bài kiểm tra | `questions` | Lexica |
| `test_submitted` | học viên nộp bài kiểm tra | `questions`, `answered` | Lexica |
| `arena_hosted` | giáo viên mở phòng Đấu trường | `mode`, `questions`, `class` | Teach |
| `peer_review_submitted` | chấm cho bạn trong Oratio | `tags` | Oratio |
| `match_search_started` | bắt đầu tìm bạn luyện | `bandMin`, `bandMax` | Oratio |
| `match_found` | tìm được bạn luyện | — | Oratio |
| `question_answered` | trả lời một câu/cảnh | `correct`, `where`, `stage` | Synapse |

Lexica giữ thêm các sự kiện riêng (`today_start`, `swipe`, `story_*`, `buddy_*`, `speak_attempt`…); chúng vẫn gửi như cũ và được gắn `track` theo tiền tố tên.

## Phễu gợi ý trong PostHog
`app_open` (app = lexica) → `sign_up` → `class_joined` → `arena_joined` → `practice_completed` (app = oratio). Lọc theo `track` hoặc `class` để so lớp với lớp.

## Thêm một sự kiện mới
1. Cần tên mới thì thêm vào `EVENTS` trong `packages/events/index.ts` và vào bảng trên.
2. Gọi `analytics.capture(EVENTS.x, props, { track, classId })` (Oratio/Teach/Synapse: `src/lib/analytics` hoặc `app/lib/analytics`; Lexica: `capture` trong `app/lib/productAnalytics`).
3. Không đưa nội dung người học tạo ra vào thuộc tính.
