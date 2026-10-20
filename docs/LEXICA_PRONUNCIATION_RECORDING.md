# Ghi âm kiểm định giọng Việt (Đợt 6)

Mục đích: kiểm xem mô hình chấm phát âm có bắt đúng lỗi của **người Việt** không, trước khi bật cho người dùng. Thiết kế ở `docs/LEXICA_PRONUNCIATION_DESIGN.md` (mục 8), thử nghiệm mô hình ở `docs/LEXICA_PRONUNCIATION_SPIKE.md`.

## Tóm tắt

| | |
|---|---|
| Ai ghi | 3–5 người Việt; nên có cả nam và nữ, điện thoại và laptop |
| Mỗi người mất | khoảng 10 phút |
| Mở ở đâu | `<địa chỉ Lexica>/ghi-am`, ví dụ `https://lexica.../ghi-am`. Trang không có link trong app |
| Đọc gì | 20 từ, mỗi từ 2 lần: một lần **đúng**, một lần **sai có chủ ý** theo hướng dẫn trên màn hình (40 lượt) |
| Gửi lại gì | **một file** `lexica-ghiam-<tên>-<ngày>.zip`, qua Zalo, email hoặc Drive |
| Người chạy chấm nhận được gì | bảng "bắt đúng lỗi %" và "báo oan %" cho từng người và tổng, kèm kết luận **ĐẠT / CHƯA ĐẠT** |

## Phần 1: dành cho người ghi

1. Mở link trên trình duyệt (Chrome, Safari). Ngồi chỗ yên tĩnh.
2. Nhập tên hoặc biệt danh, chọn điện thoại hay laptop, có tai nghe mic hay không. Bấm **Bắt đầu**, rồi cho phép dùng micro.
3. Mỗi lượt:
   - màn hình ghi rõ **đọc đúng** từ gì, hoặc **đọc sai có chủ ý** thành từ gì (ví dụ *light* đọc thành "lie");
   - bấm **Bấm và đọc**, đọc to rõ một lần, máy tự dừng khi bạn im;
   - bấm **Nghe lại**: chưa rõ hoặc bị lẫn tiếng ồn thì **Ghi lại**;
   - bấm **Tiếp**.
4. Hết 40 lượt, bấm **Tải file về** rồi gửi file .zip cho đội Lexica.

Lưu ý:
- Đừng tắt hay tải lại trang giữa chừng: bản ghi chỉ nằm trong trang cho tới khi tải về.
- File chỉ chứa giọng đọc 20 từ này, tên bạn nhập và loại máy. Không gửi gì lên server.
- Lượt "sai có chủ ý" là cố tình. Cứ đọc đúng như hướng dẫn, không cần ngại.

## Bộ 20 từ

| # | Từ | Lượt sai đọc thành | Nhóm lỗi |
|---|---|---|---|
| 1 | light | lie | mất phụ âm cuối /t/ |
| 2 | bike | buy | mất phụ âm cuối /k/ |
| 3 | rice | rye | mất phụ âm cuối /s/ |
| 4 | wide | why | mất phụ âm cuối /d/ |
| 5 | bed | bet | /d/ cuối thành /t/ |
| 6 | think | sink | /θ/ thành /s/ |
| 7 | three | tree | /θ/ thành /t/ |
| 8 | play | pay | mất /l/ trong cụm |
| 9 | glass | gas | mất /l/ trong cụm |
| 10 | walked | walk | mất đuôi -ed |
| 11 | cats | cat | mất đuôi -s |
| 12 | sheep | ship | /iː/ dài thành /ɪ/ ngắn |
| 13 | leave | live | /iː/ dài thành /ɪ/ ngắn |
| 14 | cheap | sheep | /tʃ/ thành /ʃ/ |
| 15 | thing | thin | /ŋ/ cuối thành /n/ |
| 16 | feel | fee | mất /l/ cuối |
| 17 | zoo | sue | /z/ đầu thành /s/ |
| 18 | bad | bed | /æ/ thành /e/ |
| 19 | abundant | A-bun-dant | nhấn sai âm tiết (dùng cho mức 3, chưa chấm) |
| 20 | develop | DE-ve-lop | nhấn sai âm tiết (dùng cho mức 3, chưa chấm) |

Danh sách nằm ở `apps/lexica/app/data/recordingKit.ts`.

## Phần 2: dành cho người chạy chấm

### Đầu vào: file zip
```
lexica-ghiam-lan-2026-10-20.zip
├── manifest.csv           ← đáp án, một dòng mỗi lượt
├── 01-light-dung.wav      ← WAV 16 kHz, mono, 16-bit
├── 02-light-sai.wav
├── …
└── 40-develop-sai.wav
```

Các cột của `manifest.csv`:

| Cột | Ý nghĩa | Ví dụ |
|---|---|---|
| `file` | tên file WAV | `02-light-sai.wav` |
| `tu` | từ mẫu | `light` |
| `luot` | `dung` hoặc `sai` | `sai` |
| `am_mau` | âm của từ mẫu (CMUdict, có trọng âm) | `L AY1 T` |
| `nhom_loi` | nhóm lỗi | `final_consonant` |
| `doc_thanh` | đã đọc thành | `lie` |
| `loi_o_am` | vị trí âm bị đổi trong `am_mau` (đếm từ 0) | `2` (âm `T`) |
| `nguoi_ghi`, `thiet_bi`, `tai_nghe`, `ngay` | thông tin lượt ghi | `lan`, `dien-thoai`, `khong`, `2026-10-20` |

### Chạy
Chuẩn bị môi trường một lần, như mục "Chạy lại" trong `docs/LEXICA_PRONUNCIATION_SPIKE.md`. Sau đó:
```bash
cd apps/lexica/scripts/pronunciation-spike
python evalvi.py lexica-ghiam-*.zip              # ngưỡng mặc định 0,6
python evalvi.py lexica-ghiam-*.zip --threshold 0.8
```

### Đầu ra
Trên màn hình:
```
Ngưỡng 0.6. Một dòng mỗi người ghi, dòng cuối là tổng.
người ghi         bắt đúng lỗi       báo oan
lan               13/18    72%     2/18   11%
TỔNG              ...

Kết luận: ĐẠT (cần bắt đúng ≥ 60% và báo oan ≤ 20%). Chi tiết từng lượt: ketqua.csv
```
(Số trong ví dụ là minh hoạ.)

- **Bắt đúng lỗi:** trong các lượt đọc sai, tỉ lệ lượt mà app báo đúng âm bị đổi.
- **Báo oan:** trong các lượt đọc đúng, tỉ lệ lượt mà app vẫn báo có âm sai.
- **`ketqua.csv`:** một dòng mỗi lượt, gồm điểm từng âm (`L:1.85 AY1:1.90 T:0.21`), các âm bị báo và lượt đó đạt hay không. Dùng để xem mô hình hay sai ở nhóm lỗi nào.
- Hai từ trọng âm chưa được chấm (chờ mức 3).

### Đạt rồi thì
- Bật gói chấm cho người dùng (bỏ cờ ẩn ở PR (a)).
- Chọn ngưỡng theo kết quả.
- Ghi số liệu vào `docs/LEXICA_PRONUNCIATION_SPIKE.md`.

### Chưa đạt thì
- Xem `ketqua.csv` để biết nhóm lỗi nào hỏng.
- Thử đổi ngưỡng.
- Vẫn chưa được thì để gói chấm ở chế độ ẩn: ghi điểm trên máy, không hiện cho người học. Cân nhắc tinh chỉnh mô hình (xem "Rủi ro" trong tài liệu thử nghiệm).

Đã thử cả quy trình: Chromium với micro giả ghi đủ 40 lượt, tải file zip (giải nén được, WAV 16 kHz mono), rồi `evalvi.py` đọc file đó và in bảng.
