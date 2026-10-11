-- Lexica Studio phases 2–3 (docs/LEXICA_STUDIO_SPEC.md §5.1–5.3, §5.8):
-- automatic trend collection and the learner feedback loop.
-- Requires migration_studio.sql. Idempotent: safe to re-run.

-- Where signals come from. config is per-kind (e.g. {"feeds": [...]} for rss).
create table if not exists studio_sources (
  id text primary key,
  kind text not null check (kind in ('google_trends','rss','youtube','manual')),
  label text not null,
  enabled boolean not null default true,
  weight real not null default 1.0,
  config jsonb not null default '{}',
  last_run_at timestamptz,
  last_error text
);

-- One row per sighting. Only short phrases + a link; no copied content.
create table if not exists studio_signals (
  id bigserial primary key,
  source_id text not null references studio_sources(id) on delete cascade,
  phrase text not null check (char_length(phrase) <= 160),
  context text check (context is null or char_length(context) <= 300),
  url text,
  metric real not null default 0.5 check (metric between 0 and 1),
  seen_at timestamptz not null default now()
);
create index if not exists studio_signals_seen_idx on studio_signals (seen_at desc);

create table if not exists studio_trend_signals (
  trend_id uuid references studio_trends(id) on delete cascade,
  signal_id bigint references studio_signals(id) on delete cascade,
  primary key (trend_id, signal_id)
);

alter table studio_trends add column if not exists signal_count int not null default 0;
alter table studio_trends add column if not exists source_count int not null default 0;
alter table studio_cards add column if not exists flags text[] not null default '{}';

-- Aggregated learner feedback per Studio card (no per-user rows).
create table if not exists studio_card_metrics (
  card_id text primary key references studio_cards(id) on delete cascade,
  impressions int not null default 0,
  reveals int not null default 0,
  known int not null default 0,
  unknown int not null default 0,
  shares int not null default 0,
  reports int not null default 0,
  review_correct int not null default 0,
  review_wrong int not null default 0,
  dwell_ms_total bigint not null default 0,
  dwell_count int not null default 0,
  updated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['studio_sources','studio_signals','studio_trend_signals','studio_card_metrics']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s editors" on %I', t, t);
    execute format('create policy "%s editors" on %I for all using (is_studio_editor()) with check (is_studio_editor())', t, t);
  end loop;
end $$;

-- Lexica (anonymous or signed in) reports card events in batches through this
-- function only. It validates kinds and card ids and never exposes the table.
create or replace function studio_record_events(events jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  e jsonb;
  n int := 0;
  k text;
  cid text;
  dwell int;
begin
  if jsonb_typeof(events) <> 'array' then
    return 0;
  end if;
  for e in select * from jsonb_array_elements(events) limit 100
  loop
    cid := e->>'cardId';
    k := e->>'kind';
    if cid is null or k is null or not exists (select 1 from studio_cards where id = cid) then
      continue;
    end if;
    if k not in ('impression','reveal','known','unknown','share','report','review_correct','review_wrong') then
      continue;
    end if;
    dwell := least(greatest(coalesce((e->>'dwellMs')::int, 0), 0), 120000);

    insert into studio_card_metrics (card_id) values (cid) on conflict (card_id) do nothing;
    update studio_card_metrics set
      impressions    = impressions    + (k = 'impression')::int,
      reveals        = reveals        + (k = 'reveal')::int,
      known          = known          + (k = 'known')::int,
      unknown        = unknown        + (k = 'unknown')::int,
      shares         = shares         + (k = 'share')::int,
      reports        = reports        + (k = 'report')::int,
      review_correct = review_correct + (k = 'review_correct')::int,
      review_wrong   = review_wrong   + (k = 'review_wrong')::int,
      dwell_ms_total = dwell_ms_total + case when dwell > 0 then dwell else 0 end,
      dwell_count    = dwell_count    + (dwell > 0)::int,
      updated_at     = now()
    where card_id = cid;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function studio_record_events(jsonb) from public;
grant execute on function studio_record_events(jsonb) to anon, authenticated;

-- Default sources. Feeds can be edited in Studio → Hệ thống.
insert into studio_sources (id, kind, label, weight, config, enabled) values
  ('google_trends_vn', 'google_trends', 'Google Trends VN', 1.0,
    '{"url": "https://trends.google.com/trending/rss?geo=VN"}', true),
  ('news_rss', 'rss', 'Báo (RSS tiêu đề)', 0.6,
    '{"feeds": ["https://vnexpress.net/rss/tin-moi-nhat.rss", "https://tuoitre.vn/rss/tin-moi-nhat.rss"]}', true),
  ('youtube_trending_vn', 'youtube', 'YouTube trending VN', 0.8,
    '{"regionCode": "VN", "maxResults": 50}', false),
  ('manual', 'manual', 'Editor thêm tay', 1.5, '{}', true)
on conflict (id) do nothing;
