-- Lexica Giao tiếp branch (docs/LEXICA_DIRECTION.md): phrase cards with a
-- situation to say them in, reviewed by an editor and published as the
-- `talk` card pack; dialogues are passages of kind 'dialogue'.
-- Requires migration_studio_passages.sql. Safe to re-run.
create table if not exists studio_talk_cards (
  id uuid primary key default gen_random_uuid(),
  card_id text not null unique,                 -- 'k…' for Studio phrases, 'g###' for the ones bundled in the app
  core boolean not null default false,          -- bundled in the app: never published in the pack
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  topic text not null,
  phrase text not null,
  scenario text not null,
  translation_hint text not null,
  situation_prompt text not null,
  situation_model text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  model text,
  prompt_version text,
  created_by uuid references auth.users(id),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists studio_talk_cards_status_idx on studio_talk_cards (status, created_at);
create unique index if not exists studio_talk_cards_phrase_idx on studio_talk_cards (phrase) where status <> 'rejected';

alter table studio_talk_cards enable row level security;
drop policy if exists "studio_talk_cards editors" on studio_talk_cards;
create policy "studio_talk_cards editors" on studio_talk_cards
  for all using (is_studio_editor()) with check (is_studio_editor());

alter table studio_passages add column if not exists kind text not null default 'text';
alter table studio_passages drop constraint if exists studio_passages_kind_check;
alter table studio_passages add constraint studio_passages_kind_check check (kind in ('text','dialogue'));
