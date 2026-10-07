-- Matchmaking heartbeat.
-- findMatch() now updates last_seen_at on every poll and only matches users
-- seen in the last 15s. created_at stays fixed so FIFO order is kept.
-- Run this BEFORE deploying the matching app code.

ALTER TABLE public.match_queue
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.match_queue
  SET last_seen_at = created_at
  WHERE last_seen_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_match_queue_waiting_seen
  ON public.match_queue(status, last_seen_at) WHERE status = 'waiting';
