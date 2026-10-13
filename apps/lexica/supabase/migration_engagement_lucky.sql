-- Lucky cards in the swipe deck: about one card in 15 pays a small reward
-- when the learner marks it as known. Which cards are lucky is decided here
-- (a hash of user, card and day), so the app can show the badge before the
-- swipe but cannot choose its own lucky cards. Capped per day.
-- Requires migration_engagement.sql. Idempotent.

insert into public.lexica_engagement_config (key, value) values
  ('lucky', '{"one_in": 15, "daily_cap": 5, "table": [{"item":"dust","amount":15,"p":0.70},{"item":"dust","amount":30,"p":0.20},{"item":"dust","amount":50,"p":0.08},{"item":"box","amount":1,"p":0.02}]}')
on conflict (key) do nothing;

create or replace function public.lexica_is_lucky(p_user uuid, p_card_id text, p_day date)
returns boolean language sql stable as $$
  select ('x' || substr(md5(p_user::text || ':' || p_card_id || ':' || p_day::text), 1, 8))::bit(32)::bigint
         % greatest(1, coalesce((select (value->>'one_in')::int from lexica_engagement_config where key = 'lucky'), 15)) = 0;
$$;

-- Which of these cards are lucky for the caller today.
create or replace function public.lexica_lucky_cards(p_card_ids text[])
returns text[] language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return '{}'; end if;
  return coalesce((
    select array_agg(id) from unnest(p_card_ids[1:50]) as id
    where char_length(id) <= 40 and lexica_is_lucky(uid, id, lexica_today())
  ), '{}');
end;
$$;

-- Pays a lucky card once per day, within the daily cap.
create or replace function public.lexica_lucky_claim(p_card_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cfg jsonb := lexica_cfg('lucky');
  today_claims int;
  entry jsonb;
  r numeric := random();
  acc numeric := 0;
  item text;
  amount int;
  granted int;
  w lexica_wallet;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if not lexica_is_lucky(uid, p_card_id, lexica_today()) then
    return jsonb_build_object('paid', false, 'reason', 'not lucky');
  end if;
  w := lexica_wallet_for_update(uid);
  if exists (select 1 from lexica_wallet_ledger where user_id = uid and kind = 'lucky'
             and ref = p_card_id and (at at time zone 'Asia/Ho_Chi_Minh')::date = lexica_today()) then
    return jsonb_build_object('paid', false, 'reason', 'already paid');
  end if;
  select count(*) into today_claims from lexica_wallet_ledger
  where user_id = uid and kind = 'lucky' and (at at time zone 'Asia/Ho_Chi_Minh')::date = lexica_today();
  if today_claims >= (cfg->>'daily_cap')::int then
    return jsonb_build_object('paid', false, 'reason', 'daily cap');
  end if;

  for entry in select * from jsonb_array_elements(cfg->'table') loop
    acc := acc + (entry->>'p')::numeric;
    if r < acc then item := entry->>'item'; amount := (entry->>'amount')::int; exit; end if;
  end loop;
  if item is null then item := 'dust'; amount := 15; end if;

  -- A box over today's cap waits for tomorrow (lexica_grant_boxes).
  if item = 'box' then
    granted := lexica_grant_boxes(uid, amount, 'lucky_box', p_card_id);
  end if;
  if item = 'dust' then
    update lexica_wallet set dust = dust + amount where user_id = uid;
  end if;
  insert into lexica_wallet_ledger (user_id, kind, delta, ref)
  values (uid, 'lucky', jsonb_build_object('item', item, 'amount', amount), p_card_id);
  return jsonb_build_object('paid', true, 'item', item, 'amount', amount);
end;
$$;

revoke all on function public.lexica_is_lucky(uuid, text, date) from public, anon, authenticated;
revoke all on function public.lexica_lucky_cards(text[]) from public, anon;
grant execute on function public.lexica_lucky_cards(text[]) to authenticated;
revoke all on function public.lexica_lucky_claim(text) from public, anon;
grant execute on function public.lexica_lucky_claim(text) to authenticated;
