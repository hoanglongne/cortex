# SYNAPSE: PROJECT CONTEXT & ARCHITECTURE

## 1. Project Overview

Synapse là một ứng dụng học Phrasal Verbs thông qua các kịch bản sinh tồn (Cyberpunk/Wasteland) theo phong cách **Terminal Brutalist**. AI (Gemini/Groq/Gemma) đóng vai trò là "Synapse Architect" để sinh nội dung kịch tính và rẽ nhánh dựa trên lựa chọn của người dùng.

## 2. Core Architecture

### Backend (NestJS - cortex-core-api)

- **Module**: `synapse`
- **Providers**:
  - `GeminiProvider`: Model chính (Gemini 1.5 Flash).
  - `GroqProvider`: Model dự phòng tốc độ cao (Llama 3.3 70B Versatile).
  - `GemmaProvider`: Model dự phòng local (Ollama - localhost:11434).
- **Service**: `SynapseService` quản lý logic Prompt Engineering, nén token history (chỉ giữ 2 stage gần nhất) và cơ chế Fallback 4 lớp.
- **World Bible**: Định nghĩa Lore, Phe phái và Nhiệm vụ tại `world-bibles.ts`.

### Frontend (Next.js - apps/synapse)

- **Flow**: Home -> Lore Selection -> Mission Selection -> Mission Briefing -> Terminal Gameplay.
- **Components**:
  - `LoreSelection`: Xử lý luồng chọn thế giới và nhiệm vụ (Giao diện 2 cột, Cyber-Brutalist UI).
  - `TerminalBoard`: Quản lý State của game (Lives, Integrity, Stages, History).
  - `TerminalOutput`: Hiển thị kịch bản với hiệu ứng Typewriter.
  - `TerminalOptions`: Hiển thị 4 lựa chọn particle (giới từ).

## 3. UI/UX Style Guidelines

- **Brutalist**: Sử dụng font JetBrains Mono, màu Green (#3dff7a) hoặc Amber (#ffb020) trên nền đen tuyệt đối (#0a0a0a).
- **Immersion**: Sử dụng icon từ `lucide-react`, hiệu ứng grid background, scanlines mờ và các thuật ngữ kỹ thuật (Kernel, Neural Link, Syncing).
- **Constraint**: Tuyệt đối không dùng Emoji, không dùng các chi tiết quá "sến" hoặc màu mè.

## 4. Pending Tasks & Future Ideas

- [ ] **Database Persistence**: Hoàn thiện bảng `synapse_logs` để lưu lịch sử chơi lâu dài và cho phép AI học từ lỗi sai của user.
- [ ] **SFX**: Thêm âm thanh gõ phím terminal, tiếng cảnh báo hệ thống (Integrity Low).
- [ ] **Lore Expansion**: Thêm nhiều thế giới mới (Space Horror, Noir Detective).
- [ ] **Achievements**: Hệ thống danh hiệu cho các đặc vụ vượt qua stage 5 mà không mất mạng nào.
- [ ] **Social Sharing**: Tạo ảnh chụp "Mission Summary" theo phong cách terminal để share.

## 5. Current State (2026-04-28)

- Đã hoàn thành cấu trúc đa nhiệm vụ (Multi-mission).
- Đã tối ưu Token Usage cho Groq/Gemini.
- Đã ổn định cơ chế Fallback AI.
- UI đã được nâng cấp lên bản 2.5 đồng bộ toàn diện.
