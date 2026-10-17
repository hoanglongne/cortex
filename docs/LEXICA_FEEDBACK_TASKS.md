# Lexica: task từ góp ý (2026-10-17)

Plan đã được chủ dự án duyệt (2026-10-17), cứ thế làm theo. **Đã làm xong T1–T8 (giai đoạn 1 của T8)** trên nhánh `long/serene-turing-6gfppj`; giai đoạn 2 của T8 (chấm âm vị trên máy) chưa làm. Đường dẫn `app/...` là `apps/lexica/app/...`.

**Quy tắc chung**
- Mỗi tính năng phải trả lời được câu: *"Nó giúp người học nhớ hoặc dùng từ tốt hơn thế nào?"*. Không trả lời được thì cắt.
- Không chạy AI phía người dùng lúc học. `SUPABASE_SERVICE_ROLE_KEY` chỉ đặt trên Railway.
- Style: Lexica và Studio dùng nháy đơn, thụt 4 cách. Không chạy `prettier --write` cho hai app này (chỉ `cortex-core-api` có `.prettierrc`).
- Mỗi PR: có test, `tsc` sạch, không thêm cảnh báo lint mới. Task giao diện thì đính ảnh Playwright ở 375px, 1280px và 1920px.

**Thứ tự làm**

| # | Task | Cỡ | Quyết định |
|---|---|---|---|
| T1 | Màn kiểm tra nghĩa bị tràn | S | — |
| T2 | Studio "Ngoài đời" không chạy | L | — |
| T3 | Ôn tập: 5 thanh ngang | M | Đã chốt: giữ, đổi sang cột dọc |
| T4 | `/level-select` | M | — |
| T5 | Trang chủ trên desktop | M | — |
| T6 | Album / hộp quà | M | Đã chốt: giữ nguyên, giải thích dần |
| T7 | Story → "Đọc" | L | Đã chốt: làm lại, học từ mới qua đoạn văn |
| T8 | Voice mode | L | Đã chốt: không dùng API trả phí |

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
- `app/review/page.tsx` có 5 thanh:
  - thang hũ "Liều hay Dừng"
  - 2 thanh đua với hôm qua
  - thanh tiến độ
  - thanh đếm giờ
- "Đua với bản thân" dùng dữ liệu **thật**: đối thủ là lượt tốt nhất của chính người học hôm qua (`lib/engagement/ghost.ts`). Chỉ lưu trên máy và chỉ so với hôm qua.
- **Điểm trong hũ hiện không có tác dụng gì** ngoài việc so với lượt hôm qua (`recordRun` dùng `banked` làm `score`) và hiện "hũ cao nhất" ở màn kết quả. Đây là lý do người dùng không hiểu hũ để làm gì.

**Đã chốt:** giữ "Liều hay Dừng", nhưng đổi thành **cột dọc gọn nằm cạnh câu hỏi** và phải nói rõ điểm dùng để làm gì.

**Triết lý:** ôn tập yên tĩnh. Mỗi lúc chỉ có 1 câu hỏi và 1 thanh tiến độ ngang; trò chơi nằm gọn ở một bên.

**Làm:**
1. **Thanh ngang duy nhất** là tiến độ câu (n/total). Đồng hồ đếm giờ thành vòng tròn nhỏ quanh số thứ tự câu.
2. **Cột hũ dọc** (component mới `RiskRail`):
   - Vị trí: sát mép phải thẻ câu hỏi; mobile rộng 28px, desktop rộng 44px.
   - Các nấc `x1…x5` (theo `LADDER`) xếp **từ dưới lên**, sáng dần theo chuỗi đúng.
   - Đỉnh cột: số điểm đang có trong hũ. Ngay dưới cột: nút "Chốt" nhỏ.
   - Có khiên Holo thì hiện icon khiên trên đỉnh cột.
   - Trả lời sai: hũ rơi về 0 bằng một hiệu ứng ngắn.
3. **Đua với hôm qua** chuyển thành dòng chữ nhỏ dưới header, không vẽ thanh: `Bạn 7 · Hôm qua 6 ▲`.
4. **Điểm hũ phải có tác dụng rõ:**
   - Điểm đã chốt = điểm của phiên ôn, dùng để **vượt bạn hôm qua**. Thêm dòng "Vượt hôm qua 3 ngày liền → 1 Hộp" (đã có `ghost_streak`).
   - Đề xuất thêm: cuối phiên, điểm chốt **đổi ra Bụi** theo tỉ lệ 10 điểm = 1 Bụi, tối đa 30 Bụi/ngày. Màn kết quả hiện "Chốt 120 điểm → +12 Bụi". Cách này nối trang ôn tập với Album.
   - Lần đầu vào trang ôn tập, hiện một dòng giải thích (chỉ 1 lần): "Đúng liên tiếp thì hũ nhân lên. Sai là mất phần chưa chốt. Bấm Chốt để giữ điểm."
5. **Đối thủ dự phòng:** nếu hôm qua không ôn thì dùng lượt gần nhất trong 7 ngày, ghi rõ ngày, ví dụ "Bạn hôm thứ Ba".

**Xong khi:**
- Trên mobile chỉ còn 1 thanh ngang, 1 cột hũ dọc và 1 dòng chữ.
- Màn kết quả nói rõ điểm đổi ra gì.
- Có test cho: đổi điểm ra Bụi (có giới hạn mỗi ngày), chọn đối thủ dự phòng.

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
- Bụi đến ngay ngày đầu, nhưng phải ≥ 7 ngày sau mới có chỗ tiêu.
- Ấn bản gần như chỉ khác nhau về hình.
- Màn hướng dẫn nói hết mọi thứ trong một lần.
- Thẻ may mắn vẫn hiện "có quà" khi đã hết lượt trong ngày (`components/SwipeDeck.tsx:157`).
- Thưởng đủ bộ chỉ được nhận khi đang mở trang Album.

**Đã chốt:** giữ nguyên 4 loại tài nguyên, không xoá. Chỉ cần **giải thích từ từ, dễ hiểu**.

**Triết lý:** Album là bằng chứng bạn đang giỏi lên. Quà chỉ đánh dấu cột mốc. Người học chỉ cần biết **điều tiếp theo nên làm**, không cần hiểu cả hệ thống.

**Làm:**
1. **Ô "Tiếp theo"** ở đầu trang Album, luôn 1–2 dòng, mỗi dòng ghi rõ phần thưởng:
   - "Còn 3 từ đủ bộ Ăn uống I → 2 Hộp"
   - "COGNITIVE đúc được sau 2 ngày"
   - Viết hàm `nextGoal()` để tính.
2. **Giải thích đúng lúc**: mỗi khái niệm chỉ được giải thích **lần đầu người học gặp nó**, bằng một thẻ nhỏ "Mới: …", bấm "Hiểu rồi" là ẩn. Thứ tự gặp:
   1. Bộ thẻ (ngày đầu)
   2. Bụi (lần đầu nhận)
   3. Hộp (lần đầu nhận)
   4. Đúc (lần đầu có thẻ đúc được)
   5. Vé, Băng (lần đầu nhận)
   - Mỗi thẻ giải thích chỉ 1 câu và nói rõ **dùng để làm gì ngay bây giờ**. Ví dụ: "Bụi: để dành, khi đúc được thẻ thì dùng nâng thẻ lên Bạc."
   - Bỏ màn hướng dẫn 3 bước nói hết mọi thứ. Thay bằng mục "Từ điển Album" (bảng 1 dòng cho mỗi khái niệm) mở từ nút `?`.
3. **Ví:** mỗi loại có một dòng mô tả ngắn và **số lượng có thể dùng ngay**, ví dụ "Bụi 120 · cần 300 để nâng 1 thẻ".
4. **Ấn bản phải có giá trị học**, ghi ngay trên thẻ:
   - Bạc: thêm câu ví dụ thứ 2 (câu theo hình mẫu).
   - Holo: hiện gốc từ, và có khiên trong "Liều hay Dừng".
   - Huyền thoại: hiện câu "Ngoài đời".
5. **Sửa hứa suông:**
   - Hết lượt may mắn trong ngày thì ẩn badge (server trả về số lượt còn lại).
   - Thưởng đủ bộ được nhận trong `EngagementSync`.
6. Thẻ chỉ tính là **"sở hữu" khi đã nhớ thật**: `reviewCount ≥ 1` (`lib/engagement/collection.ts:104`).
7. **Chưa đăng nhập:** chỉ hiện bộ thẻ, kèm một dòng "Đăng nhập để nhận quà khi đủ bộ".
8. Cập nhật `docs/LEXICA_ENGAGEMENT_SPEC.md` cho khớp thực tế, kể cả phần thẻ may mắn.

**Xong khi:**
- Người mới chỉ thấy bộ thẻ và ô "Tiếp theo".
- Mỗi khái niệm được giải thích đúng 1 lần, vào lúc người học gặp nó lần đầu.
- Không còn badge may mắn sau khi hết lượt.
- Có test cho: `nextGoal()`, thứ tự giải thích, ẩn badge.

---

## T7. Story → "Đọc": học từ mới qua đoạn văn ngắn

**Hiện trạng:**
- Chỉ có 3 truyện, dùng 21/540 từ (`app/data/stories.ts`).
- Truyện bị khoá theo số từ đã học, có quiz mở khoá và thời gian chờ 1 giờ.
- Quiz mở Phần 1 không thể qua: 3 câu hỏi nhưng cần đúng 4 (`components/StoryQuizModal.tsx:105`).
- Đọc truyện không được tính vào SRS và không có thưởng.

**Đã chốt:** không xoá. Đổi cách hoạt động cho dễ tiếp cận, ít rào cản, và **học được từ mới ngay trong đoạn văn**.

**Triết lý:** đọc là cách tự nhiên để gặp từ. Mỗi đoạn văn vừa giúp ôn từ đã biết, vừa giới thiệu vài từ mới trong ngữ cảnh. Không khoá, không thi.

**Cách hoạt động mới:**
1. **Luôn mở, không khoá:**
   - Bỏ quiz mở khoá, thời gian chờ và điều kiện số từ.
   - Trang `/read` liệt kê các đoạn theo level và chủ đề; đoạn hợp level người học nhất được đề xuất lên đầu.
2. **Đoạn ngắn:** 120–200 từ tiếng Anh, đọc trong 1–2 phút. Mỗi đoạn chứa:
   - **3–5 từ mới** thuộc bộ thẻ, chưa học.
   - Vài từ người học đã nhớ.
3. **Đánh dấu trong đoạn:**
   - Từ mới: tô màu accent.
   - Từ đã học: gạch chân mờ.
   - Bấm vào từ: hiện thẻ mini (nghĩa, IPA, nút nghe, "Hay đi với") và nút **"Thêm vào phiên học"**. Bấm nút đó sẽ đưa thẻ vào deck như thẻ mới (seed).
4. **Hỗ trợ người yếu tiếng Anh:**
   - Mỗi đoạn có nút "Xem nghĩa tiếng Việt" để hiện bản dịch.
   - Có nút nghe cả đoạn bằng `AudioService`, tốc độ chậm hoặc bình thường.
5. **Nối với việc học:**
   - Đọc xong (cuộn tới cuối, hoặc bấm "Đọc xong") thì mỗi từ đã học có trong đoạn được tính một lượt ôn nhẹ (`good`, qua `updateCardProgress`). Mỗi từ tối đa 1 lần/ngày.
   - Màn kết thúc ghi: "Ôn lại 4 từ · Thêm 3 từ mới vào phiên tới".
   - Không có điểm đậu/rớt. Có thể kèm 2 câu hỏi đọc hiểu tuỳ chọn.
6. **Lối vào:**
   - Trang chủ (cột phụ trên desktop, xem T5): thẻ "Đọc 2 phút".
   - Màn tổng kết phiên: dòng "Đọc một đoạn có từ bạn vừa học".
   - Màn hết thẻ trong SwipeDeck.

**Nội dung (Studio):**
- Thêm loại nội dung `passage`: `{id, level, topic, text, translation, newWords[], words[]}`, xuất bản như pack.
- Prompt Studio: cho trước level, chủ đề và danh sách 3–5 từ mới (ưu tiên từ cốt lõi ít người đã học) cùng các từ cùng level; yêu cầu giọng trung tính, rõ nghĩa. Người soạn duyệt như duyệt thẻ.
- Chuyển 3 truyện cũ sang định dạng mới, cắt mỗi truyện thành 2–3 đoạn.

**Code:**
- Lexica: `app/read/page.tsx`, `app/read/[id]/page.tsx`, `lib/content/passages.ts` (parse), `lib/engagement/reading.ts` (tính ôn nhẹ, chống trùng trong ngày). Các route `/stories` và `/story/[id]` chuyển hướng sang `/read`.
- Gỡ: unlock quiz, `getStoryCatchUpWordIds` (ép từ của truyện vào deck), các hàm deprecated trong store.

**Xong khi:**
- Người mới (chưa học từ nào) vẫn đọc được ngay một đoạn.
- Bấm vào từ mới thì thêm được vào phiên học.
- Đọc xong thì từ đã học trong đoạn được tính một lượt ôn.
- Có test cho: parse passage, tính ôn nhẹ (mỗi từ 1 lần/ngày), thêm từ vào deck.

---

## T8. Voice mode: giúp phát âm tốt hơn, không dùng API trả phí

**Hiện trạng** (`hooks/useVocalSwipe.ts`):
- Phải đọc đúng nguyên chữ 3 lần liền, và voice chặn luôn việc quẹt thẻ.
- Chỉ báo đạt/không đạt; người học không thấy máy nghe ra chữ gì.
- Nhận dạng giọng nói (Web Speech) ≠ chấm phát âm: máy hay tự sửa phát âm sai thành từ đúng.
  - Lưu ý: trên Chrome, âm thanh vẫn được gửi lên server của Google để nhận dạng.

**Đã chốt:** không dùng API trả phí. Dựa vào nghiên cứu, thư viện mã nguồn mở và UX tốt.

### Nghiên cứu làm căn cứ
- **Luyện nghe phân biệt âm (HVPT):** nghe nhiều giọng khác nhau rồi chọn âm đúng, ví dụ cặp tối thiểu *ship / sheep*.
  - Meta-analysis 79 nghiên cứu: cải thiện **khả năng nghe** ở mức trung bình đến lớn (g ≈ 0.92).
  - Meta-analysis 31 nghiên cứu: cải thiện **phát âm** ở mức nhỏ đến trung bình (≈ 10% với từ đã luyện).
  - Kết luận: luyện **nghe phân biệt** trước là có cơ sở và rẻ.
- **Phản hồi trực quan về cao độ và ngữ điệu:** hiện đường cao độ của người học chồng lên đường của giọng mẫu, giúp cải thiện ngữ điệu (Hardison 2004).
- **Lỗi đặc trưng của người Việt** (nhiều nghiên cứu trong nước):
  - bỏ hoặc đổi phụ âm cuối
  - nhầm phụ âm cuối hữu thanh/vô thanh
  - cụm phụ âm
  - các âm /tʃ dʒ ŋ θ/
  - Nên ưu tiên các lỗi này thay vì luyện chung chung.

### Công cụ mã nguồn mở
- **Giai đoạn 1, không cần mô hình:**
  - Web Speech API: nhận dạng từ; lấy `maxAlternatives` và `confidence` để chấm 3 mức.
  - `speechSynthesis`: thường có sẵn nhiều giọng tiếng Anh trên máy, nên dùng được để tạo "nhiều người nói" cho HVPT mà không tốn tiền.
  - `MediaRecorder`: ghi âm giọng người học để nghe lại.
  - Web Audio cộng một thư viện dò cao độ nhỏ (ví dụ `pitchy`, MIT, cần kiểm tra lại): vẽ đường cao độ.
- **Giai đoạn 2, tuỳ chọn, chạy trên máy:**
  - Mô hình nhận dạng âm vị wav2vec2 (xuất ONNX, chạy bằng Transformers.js hoặc onnxruntime-web) để so từng âm với IPA của từ, theo kiểu GOP / mispronunciation detection.
  - Kích thước: bản base khoảng 90–125MB (INT8), bản phoneme XLS-R 300M khoảng 355MB. Quá nặng để tải mặc định trên điện thoại.
  - Vì vậy chỉ nên là gói **tải khi người dùng bấm**, ví dụ "Tải gói chấm phát âm (~120MB)", ưu tiên desktop/Wi-Fi.
  - Thư viện Python tham khảo cách làm: `pronounce-assess` (wav2vec2 CTC so với chuỗi IPA, cho kết quả từng âm). Chỉ dùng để học cách làm, không chạy trên server.

### Triết lý
**Nghe phân biệt → nghe mẫu → nói → thấy mình lệch ở đâu → nói lại.** Đây là bài luyện ngắn riêng, không phải cổng chặn việc quẹt thẻ.

### Làm (giai đoạn 1)
1. **Tách khỏi luồng quẹt:**
   - Thêm bài "Luyện nói 2 phút" gồm 5 từ đến hạn hoặc vừa học.
   - Lối vào: trang chủ và màn tổng kết phiên.
   - Bỏ việc voice chặn quẹt thẻ.
2. **Mỗi từ có 3 bước, mỗi bước khoảng 20 giây:**
   1. **Nghe phân biệt (HVPT):** nghe từ bằng 2–3 giọng TTS khác nhau, chọn đúng từ giữa từ đó và một từ gần âm.
      - Cặp gần âm sinh từ lỗi hay gặp của người Việt: bỏ phụ âm cuối (*light / lie*), -s/-ed, th/t, ship/sheep.
      - Lấy cặp từ danh sách tĩnh `lib/pronunciation/pairs.ts`.
   2. **Nghe mẫu rồi nói:**
      - Phát mẫu chậm, rồi tốc độ bình thường.
      - Hiện cách tách âm tiết có trọng âm lấy từ IPA, ví dụ "a·BUN·dant".
      - Ghi âm người học, sau đó hiện:
        - **Máy nghe được gì**: "Máy nghe: *cognative*", tô phần lệch.
        - Kết quả 3 mức: Rõ / Gần đúng / Chưa rõ (dựa trên alternatives, confidence, `editDistance`).
        - Nút **nghe lại giọng mình cạnh giọng mẫu**.
   3. **Mẹo và nói trong cụm:**
      - 1 mẹo theo quy tắc khớp với lỗi của từ đó, ví dụ "Đừng nuốt âm /t/ cuối".
      - Sau đó nói cụm "Hay đi với", ví dụ "abundant supply".
3. **Đường cao độ** (desktop trước): vẽ cao độ của người học chồng lên giọng mẫu khi nói cụm, để thấy nhấn và xuống giọng.
4. **Từ khó nói:** đếm số lần "Chưa rõ" cho mỗi từ, gom thành danh sách để luyện lại. Lưu trong store và đồng bộ cloud.

### Làm sau (giai đoạn 2, tuỳ chọn)
- Gói chấm âm vị chạy trên máy, tải khi người dùng bấm. Gói này chỉ ra **âm nào sai**, ví dụ "Âm /θ/ trong *thorough* nghe như /t/".
- Khi làm, kiểm định trên bộ dữ liệu mở **speechocean762** trước khi bật cho người dùng.

**Xong khi (giai đoạn 1):**
- Việc quẹt thẻ không còn bị voice chặn.
- Bài luyện nói có đủ 3 bước, có chữ máy nghe được, kết quả 3 mức, nghe lại giọng mình.
- Có test cho: chấm 3 mức, tách âm tiết từ IPA, sinh cặp gần âm, chọn mẹo theo quy tắc.

**Nguồn:**
- HVPT, nghe: [Uchihara, Karas & Thomson 2025, SSLA](https://resolve.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6/core-reader)
- HVPT, phát âm: [Uchihara, Karas & Thomson 2024, Applied Psycholinguistics](https://www.cambridge.org/core/product/E38D8F5CE65DC708137B0E95F97C6BC7)
- Phản hồi cao độ: [Hardison 2004, LLT](https://doaj.org/article/581055d4d4ec401da83bbc04117ec8c9)
- Lỗi phụ âm cuối của người Việt: [Dongnai University](https://www.vjol.info.vn/index.php/NNDS/article/view/20281), [Can Tho University](https://ctujs.ctu.edu.vn/index.php/ctujs/article/view/448)
- Chấm âm vị bằng wav2vec2: [arXiv 2311.07037](https://arxiv.org/pdf/2311.07037), [pronounce-assess](https://pypi.org/project/pronounce-assess/)
- Mô hình ONNX: [phoneme recognizer ~355MB](https://huggingface.co/robg/speako-phoneme-recognizer), [charsiu-js](https://huggingface.co/mnaoizyyy/charsiu-js-models), [wav2vec2-base ONNX](https://huggingface.co/onnx-community/wav2vec2-base-960h-ONNX/tree/main/onnx)
