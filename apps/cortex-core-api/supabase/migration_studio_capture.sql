-- Lexica Studio: capture posts while browsing (browser extension, Android share,
-- iOS Shortcut). Captured posts become signals that show up in Studio → Radar.
-- Requires migration_studio.sql and migration_studio_phase2.sql. Idempotent.

-- Captures are a new source kind
alter table studio_sources drop constraint if exists studio_sources_kind_check;
alter table studio_sources add constraint studio_sources_kind_check
  check (kind in ('google_trends','rss','youtube','manual','capture'));

insert into studio_sources (id, kind, label, weight, config, enabled) values
  ('capture_threads', 'capture', 'Gửi từ Threads', 2.0, '{}', true),
  ('capture_facebook', 'capture', 'Gửi từ Facebook', 2.0, '{}', true),
  ('capture_tiktok', 'capture', 'Gửi từ TikTok', 2.0, '{}', true),
  ('capture_web', 'capture', 'Gửi từ web khác', 1.5, '{}', true)
on conflict (id) do nothing;

-- Extra fields for captured posts (collector signals leave them null)
alter table studio_signals add column if not exists body text
  check (body is null or char_length(body) <= 2000);
alter table studio_signals add column if not exists author text
  check (author is null or char_length(author) <= 100);
alter table studio_signals add column if not exists note text
  check (note is null or char_length(note) <= 500);
alter table studio_signals add column if not exists metrics jsonb;
alter table studio_signals add column if not exists captured_by uuid references auth.users(id) on delete set null;
alter table studio_signals add column if not exists dismissed boolean not null default false;
create index if not exists studio_signals_captured_idx
  on studio_signals (captured_by, seen_at desc) where captured_by is not null;

-- Long-lived tokens for the extension and the iOS Shortcut. Only a SHA-256
-- hash is stored; a token can only add captures for its owner.
create table if not exists studio_capture_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 60),
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

alter table studio_capture_tokens enable row level security;
drop policy if exists "studio_capture_tokens editors" on studio_capture_tokens;
create policy "studio_capture_tokens editors" on studio_capture_tokens
  for all using (is_studio_editor() and user_id = auth.uid())
  with check (is_studio_editor() and user_id = auth.uid());

-- Called by the Cortex API (POST /capture) with the anon key. Checks the
-- token hash, then stores the capture. The same link captured again within
-- 7 days returns the earlier capture (and keeps the newest note) instead of
-- a duplicate.
create or replace function studio_capture_with_token(p_token_hash text, p_capture jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_token uuid;
  v_id bigint;
  v_source text := coalesce(p_capture->>'source_id', 'capture_web');
  v_url text := nullif(p_capture->>'url', '');
begin
  select id, user_id into v_token, v_user
  from studio_capture_tokens
  where token_hash = p_token_hash and revoked_at is null;
  if v_user is null or not exists (select 1 from studio_editors where user_id = v_user) then
    raise exception 'invalid capture token' using errcode = '28000';
  end if;
  if v_source not like 'capture\_%' or not exists (select 1 from studio_sources where id = v_source) then
    v_source := 'capture_web';
  end if;

  update studio_capture_tokens set last_used_at = now() where id = v_token;

  if v_url is not null then
    select id into v_id from studio_signals
    where url = v_url and captured_by = v_user and seen_at > now() - interval '7 days'
    order by seen_at desc limit 1;
    if v_id is not null then
      update studio_signals set
        note = coalesce(nullif(p_capture->>'note', ''), note),
        body = coalesce(body, nullif(p_capture->>'body', '')),
        dismissed = false
      where id = v_id;
      return v_id;
    end if;
  end if;

  insert into studio_signals (source_id, phrase, context, url, metric, body, author, note, metrics, captured_by)
  values (
    v_source,
    left(coalesce(nullif(p_capture->>'phrase', ''), '(chưa có nội dung)'), 160),
    left(nullif(p_capture->>'context', ''), 300),
    v_url,
    1,
    left(nullif(p_capture->>'body', ''), 2000),
    left(nullif(p_capture->>'author', ''), 100),
    left(nullif(p_capture->>'note', ''), 500),
    case when jsonb_typeof(p_capture->'metrics') = 'object' then p_capture->'metrics' end,
    v_user
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function studio_capture_with_token(text, jsonb) from public;
grant execute on function studio_capture_with_token(text, jsonb) to anon, authenticated;

-- Lets the extension's "Kiểm tra" button confirm a token without saving
-- anything. Returns the token's name, or null when it is unknown or revoked.
create or replace function studio_capture_token_name(p_token_hash text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select t.name from studio_capture_tokens t
  join studio_editors e on e.user_id = t.user_id
  where t.token_hash = p_token_hash and t.revoked_at is null;
$$;

revoke all on function studio_capture_token_name(text) from public;
grant execute on function studio_capture_token_name(text) to anon, authenticated;
