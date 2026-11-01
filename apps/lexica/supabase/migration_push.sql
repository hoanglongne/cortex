-- Web push for Lexica (docs/LEXICA_PUSH_SPEC.md, the first part). Safe to re-run.
-- Runs after migration_buddy_social.sql (it adds a column to its tables).
--
-- A device that agreed to notifications saves its subscription here (through
-- push_subscribe, as the signed-in player). The Cortex API reads them with the
-- service role and sends: a study date about to start, a gift or a question
-- from a buddy. The table has RLS on and no policies.

create table if not exists lexica_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  fail_count int not null default 0
);
create index if not exists lexica_push_subscriptions_user_idx on lexica_push_subscriptions (user_id);
alter table lexica_push_subscriptions enable row level security;

-- What the scheduler has already sent
alter table lexica_study_dates add column if not exists notified_at timestamptz;
alter table lexica_gifts add column if not exists pushed_at timestamptz;
alter table lexica_asks add column if not exists pushed_at timestamptz;

create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_ua text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_endpoint is null or p_endpoint !~ '^https://' or char_length(p_endpoint) > 700 or coalesce(char_length(p_p256dh), 0) not between 10 and 200 or coalesce(char_length(p_auth), 0) not between 10 and 100 then
    raise exception 'bad subscription';
  end if;
  -- the same browser signing in as someone else takes the subscription over
  insert into lexica_push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (me, p_endpoint, p_p256dh, p_auth, left(coalesce(p_ua, ''), 200))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, fail_count = 0;
  -- keep the 5 newest per person
  delete from lexica_push_subscriptions where user_id = me and id not in (
    select id from lexica_push_subscriptions where user_id = me order by created_at desc limit 5);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.push_unsubscribe(p_endpoint text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from lexica_push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
  return jsonb_build_object('ok', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['push_subscribe(text, text, text, text)', 'push_unsubscribe(text)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
