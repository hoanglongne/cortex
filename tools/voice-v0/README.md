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
1. Người thử ghi mẫu giọng (trang `/giong-thu` của Lexica đã gỡ ngày 26/11/2026 sau khi dừng thử; lấy lại từ lịch sử git nếu cần) và gửi file WAV.
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

## Kết quả (22/11/2026): không đạt, dừng
Ba lần thử với một người thử, chấm "giống tôi" và "tự nhiên" từ 1 đến 5:
- kNN-VC với mẫu khoảng 1 phút, và OpenVoice v2: không đạt (lần 1 và 2, xem issue #145).
- kNN-VC với mẫu 4 phút 13 giây (issue #173): **tệ hơn** mẫu 1 phút theo lời người thử, nên thêm mẫu không cứu được chất lượng.
- Bản ghi 4 phút ồn nền cao hơn bản 1 phút khoảng 10 dB (−43 dB so với −53 dB) và nhiều âm cao hơn (18,6% so với 12% năng lượng trên 4 kHz). Đây chỉ là một cách giải thích có thể, chưa thử lọc ồn.

Chưa thử: Chatterbox, CosyVoice 2, lọc ồn trước khi đổi giọng. Chỉ nên mở lại nếu đổi hẳn cách tiếp cận (tổng hợp theo mẫu giọng thay vì đổi màu giọng), không phải thêm mẫu cho kNN-VC.
