-- Classroom module: Synapse (docs/CLASSROOM.md, docs/SYNAPSE_PLAN.md S4). What a
-- Synapse lesson is, what a Synapse student reports, how the class ranks them.
-- Runs after packages/classroom/sql/classroom_core.sql. Safe to re-run.
--
-- Assignment kinds:
--   mission  {lore_id: text, mission_id: text, name: text}   a written mission to clear
--   review   {}                                               "Ôn bằng truyện"
-- Metrics (per class): {runs, cleared, solid, weak: text[<=5], progress: {assignmentId: {done, best, tries}}}
-- Settings: none. Numbers and phrase names only; nothing a student wrote.

insert into cortex_apps (id, name) values ('synapse', 'Synapse') on conflict (id) do update set name = excluded.name;

create or replace function public.classroom_synapse_clean_settings(p jsonb)
returns jsonb language sql immutable as $$ select '{}'::jsonb; $$;

create or replace function public.classroom_synapse_clean_payload(p_kind text, p jsonb)
returns jsonb language plpgsql immutable as $$
begin
  if p_kind = 'review' then return '{}'::jsonb; end if;
  if p_kind = 'mission' then
    if coalesce(p->>'lore_id', '') !~ '^[a-z0-9-]{2,40}$' or coalesce(p->>'mission_id', '') !~ '^[a-z0-9-]{2,40}$' then raise exception 'bad payload'; end if;
    return jsonb_build_object('lore_id', p->>'lore_id', 'mission_id', p->>'mission_id', 'name', left(trim(coalesce(p->>'name', '')), 80));
  end if;
  raise exception 'bad payload';
end;
$$;

-- Numbers; progress only for this class's own Synapse assignments.
create or replace function public.classroom_synapse_clean_metrics(p_class uuid, p jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  progress jsonb;
  weak jsonb;
begin
  select coalesce(jsonb_object_agg(k, jsonb_build_object(
      'done', coalesce((v->>'done')::boolean, false),
      'best', case when v->>'best' in ('gold', 'silver', 'bronze', 'fail') then v->>'best' end,
      'tries', least(greatest(coalesce((v->>'tries')::int, 0), 0), 1000))), '{}') into progress
  from jsonb_each(coalesce(p->'progress', '{}')) e(k, v)
  where jsonb_typeof(v) = 'object'
    and exists (select 1 from cortex_class_assignments a where a.class_id = p_class and a.app = 'synapse' and a.id::text = k);
  select coalesce(jsonb_agg(left(x, 80)), '[]'::jsonb) into weak
  from (select x from jsonb_array_elements_text(case when jsonb_typeof(p->'weak') = 'array' then p->'weak' else '[]'::jsonb end) with ordinality t(x, o) order by o limit 5) s;
  return jsonb_build_object(
    'runs', least(greatest(coalesce((p->>'runs')::int, 0), 0), 1000000),
    'cleared', least(greatest(coalesce((p->>'cleared')::int, 0), 0), 1000),
    'solid', least(greatest(coalesce((p->>'solid')::int, 0), 0), 5000),
    'weak', weak,
    'progress', progress);
end;
$$;

-- Ranked by missions played: effort, never the ending.
create or replace function public.classroom_synapse_rank(p jsonb)
returns numeric language sql immutable as $$ select coalesce((p->>'runs')::numeric, 0); $$;

do $$
declare f text;
begin
  foreach f in array array['classroom_synapse_clean_settings(jsonb)', 'classroom_synapse_clean_payload(text, jsonb)', 'classroom_synapse_clean_metrics(uuid, jsonb)', 'classroom_synapse_rank(jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
