-- Verified vocabulary scores (docs/LEXICA_LEVEL_TEST_DESIGN.md, PR C).
--
-- The same adaptive test as app/lib/placement/engine.ts, run by the
-- database: it picks each question, keeps the right answer to itself,
-- times every answer and scores the test. A finished test gets a short
-- public code: /score/<code> shows it to anyone.
--
-- Run this file, then supabase/placement_bank.sql (the question bank,
-- generated from the deck). Idempotent.

create table if not exists public.lexica_placement_bank (
  card_id text primary key,
  word text not null,
  meaning text not null,
  elo int not null,
  level text not null,
  -- a collocation with the word blanked as ___, when the card has one
  phrase text,
  -- the stored voice clip of the word (single words only)
  audio text
);

create table if not exists public.lexica_placement_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sound boolean not null default false,
  start_score int not null default 1000,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score int,
  sd int,
  level text,
  code text unique
);
create index if not exists lexica_placement_sessions_user_idx on public.lexica_placement_sessions (user_id, started_at desc);

create table if not exists public.lexica_placement_items (
  session_id uuid not null references public.lexica_placement_sessions(id) on delete cascade,
  n int not null,
  kind text not null check (kind in ('meaning', 'phrase', 'real', 'listen')),
  card_id text,
  prompt text not null,
  options jsonb not null,
  answer int not null,
  difficulty int,
  guess real not null,
  asked_at timestamptz not null default now(),
  answered_at timestamptz,
  response text check (response in ('right', 'wrong', 'skip')),
  primary key (session_id, n)
);

alter table public.lexica_placement_bank enable row level security;
alter table public.lexica_placement_sessions enable row level security;
alter table public.lexica_placement_items enable row level security;

-- ---------------------------------------------------------------- scoring

-- Mean and spread of the level from a session's answers: a Rasch model with
-- a guessing floor, on a grid, prior around the start score (as engine.ts).
create or replace function public.lexica_pl_estimate(p_session uuid, out score int, out sd int)
language plpgsql stable security definer set search_path = public as $$
declare
  start_score int;
  diffs int[];
  guesses real[];
  answers text[];
  a int;
  i int;
  p float8;
  ll float8;
  lls float8[] := '{}';
  grid int[] := '{}';
  top float8;
  w float8;
  total float8 := 0;
  mean float8 := 0;
  sq float8 := 0;
begin
  select s.start_score into start_score from lexica_placement_sessions s where s.id = p_session;
  select coalesce(array_agg(difficulty order by n), '{}'), coalesce(array_agg(guess order by n), '{}'), coalesce(array_agg(response order by n), '{}')
    into diffs, guesses, answers
    from lexica_placement_items where session_id = p_session and difficulty is not null and response is not null;
  a := 650;
  while a <= 1650 loop
    ll := -((a - start_score)::float8 ^ 2) / (2 * 400.0 ^ 2);
    for i in 1 .. coalesce(array_length(diffs, 1), 0) loop
      p := 1 / (1 + 10 ^ ((diffs[i] - a) / 400.0));
      ll := ll + ln(greatest(1e-9, case answers[i]
        when 'skip' then 1 - p
        when 'right' then guesses[i] + (1 - guesses[i]) * p
        else (1 - guesses[i]) * (1 - p) end));
    end loop;
    grid := grid || a;
    lls := lls || ll;
    a := a + 5;
  end loop;
  select max(x) into top from unnest(lls) x;
  for i in 1 .. array_length(grid, 1) loop
    w := exp(lls[i] - top);
    total := total + w;
    mean := mean + w * grid[i];
    sq := sq + w * grid[i] * grid[i];
  end loop;
  mean := mean / total;
  score := round(mean);
  sd := round(sqrt(greatest(0, sq / total - mean * mean)));
end;
$$;

-- What the learner sees of an item: never the answer, never the spoken word.
create or replace function public.lexica_pl_view(it lexica_placement_items)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'n', it.n,
    'kind', it.kind,
    'prompt', case when it.kind = 'listen' then null else it.prompt end,
    'audio', case when it.kind = 'listen' then (select audio from lexica_placement_bank where card_id = it.card_id) else null end,
    'options', it.options,
    'seconds', 20
  );
$$;

-- Picks and stores the next question near the current estimate.
create or replace function public.lexica_pl_next(p_session uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s lexica_placement_sessions;
  n int;
  kinds text[];
  kind text;
  target int;
  fakes text[] := array['flendid','proctave','mivorous','scrandle','bluthery','tremulate','ganderly','plosiveness','cromptious','vintory',
    'sulberate','drimble','ostrify','quandish','perlocate','frostive','menticule','abrontic','glimper','reboundful',
    'carvulous','snerdish','implacent','wobbish','dextrify','trelling','obvolent','farcile','harbinate','clemptory'];
  fake text;
  c lexica_placement_bank;
  right_option text;
  wrong text[];
  opts text[];
  it lexica_placement_items;
begin
  select * into s from lexica_placement_sessions where id = p_session;
  select count(*) into n from lexica_placement_items where session_id = p_session;
  kinds := case when s.sound then array['meaning','listen','phrase','real','meaning','listen'] else array['meaning','phrase','meaning','real'] end;
  kind := kinds[(n % array_length(kinds, 1)) + 1];
  target := (lexica_pl_estimate(p_session)).score;

  if kind = 'real' and random() < 1.0 / 3 then
    select f into fake from unnest(fakes) f
      where f not in (select prompt from lexica_placement_items where session_id = p_session and card_id is null)
      order by random() limit 1;
    if fake is not null then
      insert into lexica_placement_items (session_id, n, kind, card_id, prompt, options, answer, difficulty, guess)
        values (p_session, n + 1, 'real', null, fake, '["Có, là từ tiếng Anh","Không, từ bịa"]', 1, null, 0.5)
        returning * into it;
      return lexica_pl_view(it);
    end if;
  end if;

  -- One of the four unasked cards nearest the estimate that suit the kind.
  select * into c from (
    select * from lexica_placement_bank b
     where b.card_id not in (select coalesce(card_id, '') from lexica_placement_items where session_id = p_session)
       and (kind <> 'phrase' or b.phrase is not null)
       and (kind <> 'listen' or b.audio is not null)
     order by abs(b.elo - target) limit 4
  ) near order by random() limit 1;
  if c.card_id is null then
    kind := 'meaning';
    select * into c from lexica_placement_bank b
     where b.card_id not in (select coalesce(card_id, '') from lexica_placement_items where session_id = p_session)
     order by abs(b.elo - target) limit 1;
  end if;

  if kind = 'real' then
    insert into lexica_placement_items (session_id, n, kind, card_id, prompt, options, answer, difficulty, guess)
      values (p_session, n + 1, 'real', c.card_id, c.word, '["Có, là từ tiếng Anh","Không, từ bịa"]', 0, c.elo - 100, 0.5)
      returning * into it;
    return lexica_pl_view(it);
  end if;

  -- Three wrong options from cards near the same difficulty: meanings, or words.
  if kind = 'meaning' then
    right_option := c.meaning;
    select array_agg(v) into wrong from (
      select v from (
        select distinct on (lower(b.meaning)) b.meaning as v, abs(b.elo - c.elo) as d
          from lexica_placement_bank b
         where b.card_id <> c.card_id and lower(b.meaning) <> lower(c.meaning)
           and (position(' ' in b.word) > 0) = (position(' ' in c.word) > 0)
         order by lower(b.meaning), abs(b.elo - c.elo)
      ) x order by d limit 24
    ) y order by random() limit 3;
  else
    right_option := c.word;
    select array_agg(v) into wrong from (
      select v from (
        select distinct on (b.word) b.word as v, abs(b.elo - c.elo) as d
          from lexica_placement_bank b
         where b.card_id <> c.card_id and b.word <> c.word
           and (position(' ' in b.word) > 0) = (position(' ' in c.word) > 0)
         order by b.word, abs(b.elo - c.elo)
      ) x order by d limit 24
    ) y order by random() limit 3;
  end if;
  select array_agg(o order by random()) into opts from unnest(array[right_option] || wrong) o;

  insert into lexica_placement_items (session_id, n, kind, card_id, prompt, options, answer, difficulty, guess)
    values (p_session, n + 1, kind, c.card_id,
            case kind when 'phrase' then c.phrase else c.word end,
            to_jsonb(opts), array_position(opts, right_option) - 1,
            case kind when 'meaning' then c.elo else c.elo + 50 end, 0.25)
    returning * into it;
  return lexica_pl_view(it);
end;
$$;

-- ---------------------------------------------------------------- the API

-- Starts a verified test. A new score counts 14 days after the last one;
-- at most 5 starts a day, so a bad run cannot be restarted until lucky.
create or replace function public.lexica_placement_start(p_sound boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  last_done lexica_placement_sessions;
  sid uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into last_done from lexica_placement_sessions
   where user_id = uid and score is not null order by finished_at desc limit 1;
  if last_done.id is not null and last_done.finished_at > now() - interval '14 days' then
    raise exception 'too soon: %', ceil(extract(epoch from (last_done.finished_at + interval '14 days' - now())) / 86400);
  end if;
  if (select count(*) from lexica_placement_sessions where user_id = uid and started_at > now() - interval '1 day') >= 5 then
    raise exception 'too many tries';
  end if;
  -- An unfinished test is given up.
  update lexica_placement_sessions set finished_at = now() where user_id = uid and finished_at is null;
  insert into lexica_placement_sessions (user_id, sound, start_score)
    values (uid, coalesce(p_sound, false), coalesce(last_done.score, 1000))
    returning id into sid;
  return jsonb_build_object('session', sid, 'item', lexica_pl_next(sid));
end;
$$;

-- Answers the open question (p_choice = option index, null = "không biết").
-- Late answers (over 25 seconds) count as "không biết". Returns the right
-- option of this question, then the next question or the result.
create or replace function public.lexica_placement_answer(p_session uuid, p_choice int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s lexica_placement_sessions;
  it lexica_placement_items;
  resp text;
  scored int;
  total int;
  est record;
  lvl text;
  the_code text;
  by_kind jsonb;
  fakes jsonb;
begin
  select * into s from lexica_placement_sessions where id = p_session and user_id = uid and finished_at is null;
  if s.id is null then raise exception 'no open test'; end if;
  select * into it from lexica_placement_items where session_id = p_session and response is null order by n desc limit 1;
  if it.n is null then raise exception 'no open question'; end if;

  resp := case
    when p_choice is null or now() - it.asked_at > interval '25 seconds' then 'skip'
    when p_choice = it.answer then 'right'
    else 'wrong' end;
  update lexica_placement_items set response = resp, answered_at = now() where session_id = p_session and n = it.n;

  select count(*) filter (where difficulty is not null), count(*) into scored, total
    from lexica_placement_items where session_id = p_session and response is not null;
  select * into est from lexica_pl_estimate(p_session);

  if not (scored >= 30 or total >= 45 or (scored >= 15 and est.sd <= 80)) then
    return jsonb_build_object('done', false, 'answer', it.answer, 'response', resp, 'item', lexica_pl_next(p_session));
  end if;

  est.score := least(1500, greatest(800, est.score));
  lvl := case when est.score < 950 then 'beginner' when est.score < 1150 then 'intermediate' when est.score < 1350 then 'advanced' else 'expert' end;
  loop
    the_code := substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    exit when length(the_code) = 8 and not exists (select 1 from lexica_placement_sessions where code = the_code);
  end loop;
  update lexica_placement_sessions
     set finished_at = now(), score = est.score, sd = est.sd, level = lvl, code = the_code
   where id = p_session;

  select coalesce(jsonb_object_agg(kind, jsonb_build_object('right', r, 'total', t)), '{}') into by_kind from (
    select kind, count(*) filter (where response = 'right') as r, count(*) as t
      from lexica_placement_items where session_id = p_session and card_id is not null group by kind
  ) k;
  select jsonb_build_object('yes', count(*) filter (where response = 'wrong'), 'total', count(*)) into fakes
    from lexica_placement_items where session_id = p_session and card_id is null;

  return jsonb_build_object('done', true, 'answer', it.answer, 'response', resp,
    'result', jsonb_build_object('score', est.score, 'sd', est.sd, 'level', lvl, 'code', the_code,
      'byKind', by_kind, 'fakes', fakes, 'questions', total, 'at', now()));
end;
$$;

-- A verified score by its public code, for /score/<code>. Only the score: no name, no answers.
create or replace function public.lexica_score_public(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('score', score, 'sd', sd, 'level', level, 'at', finished_at, 'sound', sound)
    from lexica_placement_sessions where code = p_code and score is not null;
$$;

-- The signed-in learner's verified scores, oldest first.
create or replace function public.lexica_my_scores()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('score', score, 'sd', sd, 'level', level, 'at', finished_at, 'code', code) order by finished_at), '[]')
    from lexica_placement_sessions where user_id = auth.uid() and score is not null;
$$;

-- For a class's teacher (teach app): each student's last verified score and
-- the one before, read from the server's own tests, not from what the app
-- reports. Needs packages/classroom/sql/classroom_core.sql.
create or replace function public.lexica_class_scores(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not your class'; end if;
  return coalesce((
    select jsonb_object_agg(m.user_id, jsonb_build_object('score', t.score, 'sd', t.sd, 'level', t.level, 'at', t.finished_at, 'code', t.code, 'previous', t.previous))
      from cortex_class_members m
      join lateral (
        select s.score, s.sd, s.level, s.finished_at, s.code,
               lead(s.score) over (order by s.finished_at desc) as previous
          from lexica_placement_sessions s
         where s.user_id = m.user_id and s.score is not null
         order by s.finished_at desc limit 1
      ) t on true
     where m.class_id = p_class
  ), '{}'::jsonb);
end;
$$;

-- A class's verified scores over time, for the end-of-course forecast in Teach
-- (packages/classroom-lexica/forecast.ts): per student the last 10 tests of 180 days.
create or replace function public.lexica_class_score_history(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not your class'; end if;
  return coalesce((
    select jsonb_object_agg(m.user_id, t.tests)
      from cortex_class_members m
      join lateral (
        select jsonb_agg(jsonb_build_object('score', x.score, 'sd', x.sd, 'at', x.finished_at) order by x.finished_at) as tests
          from (
            select s.score, s.sd, s.finished_at from lexica_placement_sessions s
             where s.user_id = m.user_id and s.score is not null and s.finished_at > now() - interval '180 days'
             order by s.finished_at desc limit 10
          ) x
      ) t on t.tests is not null
     where m.class_id = p_class
  ), '{}'::jsonb);
end;
$$;

revoke all on function public.lexica_pl_estimate(uuid) from public, anon, authenticated;
revoke all on function public.lexica_pl_view(lexica_placement_items) from public, anon, authenticated;
revoke all on function public.lexica_pl_next(uuid) from public, anon, authenticated;
revoke all on function public.lexica_placement_start(boolean) from public, anon;
revoke all on function public.lexica_placement_answer(uuid, int) from public, anon;
revoke all on function public.lexica_my_scores() from public, anon;
revoke all on function public.lexica_class_scores(uuid) from public, anon;
grant execute on function public.lexica_placement_start(boolean) to authenticated;
grant execute on function public.lexica_placement_answer(uuid, int) to authenticated;
grant execute on function public.lexica_my_scores() to authenticated;
grant execute on function public.lexica_class_scores(uuid) to authenticated;
revoke all on function public.lexica_class_score_history(uuid) from public, anon;
grant execute on function public.lexica_class_score_history(uuid) to authenticated;
grant execute on function public.lexica_score_public(text) to anon, authenticated;
