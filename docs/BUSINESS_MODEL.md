# Mô hình kinh doanh Cortex (10/2026)

Bản nháp để bàn. Các con số giá và chi phí là ước tính, chưa kiểm bằng dữ liệu thật. Cập nhật khi có số đo.

## 1. Chi phí vận hành

Theo hướng chuyển hạ tầng: VPS Singapore + Cloudflare + Supabase Pro + LiveKit tự chạy.

| Hạng mục | Giá/tháng |
|---|---|
| VPS web (Singapore, 8GB) | $25–48 |
| VPS LiveKit (Singapore, 4GB) | $12–24 |
| Supabase Pro | $25 |
| Cloudflare, Coolify, UptimeRobot | $0 |
| Gemini (câu tự do, nhận dạng giọng dự phòng) | theo lượng dùng, nhỏ nhờ giọng Kokoro tạo sẵn |
| **Tổng** | **~$60–100 (~1,5–2,5 triệu đồng)** |

Sức chứa ước tính: 20.000–50.000 người học hoạt động mỗi tháng, khoảng 200 cặp thi thử Oratio cùng lúc.

Chi phí gần như cố định. Người dùng tăng thì biên lợi nhuận tăng.

## 2. Người học tự học (B2C): freemium

**Miễn phí, giữ người dùng ở lại:**
- Lexica: học từ hằng ngày (Hiểu, Nhớ, Gặp, Dùng), Album, Bắt gặp, Đọc.
- Luyện nói giới hạn, ví dụ 10 lần mỗi ngày.
- Oratio: 2 buổi thi thử mỗi tuần.

**Cortex Plus: 79.000–99.000đ/tháng, hoặc 599.000–799.000đ/năm:**
- Luyện nói không giới hạn, chấm từng âm, bản đồ âm hay sai, bài luyện tự giao.
- Oratio không giới hạn, có phản hồi sau buổi thi.
- Giọng đọc tốt cho câu tự do, pack Studio mở rộng.
- Sao lưu tiến độ trên nhiều thiết bị.

**Nguyên tắc:**
- Chỉ khoá thứ tốn tiền thật (AI, giọng câu tự do, Oratio) hoặc thứ có giá trị cao (chấm chi tiết).
- Phần học từ cốt lõi luôn miễn phí.
- Khen tiến bộ, không ép mua bằng cách làm phiền.

Để so sánh: ELSA hay Duolingo Super ở Việt Nam khoảng 1–2 triệu đồng mỗi năm.

## 3. Trung tâm và giáo viên (B2B): ra tiền nhanh nhất

Dùng app `teach` sẵn có: lớp học, giao bài từ Lexica, theo dõi tiến độ và âm hay sai, Oratio.

| Gói | Giá | Dành cho |
|---|---|---|
| Giáo viên lẻ | ~199.000đ/tháng, tối đa 30 học viên | Gia sư, giáo viên tự mở lớp |
| Trung tâm | ~30.000–50.000đ/học viên/tháng | Trung tâm IELTS, giao tiếp |
| Trường | Báo giá riêng, theo năm | Giai đoạn sau |

Học viên trong lớp tự động có Plus khi còn ở lớp.

Ví dụ: trung tâm 100 học viên × 40.000đ = 4 triệu đồng/tháng.

## 4. Nguồn thu phụ (sau này)
- Thi thử Speaking với giám khảo thật qua Oratio, ăn chia hoa hồng theo buổi.
- Pack từ vựng chuyên ngành (y khoa, IT, kinh doanh).
- Không chạy quảng cáo.

## 5. Hoà vốn

| Nguồn | Cần để trả ~2,5 triệu/tháng |
|---|---|
| Plus 99.000đ | ~26 người trả tiền |
| Trung tâm 40.000đ/học viên | ~65 học viên |

Tỷ lệ chuyển từ miễn phí sang trả tiền thường khoảng 2–5%. Muốn có 26 người trả tiền thì cần khoảng 500–1.000 người dùng hoạt động.

Hoà vốn ở đây **chưa tính công làm**. Muốn trả lương cho 1 người (~20–30 triệu/tháng) thì cần khoảng 250–300 người trả tiền, hoặc 5–8 trung tâm cỡ 100 học viên.

## 6. Lộ trình
1. **Tháng 1–2:** 2–3 trung tâm dùng thử miễn phí, đổi lại góp ý. Đo tỷ lệ người học quay lại.
2. **Tháng 2–3:**
   - Gói Plus: cờ `plus` trong Supabase, hạn mức miễn phí.
   - Thanh toán PayOS / VietQR (chuyển khoản tự xác nhận). Momo và thẻ làm sau.
3. **Tháng 3–6:** tính tiền các trung tâm thử. Tìm thêm trung tâm qua giáo viên quen. Làm trang giá trên `landing`.
4. **Sau 6 tháng:** quyết định gọi vốn hay tự nuôi (mục 8).

## 7. Số đo cần theo dõi từ bây giờ

| Chỉ số | Ý nghĩa | Mức tốt cho app học |
|---|---|---|
| Quay lại sau 1 ngày / 7 ngày / 30 ngày | Người học có ở lại không | ~40% / ~20% / ~10%+ |
| Người dùng hoạt động ngày / tháng (DAU/MAU) | Mức độ dùng thường xuyên | 20%+ |
| Tỷ lệ chuyển sang trả tiền | Sẵn sàng chi tiền | 2–5% |
| Doanh thu định kỳ hằng tháng (MRR) và tăng trưởng mỗi tháng | Số nhà đầu tư nhìn đầu tiên | Tăng 10–20%/tháng |
| Tỷ lệ huỷ mỗi tháng (churn) | Giữ khách | < 5–8% (B2C), < 2–3% (B2B) |
| Trung tâm gia hạn | B2B có giá trị thật không | Càng gần 100% càng tốt |

PostHog đã có trong Lexica. Cần thống nhất sự kiện và làm một bảng số liệu riêng.

## 8. Có bán hoặc gọi vốn được không?

### Điểm mạnh
- **Thị trường:** học tiếng Anh ở Việt Nam lớn, người học và phụ huynh sẵn sàng chi. Thị trường IELTS đặc biệt sôi động.
- **Hệ sinh thái chứ không phải một app:**
  - học từ (Lexica);
  - luyện nói với bạn (Oratio);
  - công cụ cho giáo viên (teach);
  - công cụ biên tập (Studio).
  
  Đối thủ thường chỉ làm một mảng.
- **Phần B2B:**
  - doanh thu ổn định, có hợp đồng;
  - trung tâm khó bỏ khi lớp đã chạy trên hệ thống;
  - nhà đầu tư thích kiểu doanh thu này hơn B2C.
- **Công nghệ:**
  - chấm phát âm chạy trên máy, có thư viện lỗi riêng cho giọng Việt;
  - giọng đọc tạo sẵn nên chi phí AI thấp.
  
  Biên lợi nhuận cao hơn các đối thủ phụ thuộc API AI.
- **Dữ liệu:** bộ ghi âm giọng Việt cùng sổ âm hay sai, ít ai có.

### Điểm yếu (nhà đầu tư sẽ hỏi)
- **Đội ngũ:** gần như một người. Quỹ đầu tư vào đội trước tiên, nên cần ít nhất một đồng sáng lập lo kinh doanh hoặc nội dung.
- **Cạnh tranh:** ELSA đã gọi được vốn lớn, Duolingo miễn phí, và hàng loạt app IELTS. Phải nói rõ vì sao Cortex khác: học từ đi kèm luyện nói, có giáo viên đi cùng.
- **Chưa có số liệu:** ở giai đoạn này, ý tưởng và code gần như không có giá. Cái được định giá là số người dùng, tỷ lệ ở lại và doanh thu.
- **Phụ thuộc:** Supabase, Gemini. Cần cho thấy có thể thay thế khi cần.

### Gọi vốn: các mốc thường gặp

Tham khảo thị trường Việt Nam và Đông Nam Á, có thể đã thay đổi.

| Vòng | Thường cần có | Số tiền thường gặp |
|---|---|---|
| Vườn ươm / accelerator (Antler, ThinkZone, VIISA, Do Ventures' programs, Startup Wheel, các chương trình của trường, Google for Startups) | Sản phẩm chạy được, một vài người dùng đầu tiên, đội 1–2 người | $10.000–150.000, đổi 5–10% cổ phần, kèm cố vấn |
| Pre-seed / thiên thần | Người dùng tăng đều, có người trả tiền đầu tiên, vài trung tâm | $100.000–500.000 |
| Seed | Doanh thu định kỳ ~$5.000–20.000/tháng, tăng 10–20%/tháng, tỷ lệ ở lại tốt | $500.000–2 triệu |

Cũng có thể không gọi vốn: các khoản tài trợ không lấy cổ phần, ví dụ đề án hỗ trợ khởi nghiệp đổi mới sáng tạo của nhà nước, quỹ của các trường, cuộc thi khởi nghiệp, credit cloud miễn phí từ AWS, Google, Microsoft cho startup. Credit cloud thường $1.000–100.000, đủ trả hạ tầng nhiều năm.

### Bán công ty (exit)
- **Ai có thể mua:**
  - chuỗi trung tâm tiếng Anh lớn muốn có nền tảng số;
  - công ty edtech trong nước hoặc khu vực;
  - nhà xuất bản giáo dục.
- **Định giá thường gặp:** khoảng **2–5 lần doanh thu năm** với SaaS giáo dục nhỏ, cao hơn nếu tăng nhanh.
  - Ví dụ: doanh thu $100.000/năm, tức khoảng 210 triệu/tháng, thì bán được khoảng $200.000–500.000.
- **Bán sớm khi chưa có doanh thu:** chỉ bán được như "mua code và người", giá thấp. Không nên.

### Kết luận
- **Có thể**, nhưng cần **6–12 tháng có số liệu thật** trước khi nói chuyện gọi vốn nghiêm túc.
- **Hướng thực tế nhất:**
  1. Đi theo B2B trung tâm để có doanh thu sớm.
  2. Song song xin credit cloud và vào một chương trình vườn ươm. Không mất nhiều cổ phần mà có cố vấn và mạng lưới.
  3. Khi có khoảng **5–10 trung tâm trả tiền, MRR khoảng 50–100 triệu/tháng, tăng đều**, thì gọi vòng pre-seed.
- **Chuẩn bị ngay:**
  - lập công ty (TNHH) để nhận tiền và ký hợp đồng với trung tâm;
  - giữ quyền sở hữu code và nội dung rõ ràng;
  - kiểm tra giấy phép của thư viện và mô hình đang dùng (Kokoro Apache-2.0, phần phonemizer GPL; whisper phoneme MIT; CMU dict);
  - viết chính sách riêng tư, vì có dữ liệu giọng nói và trẻ vị thành niên.

## Việc kỹ thuật kèm theo (khi chốt)
- Cờ `plus` và hạn mức miễn phí (Supabase, security definer function).
- Webhook PayOS để bật hoặc tắt Plus.
- Gói trung tâm: số ghế theo lớp, học viên trong lớp tự có Plus.
- Bảng số liệu: retention, chuyển đổi, MRR (PostHog cùng một view trong Supabase).
- Trang giá trên `landing`.
