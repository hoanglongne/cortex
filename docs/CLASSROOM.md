# Cortex Classroom: lõi lớp học và chuẩn mô-đun

Một hệ thống lớp học dùng chung cho mọi app Cortex. Giáo viên làm việc ở một nơi (**Cortex cho lớp**, `apps/teach`). Mỗi app học (Lexica, rồi Oratio, Solilo, Synapse…) cắm vào bằng một **mô-đun**. Lõi không biết gì về từ vựng hay luyện nói; mô-đun không đụng tới lớp, trung tâm, lời mời hay quyền.

Tài liệu này là chuẩn bắt buộc khi viết mô-đun mới. Mẫu sẵn ở `docs/classroom/template/`.

## 1. Kiến trúc

```
                       ┌──────────────── apps/teach (Cortex cho lớp) ────────────────┐
                       │ trang chung: Hôm nay, Lớp, Học viên, Báo cáo, Trung tâm...  │
                       │ app/modules/index.ts  ← MODULES = { lexica, oratio, … }     │
                       │ app/modules/<app>/    ← màn hình riêng của từng app (ModuleUI)│
                       └───────────────┬───────────────────────────┬─────────────────┘
                                       │ classroomApi              │ ClassroomModuleCore
packages/classroom  ───────────────────┤ (types, api, rules,       │
  sql/classroom_core.sql               │  module contract)         │
packages/classroom-<app> ──────────────┴───────────────────────────┘
  index.ts  (luật thuần của app: parse, tiến độ, lời khen, tin phụ huynh)
  sql/classroom_<app>.sql (đăng ký app + hook SQL)
                                       ▲
apps/<app> (app học) ── classroomApi.report(app, metrics, streak), myClasses(app), /join/CODE
```

**Lõi sở hữu** (`packages/classroom`, bảng `cortex_*`, hàm `classroom_*`): trung tâm và chỗ ngồi, nhân sự, lời mời, lớp (tên, mã, `apps[]`, `settings` theo app, bảng xếp hạng, lưu trữ), thành viên và ghi chú, bài giao (`app`, `kind`, `title`, `payload` JSON, hạn), hoạt động mỗi ngày, chuỗi ngày, ai cần nhắc, hạn sắp tới.

**Mô-đun sở hữu**: một bài giao của app chứa gì (`payload`), app báo cáo gì về học viên (`metrics`), cài đặt riêng của app trong lớp (`settings[app]`), cách xếp hạng, và các màn hình hiển thị những thứ đó.

Dữ liệu riêng của app chỉ đi qua 3 ô JSON: `cortex_classes.settings[app]`, `cortex_class_assignments.payload`, `cortex_class_activity.metrics`. Lõi luôn bắt mô-đun làm sạch chúng trước khi lưu.

## 2. Hợp đồng mô-đun

### 2.1 SQL: `packages/classroom-<app>/sql/classroom_<app>.sql`

Chạy sau `classroom_core.sql`. Bắt buộc chạy lại được nhiều lần (idempotent).

| Hook | Chữ ký | Bắt buộc | Lõi gọi khi |
|---|---|---|---|
| đăng ký | `insert into cortex_apps (id, name) … on conflict do update` | có | (để app được dùng trong lớp) |
| `classroom_<app>_clean_payload` | `(p_kind text, p jsonb) returns jsonb` | có | giao bài, sửa bài. `raise exception 'bad payload'` (hoặc một mã lỗi riêng) nếu sai |
| `classroom_<app>_clean_metrics` | `(p_class uuid, p jsonb) returns jsonb` | có | app học báo cáo; chạy **cho từng lớp**, nên lọc được theo lớp |
| `classroom_<app>_clean_settings` | `(p jsonb) returns jsonb` | không | tạo/sửa lớp; thiếu thì cài đặt là `{}` |
| `classroom_<app>_rank` | `(p jsonb) returns numeric` | không | bảng xếp hạng khi lớp chọn app này; thiếu thì app không xếp hạng |
| `classroom_<app>_after_assign` | `(p_class uuid, p_assignment uuid, p jsonb) returns void` | không | sau khi lưu bài (ví dụ Lexica ghi từ còn thiếu cho Studio) |

Luật SQL:
- Tên đúng mẫu `classroom_<app>_<hook>`, `<app>` khớp `^[a-z][a-z0-9_]{1,20}$`. Lõi tìm hook bằng tên, không đăng ký thì không chạy.
- Cuối file `revoke all … from public, anon, authenticated` trên mọi hook. Chỉ lõi (security definer) gọi chúng; client không bao giờ gọi trực tiếp.
- Hook đọc bảng (như `clean_metrics`) là `security definer set search_path = public`; hook thuần là `immutable`.
- Bảng riêng của app (nếu có) tên `<app>_*`, bật RLS, không có policy cho client trừ khi thật cần (như Studio editor).
- Giới hạn mọi thứ: độ dài mảng, độ dài chuỗi, số trong khoảng. Không tin JSON từ client.
- Kết thúc bằng `notify pgrst, 'reload schema';`. Thêm file vào `supabase/build-restore.sh` sau file lõi.

### 2.2 Gói thuần: `packages/classroom-<app>` (`@cortex/classroom-<app>`)

Xuất một `ClassroomModuleCore` (`packages/classroom/module.ts`) và các kiểu của app:

- `id`, `name`, `tagline`, `kinds` (tên tiếng Việt của từng loại bài).
- `parseSettings`, `parsePayload`, `parseMetrics`: **không bao giờ throw**; dữ liệu cũ hoặc hỏng ra giá trị mặc định. Đây là lớp bảo vệ khi SQL và client lệch phiên bản.
- `assignmentProgress(a, students)` → `{started, done, deep?, total}`. `done` = làm xong; `deep` = mức "thật sự nắm" của app (Lexica: nói được).
- `praise(app)` → `{why, score}` hoặc null. Khen tiến bộ, không khen điểm. `score` so được giữa các app (≈ 100 là đáng kể).
- `parentLine(app)` → một câu cho phụ huynh, hoặc null.
- `needs?(board)` → việc chỉ app này biết để báo ở "Hôm nay".

Không React, không Supabase, không `window`. Dùng được ở app học, app giáo viên và trong test. Phụ thuộc duy nhất: `@cortex/classroom`.

### 2.3 Màn hình: `apps/teach/app/modules/<app>/index.tsx`

Xuất một `ModuleUI` (`apps/teach/app/modules/types.ts`): `core`, `dot` (màu token), `appUrl`, `progressLabels`, `SettingsFields`, `settingsLine`, `StudentSummary`, `StudentSection`, `ClassSummary`, `AssignmentBody`, `AssignForm`. Rồi thêm một dòng vào `MODULES` trong `apps/teach/app/modules/index.ts`.

Trang chung tự lo phần còn lại: tạo lớp có ô chọn app, lớp nhiều app hiện chấm màu, ngăn giao bài có chọn app, báo cáo phụ huynh ghép `parentLine` của từng app.

### 2.4 Phía app học: `apps/<app>`

1. Phụ thuộc `@cortex/classroom` và `@cortex/classroom-<app>`, thêm cả hai vào `transpilePackages`.
2. `classroomApi(getSupabase)`; lấy lớp bằng `api.myClasses('<app>')` (chỉ bài của app mình).
3. Báo cáo bằng `api.report('<app>', metrics, streak)` sau mỗi buổi học (có hạn mức, như `apps/lexica/app/lib/classSync.ts`). Metrics gửi lên đã được rút gọn; SQL lọc thêm lần nữa.
4. Trang `/join/[code]` (vào lớp bằng link) và một chỗ "Lớp học" cho học viên: bài được giao, hạn, tiến độ của mình.
5. Đặt `NEXT_PUBLIC_TEACH_URL` để giáo viên có link sang app giáo viên.

## 3. Quy trình thêm một app

1. **Thiết kế trên giấy** (viết vào doc của app): giáo viên giao gì (`kind` + `payload`)? Học viên báo về những số nào (`metrics`)? "Xong" và "nắm thật" nghĩa là gì? Phụ huynh cần nghe câu nào? Có xếp hạng không, theo gì? Chốt với chủ sản phẩm trước khi code.
2. **SQL**: chép `docs/classroom/template/sql/classroom_app.sql`, thay `<app>`, viết hook. Thêm vào `supabase/build-restore.sh`, chạy lại `restore_all.sql`. Thử trên PGlite: chạy 2 lần, giao bài sai bị từ chối, metrics lạ bị lọc.
3. **Gói thuần**: chép `template/package/`, viết `parse*` và luật. Test đơn vị cho mọi hàm (dữ liệu rác, rỗng, cũ).
4. **Màn hình giáo viên**: chép `template/teach/`, viết các component bằng `components/ui` và token màu. Đăng ký trong `MODULES`. Thêm app vào mock Playwright, chụp desktop, điện thoại, sáng, tối.
5. **App học**: báo cáo, `myClasses`, `/join`, trang lớp.
6. **Kiểm tra**: `tsc`, `eslint`, `vitest`, `next build` cho `apps/teach` và app học. Chạy `checklist` ở cuối.
7. **Triển khai**: chạy file SQL của app trên Supabase (sau lõi). Lõi không cần chạy lại.

## 4. Luật

**Riêng tư**
- Metrics là **con số tối thiểu** giáo viên cần. Không gửi nội dung học viên tạo ra (ghi âm, câu viết, bản chép lời, prompt). Ví dụ Lexica gửi phát âm chỉ là số lần thử và số lần sai theo 11 nhóm âm trong 14 ngày (`sounds`). Muốn hiện chi tiết theo bài giao thì lọc theo bài của chính lớp đó (như `clean_metrics` của Lexica chỉ giữ từ lớp đã giao).
- Học viên phải được báo rõ giáo viên thấy gì, ngay ở chỗ vào lớp.
- Không đọc bảng của app khác. Một mô-đun chỉ thấy `cortex_*` và bảng `<app>_*` của mình.

**Độ bền**
- SQL chạy lại được; không `drop` dữ liệu ở file mô-đun.
- `parse*` không throw. Trang không bao giờ vỡ vì một app lạ: app có trong DB mà chưa có trong `MODULES` thì chỉ hiện tên.
- Đổi hình dạng `payload`/`metrics` thì giữ đọc được dạng cũ (parse có mặc định), không cần migration dữ liệu.

**Tên**
- App id viết thường, một từ: `lexica`, `oratio`, `solilo`, `synapse`.
- SQL: `classroom_<app>_*`, bảng `<app>_*`. Gói: `@cortex/classroom-<app>`. Thư mục màn hình: `apps/teach/app/modules/<app>/`.
- Mã lỗi SQL là chuỗi tiếng Anh ngắn; câu tiếng Việt cho người dùng thêm vào `classMessage` (`packages/classroom/rules.ts`).

**Giao diện và lời**
- Tiếng Việt, giọng mềm, nói với giáo viên như đồng nghiệp: "3 em chưa bắt đầu", không "3 học viên chưa hoàn thành nhiệm vụ".
- Khen tiến bộ và sự đều đặn, không khen điểm hay thời gian dùng app.
- Chỉ dùng token màu của theme (`bg-surface`, `text-ink`, `bg-step-*`…), không mã màu cứng; phải ổn ở chế độ tối.
- Mỗi màn hình phải dùng được trên điện thoại 390px.

**Kiểm thử**
- Test đơn vị cho gói thuần (bắt buộc). Thử SQL trên PGlite. Ảnh chụp Playwright cho màn hình mới.

## 5. Checklist trước khi mở PR

- [ ] `insert into cortex_apps` và đủ 2 hook bắt buộc; mọi hook bị revoke khỏi client.
- [ ] File SQL chạy 2 lần không lỗi; có trong `build-restore.sh`.
- [ ] `parseSettings/parsePayload/parseMetrics` có test với dữ liệu rác.
- [ ] Metrics không chứa nội dung của học viên; có câu báo cho học viên biết giáo viên thấy gì.
- [ ] Đăng ký trong `MODULES`; lớp có 2 app vẫn hiển thị đúng.
- [ ] `tsc`, `eslint`, `vitest`, `next build` sạch cho `apps/teach` và app học.
- [ ] Ảnh chụp: tạo lớp, giao bài, trang học viên; điện thoại và chế độ tối.
- [ ] Ghi lại trong doc của app: kinds, metrics, settings, cách xếp hạng.

## 6. Mô-đun hiện có

| App | Bài giao (`kind`) | Metrics | Xếp hạng |
|---|---|---|---|
| `lexica` | `words` {card_ids, missing_words, mode} | counts Hiểu/Nhớ/Gặp/Dùng/Đời, assigned theo lớp, bước của từng từ lớp giao | Dùng, rồi Nhớ |
| `oratio` | `topic` {category, part, sessions} · `questions` {question_ids} · `goal` {sessions, minutes} | số buổi, số phút, band trung bình bạn luyện chấm (20 lượt gần nhất), band tự đặt, tiến độ từng bài của lớp | Số phút đã nói |

Oratio tính số liệu **trên máy chủ** từ chính bảng của nó (`matches`, `session_feedback`, `profiles`; `apps/oratio/src/lib/server/classroom.ts`) rồi mới gửi, nên học viên không tự sửa được. Câu hỏi và chủ đề được giao được hỏi trước trong Phòng thi và Tập một mình (`preferredPool`). Chưa đổi cách ghép cặp.

Tham khảo khi viết mô-đun mới: `packages/classroom-lexica/` và `apps/teach/app/modules/lexica/`.
