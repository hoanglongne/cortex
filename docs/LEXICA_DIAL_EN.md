# Blend: chế độ tiếng Anh → tiếng Anh (N7, issue #165), kết quả đo (20/11/2026)

Thuộc `docs/LEXICA_DIAL_MERID_PLAN.md` mục N7. Câu hỏi: **bộ luật Anh → Anh có đổi đúng nghĩa trên văn bản tiếng Anh thật không, và đổi được bao nhiêu?**

## Đã làm
- **Bộ luật mới** `apps/lexica/app/lib/dial/rulesEn.ts`: 285 luật, 333 cụm, trên 152 thẻ. Trước đó có 18 cụm, chưa đo.
  - Mỗi luật chỉ giữ cụm thông thường có nghĩa tương đương trong câu. Cụm nhiều nghĩa có điều kiện theo từ đứng cạnh (`onlyBefore`, `onlyAfter`, `notAfter`): 145 trong 285 luật có điều kiện.
  - Động từ và danh từ số nhiều khớp theo từng dạng và đổi sang cùng dạng ("got rid of" → *eliminated*, "points out" → *highlights*).
  - Ví dụ: `huge → massive`, `crucial → critical`, `a chance to → an opportunity to`, `think about → contemplate`, `put up with → tolerate`, `get around the rules → circumvent the rules`.
- **Bộ máy khớp** (`match.ts`), ba thay đổi:
  - `article`: bỏ chỗ thay khi "a" / "an" đứng trước sẽ sai ("a surprising result" không thành "a unexpected result").
  - Dấu gạch nối đơn nối hai chữ ("hard-working" khớp "hard working").
  - Chữ đầu câu giữ chữ hoa ("Huge demand" → "Massive demand"); áp dụng cho cả tiếng Việt (`hitText`).
- **Script đo** `apps/lexica/scripts/dial-en/`: `prepare.py` (tạo bộ bài từ ba nguồn công khai trên Hugging Face), `run.mjs` (chạy luật, xuất từng chỗ thay kèm câu để chấm). **Văn bản không đưa vào repo** (giấy phép).

## Cách chấm
- **Ba nguồn:** AG News (tin ngắn), CNN/DailyMail (báo dài), Wikitext-103 (bách khoa). Khoảng 1,1 triệu chữ ở bốn bộ.
- **Bốn bộ không trùng nhau**, mỗi nguồn cắt cùng tỉ lệ:
  - **dev:** để sửa luật;
  - **test:** để tìm thêm lỗi;
  - **test2:** đo lần đầu;
  - **test3:** chưa ai nhìn, để lấy số cuối.
- **Một chỗ thay là "sai"** khi từ mới sai nghĩa, không tự nhiên hoặc sai ngữ pháp trong câu đó. Tên riêng và tiêu đề không xét.
- **Người chấm:** Claude, đồng thời là người viết luật (thiên lệch giống D0).

## Kết quả
| Bộ | Chỗ thay chấm | Sai | Đúng |
|---|---|---|---|
| test (sau vòng sửa 1) | 160 | 5 | 96,9% |
| test2 (đo lần đầu) | 200 | 12 | **94,0%** |
| test3 (sau khi sửa lỗi của test2) | 200 | 7 | **96,5%** |

- **Mật độ:** khoảng **1 chỗ thay trên 1.000 chữ** (1.170 chỗ trên 1,12 triệu chữ), tức 1–2 từ mỗi bài báo. Với tiếng Việt là 6 trên 1.000 chữ.
- **Vòng đầu chưa sửa** (bộ dev, trước khi đọc kết quả): luật `related → relevant` sai 16/16, `enough → sufficient` rò sang "confident enough", `widespread → prevalent` sai ở "widespread protests".
- Một số câu lặp trong bộ CNN (lời mời cuối bài "For a chance to be mentioned…"), nên con số đúng hơi cao hơn thực tế. Loại câu lặp thì test3 vẫn 96,4%.

## Các nhóm lỗi đã tìm và cách xử lý
| Lỗi | Ví dụ | Xử lý |
|---|---|---|
| Cụm nhiều nghĩa | "related to" ≠ "relevant to"; "harsh conditions" ≠ *draconian* | Bỏ luật, hoặc `onlyBefore` danh từ hợp |
| Cùng dạng chữ, khác từ loại | "…, surprising investors" (động từ); "two faced off" | Chỉ khớp vị ngữ ("is surprising") hoặc trước danh từ đã liệt kê; `notAfter` |
| Dẫn lời | "…," explained the brains…" thành *elucidated* | `explain` chỉ khớp sau trợ động từ và trước "why/how/the…" |
| Nghĩa "nghĩ về" = ý kiến | "what he thinks about X" thành *contemplates* | Bỏ ngôi thứ ba; chặn sau "you/what/do" |
| Danh từ cùng chữ | "presidential hopeful Nader" | Chỉ khớp sau "is/was/remain…" |
| Câu cố định | "to be clear that" ≠ *evident*; "makes good business sense" ≠ *acumen* | Bỏ "be" khỏi điều kiện; bỏ luật |
| a / an | "a surprising" → "a unexpected" | Cờ `article` trong bộ máy khớp |

## Giới hạn
- **Một người chấm, cũng là người viết luật.** Số 96,5% cần một người thứ hai (chủ sản phẩm) chấm lại ít nhất 100 chỗ ngẫu nhiên.
- **Các sửa sau test3 chưa đo lại** (6 luật: `two faced off`, `effect`, `clear`, `improving`, `handle`, `never seen before`). Cần một bộ bài mới nữa.
- **Văn bản:** tin tức Mỹ và Anh, bách khoa. Chưa thử diễn đàn, mạng xã hội, sách, tài liệu kỹ thuật.
- **Mật độ thấp** (1 trên 1.000 chữ) vì bộ thẻ có ít từ học thuật thông dụng. Vài luật chiếm nhiều chỗ: *massive* (12%), *utilized* (8%), *critical* (5%), *significance* (4%). Cần xem tiện ích có làm từ hiếm bị lấn không.
- **Từ loại** (như tiếng Việt): luật chỉ đổi sang đúng dạng của từ nhưng không kiểm tra ngữ pháp rộng hơn.
- **Cụm đổi nghĩa nhẹ:** một số cặp gần nghĩa chứ không đồng nghĩa hoàn toàn (`hopeful → optimistic`, `regarded as → perceived as`). Người chấm tính là đúng.

## Việc tiếp theo
1. Chủ sản phẩm chấm lại 100 chỗ ngẫu nhiên (cần một bộ bài mới).
2. Mở rộng luật cho các nhóm từ mới của bộ thẻ, rồi đo lại như trên.
3. Quyết định có bật mặc định hay giữ ô "thử nghiệm" trong popup.
