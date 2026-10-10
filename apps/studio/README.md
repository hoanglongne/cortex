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

1. Run `supabase/restore_all.sql` (or just `apps/cortex-core-api/supabase/migration_studio.sql`
   and `seed_studio_lexemes.sql`) in the Supabase SQL Editor.
2. Make yourself an editor:
   ```sql
   insert into studio_editors (user_id) select id from auth.users where email = 'you@example.com';
   ```
   Sign-in uses a magic link and does not create accounts, so the email must already exist
   (e.g. sign in to Lexica once).
3. Supabase → Authentication → URL Configuration: add the Studio URL (and
   `http://localhost:3012`) to Redirect URLs.
4. Lexica (Vercel): set
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
