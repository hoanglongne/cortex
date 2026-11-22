-- Delete my account (Apple 5.1.1(v), Google Play account deletion). Safe to re-run.
--
-- The signed-in player calls delete_my_account() and their auth user is removed.
-- Almost every table that holds their data references auth.users with
-- ON DELETE CASCADE (progress backup, buddies, duels, class membership, writing,
-- push subscriptions, ...) or SET NULL (feedback, card stats), so those follow.
-- The few columns that reference auth.users without a delete rule (who granted
-- a teacher role, who created an assignment, Studio editors, ...) would block the
-- delete, so they are set to NULL first. They are found in the catalog, not listed,
-- so a table added later does not break account deletion.
--
-- A teacher's own classes go with them (owner_id is ON DELETE CASCADE): the app
-- says so before asking for confirmation.

create or replace function public.delete_my_account()
returns void language plpgsql volatile security definer set search_path = public, auth as $$
declare
  me uuid := auth.uid();
  r record;
begin
  if me is null then raise exception 'not signed in'; end if;

  for r in
    select c.conrelid::regclass as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
      and c.confdeltype in ('a', 'r')
      and array_length(c.conkey, 1) = 1
      and not a.attnotnull
  loop
    execute format('update %s set %I = null where %I = $1', r.tbl, r.col, r.col) using me;
  end loop;

  delete from auth.users where id = me;
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
