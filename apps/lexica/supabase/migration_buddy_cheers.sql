-- Cheers between study buddies (Lexica Buddy, issue #70, direction A).
-- Runs after migration_study_buddy.sql. Safe to re-run.
--
-- A buddy sends another one cheer a day (a kind: fire, clap or muscle; sending
-- again the same day changes it). Only buddies (a row in buddy_pairs) can
-- cheer. The tables have RLS on and no policies; calls go through functions.

create table if not exists lexica_cheers (
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  on_date date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date,
  kind text not null check (kind in ('fire', 'clap', 'muscle')),
  at timestamptz not null default now(),
  primary key (from_user, to_user, on_date),
  check (from_user <> to_user)
);
create index if not exists lexica_cheers_to_idx on lexica_cheers (to_user, on_date);
alter table lexica_cheers enable row level security;

create or replace function public.cheer_send(p_to uuid, p_kind text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from buddy_pairs where (user_a_id = me and user_b_id = p_to) or (user_a_id = p_to and user_b_id = me)) then raise exception 'not buddies'; end if;
  if p_kind not in ('fire', 'clap', 'muscle') then raise exception 'bad kind'; end if;
  insert into lexica_cheers (from_user, to_user, kind) values (me, p_to, p_kind)
  on conflict (from_user, to_user, on_date) do update set kind = excluded.kind, at = now();
  return jsonb_build_object('ok', true);
end;
$$;

-- Today's cheers: those I got (with the sender's name) and whom I already cheered.
create or replace function public.cheers_today()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'received', coalesce((select jsonb_agg(jsonb_build_object('from_id', c.from_user, 'from_name', (select nickname from profiles p where p.id = c.from_user), 'kind', c.kind) order by c.at desc)
                           from lexica_cheers c where c.to_user = auth.uid() and c.on_date = (now() at time zone 'Asia/Ho_Chi_Minh')::date), '[]'::jsonb),
    'sent', coalesce((select jsonb_object_agg(c.to_user, c.kind) from lexica_cheers c where c.from_user = auth.uid() and c.on_date = (now() at time zone 'Asia/Ho_Chi_Minh')::date), '{}'::jsonb)
  );
$$;

do $$
declare f text;
begin
  foreach f in array array['cheer_send(uuid, text)', 'cheers_today()'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
