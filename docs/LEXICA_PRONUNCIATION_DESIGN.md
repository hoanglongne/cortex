# Lexica: chấm phát âm không dùng AI (thiết kế Đợt 6)

Trạng thái: **chờ duyệt**. Chưa có dòng code nào cho Đợt 6. Các câu hỏi cần chốt nằm ở mục 9.

Tiếp nối T8 trong `docs/LEXICA_FEEDBACK_TASKS.md`. Giai đoạn 1 của T8 đã xong: bài "Luyện nói", chấm 3 mức Rõ / Gần đúng / Chưa rõ, cặp gần âm, mẹo theo lỗi, đường cao độ, danh sách từ khó nói.

## 1. Mục tiêu

Người học nói xong thì biết **sai ở đâu** và **sửa thế nào**, không chỉ nhận "Chưa rõ":
- sai từ nào trong câu;
- âm nào có thể sai (ví dụ /θ/ thành /t/, mất âm cuối);
- nhấn sai âm tiết, xuống giọng sai, nói quá nhanh hay ngắt sai chỗ;
- theo thời gian: âm nào mình hay sai, và đã đỡ chưa.

Câu hỏi của mọi tính năng (theo quy tắc của T8): *"Nó giúp người học nói rõ hơn thế nào?"*. Không trả lời được thì cắt.

### "Không dùng AI" nghĩa là gì trong tài liệu này
- **Không gọi** LLM hay API trả phí để chấm. Không tải mô hình nhận dạng âm vị (wav2vec2…) về máy.
- **Được dùng**:
  - nhận dạng giọng nói **có sẵn trong trình duyệt** (Web Speech API);
  - từ điển phát âm mở;
  - xử lý tín hiệu bằng Web Audio;
  - luật viết tay.
- Câu hỏi mở (mục 9, câu 1):
  - Web Speech trên Chrome thực chất gửi âm thanh lên Google để nhận dạng.
  - Khi trình duyệt không nghe được, app hiện gửi bản ghi lên Cortex API để chép lời bằng Gemini (`/v1/lexica/transcribe`).

## 2. Giới hạn phải nói thật với người học

- Nhận dạng giọng nói **không phải** chấm phát âm. Máy hay "tự sửa": người học nói gần đúng thì máy vẫn ra đúng từ. Vì vậy:
  - máy nghe ra **từ khác** là tín hiệu mạnh;
  - máy nghe ra **đúng từ** chưa chắc là đã phát âm đúng.
- Đoán âm sai chỉ là **đoán**. Lời luôn dùng "có thể", kèm cách tự kiểm tra (nghe lại giọng mình cạnh giọng mẫu).
- Đo bằng Web Audio (mức 3) nhạy với ồn và micro. Mỗi chỉ số có ngưỡng tin cậy; dưới ngưỡng thì không nói gì, còn hơn nói sai.
- Không chấm điểm số kiểu 0–100. Chỉ báo điều cụ thể sửa được, khen khi tiến bộ (quy ước của dự án).

## 3. Kiến trúc

```
Ghi âm (MediaRecorder, đã có)  ──►  Web Speech: transcript + alternatives + confidence (đã có)
          │                                   │
          ▼                                   ▼
  Web Audio: năng lượng, cao độ,     Mức 1: so khớp từ với câu mẫu
  khoảng lặng (mức 3)                Mức 2: so âm vị qua CMUdict, đoán lỗi
          │                                   │
          └──────────────►  Kết quả một lần nói (thuần, có test)  ◄──┘
                                      │
                                      ▼
                    Mức 4: sổ lỗi theo thời gian, bài luyện tự giao,
                           số liệu cho giáo viên
```

- Mọi phần chấm là **hàm thuần** trong `apps/lexica/app/lib/pronunciation/`, test bằng vitest với dữ liệu cố định. Âm thanh mẫu là file WAV nhỏ trong `__tests__/fixtures`.
- Chạy hoàn toàn trên máy người học. Không có bảng mới trên server, trừ phần số liệu cho lớp ở mức 4.
- Giọng mẫu để so (mức 3): giọng tự nhiên đã sinh sẵn và cache trên Cortex API (`naturalVoiceUrl`). Đây là nội dung, không phải chấm điểm. Giọng hệ thống (`speechSynthesis`) không ghi lại được nên không dùng để so.

## 4. Mức 1: so khớp từ với câu mẫu

**Dùng cho:**
- cụm "Hay đi với" (collocations);
- câu mẫu Tình huống của thẻ Giao tiếp (`situation.model`, 40 thẻ);
- sau này cả câu của chính người học ("Câu của bạn").

**Cách làm** (`lib/pronunciation/align.ts`):
1. Chuẩn hoá cả hai câu:
   - chữ thường, bỏ dấu câu;
   - số thành chữ ("10" → "ten");
   - viết tắt thành dạng đầy đủ ("I'm" → "i am"), có bảng nhỏ.
2. Căn hai dãy từ bằng quy hoạch động (Needleman–Wunsch). Từ gần giống nhau (edit distance nhỏ, hoặc cùng gốc qua `stem`) được tính là "đổi", không phải thiếu + thừa.
3. Mỗi từ của câu mẫu ra một trạng thái:
   - `ok`: đúng;
   - `missing`: thiếu;
   - `swapped`: máy nghe ra từ khác, kèm từ đó;
   - `extra`: thừa (chỉ đếm, không trách).
4. **Dùng cả các phương án nhận dạng khác** (`alternatives`, xin `maxAlternatives = 5`):
   - một từ chỉ là `swapped` khi **không** phương án nào có đúng từ đó ở vị trí đó;
   - nếu chỉ phương án 2–5 có đúng thì từ đó là `unsure`, hiện màu nhạt: "máy chưa chắc".
5. Độ tin cậy:
   - `confidence` của Web Speech chỉ có cho cả câu, và nhiều trình duyệt trả về 0;
   - câu có độ tin cậy thấp (< 0.5, trừ khi trình duyệt trả 0) thì chỉ báo từ `missing`, không báo `swapped`.

**Hiển thị:** câu mẫu với từng từ tô màu (đúng / thiếu / máy nghe thành "…" / máy chưa chắc). Bấm một từ thì nghe mẫu từ đó và thấy âm có thể sai (mức 2).

**Xong khi:**
- Test đủ các trường hợp: đúng hết, thiếu từ cuối (lỗi hay gặp khi máy dừng sớm), đổi một từ, thừa từ đệm ("uh", "um"), viết tắt, số.
- Hiển thị trên 390px.

## 5. Mức 2: âm vị qua CMU Pronouncing Dictionary

### 5.1 Từ điển
- **CMUdict** (giấy phép BSD-2): 134k từ, phiên âm ARPAbet có trọng âm, ví dụ `THINK  TH IH1 NG K`.
- Không gửi cả từ điển xuống máy. Bản rút gọn được tạo lúc build bằng `scripts/build-cmudict.mjs`, gồm:
  - mọi từ trong thẻ, cụm và câu mẫu;
  - các từ trong cặp gần âm;
  - 10.000 từ tiếng Anh thông dụng nhất (để tra từ mà máy nghe nhầm thành).
- Ước tính khoảng 12.000 mục, ~300KB, nén gzip ~90KB. Tải lười khi mở bài Luyện nói.
- Từ không có trong CMUdict: lấy IPA của thẻ (đã có) đổi sang ARPAbet bằng bảng ánh xạ. Không có cả hai thì bỏ qua mức 2 cho từ đó.

### 5.2 Đoán âm sai
Chỉ chạy khi mức 1 báo `swapped`: máy nghe ra một **từ có thật khác** (ví dụ nói *think*, máy nghe *sink*).
1. Tra phiên âm của từ đích và từ máy nghe được.
2. Căn hai dãy âm vị bằng edit distance có trọng số: thay âm gần nhau (/θ/–/s/, /iː/–/ɪ/) rẻ hơn thay âm xa.
3. Mỗi chỗ lệch được ánh xạ vào **thư viện lỗi của người Việt** (5.3). Chỗ lệch không khớp mẫu nào thì báo chung: "âm … nghe như …".
4. Gộp kết quả: tối đa **2 âm** mỗi lần nói, ưu tiên lỗi có trong thư viện.

Khi máy nghe ra đúng từ, mức 2 không đoán gì. Lúc đó chỉ còn tín hiệu của mức 3 (ví dụ âm cuối yếu).

### 5.3 Thư viện lỗi hay gặp của người Việt
Mở rộng `lib/pronunciation/pairs.ts`: hiện có 7 nhóm lỗi với cặp tối thiểu và mẹo. Mỗi lỗi gồm:
- mẫu âm vị: thay, mất hay thêm, ở vị trí nào (đầu, giữa, cuối từ);
- câu mô tả, ví dụ "Âm /θ/ (th) trong *think* nghe như /s/";
- mẹo sửa ngắn: vị trí lưỡi, môi;
- cặp từ dễ nhầm để luyện nghe và nói.

| Nhóm | Mẫu lệch (ARPAbet) | Ví dụ |
|---|---|---|
| Mất phụ âm cuối | phụ âm cuối → ∅ | light → lie |
| Đổi phụ âm cuối hữu thanh/vô thanh | D→T, Z→S, V→F ở cuối | bed → bet |
| /θ ð/ | TH→T/S, DH→D/Z | think → sink |
| Cụm phụ âm | cụm → một phụ âm | street → seat |
| Đuôi -s, -ed | mất S/Z/T/D cuối sau phụ âm | walked → walk |
| Dài/ngắn | IY↔IH, UW↔UH | sheep → ship |
| /ʃ tʃ dʒ/ | SH↔CH, CH↔JH, SH→S | chip → ship |
| /ŋ/ cuối | NG→N | thing → thin |
| /l/ cuối, /r/ | L cuối → ∅, R→L | feel → fee |
| /z/ và /s/ đầu từ | Z→S | zoo → sue |
| Nguyên âm /æ/ /e/ | AE↔EH | bad → bed |

Ba nhóm cuối là mới. Nguồn: các nghiên cứu đã dẫn trong T8, bổ sung thêm khi có dữ liệu thật từ mức 4.

**Xong khi:**
- Có test cho: căn âm vị, ánh xạ mỗi nhóm lỗi (≥ 2 ví dụ mỗi nhóm), từ không có trong từ điển, giới hạn 2 âm.
- Kích thước bản CMUdict rút gọn được kiểm trong CI (≤ 400KB).

## 6. Mức 3: Web Audio

Chạy trên bản ghi (`AudioBuffer`) sau khi nói xong, không chạy thời gian thực. Có sẵn bộ dò cao độ (`lib/pronunciation/pitch.ts`).

### 6.1 Năng lượng cuối từ (mất âm cuối)
- Chỉ áp dụng cho **từ đơn** có phụ âm cuối (theo CMUdict), như bước "Nghe mẫu rồi nói".
- Tìm đoạn có giọng cuối cùng (cao độ còn dò được), rồi đo trong 40–250ms sau đó:
  - âm xát (S, Z, SH, TH, F): năng lượng dải cao trên 3kHz (lọc high-pass);
  - âm tắc (T, D, K, P…): có tiếng nổ ngắn (đỉnh năng lượng sau khoảng lặng ngắn).
- So với cùng phép đo trên **giọng mẫu** của từ đó, chuẩn hoá theo mức ồn nền đo ở 200ms đầu bản ghi.
- Kết quả: "âm cuối rõ", "âm cuối yếu", hoặc **không kết luận** (ồn quá, hoặc bản ghi bị cắt sát).

### 6.2 Trọng âm (từ nhiều âm tiết)
- Tách âm tiết bằng đỉnh của đường năng lượng, làm mượt 30ms.
- Số âm tiết đo được phải khớp số âm tiết trong CMUdict; không khớp thì không kết luận.
- Âm tiết được nhấn là âm tiết trội nhất khi cộng: độ dài, độ lớn, cao độ (trọng số ngang nhau lúc đầu, chỉnh khi kiểm định).
- So với trọng âm trong từ điển: "Bạn nhấn *a-BUN-dant* ở âm 1, nên nhấn ở âm 2".

### 6.3 Ngữ điệu (cụm và câu)
- Dò cao độ cả câu của người học và của giọng mẫu. Đổi sang semitone so với trung vị giọng mỗi người, để giọng nam, nữ so được với nhau.
- Căn hai đường theo thời gian bằng DTW.
- Vẽ hai đường chồng nhau, thay cho đường mẫu "dựng theo trọng âm" hiện nay.
- Nhận xét ở mức thô, chỉ 2 loại:
  - cuối câu kể phải xuống mà người học lên giọng (hoặc ngược lại với câu hỏi yes/no);
  - giọng đều quá: biên độ dưới 3 semitone trong khi mẫu trên 6.

### 6.4 Tốc độ và ngắt nghỉ
- Tốc độ = số âm tiết (6.2) / thời gian có tiếng. So với mẫu: chậm hơn 0,6 lần hoặc nhanh hơn 1,4 lần thì nhắc.
- Ngắt nghỉ là khoảng lặng trên 300ms ở giữa câu. Web Speech không cho mốc thời gian từng từ, nên chỉ báo số chỗ ngắt và vị trí trên đường vẽ, không gắn với từ cụ thể.

**Xong khi:**
- Mỗi phép đo có test bằng file WAV tổng hợp: tiếng ồn trắng cho âm xát, xung ngắn cho âm tắc, sóng sin có cao độ đổi dần cho ngữ điệu.
- Đã kiểm định trên giọng thật (mục 8) trước khi hiện cho người học.
- Desktop trước. Điện thoại bật sau khi kiểm trên 2–3 máy Android và iPhone.

## 7. Mức 4: theo dõi theo thời gian

### 7.1 Sổ lỗi
- Store thêm `soundLog: Record<ErrorKind, { tries; misses; days: Record<date, [tries, misses]> }>`. Giữ 60 ngày, đồng bộ cloud như các trường khác.
- `tries` tăng khi người học nói một từ **có** âm thuộc nhóm đó. `misses` tăng khi mức 2 hoặc 3 báo lỗi nhóm đó.
- Trang "Luyện nói" có phần **Âm hay sai**:
  - 3 nhóm có tỉ lệ sai cao nhất, kèm xu hướng 2 tuần (đỡ hơn / như cũ);
  - khen khi tỉ lệ sai giảm rõ: "Âm cuối /t/ của bạn rõ hơn hẳn tuần trước".

### 7.2 Tự giao bài luyện
- Một nhóm có từ 5 lần thử trở lên và sai trên 40% thì gợi ý **"2 phút luyện âm /θ/"**:
  - nghe phân biệt cặp tối thiểu của nhóm đó (HVPT, nhiều giọng);
  - nói 5 từ có âm đó, ưu tiên từ người học đã biết;
  - cách gợi ý: một dòng trên trang Luyện nói, và một mẹo đúng lúc ở trang chủ (`lib/guide.ts`, Đợt 5).
- Không chặn gì, không bắt buộc.

### 7.3 Tóm tắt cho giáo viên
- Metrics gửi lớp thêm `sounds: Record<ErrorKind, [tries, misses]>` trong 14 ngày gần nhất. Chỉ là con số, đúng luật riêng tư của lớp học: không gửi âm thanh, không gửi chữ máy nghe được.
- Teach (mô-đun Lexica):
  - mục **"Âm cả lớp hay sai"** trên trang lớp: 3 nhóm lỗi nhiều nhất của cả lớp, mỗi nhóm có bao nhiêu em;
  - trên trang học viên: mỗi em một dòng.
- Cần sửa `packages/classroom-lexica/sql/classroom_lexica.sql` (`clean_metrics` lọc thêm `sounds`) và `parseMetrics`.
- Người dùng phải chạy lại file SQL sau khi merge.
- Câu cho học viên ở chỗ vào lớp sửa thành: "giáo viên thấy 4 con số Hiểu, Nhớ, Gặp, Dùng và **số lần sai theo từng nhóm âm**".

## 8. Kiểm định trước khi bật

- **Mức 1 và 2:** bộ test với transcript giả lập. Không cần dữ liệu âm thanh.
- **Mức 3:**
  - Bộ ghi âm nội bộ: 20 từ × (đọc đúng / cố tình bỏ âm cuối / nhấn sai), 3–5 người Việt, trên laptop và điện thoại. Mục tiêu:
    - âm cuối: đúng ≥ 80% trên các lần app có kết luận, và app "không kết luận" ≤ 30%;
    - trọng âm: đúng ≥ 75% với từ 2–3 âm tiết.
  - **speechocean762** (CC BY 4.0; 5.000 câu, có điểm từng âm, người nói là người Trung Quốc): dùng để kiểm mức "âm cuối yếu" có tương quan với điểm âm cuối của bộ dữ liệu không. Tham khảo thôi, không phải ngưỡng chính.
- Chưa đạt ngưỡng thì phép đo đó ở chế độ **ẩn**: chỉ ghi vào sổ để xem dữ liệu (trên máy), không hiện cho người học.
- Script kiểm định chạy bằng Node (`scripts/eval-pronunciation.mjs`), đọc WAV, in bảng kết quả. Không đưa vào CI vì dữ liệu ghi âm không commit vào repo.

## 9. Câu hỏi cần chốt

1. **Web Speech và Gemini.**
   - Web Speech có tính là "không dùng AI" không? Nó có sẵn trong trình duyệt, miễn phí, nhưng Chrome gửi âm thanh lên Google.
   - Còn đường dự phòng Gemini khi trình duyệt không nghe được thì sao? Đề xuất:
     - giữ Web Speech;
     - giữ Gemini chỉ để hiện "máy nghe được gì";
     - **không** dùng kết quả Gemini để đoán âm sai và ghi sổ lỗi (mức 2, mức 4).
2. **Thứ tự làm.** Đề xuất 3 PR:
   - (a) mức 1 + mức 2;
   - (b) mức 3, desktop trước, các phép đo chưa đạt kiểm định thì ẩn;
   - (c) mức 4, gồm cả SQL cho giáo viên.
3. **Ghi âm kiểm định.** Bạn có tìm được 3–5 người ghi bộ 20 từ (mỗi người ~10 phút) không? Không có thì mức 3 chỉ bật được sau khi có dữ liệu từ người dùng thật ở chế độ ẩn.
4. **Số liệu âm cho giáo viên** (mục 7.3): có muốn không? Nó làm lớp thấy nhiều hơn hiện nay, nên phải đổi câu báo cho học viên.
5. **Câu của học viên** ("Câu của bạn") có được dùng làm câu mẫu cho mức 1 không? Không có giọng mẫu cho câu đó, nên chỉ chạy được mức 1 và 2, không chạy được mức 3.

## 10. Ước lượng

| Phần | Cỡ | Ghi chú |
|---|---|---|
| Mức 1: căn từ, hiển thị | M | thuần, test dễ |
| Mức 2: CMUdict rút gọn, căn âm vị, thư viện lỗi | M–L | script build từ điển, bảng IPA → ARPAbet |
| Mức 3: âm cuối, trọng âm, ngữ điệu, tốc độ | L | phần khó nhất, cần kiểm định |
| Mức 4: sổ lỗi, bài tự giao, giáo viên | M | có SQL |

## Nguồn
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict (BSD-2)
- speechocean762: https://www.openslr.org/101/ (CC BY 4.0)
- Các nguồn HVPT, phản hồi cao độ và lỗi của người Việt: xem T8 trong `docs/LEXICA_FEEDBACK_TASKS.md`.
