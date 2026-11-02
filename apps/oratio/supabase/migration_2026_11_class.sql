-- Oratio for classes (issue #88, docs/ORATIO_PLAN.md). Runs after
-- migration_2026_10_answers.sql, packages/classroom/sql/classroom_core.sql and
-- packages/classroom-oratio/sql/classroom_oratio.sql. Safe to re-run.
--
-- A student can hand a spoken answer in to their class (an Oratio assignment or
-- just practice): the answer is kept apart from the open Chấm chéo pool. The
-- teacher listens and rates it. Classmates hear it and rate it only when the
-- teacher turned on "bạn cùng lớp nghe và chấm" in the class's Oratio settings
-- (off by default). Audio is deleted after 30 days like every other answer.

alter table public.answers add column if not exists class_id uuid references public.cortex_classes(id) on delete set null;
alter table public.answers add column if not exists assignment_id uuid references public.cortex_class_assignments(id) on delete set null;
-- The teacher's band per criterion (and overall), for answers handed in to a class
alter table public.answers add column if not exists teacher_scores jsonb;
alter table public.answers add column if not exists teacher_rated_at timestamptz;
create index if not exists answers_class_idx on public.answers (class_id, submitted_at desc) where class_id is not null;

-- Class settings: the target band and whether classmates may hear and rate each other.
create or replace function public.classroom_oratio_clean_settings(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'target_band', case when oratio_band(p->'target_band') >= 4 then oratio_band(p->'target_band') end,
    'peers_listen', case when p->>'peers_listen' = 'true' or p->'peers_listen' = 'true'::jsonb then true else false end));
$$;

-- Does this class let classmates hear and rate each other? (Used by the Oratio server.)
create or replace function public.oratio_class_peers(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select (settings->'oratio'->>'peers_listen')::boolean from cortex_classes where id = p_class and 'oratio' = any (apps)), false);
$$;

-- The classes a student is in that use Oratio, and the ones among them where classmates may rate each other.
create or replace function public.oratio_my_classes(p_user uuid)
returns table (class_id uuid, peers boolean) language sql stable security definer set search_path = public as $$
  select c.id, coalesce((c.settings->'oratio'->>'peers_listen')::boolean, false)
  from cortex_class_members m join cortex_classes c on c.id = m.class_id
  where m.user_id = p_user and 'oratio' = any (c.apps) and not c.archived;
$$;

-- The teacher's list: answers handed in to the class (newest first), with who and how it went.
create or replace function public.oratio_class_answers(p_class uuid, p_assignment uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return coalesce((
    select jsonb_agg(row order by (row->>'submitted_at') desc) from (
      select jsonb_build_object(
        'id', a.id, 'user_id', a.user_id, 'name', coalesce(m.display_name, 'Học viên'),
        'assignment_id', a.assignment_id, 'part', a.part, 'question_text', a.question_text,
        'duration_ms', a.duration_ms, 'speaking_ms', a.speaking_ms, 'wpm', a.wpm, 'fillers', a.fillers, 'word_count', a.word_count,
        'transcript', a.transcript, 'submitted_at', a.submitted_at, 'audio_path', a.audio_path,
        'teacher_scores', a.teacher_scores,
        'peer_overall', (select round(avg((r.fluency + r.vocabulary + r.grammar + r.pronunciation) / 4.0) * 2) / 2 from answer_reviews r where r.answer_id = a.id),
        'peer_raters', (select count(*) from answer_reviews r where r.answer_id = a.id)
      ) as row
      from answers a left join cortex_class_members m on m.class_id = a.class_id and m.user_id = a.user_id
      where a.class_id = p_class and a.submitted_at is not null and (p_assignment is null or a.assignment_id = p_assignment)
      order by a.submitted_at desc limit 300
    ) x), '[]'::jsonb);
end;
$$;

-- The teacher's band for an answer: four criteria, 1 to 9 in half steps.
create or replace function public.oratio_teacher_rate(p_answer uuid, p_scores jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cls uuid;
  c text;
  v numeric;
  out jsonb := '{}'::jsonb;
  total numeric := 0;
begin
  select class_id into cls from answers where id = p_answer;
  if cls is null or not classroom_can_teach(cls) then raise exception 'not the teacher'; end if;
  foreach c in array array['fluency', 'vocabulary', 'grammar', 'pronunciation'] loop
    if jsonb_typeof(p_scores->c) <> 'number' then raise exception 'bad scores'; end if;
    v := round((p_scores->>c)::numeric * 2) / 2;
    if v < 1 or v > 9 then raise exception 'bad scores'; end if;
    out := out || jsonb_build_object(c, v);
    total := total + v;
  end loop;
  out := out || jsonb_build_object('overall', round(total / 4 * 2) / 2);
  update answers set teacher_scores = out, teacher_rated_at = now() where id = p_answer;
  return out;
end;
$$;

-- How far the class's peer ratings are from the teacher's, over answers both rated.
-- A comparison counts as "calibrated" from 10 answers the teacher rated (docs/ORATIO_PLAN.md).
create or replace function public.oratio_class_calibration(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  rated int;
  compared int;
  gap numeric;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  select count(*) into rated from answers where class_id = p_class and teacher_scores is not null;
  select count(*), round(avg(abs(peer - (a.teacher_scores->>'overall')::numeric)) * 2) / 2 into compared, gap from (
    select a.id, (select avg((r.fluency + r.vocabulary + r.grammar + r.pronunciation) / 4.0) from answer_reviews r where r.answer_id = a.id) as peer
    from answers a where a.class_id = p_class and a.teacher_scores is not null) q join answers a on a.id = q.id where peer is not null;
  return jsonb_build_object('rated', rated, 'calibrated', rated >= 10, 'compared', compared, 'gap', gap);
end;
$$;

-- Teachers read the audio of their own class's answers (the bucket stays private for everyone else).
do $$
begin
  if to_regclass('storage.objects') is not null then
    drop policy if exists "oratio teachers read class audio" on storage.objects;
    create policy "oratio teachers read class audio" on storage.objects for select to authenticated using (
      bucket_id = 'oratio-answers' and exists (
        select 1 from public.answers a where a.audio_path = storage.objects.name and a.class_id is not null and public.classroom_can_teach(a.class_id)));
  end if;
end $$;

do $$
declare f text;
begin
  foreach f in array array['oratio_class_peers(uuid)', 'oratio_my_classes(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
  foreach f in array array['oratio_class_answers(uuid, uuid)', 'oratio_teacher_rate(uuid, jsonb)', 'oratio_class_calibration(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
