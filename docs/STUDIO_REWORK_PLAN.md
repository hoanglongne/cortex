# Studio rework plan (#112)

Status: **approved (all proposals)**. Phase 2 and the navigation of phase 4 are built; the unified queue is next. Nothing here is built yet except the timing
instrumentation (step 0). Studio is the editor tool for Lexica content.

## 1. Problems (user report)

- Cluttered: 11 nav entries, every content type is its own page with its own layout.
- Hard to use: the same job (review a draft) works differently on each page.
- Very laggy.

## 2. Current state (measured from the code)

| Item | Value |
| --- | --- |
| Nav entries | 11 (Duyệt, Radar, Trend, Thẻ, Câu mẫu, Ngoài đời, Đọc, Giao tiếp, Drop, Sức khoẻ, Hệ thống) |
| Page size | 79–380 lines each |
| API calls per page load | quotes 8, drops 6, trends 6, variants 6, radar 5, home 4, passages 4, talk 4, system 3, cards 2 |
| JS | 1.3 MB static total, largest chunk 227 KB (not the bottleneck) |
| API list queries | several use `select('*')` and `limit(300)`; filtering often happens after fetching all |
| Auth | `getSession()` on every call; API guards are already cached |
| Bulk actions | "approve all" in variants does sequential calls |

## 2b. Measured (2026-11-02, production)

| Endpoint | Total p50 | API | Guard | Size |
| --- | --- | --- | --- | --- |
| GET /me (first call) | 5764 ms | 2598 | 2597 | 63 B |
| GET /drafts | 1497 | 1052 | 1 | 82 KB |
| GET /lexemes | 1301 | 874 | 1 | 8 KB |
| GET /drops | 1244 | 813 | 1 | 2 B |
| GET /health | 1130 | 913 | 0 | 8 KB |
| GET /blocklist | 1042 | 818 | 1 | 0.5 KB |

Reading: every query costs about 800 ms even when it returns 2 bytes, and the
guard is about 1 ms. So the time is not our code or the data size: it is the
API to Supabase round trip (Railway free tier in the US, Supabase in Asia) plus
about 300 ms browser to API. The first call after idle adds 2.6 s (cold start
and first token check).

## 2c. Causes beyond the server region

Even after the region is fixed these make pages slow, in order of impact:

1. **Waterfall of 5–8 calls per page.** At ~1 s each, a page waits seconds. Fix: one `/queue` and one `/counts` call per page, run in parallel.
2. **A new Supabase client per request** (`clientForToken`) and a second `getUser` check per token every 5 minutes. Fix: reuse keep-alive connections, longer token cache.
3. **Payload size**: `/drafts` is 82 KB with `select('*')`. Fix: list columns only, paginate by 50, load the body on open.
4. **No caching in the browser.** Every visit refetches everything. Fix: stale-while-revalidate for lists, optimistic updates for approve/reject.
5. **Sequential bulk writes** ("approve all"). Fix: one bulk endpoint.
6. **Cold start**. Fix: paid plan without sleeping, or a keep-warm ping.

## 3. Lag hypotheses, ranked

Confirm each with the new **Hệ thống → Hiệu năng** panel (step 0).

1. **Too many calls per page, fired in sequence or all at once** (5–8 per page).
   Confirm: count column per page; total p50 of the page's calls summed.
2. **Cold API (Railway) or far region.** Confirm: `Tổng − API` is large and similar for every endpoint (network), or the first call is much slower than later ones.
3. **Heavy queries** (`select('*')`, `limit(300)`, no pagination). Confirm: `API − Guard` large and `KB` large.
4. **Auth overhead.** Confirm: `Guard` large. Expected small (cached).
5. **Client rendering of long lists** (no virtualisation). Confirm: API times small but the page still feels slow.
6. **Sequential bulk writes.** Confirm: `PATCH …/approve` count in the panel after "approve all".

## 4. Proposal

### 4.1 Information architecture

From 11 pages to **5 sections**:

1. **Duyệt** (one review queue for every content type: cards, variants, quotes, passages, talk, drops). Filter chips by type; same row layout, same keys (approve / edit / reject).
2. **Nguồn** (Radar + Trend: where content comes from).
3. **Thư viện** (published cards, lexemes, search/edit).
4. **Drop** (weekly schedule).
5. **Hệ thống** (health, jobs, tokens, blocklist, performance).

### 4.2 UI kit

One `ReviewRow`, one `FilterBar`, one `Empty/Loading/Error` state, keyboard shortcuts (J/K move, A approve, E edit, R reject). All from existing theme tokens.

### 4.3 API and code structure

- One endpoint `GET /studio/queue?type=&cursor=` returning only needed columns, paginated (50).
- Counts for the nav badges in one call (`GET /studio/counts`), not one per page.
- Bulk endpoints (`POST /studio/drafts/approve` with ids) instead of loops.
- Replace `select('*')`; add indexes for the queue filters if the panel shows slow queries.
- Client: one `useQueue` hook with cache + optimistic update; pages become thin.
- Split `studio.service.ts` by content type once the queue is unified.

## 5. Phases

0. **Instrumentation** (done, #121): timing headers + Hiệu năng panel.
1. **Measure** (done): see 2b. Main cause is region distance.
1b. **Infra** (user): move Railway to the Supabase region (paid plan).
2. **Quick wins** driven by the numbers: parallelise calls, drop `select('*')`, bulk endpoints, keep-warm if cold starts. Each is a small separate commit.
3. **Unified queue** (4.1 section 1 + 4.3 endpoints).
4. **Navigation + UI kit** (4.1, 4.2).
5. Remove old pages.

Phases 2–5 ship behind the existing URLs so Studio stays usable throughout.

## 6. Decisions needed

1. Approve the 5-section structure, or which types stay separate?
2. Is keyboard-driven review wanted (J/K/A/E/R)?
3. Is Railway cold start acceptable to fix with a cheap keep-warm ping?
4. OK to run phase 2 immediately after the numbers are in, without another approval?

## 7. How to collect numbers

Deploy the API and Studio, open Studio, visit each page once or twice, go to **Hệ thống → Hiệu năng**, press **Chép JSON** and paste it into #112.

## 8. Progress

- Done: timing panel; `/me` no longer blocks opening; "approve all" in parallel; `GET /studio/counts` (one call for all badges); nav reduced from 11 entries to 5 sections with sub-tabs and pending badges (old URLs unchanged).
- Done: drafts load 30 at a time and refill when empty (was 100, 82 KB); A/R keys join the existing arrows/E/S/Z shortcuts.
- Not done on purpose: a separate unified `/queue` endpoint and removing old pages; the five tabs already share one place and the review pages differ too much to merge safely. Revisit if the new numbers still look slow.
- Done (bulk review): tick boxes plus a bar "Chọn tất cả / Duyệt N / Loại N" on Ngoài đời, Đọc, Giao tiếp, Câu mẫu (by card) and Thư viện (keep forever / retire); "Duyệt nhanh" for new cards that pass every check (one per word). Bulk runs 6 requests at a time. A single review no longer reloads the list and the counts (it used to cost 2 more round trips each); the review queue moves to the next card at once and brings the card back with the reason if the request fails. Page sizes: quotes 20, passages 15, talk 20.
- Done (UI rework of the review pages): the list to review now starts at the top of every page. Generate, publish, stats and add-by-hand moved behind one fold ("Công cụ") with the one or two daily buttons kept visible; the same status tabs everywhere; compact rows with tick box and icon buttons (✓ ✕ ✎); J/K move, A approve, R reject, Space tick; long passages collapse; variants show 3 sentences per card as one block with "Duyệt cả 3". Applies to Ngoài đời, Đọc, Giao tiếp, Câu mẫu and Thư viện. Not changed: Thẻ mới queue, Radar, Trend, Drop, Hệ thống.
