# Bàn giao cho người (hoặc AI) làm tiếp

Cập nhật 26/10/2026. **Đọc hết file này trước khi làm gì.** Sau đó đọc file kế hoạch của việc đang làm (mục 4).

## 1. Repo
- Monorepo pnpm + turbo. Gói trong workspace dùng `main: ./index.ts` và phải có trong `transpilePackages` của app Next dùng nó.
- Một Supabase cho mọi app: chung tài khoản, chung database.
- `apps/`
  - `lexica`: học từ vựng, 4 bước Hiểu, Nhớ, Gặp, Dùng (+ Đời). Build bằng `next build --webpack`.
  - `oratio`: luyện IELTS Speaking theo cặp qua LiveKit.
  - `teach`: app giáo viên cho mọi app. Mỗi app cắm vào bằng một mô-đun trong `app/modules/<app>/`.
  - `studio`: biên tập viên viết thẻ, bài đọc cho Lexica.
  - `cortex-core-api`: NestJS trên Railway (giọng đọc, nhận dạng giọng, job Studio).
  - Còn lại: `landing`, `solilo`, `synapse`.
- `packages/`
  - `classroom`: lõi lớp học;
  - `classroom-lexica`, `classroom-oratio`: hai mô-đun lớp học;
  - `ui`, `cortex-types`, cấu hình eslint và typescript.
- `tools/lexica-voices`: tạo sẵn giọng Kokoro (nằm ngoài workspace), chạy bằng GitHub Action "Lexica voices".
- `supabase/build-restore.sh`: gom mọi file SQL theo thứ tự thành `restore_all.sql`. Thêm file SQL mới thì thêm vào danh sách đó rồi chạy lại script.

## 2. Quy ước làm việc (bắt buộc)
- **Trả lời người dùng bằng tiếng Việt**, ngắn gọn, dễ hiểu. Comment code và commit message bằng tiếng Anh, theo giọng code xung quanh.
- **Không mở PR khi người dùng chưa bảo.** Cứ sửa, commit, đẩy lên nhánh. Khi họ nói "mở PR" thì mới mở.
- **Nhánh làm việc:** `long/serene-turing-6gfppj`.
  - Luôn `git fetch` và `git merge` trước khi đẩy; không force-push.
  - **Trước khi đẩy, kiểm tra PR trước đã merge chưa.** Nếu đã merge thì đưa nhánh về `main` mới (fast-forward). Commit mới phải nằm trong một PR mới. Khi PR cũ đã merge mà commit mới chưa có PR nào chứa, phải báo người dùng.
- **Commit** kết thúc bằng:
  ```
  Co-Authored-By: <tên model> <noreply@anthropic.com>
  Claude-Session: <link phiên>
  ```
  (hoặc dòng tương đương của công cụ bạn dùng). Không ghi mã model trong commit hay PR.
- **Không bao giờ** đưa khoá bí mật (`SUPABASE_SERVICE_ROLE_KEY`, …) vào code hay chat. Chỉ đặt trong GitHub, Vercel hoặc Railway secrets.
- **Kiểm tra trước khi đẩy**, cho mỗi app có sửa: `npx tsc --noEmit -p .`, `npx eslint app`, `npx vitest run`, `pnpm run build`.
  - Build cần biến môi trường giả: `NEXT_PUBLIC_SUPABASE_URL=https://fake.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=fake`.
  - Build làm đổi `next-env.d.ts`: trả file này về như cũ, không commit.
  - Lexica có route chạy phía server (`app/api/*`): không import code phía client vào đó.
- **SQL:**
  - viết sao cho chạy lại nhiều lần không lỗi;
  - mọi đọc ghi đi qua hàm `security definer`; bảng bật RLS, không có policy cho client;
  - thử bằng PGlite trước (npm `@electric-sql/pglite` trong thư mục tạm; giả `auth.users(id, email)`, `auth.uid()` đọc `current_setting('t.uid')`, role `anon`, `authenticated`);
  - người dùng tự chạy SQL trên Supabase SQL Editor: luôn nói rõ file nào, theo thứ tự nào. Với Teach: chỉ `supabase/teach_all.sql`.
- **Giao diện:**
  - chỉ dùng token màu của theme;
  - phải dùng được trên điện thoại 390px và ở chế độ tối;
  - copy tiếng Việt giọng mềm; khen tiến bộ, không khen điểm.
  - **Người dùng không thích giao diện "lố"** (gradient, icon to, câu sến). Giữ phong cách gọn kiểu trang Luyện và Tôi của Lexica, thêm điểm nhấn màu vừa phải.
  - **Teach có hệ thiết kế riêng** (đã duyệt 26/10, canvas "Teach: thiết kế lại"):
    - nền kem, thẻ trắng bo 16 bóng rất nhẹ, không tô nền màu;
    - tiêu đề và con số chính dùng chữ có chân Lora (`font-serif`), nội dung Be Vietnam Pro 16;
    - một màu nhấn xanh lá (nút chính, liên kết, "ổn"), cam đất chỉ cho "cần làm ngay";
    - khoảng cách rộng: giữa các phần 48, trong thẻ 24–28;
    - mỗi dòng việc có tối đa một nút chính, "Vì sao?" là liên kết, ô tròn ở đầu dòng để đánh dấu "đã xử lý";
    - dùng các thành phần chung trong `apps/teach/app/components/ui.tsx`: `Card`, `SectionTitle`, `Label`, `Stat`, `CopyChip` (có `primary`), `DoneButton`.
- **Kiểm tra giao diện bằng ảnh chụp Playwright:**
  - Chromium có sẵn ở `/opt/pw-browsers/chromium`. Không chạy `playwright install`; cài `playwright-core` trong thư mục tạm.
  - Lexica: đặt sẵn `localStorage['lexica-storage']` (state giả).
  - Teach: auth giả bằng `localStorage['sb-fake-auth-token']`; chặn `https://fake.supabase.co/**` và trả về JSON mẫu (`classroom_whoami`, `classroom_class_board`, …).
  - **Tắt dev server bằng PID**, không dùng `pkill -f` (sẽ giết luôn shell).
- **Riêng tư lớp học:** số liệu gửi cho lớp chỉ là con số, không gửi nội dung học viên tạo ra.
- Chạy nhiều agent hoặc workflow song song phải **hỏi người dùng trước**.

## 3. Đã xong (đến PR #54, đã merge vào `main`; T1, W4, T4 nằm trong PR #54)
- **Lexica:**
  - **Hôm nay:** 4 chặng dạng đường đi, thẻ Nhịp học (chuỗi ngày, 7 ngày, lộ trình 30 ngày).
  - **Luyện:** gom nhóm Giữ từ, Dùng từ (Đọc · Nói · Viết), Thêm từ, Ngoài đời.
  - **Bắt gặp** (`/spot`) bản gọn; **Một câu hôm nay** (`/journal`) bố cục mới.
  - **Luyện nói `/speak`:** điểm vui 0–100, đồ thị cao độ, giọng Kokoro tạo sẵn (đọc thẳng từ Supabase Storage `lexica-content/cache/tts/<sha256>.wav`, xem `lib/audio/voiceKey.ts`), một giọng phát một lúc.
  - **Beta:** trang `/feedback` (bảng `lexica_feedback`), `/privacy`, `/terms`; sự kiện PostHog `sign_up`, `speak_attempt`, `today_complete`, …
  - **Bài đọc:** 54 bài sẵn trong app (`data/passages.ts` và `data/morePassages/`); tìm cụm từ cả dạng chia và cụm tách (`lib/content/phrases.ts`).
  - **ELO:** chỉ đổi khi làm bài kiểm tra. Gợi ý đổi level theo tỉ lệ nhớ đúng (`lib/journey/levelHint.ts`).
  - **Bài kiểm tra từ vựng thích ứng** (`docs/LEXICA_LEVEL_TEST_DESIGN.md`):
    - phần lõi `lib/placement/engine.ts`;
    - 4 dạng câu, câu Nghe là tuỳ chọn;
    - thi lại sau 14 ngày và 100 lượt ôn;
    - trang `/score` có biểu đồ và ảnh chia sẻ;
    - **điểm đã xác minh do Supabase chấm** (`supabase/migration_placement.sql`, `placement_bank.sql`), trang công khai `/score/<mã>`.
- **Teach:** điểm đã xác minh của lớp và từng em (`modules/lexica/scores.ts`).
- **Studio:** job "Bài đọc theo kế hoạch" chạy 4h và 16h (cần API và `STUDIO_CRON=on`).
- **Cortex API:** chạy được khi không có Redis.
- **Tài liệu:**
  - `docs/BUSINESS_MODEL.md`: giá, B2B, gọi vốn;
  - `docs/MIGRATION_VPS.md`: chuyển sang VPS Singapore, Coolify, Cloudflare, LiveKit tự chạy;
  - `docs/FEEDBACK_PLAN.md`: lịch sử các đợt.
- Người dùng **đã chạy** trên Supabase: `migration_feedback.sql`, `migration_placement.sql`, `placement_bank.sql`.

## 4. Đang làm: làm lại Teach (`docs/TEACH_PLAN.md`, đọc kỹ)
- **Thứ tự đã chốt:** T1 → W4 → T4 → Buổi học → T2. T3, T5 để sau. W1, W2 đã bỏ.
- **T1 "Trên lớp", W4 Dự báo, T4 Phụ huynh: đã xong, đã merge trong PR #54.** Chi tiết ở TEACH_PLAN mục 1, 2.6 và 3.6.
  - Chỗ chính: `app/present/[id]`; `packages/classroom-lexica/forecast.ts` (ngưỡng `THRESHOLDS`); `app/lib/forecasts.ts`; `components/Forecast.tsx`; `packages/classroom/sql/classroom_parents.sql`; `app/lib/parentReport.ts`; `components/class/Report.tsx`; trang `app/p/[code]`.
  - **Còn để sau:** thẻ khen gửi về Lexica, kiểm chứng lùi ngưỡng dự báo; email, câu con tự viết, "Nghe con đọc", `pg_cron`, phần Oratio trong báo cáo.
- **Giao diện mới của Teach** (nền kem, tiêu đề serif, nhiều khoảng thở): commit `1bc3c15` trên nhánh, **chưa có PR**. Quy tắc ở mục 2.
- **Buổi học và điểm danh: đã xong** trên nhánh, **chưa có PR** (TEACH_PLAN mục 3.7):
  - SQL mới: `packages/classroom/sql/classroom_attendance.sql` (chạy sau `classroom_parents.sql`); `classroom_parents.sql` có sửa (báo cáo giữ phần `attend`).
  - Phần thuần: `packages/classroom/attendance.ts`, `apps/teach/app/lib/lessons.ts`; test ở `apps/teach/__tests__/attendance.test.ts` và `parentReport.test.ts`.
  - Teach: tab "Buổi học" (`components/class/Lessons.tsx`, `components/lessons/`), điểm danh ở Trên lớp lưu lên máy chủ, trang Hôm nay (buổi dạy hôm nay, buổi chưa điểm danh, em vắng 2 buổi liền), khung "Trên lớp" ở trang một em, dòng đi học trong báo cáo phụ huynh. Dữ liệu nạp qua `lib/useAttendance.ts`.
- **T2a Đấu trường từ vựng (chế độ Cổ điển): đã xong** trên nhánh, **chưa có PR** (TEACH_PLAN mục 4.8):
  - SQL mới: `packages/classroom/sql/classroom_arena.sql`; kiểu và đồng hồ chung: `packages/classroom/arena.ts`.
  - Teach: `components/arena/Arena.tsx`, `lib/arena.ts` (ra câu hỏi, có test `__tests__/arena.test.ts`), `lib/useArenaHost.ts`; mở từ "Trên lớp" → "Đấu trường".
  - Lexica: `app/arena/` (trang `/arena`, `useArenaPlayer.ts`), thẻ "Vào đấu trường" ở `/class`.
  - Màu 4 đáp án là token `arena-1..4` trong theme của cả hai app.
- **T2b: đã xong** trên nhánh, **chưa có PR** (TEACH_PLAN 4.9): chế độ Đội, từ sai vào bài ôn trong Lexica (`app/lib/arenaReview.ts`, `app/arena/applyResults.ts`, store `applyArena`), phân tích từng em và "Giảng lại N từ". SQL vẫn ở `classroom_arena.sql` (chạy lại file này).
- **T3 (gợi ý giao bài, bài kiểm tra lớp) và T5 (Luyện nói trên lớp, Oratio trong báo cáo phụ huynh): đã xong** trên nhánh, **chưa có PR** (TEACH_PLAN mục 5). SQL mới: `packages/classroom/sql/classroom_tests.sql`.
- **SQL cho Teach: chỉ một file.** `supabase/build-restore.sh` sinh thêm `supabase/teach_all.sql` gồm mọi file Teach cần, đúng thứ tự (core, parents, attendance, arena, tests, Lexica module, `migration_placement.sql`, Oratio module). Sau mỗi lần cập nhật Teach, người dùng chỉ chạy file này trong SQL Editor (chạy lại nhiều lần không lỗi). Thêm file SQL mới của Teach thì thêm vào mảng `TEACH` trong script.
- **Việc tiếp theo:** thử Đấu trường với lớp thật (Realtime trên Supabase thật, wifi lớp), rồi T2c (TEACH_PLAN 4.9) hoặc T3, T5.

- **Chiến lược** (27/10): `docs/ECOSYSTEM_STRATEGY.md` (thu thập dữ liệu, app mới, tách chứng chỉ/giao tiếp) và `docs/MARKETING_SESSION_PROMPT.md` (prompt mở phiên marketing).

## 5. Việc của người dùng còn treo
- Railway, Cortex API: thêm `SUPABASE_SERVICE_ROLE_KEY`, `STUDIO_CRON=on`, rồi Redeploy. Railway từng có sự cố tạm dừng deploy.
- Vercel hết lượt deploy (100 mỗi ngày): cân nhắc Vercel Pro hoặc chuyển VPS (`docs/MIGRATION_VPS.md`).
- Chạy workflow "Lexica voices" để tạo giọng cho các đoạn mới (cặp từ, bài đọc, 40 bài mới).
- Thử trên điện thoại thật: luyện nói, bài kiểm tra có xác minh, ảnh chia sẻ.

## 6. Ghi chú kỹ thuật hay vấp
- **Lexica service worker** giữ bản cũ: sau deploy phải tải lại 1–2 lần.
- Danh sách từ cho teach lấy từ `lexica /api/word-index` (cần `NEXT_PUBLIC_LEXICA_URL` ở teach).
- Tên file giọng: `sha256("Kore|<0 hoặc 1 nếu chậm>|<text>")` lấy 32 ký tự đầu, đuôi `.wav`. Từ được lưu ở dạng chữ thường.
- Bộ từ: chỉ khoảng 250 trên 610 từ có trong bài đọc (test `corePassages`). Thêm bài thì phủ được nhiều từ hơn.
- Máy làm việc từ xa không vào được Hugging Face, Supabase thật hay Railway (proxy chặn). Phần nào phụ thuộc mấy chỗ này thì nhờ người dùng thử.
