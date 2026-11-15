# Lexica: kế hoạch hai cú đặt cược lớn (11/2026)

Hai tính năng: **Núm vặn** (cả internet của người học chuyển dần sang tiếng Anh) và **Giọng bạn, bản chuẩn** (nghe chính mình nói tiếng Anh chuẩn). Cả hai chạy trên một nền chung là **mô hình người học**.

**Trạng thái:** kế hoạch, chưa có dòng code nào. Các nghiên cứu được nhắc tên là nhớ từ kiến thức, **chưa tra lại nguồn** (danh sách ở mục 6). Các con số về giá, dung lượng, giấy phép đều phải xác minh trước khi chốt.

---

## 0. Nguyên tắc

1. **Thử rẻ trước, xây sau.** Mỗi tính năng có một bản thử 1 tuần với tiêu chí dừng rõ ràng. Không đạt thì dừng, không xây tiếp.
2. **Dạy sai tệ hơn không dạy.** Núm vặn chỉ thay từ khi chắc. Thà thay ít mà đúng.
3. **Không tự chấm điểm cao cho mình.** Tín hiệu ngầm (đọc lướt qua một từ) là bằng chứng yếu, phải được đối chiếu với kiểm tra thật.
4. **Riêng tư mặc định.** Nội dung trang web người học đọc không rời khỏi máy nếu họ không bật. Giọng nói chỉ dùng cho chính chủ, xoá được.
5. **Đo bằng kết quả học**, không đo bằng số lần mở app: độ nhớ sau 7 và 30 ngày, tỉ lệ Biết/Dùng, điểm phát âm.

---

## 1. Nền chung: mô hình người học

### 1.1 Vấn đề của hiện tại
- `apps/lexica/app/lib/srs.ts` là SM-2 nhỏ: mỗi từ có **một** lịch ôn (`ease`, `intervalDays`, `streak`).
- Một lịch duy nhất không phân biệt "nhận ra nghĩa" với "tự dùng được". Đây chính là gốc của khoảng cách Biết – Dùng (#137).

### 1.2 Thiết kế
Mỗi từ có **4 tầng**, mỗi tầng một trạng thái trí nhớ riêng:

| Tầng | Nghĩa là | Bằng chứng đến từ |
|---|---|---|
| `recog` | Thấy thì hiểu | Quẹt thẻ, câu ôn chọn đáp án, Núm vặn (đọc) |
| `recall` | Tự nhớ ra khi được gợi ý | Điền từ, game gõ từ |
| `produce` | Dùng đúng trong câu của mình | Luyện nói, nhật ký viết, Oratio |
| `wild` | Dùng ngoài đời | Núm vặn chiều viết |

- **Trạng thái mỗi tầng:** `{ stability, difficulty, lastAt, reps, lapses }` theo mô hình kiểu FSRS (độ vững, độ khó, xác suất còn nhớ tính từ thời gian đã trôi qua).
- **Nhật ký bằng chứng:** mỗi lần người học chạm vào một từ ghi một dòng `{ wordId, facet, source, outcome, weight, at }`.
  - `weight` là độ tin của bằng chứng: câu ôn có đáp án = 1; đọc lướt qua trong Núm vặn = thấp (đề xuất 0,2–0,3, chỉnh theo mục 2.5).
- **Quy tắc mở tầng:** tầng sau chỉ được lên lịch khi tầng trước đủ vững (ví dụ xác suất còn nhớ sau 7 ngày ≥ 85%).

### 1.3 Chuyển từ SM-2
1. Thêm trường `facets` cạnh các trường cũ, không xoá gì. Bản lưu cũ đọc được như trước.
2. Khởi tạo `recog` từ lịch SM-2 hiện có (`intervalDays` → `stability`). Ba tầng còn lại bắt đầu trống.
3. Chạy song song: lịch ôn vẫn do SM-2 quyết, FSRS chỉ ghi và dự đoán. So dự đoán với kết quả thật trong 2–3 tuần.
4. Khi FSRS dự đoán tốt hơn (sai số xác suất nhớ thấp hơn SM-2 trên dữ liệu thật) thì mới cho nó quyết lịch.

**Chưa biết:** app hiện có lưu đủ lịch sử từng lần trả lời để chạy lại (replay) hay không. Phải kiểm tra `store` và `cloudSync.ts` trước khi ước lượng bước 3.

### 1.4 Việc phải làm
- `app/lib/learner/` (thuần, có unit test): `fsrs.ts`, `facets.ts`, `evidence.ts`.
- Mở rộng kiểu `CardProgress`, đồng bộ qua `cloudSync.ts`, migration SQL chạy lại được.
- Màn "Từ của tôi" hiện 4 tầng cho mỗi từ (đây cũng là phần hiển thị của #137).

**Công sức:** vừa. **Là điều kiện tiên quyết** của Núm vặn (chọn từ nào hiện) và hữu ích cho Giọng bạn (chọn câu nào tạo trước).

---

## 2. Núm vặn

### 2.1 Trải nghiệm
- Một núm vặn 0–100%. Người học đọc báo, Facebook tiếng Việt như thường.
- Một số từ hiện bằng tiếng Anh ngay trong câu, đúng kiểu câu chêm. Chạm vào từ: hiện nghĩa tiếng Việt, nghe phát âm, lưu thẻ.
- Núm vặn tự nhích lên khi người học vững hơn. Người học kéo tay được bất cứ lúc nào.

### 2.2 Bốn nấc của núm vặn
| Nấc | Cái gì chuyển sang tiếng Anh | Khó ở đâu |
|---|---|---|
| 1 | Từ đơn (danh từ, tính từ, động từ nguyên dạng) | Chọn đúng nghĩa |
| 2 | Cụm từ đi kèm ("make a decision") | Khớp cụm tiếng Việt nhiều chữ |
| 3 | Cả mệnh đề | Cần dịch máy, dễ sai ngữ pháp |
| 4 | Cả câu, cả đoạn | Thực chất là dịch + kiểm soát độ khó |

**Kế hoạch này chỉ cam kết nấc 1 và 2.** Nấc 3–4 là hướng đi sau, cần mô hình dịch và một kế hoạch riêng.

### 2.3 Bộ máy thay từ (phần khó nhất)

**Vì sao khó:** tiếng Việt viết rời từng tiếng ("khả thi" là hai tiếng, một từ), và một từ tiếng Việt có nhiều nghĩa. `translationHint` của thẻ là lời giải nghĩa ("Khả thi, có thể thực hiện được"), không phải danh sách từ để khớp.

**Thiết kế hai lớp:**

1. **Lớp 1, chạy trên máy, không cần mạng:**
   - Mỗi thẻ có thêm trường `viTriggers`: danh sách cụm tiếng Việt **chắc chắn** ứng với từ đó, kèm điều kiện loại trừ. Ví dụ `feasible`: khớp "khả thi"; không khớp khi đứng sau "nghiên cứu" (vì "nghiên cứu khả thi" là "feasibility study").
   - Tạo `viTriggers` bằng AI trong Studio, **người duyệt từng thẻ** (khoảng 570 thẻ hiện có).
   - Khớp cụm dài nhất trước, tôn trọng ranh giới từ, bỏ qua tên riêng, số, trích dẫn, mã.
2. **Lớp 2, tuỳ chọn, chạy trên máy chủ:**
   - Với câu lớp 1 không chắc, gửi **riêng câu đó** lên API (Gemini đã có sẵn ở `cortex-core-api`) hỏi "từ X thay vào đây có đúng nghĩa không".
   - Lưu kết quả theo mã băm của câu để không hỏi lại.
   - Mặc định **tắt**. Người học bật thì mới gửi câu lên.

**Dạng của từ tiếng Anh:** dùng dạng gốc như câu chêm hiện tại (không chia thì, không thêm -s), vì ngữ pháp vẫn là tiếng Việt.

**Tiêu chí chất lượng:**
- Bộ kiểm tra: 300 câu thật từ báo tiếng Việt, người gắn nhãn đúng/sai cho từng chỗ thay.
- **Độ chính xác ≥ 95%** thì mới phát hành. Độ phủ (thay được bao nhiêu chỗ) thấp cũng chấp nhận.
- Người học có nút "Thay sai" trên mỗi từ, đi vào hàng duyệt của Studio.

### 2.4 Chọn từ nào để hiện
- **Nguồn:** từ đến hạn ôn ở tầng `recog` (theo mục 1), sau đó đến từ mới ở sát trình độ.
- **Mật độ:** núm vặn quy định tối đa bao nhiêu % số từ trong trang được thay. Giữ để người học vẫn hiểu khoảng 95–98% trang.
- **Giãn cách:** một từ không hiện quá 2 lần trên một trang; từ vừa gặp hôm nay không hiện lại ngay.
- **Từ mới:** tối đa vài từ mới mỗi ngày (mặc định 5), lần đầu hiện kèm nghĩa tiếng Việt nhỏ bên dưới.

### 2.5 Đo trí nhớ không cần hỏi
| Tín hiệu | Hiểu là | Độ tin |
|---|---|---|
| Chạm để xem nghĩa | Quên | Cao |
| Đọc qua, không chạm, đoạn văn có được cuộn qua với tốc độ đọc bình thường | Có thể còn nhớ | Thấp |
| Trang mở rồi đóng ngay | Không tính | 0 |

- **Hiệu chỉnh:** mỗi tuần app hỏi thật 5–10 từ mà tín hiệu ngầm nói "còn nhớ". Tỉ lệ đúng thật quyết định `weight` của tín hiệu ngầm. Nếu tỉ lệ đúng dưới 70% thì hạ `weight` về gần 0.
- Nguyên tắc: tín hiệu ngầm **không bao giờ** tự đẩy một từ lên tầng `recall` hay `produce`.

### 2.6 Chạy ở đâu
| Giai đoạn | Bề mặt | Ghi chú |
|---|---|---|
| D1 | **Trình đọc trong app Lexica**: dán link hoặc dán chữ; trên Android nhận qua nút Chia sẻ (Web Share Target của PWA) | Không cần cài gì thêm. Kiểm chứng được bộ máy |
| D2 | **Tiện ích Chrome trên máy tính** (Manifest V3, content script) | Trải nghiệm "cả internet" thật sự |
| D3 | Safari iOS (tiện ích Safari cần app gốc), Firefox Android | Chrome Android không cho cài tiện ích. Chưa khảo sát chi phí |

- Lấy nội dung bài báo cho trình đọc D1: cần một endpoint ở API tải trang và tách phần chữ. Phải có danh sách tên miền cho phép và giới hạn lượt, tránh bị lạm dụng làm proxy.

### 2.7 Riêng tư
- Lớp 1 chạy hoàn toàn trên máy. Nội dung trang không được gửi đi đâu.
- Danh sách trang **không bao giờ chạy**: ngân hàng, email, trang đăng nhập, trang thanh toán, ô nhập liệu.
- Chỉ ghi lại `{ wordId, outcome, at }`. Không ghi địa chỉ trang, không ghi nội dung.
- Lớp 2 mặc định tắt, có dòng giải thích rõ "câu chứa từ này sẽ được gửi lên máy chủ để kiểm tra nghĩa".

### 2.8 Chiều viết (sau D2)
- Trong ô soạn thảo, người học gõ tiếng Việt chen vào chỗ bí giữa câu tiếng Anh, ví dụ `We need a more [khả thi] plan`.
- Tiện ích đề xuất từ. Người học chọn thì ghi bằng chứng tầng `wild`.
- Đây là nguồn bằng chứng duy nhất cho "dùng ngoài đời", nên là mảnh ghép của #137.

### 2.9 Các chặng và tiêu chí dừng
| Chặng | Làm gì | Thời lượng ước tính | Qua chặng khi |
|---|---|---|---|
| **D0: thử** | Script chạy lớp 1 trên 30 bài báo với `viTriggers` của 50 thẻ; gắn nhãn 300 chỗ thay | 1 tuần | Chính xác ≥ 95%. **Dưới 85% sau khi sửa luật: dừng**, xét lại hướng dùng lớp 2 làm chính |
| D1: trình đọc | `viTriggers` cho toàn bộ thẻ, trình đọc trong app, chạm để xem nghĩa, ghi bằng chứng | 2–3 tuần | 20 người dùng thử, ≥ 50% đọc ≥ 3 bài/tuần; tỉ lệ bấm "Thay sai" < 3% |
| D2: tiện ích | Tiện ích Chrome, núm vặn, danh sách trang cấm, đăng nhập Cortex | 3–4 tuần | Giữ chân tuần 4 của nhóm có tiện ích cao hơn nhóm không có |
| D3: cụm từ | Nấc 2, chiều viết | Sau khi D2 có số liệu | — |

Các mốc thời lượng là ước tính của mình, chưa tính thời gian duyệt `viTriggers` (việc tay, khoảng 570 thẻ).

### 2.10 Thí nghiệm khoa học kèm theo
- **Câu hỏi:** gặp từ trong Núm vặn có thay được phiên ôn không?
- **Cách làm:** chia ngẫu nhiên từ của mỗi người thành 2 nhóm: nhóm A ôn bằng thẻ như cũ, nhóm B chỉ gặp qua Núm vặn. Sau 14 và 30 ngày kiểm tra thật cả hai nhóm.
- **Kết quả dùng để:** quyết định Núm vặn thay phiên ôn, hay chỉ bổ sung cho nó.

### 2.11 Rủi ro
| Rủi ro | Mức | Giảm bằng |
|---|---|---|
| Thay sai nghĩa | Cao | Lớp 1 chỉ dùng luật đã duyệt; tiêu chí 95%; nút "Thay sai" |
| Tách từ tiếng Việt sai | Vừa | Khớp cụm dài nhất, bộ kiểm tra 300 câu |
| Trang web vỡ bố cục khi chèn từ | Vừa | Chỉ thay nút văn bản, không đụng cấu trúc; bỏ qua trang có khung soạn thảo |
| Học thụ động kém hiệu quả hơn tưởng | Vừa | Thí nghiệm 2.10 trả lời trước khi quảng bá |
| Chính sách cửa hàng tiện ích (quyền đọc mọi trang) | Vừa | Xin quyền theo từng trang người học bật; mô tả riêng tư rõ |
| Điện thoại là nơi người Việt đọc nhiều nhất, mà tiện ích chưa chạy ở đó | Cao | D1 (trình đọc + nút Chia sẻ) làm trước cho điện thoại |

---

## 3. Giọng bạn, bản chuẩn

### 3.1 Trải nghiệm
1. Người học đọc một đoạn khoảng 60 giây.
2. Từ đó, câu mẫu trong phần luyện nói có thêm nút **"Giọng của tôi"**: cùng câu đó, giọng của chính họ, phát âm chuẩn.
3. Người học nói nhại theo, app chấm bằng bộ chấm phát âm đã có (`app/lib/pronunciation/`).
4. Màn so sánh: bản họ vừa nói, bản "giọng tôi chuẩn", và chỗ khác nhau theo từng âm.

### 3.2 Hai hướng kỹ thuật
| | A. Tổng hợp giọng theo mẫu (voice cloning TTS) | B. Đổi màu giọng (voice conversion) |
|---|---|---|
| Cách làm | Đưa mẫu giọng + câu chữ, mô hình đọc ra bằng giọng đó | Lấy clip Kokoro đã tạo sẵn, đổi màu giọng sang giọng người học |
| Ưu | Tự nhiên hơn, đọc được câu bất kỳ | Rẻ hơn; phát âm và ngữ điệu giữ nguyên bản chuẩn đã duyệt |
| Nhược | Tốn máy chủ; có thể mang cả giọng Việt của mẫu vào tiếng Anh | Chất lượng giống giọng có thể kém hơn |
| Ứng viên cần đánh giá | Dịch vụ trả tiền; mô hình mở như Chatterbox, CosyVoice 2 | OpenVoice v2 (bộ đổi màu giọng), kNN-VC |

- **Hướng B hợp với Lexica hơn** vì Lexica đã có clip chuẩn tạo sẵn (`docs/LEXICA_TTS_RESEARCH.md`), và mục tiêu sư phạm là "giọng bạn nhưng phát âm chuẩn", không phải "giọng bạn đọc bất cứ thứ gì".
- **Giấy phép:** tài liệu TTS đã ghi tránh XTTS-v2 và F5-TTS (cấm thương mại). Giấy phép của các ứng viên trên mình tin là cho phép thương mại nhưng **chưa xác minh**.
- **Chạy trên máy người học:** chưa biết có mô hình nào đủ nhẹ. Mặc định tính là chạy trên máy chủ.

### 3.3 Luồng xử lý
1. **Đồng ý:** màn giải thích giọng dùng để làm gì, lưu ở đâu, xoá thế nào. Chỉ người đã đăng nhập, đủ tuổi theo điều khoản.
2. **Ghi âm:** đoạn đọc gồm câu tiếng Việt và vài câu tiếng Anh ngắn, kèm **một câu ngẫu nhiên** phải đọc đúng (chứng minh người thật đang đọc, không phải file ghi âm của người khác).
3. **Kiểm tra chất lượng** trên máy: đủ dài, không quá ồn. Không đạt thì ghi lại.
4. **Tạo clip:** chỉ cho các câu trong phiên luyện nói hôm nay và ngày mai (lấy từ mô hình người học), không tạo cả kho.
5. **Lưu:** bucket riêng tư trên Supabase Storage, đường dẫn theo người dùng, RLS chỉ chủ đọc được. Mẫu giọng gốc mã hoá, không dùng cho việc gì khác.
6. **Xoá:** một nút xoá cả mẫu lẫn mọi clip. Tự xoá sau N ngày không dùng.

### 3.4 Chống lạm dụng
- Chỉ đọc **câu trong kho nội dung đã duyệt**. Không có ô nhập chữ tự do, nên không dùng được để giả giọng nói điều tuỳ ý.
- Không cho tải file về; clip chỉ phát trong app.
- Giới hạn số clip mỗi ngày mỗi người.
- Mỗi tài khoản một giọng; đổi giọng phải ghi lại từ đầu kèm câu ngẫu nhiên.

### 3.5 Chi phí
Chưa có số. Công thức cần điền sau bản thử:

`chi phí mỗi người mỗi tháng = số clip/ngày × giây xử lý mỗi clip × giá máy chủ mỗi giây × 30 + lưu trữ`

- Hướng B xử lý mỗi clip ngắn hơn nhiều so với hướng A (cần đo).
- Vì có chi phí theo người dùng, đây là ứng viên tự nhiên cho **gói trả tiền** (xem `docs/BUSINESS_MODEL.md`).

### 3.6 Các chặng và tiêu chí dừng
| Chặng | Làm gì | Thời lượng ước tính | Qua chặng khi |
|---|---|---|---|
| **V0: thử** | 5 người tình nguyện ghi âm; chạy 2–3 ứng viên của hướng B và 1 của hướng A trên 20 câu; cho chính họ và 5 người khác chấm | 1 tuần | Chính chủ chấm "giống tôi" ≥ 4/5 **và** bộ chấm phát âm cho clip điểm ngang clip chuẩn. Không ứng viên nào đạt: **dừng** |
| V1: beta kín | Luồng đồng ý, ghi âm, tạo clip theo ngày, nút "Giọng của tôi", xoá dữ liệu | 3–4 tuần | Thí nghiệm 3.7 cho kết quả dương, chi phí mỗi người trong ngưỡng chấp nhận |
| V2: mở rộng | Gắn với gói trả tiền, màn so sánh theo từng âm, thẻ chia sẻ | Sau V1 | — |

### 3.7 Thí nghiệm khoa học kèm theo
- **Câu hỏi:** nhại theo giọng của chính mình có tiến bộ phát âm nhanh hơn nhại theo giọng chuẩn không?
- **Cách làm:** chia ngẫu nhiên 2 nhóm, cùng bộ câu, 2 tuần. Đo bằng điểm của bộ chấm phát âm trên **câu chưa luyện** trước và sau.
- **Đo thêm:** số phút luyện nói mỗi tuần (giả thuyết: nghe giọng mình làm người học bớt ngại và luyện nhiều hơn).
- Nếu không khác biệt về điểm nhưng khác biệt về thời gian luyện, tính năng vẫn có giá trị, nhưng phải nói đúng điều đó khi quảng bá.

### 3.8 Rủi ro
| Rủi ro | Mức | Giảm bằng |
|---|---|---|
| Giọng tạo ra nghe "rờn rợn", gần giống mà không giống | Cao | V0 để chính chủ chấm; không đạt thì dừng |
| Mẫu giọng mang giọng Việt vào bản "chuẩn" | Cao với hướng A | Ưu tiên hướng B; dùng bộ chấm phát âm làm cổng chất lượng cho từng clip |
| Giả giọng người khác | Cao nếu làm ẩu | Câu ngẫu nhiên khi ghi, chỉ đọc nội dung đã duyệt, không cho tải |
| Dữ liệu sinh trắc (giọng nói) và pháp lý | Vừa đến cao | Đồng ý riêng, xoá được, mã hoá; cần ý kiến pháp lý trước V1 |
| Chi phí máy chủ theo người dùng | Vừa | Tạo clip theo ngày, giới hạn lượt, gắn gói trả tiền |

---

## 4. Ý để dành: học trong lúc ngủ
- Có nghiên cứu cho thấy phát lại từ vừa học trong giấc ngủ sâu giúp nhớ tốt hơn.
- Điện thoại không biết chắc người dùng đang ngủ sâu, và phát sai lúc có thể làm hỏng giấc ngủ.
- **Không làm trong kế hoạch này.** Bản rẻ có thể thử sau: một phiên ôn 2 phút "trước khi ngủ", đo xem độ nhớ sáng hôm sau có hơn phiên ôn buổi sáng không.

---

## 5. Lộ trình chung

```
Tuần 1      D0 (thử Núm vặn)  +  V0 (thử Giọng bạn)   ← hai bản thử độc lập, chạy song song
Tuần 2–4    Mô hình người học (mục 1)  +  D1 (trình đọc)
Tuần 5–8    D2 (tiện ích Chrome)       +  V1 (beta kín) nếu V0 đạt
Sau đó      D3, V2 theo số liệu
```

**Phụ thuộc:**
- D1 cần `viTriggers` (duyệt tay trong Studio) và mô hình người học ở mức tối thiểu (tầng `recog`).
- V1 cần clip chuẩn tạo sẵn đã chạy thật (workflow "Lexica voices" hiện chưa chạy) và ý kiến pháp lý về dữ liệu giọng nói.
- Cả hai cần thông báo cho người dùng cũ khi điều khoản riêng tư thay đổi.

**Cần chủ sản phẩm chốt:**
1. Có chấp nhận bản thử D0 và V0 chạy trước mọi việc khác không?
2. Ai duyệt `viTriggers` cho khoảng 570 thẻ?
3. Lớp 2 của Núm vặn (gửi câu lên máy chủ) có được phép tồn tại, kể cả ở dạng tuỳ chọn?
4. Giọng bạn thuộc gói trả tiền ngay từ đầu, hay miễn phí giai đoạn beta?
5. Ngân sách máy chủ tối đa mỗi tháng cho V0 và V1.

**Chỉ số chính:**
| Tính năng | Chỉ số thành công | Chỉ số cảnh báo |
|---|---|---|
| Mô hình người học | Sai số dự đoán xác suất nhớ thấp hơn SM-2 | Số từ đến hạn mỗi ngày tăng vọt |
| Núm vặn | Độ nhớ 30 ngày của nhóm B (mục 2.10) không thua nhóm A; số từ gặp mỗi tuần | Tỉ lệ "Thay sai" > 3%; người học tắt núm vặn |
| Giọng bạn | Điểm phát âm trên câu chưa luyện tăng; số phút luyện nói mỗi tuần tăng | Tỉ lệ xoá giọng sau lần nghe đầu; chi phí mỗi người vượt ngưỡng |

---

## 6. Nguồn cần tra lại trước khi dùng để quảng bá
Tất cả là nhớ từ kiến thức, chưa đối chiếu bản gốc:
- Nation: các tầng của việc "biết một từ"; bốn mạch của một khoá học ngôn ngữ.
- Laufer; Nation (2006): độ phủ từ vựng 95–98% để đọc hiểu.
- Burling: phương pháp đan hai ngôn ngữ (diglot weave).
- Krashen: đầu vào vừa sức.
- Morris, Bransford & Franks (1977): luyện đúng kiểu thi (transfer-appropriate processing).
- Swain: giả thuyết đầu ra. Slamecka & Graf (1978): hiệu ứng tự tạo đáp án.
- Mô hình trí nhớ FSRS (độ vững, độ khó, xác suất còn nhớ).
- Probst, Ke & Eskenazi (2002); Felps và cộng sự (2009): "golden speaker", giọng mẫu giống giọng người học.
- Rasch và cộng sự (2007); Schreiner & Rasch (2015): gợi lại trí nhớ trong giấc ngủ.
- Wilson và cộng sự (2019): tỉ lệ sai khoảng 15% là tối ưu cho việc học (trên mô hình máy học).
