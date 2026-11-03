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

## Giới hạn phải nói thẳng

- **Chưa chạy thử với mô hình thật** (môi trường làm việc không tải được mô hình). Phần phân tích có test với dữ liệu mốc thời gian giả; phần gọi Whisper có đường lui: không có mốc từng từ thì màn chấm dùng cách cũ.
- Whisper tiny.en có xu hướng **bỏ bớt từ đệm** khỏi bản chép, nên số "từ đệm" có thể thấp hơn thực tế.
- Phân loại "giữa ý hay giữa các ý" dựa vào dấu câu Whisper tự thêm và danh sách từ nối; có thể sai ở câu khó hiểu.
- Công thức tính điểm vẫn là luật mình tự đặt, chưa hiệu chỉnh bằng dữ liệu thật. Các luật "vì sao" cũng vậy: mỗi luật nói rõ nó thấy gì để người học tự kiểm.
- "Từ bạn bí" mới chỉ hiện ra, chưa đẩy sang Lexica để ôn.
