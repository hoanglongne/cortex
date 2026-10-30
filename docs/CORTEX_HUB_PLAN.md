# Kế hoạch làm lại Cortex Hub / landing (30/10/2026)

Liên quan: issue #74, `apps/landing`, `docs/ECOSYSTEM_STRATEGY.md` (mục 4), `docs/MARKETING_SESSION_PROMPT.md`, issue #72. Đây là kế hoạch, chưa có code. Các con số và tên là đề xuất.

## 1. Hiện trạng

### 1.1 `apps/landing` nói gì
- Định vị: "Language Tech Ecosystem", "Adobe của EdTech". Tiêu đề: "Ngừng nhồi nhét. Bắt đầu thực chiến."
- Cấu trúc: hero, CORTEX (bộ não chung), Arsenal (lưới app lọc theo "trụ" Sinh học, Tâm lý, Nhận thức, Chiến đấu), Incubator (ý tưởng để bình chọn), Roadmap, Partnership, Footer.
- Dữ liệu (`src/data/ecosystem.ts`): 8 mục: Solilo, Lexica, Dialecta, Oratio (Live), Echo (Development), Syntaxis, Visage, Metamorph (Idea). Mỗi app một trang `/apps/<tên>`.
- Phong cách (`DESIGN_SYSTEM.md`): sao chép từ trang Composio: nền đen `#0f0f0f`, xanh cobalt và cyan, góc vuông, chữ Space Grotesk và JetBrains Mono.

### 1.2 Vấn đề
1. **Landing mô tả một hệ sinh thái khác với thực tế.** Thực tế đang chạy: Lexica, Oratio, **Teach**, Studio, Solilo, Synapse. Teach (sản phẩm có doanh thu tiềm năng nhất) không xuất hiện trên landing. Dialecta, Echo, Syntaxis, Visage, Metamorph là ý tưởng, nhưng hai trong số đó đang gắn nhãn Live hoặc Development.
2. **Nói với ai?** Hero nói với người thích công nghệ, không nói với học viên IELTS, giáo viên, trung tâm hay phụ huynh. Không có đường vào riêng cho từng người, không có bằng chứng (số liệu, ví dụ thật), không có giá.
3. **Giọng văn.** "Tàn nhẫn", "thực chiến", "cưỡng bức" hợp một số người học nhưng đẩy phụ huynh và trung tâm đi. Hai hướng Giao tiếp và Chứng chỉ chưa xuất hiện (xem #72).
4. **Hình thức vay mượn.** Giao diện giống Composio (công cụ cho lập trình viên), không giống bất kỳ app nào trong hệ sinh thái. Người bấm từ landing vào Lexica hay Teach thấy ngay một thương hiệu khác.

## 2. Ba app đang khác nhau thế nào

| | Lexica | Teach | Oratio | Landing |
|---|---|---|---|---|
| Nền | Tối `#0E0F11` | Kem `#FBF7F0` (có tối `#191816`) | Biến theo chủ đề, màu nhấn cam `#FF5A1F` | Đen `#0f0f0f` |
| Màu nhấn | Xanh chanh `#C6F432` | Xanh lá `#2E7556` | Cam (giọng nói) | Cobalt, cyan |
| Chữ | Space Grotesk + JetBrains Mono | Be Vietnam Pro + Lora (serif) | Be Vietnam Pro | Space Grotesk + JetBrains Mono |
| Cảm giác | Game, năng lượng, người học trẻ | Giấy, bình tĩnh, giáo viên | Sân khấu, nói | Terminal, nhà phát triển |
| Góc bo | Tailwind mặc định | Mềm | Mềm | Vuông |

Nhận xét: mỗi app đã tự chọn đúng cho người dùng của mình (người học muốn năng lượng, giáo viên muốn yên tĩnh, rõ ràng). **Không nên ép giống nhau.** Thứ thiếu là một lớp chung nhỏ để nhận ra "cùng một nhà", và landing không thuộc cả ba.

## 3. Đề xuất ngôn ngữ thương hiệu: "một nhà, nhiều phòng"

### 3.1 Nguyên tắc
Phần giữ chung là **khung và giọng**; phần mỗi app tự chọn là **màu nhấn và nhịp**.

| Giữ chung (cả hệ sinh thái) | Mỗi app tự chọn |
|---|---|
| Logo và cách viết tên "Cortex" cùng tên app | Bảng màu nền và màu nhấn |
| Một thang chữ: **Be Vietnam Pro** cho nội dung (đã hỗ trợ tiếng Việt tốt), JetBrains Mono cho số và nhãn | Chữ tiêu đề (Lexica giữ Space Grotesk, Teach giữ Lora) |
| Khoảng cách, bo góc, cỡ chữ theo cùng thang | Mức vui nhộn của hình ảnh |
| Giọng văn (mục 3.3) | Lời hứa riêng của app |
| Thanh nhỏ "Cortex" ở chân hoặc đầu trang, chuyển giữa app | Cách bố trí màn hình chính |

### 3.2 Màu
- **Màu thương hiệu Cortex** (chỉ dùng cho logo, landing, chân trang): một màu trung tính ấm và một màu nhấn. Đề xuất nền kem ấm `#F6F1E8` (gần Teach), chữ `#1F1D1A`, nhấn xanh rêu `#2E7556`. Lý do: landing phải làm yên tâm cả phụ huynh, giáo viên và trung tâm, không chỉ người học trẻ.
- **Mỗi app giữ màu nhấn của mình**, và hiện thành "chấm màu" cạnh tên app trên landing: Lexica xanh chanh, Teach xanh lá, Oratio cam. Landing có cả bản tối cho người dùng chọn tối.
- Không dùng cobalt và cyan của Composio nữa.

### 3.3 Giọng văn
- Rõ, ấm, cụ thể; nói điều làm được, không hứa điểm. Ví dụ: "Biết em nào sắp quên bài, trước khi em ấy bỏ học." thay cho "Ngừng nhồi nhét".
- Với người học: thẳng và nhẹ nhàng, có chút hài. Với giáo viên và phụ huynh: bình tĩnh, nói bằng số cụ thể.
- Quy tắc cứng: không "chắc chắn đạt band X" (khớp ECOSYSTEM_STRATEGY mục 6), điểm luôn gọi là ước lượng.

### 3.4 Hình ảnh
- Dùng **ảnh chụp màn hình thật** của app (màn Hôm nay của Lexica, bảng Hôm nay của Teach, Đấu trường trên máy chiếu), không dùng hình minh hoạ chung chung. Ảnh thật là bằng chứng rẻ nhất.
- Một biểu tượng đơn giản cho mỗi app và một cho Cortex. Không cần hệ thống minh hoạ ở giai đoạn đầu.

## 4. Cấu trúc trang landing

Mục tiêu: mỗi người đến trong 5 giây biết "đây có phải cho mình không" và bấm đúng chỗ.

| # | Khối | Nội dung |
|---|---|---|
| 1 | Hero | Một câu cho cả hệ sinh thái + hai nút: "Tôi là người học" và "Tôi là giáo viên hoặc trung tâm". Ảnh thật bên cạnh. |
| 2 | Chọn đường | 4 thẻ: Học viên, Giáo viên, Trung tâm, Phụ huynh. Mỗi thẻ một câu lời hứa và một nút vào đúng app (Lexica, Teach, Teach kèm trang trung tâm, báo cáo mẫu). |
| 3 | Hai hướng | Chứng chỉ và Giao tiếp, đặt cạnh nhau (dùng lại bảng ở `lib/journey/branchInfo.ts`), cho người học chọn. |
| 4 | Vì sao khác | Ba điều thật: điểm do máy chủ chấm và xác minh; số liệu học thật trong lớp; mỗi con số kèm một việc làm được. |
| 5 | Bằng chứng | Chỗ đặt số liệu thật khi có (số lớp thí điểm, tỉ lệ quay lại, trích lời giáo viên). Khi chưa có, **để trống và ghi rõ "đang thí điểm"**, không bịa. |
| 6 | Các app | Lưới chỉ gồm app đang chạy thật (Lexica, Teach, Oratio, Studio nội bộ ẩn). Ý tưởng chuyển xuống trang "Đang nghĩ tới". |
| 7 | Giá | Bảng giá ngắn theo BUSINESS_MODEL (học viên, giáo viên lẻ, trung tâm). Ghi "giá thử nghiệm". |
| 8 | Hỏi đáp và chân trang | Dữ liệu học viên dưới 18 tuổi, quyền riêng tư, liên hệ. |

Giữ: `CortexSection` (bộ não chung) nhưng nói lại bằng lời thường: "một tài khoản, một hồ sơ học chung", và vẽ lại với app thật. Giữ Incubator và Roadmap ở trang phụ.

Trang riêng (cùng domain, đường dẫn): `/chung-chi` (IELTS) và `/giao-tiep`, mỗi trang là một landing ngắn cho chiến dịch (khớp ECOSYSTEM_STRATEGY 4.2 mục 3). `/giao-vien` và `/trung-tam` cho phía B2B.

## 5. Liên kết với marketing và #72

- Hero và bốn thẻ chọn đường lấy từ ICP trong phiên marketing (MARKETING_SESSION_PROMPT mục 2). Phiên đó nên chốt thông điệp trước khi viết chữ cuối cùng cho landing. Đến lúc đó, landing dùng chữ tạm.
- Bảng "so sánh hai hướng" dùng chung một nguồn dữ liệu giữa Lexica và landing (xem bước 1 bên dưới), để chữ không lệch.
- Theo giai đoạn 0 của ECOSYSTEM_STRATEGY 4.3: **chứng chỉ là ưu tiên một**, nên `/chung-chi` làm trước, `/giao-tiep` ở mức duy trì.
- Số liệu đo (UTM, nút bấm vào app) bám các chỉ số ở BUSINESS_MODEL mục 7.

## 6. Kế hoạch triển khai theo bước

| Bước | Việc | Công sức | Ghi chú |
|---|---|---|---|
| 0 | Chốt: màu thương hiệu, tên hiển thị, logo, ảnh chụp thật cần dùng | Nhỏ, cần bạn quyết | Quyết định mục 7 |
| 1 | **Gói token chung** `packages/brand`: thang chữ, khoảng cách, bo góc, bảng màu thương hiệu, văn bản dùng chung (so sánh hai hướng). Lexica, Teach, Oratio nhập dần, không đổi giao diện ngay | Vừa | Giống cách `packages/classroom` đã làm |
| 2 | Landing mới: hero, chọn đường, hai hướng, các app thật, giá. Bỏ dữ liệu app ý tưởng khỏi trang chính | Vừa đến lớn | Dùng Be Vietnam Pro, nền kem |
| 3 | Trang `/chung-chi` và `/giao-vien` (có báo cáo phụ huynh mẫu) | Vừa | Sau bước 2 |
| 4 | Thanh "Cortex" chung ở các app (chuyển app, đăng nhập một lần) | Vừa | Cần `packages/brand` |
| 5 | Bằng chứng thật: số liệu thí điểm, trích lời, ảnh | Phụ thuộc thí điểm | Không làm trước có dữ liệu |
| 6 | `/giao-tiep`, trang trung tâm, hỏi đáp, đa ngôn ngữ nếu cần | Nhỏ đến vừa | |

Thứ tự khuyến nghị: **0, 1, 2** trước. Nếu chỉ làm một việc, làm bước 2 với chữ tạm, vì hiện landing đang nói sai về hệ sinh thái.

## 7. Cần bạn quyết

1. **Màu thương hiệu**: kem ấm + xanh rêu (đề xuất), giữ tối + xanh chanh theo Lexica, hay màu mới?
2. **Landing nói với ai trước**: người học IELTS hay giáo viên và trung tâm? (đề xuất: giáo viên và trung tâm là cửa vào, người học là cửa phụ, theo MARKETING_SESSION_PROMPT). Điều này đổi hero.
3. **Dialecta, Echo, Syntaxis, Visage, Metamorph**: chuyển hết sang trang "Đang nghĩ tới", hay bỏ?
4. **Tên "Cortex Hub"** có giữ trước người dùng không, hay chỉ "Cortex"?
5. **Thông điệp "Ngừng nhồi nhét"**: giữ cho người học, hay thay hoàn toàn?

## 8. Đã quyết (30/10/2026) và đã làm

| Câu | Quyết định |
|---|---|
| Màu | Kem ấm + xanh rêu (đề xuất), nhìn chuyên nghiệp, không "AI slop", có chút giáo dục nhưng trẻ trung gần gũi. Thể hiện bằng: nền giấy ấm, chữ serif Lora cho tiêu đề, nét tô vàng như bút dạ, ảnh chụp màn hình thật, không có hiệu ứng phát sáng hay gradient |
| Cửa vào | Người học, giáo viên và trung tâm mỗi nhóm một phân hệ riêng: `/hoc-vien`, `/giao-vien` (có phần phụ huynh), `/trung-tam` |
| 5 app ý tưởng | Giữ, chuyển sang trang `/dang-nghi-toi` (Dialecta, Echo, Syntaxis, Visage, Metamorph) |
| Tên | Dùng "Cortex". Phương án thay thế chưa cần (xem phản hồi trong issue) |
| Thông điệp | Thay hoàn toàn: **"Học xong là nhớ. Dạy xong là thấy."** Mỗi nhóm một câu riêng ở trang của mình |

Đã làm ở bước 2 (bản đầu, chữ tạm): landing mới tại `apps/landing/src/app/(brand)`: trang chủ, ba phân hệ, trang "Đang nghĩ tới", layout sáng dùng chung. Các trang cũ (`/apps/*`, `/auth`, `/profile`) vẫn giữ giao diện tối cũ, chưa chuyển.

Chưa làm: gói `packages/brand` dùng chung (bước 1: token hiện nằm trong `apps/landing/src/app/globals.css`), ảnh chụp Teach, bằng chứng thật, `/chung-chi`, thanh Cortex chung ở các app. Cấu hình cần đặt ở Vercel: `NEXT_PUBLIC_TEACH_URL`, `NEXT_PUBLIC_ORATIO_URL`, `NEXT_PUBLIC_LEXICA_URL`, `NEXT_PUBLIC_CONTACT_EMAIL` (chưa đặt thì nút tương ứng ẩn hoặc dẫn về trang đăng nhập).
