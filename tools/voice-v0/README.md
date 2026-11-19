# "Giọng bạn" V0: thử đổi giọng mẫu sang giọng người học (issue #145)

Mục đích: trước khi làm tính năng "Giọng của tôi", thử xem đổi clip giọng mẫu
của app sang giọng một người có (1) giống người đó và (2) vẫn phát âm chuẩn
không. Kế hoạch: `docs/LEXICA_WOW_PLAN.md` mục 3.

## Ứng viên và giấy phép (đã đọc file LICENSE ngày 19/11/2026)
| Ứng viên | Hướng | Giấy phép mã | Trọng số |
|---|---|---|---|
| kNN-VC | đổi màu giọng | MIT | GitHub Releases của repo (WavLM-Large, HiFi-GAN) |
| OpenVoice v2 | đổi màu giọng | MIT | huggingface.co/myshell-ai/OpenVoiceV2 (MIT) |
| Chatterbox | tổng hợp theo mẫu | MIT | chưa thử |
| CosyVoice 2 | tổng hợp theo mẫu | Apache 2.0 | chưa thử |

Tránh XTTS-v2 và F5-TTS (giấy phép cấm thương mại).

## Chạy
1. Người thử ghi mẫu giọng ở `/giong-thu` của Lexica (khoảng 60 giây, có câu kiểm tra ngẫu nhiên) và gửi file WAV.
2. Lấy 20 clip giọng mẫu từ API của app (`/v1/lexica/tts?text=…`) vào một thư mục `ref/`.
3. Chạy hai bộ đổi giọng (CPU, khoảng 1 giây mỗi clip):

```
python knnvc_convert.py --repo knn-vc --ckpt ckpt --sample giong.wav --refs ref --out out_knn
python openvoice_convert.py --repo OpenVoice --ckpt ckpt/ov2/converter --sample giong.wav --refs ref --out out_ov
```

- `knn-vc`, `OpenVoice`: bản clone của hai repo. Script chỉ nạp mã, không cài.
- `ckpt`: `WavLM-Large.pt`, `prematch_g_02500000.pt` (kNN-VC) và `ov2/converter/{config.json,checkpoint.pth}`.

4. Người thử nghe và chấm "giống tôi" và "tự nhiên" từ 1 đến 5 cho từng câu.

## Tiêu chí
- **Qua:** chính chủ chấm "giống tôi" ≥ 4/5, và điểm phát âm của clip ngang clip chuẩn.
- **Không đạt:** dừng.
