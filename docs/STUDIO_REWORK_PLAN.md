# Studio rework plan (#112)

Status: **draft for approval**. Nothing here is built yet except the timing
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

0. **Instrumentation** (done in this branch): timing headers + Hiệu năng panel.
1. **Measure** (user): browse each page, copy JSON from the panel into #112.
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
