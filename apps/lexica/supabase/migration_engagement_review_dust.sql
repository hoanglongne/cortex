-- Review points turn into Bụi (docs/LEXICA_FEEDBACK_TASKS.md T3): at the end of
-- a review session the banked points of "Liều hay Dừng" are exchanged at
-- 10 points = 1 Bụi, at most 30 Bụi a day. The points are counted on the
-- device, so the daily cap is what keeps this honest.
-- Requires migration_engagement.sql. Idempotent.

insert into public.lexica_engagement_config (key, value) values
  ('review_dust', '{"points_per_dust": 10, "daily_cap": 30}')
on conflict (key) do nothing;

create or replace function public.lexica_review_dust(p_points int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  cfg jsonb := lexica_cfg('review_dust');
  per int := greatest(1, coalesce((cfg->>'points_per_dust')::int, 10));
  cap int := coalesce((cfg->>'daily_cap')::int, 30);
  earned int;
  pay int;
  w lexica_wallet;
begin
  if uid is null then raise exception 'not signed in' using errcode = '28000'; end if;
  if p_points is null or p_points < 0 or p_points > 100000 then
    raise exception 'bad points' using errcode = '22023';
  end if;
  w := lexica_wallet_for_update(uid);
  select coalesce(sum((delta->>'dust')::int), 0) into earned from lexica_wallet_ledger
  where user_id = uid and kind = 'review_dust'
    and (at at time zone 'Asia/Ho_Chi_Minh')::date = lexica_today();
  pay := greatest(0, least(p_points / per, cap - earned));
  if pay > 0 then
    update lexica_wallet set dust = dust + pay where user_id = uid returning * into w;
    insert into lexica_wallet_ledger (user_id, kind, delta)
    values (uid, 'review_dust', jsonb_build_object('dust', pay, 'points', p_points));
  end if;
  return jsonb_build_object('dust', pay, 'earned_today', earned + pay, 'cap', cap, 'wallet', to_jsonb(w));
end;
$$;

revoke all on function public.lexica_review_dust(int) from public, anon;
grant execute on function public.lexica_review_dust(int) to authenticated;
