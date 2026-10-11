# Lexica Studio

Back office for Trend Drops (spec: [`docs/LEXICA_STUDIO_SPEC.md`](../../docs/LEXICA_STUDIO_SPEC.md)):
add a trend → AI drafts sentences → review by swiping → group approved cards into a drop → publish.
Lexica picks up published drops without a redeploy.

## Run

```bash
cp .env.example .env.local   # fill in the anon key
pnpm --filter @cortex/studio dev   # http://localhost:3012
```

The Cortex API must be running (`pnpm --filter @cortex/api start:dev`, port 3001) with
`GEMINI_API_KEY` or `GROQ_API_KEY` set.

## One-time setup

1. Run `supabase/restore_all.sql` (or just `apps/cortex-core-api/supabase/migration_studio.sql`,
   `seed_studio_lexemes.sql` and `migration_studio_phase2.sql`) in the Supabase SQL Editor.
2. Make yourself an editor:
   ```sql
   insert into studio_editors (user_id) select id from auth.users where email = 'you@example.com';
   ```
   Studio does not create accounts, so the email must already exist (e.g. sign in to Lexica once).
3. Give yourself a password, so signing in needs no email (Supabase's built-in mailer only sends a
   few emails per hour for the whole project). In the SQL Editor, type your own password in place
   of `…` (never paste it anywhere else):
   ```sql
   update auth.users
   set encrypted_password = extensions.crypt('…', extensions.gen_salt('bf'))
   where email = 'you@example.com';
   ```
   The magic link still works as a fallback; it is one-time and must be opened in the same browser.
4. Supabase → Authentication → URL Configuration: add the Studio URL (and
   `http://localhost:3012`) to Redirect URLs.
5. Lexica (Vercel): set
   `NEXT_PUBLIC_CONTENT_MANIFEST_URL=https://<project>.supabase.co/storage/v1/object/public/lexica-content/packs/manifest.json`.

## Keyboard (inbox)

| Key | Action |
|---|---|
| → | Approve |
| ← then 1–5 | Reject with a reason |
| E | Edit, then ⌘/Ctrl+Enter to save and approve |
| S | Skip for now |
| Z | Undo last decision |

## API env (Cortex API)

| Var | Default | |
|---|---|---|
| `STUDIO_LLM_PROVIDER` | whichever key is set | `gemini` or `groq` |
| `STUDIO_LLM_MODEL` | `gemini-2.0-flash` / `llama-3.3-70b-versatile` | |
| `STUDIO_MAX_GENERATIONS_PER_DAY` | `30` | Cost cap (one generation = one LLM call) |
| `STUDIO_AUTO_GENERATE_PER_RUN` | `10` | Queued trends drafted per "Sinh nháp" run |
| `STUDIO_CRON` | off | `on` runs the pipeline on a schedule (VN time): collect/cluster/score 6h, 12h, 18h, 23h; generate 1h; lifecycle 3h |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Needed only for `STUDIO_CRON=on` (scheduled jobs have no editor session). Server only, never in a client app |
| `YOUTUBE_API_KEY` | — | Enables the YouTube trending source |
| `STUDIO_ALERT_WEBHOOK` | — | Discord/Slack-style webhook for failed jobs |
| `CORS_ORIGINS` | — | Extra allowed origins, comma-separated (e.g. the deployed Studio URL if not on `*.vercel.app`) |

## Pipeline

Sources (Google Trends VN, news RSS, YouTube) → signals → clustered into trends → scored
(`hotness`, top 15 queued) → AI drafts → you review → drop → publish. Every step has a button in
**Hệ thống**; the scheduler runs the same steps when enabled.

Lexica sends anonymous per-card events (impression, reveal, known/unknown, review results,
report) to `POST /content/events`. The daily **lifecycle** step keeps well-liked cards forever
(evergreen), retires trend cards once their drop ends, hides cards with 3+ reports and flags cards
almost nobody knows; it then republishes the live drop so learners get the changes.
