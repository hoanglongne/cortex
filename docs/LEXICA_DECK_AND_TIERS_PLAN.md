# Lexica: bộ từ 2.000 và phân cấp tính năng (28/11/2026)

Hai phần: **A.** đưa nhánh Chứng chỉ từ 419 lên 2.000 từ mà giữ chất lượng hiện tại; **B.** phân 51 trang thành cấp bậc, giữ F0 gọn (không ẩn, không bỏ). Liên quan: issue #178, `docs/LEXICA_AUDIT.md`, `docs/LEXICA_STUDIO_SPEC.md`.

---

## A. Bộ từ 2.000

### A1. "Chất lượng như hiện tại" nghĩa là gì (đo từ dữ liệu)
Mỗi thẻ hiện có đủ 9 phần, 570/570 thẻ (trừ 1 thẻ thiếu `upgradeModule`):

| Phần | Ví dụ (`feasible`) | Ai làm hiện nay |
|---|---|---|
| `word`, `ipa` | FEASIBLE, ˈfiːzəbl | tay |
| `level`, `elo` | beginner, 880 | tay |
| `scenario`: câu tiếng Việt chêm đúng 1 từ tiếng Anh viết hoa | "…không FEASIBLE nếu chỉ có ba người." (67–136 ký tự, trung bình 100) | tay/AI + duyệt |
| `translationHint` | Khả thi, có thể thực hiện được | tay |
| `collocations` (2) | feasible plan, technically feasible | tay |
| `upgradeModule`: câu đơn + 3 cách nói học thuật kèm sắc thái và độ trang trọng | highly feasible / commercially viable / practicable | tay |
| `surgeryModule`: gốc, tiền tố, hậu tố, mỗi phần 3 từ liên quan | fac/feas- (làm), -ible (có thể) | tay |

Và mỗi thẻ kéo theo **tài nguyên đi kèm**: giọng đọc tạo sẵn (từ và cụm từ), dòng trong ngân hàng bài kiểm tra xếp lớp (`elo`), chủ đề (Album), có thể có luật Blend.

**Đề nghị đặt tiêu chuẩn thành máy kiểm** (hiện **không có test nào** kiểm dữ liệu thẻ): một bộ kiểm chạy trong CI cho mọi thẻ. Các luật:
- đủ 9 phần;
- câu có đúng một từ viết hoa trùng `word` (cho phép -s/-ed/-ing), dài 60–140 ký tự, ít nhất 60% chữ là tiếng Việt;
- cụm từ chứa từ đó;
- `upgradeModule` có 3 lựa chọn;
- `surgeryModule` mỗi phần có 3 từ liên quan, không trùng chính từ đó;
- `elo` nằm trong khoảng của `level`;
- không trùng câu với thẻ khác.

Chạy thử trên 570 thẻ hiện có trước, để thấy chuẩn đang thật sự ở đâu.

### A2. Sửa bộ hiện có trước khi thêm
- **84 từ có nhiều thẻ**, có thẻ trùng y hệt câu (EFFICIENT xuất hiện hai lần cùng một câu ở cấp Trung cấp). Gộp hoặc viết lại.
- **Nhóm Chuyên gia (90 từ) là từ kiểu GRE**: grandiloquent, obsequious, enervate, adumbrate, abnegation. Hiếm trong IELTS. Đề nghị giữ (người học đã học), **không thêm từ kiểu này**, và đổi tên nhóm hoặc chuyển sang gói tuỳ chọn.

### A3. Chọn 1.581 từ mới
Mục tiêu: **2.000 từ khác nhau**, ưu tiên từ người học IELTS thật sự gặp.

| Cấp | Hiện có | Thêm | Sau |
|---|---|---|---|
| Cơ bản | 117 | ~480 | ~600 |
| Trung cấp | 114 | ~590 | ~700 |
| Nâng cao | 98 | ~430 | ~530 |
| Chuyên gia | 90 | ~80 | ~170 |

**Nguồn danh sách** (danh sách từ, không chép nội dung):
- **NAWL** (New Academic Word List, khoảng 960 từ học thuật);
- **NGSL** (khoảng 2.800 từ thông dụng, để lấy phần Cơ bản và Trung cấp còn thiếu);
- **AWL** (Coxhead, 570 họ từ học thuật);
- danh sách chủ đề IELTS do mình soạn (môi trường, giáo dục, công nghệ, sức khoẻ...).

NAWL và NGSL được công bố theo giấy phép CC BY-SA. **Cần kiểm lại giấy phép** trước khi dùng, và ghi nguồn. Xếp ưu tiên theo tần suất trong các danh sách đó, bỏ từ đã có.

### A4. Quy trình (dùng lại Studio, không làm công cụ mới)
Studio đã có đủ khâu: sinh nháp bằng AI, kiểm bằng luật, duyệt bằng quẹt, xuất bản. Thêm một chế độ **"thẻ lõi"**:
1. **Sinh nháp:** mỗi từ một lần gọi AI, ra đủ 7 phần nội dung (câu, gợi ý nghĩa, 2 cụm từ, `upgradeModule`, `surgeryModule`). **IPA không lấy từ AI** mà lấy từ từ điển. Cần chọn nguồn có giấy phép phù hợp: CMUdict là phiên âm Mỹ, phải chuyển đổi; IPA kiểu Anh như hiện tại cần nguồn khác. `level` và `elo` tính từ cấp CEFR và tần suất.
2. **Kiểm tự động** bằng bộ kiểm ở A1. Thẻ không qua bị loại trước khi tới tay người.
3. **Duyệt bằng tay trong Studio:** xem thẻ như trong app, sửa tại chỗ.
4. **Xuất bản** theo lô 200 từ, vào kho lõi.
5. **Tài nguyên đi kèm:** giọng đọc tạo sẵn, sinh lại ngân hàng bài kiểm tra xếp lớp, gắn chủ đề.

**Chi phí thật nằm ở khâu duyệt, không phải AI.** AI chỉ tốn vài USD cho 1.600 thẻ. Duyệt một thẻ đủ 9 phần ước khoảng 60–90 giây, tức **27–40 giờ duyệt** cho 1.581 thẻ. Đây là ước tính, cần đo trên lô đầu.

### A5. Ảnh hưởng tới tốc độ (phải làm cùng)
Kho 570 thẻ là khoảng 700 KB. **2.000 thẻ sẽ là khoảng 3 MB**, phá phần tối ưu vừa làm. Phải tách kho theo cấp: tải cấp của người học trước, các cấp khác tải sau. Việc này làm **trước** khi xuất bản lô đầu.

### A6. Bài đọc
54 bài đọc đang phủ 419 từ. Với 2.000 từ cần thêm khoảng 150 bài để bước "Gặp" có đủ chỗ gặp từ. Studio đã có mục bài đọc. Làm sau, theo từng lô từ.

### A7. Giai đoạn
| Giai đoạn | Việc | Ước tính |
|---|---|---|
| P0 | Bộ kiểm dữ liệu trong CI; sửa 84 từ trùng; quyết số phận nhóm Chuyên gia | 3–4 ngày |
| P1 | Danh sách 1.581 từ (sau khi kiểm giấy phép); chế độ "thẻ lõi" trong Studio; nguồn IPA; tách kho theo cấp | 1–1,5 tuần |
| P2 | 8 lô × 200 từ: sinh, kiểm, duyệt, xuất bản. **Lô đầu đo tốc độ duyệt và tỉ lệ bị loại**, rồi chỉnh trước khi chạy tiếp | theo giờ duyệt |
| P3 | Giọng đọc, ngân hàng bài kiểm tra, chủ đề, bài đọc | 1 tuần + bài đọc |
| P4 | Đo chất lượng: người thứ hai chấm mù 100 thẻ ngẫu nhiên (mới lẫn cũ), so tỉ lệ báo lỗi và tỉ lệ đúng của thẻ mới với thẻ cũ | liên tục |

---

## B. Phân cấp tính năng

Không ẩn hay bỏ trang nào. Mỗi trang có một cấp. **Cấp quyết định lúc nào trang xuất hiện trong điều hướng**, không quyết định nó có tồn tại hay không: link trực tiếp (lớp học, chia sẻ, Blend) luôn mở được.

### B1. Các cấp
| Cấp | Dành cho | Trang |
|---|---|---|
| **F0: vòng học lõi** (từ ngày 1) | Mọi người mới | Onboarding (thẻ thử, nhánh, đời sống, trình độ), Hôm nay (Ôn → Học → Đọc → Nói), Ôn tập, Từ của tôi, Tôi (cài đặt cơ bản, đăng nhập, sao lưu), Riêng tư, Điều khoản, Xoá tài khoản |
| **F1: luyện thêm** (sau 3 ngày học, hoặc 30 từ) | Người đã có thói quen | Luyện (Chơi 16 trò, thư viện Đọc, Nói, Viết), Lộ trình 30 ngày, Thống kê, Điểm từ vựng và bài kiểm tra lại |
| **F2: mở rộng** (sau 7 ngày, hoặc khi người học tự tìm) | Người ở lại | Album và bộ sưu tập, Bạn học, Thách đấu, Nhật ký, Bắt gặp, Blend và tiện ích, Đấu trường, Lớp học (**ngay lập tức** nếu vào lớp bằng mã) |
| **F3: phòng thử** | Người thử, đội làm | Truyện (cũ), `/ghi-am`, `/num-van` (chuyển hướng cũ), `/dev/*` (đã 404 ở bản thật) |

### B2. F0 phải gọn: tiêu chí đo được
1. **Thanh điều hướng có 3 mục**: Hôm nay, Từ của tôi, Tôi. Mục "Luyện" thêm vào ở F1, "Album" ở F2. Hiện có 5 mục ngay từ đầu.
2. **Mỗi màn F0 có đúng một việc chính.** Màn tổng kết sau phiên Hôm nay hiện có tới 6 khối:
   - tổng kết;
   - Cam kết (`PledgeCard`);
   - mốc lộ trình;
   - Lưu tiến độ;
   - Cài app (`InstallCard`);
   - Phần thưởng.
   Ngày 1 nên chỉ còn tổng kết và một lời mời (lưu tiến độ hoặc cài app, không cả hai).
3. **Không bật hộp thoại ngoài luồng trong 3 ngày đầu:** nhắc Cortex Hub, chúc mừng mục tiêu, nhắc học quá nhiều trong `page.tsx`.
4. **Không có thuật ngữ chưa giải thích:** "Bụi", "Hộp", "Thẻ may mắn" thuộc F2.
5. **Đo:** người mới tới được thẻ đầu tiên của phiên Hôm nay trong dưới 60 giây kể từ lúc mở app (đo bằng e2e); test e2e kiểm thanh điều hướng có đúng 3 mục khi mới bắt đầu.

### B3. Cách mở khoá
- Một nơi duy nhất quyết định cấp, đọc từ store (số ngày học, số từ): `featureTier()`. Thanh điều hướng, trang Tôi, trang Luyện đều hỏi nó.
- Khi mở cấp mới: một lần báo nhẹ trên màn Hôm nay ("Đã mở Luyện: 16 trò chơi"), không hộp thoại.
- Người học cũ (đã qua 7 ngày) thấy đủ như hiện tại: không ai bị mất gì đang dùng.
- Ước tính: 3–4 ngày, kèm e2e cho từng cấp.

---

## Cần bạn quyết
1. **Ai duyệt 1.581 thẻ**, và có chấp nhận 27–40 giờ duyệt không? Nếu không, giảm mục tiêu (ví dụ 1.200), hoặc nhờ thêm một người duyệt.
2. **Nhóm Chuyên gia kiểu GRE:** giữ nguyên, đổi tên, hay chuyển sang gói tuỳ chọn?
3. **Ngưỡng mở khoá** F1 và F2 (3 ngày và 7 ngày là đề nghị của mình).
4. **Thứ tự:** đề nghị làm **B trước** (3–4 ngày, thấy ngay) song song với **P0 của A** (bộ kiểm dữ liệu, sửa trùng). Rồi mới tới P1 và các lô từ.
