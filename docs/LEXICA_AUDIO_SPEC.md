# Lexica Audio (TTS) — Spec

> Giọng đọc chất lượng cao cho thẻ, câu ví dụ và story, mà không biến chi phí AI thành chi phí theo người dùng.

| | |
|---|---|
| Trạng thái | Draft v1, chưa triển khai |
| Liên quan | `docs/LEXICA_STUDIO_SPEC.md` (bước publish), `apps/lexica` |
| Thay thế | `speechSynthesis` đang gọi trực tiếp trong `VocabCard`, `LearnedWordsList`, `StoryMode` |

---

## 1. Vấn đề

- Hiện app dùng `window.speechSynthesis`: chất lượng tuỳ máy, nhiều Android đọc như robot, iOS đọc tiếng Anh ổn nhưng tiếng Việt kém.
- Câu của Lexica là **tiếng Việt chen 1 từ tiếng Anh** ("Cuối tháng sống FRUGAL tới mức…"). Giọng đơn ngữ luôn đọc hỏng một phía: giọng Việt đọc "FRUGAL" thành "phờ-ru-gan", giọng Anh đọc phần Việt không nghe được.
- Không muốn gọi API TTS mỗi lần người dùng bấm nghe (chi phí theo user, phụ thuộc mạng, độ trễ).

## 2. Nguyên tắc

1. **Nội dung cố định thì sinh sẵn.** Thẻ, câu, story đều đi qua Studio, nên audio được tạo **một lần lúc publish**, lưu lên CDN, phát như file tĩnh.
2. **Nội dung động thì chạy trên máy.** Từ người dùng tự tra, câu tuỳ biến: dùng model TTS chạy trong trình duyệt.
3. **Luôn có dự phòng.** Mất mạng hoặc máy yếu thì quay về `speechSynthesis`.

## 3. Kiến trúc 3 tầng

```
                 play(cardId, part)
                        │
         ┌──────────────┼───────────────────┐
         ▼              ▼                   ▼
  Tầng 1: file sinh sẵn   Tầng 2: on-device      Tầng 3: speechSynthesis
  (CDN, Studio tạo)       (Kokoro, WebGPU/WASM)  (giọng hệ thống)
  chất lượng cao nhất     chỉ tiếng Anh          luôn có
```

`AudioService.play()` thử lần lượt: file có trong pack → model on-device đã tải xong → `speechSynthesis`.

## 4. Tầng 1 — Audio sinh sẵn (chính)

### 4.1 Đọc gì

Mỗi thẻ có 3 clip:

| Clip | Nội dung | Giọng |
|---|---|---|
| `word` | Từ đích, đọc chậm, rõ | Anh (en-US) |
| `meaning` | `translationHint` | Việt |
| `scenario` | Cả câu ví dụ | Ghép Việt + Anh (mục 4.2) |

Story: 1 clip / đoạn.

### 4.2 Xử lý câu trộn Việt–Anh

Cách **ghép đoạn** (khuyến nghị, ổn định nhất):

1. Tách `scenario` tại token viết hoa: `["Cuối tháng sống ", "FRUGAL", " tới mức ly trà đá cũng chia đôi với đứa bạn."]`.
2. Phần Việt → giọng Việt. Từ đích → **cùng giọng Anh của clip `word`** (người nghe nhận ra đúng âm đã học).
3. Nối bằng ffmpeg với khoảng nghỉ 80–120 ms quanh từ đích, chuẩn hoá âm lượng (loudnorm −16 LUFS) để 2 giọng không lệch.

Phương án thay thế: một giọng đa ngôn ngữ (nhiều nhà cung cấp có giọng "multilingual") đọc cả câu, đánh dấu từ Anh bằng SSML `<lang xml:lang="en-US">`. Gọn hơn nhưng chất lượng tiếng Việt của giọng đa ngôn ngữ thường kém giọng Việt chuyên dụng. Cần nghe thử cả hai trước khi chọn (mục 8).

### 4.3 Nhà cung cấp

Interface chung để đổi nhà cung cấp mà không sửa pipeline:

```ts
interface TtsProvider {
  id: string;                                   // 'google', 'azure', 'fpt', 'elevenlabs'
  synthesize(input: { text: string; lang: 'vi' | 'en'; voice: string; rate?: number }): Promise<Buffer>; // mp3/opus
}
```

Ứng viên (giá và danh sách giọng phải kiểm tra lại lúc triển khai):

| Nhà cung cấp | Tiếng Việt | Tiếng Anh | Ghi chú |
|---|---|---|---|
| FPT.AI / Viettel AI / Zalo AI | Rất tốt, nhiều giọng vùng miền | Yếu | Hợp cho phần Việt |
| Google Cloud TTS | Tốt | Tốt | Một nhà cung cấp cho cả hai tiếng |
| Azure Neural TTS | Tốt (vi-VN) | Rất tốt | Hỗ trợ SSML `<lang>` |
| ElevenLabs | Khá | Rất tốt, tự nhiên nhất | Đắt hơn |

Mặc định đề xuất: **giọng Việt của một nhà Việt + giọng Anh của Google/Azure**, ghép theo 4.2.

### 4.4 Tích hợp vào Studio

Thêm bước `audio` trong job publish (giữa build pack và upload manifest):

1. Với mỗi thẻ trong pack chưa có audio cho `revision` hiện tại → sinh 3 clip.
2. Upload `audio/<cardId>/<revision>/<clip>.mp3` (`Cache-Control: immutable`).
3. Ghi vào pack:

```json
"audio": {
  "word": ".../audio/t0k9xa/1/word.mp3",
  "meaning": ".../audio/t0k9xa/1/meaning.mp3",
  "scenario": ".../audio/t0k9xa/1/scenario.mp3"
}
```

- Cache theo `sha256(provider + voice + text)` trong bảng `studio.audio_cache` để sửa thẻ không sinh lại clip không đổi.
- Lỗi TTS không chặn publish: thẻ thiếu audio vẫn phát hành, app tự dùng tầng 2/3.
- Studio có nút nghe thử trong Inbox và nút "sinh lại audio" trên từng thẻ.
- **Thẻ core (570 thẻ `v###`)**: chạy một lần script backfill, đưa vào core pack.

### 4.5 Chi phí

- 570 thẻ core × ~200 ký tự (3 clip) ≈ 115k ký tự. Trend Drop ~120 thẻ/tháng ≈ 25k ký tự/tháng.
- Ở mức giá giọng neural phổ biến (cỡ chục USD / 1 triệu ký tự), backfill toàn bộ là vài USD, chạy hằng tháng dưới 1 USD.
- Lưu trữ: ~30 KB/clip opus → 570 thẻ × 3 ≈ 50 MB. Egress đi qua CDN, mỗi lần nghe chỉ tải 1 clip nhỏ.

## 5. Tầng 2 — TTS chạy trên máy (cho nội dung động)

- **Model**: Kokoro (~82M tham số, ONNX) qua `kokoro-js` / transformers.js. Tiếng Anh tự nhiên, chạy WebGPU (nhanh) hoặc WASM (chậm hơn).
- **Chỉ tiếng Anh**: tiếng Việt chạy trên máy hiện chưa có model đủ tốt (Piper `vi_VN` dùng được nhưng còn máy móc). Phần Việt vẫn dùng tầng 3.
- **Tải lười**: chỉ tải khi người dùng bật "Giọng chất lượng cao" trong Cài đặt, và chỉ khi có WebGPU hoặc RAM đủ (`navigator.deviceMemory >= 4`). Model (bản lượng tử hoá, vài chục MB) cache bằng Cache Storage.
- Chạy trong Web Worker để không giật UI; cache kết quả theo text trong IndexedDB (giới hạn 200 clip, LRU).

## 6. Tầng 3 — speechSynthesis

Giữ như hiện tại nhưng gom về một chỗ:
- Ưu tiên giọng `en-US` có `localService = true`, chất lượng "Enhanced/Premium" nếu máy có.
- Đây cũng là đường duy nhất khi offline và chưa có file audio.

## 7. Thay đổi phía Lexica

- `app/lib/audio/AudioService.ts`: `play(cardId, clip)`, `playText(text, lang)`, `stop()`, `preload(cardIds)`.
  - Một `HTMLAudioElement` dùng chung (iOS chỉ cho phát sau tương tác, nên "mở khoá" audio ở lần chạm đầu).
  - Preload clip `word` của 3 thẻ tiếp theo trong deck.
- Thay toàn bộ lời gọi `speechSynthesis` trực tiếp (`VocabCard`, `LearnedWordsList`, `StoryMode`) bằng `AudioService`.
- Cài đặt: "Giọng chất lượng cao (tải ~xx MB)" bật tầng 2; "Tự đọc từ khi lật thẻ".
- Analytics: ghi tầng nào được dùng (`audio_tier`) để biết tỉ lệ người dùng nghe được audio chuẩn.

## 8. Lộ trình

| Bước | Việc | Ước lượng |
|---|---|---|
| 1 | Nghe thử: 20 câu mẫu × 3–4 tổ hợp nhà cung cấp/giọng, cả ghép đoạn lẫn đa ngôn ngữ; chọn bằng tai | 1 ngày |
| 2 | `AudioService` + thay các chỗ gọi `speechSynthesis` (chỉ tầng 3, chưa đổi chất lượng) | 0.5 ngày |
| 3 | `TtsProvider` + script backfill core pack + bước `audio` trong publish Studio | 2 ngày |
| 4 | Tầng 2 (Kokoro, worker, cài đặt) | 2 ngày |

## 9. Câu hỏi mở

1. Một giọng Việt cố định làm "giọng Lexica", hay cho chọn giọng Bắc/Nam?
2. Có tự phát audio khi lật thẻ mặc định, hay để người dùng bấm?
3. Story có cần audio cả đoạn (giống audiobook) ngay ở v1 không?
