# Thử nghiệm: mô hình chấm phát âm chạy trên máy (Đợt 6)

Ngày: 20/10/2026. Đi kèm thiết kế `docs/LEXICA_PRONUNCIATION_DESIGN.md`. Script để chạy lại: `apps/lexica/scripts/pronunciation-spike/`.

## Kết luận

- **Chọn `vb223/whisper-base-en-phoneme-ctc`** (giấy phép MIT):
  - encoder Whisper base.en với đầu ra CTC theo âm ARPAbet;
  - căn từng âm của từ mẫu, tính GOP, rồi một bộ hồi quy (300 cây) ra điểm 0–2 cho mỗi âm.
- Tốt nhất về độ chính xác, đồng thời **nhỏ nhất và nhanh nhất**:
  - int8 chỉ **26,6MB**;
  - ngữ cảnh 5 giây chạy **0,27–0,5 giây** mỗi lần chấm trong Chromium (WASM);
  - độ chính xác gần như không đổi so với bản gốc.
- **Không dùng được** ZIPA và BranchShine: giấy phép CC BY-NC-SA, cấm dùng thương mại.
- Hai mô hình wav2vec2 cỡ 300M (355MB) vừa nặng vừa kém hơn.
- **Chưa kiểm được trên giọng người Việt.** speechocean762 là người nói tiếng Trung. Đây là việc phải làm trước khi bật cho người dùng.

## Cách thử

- **Dữ liệu:** tập test của speechocean762 (CC BY 4.0). Mỗi âm có điểm của người chấm: 2 đúng, 1 nặng giọng, 0 sai hoặc mất. Lấy ngẫu nhiên 500 câu (khoảng 9.400 âm), hạt giống cố định.
- **Cách chấm như nhau cho mọi mô hình:** căn CTC các âm của câu mẫu vào bản ghi, rồi tính GOP mỗi âm (log-xác suất âm đúng trừ âm cạnh tranh mạnh nhất). Với các mô hình nhận dạng tự do, còn thử cách nhận dạng thẳng rồi so chuỗi âm.
- **Chỉ số:**
  - `AUC sai`: phân biệt âm sai (điểm < 1) với âm còn lại. 0,5 là đoán bừa, 1 là hoàn hảo.
  - `AUC âm cuối`: cùng chỉ số đó nhưng chỉ tính phụ âm cuối từ, lỗi điển hình của người Việt.
  - `PCC`: tương quan với điểm người chấm. Đây là chỉ số chuẩn của speechocean762.
- **Kiểm tra bộ đánh giá:** chạy mô hình Whisper ra PCC **0,605**, khớp với số tác giả công bố (0,606).

## Độ chính xác (500 câu)

| Mô hình | Giấy phép | Cỡ int8 | AUC sai | AUC âm cuối | PCC |
|---|---|---|---|---|---|
| **whisper-base-en-phoneme-ctc** (GOP + hồi quy) | MIT | 29MB | **0,929** | **0,901** | **0,605** |
| cùng mô hình, ngữ cảnh 10 giây | MIT | 27MB | 0,927 | 0,901 | 0,590 |
| cùng mô hình, chỉ GOP thô, không hồi quy | MIT | 29MB | 0,916 | 0,880 | 0,470 |
| hubert-base-phoneme-en (Peacockery) | Apache-2.0 | 122MB | 0,871 | 0,826 | 0,389 |
| wav2vec2-xls-r-300m-timit (bản ONNX "Speako") | Apache-2.0 | 355MB | 0,859 | 0,836 | 0,385 |
| wav2vec2-large-xlsr-53-l2-arctic | Apache-2.0 | ~330MB | 0,856* | 0,858* | 0,400* |
| wav2vec2-base-en-phoneme-ctc-41h (bobboyms) | Apache-2.0 | ~95MB | 0,745 | 0,813 | 0,221 |

\* Chỉ tính được 231/500 câu: bộ ký hiệu của mô hình tách nguyên âm đôi thành hai ký tự, bảng ánh xạ của script chưa khớp. Mô hình này đáng chú ý vì L2-ARCTIC có người nói tiếng Việt, nhưng nó nặng ~330MB.

- **Bộ hồi quy** của Whisper học trên tập train của speechocean762, nên có lợi thế sân nhà. Kể cả bỏ bộ hồi quy (GOP thô), Whisper vẫn hơn mọi mô hình khác (AUC 0,916).
- **Nhận dạng tự do rồi so chuỗi âm** kém hẳn ở mọi mô hình: F1 0,14–0,20, báo sai rất nhiều. Phải căn theo âm mẫu (GOP), không nhận dạng tự do.

### Câu ngắn (≤ 4,8 giây): gần với cách Lexica dùng

| Bản | Câu | AUC sai | AUC âm cuối | PCC |
|---|---|---|---|---|
| Whisper, ngữ cảnh 30 giây (PyTorch) | 300 | 0,916 | 0,894 | 0,493 |
| Whisper, ngữ cảnh 5 giây (PyTorch) | 300 | 0,914 | 0,901 | 0,481 |
| Whisper, ngữ cảnh 5 giây, **ONNX int8** (đúng file chạy trên trình duyệt) | 300 | 0,911 | 0,903 | 0,480 |
| như trên | 600 | 0,914 | **0,940** | 0,501 |

Cắt ngữ cảnh từ 30 xuống 5 giây và lượng tử int8 gần như không làm giảm độ chính xác.

### Ngưỡng báo lỗi (bản 5 giây int8, 600 câu ngắn, 10.705 âm)

Mỗi dòng: app báo "âm này có thể chưa đúng" khi điểm dự đoán dưới ngưỡng.

| Ngưỡng | Tỉ lệ âm bị báo | Trong số âm bị báo: người chấm cũng thấy chưa chuẩn (< 2) | Trong số âm bị báo: người chấm cho là sai (< 1) | Tìm ra được bao nhiêu âm sai (< 1) |
|---|---|---|---|---|
| 0,5 | 1,7% | **70%** | 43% | 32% |
| 0,8 | 3,0% | 64% | 35% | 46% |
| 1,0 | 4,2% | 58% | 28% | 52% |
| 1,5 | 9,9% | 47% | 17% | 75% |

**Gợi ý dùng:**
- ngưỡng **0,5–0,8**;
- mỗi lần nói báo **tối đa 1–2 âm** tệ nhất;
- lời luôn là "có thể chưa rõ", kèm nghe lại giọng mình cạnh giọng mẫu.

Ở ngưỡng này, khoảng 2/3 lần app báo là đúng ý người chấm. App bỏ sót khá nhiều, nhưng ít khi trách oan.

## Tốc độ trong trình duyệt

Chromium (Playwright), onnxruntime-web 1.22, WASM, máy chủ thử nghiệm 4 vCPU.
- "CPU chậm 4×" là giả lập máy yếu bằng CDP. Giả lập này chỉ làm chậm luồng chính; khi chạy 4 luồng, các worker có thể không bị làm chậm đủ.
- Số liệu thật phải đo trên điện thoại.

| Mô hình | Đầu vào | 1 luồng | 4 luồng | 1 luồng, CPU chậm 4× | 4 luồng, CPU chậm 4× | Tải phiên |
|---|---|---|---|---|---|---|
| **Whisper 5 giây int8 (26,6MB)** | 5 giây | **484ms** | **266ms** | 2,8 giây | 0,6 giây | 0,7 giây |
| Whisper 10 giây int8 | 10 giây | 1,1 giây | 0,55 giây | 6,7 giây | 1,6 giây | 0,8 giây |
| Whisper 30 giây int8 | 30 giây | 5,1 giây | 1,4 giây | 26 giây | 5,3 giây | 0,7 giây |
| HuBERT base int8 (122MB) | 3 giây | 2,0 giây | 0,9 giây | 11 giây | 2,8 giây | 1,0 giây |
| Speako 300M int8 (355MB) | 3 giây | 4,3 giây | 1,7 giây | 24 giây | 5,7 giây | 3,4 giây |

Bộ nhớ heap JS khi chạy Whisper 5 giây khoảng 30MB; Speako khoảng 360MB.

## Phần còn phải viết bằng JS khi làm thật

- **Log-mel của Whisper:** STFT 400/160, 80 dải mel, log10, kẹp ở max − 8, chuẩn hoá (x + 4) / 4. Transformers.js có sẵn `WhisperFeatureExtractor`; tự viết thì khoảng 80 dòng.
- **Căn CTC** (Viterbi theo chuỗi âm mẫu, có blank) và đặc trưng GOP: khoảng 80 dòng thuần, test được bằng vitest.
- **Bộ hồi quy:** 300 cây, mỗi cây ≤ 31 lá. Xuất từ scikit-learn sang JSON (khoảng 200–300KB), duyệt cây trong JS. Hoặc thay bằng ngưỡng trên GOP thô, chấp nhận kém hơn một chút.
- **Phiên âm mẫu:** CMUdict có trọng âm (mô hình dùng ARPAbet có số trọng âm, như speechocean762).

## Rủi ro và việc tiếp theo

1. **Giọng Việt.**
   - Ghi 20 từ × 3–5 người (đọc đúng, cố tình bỏ âm cuối, đổi /θ/ thành /t/…), chạy cùng script.
   - Nếu kém: tinh chỉnh tiếp trên dữ liệu L2-ARCTIC. Bộ này có người Việt, nhưng phải đăng ký và kiểm giấy phép.
2. **Điện thoại thật.** Đo trên 1 máy Android tầm trung và 1 iPhone. Ngưỡng chấp nhận: ≤ 1,5 giây mỗi lần chấm.
3. **Nơi đặt file mô hình:** HF Hub hoặc Supabase Storage. Tải khi người học bấm, lưu Cache Storage. Giấy phép MIT cho phép.
4. **Quyền của dữ liệu huấn luyện:** speechocean762 là CC BY 4.0, cho phép dùng thương mại nếu ghi nguồn. Ghi nguồn trong trang "Lexica có gì" hoặc trang giới thiệu.

## Chạy lại

```bash
cd apps/lexica/scripts/pronunciation-spike
python3 -m venv venv && . venv/bin/activate
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install "transformers<5" onnx onnxruntime soundfile pandas pyarrow librosa openai-whisper==20250625 scikit-learn==1.7.2 joblib==1.5.3 huggingface_hub
hf download vb223/whisper-base-en-phoneme-ctc --local-dir whisper-phoneme
curl -L -o test.parquet https://huggingface.co/api/datasets/mispeech/speechocean762/parquet/default/test/0.parquet
python evalmdd.py whisper 500                    # độ chính xác; 'whisper10', 'whisper5', 'whisper-raw' hoặc tên mô hình CTC trên HF
SHORT=1 python evalmdd.py whisper5-onnx 600      # bản ONNX int8, chỉ câu ≤ 4,8 giây (cần export trước)
python export.py whisper 5                       # ONNX + int8 vào onnx/
python export.py hubert
npm i onnxruntime-web@1.22.0 && node serve.mjs . & node bench.mjs   # tốc độ trong Chromium
```

## Nguồn
- Mô hình: https://huggingface.co/vb223/whisper-base-en-phoneme-ctc (MIT)
- speechocean762: https://www.openslr.org/101/ (CC BY 4.0)
- ZIPA: https://huggingface.co/anyspeech/zipa-small-crctc-ns-700k (CC BY-NC-SA 4.0)
- BranchShine-CR: https://huggingface.co/nikhilnavas/branchshine-cr (CC BY-NC-SA 4.0)
- Speako: https://huggingface.co/robg/speako-phoneme-recognizer (Apache-2.0)
