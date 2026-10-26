-- Parents (docs/TEACH_PLAN.md, section 3, T4): a private link per student, and
-- a weekly report the teacher reviews and approves before parents see it.
-- Runs after classroom_core.sql. Safe to re-run.
--
-- A parent needs no account: they open teach/p/<code> (12 characters, about
-- 59 bits), plus a 4-digit PIN when the class turns PINs on. Five wrong PINs
-- lock the link for 15 minutes. Parents only ever read approved reports, never
-- the teacher's private note on the student. Every read and write goes
-- through the functions below; the tables have RLS on and no policies.

alter table cortex_classes add column if not exists parent_pin boolean not null default false;

create table if not exists cortex_parent_links (
  code text primary key check (code ~ '^[a-z2-9]{12}$'),
  class_id uuid not null references cortex_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pin_salt text,
  pin_hash text,
  fails int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
-- One live link per student per class
create unique index if not exists cortex_parent_links_live_idx on cortex_parent_links (class_id, user_id) where revoked_at is null;

-- One approved report per student per week (week = the Monday it starts on).
create table if not exists cortex_weekly_reports (
  class_id uuid not null references cortex_classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week date not null check (extract(isodow from week) = 1),
  content jsonb not null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now(),
  opens int not null default 0,
  first_opened_at timestamptz,
  primary key (class_id, user_id, week)
);

alter table cortex_parent_links enable row level security;
alter table cortex_weekly_reports enable row level security;

-- ── helpers ─────────────────────────────────────────────────────────────

-- 12 characters without look-alikes (no 0 o 1 l i), from a random uuid's bytes.
create or replace function public.cortex_parent_code()
returns text language plpgsql volatile as $$
declare
  alphabet constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
  b bytea := decode(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 'hex');
  out text := '';
begin
  for i in 0..11 loop
    out := out || substr(alphabet, get_byte(b, i) % 31 + 1, 1);
  end loop;
  return out;
end;
$$;

create or replace function public.cortex_pin_hash(p_salt text, p_pin text)
returns text language sql immutable as $$
  select encode(sha256(convert_to(p_salt || ':' || p_pin, 'UTF8')), 'hex');
$$;

-- What a report may hold (packages/classroom/parents.ts, ReportContent): short
-- Vietnamese text and a few numbers. Anything else is dropped.
create or replace function public.cortex_clean_report(p jsonb)
returns jsonb language plpgsql immutable as $$
declare
  did jsonb;
  score jsonb;
  t text;
begin
  if jsonb_typeof(p) <> 'object' then raise exception 'bad report'; end if;
  t := left(trim(coalesce(p->>'summary', '')), 400);
  if t = '' then raise exception 'bad report'; end if;
  select coalesce(jsonb_agg(item), '[]') into did from (
    select jsonb_strip_nulls(jsonb_build_object(
      'text', left(trim(x->>'text'), 200),
      'words', (select jsonb_agg(left(w, 40)) from (select jsonb_array_elements_text(case when jsonb_typeof(x->'words') = 'array' then x->'words' else '[]' end) w limit 8) ws)
    )) as item
    from jsonb_array_elements(case when jsonb_typeof(p->'did') = 'array' then p->'did' else '[]' end) x
    where jsonb_typeof(x) = 'object' and coalesce(trim(x->>'text'), '') <> ''
    limit 3
  ) d;
  if jsonb_typeof(p->'score') = 'object' and jsonb_typeof(p->'score'->'score') = 'number' then
    score := jsonb_strip_nulls(jsonb_build_object(
      'score', least(greatest(round((p->'score'->>'score')::numeric), 0), 3000)::int,
      'ielts', left(p->'score'->>'ielts', 12),
      'delta', case when jsonb_typeof(p->'score'->'delta') = 'number' then least(greatest(round((p->'score'->>'delta')::numeric), -3000), 3000)::int end,
      'at', case when (p->'score'->>'at') ~ '^\d{4}-\d{2}-\d{2}' then left(p->'score'->>'at', 10) end
    ));
  end if;
  return jsonb_strip_nulls(jsonb_build_object(
    'v', 1,
    'days', case when jsonb_typeof(p->'days') = 'number' then least(greatest(round((p->>'days')::numeric), 0), 7)::int else 0 end,
    'summary', t,
    'did', did,
    'score', score,
    'help', nullif(left(trim(coalesce(p->>'help', '')), 300), ''),
    'note', nullif(left(trim(coalesce(p->>'note', '')), 500), '')
  ));
end;
$$;

-- ── teacher ─────────────────────────────────────────────────────────────

-- The class's parent page state: PIN on or off, each student's live link, and the week's reports.
create or replace function public.classroom_parents(p_class uuid, p_week date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  return jsonb_build_object(
    'pin', (select parent_pin from cortex_classes where id = p_class),
    'links', coalesce((
      select jsonb_object_agg(l.user_id, jsonb_build_object('code', l.code, 'pin', l.pin_hash is not null, 'created_at', l.created_at))
      from cortex_parent_links l where l.class_id = p_class and l.revoked_at is null
    ), '{}'::jsonb),
    'reports', coalesce((
      select jsonb_object_agg(r.user_id, jsonb_build_object('content', r.content, 'approved_at', r.approved_at, 'opens', r.opens, 'first_opened_at', r.first_opened_at))
      from cortex_weekly_reports r where r.class_id = p_class and r.week = p_week
    ), '{}'::jsonb)
  );
end;
$$;

create or replace function public.classroom_parent_pin_set(p_class uuid, p_on boolean)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update cortex_classes set parent_pin = coalesce(p_on, false) where id = p_class;
  return jsonb_build_object('ok', true);
end;
$$;

-- A new link for a student's parents (the old one stops working). The PIN, when the
-- class uses PINs, is returned this once; only its hash is kept.
create or replace function public.classroom_parent_link_new(p_class uuid, p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  c text;
  pin text;
  salt text;
  b bytea;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if not exists (select 1 from cortex_class_members where class_id = p_class and user_id = p_user) then raise exception 'not in this class'; end if;
  update cortex_parent_links set revoked_at = now() where class_id = p_class and user_id = p_user and revoked_at is null;
  loop
    c := cortex_parent_code();
    exit when not exists (select 1 from cortex_parent_links where code = c);
  end loop;
  if (select parent_pin from cortex_classes where id = p_class) then
    b := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    pin := lpad(((get_byte(b, 0) * 256 + get_byte(b, 1)) % 10000)::text, 4, '0');
    salt := replace(gen_random_uuid()::text, '-', '');
  end if;
  insert into cortex_parent_links (code, class_id, user_id, pin_salt, pin_hash)
  values (c, p_class, p_user, salt, case when pin is not null then cortex_pin_hash(salt, pin) end);
  return jsonb_strip_nulls(jsonb_build_object('code', c, 'pin', pin));
end;
$$;

create or replace function public.classroom_parent_link_revoke(p_class uuid, p_user uuid)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  update cortex_parent_links set revoked_at = now() where class_id = p_class and user_id = p_user and revoked_at is null;
  return jsonb_build_object('ok', true);
end;
$$;

-- A finished week's numbers per student and app: the last report on or before
-- the week's Sunday (`end`) and before its Monday (`start`), and the days studied.
-- The same answer whichever day the teacher asks.
create or replace function public.classroom_week_metrics(p_class uuid, p_week date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if extract(isodow from p_week) <> 1 then raise exception 'week starts on Monday'; end if;
  return coalesce((
    select jsonb_object_agg(m.user_id, jsonb_build_object(
      'days', (
        select coalesce(jsonb_agg(distinct d.date), '[]'::jsonb) from cortex_class_activity_daily d
        where d.class_id = p_class and d.user_id = m.user_id and d.date between p_week and p_week + 6
      ),
      'apps', coalesce((
        select jsonb_object_agg(a.app, jsonb_build_object(
          'end', (select d.metrics from cortex_class_activity_daily d where d.class_id = p_class and d.user_id = m.user_id and d.app = a.app and d.date <= p_week + 6 order by d.date desc limit 1),
          'start', (select d.metrics from cortex_class_activity_daily d where d.class_id = p_class and d.user_id = m.user_id and d.app = a.app and d.date < p_week order by d.date desc limit 1)
        ))
        from (select distinct app from cortex_class_activity_daily where class_id = p_class and user_id = m.user_id) a
      ), '{}'::jsonb)
    ))
    from cortex_class_members m where m.class_id = p_class
  ), '{}'::jsonb);
end;
$$;

-- The teacher approves a student's report for a week; approving again replaces it (opens are kept).
create or replace function public.classroom_report_approve(p_class uuid, p_user uuid, p_week date, p_content jsonb)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  clean jsonb;
begin
  if not classroom_can_teach(p_class) then raise exception 'not the teacher'; end if;
  if not exists (select 1 from cortex_class_members where class_id = p_class and user_id = p_user) then raise exception 'not in this class'; end if;
  if extract(isodow from p_week) <> 1 or p_week > cortex_today() then raise exception 'week starts on Monday'; end if;
  clean := cortex_clean_report(p_content);
  insert into cortex_weekly_reports (class_id, user_id, week, content, approved_by, approved_at)
  values (p_class, p_user, p_week, clean, auth.uid(), now())
  on conflict (class_id, user_id, week) do update set content = excluded.content, approved_by = excluded.approved_by, approved_at = now();
  return jsonb_build_object('ok', true, 'content', clean);
end;
$$;

-- ── parents (no account) ────────────────────────────────────────────────

-- What a parent sees: the student's name in class, the class, and the approved
-- reports, newest first (12 weeks). Opening counts as a view of the newest.
create or replace function public.parent_view(p_code text, p_pin text default null)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  l cortex_parent_links;
  latest date;
  tries int;
begin
  select * into l from cortex_parent_links where code = lower(trim(p_code)) and revoked_at is null;
  if l.code is null then raise exception 'link not found'; end if;
  if l.pin_hash is not null then
    if l.locked_until is not null and l.locked_until > now() then raise exception 'link locked'; end if;
    if p_pin is null or p_pin = '' then return jsonb_build_object('need_pin', true); end if;
    if cortex_pin_hash(l.pin_salt, trim(p_pin)) <> l.pin_hash then
      -- A lock that has run out starts the count again
      tries := case when l.locked_until is not null then 1 else l.fails + 1 end;
      update cortex_parent_links set fails = tries,
        locked_until = case when tries >= 5 then now() + interval '15 minutes' end
      where code = l.code;
      -- Not an exception: the failed try must be kept
      return jsonb_build_object('need_pin', true, 'wrong', true, 'locked', tries >= 5);
    end if;
    update cortex_parent_links set fails = 0, locked_until = null where code = l.code;
  end if;
  select max(week) into latest from cortex_weekly_reports where class_id = l.class_id and user_id = l.user_id;
  if latest is not null then
    update cortex_weekly_reports set opens = opens + 1, first_opened_at = coalesce(first_opened_at, now())
    where class_id = l.class_id and user_id = l.user_id and week = latest;
  end if;
  return jsonb_build_object(
    'name', (select display_name from cortex_class_members where class_id = l.class_id and user_id = l.user_id),
    'class', (select name from cortex_classes where id = l.class_id),
    'reports', coalesce((
      select jsonb_agg(jsonb_build_object('week', r.week, 'content', r.content) order by r.week desc)
      from (select * from cortex_weekly_reports where class_id = l.class_id and user_id = l.user_id order by week desc limit 12) r
    ), '[]'::jsonb)
  );
end;
$$;

do $$
declare f text;
begin
  foreach f in array array['classroom_parents(uuid, date)', 'classroom_parent_pin_set(uuid, boolean)', 'classroom_parent_link_new(uuid, uuid)',
    'classroom_parent_link_revoke(uuid, uuid)', 'classroom_week_metrics(uuid, date)', 'classroom_report_approve(uuid, uuid, date, jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
  revoke all on function public.parent_view(text, text) from public;
  grant execute on function public.parent_view(text, text) to anon, authenticated;
  foreach f in array array['cortex_parent_code()', 'cortex_pin_hash(text, text)', 'cortex_clean_report(jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
