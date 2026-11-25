-- Self sign-up for the teacher app: a new teacher or a new center makes its own
-- workspace without an invitation (docs/TEACH_MARKET_RESEARCH.md, section 8).
-- Runs after classroom_core.sql. Safe to re-run.
--
-- What a person gets: a center of their own (they are its admin), on the free
-- plan: 30 student seats. More seats are set by the system admin
-- (classroom_org_update) until payment exists. Making one is idempotent: someone
-- who already belongs to a center, or is a teacher, gets that back, not a second.

alter table cortex_orgs add column if not exists self_signup boolean not null default false;

create or replace function public.classroom_self_signup(p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  existing uuid;
  oid uuid;
  nm text := trim(coalesce(p_name, ''));
begin
  if uid is null then raise exception 'not signed in'; end if;
  -- Already a teacher somewhere: nothing to make.
  select m.org_id into existing from cortex_org_members m where m.user_id = uid order by m.role = 'admin' desc limit 1;
  if existing is not null then return jsonb_build_object('org_id', existing, 'created', false); end if;
  if exists (select 1 from cortex_staff where user_id = uid) then return jsonb_build_object('org_id', null, 'created', false); end if;
  if char_length(nm) < 2 or char_length(nm) > 80 then raise exception 'bad center name'; end if;
  -- A brake against a script making centers in bulk: at most 200 new self-made centers a day.
  if (select count(*) from cortex_orgs where self_signup and created_at > now() - interval '1 day') >= 200 then raise exception 'try later'; end if;
  insert into cortex_orgs (name, owner_id, self_signup) values (nm, uid, true) returning id into oid;
  insert into cortex_org_members (org_id, user_id, role) values (oid, uid, 'admin');
  return jsonb_build_object('org_id', oid, 'created', true);
end;
$$;

revoke all on function public.classroom_self_signup(text) from public, anon;
grant execute on function public.classroom_self_signup(text) to authenticated;

notify pgrst, 'reload schema';
