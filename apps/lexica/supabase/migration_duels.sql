-- Word duels between study buddies (Lexica Buddy, issue #70, direction B).
-- Runs after migration_study_buddy.sql and, for the question check, after
-- packages/classroom/sql/classroom_arena.sql. Safe to re-run.
--
-- One buddy challenges another with 5–10 questions built from words the
-- challenger knows. Both play the same questions, each in their own time:
-- the challenger straight after creating it, the buddy within 48 hours.
-- The server keeps the answers: a player sees a question's right answer
-- only after finishing the duel, and results are counted here. Only buddies
-- (a row in buddy_pairs) can duel, at most 3 open duels per pair.
-- Every read and write goes through the functions below; the tables have
-- RLS on and no policies.

create table if not exists lexica_duels (
  id uuid primary key default gen_random_uuid(),
  challenger uuid not null references auth.users(id) on delete cascade,
  opponent uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours',
  check (challenger <> opponent)
);
create index if not exists lexica_duels_challenger_idx on lexica_duels (challenger, created_at desc);
create index if not exists lexica_duels_opponent_idx on lexica_duels (opponent, created_at desc);

create table if not exists lexica_duel_questions (
  duel_id uuid not null references lexica_duels(id) on delete cascade,
  idx int not null,
  card_id text,
  kind text not null,
  prompt text not null,
  options jsonb not null,
  answer int not null,
  primary key (duel_id, idx)
);

create table if not exists lexica_duel_answers (
  duel_id uuid not null references lexica_duels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idx int not null,
  choice int not null,
  correct boolean not null,
  ms int not null check (ms between 0 and 120000),
  primary key (duel_id, user_id, idx)
);

-- A player's finish: all questions answered (or time ran out for the rest).
create table if not exists lexica_duel_finishes (
  duel_id uuid not null references lexica_duels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  finished_at timestamptz not null default now(),
  correct int not null,
  ms int not null,
  primary key (duel_id, user_id)
);

alter table lexica_duels enable row level security;
alter table lexica_duel_questions enable row level security;
alter table lexica_duel_answers enable row level security;
alter table lexica_duel_finishes enable row level security;

-- ── helpers ─────────────────────────────────────────────────────────────

create or replace function public.lexica_duel_is_buddy(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from buddy_pairs where (user_a_id = a and user_b_id = b) or (user_a_id = b and user_b_id = a));
$$;

-- The duel, for one of its two players.
create or replace function public.lexica_duel_of(p_duel uuid)
returns lexica_duels language plpgsql stable security definer set search_path = public as $$
declare
  d lexica_duels;
begin
  select * into d from lexica_duels where id = p_duel;
  if d.id is null or auth.uid() is null or auth.uid() not in (d.challenger, d.opponent) then raise exception 'no such duel'; end if;
  return d;
end;
$$;

-- State of a duel for a viewer: waiting (the opponent has not finished, time left), expired, or done.
create or replace function public.lexica_duel_state(d lexica_duels)
returns text language sql stable security definer set search_path = public as $$
  select case
    when (select count(*) from lexica_duel_finishes f where f.duel_id = d.id) >= 2 then 'done'
    when d.expires_at < now() then 'expired'
    else 'open' end;
$$;

-- ── calls ───────────────────────────────────────────────────────────────

-- A buddy challenges another: 5–10 questions (same checks as the class quiz). The challenger then plays.
create or replace function public.duel_create(p_opponent uuid, p_questions jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  qs jsonb;
  did uuid;
begin
  if me is null then raise exception 'not signed in'; end if;
  if not lexica_duel_is_buddy(me, p_opponent) then raise exception 'not buddies'; end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) not between 5 and 10 then raise exception 'bad questions'; end if;
  -- 3 and 30 are the class quiz's limits; this keeps to 5–10
  qs := cortex_arena_clean_questions(p_questions);
  if (select count(*) from lexica_duels d
       where ((d.challenger = me and d.opponent = p_opponent) or (d.challenger = p_opponent and d.opponent = me))
         and lexica_duel_state(d) = 'open') >= 3 then
    raise exception 'too many duels';
  end if;
  insert into lexica_duels (challenger, opponent) values (me, p_opponent) returning id into did;
  insert into lexica_duel_questions (duel_id, idx, card_id, kind, prompt, options, answer)
  select did, (o - 1)::int, q->>'card_id', q->>'kind', q->>'prompt', q->'options', (q->>'answer')::int
  from jsonb_array_elements(qs) with ordinality as t(q, o);
  return jsonb_build_object('id', did);
end;
$$;

-- Your duels: waiting for you, waiting for your buddy, and finished in the last 14 days; names from profiles.
create or replace function public.duel_inbox()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(row order by (row->>'created_at') desc), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', d.id,
      'created_at', d.created_at,
      'expires_at', d.expires_at,
      'mine', d.challenger = auth.uid(),
      'with_id', case when d.challenger = auth.uid() then d.opponent else d.challenger end,
      'with_name', (select nickname from profiles p where p.id = case when d.challenger = auth.uid() then d.opponent else d.challenger end),
      'state', lexica_duel_state(d),
      'total', (select count(*) from lexica_duel_questions q where q.duel_id = d.id),
      'i_finished', exists (select 1 from lexica_duel_finishes f where f.duel_id = d.id and f.user_id = auth.uid()),
      'their_finished', exists (select 1 from lexica_duel_finishes f where f.duel_id = d.id and f.user_id <> auth.uid()),
      'my_correct', (select f.correct from lexica_duel_finishes f where f.duel_id = d.id and f.user_id = auth.uid()),
      -- the other's score only once both finished
      'their_correct', (select f.correct from lexica_duel_finishes f where f.duel_id = d.id and f.user_id <> auth.uid()
                          and exists (select 1 from lexica_duel_finishes g where g.duel_id = d.id and g.user_id = auth.uid()))
    ) as row
    from lexica_duels d
    where auth.uid() in (d.challenger, d.opponent) and d.created_at > now() - interval '14 days'
  ) x;
$$;

-- Open a duel to play: the questions without answers (a finished player also gets them, with their own choice and the right answer).
create or replace function public.duel_take(p_duel uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  d lexica_duels := lexica_duel_of(p_duel);
  me uuid := auth.uid();
  mine_done boolean := exists (select 1 from lexica_duel_finishes where duel_id = p_duel and user_id = me);
begin
  if lexica_duel_state(d) = 'expired' and not mine_done and me <> d.challenger then raise exception 'duel expired'; end if;
  return jsonb_build_object(
    'id', d.id, 'state', lexica_duel_state(d), 'expires_at', d.expires_at, 'mine', d.challenger = me,
    'with_name', (select nickname from profiles p where p.id = case when d.challenger = me then d.opponent else d.challenger end),
    'finished', mine_done,
    'questions', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'idx', q.idx, 'card_id', q.card_id, 'kind', q.kind, 'prompt', q.prompt, 'options', q.options,
        'answer', case when mine_done then q.answer end,
        'choice', (select a.choice from lexica_duel_answers a where a.duel_id = p_duel and a.user_id = me and a.idx = q.idx)
      )) order by q.idx)
      from lexica_duel_questions q where q.duel_id = p_duel
    ), '[]'::jsonb)
  );
end;
$$;

-- One answer (the first counts). `p_ms`: how long the player took, measured on their device.
create or replace function public.duel_answer(p_duel uuid, p_idx int, p_choice int, p_ms int)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  d lexica_duels := lexica_duel_of(p_duel);
  me uuid := auth.uid();
  q lexica_duel_questions;
begin
  if exists (select 1 from lexica_duel_finishes where duel_id = p_duel and user_id = me) then raise exception 'already finished'; end if;
  if me <> d.challenger and d.expires_at < now() then raise exception 'duel expired'; end if;
  select * into q from lexica_duel_questions where duel_id = p_duel and idx = p_idx;
  if q.idx is null or p_choice is null or p_choice < 0 or p_choice >= jsonb_array_length(q.options) then raise exception 'bad answer'; end if;
  insert into lexica_duel_answers (duel_id, user_id, idx, choice, correct, ms)
  values (p_duel, me, p_idx, p_choice, p_choice = q.answer, least(greatest(coalesce(p_ms, 0), 0), 120000))
  on conflict do nothing;
  return jsonb_build_object('received', true);
end;
$$;

-- Hand in: unanswered questions are wrong. Returns the same as duel_result.
create or replace function public.duel_finish(p_duel uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  d lexica_duels := lexica_duel_of(p_duel);
  me uuid := auth.uid();
begin
  if not exists (select 1 from lexica_duel_finishes where duel_id = p_duel and user_id = me) then
    insert into lexica_duel_finishes (duel_id, user_id, correct, ms)
    select p_duel, me, count(*) filter (where a.correct)::int, coalesce(sum(a.ms), 0)::int
      from lexica_duel_answers a where a.duel_id = p_duel and a.user_id = me;
  end if;
  return duel_result(p_duel);
end;
$$;

-- Result for a player who finished: own score and answers with the right answers; the other's score and answers only
-- once both finished. Who won: more correct, then less total time; a tie stays a tie.
create or replace function public.duel_result(p_duel uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  d lexica_duels := lexica_duel_of(p_duel);
  me uuid := auth.uid();
  other uuid := case when d.challenger = auth.uid() then d.opponent else d.challenger end;
  mine lexica_duel_finishes;
  theirs lexica_duel_finishes;
  both_done boolean;
begin
  select * into mine from lexica_duel_finishes where duel_id = p_duel and user_id = me;
  if mine.user_id is null then raise exception 'not finished'; end if;
  select * into theirs from lexica_duel_finishes where duel_id = p_duel and user_id = other;
  both_done := theirs.user_id is not null;
  return jsonb_build_object(
    'id', d.id, 'state', lexica_duel_state(d),
    'with_name', (select nickname from profiles p where p.id = other),
    'total', (select count(*) from lexica_duel_questions q where q.duel_id = p_duel),
    'mine', jsonb_build_object('correct', mine.correct, 'ms', mine.ms),
    'theirs', case when both_done then jsonb_build_object('correct', theirs.correct, 'ms', theirs.ms) end,
    'winner', case when not both_done then null
                   when mine.correct > theirs.correct or (mine.correct = theirs.correct and mine.ms < theirs.ms) then 'me'
                   when mine.correct < theirs.correct or (mine.correct = theirs.correct and mine.ms > theirs.ms) then 'them'
                   else 'tie' end,
    'questions', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'idx', q.idx, 'card_id', q.card_id, 'prompt', q.prompt, 'options', q.options, 'answer', q.answer,
        'mine', (select a.choice from lexica_duel_answers a where a.duel_id = p_duel and a.user_id = me and a.idx = q.idx),
        'theirs', case when both_done then (select a.choice from lexica_duel_answers a where a.duel_id = p_duel and a.user_id = other and a.idx = q.idx) end
      )) order by q.idx)
      from lexica_duel_questions q where q.duel_id = p_duel
    ), '[]'::jsonb)
  );
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['duel_create(uuid, jsonb)', 'duel_inbox()', 'duel_take(uuid)', 'duel_answer(uuid, int, int, int)', 'duel_finish(uuid)', 'duel_result(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  foreach f in array array['lexica_duel_is_buddy(uuid, uuid)', 'lexica_duel_of(uuid)', 'lexica_duel_state(lexica_duels)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
