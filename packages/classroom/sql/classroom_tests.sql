-- Class tests (docs/TEACH_PLAN.md, T3): the teacher gives a test of multiple
-- choice questions on the class's words; each student takes it in Lexica in
-- their own time, once, before the due date. Runs after classroom_arena.sql
-- (it checks questions the same way). Safe to re-run.
--
-- The server keeps the answers: a student sees a question's answer only after
-- handing the test in, and the score is counted here. The teacher sees each
-- student's score and the words they missed, to give a review per student.
-- Every read and write goes through the functions below; the tables have RLS
-- on and no policies.

create table if not exists cortex_class_tests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references cortex_classes(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  due_on date,
  closed_at timestamptz
);
create index if not exists cortex_class_tests_class_idx on cortex_class_tests (class_id, created_at desc);

create table if not exists cortex_class_test_questions (
  test_id uuid not null references cortex_class_tests(id) on delete cascade,
  idx int not null,
  card_id text,
  kind text not null,
  prompt text not null,
  options jsonb not null,
  answer int not null,
  primary key (test_id, idx)
);

create table if not exists cortex_class_test_attempts (
  test_id uuid not null references cortex_class_tests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  correct int,
  primary key (test_id, user_id)
);

create table if not exists cortex_class_test_answers (
  test_id uuid not null references cortex_class_tests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  idx int not null,
  choice int not null,
  at timestamptz not null default now(),
  primary key (test_id, user_id, idx)
);

alter table cortex_class_tests enable row level security;
alter table cortex_class_test_questions enable row level security;
alter table cortex_class_test_attempts enable row level security;
alter table cortex_class_test_answers enable row level security;

-- ── helpers ─────────────────────────────────────────────────────────────

create or replace function public.cortex_test_teach(p_test uuid)
returns cortex_class_tests language plpgsql stable security definer set search_path = public as $$
declare
  t cortex_class_tests;
begin
  select * into t from cortex_class_tests where id = p_test;
  if t.id is null then raise exception 'no such test'; end if;
  if not classroom_can_teach(t.class_id) then raise exception 'not the teacher'; end if;
  return t;
end;
$$;

-- The test, for one of its class's students.
create or replace function public.cortex_test_student(p_test uuid)
returns cortex_class_tests language plpgsql stable security definer set search_path = public as $$
declare
  t cortex_class_tests;
begin
  select * into t from cortex_class_tests where id = p_test;
  if t.id is null or not exists (select 1 from cortex_class_members where class_id = t.class_id and user_id = auth.uid()) then
    raise exception 'no such test';
  end if;
  return t;
end;
$$;

-- ── teacher ─────────────────────────────────────────────────────────────

create or replace function public.test_create(p_class uuid, p_title text, p_due date, p_questions jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  qs jsonb;
  tid uuid;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  qs := cortex_arena_clean_questions(p_questions);
  insert into cortex_class_tests (class_id, title, created_by, due_on)
  values (p_class, left(coalesce(nullif(trim(p_title), ''), 'Bài kiểm tra'), 120), auth.uid(), p_due)
  returning id into tid;
  insert into cortex_class_test_questions (test_id, idx, card_id, kind, prompt, options, answer)
  select tid, (o - 1)::int, q->>'card_id', q->>'kind', q->>'prompt', q->'options', (q->>'answer')::int
  from jsonb_array_elements(qs) with ordinality as t(q, o);
  return jsonb_build_object('id', tid);
end;
$$;

-- Close a test (no more answers) or open it again.
create or replace function public.test_close(p_test uuid, p_closed boolean)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_teach(p_test);
begin
  update cortex_class_tests set closed_at = case when coalesce(p_closed, true) then coalesce(closed_at, now()) end where id = t.id;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.test_delete(p_test uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_teach(p_test);
begin
  delete from cortex_class_tests where id = t.id;
  return jsonb_build_object('ok', true);
end;
$$;

-- The class's tests, newest first, with how many handed in and the average score.
create or replace function public.tests_list(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id, 'title', t.title, 'created_at', t.created_at, 'due_on', t.due_on, 'closed', t.closed_at is not null,
      'total', (select count(*) from cortex_class_test_questions q where q.test_id = t.id),
      'submitted', (select count(*) from cortex_class_test_attempts a where a.test_id = t.id and a.submitted_at is not null),
      'average', (select round(avg(a.correct)::numeric, 1) from cortex_class_test_attempts a where a.test_id = t.id and a.submitted_at is not null)
    ) order by t.created_at desc)
    from cortex_class_tests t where t.class_id = p_class
  ), '[]'::jsonb);
end;
$$;

-- A test's results: each student of the class (handed in, started, or not
-- yet), their score and the words they missed; each question's share right.
create or replace function public.test_results(p_test uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_teach(p_test);
begin
  return jsonb_build_object(
    'id', t.id, 'title', t.title, 'created_at', t.created_at, 'due_on', t.due_on, 'closed', t.closed_at is not null,
    'total', (select count(*) from cortex_class_test_questions q where q.test_id = t.id),
    'students', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'user_id', m.user_id, 'name', m.display_name,
        'status', case when a.submitted_at is not null then 'submitted' when a.user_id is not null then 'started' else 'not_started' end,
        'correct', a.correct, 'submitted_at', a.submitted_at,
        'missed', case when a.submitted_at is not null then (
          select coalesce(jsonb_agg(q.card_id order by q.idx), '[]'::jsonb) from cortex_class_test_questions q
          where q.test_id = t.id and q.card_id is not null
            and not exists (select 1 from cortex_class_test_answers x where x.test_id = t.id and x.user_id = m.user_id and x.idx = q.idx and x.choice = q.answer)
        ) end
      )) order by m.display_name)
      from cortex_class_members m
      left join cortex_class_test_attempts a on a.test_id = t.id and a.user_id = m.user_id
      where m.class_id = t.class_id
    ), '[]'::jsonb),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'idx', q.idx, 'card_id', q.card_id, 'prompt', q.prompt, 'right', q.options->>q.answer,
        'answered', (select count(*) from cortex_class_test_answers x join cortex_class_test_attempts a on a.test_id = x.test_id and a.user_id = x.user_id and a.submitted_at is not null where x.test_id = t.id and x.idx = q.idx),
        'correct', (select count(*) from cortex_class_test_answers x join cortex_class_test_attempts a on a.test_id = x.test_id and a.user_id = x.user_id and a.submitted_at is not null where x.test_id = t.id and x.idx = q.idx and x.choice = q.answer)
      ) order by q.idx)
      from cortex_class_test_questions q where q.test_id = t.id
    ), '[]'::jsonb)
  );
end;
$$;

-- ── students ────────────────────────────────────────────────────────────

-- This student's tests from the last 60 days, in every class: still to do first.
create or replace function public.my_tests()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
    'id', t.id, 'class_id', t.class_id, 'class', c.name, 'title', t.title, 'due_on', t.due_on, 'closed', t.closed_at is not null,
    'total', (select count(*) from cortex_class_test_questions q where q.test_id = t.id),
    'status', case when a.submitted_at is not null then 'submitted' when a.user_id is not null then 'started' else 'not_started' end,
    'correct', a.correct
  )) order by (a.submitted_at is not null), t.created_at desc), '[]'::jsonb)
  from cortex_class_tests t
  join cortex_classes c on c.id = t.class_id
  join cortex_class_members m on m.class_id = t.class_id and m.user_id = auth.uid()
  left join cortex_class_test_attempts a on a.test_id = t.id and a.user_id = auth.uid()
  where t.created_at > now() - interval '60 days';
$$;

-- Open a test: its questions, without answers until handed in (or the test
-- is closed); this student's answers so far. Opening an open test starts the attempt.
create or replace function public.test_take(p_test uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_student(p_test);
  a cortex_class_test_attempts;
begin
  if t.closed_at is null then
    insert into cortex_class_test_attempts (test_id, user_id) values (t.id, auth.uid()) on conflict do nothing;
  end if;
  select * into a from cortex_class_test_attempts where test_id = t.id and user_id = auth.uid();
  return jsonb_build_object(
    'id', t.id, 'title', t.title, 'due_on', t.due_on, 'closed', t.closed_at is not null,
    'class', (select name from cortex_classes where id = t.class_id),
    'submitted', a.submitted_at is not null, 'correct', a.correct,
    'questions', coalesce((
      select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'idx', q.idx, 'card_id', q.card_id, 'kind', q.kind, 'prompt', q.prompt, 'options', q.options,
        'answer', case when a.submitted_at is not null or t.closed_at is not null then q.answer end,
        'choice', (select x.choice from cortex_class_test_answers x where x.test_id = t.id and x.user_id = auth.uid() and x.idx = q.idx)
      )) order by q.idx)
      from cortex_class_test_questions q where q.test_id = t.id
    ), '[]'::jsonb)
  );
end;
$$;

-- Answer (or change an answer) before handing in.
create or replace function public.test_answer(p_test uuid, p_idx int, p_choice int)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_student(p_test);
  n int;
begin
  if t.closed_at is not null then raise exception 'test closed'; end if;
  if exists (select 1 from cortex_class_test_attempts where test_id = t.id and user_id = auth.uid() and submitted_at is not null) then raise exception 'already handed in'; end if;
  select jsonb_array_length(options) into n from cortex_class_test_questions where test_id = t.id and idx = p_idx;
  if n is null or p_choice is null or p_choice < 0 or p_choice >= n then raise exception 'bad answer'; end if;
  insert into cortex_class_test_attempts (test_id, user_id) values (t.id, auth.uid()) on conflict do nothing;
  insert into cortex_class_test_answers (test_id, user_id, idx, choice) values (t.id, auth.uid(), p_idx, p_choice)
  on conflict (test_id, user_id, idx) do update set choice = excluded.choice, at = now();
  return jsonb_build_object('ok', true);
end;
$$;

-- Hand in: the score is counted here (a question left blank is wrong), once.
create or replace function public.test_submit(p_test uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  t cortex_class_tests := cortex_test_student(p_test);
  c int;
begin
  if t.closed_at is not null then raise exception 'test closed'; end if;
  if exists (select 1 from cortex_class_test_attempts where test_id = t.id and user_id = auth.uid() and submitted_at is not null) then raise exception 'already handed in'; end if;
  select count(*) into c from cortex_class_test_answers x join cortex_class_test_questions q on q.test_id = x.test_id and q.idx = x.idx
  where x.test_id = t.id and x.user_id = auth.uid() and x.choice = q.answer;
  insert into cortex_class_test_attempts (test_id, user_id, submitted_at, correct) values (t.id, auth.uid(), now(), c)
  on conflict (test_id, user_id) do update set submitted_at = now(), correct = c;
  return test_take(p_test);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['test_create(uuid, text, date, jsonb)', 'test_close(uuid, boolean)', 'test_delete(uuid)', 'tests_list(uuid)',
    'test_results(uuid)', 'my_tests()', 'test_take(uuid)', 'test_answer(uuid, int, int)', 'test_submit(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  foreach f in array array['cortex_test_teach(uuid)', 'cortex_test_student(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
