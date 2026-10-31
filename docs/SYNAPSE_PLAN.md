# Synapse: kế hoạch phát triển riêng (31/10/2026)

Liên quan: issue #91. Chủ dự án đã quyết: **Synapse giữ riêng**, giữ ý tưởng "route game" (chọn lựa dẫn tới hậu quả), và cần một mục đích giáo dục riêng. Tài liệu này thay lựa chọn A trong `SOLILO_SYNAPSE_ANALYSIS.md` mục 3 (đưa vào Lexica) bằng lựa chọn B (giữ app riêng), và trả lời câu hỏi còn bỏ ngỏ: **làm gì để một app riêng đáng tồn tại?**

Mình đã đọc lại code: `apps/synapse` (2.233 dòng), module `synapse` của `cortex-core-api` (1.692 dòng), và kiểu dữ liệu trong `packages/cortex-types`.

## 1. Kết luận ngắn

1. **Mục đích giáo dục đề xuất: "học cụm động từ qua hậu quả".** Mỗi cảnh dạy **bốn cụm cùng một động từ** (ví dụ *speak up, speak out, speak for, speak over*) qua đúng thứ khiến chúng khác nhau: hậu quả khi dùng sai. Đây là cách học cặp dễ nhầm bằng đối chiếu, rất khớp với một game chọn lựa.
2. **Hôm nay Synapse chưa dạy được điều đó**, dù ý tưởng đúng. Lý do cụ thể: nghĩa tiếng Việt của **mọi** lựa chọn hiện nằm ngay trên nút (`c.meaning` hiện ở mỗi đáp án), nên người chơi đọc nghĩa rồi chọn theo tình huống, không cần biết cụm. Sai thì mất 25 điểm "toàn vẹn", không có ôn tập, không nhớ gì giữa các lần chơi.
3. **Giữ route game, đổi cách chạy**: truyện **dựng sẵn và duyệt** (AI chỉ chạy lúc dựng), thêm **độ khó giảm dần gợi ý**, **sổ cụm** có lịch ôn, **hồ sơ tiến bộ**, và hai chế độ mới đúng sở trường của dạng này: **chơi cả lớp** (giáo viên chiếu truyện, cả lớp bỏ phiếu chọn đường) và **ôn bằng truyện**.
4. **Việc nhỏ đầu tiên đáng làm**: ẩn nghĩa ở cấp khó và làm màn "sổ cụm" sau mỗi cảnh. Hai việc này tự thân đã biến Synapse từ trò chơi thành bài học, không cần đổi nội dung.

## 2. Hiện trạng (đối chiếu code)

| Mảng | Hiện có |
|---|---|
| Luồng | Chọn giao diện (Synapse tối, Urban sáng) → chọn thế giới → chọn nhiệm vụ → briefing → chơi 5 cảnh |
| Nội dung | 4 thế giới (2 kịch tính, 2 đời thường), 11 nhiệm vụ. Mỗi nhiệm vụ có nhân vật, căng thẳng, cái giá của thắng thua, vài khoảnh khắc mẫu |
| Cảnh soạn sẵn | Chỉ **6 cảnh** có khung soạn sẵn (cụm đúng, ba cụm sai kèm hậu quả riêng, chi tiết cảm giác). Còn lại AI tự viết |
| Chơi | 3 mạng, thanh "toàn vẹn" 100 (sai trừ 25), mỗi cảnh bốn lựa chọn là bốn tiểu từ, mỗi lựa chọn kèm nghĩa tiếng Việt |
| AI | Dựng cả mạch 5 cảnh một lần, dự phòng 4 lớp (Gemini, Groq, Gemma cục bộ, cảnh cứng). Prompt khá kỹ (cấm cụm sáo rỗng, hậu quả riêng cho từng đáp án sai) |
| Lưu trữ | Không có tài khoản bắt buộc. Bảng `synapse_logs` chưa làm. Không lưu tiến bộ |
| Gợi ý kỹ thuật (`technicalHint`) | Có trong dữ liệu, nhưng giao diện không hiện |
| Cập nhật cuối | 25/05/2026 |

**Phần mạnh thật sự**: hậu quả riêng cho từng đáp án sai, cùng bộ nhân vật và căng thẳng. Đó là chất liệu của một game có chiều sâu, không phải bài trắc nghiệm có lớp sơn.

## 3. Mục đích giáo dục: đặt cho đúng

Có ba hướng giáo dục khả dĩ. Mình đánh giá để chọn một **mục đích chính** và một **mục đích phụ**.

| Hướng | Học gì | Hợp với route game ở đâu | Điểm yếu |
|---|---|---|---|
| **A. Cụm động từ qua đối chiếu** (đề xuất chính) | Phân biệt *speak up / out / for / over* | Mỗi lựa chọn sai là một cụm khác có nghĩa khác; hậu quả **chính là định nghĩa** của cụm sai | Phạm vi hẹp; phải có bộ cụm đủ lớn |
| **B. Ngữ dụng và độ trang trọng** (đề xuất phụ) | Nói đúng giọng đúng tình huống (từ chối lịch sự, đề nghị, xin lỗi) | Hậu quả xã hội là thứ trò chơi thể hiện tốt nhất; hợp hướng **Giao tiếp** | Cần người bản ngữ hoặc giáo viên duyệt nội dung |
| **C. Đọc truyện ở trình độ của mình** | Đọc hiểu, từ vựng trong ngữ cảnh | Truyện nhiều nhánh làm đọc mở rộng bớt chán | Ít đặc thù, dễ trùng Lexica Đọc |

**Chọn A làm mục đích chính** vì nó tận dụng đúng thứ sẵn có (khung bốn lựa chọn cùng động từ, hậu quả riêng) và có khoảng trống thật trong hệ Cortex: Lexica dạy từ đơn lẻ và cụm cố định, chưa dạy cụm động từ **theo cặp dễ nhầm**. **B là mục đích phụ** cho hướng Giao tiếp (giữ ở mức duy trì theo chiến lược), làm bằng thế giới đời thường (Urban).

### Điều làm Synapse khác một bài trắc nghiệm (giữ bằng được)

Bốn thứ, mỗi thứ phải còn sau mọi thay đổi:
1. **Hậu quả có tên và có mặt**: nhân vật phản ứng, lời thoại thay đổi theo lựa chọn.
2. **Lựa chọn đổi đường đi**, không chỉ đổi điểm: sai không chỉ trừ điểm mà mở một nhánh (bị lộ, mất đồng minh) hoặc đóng một nhánh.
3. **Có cái kết nhiều dạng**, và người chơi muốn xem cái kết khác.
4. **Thế giới có luật riêng** (giọng văn, phe phái, cái giá) nên chơi thế giới khác cảm giác khác.

## 4. Cơ chế dạy: biến game thành bài học

### 4.1 Ba cấp khó, cùng một truyện

Hiện mọi lựa chọn đều có nghĩa Việt hiển thị. Đề xuất ba cấp trên cùng nội dung (chỉ đổi cách hiện):

| Cấp | Hiện gì | Học thế nào |
|---|---|---|
| **Học** | Nghĩa tiếng Việt của mỗi cụm trên nút (như hiện nay) | Đọc nghĩa, ghép với tình huống |
| **Nhớ** | Chỉ hiện cụm, nghĩa chỉ hiện **sau** khi chọn | Phải biết cụm |
| **Dùng** | Gõ tiểu từ (hoặc chọn trong số nhiều hơn bốn), không có gợi ý | Gọi lại từ trí nhớ |

Cấp tự nâng khi người chơi chọn đúng ≥ 80% cụm đã gặp. Giao diện hiện cấp để người chơi thấy mình tiến bộ.

### 4.2 Sổ cụm sau mỗi cảnh

Sau khi chọn, hiện thẻ gọn: **cả bốn cụm** của cảnh, mỗi cụm một nghĩa ngắn, một câu ví dụ đời thường, đánh dấu cụm đúng. Đây là chỗ học đối chiếu thật sự: người học thấy cả cặp nhầm cùng lúc, không chỉ đáp án đúng.

### 4.3 Nhớ giữa các lần chơi

- Mỗi cụm có trạng thái: chưa gặp, đã gặp, chọn sai gần đây, vững.
- **"Ôn bằng truyện"**: một nhiệm vụ ngắn (3 cảnh) dựng từ các cụm đang yếu, có **cảnh khác** với cụm cũ (thay vì lặp đúng cảnh cũ, để học cách dùng chứ không học thuộc cảnh).
- **Đẩy sang Lexica** (tuỳ chọn): cụm đã mở khoá thành thẻ ôn trong Lexica, để lịch ôn chung của Cortex lo phần ghi nhớ. Synapse là nơi **gặp và hiểu**, Lexica là nơi **nhớ**.

### 4.4 Hồ sơ đặc vụ

Không phải để khoe: một màn nhìn lại gồm số cụm đã mở khoá, cụm hay nhầm nhất, cái kết đã thấy, số thế giới đã xong. Là lý do để quay lại và là dữ liệu cho báo cáo lớp.

## 5. Vì sao quay lại (vòng lặp)

Hiện không có lý do mở app lần hai. Ba vòng lặp, từ rẻ đến đắt:

1. **Chương mới theo tuần** (nội dung dựng sẵn, ra đều): mỗi tuần một nhiệm vụ mới ở một thế giới đang chơi. Cần quy trình dựng đều (mục 7).
2. **Cái kết ẩn và nhánh khác**: chơi lại để thấy cái kết khác, mở "thư viện cái kết".
3. **Mùa**: mỗi mùa một thế giới mới, chuỗi nhiệm vụ nối nhau, có phần thưởng nhận diện (huy hiệu, chủ đề giao diện).

## 6. Dùng trong lớp: chỗ Synapse mạnh nhất

Truyện nhiều nhánh là dạng nội dung **hợp nhất** với cả lớp cùng chơi:

- **Chiếu truyện, cả lớp bỏ phiếu chọn đường.** Giáo viên chiếu cảnh lên máy chiếu, học viên chọn trên điện thoại (dùng hạ tầng Đấu trường: mã phòng, Realtime, tính giờ theo máy chủ). Số đông quyết định đường đi, rồi cả lớp xem hậu quả. Sau đó giáo viên hỏi: "tại sao nhóm kia chọn *speak out*?". Đây là bài giảng cụm động từ khó quên, và hợp với ý "Sống sót" của Đấu trường T2c (#63).
- **Giao nhiệm vụ về nhà**: Teach giao một nhiệm vụ và hạn nộp; giáo viên xem cụm nào cả lớp hay nhầm (giống bảng "từ cả lớp hay quên" đã có).
- **Quyền riêng tư**: chỉ số, không có gì do học viên tự viết (truyện là nội dung dựng sẵn), nên không vướng quyết định riêng tư như Writing.

Đây cũng là câu trả lời cho "Synapse đứng riêng thì ai trả tiền": nó là **công cụ giảng bài tương tác** cho giáo viên, mà các app luyện từ khác không có.

## 7. Nội dung và chi phí: bỏ AI mỗi lượt

| | Hiện nay | Đề xuất |
|---|---|---|
| Khi nào gọi AI | Mỗi lượt chơi (sinh mạch 5 cảnh, viết lời) | **Chỉ lúc dựng**, qua Studio, có bước duyệt |
| Chi phí | Tăng theo số lượt chơi | Cố định theo số nhiệm vụ dựng |
| Độ tin cậy | Cần dự phòng 4 lớp | Nội dung là file tĩnh, chơi ngoại tuyến |
| Chất lượng | Không duyệt | Duyệt, có nút "Báo cảnh có vấn đề" (như #62) |
| Biến thiên | Tự do, nhưng có lúc lạc | Có biến thể do người dựng chọn |

Kèm hai điểm:
- **Chế độ vô hạn do AI** (như hiện nay) có thể giữ làm tính năng thử nghiệm cho gói Plus, có giới hạn và có nhãn "AI viết, chưa duyệt". Không phải trụ cột.
- **Quy trình dựng**: bộ khung cảnh (cụm đúng, ba cụm sai và hậu quả riêng) do người hoặc Studio soạn, AI chỉ viết lời. Sáu cảnh soạn sẵn hiện có là mẫu chất lượng. Mục tiêu bắt đầu: **30 nhiệm vụ (150 cảnh)**, khoảng 600 lần gặp cụm, sát hơn 11 nhiệm vụ hiện có.

## 8. Dữ liệu và kỹ thuật

- **Khung cảnh chuẩn** (`SceneBlueprint`, đã có): thêm `level` (CEFR), `exampleSentence` cho mỗi cụm, `contrastSetId` (nhóm cụm dễ nhầm), `nextOnWrong` (nhánh khi sai).
- **Bảng mới** (Supabase, RLS bật, truy cập qua hàm security definer): `synapse_phrase_state` (người dùng, cụm, trạng thái, lần gặp gần nhất), `synapse_runs` (nhiệm vụ, kết thúc, điểm, cái kết). Chỉ gắn tài khoản khi người chơi đăng nhập; chơi khách vẫn được, không lưu.
- **API**: giữ `/synapse/story-arc` và `/synapse/scenario` ở chế độ thử nghiệm; thêm `GET /synapse/missions` trả nội dung dựng sẵn (cache dài, không cần AI).
- **Việc nợ kỹ thuật**: chuyển `DEFAULT_GEMINI_MODEL` ra khỏi module `synapse` (Studio đang nhập từ đó); đóng giao diện cho `technicalHint` (hiện không hiện).
- **Chất lượng nội dung cho người học trẻ**: hai thế giới kịch tính (mạng ngầm, hoang mạc) cần rà độ phù hợp lứa tuổi trước khi đưa vào lớp. Thế giới đời thường hợp lớp hơn.

## 9. Lộ trình

Mỗi bước phát hành được và tự đứng được.

| Bước | Nội dung | Xong khi | Công sức |
|---|---|---|---|
| **S0. Nợ kỹ thuật** | Chuyển hằng số, hiện `technicalHint`, sửa lỗi đã biết, thêm test cho phần máy trạng thái | Studio không còn nhập từ module Synapse; test qua | 2–3 ngày |
| **S1. Biến game thành bài học** | Ba cấp khó (ẩn nghĩa), **sổ cụm** sau mỗi cảnh, tự nâng cấp độ | Một người chơi mới thấy cả bốn cụm và học được ít nhất một cặp mỗi cảnh | 1,5 tuần |
| **S2. Nhớ giữa các lần chơi** | Đăng nhập tuỳ chọn, bảng trạng thái cụm, hồ sơ đặc vụ, ôn bằng truyện, đẩy cụm sang Lexica | Cụm sai hôm nay xuất hiện lại ở lần chơi sau | 2 tuần |
| **S3. Nội dung dựng sẵn** | Khung cảnh chuẩn, quy trình dựng qua Studio, 10 nhiệm vụ đầu có duyệt, `GET /synapse/missions`, ngừng gọi AI mỗi lượt ở chế độ thường | Chơi không cần gọi AI, ngoại tuyến được | 2–3 tuần |
| **S4. Chơi cả lớp** | Giáo viên chiếu truyện trong Teach, học viên bỏ phiếu bằng điện thoại, báo cáo cụm cả lớp hay nhầm | Một lớp chơi trọn một nhiệm vụ | 2 tuần |
| **S5. Vòng lặp** | Chương mới theo tuần, thư viện cái kết, mùa đầu tiên | Tỉ lệ quay lại sau 7 ngày đo được | 2 tuần |

Thứ tự khuyến nghị: **S0 → S1 trước**. Hai bước này tự biến Synapse thành bài học và rẻ nhất. S3 là điều kiện của S4 và S5.

### Số đo

- Tỉ lệ người chơi hoàn thành nhiệm vụ đầu tiên.
- Số cụm được gặp và số cụm vững sau 7 ngày (đo thật sự học).
- Tỉ lệ quay lại sau 7 ngày.
- Chi phí AI mỗi người chơi mỗi tuần (phải giảm về gần 0 sau S3).
- Trong lớp: độ chênh số cụm nhầm trước và sau bài giảng bằng Synapse.

## 10. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Hẹp: cụm động từ không đủ lớn để giữ người học | Giữ B (ngữ dụng) làm mục đích phụ; mở sang cụm cố định và collocation sau |
| Tốn công dựng nội dung | Studio có sẵn quy trình; bắt đầu 10 nhiệm vụ rồi mở rộng theo số đo |
| Dàn mỏng sức (thêm một sản phẩm riêng) | Làm S0 và S1 trước, đo, rồi mới tiếp. Nếu S1 không cải thiện số đo thì dừng đầu tư |
| Nội dung kịch tính không hợp lớp | Dùng thế giới đời thường cho lớp, rà độ phù hợp |
| AI viết sai tiếng Anh hoặc nghĩa | Duyệt trước khi phát hành; nút báo lỗi |

## 11. Cần bạn quyết

1. **Mục đích chính A** (cụm động từ qua đối chiếu), phụ B (ngữ dụng)? Hay muốn hướng khác?
2. **Bỏ AI mỗi lượt** ở chế độ thường, chuyển sang nội dung dựng sẵn có duyệt (chế độ AI vô hạn chỉ là thử nghiệm)?
3. **Hướng lớp học** (cả lớp bỏ phiếu chọn đường) có đúng ý bạn không? Nếu đồng ý thì nó là mục tiêu của S4.
4. **Hai thế giới kịch tính** (mạng ngầm, hoang mạc): giữ cho người học lớn, hay ưu tiên đời thường cho học sinh?
5. **Làm S0 và S1 ngay** rồi đo, hay bạn muốn duyệt cả kế hoạch trước?
