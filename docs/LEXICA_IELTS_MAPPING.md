# Quy đổi điểm từ vựng Lexica sang IELTS (nghiên cứu, 29/10/2026)

Liên quan: issue #69, `packages/classroom-lexica/ielts.ts`, `apps/lexica/app/lib/levels.ts`, `docs/LEXICA_LEVEL_TEST_DESIGN.md`.

**Giới hạn của bản này:** mình tìm tài liệu bằng tìm kiếm web, nhưng không mở được trang gốc (môi trường không cho truy cập `ielts.org` và `jfyn.co.uk`). Mọi con số dưới đây lấy từ **tóm tắt tìm kiếm**, chưa đối chiếu với bài báo gốc. Mục 3 ghi rõ mức tin cậy từng con số. Cần người đọc lại bài gốc trước khi dùng một con số làm lời hứa với người dùng.

## 1. Hiện tại làm gì

- Điểm Lexica (800–1500, thang Elo) quy ra band bằng **nội suy tuyến tính** giữa năm mốc: 800 → 4.5, 950 → 5.5, 1150 → 6.5, 1350 → 7.5, 1500 → 8.5 (`ieltsBand`).
- Số từ ước lượng: 800 → 1.500, 950 → 3.000, 1150 → 5.000, 1350 → 7.500, 1500 → 10.000 (`vocabSize`).
- Cả hai bảng **do thiết kế, không có nguồn và chưa hiệu chỉnh** với điểm thi thật. Đây là điểm yếu lớn nhất của câu "quy ra band IELTS".
- Khoảng band hiển thị chỉ dựa trên sai số của chính bài thi (±1 sd, thường ±40–80 điểm), tức là chỉ rộng nửa band, nghe chính xác hơn mức thật sự biết.

## 2. Tài liệu nói gì

Nguồn nhóm A: bài nghiên cứu hoặc trang của tổ chức IELTS (thấy qua tóm tắt tìm kiếm). Nguồn nhóm B: blog, trang luyện thi (không dùng làm bằng chứng).

| # | Phát hiện | Nguồn | Nhóm |
|---|---|---|---|
| 1 | Điểm Vocabulary Size Test (VST) của Nation và Beglar tương quan với band **Overall** khoảng **r = 0,68** (205 sinh viên dự bị đại học). | ["Investigating the Relationship between IELTS Scores and Receptive Vocabulary Size"](https://jfyn.co.uk/index.php/ukfyn/article/download/13/23/) | A |
| 2 | Trong cùng nghiên cứu: kích thước từ vựng khác nhau rõ giữa các **band nguyên**, ít khác giữa các nấc nửa band; **trong cùng một band, điểm phân tán rất rộng** (nhóm band 6.5 có thể từ khoảng 4.000 đến hơn 8.000 họ từ). Vì vậy band IELTS dự đoán kích thước từ vựng kém. | cùng nguồn trên (qua tóm tắt) | A |
| 3 | Kích thước từ vựng "chính tả" (orthographic) giải thích khoảng **58% phương sai** của band Overall (Milton, Wade và Hopkins, 2010). | [IELTS: How to address vocabulary in an IELTS preparation course](https://ielts.org/news-and-insights/how-to-address-vocabulary-in-an-ielts-preparation-course) | A (trang chính thức, qua tóm tắt) |
| 4 | Theo một nghiên cứu 30 người học (nguồn thứ cấp, **chưa xác nhận đó là của Milton 2010**): từ vựng đọc-viết tương quan mạnh nhất với **Reading (r = 0,70) và Writing (r = 0,76)**, yếu hơn với **Listening (0,48) và Speaking (0,35)**. | tóm tắt tìm kiếm | A, độ tin thấp |
| 5 | Một nghiên cứu dùng các mức từ vựng kiểu Vocabulary Levels Test ước lượng band 5.5 ứng với khoảng 4.000 họ từ phổ biến nhất, band 6.5 khoảng 5.000. Thành thạo mức từ học thuật (26/30, Schmitt và cộng sự 2001) ứng với band 6.0. | tóm tắt tìm kiếm | A, độ tin thấp |
| 6 | Cách đọc VST: 140 câu, mỗi 1.000 họ từ 10 câu, **mỗi câu đúng đại diện 100 họ từ** (nhân điểm với 100). Chỉ đo kiến thức **nhận biết khi đọc**, trần khoảng 14.000 họ từ. | [Nation: Vocabulary Size Test, thông tin và quy cách](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-tests/the-vocabulary-size-test/Vocabulary-Size-Test-information-and-specifications.pdf) | A |
| 7 | Đã có **bản VST song ngữ Anh–Việt** của Nation. | trang tài nguyên của Nation (đường dẫn `le-vst-vietnamese.pdf`) | A |
| 8 | Bảng "số từ cho mỗi band" ở các trang luyện thi (ví dụ band 6.0–6.5 ứng với 4.500–6.000 họ từ) **không dẫn nghiên cứu nào**. | trang luyện thi | B, không dùng |

## 3. Kết luận cho Lexica

1. **Từ vựng dự đoán IELTS ở mức vừa phải, không phải chính xác.** r khoảng 0,7 với Overall nghĩa là giải thích chưa tới một nửa phương sai; 58% là con số "tốt nhất" mình thấy. Phần còn lại là ngữ pháp, kỹ năng làm bài, nghe, nói.
2. **Độ chia nửa band không có cơ sở.** Dữ liệu cho thấy chỉ phân biệt được các band nguyên, và trong một band thì phân tán rất rộng. Hiện Lexica hiển thị "6.0–6.5": nghe chính xác hơn thực tế.
3. **Từ vựng liên hệ mạnh nhất với Reading và Writing, yếu với Speaking và Listening** (độ tin thấp). Câu "IELTS từ vựng tương đương" không nên ngầm hiểu là điểm Speaking.
4. **Hai bảng hiện tại không có nguồn.** Về độ lớn thì chúng không phi lý so với các con số trong mục 2 (band 6.5 khoảng 5.000 từ), nhưng đơn vị khác nhau: nghiên cứu nói **họ từ** (word family), còn Lexica đếm **thẻ/từ**, và mốc band 5.5 của Lexica (3.000) thấp hơn khoảng 4.000 trong tài liệu. Chưa thể kết luận bảng nào đúng vì bài thi của Lexica chưa đo cùng thang với VST.
5. **Thang của bài thi Lexica chưa được so với VST.** Kết quả chỉ thật sự đáng tin khi có dữ liệu so cùng người làm hai bài.

## 4. Thay đổi đã làm trong PR này

- `ieltsRange` nay cộng thêm sai số của chính phép quy đổi (`MAPPING_SPREAD = 100` điểm, dưới dạng căn bậc hai tổng bình phương với sai số bài thi). Khoảng hiển thị rộng khoảng một band (ví dụ "5.5–6.5" thay cho "6.0–6.5").
- Con số 100 là **lựa chọn thận trọng, không phải số đo**. Nó phản ánh phát hiện "trong một band phân tán rất rộng". Sẽ thay bằng con số hiệu chỉnh khi có dữ liệu (mục 5).
- Không đổi hai bảng quy đổi, vì chưa có bằng chứng để đổi sang con số khác.

## 5. Kế hoạch hiệu chỉnh (cần làm với người thật)

1. **Neo ngoài: VST song ngữ Anh–Việt.** Nhờ 60–100 người học làm cả VST (khoảng 20 phút) và bài kiểm tra Lexica, cách nhau trong vòng một tuần. Vẽ điểm Lexica theo điểm VST, lấy hàm quy đổi sang họ từ. Có thể hỏi Nation về giấy phép dùng.
2. **Neo thi thật.** Hỏi tuỳ chọn trong Lexica: đã thi IELTS chưa, điểm Overall/Reading/Writing/Speaking và ngày thi (ECOSYSTEM_STRATEGY mục 2.2, việc 6). Lưu cạnh điểm Lexica gần nhất, chỉ dùng gộp. Cần ít nhất vài chục mẫu cho mỗi dải band để có khoảng tin cậy.
3. **Quy đổi riêng cho từng kỹ năng.** Báo Reading/Writing riêng khỏi Speaking/Listening (Lexica nói "tương đương IELTS từ vựng", cần chỉ rõ đây là ước lượng cho Reading/Writing).
4. **Thay hai bảng** bằng hàm đã hiệu chỉnh, kèm khoảng tin cậy thật (thay `MAPPING_SPREAD`). Ghi nguồn và cỡ mẫu ngay trong code.
5. **Hạng mục kỹ thuật:** `lexica_placement_sessions` đã lưu điểm và độ lệch; thêm bảng `cortex_calibration` (điểm Lexica, điểm VST, điểm IELTS, ngày) và một script phân tích.

## 6. Cách nói với người dùng (đề xuất, chưa đổi trong giao diện)

- "Tương đương IELTS từ vựng khoảng 5.5–6.5. Đây là **ước lượng** dựa trên vốn từ của bạn, **không phải điểm IELTS**. Điểm thật còn phụ thuộc ngữ pháp, nghe, nói và cách làm bài."
- Không dùng từ "đạt band X". Không hứa kết quả.

## 7. Nguồn

- [Investigating the Relationship between IELTS Scores and Receptive Vocabulary Size (UK-FYN)](https://jfyn.co.uk/index.php/ukfyn/article/download/13/23/)
- [IELTS: How to address vocabulary in an IELTS preparation course](https://ielts.org/news-and-insights/how-to-address-vocabulary-in-an-ielts-preparation-course)
- [Nation: Vocabulary Size Test information and specifications](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-tests/the-vocabulary-size-test/Vocabulary-Size-Test-information-and-specifications.pdf)
- [Exploring the relationships between various dimensions of receptive vocabulary knowledge and L2 listening and reading comprehension](https://link.springer.com/article/10.1186/s40468-021-00131-8)
- [The role of vocabulary breadth and depth in IELTS academic reading tests](https://scholarspace.manoa.hawaii.edu/items/b09bd620-9f5c-45c6-af40-836d93188edd)
