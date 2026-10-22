# Giọng đọc cho Lexica: nghiên cứu thay Gemini TTS (10/2026)

**Vấn đề**: giọng đọc hiện tại gọi Cortex API (Gemini) mỗi lần cần. Cách này chập chờn, nhanh hết hạn mức, và khi lỗi thì phải dùng giọng máy của trình duyệt, nghe dở.

**Lưu ý về nguồn**: các con số dưới đây phần lớn lấy từ nguồn thứ cấp, chưa đo trên máy thật. Phải đo lại trên laptop và điện thoại tầm trung trước khi chốt.

## Các lựa chọn

| Lựa chọn | Dung lượng tải | Tốc độ | Chất lượng | Giấy phép | Chỉnh tốc độ |
|---|---|---|---|---|---|
| **Kokoro-82M** (`kokoro-js`, chạy trên trình duyệt) | ~86 MB (q8, WASM); ~310 MB (fp32, WebGPU) | Laptop: gần thời gian thực (WASM), nhanh gấp 2–6 lần trên WebGPU. Điện thoại: vài giây mỗi câu | Tốt nhất trong các mô hình mở nhỏ | Trọng số Apache-2.0; bộ chuyển chữ thành âm dựa trên espeak-ng (GPL-3.0, cần kiểm tra pháp lý) | Có |
| **Piper** (`piper-tts-web`) | 15–75 MB mỗi giọng | Nhanh | Rõ nhưng hơi máy | Engine mới là GPL-3.0; **giấy phép từng giọng khác nhau**, có giọng cấm dùng thương mại | Có |
| **sherpa-onnx WASM** | Như mô hình bên trong, cộng ~10 MB | Như trên | Như mô hình bên trong | Code Apache-2.0, kèm dữ liệu espeak-ng (GPL) | Có |
| **KittenTTS** | 25–80 MB | Rất nhanh | Kém Kokoro, đang tiến bộ | Được báo là Apache-2.0 (chưa xác minh) | Có |
| **Supertonic** | Ước ~250–400 MB | Rất nhanh | Tốt | Trọng số OpenRAIL-M (có điều khoản giới hạn cách dùng) | Có |
| **Tạo sẵn audio** (chạy Kokoro trên máy chủ hoặc CI) | ~5–15 KB mỗi từ (Opus 24–32 kbps) | Tức thì (tải từ CDN) | Tốt nhất: chọn giọng và nghe kiểm tra trước | Âm thanh tạo ra từ Kokoro dùng thương mại được. **Tránh XTTS-v2 và F5-TTS** (cấm thương mại) | Tạo sẵn bản thường và bản chậm |

## Đề xuất

1. **Tạo sẵn audio cho mọi nội dung cố định**: từ, cụm từ, câu tình huống, câu trích.
   - Chạy Kokoro-82M phía máy chủ, như một script trong CI hoặc một job trong Studio.
   - Giọng: 2 giọng Mỹ và 2 giọng Anh, mỗi giọng một bản tốc độ thường (1.0) và một bản chậm (0.75).
   - Lưu file Opus hoặc MP3 vào Supabase Storage, tên file theo mã băm nội dung.
   - Lexica đã có sẵn chỗ cắm: `card.audio.word` / `meaning` / `scenario` được `play()` phát trước tiên (`app/lib/audio/AudioService.ts`). Chỉ cần thêm các trường cho bản chậm, cụm từ và câu.
   - Cách này bỏ được Gemini cho gần hết những gì người học nghe, không còn hạn mức hay chập chờn. Nó cũng tránh hẳn vấn đề GPL, vì âm thanh đã tạo ra không chịu GPL.
2. **Câu tự do** (bài Đọc dài, câu người học tự viết):
   - Chạy Kokoro ngay trên máy người học bằng `kokoro-js`, dùng lại cách đang làm với gói chấm phát âm: tải từ Supabase khi người học bấm, lưu vào Cache Storage, chạy trong Web Worker.
   - Dùng q8 trên WASM, hoặc fp32 trên WebGPU khi máy có.
   - Thứ tự thử: Kokoro trên máy → Gemini API → giọng của trình duyệt.
   - Cần kiểm tra pháp lý phần phonemizer GPL trước khi phát hành theo cách này.
3. **Điện thoại yếu**: tải 86 MB là nặng. Câu tự do trên điện thoại có thể vẫn dùng API trước. Khi KittenTTS (25 MB) được xác minh chất lượng và giấy phép, có thể thử nó.

## Bước làm đề xuất
1. Viết script tạo audio bằng Kokoro cho bộ thẻ có sẵn và các pack Studio. Nghe kiểm tra những từ khó: từ đồng tự khác nghĩa, tên riêng.
2. Đưa lên Supabase Storage, ghi URL vào pack (`audio`), thêm trường cho bản chậm, cụm từ và câu.
3. Cho `sayModel` và `speakVaried` dùng file tạo sẵn trước. Gemini chỉ còn là đường dự phòng.
4. Sau đó mới tính Kokoro trên máy cho câu tự do.

## Nguồn
- https://www.npmjs.com/package/kokoro-js
- https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/README.md
- https://dev.to/emojiiii/running-kokoro-82m-onnx-tts-model-in-the-browser-eeh
- https://github.com/Mintplex-Labs/piper-tts-web
- https://github.com/diffusionstudio/vits-web
- https://github.com/k2-fsa/sherpa-onnx
- https://dev.to/soasme/running-kittentts-in-the-browser-a-deep-dive-into-wasm-and-onnx-18hk
- https://huggingface.co/Supertone/supertonic/blob/main/README.md
