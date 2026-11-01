-- Card statistics and "Báo thẻ này có vấn đề" (issue #62, docs/ECOSYSTEM_STRATEGY.md 2.2).
-- Runs after classroom_arena.sql, classroom_tests.sql and migration_duels.sql
-- (it reads their answers). Safe to re-run.
--
-- cortex_card_stats: one row per card, refreshed every night: how many answers
-- the Đấu trường, the class tests and the duels got for it, how many were
-- right, the median time of an Arena answer, and how many reports it has.
-- Counts only, put together from many students: no row says who answered.
-- Studio editors read it (the "sức khoẻ nội dung" page); nobody else does.

create table if not exists cortex_card_reports (
  id uuid primary key default gen_random_uuid(),
  card_id text not null check (char_length(card_id) between 1 and 64),
  reason text not null check (reason in ('wrong_meaning', 'odd_example', 'wrong_audio', 'too_hard')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists cortex_card_reports_card_idx on cortex_card_reports (card_id);
-- One report of a kind per person per card
create unique index if not exists cortex_card_reports_once_idx on cortex_card_reports (user_id, card_id, reason) where user_id is not null;
alter table cortex_card_reports enable row level security;

create table if not exists cortex_card_stats (
  card_id text primary key,
  quiz_answers int not null default 0,
  quiz_correct int not null default 0,
  quiz_median_ms int,
  test_answers int not null default 0,
  test_correct int not null default 0,
  duel_answers int not null default 0,
  duel_correct int not null default 0,
  reports int not null default 0,
  reasons jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table cortex_card_stats enable row level security;

-- A player (signed in or not) reports a card. A report from the same person of
-- the same kind counts once; a ceiling an hour keeps a script from filling the table.
create or replace function public.card_report(p_card text, p_reason text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if p_card is null or char_length(p_card) not between 1 and 64 then raise exception 'bad card'; end if;
  if p_reason not in ('wrong_meaning', 'odd_example', 'wrong_audio', 'too_hard') then raise exception 'bad reason'; end if;
  if (select count(*) from cortex_card_reports where created_at > now() - interval '1 hour') >= 3000 then raise exception 'too many reports'; end if;
  insert into cortex_card_reports (card_id, reason, user_id) values (p_card, p_reason, auth.uid()) on conflict do nothing;
  return jsonb_build_object('ok', true);
end;
$$;

-- The nightly numbers. Run by the Cortex API with the service role.
create or replace function public.cortex_card_stats_refresh()
returns int language plpgsql volatile security definer set search_path = public as $$
declare
  n int;
begin
  with quiz as (
    select q.card_id, count(*)::int as answers, (count(*) filter (where a.correct))::int as correct, (percentile_cont(0.5) within group (order by a.ms))::int as med
    from cortex_arena_answers a join cortex_arena_questions q on q.room_id = a.room_id and q.idx = a.idx
    where q.card_id is not null and q.kind <> 'story' group by q.card_id),
  tst as (
    select q.card_id, count(*)::int as answers, (count(*) filter (where a.choice = q.answer))::int as correct
    from cortex_class_test_answers a join cortex_class_test_questions q on q.test_id = a.test_id and q.idx = a.idx
    where q.card_id is not null group by q.card_id),
  dl as (
    select q.card_id, count(*)::int as answers, (count(*) filter (where a.correct))::int as correct
    from lexica_duel_answers a join lexica_duel_questions q on q.duel_id = a.duel_id and q.idx = a.idx
    where q.card_id is not null group by q.card_id),
  rp as (
    select card_id, sum(c)::int as n, jsonb_object_agg(reason, c) as reasons
    from (select card_id, reason, count(*)::int as c from cortex_card_reports group by card_id, reason) x group by card_id),
  ids as (select card_id from quiz union select card_id from tst union select card_id from dl union select card_id from rp)
  insert into cortex_card_stats (card_id, quiz_answers, quiz_correct, quiz_median_ms, test_answers, test_correct, duel_answers, duel_correct, reports, reasons, updated_at)
  select i.card_id, coalesce(quiz.answers, 0), coalesce(quiz.correct, 0), quiz.med, coalesce(tst.answers, 0), coalesce(tst.correct, 0),
         coalesce(dl.answers, 0), coalesce(dl.correct, 0), coalesce(rp.n, 0), coalesce(rp.reasons, '{}'::jsonb), now()
  from ids i left join quiz using (card_id) left join tst using (card_id) left join dl using (card_id) left join rp using (card_id)
  on conflict (card_id) do update set quiz_answers = excluded.quiz_answers, quiz_correct = excluded.quiz_correct, quiz_median_ms = excluded.quiz_median_ms,
    test_answers = excluded.test_answers, test_correct = excluded.test_correct, duel_answers = excluded.duel_answers, duel_correct = excluded.duel_correct,
    reports = excluded.reports, reasons = excluded.reasons, updated_at = now();
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Studio editors read the numbers and the reports (when Studio's SQL is there).
do $$
begin
  if to_regprocedure('public.is_studio_editor()') is not null then
    drop policy if exists "studio editors read card stats" on cortex_card_stats;
    create policy "studio editors read card stats" on cortex_card_stats for select using (public.is_studio_editor());
    drop policy if exists "studio editors read card reports" on cortex_card_reports;
    create policy "studio editors read card reports" on cortex_card_reports for select using (public.is_studio_editor());
  end if;
end $$;

revoke all on function public.card_report(text, text) from public;
grant execute on function public.card_report(text, text) to anon, authenticated;
revoke all on function public.cortex_card_stats_refresh() from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.cortex_card_stats_refresh() to service_role;
  end if;
end $$;

notify pgrst, 'reload schema';
