-- Lexica for English centers (docs/LEXICA_DIRECTION.md, "Trung tâm"): a
-- teacher makes a class and shares its code, assigns words by lesson, and
-- sees each student's four numbers and streak; students join by code and
-- report their own numbers. Every read and write goes through the security
-- definer functions below; the tables have RLS on and no client policies.
-- Requires migration_engagement.sql (lexica_today). Safe to re-run.

create table if not exists lexica_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  seats int not null default 30 check (seats between 1 and 5000),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists lexica_org_members (
  org_id uuid not null references lexica_orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher')),
  primary key (org_id, user_id)
);

create table if not exists lexica_classes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references lexica_orgs(id) on delete set null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  code text not null unique,
  branch text not null default 'cert' check (branch in ('cert','talk')),
  level text check (level in ('beginner','intermediate','advanced','expert')),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists lexica_class_members (
  class_id uuid not null references lexica_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists lexica_class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references lexica_classes(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  card_ids text[] not null,
  missing_words text[] not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists lexica_class_assignments_class_idx on lexica_class_assignments (class_id, created_at);

-- Latest numbers a student reported, and one snapshot per day for the weekly report.
create table if not exists lexica_class_progress (
  class_id uuid not null references lexica_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  counts jsonb not null default '{}',     -- {hieu,nho,gap,dung} over all words
  assigned jsonb not null default '{}',   -- {hieu,nho,gap,dung,total} over this class's assigned words
  streak int not null default 0,
  last_active date,
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

create table if not exists lexica_class_progress_daily (
  class_id uuid not null references lexica_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  counts jsonb not null,
  assigned jsonb not null default '{}',
  primary key (class_id, user_id, date)
);

-- Words a teacher assigned that Lexica has no card for yet; Studio writes them.
create table if not exists lexica_word_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references lexica_classes(id) on delete set null,
  word text not null check (char_length(word) between 1 and 60),
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now()
);
create index if not exists lexica_word_requests_status_idx on lexica_word_requests (status, created_at);

alter table lexica_orgs enable row level security;
alter table lexica_org_members enable row level security;
alter table lexica_classes enable row level security;
alter table lexica_class_members enable row level security;
alter table lexica_class_assignments enable row level security;
alter table lexica_class_progress enable row level security;
alter table lexica_class_progress_daily enable row level security;
alter table lexica_word_requests enable row level security;

-- Studio editors read and close word requests (is_studio_editor from migration_studio.sql).
drop policy if exists "lexica_word_requests editors" on lexica_word_requests;
create policy "lexica_word_requests editors" on lexica_word_requests
  for all using (is_studio_editor()) with check (is_studio_editor());

-- ── helpers ─────────────────────────────────────────────────────────────

create or replace function public.lexica_class_code()
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
    exit when not exists (select 1 from lexica_classes where code = c);
  end loop;
  return c;
end;
$$;

-- The teacher of a class, or an admin of its center.
create or replace function public.lexica_can_teach(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from lexica_classes c
    where c.id = p_class and (
      c.teacher_id = auth.uid()
      or exists (select 1 from lexica_org_members m where m.org_id = c.org_id and m.user_id = auth.uid() and m.role = 'admin')
    )
  );
$$;

-- Clamp a client-sent step count object to four non-negative ints (and total when given).
create or replace function public.lexica_counts(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'hieu', least(greatest(coalesce((p->>'hieu')::int, 0), 0), 100000),
    'nho', least(greatest(coalesce((p->>'nho')::int, 0), 0), 100000),
    'gap', least(greatest(coalesce((p->>'gap')::int, 0), 0), 100000),
    'dung', least(greatest(coalesce((p->>'dung')::int, 0), 0), 100000),
    'total', case when p ? 'total' then least(greatest((p->>'total')::int, 0), 100000) end
  ));
$$;

-- ── centers ─────────────────────────────────────────────────────────────

create or replace function public.lexica_org_create(p_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  oid uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into lexica_orgs (name, owner_id) values (trim(p_name), uid) returning id into oid;
  insert into lexica_org_members (org_id, user_id, role) values (oid, uid, 'admin');
  return jsonb_build_object('id', oid);
end;
$$;

-- An admin adds a teacher by the email they signed in to Lexica with.
create or replace function public.lexica_org_add_teacher(p_org uuid, p_email text)
returns jsonb language plpgsql volatile security definer set search_path = public, auth as $$
declare
  target uuid;
begin
  if not exists (select 1 from lexica_org_members where org_id = p_org and user_id = auth.uid() and role = 'admin') then
    raise exception 'not an admin';
  end if;
  select id into target from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if target is null then raise exception 'no such user'; end if;
  insert into lexica_org_members (org_id, user_id, role) values (p_org, target, 'teacher')
  on conflict (org_id, user_id) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

-- An admin's view of the center: seats and each class with its averages.
create or replace function public.lexica_org_overview(p_org uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from lexica_org_members where org_id = p_org and user_id = auth.uid() and role = 'admin') then
    raise exception 'not an admin';
  end if;
  return (
    select jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'seats', o.seats,
      'used', (select count(distinct m.user_id) from lexica_class_members m join lexica_classes c on c.id = m.class_id where c.org_id = o.id and not c.archived),
      'teachers', (select count(*) from lexica_org_members where org_id = o.id),
      'classes', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', c.id,
          'name', c.name,
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

-- ── classes ─────────────────────────────────────────────────────────────

create or replace function public.lexica_class_create(p_name text, p_branch text default 'cert', p_level text default null, p_org uuid default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  c text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_org is not null and not exists (select 1 from lexica_org_members where org_id = p_org and user_id = uid) then
    raise exception 'not in this center';
  end if;
  c := lexica_class_code();
  insert into lexica_classes (org_id, teacher_id, name, code, branch, level)
  values (p_org, uid, trim(p_name), c, coalesce(p_branch, 'cert'), p_level)
  returning id into cid;
  return jsonb_build_object('id', cid, 'code', c);
end;
$$;

create or replace function public.lexica_class_join(p_code text, p_display_name text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cls lexica_classes;
  seats int;
  used int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into cls from lexica_classes where code = upper(trim(p_code)) and not archived;
  if cls.id is null then raise exception 'no such class'; end if;
  if exists (select 1 from lexica_class_members where class_id = cls.id and user_id = uid) then
    update lexica_class_members set display_name = trim(p_display_name) where class_id = cls.id and user_id = uid;
    return jsonb_build_object('class_id', cls.id, 'name', cls.name, 'branch', cls.branch, 'level', cls.level);
  end if;
  -- Seats: a center's limit across its classes; a teacher on their own gets 60 per class.
  if cls.org_id is not null then
    select o.seats into seats from lexica_orgs o where o.id = cls.org_id;
    select count(distinct m.user_id) into used from lexica_class_members m join lexica_classes c on c.id = m.class_id
    where c.org_id = cls.org_id and not c.archived;
    if used >= seats and not exists (
      select 1 from lexica_class_members m join lexica_classes c on c.id = m.class_id where c.org_id = cls.org_id and m.user_id = uid
    ) then raise exception 'no seats'; end if;
  elsif (select count(*) from lexica_class_members where class_id = cls.id) >= 60 then
    raise exception 'no seats';
  end if;
  insert into lexica_class_members (class_id, user_id, display_name) values (cls.id, uid, trim(p_display_name));
  return jsonb_build_object('class_id', cls.id, 'name', cls.name, 'branch', cls.branch, 'level', cls.level);
end;
$$;

create or replace function public.lexica_class_leave(p_class uuid)
returns jsonb language sql volatile security definer set search_path = public as $$
  with gone as (delete from lexica_class_members where class_id = p_class and user_id = auth.uid() returning 1),
       prog as (delete from lexica_class_progress where class_id = p_class and user_id = auth.uid() returning 1)
  select jsonb_build_object('left', (select count(*) from gone) > 0);
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
      'created_at', c.created_at,
      'role', case when c.teacher_id = auth.uid() or lexica_can_teach(c.id) then 'teacher' else 'student' end,
      'code', case when c.teacher_id = auth.uid() or lexica_can_teach(c.id) then c.code end,
      'members', (select count(*) from lexica_class_members where class_id = c.id),
      'assignments', coalesce((
        select jsonb_agg(jsonb_build_object('id', a.id, 'title', a.title, 'card_ids', a.card_ids, 'missing_words', a.missing_words, 'created_at', a.created_at) order by a.created_at desc)
        from lexica_class_assignments a where a.class_id = c.id
      ), '[]'::jsonb)
    ) as item
    from lexica_classes c
    where not c.archived and (
      c.teacher_id = auth.uid()
      or lexica_can_teach(c.id)
      or exists (select 1 from lexica_class_members m where m.class_id = c.id and m.user_id = auth.uid())
    )
  ) t;
$$;

create or replace function public.lexica_my_orgs()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'role', m.role, 'seats', o.seats)), '[]'::jsonb)
  from lexica_org_members m join lexica_orgs o on o.id = m.org_id
  where m.user_id = auth.uid();
$$;

-- A student's own numbers, sent by the app. p_assigned: {classId: {hieu,nho,gap,dung,total}}.
create or replace function public.lexica_class_report(p_counts jsonb, p_streak int, p_assigned jsonb default '{}'::jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  m record;
  n int := 0;
  mine jsonb;
begin
  if uid is null then return jsonb_build_object('classes', 0); end if;
  for m in select class_id from lexica_class_members where user_id = uid loop
    mine := lexica_counts(coalesce(p_assigned -> (m.class_id::text), '{}'::jsonb));
    insert into lexica_class_progress (class_id, user_id, counts, assigned, streak, last_active, updated_at)
    values (m.class_id, uid, lexica_counts(p_counts), mine, least(greatest(coalesce(p_streak, 0), 0), 10000), lexica_today(), now())
    on conflict (class_id, user_id) do update set
      counts = excluded.counts, assigned = excluded.assigned, streak = excluded.streak,
      last_active = excluded.last_active, updated_at = now();
    insert into lexica_class_progress_daily (class_id, user_id, date, counts, assigned)
    values (m.class_id, uid, lexica_today(), lexica_counts(p_counts), mine)
    on conflict (class_id, user_id, date) do update set counts = excluded.counts, assigned = excluded.assigned;
    n := n + 1;
  end loop;
  return jsonb_build_object('classes', n);
end;
$$;

-- The teacher's board: each student's numbers now and a week ago, streak, days since active.
create or replace function public.lexica_class_board(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return (
    select jsonb_build_object(
      'class', (select jsonb_build_object('id', c.id, 'name', c.name, 'code', c.code, 'branch', c.branch, 'level', c.level) from lexica_classes c where c.id = p_class),
      'students', coalesce(jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'name', m.display_name,
        'joined_at', m.joined_at,
        'counts', coalesce(p.counts, '{}'::jsonb),
        'assigned', coalesce(p.assigned, '{}'::jsonb),
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
        )
      ) order by m.display_name), '[]'::jsonb)
    )
    from lexica_class_members m
    left join lexica_class_progress p on p.class_id = m.class_id and p.user_id = m.user_id
    where m.class_id = p_class
  );
end;
$$;

-- Students rank by words they can use (Dùng), not by game points.
create or replace function public.lexica_class_leaderboard(p_class uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not (lexica_can_teach(p_class) or exists (select 1 from lexica_class_members where class_id = p_class and user_id = auth.uid())) then
    raise exception 'not in this class';
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

-- Words for a lesson: card ids Lexica has, and the words it has no card for yet (sent to Studio).
create or replace function public.lexica_class_assign(p_class uuid, p_title text, p_card_ids text[], p_missing text[] default '{}')
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  aid uuid;
  ids text[] := (select coalesce(array_agg(distinct x), '{}') from unnest(p_card_ids[1:200]) x where char_length(x) between 1 and 40);
  missing text[] := (select coalesce(array_agg(distinct lower(trim(x))), '{}') from unnest(p_missing[1:200]) x where char_length(trim(x)) between 1 and 60);
begin
  if not lexica_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if coalesce(array_length(ids, 1), 0) = 0 and coalesce(array_length(missing, 1), 0) = 0 then raise exception 'no words'; end if;
  insert into lexica_class_assignments (class_id, title, card_ids, missing_words, created_by)
  values (p_class, trim(p_title), ids, missing, auth.uid()) returning id into aid;
  insert into lexica_word_requests (class_id, word) select p_class, w from unnest(missing) w;
  return jsonb_build_object('id', aid, 'cards', coalesce(array_length(ids, 1), 0), 'missing', coalesce(array_length(missing, 1), 0));
end;
$$;

create or replace function public.lexica_class_unassign(p_assignment uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  cid uuid;
begin
  select class_id into cid from lexica_class_assignments where id = p_assignment;
  if cid is null or not lexica_can_teach(cid) then raise exception 'not the teacher'; end if;
  delete from lexica_class_assignments where id = p_assignment;
  return jsonb_build_object('ok', true);
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'lexica_org_create(text)', 'lexica_org_add_teacher(uuid, text)', 'lexica_org_overview(uuid)',
    'lexica_class_create(text, text, text, uuid)', 'lexica_class_join(text, text)', 'lexica_class_leave(uuid)',
    'lexica_my_classes()', 'lexica_my_orgs()', 'lexica_class_report(jsonb, int, jsonb)', 'lexica_class_board(uuid)',
    'lexica_class_leaderboard(uuid)', 'lexica_class_assign(uuid, text, text[], text[])', 'lexica_class_unassign(uuid)'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.lexica_can_teach(uuid) from public, anon;
  revoke all on function public.lexica_class_code() from public, anon, authenticated;
end $$;
