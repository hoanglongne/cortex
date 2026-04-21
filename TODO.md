# CORTEX HUB - Lộ trình Phát triển "Bộ Não Vũ Trụ" (Universe Roadmap)

Tài liệu này quản lý quá trình thực hiện hệ sinh thái EdTech thông minh, được chia theo độ khó tăng dần để đảm bảo tính ổn định.

---

## 🛠️ CHIẾN LƯỢC TRIỂN KHAI (IMPLEMENTATION STRATEGY)

### Phân tích Xung đột & Tối ưu:

1. **Dữ liệu**: Hợp nhất `JSONB Backup` (lưu trữ thô) và `Refined Insights` (kết quả phân tích). Không dùng Prisma để tránh xung đột TypeORM/Supabase.
2. **AI**: Phân cấp AI: **Web-LLM** (Real-time trên Browser cho UI) vs **Server AI** (Xử lý tác vụ nặng qua Queue).
3. **Mở rộng**: Giữ nguyên kiến trúc Monorepo, dùng `@cortex/types` làm xương sống.

---

## 📅 LỘ TRÌNH CHI TIẾT (PHASED ROADMAP)

### 🟢 GIAI ĐOẠN 1: NỀN TẢNG (EASY - INFRASTRUCTURE)

_Mục tiêu: Thiết lập kết nối và lưu trữ cơ bản._

- [ ] **Supabase Integration**: Cài đặt `@supabase/supabase-js`, cấu hình các bảng `users`, `app_backups`, `action_logs`.
- [ ] **Shared Reward System**: Triển khai `RewardHelper` dùng `canvas-confetti` & `howler.js` (Thực hiện nhanh, tạo cảm hứng tốt).
- [ ] **Lightweight Sync API**: Endpoint `POST /v1/sync/backup` để lưu JSON thô từ Lexica/Oratio/Solilo.
- [ ] **Pino Logging**: Thiết lập hệ thống giám sát lỗi toàn Monorepo.

### 🟡 GIAI ĐOẠN 2: BỘ NÃO CƠ BẢN (MEDIUM - ANALYTICAL CORE)

_Mục tiêu: Biến dữ liệu thô thành thông tin có ích._

- [ ] **Linguistic Refiner**: Sử dụng `natural`, `compromise` và `fillers` để trích xuất:
  - Danh sách từ vựng thường dùng.
  - Chỉ số trôi chảy (Fluency) dựa trên filler words.
- [ ] **Basic ELO Consolidation**: Hợp nhất điểm số từ các app về bảng `linguistic_profiles`.
- [ ] **Active Vocab Bridge (V1)**: Logic so sánh từ vựng Lexica vs Oratio để tìm "từ chết".

### � GIAI ĐOẠN 3: XỬ LÝ NÂNG CAO (HARD - ADVANCED ANALYTICS)

_Mục tiêu: Xử lý thông minh và ngầm._

- [ ] **Background Workers**: Cài đặt `BullMQ` & `Redis` để chạy Refiner mà không làm chậm API.
- [ ] **Semantic Knowledge Map**: Tích hợp `pgvector` và `transformers.js` để xây dựng đồ thị tri thức người dùng.
- [ ] **Fatigue Detection**: Sử dụng `XState` để quản lý trạng thái học tập (Study/Rest) dựa trên hiệu suất thời gian thực.

### 🔴 GIAI ĐOẠN 4: ĐA PHƯƠNG THỨC & AI (VERY HARD - MULTIMODAL)

_Mục tiêu: Trải nghiệm người dùng tương lai._

- [ ] **Edge AI (Web-LLM)**: Tích hợp `@mlc-ai/web-llm` vào Solilo để sửa lỗi ngữ pháp ngay khi nói.
- [ ] **Phonetic Twin**: Phân tích âm thanh sâu với `node-pitchfinder` và `Wav2Vec2`.
- [ ] **Multimodal OCR**: Tích hợp `Tesseract.js` để quét từ vựng từ ảnh chụp sách.
- [ ] **Real-time Sync**: Sử dụng `Socket.io` + `Yjs` cho các tính năng học nhóm.

### � GIAI ĐOẠN 5: VŨ TRỤ CORTEX (EXTREME - THE UNIVERSE)

_Mục tiêu: Đỉnh cao công nghệ._

- [ ] **Proof of Learning**: Cấp chứng chỉ Blockchain (NFT/Token) cho các Milestone quan trọng.
- [ ] **Social Graph (Apache Age)**: Matchmaking thông minh dựa trên đồ thị quan hệ tri thức.
- [ ] **AR Flashcards**: Tích hợp AR cho việc học từ vựng qua camera thực tế.

---

## 🛠️ HỆ THỐNG "POWER TOOLS" TỔNG HỢP

| Loại      | Thư viện đề xuất                                      |
| :-------- | :---------------------------------------------------- |
| **NLP**   | `natural`, `compromise`, `retext`, `fillers`, `franc` |
| **AI/ML** | `transformers.js`, `@mlc-ai/web-llm`, `pgvector`      |
| **Infra** | `Supabase`, `BullMQ`, `Redis`, `Socket.io`, `PeerJS`  |
| **UX**    | `canvas-confetti`, `howler.js`, `XState`, `Mind-AR`   |

---

_CORTEX HUB - Kết nối thông minh, tiến tới tương lai._
