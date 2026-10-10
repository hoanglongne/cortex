# Lexica Studio — Technical Spec

> Hệ thống thu thập trend mạng xã hội Việt Nam, dùng AI soạn nháp thẻ từ vựng theo giọng Lexica, con người duyệt bằng thao tác quẹt, rồi phát hành định kỳ thành "Trend Drop" cho app.

| | |
|---|---|
| Trạng thái | Draft v1 |
| Phạm vi | `apps/studio` (mới), `apps/cortex-core-api` (module `studio`), Supabase, `apps/lexica` (content delivery) |
| Nguyên tắc cốt lõi | AI chỉ chạy **lúc soạn nội dung**, không bao giờ chạy khi người dùng học. Chi phí cố định theo số thẻ sản xuất, không theo số user. Không thẻ nào lên app mà chưa qua tay người duyệt. |

---

## 1. Mục tiêu và phi mục tiêu

### Mục tiêu
1. Mỗi tuần phát hành 1 Trend Drop gồm ~30 thẻ mới, bám trend thật của giới trẻ Việt trong 7–14 ngày gần nhất.
2. Người vận hành (1 người) duyệt được 50–100 nháp trong ~15 phút/ngày.
3. Chi phí AI ≤ 10 USD/tháng ở quy mô 2.000 nháp/tháng.
4. Lexica nhận nội dung mới **không cần deploy lại app**.
5. Đo được hiệu quả từng thẻ (nhớ, chia sẻ, bỏ qua) và dùng nó để quyết định thẻ nào sống tiếp.

### Phi mục tiêu (v1)
- Không có AI chạy phía người dùng (không chatbot, không sinh câu theo yêu cầu).
- Không cho người dùng tự đóng góp nội dung (UGC).
- Không đa ngôn ngữ ngoài cặp Việt–Anh.
- Không có workflow nhiều người duyệt / phân quyền phức tạp (1 role `editor` là đủ).

---

## 2. Bối cảnh hiện tại (từ code)

- Toàn bộ 570 thẻ nằm cứng trong `apps/lexica/app/data/vocabCards.ts` (`VOCAB_DATABASE`, ~12.4k dòng), được import trực tiếp ở 17 file (`SpeedQuiz`, `ReviewQuiz`, `StoryMode`, `LearnedWordsList`…).
- Kiểu thẻ: `VocabCardData` trong `app/types/vocab.ts` — `id`, `word`, `ipa`, `elo`, `level`, `scenario` (câu Việt nhúng từ Anh), `scenarios` (theo archetype, hiện chưa thẻ nào dùng), `translationHint`, `upgradeModule`, `surgeryModule`, `isBossCard`.
- Tiến độ người dùng lưu theo `cardId` trong zustand (`cardProgress`, `learnedWords`…) và sao lưu lên Cortex API qua `cloudSync.ts`.
- Cortex API (NestJS) đã có `SupabaseAuthGuard` và một LLM provider (Gemini) ở `modules/synapse/llm.provider.ts`.

Hệ quả thiết kế:
- Thẻ mới phải giữ **ID ổn định, không trùng** với `v001…v570` để tiến độ cũ không vỡ.
- Cần một lớp `contentRepository` trong Lexica thay cho import trực tiếp `VOCAB_DATABASE`, để 17 nơi dùng chung một nguồn (bundle tĩnh + pack tải về).

---

## 3. Kiến trúc tổng quan

```
             ┌──────────────── Cortex API (NestJS, Railway) ────────────────┐
 Nguồn       │  StudioModule                                                 │
 ─────       │  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐  │
 Trends  ───►│  │ Collectors│─►│ Normalizer │─►│ Scorer   │─►│ Generator  │  │
 TikTok  ───►│  │ (cron)    │  │ + Clusterer│  │ (hotness)│  │ (LLM batch)│  │
 Threads ───►│  └───────────┘  └────────────┘  └──────────┘  └─────┬──────┘  │
 Charts  ───►│                                                    │         │
 News    ───►│                                ┌──────────────┐    ▼         │
 Manual  ───►│                                │  Validator   │◄── drafts    │
             │                                │ (rule-based) │              │
             │                                └──────┬───────┘              │
             │  ┌────────────┐                       │                      │
             │  │ Publisher  │◄── approved ──┐       ▼                      │
             │  └─────┬──────┘               │   Supabase (studio schema)   │
             └────────┼──────────────────────┼──────────────────────────────┘
                      │                      │
                      ▼                      │ duyệt / sửa / bỏ
          Supabase Storage (public)   ┌──────┴───────┐
          packs/manifest.json         │ apps/studio  │  (Next.js, chỉ editor)
          packs/drop-2026-w42.json    │ giao diện    │
                      │               │ quẹt duyệt   │
                      ▼               └──────────────┘
               apps/lexica
               contentRepository ──► card_events ──► Cortex API ──► card_metrics
                                                           (vòng phản hồi về Scorer)
```

Lý do chọn:
- **Pipeline nằm trong Cortex API** thay vì service riêng: đã có auth, Supabase client, LLM provider, deploy sẵn. Tách ra sau nếu tải lớn.
- **Pack là file JSON tĩnh trên Storage/CDN** thay vì API động: Lexica đọc qua CDN, không tốn compute theo user, cache được, offline được.
- **Studio là app Next.js riêng** trong monorepo: dùng chung design system Focus và component quẹt của Lexica.

---

## 4. Data model (Supabase, schema `studio`)

Tất cả bảng nằm trong schema riêng `studio`, RLS bật, chỉ role `editor` (qua bảng `studio.editors`) và service role được truy cập. Lexica **không** đọc schema này; nó chỉ đọc pack đã publish.

```sql
create schema if not exists studio;

-- Người được vào Studio
create table studio.editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Cấu hình nguồn thu thập
create table studio.sources (
  id text primary key,                         -- 'google_trends_vn', 'tiktok_hashtags', 'manual'
  kind text not null check (kind in ('api','rss','scrape','manual')),
  enabled boolean not null default true,
  weight real not null default 1.0,            -- độ tin cậy khi tính hotness
  config jsonb not null default '{}',
  last_run_at timestamptz,
  last_error text
);

-- Tín hiệu thô, 1 dòng / lần nhìn thấy
create table studio.signals (
  id bigserial primary key,
  source_id text not null references studio.sources(id),
  phrase text not null,                        -- cụm từ / câu cửa miệng (≤ 120 ký tự)
  context text,                                -- mô tả ngắn, KHÔNG lưu nội dung gốc dài
  url text,                                    -- link tham chiếu (nếu có)
  metric real,                                 -- views/rank/volume tuỳ nguồn, đã chuẩn hoá 0..1
  seen_at timestamptz not null default now(),
  phrase_norm text generated always as (lower(unaccent(phrase))) stored
);
create index on studio.signals (phrase_norm, seen_at desc);

-- Trend = cụm các signal cùng chủ đề
create table studio.trends (
  id uuid primary key default gen_random_uuid(),
  label text not null,                         -- "bill về mà lương chưa về"
  summary text,                                -- 1–2 câu: ngữ cảnh, ai hay dùng, tâm trạng
  status text not null default 'new'
    check (status in ('new','queued','generated','ignored','blocked')),
  hotness real not null default 0,             -- điểm xếp hạng (mục 5.3)
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  signal_count int not null default 0,
  source_count int not null default 0,
  tags text[] not null default '{}',           -- 'money','work','dating','school','meme'
  expires_at timestamptz                       -- ước tính trend hết nóng
);
create table studio.trend_signals (
  trend_id uuid references studio.trends(id) on delete cascade,
  signal_id bigint references studio.signals(id) on delete cascade,
  primary key (trend_id, signal_id)
);

-- Danh sách từ đích có thể dạy (nạp từ wordlist CEFR + 570 từ hiện có)
create table studio.lexemes (
  word text primary key,                       -- 'abundant' (lowercase)
  ipa text,
  cefr text check (cefr in ('A2','B1','B2','C1','C2')),
  elo int not null,                            -- map từ CEFR + tần suất
  pos text,                                    -- noun/verb/adj…
  in_core boolean not null default false,      -- đã có trong VOCAB_DATABASE
  times_used int not null default 0,           -- số thẻ đã publish dùng từ này
  last_used_at timestamptz
);

-- Nháp do AI sinh
create table studio.drafts (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references studio.trends(id),
  word text not null references studio.lexemes(word),
  scenario text not null,                      -- câu Việt nhúng từ Anh, từ đích VIẾT HOA
  translation_hint text not null,
  archetype text check (archetype in ('casual','tech','business','student')),
  tone text,                                   -- 'mỉa mai','than thở','khịa'…
  model text not null,                         -- model + phiên bản prompt
  prompt_version text not null,
  validation jsonb not null default '{}',      -- kết quả từng rule (mục 5.5)
  status text not null default 'pending'
    check (status in ('pending','rejected_auto','approved','rejected','edited')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  reject_reason text,                          -- 'cringe','sai nghĩa','nhạy cảm','trend cũ'…
  created_at timestamptz not null default now()
);
create index on studio.drafts (status, created_at);

-- Thẻ đã duyệt (nguồn sự thật để build pack)
create table studio.cards (
  id text primary key,                         -- 't' + 6 ký tự base36, vd 't0k9xa' (không đụng 'v001')
  draft_id uuid references studio.drafts(id),
  word text not null references studio.lexemes(word),
  ipa text,
  elo int not null,
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  scenario text not null,
  translation_hint text not null,
  trend_label text,
  tags text[] not null default '{}',
  lifecycle text not null default 'trend'
    check (lifecycle in ('trend','evergreen','retired')),
  expires_at timestamptz,                      -- null nếu evergreen
  created_at timestamptz not null default now(),
  revision int not null default 1
);

-- Drop = 1 lần phát hành
create table studio.drops (
  id text primary key,                         -- 'drop-2026-w42'
  title text not null,                         -- "Tuần lương chưa về"
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  publish_at timestamptz,
  published_at timestamptz,
  pack_url text,
  pack_sha256 text
);
create table studio.drop_cards (
  drop_id text references studio.drops(id) on delete cascade,
  card_id text references studio.cards(id),
  position int not null,
  primary key (drop_id, card_id)
);

-- Chỉ số tổng hợp theo thẻ (cập nhật từ event của Lexica)
create table studio.card_metrics (
  card_id text primary key,
  impressions int not null default 0,
  known int not null default 0,
  unknown int not null default 0,
  reveals int not null default 0,
  shares int not null default 0,
  avg_dwell_ms int,
  d7_retention real,                           -- tỉ lệ còn nhớ ở lần ôn sau ≥7 ngày
  updated_at timestamptz not null default now()
);

-- Danh sách chặn
create table studio.blocklist (
  pattern text primary key,                    -- từ/cụm hoặc regex
  kind text not null check (kind in ('word','regex','person','topic')),
  note text
);
```

Ghi chú:
- Cần extension `unaccent` (và `pg_trgm` cho gom cụm gần đúng).
- `studio.cards.id` có prefix `t` để phân biệt với thẻ core `v###`. Không bao giờ tái sử dụng ID; sửa thẻ thì tăng `revision`.
- Không lưu nội dung gốc dài từ mạng xã hội (chỉ `phrase` ≤ 120 ký tự + `context` ngắn + `url`).

---

## 5. Pipeline chi tiết

Tất cả job chạy trong `StudioModule` của Cortex API bằng `@nestjs/schedule`. Mỗi job idempotent, ghi log vào bảng `studio.job_runs (job, started_at, finished_at, ok, stats jsonb, error)`.

| Job | Lịch (giờ VN) | Việc |
|---|---|---|
| `collect` | 06:00, 12:00, 18:00, 23:00 | Chạy từng collector đang `enabled` |
| `cluster` | sau mỗi `collect` | Gom signal mới vào trend |
| `score` | sau `cluster` | Tính lại `hotness`, đẩy top N vào `queued` |
| `generate` | 01:00 hằng ngày | Sinh nháp cho trend `queued` |
| `validate` | ngay sau `generate` | Chạy rule, đánh `rejected_auto` nếu trượt |
| `metrics` | mỗi giờ | Tổng hợp `card_events` → `card_metrics` |
| `lifecycle` | 03:00 hằng ngày | Hết hạn / thăng cấp evergreen |
| `publish` | theo `drops.publish_at` (mặc định thứ Hai 07:00) | Build và đẩy pack |

### 5.1 Collect

Interface chung:

```ts
interface Collector {
  id: string;                       // trùng studio.sources.id
  collect(since: Date): Promise<RawSignal[]>;
}
interface RawSignal {
  phrase: string;                   // ≤ 120 ký tự, đã trim
  context?: string;                 // ≤ 280 ký tự, tự viết lại, không chép nguyên văn
  url?: string;
  metric?: number;                  // chuẩn hoá 0..1
}
```

Nguồn v1 (ưu tiên nguồn có API/RSS chính thức, scrape là phương án cuối):

| Nguồn | Cách lấy | Ghi chú |
|---|---|---|
| Google Trends VN | RSS "Daily search trends" geo=VN | Ổn định, hợp pháp, không cần key |
| Báo (VnExpress, Tuổi Trẻ, Kenh14…) | RSS tiêu đề | Chỉ lấy tiêu đề + link |
| YouTube trending VN | YouTube Data API v3 (`videos.list chart=mostPopular regionCode=VN`) | Cần API key, quota free đủ dùng |
| Spotify / Zing chart | Chart công khai | Lấy tên bài + câu hook, không lấy lời đầy đủ |
| TikTok / Threads | **Manual** ở v1 | Không có API công khai ổn định; scrape vi phạm ToS. Editor dán link/cụm từ qua Studio |
| Manual | Form trong Studio | Nguồn quan trọng nhất ở giai đoạn đầu |

Manual collector là công dân hạng nhất: Studio có ô "Thêm trend" (dán cụm từ + link + ghi chú), cũng đi qua cluster/score như nguồn tự động. Có thể làm thêm một **bookmarklet / share target** để lướt TikTok thấy câu hay là gửi thẳng vào Studio.

Xử lý lỗi: mỗi collector chạy độc lập trong `try/catch`, lỗi ghi vào `sources.last_error`, không làm hỏng job.

### 5.2 Normalize & Cluster

1. Chuẩn hoá: lowercase, `unaccent`, bỏ emoji/hashtag `#`, gộp khoảng trắng.
2. Loại rác: < 2 từ, toàn số, chỉ là tên riêng (match bảng blocklist `person`), trùng signal cùng nguồn trong 24h.
3. Gom cụm (không dùng AI): `similarity(phrase_norm)` từ `pg_trgm` ≥ 0.55 với `label` của trend còn sống (`last_seen_at` trong 14 ngày) → gắn vào trend đó; không thì tạo trend mới.
4. Cập nhật `signal_count`, `source_count`, `last_seen_at`.

Tuỳ chọn v1.1: thêm embedding (rẻ, chạy batch) để gom các cách nói khác nhau của cùng một meme.

### 5.3 Score (hotness)

```
hotness = log(1 + signal_count)
        × (1 + 0.5 × (source_count − 1))          -- xuất hiện nhiều nguồn
        × velocity                                -- signals 24h qua / signals trung bình 24h trước đó
        × avg(source.weight × metric)
        × decay(now − first_seen_at)              -- half-life 5 ngày
        × feedback_boost(tags)                    -- 0.8..1.2 theo hiệu quả thẻ cùng tag (mục 5.8)
```

Mỗi lần chạy, top `N = 15` trend `new` có `hotness` cao nhất (và không dính blocklist `topic`) chuyển sang `queued`. Editor có thể kéo tay trend lên/xuống hoặc đánh `ignored` / `blocked` trong Studio.

### 5.4 Generate (bước duy nhất dùng AI)

**Chọn từ đích cho mỗi trend** (rule-based, không AI):
- Lấy 3 từ trong `studio.lexemes` có `pos`/tag khớp ngữ cảnh trend (map tag → nhóm từ, ví dụ `money` → *afford, deficit, frugal, splurge*…).
- Ưu tiên `times_used` thấp, chưa dùng trong 30 ngày, phủ đều 4 level.
- Có thể để AI đề xuất thêm 2 từ, nhưng **chỉ chấp nhận** nếu từ đó có trong `lexemes`.

**Gọi model**: 1 request / trend, trả về nhiều nháp cùng lúc. Chạy qua Batch API của nhà cung cấp (rẻ hơn ~50%, không cần realtime). Dùng model rẻ cấp "flash/haiku"; đổi model chỉ cần sửa config.

Prompt (lưu trong repo `apps/cortex-core-api/src/modules/studio/prompts/generate.v1.md`, version hoá bằng `prompt_version`):

```
Bạn là biên tập viên nội dung cho Lexica — app học từ vựng tiếng Anh cho người Việt 18–30.
Giọng văn: như bạn thân nhắn tin, hài, hơi khịa, đời thường. Không dạy đời.

TREND: {label}
NGỮ CẢNH: {summary}
TỪ ĐÍCH: {words with pos + nghĩa gợi ý}

Với MỖI từ đích, viết 3 câu khác nhau:
- Câu tiếng Việt tự nhiên, nhúng đúng 1 từ tiếng Anh (VIẾT HOA) đúng nghĩa và đúng từ loại.
- 40–140 ký tự. Người đọc phải đoán được nghĩa từ ngữ cảnh.
- Gắn với trend nhưng vẫn hiểu được nếu không biết trend.
- Cấm: chính trị, tôn giáo, giới tính/vùng miền theo hướng miệt thị, tên người thật, chửi thề nặng, nội dung 18+.
Trả về JSON đúng schema.
```

Output được ép theo JSON schema (structured output):

```json
{
  "drafts": [
    {
      "word": "frugal",
      "scenario": "Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn.",
      "translation_hint": "Tiết kiệm, chi tiêu dè sẻn",
      "archetype": "casual",
      "tone": "than thở"
    }
  ]
}
```

Response không parse được hoặc sai schema → retry 1 lần, rồi đánh trend `status = 'new'` để lần sau thử lại.

**Không dùng AI cho**: IPA (lấy từ `lexemes`), ELO/level (tính từ CEFR), `upgradeModule` / `surgeryModule` (v1 bỏ trống cho thẻ trend; UI đã xử lý field optional).

### 5.5 Validate (rule-based)

Mỗi rule ghi kết quả vào `drafts.validation` (`{ rule: pass|fail, detail }`). Fail bất kỳ rule **cứng** → `rejected_auto` (vẫn xem được trong tab "Bị lọc" để kiểm tra rule có quá chặt không).

| Rule | Loại | Kiểm tra |
|---|---|---|
| `length` | cứng | 40 ≤ len(scenario) ≤ 160 |
| `single_target` | cứng | Đúng 1 token viết hoa, và token đó == `word` (cho phép biến thể -s/-ed/-ing theo bảng inflection) |
| `in_lexicon` | cứng | `word` có trong `studio.lexemes` |
| `blocklist` | cứng | Không match `studio.blocklist` (word/regex/person/topic) |
| `profanity` | cứng | Không chứa từ trong danh sách tục nặng (danh sách nhẹ như "vãi" được phép) |
| `dup_exact` | cứng | Không trùng `scenario` đã có (normalize) |
| `dup_near` | mềm | trigram similarity với thẻ đã publish < 0.7 |
| `word_fatigue` | mềm | Từ chưa được publish trong 14 ngày |
| `vi_ratio` | mềm | ≥ 60% token là tiếng Việt (tránh câu toàn tiếng Anh) |

Rule mềm chỉ hiển thị cảnh báo trên thẻ trong Studio.

### 5.6 Review (apps/studio)

**Stack**: Next.js 16 + React 19 + Tailwind v4, dùng lại token Focus (`apps/lexica/app/globals.css`) và component quẹt của Lexica. Nên tách component quẹt + token ra `packages/ui` để hai app dùng chung.

**Auth**: Supabase Auth (cùng project). Middleware chặn mọi route nếu `user_id` không có trong `studio.editors`. Mọi thao tác ghi đi qua Cortex API `/studio/*` (có `SupabaseAuthGuard` + `EditorGuard`), Studio không dùng service role key.

**Màn hình**

1. **Inbox (quẹt duyệt)** — màn chính
   - Hiện từng nháp dưới dạng thẻ giống hệt Lexica (để duyệt đúng cảm giác người dùng thấy). Trên thẻ: trend label, tone, cảnh báo rule mềm.
   - Phím tắt / cử chỉ:

     | Thao tác | Kết quả |
     |---|---|
     | Quẹt phải / `→` | Approve → tạo `studio.cards` |
     | Quẹt trái / `←` | Reject, chọn nhanh lý do bằng phím `1–5` (cringe / sai nghĩa / nhạy cảm / trend cũ / khác) |
     | `E` hoặc chạm | Mở sửa inline (scenario, hint, level) → lưu thành `edited` + approve |
     | `S` | Bỏ qua, để sau |
     | `Z` | Hoàn tác thao tác vừa rồi |

   - Các nháp cùng trend đi liền nhau; approve 1 câu thì 2 câu cùng từ còn lại tự lùi xuống cuối (thường chỉ cần 1 câu/từ).
   - Bộ đếm phiên: số đã duyệt, tỉ lệ approve, thời gian trung bình/thẻ.
2. **Trends**: bảng trend theo hotness, xem signal gốc, đổi trạng thái, thêm trend thủ công, ép generate ngay.
3. **Drops**: tạo drop, kéo thả thẻ đã duyệt vào drop, sắp thứ tự, xem trước như trong app, đặt lịch publish.
4. **Cards**: tìm kiếm toàn bộ thẻ đã publish, xem metrics, retire / thăng evergreen thủ công, sửa (tăng `revision`).
5. **Sources & Rules**: bật/tắt collector, xem lỗi gần nhất, sửa blocklist.
6. **Health**: lịch sử `job_runs`, chi phí AI ước tính tháng này.

Mục tiêu năng suất: ≤ 10 giây / nháp → 100 nháp ≈ 15 phút.

### 5.7 Publish

Khi một drop đến `publish_at`:

1. Lấy thẻ trong drop + toàn bộ thẻ `trend` còn hạn + thẻ `evergreen`.
2. Build **pack** JSON (đúng kiểu `VocabCardData`, thêm metadata):

```json
{
  "schema": 1,
  "id": "drop-2026-w42",
  "title": "Tuần lương chưa về",
  "publishedAt": "2026-10-19T00:00:00Z",
  "cards": [
    {
      "id": "t0k9xa",
      "word": "FRUGAL",
      "ipa": "ˈfruːɡəl",
      "elo": 1050,
      "level": "intermediate",
      "scenario": "Cuối tháng sống FRUGAL tới mức ly trà đá cũng chia đôi với đứa bạn.",
      "translationHint": "Tiết kiệm, chi tiêu dè sẻn",
      "trend": { "label": "lương chưa về", "expiresAt": "2026-11-02T00:00:00Z" },
      "revision": 1
    }
  ]
}
```

3. Upload `packs/<drop-id>.json` lên Supabase Storage (bucket public `lexica-content`, `Cache-Control: public, max-age=31536000, immutable` vì tên file không đổi nội dung).
4. Ghi lại `packs/manifest.json` (`Cache-Control: max-age=300`):

```json
{
  "schema": 1,
  "updatedAt": "2026-10-19T00:00:00Z",
  "current": { "id": "drop-2026-w42", "url": ".../packs/drop-2026-w42.json", "sha256": "…" },
  "evergreen": { "id": "evergreen-r7", "url": ".../packs/evergreen-r7.json", "sha256": "…" },
  "retired": ["t01abc", "t02def"]
}
```

5. Cập nhật `drops.status = 'published'`, `pack_url`, `pack_sha256`.

Rollback: trỏ `manifest.current` về drop trước (nút "Rollback" trong Studio). Pack cũ không bao giờ bị xoá.

### 5.8 Feedback loop

**Event từ Lexica** (dùng lại hạ tầng sync/analytics hiện có, gửi theo lô):

```ts
type CardEvent = {
  cardId: string;
  kind: 'impression' | 'reveal' | 'known' | 'unknown' | 'share' | 'review_correct' | 'review_wrong';
  dwellMs?: number;
  at: number;
};
```

- Endpoint `POST /content/events` (cho phép ẩn danh, rate-limit theo IP), ghi vào `studio.card_events` (partition theo tháng), job `metrics` tổng hợp vào `card_metrics`.
- Chỉ ghi event cho thẻ `t*` (thẻ core không cần).

**Job `lifecycle`**:

| Điều kiện | Hành động |
|---|---|
| `impressions ≥ 200` và (`shares/impressions ≥ 2%` hoặc `d7_retention ≥ 0.6`) | Thăng `evergreen`, bỏ `expires_at` |
| Quá `expires_at` và không đạt ngưỡng trên | `retired` (người đã học vẫn giữ tiến độ, chỉ không ra thẻ mới) |
| `unknown/(known+unknown) > 0.85` sau 300 lượt | Gắn cờ "quá khó / câu khó hiểu" cho editor xem lại |

**Feedback vào Scorer**: `feedback_boost(tag)` = hiệu quả trung bình (share + retention) của thẻ cùng tag trong 30 ngày so với trung bình toàn bộ, kẹp trong `[0.8, 1.2]`.

---

## 6. Thay đổi phía Lexica

### 6.1 `contentRepository`

Tạo `apps/lexica/app/lib/content/` thay cho import trực tiếp `VOCAB_DATABASE`:

```ts
// app/lib/content/repository.ts
export function getAllCards(): VocabCard[];          // core + pack đang active, đã bỏ retired
export function getCard(id: string): VocabCard | undefined;
export function useContentVersion(): string;         // để component re-render khi pack mới về
```

- **Core pack**: `VOCAB_DATABASE` (570 thẻ) vẫn bundle tĩnh → app luôn chạy kể cả offline/lần đầu.
- **Remote packs**: tải `manifest.json` khi mở app (stale-while-revalidate), tải pack nếu `sha256` khác bản cache, lưu IndexedDB (pack có thể vài trăm KB, không nhét localStorage).
- Validate pack bằng zod; pack lỗi → bỏ qua, giữ bản cũ.
- Thẻ có `id` trong `retired` mà người dùng **đã học** vẫn hiện trong `/learned` và ôn tập (không mất tiến độ); chỉ không đưa vào deck mới.
- Migration: thay 17 chỗ `import { VOCAB_DATABASE }` bằng `getAllCards()` / `getCard()` (codemod đơn giản, làm trong 1 PR riêng **trước** khi có Studio).

### 6.2 UI

- Badge "Trend" nhỏ (mono, `text-accent`) trên thẻ trend + nhãn trend.
- Trang chủ: khối "Drop tuần này" (tên drop, số thẻ, còn bao nhiêu ngày) → vào deck chỉ gồm thẻ drop.
- Thuật toán chọn thẻ hiện tại (ELO) giữ nguyên; thêm trọng số để mỗi phiên có ~30% thẻ từ drop hiện tại.

### 6.3 Analytics

Thêm `trackCardEvent` vào `productAnalytics.ts`, buffer trong memory, flush mỗi 20 event hoặc khi `visibilitychange → hidden` (`navigator.sendBeacon`).

---

## 7. API (Cortex API, module `studio`)

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| GET | `/studio/drafts?status=pending&limit=50` | Editor | Hàng chờ duyệt |
| POST | `/studio/drafts/:id/approve` | Editor | Body: bản sửa (optional) → tạo card |
| POST | `/studio/drafts/:id/reject` | Editor | Body: `{ reason }` |
| POST | `/studio/drafts/:id/undo` | Editor | Hoàn tác thao tác gần nhất của editor đó |
| GET/PATCH | `/studio/trends` | Editor | Danh sách, đổi trạng thái |
| POST | `/studio/trends/manual` | Editor | Thêm trend thủ công |
| POST | `/studio/trends/:id/generate` | Editor | Ép sinh nháp ngay |
| CRUD | `/studio/drops` | Editor | Quản lý drop |
| POST | `/studio/drops/:id/publish` | Editor | Publish ngay |
| POST | `/studio/drops/:id/rollback` | Editor | Trỏ manifest về drop trước |
| GET/PATCH | `/studio/cards` | Editor | Tìm, sửa, retire |
| GET | `/studio/health` | Editor | Job runs, chi phí |
| POST | `/content/events` | Public + rate-limit | Event từ Lexica |

`EditorGuard`: sau `SupabaseAuthGuard`, kiểm tra `user_id` có trong `studio.editors`.

---

## 8. Chi phí

Giả định: 15 trend/ngày × 3 từ × 3 câu = 135 nháp/ngày ≈ 4.000 nháp/tháng (dư so với nhu cầu ~120 thẻ/tháng, vì tỉ lệ approve dự kiến 20–40%).

| Hạng mục | Ước tính / tháng |
|---|---|
| LLM (≈ 450 request, ~1.5k token in + ~1k token out mỗi request, model rẻ + batch) | **1–5 USD** |
| YouTube Data API | 0 (trong quota free) |
| Supabase Storage + egress (pack ~200 KB, cache CDN) | 0 ở free tier đến vài nghìn user |
| Railway (job chạy chung API) | không phát sinh thêm đáng kể |

Kiểm soát: biến môi trường `STUDIO_MAX_REQUESTS_PER_DAY` (mặc định 30) và `STUDIO_MONTHLY_BUDGET_USD`; job `generate` dừng khi chạm trần, ghi cảnh báo vào Health.

---

## 9. An toàn nội dung và pháp lý

- **Con người là chốt chặn cuối**: không có đường nào để nháp lên app mà không qua approve.
- Blocklist 4 loại (word/regex/person/topic), sửa được trong Studio. Topic mặc định: chính trị, tôn giáo, thảm hoạ/tai nạn có người chết, vụ án, sức khoẻ tâm thần dạng chế giễu.
- Không lưu và không phát hành nội dung gốc của người khác; chỉ lấy *tín hiệu* (cụm từ ngắn) làm cảm hứng, câu cuối do AI viết lại và người duyệt.
- Không nêu tên người thật / người nổi tiếng trong thẻ (rule `person`).
- Không scrape nền tảng cấm scrape trong ToS (TikTok, Threads, Facebook) → đi đường manual.
- Thẻ có nút "Báo cáo" trong Lexica → event `report`; ≥ 3 report thì tự ẩn thẻ khỏi manifest ở lần publish tiếp theo và báo editor.

---

## 10. Quan sát và vận hành

- `studio.job_runs` + trang Health trong Studio.
- Cảnh báo (email hoặc webhook Discord) khi: collector lỗi 3 lần liên tiếp, generate chạm trần ngân sách, hàng chờ duyệt > 300, chưa có drop nào `scheduled` cho tuần tới vào tối thứ Sáu.
- Mọi thay đổi trên `cards` ghi `studio.audit_log (actor, action, entity, before, after, at)`.

---

## 11. Lộ trình triển khai

| Giai đoạn | Nội dung | Ước lượng |
|---|---|---|
| **0. Chuẩn bị Lexica** | `contentRepository` + migrate 17 import; core pack; tải manifest/pack từ Storage (pack tạo tay để test); badge Trend; `trackCardEvent` | 2–3 ngày |
| **1. Studio tối thiểu (manual-first)** | Schema `studio`; `apps/studio` với auth editor; Inbox quẹt duyệt; thêm trend thủ công; generate thủ công (nút bấm); validator; publish + manifest + rollback | 4–6 ngày |
| **2. Tự động hoá** | Collectors (Google Trends, RSS báo, YouTube); cluster + score; cron generate; trần ngân sách; Health | 3–4 ngày |
| **3. Vòng phản hồi** | `/content/events`, `card_metrics`, lifecycle (evergreen/retire), feedback_boost, báo cáo thẻ | 2–3 ngày |
| **4. Tối ưu** | Embedding để gom cụm; bookmarklet thêm trend nhanh; A/B 2 câu cho cùng từ; thống kê năng suất duyệt | khi cần |

Thứ tự này cho phép phát hành Trend Drop **thủ công ngay sau giai đoạn 1**: bạn tự thêm trend, bấm generate, quẹt duyệt, publish. Tự động hoá chỉ làm khi đã chứng minh người dùng thích nội dung trend.

### Tiêu chí hoàn thành v1
- [ ] Publish 1 drop từ Studio, Lexica (production) nhận thẻ mới mà không deploy lại.
- [ ] Rollback drop trong < 1 phút.
- [ ] Người dùng đang có tiến độ trên thẻ core không bị ảnh hưởng.
- [ ] Duyệt 100 nháp ≤ 20 phút.
- [ ] Chi phí AI tháng đầu ≤ 10 USD.

---

## 12. Rủi ro và câu hỏi mở

| Rủi ro | Giảm thiểu |
|---|---|
| Giọng văn AI "cringe", không giống người Việt trẻ thật | Few-shot bằng 20 câu hay nhất từ `VOCAB_DATABASE` + thẻ có share cao nhất; lý do reject (cringe…) được thống kê để chỉnh prompt; version hoá prompt và so sánh tỉ lệ approve theo `prompt_version` |
| Trend hết nóng trước khi drop phát hành | Chu kỳ tuần; thêm "drop nhanh" giữa tuần cho trend rất nóng |
| Nguồn tự động nghèo nàn, trend thật nằm ở TikTok | Manual là nguồn chính v1; bookmarklet làm việc thêm trend còn 2 giây |
| Từ vựng bị lặp | `word_fatigue` + chọn từ ưu tiên `times_used` thấp |
| Pack lớn dần | Chỉ pack drop hiện tại + evergreen; thẻ retired không tải lại |
| Một người duyệt là điểm nghẽn | Studio hỗ trợ nhiều editor từ đầu (bảng `editors`), chỉ chưa phân quyền chi tiết |

Câu hỏi mở:
1. Thẻ trend có cần `upgradeModule` / `surgeryModule` không, hay chấp nhận thẻ trend "mỏng" hơn thẻ core?
2. Có muốn `scenarios` theo archetype (casual/tech/business/student) cho thẻ trend, hay 1 câu cho tất cả?
3. Tên miền cho Studio (`studio.cortex…`) và ai được làm editor ngoài bạn?
4. Drop có gắn với tính năng khác không (ví dụ thẻ trend xuất hiện trong chế độ chơi/cược ở các ý tưởng gamification)?
