# Gói chấm phát âm trên máy (Đợt 6, PR a)

Gói này giúp Lexica chấm từng âm ngay trên máy người học (`docs/LEXICA_PRONUNCIATION_DESIGN.md`, mục 5.2).
- Người học chỉ tải gói khi tự bấm "Tải gói".
- Tính năng đang **ẩn sau cờ**, cho tới khi qua kiểm định giọng Việt.

## Gói gồm 3 file

Cả 3 file đặt chung một thư mục `pron/v1/` trên Supabase Storage, cùng bucket công khai với content pack.

| File | Cỡ | Lấy từ đâu |
|---|---|---|
| `pron-model-v1.onnx` | 26,6MB | `build.py` (từ mô hình int8 5 giây của `../pronunciation-spike/export.py`) |
| `pron-gbm-v1.json` | 67KB | `build.py` (bộ hồi quy; bản trong thư mục này dùng cho test) |
| `ort-wasm-simd-threaded-1.22.0.wasm` | 11,2MB | `node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm`, đổi tên |

- Tên, cỡ và sha256 của từng file ghi trong `app/lib/pronunciation/model/pack.ts`. App kiểm sha256 trước khi lưu, nên file trên Storage phải khớp từng byte.
- Ngoài ra còn một file nhỏ của onnxruntime (`ort-wasm-simd-threaded.mjs`, 20KB). File này nằm sẵn trong app ở `public/pron/ort-1.22.0/`, không đưa lên Storage.
- Khi nâng onnxruntime-web, phải thay cả file `.wasm` lẫn file `.mjs`, rồi cập nhật `pack.ts`. Test `pronModel.test.ts` sẽ báo nếu hai bên lệch nhau.

## Tạo gói

```bash
cd apps/lexica/scripts/pronunciation-spike   # môi trường Python như trong docs/LEXICA_PRONUNCIATION_SPIKE.md
python export.py whisper 5                   # onnx/whisper5_int8.onnx
python ../pron-pack/build.py whisper-phoneme onnx/whisper5_int8.onnx ../pron-pack/out
cp ../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm ../pron-pack/out/ort-wasm-simd-threaded-1.22.0.wasm
```

- `build.py` in ra cỡ và sha256 của từng file. Nếu khác số trong `pack.ts` thì sửa `pack.ts`.
- Lần export khác có thể ra file `.onnx` khác vài byte, khi đó sha256 cũng khác.
- Dữ liệu cho test (`__tests__/unit/fixtures/pron-*.json`): thêm một bản ghi 16 kHz và chuỗi âm vào cuối lệnh `build.py`. Bản ghi đang dùng là câu "LOOK AT MY HAND" của speechocean762 (CC BY 4.0):

  ```bash
  python ../pron-pack/build.py ... ../pron-pack/out utt.wav L UH0 K AE0 T M AY0 HH AE0 N D
  ```

## Đưa lên Storage

1. Vào Supabase → Storage → bucket công khai đang chứa `packs/manifest.json`.
2. Tạo thư mục `pron/v1/`.
3. Tải 3 file trong `out/` lên thư mục đó.

App tìm gói theo thứ tự:
1. `NEXT_PUBLIC_PRON_PACK_URL`, nếu có đặt;
2. nếu không, `pron/v1/` cạnh `NEXT_PUBLIC_CONTENT_MANIFEST_URL` (tức `…/packs/manifest.json` → `…/pron/v1/`).

## Bật cho người thử

Mở `/speak?pron=1` (`?pron=0` để tắt) trên máy người thử. Hoặc đặt `NEXT_PUBLIC_PRON_BETA=on` để bật cho mọi người; chỉ làm khi đã qua kiểm định giọng Việt.
