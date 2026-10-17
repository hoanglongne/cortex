# Lexica — Task list từ góp ý (đợt 2026-10-17)

> File này để giao việc cho người/AI khác làm tiếp. Mỗi task có: **hiện trạng** (đã đọc code, có đường dẫn), **triết lý** của tính năng, **plan**, **tiêu chí xong**. Chưa task nào được làm.
>
> Đọc kèm: `docs/LEXICA_CONTENT_PLAN.md`, `docs/LEXICA_ENGAGEMENT_SPEC.md`, `docs/LEXICA_STUDIO_SPEC.md`. Đường dẫn `app/...` dưới đây là `apps/lexica/app/...` trừ khi ghi khác.

## Quy tắc chung cho mọi task

- Mỗi tính năng phải trả lời được một câu: **"Nó giúp người học nhớ từ hoặc dùng từ tốt hơn như thế nào?"**. Không trả lời được thì cắt hoặc thu nhỏ.
- Không AI chạy phía người dùng lúc học (xem `LEXICA_STUDIO_SPEC.md`). AI chỉ chạy lúc soạn nội dung trong Studio.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ đặt trên Cortex API (Railway).
- Giữ style của repo:
  - Lexica và Studio: nháy đơn, thụt 4 cách, **không có cấu hình Prettier**, nên **đừng chạy `prettier --write`** trên hai app này.
  - Chỉ `apps/cortex-core-api` có `.prettierrc`.
- Mỗi PR: test (`vitest` cho Lexica, `jest` cho API), `tsc` sạch, lint không thêm cảnh báo mới.
- Với task giao diện: chụp màn hình bằng Playwright ở 375×667, 768×1024, 1280×800, 1920×1080 (cả light và dark) rồi đính vào PR.

## Thứ tự gợi ý

| # | Task | Loại | Cỡ | Cần chủ dự án quyết? |
|---|---|---|---|---|
| T1 | Màn kiểm tra nghĩa bị tràn viền | Bug | S | Không |
| T6 | Studio "Ngoài đời" hầu như không chạy, khó dùng | Bug + rework | L | Không (đã có hướng) |
| T7 | Trang ôn tập: 5 thanh ngang rối mắt | UX | M | Có: giữ "Liều hay Dừng" không |
| T5 | `/level-select` rework | UI | M | Không |
| T4 | Trang học chính trên desktop | UI | M | Không |
| T3 | Album / hộp quà khó hiểu | Product + UI | L | Có: mức độ rút gọn kinh tế |
| T2 | Story pack thừa | Product | M–L | Có: cắt hay làm lại |
| T8 | Voice mode mới | Product + UI | L | Có: có dùng API chấm phát âm trả phí không |

---

## T1. Màn kiểm tra nghĩa khi bấm "Đã nhớ" bị tràn viền dưới (P0)

### Hiện trạng
- `components/VocabCard.tsx:108`: thẻ có chiều cao cố định `h-[450px] sm:h-100` (sm trở lên là 400px) và có `overflow-hidden`.
  - Desktop vì vậy **thấp hơn** mobile.
  - Trừ padding, chỗ cho nội dung còn khoảng 410px trên mobile và 352px trên desktop.
- Nội dung xếp theo cột dọc và không có phần nào co lại hay cuộn được:
  1. Hàng meta.
  2. Câu ví dụ `mt-6 text-lg sm:text-xl`, không giới hạn số dòng.
  3. Tiêu đề check và dòng "Nghĩa: …" (chỉ với cloze và type).
  4. `RecallPanel` nằm trong `mt-auto pt-4`.
- `components/RecallPanel.tsx`:
  - Câu hỏi nghĩa có 3–4 lựa chọn, mỗi lựa chọn cao 44–56px, nên riêng phần này đã chiếm 182–230px.
  - Khi trả lời sai có thêm verdict 50–70px (đáp án, mẹo nhớ, "Tính là chưa nhớ…").
  - Số lựa chọn lấy ở `lib/engagement/recall.ts:55-57`.
- Trường hợp xấu nhất là câu hỏi nghĩa trên desktop: khoảng 410–460px, tức đã tràn trước cả khi hiện verdict.
- `components/SwipeDeck.tsx` cũng gõ cứng kích thước thẻ:
  - `:323` container `h-100`
  - `:446` nút `top-[calc(50%+237px)]`
  - `:369` toast `top-[calc(50%-272px)]`

### Plan
1. Đặt một chiều cao chung cho thẻ, mobile và desktop như nhau: `h-[460px]`, định nghĩa một lần (hằng số hoặc class tiện ích). Cập nhật SwipeDeck theo cùng giá trị: container, vị trí nút "Chưa nhớ/Đã nhớ", toast, banner.
2. Cho phần dưới thẻ cuộn được: bọc khu vực check và `RecallPanel` trong `min-h-0 flex-1 overflow-y-auto`. Đây là lưới an toàn; thiết kế đúng thì không cần cuộn.
3. Khi đang check, thu gọn phần trên:
   - Câu ví dụ đổi sang `text-base sm:text-lg` và `mt-4`.
   - Dòng "Nghĩa: …" chỉ 1 dòng (`line-clamp-1`).
4. Mỗi lựa chọn nghĩa chỉ 1 dòng (`line-clamp-1`, có `title` để xem đầy đủ). Hoặc rút gọn `translationHint` ngay khi sinh lựa chọn, ví dụ cắt ở dấu phẩy đầu tiên: "Dư thừa, nhiều hơn cần thiết" thành "Dư thừa".
5. Verdict sai hiện **đè lên** khu vực lựa chọn, thay vì nối thêm bên dưới.

### Tiêu chí xong
- Playwright ở 375×667 và 1280×800, dùng câu dài nhất trong bộ thẻ và 4 lựa chọn dài nhất, cho cả 3 loại check, trước và sau khi trả lời sai. Đáy panel phải nằm trong thẻ: so `getBoundingClientRect().bottom` của panel với thẻ.
- Không lệch nút và toast của SwipeDeck.

---

## T2. Story pack: thừa, không rõ giá trị

### Hiện trạng
- Nội dung:
  - Chỉ có **3 truyện** gõ cứng ở `app/data/stories.ts`, dùng 21/540 từ (v001–v027).
  - Nội dung là tiếng Anh "dark comedy", trong khi giọng nội dung đã chuyển sang trung tính.
  - Nhãn độ khó không khớp với từ trong truyện.
- Không nối với việc học:
  - Truyện **không** đẩy dữ liệu vào SRS hay ELO; quiz chỉ ghi vào `storyQuizAttempts`.
  - Truyện không cho thưởng Album.
  - Spec có hứa "đủ bộ → mở chương truyện" nhưng chưa làm.
- Lỗi:
  - **Quiz mở Phần 1 không thể qua**: quiz mở ở mốc 3 từ, nên chỉ có 3 câu, nhưng cần đúng ≥ 4 câu mới qua (`components/StoryQuizModal.tsx:57-60,105`).
  - Mở khoá tự nhiên không có màn chúc mừng: `openStoryUnlockModal` là hàm no-op (`store/lexicaStore.ts:730,747,754`).
  - `/stories` và `/story/[id]` tính quyền đọc khác nhau, nên có lúc nút Đọc hiện ra nhưng bấm vào lại bị đẩy về trang khác.
  - Card "Câu chuyện mới" ở trang chủ vẫn hiện dù người học đã đọc hết (`components/SmartEntry.tsx:65`).

### Triết lý đề xuất (nếu giữ)
**"Truyện là nơi gặp lại từ đã học trong một đoạn văn dài."** Đọc truyện = một lượt ôn nhẹ cho các từ trong truyện. Truyện chỉ mở khi người học đã có đủ từ để hiểu.

### Hai hướng (chủ dự án chọn)
- **A. Cắt (khuyên làm ngay):**
  - Ẩn mọi lối vào: SmartEntry, màn hết thẻ trong SwipeDeck (`:302`), `/learned` (`:211`).
  - Giữ code và route để không vỡ link cũ; bỏ catch-up ép từ truyện vào deck (`getStoryCatchUpWordIds`, store `:463`).
  - Cỡ: S.
- **B. Làm lại thành "Đọc theo bộ" (làm sau nếu muốn):**
  - Mỗi bộ trong Album (`lib/engagement/collection.ts`) có một đoạn đọc ngắn (150–250 từ) do Studio soạn trước. Đoạn văn tiếng Việt chèn từ, đúng giọng thẻ; có thể thêm bản tiếng Anh.
  - Mở khi người học đã nhớ ≥ 60% từ của bộ.
  - Đọc xong, bấm vào từ hoặc làm 3 câu hỏi, sẽ tính một lượt ôn `good` cho các từ đó (ghi qua `updateCardProgress`).
  - Thay hẳn 3 truyện cũ.
  - Cỡ: L (Studio pipeline + Lexica).

### Tiêu chí xong (A)
- Không còn lối vào nào tới Story trên trang chủ, màn hết thẻ hay `/learned`.
- Test SmartEntry không còn card "Câu chuyện mới".
- Deck không còn bị ép từ của truyện.

---

## T3. Album / hộp quà: không biết nên quan tâm gì

### Hiện trạng (chi tiết trong `app/album/page.tsx`, `lib/engagement/{collection,economy,claims,lucky}.ts`, `supabase/migration_engagement*.sql`)
- Bốn loại tài nguyên: Hộp, Bụi, Vé, Băng; bốn ấn bản: Thường, Bạc, Holo, Huyền thoại; kèm pity, giới hạn mỗi ngày, hộp chờ và quay lại.
- **Quà đến trước khi có chỗ tiêu:**
  - Thẻ may mắn cho Bụi ngay từ ngày 1.
  - Lần đúc đầu tiên thì cần thành thạo, ôn ≥ 3 lần và ≥ 7 ngày.
  - Bụi chỉ dùng được cho thẻ đã đúc: 300 để lên Bạc, hoặc 120 để mua Vé.
- Giá trị ấn bản gần như không được giải thích: Holo mở "Gốc từ" và khiên trong "Liều hay Dừng"; Bạc chỉ khác về hình.
- "Sở hữu" thẻ chỉ có nghĩa là có `cardProgress`, không phải "đã nhớ thật".
- Bộ chủ đề được chia bằng regex trên câu ví dụ, nên nhiều thẻ rơi vào "Đời sống", trông ngẫu nhiên.
- Lỗi hứa suông:
  - Thẻ may mắn vẫn ghi "có quà" khi đã hết lượt trong ngày, rồi không trả gì (`components/SwipeDeck.tsx:157-170`).
  - Thưởng đủ bộ chỉ được claim khi đang mở trang Album.
- Người chưa đăng nhập không có thẻ may mắn, đúc hay hộp, nhưng hướng dẫn vẫn mô tả các thứ đó.

### Triết lý đề xuất
**"Album là bằng chứng bạn đang giỏi lên: mỗi thẻ là một từ bạn đã nhớ thật. Quà chỉ để đánh dấu cột mốc, không phải trò chơi riêng."**

### Plan
1. **Một mục tiêu rõ ràng ở đầu trang Album**: hộp "Tiếp theo", luôn chỉ 1–2 dòng, mỗi dòng ghi rõ thưởng gì. Ví dụ:
   - "Còn 3 từ là đủ bộ Ăn uống I → 2 Hộp"
   - "COGNITIVE đúc được sau 2 ngày"
2. **Hé lộ dần**:
   - Ngày đầu chỉ có "Bộ thẻ" và tiến độ.
   - Phần "Đúc" chỉ xuất hiện (với một thẻ giải thích dùng 1 lần) khi có thẻ đầu tiên đủ điều kiện.
   - Phần "Hộp" chỉ xuất hiện khi nhận hộp đầu tiên.
   - Bỏ hướng dẫn 3 bước nói hết mọi thứ cùng lúc.
3. **Rút gọn kinh tế** (cần chủ dự án duyệt, đề xuất mức vừa):
   - Bỏ **Vé**; việc "đúc lại" trả bằng Bụi.
   - **Băng** chuyển sang hiển thị cạnh streak ("Còn 1 lần giữ chuỗi"), không nằm trong ví.
   - Ví còn 2 thứ: **Hộp** và **Bụi**.
4. **Bụi phải có chỗ tiêu từ ngày đầu**, chọn một trong hai:
   - (a) Thẻ may mắn chỉ bật khi người học đã có thẻ đúc được.
   - (b) Thẻ may mắn thưởng thứ dùng được ngay. Ví dụ "mở sớm câu theo hình mẫu" cho một thẻ, hoặc "thêm 1 lần hỏi lại từ khó".
   - Khuyên chọn (a), vì đơn giản.
5. **Ấn bản phải có ý nghĩa học**, không chỉ là hình:
   - Bạc: hiện câu ví dụ thứ 2 (câu theo hình mẫu đã có sẵn).
   - Holo: Gốc từ (đã có).
   - Huyền thoại: câu "Ngoài đời".
   - Ghi đúng các điều này trên thẻ.
6. **"Sở hữu" = đã nhớ thật**: `reviewCount ≥ 1` và state ≥ sprout (`lib/engagement/collection.ts:104`).
7. **Sửa hứa suông**:
   - Server trả số lượt may mắn còn lại trong ngày; hết lượt thì không hiện badge.
   - Claim thưởng đủ bộ chạy trong `EngagementSync` (`components/EngagementSync.tsx`), không phụ thuộc trang đang mở.
8. Người chưa đăng nhập: Album chỉ hiện bộ thẻ, kèm một dòng "Đăng nhập để nhận quà khi đủ bộ".
9. Cập nhật `docs/LEXICA_ENGAGEMENT_SPEC.md` (đang ghi "chưa triển khai", thiếu phần thẻ may mắn) cho khớp với thực tế sau khi rút gọn.

### Tiêu chí xong
- Người mới mở Album lần đầu chỉ thấy bộ thẻ và một mục tiêu "Tiếp theo".
- Không còn badge "may mắn" sau khi hết lượt.
- Ví còn tối đa 2 loại (nếu được duyệt).
- Test cho: `nextGoal()`, việc ẩn badge khi hết lượt, claim đủ bộ ngoài trang Album.

---

## T4. Trang học chính (trước khi quẹt) trên desktop: trống, mật độ không đều

### Hiện trạng (`app/page.tsx`)
- `main` rộng `max-w-6xl` (1152px), nhưng:
  - Cột trái chỉ `lg:max-w-lg`, nội dung `max-w-md` (448px).
  - Sidebar phải `w-56` là các dòng chữ mỏng, không có nền thẻ (`:696-773`).
  - Tổng nội dung khoảng 700px nằm giữa, hai bên trống.
- Không có thanh header; chỉ có logo cố định ở góc trên trái và nút `?` ở góc dưới phải.
- Trước khi bắt đầu phiên không có khối tiến độ nào (`DailyProgress` chỉ hiện khi `sessionStarted`, `:628`).
- `components/SmartEntry.tsx` dùng card `border-2` chữ to, khác style mono-label của `LiveDropBanner` và `DailyProgress`.

### Triết lý
**"Mở app là biết ngay hôm nay làm gì, chỉ một nút chính."** Desktop có nhiều chỗ thì hiện thêm *bối cảnh* (đến hạn, tiến độ, mục tiêu) chứ không thêm *lựa chọn*.

### Plan
1. **Header**:
   - Trái: logo.
   - Giữa: chip level (bấm vào là tới `/level-select`) và chuỗi ngày.
   - Phải: Ôn tập (badge số thẻ đến hạn), Album, Buddy, Tôi.
   - Thay logo và nút `?` đang cố định ở góc.
2. **Lưới desktop**: `lg:grid lg:grid-cols-[minmax(0,1fr)_340px] max-w-5xl gap-8`.
   - **Cột chính**: thẻ "Hôm nay" gồm lời chào, mục tiêu ngày (thanh tiến độ), một nút chính (Bắt đầu / Ôn N thẻ đến hạn / Tiếp tục), sau đó là deck khi đã bắt đầu.
   - **Cột phụ** gồm các thẻ `bg-surface border-line`, mỗi thẻ có tiêu đề mono nhỏ:
     - "Đến hạn ôn": số thẻ và 3 từ.
     - "Từ khó": số từ, link `/review?hard=1`.
     - "Album tiếp theo": mục tiêu gần nhất (dùng lại `nextGoal` ở T3).
     - "Drop tuần này": `LiveDropBanner` chuyển sang đây.
3. Đưa SmartEntry về cùng hệ style: mono label, `bg-surface`, viền 1px, một CTA màu accent duy nhất.
4. Mobile giữ như hiện tại: một cột và bottom nav 4 mục.

### Tiêu chí xong
- Ảnh chụp ở 1280, 1440 và 1920: không còn khoảng trống lớn hai bên; hai cột cao tương đương (cột phụ không lơ lửng).
- Chỉ có 1 nút màu accent trên màn.

---

## T5. `/level-select` rework

### Hiện trạng (`app/level-select/page.tsx`, `components/LevelSelector.tsx`)
- Năm lựa chọn gõ cứng: icon, nhãn, mô tả, ELO và số từ là **chuỗi cố định** (`:22-63`).
  - Không khớp dữ liệu thật.
  - Không khớp ngưỡng của bài test (`components/LevelTest.tsx:~195` dùng <950, <1150, <1350).
- Style lệch hệ thống:
  - Dùng `bg-ink/[0.02] border-ink/20` thay cho `bg-surface border-line`.
  - Nhãn không dùng mono.
  - Có logo riêng.
- Lỗi nhỏ:
  - Dấu tick `absolute top-3 right-3` nhưng nút không có `relative` (`:119`), nên tick bám vào trang thay vì thẻ.
  - Ternary vô nghĩa ở `:136`.
- Không hiện level được đề xuất từ bài test (`recommendedLevel`, `testScore` đã có trong store), không hiện ELO hiện tại, tiến độ từng level hay từ mẫu.

### Plan
1. Tạo **một nguồn sự thật** `lib/levels.ts`: id, nhãn, khoảng ELO, mô tả ngắn, mức tương đương (A2/B1/B2/C1, IELTS ước lượng).
   - `LevelTest` và `LevelSelector` cùng dùng file này.
   - Số từ tính từ `VOCAB_DATABASE` và content packs.
2. Mỗi level là một thẻ `bg-surface border-line`, gồm:
   - tên và mức tương đương
   - khoảng ELO (mono)
   - số từ
   - tiến độ "đã nhớ x/y" (thanh mỏng, lấy từ `cardProgress`)
   - 3 từ mẫu kèm nghĩa
   - badge "Đề xuất" nếu trùng `recommendedLevel`
3. Trên cùng là thang ELO ngang, có chấm "Bạn đang ở {currentElo}", và link "Làm lại bài test".
4. "Tất cả" tách thành một hàng riêng bên dưới.
5. Sửa `relative` cho dấu tick, xoá ternary thừa.

### Tiêu chí xong
- Không còn số gõ cứng: có test kiểm tra số từ mỗi level bằng số đếm từ dữ liệu.
- Ngưỡng của test và selector lấy từ cùng một hằng số.
- Ảnh chụp mobile và desktop khớp style trang chủ.

---

## T6. Studio "Ngoài đời": gần như không chạy, và khó dùng (P0)

### Vì sao không chạy (lỗi do PR #28)
1. **Nghiêm trọng:**
   - `?search=` của Gutendex **chỉ tìm trong tên sách và tác giả**, không tìm trong nội dung (`apps/cortex-core-api/src/modules/studio/quotes.service.ts:235`). Với từ học thuật (abundant, cognitive, dilemma…) gần như luôn ra 0 kết quả.
   - Plan gốc (`docs/LEXICA_CONTENT_PLAN.md`) yêu cầu tải sẵn một danh sách sách cố định rồi tìm trong nội dung, nhưng phần đó chưa làm.
2. **Nghiêm trọng:** thẻ không tìm thấy không được ghi lại, nên mỗi lần bấm lại tìm đúng 10 thẻ đầu (`:195-206`). Kết quả: kẹt mãi ở `cards:10 saved:0 missed:10`.
3. **Nghiêm trọng:** mọi lỗi mạng bị nuốt thành "không tìm thấy" (`:203` `.catch(() => null)`), không có log.
4. Nếu có tìm thấy, câu đầu tiên thường là header hoặc license của Project Gutenberg, vì không cắt theo mốc `*** START/END ***` (`quotes.ts:169-187`).
5. Một lần bấm có thể chạy rất lâu (tối đa 5 sách × 10 thẻ, tuần tự) mà không có tiến độ; `apps/studio/app/lib/api.ts` không có timeout.
6. Khớp từ chỉ chấp nhận đúng nguyên dạng, nên "dilemmas", "mitigated" bị bỏ. Lỗi `no_word` hiện nguyên mã, chưa dịch.
7. Thêm câu tay bắt gõ mã thẻ (v001), không có ô tìm thẻ.
8. Không có tự động hoá: chỉ chạy khi bấm nút, và còn phải bấm "Xuất bản" riêng.
9. Studio chỉ xem được câu đang chờ. `list()` không select cột `media`, nên link YouTube không hiện khi duyệt. Tham số `limit` bị bỏ qua.

### Triết lý
**"Máy tìm, người chỉ duyệt."** Người soạn không phải gõ hay dò. Mỗi ngày mở Studio là có sẵn một hàng câu trích để quẹt duyệt, giống inbox thẻ.

### Plan
1. **Kho câu (corpus) dựng một lần, không gọi mạng lúc bấm nút:**
   - File `apps/cortex-core-api/src/modules/studio/corpus/books.ts`: danh sách cố định khoảng 40 sách phổ biến, đã hết bản quyền (id Gutenberg, tên, tác giả). Ví dụ: Austen, Doyle, Dickens, Twain, Wilde, Shelley, Stevenson, Carroll, Wells, London.
   - Job `build_corpus` (chạy tay trong Studio → Hệ thống, chạy lại được):
     - tải từng sách
     - chỉ giữ phần giữa `*** START OF` và `*** END OF`
     - nối dòng, tách câu, giữ câu 40–220 ký tự
     - lưu vào bảng mới `studio_corpus_sentences (id, book_id, text, lemmas text[])`, có index GIN trên `lemmas`
   - `lemmas`: dạng gốc đơn giản của từng token (bỏ -s/-es/-ed/-ing/-ly), viết hàm `lemma()` dùng chung với `matchesInflection` ở `validator.ts`.
2. **Tìm câu trong kho:**
   - `findBooks` chuyển thành truy vấn DB: `where lemmas @> array[lemma(word)]`.
   - Ưu tiên câu ngắn, sách phổ biến; mỗi thẻ lấy tối đa 3 câu, mỗi câu từ một sách khác nhau.
   - Chạy chưa tới 1 giây, xử lý được 50–100 thẻ mỗi lần.
3. **Ghi lại lần tìm:**
   - Bảng `studio_quote_attempts (card_id, source, attempted_at, found)`.
   - Thẻ đã tìm mà không có thì bỏ qua, chỉ thử lại khi kho đổi (`corpus_version`).
4. **Tiêu đề báo tự động:** dùng tín hiệu RSS đã thu (`studio_signals`, có title và url), khớp `lemmas` của tiêu đề với từ của thẻ, rồi tạo câu trích loại `news` ở trạng thái chờ. Chạy cùng job.
5. **Tự động hoá:** thêm job vào `scheduler.ts`, chạy hằng đêm khi `STUDIO_CRON=on`: tìm câu cho thẻ chưa có, tạo hàng chờ duyệt. Vẫn giữ bước người duyệt.
6. **UI duyệt nhanh** (`apps/studio/app/quotes/page.tsx`):
   - Tab: Chờ / Đã duyệt / Đã loại.
   - Đầu trang hiện độ phủ: "x/540 thẻ có câu".
   - Hiện số câu đã duyệt mà chưa xuất bản, kèm nút xuất bản.
   - Duyệt bằng phím tắt hoặc quẹt như inbox.
   - Form thêm tay có **ô tìm thẻ theo từ**: thêm endpoint `GET /studio/cards/search?q=`.
   - Dịch các mã lỗi sang câu tiếng Việt.
7. **Sửa nhỏ:**
   - `list()` select thêm `media`, và nhận `limit`.
   - `bookHit` tách lỗi mạng khỏi "không có": trả `errors` riêng và ghi log.
   - Sắp thứ tự quote trong thẻ cố định (theo `created_at`).
8. **Lexica:** cân nhắc hiện dòng đầu của câu trích ngay ở mặt sau, không cần mở `<details>` (đang phải bấm 2 lần mới thấy).

### Tiêu chí xong
- Sau khi dựng kho, bấm "Tìm" cho 100 thẻ lõi đầu tiên, ≥ 60% thẻ có ít nhất 1 câu chờ duyệt, không câu nào lấy từ header/license.
- Bấm lần hai thì sang thẻ mới, không lặp lại thẻ cũ.
- Lỗi mạng hiện đúng là lỗi mạng.
- Có test cho: `lemma()`, cắt START/END, tách câu, truy vấn kho (dùng fake DB), ghi lần tìm.

---

## T7. Trang ôn tập: 5 thanh ngang rối mắt; "đua với bản thân" thật hay mock?

### Hiện trạng
- `app/review/page.tsx` khi đang làm bài có 5 hàng thanh, từ trên xuống:
  1. Thang hũ "Liều hay Dừng" (`RiskBar`, `:425-444`, `:859`)
  2. Thanh "bạn" (`GhostBar`, `:485-511`)
  3. Thanh "👻" (`GhostBar`)
  4. Tiến độ câu (`:277-298`)
  5. Đồng hồ đếm ngược (`:300-309`)
- **"Đua với bản thân" là dữ liệu THẬT, không phải mock.**
  - Đối thủ là lượt ôn tốt nhất của chính bạn **hôm qua**, phát lại theo đúng thời điểm từng câu (`lib/engagement/ghost.ts`: `getGhost`, `ghostCorrectAt`; dữ liệu ghi ở `review/page.tsx:739-747,773`).
  - Giới hạn:
    - chỉ lưu localStorage (`lexica-ghost-v1`), không đồng bộ giữa các máy
    - chỉ so với *hôm qua*; hôm qua không ôn thì không có đối thủ
    - máy mới hoặc trình duyệt mới thì không có

### Triết lý
**"Ôn tập phải yên tĩnh: một câu hỏi, một thanh tiến độ."** Tính cạnh tranh là gia vị, chỉ hiện gọn một chỗ.

### Plan
1. Gộp 5 thanh còn **1 thanh và 1 dòng chip**:
   - **Thanh duy nhất**: tiến độ câu (n/total). Đồng hồ đếm ngược chuyển thành vòng tròn nhỏ quanh số thứ tự câu, hoặc lớp mờ chạy trên chính thanh tiến độ.
   - **Dòng chip** dưới header, chữ mono nhỏ:
     - `Hũ 120 · x2`, kèm icon khiên nếu có
     - `Bạn 7 · Hôm qua 6` (có ▲ khi đang dẫn)
     - Không vẽ thanh cho các thông tin này.
2. Đối thủ: nếu hôm qua không có lượt thì lấy lượt gần nhất trong 7 ngày, và ghi rõ "Bạn hôm thứ Ba".
3. (Tuỳ chọn) đồng bộ lượt ôn qua cloud backup: thêm `ghost` vào `progressFingerprint` hoặc lưu trong store đã persist.
4. **Cần chủ dự án quyết**: có giữ "Liều hay Dừng" không? Nó thêm rủi ro và độ rối vào chính chỗ cần tập trung nhất.
   - Đề xuất: giữ ở dạng chip; hoặc bỏ hẳn và thưởng streak đúng liên tiếp bằng hiệu ứng nhẹ.

### Tiêu chí xong
- Ảnh chụp mobile khi đang làm câu hỏi: nhiều nhất 1 thanh ngang và 1 dòng chip.
- Test: chọn ghost dự phòng (lượt gần nhất trong 7 ngày).

---

## T8. Voice mode: chưa giúp phát âm tốt hơn, và nhàm

### Hiện trạng (`hooks/useVocalSwipe.ts`, `components/VocabCard.tsx:80-86,194-219`)
- Nhận dạng bằng Web Speech API (`en-US`, `maxAlternatives=1`, bỏ qua `confidence`).
  - Đúng khi transcript **trùng nguyên chữ** với từ, và phải đúng **3 lần liên tiếp**; sai một lần là về 0.
  - Voice mode còn chặn quẹt phải bằng tay.
- Phản hồi chỉ có đạt/không đạt. Người học **không được thấy máy nghe ra gì**: `lastSpokenWord` có sẵn nhưng không hiển thị.
- Nhận dạng chỉ kiểm tra máy có "nghe ra" chữ hay không, không phải phát âm đúng. Máy thường tự sửa phát âm sai thành từ đúng.
- Không có vòng nghe mẫu → nói → nghe lại mình. Không lưu từ khó phát âm.
- Firefox không hỗ trợ; Chrome gửi âm thanh lên server của Google.

### Triết lý
**"Nghe mẫu → nói → thấy mình sai ở đâu → nói lại."** Luyện nói là một bài ngắn riêng, không phải cái cổng chặn việc quẹt thẻ.

### Đề xuất (theo thứ tự nên làm)
1. **Tách khỏi luồng quẹt:**
   - Thêm chế độ riêng "Luyện nói 2 phút": 5 từ đến hạn hoặc vừa học. Vào từ trang chủ hoặc từ màn tổng kết phiên.
   - Bỏ việc voice mode chặn quẹt. Đây là lý do chính khiến người học thấy nhàm.
2. **Hiện máy nghe được gì**: "Máy nghe: *cognative*".
   - So từng ký tự với từ đúng và tô phần lệch.
   - Kết quả chia 3 mức thay vì 2: Rõ / Gần đúng / Chưa rõ. Dùng `maxAlternatives=5`, `confidence`, và khoảng cách chữ (đã có `editDistance` trong `lib/engagement/recall.ts`).
3. **Nghe mẫu trước, nghe lại mình sau:**
   - Phát mẫu chậm rồi bình thường (`AudioService`).
   - Ghi âm lần nói của người học bằng `MediaRecorder`, phát lại cạnh mẫu.
   - Tự so sánh như vậy (shadowing) là cách luyện hiệu quả mà không cần chấm điểm.
4. **Trọng âm và âm tiết:** từ IPA (dấu `ˈ`), tách âm tiết và in hoa âm nhấn, ví dụ "a·BUN·dant". Hiển thị khi luyện.
5. **Mẹo cho lỗi hay gặp của người Việt**, dựa trên quy tắc, không cần AI:
   - phụ âm cuối: -s, -ed (/t/ /d/ /ɪd/), -k, -t
   - th, v/w
   - trọng âm từ 3 âm tiết
   - Mỗi từ hiện 1 mẹo khớp mẫu.
6. **Nói trong cụm:** sau khi từ đơn đạt, thử nói cụm "Hay đi với" (collocations đã có), ví dụ "abundant supply". Có ích hơn lặp một từ 3 lần.
7. **Lưu từ khó phát âm**: đếm số lần "Chưa rõ" theo từ, gom thành danh sách "Từ khó nói" để luyện lại.
8. **Cần chủ dự án quyết (sau này):** API chấm phát âm thật theo âm vị, như Azure Pronunciation Assessment hoặc Speechace.
   - Chấm chuẩn hơn hẳn nhưng tốn tiền theo lượt.
   - Gửi âm thanh người học ra dịch vụ ngoài, tức là có xử lý phía người dùng lúc học, ngược với nguyên tắc hiện tại.
   - Chỉ nên làm khi có gói trả phí.

### Tiêu chí xong (cho bước 1–4)
- Quẹt thẻ không còn bị voice chặn.
- Màn luyện nói hiện chữ máy nghe được, kết quả 3 mức, có nút nghe mẫu và nghe lại mình, có tách âm tiết.
- Test: phân loại 3 mức từ transcript và confidence, tách âm tiết từ IPA.
