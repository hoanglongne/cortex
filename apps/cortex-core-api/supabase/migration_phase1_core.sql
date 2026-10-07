-- Cortex Core API - Phase 1 tables.
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
