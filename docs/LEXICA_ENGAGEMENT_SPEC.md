# Lexica Engagement — Spec

> Các cơ chế giữ chân người dùng: hệ thống sưu tầm thẻ (ấn bản, bộ, mùa, hộp), "Liều hay Dừng" trong ôn tập, đấu với chính mình hôm qua, và bản đồ quên "Bầu trời".

| | |
|---|---|
| Trạng thái | Đã triển khai phần lớn (cập nhật 2026-10-17, xem mục 9). Chưa làm: Bầu trời, tủ trưng bày hồ sơ, video chia sẻ |
| Phụ thuộc | `contentRepository` (Studio giai đoạn 0), Trend Drop (`docs/LEXICA_STUDIO_SPEC.md`) |
| Không dùng AI | Toàn bộ tài liệu này chạy bằng luật và số liệu sẵn có |

---

## 0. Nguyên tắc thiết kế

1. **Phần thưởng chỉ đến từ việc nhớ thật.** Không có đường nào lấy được thẻ / ấn bản bằng cách bấm nhanh hay mua.
2. **Không phạt việc chưa biết.** Gặp từ mới mà không biết là bình thường; mọi cơ chế "mạo hiểm" chỉ áp dụng cho từ **đã học** (ôn tập).
3. **Ngẫu nhiên có kiểm soát.** Tỉ lệ công khai, có bảo hiểm (pity), có trần mỗi ngày.
4. **Hiếm = đẹp + nội dung độc quyền + khoe được**, không bao giờ là lợi thế học tập lớn.
5. **Không tiền thật.** Không bán hộp, không bán tài nguyên. (Monetization nếu có sẽ là gói Pro cho tính năng, không cho may mắn.)

## 1. Quyết định đã chốt (từ thảo luận)

| Ý tưởng | Quyết định | Lý do |
|---|---|---|
| Lexica Daily kiểu Wordle | Hoãn | Quá phổ biến, không tạo khác biệt |
| Học bằng nút tai nghe | Bỏ | Phải bấm sau mỗi từ gây phiền; rào cản kỹ thuật cao. Giữ lại phần TTS chất lượng cao → `docs/LEXICA_AUDIO_SPEC.md` |
| Cược độ tự tin trước khi lật | Bỏ | Khó giải thích cho người dùng vì sao phải làm |
| "Gặp ngoài đời" | Bỏ | Chung chung |
| Drama chat, Thám tử Vietnglish | Bỏ | Phổ thông |
| Liều hay Dừng | **Giữ, chỉ trong ôn tập** | Không biết từ mới không phải lỗi của người dùng |
| Hộp mù + thẻ hiếm | **Giữ**, thiết kế lại thành hệ thống sưu tầm rõ ràng (mục 2) | |
| Đấu với chính mình hôm qua | **Giữ** (mục 4) | |
| Bản đồ quên "Bầu trời" | **Giữ** (mục 5) | Cần thiết kế UI tốt |

---

## 2. Hệ thống sưu tầm

### 2.1 Đơn vị: mỗi từ là một thẻ sưu tầm

- Học từ lần đầu (quẹt) → nhận **thẻ gốc** trong album.
- Thẻ đi theo trạng thái ghi nhớ đã có (`seed → sprout → gold → mastered`, `app/lib/eloAlgorithm.ts`), hiển thị như mức "hoàn thiện" của thẻ trong album.
- Album đầy = đã nhớ thật nhiều từ. Không có đường tắt.

### 2.2 Đúc (mint) và ấn bản

Khi một thẻ đủ điều kiện **đúc**, hệ thống quay ngẫu nhiên ra một **ấn bản**. Ấn bản là vĩnh viễn, gắn với thẻ đó của người đó.

**Điều kiện đúc** (chống "cày" vì hiện tại 3 lần quẹt phải liên tiếp là lên `mastered`):
- `state === 'mastered'`, **và**
- server thấy thẻ lần đầu ≥ 7 ngày trước (`lexica_card_first_seen`, không sửa được bằng backup), **và**
- `reviewCount >= 3` (config `mint_rules.min_reviews`; mỗi "Đã nhớ" phải qua câu kiểm tra nhanh nên đã là nhớ thật).
- Tối đa 30 lần đúc/ngày (`mint_rules.max_per_day`).

**Bảng ấn bản**

| Ấn bản | Tỉ lệ cơ bản | Hình thức | Nội dung độc quyền |
|---|---|---|---|
| Thường | 80% | Thẻ Focus chuẩn | — |
| Bạc | 15% | Viền kim loại xám sáng | Câu ví dụ thứ 2 (câu theo hình mẫu người học khác, từ Studio variants) |
| Holo | 4.5% | Viền ánh lime tĩnh + một lượt quét sáng khi mở (không lặp, không theo nghiêng máy) | Thêm: gốc từ (`surgeryModule`) + khiên trong "Liều hay Dừng" |
| Huyền thoại | 0.5% | Holo + số seri toàn server (`No.0042`) | Thêm: câu "Ngoài đời" (câu trích thật, `docs/LEXICA_CONTENT_PLAN.md`) |

Ấn bản cao giữ mọi quyền lợi của ấn bản thấp hơn. Quyền lợi được ghi ngay trên thẻ (sheet chi tiết trong Album) và trong "Từ điển Album" (`app/lib/engagement/albumGuide.ts`, `editionPerks`).

**Bảo hiểm (pity)**
- Bộ đếm `sinceHolo`: số lần đúc liên tiếp không ra Holo trở lên. Lần thứ **31** chắc chắn ra Holo (hoặc Huyền thoại với 0.5/5).
- Bộ đếm `sinceLegendary`: từ lần đúc thứ 200 không có Huyền thoại, tỉ lệ Huyền thoại tăng thêm 0.5% mỗi lần (soft pity), reset khi trúng.

**Số seri Huyền thoại**: cấp bởi server (`nextval` sequence). Đúc chỉ chạy khi online (RPC); chưa có hàng đợi đúc offline.

### 2.3 Quay ở đâu: server hay máy?

- Tỉ lệ quay **ở server** để không gian lận bằng chỉnh localStorage: client gửi `cardId`, server kiểm tra điều kiện đúc trên dữ liệu đã sync, quay, lưu, trả kết quả. Thực tế là các hàm Supabase `security definer` (`apps/lexica/supabase/migration_engagement*.sql`), không phải Cortex API.
- Người dùng chưa đăng nhập: không đúc (album vẫn hiện thẻ gốc + trạng thái). Đây cũng là lý do mạnh để đăng nhập.

### 2.4 Bộ (set) và mùa (season)

| Loại bộ | Nguồn | Kích thước | Thời hạn |
|---|---|---|---|
| Bộ chủ đề | Tag của thẻ (Tiền bạc, Công sở, Hẹn hò…) | 20–40 thẻ | Vĩnh viễn |
| Bộ mùa | Mỗi Trend Drop | ~30 thẻ | Chỉ **học mới** được trong mùa (đến `expires_at` của drop) |

- Thẻ của bộ mùa đã học trong mùa thì vẫn ôn và đúc được sau đó; người mới vào sau thì không còn học được.
- Một thẻ chỉ tính là **có trong bộ** khi đã nhớ thật: `reviewCount ≥ 1` (`isOwned` trong `app/lib/engagement/collection.ts`). Thẻ mới chỉ gặp rồi quẹt "Chưa nhớ" không tính.
- Album hiện **ô trống có viền** cho thẻ chưa có, kèm `18/30`.
- Hoàn thành bộ: 2 Hộp, nhận tự động ở bất kỳ trang nào (`EngagementSync`), kèm nhãn "Đủ bộ". Chưa làm: khung hồ sơ, danh hiệu, mở chương truyện.
- Hoàn thành bộ với toàn Bạc trở lên: nhãn và viền "foil".

### 2.5 Hộp và tài nguyên

4 tài nguyên: **Hộp**, **Bụi**, **Vé** (quay lại) và **Băng** (đóng băng chuỗi). Đã chốt giữ cả 4 (2026-10-17), nhưng giải thích dần: xem mục 2.10.

**Nguồn**

| Nguồn | Phần thưởng | Trần |
|---|---|---|
| Đạt mục tiêu ngày | 1 Hộp | 1/ngày |
| Đúc đủ 10 thẻ (cộng dồn) | 1 Hộp | — |
| Hoàn thành 1 bộ | 2 Hộp | — |
| Streak mốc 7/30/100 ngày | 1/3/5 Hộp | 1 lần mỗi mốc |
| Vượt lượt ôn trước 3 ngày liền (mục 4) | 1 Hộp | |
| Thẻ may mắn (mục 2.9) | Bụi, hiếm khi 1 Hộp | 5 lần/ngày |
| Điểm "Liều hay Dừng" đã chốt (mục 3) | 10 điểm = 1 Bụi | 30 Bụi/ngày |
| **Tổng trần** | | **3 Hộp/ngày** (phần vượt được giữ sang ngày sau, tối đa giữ 10) |

**Mở hộp** (tỉ lệ công khai)

| Vật phẩm | Tỉ lệ | Công dụng |
|---|---|---|
| 20 Bụi | 55% | |
| 50 Bụi | 20% | |
| Đóng băng streak | 12% | Giữ streak 1 ngày bỏ lỡ (giữ tối đa 2) |
| Vé quay lại | 10% | Quay lại ấn bản của 1 thẻ đã đúc |
| 150 Bụi | 3% | |

Hiệu ứng mở: thanh quay lướt qua các ô, dừng có gia tốc giảm dần; "suýt trúng" chỉ là trình diễn, kết quả đã quyết định ở server trước khi quay.

**Đích của Bụi**

| Dùng Bụi | Giá |
|---|---|
| Đổi 1 Vé quay lại | 120 Bụi |
| Nâng 1 thẻ đã đúc từ Thường lên Bạc (chọn thẻ) | 300 Bụi |
| Holo / Huyền thoại | **Không đổi được**, chỉ đến từ quay |

**Quay lại**: quay lại toàn bộ bảng 2.2 cho thẻ đó. Nếu ra ấn bản **thấp hơn hoặc bằng** bản đang có → giữ bản cũ, nhận Bụi bồi hoàn (Thường 10, Bạc 25). Không bao giờ mất ấn bản.

### 2.6 Cân bằng (giả lập ước tính)

Người dùng chăm (20 thẻ/ngày, ~5 thẻ đủ điều kiện đúc/ngày sau tháng đầu):
- ~150 lần đúc/tháng → kỳ vọng ~6.75 Holo, ~0.75 Huyền thoại/tháng từ đúc.
- ~3 Hộp/ngày → ~90 Hộp/tháng → ~9 Vé + ~3.300 Bụi (≈ 27 Vé nữa) → ~36 lượt quay lại → thêm ~1.8 Holo.
- Kết quả: ~8–9 Holo, ~1 Huyền thoại / tháng cho người chăm nhất. Holo đủ hiếm để khoe, Huyền thoại là sự kiện.

Người dùng vừa (8 thẻ/ngày): ~2–3 Holo/tháng, Huyền thoại ~3–4 tháng/lần (nhờ soft pity).

Mọi tham số (tỉ lệ, giá, trần) nằm trong bảng `lexica_engagement_config` (mỗi khoá một dòng JSON), đổi không cần deploy. Theo dõi 2 chỉ số để chỉnh: lượng Bụi tồn trung bình (lạm phát) và % người dùng có ≥1 Holo sau 30 ngày (mục tiêu 40–60%).

### 2.7 Thẻ dùng vào đâu

1. **Tủ trưng bày hồ sơ**: ghim 3 thẻ. Hồ sơ công khai qua link. *(chưa làm)*
2. **Ảnh chia sẻ**: xuất thẻ ra ảnh dọc 9:16 (đã làm, `shareCard.ts`); video ngắn cho Holo/Huyền thoại chưa làm.
3. **Khiên trong "Liều hay Dừng"** (mục 3): gặp lại từ mà mình có Holo trở lên → được 1 khiên cho câu đó.
4. **Ngôi sao lớn trong "Bầu trời"** (mục 5): ấn bản quyết định kích thước và màu sao.

### 2.8 Dữ liệu

```sql
create table public.lexica_card_editions (
  user_id uuid references auth.users(id) on delete cascade,
  card_id text not null,
  edition text not null check (edition in ('common','silver','holo','legendary')),
  serial int,                                  -- chỉ legendary
  minted_at timestamptz not null default now(),
  rerolls int not null default 0,
  primary key (user_id, card_id)
);
create sequence public.lexica_legendary_serial;

create table public.lexica_wallet (
  user_id uuid primary key references auth.users(id) on delete cascade,
  boxes int not null default 0,
  dust int not null default 0,
  reroll_tickets int not null default 0,
  streak_freezes int not null default 0,
  since_holo int not null default 0,
  since_legendary int not null default 0,
  boxes_today int not null default 0,
  boxes_day date
);

create table public.lexica_wallet_ledger (     -- mọi thay đổi tài nguyên, để kiểm toán / hoàn tác
  id bigserial primary key,
  user_id uuid not null,
  kind text not null,                          -- 'box_earned','box_opened','mint','reroll','dust_spent'…
  delta jsonb not null,
  ref text,
  at timestamptz not null default now()
);
```

RLS: người dùng chỉ **đọc** dòng của mình; mọi ghi đi qua hàm Supabase `security definer` gọi bằng session của người dùng.

API thực tế (RPC Supabase): `lexica_engagement_state`, `lexica_mint`, `lexica_open_box`, `lexica_reroll`, `lexica_upgrade`, `lexica_buy_ticket`, `lexica_claim` (daily_goal, set_complete, ghost_streak, streak_7/30/100), `lexica_use_freeze` (tự động khi lỡ đúng 1 ngày), `lexica_lucky_status` / `lexica_lucky_claim`, `lexica_review_dust`. Bảng thực tế có thêm `pending_boxes`, `mints_total`, `mints_today`, `day` trong `lexica_wallet`, và `lexica_card_first_seen`.

### 2.9 Thẻ may mắn (thêm sau spec)

- Khoảng 1/15 thẻ mỗi ngày là "may mắn", quyết định bằng hash (người dùng, thẻ, ngày) ở server, nên app hiện được badge trước khi quẹt nhưng không tự chọn được.
- Nhớ được thẻ may mắn: 15/30/50 Bụi (70/20/8%) hoặc 1 Hộp (2%). Tối đa 5 lần/ngày.
- Server trả về số lượt còn lại (`lexica_lucky_status`); hết lượt thì **không thẻ nào hiện badge** nữa, để không hứa quà mà không trả.

### 2.10 Giải thích dần (thêm 2026-10-17)

Người học chỉ cần biết **việc tiếp theo nên làm**, không cần hiểu cả hệ thống:
- Đầu trang Album là ô **"Tiếp theo"**, 1–2 dòng, mỗi dòng ghi phần thưởng (`nextGoal`): "Còn 3 từ đủ bộ Ăn uống I → 2 Hộp", "COGNITIVE đúc được sau 2 ngày".
- Mỗi khái niệm được giải thích **đúng 1 lần, lúc gặp lần đầu**, theo thứ tự: Bộ thẻ → Bụi → Hộp → Đúc → Vé → Băng (`nextExplainer`). Bấm "Hiểu rồi" là ẩn.
- Nút `?` mở "Từ điển Album": một dòng cho mỗi khái niệm và mỗi ấn bản.
- Ví chỉ hiện khi có gì đó, mỗi loại ghi số dùng được ngay ("Bụi 120 · cần 300 để nâng 1 thẻ").
- Chưa đăng nhập: chỉ thấy bộ thẻ và ô "Tiếp theo", kèm một dòng "Đăng nhập để nhận quà khi đủ bộ".

---

## 3. "Liều hay Dừng" (chỉ trong ôn tập)

Áp dụng cho các trò ôn hiện có (`SpeedQuiz`, `TrueFalseBlitz`, `ComboChain`, `TypeChallenge`, `ReviewQuiz`…) — nơi mọi câu hỏi là từ **đã học**.

**Luật**
- Mỗi câu đúng làm **hũ** tăng theo bậc: x1 → x1.5 → x2 → x3 → x5 (trần).
- Sau mỗi câu đúng, 2 nút: **Chốt** (cộng hũ vào điểm, bắt đầu hũ mới) / **Liều** (câu kế tiếp, khó hơn một bậc ELO).
- Sai khi đang có hũ → mất hũ (điểm đã chốt không mất).
- **Khiên**: từ mình sở hữu Holo trở lên → sai câu đó không mất hũ (1 lần/từ/ngày).
- Hết giờ / thoát ngang = tự Chốt.

**Thưởng** (đổi 2026-10-17): điểm đã chốt là điểm của phiên, dùng để vượt lượt ôn trước (mục 4), và cuối phiên **đổi ra Bụi**: 10 điểm = 1 Bụi, tối đa 30 Bụi/ngày (`lexica_review_dust`). Trần ngày giữ cho việc cày không đáng.

**SRS**: kết quả từng câu vẫn cập nhật `cardProgress` như bình thường; "Liều" chỉ chọn câu khó hơn trong số từ đến hạn ôn.

**UI** (thực tế, 2026-10-17): trang ôn chỉ có 1 thanh ngang (tiến độ câu), đồng hồ là vòng tròn quanh số thứ tự câu. Hũ là **cột dọc** sát mép phải câu hỏi (`RiskRail`): các nấc x1…x5 từ dưới lên, sáng theo chuỗi đúng; số điểm trong hũ ở đỉnh; nút "Chốt" nhỏ bên dưới; icon khiên khi có. Không chốt nghĩa là Liều (câu sau khó hơn). Sai thì hũ rơi về 0. Lần đầu vào có 1 dòng giải thích.

Hiện chỉ có trong `/review`; chưa đưa vào các mini-game.

---

## 4. Đấu với chính mình hôm qua

- Mỗi phiên ôn lưu "bóng ma": dãy `(thời điểm, đúng/sai)` của phiên tốt nhất hôm qua (localStorage, ≤ 2 KB).
- Phiên hôm nay hiện **một dòng chữ** dưới header: `Bạn 7 · Hôm qua 6 ▲` (không vẽ thanh).
- Hôm qua không ôn thì đua với lượt gần nhất trong 7 ngày, ghi rõ ngày ("Thứ Ba"), và kết quả so với chính lượt đó.
- Kết thúc: "Hơn bạn hôm qua 12 điểm". Vượt lượt trước 3 ngày liền → 1 Hộp (tính vào trần ngày).
- Kết hợp với Liều hay Dừng: mục tiêu là vượt **hũ lớn nhất** hôm qua.
- Không cần server, không cần bạn bè.

---

## 5. Bản đồ quên "Bầu trời"

### 5.1 Mô hình

- Mỗi từ đã học = một ngôi sao. **Độ sáng = xác suất còn nhớ** `R = exp(-t / S)`:
  - `t` = thời gian từ `lastReviewedAt`.
  - `S` (độ bền) suy từ trạng thái: seed 1 ngày, sprout 3, gold 7, mastered 14 (khớp `calculateNextReview`), nhân `ln(1/0.9)`⁻¹ để `R ≈ 0.9` đúng lúc đến hạn ôn.
- Chòm sao = một bộ (mục 2.4). Ấn bản = kích thước/màu sao.
- Vị trí sao cố định: hash(`cardId`) → toạ độ trong vùng của chòm; vùng chòm xếp bằng thuật toán đặt cố định theo `setId`.

### 5.2 Màn hình

1. Bầu trời toàn cảnh, số liệu mono "248 từ · 91% sáng".
2. Banner khi nhiều sao mờ: "17 từ sắp tắt trong 24 giờ" + nút "Thắp lại (5 phút)" → phiên ôn chỉ gồm các từ đó.
3. Thanh thời gian "Hôm nay → +7 ngày" xem trước nếu ngừng học.
4. Chạm sao → sheet chi tiết (từ, nghĩa, % độ sáng, lần ôn cuối, ấn bản, nút Ôn).
5. Hiệu ứng thắp lại sau khi ôn.
6. Người mới (ít sao): hiện viền các chòm chưa mở để không trống trải.

### 5.3 Khả thi

| Vấn đề | Giải pháp |
|---|---|
| Hiệu năng | Canvas 2D, ≤ 2.000 điểm vẫn 60fps trên máy tầm trung; vẽ tĩnh 1 lần vào offscreen canvas, chỉ animate sao Holo/Huyền thoại và hiệu ứng thắp lại |
| "Mờ theo thời gian thực" | Tính lại `R` khi mở màn và mỗi 60 giây; không cần timer cho từng sao |
| Zoom/pan | Transform matrix trên canvas + hit-test bằng lưới không gian (grid bucket) |
| Trợ năng | Sheet chi tiết luôn có % bằng chữ; có chế độ danh sách thay thế cho trình đọc màn hình; tôn trọng `prefers-reduced-motion` |
| Rủi ro chính | Thiết kế, không phải kỹ thuật → dựng trên Claude Design trước (prompt đã có trong thảo luận) |

Ước lượng: 3–4 ngày sau khi có thiết kế.

---

## 6. Lộ trình đề xuất

| Bước | Việc | Phụ thuộc | Ước lượng |
|---|---|---|---|
| 1 | Album thẻ gốc + bộ chủ đề (client only, từ `cardProgress`) | `contentRepository` | 2 ngày |
| 2 | Liều hay Dừng trong 2 trò ôn phổ biến nhất + bóng ma hôm qua | — | 2–3 ngày |
| 3 | Server: ví, đúc, hộp, quay lại, config, ledger | Đăng nhập | 3 ngày |
| 4 | UI đúc / mở hộp / ấn bản (Holo shader) + ảnh chia sẻ | Bước 3 + thiết kế | 3–4 ngày |
| 5 | Bộ mùa gắn Trend Drop | Studio publish | 1 ngày |
| 6 | Bầu trời | Thiết kế | 3–4 ngày |

## 7. Chỉ số đo

- D1 / D7 / D30 retention (so sánh trước/sau từng bước).
- Số phiên ôn tập / người / tuần (Liều hay Dừng phải làm số này tăng).
- % người dùng đăng nhập (đúc cần đăng nhập).
- Tỉ lệ chia sẻ ảnh thẻ Holo/Huyền thoại.
- Kinh tế: Bụi tồn trung bình, % có ≥1 Holo sau 30 ngày.

## 8. Câu hỏi mở

1. Có cho phép xem album của bạn bè (cần hồ sơ công khai) ngay ở v1?
2. Huyền thoại có nên giới hạn số lượng theo từng thẻ (ví dụ tối đa 100 bản "ABUNDANT" Huyền thoại toàn server) để tăng giá trị?
3. Đóng băng streak có nên dùng tự động hay người dùng tự bấm?

## 9. Đã triển khai (cập nhật 2026-10-17)

| Bước lộ trình | Trạng thái |
|---|---|
| 1. Album + bộ chủ đề | Xong; thêm "Tiếp theo", giải thích dần, Từ điển Album |
| 2. Liều hay Dừng + bóng ma | Xong trong `/review` (cột hũ dọc, điểm đổi ra Bụi, đối thủ dự phòng); chưa có trong mini-game |
| 3. Server: ví, đúc, hộp, quay lại, config, ledger | Xong bằng RPC Supabase |
| 4. UI đúc / hộp / ấn bản + ảnh chia sẻ | Xong, trừ shader nghiêng máy và video |
| 5. Bộ mùa gắn Trend Drop | Xong |
| 6. Bầu trời | Chưa làm |

Câu hỏi mở 3 đã chốt: Đóng băng dùng **tự động** khi lỡ đúng 1 ngày.
