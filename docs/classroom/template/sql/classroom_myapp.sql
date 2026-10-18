-- Classroom module: MyApp (docs/CLASSROOM.md). Runs after
-- packages/classroom/sql/classroom_core.sql. Safe to re-run.
--
-- Assignment kinds:
--   topic  {topic: text, minutes: int}
-- Metrics (per class):
--   {sessions: int, minutes: int, done: {assignmentId: true}}
-- Settings: {level: 'beginner'|'intermediate'|'advanced'|null}

insert into cortex_apps (id, name) values ('myapp', 'MyApp') on conflict (id) do update set name = excluded.name;

create or replace function public.classroom_myapp_clean_settings(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'level', case when p->>'level' in ('beginner','intermediate','advanced') then p->>'level' end
  ));
$$;

create or replace function public.classroom_myapp_clean_payload(p_kind text, p jsonb)
returns jsonb language plpgsql immutable as $$
begin
  if p_kind <> 'topic' or char_length(trim(coalesce(p->>'topic', ''))) not between 2 and 200 then
    raise exception 'bad payload';
  end if;
  return jsonb_build_object(
    'topic', trim(p->>'topic'),
    'minutes', least(greatest(coalesce((p->>'minutes')::int, 5), 1), 120)
  );
end;
$$;

-- Numbers only, and "done" only for this class's own assignments.
create or replace function public.classroom_myapp_clean_metrics(p_class uuid, p jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  done jsonb;
begin
  select coalesce(jsonb_object_agg(k, true), '{}') into done
  from jsonb_object_keys(coalesce(p->'done', '{}')) k
  where exists (select 1 from cortex_class_assignments a where a.class_id = p_class and a.app = 'myapp' and a.id::text = k);
  return jsonb_build_object(
    'sessions', least(greatest(coalesce((p->>'sessions')::int, 0), 0), 100000),
    'minutes', least(greatest(coalesce((p->>'minutes')::int, 0), 0), 1000000),
    'done', done
  );
end;
$$;

-- Optional: rank by minutes spoken.
create or replace function public.classroom_myapp_rank(p jsonb)
returns numeric language sql immutable as $$
  select coalesce((p->>'minutes')::numeric, 0);
$$;

do $$
declare f text;
begin
  foreach f in array array['classroom_myapp_clean_settings(jsonb)', 'classroom_myapp_clean_payload(text, jsonb)',
    'classroom_myapp_clean_metrics(uuid, jsonb)', 'classroom_myapp_rank(jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
