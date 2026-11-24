# Teach thay LMS của trung tâm: phân tích và kế hoạch (issue #77, 24/11/2026)

> **Tạm dừng (24/11/2026):** sau khi nghiên cứu đối thủ (`TEACH_MARKET_RESEARCH.md`), không làm theo lộ trình L0–L6 dưới đây cho tới khi kiểm chứng xong. Giữ lại phần kiểm kê hiện trạng (mục 1) và thiết kế bật tắt (mục 3) để dùng sau.

Bản để bàn. Viết từ mã hiện có (`packages/classroom`, `apps/teach`) và các tài liệu `TEACH_PLAN.md`, `ECOSYSTEM_STRATEGY.md`, `BUSINESS_MODEL.md`, `CLASSROOM.md`. **Chưa có trung tâm nào dùng thật**, nên mọi thứ về nhu cầu và giá là giả thuyết.

---

## 0. Tóm tắt

1. **Teach hôm nay là công cụ dạy và theo dõi việc học**, rất mạnh ở phần đó (số liệu học thật, dự báo, Đấu trường, báo cáo phụ huynh). Các phần mềm quản lý trung tâm ở Việt Nam (Easy Edu, NextCRM, Halozend, MISA AMIS…) thì ngược lại: mạnh ở **vận hành** (học phí, công nợ, xếp lịch, chuyển lớp, bảo lưu, chăm sóc khách), yếu ở việc học.
2. **"Thay hẳn LMS" ngay từ đầu là sai thứ tự.** Phần vận hành là phần đối thủ đã làm tốt nhiều năm, tốn công và nhiều rủi ro (tiền, hoá đơn, số liệu sai). Làm hết rồi mới bán thì quá lâu cho một đội một người.
3. **Có một chỗ chặn gốc mà phải sửa trước mọi thứ:** hiện học viên chỉ tồn tại khi đã **tự tạo tài khoản và tự vào lớp bằng mã**. Trung tâm thì ghi danh học viên trước (tên, số điện thoại, phụ huynh), nhiều em nhỏ không có email, có em không dùng app. Không có **hồ sơ học viên do trung tâm tạo** thì không làm được học phí, điểm danh đủ lớp, chuyển lớp, hay nhập dữ liệu từ hệ thống cũ.
4. **Hệ mô-đun hiện chỉ có một loại:** mô-đun **app học** (Lexica, Oratio, Synapse cắm vào lớp). Các phần như điểm danh, phụ huynh, kiểm tra, Đấu trường, học phí không phải app học, mà là **tính năng của trung tâm**. Cần thêm loại mô-đun thứ hai, bật tắt theo trung tâm và theo gói.
5. **Đề xuất:** đi theo bậc thang, mỗi bậc bán được, bắt đầu từ chỗ khác biệt: **"lớp học có số liệu học thật" + vận hành vừa đủ quanh lớp**, và xuất Excel để trung tâm giữ phần mềm học phí cũ. Học phí và CRM làm sau, khi có trung tâm trả tiền đòi hỏi.

---

## 1. Việc hằng ngày của trung tâm, và Teach đã có gì

Ký hiệu: ✅ có · ◐ có một phần · ✗ chưa có.

| Nhóm | Việc | Teach | Ở đâu / còn thiếu |
|---|---|---|---|
| **Học viên** | Ghi danh (nhập học viên trước khi có tài khoản) | ✗ | Chỉ có "tự vào lớp bằng mã" (`/join?code=`). Không có hồ sơ học viên của trung tâm |
| | Hồ sơ: số điện thoại, ngày sinh, phụ huynh, ghi chú | ◐ | Có tên hiển thị và ghi chú theo lớp (`cortex_class_members`). Không có hồ sơ chung của trung tâm |
| | Chuyển lớp, bảo lưu, nghỉ học | ✗ | Chỉ xoá khỏi lớp |
| | Nhập từ Excel / LMS cũ | ✗ | |
| **Lớp và lịch** | Tạo lớp, giáo viên phụ trách | ✅ | `cortex_classes` |
| | Khoá học / học kỳ (nhiều lớp cùng một chương trình) | ✗ | |
| | Lịch học lặp lại, buổi học, huỷ buổi | ✅ | `schedule`, `cortex_class_sessions` |
| | Phòng học, trùng lịch giáo viên/phòng | ✗ | |
| | Lịch tổng của trung tâm | ✗ | Chỉ xem theo lớp |
| **Điểm danh** | Điểm danh có mặt / muộn / vắng / có phép | ✅ | `cortex_attendance`, tab Buổi học |
| | Báo vắng cho phụ huynh | ◐ | Có trong báo cáo tuần, chưa báo ngay trong ngày |
| | Công giáo viên (số buổi dạy để tính lương) | ✗ | Có dữ liệu buổi học, chưa tổng hợp |
| **Học tập** | Giao bài, theo dõi tiến độ | ✅ | Bài giao theo mô-đun app |
| | Bài kiểm tra lớp | ◐ | `cortex_class_tests`: chỉ từ vựng |
| | Writing: nộp bài, giáo viên chấm | ◐ | `cortex_writing_submissions`; chưa có AI chấm sơ bộ (#64) |
| | Thi thử 4 kỹ năng | ✗ | Oratio có Speaking; thiếu Listening/Reading |
| | Bảng điểm, nhận xét cuối khoá | ✗ | |
| | Chứng nhận hoàn thành | ✗ | |
| **Phụ huynh** | Cổng phụ huynh, báo cáo tuần | ✅ | `/p/<mã>`, PIN, duyệt báo cáo |
| | Thông báo (lịch, nghỉ, học phí) | ✗ | Chỉ chép link gửi Zalo |
| **Tiền** | Gói học phí, thu tiền, phiếu thu | ✗ | |
| | Công nợ, nhắc đóng phí | ✗ | |
| | Hoá đơn điện tử | ✗ | Thường nằm ở phần mềm kế toán, không nên làm |
| **Kinh doanh** | Khách tiềm năng, lịch hẹn test đầu vào | ✗ | Có bài kiểm tra xếp lớp trong Lexica (`/test`) |
| | Báo cáo kinh doanh (sĩ số, doanh thu, tỉ lệ ở lại) | ◐ | Trang Trung tâm: số lớp, chỗ dùng |
| **Nhân sự** | Mời giáo viên, phân quyền | ◐ | Hai vai trò: quản lý, giáo viên. Thiếu vai trò **giáo vụ / tư vấn / kế toán** |
| **Tài liệu** | Tài liệu bài giảng, file | ✗ | Có trình chiếu từ của bài (`/present`) |
| **Dự báo** | Ai sắp bỏ học, ai sắp quên, điểm cuối khoá | ✅ | W4 (`forecast.ts`). Đối thủ không có |
| **Hoạt động lớp** | Quiz trực tiếp | ✅ | Đấu trường (T2) |
| **Xuất dữ liệu** | Xuất Excel | ✗ | |

**Đọc bảng này:** phần "học" gần như đủ và hơn đối thủ. Phần "vận hành" gần như trống. Đó là chỗ trung tâm quyết định có đổi phần mềm hay không.

---

## 2. Lõi và mô-đun bật tắt

### 2.1 Hai loại mô-đun

| Loại | Là gì | Ví dụ | Đã có |
|---|---|---|---|
| **Mô-đun app** | Một app học cắm vào lớp: giao bài, báo số liệu | Lexica, Oratio, Synapse | ✅ Hợp đồng `ClassroomModuleCore` |
| **Mô-đun tính năng** (mới) | Một phần của trung tâm, bật tắt theo trung tâm (và gói giá) | Học phí, Phòng học, Thi thử, Writing, CRM | ✗ Cần thêm |

Hai loại khác nhau ở chỗ mô-đun app gắn vào **lớp** (`cortex_classes.apps`), còn mô-đun tính năng gắn vào **trung tâm**.

### 2.2 Chia lõi và mô-đun

**Lõi (luôn có, mọi gói):**
- Trung tâm, nhân sự, vai trò, lời mời.
- **Hồ sơ học viên của trung tâm** (mới, xem 4.1) và ghi danh vào lớp.
- Lớp, lịch, buổi học, điểm danh.
- Bài giao, bảng tiến độ, Hôm nay.
- Cổng phụ huynh và báo cáo tuần (đã khen được, là lý do giữ trung tâm).
- Xuất Excel.

**Mô-đun tính năng (bật tắt):**

| Mô-đun | Mặc định | Ghi chú |
|---|---|---|
| Dự báo (W4) | bật | Đã có; chỉ cần công tắc |
| Đấu trường | bật | Đã có |
| Kiểm tra lớp | bật | Đã có |
| Writing (nộp bài, chấm) | tắt | Có một phần; cần đồng ý riêng tư (#64) |
| Khoá học và phòng | tắt | Trung tâm nhỏ không cần |
| Học phí | tắt | Nhiều trung tâm giữ phần mềm cũ |
| Thông báo (email, Zalo) | tắt | Zalo tốn phí, cần đăng ký doanh nghiệp |
| Thi thử 4 kỹ năng | tắt | Cần nội dung Listening/Reading |
| Bảng điểm và chứng nhận | tắt | |
| Khách tiềm năng (CRM nhẹ) | tắt | Làm sau cùng |

---

## 3. Thiết kế bật tắt

### 3.1 Dữ liệu
```
cortex_orgs.plan          text   -- 'free' | 'teacher' | 'center' | 'school'
cortex_org_features       (org_id, feature, enabled bool, settings jsonb, updated_by, updated_at)
cortex_features           (id, name)  -- danh mục, như cortex_apps
```
- Một tính năng **bật được** khi gói cho phép (bảng nhỏ trong mã: gói nào có tính năng nào). Quản lý trung tâm tự bật tắt trong phạm vi đó.
- Lớp **không** có công tắc riêng ở giai đoạn đầu (ít nhầm hơn). Thêm sau nếu thật cần.
- Giáo viên lẻ (`cortex_staff.role = 'indie'`) được coi là một trung tâm một người, để không có hai đường mã.

### 3.2 Hợp đồng mô-đun tính năng
Giống mô-đun app, theo đúng luật của `CLASSROOM.md`:
- **SQL** `packages/classroom/sql/feature_<id>.sql`: bảng riêng `cortex_<id>_*`, hàm `classroom_<id>_*` (security definer). **Mọi hàm kiểm `classroom_feature_on(org, '<id>')` trước khi làm**, vì giao diện ẩn nút không phải là bảo vệ.
- **Gói thuần** (luật, parse, không React): trong `packages/classroom` hoặc gói riêng nếu lớn (học phí).
- **Màn hình**: `apps/teach/app/features/<id>/`, đăng ký trong `FEATURES` (giống `MODULES`): mục menu, tab trong lớp, ô trong trang học viên. Tính năng tắt thì không hiện gì.
- Tắt một tính năng **không xoá dữ liệu**; bật lại thấy như cũ.

### 3.3 Gói giá (nối với `BUSINESS_MODEL.md` mục 3)

| Gói | Giá đang nghĩ | Có |
|---|---|---|
| Giáo viên lẻ | ~199.000đ/tháng, 30 học viên | Lõi + Dự báo, Đấu trường, Kiểm tra |
| Trung tâm | ~30.000–50.000đ/học viên/tháng | Thêm Writing, Khoá và phòng, Thông báo, Bảng điểm |
| Trung tâm + vận hành | thêm ~10.000đ/học viên hoặc phí cố định | Thêm Học phí, CRM |
| Trường | báo giá | Tất cả |

Giá vẫn là ước tính. Điều cần kiểm khi nói chuyện với trung tâm: họ trả bao nhiêu cho phần mềm hiện tại, và có chịu trả **thêm** cho phần học không.

---

## 4. Lộ trình: mỗi bậc bán được một thứ

| Bậc | Làm gì | Bán được câu gì | Ước tính* | Xong khi |
|---|---|---|---|---|
| **L0. Hồ sơ học viên** | Bảng `cortex_students` của trung tâm (tên, SĐT, ngày sinh, phụ huynh), ghi danh vào lớp **không cần tài khoản**; nối với tài khoản khi em vào app (mã mời riêng từng em); nhập Excel theo mẫu; xuất Excel. Điểm danh, báo cáo phụ huynh chạy cả với em chưa có tài khoản | "Đưa cả trung tâm vào trong 30 phút từ file Excel" | 2–3 tuần | Một trung tâm nhập 100 em từ Excel, điểm danh được em không dùng app |
| **L1. Công tắc tính năng + vai trò** | `cortex_org_features`, `plan`, `FEATURES`; thêm vai trò **giáo vụ** (ghi danh, điểm danh, không sửa bài); các tính năng đã có thành mô-đun bật tắt | "Chỉ trả cho cái mình dùng" | 1–2 tuần | Bật tắt được, kiểm ở SQL, có test |
| **L2. Lịch trung tâm** | Khoá học (nhóm lớp), phòng, lịch tổng theo tuần, báo trùng giáo viên/phòng, chuyển lớp và bảo lưu, **công giáo viên** (số buổi dạy theo tháng, xuất Excel) | "Xếp lịch và tính công giáo viên ở một chỗ" | 3–4 tuần | Một trung tâm xếp lịch tháng mà không cần file riêng |
| **L3. Kết quả học** | Bảng điểm cuối khoá (gộp kiểm tra lớp, Writing, Speaking Oratio, chuyên cần), nhận xét giáo viên, phiếu PDF; chứng nhận hoàn thành | "Phiếu kết quả có số liệu học thật để gửi phụ huynh" | 2–3 tuần | Phụ huynh nhận phiếu cuối khoá |
| **L4. Học phí nhẹ** | Gói học phí theo khoá/tháng/buổi, ghi nhận đã thu (tiền mặt, chuyển khoản), công nợ, nhắc phí, **mã VietQR** cho phụ huynh, phiếu thu (không phải hoá đơn điện tử), xuất Excel cho kế toán | "Biết ai còn nợ, nhắc phụ huynh bằng một nút" | 4–6 tuần | Một trung tâm dùng một tháng, số tiền khớp sổ của họ |
| **L5. Thông báo** | Báo vắng trong ngày, nhắc lịch, nhắc phí qua email trước; Zalo (ZNS/OA) khi có trung tâm đòi và chịu phí | "Phụ huynh biết con vắng ngay" | 2 tuần (email), Zalo tuỳ | |
| **L6. Thi thử, CRM** | Thi thử 4 kỹ năng (ECOSYSTEM mục 3, ưu tiên 2); khách tiềm năng, hẹn test đầu vào bằng bài xếp lớp của Lexica | "Từ khách tiềm năng đến lớp trong một hệ thống" | lớn | Chỉ làm khi bậc trước có khách trả tiền |

\* Ước tính của mình, cho một người làm toàn thời gian, chưa tính thời gian thử với trung tâm.

**Thứ tự này có lý do:**
- L0 là nền: mọi bậc sau (công nợ, chuyển lớp, phiếu điểm) đều cần hồ sơ học viên không phụ thuộc tài khoản.
- L1 rẻ và cần trước khi có nhiều tính năng.
- L2, L3 dựa trên thứ đã có (buổi học, điểm danh, kiểm tra, Oratio), nên nhanh và khác biệt.
- L4 (tiền) để sau vì rủi ro cao nhất và trung tâm thường đã có cách thu phí. Trong lúc chờ, **xuất Excel** cho phép họ giữ phần mềm học phí cũ.

---

## 5. Khác biệt so với LMS thường

1. **Số liệu học thật, không phải tự khai:** học viên học từ, nói, chơi trong app; giáo viên thấy em nhớ được bao nhiêu từ, hay sai âm nào. LMS thường chỉ có điểm danh và điểm do giáo viên nhập.
2. **Dự báo:** ai sắp bỏ học, ai sắp quên, điểm cuối khoá (dạng khoảng). Đây là thứ giúp trung tâm **giữ học viên**, tức giữ tiền.
3. **Nội dung đi kèm:** bộ từ IELTS và giao tiếp, Đấu trường, luyện nói Oratio, Writing. LMS thường bán vỏ, trung tâm tự lo nội dung.
4. **Phụ huynh thấy việc học, không chỉ thấy học phí:** báo cáo tuần viết cho người không rành tiếng Anh.
5. **Giáo viên dùng hằng ngày vì nó giúp dạy** (trình chiếu từ, gọi tên, chia nhóm), không chỉ vì quản lý bắt.

**Cách nói khi bán:** không nói "thay LMS của anh chị". Nói "giữ phần mềm học phí của anh chị, thêm cái này để học viên học thật và ở lại lâu hơn", rồi kéo dần phần vận hành vào khi họ đã quen.

---

## 6. Rủi ro

| Rủi ro | Mức | Giảm bằng |
|---|---|---|
| **Làm vận hành mà chưa ai đòi.** Không có trung tâm thật, dễ làm sai thứ | Cao | Mỗi bậc cần một trung tâm đã nói "có, sẽ dùng" trước khi làm. L0 và L1 vẫn đáng làm vì cần cho mọi trường hợp |
| **Đối thủ vận hành rẻ và chín** (có cả bản miễn phí như NextCRM) | Cao | Không cạnh tranh giá phần vận hành; bán phần học, vận hành là đi kèm |
| **Di chuyển từ LMS cũ:** danh sách học viên, lớp, công nợ dở | Cao | Mẫu Excel nhập có kiểm lỗi từng dòng, chạy thử không ghi, nhập lại không trùng; mình làm hộ lần đầu |
| **Tiền sai là mất khách.** Học phí, công nợ, hoàn phí | Cao | Để L4 sau; ghi sổ chỉ thêm không sửa (bút toán điều chỉnh), có nhật ký ai sửa gì; không làm hoá đơn điện tử, xuất cho phần mềm kế toán |
| **Dữ liệu trẻ em** (Nghị định 13/2023): hồ sơ học viên có SĐT, ngày sinh, phụ huynh | Trung bình | Chỉ trường cần thiết; quyền xem theo vai trò; trung tâm là bên kiểm soát dữ liệu, ghi trong điều khoản; xoá khi trung tâm yêu cầu |
| **Hai loại học viên** (có tài khoản và chưa có) làm mã phức tạp | Trung bình | Một bảng hồ sơ là gốc; tài khoản chỉ là liên kết tuỳ chọn; mọi bảng mới trỏ tới hồ sơ, không trỏ thẳng tài khoản |
| **Phụ thuộc Zalo** cho thông báo | Trung bình | Email và link chép trước; Zalo khi có khách trả phí |
| **Hỗ trợ khách:** trung tâm cần người trả lời trong giờ làm việc | Trung bình | Trang hướng dẫn, mẫu Excel, kênh Zalo hỗ trợ; tính chi phí hỗ trợ vào giá |
| **Đội một người dàn mỏng** giữa Lexica, Oratio, Synapse, app điện thoại, Teach | Cao | Chọn một hướng mỗi quý; ECOSYSTEM đã cảnh báo "đừng làm nhiều app cùng lúc khi chưa có người dùng" |

---

## 7. Cần bạn quyết

1. **Khách đầu tiên là ai?** Trung tâm IELTS nhỏ (50–300 học viên, 1–2 cơ sở) hay chuỗi lớn? Mình đề nghị trung tâm nhỏ: ít đòi hỏi vận hành, chủ trung tâm thường là giáo viên, quan tâm chất lượng học.
2. **Học phí có nằm trong phạm vi không?** Nếu "không bao giờ", L4 bỏ, chỉ xuất Excel. Nếu "có", vẫn để sau L3.
3. **Bắt đầu L0 ngay** (hồ sơ học viên không cần tài khoản), hay đợi nói chuyện với một trung tâm trước?

## 8. Nguồn tham khảo về đối thủ
- [Easy Edu](https://fptshop.com.vn/tin-tuc/giai-tri/phan-mem-easy-edu-192476): nhắc học phí, điểm danh tự động, thi trực tuyến.
- [NextCRM, Halozend…](https://vietnamteachingjobs.com/3-phan-mem-cskh-mien-phi-cho-trung-tam-ngoai-ngu/): điểm danh, chuyển lớp, bảo lưu, thu chi, công nợ.
- [MISA AMIS giáo dục](https://amis.misa.vn/giai-phap/giao-duc-va-dao-tao/): học viên, phụ huynh, lớp, khoá học.

Chưa có bảng giá của đối thủ: phải hỏi trực tiếp.
