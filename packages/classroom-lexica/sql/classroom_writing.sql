-- Writing handed in to a class (issue #105, W6). Runs after
-- packages/classroom/sql/classroom_core.sql. Safe to re-run.
--
-- The one place the class receives what a student wrote, so the rules are
-- narrow (same as Oratio's spoken answers, issue #88):
--   * the student hands a piece in on purpose, one at a time, and sees who will read it;
--   * only the teacher of the class reads it (classroom_can_teach);
--   * it is deleted 30 days after it was handed in, and the student can delete it at once;
--   * the teacher's four bands and a comment come back to the student.
-- Tables have row-level security on and no policies: every read and write goes
-- through the security definer functions below.

create table if not exists public.cortex_writing_submissions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.cortex_classes(id) on delete cascade,
  assignment_id uuid references public.cortex_class_assignments(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('sentence', 'paragraph', 'task1', 'task2')),
  prompt text check (prompt is null or char_length(prompt) <= 600),
  body text not null check (char_length(body) between 1 and 6000),
  words int not null check (words between 0 and 2000),
  submitted_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  -- {task, coherence, vocabulary, grammar, overall} in steps of 0.5, set by the teacher
  teacher_scores jsonb,
  teacher_comment text check (teacher_comment is null or char_length(teacher_comment) <= 2000),
  teacher_rated_at timestamptz
);
alter table public.cortex_writing_submissions enable row level security;
create index if not exists cortex_writing_class_idx on public.cortex_writing_submissions (class_id, submitted_at desc);
create index if not exists cortex_writing_user_idx on public.cortex_writing_submissions (user_id, submitted_at desc);
create index if not exists cortex_writing_expiry_idx on public.cortex_writing_submissions (expires_at);

-- Pieces past their 30 days. Called whenever the list is read or written, since nothing runs on a timer.
create or replace function public.writing_purge()
returns void language sql volatile security definer set search_path = public as $$
  delete from cortex_writing_submissions where expires_at < now();
$$;
revoke all on function public.writing_purge() from public, anon, authenticated;

-- A student hands a piece in to a class they belong to. At most 10 a day.
create or replace function public.writing_submit(p_class uuid, p_kind text, p_prompt text, p_body text, p_assignment uuid default null)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  body text := btrim(coalesce(p_body, ''));
  new_id uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from cortex_class_members where class_id = p_class and user_id = uid) then raise exception 'not in this class'; end if;
  if p_kind not in ('sentence', 'paragraph', 'task1', 'task2') then raise exception 'bad kind'; end if;
  if char_length(body) not between 1 and 6000 then raise exception 'bad body'; end if;
  if p_assignment is not null and not exists (select 1 from cortex_class_assignments where id = p_assignment and class_id = p_class) then raise exception 'bad assignment'; end if;
  perform writing_purge();
  if (select count(*) from cortex_writing_submissions where user_id = uid and submitted_at > now() - interval '1 day') >= 10 then raise exception 'too many today'; end if;
  insert into cortex_writing_submissions (class_id, assignment_id, user_id, kind, prompt, body, words)
  values (p_class, p_assignment, uid, p_kind, nullif(left(btrim(coalesce(p_prompt, '')), 600), ''), body,
          least(2000, coalesce(array_length(regexp_split_to_array(body, '\s+'), 1), 0)))
  returning id into new_id;
  return new_id;
end;
$$;

-- What the student handed in (newest first), with what the teacher said.
create or replace function public.writing_mine(p_class uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not signed in'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', s.id, 'class_id', s.class_id, 'kind', s.kind, 'prompt', s.prompt, 'body', s.body, 'words', s.words,
      'submitted_at', s.submitted_at, 'expires_at', s.expires_at,
      'teacher_scores', s.teacher_scores, 'teacher_comment', s.teacher_comment, 'teacher_rated_at', s.teacher_rated_at
    ) order by s.submitted_at desc)
    from (select * from cortex_writing_submissions where user_id = uid and expires_at >= now() and (p_class is null or class_id = p_class)
          order by submitted_at desc limit 50) s), '[]'::jsonb);
end;
$$;

-- The student takes a piece back: it is deleted now.
create or replace function public.writing_delete(p_id uuid)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from cortex_writing_submissions where id = p_id and user_id = auth.uid();
end;
$$;

-- The teacher's list for a class (newest first), with the student's name in that class.
create or replace function public.writing_class_list(p_class uuid, p_assignment uuid default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  perform writing_purge();
  return coalesce((
    select jsonb_agg(row order by (row->>'submitted_at') desc) from (
      select jsonb_build_object(
        'id', s.id, 'user_id', s.user_id, 'name', coalesce(m.display_name, 'Học viên'), 'assignment_id', s.assignment_id,
        'kind', s.kind, 'prompt', s.prompt, 'body', s.body, 'words', s.words, 'submitted_at', s.submitted_at,
        'expires_at', s.expires_at, 'teacher_scores', s.teacher_scores, 'teacher_comment', s.teacher_comment,
        'teacher_rated_at', s.teacher_rated_at
      ) as row
      from cortex_writing_submissions s
      left join cortex_class_members m on m.class_id = s.class_id and m.user_id = s.user_id
      where s.class_id = p_class and (p_assignment is null or s.assignment_id = p_assignment)
      order by s.submitted_at desc limit 300
    ) x), '[]'::jsonb);
end;
$$;

-- The teacher's four bands (task, coherence, vocabulary, grammar; 1 to 9 in halves) and a comment.
create or replace function public.writing_teacher_rate(p_id uuid, p_scores jsonb, p_comment text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cls uuid;
  c text;
  v numeric;
  out jsonb := '{}'::jsonb;
  total numeric := 0;
begin
  select class_id into cls from cortex_writing_submissions where id = p_id;
  if cls is null or not classroom_can_teach(cls) then raise exception 'not the teacher'; end if;
  foreach c in array array['task', 'coherence', 'vocabulary', 'grammar'] loop
    if jsonb_typeof(p_scores->c) <> 'number' then raise exception 'bad scores'; end if;
    v := round((p_scores->>c)::numeric * 2) / 2;
    if v < 1 or v > 9 then raise exception 'bad scores'; end if;
    out := out || jsonb_build_object(c, v);
    total := total + v;
  end loop;
  out := out || jsonb_build_object('overall', round(total / 4 * 2) / 2);
  update cortex_writing_submissions
     set teacher_scores = out, teacher_comment = nullif(left(btrim(coalesce(p_comment, '')), 2000), ''), teacher_rated_at = now()
   where id = p_id;
  return out;
end;
$$;

revoke all on function public.writing_submit(uuid, text, text, text, uuid), public.writing_mine(uuid), public.writing_delete(uuid),
  public.writing_class_list(uuid, uuid), public.writing_teacher_rate(uuid, jsonb, text) from public, anon;
grant execute on function public.writing_submit(uuid, text, text, text, uuid), public.writing_mine(uuid), public.writing_delete(uuid),
  public.writing_class_list(uuid, uuid), public.writing_teacher_rate(uuid, jsonb, text) to authenticated;
