# Teach: nghiên cứu đối thủ và chỗ trống thị trường (issue #77, 24/11/2026)

Làm trước khi quyết có đi vào mảng LMS cho trung tâm hay không. Thay cho phần "đối thủ" còn sơ sài trong `TEACH_LMS_PLAN.md`.

**Giới hạn của nghiên cứu này, đọc trước:**
- Phiên làm việc không mở trực tiếp được trang web của đối thủ (mạng bị giới hạn), nên mọi thông tin đi qua kết quả tìm kiếm có trích nội dung. Chưa dùng thử sản phẩm nào.
- Phần lớn số liệu (số khách hàng, độ chính xác AI) là **đối thủ tự công bố**, chưa ai kiểm chứng.
- Giá của các bên làm cho trung tâm gần như đều "liên hệ báo giá". Các con số dưới đây lấy từ bài viết tổng hợp, có chỗ mâu thuẫn và có thể đã cũ.

---

## 1. Kết luận

1. **Bạn đúng: không nên làm LMS vận hành để cạnh tranh trực diện.** Mảng này đông, rẻ và đã chín. Easy Edu tự nhận hơn 1.400 trung tâm; DotB tính từ khoảng 5.000–15.000đ mỗi học viên mỗi tháng; có cả bản miễn phí (NextCRM). Một đội một người không thắng được ở đây.
2. **Mảng "LMS + AI cho trung tâm IELTS", nơi Teach định đứng, cũng đã có người đứng.** Selfomy One, Prep for Business, Ai4Ielts LMS đều đã bán đúng thứ mình định làm tiếp: ngân hàng đề, thi thử, AI chấm Writing/Speaking có giáo viên duyệt, quản lý lớp. Họ đi trước mình ở những phần đó, Prep còn có vốn (hơn 6 triệu EUR năm 2024).
3. **Chính sách đang làm nhu cầu IELTS yếu đi.** Thông tư 95/2026 (ban hành 11/11/2026): năm 2027 điểm cộng IELTS tối đa 0,5; **từ 2028 bỏ hẳn điểm cộng**, chỉ còn quy đổi thay điểm môn ngoại ngữ, mỗi trường tự quyết. Năm 2026 có khoảng 35.900 thí sinh dùng IELTS để cộng điểm. Đây là động lực chính của nhiều lớp IELTS cho học sinh phổ thông.
4. **Chỗ trống còn lại, nếu có, không nằm ở "thay LMS".** Nó nằm ở phần **việc học ngoài giờ lớp** mà cả phần mềm vận hành lẫn nền tảng luyện thi đều làm yếu: từ vựng có lịch ôn, Blend (gặp từ trong bài báo tiếng Việt), cảnh báo sớm em sắp nghỉ học, báo cáo phụ huynh về việc học. Đây là **giả thuyết**, cần kiểm bằng nói chuyện với trung tâm trước khi làm gì thêm.
5. **Đề nghị:** dừng kế hoạch "thay LMS" (`TEACH_LMS_PLAN.md`), đổi #77 thành một bước kiểm chứng nhỏ (mục 6). Không viết thêm mã cho Teach theo hướng vận hành cho tới khi có kết quả.

---

## 2. Bản đồ đối thủ

### 2.1 Nhóm A: phần mềm vận hành trung tâm (CRM, học phí, lịch)

| Sản phẩm | Điểm chính | Giá tìm được | Quy mô tự công bố |
|---|---|---|---|
| **Easy Edu** (EMSO) | Học viên, lớp, học phí, báo cáo, OKR/KPI, app phụ huynh và giáo viên, tự động marketing/sales, nhiều chi nhánh | "Từ 2.000đ/ngày/người dùng"; bài khác ghi gói Standard 700.000đ/tháng dưới 200 học viên. Không thống nhất | Hơn 1.400 trung tâm, hơn 5 triệu người dùng |
| **DotB EMS** | CRM tuyển sinh, chăm sóc học viên tự động, giáo vụ, doanh thu; LMS chỉ là tích hợp, "chưa phải thế mạnh" | Theo **học viên hoạt động/tháng**: 5.000 / 9.000 / 15.000đ (bài 7/2026) hoặc 7.000–39.000đ (bài cũ). Tối thiểu 100 học viên, ký 1 năm | Không rõ |
| **CloudEMS** (CloudGO) | Vận hành, nhiều chi nhánh | Không công bố | Không rõ |
| **Bado** | Quản lý trung tâm cơ bản | 170.000đ/tháng, 5 nhân viên | Không rõ |
| **Getfly CRM** | CRM chung | 200.000–600.000đ/tháng | Không rõ |
| **NextCRM** | Điểm danh, chuyển lớp, bảo lưu, thu chi | Có bản miễn phí | Không rõ |
| **MISA AMIS giáo dục** | Học viên, phụ huynh, lớp, khoá; mạnh kế toán | Không công bố | MISA là hãng lớn |

**Nền tảng chung mà trung tâm đã quen có:** ghi danh, lớp và lịch, điểm danh, học phí và công nợ, chuyển lớp/bảo lưu, app phụ huynh, CRM tuyển sinh, nhiều chi nhánh. Teach hiện chỉ có lớp, lịch, điểm danh, cổng phụ huynh.

### 2.2 Nhóm B: nền tảng dạy và luyện thi cho trung tâm (đối thủ trực tiếp của Teach)

| Sản phẩm | Điểm chính | Giá | Ghi chú |
|---|---|---|---|
| **Selfomy One** | "All-in-one" cho trung tâm IELTS/TOEIC/SAT: **website thi thử mang thương hiệu trung tâm**, ngân hàng đề, AI chấm Speaking (4 tiêu chí, tô lỗi phát âm từng từ) và Writing, flashcard, shadowing, theo dõi tiến độ, quản lý lớp **và tài chính** | Liên hệ báo giá; dùng thử 15 ngày; giảm 20% khi mua năm | Tự nhận hơn 50 trung tâm dùng phòng thi ảo, AI "chính xác trên 85%". **Gần với hướng của Teach nhất** |
| **Prep for Business** | Khoá học IELTS/TOEIC/HSK, hơn 500 bộ đề, AI chấm 4 kỹ năng, bảng theo dõi theo thời gian thực | Từ khoảng 7 USD/tháng (khoá học) và 12 USD/tháng (luyện thi AI), mỗi người học | Prep gọi được hơn 6 triệu EUR (5/2024); nhắm cả trung tâm "giảm chi phí chấm chữa" |
| **Ai4Ielts LMS** | Giao đề, AI chấm 4 kỹ năng, **giáo viên duyệt điểm trước khi trả**, phân quyền admin/giáo viên, báo cáo trung tâm | Giáo viên lẻ: dùng thử 30 ngày rồi trả theo tháng; trung tâm: theo hợp đồng | Trùng với thiết kế Writing (#64) mình định làm |
| **Edmicro** | App IELTS AI cho người học (7 nhóm kỹ năng, chấm Speaking/Writing); công ty còn có Onluyen.vn cho trường | Không rõ gói trung tâm | Chủ yếu B2C và trường phổ thông |
| **ELSA (Schools/Business)** | Phát âm và nói bằng AI | Khoảng 18 USD/người/tháng, hoặc 342 USD/người/năm (gói Team) | Đối thủ của phần chấm phát âm trên máy của Lexica |
| **IELTS International (cho khoa, trung tâm)**, **ECE** | AI chấm nháp, giáo viên duyệt; LMS ôn IELTS | Không rõ | |
| Công cụ miễn phí | Quizlet (từ vựng), Kahoot/Quizizz (quiz trực tiếp), Google Classroom (giao bài) | Miễn phí hoặc rẻ | Cạnh tranh trực tiếp với Đấu trường và giao bài |

**Điều đáng chú ý:** giá phần học (Prep 7–12 USD, khoảng 175.000–300.000đ mỗi người học mỗi tháng; ELSA 18 USD) **cao hơn nhiều** giá phần vận hành (DotB 5.000–15.000đ mỗi học viên). Trung tâm trả tiền cho thứ giúp học viên học, không trả nhiều cho phần mềm quản lý. Đây là lý do thêm để không đi vào vận hành.

---

## 3. Thị trường

| Điều | Số liệu | Nguồn, độ tin |
|---|---|---|
| Doanh thu các chuỗi trung tâm tiếng Anh có thương hiệu | khoảng 540 triệu USD (2024), gần 80% ở Hà Nội và TP.HCM | EY-Parthenon, khảo sát 350 phụ huynh |
| Cơ cấu | Phân khúc trung cấp (5–11 USD/giờ) chiếm hơn 2/3 học viên, tăng nhanh nhất; 72% vẫn muốn học trực tiếp | EY-Parthenon |
| Số trung tâm có phép ở Hà Nội và TP.HCM | 1.917 | JDI Group, chưa kiểm |
| Học viên phân khúc trung–cao cấp ở HN, HCM đến 2030 | khoảng 440.000, gấp đôi hiện tại | Dự báo của EY |
| Thí sinh dùng IELTS cộng điểm đại học 2026 | hơn 35.900 | Bộ GD&ĐT qua báo chí |
| IELTS ở Việt Nam | Chỉ thi trên máy tính từ 29/3/2025 | IDP |
| Định hướng nhà nước | Nghị quyết 71-NQ/TW (8/2025): nâng năng lực tiếng Anh học sinh phổ thông đến 2030 | Chưa rõ cơ chế |
| Quy định dạy thêm | Thông tư 29/2024 (sửa bởi Thông tư 19/2026): trung tâm phải đăng ký kinh doanh; cho dạy tiếng Anh tiểu học ngoài sách giáo khoa | Chưa đọc toàn văn |

**Đọc chung:** thị trường tiếng Anh vẫn lớn và học trực tiếp ở trung tâm vẫn là chính, nên trung tâm còn đó. Nhưng **IELTS cho học sinh phổ thông** đang mất một động lực lớn từ 2027–2028. Tiếng Anh trẻ em và tiếng Anh chung có gió thuận hơn (Nghị quyết 71, Thông tư 19/2026).

---

## 4. Teach đứng ở đâu (nói thẳng)

| Teach có | Đối thủ có chưa? | Đánh giá |
|---|---|---|
| Từ vựng có lịch ôn 4 bước (Hiểu, Nhớ, Gặp, Dùng), báo số thật về lớp | Selfomy có flashcard và theo dõi; Quizlet miễn phí | Hơn ở chiều sâu (lịch ôn, 4 bước), không phải độc nhất |
| **Blend**: đọc báo tiếng Việt, từ đang học hiện bằng tiếng Anh; tiện ích Chrome | **Không thấy ai làm** | Khác biệt thật, chưa có người dùng |
| **Cảnh báo sớm**: em sắp nghỉ, sắp quên, điểm cuối khoá dạng khoảng | Không thấy phần mềm trung tâm nào làm; chỉ có vài trường đại học thí điểm | Khác biệt, nhưng chưa có dữ liệu thật để chứng minh đúng |
| Báo cáo phụ huynh về việc học, viết cho người không rành tiếng Anh | Easy Edu có app phụ huynh (lịch, học phí) | Khác về nội dung, không khác về kênh |
| Chấm phát âm trên máy, lỗi riêng của người Việt | ELSA mạnh, có tiền; Selfomy tô lỗi phát âm | Không đủ để thắng ELSA |
| Đấu trường (quiz trực tiếp) | Kahoot, Quizizz miễn phí | Không phải lý do để mua |
| Oratio (luyện nói với bạn) | Không thấy bên nào cho trung tâm | Khác biệt, chưa kiểm |
| **Thiếu:** ngân hàng đề, thi thử 4 kỹ năng, AI chấm Writing, học phí, CRM, thương hiệu, khách hàng | Đối thủ nhóm B đã có | Thua ở mọi phần "luyện thi" |

**Tóm lại:** Teach không có lợi thế ở cả vận hành lẫn luyện thi IELTS. Thứ duy nhất có vẻ chưa ai làm là **việc học từ hằng ngày ngoài lớp và cảnh báo sớm cho trung tâm**, tức phần giữ học viên. Đó là chỗ đáng kiểm.

---

## 5. Ba hướng có thể, và đánh giá

| Hướng | Là gì | Ủng hộ | Chống | Đánh giá |
|---|---|---|---|---|
| **1. LMS thay thế** (kế hoạch cũ) | Làm đủ vận hành và luyện thi | Trung tâm cần một chỗ | Đông, rẻ, đối thủ đi trước nhiều năm, đội một người | **Không làm** |
| **2. Lớp phụ "giữ học viên"** cắm cạnh phần mềm trung tâm đang dùng | Lexica + Blend + cảnh báo sớm + báo cáo phụ huynh, bán theo học viên; nhập/xuất Excel để sống cạnh Easy Edu, DotB… | Chưa thấy ai làm; giá phần học cao hơn phần vận hành; không đụng vào thứ đối thủ mạnh | Chưa chứng minh trung tâm chịu trả; cảnh báo sớm chưa có dữ liệu để chứng minh | **Đáng kiểm** |
| **3. Đổi phân khúc** | Tiếng Anh trẻ em hoặc tiếng Anh chung thay vì IELTS | Gió chính sách thuận; nhóm B tập trung IELTS | Nội dung hiện nghiêng IELTS; trẻ nhỏ cần nội dung, giao diện khác; vẫn phải kiểm | Cân nhắc **sau** khi hướng 2 có tín hiệu |

Hướng 2 khớp với điều `ECOSYSTEM_STRATEGY.md` đã ghi: "chỉ làm phần liên quan tới lớp và điểm danh đã có", "cổng phụ huynh chỉ làm khi có yêu cầu thật".

---

## 6. Bước tiếp theo đề nghị (thay cho lộ trình L0–L6)

**Không viết mã mới cho Teach theo hướng vận hành.** Thay vào đó:

1. **Dùng thử đối thủ** (vài giờ, mình làm được nếu mở mạng tới các trang đó, hoặc bạn làm): Selfomy One (thử 15 ngày), Ai4Ielts (thử 30 ngày cho giáo viên), xin demo Prep for Business. Ghi lại họ làm gì tốt, thiếu gì, giá thật.
2. **Nói chuyện với 3–5 chủ trung tâm hoặc giáo viên tự mở lớp** (15 phút mỗi người), hỏi đúng 4 câu:
   - Đang dùng phần mềm gì, trả bao nhiêu, ghét gì nhất?
   - Mỗi tháng mất bao nhiêu học viên, có biết trước ai sắp nghỉ không?
   - Học viên có học gì giữa hai buổi không, trung tâm có biết không?
   - Có trả thêm cho một thứ giúp học viên học từ đều và báo phụ huynh không, bao nhiêu?
3. **Quyết theo câu trả lời:**
   - Nhiều người nói "mất học viên vì không biết trước" và chịu trả: làm hướng 2, bắt đầu từ cảnh báo sớm + báo cáo phụ huynh + nhập/xuất Excel.
   - Không ai quan tâm: đóng #77, dồn sức cho Lexica (B2C) và app điện thoại.

Mình biết bạn không muốn bị giao việc tìm lớp thí điểm (`TASKS_PLAN.md`). Nhưng ở đây không có cách nào khác để biết thị trường có chỗ hay không: số liệu trên mạng không trả lời được câu "trung tâm có trả tiền cho cái này không".

---

## 7. Nguồn

**Đối thủ vận hành**
- [Easy Edu, trang chủ](https://easyedu.vn/) · [tính năng](https://easyedu.vn/tinh-nang/)
- [DotB, trang giá](https://dotb.vn/pricing/) · [Flyer: top 10 phần mềm 2026](https://flyer.vn/phan-mem-quan-ly-trung-tam-tieng-anh/)
- [Bado, bảng giá](https://bado.vn/phi-dich-vu/ngoai-ngu-tin-hoc) · [CloudGO: 7 phần mềm 2026](https://cloudgo.vn/top-phan-mem-quan-ly-trung-tam-ngoai-ngu) · [Bizfly: top 10+](https://bizfly.vn/techblog/phan-mem-quan-ly-trung-tam-tieng-anh.html)
- [3 phần mềm CSKH miễn phí (NextCRM, Halozend…)](https://vietnamteachingjobs.com/3-phan-mem-cskh-mien-phi-cho-trung-tam-ngoai-ngu/) · [MISA AMIS giáo dục](https://amis.misa.vn/giai-phap/giao-duc-va-dao-tao/)

**Đối thủ dạy và luyện thi**
- [Selfomy](https://selfomy.com/en/) · [phòng thi ảo IELTS](https://selfomy.com/blog/phong-thi-ao-ielts/) · [top 10 IELTS LMS (bài của Selfomy)](https://selfomy.com/blog/top-10-phan-mem-day-hoc-ielts-lms/)
- [Prep for Business](https://business.prepedu.com/en/) · [Prep Edu (Wikipedia)](https://en.wikipedia.org/wiki/Prep_Edu)
- [Ai4Ielts LMS](https://ai4ielts.center/) · [Edmicro](https://edmicro.edu.vn/edmicro/) · [ELSA cho tổ chức](https://elsaspeak.com/en/enterprise/pricing)
- [IELTS International cho khoa, trung tâm](https://www.ielts.international/vi/for-colleges) · [ECE IELTS LMS](https://ece.edu.vn/en/ece-launches-ai-powered-online-ielts-prep-lms-study-anytime-anywhere/)

**Thị trường và chính sách**
- [EY-Parthenon: thị trường đào tạo tiếng Anh](https://www.ey.com/vi_vn/insights/strategy/thi-truong-dao-tao-tieng-anh-tai-viet-nam-cuoc-dua-chuan-hoa-va-mo-rong-tang-truong)
- [JDI Group: Vietnam EdTech 2025](https://jdi.group/vietnam-edtech-opportunities-for-business/) · [Tracxn: startup học ngôn ngữ ở Việt Nam](https://tracxn.com/d/explore/language-learning-tech-startups-in-vietnam/__wMwop-WPt-UMHbSncXNWPHscFBl18_j9hfWyNIYQwVU)
- [Nhân Dân: bỏ điểm cộng từ 2028](https://nhandan.vn/khong-su-dung-diem-cong-quy-doi-tu-ielts-chung-chi-thanh-tich-trong-tuyen-sinh-tu-nam-2028-post1002368.html) · [Thư viện Pháp luật: quy đổi IELTS từ 2027](https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/bo-diem-cong-ielts-vao-dai-hoc-tu-nam-2027-hay-2028-diem-ielts-con-duoc-quy-doi-khong-tu-2027-301707.html)
- [VnExpress: quy chế tuyển sinh 2026](https://vnexpress.net/quy-che-tuyen-sinh-dai-hoc-nam-2026-cua-bo-giao-duc-va-dao-tao-bo-xet-rieng-hoc-ba-siet-diem-cong-ielts-5041477.html) · [Hà Tĩnh: IELTS chỉ thi trên máy tính](https://hatinh.gov.vn/vi/bai-viet/ielts-chuyen-hoan-toan-sang-thi-tren-may-tinh-tu-giua-nam-2026)
- [Luật Việt Nam: dự thảo sửa Thông tư 29/2024](https://luatvietnam.vn/giao-duc/du-thao-thong-tu-sua-doi-bo-sung-thong-tu-29-2024-tt-bgddt-ve-day-them-hoc-them-421913-d10.html) · [Nghị quyết 71-NQ/TW](https://special.nhandan.vn/politburo-resolution-no-71-nq-tw-on-breakthroughs-in-education-and-training-development/index.html)
- [Tiền Phong: AI cảnh báo sớm sinh viên mất kết nối](https://tienphong.vn/ai-canh-bao-som-khi-sinh-vien-dan-mat-ket-noi-voi-truong-hoc-post1881069.tpo)
