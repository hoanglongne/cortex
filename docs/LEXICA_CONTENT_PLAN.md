# Lexica — Plan: "Câu của bạn" và "Ngoài đời"

> Plan cho hai tính năng nội dung tiếp theo của Lexica, viết để một AI/dev khác làm tiếp mà không cần đọc lịch sử trao đổi.

| | |
|---|---|
| Trạng thái | Plan, chưa làm |
| Phạm vi | `apps/lexica`, `apps/cortex-core-api` (module `studio`), `apps/studio`, Supabase |
| Đọc trước | `docs/LEXICA_STUDIO_SPEC.md` (Studio, manifest, pack), `docs/LEXICA_ENGAGEMENT_SPEC.md` (phiên học, recall) |

## 0. Bối cảnh

- Mỗi thẻ có một câu ví dụ tiếng Việt chèn đúng một từ tiếng Anh viết HOA (`scenario`), ví dụ: *"Quán đổi công thức cà phê rất SUBTLE, khách quen uống cả tuần mới thấy vị hơi khác."*
- Đã thử viết câu theo hướng hài hước. Kết quả: viết hàng loạt thì khó trúng và dễ cringe, nên **đã bỏ**. Giọng hiện tại là **trung tính, rõ nghĩa, tình huống cụ thể**, kèm dòng "Hay đi với" (collocation tiếng Anh thật).
- Hai tính năng dưới đây làm câu ví dụ có ý nghĩa hơn **mà không dựa vào hài**:
  - **A. Câu của bạn:** người học gắn từ với đời mình.
  - **B. Ngoài đời:** người học thấy từ xuất hiện trong sách, báo, bài hát thật.

### Kiến trúc nội dung (giữ nguyên, tái dùng)

- Thẻ gốc (540) nằm trong code: `apps/lexica/app/data/vocabCards.ts`, kiểu `VocabCardData` ở `apps/lexica/app/types/vocab.ts`.
- Nội dung động đi qua **manifest** trên Supabase Storage. Pattern tham khảo tốt nhất là **variants overlay** (câu theo hình mẫu tech/business/student):
  - API: `apps/cortex-core-api/src/modules/studio/variants.ts` (prompt, parse, check, build file) và `variants.service.ts` (generate / list / review / publish), endpoints trong `studio.controller.ts` dưới `/studio/variants`.
  - SQL: `apps/cortex-core-api/supabase/migration_studio_variants.sql` (bảng `studio_card_variants`, RLS `is_studio_editor()`).
  - Manifest: `writeManifest(...)` trong `studio.service.ts` giữ ref `variants`. File đặt tên theo hash: `packs/variants.<sha12>.json`.
  - Lexica: `lib/content/pack.ts` (`parseVariants`), `lib/content/loader.ts` (`loadVariants`, cache rồi mới verify), `lib/content/repository.ts` (`withVariants`, `applyRemoteContent`), `components/VocabCard.tsx` (đọc `getCard(card.id)` + `useContentVersion()` vì thẻ trong deck là snapshot).
  - Studio UI: `apps/studio/app/variants/page.tsx`.
- Tiến độ học: `UserCardProgress` (`apps/lexica/app/lib/eloAlgorithm.ts`) nằm trong zustand store persist `lexica-storage`, đồng bộ cloud qua `lib/cloudSync.ts`.
- Kiểm tra câu: `validateDraft` (`studio/validator.ts`). Rule cứng gồm: độ dài 40–160 ký tự, đúng một từ đích viết HOA, blocklist, trùng lặp. Lexica tô sáng và che từ bằng **substring không phân biệt hoa thường** của `card.word` (`blankWord` trong `lib/engagement/recall.ts`, `highlightWord` trong `VocabCard.tsx`), nên câu phải chứa nguyên từ gốc.

### Ràng buộc chung (bắt buộc)

- Không AI nào chạy phía người dùng khi học (xem nguyên tắc trong `LEXICA_STUDIO_SPEC.md`). AI chỉ dùng lúc soạn nội dung trong Studio.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ đặt trên server Cortex API (Railway), không bao giờ đặt ở Lexica, Studio hay Vercel.
- Không thêm thao tác bắt buộc nào vào luồng quẹt thẻ. Mọi thứ mới đều là tuỳ chọn và bỏ qua được bằng một chạm.
- Mỗi PR có test (`vitest` cho Lexica, `jest` cho API), `tsc` sạch, lint sạch.

---

## A. "Câu của bạn" (người học tự gắn từ với đời mình)

### Vấn đề cần tránh
Bắt người học tự đặt câu tiếng Anh là rào cản lớn với người còn yếu. Vì vậy thiết kế theo **thang dễ → khó**, và người học **luôn có lối thoát**.

### Thiết kế

1. **Khi nào hiện.** Chỉ sau khi người học đã nhớ từ: trả lời đúng recall check ở lần thứ 2 trở đi (`reviewCount >= 2`), và tối đa **1 lần mỗi phiên 10 thẻ**. Không hiện cho thẻ mới.
2. **Ba mức, người học chọn.** Mặc định mở mức dễ nhất.
   - **Mức 1, chọn tình huống (không cần gõ).** Hiện 3 câu ngắn: *"Bạn hay gặp SUBTLE ở đâu?"*, mỗi câu thuộc một bối cảnh (học, làm, đời sống), lấy từ `scenarios` của thẻ (variants); thẻ chưa có đủ variants thì bỏ qua mức 1 và mở thẳng mức 2. Người học chạm chọn câu "giống mình nhất", và câu đó thành câu ví dụ hiển thị lần sau. Đây là cá nhân hoá với chi phí 0.
   - **Mức 2, điền khung.** Một khung câu tiếng Việt có chỗ trống cho tình huống của người học, từ đích đã điền sẵn: *"Ở chỗ làm của mình, ______ thay đổi rất SUBTLE."* Người học gõ vài chữ tiếng Việt.
   - **Mức 3, viết tự do.** Gõ một câu **tiếng Việt chèn từ tiếng Anh**, đúng định dạng của app. Không bắt viết câu tiếng Anh hoàn chỉnh. Đây là chỗ chính giúp hạ rào cản.
3. **Kiểm tra (không dùng AI).**
   - Câu phải chứa từ đích (không phân biệt hoa thường, cho phép biến thể -s/-ed/-ing/-ly).
   - Dài 10–200 ký tự.
   - Lọc từ tục bằng danh sách cục bộ đơn giản.
   - Không chấm đúng/sai về nghĩa. Mục tiêu là gắn trí nhớ, không phải thi.
4. **Phần thưởng.** Cộng nhẹ vào economy hiện có (`lib/engagement/economy.ts`) và ghi nhận trong SessionRecap ("Bạn đã đặt 1 câu của riêng mình"). Không dùng streak riêng.
5. **Dùng lại câu.** Lần ôn sau, thẻ hiện **câu của người học** thay cho `scenario`, kèm nhãn nhỏ "Câu của bạn". Có nút "Dùng câu gốc" để đổi lại. Trong recall check kiểu cloze, che từ trong câu của người học (dùng `blankWord`).
6. **Album / Từ đã học.** Thẻ có câu riêng hiện biểu tượng nhỏ. Màn chi tiết cho sửa hoặc xoá câu.

### Dữ liệu

- Mở rộng `UserCardProgress`: `mySentence?: { text: string; level: 1 | 2 | 3; at: number }`.
- Lưu cùng `cardProgress` nên tự đi theo `cloudSync`. Kiểm tra `lib/cloudSync.ts` merge field mới đúng: lấy bản có `at` mới hơn.
- Không gửi câu người học lên Studio hay server nào khác ngoài cloud sync của chính họ (riêng tư). Muốn dùng câu người học làm nội dung chung thì phải có màn đồng ý riêng; ngoài phạm vi v1.

### Việc cần làm

1. `eloAlgorithm.ts`: thêm field. Store: action `setMySentence(cardId, text, level)` và `clearMySentence(cardId)`.
2. `lib/engagement/mysentence.ts` (mới):
   - `shouldOffer(progress, sessionState)`
   - `frameFor(card)`: khung câu mức 2, sinh từ `translationHint` và từ loại. Bắt đầu bằng 5–6 khung chung là đủ.
   - `checkMySentence(text, word)`
3. `components/MySentencePanel.tsx` (mới): hiện sau RecallPanel khi `shouldOffer`. Ba tab mức, nút "Để sau".
4. `VocabCard.tsx`: ưu tiên `progress.mySentence?.text` khi hiển thị, kèm nhãn và nút đổi về câu gốc.
5. `SessionRecap.tsx`: một dòng ghi nhận.
6. Test:
   - `shouldOffer` (đúng điều kiện, tối đa 1 lần/phiên)
   - `checkMySentence` (biến thể từ, độ dài, lọc tục)
   - cloze che từ trong câu người học
   - merge cloud sync
7. Đo lường: đếm ẩn danh `mysentence_offered`, `mysentence_saved{level}`, `mysentence_skipped` qua `lib/content/events.ts`. Sau 2 tuần, nếu tỉ lệ lưu < 10% thì bỏ mức 3, chỉ giữ mức 1–2.

### Tiêu chí xong
- Bỏ qua được bằng 1 chạm, không chặn luồng quẹt.
- Câu đã lưu hiện lại ở lần ôn sau và qua được recall cloze.
- Không có request mạng mới ngoài cloud sync sẵn có.

---

## B. "Ngoài đời" (từ trong sách, báo, bài hát thật)

### Ý tưởng
Dưới câu ví dụ có thêm một mục gập/mở **"Ngoài đời"**: 1–2 trích dẫn thật chứa từ, ghi nguồn. Thẻ thú vị nhờ nguồn thật, không cần câu đùa.

### Ưu tiên nguồn (theo mức an toàn)

| Thứ tự | Nguồn | Cách lấy | Lưu ý |
|---|---|---|---|
| 1 | **Sách hết bản quyền** (Sherlock Holmes, Jane Austen, Dickens, Orwell ở nơi đã hết hạn…) | [Gutendex API](https://gutendex.com) (Project Gutenberg) để tìm sách, tải `.txt`, tìm câu chứa từ | An toàn nhất. Câu ≤ 40 từ. Ghi tên sách + tác giả. Có thể kèm bản dịch tiếng Việt do biên tập viên viết |
| 2 | **Tiêu đề báo** | Tái dùng nguồn RSS sẵn có của Studio (`sources.ts`, `pipeline.service.ts`) để lọc tiêu đề chứa từ | Chỉ tiêu đề ngắn + tên báo + link bài gốc. Không chép thân bài. Chạy blocklist (chính trị, tai nạn, vụ án…) |
| 3 | **Bài hát nổi tiếng** | Biên tập viên nhập tay trong Studio: tên bài, ca sĩ, **một dòng** lời có chứa từ, link YouTube hoặc Spotify chính thức + giây bắt đầu | Chỉ những bài rất nổi (top chart, hàng trăm triệu view). Chỉ 1 dòng lời. Phát bằng **trình nhúng chính thức** (YouTube IFrame với `start`/`end`, hoặc Spotify embed), app không lưu hay phát file nhạc |
| — | Tweet / bài mạng xã hội | **Không làm ở v1** | Khó kiểm soát nội dung nhạy cảm, hay bị xoá |

### Dữ liệu

Bảng mới `studio_card_quotes`, theo khuôn `studio_card_variants`:

```sql
create table if not exists studio_card_quotes (
  id uuid primary key default gen_random_uuid(),
  card_id text not null,                 -- core 'v###' hoặc thẻ Studio
  kind text not null check (kind in ('book','news','song')),
  text text not null,                    -- câu trích, chứa từ đích
  translation text,                      -- bản dịch tiếng Việt (tuỳ chọn)
  source text not null,                  -- "Pride and Prejudice — Jane Austen" / "VnExpress" / "Ed Sheeran — Perfect"
  url text,                              -- link bài báo / trang sách / video
  media jsonb,                           -- song: {"provider":"youtube","id":"…","start":42,"end":50}
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
-- RLS: is_studio_editor() như migration_studio_variants.sql
```

File xuất bản: `packs/quotes.<sha12>.json` = `{ schema: 1, quotes: { [cardId]: Quote[] } }`, tối đa 2 quote mỗi thẻ. Manifest thêm ref `quotes` (giống `variants`). Nhớ cập nhật `writeManifest` để **giữ nguyên** cả `variants` lẫn `quotes` khi một trong hai được xuất bản.

### Việc cần làm

**API (`apps/cortex-core-api/src/modules/studio`)**
1. `quotes.ts`:
   - `checkQuote(q, card)`: chứa từ đích (cả biến thể), độ dài theo loại (book ≤ 300 ký tự, news ≤ 160, song ≤ 120), blocklist, `media` hợp lệ (provider thuộc whitelist, id đúng định dạng).
   - `buildQuotesFile(approved)`, `quotesPath(json)`.
2. `quotes.service.ts`:
   - `findBookQuotes(cardIds)`: Gutendex. Giữ một danh sách ~50 sách kinh điển cố định, cache text đã tải vào Storage (bucket studio, prefix `gutenberg/`). Tìm câu chứa từ, chọn câu ngắn nhất ≥ 8 từ. Lưu `pending`.
   - `findNewsQuotes(cardIds)`: quét tiêu đề nguồn RSS đã thu thập 30 ngày gần nhất.
   - `addSong(...)`: biên tập viên nhập tay.
   - `list`, `review`, `publish`: giống `variants.service.ts`.
3. Endpoints `/studio/quotes/...` trong `studio.controller.ts`, theo đúng mẫu `/studio/variants`.
4. Test: `checkQuote` (đủ ba loại), `buildQuotesFile`, parse Gutendex với fixture tĩnh (không gọi mạng trong test).

**Studio (`apps/studio`)**
5. Trang `app/quotes/page.tsx`, theo mẫu `app/variants/page.tsx`:
   - Nút "Tìm trong sách" / "Tìm trong báo" (10 thẻ mỗi lần).
   - Form "Thêm bài hát": chọn thẻ, dán link YouTube, nhập giây bắt đầu/kết thúc, dòng lời, xem trước bằng embed.
   - Duyệt, sửa bản dịch, loại; nút xuất bản.

**Lexica (`apps/lexica`)**
6. `lib/content/pack.ts`: `parseQuotes`. `loader.ts`: `loadQuotes`. `repository.ts`: `getQuotes(cardId)`, theo cùng đường cache và verify như variants.
7. `components/InTheWild.tsx`: mục gập/mở dưới câu ví dụ ở mặt sau thẻ.
   - book/news: câu trích (tô sáng từ), nguồn, link.
   - song: dòng lời + nút ▶ mở YouTube embed (`youtube-nocookie.com/embed/<id>?start=…&end=…`) **chỉ khi người dùng bấm**, không tự tải iframe.
8. Không hiện mục khi thẻ chưa có quote. Không ảnh hưởng recall check.
9. Test: parse file quotes (bỏ entry hỏng), render khi có/không có quote, iframe chỉ xuất hiện sau khi bấm.

### Pháp lý và an toàn (bắt buộc đọc)
- **Sách:** chỉ dùng sách hết bản quyền (Gutenberg). Không trích sách còn bản quyền.
- **Báo:** chỉ tiêu đề + nguồn + link. Không chép đoạn bài.
- **Nhạc:** chỉ một dòng lời ngắn, có ghi nguồn; nghe qua trình nhúng chính thức của YouTube/Spotify. Không tải, không lưu, không tự phát. Nếu chủ sở hữu yêu cầu gỡ: đặt `status = 'rejected'` rồi xuất bản lại.
- Mọi quote đi qua blocklist của Studio và **phải được người duyệt** trước khi lên app.

### Tiêu chí xong
- Studio tìm được quote sách/báo cho ≥ 50% trong 100 thẻ đầu, và thêm được bài hát bằng tay.
- Lexica hiện "Ngoài đời" khi có quote, không làm chậm lần mở app (file quotes nạp nền, có cache).
- Embed nhạc chỉ tải khi bấm.

---

## Thứ tự gợi ý
1. **B, phần sách + báo** (một PR API + Studio, một PR Lexica): giá trị cao, rủi ro thấp, tái dùng gần hết pattern variants.
2. **A, mức 1 + 2** (một PR): không cần gõ nhiều, đo tỉ lệ dùng.
3. **B, phần bài hát** (một PR): cần nhập tay, làm khi đã có quy trình duyệt.
4. **A, mức 3**: chỉ làm nếu số liệu ở bước 2 cho thấy người học có dùng.
