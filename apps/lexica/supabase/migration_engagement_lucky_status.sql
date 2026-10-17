-- Lucky cards, with the number of lucky rewards left today
-- (docs/LEXICA_FEEDBACK_TASKS.md T6): once the daily cap is used up the app
-- stops showing the "may mắn" badge instead of promising a gift it can't pay.
-- Requires migration_engagement_lucky.sql. Idempotent.

create or replace function public.lexica_lucky_status(p_card_ids text[])
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cap int := coalesce((lexica_cfg('lucky')->>'daily_cap')::int, 5);
  used int;
begin
  if uid is null then return jsonb_build_object('cards', '[]'::jsonb, 'remaining', 0); end if;
  select count(*) into used from lexica_wallet_ledger
  where user_id = uid and kind = 'lucky' and (at at time zone 'Asia/Ho_Chi_Minh')::date = lexica_today();
  return jsonb_build_object(
    'remaining', greatest(0, cap - used),
    'cards', case when used >= cap then '[]'::jsonb else to_jsonb(coalesce((
      select array_agg(id) from unnest(p_card_ids[1:50]) as id
      where char_length(id) <= 40 and lexica_is_lucky(uid, id, lexica_today())
    ), '{}')) end
  );
end;
$$;

revoke all on function public.lexica_lucky_status(text[]) from public, anon;
grant execute on function public.lexica_lucky_status(text[]) to authenticated;
