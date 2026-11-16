-- Lexica Núm vặn extension, cross-device (issue #141). Idempotent: safe to re-run.
--
-- A signed-in learner's Lexica gives the extension a "dial token". It can only:
--   * read the learner's review schedule (card id -> next review) from the
--     Lexica backup (app_backups), and
--   * add "tapped" words, which Lexica claims and applies on any device.
-- Only a SHA-256 hash of the token is stored. One live token per user.

create table if not exists lexica_dial_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists lexica_dial_tokens_user_idx on lexica_dial_tokens (user_id) where revoked_at is null;

create table if not exists lexica_dial_taps (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null check (card_id ~ '^v[0-9]{3,4}$'),
  tapped_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists lexica_dial_taps_user_idx on lexica_dial_taps (user_id, created_at);

-- No direct table access: everything goes through the functions below.
alter table lexica_dial_tokens enable row level security;
alter table lexica_dial_taps enable row level security;
revoke all on lexica_dial_tokens from anon, authenticated;
revoke all on lexica_dial_taps from anon, authenticated;

-- Signed-in learner: replace their token with a new one (the API generates it).
create or replace function lexica_dial_token_set(p_token_hash text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'bad hash'; end if;
  update lexica_dial_tokens set revoked_at = now() where user_id = auth.uid() and revoked_at is null;
  insert into lexica_dial_tokens (user_id, token_hash) values (auth.uid(), p_token_hash);
end $$;

-- Signed-in learner: turn the extension link off.
create or replace function lexica_dial_token_revoke()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update lexica_dial_tokens set revoked_at = now() where user_id = auth.uid() and revoked_at is null;
end $$;

-- Owner of a live token (internal helper).
create or replace function lexica_dial_token_owner(p_token_hash text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  update lexica_dial_tokens set last_used_at = now()
   where token_hash = p_token_hash and revoked_at is null
  returning user_id into v_user;
  return v_user;
end $$;
revoke all on function lexica_dial_token_owner(text) from public, anon, authenticated;

-- Extension: { "v004": 1763200000000, ... } (next review, ms since epoch). Null if the token is not live.
create or replace function lexica_dial_schedule(p_token_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_out jsonb;
begin
  v_user := lexica_dial_token_owner(p_token_hash);
  if v_user is null then return null; end if;
  select coalesce(jsonb_object_agg(e.key, (e.value->>'nextReviewAt')::bigint), '{}'::jsonb)
    into v_out
    from app_backups b,
         jsonb_each(coalesce(b.raw_data->'state'->'state'->'cardProgress', '{}'::jsonb)) e
   where b.user_id = v_user and b.app_source = 'lexica'
     and e.key ~ '^v[0-9]{3,4}$'
     and jsonb_typeof(e.value->'nextReviewAt') = 'number';
  return coalesce(v_out, '{}'::jsonb);
end $$;

-- Extension: add tapped words (at most 200 per call, 2,000 waiting per user). Returns how many were kept, or -1 if the token is not live.
create or replace function lexica_dial_add_taps(p_token_hash text, p_taps jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_n int;
begin
  v_user := lexica_dial_token_owner(p_token_hash);
  if v_user is null then return -1; end if;
  if jsonb_typeof(p_taps) <> 'array' or jsonb_array_length(p_taps) > 200 then raise exception 'bad taps'; end if;
  if (select count(*) from lexica_dial_taps where user_id = v_user) >= 2000 then return 0; end if;
  insert into lexica_dial_taps (user_id, card_id, tapped_at)
  select v_user, t->>'cardId', to_timestamp((t->>'at')::bigint / 1000.0)
    from jsonb_array_elements(p_taps) t
   where t->>'cardId' ~ '^v[0-9]{3,4}$'
     and jsonb_typeof(t->'at') = 'number'
     and to_timestamp((t->>'at')::bigint / 1000.0) between now() - interval '30 days' and now() + interval '1 minute';
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- Signed-in learner (Lexica on any device): take the waiting taps and clear them.
create or replace function lexica_dial_claim_taps()
returns table (card_id text, tapped_at timestamptz) language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  return query
    with d as (delete from lexica_dial_taps t where t.user_id = auth.uid() returning t.card_id, t.tapped_at)
    select d.card_id, d.tapped_at from d order by d.tapped_at;
end $$;

grant execute on function lexica_dial_token_set(text) to authenticated;
grant execute on function lexica_dial_token_revoke() to authenticated;
grant execute on function lexica_dial_claim_taps() to authenticated;
grant execute on function lexica_dial_schedule(text) to anon, authenticated;
grant execute on function lexica_dial_add_taps(text, jsonb) to anon, authenticated;
