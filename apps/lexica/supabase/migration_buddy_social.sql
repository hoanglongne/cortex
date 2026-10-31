-- Buddy, the social parts (Lexica, issue #100, docs/BUDDY_PLAN.md).
-- Runs after migration_study_buddy.sql. Safe to re-run.
--
--   "Hôm nay bạn học gì": the card ids a person learned today, shown to their buddies (can be hidden)
--   Gifts: a word with a short note (60 characters, no links) sent to a buddy
--   Shields: once a week a person covers one day of a buddy in the group quest
--   Study dates: "học cùng lúc 20:30", both check in during the window
--
-- Only buddies (a row in buddy_pairs) can do any of this. Tables have RLS on
-- and no policies; every read and write goes through the functions below.
-- The group quest itself needs no table: it is counted from daily_activity.

create table if not exists lexica_buddy_words (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  words jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
create table if not exists lexica_buddy_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hide_words boolean not null default false
);
create table if not exists lexica_gifts (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  reported_at timestamptz,
  check (from_user <> to_user)
);
create index if not exists lexica_gifts_to_idx on lexica_gifts (to_user, created_at desc);
create index if not exists lexica_gifts_from_idx on lexica_gifts (from_user, created_at desc);
create table if not exists lexica_shields (
  giver uuid not null references auth.users(id) on delete cascade,
  receiver uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (giver, week_start),
  check (giver <> receiver)
);
create table if not exists lexica_study_dates (
  id uuid primary key default gen_random_uuid(),
  creator uuid not null references auth.users(id) on delete cascade,
  buddy uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null,
  created_at timestamptz not null default now(),
  creator_in timestamptz,
  buddy_in timestamptz,
  canceled boolean not null default false,
  check (creator <> buddy)
);
create index if not exists lexica_study_dates_idx on lexica_study_dates (creator, at);
create index if not exists lexica_study_dates_buddy_idx on lexica_study_dates (buddy, at);

alter table lexica_buddy_words enable row level security;
alter table lexica_buddy_prefs enable row level security;
alter table lexica_gifts enable row level security;
alter table lexica_shields enable row level security;
alter table lexica_study_dates enable row level security;

-- ── Hôm nay bạn học gì ───────────────────────────────────────────────────

create or replace function public.buddy_words_set(p_day date, p_words jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  if p_day is null or abs(p_day - (now() at time zone 'Asia/Ho_Chi_Minh')::date) > 1 then raise exception 'bad day'; end if;
  if jsonb_typeof(p_words) <> 'array' or jsonb_array_length(p_words) > 40 then raise exception 'bad words'; end if;
  -- only plain card ids
  if exists (select 1 from jsonb_array_elements(p_words) w where jsonb_typeof(w) <> 'string' or length(w #>> '{}') > 80) then raise exception 'bad words'; end if;
  insert into lexica_buddy_words (user_id, day, words) values (me, p_day, p_words)
  on conflict (user_id, day) do update set words = excluded.words, updated_at = now();
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.buddy_prefs_set(p_hide boolean)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into lexica_buddy_prefs (user_id, hide_words) values (auth.uid(), coalesce(p_hide, false))
  on conflict (user_id) do update set hide_words = excluded.hide_words;
  return jsonb_build_object('ok', true);
end;
$$;

-- My setting, and what my buddies learned on the day (those who hide it are left out).
create or replace function public.buddy_words_feed(p_day date)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'hidden', coalesce((select hide_words from lexica_buddy_prefs where user_id = auth.uid()), false),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('user_id', w.user_id, 'name', (select nickname from profiles p where p.id = w.user_id), 'words', w.words) order by w.updated_at desc)
      from lexica_buddy_words w
      where w.day = p_day and jsonb_array_length(w.words) > 0
        and exists (select 1 from buddy_pairs b where (b.user_a_id = auth.uid() and b.user_b_id = w.user_id) or (b.user_b_id = auth.uid() and b.user_a_id = w.user_id))
        and not coalesce((select hide_words from lexica_buddy_prefs q where q.user_id = w.user_id), false)
    ), '[]'::jsonb)
  );
$$;

-- ── Gifts ───────────────────────────────────────────────────────────────

create or replace function public.gift_send(p_to uuid, p_card text, p_note text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  n text := btrim(coalesce(p_note, ''));
  gid uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  if not lexica_duel_is_buddy(me, p_to) then raise exception 'not buddies'; end if;
  if p_card is null or length(p_card) not between 1 and 80 then raise exception 'bad card'; end if;
  if char_length(n) > 60 then raise exception 'note too long'; end if;
  if n ~* '(https?:|www\.|\.com|\.vn|@)' then raise exception 'no links'; end if;
  if (select count(*) from lexica_gifts g where g.from_user = me and g.created_at > now() - interval '24 hours') >= 5 then raise exception 'too many gifts'; end if;
  insert into lexica_gifts (from_user, to_user, card_id, note) values (me, p_to, p_card, n) returning id into gid;
  return jsonb_build_object('id', gid);
end;
$$;

create or replace function public.gift_inbox()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'received', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'from_id', g.from_user, 'from_name', (select nickname from profiles p where p.id = g.from_user),
        'card_id', g.card_id, 'note', case when g.reported_at is null then g.note else '' end, 'created_at', g.created_at, 'opened', g.opened_at is not null) order by g.created_at desc)
      from lexica_gifts g where g.to_user = auth.uid() and g.created_at > now() - interval '30 days'), '[]'::jsonb),
    'sent', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'to_id', g.to_user, 'to_name', (select nickname from profiles p where p.id = g.to_user),
        'card_id', g.card_id, 'created_at', g.created_at, 'opened', g.opened_at is not null) order by g.created_at desc)
      from lexica_gifts g where g.from_user = auth.uid() and g.created_at > now() - interval '14 days'), '[]'::jsonb)
  );
$$;

create or replace function public.gift_open(p_gift uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  g lexica_gifts;
begin
  select * into g from lexica_gifts where id = p_gift and to_user = auth.uid();
  if g.id is null then raise exception 'no such gift'; end if;
  update lexica_gifts set opened_at = coalesce(opened_at, now()) where id = p_gift;
  return jsonb_build_object('card_id', g.card_id);
end;
$$;

-- Hides the note from the receiver for good and tells nobody else (kept for review).
create or replace function public.gift_report(p_gift uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  update lexica_gifts set reported_at = now() where id = p_gift and to_user = auth.uid();
  return jsonb_build_object('ok', true);
end;
$$;

-- ── Shields ─────────────────────────────────────────────────────────────

-- One shield a week per giver, to a buddy, for a day of that week that has already started.
create or replace function public.shield_give(p_to uuid, p_day date)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  wk date := date_trunc('week', p_day::timestamp)::date;
begin
  if me is null then raise exception 'not signed in'; end if;
  if not lexica_duel_is_buddy(me, p_to) then raise exception 'not buddies'; end if;
  if p_day > today or p_day < today - 6 then raise exception 'bad day'; end if;
  if exists (select 1 from lexica_shields where giver = me and week_start = wk) then raise exception 'shield used'; end if;
  insert into lexica_shields (giver, receiver, week_start, day) values (me, p_to, wk, p_day);
  return jsonb_build_object('ok', true);
end;
$$;

-- Shields from `p_from` on that were given to me or by me, or between my buddies and me.
create or replace function public.shields_team(p_from date)
returns jsonb language sql stable security definer set search_path = public as $$
  with team as (
    select auth.uid() as id
    union select user_b_id from buddy_pairs where user_a_id = auth.uid()
    union select user_a_id from buddy_pairs where user_b_id = auth.uid()
  )
  select coalesce(jsonb_agg(jsonb_build_object('giver', s.giver, 'giver_name', (select nickname from profiles p where p.id = s.giver), 'receiver', s.receiver, 'day', s.day)), '[]'::jsonb)
  from lexica_shields s where s.day >= p_from and s.giver in (select id from team) and s.receiver in (select id from team);
$$;

-- ── Study dates ─────────────────────────────────────────────────────────

create or replace function public.date_create(p_buddy uuid, p_at timestamptz)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  did uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  if not lexica_duel_is_buddy(me, p_buddy) then raise exception 'not buddies'; end if;
  if p_at < now() or p_at > now() + interval '7 days' then raise exception 'bad time'; end if;
  if (select count(*) from lexica_study_dates d where not d.canceled and d.at > now() - interval '2 hours'
        and ((d.creator = me and d.buddy = p_buddy) or (d.creator = p_buddy and d.buddy = me))) >= 3 then raise exception 'too many dates'; end if;
  insert into lexica_study_dates (creator, buddy, at) values (me, p_buddy, p_at) returning id into did;
  return jsonb_build_object('id', did);
end;
$$;

create or replace function public.date_list()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', d.id, 'at', d.at, 'mine', d.creator = auth.uid(),
      'with_id', case when d.creator = auth.uid() then d.buddy else d.creator end,
      'with_name', (select nickname from profiles p where p.id = case when d.creator = auth.uid() then d.buddy else d.creator end),
      'my_in', case when d.creator = auth.uid() then d.creator_in else d.buddy_in end,
      'their_in', case when d.creator = auth.uid() then d.buddy_in else d.creator_in end
    ) order by d.at), '[]'::jsonb)
  from lexica_study_dates d
  where not d.canceled and auth.uid() in (d.creator, d.buddy) and d.at > now() - interval '14 days';
$$;

-- "I'm studying": from 15 minutes before to 90 minutes after the time.
create or replace function public.date_checkin(p_date uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  d lexica_study_dates;
begin
  select * into d from lexica_study_dates where id = p_date and not canceled and auth.uid() in (creator, buddy);
  if d.id is null then raise exception 'no such date'; end if;
  if now() < d.at - interval '15 minutes' or now() > d.at + interval '90 minutes' then raise exception 'outside window'; end if;
  if d.creator = auth.uid() then update lexica_study_dates set creator_in = coalesce(creator_in, now()) where id = p_date;
  else update lexica_study_dates set buddy_in = coalesce(buddy_in, now()) where id = p_date; end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.date_cancel(p_date uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  update lexica_study_dates set canceled = true where id = p_date and auth.uid() in (creator, buddy);
  return jsonb_build_object('ok', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'buddy_words_set(date, jsonb)', 'buddy_prefs_set(boolean)', 'buddy_words_feed(date)',
    'gift_send(uuid, text, text)', 'gift_inbox()', 'gift_open(uuid)', 'gift_report(uuid)',
    'shield_give(uuid, date)', 'shields_team(date)',
    'date_create(uuid, timestamptz)', 'date_list()', 'date_checkin(uuid)', 'date_cancel(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
