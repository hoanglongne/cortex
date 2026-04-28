# Page Design Spec — Synapse (Desktop-first)

## Global Styles

* Design language: Terminal brutalist (ít màu, tương phản mạnh, viền cứng, typography mono).

* Tokens (gợi ý):

  * Background: #0B0B0B

  * Surface: #111111

  * Text primary: #EDEDED

  * Text secondary: #A7A7A7

  * Accent (terminal green): #3DFF7A

  * Danger: #FF3D5A

  * Border: #2A2A2A (1px solid)

  * Font: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

* Interaction states:

  * Button/CTA: nền trong suốt + viền; hover tăng độ sáng accent; focus ring 2px accent.

  * Links: underline mảnh; hover đổi sang accent.

* Motion:

  * Typewriter: hiển thị theo ký tự/nhóm ký tự, có caret nhấp nháy.

  * Transition ngắn (100–150ms) cho hover/focus, tránh animation nặng.

## Page: Màn hình Terminal (Synapse)

### Meta Information

* Title: "Synapse — Terminal Scenario"

* Description: "Chơi theo scenario trong giao diện terminal brutalist với typewriter output."

* Open Graph:

  * og:title = "Synapse"

  * og:description = như description

### Layout

* Hệ layout: CSS Grid (desktop-first).

* Grid đề xuất (>= 1024px): 2 cột

  * Cột trái (70%): TerminalBoard + input

  * Cột phải (30%): trạng thái (stage/score/gameover) + sessionHistory

* Spacing: dùng thang 8px; padding page 24px; gap grid 16px.

### Page Structure

1. Header bar (trên cùng)
2. Main content (2-column grid)
3. Footer hint (phím tắt/ghi chú ngắn)

### Sections & Components

#### 1. Header Bar

* Thành phần:

  * App name: "SYNAPSE" (caps, tracking rộng).

  * Status chips: "Stage: {currentStage}", "Score: {score}", "GameOver" (chỉ hiện khi `isGameOver=true`).

  * Primary actions: "Start/Run" (khi chưa có scenario hoặc đang idle), "Restart" (khi game over).

* Hành vi:

  * Start/Run trigger gọi API lấy scenario; disable khi đang loading.

#### 2. TerminalBoard Panel (Left)

* Card/surface: nền #111, viền 1px.

* Nội dung:

  * Output stream: danh sách dòng (system + player), render theo typewriter.

  * Caret: nhấp nháy ở dòng cuối khi chờ input.

* Input row:

  * Prompt prefix: ">" hoặc "$".

  * Text input (single-line) + nút Send.

  * Enter để gửi; Esc để blur (tuỳ).

* Empty/Loading/Error:

  * Loading scenario: hiển thị "Fetching scenario..." theo typewriter.

  * Error: hiển thị thông báo ngắn, khuyến nghị retry.

#### 3. Right Sidebar (Status + History)

* Status block:

  * Stage progress: hiển thị stage hiện tại / tổng stage (nếu có).

  * Game state: badge (Running / Game Over).

* Session History block:

  * Danh sách sự kiện lấy từ `sessionHistory`.

  * Mỗi item: timestamp (nếu có), actionType, tóm tắt metadata.

  * Scroll riêng; giữ bố cục ổn định khi TerminalBoard dài.

#### 4. Footer Hint

* Một dòng hướng dẫn cực ngắn: "Enter: gửi — Start: tải scenario — Restart: chơi lại".

### Responsive behavior (bổ sung tối thiểu)

* < 1024px: chuyển sang 1 cột (TerminalBoard trên, sidebar dưới), giữ trải nghiệm đọc/nhập.

