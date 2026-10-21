# Lexica: làm lại giao diện kết quả chấm phát âm (kế hoạch)

Trạng thái: **đã làm** (PR #46), sau khi chủ sản phẩm chốt 3 câu hỏi (mục cuối). Viết ngày 21/10/2026, sau Đợt 6 (`docs/LEXICA_PRONUNCIATION_DESIGN.md`). Những gì làm khác kế hoạch: mục "Đã làm".

## Vấn đề
Phần chấm hiện chỉ có chữ:
- nhãn "Rõ / Gần đúng / Chưa rõ";
- dòng "Máy nghe: …";
- tối đa 2 câu như "Âm /θ/ trong “think” có thể nghe như /s/".

Người học phải tự đọc và hình dung. Họ không **nhìn** thấy sai ở chỗ nào trong từ, sai kiểu gì, và sửa thế nào.

## Các app khác làm gì
- **ELSA Speak:**
  - tô màu từng âm của từ: xanh là đúng, vàng là gần đúng, đỏ là sai;
  - có phần trăm cho từng từ và cả câu;
  - chấm từng âm riêng, ví dụ chấm riêng âm "th" trong "thirty";
  - chỉ ra kiểu "âm th trong think nghe gần như tink";
  - có hình miệng 3D chỉ vị trí lưỡi, môi.
  - Nhược điểm người dùng hay kêu: có lúc nói đúng vẫn bị chấm sai.
- **Google Search ("Practice", 2019):**
  - hiện "Sounds like you said", tức cách viết theo âm của những gì máy nghe được;
  - chỉ ra đoạn nào lệch, ví dụ cuối từ "asterisk" nghe như "rict" thay vì "uhsk";
  - đưa mẹo bằng động tác: "đưa cuống lưỡi chạm vòm miệng để chặn hơi, rồi bật ra".
- **Microsoft Pronunciation Assessment:**
  - đánh dấu từ thiếu (omission), từ thừa (insertion) và từ phát âm sai;
  - có bảng tổng hợp loại lỗi, bật tắt được từng loại;
  - rê chuột lên từ thì thấy điểm từng âm.
- **BoldVoice:** phân tích từng âm, có hình miệng minh hoạ cách phát âm, so giọng mình với giọng mẫu.

**Nghiên cứu nói gì:**
- **Phản hồi sửa lỗi rõ ràng hiệu quả hơn.** Một phân tích tổng hợp về nhận dạng giọng nói trong luyện phát âm cho thấy:
  - hiệu quả chung ở mức vừa (g = 0,69);
  - loại có **phản hồi sửa lỗi rõ ràng** hiệu quả nhất, loại gián tiếp (chỉ hiện chữ máy nghe được) kém hơn;
  - tác dụng lớn với **âm** (segmental), nhỏ với ngữ điệu (suprasegmental).
- **Phân tích tổng hợp Lee, Jang & Plonsky (2015)** về dạy phát âm nói chung: hiệu quả lớn hơn khi **có phản hồi**.
- **Chỉ tô màu hay cho phần trăm không nói được phải sửa gì.** Người học không biết ngữ âm cần phản hồi gắn với **động tác cụ thể của miệng** (nghiên cứu V(is)owel; mẫu nhỏ, 8 người, chỉ là gợi ý).
- **Hình ảnh không tự nhiên giúp ích:** có nghiên cứu thấy thêm phản hồi hình ảnh không cải thiện rõ rệt. Hình phải chỉ đúng điều cần sửa.

**Rút ra cho Lexica:**
1. Chỉ **chỗ sai ngay trên từ** (tô màu từng âm), không chỉ bằng câu chữ.
2. Mỗi chỗ sai luôn đi kèm 3 thứ:
   - bạn nói giống gì;
   - đúng phải là gì;
   - làm thế nào: hình miệng và một câu động tác.
3. **So sánh bằng tai** ngay tại chỗ: nghe từ đúng, nghe từ mình nói giống, nghe giọng mình.
4. **Không chấm 0–100** (quy ước của dự án). Thay bằng "Rõ 3/4 âm" và màu.
5. **Nói thật về độ chắc:** chỗ máy không chắc thì để màu nhạt và dùng chữ "có thể". Đây cũng là cách tránh lỗi "nói đúng vẫn bị chấm sai" mà người dùng ELSA hay phàn nàn.

## Giao diện đề xuất

### 1. Thẻ kết quả một từ (bước "Nghe mẫu rồi nói")
```
 ┌──────────────────────────────────────┐
 │  think                     Rõ 3/4 âm │
 │  ┌───┐ ┌───┐ ┌───┐ ┌───┐             │
 │  │ θ │ │ ɪ │ │ ŋ │ │ k │   ← chip âm  │
 │  │ th│ │ i │ │ng │ │ k │   ← chữ cái  │
 │  └───┘ └───┘ └───┘ └───┘             │
 │   đỏ    xanh  xanh  xanh             │
 │                                      │
 │  Máy nghe giống: “sink”              │
 │  ▶ Giọng bạn   ▶ Giọng mẫu           │
 └──────────────────────────────────────┘
```
- **Hàng chip âm:** mỗi âm một ô, trên là ký hiệu IPA, dưới là chữ cái tương ứng trong từ ("th", "i", "ng", "k").
- **Màu và ký hiệu:**
  - xanh ✓ là rõ;
  - vàng ~ là có thể chưa rõ;
  - đỏ ! là gần như chắc chưa đúng;
  - xám là máy không đo được.
  - Có thêm ký hiệu để người mù màu vẫn phân biệt được, và dùng token màu của theme để hợp chế độ tối.
- **"Rõ 3/4 âm":** đếm số âm, không phải điểm.
- **Khi chưa tải gói chấm:** chỉ âm nào máy đoán được (qua từ nghe nhầm) mới có màu, các âm khác để xám. Không tô xanh những âm máy không kiểm.

### 2. Bấm vào một âm đỏ hoặc vàng: bảng chi tiết (trượt lên từ dưới)
```
 ┌──────────────────────────────────────┐
 │  Âm /θ/ (th)                    ✕    │
 │  Bạn nói giống /s/  →  đúng là /θ/   │
 │                                      │
 │   [hình miệng: lưỡi giữa 2 răng]     │
 │   Đặt đầu lưỡi giữa hai hàm răng,    │
 │   thổi hơi ra. Không chạm lợi như /s/│
 │                                      │
 │  ▶ think (đúng)   ▶ sink (bạn nói giống)│
 │  ▶ Giọng bạn                         │
 │                                      │
 │  [ 🎙 Thử lại từ này ]                │
 └──────────────────────────────────────┘
```
- **Dòng so sánh:** "Bạn nói giống /s/ → đúng là /θ/". Âm mất thì ghi "Bạn bỏ mất /t/".
- **Hình miệng:** 11 hình đơn giản (SVG mặt cắt nghiêng), mỗi nhóm lỗi một hình. Vẽ một lần, dùng màu theo theme.
- **Ba nút nghe đặt cạnh nhau:** từ đúng, từ mình nói giống (cặp từ dễ nhầm), giọng mình. Để so sánh bằng tai ngay tại chỗ.
- **"Thử lại từ này":** ghi lại ngay trong bảng, chip đổi màu luôn.

### 3. Cụm và câu (bước "Nói trong cụm", câu mẫu Tình huống)
```
  keep   in   mind
  ✓      ✓    ~
             └ bấm: hiện chip âm của “mind”
```
- Giữ cách đánh dấu từng từ như hiện tại (đúng, thiếu, nghe thành từ khác), nhưng **gọn lại**: chỉ một dấu dưới mỗi từ.
- Bấm vào một từ thì hiện hàng chip âm của từ đó (như thẻ một từ). Có gói chấm thì chấm được từng âm trong cụm.
- Bỏ đoạn chú thích dài "gạch / đỏ / chấm". Thay bằng một dòng chú thích nhỏ có ký hiệu màu.

### 4. Trọng âm: chấm to, chấm nhỏ
```
  Mẫu:  a  ·  BUN  ·  dant        •  ●  •
  Bạn:  A  ·  bun  ·  dant        ●  •  •   ← đỏ
```
- Mỗi âm tiết một chấm, âm tiết được nhấn là chấm to. Hai hàng "Mẫu" và "Bạn" đặt thẳng nhau, chỗ lệch tô đỏ.
- Chỉ hiện khi đo được (mức 3). Không đo được thì chỉ hiện hàng "Mẫu" để người học biết nhấn chỗ nào.

### 5. Ngữ điệu và tốc độ (cụm, câu)
- **Đường cao độ:** giữ biểu đồ hai đường (giọng mẫu và giọng bạn), thêm mũi tên ở cuối câu: "↘ mẫu xuống · ↗ bạn lên". Hiện cả trên điện thoại, nhưng gọn hơn.
- **Tốc độ:** một thanh "chậm · vừa · nhanh" có vạch chỉ chỗ của bạn so với giọng mẫu.
- **Chỗ ngắt:** vạch dọc trên dòng chữ của cụm, đúng vị trí bạn ngừng.

### 6. Tóm tắt sau buổi luyện
- **Màn tổng kết 5 từ:** mỗi từ một hàng chip âm thu nhỏ, để thấy ngay âm nào hay đỏ.
- **"Âm hay sai"** (đã có, PR #46): thêm ô nhỏ "trước / bây giờ" của nhóm âm vừa luyện, và nút "Luyện 2 phút".

## Phần kỹ thuật cần thêm
1. **Ghép chữ cái với âm** (grapheme–phoneme alignment): để dưới chip "θ" hiện "th".
   - Dùng bảng chữ ↔ âm của tiếng Anh (khoảng 150 cặp phổ biến) và căn bằng quy hoạch động.
   - Không căn được thì chỉ hiện IPA.
   - Hàm thuần, có test với 200 từ trong kho thẻ.
2. **Mức màu cho từng âm** (từ điểm 0–2 của mô hình):
   - xanh: từ 1,3 trở lên;
   - vàng: 0,8–1,3;
   - đỏ: dưới 0,8 (ngưỡng mới).
   - Không có mô hình: âm máy đoán sai qua từ nghe nhầm thì vàng, còn lại xám.
3. **11 hình miệng SVG**, mỗi nhóm lỗi một hình. Dùng chung cho bảng chi tiết, "Luyện 2 phút" và trang "Âm hay sai".
4. **Bảng chi tiết dạng bottom sheet:** dùng `framer-motion` (đã có), vừa 390px, có nút đóng, đóng được bằng phím Esc.
5. **"Thử lại từ này" trong bảng:** dùng lại hàm ghi âm và chấm hiện có, kết quả mới thay hàng chip.
6. **Kiểm tra:**
   - test thuần cho ghép chữ–âm và mức màu;
   - Playwright chụp 390px sáng/tối cho: thẻ một từ, bảng chi tiết, cụm, trọng âm;
   - thử với micro giả như các lần trước.

## Chia việc
| Bước | Nội dung | Cỡ |
|---|---|---|
| 1 | Hàng chip âm và màu, "Rõ 3/4 âm", ghép chữ–âm | M |
| 2 | Bảng chi tiết, 3 nút nghe, thử lại tại chỗ | M |
| 3 | 11 hình miệng SVG | M (phần lớn là vẽ) |
| 4 | Trọng âm chấm to/nhỏ; mũi tên ngữ điệu, thanh tốc độ, vạch chỗ ngắt | S–M |
| 5 | Cụm và câu gọn lại, bấm từ ra chip; màn tổng kết | S |

Đề xuất làm thành **1 PR** (bước 1, 2, 4, 5) cộng **1 PR riêng cho hình miệng** (bước 3), vì phần hình cần chủ sản phẩm duyệt nét vẽ.

## Đã chốt (21/10/2026)
1. **Xem từng âm là tính năng của gói chấm: muốn dùng thì tải.** Vì vậy:
   - nút "Tải gói chấm" hiện cho mọi người học, không chỉ người thử nghiệm;
   - chưa tải thì không có hàng ô âm, chỉ có phần đoán qua từ nghe nhầm như cũ.
2. **Tự vẽ hình miệng SVG**, miễn đủ rõ để hướng dẫn.
3. **Bỏ con số** "Rõ 3/4 âm": chỉ còn màu và ký hiệu.

## Đã làm (PR #46)

### Mã
- `lib/pronunciation/graphemes.ts`: ghép chữ cái với âm. Căn đủ 555/555 từ của kho thẻ có trong từ điển.
- `lib/pronunciation/chips.ts`: mức màu (xanh từ 1,3; vàng 0,8–1,3; đỏ dưới 0,8) và lỗi của từng ô.
- `lib/pronunciation/mouth.ts` và `components/pron/Mouth.tsx`: hình miệng nhìn nghiêng.
  - Tư thế theo **vị trí cấu âm của âm đúng**, không theo nhóm lỗi. Có 18 tư thế, đủ cho mọi âm mô hình chấm.
  - Mỗi hình có vòng tròn ở chỗ chạm, đường hơi đi, đường hơi qua mũi với âm mũi, dấu rung ở cổ họng với âm hữu thanh.
  - Kèm một câu chỉ động tác, và câu "rung / không rung cổ họng".
- `components/pron/SoundTips.tsx`:
  - hàng ô âm, mỗi từ một hàng (cụm có nhiều hàng);
  - bảng chi tiết trượt từ dưới lên, gồm: "bạn nói giống / bạn bỏ mất âm → đúng là", hình miệng, nghe từ đúng, nghe từ mình nói giống, nghe giọng mình, "Thử lại từ này";
  - với người thử nghiệm: trọng âm bằng chấm to/nhỏ, thanh tốc độ.
- **Đường cao độ** (máy tính) ghi hướng cuối câu: "mẫu ↘ xuống · bạn ↗ lên".
- **Màn tổng kết:** mỗi từ có hàng ô nhỏ theo màu từng âm.

### Khác với kế hoạch
- **Hình miệng theo vị trí cấu âm**, không phải 11 hình theo nhóm lỗi. Ví dụ nhóm "mất phụ âm cuối" cần hình khác nhau cho /t/, /k/, /s/.
- **Ẩn nhãn "Rõ / Gần đúng / Chưa rõ"** của máy nhận dạng khi đã có hàng ô âm. Nhãn đó chỉ nói máy có nghe ra đúng từ không, nên dễ mâu thuẫn với ô đỏ.
- **Trọng âm luôn tách âm tiết theo năng lượng.** Thử trên giọng thật cho thấy dùng thời gian nguyên âm của mô hình làm lượt nhấn đúng bị báo sai.
- **Nhóm "Đuôi -s, -ed"** chỉ áp dụng cho từ viết bằng -s, -es, -ed. /t/ cuối của "abundant" giờ là "Mất phụ âm cuối".

### Đã kiểm
- Test thuần cho ghép chữ–âm, mức màu, hình miệng.
- Playwright với micro giả phát chính bản ghi "abundant" của chủ sản phẩm (từ `/ghi-am`):
  - **lượt đọc đúng:** 8 ô xanh, trọng âm khớp mẫu;
  - **lượt cố tình nhấn sai:** báo nhấn "A-bun-dant", nên nhấn "a-BUN-dant";
  - bảng chi tiết của ô đỏ mở đúng.

## Nguồn
- ELSA, mô tả màu và cách chấm: https://iastatedigitalpress.com/psllt/article/15397/galley/13528/view, https://learnenglish.life/reviews/elsa-speak/, https://makeheadway.com/blog/elsa-speak-review/
- Google Search Practice (2019): https://9to5google.com/2019/11/14/google-search-pronunciation/, https://www.engadget.com/2019-11-14-google-search-pronunciations.html
- Microsoft Pronunciation Assessment: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool
- BoldVoice: https://boldvoice.com/blog/best-english-pronunciation-apps
- Phân tích tổng hợp ASR trong luyện phát âm (ReCALL): https://resolve.cambridge.org/core/journals/recall/article/effectiveness-of-automatic-speech-recognition-in-eslefl-pronunciation-a-metaanalysis/A915444CF252B61D14961D2FE733822D
- Lee, Jang & Plonsky (2015): https://experts.nau.edu/en/publications/the-effectiveness-of-second-language-pronunciation-instruction-a-/
- V(is)owel, phản hồi hình ảnh trong luyện phát âm: https://arxiv.org/abs/2507.06202v1
