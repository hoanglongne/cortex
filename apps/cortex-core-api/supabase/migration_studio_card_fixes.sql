-- Fixes for cards flagged in "Sức khoẻ nội dung" (issue #62). Safe to re-run.
--  - studio_hidden_cards: cards taken out of Lexica for now ("tạm ẩn"); their ids go in the manifest's `retired` list.
--  - studio_card_rewrites: a new example sentence for a card that ships in the Lexica app itself; it travels in the variants overlay and replaces the card's own sentence.
-- Requires migration_studio.sql (is_studio_editor). Editors only, through RLS.

create table if not exists studio_hidden_cards (
  card_id text primary key,
  reason text,
  hidden_by uuid references auth.users(id),
  hidden_at timestamptz not null default now()
);

create table if not exists studio_card_rewrites (
  card_id text primary key,
  scenario text not null check (char_length(scenario) between 1 and 200),
  editor_id uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['studio_hidden_cards','studio_card_rewrites']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s editors" on %I', t, t);
    execute format('create policy "%s editors" on %I for all using (is_studio_editor()) with check (is_studio_editor())', t, t);
  end loop;
end $$;
