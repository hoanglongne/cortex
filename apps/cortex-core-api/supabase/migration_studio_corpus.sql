-- Lexica "Ngoài đời" v2: a sentence corpus built once from public-domain books
-- (src/modules/studio/corpus/books.ts), searched by lemma instead of asking
-- Gutendex per word. Also records which cards were searched, and when the
-- approved quotes were last published. Safe to re-run.

create table if not exists studio_corpus_books (
  id text primary key,                         -- 'pg1342'
  gutenberg_id int not null,
  title text not null,
  author text not null,
  sentences int not null default 0,
  built_at timestamptz,
  error text                                   -- last download/parse failure
);

create table if not exists studio_corpus_sentences (
  id bigserial primary key,
  book_id text not null references studio_corpus_books(id) on delete cascade,
  text text not null check (char_length(text) between 40 and 220),
  lemmas text[] not null
);
create index if not exists studio_corpus_sentences_lemmas_idx
  on studio_corpus_sentences using gin (lemmas);
create index if not exists studio_corpus_sentences_book_idx
  on studio_corpus_sentences (book_id);

-- One row per card that was searched; the nightly job skips cards searched
-- since the corpus last changed, so "Tìm" always moves on to new cards.
create table if not exists studio_quote_attempts (
  card_id text primary key,
  tried_at timestamptz not null default now(),
  found int not null default 0
);

alter table studio_card_quotes add column if not exists published_at timestamptz;

do $$
declare t text;
begin
  foreach t in array array['studio_corpus_books','studio_corpus_sentences','studio_quote_attempts']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s editors" on %I', t, t);
    execute format('create policy "%s editors" on %I for all using (is_studio_editor()) with check (is_studio_editor())', t, t);
  end loop;
end $$;
