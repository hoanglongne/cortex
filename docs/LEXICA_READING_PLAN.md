# Kế hoạch 100 bài đọc cho Lexica

Mục tiêu: **100 bài đọc** (đoạn văn và hội thoại) để phần Đọc và chặng Đọc của phiên Hôm nay luôn có bài hợp với từ người học vừa học, không phải chờ AI viết.

## Hiện trạng
- **App có sẵn 14 bài** (`apps/lexica/app/data/passages.ts`):
  - 10 đoạn văn, 4 hội thoại;
  - chưa có hội thoại level Nâng cao / Chuyên gia, chưa có bài chủ đề Công nghệ.
- **Studio viết thêm được** (trang "Đọc", `apps/cortex-core-api/src/modules/studio/passages*.ts`):
  - mỗi lần bấm "Tạo" viết **1 bài** theo level, chủ đề, loại (đoạn văn / hội thoại);
  - mỗi bài dùng 3–5 từ mới lấy từ kho thẻ, ưu tiên từ ít được dùng nhất;
  - bài nằm chờ duyệt; duyệt xong bấm "Xuất bản" là app nhận.
- **Khi không có bài hợp**, phiên Hôm nay nhờ API viết riêng một bài cho người học (`/v1/lexica/reading`, tối đa 20 bài/người/ngày). Có 100 bài sẵn thì đỡ phải chờ AI, đỡ tốn lượt, và chất lượng đều hơn vì đã có người duyệt.
- Giới hạn chung của Studio: `STUDIO_MAX_GENERATIONS_PER_DAY`, mặc định 30 lượt viết/ngày, dùng chung với thẻ.

## Phân bổ 100 bài

| | Cơ bản | Trung cấp | Nâng cao | Chuyên gia | Cộng |
|---|---|---|---|---|---|
| Đoạn văn (nhánh Chứng chỉ) | 18 | 20 | 14 | 8 | **60** |
| Hội thoại (nhánh Giao tiếp) | 16 | 16 | 8 | 0 | **40** |
| **Cộng** | 34 | 36 | 22 | 8 | **100** |

Đã tính cả 14 bài có sẵn, nên Studio cần viết thêm **86 bài**.

**Vì sao chia như vậy:**
- Phần lớn người học ở Cơ bản và Trung cấp. Kho thẻ có 243 từ Cơ bản, 139 Trung cấp, 98 Nâng cao, 90 Chuyên gia.
- Hội thoại đi theo thẻ Giao tiếp, mà thẻ Giao tiếp có sẵn chỉ ở 3 level (16 Cơ bản, 16 Trung cấp, 8 Nâng cao). Vì vậy chưa viết hội thoại Chuyên gia.

**Chủ đề:** 9 chủ đề (Đời sống, Công việc, Tiền bạc, Công nghệ, Giáo dục, Sức khoẻ, Du lịch, Môi trường, Xã hội), mỗi chủ đề khoảng 10–12 bài.
- Hội thoại nghiêng về Đời sống, Du lịch, Công việc, Tiền bạc: đó là các tình huống nói hằng ngày.
- Đoạn văn trải đều cả 9 chủ đề.

## Chuẩn một bài (người duyệt kiểm)
1. **Độ dài:** đoạn văn 120–200 từ; hội thoại 6–10 lượt, 60–170 từ, hai người có tên.
2. **Từ mới:** 3–5 từ, mỗi từ xuất hiện đúng nghĩa của thẻ; câu có từ mới phải đoán được nghĩa nhờ ngữ cảnh.
3. **Đúng level:** câu chữ ngoài từ mới không khó hơn level của bài.
4. **Bản dịch:** tự nhiên, theo từng đoạn hoặc từng lượt (hội thoại cần đúng thứ tự lượt, để chế độ "Từng lượt" và "Đóng vai" hiện đúng nghĩa).
5. **Câu hỏi:** 2 câu trắc nghiệm hiểu bài. Với hội thoại, ít nhất một câu hỏi về ý định của người nói ("Linh muốn gì?").
6. **Hội thoại phải nói được thành tiếng:** câu ngắn (dưới 20 từ mỗi lượt), dùng được khi đóng vai. Tránh lượt quá dài.
7. **Nội dung:** bối cảnh Việt Nam hoặc quen với người Việt; không nhạy cảm; không trùng ý với bài đã có.

## Làm thế nào

### Bước 0: chuẩn bị (0,5 ngày)
- **Kiểm số thẻ Giao tiếp trong Studio.** Hội thoại lấy từ mới từ kho Giao tiếp: 40 hội thoại × 3–4 từ ≈ 140 lượt từ. Nếu kho dưới 120 cụm, viết thêm thẻ Giao tiếp trước (trang "Giao tiếp" của Studio), ưu tiên Nâng cao.
- **Sửa nhỏ:** câu báo luật độ dài trong Studio đang ghi "120–200 từ" cho cả hội thoại (`passages.ts`, `RULE_TEXT`).

### Bước 1: công cụ "Tạo theo kế hoạch" trong Studio (1 PR, khoảng 1 ngày)
- Một bảng như bảng phân bổ ở trên. Mỗi ô hiện **đã duyệt / đang chờ / còn thiếu**, đếm từ bảng `studio_passages`.
- Nút **"Viết 5 bài còn thiếu"**: chọn các ô thiếu nhiều nhất, xoay vòng chủ đề, gọi `generate` lần lượt, dừng khi chạm giới hạn trong ngày.
- Lý do: biên tập viên không phải tự chọn level, chủ đề cho từng bài, và nhìn một bảng là biết còn thiếu gì.

### Bước 2: viết và duyệt (khoảng 2 tuần, mỗi ngày 30–45 phút)
- **Mỗi ngày:** viết khoảng 8–10 bài (trong giới hạn 30 lượt/ngày), duyệt và sửa ngay. Bài hỏng thì từ chối, viết lại.
- **Mỗi tuần:** bấm "Xuất bản" một lần. App nhận bài mới ở lần mở sau.
- **Ước tính:** khoảng 10 bài đạt mỗi ngày, nên 86 bài mất khoảng 9–10 ngày làm việc.
- **Thứ tự:**
  - Tuần 1: Cơ bản + Trung cấp (cả đoạn văn và hội thoại). Đây là nơi nhiều người học nhất.
  - Tuần 2: Nâng cao + Chuyên gia, rồi lấp chủ đề còn thiếu.

### Bước 3: kiểm sau khi xuất bản
- **Phủ từ:** mỗi từ Cơ bản và Trung cấp có trong ít nhất 1 bài. Thêm một dòng đếm vào bảng ở bước 1.
- **Đọc thử:** trên điện thoại, mỗi level 3 bài, cả 3 chế độ hội thoại (Từng lượt, Đóng vai, Cả bài), có bật giọng đọc.
- **Theo dõi trong phiên Hôm nay:** tỉ lệ chặng Đọc dùng bài sẵn so với bài AI viết. Mục tiêu: trên 70% dùng bài sẵn. Sự kiện `today_stage` đã có, cần thêm thuộc tính nguồn bài (sẵn / AI / trích dẫn); việc này làm cùng bước 1.

## Việc của ai
| Việc | Ai |
|---|---|
| Bước 0, bước 1 (công cụ trong Studio) | dev (Claude), 1 PR |
| Bước 2: viết, duyệt, xuất bản | biên tập viên Studio |
| Bước 3: đọc thử | biên tập viên, hoặc 1–2 người học thử |

## Sau 100 bài
- Mỗi tuần thêm 3–5 bài theo Drop của tuần (trend), để từ trong Drop có bài đọc.
- Thêm hội thoại Chuyên gia khi kho Giao tiếp có cụm từ Chuyên gia.
