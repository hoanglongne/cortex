-- Collocations ("Hay đi với") on Studio drafts and cards, and an optional
-- media clip on quotes (a YouTube video with start/end seconds for song lines).
-- Safe to re-run.
alter table studio_drafts add column if not exists collocations text[] not null default '{}';
alter table studio_cards add column if not exists collocations text[] not null default '{}';
alter table studio_card_quotes add column if not exists media jsonb;
