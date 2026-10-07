-- Cortex Core API tables (action_logs, app_backups, user_vocabulary,
-- linguistic_profiles).
-- Idempotent: safe to run on a project that already has some of these.

create extension if not exists "uuid-ossp";

-- Append-only activity log from every app (POST /actions/log)
create table if not exists action_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  app_source text not null,
  action_type text not null,
  metadata jsonb,
  timestamp timestamptz default now()
);

create index if not exists action_logs_user_time_idx
  on action_logs (user_id, timestamp desc);

-- Raw state snapshot per user + app (POST /v1/sync/backup)
create table if not exists app_backups (
  user_id uuid not null,
  app_source text not null,
  raw_data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, app_source)
);

-- Words a user has learned, one row per user + word (POST /actions/log
-- with appSource=lexica). Unique key matches upsert onConflict 'user_id,word'.
create table if not exists user_vocabulary (
  user_id uuid not null,
  word text not null,
  created_at timestamptz default now(),
  primary key (user_id, word)
);

-- Aggregated per-user linguistic stats, upserted by ActionsController and
-- read live by the landing dashboard. Upsert onConflict is 'user_id'.
-- Column set must cover every field the API writes: it spreads the existing
-- row into each update.
create table if not exists linguistic_profiles (
  user_id uuid primary key,
  vocabulary_size integer default 0,
  active_vocab_count integer default 0,
  passive_vocab_count integer default 0,
  passive_vocab_samples text[] default '{}',
  top_topics text[] default '{}',
  fluency_score double precision,
  difficulty_recommendation jsonb,
  refined_insights jsonb default '{}'::jsonb,
  last_updated timestamptz default now()
);

-- Landing dashboard subscribes to postgres_changes on linguistic_profiles
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and tablename = 'linguistic_profiles'
     ) then
    alter publication supabase_realtime add table public.linguistic_profiles;
  end if;
end $$;
