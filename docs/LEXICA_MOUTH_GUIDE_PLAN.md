# Lexica: hướng dẫn phát âm bằng khẩu hình (kế hoạch, 11/2026)

**Tham khảo:** SayShape (sayshape.dqnotes.com). **Chỉ học ý tưởng, không lấy hình, mã hay bản ghi của họ.**

## Hiện có trong Lexica
- **Hình miệng nhìn ngang, tĩnh** (`app/lib/pronunciation/mouth.ts`, `components/pron/Mouth.tsx`).
  - Mỗi vị trí phát âm có một tư thế: lưỡi (4 điểm), hàm, môi, ngạc mềm, điểm chạm, đường hơi.
  - Kèm một dòng tiếng Việt.
- **Nhóm lỗi hay gặp của người Việt** (`pairs.ts`, `ErrorKind`):
  - `final_consonant`, `th`, `cluster`, `ending`;
  - `long_short`, `ch_j`, `final_ng`, `final_voicing`;
  - `final_l`, `initial_z`, `ae_e`.
  - Mỗi nhóm có sẵn cặp từ tối thiểu.
- **Lịch sử thử/sai theo nhóm** (`soundLog.ts`, `speakMisses`) và sổ âm (`SoundBook`, `SoundTips`, `SoundPractice`).
- **Giọng mẫu** tạo sẵn cho mọi từ (Kokoro).

## Sáu việc

### M1. So sánh hai âm cạnh nhau, đúng cặp người Việt hay nhầm (ưu tiên cao nhất)
- **Cặp âm:**
  - /θ/–/s/, /θ/–/t/, /ð/–/d/;
  - /ʃ/–/s/, /tʃ/–/ʃ/, /dʒ/–/tʃ/;
  - /v/–/b/, /z/–/s/;
  - /iː/–/ɪ/, /æ/–/e/;
  - /l/ cuối – không âm, /ŋ/–/n/ cuối.
- **Màn so sánh:**
  - hai hình miệng (tư thế sẵn có) đặt cạnh nhau;
  - **tô đỏ chỗ khác nhau**: điểm chạm, lưỡi, môi, ngạc mềm, rung dây thanh;
  - một câu nói đúng chỗ khác, ví dụ "think: đầu lưỡi chạm răng trên; sink: đầu lưỡi sau răng, không chạm";
  - nút nghe hai từ của một cặp tối thiểu, xen kẽ.
- **Chọn cặp theo người học:** cặp ứng với nhóm lỗi người học sai nhiều nhất trong `soundLog` hiện lên đầu, trong sổ âm và sau một lần luyện nói sai.
- **Mã:**
  - `lib/pronunciation/compare.ts`: danh sách cặp, hàm thuần tính phần khác giữa hai tư thế, có test;
  - `components/pron/MouthCompare.tsx`.

### M2. Hình động, nhất là âm cuối
- **Chuyển mượt giữa các tư thế 2D** (nội suy điểm lưỡi, hàm, môi). Không làm 3D.
- **Âm cuối /t d k p s z/:** cho thấy **chạm rồi thả**, có hơi thoát. Đây là lỗi nuốt âm cuối của người Việt.
- **Điều khiển:** Phát, Chậm (×0,4), Lặp lại.
- **Tôn trọng "giảm chuyển động":** khi bật, hiện các tư thế tĩnh theo bước.
- **Mã:**
  - `lib/pronunciation/motion.ts`: chuỗi tư thế theo thời gian cho một âm hoặc âm cuối, thuần, có test;
  - `Mouth.tsx` nhận thêm tham số tiến trình 0–1.

### M3. Luồng hơi và rung dây thanh
- **Chấm hơi chạy theo đường `air`** của tư thế: bật mạnh cho /p t k/ đầu từ, xì đều cho /s ʃ f θ/, đi qua mũi cho /m n ŋ/.
- **Biểu tượng dây thanh:** "rung" cho âm hữu thanh (/z v ð b d g/, nguyên âm), "nghỉ" cho âm vô thanh.
- **Cặp chỉ khác ở dây thanh** (/s/–/z/, /f/–/v/, /t/–/d/ cuối, `final_voicing`): làm nổi bật biểu tượng này trong màn so sánh M1.

### M4. Tự kiểm tra bằng đồ vật (không cần máy chấm)
- **Thẻ "Thử ngay"** kèm từng âm hoặc nhóm lỗi:
  - **Tờ giấy:** cầm trước miệng, *paper*, *tea*, *key* làm giấy rung. Dùng cho /p t k/ bật hơi.
  - **Tay ở cổ:** *zoo* rung, *sue* không. Dùng cho /z/–/s/ và âm cuối hữu thanh.
  - **Soi gương:** thấy đầu lưỡi giữa hai răng khi nói *think*. Dùng cho /θ ð/.
  - **Ngón tay trên môi:** /v/ môi dưới chạm răng trên, /b/ hai môi chạm nhau.
  - **Kéo dài âm:** giữ /s/ và /ʃ/ 2 giây, nghe khác nhau.
- **Người học tự đánh dấu "Làm được".** Ghi như bằng chứng yếu (không đổi điểm phát âm), dùng để quyết lần sau có nhắc lại không.

### M5. Hướng dẫn 3 bước bằng động từ
- **Thay một dòng mô tả bằng tối đa 3 bước**, mỗi bước bắt đầu bằng động từ: chạm, giữ, thổi, khép, kéo, thả. Ví dụ /θ/:
  1. Chạm đầu lưỡi vào mặt sau răng cửa trên.
  2. Giữ lưỡi phẳng, chạm nhẹ.
  3. Thổi hơi đều qua khe, không rung cổ.
- **Mỗi bước gắn với một phần trên hình** (chạm bước nào thì phần đó sáng lên).
- Có thêm dòng "**Người Việt hay**…" cho lỗi điển hình của âm đó.
- **Dữ liệu:** trường `steps` trong tư thế (`mouth.ts`) hoặc bảng riêng theo âm. Viết tay và người duyệt.

### M6. Xem âm trong từ thật
- **Trong một từ** (ví dụ *think*), chạm vào một chữ: hình miệng nhảy tới tư thế của âm đó, và giọng mẫu phát đoạn từ chứa âm đó ở tốc độ chậm.
- **Dùng lại:** căn chữ–âm sẵn có (`align.ts`, `graphemes.ts`) và giọng mẫu Kokoro.
- **Chưa có thời điểm từng âm trong file giọng.** Bản đầu chỉ phát cả từ chậm và làm sáng chữ. Thời điểm từng âm cần căn lực (forced alignment), để sau.

## Thứ tự và công sức (ước tính)
| Việc | Phụ thuộc | Công |
|---|---|---|
| M5 (3 bước) | — | 1–2 ngày, chủ yếu viết nội dung cho ~40 âm |
| M1 (so sánh cặp) | M5 nên có trước | 2–3 ngày |
| M3 (hơi, dây thanh) | — | 1–2 ngày |
| M4 (tự kiểm tra) | — | 1 ngày |
| M2 (hình động) | M3 | 2–3 ngày |
| M6 (âm trong từ) | M2 | 2 ngày (bản đầu) |

**Đề xuất:** M5 → M1 → M3 → M4 → M2 → M6.

## Đo
- **Lượt mở màn so sánh cặp**, và tỉ lệ người dùng làm bài cặp tối thiểu ngay sau đó.
- **Tỉ lệ lỗi theo nhóm** (`soundLog`) trước và sau khi dùng hướng dẫn, so với người không mở.
- **Phản hồi** "Dễ hiểu hơn / Vẫn khó" sau mỗi màn hướng dẫn.
