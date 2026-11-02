# Triển khai: CI tự build, Vercel chỉ nhận bản đã xong (31/10/2026)

## Vấn đề

Vercel gói Hobby giới hạn **100 lượt triển khai mỗi ngày** (cho cả tài khoản). Repo này có **6 dự án Vercel** (landing, lexica, teach, oratio, studio, synapse) cùng nối vào một repo. Mỗi lần đẩy code lên bất kỳ nhánh nào, mỗi dự án đều tạo một lượt triển khai: dự án nào có thay đổi thì build, dự án còn lại bị huỷ bởi "Ignored Build Step". Bằng chứng ở trạng thái commit trên GitHub: một lần đẩy lên nhánh PR hiện đủ 7 dòng "Vercel – ..." (build thật hoặc "Canceled by Ignored Build Step"). Cấu hình `git.deploymentEnabled: {"*": false}` trong `vercel.json` **không ngăn được** việc này.

Hệ quả: 7 lượt cho mỗi lần đẩy, cộng thêm các lần build lỗi (như lỗi font Google Fonts và lỗi `SITE_URL` vừa rồi) và lần build khi merge. Chỉ cần vài chục lần đẩy trong ngày là chạm 100. Việc hủy bởi Ignored Build Step có tính vào hạn mức hay không thì mình **chưa xác nhận được** (Vercel không nói rõ), nhưng việc build thật và build lỗi thì chắc chắn tính.

## Cách làm mới

```
đẩy code (nhánh bất kỳ)  → GitHub Actions: lint, type, test, build   (miễn phí, repo công khai)
merge vào main           → Actions chạy lại CI
                           → nếu qua: chỉ các app đã đổi được build trong Actions
                           → đẩy bản build xong lên Vercel (1 lượt cho mỗi app đã đổi)
```

- **Vercel không còn tự build gì**: nó chỉ nhận bản đã build (`vercel deploy --prebuilt`). Một lần merge đổi 2 app thì chỉ tốn 2 lượt.
- **Đẩy lên nhánh PR không tốn lượt Vercel nào.** Kiểm tra ở GitHub Actions, miễn phí và không giới hạn vì repo công khai.
- **Chỉ deploy khi CI xanh.** Build lỗi như font hay `SITE_URL` sẽ dừng ở Actions, không tới Vercel.
- Chọn app đổi bằng `scripts/affected-apps.mjs`: cùng luật với `vercel-ignore.mjs` (thư mục app, gói workspace nó dùng, file gốc), bỏ qua thay đổi `.md` và `.html`.
- API (NestJS) vẫn do Railway tự deploy, không đổi.

## Thiết lập (một lần, bạn làm)

Làm đúng thứ tự, vì tắt Git của Vercel trước khi Actions chạy được sẽ làm app không được deploy.

1. **Tạo token Vercel**: vercel.com/account/tokens → Create → đặt tên "github-actions". Sao chép token.
2. **Thêm vào GitHub** (repo → Settings → Secrets and variables → Actions):
   - *Secrets* → New repository secret: `VERCEL_TOKEN` = token trên.
   - *Variables* → New repository variable: `VERCEL_ORG_ID` = ID của team (Vercel → Settings của team → General → "Team ID"; nếu dùng tài khoản cá nhân thì ở Settings → General → "Your ID").
   - *Variables* (7 cái), mỗi dự án một cái, lấy ở Vercel → dự án → Settings → General → **Project ID**:
     `VERCEL_PROJECT_LANDING`, `VERCEL_PROJECT_LEXICA`, `VERCEL_PROJECT_TEACH`, `VERCEL_PROJECT_ORATIO`, `VERCEL_PROJECT_STUDIO`, `VERCEL_PROJECT_SYNAPSE`.
     (Tên dự án trên Vercel: landing = `cortex-landing`, lexica = `cortex-lexica`, teach = `lexica-teach`, oratio = `oratio`, studio = `studio`, synapse = `cortex-synapse`.)
3. **Merge PR có file workflow này** vào `main`, rồi xem tab Actions. Lần chạy đầu, jobs `plan` và `deploy` sẽ thử deploy các app đổi. Nếu thiếu biến nào, bước "Check the Vercel settings" nói rõ thiếu cái nào.
4. **Khi một lần deploy từ Actions đã thành công**, mới tắt Git của Vercel cho từng dự án: dự án → Settings → Git → **Disconnect** (bỏ nối repo). Sau đó Vercel không tự tạo lượt triển khai nào nữa; chỉ còn lượt do Actions đẩy lên.
   - Nếu chưa muốn ngắt hẳn: thay vào đó đặt Settings → Git → "Ignored Build Step" thành `exit 0`... nhưng cách này vẫn tạo lượt bị huỷ nên không giải được vấn đề. Ngắt Git mới là cách chắc.
5. **Mỗi dự án** cần Root Directory đúng (đã đặt sẵn, ví dụ `apps/lexica`) và Build Command mặc định; `vercel pull` lấy cấu hình và biến môi trường production từ chính dự án.

## Xem thử trước khi deploy (giao diện và tính năng thật)

Có ba cách, từ rẻ đến sát thật nhất. Không cách nào tốn lượt Vercel mỗi lần đẩy code.

1. **Chạy trên máy bạn (không tốn lượt nào):**
   ```
   pnpm install
   pnpm --filter @cortex/lexica dev        # đổi lexica thành landing, teach, oratio...
   ```
   Cần biến môi trường (Supabase, API): lấy từ Vercel bằng `npx vercel env pull .env.local` chạy trong thư mục app (cần đăng nhập Vercel một lần). Muốn thử trên điện thoại cùng wifi: `pnpm --filter @cortex/lexica dev -- --hostname 0.0.0.0` rồi mở `http://<IP máy>:3000`.
2. **Xem thử trên Vercel khi bạn muốn (1 lượt mỗi lần bấm):** workflow `Preview`. Vào Actions → Preview → Run workflow → chọn app (và nhánh ở ô bên cạnh), hoặc gắn nhãn `preview:lexica` lên PR. Actions build rồi đẩy bản xem thử lên Vercel, đường dẫn hiện ở phần Summary của lần chạy (và trong bình luận PR nếu dùng nhãn). Muốn bản mới sau khi đẩy thêm code, gỡ nhãn rồi gắn lại. Bản xem thử dùng biến môi trường *Preview* của dự án Vercel (đặt riêng với Production, có thể trỏ Supabase thử).
3. **Xem trực tiếp bản đang chạy production** sau khi merge, như hiện nay.

Quy trình đề xuất: làm xong một việc, chạy cách 1 hoặc 2, bạn thử, rồi mới merge.

## Hằng ngày

- Đẩy nhánh, mở PR: chỉ chạy CI.
- Merge: CI → deploy app đổi. Xem kết quả ở tab Actions của GitHub, không cần mở Vercel.
- Lần build nào lỗi thì lỗi ở Actions, xem log ở đó.
- Muốn deploy lại một app (ví dụ sau khi đổi biến môi trường): Actions → lần chạy CI gần nhất trên main → "Re-run jobs" → chọn job `Deploy <app>`.
- Quay lui: Vercel → dự án → Deployments → bản cũ → "Promote to Production".

## Hạn chế

- Mình **chưa thử được** quy trình này vì cần token Vercel (không đưa vào chat). Workflow đã kiểm cú pháp và `affected-apps.mjs` đã chạy thử với các commit thật (đổi font → landing và lexica; chỉ đổi tài liệu → không app nào); phần `vercel pull/build/deploy` chạy lần đầu trên GitHub sẽ cho biết thật.
- `vercel build` chạy trong Actions cần cùng biến môi trường như Vercel (`vercel pull` lấy về), nên các biến `NEXT_PUBLIC_*` trên Vercel phải đúng.
- Mất phần bình luận xem trước trên PR của Vercel (không còn bản xem trước theo nhánh). Muốn xem một nhánh, chạy `pnpm dev` hoặc tạm tạo bản xem trước bằng `vercel deploy` thủ công.


## Vì sao Vercel vẫn chặn vì quá 100 lần triển khai (nghiên cứu 1/11/2026)

**Số liệu** (GitHub Deployments API của repo): ngày 30/10 có 71 lượt triển khai, 31/10 có 59, 1/11 có 29. Gần như tất cả là **Preview**, mỗi lần đẩy một commit lên nhánh làm việc sinh tới 6 lượt, mỗi dự án một lượt. Tức là cấu hình "chỉ triển khai nhánh main" **không có tác dụng**.

**Nguyên nhân:** cấu hình cũ là `"git": {"deploymentEnabled": {"main": true, "*": false}}`. Theo [tài liệu Vercel](https://vercel.com/docs/projects/project-configuration/git-configuration) mẫu nhánh dùng cú pháp minimatch, trong đó `*` **không khớp dấu `/`**. Mọi nhánh làm việc của dự án đều có dạng `long/...`, nên không khớp luật nào, và nhánh không khớp luật nào thì **mặc định được triển khai**. Đã đổi `"*"` thành `"**"` (khớp cả dấu `/`) ở cả 7 `vercel.json`. Nhánh `main` vẫn khớp luật `true` nên vẫn triển khai (có nhiều luật khớp thì chỉ cần một luật `true`).

**Còn lại sau khi sửa:**
- Mỗi lần gộp vào main vẫn sinh lượt Production cho từng dự án có file đổi (`scripts/vercel-ignore.mjs` bỏ qua dự án không đổi). Đổi `pnpm-lock.yaml` hoặc file gốc của workspace sẽ làm **cả 7 dự án** build lại.
- Chưa có xác nhận chính thức rằng build bị bỏ qua bởi Ignored Build Step có tính vào 100 lượt mỗi ngày hay không ([cộng đồng Vercel hỏi chưa có trả lời](https://community.vercel.com/t/do-skipped-monorepo-projects-count-toward-the-hobby-deployment-limit/46295)). Nếu có, 1 lần đẩy lên main = 7 lượt dù chỉ build 1 dự án.
- Cách đo: sau khi sửa, đẩy vài commit lên một nhánh và xem **Vercel → Settings → Usage** có tăng không, và `curl https://api.github.com/repos/hoanglongne/cortex/deployments` có còn dòng "Preview".
- Các biện pháp nếu vẫn chạm giới hạn: gom nhiều commit thành ít lần đẩy lên main; không đổi `pnpm-lock.yaml` nếu không cần; hoặc dùng phương án GitHub Actions ở trên (triển khai bằng CLI, kiểm soát được số lần).
