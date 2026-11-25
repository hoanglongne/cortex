-- "Buổi học thử" (docs/TEACH_TRIAL_PLAN.md): a teacher opens a trial session, gets
-- a code; parents and students open the link without an account (anonymous
-- Supabase users, as in the Arena's guest rooms), leave a name and, if they want,
-- a phone number, and take the placement test. The teacher sees who came and how
-- they did. Runs after classroom_core.sql and apps/lexica/supabase/migration_placement.sql.
-- Safe to re-run. Every read and write goes through the functions below; the
-- tables have RLS on and no policies.
--
-- Privacy: the phone is stored only when the guest ticked consent; guests who
-- are not enrolled are deleted after 90 days; the teacher can delete one at once.

create table if not exists cortex_trials (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references cortex_orgs(id) on delete cascade,
  class_id uuid references cortex_classes(id) on delete set null,
  title text not null check (char_length(title) between 2 and 80),
  code text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  closes_at timestamptz not null,
  closed boolean not null default false
);
create index if not exists cortex_trials_org_idx on cortex_trials (org_id, created_at desc);

create table if not exists cortex_trial_guests (
  id uuid primary key default gen_random_uuid(),
  trial_id uuid not null references cortex_trials(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  phone text check (phone is null or char_length(phone) between 8 and 15),
  placement_session uuid,
  status text not null default 'new' check (status in ('new', 'invited', 'enrolled')),
  joined_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days',
  unique (trial_id, user_id)
);
create index if not exists cortex_trial_guests_trial_idx on cortex_trial_guests (trial_id, joined_at desc);

alter table cortex_trials enable row level security;
alter table cortex_trial_guests enable row level security;

-- Who may run trials of a center: its admins and teachers.
create or replace function public.classroom_in_org(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from cortex_org_members where org_id = p_org and user_id = auth.uid())
      or exists (select 1 from cortex_staff where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.classroom_trial_create(p_org uuid, p_title text, p_class uuid default null, p_days int default 7)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  tid uuid;
  c text;
  tries int := 0;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not classroom_in_org(p_org) then raise exception 'not in this center'; end if;
  if p_class is not null and not exists (select 1 from cortex_classes where id = p_class and org_id = p_org) then raise exception 'no such class'; end if;
  if char_length(trim(coalesce(p_title, ''))) not between 2 and 80 then raise exception 'bad trial title'; end if;
  if (select count(*) from cortex_trials where org_id = p_org and not closed and closes_at > now()) >= 10 then raise exception 'too many trials'; end if;
  loop
    c := classroom_code();
    exit when not exists (select 1 from cortex_trials where code = c);
    tries := tries + 1;
    if tries > 20 then raise exception 'try later'; end if;
  end loop;
  insert into cortex_trials (org_id, class_id, title, code, created_by, closes_at)
  values (p_org, p_class, trim(p_title), c, auth.uid(), now() + make_interval(days => least(greatest(coalesce(p_days, 7), 1), 30)))
  returning id into tid;
  return jsonb_build_object('id', tid, 'code', c);
end;
$$;

create or replace function public.classroom_trial_close(p_trial uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  o uuid;
begin
  select org_id into o from cortex_trials where id = p_trial;
  if o is null or not classroom_in_org(o) then raise exception 'not in this center'; end if;
  update cortex_trials set closed = true where id = p_trial;
  return jsonb_build_object('ok', true);
end;
$$;

-- The teacher's list: every trial of the center with its guests, newest first.
create or replace function public.classroom_trials_list(p_org uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_in_org(p_org) then raise exception 'not in this center'; end if;
  delete from cortex_trial_guests g using cortex_trials t
  where g.trial_id = t.id and t.org_id = p_org and g.expires_at < now() and g.status <> 'enrolled';
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', t.id, 'title', t.title, 'code', t.code, 'closed', t.closed or t.closes_at <= now(), 'closes_at', t.closes_at, 'created_at', t.created_at,
      'class_id', t.class_id,
      'class_name', (select c.name from cortex_classes c where c.id = t.class_id),
      'class_code', (select c.code from cortex_classes c where c.id = t.class_id and not c.archived),
      'guests', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', g.id, 'name', g.name, 'phone', g.phone, 'status', g.status, 'joined_at', g.joined_at,
          'score', s.score, 'level', s.level, 'score_code', s.code
        ) order by g.joined_at desc)
        from cortex_trial_guests g
        left join lateral (select ps.score, ps.level, ps.code from lexica_placement_sessions ps where ps.id = g.placement_session and ps.finished_at is not null) s on true
        where g.trial_id = t.id
      ), '[]'::jsonb)
    ) order by t.created_at desc)
    from cortex_trials t where t.org_id = p_org
  ), '[]'::jsonb);
end;
$$;

create or replace function public.classroom_trial_guest_update(p_guest uuid, p_status text default null, p_delete boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  o uuid;
begin
  select t.org_id into o from cortex_trial_guests g join cortex_trials t on t.id = g.trial_id where g.id = p_guest;
  if o is null or not classroom_in_org(o) then raise exception 'not in this center'; end if;
  if p_delete then
    delete from cortex_trial_guests where id = p_guest;
  elsif p_status in ('new', 'invited', 'enrolled') then
    update cortex_trial_guests set status = p_status, expires_at = case when p_status = 'enrolled' then expires_at else greatest(expires_at, now() + interval '30 days') end where id = p_guest;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- Before a guest signs in: what the code is for. Says only the title and the center.
create or replace function public.classroom_trial_info(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object('valid', not t.closed and t.closes_at > now(), 'title', t.title, 'center', (select name from cortex_orgs where id = t.org_id))
    from cortex_trials t where t.code = upper(trim(p_code))
  ), jsonb_build_object('valid', false));
$$;

-- A guest (an anonymous user) leaves a name, and a phone only with consent.
create or replace function public.classroom_trial_register(p_code text, p_name text, p_phone text default null, p_consent boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  t cortex_trials;
  ph text := regexp_replace(coalesce(p_phone, ''), '[^0-9+]', '', 'g');
  nm text := left(trim(coalesce(p_name, '')), 60);
  gid uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into t from cortex_trials where code = upper(trim(p_code));
  if t.id is null or t.closed or t.closes_at <= now() then raise exception 'trial closed'; end if;
  if char_length(nm) < 1 then raise exception 'bad guest name'; end if;
  if (select count(*) from cortex_trial_guests where trial_id = t.id) >= 200
     and not exists (select 1 from cortex_trial_guests where trial_id = t.id and user_id = uid) then raise exception 'trial full'; end if;
  if not coalesce(p_consent, false) or char_length(ph) not between 8 and 15 then ph := null; end if;
  insert into cortex_trial_guests (trial_id, user_id, name, phone)
  values (t.id, uid, nm, ph)
  on conflict (trial_id, user_id) do update set name = excluded.name, phone = coalesce(excluded.phone, cortex_trial_guests.phone)
  returning id into gid;
  return jsonb_build_object('guest', gid, 'title', t.title);
end;
$$;

-- When the guest's placement test is finished, tie it to their entry (by its public score code).
create or replace function public.classroom_trial_attach(p_code text, p_score text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  tid uuid;
  sid uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select id into tid from cortex_trials where code = upper(trim(p_code));
  select id into sid from lexica_placement_sessions where code = trim(p_score) and user_id = uid and finished_at is not null;
  if sid is null then raise exception 'no such placement'; end if;
  update cortex_trial_guests set placement_session = sid where trial_id = tid and user_id = uid;
  return jsonb_build_object('ok', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'classroom_trial_create(uuid, text, uuid, int)', 'classroom_trial_close(uuid)', 'classroom_trials_list(uuid)',
    'classroom_trial_guest_update(uuid, text, boolean)', 'classroom_trial_register(text, text, text, boolean)', 'classroom_trial_attach(text, text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.classroom_trial_info(text) from public;
  grant execute on function public.classroom_trial_info(text) to anon, authenticated;
  revoke all on function public.classroom_in_org(uuid) from public, anon, authenticated;
end $$;

notify pgrst, 'reload schema';
