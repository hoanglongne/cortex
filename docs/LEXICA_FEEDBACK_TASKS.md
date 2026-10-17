# Lexica: task từ góp ý (2026-10-17)

Chưa task nào được làm. Đường dẫn `app/...` là `apps/lexica/app/...`.

**Quy tắc chung**
- Mỗi tính năng phải trả lời được câu: *"Nó giúp người học nhớ hoặc dùng từ tốt hơn thế nào?"*. Không trả lời được thì cắt.
- Không chạy AI phía người dùng lúc học. `SUPABASE_SERVICE_ROLE_KEY` chỉ đặt trên Railway.
- Style: Lexica và Studio dùng nháy đơn, thụt 4 cách. Không chạy `prettier --write` cho hai app này (chỉ `cortex-core-api` có `.prettierrc`).
- Mỗi PR: có test, `tsc` sạch, không thêm cảnh báo lint mới. Task giao diện thì đính ảnh Playwright ở 375px, 1280px và 1920px.

**Thứ tự làm**

| # | Task | Cỡ | Cần chốt? |
|---|---|---|---|
| T1 | Màn kiểm tra nghĩa bị tràn | S | — |
| T2 | Studio "Ngoài đời" không chạy | L | — |
| T3 | Ôn tập: 5 thanh ngang | M | Giữ "Liều hay Dừng"? |
| T4 | `/level-select` | M | — |
| T5 | Trang chủ trên desktop | M | — |
| T6 | Album / hộp quà | L | Rút gọn kinh tế? |
| T7 | Story pack | S hoặc L | Cắt hay làm lại? |
| T8 | Voice mode | L | API chấm phát âm trả phí? |

---

## T1. Màn kiểm tra nghĩa bị tràn viền dưới

**Lỗi:**
- Thẻ có chiều cao cố định và cắt phần thừa (`overflow-hidden`): mobile 450px, desktop 400px (desktop thấp hơn mobile), tại `components/VocabCard.tsx:108`.
- Bên trong là câu ví dụ không giới hạn dòng, cộng 3–4 lựa chọn, cộng dòng verdict khi sai. Tổng vượt chiều cao thẻ, nhất là câu hỏi nghĩa trên desktop.
- `components/SwipeDeck.tsx` gõ cứng vị trí theo kích thước thẻ ở `:323`, `:369`, `:446`.

**Làm:**
1. Dùng một chiều cao chung `460px` cho mọi màn hình, cập nhật các vị trí tương ứng trong SwipeDeck.
2. Khi đang kiểm tra:
   - Câu ví dụ nhỏ lại (`text-base`).
   - Mỗi lựa chọn chỉ 1 dòng; rút gọn nghĩa đến dấu phẩy đầu tiên.
   - Verdict hiện đè lên chỗ các lựa chọn, không chèn thêm bên dưới.
3. Thêm lưới an toàn `min-h-0 overflow-y-auto` cho phần panel.

**Xong khi:** Playwright ở 375px và 1280px, với câu dài nhất, cả 3 loại câu hỏi, trước và sau khi trả lời sai, thì đáy panel vẫn nằm trong thẻ.

---

## T2. Studio "Ngoài đời": gần như không chạy, khó dùng

**Lỗi** (gây ra ở PR #28):
- `?search=` của Gutendex chỉ tìm trong tên sách và tác giả, không tìm trong nội dung. Vì vậy hầu như từ nào cũng ra 0 kết quả (`apps/cortex-core-api/src/modules/studio/quotes.service.ts:235`).
- Thẻ không tìm thấy không được ghi lại, nên mỗi lần bấm lại tìm đúng 10 thẻ đầu, kẹt mãi ở đó.
- Lỗi mạng bị nuốt, hiện ra như "không tìm thấy".
- Không cắt header/license của Gutenberg.
- Chỉ khớp đúng nguyên dạng từ ("dilemmas" không khớp "dilemma").
- Thêm câu tay phải gõ mã thẻ.
- Không có gì chạy tự động.
- Chỉ xem được câu đang chờ duyệt. `list()` không lấy cột `media`.

**Triết lý:** máy tìm, người chỉ duyệt.

**Làm:**
1. **Kho câu dựng một lần:**
   - Khoảng 40 sách đã hết bản quyền, khai báo trong `studio/corpus/books.ts`.
   - Job `build_corpus` tải về, cắt lấy phần giữa `*** START` và `*** END`, tách câu dài 40–220 ký tự.
   - Lưu vào bảng `studio_corpus_sentences(book_id, text, lemmas text[])`, có index GIN.
2. **Tìm trong DB:** `lemmas @> array[lemma(word)]`. Hàm `lemma()` bỏ đuôi -s/-ed/-ing/-ly. Mỗi thẻ tối đa 3 câu từ 3 sách khác nhau.
3. **Ghi lượt tìm** vào `studio_quote_attempts`, bỏ qua thẻ đã tìm mà không thấy.
4. **Báo tự động:** khớp tiêu đề RSS đã có trong `studio_signals` với từ của thẻ.
5. **Chạy tự động:** job hằng đêm trong `scheduler.ts`, tạo câu chờ duyệt.
6. **UI Studio:**
   - Các tab Chờ / Đã duyệt / Đã loại.
   - Độ phủ "x/540 thẻ có câu".
   - Số câu chưa xuất bản.
   - Ô tìm thẻ theo từ (`GET /studio/cards/search`).
   - Lỗi hiện bằng tiếng Việt.
   - Tách lỗi mạng khỏi trường hợp "không có câu".
7. **Lexica:** hiện sẵn dòng đầu của câu trích, không cần bấm mở.

**Xong khi:**
- Với 100 thẻ đầu, ít nhất 60% có câu, và không câu nào lấy từ header/license.
- Lần bấm thứ hai sang thẻ mới.
- Có test cho `lemma`, cắt START/END, tách câu, truy vấn kho, ghi lượt tìm.

---

## T3. Trang ôn tập: 5 thanh ngang

**Hiện trạng:**
- `app/review/page.tsx` có 5 thanh: thang hũ "Liều hay Dừng", 2 thanh đua với hôm qua, thanh tiến độ, thanh đếm giờ.
- "Đua với bản thân" dùng dữ liệu thật: đối thủ là lượt tốt nhất của chính người học hôm qua (`lib/engagement/ghost.ts`).
- Giới hạn: chỉ lưu trên máy đang dùng, và chỉ so với hôm qua.

**Triết lý:** ôn tập phải yên tĩnh, mỗi lúc một câu hỏi và một thanh tiến độ.

**Làm:**
1. Chỉ giữ 1 thanh tiến độ. Đồng hồ đếm giờ thành vòng tròn nhỏ quanh số thứ tự câu.
2. Gom thông tin còn lại thành một dòng chữ nhỏ: `Hũ 120 · x2 · Bạn 7 / Hôm qua 6`.
3. Đối thủ dự phòng: nếu hôm qua không ôn thì dùng lượt gần nhất trong 7 ngày, ghi rõ ngày.
4. *(Cần chốt)* Giữ "Liều hay Dừng" ở dạng chip gọn, hay bỏ hẳn?

**Xong khi:** trên mobile còn tối đa 1 thanh và 1 dòng chip. Có test cho đối thủ dự phòng.

---

## T4. `/level-select`

**Hiện trạng** (`components/LevelSelector.tsx`):
- Số từ và khoảng ELO là chuỗi gõ cứng, lệch với ngưỡng của bài test (`LevelTest.tsx`).
- Style lệch với phần còn lại (dùng `bg-ink/[0.02]`).
- Dấu tick đặt `absolute` nhưng nút cha thiếu `relative`.
- Không hiện level được đề xuất, ELO hiện tại hay tiến độ.

**Làm:**
1. Gom định nghĩa level vào một chỗ duy nhất `lib/levels.ts`, dùng chung cho test và selector. Số từ đếm từ dữ liệu thật.
2. Mỗi level là một thẻ `bg-surface`, gồm:
   - Mức tương đương (A2–C1).
   - Khoảng ELO và số từ.
   - Thanh tiến độ "đã nhớ x/y".
   - 3 từ mẫu.
   - Badge "Đề xuất" cho level hợp với người học.
3. Trên cùng có thang ELO đánh dấu "Bạn đang ở …" và link "Làm lại bài test". Lựa chọn "Tất cả" tách thành hàng riêng.

**Xong khi:** không còn số gõ cứng (có test đếm số từ), test và selector dùng cùng hằng số.

---

## T5. Trang chủ trên desktop

**Hiện trạng** (`app/page.tsx`):
- Khoảng 700px nội dung đặt giữa một khung 1152px. Sidebar chỉ là các dòng chữ trơn, không có nền thẻ.
- Không có header. Trước khi bắt đầu học, màn hình không hiện tiến độ nào.

**Triết lý:** mở app là biết hôm nay làm gì, chỉ có 1 nút chính.

**Làm:**
1. Thêm header: logo, chip level, chuỗi ngày, rồi Ôn tập (kèm số thẻ đến hạn) / Album / Buddy / Tôi.
2. Lưới `grid-cols-[1fr_340px]`:
   - Cột chính: thẻ "Hôm nay" (mục tiêu ngày + 1 nút chính), sau đó đến deck.
   - Cột phụ: các thẻ "Đến hạn ôn", "Từ khó", "Album tiếp theo", "Drop tuần này".
3. Đổi SmartEntry sang cùng style với các trang khác. Mobile giữ nguyên.

**Xong khi:** ảnh chụp ở 1280px và 1920px không còn khoảng trống lớn hai bên, và màn hình chỉ có 1 nút màu accent.

---

## T6. Album / hộp quà khó hiểu

**Hiện trạng:**
- Có 4 loại tài nguyên (Hộp, Bụi, Vé, Băng) và 4 ấn bản.
- Bụi nhận được từ ngày đầu, nhưng ít nhất 7 ngày sau mới có chỗ tiêu.
- Ấn bản gần như chỉ khác nhau về hình.
- Thẻ may mắn vẫn báo "có quà" khi đã hết lượt trong ngày (`components/SwipeDeck.tsx:157`).
- Thưởng đủ bộ chỉ được nhận khi người học đang mở trang Album.

**Triết lý:** Album là bằng chứng bạn giỏi lên. Quà chỉ đánh dấu cột mốc.

**Làm:**
1. Đầu trang có ô "Tiếp theo" với 1–2 mục tiêu, ghi rõ phần thưởng. Ví dụ: "Còn 3 từ đủ bộ Ăn uống I → 2 Hộp".
2. Hé lộ dần: ngày đầu chỉ có bộ thẻ. "Đúc" hiện khi có thẻ đầu tiên đủ điều kiện đúc, "Hộp" hiện khi nhận hộp đầu tiên.
3. *(Cần chốt)* Bỏ Vé, chuyển Băng ra cạnh chỗ hiện chuỗi ngày. Ví còn Hộp và Bụi.
4. Chỉ bật thẻ may mắn khi đã có thẻ đúc được, để Bụi có chỗ tiêu ngay.
5. Ấn bản có giá trị học tập:
   - Bạc: thêm câu ví dụ thứ 2.
   - Holo: hiện gốc từ.
   - Huyền thoại: hiện câu "Ngoài đời".
6. Một thẻ chỉ tính là "sở hữu" khi đã nhớ thật: `reviewCount ≥ 1`.
7. Sửa hai lỗi hứa suông:
   - Hết lượt may mắn trong ngày thì ẩn badge.
   - Thưởng đủ bộ được nhận trong `EngagementSync`, không cần mở trang Album.
8. Cập nhật `docs/LEXICA_ENGAGEMENT_SPEC.md` theo thay đổi.

**Xong khi:** người mới chỉ thấy bộ thẻ cùng một mục tiêu, và không còn badge may mắn sau khi hết lượt.

---

## T7. Story pack thừa

**Hiện trạng:**
- Chỉ có 3 truyện, dùng 21/540 từ (`app/data/stories.ts`).
- Đọc truyện không được tính vào SRS và không có thưởng.
- Quiz mở Phần 1 không thể qua: chỉ có 3 câu hỏi nhưng yêu cầu đúng 4 (`components/StoryQuizModal.tsx:105`).
- Mở khoá theo cách thường thì không có màn chúc mừng.

**Chọn một trong hai:**
- **A. Cắt (khuyên chọn):** ẩn mọi lối vào (SmartEntry, màn hết thẻ, `/learned`) và bỏ việc ép từ của truyện vào deck. Giữ nguyên route. Cỡ S.
- **B. Làm lại thành "Đọc theo bộ":**
  - Mỗi bộ Album có một đoạn đọc 150–250 từ do Studio soạn.
  - Mở khi người học đã nhớ ≥ 60% từ trong bộ.
  - Đọc xong thì tính là một lần ôn cho các từ trong đoạn.
  - Cỡ L.

---

## T8. Voice mode

**Hiện trạng** (`hooks/useVocalSwipe.ts`):
- Phải đọc đúng nguyên chữ 3 lần liên tiếp. Trong lúc đó không quẹt được thẻ bằng tay.
- Chỉ báo đạt hoặc không đạt, không cho thấy máy nghe ra chữ gì.
- Nhận dạng giọng nói khác với chấm phát âm: máy thường tự sửa phát âm sai thành từ đúng.

**Triết lý:** nghe mẫu → nói → thấy mình sai chỗ nào → nói lại. Đây là một bài luyện riêng, không phải cổng chặn việc quẹt thẻ.

**Làm** (theo thứ tự):
1. Tách thành bài "Luyện nói 2 phút" gồm 5 từ, không chặn việc quẹt thẻ nữa.
2. Hiện "Máy nghe: *cognative*", tô phần sai. Chấm 3 mức Rõ / Gần đúng / Chưa rõ, dựa trên `maxAlternatives=5`, `confidence` và `editDistance`.
3. Nghe mẫu chậm rồi nghe bình thường. Ghi âm giọng mình bằng `MediaRecorder` để nghe lại cạnh bản mẫu.
4. Tách âm tiết và in đậm trọng âm theo IPA, ví dụ "a·BUN·dant".
5. Mẹo cho lỗi hay gặp của người Việt, dựa trên quy tắc:
   - Phụ âm cuối -s, -ed.
   - Âm th, phân biệt v/w.
   - Trọng âm.
6. Sau khi đọc được từ đơn, luyện nói cả cụm "Hay đi với".
7. Lưu lại danh sách "Từ khó nói".
8. *(Cần chốt, để sau)* API chấm phát âm trả phí như Azure hoặc Speechace: chuẩn hơn, nhưng tốn tiền và phải gửi giọng người học ra ngoài.

**Xong khi** (bước 1–4):
- Việc quẹt thẻ không còn bị chặn.
- Màn luyện nói có: chữ máy nghe được, kết quả 3 mức, nút nghe mẫu và nghe lại giọng mình, phần tách âm tiết.
