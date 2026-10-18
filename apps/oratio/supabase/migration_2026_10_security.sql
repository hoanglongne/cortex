-- ============================================
-- Oratio: security and data fixes (2026-10-18)
-- Run in the Supabase SQL Editor after every other app's SQL (Lexica and
-- Cortex share this project and public.profiles). Safe to run again; run it
-- again after any Lexica migration that touches profiles policies.
--
-- What it does:
--   1. Profiles: a user reads only their own row (email included). Other
--      users' public fields come from the public_profiles view.
--   2. Users can edit only username, avatar, country, native language and
--      target band. Stats and band are written by the server only.
--   3. match_queue, matches and session_feedback are written by the server
--      only (the app's server actions use the service role).
--   4. A user can't be in two open matches at once.
--   5. A session counts (sessions, minutes, streak) only when both people
--      joined the call and it lasted at least a minute. Old declines that
--      were counted are repaired.
--   6. Band from peer feedback needs 3 different raters in 30 days.
--   7. leaderboard() for weekly / monthly / all-time ranking.
--   8. expire_stale_matches() closes abandoned matches (optional cron).
-- ============================================

-- --------------------------------------------
-- 0. Columns the app uses
-- --------------------------------------------
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS swap_requested_by UUID REFERENCES auth.users(id) DEFAULT NULL;
-- When each person asked to join the call; started_at is set once both did
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS user1_joined_at TIMESTAMPTZ;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS user2_joined_at TIMESTAMPTZ;
-- Bumped by the in-call screen; an active match with no activity is abandoned
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
-- Realtime needs the full row to deliver UPDATE events through RLS
ALTER TABLE public.matches REPLICA IDENTITY FULL;

-- --------------------------------------------
-- 1. Profiles: own row only, public fields through a view
-- --------------------------------------------
-- Every policy that let any signed-in user read every row (Oratio's old one
-- and Lexica's study-buddy ones) goes; buddies read nicknames from the view.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- The view runs with its owner's rights, so it shows every profile but only
-- these columns (no email). New columns go at the end (CREATE OR REPLACE
-- VIEW can only append).
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT NOT NULL DEFAULT 'Anonymous';
CREATE OR REPLACE VIEW public.public_profiles AS
    SELECT id, username, avatar_url, current_band, total_sessions, total_minutes,
           current_streak, longest_streak, nickname
    FROM public.profiles;
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- --------------------------------------------
-- 2. Profiles: users edit only descriptive fields
-- --------------------------------------------
-- Profiles are created by the on_auth_user_created trigger. Lexica may still
-- insert its own row with a nickname (profiles_insert policy: id = auth.uid()),
-- so only those columns can be inserted; stats keep their defaults.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT INSERT (id, username, nickname) ON public.profiles TO authenticated;
GRANT UPDATE (username, nickname, avatar_url, native_language, country, target_band) ON public.profiles TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_length') THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_username_length CHECK (char_length(username) BETWEEN 1 AND 40) NOT VALID;
    END IF;
END $$;

-- --------------------------------------------
-- 3. Queue, matches, feedback: read your own, write through the server
-- --------------------------------------------
DROP POLICY IF EXISTS "Users can insert themselves into queue" ON public.match_queue;
DROP POLICY IF EXISTS "Users can update their own queue entry" ON public.match_queue;
DROP POLICY IF EXISTS "Users can delete their own queue entry" ON public.match_queue;
REVOKE INSERT, UPDATE, DELETE ON public.match_queue FROM anon, authenticated;

DROP POLICY IF EXISTS "Users can update matches they are part of" ON public.matches;
REVOKE INSERT, UPDATE, DELETE ON public.matches FROM anon, authenticated;

DROP POLICY IF EXISTS "Users can insert feedback for matches they participated in" ON public.session_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON public.session_feedback;
REVOKE INSERT, UPDATE, DELETE ON public.session_feedback FROM anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'session_feedback_comments_length') THEN
        ALTER TABLE public.session_feedback
            ADD CONSTRAINT session_feedback_comments_length CHECK (comments IS NULL OR char_length(comments) <= 1000) NOT VALID;
    END IF;
END $$;

REVOKE INSERT, UPDATE, DELETE ON public.ielts_questions FROM anon, authenticated;

-- --------------------------------------------
-- 4. One open match per user
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_double_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    k1 INTEGER := hashtext(NEW.user1_id::text);
    k2 INTEGER := hashtext(NEW.user2_id::text);
BEGIN
    -- Lock both users in a fixed order so concurrent inserts wait for each other
    PERFORM pg_advisory_xact_lock(LEAST(k1, k2));
    PERFORM pg_advisory_xact_lock(GREATEST(k1, k2));

    IF EXISTS (
        SELECT 1 FROM public.matches
        WHERE status IN ('pending', 'active')
          AND (user1_id IN (NEW.user1_id, NEW.user2_id) OR user2_id IN (NEW.user1_id, NEW.user2_id))
    ) THEN
        RAISE EXCEPTION 'A user in this match already has an open match' USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_match_insert ON public.matches;
CREATE TRIGGER before_match_insert
    BEFORE INSERT ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.prevent_double_match();

-- --------------------------------------------
-- 5. Session stats: only calls both people joined, at least a minute
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_stats_after_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    seconds NUMERIC;
    minutes INTEGER;
BEGIN
    IF NEW.status = 'finished' AND OLD.status IS DISTINCT FROM 'finished' AND NEW.started_at IS NOT NULL THEN
        seconds := EXTRACT(EPOCH FROM (COALESCE(NEW.ended_at, NOW()) - NEW.started_at));
        IF seconds < 60 THEN
            RETURN NEW;
        END IF;
        -- A full mock test is about 30 minutes; cap so a forgotten tab can't add hours
        minutes := LEAST(90, ROUND(seconds / 60))::INTEGER;

        UPDATE public.profiles
        SET
            total_sessions = COALESCE(total_sessions, 0) + 1,
            total_minutes = COALESCE(total_minutes, 0) + minutes,
            last_practice_date = CURRENT_DATE,
            current_streak = CASE
                WHEN last_practice_date = CURRENT_DATE - 1 THEN COALESCE(current_streak, 0) + 1
                WHEN last_practice_date = CURRENT_DATE THEN GREATEST(COALESCE(current_streak, 0), 1)
                ELSE 1
            END,
            longest_streak = GREATEST(COALESCE(longest_streak, 0),
                CASE
                    WHEN last_practice_date = CURRENT_DATE - 1 THEN COALESCE(current_streak, 0) + 1
                    WHEN last_practice_date = CURRENT_DATE THEN GREATEST(COALESCE(current_streak, 0), 1)
                    ELSE 1
                END
            )
        WHERE id IN (NEW.user1_id, NEW.user2_id);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_match_finished ON public.matches;
CREATE TRIGGER on_match_finished
    AFTER UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_match();

-- Repair: declines used to be saved as 'finished' with no started_at, which
-- counted a session and set total_minutes to NULL. Mark them cancelled and
-- recount sessions and minutes from real calls. (The trigger above ignores
-- the change to 'cancelled'.)
UPDATE public.matches
SET status = 'cancelled'
WHERE status = 'finished' AND started_at IS NULL;

WITH calls AS (
    SELECT user1_id AS u, EXTRACT(EPOCH FROM (ended_at - started_at)) AS s
    FROM public.matches WHERE status = 'finished' AND started_at IS NOT NULL AND ended_at IS NOT NULL
    UNION ALL
    SELECT user2_id, EXTRACT(EPOCH FROM (ended_at - started_at))
    FROM public.matches WHERE status = 'finished' AND started_at IS NOT NULL AND ended_at IS NOT NULL
),
per_user AS (
    SELECT u, COUNT(*) AS n, SUM(LEAST(90, ROUND(s / 60)))::INTEGER AS mins
    FROM calls WHERE s >= 60 GROUP BY u
)
UPDATE public.profiles p
SET total_sessions = COALESCE((SELECT n FROM per_user WHERE u = p.id), 0),
    total_minutes = COALESCE((SELECT mins FROM per_user WHERE u = p.id), 0);

ALTER TABLE public.profiles ALTER COLUMN total_minutes SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN total_sessions SET DEFAULT 0;

-- --------------------------------------------
-- 6. Band from peer feedback: 3 different raters, rounded to .5
-- --------------------------------------------
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
        -- One vote per rater (their own average), so one partner can't move a band alone
        SELECT COUNT(*), AVG(r) INTO raters, avg_band
        FROM (
            SELECT from_user_id, AVG((scores->>'overall')::NUMERIC) AS r
            FROM public.session_feedback
            WHERE to_user_id = NEW.to_user_id
              AND scores IS NOT NULL
              AND (scores->>'overall') IS NOT NULL
              AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY from_user_id
        ) t;

        IF raters >= 3 THEN
            UPDATE public.profiles
            SET current_band = LEAST(9, GREATEST(1, ROUND(avg_band * 2) / 2))
            WHERE id = NEW.to_user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_feedback_received ON public.session_feedback;
CREATE TRIGGER on_feedback_received
    AFTER INSERT ON public.session_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_current_band_from_feedback();

-- Signup trigger: pin search_path like the others
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), split_part(NEW.email, '@', 1)), 40),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- --------------------------------------------
-- 7. Leaderboard: minutes practised since a date
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.leaderboard(since TIMESTAMPTZ, lim INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    username TEXT,
    avatar_url TEXT,
    current_band NUMERIC,
    current_streak INTEGER,
    sessions BIGINT,
    minutes BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH calls AS (
        SELECT user1_id AS u, EXTRACT(EPOCH FROM (ended_at - started_at)) AS s
        FROM public.matches
        WHERE status = 'finished' AND started_at IS NOT NULL AND ended_at >= since
        UNION ALL
        SELECT user2_id, EXTRACT(EPOCH FROM (ended_at - started_at))
        FROM public.matches
        WHERE status = 'finished' AND started_at IS NOT NULL AND ended_at >= since
    ),
    agg AS (
        SELECT u, COUNT(*) AS n, SUM(LEAST(90, ROUND(s / 60)))::BIGINT AS mins
        FROM calls WHERE s >= 60 GROUP BY u
    )
    SELECT p.id, p.username, p.avatar_url, p.current_band, p.current_streak, agg.n, agg.mins
    FROM agg JOIN public.profiles p ON p.id = agg.u
    ORDER BY agg.mins DESC, agg.n DESC, p.username
    LIMIT LEAST(GREATEST(lim, 1), 200);
$$;
REVOKE ALL ON FUNCTION public.leaderboard(TIMESTAMPTZ, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leaderboard(TIMESTAMPTZ, INTEGER) TO authenticated, service_role;

-- --------------------------------------------
-- 8. Abandoned matches (the app also does this per user; a cron is optional)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_stale_matches()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    -- Nobody pressed Ready in 2 minutes
    UPDATE public.matches SET status = 'cancelled', ended_at = NOW()
    WHERE status = 'pending' AND created_at < NOW() - INTERVAL '2 minutes';
    -- The call never started (one person never joined)
    UPDATE public.matches SET status = 'cancelled', ended_at = NOW()
    WHERE status = 'active' AND started_at IS NULL AND created_at < NOW() - INTERVAL '10 minutes';
    -- Both screens went quiet: end the call at the last sign of life
    UPDATE public.matches
    SET status = 'finished', ended_at = COALESCE(last_activity_at, started_at)
    WHERE status = 'active' AND started_at IS NOT NULL
      AND COALESCE(last_activity_at, started_at) < NOW() - INTERVAL '5 minutes';
    DELETE FROM public.match_queue WHERE last_seen_at < NOW() - INTERVAL '10 minutes';
$$;
REVOKE ALL ON FUNCTION public.expire_stale_matches() FROM PUBLIC, anon, authenticated;

-- To run it every 5 minutes (Database > Extensions > enable pg_cron first):
-- SELECT cron.schedule('oratio-expire-matches', '*/5 * * * *', 'SELECT public.expire_stale_matches()');

-- --------------------------------------------
-- 9. Indexes
-- --------------------------------------------
CREATE INDEX IF NOT EXISTS idx_feedback_to_user_created ON public.session_feedback(to_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_matches_finished_ended ON public.matches(ended_at) WHERE status = 'finished';
CREATE INDEX IF NOT EXISTS idx_matches_open_user1 ON public.matches(user1_id) WHERE status IN ('pending', 'active');
CREATE INDEX IF NOT EXISTS idx_matches_open_user2 ON public.matches(user2_id) WHERE status IN ('pending', 'active');

-- Make PostgREST pick up the new view and functions
NOTIFY pgrst, 'reload schema';
