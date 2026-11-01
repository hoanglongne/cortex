# Buddy: làm lại để bạn bè thật sự gắn với nhau (31/10/2026)

Liên quan: issue #100. Buddy hiện có: kết bạn bằng mã mời (tối đa 5 bạn), tuần học 7 ngày của nhau, bảng "Tuần này", chuỗi đôi, cổ vũ (lửa, vỗ tay, cơ bắp), thách đấu bằng từ vựng, Từ nói dối và Thám tử, vòng mục tiêu cả nhóm. Bạn thấy nó "chán và thiếu cái gì đó nối bạn bè". Tài liệu này tìm ra cái thiếu đó, đánh giá các hướng, chọn ra vài hướng và xếp thứ tự.

Mọi nhận định về Buddy hiện tại mình đã đối chiếu code (`lib/buddy.ts`, `migration_buddy_cheers.sql`, `migration_duels.sql`). Các nhận định về thói quen người dùng là **giả thuyết**, chưa có số liệu thật.

## 1. Chẩn đoán: vì sao Buddy chán

Hôm nay Buddy là **một bảng điểm**. Hai người nhìn số của nhau (số từ, ngày học, chuỗi) rồi thôi. Phần "làm cùng nhau" duy nhất là thách đấu, mà đó cũng là hai người chơi riêng rồi so điểm.

| Thiếu | Biểu hiện hôm nay | Cái cần |
|---|---|---|
| **Phụ thuộc lẫn nhau** | Việc của mình không đổi gì với bạn, trừ chuỗi đôi | Có thứ mình làm thì bạn **nhận được** hoặc **cần** |
| **Một thứ chung** | Mỗi người một hồ sơ, vòng cả nhóm chỉ là số | Một vật chung cùng làm: nhiệm vụ, sưu tập |
| **Cùng lúc** | Mọi thứ bất đồng bộ, không có "cùng học tối nay" | Thói quen hẹn giờ, cảm giác "đang cùng nhau" |
| **Thấy bạn học cái gì** | Chỉ thấy số từ, không thấy **những từ nào** | Nội dung, thứ gợi tò mò và chuyện để nói |
| **Cho đi** | Cổ vũ một chạm (3 biểu tượng) | Món quà có chút công sức, mang tên mình |
| **Thua thắng chung** | Bảng xếp hạng cá nhân | Cùng thắng hoặc cùng thua |

Bài học từ các app khác (đối chiếu, không sao chép): Duolingo giữ người dùng bằng chuỗi và bảng xếp hạng nhưng bạn bè chỉ là phụ; Habitica có **nhiệm vụ cả nhóm cùng đánh một con quái** (thua thì cả nhóm mất); Forest có **cùng trồng cây**, ai bỏ giữa chừng cây chết; Strava có "kudos" nhưng là chuyện khen sau khi làm xong. Điểm chung của cái giữ được người dùng là **ràng buộc hai chiều** (mình bỏ thì bạn mất) và **vật chung**.

## 2. Nguyên tắc thiết kế cho Buddy mới

1. **Hai chiều:** mỗi tính năng phải có phần người này làm, người kia nhận hoặc cần làm theo.
2. **Từ, không chỉ số:** thứ bạn bè trao nhau là từ và câu đố, vì Lexica là app từ vựng.
3. **Không áp lực quá đà:** thua chung có hậu quả nhẹ (con quái hồi máu, chuỗi tạm dừng) và có lối thoát (khiên tặng nhau), không làm người học thấy tội lỗi.
4. **Chỉ bạn thật, tối đa 5 người:** không người lạ, không bảng xếp hạng công khai.
5. **Quyền riêng tư:** chia sẻ **từ và con số**, không chia sẻ câu mình tự viết, phiên âm hay giọng. Có nút ẩn "từ hôm nay" và nút chặn bạn.
6. **Bắt đầu từ cái đã có:** mỗi bước dùng lại hạ tầng thách đấu, boss, cổ vũ, Đấu trường đã làm.

## 3. Các hướng: đánh giá

Cột "SQL" ghi có cần bảng mới không (bạn chạy `teach_all.sql` một lần là đủ, mình thêm vào danh sách file).

| # | Ý | Cái nó cho | Công sức | SQL | Rủi ro |
|---|---|---|---|---|---|
| **B** | **"Hôm nay bạn học gì":** dòng thấy những **từ** bạn học hôm nay, bấm "mình cũng học" (thêm vào hàng học của mình) hoặc "đố mình" | Thấy nội dung, tò mò, chuyện để nói; **nguyên liệu cho C và I** | S–M | `lexica_buddy_words` (người, ngày, danh sách từ) | Quyền riêng tư: chỉ từ chung trong kho, có nút ẩn |
| **I** | **Tặng từ:** chọn một từ hay trong những từ mình đã học, gửi bạn kèm một dòng ngắn (≤ 60 chữ); bạn nhận, thêm vào học với nhãn "Từ Hà tặng" | Cho đi có công sức, mang tên mình; liên kết cảm xúc | S | `lexica_gifts` | Lời nhắn: lọc, chỉ giữa hai bạn đã kết, có chặn |
| **C** | **Đố nhau:** mình chọn 5 từ đưa cho bạn làm (câu hỏi dựng từ bộ từ mình chọn), bạn làm, cả hai thấy điểm, từ sai vào lịch ôn của bạn | Cá nhân hoá ("tớ chọn những từ này cho cậu"), dùng lại hạ tầng thách đấu | S (dùng lại `duel_create`) | Có thể không cần | Thấp |
| **A** | **Nhiệm vụ nhóm theo tuần:** cả nhóm đánh một con quái (tái dùng giao diện Trùm cuối); mỗi từ học, mỗi ván chơi, mỗi ngày đạt mục tiêu của từng người trừ máu; hết tuần nhóm thắng hay thua; phần thưởng nhận diện chung | Mục tiêu chung, phụ thuộc lẫn nhau, thắng thua chung | M | `lexica_quests` (nhóm, tuần, máu); sát thương **tính từ `daily_activity` đã có** nên không thêm theo dõi | Cân bằng độ khó theo số người; nhóm 1 người |
| **G** | **Khiên tặng bạn:** mỗi tuần một khiên, tặng cho bạn để cứu chuỗi đôi hoặc đỡ một ngày trong nhiệm vụ nhóm | Hào phóng, ràng buộc tinh tế, giảm tội lỗi | S–M | `lexica_shields` hoặc cột mới | Cần luật rõ để khỏi bị lạm dụng |
| **E** | **Giờ học chung:** hẹn "20:30 tối nay học cùng"; đến giờ cả hai nhận nhắc; đang học thì bạn thấy "đang học"; cùng xong thì thưởng | Nhịp đồng thời, thói quen | M (bản nhẹ: hẹn giờ + nhắc + đánh dấu cùng xong, không cần thời gian thực) | `lexica_study_dates` | Push trên iPhone yếu; cần PWA |
| **F** | **Chơi cùng thời gian thực:** Nối chuỗi đôi, Hành trình hai người, Mưa từ chia đôi | Cảm giác chơi chung | L | Dùng Realtime kiểu Đấu trường | Cần đủ người cùng lúc; đắt công |
| **D** | **Dạy lại nhau:** nhờ bạn giải thích, bạn gửi câu ví dụ tự nghĩ | Học bằng dạy | M | nội dung do người dùng viết | Nội dung do người dùng, cần kiểm duyệt |
| **H** | **Tên nhóm, mùa giải, ảnh** | Bản sắc nhóm | S | cột tên | Thấp, cần có A trước mới có ý nghĩa |
| **J** | **Cột mốc chung:** "cùng nhau đã học 500 từ" | Kỷ niệm | S | Không | Thấp |

## 4. Chọn: ba hướng, một bước nền

**Bước nền: B ("Hôm nay bạn học gì").** Nó biến Buddy từ bảng số thành thứ có nội dung, và nuôi cả hai hướng sau. Không có nó thì Tặng từ và Đố nhau không có "nguyên liệu" tự nhiên.

**Hướng 1: Tặng từ + Đố nhau (I + C)**, không đồng bộ, cá nhân, rẻ. Lý do chọn: cái bạn bè cần nhất là cảm giác "mình có ý nghĩa với bạn", và việc chọn từ cho bạn thể hiện đúng điều đó. Cả hai đều dùng lại hạ tầng có sẵn. Đây là chỗ khác biệt nhất so với "bảng điểm".

**Hướng 2: Nhiệm vụ nhóm tuần + Khiên (A + G)**, mục tiêu chung và ràng buộc hai chiều. Lý do: đó là cơ chế đã được chứng minh giữ người dùng ở các app có party (Habitica). Sát thương lấy từ dữ liệu đã đồng bộ nên không tốn thêm theo dõi. Khiên làm thua chung bớt nặng nề và thêm một lý do tương tác.

**Hướng 3: Giờ học chung (E, bản nhẹ)**, tạo thói quen cùng lúc. Làm sau khi có hướng 1 và 2, vì nhắc nhở chỉ có giá trị khi đã có việc để làm cùng.

**Để sau, sau khi đo:** F (chơi thời gian thực) chỉ làm khi thấy bạn bè hay vào Buddy cùng lúc; D (dạy lại nhau) và H (tên nhóm) làm khi có kiểm duyệt và đã có hướng 2.

## 5. Lộ trình

| Bước | Việc | Xong khi | Công sức |
|---|---|---|---|
| **0. Đo hiện trạng** | Gửi sự kiện cho Buddy hiện có (thêm bạn, cổ vũ, thách đấu, nhắc); xem trước khi làm: bao nhiêu người có bạn, bao nhiêu cặp có tương tác hai chiều mỗi tuần | Có số liệu nền | 2–3 ngày |
| **1. Hôm nay bạn học gì (B)** | Bảng `lexica_buddy_words`, đồng bộ danh sách từ học trong ngày (đã có luồng `useActivitySync`), dòng trong Buddy, nút "Mình cũng học", nút ẩn từ | Bạn thấy từ của nhau và học theo | 1 tuần |
| **2. Tặng từ + Đố nhau (I, C)** | Chọn từ tặng kèm lời nhắn, hộp thư "quà", đố nhau dùng `duel_create` với bộ từ chọn tay, nhãn "Từ ... tặng" trong hàng học | Một cặp tặng và đố nhau trọn vòng | 1,5 tuần |
| **3. Nhiệm vụ nhóm + Khiên (A, G)** | Con quái tuần theo số thành viên, sát thương từ `daily_activity`, màn nhiệm vụ dùng giao diện Trùm cuối, khiên tặng bạn, kết thúc tuần có thưởng chung | Một nhóm đi hết một tuần | 2 tuần |
| **4. Giờ học chung (E nhẹ)** | Hẹn giờ, nhắc, "cùng xong" | Hai người hẹn và cùng hoàn thành | 1,5 tuần |
| **5. Quyết F** | Nhìn số liệu bước 0 và 1 đến 4; nếu thấy bạn hay vào cùng lúc thì làm Nối chuỗi đôi và Hành trình hai người | Có quyết định dựa trên số | |

### Số đo

- Tỉ lệ người dùng có ít nhất một bạn, và có ít nhất một bạn **hoạt động** mỗi tuần.
- Tỉ lệ cặp có **tương tác hai chiều** trong tuần (cả hai cùng gửi hoặc nhận một thứ).
- Số tặng, số đố, số "mình cũng học" mỗi cặp mỗi tuần.
- Tỉ lệ quay lại sau 7 ngày: người có bạn so với người không có (đây là cách chứng minh Buddy đáng làm).
- Tỉ lệ nhóm hoàn thành nhiệm vụ tuần.

## 6. Quyền riêng tư và an toàn

- Chia sẻ: từ trong kho chung (không phải câu người dùng tự viết), con số, tên hiển thị.
- Lời nhắn tặng từ: ≤ 60 chữ, chỉ giữa hai bạn đã kết, có lọc chữ và nút "báo cáo", có nút chặn bạn (chặn thì gỡ kết bạn và ẩn mọi thứ).
- Nút "ẩn từ hôm nay" (không đẩy danh sách từ hôm nay lên cho bạn thấy).
- Người dưới 18 tuổi: chỉ bạn đã kết bằng mã mời, không tìm người lạ (đúng như hiện nay).
- Tất cả bảng mới: RLS bật, không chính sách, truy cập qua hàm security definer, chỉ trả dữ liệu cho cặp bạn đã kết (như `migration_duels.sql`).

## 7. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Người dùng chưa có bạn thì mọi thứ trống | Bước 0 đo trước; thêm "mời bạn" nổi bật ở Hôm nay; cho nhóm 1 người chơi quái một mình (Trùm cuối) |
| Chỉ vài người có bạn nên làm công phu mà ít người dùng | Bắt đầu bằng B và hướng 1 (rẻ), đo rồi mới làm hướng 2 |
| Thua chung gây áp lực, khiến người học bỏ | Hậu quả nhẹ, khiên tặng nhau, nhóm không bị "đuổi" |
| Lạm dụng lời nhắn | Giới hạn độ dài, chỉ giữa bạn đã kết, chặn và báo cáo |
| Làm quá nhiều cùng lúc | Mỗi bước phát hành riêng, đo trước khi sang bước sau |

## 8. Cần bạn quyết

1. **Đồng ý chẩn đoán** (Buddy là bảng điểm, thiếu vật chung và ràng buộc hai chiều)?
2. **Đồng ý chọn** nền B, rồi hướng 1 (Tặng từ + Đố nhau), hướng 2 (Nhiệm vụ nhóm + Khiên), hướng 3 (Giờ học chung)?
3. **Lời nhắn kèm quà:** cho gõ một dòng ngắn tự do (có lọc, chặn), hay chỉ chọn câu có sẵn (an toàn hơn, ít cá nhân hơn)? Đề xuất: dòng ngắn tự do kèm chặn và báo cáo.
4. **Nhiệm vụ nhóm:** thua thì mất gì? Đề xuất: chỉ "con quái hồi máu" và nhóm tạm mất chuỗi nhóm một tuần, không mất gì của từng người.
5. **Làm bước 0 trước** (đo, 2–3 ngày) hay đi thẳng vào bước 1?

## 9. Đã quyết và đã làm (31/10/2026)

Bạn quyết: làm hết các hướng, hướng nào không hiệu quả thì bỏ sau. Cho các câu hỏi ở mục 8, mình dùng mặc định đề xuất: lời nhắn tự do ngắn (60 chữ, không đường dẫn, có nút báo cáo), thua nhiệm vụ chỉ khiến con quái hồi thêm 15% máu tuần sau, đo bằng sự kiện thay vì làm riêng bước 0.

| Hướng | Trạng thái | Ở đâu |
|---|---|---|
| B Hôm nay bạn học gì | Xong | `TodayWordsCard`, `buddy_words_*`, đồng bộ trong `useActivitySync` |
| I Tặng từ | Xong | `GivePanel`, `GiftsCard`, `gift_*` |
| C Đố nhau | Xong, dùng lại `duel_create` | `GivePanel` (chọn 5 đến 8 từ) |
| A Mục tiêu nhóm tuần (bỏ cách nói "con quái", thua không bị phạt) | Xong, không cần bảng, tính từ `daily_activity` | `QuestCard`, `questWeek` |
| G Khiên | Xong, mỗi người một khiên mỗi tuần | `shield_give`, `shields_team` |
| E Giờ học chung | Bản nhẹ: hẹn giờ, cửa sổ vào học, tệp lịch .ics. **Chưa có thông báo đẩy**, chỉ thấy khi mở Buddy | `DatesCard`, `date_*` |
| D Dạy lại nhau | Xong, dạng "Nhờ đặt câu": bạn kia gõ một câu (3 đến 120 chữ, không đường dẫn), có nút báo cáo | `AsksCard`, `ask_*` |
| J Cột mốc chung | Xong: tổng từ cả nhóm học, mốc 50 đến 10000 | `QuestCard`, `team_words` |
| Nhãn "Từ Hà tặng" | Xong, hiện trên thẻ từ | `rememberGift`, `VocabCard` |
| Chặn bạn | Xong: gỡ bạn, xoá quà, khiên, hẹn giữa hai người, không kết lại được | `buddy_block` + trigger trên `buddy_pairs` |
| Nhắc giờ học chung | Thanh nhắc trong app khi đến giờ; **không có thông báo đẩy** (cần khoá VAPID và máy chủ cron cho Lexica) | `StudyDateBanner` |
| F Chơi thời gian thực | **Chưa làm**, đúng như kế hoạch: chờ số liệu cho thấy bạn bè hay vào cùng lúc | |
| H Tên nhóm | **Chưa làm**: nhóm hiện là "mình và các bạn của mình", mỗi người một nhóm khác nhau, nên chưa có thực thể nhóm chung để đặt tên | |

Sự kiện để đo: `buddy_ask_sent`, `buddy_ask_answered`, `buddy_view`, `buddy_learn_too`, `buddy_gift_sent`, `buddy_gift_opened`, `buddy_quiz_sent`, `buddy_shield`, `buddy_date_created`, `buddy_date_checkin`.
