-- Class sessions and attendance (Teach "Buổi học"): the weekly timetable, and
-- who came to each lesson. Runs after classroom_core.sql. Safe to re-run.
--
-- A class has a weekly schedule (days and a start time). A session is one class
-- day: it exists once the teacher takes the roll, writes what the lesson was
-- about, or cancels it (a holiday). One session per class per day. Marks are
-- per student: present, late, absent, excused (absent with a reason).
-- Only the class's teachers read or write them; students and parents see the
-- roll only through an approved weekly report. Every read and write goes
-- through the functions below; the tables have RLS on and no policies.

alter table cortex_classes add column if not exists schedule jsonb not null default '[]'::jsonb;

create table if not exists cortex_class_sessions (
  class_id uuid not null references cortex_classes(id) on delete cascade,
  on_date date not null,
  topic text check (topic is null or char_length(topic) <= 120),
  cancelled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (class_id, on_date)
);

create table if not exists cortex_attendance (
  class_id uuid not null,
  on_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('present', 'late', 'absent', 'excused')),
  marked_by uuid references auth.users(id) on delete set null,
  marked_at timestamptz not null default now(),
  primary key (class_id, on_date, user_id),
  foreign key (class_id, on_date) references cortex_class_sessions(class_id, on_date) on delete cascade
);
create index if not exists cortex_attendance_user_idx on cortex_attendance (class_id, user_id, on_date);

alter table cortex_class_sessions enable row level security;
alter table cortex_attendance enable row level security;

-- ── helpers ─────────────────────────────────────────────────────────────

-- A timetable as packages/classroom/attendance.ts reads it: at most one slot per
-- weekday (ISO, Monday 1), a start "HH:MM" and a length of 15 to 300 minutes.
-- Bad slots are dropped, not rejected.
create or replace function public.cortex_clean_schedule(p jsonb)
returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'start', start, 'minutes', minutes) order by dow), '[]'::jsonb)
  from (
    select distinct on (dow) dow, start, minutes from (
      select (x->>'dow')::int as dow,
             x->>'start' as start,
             least(greatest(coalesce(round((x->>'minutes')::numeric)::int, 90), 15), 300) as minutes
      from jsonb_array_elements(case when jsonb_typeof(p) = 'array' then p else '[]'::jsonb end) x
      where jsonb_typeof(x) = 'object'
        and coalesce(x->>'dow', '') ~ '^[1-7]$'
        and coalesce(x->>'start', '') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        and (x->'minutes' is null or jsonb_typeof(x->'minutes') = 'number')
    ) s
    order by dow, start
  ) d;
$$;

-- One session as Teach reads it: its date, topic, whether it was cancelled, and the marks by student.
create or replace function public.cortex_session_json(p_class uuid, p_date date)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'date', s.on_date,
    'topic', s.topic,
    'cancelled', s.cancelled,
    'marks', coalesce((select jsonb_object_agg(a.user_id, a.status) from cortex_attendance a where a.class_id = s.class_id and a.on_date = s.on_date), '{}'::jsonb)
  )
  from cortex_class_sessions s where s.class_id = p_class and s.on_date = p_date;
$$;

-- ── teacher ─────────────────────────────────────────────────────────────

create or replace function public.classroom_schedule_set(p_class uuid, p_schedule jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  clean jsonb := cortex_clean_schedule(p_schedule);
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update cortex_classes set schedule = clean where id = p_class;
  return jsonb_build_object('schedule', clean);
end;
$$;

-- The timetable and sessions between two dates for each class asked for that
-- this person teaches (others are left out): one call for the Today page.
create or replace function public.classroom_attendance(p_classes uuid[], p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 400 then raise exception 'bad date range'; end if;
  if coalesce(array_length(p_classes, 1), 0) > 100 then raise exception 'bad date range'; end if;
  return coalesce((
    select jsonb_object_agg(c.id, jsonb_build_object(
      'schedule', c.schedule,
      'sessions', coalesce((
        select jsonb_agg(cortex_session_json(c.id, s.on_date) order by s.on_date desc)
        from cortex_class_sessions s where s.class_id = c.id and s.on_date between p_from and p_to
      ), '[]'::jsonb)
    ))
    from cortex_classes c
    where c.id = any(p_classes) and classroom_can_teach(c.id)
  ), '{}'::jsonb);
end;
$$;

-- Take the roll for a day (today or up to 120 days back): `p_marks` maps a
-- student to a status, or to null to clear their mark. Students no longer in
-- the class are skipped. Marking a cancelled day reopens it. `p_topic` (when
-- given; '' clears it) is what the lesson was about.
create or replace function public.classroom_attendance_mark(p_class uuid, p_date date, p_marks jsonb, p_topic text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if p_date is null or p_date > cortex_today() or p_date < cortex_today() - 120 then raise exception 'bad session date'; end if;
  if jsonb_typeof(coalesce(p_marks, '{}'::jsonb)) <> 'object' then raise exception 'bad attendance'; end if;

  insert into cortex_class_sessions (class_id, on_date, topic)
  values (p_class, p_date, nullif(left(trim(coalesce(p_topic, '')), 120), ''))
  on conflict (class_id, on_date) do update set
    cancelled = false,
    topic = case when p_topic is null then cortex_class_sessions.topic else excluded.topic end,
    updated_at = now();

  delete from cortex_attendance a
  using jsonb_each(coalesce(p_marks, '{}'::jsonb)) m
  where a.class_id = p_class and a.on_date = p_date and a.user_id::text = m.key and jsonb_typeof(m.value) = 'null';

  insert into cortex_attendance (class_id, on_date, user_id, status, marked_by)
  select p_class, p_date, mem.user_id, m.value #>> '{}', auth.uid()
  from jsonb_each(coalesce(p_marks, '{}'::jsonb)) m
  join cortex_class_members mem on mem.class_id = p_class and mem.user_id::text = m.key
  where jsonb_typeof(m.value) = 'string' and m.value #>> '{}' in ('present', 'late', 'absent', 'excused')
  on conflict (class_id, on_date, user_id) do update set status = excluded.status, marked_by = excluded.marked_by, marked_at = now();

  return cortex_session_json(p_class, p_date);
end;
$$;

-- What a day's lesson was about, or cancel it (a holiday: its marks are
-- dropped). Up to 120 days either side of today. A day left with no topic, no
-- marks and not cancelled is removed, so it is a plain timetable day again.
create or replace function public.classroom_session_set(p_class uuid, p_date date, p_topic text, p_cancelled boolean)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if p_date is null or abs(p_date - cortex_today()) > 120 then raise exception 'bad session date'; end if;

  insert into cortex_class_sessions (class_id, on_date, topic, cancelled)
  values (p_class, p_date, nullif(left(trim(coalesce(p_topic, '')), 120), ''), coalesce(p_cancelled, false))
  on conflict (class_id, on_date) do update set
    topic = case when p_topic is null then cortex_class_sessions.topic else excluded.topic end,
    cancelled = coalesce(p_cancelled, cortex_class_sessions.cancelled),
    updated_at = now();
  if coalesce(p_cancelled, false) then
    delete from cortex_attendance where class_id = p_class and on_date = p_date;
  end if;
  delete from cortex_class_sessions s
  where s.class_id = p_class and s.on_date = p_date and not s.cancelled and s.topic is null
    and not exists (select 1 from cortex_attendance a where a.class_id = p_class and a.on_date = p_date);

  return coalesce(cortex_session_json(p_class, p_date), jsonb_build_object('date', p_date, 'topic', null, 'cancelled', false, 'marks', '{}'::jsonb));
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['classroom_schedule_set(uuid, jsonb)', 'classroom_attendance(uuid[], date, date)',
    'classroom_attendance_mark(uuid, date, jsonb, text)', 'classroom_session_set(uuid, date, text, boolean)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  foreach f in array array['cortex_clean_schedule(jsonb)', 'cortex_session_json(uuid, date)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
