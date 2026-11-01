-- Synapse progress on the Cortex account (docs/SYNAPSE_PLAN.md S2). Safe to re-run.
--
-- The player signs in with their Cortex account (the same Supabase user as
-- Lexica). Their phrases, the missions they cleared, the endings they saw and
-- each finished run live here, so a phrase missed today can come back in the
-- next play on any device. RLS is on with no policies: every read and write
-- goes through the functions below and only touches the caller's own rows.

create table if not exists synapse_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  setting text not null default 'auto' check (setting in ('auto', 'learn', 'recall', 'use')),
  auto_level text not null default 'learn' check (auto_level in ('learn', 'recall', 'use')),
  recent jsonb not null default '[]'::jsonb,
  seen_scenes jsonb not null default '[]'::jsonb,
  cleared jsonb not null default '[]'::jsonb,
  endings jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists synapse_phrase_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  phrase text not null check (char_length(phrase) between 1 and 80),
  seen int not null default 0 check (seen >= 0),
  "right" int not null default 0 check ("right" >= 0),
  last jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, phrase)
);

create table if not exists synapse_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null check (char_length(mission_id) between 1 and 40),
  tier text not null check (tier in ('gold', 'silver', 'bronze', 'fail')),
  score int not null default 0,
  lives int not null default 0 check (lives between 0 and 3),
  at timestamptz not null default now()
);
create index if not exists synapse_runs_user_idx on synapse_runs (user_id, at desc);

alter table synapse_profile enable row level security;
alter table synapse_phrase_state enable row level security;
alter table synapse_runs enable row level security;

-- A short list of short strings, or nothing: what the profile columns may hold.
create or replace function public.synapse_clean_list(p jsonb, p_max int)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(left(x, 60)) filter (where x <> ''), '[]'::jsonb)
  from (select x from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality t(x, o) order by o limit p_max) s;
$$;

-- The same for a list of true/false (the latest answers).
create or replace function public.synapse_clean_bools(p jsonb, p_max int)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(x::boolean), '[]'::jsonb)
  from (select x from jsonb_array_elements_text(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) with ordinality t(x, o) where x in ('true', 'false') order by o limit p_max) s;
$$;

-- Everything of mine: the profile and the phrase records.
create or replace function public.synapse_load()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  pr synapse_profile;
begin
  if me is null then raise exception 'not signed in'; end if;
  select * into pr from synapse_profile where user_id = me;
  return jsonb_build_object(
    'profile', case when pr.user_id is null then null else jsonb_build_object(
      'setting', pr.setting, 'auto', pr.auto_level, 'recent', pr.recent, 'seenScenes', pr.seen_scenes, 'cleared', pr.cleared, 'endings', pr.endings) end,
    'phrases', coalesce((select jsonb_object_agg(phrase, jsonb_build_object('seen', seen, 'right', "right", 'last', last)) from synapse_phrase_state where user_id = me), '{}'::jsonb)
  );
end;
$$;

-- Saves the profile and the phrase records the device holds (the device merged them with what it loaded first).
create or replace function public.synapse_save(p_profile jsonb, p_phrases jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  k text;
  v jsonb;
  n int := 0;
begin
  if me is null then raise exception 'not signed in'; end if;
  if jsonb_typeof(p_profile) <> 'object' or jsonb_typeof(p_phrases) <> 'object' then raise exception 'bad progress'; end if;
  insert into synapse_profile (user_id, setting, auto_level, recent, seen_scenes, cleared, endings)
  values (
    me,
    case when p_profile->>'setting' in ('auto', 'learn', 'recall', 'use') then p_profile->>'setting' else 'auto' end,
    case when p_profile->>'auto' in ('learn', 'recall', 'use') then p_profile->>'auto' else 'learn' end,
    synapse_clean_bools(p_profile->'recent', 10), synapse_clean_list(p_profile->'seenScenes', 200),
    synapse_clean_list(p_profile->'cleared', 60), synapse_clean_list(p_profile->'endings', 400))
  on conflict (user_id) do update set setting = excluded.setting, auto_level = excluded.auto_level, recent = excluded.recent,
    seen_scenes = excluded.seen_scenes, cleared = excluded.cleared, endings = excluded.endings, updated_at = now();
  for k, v in select * from jsonb_each(p_phrases) loop
    n := n + 1;
    if n > 600 then raise exception 'too many phrases'; end if;
    if char_length(k) not between 1 and 80 or jsonb_typeof(v) <> 'object' then continue; end if;
    insert into synapse_phrase_state (user_id, phrase, seen, "right", last)
    values (me, k, greatest(0, least(coalesce((v->>'seen')::int, 0), 100000)), greatest(0, least(coalesce((v->>'right')::int, 0), 100000)),
      synapse_clean_bools(v->'last', 3))
    on conflict (user_id, phrase) do update set seen = excluded.seen, "right" = excluded."right", last = excluded.last, updated_at = now();
  end loop;
  return jsonb_build_object('ok', true);
end;
$$;

-- A finished run (mission cleared or out of lives). At most 300 a day: a ceiling, not a limit anyone meets.
create or replace function public.synapse_run_add(p_mission text, p_tier text, p_score int, p_lives int)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  if (select count(*) from synapse_runs where user_id = me and at > now() - interval '24 hours') >= 300 then raise exception 'too many runs'; end if;
  insert into synapse_runs (user_id, mission_id, tier, score, lives)
  values (me, left(coalesce(p_mission, ''), 40), p_tier, greatest(least(coalesce(p_score, 0), 100000), -100000), greatest(0, least(coalesce(p_lives, 0), 3)));
  return jsonb_build_object('ok', true);
end;
$$;

-- The phrases I have got right at least once, for Lexica to offer as review cards.
create or replace function public.synapse_unlocked()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(phrase order by updated_at desc), '[]'::jsonb) from synapse_phrase_state where user_id = auth.uid() and "right" > 0;
$$;

do $$
declare f text;
begin
  foreach f in array array['synapse_load()', 'synapse_save(jsonb, jsonb)', 'synapse_run_add(text, text, int, int)', 'synapse_unlocked()'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.synapse_clean_list(jsonb, int) from public, anon, authenticated;
  revoke all on function public.synapse_clean_bools(jsonb, int) from public, anon, authenticated;
end $$;

notify pgrst, 'reload schema';
