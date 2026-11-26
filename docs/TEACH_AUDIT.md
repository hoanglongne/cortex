# Đánh giá khắt khe Teach hiện tại (26/11/2026)

Dựa trên mã, SQL và test đang có. **Chưa có người dùng thật nào**, và tôi không chạy Teach với dữ liệu thật hay trên Supabase thật, nên chất lượng giao diện chỉ đánh giá qua mã, không qua trải nghiệm. Mỗi phát hiện ghi cách kiểm.

## Kết luận một dòng
Teach là một **công cụ dạy tốt cho giáo viên có học viên đang dùng Lexica**. Nó **chưa là sản phẩm** cho trung tâm mới: không có danh sách học viên của riêng trung tâm, không thu được tiền, không báo cho giáo viên khi không mở app, không có ai để hỏi khi lỗi, và không một điều nào về dự báo hay độ an toàn dữ liệu đã được kiểm bằng dữ liệu thật.

## Nghiêm trọng (chặn việc bán)
1. **Giá trị phụ thuộc hành vi học viên mà trung tâm không kiểm soát.** Bảng lớp, dự báo, báo cáo phụ huynh đều là số do app học (Lexica) gửi về. Học viên không dùng Lexica thì Teach trống. Điểm danh và kiểm tra là phần duy nhất không cần app. *Kiểm:* `packages/classroom` chỉ có `report()` và `metrics` làm nguồn dữ liệu học.
2. **Không có "học viên do trung tâm tạo".** Học viên chỉ tồn tại sau khi tự có tài khoản và nhập mã lớp. Không thêm được em nhỏ không có điện thoại, không nhập danh sách, không chuyển lớp. Mọi phần mềm trung tâm đều có chỗ này. *Kiểm:* không có chức năng "Thêm học viên" trong `apps/teach`.
3. **Không thu được tiền.** Gói miễn phí 30 chỗ không có đường nâng cấp, không đếm gói, không khoá. Self-signup tôi vừa thêm chỉ đặt `seats = 30` (mặc định) và để quản trị tự chỉnh tay bằng SQL.
4. **Dự báo là phỏng đoán chưa kiểm.** `THRESHOLDS` (ví dụ 5 ngày nghỉ liên tiếp, 5 từ quá hạn) do mình chọn; không có nhật ký dự báo (`forecast_log` ghi trong kế hoạch nhưng không tồn tại) để đối chiếu với kết quả thật. Hiện cho giáo viên thấy lời khuyên có thể sai, mất tin tưởng sớm. Đây cũng là "khác biệt" tôi đã nêu ở phần nghiên cứu thị trường.
5. **Không giám sát lỗi trong Teach.** Lexica có báo lỗi, Teach không. Một người vận hành không có kênh hỗ trợ sẽ không biết giáo viên đang gặp lỗi gì. *Kiểm:* không có Sentry hay `errorReport` trong `apps/teach`.
6. **Triển khai SQL bằng tay trên Supabase dùng chung cả Lexica, Oratio, Cortex API.** Một file `teach_all.sql` dán vào SQL Editor, không đánh số phiên bản, không hoàn tác, không môi trường thử. Một lần chạy sai là sập cả ba app. *Kiểm:* `supabase/build-restore.sh`.

## Nặng
7. **Không có test SQL nào được lưu trong repo.** Có khoảng 80 hàm `security definer` (31 trong lõi, 15 Đấu trường, 11 kiểm tra, 8 buổi học thử...). Quyền truy cập do từng hàm tự kiểm; đã thử tay trên Postgres tạm cho phần tôi viết (đăng ký, buổi học thử, xoá tài khoản) nhưng **các thử đó không nằm trong repo**. 100 test của Teach đều là luật thuần, không phủ quyền dữ liệu. Một hàm sót kiểm quyền là lộ dữ liệu học viên (có thể là trẻ em).
8. **Không có trang riêng tư hay điều khoản của Teach.** Teach thu email giáo viên, tên, ghi chú về học viên, và (từ buổi học thử) số điện thoại. Chỉ `/privacy` của Lexica nói về dữ liệu. Trung tâm là bên kiểm soát dữ liệu theo Nghị định 13, cần điều khoản rõ. *Kiểm:* không có `privacy`/`terms` trong `apps/teach/app`.
9. **Không xuất Excel**, dù kế hoạch đã ghi. Trung tâm sợ bị khoá dữ liệu.
10. **Mọi thứ cần mở app.** Không email hay tin nhắn nhắc giáo viên; báo cáo phụ huynh vẫn do giáo viên bấm "Chép link gửi Zalo" từng em. Với một người vận hành khách là trung tâm nhỏ, việc thủ công này là chỗ khách bỏ.
11. **Phanh tạo trung tâm 200/ngày là toàn cục:** một kẻ gửi bậy làm đầy hạn mức thì người thật không đăng ký được trong ngày. (Lỗi của tôi.)
12. **Tôi gửi `?welcome=1` sau khi đăng ký nhưng trang Hôm nay không đọc nó.** Người mới vào thấy trang trống chung chung thay vì lời chào và hướng dẫn. (Lỗi của tôi, kiểm bằng `grep welcome`.)

## Vừa
13. **Tải dữ liệu:** `loadTeaching()` gọi `classroom_class_board` cho **mọi lớp** của giáo viên song song, mỗi lần mở app. Giáo viên 15 lớp thì 15 yêu cầu nặng. Chưa đo, nhưng không có phân trang hay tải theo nhu cầu.
14. **11 chỗ dùng `window.confirm`:** xấu và khó dùng trong trình duyệt nhúng của Zalo.
15. **Truy cập (a11y):** khoảng 83 thuộc tính `aria-` trên khoảng 7.700 dòng giao diện, chưa kiểm bằng công cụ. Chưa có e2e hay chụp ảnh tự động cho Teach (Lexica có).
16. **Giao diện chưa kiểm bằng mắt trong đánh giá này.** Các ảnh trước (Hôm nay, trang một em, phụ huynh) chụp với dữ liệu giả ở tháng 10.
17. **Ba app gắn vào lớp nhưng chỉ Lexica sâu.** Oratio và Synapse là mô-đun mỏng; Writing có nộp bài nhưng chưa có AI chấm. Đừng quảng cáo "nhiều app" khi chưa đủ.

## Cái làm tốt (để công bằng)
- **Lõi tách mô-đun sạch:** hợp đồng `ClassroomModuleCore` rõ, luật thuần tách khỏi SQL và React, `parse*` không bao giờ throw.
- **Riêng tư theo thiết kế ở phần học:** chỉ gửi con số, không gửi nội dung học viên tạo ra; phụ huynh chỉ thấy báo cáo đã duyệt; PIN và khoá sau 5 lần sai.
- **Mọi bảng bật RLS, không policy, chỉ đi qua hàm.** Mô hình đúng, chỉ thiếu test.
- **Phần dạy thật dùng được:** trình chiếu từ, gọi tên, chia nhóm, Đấu trường có khách.
- **Không tốn AI**, nên mở rộng rẻ.

## Thứ tự sửa tôi đề nghị (nếu đi tiếp theo hướng trung tâm mới)
1. **Học viên do trung tâm tạo + nhập Excel** (chặn việc 2, 9).
2. **Giám sát lỗi cho Teach** (việc 5) và **test SQL tự động vào repo** (việc 7): hai việc nhỏ, rủi ro lớn.
3. **Trang điều khoản và riêng tư của Teach** (việc 8).
4. **Nhật ký dự báo** để kiểm ngưỡng bằng dữ liệu thật (việc 4); trong lúc chưa có, ghi rõ "đang thử" trên giao diện.
5. **Quy trình SQL an toàn hơn** (việc 6): ít nhất một dự án Supabase thử.
6. Sửa lỗi của tôi (việc 11, 12), rồi mới tới thanh toán (việc 3).
