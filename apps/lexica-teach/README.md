# Lexica cho lớp (apps/lexica-teach)

The teacher and center app for Lexica, on its own subdomain. Design: Claude Doc "Lexica Lớp học — thiết kế"; product notes in `docs/LEXICA_DIRECTION.md` ("Trung tâm").

- Same Supabase project and accounts as Lexica. Everything goes through the security definer functions in `apps/lexica/supabase/migration_classes.sql` and `migration_classes_v2.sql`; the calls and shared rules are in `packages/lexica-classes`.
- No public sign-up: people get in with a one-use invitation link (7 days). The system admin is set once in SQL (see the top of `migration_classes_v2.sql`).
- Word matching for lessons uses Lexica's `/api/word-index`.

## Run

```
cp .env.local.example .env.local   # Supabase URL + anon key, NEXT_PUBLIC_LEXICA_URL, NEXT_PUBLIC_TEACH_URL
pnpm --filter @cortex/lexica-teach dev   # http://localhost:3010
```

## Deploy (Vercel)

1. New project, Root Directory `apps/lexica-teach`, domain e.g. `teach.<lexica domain>`.
2. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_LEXICA_URL`, `NEXT_PUBLIC_TEACH_URL`.
3. Supabase → Authentication → URL Configuration: add the teacher app's URL to Redirect URLs (sign-in links come back to it).
4. In Lexica's project, set `NEXT_PUBLIC_TEACH_URL` so students' and teachers' links point here.
