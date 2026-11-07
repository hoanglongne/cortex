# Tự chấm speaking: nghiên cứu và công cụ "Soi lời nói" (issue #130)

Câu hỏi: làm sao một người không có chuyên môn tự chấm được speaking của mình, và thấy ngay mình cần sửa gì? Mình tìm các nghiên cứu và mã nguồn mở có thể chạy ngay trên máy người dùng (không gửi âm thanh đi đâu).

## Điều nghiên cứu nói

- **Chỗ dừng quan trọng nhất, và vị trí chỗ dừng còn quan trọng hơn số lần.** Người nghe chấm độ trôi chảy chủ yếu theo cách người nói dừng ([Bosker và cộng sự 2013, "What makes speech sound fluent?"](https://forms.mpi.nl/node/51306), [MPI: khi nào lời nói được coi là trôi chảy](https://www.mpi.nl/node/51370)). Dừng **giữa chừng một mệnh đề** nghe ngập ngừng; dừng **ở ranh giới giữa hai ý** nghe bình thường ([ảnh hưởng của vị trí chỗ dừng lên độ trôi chảy cảm nhận](https://resolve.cambridge.org/core/journals/applied-psycholinguistics/article/abs/effect-of-pause-location-on-perceived-fluency/D8EF194FCD2C5FBF0D6BA49EF6F0624E)). Vì thế công cụ đếm hai loại này riêng; bản trước chỉ đếm mọi chỗ dừng dài là ngập ngừng, và bắt người chấm tự phân biệt.
- **Độ trôi chảy đo được từ lời nói** ("utterance fluency", khung của Segalowitz): tốc độ, chỗ dừng, sửa lại. Công cụ tính tốc độ khi nói (đã trừ chỗ dừng), số từ nói liền giữa hai chỗ dừng, từ đệm, từ lặp.

## Mã nguồn mở đã xét

| Công cụ | Dùng để | Quyết định |
|---|---|---|
| **Whisper tiny.en qua transformers.js**, `return_timestamps: "word"` ([tài liệu](https://huggingface.co/Xenova/whisper-tiny.en/blob/2652e278597dfbdcae0e1fb71608abc7b39a991b/README.md?code=true)) | Chép lời kèm thời điểm từng từ, chạy trong trình duyệt | **Đã dùng.** Oratio đã có sẵn Whisper tiny trên máy (40 MB); chỉ thêm lấy mốc thời gian từng từ. Lưu ý: báo cáo cũ nói WebGPU chưa hỗ trợ mốc từng từ ([issue 820](https://github.com/huggingface/transformers.js/issues/820)); Oratio chạy WASM nên không dính. |
| **CrisperWhisper** ([bài báo INTERSPEECH 2024](https://arxiv.org/abs/2408.16589v1)) | Chép nguyên văn kể cả um/uh, mốc từng từ chính xác hơn | **Chưa dùng.** Hay hơn cho từ đệm nhưng giấy phép bản chuyển đổi ghi cc-by-nc (phi thương mại) và chưa có bản chạy trong trình duyệt. Hướng cho sau nếu cần bắt từ đệm tốt hơn. |
| **wav2vec2 nhận dạng âm vị** ([ví dụ chạy trong trình duyệt](https://huggingface.co/robg/speako-phoneme-recognizer)) | Chỉ ra từng âm phát âm sai so với từ điển phát âm | **Chưa dùng.** Bản lượng tử hoá khoảng 355 MB, quá nặng để bắt người dùng tải; nếu làm sẽ là tuỳ chọn riêng cho luyện phát âm. |
| Silero VAD, pitch YIN (tìm cao độ) | Phát hiện lời nói chính xác hơn; vẽ đường lên xuống giọng | Chưa dùng. Phát hiện chỗ dừng hiện dựa trên mức âm lượng, đủ cho mục đích này. Đường cao độ để nghiên cứu tiếp cho tiêu chí phát âm. |

## Công cụ "Soi lời nói" làm gì

Sau khi bật (tải mô hình một lần), máy chép lời bản ghi ngay trên máy và hiển thị **chính lời đó như văn bản chạm được**:
- chỗ dừng hiện ngay giữa các từ kèm số giây: **vàng = giữa chừng một ý** (đáng chú ý), **xám = giữa hai ý** (bình thường);
- từ đệm (um, uh, er…) tô nền, từ lặp ("they they", "I think I think") gạch lượn;
- chạm một từ hoặc một chỗ dừng để nghe đúng đoạn đó;
- một câu tóm tắt, sáu con số, và điểm Trôi chảy được điền sẵn từ số chỗ dừng giữa ý, từ đệm, từ lặp, độ dài chuỗi nói liền.

Người chấm không còn phải tự phân biệt "tìm từ" với "nghĩ ý": máy phân loại theo vị trí chỗ dừng, người chấm chỉ cần nghe chỗ vàng.

## Từ "thấy gì" đến "vì sao và làm gì"

1. **Máy đọc kiểu chỗ dừng** (`lib/speech-insights.ts`): nếu chỗ dừng giữa ý hay đứng ngay sau một từ ngữ pháp (the, to, a, of…) thì đó là **tìm từ tiếp theo**, không phải nghĩ ý. Các mẫu khác: mở đầu chậm (từ đầu tiên sau 2,5 giây hoặc dừng giữa ý ngay 8 giây đầu), từ đệm nằm ngay sau chỗ dừng (giữ lượt nói), nói lại từ hoặc cụm, nói quá chậm hoặc quá nhanh, và những gì làm tốt (không dừng giữa ý, nói liền một mạch dài).
2. **Mỗi phát hiện có bằng chứng và cách thử**: các từ liên quan ("the … biggest (1,7s)"), một câu làm gì, và các **cụm nên nói thay vì im lặng hoặc nói "um"** ("How can I put it…", "Let me think about that…").
3. **Từ bạn bí trước khi nói**: các từ đứng sau chỗ dừng ("biggest", "meet") là từ nên ôn thêm.
4. **So với chính bạn** (`lib/speech-history.ts`): chỉ con số lưu trên máy (chỗ dừng giữa ý, từ đệm, từ lặp mỗi phút, từ nói liền; không lưu lời đã nói), so với lần nói trước và vẽ xu hướng 8 lần gần nhất. Tính theo mỗi phút để câu trả lời dài hơn không bị coi là tệ hơn, và thay đổi nhỏ hơn 20% hoặc 0,5 coi là như cũ.

## Chép lời chính xác hơn (phản hồi sau lần thử đầu)

Lần thử đầu cho thấy Whisper tiny nghe sai 30 đến 40% lời nói hằng ngày ("a workaholic like me" thành "a walk a whole like like me"). Đã đổi:
- **Chọn mô hình:** tiny (khoảng 40 MB, nhẹ nhưng sai nhiều), **base** (khoảng 80 MB) và **small** (khoảng 250 MB, chính xác nhất). Mặc định: điện thoại dùng base, máy tính đủ bộ nhớ dùng small. Ai đã đồng ý tải bản tiny trước đây vẫn giữ tiny cho tới khi tự chọn; trong màn Lời nói có nút "Dùng mô hình chính xác". Kích thước là ước lượng, chưa kiểm.
- **Sửa lời:** nút "Máy nghe sai? Sửa lời" cho gõ lại từ sai; chỗ dừng và thời gian giữ nguyên, các số liệu tính lại ngay.
- **Một lần chép lời, không hai:** bản chép lời trong màn kết quả và Soi lời nói dùng chung một lần chạy (trước đây chạy hai lần và có thể ra hai kết quả khác nhau).

## Gợi ý điểm: tính theo 100 từ, thêm trọng số từ và ngữ pháp (phản hồi lần hai)

Lỗi cũ: đếm "lần mỗi phút" với bản ghi tối thiểu 30 giây, nên 1 lỗi trong 30 giây thành 2 lỗi/phút và ngữ pháp tụt xuống 4; còn nói trôi chảy không dừng chỉ được 5 vì điểm khởi đầu là 6 mà không có phần thưởng nào. Giờ mọi thứ tính **trên 100 từ** (1 lỗi trong 75 từ ≈ 1,3/100 từ), mỗi tiêu chí có khởi điểm rõ và cộng/trừ có lý do, hiển thị ngay dưới điểm.

- **Trôi chảy**: ngập ngừng/100 từ = chỗ dừng giữa ý + 0,7 × từ đệm + 0,5 × từ lặp + ậm ừ kéo dài; trừ 0,3 điểm cho mỗi đơn vị. Cộng/trừ theo tốc độ (≥110 từ/phút +0,5; <100 −0,5; <80 −1; <60 −1,5) và độ dài lượt nói (trung vị ≥8 từ +0,5; ≤3 −0,5). Nói đều, không ngập ngừng, tốc độ tự nhiên → 7.
- **Ậm ừ ("mmm", "ừmmm")**: lỗ hổng cũ là âm thanh ngân dài vẫn có tiếng nên được tính là đang nói, và Whisper hay gán cả đoạn ngân vào thời lượng của một từ. Hai cách bắt: (1) trên âm thanh, đoạn có tiếng ≥0,7 s mà độ to gần như phẳng (độ lệch/độ to trung bình <0,3; tiếng nói thật lên xuống theo âm tiết) bị coi là "ngân", không phải lời; (2) trên từ, từ nào dài ≥0,9 s và hơn 2,5 lần thời gian cần để nói (0,18 s + 0,07 s mỗi chữ) bị cắt về đúng độ dài, phần dư thành khoảng dừng. Ngưỡng chọn bằng âm thanh tổng hợp, **chưa kiểm trên ghi âm thật**.
- **Từ vựng (trọng số từ)**: tần suất từ lấy từ wordfreq (Robyn Speer; dữ liệu CC BY-SA 4.0), chia 4 dải Zipf (≥5,5 / 4,7–5,5 / 4,0–4,7 / 3,3–4,0; thấp hơn là "hiếm"). Dùng: tỷ lệ từ ít gặp trong các từ có nghĩa (≥40% +1, ≥30% +0,5, <15% −0,5), độ đa dạng bằng MATTR cửa sổ 20 (không phụ thuộc độ dài bài), từ nhắc ≥3 lần. Bỏ qua tên riêng (chữ hoa giữa câu). Tần suất chỉ là chỉ báo: từ hiếm có thể dùng sai hoặc do máy nghe nhầm. Dữ liệu sinh bằng `apps/oratio/scripts/build-word-bands.mjs`, nạp lười (chỉ khi mở bước Lời nói).
- **Ngữ pháp**: phạm vi cấu trúc (mệnh đề phụ, quan hệ, quá khứ, hoàn thành, tương lai, khuyết thiếu, bị động, điều kiện, V-ing) — 5 loại trở lên +1, 3–4 loại +0,5, chỉ 1 loại −0,5; lỗi bạn đánh dấu −0,6 mỗi 100 từ; thêm một ít quy tắc bắt lỗi chắc chắn (he go, they was, a apple, more better, didn't went…) trừ tối đa 1 điểm. **Giới hạn quan trọng**: Whisper có xu hướng "sửa" ngữ pháp khi chép, nên lỗi máy thấy luôn ít hơn thực tế; vì vậy tín hiệu của người chấm quan trọng hơn.
- **Phát âm**: chỉ dựa trên chỗ bạn đánh dấu "khó nghe" và số từ phải sửa trong bản chép (dấu hiệu mềm, có thể do máy). Chấm phát âm thật cần mô hình âm vị (wav2vec2 ~355 MB), chưa làm.
- Các trọng số là quy tắc kinh nghiệm theo nghiên cứu về cảm nhận trôi chảy và bảng mô tả band công khai, **chưa hiệu chỉnh bằng bài đã có điểm thật**; điểm gợi ý luôn chỉ là điểm khởi đầu để người chấm xác nhận.

## Giới hạn phải nói thẳng

- **Chưa chạy thử với mô hình thật** (môi trường làm việc không tải được mô hình). Phần phân tích có test với dữ liệu mốc thời gian giả; phần gọi Whisper có đường lui: không có mốc từng từ thì màn chấm dùng cách cũ.
- Whisper tiny.en có xu hướng **bỏ bớt từ đệm** khỏi bản chép, nên số "từ đệm" có thể thấp hơn thực tế.
- Phân loại "giữa ý hay giữa các ý" dựa vào dấu câu Whisper tự thêm và danh sách từ nối; có thể sai ở câu khó hiểu.
- Công thức tính điểm vẫn là luật mình tự đặt, chưa hiệu chỉnh bằng dữ liệu thật. Các luật "vì sao" cũng vậy: mỗi luật nói rõ nó thấy gì để người học tự kiểm.
- "Từ bạn bí" mới chỉ hiện ra, chưa đẩy sang Lexica để ôn.


## Ghi công

Tần suất từ: wordfreq, Copyright 2022 Robyn Speer (mã Apache-2.0, dữ liệu CC BY-SA 4.0), https://github.com/rspeer/wordfreq. Danh sách dải rút gọn trong `apps/oratio/src/lib/lexical-data.ts` chia sẻ theo cùng giấy phép CC BY-SA 4.0.


## Cập nhật 06/11/2026 (issue #130)

- **"Tôi không chắc"** cho từng tiêu chí, dùng chung cho tự chấm và chấm chéo (tối đa 3 tiêu chí, để một lần chấm luôn nói được điều gì đó). Tiêu chí không chắc **không tính** vào band của câu (chỉ tính những người chắc; không ai chắc thì tính tất cả), vào điểm tổng và vào độ tin cậy của người chấm. SQL: `apps/oratio/supabase/migration_2026_11_unsure.sql` (đã nằm trong `supabase/oratio_2026_10.sql`, **chạy lại file này**). Tự chấm lưu tập "không chắc" cùng điểm trên máy.
- **Điểm neo**: mỗi tiêu chí có mục "Band 4, 6, 8 nghe thế nào" (lấy từ bảng mô tả band có sẵn).
- **Giải thích band lần đầu**: khung "Band là gì?" ở bước Điểm, hiện một lần.
- **Ghi chú theo mốc thời gian** ở bước Đánh dấu (tuỳ chọn, chỉ lưu trên máy). Tua lại 10 giây đã có từ trước.
- Chưa làm: lặp đoạn, hỏi độ tự tin riêng (đã có "không chắc" thay thế), thử với người không chuyên, chụp so sánh 1280px.
- Sửa lỗi: nút "Lưu tự chấm" dùng tên màu không có trong Oratio (`bg-accent`), nên nút **không có nền**, trông như chữ trơn: đây mới là lý do nút "liệt" ở phản hồi trước.

### Chấm bằng câu hỏi bằng chứng (06/11/2026, #130)

Bước Điểm giờ đi **từng tiêu chí một (1/4 … 4/4)**: dòng "lần nghe này chú ý gì" + nút Nghe lại; **4 câu hỏi về điều nghe được** (Có / Thỉnh thoảng / Không), ví dụ "Có lúc dừng hơn 2 giây để tìm từ không?"; từ đó ra **khoảng 2 band** gợi ý (`lib/evidence.ts`: câu trả lời tốt = 1, lưng chừng = 0,5, xấu = 0, trung bình quy ra 3 đến 7; trả lời ít câu thì khoảng rộng hơn). Câu nào máy đo được thì máy **trả lời sẵn và ghi con số** (số chỗ dừng, từ lặp, từ/phút, từ nối, % từ ít gặp, loại cấu trúc, lỗi bạn đánh dấu); người chấm đổi được. Chọn band **ngoài khoảng gợi ý thì phải chọn một lý do** mới ghi nhận. Cuối cùng có màn tóm tắt bốn điểm. Mỗi tiêu chí có "Band 4, 6, 8 nghe thế nào" với ví dụ cụ thể (`lib/band-examples.ts`, **do nhóm Cortex soạn, chưa giáo viên nào duyệt**).

Trọng số là quy tắc kinh nghiệm theo bảng mô tả band, chưa hiệu chỉnh bằng bài có điểm thật. Chưa làm: lặp đoạn, và thử với người không chuyên (cần bạn bè thật).
