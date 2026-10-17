-- Lexica "Đọc" passages (docs/LEXICA_FEEDBACK_TASKS.md T7): short English
-- texts written around 3–5 deck words, reviewed by an editor and published as
-- a pack (manifest `passages`). Safe to re-run.
create table if not exists studio_passages (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  topic text not null,
  title text not null,
  text text not null,
  translation text not null,
  new_words text[] not null,                     -- card ids the passage introduces
  words text[] not null default '{}',            -- other deck card ids in the text
  questions jsonb not null default '[]',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  model text,
  prompt_version text,
  created_by uuid references auth.users(id),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists studio_passages_status_idx on studio_passages (status, created_at);

alter table studio_passages enable row level security;
drop policy if exists "studio_passages editors" on studio_passages;
create policy "studio_passages editors" on studio_passages
  for all using (is_studio_editor()) with check (is_studio_editor());
