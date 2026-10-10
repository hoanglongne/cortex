-- Lexica Studio (docs/LEXICA_STUDIO_SPEC.md): trend → AI draft → human review → content pack.
-- Tables live in `public` with a `studio_` prefix so PostgREST serves them without
-- exposing an extra schema. Every table is editor-only through RLS; the Cortex API
-- calls Supabase with the editor's own JWT, so no service-role key is needed.
-- Idempotent: safe to re-run.

create table if not exists studio_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_studio_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from studio_editors where user_id = auth.uid());
$$;

-- Trends: manual in v1 (collectors come in phase 2)
create table if not exists studio_trends (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  summary text,
  url text,
  source text not null default 'manual',
  status text not null default 'new'
    check (status in ('new','queued','generated','ignored','blocked')),
  hotness real not null default 0,
  tags text[] not null default '{}',
  target_words text[] not null default '{}',     -- optional: editor-picked words
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz,
  generated_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists studio_trends_status_idx on studio_trends (status, created_at desc);

-- Words the generator may teach (seeded from Lexica's core cards)
create table if not exists studio_lexemes (
  word text primary key,                          -- lowercase
  ipa text,
  elo int not null,
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  in_core boolean not null default false,
  times_used int not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists studio_drafts (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references studio_trends(id) on delete set null,
  word text not null references studio_lexemes(word),
  scenario text not null,
  translation_hint text not null,
  archetype text check (archetype in ('casual','tech','business','student')),
  tone text,
  model text not null,
  prompt_version text not null,
  validation jsonb not null default '{}',
  status text not null default 'pending'
    check (status in ('pending','rejected_auto','approved','rejected','edited')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  reject_reason text,
  card_id text,
  created_at timestamptz not null default now()
);
create index if not exists studio_drafts_status_idx on studio_drafts (status, created_at);

create table if not exists studio_cards (
  id text primary key,                            -- 't' + base36, never collides with core 'v###'
  draft_id uuid references studio_drafts(id) on delete set null,
  word text not null references studio_lexemes(word),
  ipa text,
  elo int not null,
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  scenario text not null,
  translation_hint text not null,
  trend_label text,
  tags text[] not null default '{}',
  lifecycle text not null default 'trend' check (lifecycle in ('trend','evergreen','retired')),
  revision int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists studio_cards_lifecycle_idx on studio_cards (lifecycle, created_at desc);

create table if not exists studio_drops (
  id text primary key,                            -- 'drop-2026-w42'
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  expires_at timestamptz,                         -- trend cards of this drop stop being dealt
  published_at timestamptz,
  pack_url text,
  pack_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists studio_drop_cards (
  drop_id text references studio_drops(id) on delete cascade,
  card_id text references studio_cards(id) on delete cascade,
  position int not null default 0,
  primary key (drop_id, card_id)
);

create table if not exists studio_blocklist (
  pattern text primary key,
  kind text not null check (kind in ('word','regex','person','topic')),
  note text
);

create table if not exists studio_job_runs (
  id bigserial primary key,
  job text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  stats jsonb not null default '{}',
  error text,
  created_by uuid references auth.users(id)
);
create index if not exists studio_job_runs_job_idx on studio_job_runs (job, started_at desc);

-- RLS: editors only
alter table studio_editors enable row level security;
drop policy if exists "studio_editors self read" on studio_editors;
create policy "studio_editors self read" on studio_editors
  for select using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['studio_trends','studio_lexemes','studio_drafts','studio_cards',
                           'studio_drops','studio_drop_cards','studio_blocklist','studio_job_runs']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s editors" on %I', t, t);
    execute format('create policy "%s editors" on %I for all using (is_studio_editor()) with check (is_studio_editor())', t, t);
  end loop;
end $$;

-- Public bucket for published packs; only editors may write
insert into storage.buckets (id, name, public)
values ('lexica-content', 'lexica-content', true)
on conflict (id) do nothing;

drop policy if exists "lexica-content editors insert" on storage.objects;
create policy "lexica-content editors insert" on storage.objects
  for insert with check (bucket_id = 'lexica-content' and is_studio_editor());
drop policy if exists "lexica-content editors update" on storage.objects;
create policy "lexica-content editors update" on storage.objects
  for update using (bucket_id = 'lexica-content' and is_studio_editor());
drop policy if exists "lexica-content editors select" on storage.objects;
create policy "lexica-content editors select" on storage.objects
  for select using (bucket_id = 'lexica-content' and is_studio_editor());

-- Default blocklist (editable in Studio)
insert into studio_blocklist (pattern, kind, note) values
  ('chính trị', 'topic', 'Không đụng chính trị'),
  ('đảng', 'topic', 'Không đụng chính trị'),
  ('tôn giáo', 'topic', 'Không đụng tôn giáo'),
  ('chết', 'topic', 'Thảm hoạ, tai nạn, vụ án'),
  ('tự tử', 'topic', 'Sức khoẻ tâm thần'),
  ('đm', 'word', 'Tục nặng'),
  ('địt', 'word', 'Tục nặng'),
  ('lồn', 'word', 'Tục nặng'),
  ('cặc', 'word', 'Tục nặng')
on conflict (pattern) do nothing;

-- To make someone an editor (run once in SQL Editor):
--   insert into studio_editors (user_id) select id from auth.users where email = 'you@example.com';
