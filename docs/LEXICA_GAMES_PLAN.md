# Làm lại phần Games của Lexica: rà soát và đề xuất (30/10/2026)

Liên quan: issue #73. Đây là kế hoạch và ý tưởng, chưa có code. Chọn xong mới tách thành issue làm.

## 1. Hiện có gì

Bảy game trong `GameHub` (mở từ trang "Đã học", nút Game Hub), cộng ba mini-game nằm rải ở nơi khác:

| Game | Luật | Chơi ở đâu | Ghi chú |
|---|---|---|---|
| Speed Quiz | Trả lời nhanh, chế độ không giới hạn | Game Hub | Lớn nhất (480 dòng) |
| Memory Match | Lật thẻ ghép từ với nghĩa | Game Hub | |
| Type Challenge | Gõ từ tiếng Anh từ nghĩa tiếng Việt | Game Hub | |
| Word Scramble | Sắp xếp chữ cái | Game Hub | |
| True/False Blitz | 60 giây đúng/sai | Game Hub, thách đấu | |
| Combo Chain | Chuỗi combo cao nhất | Game Hub, thách đấu | |
| Word Bingo | Hoàn thành hàng, cột, chéo | Game Hub | |
| Surgery Lab | Mổ xẻ từ (gốc, hậu tố) | Danh sách từ đã học | |
| Dialogue Scene | Điền từ vào hội thoại | Bài đọc | |
| Quote Meet | Gặp từ trong câu trích | Phiên Hôm nay | |

Thách đấu bạn bè (`app/challenge`, `lib/challenges.ts`) chỉ hỗ trợ 5 game: speed, type, truefalse, scramble, combo.

## 2. Vấn đề (từ mã nguồn, chưa có số liệu dùng thật)

1. **Khó thấy.** Game nằm sâu: trang "Đã học", rồi nút Game Hub. Trang "Luyện" (`MoreList`) không có game nào. Phiên Hôm nay cũng không dẫn tới.
2. **Chơi không giúp học.** Game lấy từ "đã học" và không ghi lại kết quả vào lịch ôn, nên chơi xong thẻ không biết gì về chuyện đó. Chỉ Đấu trường và thách đấu (`applyArena`) mới cập nhật.
3. **Bảy game cùng một khung.** Phần lớn là "chọn nghĩa" hoặc "gõ từ" bọc skin khác. Người chơi thấy lặp, người làm phải sửa bảy nơi.
4. **Mỗi game một giao diện, một bộ âm thanh, một thang điểm.** Điểm Speed Quiz không so được với True/False.
5. **Không có lý do chơi lại ngày mai.** Không có mục tiêu ngày, không có bảng tuần, không có phần thưởng ngoài điểm.
6. **Không hợp hướng Chứng chỉ.** Không game nào giống bài thi (nối tiêu đề, điền từ vào đoạn, từ đồng nghĩa).
7. **Rộng nhưng nông.** 3.100 dòng cho 7 game mà không biết game nào được chơi. Cần số liệu trước khi giữ hay bỏ.

## 3. Đề xuất: ba game lõi và một vòng lặp

Nguyên tắc: **chơi cũng là học**. Mỗi game ghi kết quả vào cùng nơi với bước Nhớ, Gặp, Dùng, nên chơi game hợp lệ là một lần ôn.

### 3.1 Ba game lõi (thay vì bảy)

| Game | Ý | Bước phục vụ | Giữ từ game cũ | Công sức |
|---|---|---|---|---|
| **Chớp** (Blitz) | 60 giây, câu hỏi xen kẽ nghĩa/từ/đúng-sai, trả lời đúng liên tiếp tăng điểm | Nhớ | Speed Quiz, True/False, Combo Chain | Vừa: gộp, dùng lại `duelQuestions` và đồng hồ của Đấu trường |
| **Ghép** (Match) | Lưới ghép từ với nghĩa/ví dụ/âm, mỗi ván 6 cặp, có thời gian | Gặp | Memory Match, Word Bingo | Vừa |
| **Gõ** (Spell) | Nghe hoặc xem nghĩa, gõ lại từ, có gợi ý chữ đầu; mở dần cho Scramble | Nhớ sâu, chính tả | Type Challenge, Word Scramble | Nhỏ: gộp hai game |

Giữ riêng ba thứ không phải game thuần: Surgery Lab (kiến thức từ gốc), Dialogue Scene (trong bài đọc), Quote Meet (trong Hôm nay). Chúng vốn là bước Gặp và Dùng.

### 3.2 Cho hướng Chứng chỉ (sau khi ba game lõi xong)
- **Điền đoạn** (cloze): đoạn ngắn có chỗ trống, chọn từ đã học. Giống Reading của IELTS.
- **Gần nghĩa**: chọn từ cùng nghĩa trong câu (Synonym), giống dạng câu hỏi từ vựng thi.
Hai game này là ứng viên giai đoạn 2, không làm cùng đợt.

### 3.3 Vòng lặp khiến muốn chơi lại
1. **Mục tiêu ngày một game**: "Hôm nay chơi 1 ván Chớp" cộng vào chuỗi ngày hiện có (không tạo chuỗi riêng).
2. **Bảng tuần với bạn học** (Buddy đã có `cheers` và nhóm): điểm tốt nhất tuần của mỗi người, so với bạn, không công khai cho người lạ.
3. **Thách đấu** dùng chung cơ chế `duel` đã có: cùng bộ câu hỏi, chỉ bên kia thấy điểm sau khi cả hai xong.
4. **Phần thưởng nhẹ, có ích**: mở chủ đề mới, mở khung ảnh chia sẻ điểm. Không có tiền ảo.
5. **Từ khó xuất hiện nhiều hơn** trong game (lấy từ `hardWords`), để chơi là ôn đúng chỗ yếu.

### 3.4 Điểm và dữ liệu
- Một thang điểm chung (0–1000 mỗi ván) tính từ độ chính xác, tốc độ, chuỗi đúng.
- Mỗi câu trả lời game ghi qua đường `reviewLog` như phiên ôn, trọng số nhẹ hơn ôn thật (ví dụ 0,5), để lịch ôn biết nhưng không bị nhiễu.
- Mọi game gửi cùng một bộ sự kiện (liên quan #61: `game_started`, `game_finished` kèm game, điểm, số từ).

### 3.5 Giao diện
- Một khung chung: thanh trên (thoát, đồng hồ, điểm), vùng câu hỏi, vùng đáp án lớn dễ bấm bằng ngón cái, hiệu ứng nhỏ khi đúng.
- Dùng màu `arena-1..4` cho bốn đáp án để quen với Đấu trường của Teach.
- Đưa game vào trang "Luyện" thành nhóm "Chơi" (3 ô), và một gợi ý nhẹ cuối phiên Hôm nay ("Còn thời gian? Chơi một ván").

## 4. Liên hệ với Đấu trường của Teach

Cùng cơ chế câu hỏi, chỉ khác nơi hiển thị:
- Câu hỏi: `cortex_arena_clean_questions` (SQL) và `duelQuestions` (client) đã làm sạch và trộn đáp án. Chớp dùng lại.
- Chấm giờ: Đấu trường chấm theo giờ máy chủ. Game một mình không cần (chơi offline được), thách đấu thì dùng đường `duel_answer`.
- Giao diện: dùng lại các token `arena-*` và hiệu ứng đếm ngược. Có thể rút một gói giao diện chung nếu thấy lặp ở lần sửa thứ hai (không làm trước).
- Một hướng thú vị: giáo viên chọn "chơi Chớp ở nhà" làm bài tập, điểm đổ về lớp (chỉ số, không nội dung).

## 5. Thứ tự đề xuất

| # | Việc | Công sức | Điều kiện |
|---|---|---|---|
| 1 | Đo trước: ghi sự kiện `game_started/finished` ở 7 game hiện tại, chạy 2–3 tuần | Nhỏ | Cần #61 hoặc bản ghi tạm |
| 2 | Khung chung và game **Chớp**, đưa vào trang Luyện, ghi vào `reviewLog` | Vừa | |
| 3 | **Ghép** và **Gõ** (gộp game cũ), bỏ game cũ khi mới đã đủ | Vừa | Sau 2 |
| 4 | Mục tiêu ngày, bảng tuần với bạn, thách đấu dùng `duel` | Vừa | Sau 2 |
| 5 | Điền đoạn, Gần nghĩa cho Chứng chỉ | Vừa | Sau 3 |

Nếu chỉ chọn một việc: **bước 2**, vì nó làm game có lý do tồn tại (chơi là ôn) và dễ thấy nhất.

## 6. Câu hỏi cần bạn quyết
1. Đồng ý gộp bảy game thành ba game lõi (bỏ Memory/Bingo/Scramble cũ sau khi bản mới chạy ổn) không?
2. Chơi game có được tính vào chuỗi ngày không, hay chỉ phiên Hôm nay mới tính? (Đề xuất: chỉ tính mục tiêu ngày phụ, không thay phiên Hôm nay.)
3. Có làm bước 1 (đo trước) không, hay đi thẳng bước 2?

## 7. Tình trạng (31/10/2026)

Đã làm (issue #80): 13 game ở `/play` (Chớp, Thám tử từ, Từ nói dối, Nghe và bắt từ, Ghép, Gõ, Nối chuỗi, Điền đoạn, Nâng cấp câu, Trùm cuối, Bẫy chữ, Mưa từ, Hành trình), mục tiêu ngày, bảng tuần với bạn học, thách đấu Từ vựng, Từ nói dối và Thám tử.

Đã dọn: bảy game cũ (Speed Quiz, Memory Match, Type Challenge, Word Scramble, True/False Blitz, Combo Chain, Word Bingo), Game Hub và trang thách đấu bằng liên kết (`/challenge/<id>`, chuyển hướng sang `/play`). Trang "Từ của tôi" dẫn sang `/play`.

Đo mức dùng: sự kiện `game_start` (game, lượt) và `game_finish` (game, điểm, số đúng, tổng) gửi qua PostHog khi có cấu hình. Sau 2 đến 3 tuần xem game nào được chơi tới cuối để quyết giữ, gộp hoặc bỏ.

Chuyển sang #100 (Buddy): Nối chuỗi chơi đôi và các cách chơi cùng nhau thời gian thực.

## 8. Làm lại sau khi chơi thử (#107)

- **Nối chuỗi:** chuỗi từ hiện từng hàng "Máy → Bạn" có nhãn, máy "đang nghĩ" gần một giây trước khi trả lời (thời gian không tính vào lượt của bạn).
- **Thám tử từ:** thành trò suy luận loại trừ. Bốn nghi phạm, manh mối mở từng cái (số chữ cái, chữ đầu, chữ cuối, chữ cái đôi, chữ hiếm, hay đi cùng từ nào, phiên âm, nghĩa), mỗi manh mối gạch tên những từ không khớp. Chỉ giữ manh mối loại được ít nhất một từ, nghĩa luôn là manh mối cuối. Không còn câu có chỗ trống (đó là Điền đoạn). Lần sửa trước (ép đáp án cùng chữ đầu) đi sai hướng và đã bỏ.
- **Ghép:** thành trò lật thẻ (Memory): 12 thẻ úp trong một lưới, từ và nghĩa trộn lẫn; cặp đúng ở lại với màu riêng, combo, điểm thưởng tốc độ.
- **Mưa từ:** có chọn Luyện (không mất tim) hoặc Thử thách; 5 tim; bắt đầu chậm và ít (tối đa 3 từ), từ ngắn trước; sau mỗi từ rơi chạm đất mưa chậm lại vài giây; hiện chữ đầu và số chữ; từ vàng cứ 7 từ một lần (thêm tim, làm chậm hoặc dọn sạch); nền đổi theo cấp.
- Chưa làm: chơi đôi thời gian thực và chế độ Đấu trường cho Nối chuỗi (chuyển sang #100 và #63).
