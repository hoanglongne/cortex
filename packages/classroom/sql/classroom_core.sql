-- Cortex Classroom core (docs/CLASSROOM.md): centers, staff, invitations,
-- classes and members, shared by every Cortex app that takes part in
-- classes. What an app assigns and what it reports live in its module
-- (packages/classroom-<app>/sql/classroom_<app>.sql); the core stores them
-- as JSON and asks the module, through its hook functions, to clean them.
--
-- Every read and write goes through the security definer functions below
-- (prefix classroom_); tables have RLS on and no client policies.
--
-- Run once on a project that ran the old Lexica class migrations
-- (apps/lexica/supabase/archive/migration_classes*.sql): their data moves
-- into the cortex_ tables and the old tables and functions go. Safe to re-run.
--
-- Make yourself the system admin once (your sign-in email):
--   insert into cortex_staff (user_id, role)
--   select id, 'admin' from auth.users where lower(email) = lower('you@example.com')
--   on conflict (user_id) do update set role = 'admin';

-- ── tables ──────────────────────────────────────────────────────────────

-- Apps that take part in classes; each module registers itself here.
create table if not exists cortex_apps (
  id text primary key check (id ~ '^[a-z][a-z0-9_]{1,20}$'),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists cortex_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  seats int not null default 30 check (seats between 1 and 5000),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists cortex_org_members (
  org_id uuid not null references cortex_orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher')),
  primary key (org_id, user_id)
);

-- System admins (create centers, grant independent teachers) and independent teachers.
create table if not exists cortex_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','indie')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists cortex_invites (
  token text primary key,
  kind text not null check (kind in ('org_admin','org_teacher','indie')),
  org_id uuid references cortex_orgs(id) on delete cascade,
  note text check (char_length(note) <= 80),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists cortex_invites_org_idx on cortex_invites (org_id, created_at desc);

create table if not exists cortex_classes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references cortex_orgs(id) on delete set null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  code text not null unique,
  -- Apps this class uses, and each app's own settings: {"lexica": {"branch": "cert"}}.
  apps text[] not null default '{}',
  settings jsonb not null default '{}',
  leaderboard boolean not null default false,
  leaderboard_app text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists cortex_class_members (
  class_id uuid not null references cortex_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  note text check (char_length(note) <= 500),
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

-- Work a teacher gives: which app, what kind, and the app's own payload.
create table if not exists cortex_class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references cortex_classes(id) on delete cascade,
  app text not null references cortex_apps(id),
  kind text not null check (kind ~ '^[a-z][a-z0-9_]{1,30}$'),
  title text not null check (char_length(title) between 1 and 80),
  payload jsonb not null default '{}',
  due_on date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists cortex_class_assignments_class_idx on cortex_class_assignments (class_id, created_at);

-- What a student's app reports, per class and app (the latest), and one snapshot per day.
create table if not exists cortex_class_activity (
  class_id uuid not null references cortex_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  app text not null references cortex_apps(id),
  metrics jsonb not null default '{}',
  streak int not null default 0,
  last_active date,
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id, app)
);

create table if not exists cortex_class_activity_daily (
  class_id uuid not null references cortex_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  app text not null references cortex_apps(id),
  date date not null,
  metrics jsonb not null,
  primary key (class_id, user_id, app, date)
);

alter table cortex_apps enable row level security;
alter table cortex_orgs enable row level security;
alter table cortex_org_members enable row level security;
alter table cortex_staff enable row level security;
alter table cortex_invites enable row level security;
alter table cortex_classes enable row level security;
alter table cortex_class_members enable row level security;
alter table cortex_class_assignments enable row level security;
alter table cortex_class_activity enable row level security;
alter table cortex_class_activity_daily enable row level security;

-- Lexica was the first app; its module (classroom_lexica.sql) fills in the rest.
insert into cortex_apps (id, name) values ('lexica', 'Lexica') on conflict (id) do nothing;

-- ── moving the old Lexica class data, once ──────────────────────────────

do $$
begin
  if to_regclass('public.lexica_classes') is null then return; end if;

  insert into cortex_orgs (id, name, seats, owner_id, created_at)
  select id, name, seats, owner_id, created_at from lexica_orgs on conflict (id) do nothing;
  insert into cortex_org_members (org_id, user_id, role)
  select org_id, user_id, role from lexica_org_members on conflict do nothing;
  if to_regclass('public.lexica_staff') is not null then
    insert into cortex_staff (user_id, role, granted_by, created_at)
    select user_id, role, granted_by, created_at from lexica_staff on conflict (user_id) do nothing;
  end if;
  if to_regclass('public.lexica_invites') is not null then
    insert into cortex_invites (token, kind, org_id, note, created_by, expires_at, used_by, used_at, created_at)
    select token, kind, org_id, note, created_by, expires_at, used_by, used_at, created_at from lexica_invites on conflict (token) do nothing;
  end if;

  execute $m$
    insert into cortex_classes (id, org_id, teacher_id, name, code, apps, settings, leaderboard, leaderboard_app, archived, created_at)
    select id, org_id, teacher_id, name, code, array['lexica'],
      jsonb_build_object('lexica', jsonb_strip_nulls(jsonb_build_object('branch', branch, 'level', level))),
      coalesce(to_jsonb(c)->>'leaderboard', 'false')::boolean, 'lexica', archived, created_at
    from lexica_classes c on conflict (id) do nothing
  $m$;
  execute $m$
    insert into cortex_class_members (class_id, user_id, display_name, note, joined_at)
    select class_id, user_id, display_name, to_jsonb(m)->>'note', joined_at from lexica_class_members m on conflict do nothing
  $m$;
  execute $m$
    insert into cortex_class_assignments (id, class_id, app, kind, title, payload, due_on, created_by, created_at)
    select id, class_id, 'lexica', 'words', title,
      jsonb_build_object('card_ids', to_jsonb(card_ids), 'missing_words', to_jsonb(missing_words), 'mode', coalesce(to_jsonb(a)->>'mode', 'only')),
      (to_jsonb(a)->>'due_on')::date, created_by, created_at
    from lexica_class_assignments a on conflict (id) do nothing
  $m$;
  execute $m$
    insert into cortex_class_activity (class_id, user_id, app, metrics, streak, last_active, updated_at)
    select class_id, user_id, 'lexica',
      jsonb_build_object('counts', counts, 'assigned', assigned, 'words', coalesce(to_jsonb(p)->'words', '{}'::jsonb)),
      streak, last_active, updated_at
    from lexica_class_progress p on conflict do nothing
  $m$;
  insert into cortex_class_activity_daily (class_id, user_id, app, date, metrics)
  select class_id, user_id, 'lexica', date, jsonb_build_object('counts', counts, 'assigned', assigned)
  from lexica_class_progress_daily on conflict do nothing;

  -- Lexica's word requests now point at the new classes table.
  if to_regclass('public.lexica_word_requests') is not null then
    alter table lexica_word_requests drop constraint if exists lexica_word_requests_class_id_fkey;
    alter table lexica_word_requests add constraint lexica_word_requests_class_id_fkey
      foreign key (class_id) references cortex_classes(id) on delete set null;
  end if;

  drop table if exists lexica_class_progress_daily, lexica_class_progress, lexica_class_assignments,
    lexica_class_members, lexica_invites, lexica_classes, lexica_org_members, lexica_staff, lexica_orgs cascade;
end $$;

-- The old functions (Lexica-only class system).
drop function if exists public.lexica_class_code(), public.lexica_can_teach(uuid), public.lexica_org_create(text),
  public.lexica_org_add_teacher(uuid, text), public.lexica_org_overview(uuid), public.lexica_class_create(text, text, text, uuid),
  public.lexica_class_join(text, text), public.lexica_class_leave(uuid), public.lexica_my_classes(), public.lexica_my_orgs(),
  public.lexica_class_report(jsonb, int, jsonb), public.lexica_class_report(jsonb, int, jsonb, jsonb), public.lexica_class_board(uuid),
  public.lexica_class_leaderboard(uuid), public.lexica_class_assign(uuid, text, text[], text[]),
  public.lexica_class_assign(uuid, text, text[], text[], date, text), public.lexica_class_unassign(uuid),
  public.lexica_is_admin(), public.lexica_is_org_admin(uuid), public.lexica_whoami(), public.lexica_org_update(uuid, text, int),
  public.lexica_admin_overview(), public.lexica_indie_revoke(uuid), public.lexica_invite_create(text, uuid, text, int),
  public.lexica_invite_info(text), public.lexica_invite_accept(text), public.lexica_invites_open(uuid), public.lexica_invite_revoke(text),
  public.lexica_org_remove_member(uuid, uuid), public.lexica_class_update(uuid, text, text, text, boolean, boolean),
  public.lexica_class_new_code(uuid), public.lexica_class_assignment_update(uuid, text, date, boolean, text),
  public.lexica_class_member_update(uuid, uuid, text, boolean);

-- ── helpers ─────────────────────────────────────────────────────────────

-- Days are Vietnamese days: a learning day ends at midnight in Hà Nội.
create or replace function public.cortex_today()
returns date language sql stable as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

create or replace function public.classroom_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from cortex_classes where code = c);
  end loop;
  return c;
end;
$$;

create or replace function public.classroom_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from cortex_staff where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.classroom_is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select classroom_is_admin() or exists (
    select 1 from cortex_org_members where org_id = p_org and user_id = auth.uid() and role = 'admin'
  );
$$;

-- The teacher of a class, an admin of its center, or a system admin (support).
create or replace function public.classroom_can_teach(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from cortex_classes c
    where c.id = p_class and (
      c.teacher_id = auth.uid()
      or exists (select 1 from cortex_org_members m where m.org_id = c.org_id and m.user_id = auth.uid() and m.role = 'admin')
      or exists (select 1 from cortex_staff s where s.user_id = auth.uid() and s.role = 'admin')
    )
  );
$$;

-- A module hook (docs/CLASSROOM.md, "SQL hooks"): classroom_<app>_<hook>, called only
-- for registered apps, so an app id can never name another function.
create or replace function public.classroom_hook_name(p_app text, p_hook text)
returns text language plpgsql stable set search_path = public as $$
begin
  if p_app is null or p_app !~ '^[a-z][a-z0-9_]{1,20}$' or not exists (select 1 from cortex_apps where id = p_app) then
    raise exception 'unknown app';
  end if;
  if to_regprocedure(format('public.classroom_%s_%s', p_app, p_hook) ||
      case p_hook
        when 'clean_payload' then '(text, jsonb)'
        when 'clean_metrics' then '(uuid, jsonb)'
        when 'rank' then '(jsonb)'
        when 'after_assign' then '(uuid, uuid, jsonb)'
        when 'clean_settings' then '(jsonb)'
      end) is null then
    return null;
  end if;
  return format('classroom_%s_%s', p_app, p_hook);
end;
$$;

-- Apps a class may use: registered, no duplicates.
create or replace function public.classroom_clean_apps(p_apps text[])
returns text[] language sql stable set search_path = public as $$
  select coalesce(array_agg(distinct a order by a), '{}') from unnest(coalesce(p_apps, '{}')) a
  where exists (select 1 from cortex_apps where id = a);
$$;

-- Each app's settings, cleaned by its module (unknown keys dropped).
create or replace function public.classroom_clean_settings(p_apps text[], p_settings jsonb)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  a text;
  hook text;
  out jsonb := '{}';
  s jsonb;
begin
  foreach a in array p_apps loop
    s := coalesce(p_settings -> a, '{}'::jsonb);
    hook := classroom_hook_name(a, 'clean_settings');
    if hook is not null then execute format('select %I($1)', hook) into s using s; else s := '{}'::jsonb; end if;
    out := out || jsonb_build_object(a, s);
  end loop;
  return out;
end;
$$;

-- ── who is who ──────────────────────────────────────────────────────────

-- What the teacher app may show this person; empty roles = only the "contact us" page.
create or replace function public.classroom_whoami()
returns jsonb language sql stable security definer set search_path = public, auth as $$
  select jsonb_build_object(
    'email', (select email from auth.users where id = auth.uid()),
    'admin', exists (select 1 from cortex_staff where user_id = auth.uid() and role = 'admin'),
    'indie', exists (select 1 from cortex_staff where user_id = auth.uid() and role in ('indie','admin')),
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'role', m.role, 'seats', o.seats) order by o.name)
      from cortex_org_members m join cortex_orgs o on o.id = m.org_id where m.user_id = auth.uid()
    ), '[]'::jsonb),
    'apps', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by created_at) from cortex_apps), '[]'::jsonb)
  );
$$;

-- ── centers (system admin) ──────────────────────────────────────────────

create or replace function public.classroom_org_create(p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  oid uuid;
begin
  if not classroom_is_admin() then raise exception 'not an admin'; end if;
  insert into cortex_orgs (name, owner_id) values (trim(p_name), auth.uid()) returning id into oid;
  return jsonb_build_object('id', oid);
end;
$$;

create or replace function public.classroom_org_update(p_org uuid, p_name text default null, p_seats int default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_seats is not null and not classroom_is_admin() then raise exception 'not an admin'; end if;
  if p_name is not null and not classroom_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  update cortex_orgs set name = coalesce(nullif(trim(p_name), ''), name), seats = coalesce(p_seats, seats) where id = p_org;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.classroom_admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not classroom_is_admin() then raise exception 'not an admin'; end if;
  return jsonb_build_object(
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'name', o.name, 'seats', o.seats, 'created_at', o.created_at,
        'used', (select count(distinct m.user_id) from cortex_class_members m join cortex_classes c on c.id = m.class_id where c.org_id = o.id and not c.archived),
        'admins', (select count(*) from cortex_org_members where org_id = o.id and role = 'admin'),
        'teachers', (select count(*) from cortex_org_members where org_id = o.id),
        'classes', (select count(*) from cortex_classes where org_id = o.id and not archived)
      ) order by o.created_at desc)
      from cortex_orgs o
    ), '[]'::jsonb),
    'indie', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', s.user_id, 'email', u.email, 'since', s.created_at,
        'classes', (select count(*) from cortex_classes c where c.teacher_id = s.user_id and c.org_id is null and not c.archived)
      ) order by s.created_at desc)
      from cortex_staff s join auth.users u on u.id = s.user_id where s.role = 'indie'
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.classroom_indie_revoke(p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_is_admin() then raise exception 'not an admin'; end if;
  delete from cortex_staff where user_id = p_user and role = 'indie';
  return jsonb_build_object('ok', true);
end;
$$;

-- ── invitations ─────────────────────────────────────────────────────────

-- org_admin and indie: system admin only; org_teacher: an admin of that center.
create or replace function public.classroom_invite_create(p_kind text, p_org uuid default null, p_note text default null, p_days int default 7)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  -- Two random UUIDs: 244 random bits, no extension needed.
  t text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_kind = 'indie' then
    if not classroom_is_admin() then raise exception 'not an admin'; end if;
    p_org := null;
  elsif p_kind = 'org_admin' then
    if not classroom_is_admin() or p_org is null then raise exception 'not an admin'; end if;
  elsif p_kind = 'org_teacher' then
    if p_org is null or not classroom_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  else
    raise exception 'bad invite';
  end if;
  insert into cortex_invites (token, kind, org_id, note, created_by, expires_at)
  values (t, p_kind, p_org, nullif(trim(p_note), ''), auth.uid(), now() + make_interval(days => least(greatest(coalesce(p_days, 7), 1), 30)));
  return jsonb_build_object('token', t);
end;
$$;

-- What an invitation is for, shown before signing in. Says nothing about who sent it.
create or replace function public.classroom_invite_info(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object('kind', i.kind, 'org', (select name from cortex_orgs where id = i.org_id), 'valid', i.used_at is null and i.expires_at > now())
    from cortex_invites i where i.token = p_token
  ), jsonb_build_object('valid', false));
$$;

create or replace function public.classroom_invite_accept(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  inv cortex_invites;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into inv from cortex_invites where token = p_token for update;
  if inv.token is null or inv.used_at is not null or inv.expires_at <= now() then raise exception 'invite expired'; end if;
  if inv.kind = 'indie' then
    insert into cortex_staff (user_id, role, granted_by) values (uid, 'indie', inv.created_by) on conflict (user_id) do nothing;
  else
    insert into cortex_org_members (org_id, user_id, role)
    values (inv.org_id, uid, case when inv.kind = 'org_admin' then 'admin' else 'teacher' end)
    on conflict (org_id, user_id) do update set role = case when excluded.role = 'admin' then 'admin' else cortex_org_members.role end;
  end if;
  update cortex_invites set used_by = uid, used_at = now() where token = p_token;
  return jsonb_build_object('kind', inv.kind, 'org_id', inv.org_id);
end;
$$;

create or replace function public.classroom_invites_open(p_org uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if (p_org is null and not classroom_is_admin()) or (p_org is not null and not classroom_is_org_admin(p_org)) then
    raise exception 'not an admin';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('token', i.token, 'kind', i.kind, 'note', i.note, 'expires_at', i.expires_at, 'org', (select name from cortex_orgs where id = i.org_id)) order by i.created_at desc)
    from cortex_invites i
    where i.used_at is null and i.expires_at > now()
      and ((p_org is null and i.kind in ('indie','org_admin')) or i.org_id = p_org)
  ), '[]'::jsonb);
end;
$$;

create or replace function public.classroom_invite_revoke(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  inv cortex_invites;
begin
  select * into inv from cortex_invites where token = p_token;
  if inv.token is null then return jsonb_build_object('ok', true); end if;
  if not (classroom_is_admin() or (inv.org_id is not null and classroom_is_org_admin(inv.org_id))) then raise exception 'not an admin'; end if;
  delete from cortex_invites where token = p_token and used_at is null;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── a center (its admins) ───────────────────────────────────────────────

create or replace function public.classroom_org_overview(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not classroom_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  return (
    select jsonb_build_object(
      'id', o.id, 'name', o.name, 'seats', o.seats,
      'used', (select count(distinct m.user_id) from cortex_class_members m join cortex_classes c on c.id = m.class_id where c.org_id = o.id and not c.archived),
      'people', coalesce((
        select jsonb_agg(jsonb_build_object(
          'user_id', m.user_id, 'email', u.email, 'role', m.role,
          'classes', (select count(*) from cortex_classes c where c.org_id = o.id and c.teacher_id = m.user_id and not c.archived)
        ) order by m.role, u.email)
        from cortex_org_members m join auth.users u on u.id = m.user_id where m.org_id = o.id
      ), '[]'::jsonb),
      'classes', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', c.id, 'name', c.name, 'apps', c.apps,
          'teacher', (select email from auth.users where id = c.teacher_id),
          'members', (select count(*) from cortex_class_members where class_id = c.id),
          'active_week', (select count(distinct a.user_id) from cortex_class_activity a where a.class_id = c.id and a.last_active >= cortex_today() - 6)
        ) order by c.created_at)
        from cortex_classes c where c.org_id = o.id and not c.archived
      ), '[]'::jsonb)
    )
    from cortex_orgs o where o.id = p_org
  );
end;
$$;

-- A center admin removes a teacher (their classes stay, now run by the center's admins).
create or replace function public.classroom_org_remove_member(p_org uuid, p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  if p_user = auth.uid() then raise exception 'not yourself'; end if;
  delete from cortex_org_members where org_id = p_org and user_id = p_user;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── classes ─────────────────────────────────────────────────────────────

-- In a center: any of its members. Outside one: independent teachers and system admins.
create or replace function public.classroom_class_create(p_name text, p_apps text[], p_settings jsonb default '{}', p_org uuid default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  v_apps text[] := classroom_clean_apps(p_apps);
  cid uuid;
  c text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_org is not null then
    if not exists (select 1 from cortex_org_members where org_id = p_org and user_id = uid) then raise exception 'not in this center'; end if;
  elsif not exists (select 1 from cortex_staff where user_id = uid) then
    raise exception 'not a teacher';
  end if;
  if coalesce(array_length(v_apps, 1), 0) = 0 then raise exception 'no apps'; end if;
  c := classroom_code();
  insert into cortex_classes (org_id, teacher_id, name, code, apps, settings, leaderboard_app)
  values (p_org, uid, trim(p_name), c, v_apps, classroom_clean_settings(v_apps, p_settings), v_apps[1])
  returning id into cid;
  return jsonb_build_object('id', cid, 'code', c);
end;
$$;

create or replace function public.classroom_class_update(p_class uuid, p_name text default null, p_apps text[] default null, p_settings jsonb default null,
  p_leaderboard boolean default null, p_leaderboard_app text default null, p_archived boolean default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cls cortex_classes;
  v_apps text[];
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  select * into cls from cortex_classes where id = p_class;
  v_apps := case when p_apps is null then cls.apps else classroom_clean_apps(p_apps) end;
  if coalesce(array_length(v_apps, 1), 0) = 0 then raise exception 'no apps'; end if;
  update cortex_classes set
    name = coalesce(nullif(trim(p_name), ''), name),
    apps = v_apps,
    -- Settings of apps still on: the new ones where given, else the old ones.
    settings = classroom_clean_settings(v_apps, cls.settings || coalesce(p_settings, '{}'::jsonb)),
    leaderboard = coalesce(p_leaderboard, leaderboard),
    leaderboard_app = case when coalesce(p_leaderboard_app, leaderboard_app) = any(v_apps) then coalesce(p_leaderboard_app, leaderboard_app) else v_apps[1] end,
    archived = coalesce(p_archived, archived)
  where id = p_class;
  return jsonb_build_object('ok', true);
end;
$$;

-- A new code (the old one stops working: for a code that leaked).
create or replace function public.classroom_class_new_code(p_class uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c text := classroom_code();
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update cortex_classes set code = c where id = p_class;
  return jsonb_build_object('code', c);
end;
$$;

create or replace function public.classroom_class_join(p_code text, p_display_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cls cortex_classes;
  seats int;
  used int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into cls from cortex_classes where code = upper(trim(p_code)) and not archived;
  if cls.id is null then raise exception 'no such class'; end if;
  -- The class's teacher (or the center's admin) teaches it; they do not join it as a student.
  if classroom_can_teach(cls.id) then raise exception 'own class'; end if;
  if exists (select 1 from cortex_class_members where class_id = cls.id and user_id = uid) then
    update cortex_class_members set display_name = trim(p_display_name) where class_id = cls.id and user_id = uid;
    return jsonb_build_object('class_id', cls.id, 'name', cls.name, 'apps', cls.apps);
  end if;
  -- Seats: a center's limit across its classes; an independent teacher gets 60 per class.
  if cls.org_id is not null then
    select o.seats into seats from cortex_orgs o where o.id = cls.org_id;
    select count(distinct m.user_id) into used from cortex_class_members m join cortex_classes c on c.id = m.class_id
    where c.org_id = cls.org_id and not c.archived;
    if used >= seats and not exists (
      select 1 from cortex_class_members m join cortex_classes c on c.id = m.class_id where c.org_id = cls.org_id and m.user_id = uid
    ) then raise exception 'no seats'; end if;
  elsif (select count(*) from cortex_class_members where class_id = cls.id) >= 60 then
    raise exception 'no seats';
  end if;
  insert into cortex_class_members (class_id, user_id, display_name) values (cls.id, uid, trim(p_display_name));
  return jsonb_build_object('class_id', cls.id, 'name', cls.name, 'apps', cls.apps);
end;
$$;

create or replace function public.classroom_class_leave(p_class uuid)
returns jsonb language sql volatile security definer set search_path = public as $$
  with gone as (delete from cortex_class_members where class_id = p_class and user_id = auth.uid() returning 1),
       act as (delete from cortex_class_activity where class_id = p_class and user_id = auth.uid() returning 1)
  select jsonb_build_object('left', (select count(*) from gone) > 0);
$$;

-- Classes the user is in or teaches, with every app's assignments (the code only for teachers).
-- p_app: only classes using this app (a learning app asks for its own).
create or replace function public.classroom_my_classes(p_app text default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(item order by item->>'created_at'), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', c.id, 'name', c.name, 'apps', c.apps, 'settings', c.settings,
      'org_id', c.org_id, 'org', (select name from cortex_orgs where id = c.org_id),
      'created_at', c.created_at, 'leaderboard', c.leaderboard, 'leaderboard_app', c.leaderboard_app,
      'role', case when classroom_can_teach(c.id) and not exists (select 1 from cortex_class_members m where m.class_id = c.id and m.user_id = auth.uid()) then 'teacher' else 'student' end,
      'code', case when classroom_can_teach(c.id) then c.code end,
      'members', (select count(*) from cortex_class_members where class_id = c.id),
      'assignments', coalesce((
        select jsonb_agg(jsonb_build_object('id', a.id, 'app', a.app, 'kind', a.kind, 'title', a.title, 'payload', a.payload, 'due_on', a.due_on, 'created_at', a.created_at) order by a.created_at desc)
        from cortex_class_assignments a where a.class_id = c.id and (p_app is null or a.app = p_app)
      ), '[]'::jsonb)
    ) as item
    from cortex_classes c
    where not c.archived
      and (p_app is null or p_app = any(c.apps))
      and (
        c.teacher_id = auth.uid()
        or exists (select 1 from cortex_org_members om where om.org_id = c.org_id and om.user_id = auth.uid() and om.role = 'admin')
        or exists (select 1 from cortex_class_members m where m.class_id = c.id and m.user_id = auth.uid())
      )
  ) t;
$$;

-- A student's app reports its own numbers to every class that uses it; the module cleans them per class.
create or replace function public.classroom_report(p_app text, p_metrics jsonb, p_streak int default 0)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  hook text := classroom_hook_name(p_app, 'clean_metrics');
  m record;
  n int := 0;
  clean jsonb;
begin
  if uid is null then return jsonb_build_object('classes', 0); end if;
  if hook is null then raise exception 'app has no clean_metrics'; end if;
  for m in
    select cm.class_id from cortex_class_members cm join cortex_classes c on c.id = cm.class_id
    where cm.user_id = uid and p_app = any(c.apps) and not c.archived
  loop
    execute format('select %I($1, $2)', hook) into clean using m.class_id, coalesce(p_metrics, '{}'::jsonb);
    insert into cortex_class_activity (class_id, user_id, app, metrics, streak, last_active, updated_at)
    values (m.class_id, uid, p_app, clean, least(greatest(coalesce(p_streak, 0), 0), 10000), cortex_today(), now())
    on conflict (class_id, user_id, app) do update set
      metrics = excluded.metrics, streak = excluded.streak, last_active = excluded.last_active, updated_at = now();
    insert into cortex_class_activity_daily (class_id, user_id, app, date, metrics)
    values (m.class_id, uid, p_app, cortex_today(), clean)
    on conflict (class_id, user_id, app, date) do update set metrics = excluded.metrics;
    n := n + 1;
  end loop;
  return jsonb_build_object('classes', n);
end;
$$;

-- The teacher's board: the class, its assignments, each student with every app's numbers now and a week ago.
create or replace function public.classroom_class_board(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return (
    select jsonb_build_object(
      'class', (
        select jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code, 'apps', c.apps, 'settings', c.settings,
          'leaderboard', c.leaderboard, 'leaderboard_app', c.leaderboard_app, 'org_id', c.org_id, 'created_at', c.created_at,
          'org', (select name from cortex_orgs where id = c.org_id))
        from cortex_classes c where c.id = p_class
      ),
      'assignments', coalesce((
        select jsonb_agg(jsonb_build_object('id', a.id, 'app', a.app, 'kind', a.kind, 'title', a.title, 'payload', a.payload, 'due_on', a.due_on, 'created_at', a.created_at) order by a.created_at desc)
        from cortex_class_assignments a where a.class_id = p_class
      ), '[]'::jsonb),
      'students', coalesce((
        select jsonb_agg(jsonb_build_object(
          'user_id', m.user_id,
          'name', m.display_name,
          'joined_at', m.joined_at,
          'note', m.note,
          'streak', coalesce((select max(streak) from cortex_class_activity a where a.class_id = p_class and a.user_id = m.user_id), 0),
          'last_active', (select max(last_active) from cortex_class_activity a where a.class_id = p_class and a.user_id = m.user_id),
          'inactive_days', (select cortex_today() - max(last_active) from cortex_class_activity a where a.class_id = p_class and a.user_id = m.user_id),
          'days', (
            select coalesce(jsonb_agg(distinct d.date), '[]'::jsonb) from cortex_class_activity_daily d
            where d.class_id = p_class and d.user_id = m.user_id and d.date > cortex_today() - 30
          ),
          'apps', coalesce((
            select jsonb_object_agg(a.app, jsonb_build_object(
              'metrics', a.metrics,
              'last_active', a.last_active,
              'week_ago', (select d.metrics from cortex_class_activity_daily d where d.class_id = p_class and d.user_id = m.user_id and d.app = a.app and d.date <= cortex_today() - 7 order by d.date desc limit 1),
              'week_first', (select d.metrics from cortex_class_activity_daily d where d.class_id = p_class and d.user_id = m.user_id and d.app = a.app and d.date > cortex_today() - 7 order by d.date asc limit 1)
            ))
            from cortex_class_activity a where a.class_id = p_class and a.user_id = m.user_id
          ), '{}'::jsonb)
        ) order by m.display_name)
        from cortex_class_members m where m.class_id = p_class
      ), '[]'::jsonb)
    )
  );
end;
$$;

-- Students see the ranking only when the teacher turned it on; the module scores it.
create or replace function public.classroom_class_leaderboard(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  cls cortex_classes;
  hook text;
  out jsonb;
begin
  if not (classroom_can_teach(p_class) or exists (select 1 from cortex_class_members where class_id = p_class and user_id = auth.uid())) then
    raise exception 'not in this class';
  end if;
  select * into cls from cortex_classes where id = p_class;
  if not classroom_can_teach(p_class) and not cls.leaderboard then return '[]'::jsonb; end if;
  hook := classroom_hook_name(cls.leaderboard_app, 'rank');
  if hook is null then return '[]'::jsonb; end if;
  execute format($q$
    select coalesce(jsonb_agg(jsonb_build_object('name', r.name, 'score', r.score, 'me', r.me) order by r.score desc, r.name), '[]'::jsonb)
    from (
      select m.display_name as name, coalesce(%I(a.metrics), 0) as score, m.user_id = auth.uid() as me
      from cortex_class_members m
      left join cortex_class_activity a on a.class_id = m.class_id and a.user_id = m.user_id and a.app = $2
      where m.class_id = $1
    ) r
  $q$, hook) into out using p_class, cls.leaderboard_app;
  return out;
end;
$$;

-- Giving work: the app must be on for the class; its module cleans the payload, then may act on it.
create or replace function public.classroom_assign(p_class uuid, p_app text, p_kind text, p_title text, p_payload jsonb, p_due date default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  clean_hook text := classroom_hook_name(p_app, 'clean_payload');
  after_hook text := classroom_hook_name(p_app, 'after_assign');
  clean jsonb;
  aid uuid;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if not exists (select 1 from cortex_classes where id = p_class and p_app = any(apps)) then raise exception 'app not in class'; end if;
  if clean_hook is null then raise exception 'app has no clean_payload'; end if;
  execute format('select %I($1, $2)', clean_hook) into clean using p_kind, coalesce(p_payload, '{}'::jsonb);
  insert into cortex_class_assignments (class_id, app, kind, title, payload, due_on, created_by)
  values (p_class, p_app, p_kind, trim(p_title), clean, p_due, auth.uid()) returning id into aid;
  if after_hook is not null then execute format('select %I($1, $2, $3)', after_hook) using p_class, aid, clean; end if;
  return jsonb_build_object('id', aid, 'payload', clean);
end;
$$;

create or replace function public.classroom_assignment_update(p_assignment uuid, p_title text default null, p_due date default null, p_clear_due boolean default false, p_payload jsonb default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  a cortex_class_assignments;
  clean jsonb;
begin
  select * into a from cortex_class_assignments where id = p_assignment;
  if a.id is null or not classroom_can_teach(a.class_id) then raise exception 'not the teacher'; end if;
  if p_payload is not null then
    execute format('select %I($1, $2)', classroom_hook_name(a.app, 'clean_payload')) into clean using a.kind, a.payload || p_payload;
  end if;
  update cortex_class_assignments set
    title = coalesce(nullif(trim(p_title), ''), title),
    due_on = case when p_clear_due then null else coalesce(p_due, due_on) end,
    payload = coalesce(clean, payload)
  where id = p_assignment;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.classroom_unassign(p_assignment uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cid uuid;
begin
  select class_id into cid from cortex_class_assignments where id = p_assignment;
  if cid is null or not classroom_can_teach(cid) then raise exception 'not the teacher'; end if;
  delete from cortex_class_assignments where id = p_assignment;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.classroom_member_update(p_class uuid, p_user uuid, p_note text default null, p_remove boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if p_remove then
    delete from cortex_class_activity where class_id = p_class and user_id = p_user;
    delete from cortex_class_members where class_id = p_class and user_id = p_user;
  else
    update cortex_class_members set note = nullif(trim(p_note), '') where class_id = p_class and user_id = p_user;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── grants ──────────────────────────────────────────────────────────────

do $$
declare f text;
begin
  foreach f in array array[
    'classroom_whoami()', 'classroom_org_create(text)', 'classroom_org_update(uuid, text, int)', 'classroom_admin_overview()',
    'classroom_indie_revoke(uuid)', 'classroom_invite_create(text, uuid, text, int)', 'classroom_invite_accept(text)',
    'classroom_invites_open(uuid)', 'classroom_invite_revoke(text)', 'classroom_org_overview(uuid)', 'classroom_org_remove_member(uuid, uuid)',
    'classroom_class_create(text, text[], jsonb, uuid)', 'classroom_class_update(uuid, text, text[], jsonb, boolean, text, boolean)',
    'classroom_class_new_code(uuid)', 'classroom_class_join(text, text)', 'classroom_class_leave(uuid)', 'classroom_my_classes(text)',
    'classroom_report(text, jsonb, int)', 'classroom_class_board(uuid)', 'classroom_class_leaderboard(uuid)',
    'classroom_assign(uuid, text, text, text, jsonb, date)', 'classroom_assignment_update(uuid, text, date, boolean, jsonb)',
    'classroom_unassign(uuid)', 'classroom_member_update(uuid, uuid, text, boolean)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.classroom_invite_info(text) from public;
  grant execute on function public.classroom_invite_info(text) to anon, authenticated;
  foreach f in array array['classroom_is_admin()', 'classroom_is_org_admin(uuid)', 'classroom_can_teach(uuid)',
    'classroom_hook_name(text, text)', 'classroom_clean_apps(text[])', 'classroom_clean_settings(text[], jsonb)', 'classroom_code()'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
