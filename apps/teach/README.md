# Cortex cho lớp (apps/teach)

The teacher and center app for every Cortex learning app (Lexica today; Oratio, Solilo, Synapse next), on its own subdomain. Design: Claude Doc "Lexica Lớp học — thiết kế"; the architecture and the standard for adding an app are in `docs/CLASSROOM.md`.

- Same Supabase project and accounts as the learning apps. Everything goes through the `classroom_*` security definer functions in `packages/classroom/sql/classroom_core.sql`, plus one SQL file per app module (`packages/classroom-<app>/sql/`). Calls and shared rules: `packages/classroom`.
- Each app plugs in as a module: its pure rules in `packages/classroom-<app>`, its screens in `app/modules/<app>/`, registered in `app/modules/index.ts`.
- No public sign-up: people get in with a one-use invitation link (7 days). The system admin is set once in SQL (`insert into cortex_staff`, see `docs/CLASSROOM.md`).

## Run

```
cp .env.local.example .env.local   # Supabase URL + anon key, NEXT_PUBLIC_LEXICA_URL, NEXT_PUBLIC_TEACH_URL
pnpm --filter @cortex/teach dev    # http://localhost:3010
```

## Deploy (Vercel)

1. Root Directory `apps/teach` (if the project was made for `apps/lexica-teach`, change it in Settings → General), domain e.g. `teach.<domain>`.
2. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_LEXICA_URL`, `NEXT_PUBLIC_TEACH_URL`.
3. Supabase → Authentication → URL Configuration: add the teacher app's URL to Redirect URLs.
4. In each learning app's project, set `NEXT_PUBLIC_TEACH_URL` so links point here.
