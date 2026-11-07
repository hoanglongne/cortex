-- Row-level security for app_backups (POST /v1/sync/backup).
-- The API now writes with the caller's own token, so each person can read and
-- write only their own snapshot. Before, the API used the public key with no
-- user, which a table with row-level security refuses (HTTP 500), and which a
-- table without it would have allowed for anyone. Idempotent: safe to re-run.

alter table if exists public.app_backups enable row level security;

drop policy if exists app_backups_select_own on public.app_backups;
create policy app_backups_select_own on public.app_backups
  for select to authenticated using (user_id = auth.uid());

drop policy if exists app_backups_insert_own on public.app_backups;
create policy app_backups_insert_own on public.app_backups
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists app_backups_update_own on public.app_backups;
create policy app_backups_update_own on public.app_backups
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
