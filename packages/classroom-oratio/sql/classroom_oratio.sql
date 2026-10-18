-- Classroom module: Oratio (docs/CLASSROOM.md). What an Oratio lesson is,
-- what an Oratio student reports, and how the class ranks them. Runs after
-- packages/classroom/sql/classroom_core.sql and Oratio's schema
-- (ielts_questions). Safe to re-run.
--
-- Assignment kinds:
--   topic      {category: text, part: 1|2|3|null, sessions: 1..20}
--   questions  {question_ids: uuid[]}
--   goal       {sessions: 0..50, minutes: 0..1000}   (at least one above 0)
-- Metrics (per class):
--   {sessions, minutes, ratings, band: {fluency,vocabulary,grammar,pronunciation,overall}|null,
--    current_band, target_band, progress: {assignmentId: {sessions, minutes, asked}}}
-- Settings: {target_band: 4..9 in steps of 0.5 | null}

insert into cortex_apps (id, name) values ('oratio', 'Oratio') on conflict (id) do update set name = excluded.name;

-- A band 1..9 in steps of 0.5, or null.
create or replace function public.oratio_band(v jsonb)
returns numeric language sql immutable as $$
  select case when jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric between 1 and 9
    then round((v #>> '{}')::numeric * 2) / 2 end;
$$;

-- ── hooks ───────────────────────────────────────────────────────────────

create or replace function public.classroom_oratio_clean_settings(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object('target_band', case when oratio_band(p->'target_band') >= 4 then oratio_band(p->'target_band') end));
$$;

create or replace function public.classroom_oratio_clean_payload(p_kind text, p jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  ids jsonb;
  s int;
  m int;
begin
  if p_kind = 'topic' then
    if char_length(trim(coalesce(p->>'category', ''))) not between 2 and 80 then raise exception 'bad payload'; end if;
    return jsonb_build_object(
      'category', trim(p->>'category'),
      'part', case when p->>'part' in ('1','2','3') then (p->>'part')::int end,
      'sessions', least(greatest(coalesce((p->>'sessions')::int, 2), 1), 20));
  elsif p_kind = 'questions' then
    -- Only questions that exist.
    select coalesce(jsonb_agg(q.id::text order by q.part, q.id), '[]') into ids
    from ielts_questions q
    where q.id::text in (select x from jsonb_array_elements_text(coalesce(p->'question_ids', '[]')) x limit 60);
    if jsonb_array_length(ids) = 0 then raise exception 'no questions'; end if;
    if jsonb_array_length(ids) > 30 then raise exception 'bad payload'; end if;
    return jsonb_build_object('question_ids', ids);
  elsif p_kind = 'goal' then
    s := least(greatest(coalesce((p->>'sessions')::int, 0), 0), 50);
    m := least(greatest(coalesce((p->>'minutes')::int, 0), 0), 1000);
    if s = 0 and m = 0 then raise exception 'bad payload'; end if;
    return jsonb_build_object('sessions', s, 'minutes', m);
  end if;
  raise exception 'bad payload';
end;
$$;

-- Numbers only; progress only for this class's own Oratio assignments.
create or replace function public.classroom_oratio_clean_metrics(p_class uuid, p jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  progress jsonb;
  band jsonb;
  n constant int := 100000;
begin
  select coalesce(jsonb_object_agg(k, jsonb_build_object(
      'sessions', least(greatest(coalesce((v->>'sessions')::int, 0), 0), n),
      'minutes', least(greatest(coalesce((v->>'minutes')::int, 0), 0), n),
      'asked', least(greatest(coalesce((v->>'asked')::int, 0), 0), 100))), '{}') into progress
  from jsonb_each(coalesce(p->'progress', '{}')) e(k, v)
  where jsonb_typeof(v) = 'object'
    and exists (select 1 from cortex_class_assignments a where a.class_id = p_class and a.app = 'oratio' and a.id::text = k);
  if jsonb_typeof(p->'band') = 'object' then
    band := jsonb_strip_nulls(jsonb_build_object(
      'fluency', oratio_band(p->'band'->'fluency'), 'vocabulary', oratio_band(p->'band'->'vocabulary'),
      'grammar', oratio_band(p->'band'->'grammar'), 'pronunciation', oratio_band(p->'band'->'pronunciation'),
      'overall', oratio_band(p->'band'->'overall')));
    if band = '{}'::jsonb then band := null; end if;
  end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'sessions', least(greatest(coalesce((p->>'sessions')::int, 0), 0), n),
    'minutes', least(greatest(coalesce((p->>'minutes')::int, 0), 0), n * 10),
    'ratings', least(greatest(coalesce((p->>'ratings')::int, 0), 0), n),
    'band', band,
    'current_band', oratio_band(p->'current_band'),
    'target_band', oratio_band(p->'target_band'),
    'progress', progress));
end;
$$;

-- Ranked by minutes spoken: effort, never the band partners gave.
create or replace function public.classroom_oratio_rank(p jsonb)
returns numeric language sql immutable as $$
  select coalesce((p->>'minutes')::numeric, 0);
$$;

do $$
declare f text;
begin
  foreach f in array array['oratio_band(jsonb)', 'classroom_oratio_clean_settings(jsonb)', 'classroom_oratio_clean_payload(text, jsonb)',
    'classroom_oratio_clean_metrics(uuid, jsonb)', 'classroom_oratio_rank(jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
