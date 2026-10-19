# Bàn giao cho người (hoặc AI) làm tiếp

Đọc file này trước, rồi `docs/FEEDBACK_PLAN.md` (việc còn lại) và `docs/CLASSROOM.md` (hệ thống lớp học).

## Repo
- Monorepo pnpm + turbo. Gói trong workspace dùng `main: ./index.ts` và phải có trong `transpilePackages` của app Next dùng nó.
- Một Supabase cho mọi app: chung tài khoản, chung database.
- `apps/`
  - `lexica`: từ vựng, 4 bước Hiểu, Nhớ, Gặp, Dùng (+ Đời). Build bằng `next build --webpack`.
  - `oratio`: thi thử IELTS Speaking với bạn luyện, qua LiveKit. Code trong `src/`, server actions. Một phiên khác đang làm giao diện "direction D" ở đây.
  - `teach`: "Cortex cho lớp", app giáo viên cho mọi app. Mỗi app cắm vào bằng một mô-đun trong `app/modules/<app>/`.
  - `studio`: biên tập viên viết thẻ cho Lexica.
  - Còn lại: `solilo`, `synapse` (chưa có mô-đun lớp), `landing`, `cortex-core-api`.
- `packages/`
  - `classroom`: lõi lớp học (types, API, luật, hợp đồng mô-đun, `sql/classroom_core.sql`).
  - `classroom-lexica`, `classroom-oratio`: hai mô-đun lớp học.
  - `ui`, `cortex-types`, cấu hình eslint và typescript.
- `supabase/build-restore.sh`: gom mọi file SQL theo thứ tự thành `restore_all.sql`. Thêm file SQL mới thì thêm vào danh sách đó rồi chạy lại script.

## Quy ước làm việc
- **Trả lời người dùng bằng tiếng Việt**, ngắn gọn, dễ hiểu. Comment code và commit message bằng tiếng Anh, theo giọng code xung quanh.
- **Nhánh làm việc**: `long/serene-turing-6gfppj`. Có thể có phiên khác (Oratio) đẩy lên cùng nhánh:
  - luôn `git fetch` rồi `git merge` trước khi đẩy;
  - không force-push đè lên commit của họ;
  - ghi tên commit của họ trong mô tả PR.
- Trước khi đẩy, kiểm tra PR của nhánh. Nếu PR đã merge thì đưa nhánh lên `main` mới (fast-forward) và mở PR mới.
- **Vercel**: chỉ deploy `main` (preview đã tắt vì hết lượt mỗi ngày). `scripts/vercel-ignore.mjs` bỏ qua app không đổi.
- **Kiểm tra trước khi đẩy**, cho mỗi app có sửa: `npx tsc --noEmit -p .`, `npx eslint`, `npx vitest run`, `pnpm run build`.
  - Build cần biến môi trường giả: `NEXT_PUBLIC_SUPABASE_URL=https://fake.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=fake`.
  - Build làm đổi `next-env.d.ts`: trả file này về như cũ, đừng commit.
  - Lexica có route chạy phía server (`app/api/*`): đừng import code phía client (store, hook React) vào đó, build webpack sẽ hỏng (xem PR #38).
- **SQL**:
  - viết sao cho chạy lại nhiều lần không lỗi;
  - mọi đọc/ghi đi qua hàm `security definer`; bảng bật RLS, không có policy cho client;
  - thử bằng PGlite trước khi giao cho người dùng chạy;
  - người dùng tự chạy SQL trên Supabase SQL Editor: luôn nói rõ file nào cần chạy.
- **Giao diện**: chỉ dùng token màu của theme, phải dùng được trên điện thoại 390px và ở chế độ tối. Copy tiếng Việt giọng mềm. Khen tiến bộ, không khen điểm.
- **Riêng tư lớp học**: metrics chỉ là con số, không gửi nội dung học viên tạo ra.

## Trạng thái (19/10/2026)
- Đã merge: lõi lớp học, mô-đun Lexica và Oratio, app teach, đăng nhập bằng mật khẩu, sửa build Lexica (PR #35–#41).
- **PR #42 đang mở** (Đợt 1–2 trong `docs/FEEDBACK_PLAN.md`): lỗi Oratio khi ghép phòng, chặn giao bài khi danh sách từ không tải được, tách từ "biết rồi", ghi âm Tình huống, giữ-để-nói, tải trước giọng đọc, nhập lại mật khẩu, Album ghi rõ số lần.
  - Chưa thử trên trình duyệt thật: ghi âm, giọng đọc, màn gọi Oratio, đăng ký.
- Người dùng cần làm sau khi merge PR #42:
  - chạy lại `packages/classroom-lexica/sql/classroom_lexica.sql`;
  - kiểm tra project teach trên Vercel có `NEXT_PUBLIC_LEXICA_URL` (và `NEXT_PUBLIC_ORATIO_URL`).

- PR #42 đã merge. **PR #43** (Đợt 3 hiệu năng teach và studio, Đợt 4 chọn từ Lexica khi giao bài) đang mở.
  - Đợt 4: `/api/word-index` của Lexica gửi thêm `pack` (tên drop hiện tại, hoặc trend của thẻ thư viện), `scenario`, `ipa`. Teach lọc bằng `apps/teach/app/modules/lexica/browse.ts`. Bản Lexica cũ không gửi các trường này thì teach vẫn chạy, chỉ thiếu bộ thẻ và câu mẫu.
  - Teach: dữ liệu lớp nằm trong một cache dùng chung (`apps/teach/app/lib/teaching.ts`, dùng được 30 giây). Sửa gì thì gọi `reload` của `useBoard`/`useTeaching`. Tab trong lớp đổi URL bằng `history.replaceState`, đừng đổi lại thành `router.replace`.
  - Studio: `api()` giữ kết quả GET gần nhất (`cached(path)`), mọi thao tác ghi xoá cache.

## Việc tiếp theo
Theo `docs/FEEDBACK_PLAN.md`, từ **Đợt 5** (cần người dùng duyệt hướng trước khi code).
- Đợt 5 và 6 cần người dùng duyệt hướng hoặc thiết kế trước khi code.
- Thêm app vào lớp học: làm theo quy trình trong `docs/CLASSROOM.md`, bước 1 là hỏi người dùng giáo viên giao gì, xem gì, xếp hạng theo gì.

## Công cụ hữu ích
- Chụp màn hình bằng Playwright: Chromium có sẵn tại `/opt/pw-browsers/chromium`. Không chạy `playwright install`.
- App teach chạy được với Supabase giả: chặn các request `https://fake.supabase.co/rest/v1/rpc/*` và trả về board mẫu. Auth giả bằng localStorage `sb-fake-auth-token`.
