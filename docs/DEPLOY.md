# Triển khai: CI tự build, Vercel chỉ nhận bản đã xong (31/10/2026)

## Vấn đề

Vercel gói Hobby giới hạn **100 lượt triển khai mỗi ngày** (cho cả tài khoản). Repo này có **7 dự án Vercel** (landing, lexica, teach, oratio, studio, solilo, synapse) cùng nối vào một repo. Mỗi lần đẩy code lên bất kỳ nhánh nào, mỗi dự án đều tạo một lượt triển khai: dự án nào có thay đổi thì build, dự án còn lại bị huỷ bởi "Ignored Build Step". Bằng chứng ở trạng thái commit trên GitHub: một lần đẩy lên nhánh PR hiện đủ 7 dòng "Vercel – ..." (build thật hoặc "Canceled by Ignored Build Step"). Cấu hình `git.deploymentEnabled: {"*": false}` trong `vercel.json` **không ngăn được** việc này.

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
     `VERCEL_PROJECT_LANDING`, `VERCEL_PROJECT_LEXICA`, `VERCEL_PROJECT_TEACH`, `VERCEL_PROJECT_ORATIO`, `VERCEL_PROJECT_STUDIO`, `VERCEL_PROJECT_SOLILO`, `VERCEL_PROJECT_SYNAPSE`.
     (Tên dự án trên Vercel: landing = `cortex-landing`, lexica = `cortex-lexica`, teach = `lexica-teach`, oratio = `oratio`, studio = `studio`, solilo = `cortex-solilo`, synapse = `cortex-synapse`.)
3. **Merge PR có file workflow này** vào `main`, rồi xem tab Actions. Lần chạy đầu, jobs `plan` và `deploy` sẽ thử deploy các app đổi. Nếu thiếu biến nào, bước "Check the Vercel settings" nói rõ thiếu cái nào.
4. **Khi một lần deploy từ Actions đã thành công**, mới tắt Git của Vercel cho từng dự án: dự án → Settings → Git → **Disconnect** (bỏ nối repo). Sau đó Vercel không tự tạo lượt triển khai nào nữa; chỉ còn lượt do Actions đẩy lên.
   - Nếu chưa muốn ngắt hẳn: thay vào đó đặt Settings → Git → "Ignored Build Step" thành `exit 0`... nhưng cách này vẫn tạo lượt bị huỷ nên không giải được vấn đề. Ngắt Git mới là cách chắc.
5. **Mỗi dự án** cần Root Directory đúng (đã đặt sẵn, ví dụ `apps/lexica`) và Build Command mặc định; `vercel pull` lấy cấu hình và biến môi trường production từ chính dự án.

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
