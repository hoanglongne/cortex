# Núm vặn, chặng D0: kết quả thử bộ máy thay từ (12/11/2026)

Thuộc kế hoạch `docs/LEXICA_WOW_PLAN.md` mục 2.9. Câu hỏi của chặng này: **luật thay từ chạy trên máy (lớp 1) có thay đúng nghĩa ≥ 95% trên báo thật không?**

## Đã làm
- **Bộ máy khớp:** `apps/lexica/app/lib/dial/match.ts`
  - Khớp theo từng tiếng; dấu thanh đặt kiểu cũ hay kiểu mới đều nhận ("hoà" = "hòa").
  - Ưu tiên cụm dài nhất, không khớp vượt qua dấu câu.
  - Bỏ qua tên riêng: chữ hoa ở giữa câu ("Bộ Tài chính").
  - Ba kiểu luật ngữ cảnh:
    - `notBefore`: bỏ khi có cụm đứng ngay trước ("tính minh bạch");
    - `notAfter`: bỏ khi có cụm đứng ngay sau ("đa dạng hoá");
    - `onlyAfter`: chỉ khớp sau một danh từ cho trước, dùng cho chữ nhiều nghĩa ("tác động tiêu cực").
  - Có unit test: `apps/lexica/__tests__/unit/dialMatch.test.ts`.
- **Luật cho 75 thẻ:** `apps/lexica/app/lib/dial/rules.ts`. Mỗi luật sửa vì một lỗi thật đều có chú thích lý do.
- **Script thử:** `apps/lexica/scripts/dial-d0/`
  - `fetch.mjs`: tải bài từ RSS của Thanh Niên, VnExpress, Tuổi Trẻ, loại đoạn trùng, loại bài đã có trong bộ khác. **Nội dung bài báo không đưa vào repo.**
  - `run.mjs`: chạy bộ máy, xuất từng chỗ thay kèm câu để chấm.

## Cách chấm
- **Ba bộ bài, không trùng nhau:**
  - **dev** (35 bài): dùng để sửa luật.
  - **test** (58 bài mới): chấm sau vòng sửa luật 1.
  - **test2** (86 bài mới): chấm sau vòng sửa luật 2.
- **Một chỗ thay là "sai"** khi từ tiếng Anh sai nghĩa trong câu đó. Ví dụ "triển khai quân đội" mà hiện *implement* (phải là *deploy*).
- **Sai từ loại không tính là sai:** từ đúng nghĩa nhưng dạng khác, như *transparent* đứng ở chỗ của danh từ *transparency*. Xem mục "Vấn đề từ loại".
- **Người chấm:** Claude, đồng thời là người viết luật. Đây là thiên lệch rõ ràng, xem mục "Giới hạn".

## Kết quả
| Vòng | Bộ bài | Số bài | Số chỗ thay | Sai nghĩa | Đúng nghĩa |
|---|---|---|---|---|---|
| 1 | test | 58 | 242 | 20 | **91,7%** |
| 2 | test2 | 86 | 430 | 21 | **95,1%** |

- Vòng 2 vừa qua ngưỡng 95% của kế hoạch, nhưng sát ngưỡng và chỉ có một người chấm. Chưa nên coi là đạt chắc chắn.
- **Mật độ:** khoảng 6 chỗ thay trên 1.000 tiếng, tức vài từ mỗi bài. 47–50 trên 75 luật có xuất hiện trong bài.
- Sau vòng 2 mình đã sửa thêm luật theo lỗi tìm được. Số đo cho bản luật mới **chưa có**, cần một bộ bài mới nữa (bài đã dùng để sửa luật thì không dùng để chấm lại).

## Các nhóm lỗi
| Nhóm | Ví dụ | Cách đã xử lý |
|---|---|---|
| Một chữ tiếng Việt, hai từ tiếng Anh | "triển khai quân" = deploy; "hiệu quả sử dụng vốn" = efficiency; "cơ hội ghi bàn" = chance | `notAfter`, `notBefore` theo cụm đi kèm |
| Chữ mang nghĩa riêng trong tiếng Việt | "phòng chống tiêu cực" = tham nhũng, gian lận; "không chủ quan" = không lơ là; "từ bỏ cuộc sống" = tự tử | `onlyAfter`, hoặc loại cụm |
| Tách từ sai | "khách quan sát" là "khách / quan sát" | `notAfter: ['sát']`. Lỗi kiểu này sẽ còn, cần thêm bộ tách từ |
| Bóng đá | "cơ hội" gần như luôn là *chance* | Tạm loại theo cụm. Nên thêm luật theo chuyên mục bài |
| Bỏ hẳn luật quá rộng | "ảnh hưởng" phần lớn là *affect*; "hợp tác" là *cooperate*; "bất ngờ" là *suddenly* | Thu hẹp: "tầm ảnh hưởng" → influence; bỏ "hợp tác"; "bất ngờ" chỉ còn dạng "ngoài dự kiến" |

## Vấn đề từ loại (chưa giải)
Tiếng Việt dùng cùng một chữ cho tính từ, danh từ và trạng từ. "Hiệu quả" có thể là *effective*, *effectively* hay *effectiveness*. Câu chêm hiện tại luôn dùng dạng gốc, nên ước khoảng 5–10% chỗ thay đúng nghĩa nhưng sai từ loại.

Hai hướng:
1. Chấp nhận, vì câu chêm vẫn theo ngữ pháp tiếng Việt và người học chủ yếu cần nhận ra nghĩa.
2. Thêm dạng từ cho thẻ (`forms: { noun, adverb }`) và luật chọn dạng theo chữ đứng trước ("tính", "sự" → danh từ).

Đề xuất: làm hướng 1 cho D1, ghi nhận phản hồi người dùng, rồi mới quyết hướng 2.

## Giới hạn của số đo này
- **Một người chấm, và cũng là người viết luật.** Cần người thứ hai (chủ sản phẩm) chấm lại ít nhất 100 chỗ thay ngẫu nhiên. Nếu hai người lệch nhau nhiều, số 95,1% không đáng tin.
- **Chỉ báo chính thống.** Facebook, diễn đàn, văn nói chưa thử; văn bản không dấu sẽ không khớp gì.
- **Thời điểm:** cả ba bộ bài lấy trong cùng một ngày, nhiều bài cùng chủ đề (Nvidia, APEC, lũ lụt). Cần bài ở nhiều ngày khác nhau.
- **Mới có 75 trên khoảng 570 thẻ.** Thẻ khó (cấp Chuyên gia) gần như không xuất hiện trên báo, nên Núm vặn hợp với từ phổ thông hơn.

## Đề xuất bước tiếp
1. **Chủ sản phẩm chấm lại** 100 chỗ thay ngẫu nhiên của test2 (mình chuẩn bị trang chấm).
2. **Chấm vòng 3** trên bộ bài mới lấy vào một ngày khác, gồm cả Facebook hoặc diễn đàn nếu lấy được.
3. Nếu vòng 3 ≥ 95% với cả hai người chấm: viết luật cho các thẻ còn lại (ưu tiên cấp Cơ bản, Trung cấp) và sang D1 (trình đọc trong app).
4. Nếu không đạt: thêm bộ tách từ tiếng Việt chạy trên máy, hoặc dùng lớp 2 (hỏi máy chủ) làm chính cho người dùng premium.

---

## Vòng 3 và 4: luật cho cả bộ thẻ (15/11/2026)

**Đã làm:**
- Luật cho 344 từ còn lại (`app/lib/dial/rulesMore.ts`). Gộp với 75 từ cũ trong `allRules.ts`, tổng cộng **415 luật**. Một cụm cùng ngữ cảnh chỉ thuộc về một thẻ.
- Còn 5 từ cố ý bỏ trống vì không có cụm tiếng Việt đủ đặc hiệu (`DIAL_SKIPPED`).
- Mật độ tăng từ khoảng 6 lên khoảng 11–15 chỗ thay trên 1.000 tiếng.

**Chấm, chỉ tính chỗ thay của luật mới (luật cũ đã chấm ở vòng 2):**

| Vòng | Bộ bài | Số bài | Chỗ thay của luật mới | Sai nghĩa | Đúng nghĩa |
|---|---|---|---|---|---|
| 3 | r3 (mới) | 62 | 306 | ~57 | **~81%** |
| 4 | dev-r4 (mới, sau khi sửa theo vòng 3) | 66 | 417 | ~55 | **~87%** |

- Đã sửa thêm luật theo lỗi của vòng 4. **Chưa đo lại** trên bộ bài mới, nên chưa biết luật mới đã đạt 95% chưa.
- Chỗ thay của luật cũ trong vòng 3 và 4 chưa chấm lại.

**Nhóm lỗi mới gặp:**
| Cụm | Hay nghĩa là | Đã xử lý |
|---|---|---|
| "có khả năng mưa" | *likely to*, không phải *capable* | Bỏ "có khả năng"; chỉ giữ "có/đủ năng lực" |
| "sẵn sàng" | *ready* | Bỏ khỏi *willing* |
| "năng suất lúa", "năng suất lao động" | *yield*, *productivity* | Bỏ khỏi *efficient* |
| "chênh lệch giá" | *spread*, *difference* | Bỏ khỏi *discrepancy* |
| "cắt giảm nhân sự" | *lay off*, *cut jobs* | *curtail* không khớp khi đi trước "nhân sự/nhân viên" |
| "đáp ứng yêu cầu/điều trị" | *meet*, *respond to* | *accommodate* chỉ còn với "nhu cầu" |
| "thông tin được", "bắt buộc phải", "doanh thu được", "có lợi ích" | tách từ sai | `notBefore`/`notAfter` theo tiếng liền trước/sau |
| "Cụ thể,", "Đáng chú ý," đầu câu | trạng từ (*Specifically*, *Notably*) | Chưa xử lý (đúng nghĩa, sai từ loại) |

**Bài học:** luật cho từ phổ thông dễ sai hơn nhiều so với từ học thuật, vì cụm tiếng Việt phổ thông có nhiều nghĩa. Luật nào khớp quá nhiều trong một bộ bài (ví dụ "có khả năng" khớp 22 lần) cần nghi ngờ trước tiên.

## Nối với lịch ôn
- **Thứ tự hiện từ khi mức dưới 100%:** từ mới của bài (trong trình đọc), rồi từ **đến hạn ôn trong vòng 1 ngày**, rồi các từ đã học khác, cuối cùng mới tới từ chưa học (`dialRank`, `pickHits`).
- **Chạm xem nghĩa = chưa nhớ** (`dialTap` trong store):
  - từ đã học → **đến hạn ôn ngay**, không đổi độ dễ (lượt ôn thật sẽ quyết);
  - từ chưa học → **thêm vào bộ thẻ học tiếp theo**.
  - Ô nghĩa báo rõ điều này cho người học.
- **Đọc lướt qua không chạm thì chưa tính gì.** Theo kế hoạch (mục 2.5), tín hiệu này cần hiệu chỉnh bằng kiểm tra thật trước khi được dùng.
- **Tiện ích Chrome chưa nối với tài khoản**, nên chưa đổi được lịch ôn.

---

## Vòng 5 và 6: chấm mẫu ngẫu nhiên cả bộ luật (issue #140, 15/11/2026)

**Cách chấm mới:** lấy **mẫu ngẫu nhiên** từ mọi chỗ thay (luật cũ lẫn luật mới), thay vì chấm riêng luật mới, để con số phản ánh đúng thứ người học thấy.

| Vòng | Bộ bài (chưa dùng để sửa luật) | Chỗ thay | Mẫu chấm | Sai nghĩa | Đúng nghĩa | Khoảng tin cậy 95% (Wilson) |
|---|---|---|---|---|---|---|
| 5 | 67 bài báo + 9 bài Wikipedia | 553 | 300 | 29 | **90,3%** | ~86,4–93,1% |
| 6 | 112 bài báo (sau khi sửa theo vòng 5) | 1.095 | 250 | 17 | **93,2%** | ~89,4–95,7% |

- **Chưa đạt 95%.** Đã sửa tiếp theo lỗi vòng 6, chưa đo lại.
- Wikipedia (văn bách khoa) sai nhiều hơn báo, chủ yếu vì "phê chuẩn".
- Mật độ khoảng 11–12 chỗ thay trên 1.000 tiếng.
- Chỉ có một người chấm (Claude, cũng là người viết luật). Trang chấm cho người thứ hai: 100 chỗ thay ngẫu nhiên của vòng 6.

**Lỗi chính và cách sửa:**
| Cụm | Ngữ cảnh sai | Sửa |
|---|---|---|
| "phê chuẩn" | Thượng viện phê chuẩn = *confirm/approve* | Bỏ khỏi *validate* |
| "chắc chắn" | "chơi rất chắc chắn" = *solid* | Thêm `onlyBefore` (mới): chỉ khớp trước "sẽ, là, rằng, không, có, được, đã, phải" |
| "mô phỏng" | *simulate* | Bỏ khỏi *imitate* |
| "đáp ứng" | đáp ứng yêu cầu/kỳ vọng/điều trị | *accommodate* chỉ còn trước "nhu cầu" |
| "tập trung" | đợt tập trung (đội tuyển), khuyến mại tập trung | `notBefore`/`notAfter` theo các cụm đó |
| "dưới chân thành", "du khách quan tâm", "cầu Kỳ Hà", "việc làm rõ ràng" | tách từ sai, tên riêng | Mới: bỏ qua khi có chữ hoa **bên trong** cụm; thêm `notBefore`/`notAfter` |
| "Cụ thể,", "Đáng chú ý,", "Chắc chắn," đầu câu | trạng từ | Mới: `notAtStart` |
| "cộng tác viên", "giải khuyến khích", "tiền khả thi", "làn dừng khẩn cấp", "nhóm lợi ích" | danh từ ghép | `notBefore`/`notAfter` |

**Về từ loại (quyết định):**
- Giữ **dạng gốc** của từ tiếng Anh, như câu chêm hiện nay.
- Lý do: câu vẫn theo ngữ pháp tiếng Việt, và mục tiêu của Núm vặn là nhận ra nghĩa.
- Trạng từ đầu câu đã được bỏ qua. Dạng danh từ/trạng từ riêng cho thẻ (`forms`) để sau, khi có phản hồi người dùng.

## Vòng 7 (17/11/2026)
| Bộ bài | Chỗ thay | Mẫu chấm | Sai nghĩa | Đúng nghĩa | Khoảng tin cậy 95% |
|---|---|---|---|---|---|
| 133 bài báo mới | 1.187 | 250 | 13 | **94,8%** | ~91,3–96,9% |

- **Tiến trình:** 90,3% → 93,2% → 94,8% qua ba vòng. Vẫn hơi dưới ngưỡng 95%, nhưng ngưỡng đã nằm trong khoảng tin cậy.
- **Lỗi còn lại:**
  - "tập trung kinh tế" là thuật ngữ luật cạnh tranh; "chăn nuôi tập trung";
  - "triển khai máy bay, vệ tinh, mạng, hạ tầng" là *deploy*;
  - "tiếp thu ý kiến";
  - "tiếng Anh lưu loát" là *fluent*, không phải *eloquent*;
  - "để có cơ sở".
  - Đã sửa cả, chưa đo lại.
- **Đề xuất:**
  - coi luật đã đủ tốt để dùng cho người học;
  - để nút "Thay sai" (D1) gom lỗi thật từ người dùng;
  - chấm lại mỗi khi thêm luật.
