# Đánh giá khắt khe Lexica (26/11/2026)

Cách làm: đọc mã, đếm nội dung, build bản thật (`next build` + `next start`), và đi thử luồng của người mới bằng Chromium giả lập Pixel 5, có bản giả lập mạng 4G chậm và CPU chậm 4 lần. **Chưa có người dùng thật, chưa có số liệu giữ chân nào**, nên phần "học có hiệu quả không" không đánh giá được. Mỗi phát hiện ghi cách kiểm.

## Kết luận một dòng
Lexica có **ý tưởng học rõ và khác** (từ mới đến trong câu tiếng Việt quen, 4 bước Hiểu → Nhớ → Gặp → Dùng, phiên Hôm nay 10 phút, Blend). Nhưng **kho nội dung quá mỏng** cho một app từ vựng IELTS, **app tải nặng và chậm trên điện thoại thường**, **người mới phải qua 8 màn mới được học**, **tiến độ của người chưa đăng nhập có thể mất trên iPhone**, và **sản phẩm dàn trải ra hơn 40 trang** khi lõi chưa được chứng minh.

## Nghiêm trọng
1. **Kho từ quá nhỏ.** 570 thẻ nhưng chỉ **419 từ khác nhau** ở nhánh Chứng chỉ (243 Cơ bản, 139 Trung cấp, 98 Nâng cao, 90 Chuyên gia), và 40 thẻ Giao tiếp. Một người học đều 10 từ/ngày sẽ hết từ Nâng cao + Chuyên gia (188 từ) trong khoảng 3 tuần. Các app từ vựng IELTS thường có vài nghìn từ. Studio có thể đẩy thêm gói, nhưng bản build không có gói nào đi kèm. *Kiểm:* đếm `VOCAB_DATABASE`, `TALK_CARDS`.
2. **Mọi trang tải cả kho thẻ.** Một chunk 686 KB chứa toàn bộ dữ liệu thẻ được nạp ở **mọi trang**, kể cả trang 404 và Album. Trang đầu tải **khoảng 1,5 MB JavaScript (đã giải nén), 38 yêu cầu**. Trên 4G chậm + CPU chậm 4 lần: **load 4,1 giây, LCP 5,3 giây** (Google coi LCP trên 4 giây là "kém"). Người dùng chính là học sinh, sinh viên với điện thoại tầm trung. *Kiểm:* `.next/static/chunks/14a2jm2_3jfc8.js` có trong `index.html`, `_not-found.html`, `album.html`.
3. **Tiến độ người chưa đăng nhập có thể mất trên iPhone.** Toàn bộ tiến độ nằm trong một khoá `localStorage` (`lexica-storage`, store 1.300 dòng). Safari xoá dữ liệu trang web sau 7 ngày không mở trang (chính sách chống theo dõi của WebKit), trừ khi người dùng thêm vào màn hình chính. Người học nghỉ một tuần quay lại là mất hết lịch ôn. *Kiểm:* `persist(... name: 'lexica-storage')`; sao lưu chỉ chạy khi đã đăng nhập.
4. **Người mới qua 8 màn trước khi học từ đầu tiên:** 1 thẻ thử, 6 màn giới thiệu (câu chêm, chọn nhánh, chọn đời sống, 4 bước, mỗi ngày một nút, lộ trình 30 ngày), rồi màn chọn bài kiểm tra 6 phút hoặc tự chọn trình độ. Nhiều chữ giải thích cơ chế thay vì cho học. *Kiểm:* đi thử bằng trình duyệt, ảnh trong phiên.
5. **Chưa có bằng chứng nào cho lời hứa chính.** "Chỉ đếm từ bạn dùng được", lịch ôn FSRS, phiên 10 phút: chưa có số giữ chân ngày 1/7/30, chưa có thí điểm. PostHog có cài nhưng chưa có ai dùng để đo.

## Nặng
6. **Dàn trải:** 51 trang. Ngoài lõi (Hôm nay, Ôn, Học, Đọc, Nói) còn Album, Bạn học, Thách đấu, Nhật ký, Bắt gặp, Lộ trình, Đấu trường, Blend, Truyện, 16 trò chơi, Viết, Lớp học... Mỗi cái là chỗ phải bảo trì và chỗ người mới lạc. Một người vận hành không giữ được chất lượng cho tất cả.
7. **Trang thử nghiệm lộ ra bản thật:** `/dev/learner`, `/dev/cards`, `/dev/brand`, `/dev/mouth`, `/dev/og`, `/dev/card-fit` trả 200. `/giong-thu` (ghi giọng mẫu) còn sống dù "Giọng bạn" đã dừng (#145 đóng). *Kiểm:* `curl` trả 200.
8. **Lỗi giao diện ở màn chọn nhánh:** lựa chọn đang chọn ("Chứng chỉ") có nền kem nhưng tiêu đề và biểu tượng vẫn màu trắng, nên **không đọc được** lựa chọn mình vừa chọn. Màn "4 bước" dùng cùng kiểu nền thì đúng. *Kiểm:* ảnh onboarding bước chọn nhánh.
9. **Lời và giao diện không thống nhất:** màn `/test` vẫn là kiểu cũ, "Chào mừng đến LEXICA", trộn tiếng Anh ("level", "performance", "Test nhanh"), trong khi phần còn lại đã theo giọng và thiết kế mới.
10. **Test đỏ và cảnh báo tồn:** 5 test e2e `dead-end` hỏng vì tìm nút không còn tồn tại (đã thấy hôm 22/11, chưa sửa); 57 cảnh báo eslint. Bộ e2e đỏ thì không ai tin nó nữa.

## Vừa
11. **Truy cập:** trong phiên Hôm nay, các thẻ xếp chồng; nút của thẻ bị che (ví dụ "Xem từ và nghĩa" của thẻ sau) vẫn nằm trong cây truy cập và bấm được bằng bàn phím, trình đọc màn hình. Thẻ không hiện cần `inert`.
12. **Chấm phát âm trên máy vẫn là bản thử** (chỉ bật cho người thử), dù là "điểm mạnh không tốn AI". Luyện nói hiện dựa vào nhận dạng của trình duyệt hoặc máy chủ.
13. **Nhánh Giao tiếp chỉ có 40 thẻ:** chọn nhánh này thì hết nội dung trong vài ngày. Có nên cho chọn không?
14. **Lộ trình khi bỏ qua onboarding:** vào thẳng `/test` → tự chọn trình độ thì bị đưa về thẻ thử đầu onboarding. Có thể là cố ý; chưa kiểm hết.

## Cái làm tốt (để công bằng)
- **Ý tưởng sư phạm rõ và khác:** câu tiếng Việt có chêm từ, 4 bước có điều kiện thật (Nhớ = đúng ở hai ngày khác nhau), lịch ôn FSRS.
- **Phiên Hôm nay một nút** (Ôn → Học → Đọc → Nói) dễ hiểu; thẻ học đẹp, chữ lớn, thao tác rõ.
- **Không lỗi JavaScript** suốt các lượt đi thử.
- **Ít phụ thuộc AI:** giọng tạo sẵn, chấm phát âm trên máy, Blend chạy bằng luật.
- **Blend** là thứ không ai có.
- **Riêng tư tốt:** chỉ gửi con số cho lớp, xoá tài khoản trong app.

## Giải pháp đề nghị, theo thứ tự
| # | Việc | Giải pháp | Công sức (ước tính) |
|---|---|---|---|
| 2 | Tải nặng | Không nạp cả kho thẻ ở mọi trang: tách dữ liệu thẻ ra JSON tải theo nhu cầu (hoặc theo nhánh, theo cấp), chỉ trang cần thẻ mới tải; đo lại LCP | 2–3 ngày |
| 3 | Mất tiến độ trên iPhone | Nhắc đăng nhập sớm (sau phiên đầu) để sao lưu; lưu thêm vào IndexedDB và xin `navigator.storage.persist()`; app điện thoại (Capacitor) cũng giải quyết | 2–3 ngày |
| 4 | Onboarding dài | Cắt còn: thẻ thử → chọn nhánh → vào học ngay; giải thích 4 bước và lộ trình đưa vào đúng lúc người học gặp chúng | 2 ngày |
| 8, 9 | Lỗi chữ ở màn chọn nhánh, `/test` cũ | Sửa màu chữ khi được chọn; viết lại `/test` theo giọng và thiết kế mới | 1 ngày |
| 7, 10 | Trang dev lộ, test đỏ | Chặn `/dev/*` ở bản thật (notFound khi không phải dev); gỡ `/giong-thu`; sửa hoặc xoá 5 test cũ | nửa ngày |
| 11 | Truy cập thẻ chồng | Đặt `inert` cho thẻ không hiện | 2 giờ |
| 1 | Kho từ mỏng | Đây là việc lớn nhất: dùng Studio để tăng lên ít nhất 1.500–2.000 từ Chứng chỉ có kiểm duyệt; ưu tiên Trung cấp–Nâng cao (nhóm học IELTS cần nhất). Trong lúc đó, nói rõ trong app số từ hiện có | nhiều tuần, chủ yếu là nội dung |
| 6, 13 | Dàn trải | Chọn lõi (Hôm nay, Ôn, Đọc, Nói, Blend); ẩn các phần chưa chứng minh sau một mục "Thêm"; tạm ẩn nhánh Giao tiếp cho tới khi đủ nội dung | 1–2 ngày (ẩn), quyết định là của bạn |
| 5 | Chưa có bằng chứng | Đo giữ chân ngày 1/7/30 bằng PostHog (đã cài) với 20–50 người học thật; đó là số duy nhất trả lời "Lexica có giữ người học không" | phụ thuộc có người dùng |

---

## Kết quả sửa việc 2 (tải dần kho thẻ, 26/11/2026)
Kho thẻ tách ra một gói riêng (552 KB), tải song song; `HydrationGate` chờ nó, nên mã còn lại vẫn đọc thẻ đồng bộ như cũ. Trang đầu, trang 404 và các trang khác không còn chứa kho thẻ trong gói chính. 25 test e2e qua.

Đo trên bản build thật, 4G chậm + CPU chậm 4 lần, trang đầu (3 lần, lấy 2 lần sau):

| | Trước | Sau |
|---|---|---|
| Thời điểm `load` | 4,05 giây | ~2,95 giây |
| LCP | 5,3 giây | ~4,9 giây |

**LCP chỉ giảm khoảng 0,4 giây**, vì nội dung đầu tiên vẫn phải đợi kho thẻ, và vì phần vỏ app (khoảng 1 MB JavaScript ngoài kho thẻ) mới là phần nặng. Đổi kho sang JSON không đáng: phân tích kho chỉ mất ~4 ms trên máy bàn.

**Bước tiếp theo nếu muốn LCP dưới 4 giây:** tìm xem 1 MB vỏ app gồm gì (framer-motion, supabase-js, PostHog, biểu tượng...) và tải sau những gì không cần cho màn đầu.

## Kết quả giảm vỏ app (26/11/2026)
**Lưu ý về cách đo:** lệnh build thật là `next build --webpack` (Vercel chạy `pnpm build`). Các số ở mục trên đo bằng Turbopack nên không dùng để so. Bảng dưới đo cả hai bản bằng webpack, 4G chậm + CPU chậm 4 lần, trang đầu, mỗi bản 4 lần.

| | Trước (commit 230258b) | Sau |
|---|---|---|
| JavaScript tải (đã giải nén) | 1,54–1,78 MB | 0,84–1,01 MB |
| LCP | 4,41–4,85 giây (giữa ~4,56) | 3,98–4,10 giây (giữa ~4,03) |
| Sự kiện `load` | ~3,9 giây | ~5,4 giây |

**Đã làm:** kho thẻ và bài đọc rời gói chính; kho thẻ thành tệp `public/deck/core.json` (192 KB nén), trang tải trước ngay khi đọc HTML nên tải song song với JavaScript chính (trước đây nó chỉ bắt đầu sau khi JavaScript chính tải xong, mất thêm ~2 giây).

**Đánh đổi:** sự kiện `load` muộn hơn vì trình duyệt tải luôn tệp kho thẻ trước khi báo xong; người dùng không thấy sự kiện này, LCP mới là lúc nội dung hiện ra.

**Còn lại trong vỏ app** (phân tích bằng source map): Next.js + React khoảng 520 KB (cố định), Supabase ~160 KB (gồm realtime và lưu tệp mà trang đầu không dùng), framer-motion ~145 KB. Hai việc tiếp theo nếu cần nhanh hơn:
- **Người mới vào `/` bị chuyển sang `/onboarding` sau khi app dựng xong**, tải thêm mã trang đó (~1 giây trên mạng chậm). Chuyển hướng sớm hơn hoặc dựng onboarding ngay ở `/`.
- **Next tải trước 6 trang khác** (`/me`, `/album`...) lúc mở app, giành băng thông trên mạng chậm.
- Supabase và framer-motion tải sau: thay đổi lớn, rủi ro (hiệu ứng ở màn đầu có thể nháy).

## Người mới thấy thẻ đầu tiên nhanh hơn (26/11/2026)
LCP ở trên chưa nói hết: với người mới, LCP được ghi ở trang `/`, nhưng thẻ đầu tiên chỉ hiện sau khi chuyển sang `/onboarding` (tải thêm trang đó, và thanh điều hướng tải trước 5 trang khác cùng lúc). Đo "thẻ đầu tiên hiện ra" (webpack, 4G chậm + CPU chậm 4 lần, 4 lần mỗi bản):

| | Bản gốc (230258b) | Giờ |
|---|---|---|
| Thẻ đầu tiên hiện ra | 5,79–5,97 giây | 3,65–3,71 giây |
| LCP | 4,25–4,41 giây | 3,62–3,69 giây |
| Yêu cầu tải trước trang khác | 11–12 | 0 |

**Đã làm:** người mới thấy onboarding ngay ở `/` (không chuyển trang); thanh điều hướng ẩn cho tới khi xong onboarding, nên không tải trước gì. `/onboarding` vẫn còn cho liên kết cũ.

**Chưa đo:** người đã học (trang Hôm nay) khi quay lại. Kho thẻ tải song song nên dự kiến cũng nhanh hơn, nhưng chưa có số.
