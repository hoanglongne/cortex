-- Feedback and bug reports sent from Lexica's "Góp ý" page (docs/FEEDBACK_PLAN.md, beta).
-- Anyone may send, signed in or not; nobody reads through the API: the team reads
-- the table in the Supabase dashboard. Idempotent.

create table if not exists public.lexica_feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('bug', 'idea', 'other')),
  message text not null check (char_length(message) between 1 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  page text check (page is null or char_length(page) <= 200),
  device text check (device is null or char_length(device) <= 300),
  created_at timestamptz not null default now()
);

alter table public.lexica_feedback enable row level security;
create index if not exists lexica_feedback_created_idx on public.lexica_feedback (created_at desc);

create or replace function public.lexica_send_feedback(
  p_kind text, p_message text, p_contact text default null, p_page text default null, p_device text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  msg text := btrim(coalesce(p_message, ''));
begin
  if msg = '' then raise exception 'empty feedback'; end if;
  if p_kind not in ('bug', 'idea', 'other') then raise exception 'bad kind'; end if;
  -- Keep spam cheap: 10 a day per account, 300 an hour from everyone signed out.
  if uid is not null then
    if (select count(*) from lexica_feedback where user_id = uid and created_at > now() - interval '1 day') >= 10 then
      raise exception 'too much feedback';
    end if;
  elsif (select count(*) from lexica_feedback where user_id is null and created_at > now() - interval '1 hour') >= 300 then
    raise exception 'too much feedback';
  end if;
  insert into lexica_feedback (user_id, kind, message, contact, page, device)
  values (uid, p_kind, left(msg, 2000), nullif(left(btrim(coalesce(p_contact, '')), 200), ''),
          left(p_page, 200), left(p_device, 300));
end;
$$;

revoke all on function public.lexica_send_feedback(text, text, text, text, text) from public;
grant execute on function public.lexica_send_feedback(text, text, text, text, text) to anon, authenticated;
