-- ============================================
-- Oratio: Phòng thi P3 (2026-10-19). Run after migration_2026_10_security.sql
-- (it replaces the band trigger defined there). Safe to run again.
--
--   1. Live ratings count by the rater's reliability (docs/ORATIO_REDESIGN.md
--      §5.3): session_feedback.rater_weight, set by the server from the
--      rater's Chấm chéo record; the band is a weighted mean.
--   2. push_subscriptions for the exam-time reminder (web push).
-- ============================================

ALTER TABLE public.session_feedback ADD COLUMN IF NOT EXISTS rater_weight NUMERIC(3,2) NOT NULL DEFAULT 0.6
    CHECK (rater_weight > 0 AND rater_weight <= 1);

CREATE OR REPLACE FUNCTION public.update_current_band_from_feedback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    raters INTEGER;
    avg_band NUMERIC;
BEGIN
    IF NEW.scores IS NOT NULL AND (NEW.scores->>'overall') IS NOT NULL THEN
        -- One vote per rater (their own average, at their latest weight), so
        -- one partner can't move a band alone; reliable raters count more
        SELECT COUNT(*), SUM(r * w) / NULLIF(SUM(w), 0) INTO raters, avg_band
        FROM (
            SELECT from_user_id,
                   AVG((scores->>'overall')::NUMERIC) AS r,
                   (ARRAY_AGG(rater_weight ORDER BY created_at DESC))[1] AS w
            FROM public.session_feedback
            WHERE to_user_id = NEW.to_user_id
              AND scores IS NOT NULL
              AND (scores->>'overall') IS NOT NULL
              AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY from_user_id
        ) t;

        IF raters >= 3 AND avg_band IS NOT NULL THEN
            UPDATE public.profiles
            SET current_band = LEAST(9, GREATEST(1, ROUND(avg_band * 2) / 2))
            WHERE id = NEW.to_user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    endpoint TEXT PRIMARY KEY CHECK (char_length(endpoint) <= 1000),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    p256dh TEXT NOT NULL CHECK (char_length(p256dh) <= 200),
    auth TEXT NOT NULL CHECK (char_length(auth) <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- The reminder is sent at most once a day per device
    last_sent_on DATE
);
CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
-- No policies: written and read by the server only
REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
