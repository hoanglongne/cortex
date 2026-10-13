-- Lexica collection economy (docs/LEXICA_ENGAGEMENT_SPEC.md §2): minting
-- card editions, boxes, dust, reroll tickets, streak freezes.
--
-- Everything that changes a wallet runs inside these security-definer
-- functions, called by signed-in users with their own session
-- (supabase.rpc). Users can read their own rows but never write them, so the
-- odds, pity counters and daily caps are enforced here, not in the app.
-- Idempotent: safe to re-run. Requires migration_phase1_core.sql (app_backups).

-- ------------------------------------------------------------------ tables

create table if not exists public.lexica_card_editions (
  user_id uuid references auth.users(id) on delete cascade,
  card_id text not null check (char_length(card_id) <= 40),
  edition text not null check (edition in ('common','silver','holo','legendary')),
  serial int,                                  -- legendary only
  minted_at timestamptz not null default now(),
  rerolls int not null default 0,
  primary key (user_id, card_id)
);

create sequence if not exists public.lexica_legendary_serial;

create table if not exists public.lexica_wallet (
  user_id uuid primary key references auth.users(id) on delete cascade,
  boxes int not null default 0,
  pending_boxes int not null default 0,        -- earned over today's cap, delivered tomorrow
  dust int not null default 0,
  reroll_tickets int not null default 0,
  streak_freezes int not null default 0,
  since_holo int not null default 0,
  since_legendary int not null default 0,
  mints_total int not null default 0,
  mints_today int not null default 0,
  boxes_today int not null default 0,
  day date
);

-- Every change to a wallet, for auditing and undoing mistakes.
create table if not exists public.lexica_wallet_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  delta jsonb not null,
  ref text,
  at timestamptz not null default now()
);
create index if not exists lexica_wallet_ledger_user_idx on public.lexica_wallet_ledger (user_id, at desc);
-- One reward per claim (daily goal of a date, a set, a streak milestone…).
create unique index if not exists lexica_wallet_ledger_claim_idx
  on public.lexica_wallet_ledger (user_id, kind, ref) where kind like 'claim:%';

-- When the server first saw a learned card in the user's synced progress.
-- Minting needs 7 real days since then, which a forged backup cannot skip.
create table if not exists public.lexica_card_first_seen (
  user_id uuid references auth.users(id) on delete cascade,
  card_id text not null,
  first_seen_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- Tunable numbers (odds, prices, caps). Change a row, no deploy needed.
create table if not exists public.lexica_engagement_config (
  key text primary key,
  value jsonb not null
);
insert into public.lexica_engagement_config (key, value) values
  ('mint_odds', '{"silver": 0.15, "holo": 0.045, "legendary": 0.005}'),
  ('pity', '{"holo_after": 30, "legendary_soft_after": 200, "legendary_soft_step": 0.005}'),
  ('mint_rules', '{"min_days": 7, "min_reviews": 3, "max_per_day": 30, "box_every": 10}'),
  ('boxes', '{"daily_cap": 3, "pending_max": 10, "daily_goal": 1, "set_complete": 2, "ghost_streak": 1, "streak_7": 1, "streak_30": 3, "streak_100": 5}'),
  ('box_table', '[{"item":"dust","amount":20,"p":0.55},{"item":"dust","amount":50,"p":0.20},{"item":"freeze","amount":1,"p":0.12},{"item":"ticket","amount":1,"p":0.10},{"item":"dust","amount":150,"p":0.03}]'),
  ('prices', '{"ticket": 120, "upgrade_silver": 300, "freeze_max": 2, "refund_common": 10, "refund_silver": 25, "freeze_full_dust": 30}')
on conflict (key) do nothing;

alter table public.lexica_card_editions enable row level security;
alter table public.lexica_wallet enable row level security;
alter table public.lexica_wallet_ledger enable row level security;
alter table public.lexica_card_first_seen enable row level security;
alter table public.lexica_engagement_config enable row level security;

drop policy if exists "lexica_card_editions own read" on public.lexica_card_editions;
create policy "lexica_card_editions own read" on public.lexica_card_editions for select using (user_id = auth.uid());
drop policy if exists "lexica_wallet own read" on public.lexica_wallet;
create policy "lexica_wallet own read" on public.lexica_wallet for select using (user_id = auth.uid());
drop policy if exists "lexica_wallet_ledger own read" on public.lexica_wallet_ledger;
create policy "lexica_wallet_ledger own read" on public.lexica_wallet_ledger for select using (user_id = auth.uid());
drop policy if exists "lexica_card_first_seen own read" on public.lexica_card_first_seen;
create policy "lexica_card_first_seen own read" on public.lexica_card_first_seen for select using (user_id = auth.uid());
drop policy if exists "lexica_engagement_config read" on public.lexica_engagement_config;
create policy "lexica_engagement_config read" on public.lexica_engagement_config for select using (true);

-- ---------------------------------------------------------------- helpers

create or replace function public.lexica_cfg(p_key text)
returns jsonb language sql stable security definer set search_path = public as $$
  select value from lexica_engagement_config where key = p_key;
$$;

create or replace function public.lexica_today()
returns date language sql stable as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

create or replace function public.lexica_edition_rank(p_edition text)
returns int language sql immutable as $$
  select case p_edition when 'common' then 0 when 'silver' then 1 when 'holo' then 2 when 'legendary' then 3 else -1 end;
$$;

-- Locks and returns the caller's wallet, creating it and rolling the day over.
create or replace function public.lexica_wallet_for_update(p_user uuid)
returns public.lexica_wallet language plpgsql security definer set search_path = public as $$
declare
  w lexica_wallet;
  cap int := (lexica_cfg('boxes')->>'daily_cap')::int;
  deliver int;
begin
  insert into lexica_wallet (user_id, day) values (p_user, lexica_today()) on conflict (user_id) do nothing;
  select * into w from lexica_wallet where user_id = p_user for update;
  if w.day is distinct from lexica_today() then
    deliver := least(w.pending_boxes, cap);
    update lexica_wallet set
      day = lexica_today(), mints_today = 0,
      boxes_today = deliver, boxes = boxes + deliver, pending_boxes = pending_boxes - deliver
    where user_id = p_user returning * into w;
    if deliver > 0 then
      insert into lexica_wallet_ledger (user_id, kind, delta) values (p_user, 'box_delivered', jsonb_build_object('boxes', deliver));
    end if;
  end if;
  return w;
end;
$$;

-- Adds boxes within today's cap; the rest waits for tomorrow (up to pending_max).
create or replace function public.lexica_grant_boxes(p_user uuid, p_count int, p_kind text, p_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare
  w lexica_wallet := lexica_wallet_for_update(p_user);
  cap int := (lexica_cfg('boxes')->>'daily_cap')::int;
  pending_max int := (lexica_cfg('boxes')->>'pending_max')::int;
  now_count int := greatest(0, least(p_count, cap - w.boxes_today));
  later int := least(p_count - now_count, pending_max - w.pending_boxes);
begin
  later := greatest(later, 0);
  update lexica_wallet set
    boxes = boxes + now_count, boxes_today = boxes_today + now_count, pending_boxes = pending_boxes + later
  where user_id = p_user;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref)
  values (p_user, p_kind, jsonb_build_object('boxes', now_count, 'pending', later), p_ref);
  return now_count;
end;
$$;

-- One edition roll. p_pity = false for rerolls (base odds, counters untouched).
create or replace function public.lexica_roll_edition(p_user uuid, p_pity boolean)
returns text language plpgsql security definer set search_path = public as $$
declare
  w lexica_wallet;
  odds jsonb := lexica_cfg('mint_odds');
  pity jsonb := lexica_cfg('pity');
  p_leg numeric := (odds->>'legendary')::numeric;
  p_holo numeric := (odds->>'holo')::numeric;
  p_silver numeric := (odds->>'silver')::numeric;
  r numeric := random();
  result text;
begin
  if p_pity then
    select * into w from lexica_wallet where user_id = p_user;
    if w.since_legendary >= (pity->>'legendary_soft_after')::int then
      p_leg := p_leg + (pity->>'legendary_soft_step')::numeric * (w.since_legendary - (pity->>'legendary_soft_after')::int + 1);
    end if;
    -- Hard pity: after holo_after mints without Holo, the next is Holo or better.
    if w.since_holo >= (pity->>'holo_after')::int then
      result := case when random() < p_leg / (p_leg + p_holo) then 'legendary' else 'holo' end;
    end if;
  end if;
  if result is null then
    result := case
      when r < p_leg then 'legendary'
      when r < p_leg + p_holo then 'holo'
      when r < p_leg + p_holo + p_silver then 'silver'
      else 'common' end;
  end if;
  if p_pity then
    update lexica_wallet set
      since_holo = case when lexica_edition_rank(result) >= 2 then 0 else since_holo + 1 end,
      since_legendary = case when result = 'legendary' then 0 else since_legendary + 1 end
    where user_id = p_user;
  end if;
  return result;
end;
$$;

-- The caller's synced progress for one card (from the Lexica backup).
create or replace function public.lexica_backup_progress(p_user uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(raw_data->'state'->'state'->'cardProgress', '{}'::jsonb)
  from app_backups where user_id = p_user and app_source = 'lexica';
$$;

-- --------------------------------------------------------------- public API

-- Wallet, editions, cards ready to mint, public odds. Also records first
-- sightings of learned cards, which start their 7-day mint clock.
create or replace function public.lexica_engagement_state()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  progress jsonb;
  rules jsonb := lexica_cfg('mint_rules');
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  progress := coalesce(lexica_backup_progress(uid), '{}'::jsonb);

  insert into lexica_card_first_seen (user_id, card_id)
  select uid, key from jsonb_object_keys(progress) as key
  where char_length(key) <= 40
  on conflict do nothing;

  return jsonb_build_object(
    'wallet', to_jsonb(w) - 'user_id',
    'editions', coalesce((
      select jsonb_object_agg(card_id, jsonb_build_object('edition', edition, 'serial', serial, 'rerolls', rerolls))
      from lexica_card_editions where user_id = uid), '{}'::jsonb),
    'ready', coalesce((
      select jsonb_agg(f.card_id order by f.first_seen_at)
      from lexica_card_first_seen f
      where f.user_id = uid
        and f.first_seen_at <= now() - make_interval(days => (rules->>'min_days')::int)
        and progress->f.card_id->>'state' = 'mastered'
        and coalesce((progress->f.card_id->>'reviewCount')::int, 0) >= (rules->>'min_reviews')::int
        and not exists (select 1 from lexica_card_editions e where e.user_id = uid and e.card_id = f.card_id)
    ), '[]'::jsonb),
    'waiting', coalesce((
      select jsonb_object_agg(f.card_id, f.first_seen_at + make_interval(days => (rules->>'min_days')::int))
      from lexica_card_first_seen f
      where f.user_id = uid
        and f.first_seen_at > now() - make_interval(days => (rules->>'min_days')::int)
        and progress->f.card_id->>'state' = 'mastered'
        and not exists (select 1 from lexica_card_editions e where e.user_id = uid and e.card_id = f.card_id)
    ), '{}'::jsonb),
    'config', jsonb_build_object(
      'mint_odds', lexica_cfg('mint_odds'), 'pity', lexica_cfg('pity'), 'mint_rules', rules,
      'boxes', lexica_cfg('boxes'), 'box_table', lexica_cfg('box_table'), 'prices', lexica_cfg('prices'))
  );
end;
$$;

create or replace function public.lexica_mint(p_card_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  rules jsonb := lexica_cfg('mint_rules');
  progress jsonb;
  seen timestamptz;
  edition text;
  serial int;
  box int := 0;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  if exists (select 1 from lexica_card_editions where user_id = uid and card_id = p_card_id) then
    raise exception 'already minted' using errcode = 'P0001';
  end if;
  if w.mints_today >= (rules->>'max_per_day')::int then
    raise exception 'daily mint limit reached' using errcode = 'P0001';
  end if;
  progress := coalesce(lexica_backup_progress(uid), '{}'::jsonb)->p_card_id;
  select first_seen_at into seen from lexica_card_first_seen where user_id = uid and card_id = p_card_id;
  if progress->>'state' is distinct from 'mastered'
     or coalesce((progress->>'reviewCount')::int, 0) < (rules->>'min_reviews')::int
     or seen is null
     or seen > now() - make_interval(days => (rules->>'min_days')::int) then
    raise exception 'card not ready to mint' using errcode = 'P0001';
  end if;

  edition := lexica_roll_edition(uid, true);
  if edition = 'legendary' then serial := nextval('lexica_legendary_serial'); end if;
  insert into lexica_card_editions (user_id, card_id, edition, serial) values (uid, p_card_id, edition, serial);
  update lexica_wallet set mints_total = mints_total + 1, mints_today = mints_today + 1
  where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref)
  values (uid, 'mint', jsonb_build_object('edition', edition, 'serial', serial), p_card_id);

  if w.mints_total % (rules->>'box_every')::int = 0 then
    box := lexica_grant_boxes(uid, 1, 'box:mints', w.mints_total::text);
  end if;
  return jsonb_build_object('card_id', p_card_id, 'edition', edition, 'serial', serial, 'boxes_earned', box);
end;
$$;

-- Rewards the app reports (daily goal, set complete, ghost streak, streak
-- milestones). Each (kind, ref) pays once; boxes respect the daily cap.
create or replace function public.lexica_claim(p_kind text, p_ref text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  amount int := (lexica_cfg('boxes')->>p_kind)::int;
  granted int;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if amount is null or p_kind not in ('daily_goal','set_complete','ghost_streak','streak_7','streak_30','streak_100') then
    raise exception 'unknown reward' using errcode = 'P0001';
  end if;
  if p_ref is null or char_length(p_ref) > 60 then raise exception 'bad ref' using errcode = 'P0001'; end if;
  -- Date-based rewards only for today (no back-filling past days).
  if p_kind in ('daily_goal','ghost_streak') and p_ref <> lexica_today()::text then
    raise exception 'reward is for today only' using errcode = 'P0001';
  end if;
  if exists (select 1 from lexica_wallet_ledger where user_id = uid and kind = 'claim:' || p_kind and ref = p_ref) then
    return jsonb_build_object('claimed', false, 'boxes', 0);
  end if;
  granted := lexica_grant_boxes(uid, amount, 'claim:' || p_kind, p_ref);
  return jsonb_build_object('claimed', true, 'boxes', granted, 'pending', amount - granted);
end;
$$;

create or replace function public.lexica_open_box()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  prices jsonb := lexica_cfg('prices');
  entry jsonb;
  r numeric := random();
  acc numeric := 0;
  item text;
  amount int;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  if w.boxes < 1 then raise exception 'no boxes' using errcode = 'P0001'; end if;
  for entry in select * from jsonb_array_elements(lexica_cfg('box_table')) loop
    acc := acc + (entry->>'p')::numeric;
    if r < acc then item := entry->>'item'; amount := (entry->>'amount')::int; exit; end if;
  end loop;
  if item is null then item := 'dust'; amount := 20; end if;
  -- A freeze when already holding the maximum becomes dust instead.
  if item = 'freeze' and w.streak_freezes >= (prices->>'freeze_max')::int then
    item := 'dust'; amount := (prices->>'freeze_full_dust')::int;
  end if;
  update lexica_wallet set
    boxes = boxes - 1,
    dust = dust + case when item = 'dust' then amount else 0 end,
    streak_freezes = streak_freezes + case when item = 'freeze' then amount else 0 end,
    reroll_tickets = reroll_tickets + case when item = 'ticket' then amount else 0 end
  where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta) values (uid, 'box_opened', jsonb_build_object('item', item, 'amount', amount));
  return jsonb_build_object('item', item, 'amount', amount, 'wallet', to_jsonb(w) - 'user_id');
end;
$$;

create or replace function public.lexica_buy_ticket()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  price int := (lexica_cfg('prices')->>'ticket')::int;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  if w.dust < price then raise exception 'not enough dust' using errcode = 'P0001'; end if;
  update lexica_wallet set dust = dust - price, reroll_tickets = reroll_tickets + 1 where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta) values (uid, 'ticket_bought', jsonb_build_object('dust', -price, 'tickets', 1));
  return jsonb_build_object('wallet', to_jsonb(w) - 'user_id');
end;
$$;

-- Rerolls a minted card with a ticket. A result that is not better keeps the
-- old edition and refunds some dust; an edition is never lost.
create or replace function public.lexica_reroll(p_card_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  prices jsonb := lexica_cfg('prices');
  current_edition text;
  rolled text;
  refund int := 0;
  kept boolean;
  new_serial int;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  select edition into current_edition from lexica_card_editions where user_id = uid and card_id = p_card_id for update;
  if current_edition is null then raise exception 'card not minted' using errcode = 'P0001'; end if;
  if current_edition = 'legendary' then raise exception 'already legendary' using errcode = 'P0001'; end if;
  if w.reroll_tickets < 1 then raise exception 'no reroll tickets' using errcode = 'P0001'; end if;

  rolled := lexica_roll_edition(uid, false);
  kept := lexica_edition_rank(rolled) <= lexica_edition_rank(current_edition);
  if kept then
    refund := case rolled when 'common' then (prices->>'refund_common')::int when 'silver' then (prices->>'refund_silver')::int else 0 end;
    update lexica_card_editions set rerolls = rerolls + 1 where user_id = uid and card_id = p_card_id;
  else
    if rolled = 'legendary' then new_serial := nextval('lexica_legendary_serial'); end if;
    update lexica_card_editions set edition = rolled, serial = new_serial, rerolls = rerolls + 1
    where user_id = uid and card_id = p_card_id;
  end if;
  update lexica_wallet set reroll_tickets = reroll_tickets - 1, dust = dust + refund where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref)
  values (uid, 'reroll', jsonb_build_object('rolled', rolled, 'kept', kept, 'refund', refund), p_card_id);
  return jsonb_build_object(
    'rolled', rolled, 'kept', kept, 'refund', refund,
    'edition', case when kept then current_edition else rolled end, 'serial', new_serial,
    'wallet', to_jsonb(w) - 'user_id');
end;
$$;

-- Common → Silver for dust. Holo and Legendary only come from rolls.
create or replace function public.lexica_upgrade(p_card_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
  price int := (lexica_cfg('prices')->>'upgrade_silver')::int;
  current_edition text;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  w := lexica_wallet_for_update(uid);
  select edition into current_edition from lexica_card_editions where user_id = uid and card_id = p_card_id for update;
  if current_edition is distinct from 'common' then raise exception 'only common cards can be upgraded' using errcode = 'P0001'; end if;
  if w.dust < price then raise exception 'not enough dust' using errcode = 'P0001'; end if;
  update lexica_card_editions set edition = 'silver' where user_id = uid and card_id = p_card_id;
  update lexica_wallet set dust = dust - price where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref) values (uid, 'upgrade', jsonb_build_object('dust', -price, 'edition', 'silver'), p_card_id);
  return jsonb_build_object('edition', 'silver', 'wallet', to_jsonb(w) - 'user_id');
end;
$$;

-- Spends a streak freeze to cover one missed day (the app calls this when it
-- finds a gap of exactly one day). Each missed date can be covered once.
create or replace function public.lexica_use_freeze(p_missed_date date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w lexica_wallet;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if p_missed_date <> lexica_today() - 1 then raise exception 'only yesterday can be covered' using errcode = 'P0001'; end if;
  w := lexica_wallet_for_update(uid);
  if exists (select 1 from lexica_wallet_ledger where user_id = uid and kind = 'freeze_used' and ref = p_missed_date::text) then
    return jsonb_build_object('used', true, 'wallet', to_jsonb(w) - 'user_id');
  end if;
  if w.streak_freezes < 1 then return jsonb_build_object('used', false, 'wallet', to_jsonb(w) - 'user_id'); end if;
  update lexica_wallet set streak_freezes = streak_freezes - 1 where user_id = uid returning * into w;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref) values (uid, 'freeze_used', '{"freezes": -1}', p_missed_date::text);
  return jsonb_build_object('used', true, 'wallet', to_jsonb(w) - 'user_id');
end;
$$;

-- Internal helpers are not callable from the app.
revoke all on function public.lexica_wallet_for_update(uuid) from public, anon, authenticated;
revoke all on function public.lexica_grant_boxes(uuid, int, text, text) from public, anon, authenticated;
revoke all on function public.lexica_roll_edition(uuid, boolean) from public, anon, authenticated;
revoke all on function public.lexica_backup_progress(uuid) from public, anon, authenticated;
revoke all on function public.lexica_cfg(text) from public, anon, authenticated;

do $$
declare f text;
begin
  foreach f in array array[
    'lexica_engagement_state()', 'lexica_mint(text)', 'lexica_claim(text, text)', 'lexica_open_box()',
    'lexica_buy_ticket()', 'lexica_reroll(text)', 'lexica_upgrade(text)', 'lexica_use_freeze(date)']
  loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
