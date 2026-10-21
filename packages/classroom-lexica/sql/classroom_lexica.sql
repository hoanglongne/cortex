-- Classroom module: Lexica (docs/CLASSROOM.md). What a Lexica lesson is,
-- what a Lexica student reports, and how the class ranks them. Runs after
-- packages/classroom/sql/classroom_core.sql. Safe to re-run.
--
-- Assignment kinds:
--   words  {card_ids: text[], missing_words: text[], mode: 'only'|'mixed'}
-- Metrics (per class):
--   {counts: {hieu,nho,gap,dung,doi,known}, assigned: {hieu,nho,gap,dung,total}, words: {cardId: 1..5}}
-- Settings: {branch: 'cert'|'talk', level: 'beginner'|'intermediate'|'advanced'|'expert'|null}

insert into cortex_apps (id, name) values ('lexica', 'Lexica') on conflict (id) do update set name = excluded.name;

-- Words a teacher assigned that Lexica has no card for yet; Studio writes them.
create table if not exists lexica_word_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references cortex_classes(id) on delete set null,
  word text not null check (char_length(word) between 1 and 60),
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now()
);
create index if not exists lexica_word_requests_status_idx on lexica_word_requests (status, created_at);
alter table lexica_word_requests enable row level security;
do $$ begin
  -- Studio editors read and close word requests (is_studio_editor from migration_studio.sql).
  if to_regprocedure('public.is_studio_editor()') is not null then
    drop policy if exists "lexica_word_requests editors" on lexica_word_requests;
    create policy "lexica_word_requests editors" on lexica_word_requests
      for all using (is_studio_editor()) with check (is_studio_editor());
  end if;
end $$;

-- Step counts: four non-negative ints, plus "Đời", a total and words known beforehand ("known") when given.
create or replace function public.lexica_counts(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'hieu', least(greatest(coalesce((p->>'hieu')::int, 0), 0), 100000),
    'nho', least(greatest(coalesce((p->>'nho')::int, 0), 0), 100000),
    'gap', least(greatest(coalesce((p->>'gap')::int, 0), 0), 100000),
    'dung', least(greatest(coalesce((p->>'dung')::int, 0), 0), 100000),
    'doi', case when p ? 'doi' then least(greatest((p->>'doi')::int, 0), 100000) end,
    'total', case when p ? 'total' then least(greatest((p->>'total')::int, 0), 100000) end,
    'known', case when p ? 'known' then least(greatest((p->>'known')::int, 0), 100000) end
  ));
$$;

-- ── hooks ───────────────────────────────────────────────────────────────

create or replace function public.classroom_lexica_clean_settings(p jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'branch', case when p->>'branch' = 'talk' then 'talk' else 'cert' end,
    'level', case when p->>'level' in ('beginner','intermediate','advanced','expert') then p->>'level' end
  ));
$$;

create or replace function public.classroom_lexica_clean_payload(p_kind text, p jsonb)
returns jsonb language plpgsql immutable as $$
declare
  ids jsonb;
  missing jsonb;
begin
  if p_kind <> 'words' then raise exception 'bad payload'; end if;
  select coalesce(jsonb_agg(distinct x), '[]') into ids
  from (select jsonb_array_elements_text(coalesce(p->'card_ids', '[]')) x limit 200) t where char_length(x) between 1 and 40;
  select coalesce(jsonb_agg(distinct lower(trim(x))), '[]') into missing
  from (select jsonb_array_elements_text(coalesce(p->'missing_words', '[]')) x limit 200) t where char_length(trim(x)) between 1 and 60;
  if jsonb_array_length(ids) = 0 and jsonb_array_length(missing) = 0 then raise exception 'no words'; end if;
  return jsonb_build_object('card_ids', ids, 'missing_words', missing, 'mode', case when p->>'mode' = 'mixed' then 'mixed' else 'only' end);
end;
$$;

-- What a class may see: the student's counts, their counts on this class's words, and steps on those words only.
create or replace function public.classroom_lexica_clean_metrics(p_class uuid, p jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  words jsonb;
  sounds jsonb;
begin
  select coalesce(jsonb_object_agg(k, least(greatest((v #>> '{}')::int, 0), 5)), '{}') into words
  from jsonb_each(coalesce(p->'words', '{}')) e(k, v)
  where jsonb_typeof(v) = 'number'
    and exists (
      select 1 from cortex_class_assignments a
      where a.class_id = p_class and a.app = 'lexica' and a.payload->'card_ids' ? k
    );
  -- Pronunciation (docs/LEXICA_PRONUNCIATION_DESIGN.md, 7.3): per sound group,
  -- [tries, misses] over 14 days. Numbers only: known groups, 0-10000, misses <= tries.
  select coalesce(jsonb_object_agg(k, jsonb_build_array(t, least(m, t))), '{}') into sounds
  from (
    select k,
      least(greatest(round((v->>0)::numeric), 0), 10000)::int as t,
      least(greatest(round((v->>1)::numeric), 0), 10000)::int as m
    from jsonb_each(case when jsonb_typeof(p->'sounds') = 'object' then p->'sounds' else '{}' end) e(k, v)
    where k in ('final_consonant', 'final_voicing', 'th', 'cluster', 'ending', 'long_short', 'ch_j', 'final_ng', 'final_l', 'initial_z', 'ae_e')
      and jsonb_typeof(v) = 'array' and jsonb_array_length(v) = 2
      and jsonb_typeof(v->0) = 'number' and jsonb_typeof(v->1) = 'number'
  ) x;
  return jsonb_build_object(
    'counts', lexica_counts(coalesce(p->'counts', '{}')),
    'assigned', lexica_counts(coalesce(p->'assigned'->(p_class::text), '{}')),
    'words', words,
    'sounds', sounds
  );
end;
$$;

-- Ranked by words they can say (Dùng), then remember (Nhớ); never by game points.
create or replace function public.classroom_lexica_rank(p jsonb)
returns numeric language sql immutable as $$
  select coalesce((p->'counts'->>'dung')::numeric, 0) * 100000 + coalesce((p->'counts'->>'nho')::numeric, 0);
$$;

create or replace function public.classroom_lexica_after_assign(p_class uuid, p_assignment uuid, p jsonb)
returns void language sql volatile security definer set search_path = public as $$
  insert into lexica_word_requests (class_id, word)
  select p_class, w from jsonb_array_elements_text(coalesce(p->'missing_words', '[]')) w;
$$;

do $$
declare f text;
begin
  foreach f in array array['classroom_lexica_clean_settings(jsonb)', 'classroom_lexica_clean_payload(text, jsonb)',
    'classroom_lexica_clean_metrics(uuid, jsonb)', 'classroom_lexica_rank(jsonb)', 'classroom_lexica_after_assign(uuid, uuid, jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;

notify pgrst, 'reload schema';
