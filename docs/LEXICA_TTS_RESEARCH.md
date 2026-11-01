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

## Đã làm: tạo sẵn giọng mẫu (bước 1–3)
- `apps/lexica/app/lib/audio/clips.ts`: danh sách các đoạn giọng mẫu mỗi thẻ cần, đúng như app yêu cầu: từ, bản chậm, 3 giọng, cụm từ, câu tình huống, câu trích. Phần luyện nói tải trước theo đúng danh sách này.
- `tools/lexica-voices/pregen-tts.ts` (nằm ngoài workspace pnpm, vì Kokoro kéo theo khoảng 600 MB mà không app nào nên phải cài):
  - tạo các đoạn đó bằng Kokoro-82M (q8, chạy trên CPU);
  - ghi vào **cache giọng của Cortex API** (`lexica-content/cache/tts/<key>.wav`), tên file tính đúng như API (`ttsKey`);
  - nhờ vậy API trả từ cache, không gọi Gemini, không tính hạn mức. App không cần sửa gì.
- Giọng: Kore → `af_heart`, Puck → `am_michael`, Aoede → `bf_emma` (giọng Anh), Charon → `bm_george`. Bản chậm dùng tốc độ 0,8.
- **Cách chạy**:
  - Trên GitHub: tab Actions → "Lexica voices" → Run workflow. Cần secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, và tuỳ chọn `CONTENT_MANIFEST_URL` để lấy cả thẻ của Studio.
  - Trên máy: `pnpm install`, rồi `cd tools/lexica-voices && npm install && npm run make -- --dry-run`, với các biến môi trường như trên.
  - `--dry-run` để xem danh sách trước, `--limit 50` để thử ít.
  - `--overwrite` để thay cả những đoạn Gemini đã lưu trong cache, cho giọng đồng nhất.
- Bộ thẻ có sẵn: 610 thẻ, khoảng 3.300 đoạn. Lần đầu chạy mất cỡ một tiếng (ước tính, chưa đo).
- **Chưa chạy thật**: môi trường làm việc không truy cập được Hugging Face. Lần chạy đầu tiên, nên chạy `--limit 20`, nghe thử, rồi mới chạy hết.

## Nguồn
- https://www.npmjs.com/package/kokoro-js
- https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/README.md
- https://dev.to/emojiiii/running-kokoro-82m-onnx-tts-model-in-the-browser-eeh
- https://github.com/Mintplex-Labs/piper-tts-web
- https://github.com/diffusionstudio/vits-web
- https://github.com/k2-fsa/sherpa-onnx
- https://dev.to/soasme/running-kittentts-in-the-browser-a-deep-dive-into-wasm-and-onnx-18hk
- https://huggingface.co/Supertone/supertonic/blob/main/README.md

## Nghiên cứu tiếp, 1/11/2026 (issue #114)

**Giới hạn của lần này:** máy tôi chạy không tải được mô hình (Hugging Face bị chặn), nên **chưa có số đo tốc độ và chất lượng thật**. Phần dưới là sự kiện đã kiểm chứng (giấy phép, kích thước, phiên bản) và một **công cụ đo** để bạn chạy trên máy của bạn.

### Đã kiểm chứng
| Thứ | Kết quả |
|---|---|
| `kokoro-js` 1.2.1 | Apache-2.0, phụ thuộc `@huggingface/transformers` và `phonemizer`; bản q8 khoảng 86 MB (WASM), WebGPU dùng fp32 lớn hơn nhiều |
| `phonemizer` 1.2.1 (chuyển chữ thành âm cho Kokoro) | Mô tả của gói: "eSpeak NG" biên dịch sang WASM; trường giấy phép của gói ghi Apache-2.0, **nhưng eSpeak NG gốc là GPL-3.0**. Cần người có chuyên môn pháp lý xem: phát hành eSpeak NG cho người dùng tải về có thể kéo theo nghĩa vụ GPL cho riêng thành phần đó (kèm thông báo và mã nguồn). Tôi không phải luật sư |
| `@mintplex-labs/piper-tts-web` 1.0.5 | MIT; các giọng Piper phát hành MIT theo nhà phát triển, **nhưng từng giọng có tập dữ liệu riêng, phải đọc thẻ giọng trước khi dùng thương mại**; cũng phụ thuộc bộ chuyển chữ thành âm kiểu eSpeak |
| `@diffusionstudio/vits-web` 1.0.3 | MIT, bản Piper cho trình duyệt, cũ (2024) |
| `sherpa-onnx` 2.0.1 | Apache-2.0, có bản WASM; kèm dữ liệu eSpeak NG (GPL) cho các mô hình dùng nó |
| KittenTTS nano 15M | Apache-2.0 theo README; 25 MB (int8) hoặc 56 MB tuỳ nguồn; **bản xem trước cho nhà phát triển**, có báo lỗi ở bản int8, chưa thấy bản trình duyệt |
| WebGPU trên iPhone | Có từ Safari 26 (9/2025); có báo cáo thiết bị bị mất ở một số ca. **Không nên dựa vào WebGPU trên iPhone**, coi WASM là đường chính |

### Đề xuất (chưa đo, sẽ chốt sau khi có số)
1. **Giữ cách đang làm cho nội dung cố định:** giọng tạo sẵn bằng Kokoro phía máy chủ (không dính GPL ở máy người dùng, nghe đã kiểm).
2. **Chỉ thêm giọng trên máy cho câu chưa có sẵn** (câu giám khảo đề mới, câu người học tự viết, bài đọc mới): Kokoro q8 trên WASM, **tuỳ chọn, tải khi người dùng bật** ("Giọng tự nhiên, tải khoảng 90 MB"), chạy trong Web Worker, lưu trong Cache Storage, lưu lại kết quả từng câu để không tạo lại.
3. **Thứ tự phát giọng:** file có sẵn → bộ nhớ đệm giọng → **giọng trên máy (nếu đã bật và đủ nhanh)** → API Gemini → giọng hệ thống.
4. **Chọn Kokoro trước Piper** vì cùng giọng với bộ nhớ đệm hiện có và chất lượng cao hơn; Piper là phương án nhẹ hơn cho máy yếu nếu có giọng đủ tốt và giấy phép sạch.

### Tiêu chí quyết định (đo bằng công cụ bên dưới)
- Trung vị RTF (thời gian tạo / độ dài âm thanh) **dưới 0,6 trên điện thoại tầm trung** thì bật mặc định cho người dùng chọn; từ 0,6 đến 1,5 chỉ dùng khi tạo trước ở nền; trên 1,5 thì bỏ cho máy đó.
- Tải lần đầu: dưới 120 MB và chỉ khi người dùng bật.
- Nghe 8 câu mẫu: ít nhất 4 trên 5 người thấy tự nhiên hơn giọng hệ thống và không kém Gemini rõ rệt.
- Giấy phép: luật sư hoặc người có chuyên môn đã đọc phần eSpeak NG.

### Công cụ đo: `/tts-lab.html` (trong Lexica)
Mở `https://<tên-miền-lexica>/tts-lab.html` trên điện thoại và máy tính, chọn Kokoro (WASM, rồi WebGPU nếu có), bấm "Tải mô hình và chạy 8 câu". Trang đo thời gian tải, khởi động, thời gian tạo từng câu, độ dài, RTF, bộ nhớ (Chrome), cho nghe từng câu và có nút "Nghe giọng hệ thống để so". Bấm "Chép kết quả" rồi dán cho tôi, kèm điểm tự nhiên 1 đến 5 bạn nghe được. Lưu ý: trang tải mô hình từ Hugging Face và thư viện từ jsDelivr nên cần mạng; phần Piper trong trang **chưa kiểm chứng** (tôi viết theo README, chưa chạy được ở đây), phần Kokoro theo README chính thức.


### Số đo thật đầu tiên (1/11/2026, bạn chạy)
Máy: Mac 11 nhân, RAM 16 GB, Chrome 153, WebGPU có. Kokoro q8, WASM, **một luồng** (trang chưa bật đa luồng), 8 câu mẫu.

| Câu | Dài (ký tự) | Âm thanh (s) | Thời gian tạo (ms) | RTF |
|---|---|---|---|---|
| Từ đơn | 9 | 1,5 | 2497 | 1,66 |
| Cụm từ | 26 | 2,1 | 3429 | 1,65 |
| Câu ví dụ | 60 | 3,5 | 5898 | 1,67 |
| Câu hỏi giám khảo | 90 | 5,0 | 8265 | 1,67 |
| Thẻ đề Part 2 | 155 | 9,6 | 16561 | 1,72 |
| Số và tên | 83 | 7,8 | 13296 | 1,72 |
| Đoạn dài | 253 | 16,5 | 27088 | 1,65 |
| Từ khó đọc | 97 | 5,2 | 8733 | 1,67 |

Tải và khởi tạo 4,4 giây, làm nóng 3,2 giây, bộ nhớ JS khoảng 177 MB. **RTF trung vị 1,67, tức là tạo chậm hơn cả thời gian nghe.**

**Kết luận từ số này:**
- Theo tiêu chí đặt ra (RTF dưới 0,6 trên điện thoại tầm trung), **Kokoro q8 WASM một luồng không đạt, ngay cả trên một máy tính mạnh**. Điện thoại tầm trung sẽ chậm hơn nữa. Tức là bản này **không dùng được cho giọng tương tác** (giám khảo đọc câu hỏi, đọc từ khi chạm).
- Thời gian tạo gần như tỉ lệ với độ dài, nên không có mẹo cắt câu nào cứu được.
- Còn hai hướng chưa đo, đáng thử trước khi bỏ hẳn: **(a) WebGPU** (trên máy tính có thể nhanh gấp nhiều lần, nhưng bản fp32 khoảng 300 MB và chưa chắc chạy ổn trên điện thoại), **(b) WASM đa luồng** (cần bật cô lập nguồn gốc chéo: trang đo đã được thêm tiêu đề `COOP` và `COEP` để thử, và hiện "đa luồng WASM: bật" khi đã được).
- Dù WebGPU nhanh, đó chỉ giúp máy tính. **Cho điện thoại, hướng thực tế hơn là tạo sẵn giọng** (đã làm với bộ nhớ đệm Kokoro trên máy chủ) và **mở rộng phạm vi tạo sẵn**: mọi câu giám khảo, mọi đoạn Đọc, tạo trước khi nội dung được xuất bản, thay vì tạo lúc người dùng cần.

**Việc tiếp:** chạy lại trang đo (a) WebGPU fp32, (b) WASM với đa luồng bật, (c) thử q4 cho WASM; gửi lại kết quả. Nếu không cái nào đạt, đề xuất cuối là **không làm giọng trên máy**, mà tạo sẵn toàn bộ nội dung và dùng Gemini/giọng hệ thống làm phương án cuối.


### Số đo thật, lượt hai (1/11/2026, cùng Mac 11 nhân, Chrome 153)
| Cấu hình | Tải + khởi tạo | RTF trung vị | Câu hỏi giám khảo (5 s âm thanh) | Thẻ đề Part 2 (9,6 s) |
|---|---|---|---|---|
| WASM q8, một luồng (lượt một) | 4,4 s | 1,67 | 8,3 s | 16,6 s |
| **WASM q8, đa luồng** | 0,6 s (đã lưu đệm) | **0,82** | 4,1 s | 7,8 s |
| **WASM q4, đa luồng** | 9,0 s (lần đầu tải) | **0,45** | 2,4 s | 4,2 s |
| **WebGPU fp32** | 10,0 s (lần đầu tải, ~300 MB) | **0,18** | 0,8 s | 1,3 s |

**Đọc kết quả:**
- Đa luồng nhân đôi tốc độ (1,67 xuống 0,82), q4 gần nhân đôi lần nữa (0,45), WebGPU nhanh nhất (0,18: tạo xong câu giám khảo dưới 1 giây).
- **Trên máy tính mạnh**, q4 đa luồng và WebGPU đều đạt tiêu chí RTF dưới 0,6; q8 chưa đạt.
- **Điện thoại chưa đo.** CPU điện thoại thường chậm hơn một chip Mac cỡ 2 đến 4 lần; nếu đúng, q4 sẽ ở khoảng RTF 0,9 đến 1,8 (không đạt), và chỉ WebGPU (nếu điện thoại chạy được) mới có hy vọng. Đây là phỏng đoán, cần đo.
- **Chất lượng của q4 so với q8 và fp32 chưa nghe so sánh.** Lượng tử hoá mạnh có thể làm giọng kém tự nhiên; phải nghe trước khi chọn q4.

**Cái giá của đa luồng:** cần `Cross-Origin-Opener-Policy: same-origin` và `Cross-Origin-Embedder-Policy: require-corp` trên trang dùng nó. Trang đo chỉ đặt cho `/tts-lab.html`. Nếu làm vào app thật thì mọi nội dung nhúng khác nguồn trên cùng trang (ví dụ **video YouTube nhúng của "câu ngoài đời"**, ảnh, font từ nguồn khác) có thể hỏng. Hướng giảm thiểu: chạy giọng ở một trang riêng nhúng bằng iframe (cũng phải cô lập), hoặc `COEP: credentialless` (Chrome và Firefox có, **Safari chưa có**, nên iPhone không hưởng). Nghĩa là **WASM đa luồng hầu như không dùng được trên iPhone**, nơi WebGPU mới có chỗ (Safari 26).

**Đề xuất cập nhật (tạm, chờ số đo điện thoại và nghe chất lượng):**
1. Giọng trên máy là **tuỳ chọn nâng cao, bật khi máy có WebGPU hoặc (đa luồng và từ 6 nhân)**, mặc định tắt; máy không đủ thì dùng giọng tạo sẵn, rồi Gemini, rồi giọng hệ thống như hiện nay.
2. Dùng để **đọc trước**: giám khảo đọc câu kế tiếp lúc bạn đang nói câu này (đỡ chờ), `tts.stream()` của kokoro-js cho âm thanh đầu tiên sớm hơn.
3. Giọng tạo sẵn trên máy chủ vẫn là đường chính cho nội dung cố định.
4. Việc cần làm để chốt: **(a)** đo trên 2 điện thoại (một Android tầm trung, một iPhone từ Safari 26), **(b)** nghe so sánh q4, q8, fp32 và cho điểm, **(c)** thử `COEP: credentialless` và xem video YouTube nhúng có hỏng không, **(d)** xem pháp lý eSpeak NG.


### Đã làm: giọng tự nhiên trên máy, tuỳ chọn (1/11/2026)
Bạn nghe cả q4, q8 và fp32 đều thấy tự nhiên, nên chất lượng không còn là rào cản; rào cản còn lại là tốc độ trên điện thoại, mà chưa đo. Thay vì chờ, app **tự đo ngay trên máy người dùng**:
- Tuỳ chọn ở **Tôi → "Giọng tự nhiên trên máy"**, mặc định tắt. Bật thì tải mô hình một lần (WebGPU fp32 khoảng 300 MB; chỉ chạy khi máy có WebGPU, hoặc WASM q4 đa luồng khi trang đã cô lập nguồn gốc chéo và có từ 6 nhân; WASM một luồng không được mời vì quá chậm).
- Ngay sau khi tải, **thử tốc độ** (một câu mẫu). Nhanh hơn thời gian nghe (RTF không quá 0,8) thì bật; không thì tự để tắt và báo "máy này chưa đủ nhanh".
- Khi bật, `AudioService` dùng giọng này cho **câu chưa có file tạo sẵn** (ngắn hơn 300 ký tự), trước khi gọi API Gemini; chạy trong Web Worker (`public/device-voice-worker.js`), nhớ 40 câu gần nhất. Cùng giọng (af_heart, am_michael, bf_emma) với các file tạo sẵn.
- Lần sau mở app, giọng tự nạp lại nền nếu đã bật.
- Sự kiện `device_voice` ghi kết quả (ready, unfit, error) và loại thiết bị, để biết bao nhiêu máy thật sự chạy được.
