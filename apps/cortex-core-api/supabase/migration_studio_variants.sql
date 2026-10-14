-- Example sentences per learner archetype (docs: variants.ts in the studio
-- module). Each card's own scenario is the casual one; Studio writes a tech,
-- a business and a student version, editors approve them, and the approved
-- ones ship as one overlay file listed in the content manifest.
-- Requires migration_studio.sql. Idempotent.

-- Lexica's bundled core cards, so Studio can write variants for them too.
-- Filled by seed_studio_core_cards.sql (scripts/build-studio-core-cards.py).
create table if not exists studio_core_cards (
  id text primary key,                            -- 'v###'
  word text not null,
  scenario text not null,
  translation_hint text not null,
  level text not null check (level in ('beginner','intermediate','advanced','expert')),
  elo int not null
);

create table if not exists studio_card_variants (
  card_id text not null,                          -- core 'v###' or Studio 't…'
  archetype text not null check (archetype in ('tech','business','student')),
  scenario text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  model text,
  prompt_version text,
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (card_id, archetype)
);
create index if not exists studio_card_variants_status_idx on studio_card_variants (status, created_at);

do $$
declare t text;
begin
  foreach t in array array['studio_core_cards','studio_card_variants']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s editors" on %I', t, t);
    execute format('create policy "%s editors" on %I for all using (is_studio_editor()) with check (is_studio_editor())', t, t);
  end loop;
end $$;
