-- Lexica "Ngoài đời": real quotes that contain a card's word (books, headlines,
-- song lines). Editors review every row before it is published with the
-- archetype overlay (variants.service.ts publish).
create table if not exists studio_card_quotes (
  id uuid primary key default gen_random_uuid(),
  card_id text not null,                          -- core 'v###' or Studio 't…'
  kind text not null check (kind in ('book','news','song')),
  text text not null,
  translation text,
  source text not null,                           -- "Pride and Prejudice — Jane Austen"
  url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists studio_card_quotes_status_idx on studio_card_quotes (status, created_at);

alter table studio_card_quotes enable row level security;
drop policy if exists "studio_card_quotes editors" on studio_card_quotes;
create policy "studio_card_quotes editors" on studio_card_quotes
  for all using (is_studio_editor()) with check (is_studio_editor());
