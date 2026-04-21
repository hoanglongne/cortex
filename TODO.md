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

### 🟢 GIAI ĐOẠN 1: NỀN TẢNG & TRẢI NGHIỆM (EASY - INFRA & UX)

_Mục tiêu: Thiết lập kết nối và tạo hưng phấn cho người dùng._

- [ ] **Supabase Core Setup**: Cài đặt `@supabase/supabase-js`, cấu hình các bảng `users`, `app_backups`, `action_logs`.
- [ ] **Shared Reward System (RewardHelper)**: Triển khai `canvas-confetti` & `howler.js` cho hiệu ứng Milestone toàn monorepo.
- [ ] **Health & Presence**:
  - [ ] Endpoint `/health` kiểm tra Redis/Supabase.
  - [ ] Tích hợp **Supabase Presence** để hiển thị số người đang học online xuyên ứng dụng.
- [ ] **Lightweight Sync API**: Endpoint `POST /v1/sync/backup` để lưu JSON thô.
- [ ] **Ecosystem Banners/Toasts**: Tạo shared component để thông báo sự kiện (ví dụ: "Người dùng X vừa đạt 50 XP ở Lexica!").

### 🟡 GIAI ĐOẠN 2: BỘ NÃO CƠ BẢN (MEDIUM - ANALYTICAL CORE)

_Mục tiêu: Biến dữ liệu thô thành thông tin có ích._

- [ ] **Linguistic Refiner V1**: Sử dụng `natural`, `compromise` và `fillers` để trích xuất:
  - Danh sách từ vựng thường dùng.
  - Chỉ số trôi chảy (Fluency) dựa trên filler words.
- [ ] **Cognitive Load Balancer**: Nếu người dùng sai nhiều ở Oratio, Cortex tự động gắn tag để **Solilo** gợi ý các câu dễ hơn.
- [ ] **Basic ELO Consolidation**: Hợp nhất điểm số từ các app về bảng `linguistic_profiles`.
- [ ] **Active Vocab Bridge (V1)**: Logic so sánh từ vựng Lexica vs Oratio để tìm "từ chết".

### 🟠 GIAI ĐOẠN 3: XỬ LÝ NÂNG CAO & TƯƠNG TÁC (HARD - ADVANCED)

_Mục tiêu: Xử lý thông minh và ngầm._

- [ ] **Background Workers (BullMQ)**: Xử lý Refinement dữ liệu và Audio Analysis mà không làm treo API.
- [ ] **Shadowing Mode**: Cortex tự động biến các đoạn hội thoại Speaking tốt nhất trong **Oratio** thành bài tập Shadowing cho người khác trong **Solilo**.
- [ ] **Semantic Knowledge Map**: Tích hợp `pgvector` và `transformers.js` để xây dựng đồ thị tri thức người dùng.
- [ ] **Fatigue Detection**: Sử dụng `XState` để quản lý trạng thái học tập (Study/Rest) dựa trên hiệu suất thời gian thực.

### 🔴 GIAI ĐOẠN 4: ĐA PHƯƠNG THỨC & AI (VERY HARD - MULTIMODAL)

_Mục tiêu: Trải nghiệm người dùng tương lai._

- [ ] **Edge AI (Web-LLM)**: Tích hợp `@mlc-ai/web-llm` vào Solilo để sửa lỗi ngữ pháp ngay khi nói.
- [ ] **Phonetic Twin**: Phân tích âm thanh sâu với `node-pitchfinder` và `Wav2Vec2`.
- [ ] **Multimodal OCR (Tesseract.js)**: Quét từ vựng từ ảnh chụp sách và đồng bộ vào Lexica.
- [ ] **Real-time Sync (Socket.io + Yjs)**: Cho các tính năng học nhóm/cùng làm bài tập.

### 🟣 GIAI ĐOẠN 5: VŨ TRỤ CORTEX (EXTREME - THE UNIVERSE)

_Mục tiêu: Đỉnh cao công nghệ._

- [ ] **Proof of Learning (Blockchain)**: Cấp chứng chỉ NFT/Token cho các Milestone quan trọng qua `Ethers.js`.
- [ ] **Social Graph (Apache Age)**: Matchmaking thông minh dựa trên đồ thị quan hệ tri thức.
- [ ] **AR Flashcards (Mind-AR)**: Nhận diện vật thể thực tế và tạo Flashcard/Hội thoại tương ứng.

---

## 🛠️ HỆ THỐNG "POWER TOOLS" TỔNG HỢP

| Loại      | Thư viện đề xuất                                                 |
| :-------- | :--------------------------------------------------------------- |
| **NLP**   | `natural`, `compromise`, `retext`, `fillers`, `franc`, `wordnet` |
| **AI/ML** | `transformers.js`, `@mlc-ai/web-llm`, `pgvector`, `Tesseract.js` |
| **Infra** | `Supabase`, `BullMQ`, `Redis`, `Socket.io`, `PeerJS`, `Pino`     |
| **UX/AR** | `canvas-confetti`, `howler.js`, `XState`, `Mind-AR`, `A-Frame`   |

---

_CORTEX HUB - Kết nối thông minh, tiến tới tương lai._
