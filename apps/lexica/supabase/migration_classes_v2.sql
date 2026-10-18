-- Lexica for classes, v2 (Claude Doc "Lexica Lớp học — thiết kế"): the
-- teacher app on its own subdomain, entered only by invitation.
--
-- - lexica_staff: system admins (create centers, grant independent teachers)
--   and independent teachers (classes outside any center).
-- - lexica_invites: one-use links with a role, a center and an expiry.
-- - Classes: leaderboard on/off (off by default); assignments with a due
--   date and a mode ('only': the lesson's words alone; 'mixed'); a private
--   note per student; per-word progress on assigned words.
--
-- Requires migration_classes.sql. Safe to re-run. After the first run, make
-- yourself the system admin once (your Lexica sign-in email):
--   insert into lexica_staff (user_id, role)
--   select id, 'admin' from auth.users where lower(email) = lower('you@example.com')
--   on conflict (user_id) do update set role = 'admin';

create table if not exists lexica_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','indie')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists lexica_invites (
  token text primary key,
  kind text not null check (kind in ('org_admin','org_teacher','indie')),
  org_id uuid references lexica_orgs(id) on delete cascade,
  note text check (char_length(note) <= 80),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists lexica_invites_org_idx on lexica_invites (org_id, created_at desc);

alter table lexica_staff enable row level security;
alter table lexica_invites enable row level security;

alter table lexica_classes add column if not exists leaderboard boolean not null default false;
alter table lexica_class_assignments add column if not exists due_on date;
alter table lexica_class_assignments add column if not exists mode text not null default 'only';
do $$ begin
  alter table lexica_class_assignments add constraint lexica_class_assignments_mode check (mode in ('only','mixed'));
exception when duplicate_object then null; end $$;
alter table lexica_class_members add column if not exists note text;
do $$ begin
  alter table lexica_class_members add constraint lexica_class_members_note check (char_length(note) <= 500);
exception when duplicate_object then null; end $$;
-- Per assigned word, the furthest step: 1 Hiểu … 4 Dùng, 5 used in real life (Đời).
alter table lexica_class_progress add column if not exists words jsonb not null default '{}';

-- ── who is who ──────────────────────────────────────────────────────────

create or replace function public.lexica_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from lexica_staff where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.lexica_is_org_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select lexica_is_admin() or exists (
    select 1 from lexica_org_members where org_id = p_org and user_id = auth.uid() and role = 'admin'
  );
$$;

-- The teacher of a class, an admin of its center, or a system admin (support).
create or replace function public.lexica_can_teach(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from lexica_classes c
    where c.id = p_class and (
      c.teacher_id = auth.uid()
      or exists (select 1 from lexica_org_members m where m.org_id = c.org_id and m.user_id = auth.uid() and m.role = 'admin')
      or exists (select 1 from lexica_staff s where s.user_id = auth.uid() and s.role = 'admin')
    )
  );
$$;

-- What the teacher app may show this person; empty roles = only the "contact us" page.
create or replace function public.lexica_whoami()
returns jsonb language sql stable security definer set search_path = public, auth as $$
  select jsonb_build_object(
    'email', (select email from auth.users where id = auth.uid()),
    'admin', exists (select 1 from lexica_staff where user_id = auth.uid() and role = 'admin'),
    'indie', exists (select 1 from lexica_staff where user_id = auth.uid() and role in ('indie','admin')),
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'role', m.role, 'seats', o.seats) order by o.name)
      from lexica_org_members m join lexica_orgs o on o.id = m.org_id where m.user_id = auth.uid()
    ), '[]'::jsonb)
  );
$$;

-- ── centers (system admin) ──────────────────────────────────────────────

create or replace function public.lexica_org_create(p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  oid uuid;
begin
  if not lexica_is_admin() then raise exception 'not an admin'; end if;
  insert into lexica_orgs (name, owner_id) values (trim(p_name), auth.uid()) returning id into oid;
  return jsonb_build_object('id', oid);
end;
$$;

create or replace function public.lexica_org_update(p_org uuid, p_name text default null, p_seats int default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_seats is not null and not lexica_is_admin() then raise exception 'not an admin'; end if;
  if p_name is not null and not lexica_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  update lexica_orgs set name = coalesce(nullif(trim(p_name), ''), name), seats = coalesce(p_seats, seats) where id = p_org;
  return jsonb_build_object('ok', true);
end;
$$;

-- Every center with its seats, and the independent teachers.
create or replace function public.lexica_admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not lexica_is_admin() then raise exception 'not an admin'; end if;
  return jsonb_build_object(
    'orgs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'name', o.name, 'seats', o.seats, 'created_at', o.created_at,
        'used', (select count(distinct m.user_id) from lexica_class_members m join lexica_classes c on c.id = m.class_id where c.org_id = o.id and not c.archived),
        'admins', (select count(*) from lexica_org_members where org_id = o.id and role = 'admin'),
        'teachers', (select count(*) from lexica_org_members where org_id = o.id),
        'classes', (select count(*) from lexica_classes where org_id = o.id and not archived)
      ) order by o.created_at desc)
      from lexica_orgs o
    ), '[]'::jsonb),
    'indie', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', s.user_id, 'email', u.email, 'since', s.created_at,
        'classes', (select count(*) from lexica_classes c where c.teacher_id = s.user_id and c.org_id is null and not c.archived)
      ) order by s.created_at desc)
      from lexica_staff s join auth.users u on u.id = s.user_id where s.role = 'indie'
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.lexica_indie_revoke(p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not lexica_is_admin() then raise exception 'not an admin'; end if;
  delete from lexica_staff where user_id = p_user and role = 'indie';
  return jsonb_build_object('ok', true);
end;
$$;

-- ── invitations ─────────────────────────────────────────────────────────

-- org_admin and indie: system admin only; org_teacher: an admin of that center.
create or replace function public.lexica_invite_create(p_kind text, p_org uuid default null, p_note text default null, p_days int default 7)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  -- Two random UUIDs: 244 random bits, no extension needed.
  t text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_kind = 'indie' then
    if not lexica_is_admin() then raise exception 'not an admin'; end if;
    p_org := null;
  elsif p_kind = 'org_admin' then
    if not lexica_is_admin() or p_org is null then raise exception 'not an admin'; end if;
  elsif p_kind = 'org_teacher' then
    if p_org is null or not lexica_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  else
    raise exception 'bad invite';
  end if;
  insert into lexica_invites (token, kind, org_id, note, created_by, expires_at)
  values (t, p_kind, p_org, nullif(trim(p_note), ''), auth.uid(), now() + make_interval(days => least(greatest(coalesce(p_days, 7), 1), 30)));
  return jsonb_build_object('token', t);
end;
$$;

-- What an invitation is for, shown before signing in. Says nothing about who sent it.
create or replace function public.lexica_invite_info(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object(
      'kind', i.kind,
      'org', (select name from lexica_orgs where id = i.org_id),
      'valid', i.used_at is null and i.expires_at > now()
    )
    from lexica_invites i where i.token = p_token
  ), jsonb_build_object('valid', false));
$$;

create or replace function public.lexica_invite_accept(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  inv lexica_invites;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into inv from lexica_invites where token = p_token for update;
  if inv.token is null or inv.used_at is not null or inv.expires_at <= now() then raise exception 'invite expired'; end if;
  if inv.kind = 'indie' then
    insert into lexica_staff (user_id, role, granted_by) values (uid, 'indie', inv.created_by)
    on conflict (user_id) do nothing;
  else
    insert into lexica_org_members (org_id, user_id, role)
    values (inv.org_id, uid, case when inv.kind = 'org_admin' then 'admin' else 'teacher' end)
    on conflict (org_id, user_id) do update set role = case when excluded.role = 'admin' then 'admin' else lexica_org_members.role end;
  end if;
  update lexica_invites set used_by = uid, used_at = now() where token = p_token;
  return jsonb_build_object('kind', inv.kind, 'org_id', inv.org_id);
end;
$$;

-- Invitations still open, for whoever may make them.
create or replace function public.lexica_invites_open(p_org uuid default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if (p_org is null and not lexica_is_admin()) or (p_org is not null and not lexica_is_org_admin(p_org)) then
    raise exception 'not an admin';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('token', i.token, 'kind', i.kind, 'note', i.note, 'expires_at', i.expires_at, 'org', (select name from lexica_orgs where id = i.org_id)) order by i.created_at desc)
    from lexica_invites i
    where i.used_at is null and i.expires_at > now()
      and ((p_org is null and i.kind in ('indie','org_admin')) or i.org_id = p_org)
  ), '[]'::jsonb);
end;
$$;

create or replace function public.lexica_invite_revoke(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  inv lexica_invites;
begin
  select * into inv from lexica_invites where token = p_token;
  if inv.token is null then return jsonb_build_object('ok', true); end if;
  if not (lexica_is_admin() or (inv.org_id is not null and lexica_is_org_admin(inv.org_id))) then raise exception 'not an admin'; end if;
  delete from lexica_invites where token = p_token and used_at is null;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── a center (its admins) ───────────────────────────────────────────────

create or replace function public.lexica_org_overview(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not lexica_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  return (
    select jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'seats', o.seats,
      'used', (select count(distinct m.user_id) from lexica_class_members m join lexica_classes c on c.id = m.class_id where c.org_id = o.id and not c.archived),
      'people', coalesce((
        select jsonb_agg(jsonb_build_object(
          'user_id', m.user_id, 'email', u.email, 'role', m.role,
          'classes', (select count(*) from lexica_classes c where c.org_id = o.id and c.teacher_id = m.user_id and not c.archived)
        ) order by m.role, u.email)
        from lexica_org_members m join auth.users u on u.id = m.user_id where m.org_id = o.id
      ), '[]'::jsonb),
      'classes', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'teacher', (select email from auth.users where id = c.teacher_id),
          'members', (select count(*) from lexica_class_members where class_id = c.id),
          'avg_nho', (select round(avg((p.counts->>'nho')::int)) from lexica_class_progress p where p.class_id = c.id),
          'avg_dung', (select round(avg((p.counts->>'dung')::int)) from lexica_class_progress p where p.class_id = c.id),
          'active_week', (select count(*) from lexica_class_progress p where p.class_id = c.id and p.last_active >= lexica_today() - 6)
        ) order by c.created_at)
        from lexica_classes c where c.org_id = o.id and not c.archived
      ), '[]'::jsonb)
    )
    from lexica_orgs o where o.id = p_org
  );
end;
$$;

-- A center admin removes a teacher (their classes stay, now taught by the center's admins).
create or replace function public.lexica_org_remove_member(p_org uuid, p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not lexica_is_org_admin(p_org) then raise exception 'not an admin'; end if;
  if p_user = auth.uid() then raise exception 'not yourself'; end if;
  delete from lexica_org_members where org_id = p_org and user_id = p_user;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── classes ─────────────────────────────────────────────────────────────

-- In a center: any of its members. Outside one: independent teachers and system admins.
create or replace function public.lexica_class_create(p_name text, p_branch text default 'cert', p_level text default null, p_org uuid default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  c text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_org is not null then
    if not exists (select 1 from lexica_org_members where org_id = p_org and user_id = uid) then raise exception 'not in this center'; end if;
  elsif not exists (select 1 from lexica_staff where user_id = uid) then
    raise exception 'not a teacher';
  end if;
  c := lexica_class_code();
  insert into lexica_classes (org_id, teacher_id, name, code, branch, level)
  values (p_org, uid, trim(p_name), c, coalesce(p_branch, 'cert'), p_level)
  returning id into cid;
  return jsonb_build_object('id', cid, 'code', c);
end;
$$;

create or replace function public.lexica_class_update(p_class uuid, p_name text default null, p_branch text default null, p_level text default null, p_leaderboard boolean default null, p_archived boolean default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update lexica_classes set
    name = coalesce(nullif(trim(p_name), ''), name),
    branch = coalesce(p_branch, branch),
    level = case when p_level = '' then null else coalesce(p_level, level) end,
    leaderboard = coalesce(p_leaderboard, leaderboard),
    archived = coalesce(p_archived, archived)
  where id = p_class;
  return jsonb_build_object('ok', true);
end;
$$;

-- A new code (the old one stops working: for a code that leaked).
create or replace function public.lexica_class_new_code(p_class uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c text := lexica_class_code();
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update lexica_classes set code = c where id = p_class;
  return jsonb_build_object('code', c);
end;
$$;

-- Classes the user is in or teaches, with their assignments (the code only for teachers).
create or replace function public.lexica_my_classes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(item order by item->>'created_at'), '[]'::jsonb) from (
    select jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'branch', c.branch,
      'level', c.level,
      'org_id', c.org_id,
      'org', (select name from lexica_orgs where id = c.org_id),
      'created_at', c.created_at,
      'leaderboard', c.leaderboard,
      'role', case when lexica_can_teach(c.id) and not exists (select 1 from lexica_class_members m where m.class_id = c.id and m.user_id = auth.uid()) then 'teacher' else 'student' end,
      'code', case when lexica_can_teach(c.id) then c.code end,
      'members', (select count(*) from lexica_class_members where class_id = c.id),
      'assignments', coalesce((
        select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'card_ids', a.card_ids, 'missing_words', a.missing_words, 'created_at', a.created_at, 'due_on', a.due_on, 'mode', a.mode) order by a.created_at desc)
        from lexica_class_assignments a where a.class_id = c.id
      ), '[]'::jsonb)
    ) as item
    from lexica_classes c
    where not c.archived and (
      c.teacher_id = auth.uid()
      or lexica_can_teach(c.id) and (c.teacher_id = auth.uid() or exists (select 1 from lexica_org_members om where om.org_id = c.org_id and om.user_id = auth.uid()))
      or exists (select 1 from lexica_class_members m where m.class_id = c.id and m.user_id = auth.uid())
    )
  ) t;
$$;

-- A student's own numbers, with per-word steps on assigned words. p_words: {cardId: 1..5}.
create or replace function public.lexica_class_report(p_counts jsonb, p_streak int, p_assigned jsonb, p_words jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  m record;
  n int := 0;
  mine jsonb;
  words jsonb;
begin
  if uid is null then return jsonb_build_object('classes', 0); end if;
  for m in select class_id from lexica_class_members where user_id = uid loop
    mine := lexica_counts(coalesce(p_assigned -> (m.class_id::text), '{}'::jsonb));
    -- Only this class's assigned words, steps clamped to 1..5.
    select coalesce(jsonb_object_agg(k, least(greatest((v #>> '{}')::int, 0), 5)), '{}'::jsonb) into words
    from jsonb_each(coalesce(p_words, '{}'::jsonb)) as e(k, v)
    where jsonb_typeof(v) = 'number'
      and exists (select 1 from lexica_class_assignments a where a.class_id = m.class_id and k = any(a.card_ids));
    insert into lexica_class_progress (class_id, user_id, counts, assigned, streak, last_active, updated_at, words)
    values (m.class_id, uid, lexica_counts(p_counts), mine, least(greatest(coalesce(p_streak, 0), 0), 10000), lexica_today(), now(), words)
    on conflict (class_id, user_id) do update set
      counts = excluded.counts, assigned = excluded.assigned, streak = excluded.streak,
      last_active = excluded.last_active, updated_at = now(), words = excluded.words;
    insert into lexica_class_progress_daily (class_id, user_id, date, counts, assigned)
    values (m.class_id, uid, lexica_today(), lexica_counts(p_counts), mine)
    on conflict (class_id, user_id, date) do update set counts = excluded.counts, assigned = excluded.assigned;
    n := n + 1;
  end loop;
  return jsonb_build_object('classes', n);
end;
$$;

-- Steps now count "Đời" (words used in real life) too.
create or replace function public.lexica_counts(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'hieu', least(greatest(coalesce((p->>'hieu')::int, 0), 0), 100000),
    'nho', least(greatest(coalesce((p->>'nho')::int, 0), 0), 100000),
    'gap', least(greatest(coalesce((p->>'gap')::int, 0), 0), 100000),
    'dung', least(greatest(coalesce((p->>'dung')::int, 0), 0), 100000),
    'doi', case when p ? 'doi' then least(greatest((p->>'doi')::int, 0), 100000) end,
    'total', case when p ? 'total' then least(greatest((p->>'total')::int, 0), 100000) end
  ));
$$;

-- The teacher's board: the class, its assignments, each student with numbers, steps per assigned word, note.
create or replace function public.lexica_class_board(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return (
    select jsonb_build_object(
      'class', (
        select jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code, 'branch', c.branch, 'level', c.level,
          'leaderboard', c.leaderboard, 'org_id', c.org_id, 'created_at', c.created_at,
          'org', (select name from lexica_orgs where id = c.org_id))
        from lexica_classes c where c.id = p_class
      ),
      'assignments', coalesce((
        select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'card_ids', a.card_ids, 'missing_words', a.missing_words, 'created_at', a.created_at, 'due_on', a.due_on, 'mode', a.mode) order by a.created_at desc)
        from lexica_class_assignments a where a.class_id = p_class
      ), '[]'::jsonb),
      'students', coalesce((
        select jsonb_agg(jsonb_build_object(
          'user_id', m.user_id,
          'name', m.display_name,
          'joined_at', m.joined_at,
          'note', m.note,
          'counts', coalesce(p.counts, '{}'::jsonb),
          'assigned', coalesce(p.assigned, '{}'::jsonb),
          'words', coalesce(p.words, '{}'::jsonb),
          'streak', coalesce(p.streak, 0),
          'last_active', p.last_active,
          'inactive_days', case when p.last_active is null then null else lexica_today() - p.last_active end,
          'week_ago', (
            select d.counts from lexica_class_progress_daily d
            where d.class_id = p_class and d.user_id = m.user_id and d.date <= lexica_today() - 7
            order by d.date desc limit 1
          ),
          'week_first', (
            select d.counts from lexica_class_progress_daily d
            where d.class_id = p_class and d.user_id = m.user_id and d.date > lexica_today() - 7
            order by d.date asc limit 1
          ),
          'days', (
            select coalesce(jsonb_agg(d.date order by d.date), '[]'::jsonb) from lexica_class_progress_daily d
            where d.class_id = p_class and d.user_id = m.user_id and d.date > lexica_today() - 30
          )
        ) order by m.display_name)
        from lexica_class_members m
        left join lexica_class_progress p on p.class_id = m.class_id and p.user_id = m.user_id
        where m.class_id = p_class
      ), '[]'::jsonb)
    )
  );
end;
$$;

-- Students see the ranking only when the teacher turned it on.
create or replace function public.lexica_class_leaderboard(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not (lexica_can_teach(p_class) or exists (select 1 from lexica_class_members where class_id = p_class and user_id = auth.uid())) then
    raise exception 'not in this class';
  end if;
  if not lexica_can_teach(p_class) and not (select leaderboard from lexica_classes where id = p_class) then
    return '[]'::jsonb;
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object('name', m.display_name, 'dung', coalesce((p.counts->>'dung')::int, 0), 'nho', coalesce((p.counts->>'nho')::int, 0), 'me', m.user_id = auth.uid())
      order by coalesce((p.counts->>'dung')::int, 0) desc, coalesce((p.counts->>'nho')::int, 0) desc, m.display_name), '[]'::jsonb)
    from lexica_class_members m
    left join lexica_class_progress p on p.class_id = m.class_id and p.user_id = m.user_id
    where m.class_id = p_class
  );
end;
$$;

create or replace function public.lexica_class_assign(p_class uuid, p_title text, p_card_ids text[], p_missing text[], p_due date, p_mode text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  aid uuid;
  ids text[] := (select coalesce(array_agg(distinct x), '{}') from unnest(p_card_ids[1:200]) x where char_length(x) between 1 and 40);
  missing text[] := (select coalesce(array_agg(distinct lower(trim(x))), '{}') from unnest(p_missing[1:200]) x where char_length(trim(x)) between 1 and 60);
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if coalesce(array_length(ids, 1), 0) = 0 and coalesce(array_length(missing, 1), 0) = 0 then raise exception 'no words'; end if;
  insert into lexica_class_assignments (class_id, title, card_ids, missing_words, created_by, due_on, mode)
  values (p_class, trim(p_title), ids, missing, auth.uid(), p_due, case when p_mode = 'mixed' then 'mixed' else 'only' end) returning id into aid;
  insert into lexica_word_requests (class_id, word) select p_class, w from unnest(missing) w;
  return jsonb_build_object('id', aid, 'cards', coalesce(array_length(ids, 1), 0), 'missing', coalesce(array_length(missing, 1), 0));
end;
$$;

create or replace function public.lexica_class_assignment_update(p_assignment uuid, p_title text default null, p_due date default null, p_clear_due boolean default false, p_mode text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cid uuid;
begin
  select class_id into cid from lexica_class_assignments where id = p_assignment;
  if cid is null or not lexica_can_teach(cid) then raise exception 'not the teacher'; end if;
  update lexica_class_assignments set
    title = coalesce(nullif(trim(p_title), ''), title),
    due_on = case when p_clear_due then null else coalesce(p_due, due_on) end,
    mode = case when p_mode in ('only','mixed') then p_mode else mode end
  where id = p_assignment;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.lexica_class_member_update(p_class uuid, p_user uuid, p_note text default null, p_remove boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if p_remove then
    delete from lexica_class_progress where class_id = p_class and user_id = p_user;
    delete from lexica_class_members where class_id = p_class and user_id = p_user;
  else
    update lexica_class_members set note = nullif(trim(p_note), '') where class_id = p_class and user_id = p_user;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'lexica_whoami()', 'lexica_org_create(text)', 'lexica_org_update(uuid, text, int)', 'lexica_admin_overview()',
    'lexica_indie_revoke(uuid)', 'lexica_invite_create(text, uuid, text, int)', 'lexica_invite_accept(text)',
    'lexica_invites_open(uuid)', 'lexica_invite_revoke(text)', 'lexica_org_overview(uuid)', 'lexica_org_remove_member(uuid, uuid)',
    'lexica_class_create(text, text, text, uuid)', 'lexica_class_update(uuid, text, text, text, boolean, boolean)',
    'lexica_class_new_code(uuid)', 'lexica_my_classes()', 'lexica_class_report(jsonb, int, jsonb, jsonb)',
    'lexica_class_board(uuid)', 'lexica_class_leaderboard(uuid)',
    'lexica_class_assign(uuid, text, text[], text[], date, text)', 'lexica_class_assignment_update(uuid, text, date, boolean, text)',
    'lexica_class_member_update(uuid, uuid, text, boolean)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  -- Shown on the invitation page before signing in.
  revoke all on function public.lexica_invite_info(text) from public;
  grant execute on function public.lexica_invite_info(text) to anon, authenticated;
  revoke all on function public.lexica_is_admin() from public, anon;
  revoke all on function public.lexica_is_org_admin(uuid) from public, anon;
end $$;

notify pgrst, 'reload schema';
