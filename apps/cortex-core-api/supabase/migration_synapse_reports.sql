-- "Báo cảnh có vấn đề" in Synapse (docs/SYNAPSE_PLAN.md S3). Safe to re-run.
-- A player flags an authored scene; a reviewer reads the rows in the dashboard.
-- RLS on, no policies: the only way in is the function below (insert only).

create table if not exists synapse_reports (
  id uuid primary key default gen_random_uuid(),
  mission_id text not null,
  stage int not null check (stage between 0 and 9),
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table synapse_reports enable row level security;

create or replace function public.synapse_report(p_mission text, p_stage int, p_note text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_mission is null or length(p_mission) not between 1 and 40 then raise exception 'bad mission'; end if;
  -- a ceiling on reports an hour, so a script cannot fill the table
  if (select count(*) from synapse_reports where created_at > now() - interval '1 hour') >= 1000 then raise exception 'too many'; end if;
  insert into synapse_reports (mission_id, stage, note) values (p_mission, greatest(0, least(9, coalesce(p_stage, 0))), left(coalesce(p_note, ''), 300));
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.synapse_report(text, int, text) from public;
grant execute on function public.synapse_report(text, int, text) to anon, authenticated;
notify pgrst, 'reload schema';
