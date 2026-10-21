# Lexica: chấm phát âm trên máy người học (thiết kế Đợt 6)

Trạng thái: **PR (a) đã làm** (PR #45, mục 11): mức 1, mức 2 có gói chấm trên máy (ẩn sau cờ) và cách dự phòng 5.3. Việc tiếp theo: đưa gói lên Supabase, ghi âm giọng Việt, rồi PR (b).

## Tóm tắt (đọc phần này là đủ)
- **Mục tiêu:** người học nói xong biết sai **ở âm nào** và **sửa thế nào**, không chỉ nhận "Chưa rõ".
- **Cách làm:** một mô hình nhỏ (27MB) **chạy ngay trên máy người học**.
  - Tải khi người học bấm; file đặt trên Supabase Storage.
  - Mô hình chấm từng âm của từ mẫu trong khoảng 0,3–0,5 giây.
  - Mỗi lần nói, app báo tối đa 2 âm "có thể chưa rõ", kèm mẹo sửa cho lỗi hay gặp của người Việt.
- **Bốn mức, làm trong 3 PR:**
  - (a) so từ trong câu + chấm từng âm;
  - (b) âm cuối, trọng âm, ngữ điệu, tốc độ;
  - (c) sổ âm hay sai theo thời gian, bài luyện tự gợi ý, và số liệu cho giáo viên.
- **Trước khi bật cho người dùng:** 3–5 người Việt ghi âm 20 từ bằng trang `/ghi-am` (quy trình: `docs/LEXICA_PRONUNCIATION_RECORDING.md`). Đạt khi app bắt đúng ≥ 60% lỗi và báo oan ≤ 20%.

Cập nhật 20/10/2026:
- người dùng cho phép dùng AI **chạy trên máy người học**;
- đã thử nghiệm các mô hình, kết quả ở `docs/LEXICA_PRONUNCIATION_SPIKE.md`;
- mức 2 và một phần mức 3 đổi sang mô hình âm vị trên máy.

Tiếp nối T8 trong `docs/LEXICA_FEEDBACK_TASKS.md`. Giai đoạn 1 của T8 đã xong: bài "Luyện nói", chấm 3 mức Rõ / Gần đúng / Chưa rõ, cặp gần âm, mẹo theo lỗi, đường cao độ, danh sách từ khó nói.

## 1. Mục tiêu

Người học nói xong thì biết **sai ở đâu** và **sửa thế nào**, không chỉ nhận "Chưa rõ":
- sai từ nào trong câu;
- âm nào có thể sai (ví dụ /θ/ thành /t/, mất âm cuối);
- nhấn sai âm tiết, xuống giọng sai, nói quá nhanh hay ngắt sai chỗ;
- theo thời gian: âm nào mình hay sai, và đã đỡ chưa.

Câu hỏi của mọi tính năng (theo quy tắc của T8): *"Nó giúp người học nói rõ hơn thế nào?"*. Không trả lời được thì cắt.

### AI được dùng thế nào
- **Được:** mô hình **chạy trên máy người học** (ONNX trong trình duyệt). Âm thanh không rời máy để chấm.
  - Mô hình chính: `vb223/whisper-base-en-phoneme-ctc` (MIT), bản int8 26,6MB, ngữ cảnh 5 giây.
  - Chỉ dùng mô hình có giấy phép cho phép **thương mại** (MIT, Apache-2.0). ZIPA và BranchShine bị loại vì CC BY-NC-SA.
- **Không:** gọi LLM hay API trả phí để chấm; gửi âm thanh lên server để chấm.
- **Vẫn dùng:**
  - Web Speech (có sẵn trong trình duyệt) để hiện "máy nghe được gì" và so từ (mức 1);
  - từ điển phát âm mở (CMUdict);
  - Web Audio (cao độ, khoảng lặng);
  - luật viết tay (thư viện lỗi của người Việt).
- **Gemini** (`/v1/lexica/transcribe`, khi trình duyệt không nghe được) chỉ để hiện chữ. Không dùng để chấm âm hay ghi sổ lỗi.
- **Gói chấm phát âm chỉ tải khi người học bấm** ("Tải gói chấm phát âm, 27MB"). Đã chốt: không tự tải, kể cả khi dùng Wi-Fi.
  - lưu vào Cache Storage, lần sau không tải lại;
  - chưa tải thì mức 2 dùng cách cũ: đoán qua từ máy nghe nhầm (5.4).

## 2. Giới hạn phải nói thật với người học

- Nhận dạng giọng nói **không phải** chấm phát âm. Máy hay "tự sửa": người học nói gần đúng thì máy vẫn ra đúng từ. Vì vậy:
  - máy nghe ra **từ khác** là tín hiệu mạnh;
  - máy nghe ra **đúng từ** chưa chắc là đã phát âm đúng.
- Chấm âm bằng mô hình cũng chỉ là **ước lượng**. Ở ngưỡng đề xuất, khoảng 2/3 lần báo khớp với người chấm, và mô hình bỏ sót khá nhiều (thử nghiệm, mục "Ngưỡng báo lỗi"). Lời luôn dùng "có thể", kèm cách tự kiểm tra (nghe lại giọng mình cạnh giọng mẫu).
- Mô hình mới được kiểm trên giọng người Trung Quốc (speechocean762). Chưa kiểm trên giọng Việt thì chưa bật cho người dùng (mục 8).
- Đo bằng Web Audio (mức 3) nhạy với ồn và micro. Mỗi chỉ số có ngưỡng tin cậy; dưới ngưỡng thì không nói gì, còn hơn nói sai.
- Không chấm điểm số kiểu 0–100. Chỉ báo điều cụ thể sửa được, khen khi tiến bộ (quy ước của dự án).

## 3. Kiến trúc

```
                 ┌──► Web Speech: transcript + alternatives (đã có) ──► Mức 1: so khớp từ
Ghi âm (đã có) ──┤
                 ├──► Mô hình âm vị trên máy (ONNX, Web Worker):
                 │      log-mel → CTC → căn theo âm CMUdict → GOP → điểm 0–2 mỗi âm
                 │      ──► Mức 2: âm nào chưa rõ; mốc thời gian từng âm
                 │
                 └──► Web Audio: cao độ, khoảng lặng ──► Mức 3 (dùng mốc thời gian ở trên)
                                      │
                         Kết quả một lần nói (thuần, có test)
                                      │
                                      ▼
            Mức 4: sổ lỗi theo thời gian, bài luyện tự giao, số liệu cho giáo viên
```

- Mọi phần chấm là **hàm thuần** trong `apps/lexica/app/lib/pronunciation/`, test bằng vitest với dữ liệu cố định. Âm thanh mẫu là file WAV nhỏ trong `__tests__/fixtures`.
- Chạy hoàn toàn trên máy người học. Không có bảng mới trên server, trừ phần số liệu cho lớp ở mức 4.
- Mô hình chạy trong **Web Worker** (onnxruntime-web, WASM; dùng 4 luồng khi trang được cross-origin isolated), để không đứng giao diện.
- File mô hình (26,6MB) và bộ hồi quy dạng JSON (khoảng 250KB) đặt trên **Supabase Storage** (đã chốt), cùng bucket công khai với content pack. Có kiểm sha256 và tên file có phiên bản (`pron-model-v1.onnx`), để đổi mô hình mà không vỡ cache.
- Giọng mẫu để so (mức 3): giọng tự nhiên đã sinh sẵn và cache trên Cortex API (`naturalVoiceUrl`). Đây là nội dung, không phải chấm điểm. Giọng hệ thống (`speechSynthesis`) không ghi lại được nên không dùng để so.

## 4. Mức 1: so khớp từ với câu mẫu

**Dùng cho:**
- cụm "Hay đi với" (collocations);
- câu mẫu Tình huống của thẻ Giao tiếp (`situation.model`, 40 thẻ);

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

## 5. Mức 2: âm vị (mô hình trên máy và CMUdict)

### 5.1 Từ điển
- **CMUdict** (giấy phép BSD-2): 134k từ, phiên âm ARPAbet có trọng âm, ví dụ `THINK  TH IH1 NG K`.
- Mô hình chấm theo đúng chuỗi âm **có trọng âm** của từ mẫu (như `TH IH1 NG K`), nên từ điển là đầu vào bắt buộc của mức 2.
- Không gửi cả từ điển xuống máy. Bản rút gọn được tạo lúc build bằng `scripts/build-cmudict.mjs`, gồm:
  - mọi từ trong thẻ, cụm và câu mẫu;
  - các từ trong cặp gần âm;
  - 10.000 từ tiếng Anh thông dụng nhất (để tra từ mà máy nghe nhầm thành).
- Ước tính khoảng 12.000 mục, ~300KB, nén gzip ~90KB. Tải lười khi mở bài Luyện nói.
- Từ không có trong CMUdict: lấy IPA của thẻ (đã có) đổi sang ARPAbet bằng bảng ánh xạ. Không có cả hai thì bỏ qua mức 2 cho từ đó.

### 5.2 Chấm từng âm bằng mô hình trên máy (cách chính)
1. Lấy chuỗi âm của từ hoặc cụm mẫu từ CMUdict.
2. Bản ghi được cắt khoảng lặng hai đầu (tối đa 5 giây; cụm dài hơn thì chia theo khoảng lặng), rồi tính log-mel giống Whisper.
3. Chạy mô hình ra log-xác suất của từng âm theo khung 20ms.
4. **Căn CTC theo chuỗi âm mẫu** (Viterbi có blank). Mỗi âm có một đoạn thời gian.
5. Tính đặc trưng GOP mỗi âm (trung bình, thấp nhất, âm cạnh tranh mạnh nhất, độ dài), rồi đưa qua bộ hồi quy 300 cây để ra **điểm 0–2**.
6. Âm có điểm < **0,6** (ngưỡng chỉnh khi kiểm trên giọng Việt) là "có thể chưa rõ".
   - Âm cạnh tranh mạnh nhất cho biết "nghe như âm gì", ví dụ /θ/ nghe như /s/.
   - Tra bảng 5.4 để ra tên lỗi và mẹo.
7. Mỗi lần nói báo **tối đa 2 âm** điểm thấp nhất, ưu tiên lỗi có trong thư viện.

Không nhận dạng tự do rồi so chuỗi âm: thử nghiệm cho thấy cách đó báo sai rất nhiều (F1 0,14–0,20).

### 5.3 Khi chưa tải gói: đoán qua từ máy nghe nhầm
Chỉ chạy khi mức 1 báo `swapped`: máy nghe ra một **từ có thật khác** (ví dụ nói *think*, máy nghe *sink*).
1. Tra phiên âm của từ đích và từ máy nghe được.
2. Căn hai dãy âm vị bằng edit distance có trọng số: thay âm gần nhau (/θ/–/s/, /iː/–/ɪ/) rẻ hơn thay âm xa.
3. Mỗi chỗ lệch được ánh xạ vào **thư viện lỗi của người Việt** (5.4). Chỗ lệch không khớp mẫu nào thì báo chung: "âm … nghe như …".
4. Gộp kết quả: tối đa **2 âm** mỗi lần nói, ưu tiên lỗi có trong thư viện.

Khi máy nghe ra đúng từ, cách này không đoán được gì. Đó là lý do mô hình (5.2) là cách chính.

### 5.4 Thư viện lỗi hay gặp của người Việt
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
- Có test cho:
  - log-mel: so với giá trị của Python trên một file WAV mẫu;
  - căn CTC và GOP: log-xác suất giả lập;
  - bộ hồi quy JSON: ra cùng điểm với scikit-learn trên 100 dòng mẫu;
  - ánh xạ mỗi nhóm lỗi (≥ 2 ví dụ mỗi nhóm), từ không có trong từ điển, giới hạn 2 âm.
- Chạy trên một điện thoại Android tầm trung: ≤ 1,5 giây mỗi lần chấm.
- Kích thước bản CMUdict rút gọn được kiểm trong CI (≤ 400KB).

## 6. Mức 3: Web Audio và mốc thời gian từng âm

Chạy trên bản ghi (`AudioBuffer`) sau khi nói xong, không chạy thời gian thực. Có sẵn bộ dò cao độ (`lib/pronunciation/pitch.ts`).

### 6.1 Mất âm cuối
- **Có gói chấm:** dùng thẳng điểm của phụ âm cuối từ mô hình (5.2). Trên câu ngắn, mô hình tách âm cuối sai với âm cuối đúng rất tốt (AUC 0,90–0,94). Cách đo năng lượng dưới đây chỉ dùng khi chưa tải gói.
- Chỉ áp dụng cho **từ đơn** có phụ âm cuối (theo CMUdict), như bước "Nghe mẫu rồi nói".
- Tìm đoạn có giọng cuối cùng (cao độ còn dò được), rồi đo trong 40–250ms sau đó:
  - âm xát (S, Z, SH, TH, F): năng lượng dải cao trên 3kHz (lọc high-pass);
  - âm tắc (T, D, K, P…): có tiếng nổ ngắn (đỉnh năng lượng sau khoảng lặng ngắn).
- So với cùng phép đo trên **giọng mẫu** của từ đó, chuẩn hoá theo mức ồn nền đo ở 200ms đầu bản ghi.
- Kết quả: "âm cuối rõ", "âm cuối yếu", hoặc **không kết luận** (ồn quá, hoặc bản ghi bị cắt sát).

### 6.2 Trọng âm (từ nhiều âm tiết)
- Có gói chấm: lấy đoạn thời gian của từng nguyên âm từ bước căn CTC (5.2). Không có thì tách âm tiết bằng đỉnh của đường năng lượng, làm mượt 30ms.
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
- Ngắt nghỉ là khoảng lặng trên 300ms ở giữa câu. Có gói chấm thì bước căn CTC cho mốc thời gian từng âm, nên biết được ngắt sau từ nào. Không có thì chỉ báo số chỗ ngắt và vị trí trên đường vẽ.

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
- Đã chốt: làm nếu không phức tạp, và thực tế là không phức tạp:
  - một trường JSON nhỏ trong metrics sẵn có (tối đa 11 nhóm × 2 số);
  - không có bảng mới, không có RPC mới.
- Cần sửa `packages/classroom-lexica/sql/classroom_lexica.sql` (`clean_metrics` lọc thêm `sounds`: chỉ nhận đúng các tên nhóm, số trong khoảng 0–10.000) và `parseMetrics`.
- Người dùng phải chạy lại file SQL sau khi merge.
- Câu cho học viên ở chỗ vào lớp sửa thành: "giáo viên thấy 4 con số Hiểu, Nhớ, Gặp, Dùng và **số lần sai theo từng nhóm âm**".

## 8. Kiểm định trước khi bật

- **Mức 1:** bộ test với transcript giả lập. Không cần dữ liệu âm thanh.
- **Mức 2 (mô hình), đã làm một phần** (`docs/LEXICA_PRONUNCIATION_SPIKE.md`):
  - trên speechocean762, câu ≤ 4,8 giây, bản int8 5 giây: AUC 0,91, âm cuối AUC 0,90–0,94;
  - ở ngưỡng 0,5–0,8, khoảng 2/3 số âm bị báo cũng bị người chấm cho là chưa chuẩn.
  - Còn thiếu: **giọng Việt** (bộ ghi âm nội bộ bên dưới, chạy cùng script) và **điện thoại thật**.
  - Điều kiện bật cho người dùng:
    - trên bộ ghi âm giọng Việt, bắt đúng ≥ 60% lượt đọc sai và báo oan ≤ 20% lượt đọc đúng (`evalvi.py`);
    - chấm ≤ 1,5 giây trên Android tầm trung.
- **Bộ ghi âm giọng Việt** (quy trình chi tiết: `docs/LEXICA_PRONUNCIATION_RECORDING.md`):
  - trang `/ghi-am` trong Lexica, script chấm `evalvi.py`;
  - 20 từ × 2 lượt (đúng, sai có chủ ý), 3–5 người, khoảng 10 phút mỗi người.
- **Mức 3:**
  - Hai từ trọng âm trong bộ ghi âm trên (và thêm từ nếu cần khi làm mức 3). Mục tiêu:
    - âm cuối: đúng ≥ 80% trên các lần app có kết luận, và app "không kết luận" ≤ 30%;
    - trọng âm: đúng ≥ 75% với từ 2–3 âm tiết.
  - **speechocean762** (CC BY 4.0; 5.000 câu, có điểm từng âm, người nói là người Trung Quốc): dùng để kiểm mức "âm cuối yếu" có tương quan với điểm âm cuối của bộ dữ liệu không. Tham khảo thôi, không phải ngưỡng chính.
- Chưa đạt ngưỡng thì phép đo đó ở chế độ **ẩn**: chỉ ghi vào sổ để xem dữ liệu (trên máy), không hiện cho người học.
- Script kiểm định:
  - `apps/lexica/scripts/pronunciation-spike/evalmdd.py` cho speechocean762;
  - `evalvi.py` cho file zip từ `/ghi-am`.

  Không đưa vào CI vì dữ liệu ghi âm không commit vào repo.

## 9. Đã chốt (20/10/2026)

1. Được dùng AI **chạy trên máy** người học.
   - Web Speech chỉ dùng để hiện chữ và so từ.
   - Gemini chỉ để hiện chữ.
2. **3 PR:**
   - (a) mức 1, mức 2 có gói chấm trên máy (ẩn sau cờ cho tới khi qua kiểm định giọng Việt), và cách dự phòng 5.3;
   - (b) mức 3, desktop trước, các phép đo chưa đạt kiểm định thì ẩn;
   - (c) mức 4, gồm cả SQL cho giáo viên.
3. **Ghi âm kiểm định:** có người ghi. Quy trình phải đơn giản, đầu vào và đầu ra rõ ràng: `docs/LEXICA_PRONUNCIATION_RECORDING.md`, trang `/ghi-am`, script `evalvi.py`.
4. **File mô hình** đặt trên Supabase Storage.
5. **Chỉ tải gói khi người học bấm.**
6. **Giáo viên thấy số lần sai theo nhóm âm**, vì phần này không phức tạp (mục 7.3).
7. **Không** dùng "Câu của bạn" làm câu mẫu.

## 10. Ước lượng

| Phần | Cỡ | Ghi chú |
|---|---|---|
| Mức 1: căn từ, hiển thị | M | thuần, test dễ |
| Mức 2: CMUdict rút gọn, thư viện lỗi, cách dự phòng 5.3 | M | script build từ điển, bảng IPA → ARPAbet |
| Mức 2: gói chấm trên máy (log-mel, căn CTC, GOP, hồi quy JSON, Worker, tải và cache) | L | thử nghiệm đã chứng minh chạy được; còn kiểm định giọng Việt và đo trên điện thoại |
| Mức 3: âm cuối, trọng âm, ngữ điệu, tốc độ | L | phần khó nhất, cần kiểm định |
| Mức 4: sổ lỗi, bài tự giao, giáo viên | M | có SQL |

## Nguồn
- CMU Pronouncing Dictionary: https://github.com/cmusphinx/cmudict (BSD-2)
- speechocean762: https://www.openslr.org/101/ (CC BY 4.0)
- Mô hình chấm âm: https://huggingface.co/vb223/whisper-base-en-phoneme-ctc (MIT, dựa trên Whisper base.en của OpenAI, MIT)
- Thử nghiệm và so sánh các mô hình: `docs/LEXICA_PRONUNCIATION_SPIKE.md`
- Các nguồn HVPT, phản hồi cao độ và lỗi của người Việt: xem T8 trong `docs/LEXICA_FEEDBACK_TASKS.md`.

## 11. Đã làm trong PR (a) (PR #45)

### Mã
Mọi file ở `apps/lexica/app/lib/pronunciation/`. Phần chấm đều là hàm thuần, có test.
- `align.ts`: mức 1.
- `phones.ts`: CMUdict rút gọn, đổi IPA sang ARPAbet, quy tắc trọng âm cho mô hình.
- `sounds.ts`: thư viện 11 nhóm lỗi, đoán qua từ máy nghe nhầm, đọc kết quả mô hình.
- `feedback.ts`: chọn tối đa 2 âm để báo.
- `model/`: log-mel, căn CTC, GOP, bộ hồi quy, worker, tải và cache gói (`client.ts`).

### Người học thấy gì
- **Bước "Nghe mẫu rồi nói":** tối đa 2 âm "có thể chưa rõ", mỗi âm kèm mẹo sửa, nút nghe từ mẫu và cặp từ dễ nhầm.
- **Bước "Nói trong cụm":** cả cụm hiện từng từ với dấu:
  - gạch ngang: máy không nghe thấy;
  - đỏ: máy nghe thành từ khác;
  - gạch chấm: máy chưa chắc.
- **Tình huống (thẻ Giao tiếp):** nút "Nói theo câu mẫu". Bấm thì người học đọc câu mẫu và thấy từng từ được đánh dấu. Câu tự đặt của người học vẫn không dùng làm mẫu.
- **Đóng vai trong hội thoại:** câu chưa rõ hiện từng từ được đánh dấu.
- **Gói chấm** (chỉ khi bật cờ):
  - mời tải ở trang Luyện nói và sau mỗi lần nói;
  - trang Cài đặt có nút xoá gói và tắt thử nghiệm.

### Khác với thiết kế
- **Trọng âm của từ một âm tiết.** Mô hình học trên speechocean762, nơi nguyên âm của từ một âm tiết ghi số 0; CMUdict ghi số 1. Đưa nguyên số 1 vào làm AUC giảm từ 0,92 xuống 0,80 (200 câu). App và `evalvi.py` đổi về 0 trước khi chấm (`modelPhones`). Từ nhiều âm tiết giữ trọng âm của CMUdict: kết quả gần như bằng nhãn gốc (AUC 0,880 so với 0,887).
- **Gói tải về khoảng 38MB, không phải 27MB.** WebAssembly của onnxruntime (11,2MB) cũng tải khi người học bấm và lưu cùng mô hình. Nhờ vậy:
  - lần sau chấm được khi không có mạng;
  - không file nào của gói nằm trong bộ nhớ đệm lúc cài app.
- **Từ điển** (`public/pron/cmudict-v1.json`, 337KB, nén còn khoảng 90KB):
  - gồm 12.000 từ: mọi từ trong nội dung app (khoảng 4.000), cộng các từ thông dụng nhất theo bảng đếm của Peter Norvig (MIT);
  - tải khi mở trang Luyện nói, không nằm trong bộ nhớ đệm lúc cài.
- **Ghép từ ở mức 1.** Từ gần giống (như *think* / *sink*) ghép thành "nghe thành từ khác". Từ hoàn toàn khác thì tính là thiếu một từ, thừa một từ.

### Đã kiểm
- **So với Python:**
  - log-mel: lệch tối đa 0,002;
  - căn âm: khớp đúng từng khung với torchaudio;
  - đặc trưng GOP và điểm: khớp;
  - bộ hồi quy: khớp scikit-learn trên 100 dòng.
- **Chạy trong Chromium** (onnxruntime-web, 1 luồng):
  - 200 câu ngắn của speechocean762, 3.522 âm: AUC 0,905, so với 0,907 khi chạy bằng Python;
  - tương quan điểm 0,98, chênh trung bình 0,017;
  - mỗi lần chấm: log-mel 76ms, mô hình 454ms.
- **Trong app** (Playwright, micro giả): tải gói, kiểm sha256, lưu cache, worker chấm, hiện mẹo.
- **Chưa kiểm:** điện thoại thật, giọng Việt.

### Kiểm định giọng Việt: lần đầu (21/10/2026, 1 người ghi)
1 file zip từ `/ghi-am`: 18 từ chấm âm, mỗi từ đọc đúng 1 lần và đọc sai có chủ ý 1 lần. Ghi bằng điện thoại, không tai nghe.

| Ngưỡng | Bắt đúng lỗi | Báo oan |
|---|---|---|
| 0,6 | 9/18 (50%) | 3/18 (17%) |
| 0,8 | 11/18 (61%) | 3/18 (17%) |

- **Bắt tốt:**
  - mất phụ âm cuối: light, bike, rice, wide, feel, walked;
  - bed thành bet; bỏ /l/ trong cụm play, glass;
  - cheap thành sheep; zoo thành sue.
- **Bỏ sót:** think thành sink, three thành tree, sheep thành ship, leave thành live, thing thành thin, bad thành bed, cats thành cat.
  - Phần lớn là lỗi **thay âm**: mô hình vẫn chấm âm gốc cao.
- **Báo oan:** /p/ và nguyên âm trong play, /g/ và nguyên âm trong glass, /t/ cuối trong walked.
- **Chưa đủ để kết luận:** mới 1 người, 36 lượt. Cần thêm 2–4 người. Nếu kết quả giữ như vậy thì nên đổi ngưỡng `UNCLEAR_BELOW` trong `sounds.ts` từ 0,6 lên 0,8.
