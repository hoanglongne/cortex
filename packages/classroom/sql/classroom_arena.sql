-- "Đấu trường từ vựng" (docs/TEACH_PLAN.md, section 4, T2a): a live quiz the
-- teacher runs on the projector, students answer on their phones in Lexica.
-- Runs after classroom_core.sql. Safe to re-run.
--
-- The server is the referee: questions and answers sit in tables only these
-- functions read; a student gets a question without its answer until the
-- teacher locks it; answers are timed and scored by the server's clock, and
-- refused once the time is up or the question is locked. The teacher's screen
-- drives the room (open, next question, lock, finish); Supabase Realtime only
-- carries "something changed" signals, never answers.
--
-- Rooms: one live room per class (opening a new one finishes the old), a
-- 6-digit code, 3 to 30 questions, 10 to 60 seconds each. Players are the
-- class's students. Every read and write goes through the functions below;
-- the tables have RLS on and no policies.

create table if not exists cortex_arena_rooms (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references cortex_classes(id) on delete cascade,
  code text not null check (code ~ '^[0-9]{6}$'),
  host uuid references auth.users(id) on delete set null,
  mode text not null default 'classic' check (mode in ('classic')),
  seconds int not null check (seconds between 10 and 60),
  -- Only the top 3 by name on the projector; the rest see their own rank on their phone
  hide_names boolean not null default true,
  state text not null default 'lobby' check (state in ('lobby', 'question', 'reveal', 'finished')),
  q_index int not null default -1,
  q_opened_at timestamptz,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
-- A code is unique among rooms still running
create unique index if not exists cortex_arena_rooms_code_idx on cortex_arena_rooms (code) where state <> 'finished';
create index if not exists cortex_arena_rooms_class_idx on cortex_arena_rooms (class_id, created_at desc);

create table if not exists cortex_arena_questions (
  room_id uuid not null references cortex_arena_rooms(id) on delete cascade,
  idx int not null,
  card_id text,
  kind text not null,
  prompt text not null,
  options jsonb not null,
  answer int not null,
  primary key (room_id, idx)
);

create table if not exists cortex_arena_players (
  room_id uuid not null references cortex_arena_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  score int not null default 0,
  streak int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists cortex_arena_answers (
  room_id uuid not null references cortex_arena_rooms(id) on delete cascade,
  idx int not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  choice int not null,
  correct boolean not null,
  ms int not null,
  points int not null,
  at timestamptz not null default now(),
  primary key (room_id, idx, user_id)
);

alter table cortex_arena_rooms enable row level security;
alter table cortex_arena_questions enable row level security;
alter table cortex_arena_players enable row level security;
alter table cortex_arena_answers enable row level security;

-- ── helpers ─────────────────────────────────────────────────────────────

-- Late answers: a little grace for the network, on top of the question's time.
create or replace function public.cortex_arena_grace()
returns interval language sql immutable as $$ select interval '1500 milliseconds' $$;

-- Points for a right answer: 1000 at once, down to 500 at the last second,
-- plus 50 for each right answer in a row before it (up to 200). Wrong: 0.
create or replace function public.cortex_arena_points(p_correct boolean, p_ms int, p_seconds int, p_streak int)
returns int language sql immutable as $$
  select case when not p_correct then 0
    else round(1000 * (1 - 0.5 * least(greatest(p_ms, 0), p_seconds * 1000)::numeric / (p_seconds * 1000)))::int + 50 * least(greatest(p_streak, 0), 4)
  end;
$$;

-- The room's ranking: score, then who joined first. `rank` starts at 1; ties share it.
create or replace function public.cortex_arena_ranking(p_room uuid)
returns table (user_id uuid, name text, score int, rank int) language sql stable as $$
  select p.user_id, p.name, p.score, (rank() over (order by p.score desc))::int
  from cortex_arena_players p where p.room_id = p_room
  order by p.score desc, p.joined_at;
$$;

-- Questions a teacher sends: 3–30 objects {card_id?, kind, prompt, options[2..4], answer}. Bad ones are refused.
create or replace function public.cortex_arena_clean_questions(p jsonb)
returns jsonb language plpgsql immutable as $$
declare
  out jsonb := '[]'::jsonb;
  q jsonb;
  opts jsonb;
  n int;
begin
  if jsonb_typeof(p) <> 'array' or jsonb_array_length(p) < 3 or jsonb_array_length(p) > 30 then raise exception 'bad questions'; end if;
  for q in select * from jsonb_array_elements(p) loop
    if jsonb_typeof(q) <> 'object' or jsonb_typeof(q->'options') <> 'array' or jsonb_typeof(q->'answer') <> 'number' then raise exception 'bad questions'; end if;
    select jsonb_agg(left(trim(o), 80)) into opts from jsonb_array_elements_text(q->'options') o;
    n := coalesce(jsonb_array_length(opts), 0);
    if n < 2 or n > 4 or (select count(distinct lower(x)) from jsonb_array_elements_text(opts) x where x <> '') <> n then raise exception 'bad questions'; end if;
    if (q->>'answer')::numeric <> floor((q->>'answer')::numeric) or (q->>'answer')::int not between 0 and n - 1 then raise exception 'bad questions'; end if;
    if coalesce(trim(q->>'prompt'), '') = '' then raise exception 'bad questions'; end if;
    out := out || jsonb_build_array(jsonb_build_object(
      'card_id', left(q->>'card_id', 64),
      'kind', left(coalesce(q->>'kind', 'meaning'), 20),
      'prompt', left(trim(q->>'prompt'), 200),
      'options', opts,
      'answer', (q->>'answer')::int
    ));
  end loop;
  return out;
end;
$$;

create or replace function public.cortex_arena_room_teach(p_room uuid)
returns cortex_arena_rooms language plpgsql stable security definer set search_path = public as $$
declare
  r cortex_arena_rooms;
begin
  select * into r from cortex_arena_rooms where id = p_room;
  if r.id is null then raise exception 'no such room'; end if;
  if not classroom_can_teach(r.class_id) then raise exception 'not the teacher'; end if;
  return r;
end;
$$;

-- ── teacher ─────────────────────────────────────────────────────────────

-- Open a room for the class with these questions; a room still running in the class is finished first.
create or replace function public.arena_open(p_class uuid, p_seconds int, p_questions jsonb, p_hide_names boolean default true)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  qs jsonb;
  c text;
  rid uuid;
  b bytea;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  qs := cortex_arena_clean_questions(p_questions);
  update cortex_arena_rooms set state = 'finished', finished_at = now() where class_id = p_class and state <> 'finished';
  loop
    b := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    c := lpad((((get_byte(b, 0) * 65536 + get_byte(b, 1) * 256 + get_byte(b, 2)) % 900000) + 100000)::text, 6, '0');
    exit when not exists (select 1 from cortex_arena_rooms where code = c and state <> 'finished');
  end loop;
  insert into cortex_arena_rooms (class_id, code, host, seconds, hide_names)
  values (p_class, c, auth.uid(), least(greatest(coalesce(p_seconds, 20), 10), 60), coalesce(p_hide_names, true))
  returning id into rid;
  insert into cortex_arena_questions (room_id, idx, card_id, kind, prompt, options, answer)
  select rid, (o - 1)::int, q->>'card_id', q->>'kind', q->>'prompt', q->'options', (q->>'answer')::int
  from jsonb_array_elements(qs) with ordinality as t(q, o);
  return jsonb_build_object('id', rid, 'code', c);
end;
$$;

-- The next question (from the lobby, or after a reveal); past the last one, the room finishes.
create or replace function public.arena_next(p_room uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r cortex_arena_rooms := cortex_arena_room_teach(p_room);
  total int;
begin
  if r.state = 'finished' then return jsonb_build_object('state', 'finished'); end if;
  if r.state = 'question' then raise exception 'question still open'; end if;
  select count(*) into total from cortex_arena_questions where room_id = p_room;
  if r.q_index + 1 >= total then
    update cortex_arena_rooms set state = 'finished', finished_at = now() where id = p_room;
    return jsonb_build_object('state', 'finished');
  end if;
  update cortex_arena_rooms set state = 'question', q_index = r.q_index + 1, q_opened_at = now() where id = p_room;
  return jsonb_build_object('state', 'question', 'q_index', r.q_index + 1);
end;
$$;

-- Close the open question: no more answers; whoever did not answer loses their run of right answers.
create or replace function public.arena_lock(p_room uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r cortex_arena_rooms := cortex_arena_room_teach(p_room);
begin
  if r.state <> 'question' then return jsonb_build_object('state', r.state); end if;
  update cortex_arena_rooms set state = 'reveal' where id = p_room;
  update cortex_arena_players p set streak = 0
  where p.room_id = p_room and not exists (select 1 from cortex_arena_answers a where a.room_id = p_room and a.idx = r.q_index and a.user_id = p.user_id);
  return jsonb_build_object('state', 'reveal');
end;
$$;

create or replace function public.arena_finish(p_room uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r cortex_arena_rooms := cortex_arena_room_teach(p_room);
begin
  update cortex_arena_rooms set state = 'finished', finished_at = coalesce(finished_at, now()) where id = r.id;
  return jsonb_build_object('state', 'finished');
end;
$$;

-- Everything the projector shows: the room, the players, the question (with
-- its answer only once locked), how many answered, and per option how many
-- chose it once locked; at the end, each question's share of right answers.
create or replace function public.arena_host_state(p_room uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  r cortex_arena_rooms := cortex_arena_room_teach(p_room);
  q cortex_arena_questions;
begin
  select * into q from cortex_arena_questions where room_id = p_room and idx = r.q_index;
  return jsonb_build_object(
    'id', r.id, 'class_id', r.class_id, 'code', r.code, 'mode', r.mode, 'seconds', r.seconds, 'hide_names', r.hide_names,
    'state', r.state, 'q_index', r.q_index, 'q_opened_at', r.q_opened_at, 'now', now(),
    'total', (select count(*) from cortex_arena_questions where room_id = p_room),
    'players', coalesce((select jsonb_agg(jsonb_build_object('user_id', k.user_id, 'name', k.name, 'score', k.score, 'rank', k.rank)) from cortex_arena_ranking(p_room) k), '[]'::jsonb),
    'question', case when q.room_id is not null and r.state in ('question', 'reveal') then jsonb_strip_nulls(jsonb_build_object(
      'idx', q.idx, 'card_id', q.card_id, 'kind', q.kind, 'prompt', q.prompt, 'options', q.options,
      'answer', case when r.state = 'reveal' then q.answer end,
      'answered', (select count(*) from cortex_arena_answers a where a.room_id = p_room and a.idx = q.idx),
      'counts', case when r.state = 'reveal' then (
        select jsonb_agg((select count(*) from cortex_arena_answers a where a.room_id = p_room and a.idx = q.idx and a.choice = i) order by i)
        from generate_series(0, jsonb_array_length(q.options) - 1) i
      ) end
    )) end,
    'summary', case when r.state = 'finished' then coalesce((
      select jsonb_agg(jsonb_build_object(
        'idx', x.idx, 'card_id', x.card_id, 'prompt', x.prompt, 'right', x.options->>x.answer,
        'answered', (select count(*) from cortex_arena_answers a where a.room_id = p_room and a.idx = x.idx),
        'correct', (select count(*) from cortex_arena_answers a where a.room_id = p_room and a.idx = x.idx and a.correct)
      ) order by x.idx)
      from cortex_arena_questions x where x.room_id = p_room
    ), '[]'::jsonb) end
  );
end;
$$;

-- ── students ────────────────────────────────────────────────────────────

-- Rooms running now in this student's classes (Lexica shows "Vào đấu trường").
create or replace function public.arena_open_rooms()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'code', r.code, 'class', c.name, 'state', r.state) order by r.created_at desc), '[]'::jsonb)
  from cortex_arena_rooms r
  join cortex_classes c on c.id = r.class_id
  join cortex_class_members m on m.class_id = r.class_id and m.user_id = auth.uid()
  where r.state <> 'finished' and r.created_at > now() - interval '6 hours';
$$;

-- Join by code: only the class's students. Joining again (a reload, a lost connection) keeps the score.
create or replace function public.arena_join(p_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r cortex_arena_rooms;
  nm text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into r from cortex_arena_rooms where code = trim(p_code) and state <> 'finished' and created_at > now() - interval '6 hours';
  if r.id is null then raise exception 'no such room'; end if;
  select display_name into nm from cortex_class_members where class_id = r.class_id and user_id = auth.uid();
  if nm is null then raise exception 'not in this class'; end if;
  insert into cortex_arena_players (room_id, user_id, name) values (r.id, auth.uid(), nm)
  on conflict (room_id, user_id) do nothing;
  return jsonb_build_object('id', r.id);
end;
$$;

-- What a player's phone shows: the question without its answer while open;
-- once locked, the answer, their own result, score and rank; at the end,
-- their rank and the top 3.
create or replace function public.arena_state(p_room uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  r cortex_arena_rooms;
  q cortex_arena_questions;
  me cortex_arena_players;
  mine cortex_arena_answers;
  my_rank int;
begin
  select * into r from cortex_arena_rooms where id = p_room;
  select * into me from cortex_arena_players where room_id = p_room and user_id = auth.uid();
  if r.id is null or me.user_id is null then raise exception 'no such room'; end if;
  select * into q from cortex_arena_questions where room_id = p_room and idx = r.q_index;
  select * into mine from cortex_arena_answers where room_id = p_room and idx = r.q_index and user_id = auth.uid();
  select k.rank into my_rank from cortex_arena_ranking(p_room) k where k.user_id = auth.uid();
  return jsonb_strip_nulls(jsonb_build_object(
    'id', r.id, 'state', r.state, 'q_index', r.q_index, 'seconds', r.seconds, 'q_opened_at', r.q_opened_at, 'now', now(),
    'total', (select count(*) from cortex_arena_questions where room_id = p_room),
    'class', (select name from cortex_classes where id = r.class_id),
    'name', me.name, 'score', me.score, 'streak', me.streak, 'rank', my_rank,
    'players', (select count(*) from cortex_arena_players where room_id = p_room),
    'question', case when q.room_id is not null and r.state in ('question', 'reveal') then jsonb_strip_nulls(jsonb_build_object(
      'idx', q.idx, 'kind', q.kind, 'prompt', q.prompt, 'options', q.options,
      'answer', case when r.state = 'reveal' then q.answer end
    )) end,
    'mine', case when mine.user_id is not null then jsonb_build_object(
      'choice', mine.choice,
      'correct', case when r.state <> 'question' then mine.correct end,
      'points', case when r.state <> 'question' then mine.points end
    ) end,
    'top', case when r.state = 'finished' then (select jsonb_agg(jsonb_build_object('name', k.name, 'score', k.score, 'rank', k.rank)) from (select * from cortex_arena_ranking(p_room) limit 3) k) end
  ));
end;
$$;

-- An answer to the open question: first one counts, timed by the server.
-- Says only that it was received; right or wrong shows when the teacher locks.
create or replace function public.arena_answer(p_room uuid, p_idx int, p_choice int)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  r cortex_arena_rooms;
  q cortex_arena_questions;
  me cortex_arena_players;
  ms int;
  ok boolean;
  pts int;
begin
  select * into r from cortex_arena_rooms where id = p_room for update;
  select * into me from cortex_arena_players where room_id = p_room and user_id = auth.uid() for update;
  if r.id is null or me.user_id is null then raise exception 'no such room'; end if;
  if r.state <> 'question' or r.q_index <> p_idx or now() > r.q_opened_at + make_interval(secs => r.seconds) + cortex_arena_grace() then
    raise exception 'too late';
  end if;
  select * into q from cortex_arena_questions where room_id = p_room and idx = p_idx;
  if p_choice is null or p_choice < 0 or p_choice >= jsonb_array_length(q.options) then raise exception 'bad answer'; end if;
  if exists (select 1 from cortex_arena_answers where room_id = p_room and idx = p_idx and user_id = auth.uid()) then
    return jsonb_build_object('received', true);
  end if;
  ms := least(greatest((extract(epoch from now() - r.q_opened_at) * 1000)::int, 0), r.seconds * 1000);
  ok := p_choice = q.answer;
  pts := cortex_arena_points(ok, ms, r.seconds, me.streak);
  insert into cortex_arena_answers (room_id, idx, user_id, choice, correct, ms, points) values (p_room, p_idx, auth.uid(), p_choice, ok, ms, pts);
  update cortex_arena_players set score = score + pts, streak = case when ok then streak + 1 else 0 end
  where room_id = p_room and user_id = auth.uid();
  return jsonb_build_object('received', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['arena_open(uuid, int, jsonb, boolean)', 'arena_next(uuid)', 'arena_lock(uuid)', 'arena_finish(uuid)',
    'arena_host_state(uuid)', 'arena_open_rooms()', 'arena_join(text)', 'arena_state(uuid)', 'arena_answer(uuid, int, int)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  foreach f in array array['cortex_arena_grace()', 'cortex_arena_points(boolean, int, int, int)', 'cortex_arena_ranking(uuid)',
    'cortex_arena_clean_questions(jsonb)', 'cortex_arena_room_teach(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
