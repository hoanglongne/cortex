-- ============================================
-- Oratio Database Schema
-- Run this in Supabase SQL Editor, then seed_questions_v2.sql (fresh database
-- only), then migration_2026_10_security.sql, which holds the current
-- triggers, grants and functions. Running this file again is safe as long as
-- the migration is run after it.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Match queue status enum
DO $$ BEGIN
    CREATE TYPE match_queue_status AS ENUM ('waiting', 'matched', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Match status enum
DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('pending', 'active', 'finished', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT,
    target_band DECIMAL(2,1) DEFAULT 7.0 CHECK (target_band >= 1 AND target_band <= 9),
    current_band DECIMAL(2,1) DEFAULT 5.5 CHECK (current_band >= 1 AND current_band <= 9),
    avatar_url TEXT,
    native_language TEXT,
    country TEXT,
    total_sessions INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_practice_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match queue table
CREATE TABLE IF NOT EXISTS public.match_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_band_min DECIMAL(2,1) DEFAULT 5.0 CHECK (target_band_min >= 1 AND target_band_min <= 9),
    target_band_max DECIMAL(2,1) DEFAULT 7.5 CHECK (target_band_max >= 1 AND target_band_max <= 9),
    status match_queue_status DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(), -- heartbeat, updated on every poll
    UNIQUE(user_id) -- User can only be in queue once
);

-- IELTS questions table for Q&A practice
CREATE TABLE IF NOT EXISTS public.ielts_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part INTEGER NOT NULL CHECK (part >= 1 AND part <= 3),
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id TEXT NOT NULL UNIQUE,
    status match_status DEFAULT 'pending',
    topic TEXT,
    current_question_id UUID REFERENCES public.ielts_questions(id),
    swap_requested_by UUID REFERENCES auth.users(id),
    user1_joined_at TIMESTAMPTZ,
    user2_joined_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    questions_asked UUID[] DEFAULT '{}',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (user1_id != user2_id), -- Users can't match with themselves
    CHECK (interviewer_id IN (user1_id, user2_id) OR interviewer_id IS NULL),
    CHECK (candidate_id IN (user1_id, user2_id) OR candidate_id IS NULL)
);

-- Session feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 9),
    would_match_again BOOLEAN,
    feedback_tags TEXT[] DEFAULT '{}',
    comments TEXT,
    scores JSONB, -- { fluency: 6.5, vocabulary: 6.0, grammar: 5.5, pronunciation: 6.5, overall: 6.1 }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, from_user_id) -- One feedback per user per match
);

-- ============================================
-- INDEXES
-- ============================================

-- IELTS questions indexes
CREATE INDEX IF NOT EXISTS idx_ielts_questions_part ON public.ielts_questions(part);
CREATE INDEX IF NOT EXISTS idx_ielts_questions_category ON public.ielts_questions(category);
CREATE INDEX IF NOT EXISTS idx_ielts_questions_difficulty ON public.ielts_questions(difficulty);

-- Match queue indexes for faster matching queries
CREATE INDEX IF NOT EXISTS idx_match_queue_status ON public.match_queue(status);
CREATE INDEX IF NOT EXISTS idx_match_queue_waiting ON public.match_queue(status, created_at) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_match_queue_user ON public.match_queue(user_id);
-- A match_queue created before the heartbeat column has no last_seen_at yet
-- (CREATE TABLE IF NOT EXISTS skips it), so add it before indexing it.
ALTER TABLE public.match_queue ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_match_queue_waiting_seen ON public.match_queue(status, last_seen_at) WHERE status = 'waiting';

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_room ON public.matches(room_id);

-- Session feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_match ON public.session_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_feedback_from_user ON public.session_feedback(from_user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_to_user ON public.session_feedback(to_user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ielts_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- IELTS questions policies (read-only for all authenticated users)
DROP POLICY IF EXISTS "IELTS questions are viewable by authenticated users" ON public.ielts_questions;
CREATE POLICY "IELTS questions are viewable by authenticated users"
    ON public.ielts_questions FOR SELECT
    USING (auth.role() = 'authenticated');

-- Profiles policies: a user reads and edits only their own row. Other users'
-- public fields come from the public_profiles view, and which columns can be
-- edited is set by column grants (both in migration_2026_10_security.sql).
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Match queue, matches and feedback: users read their own rows. All writes
-- go through the app's server actions (service role), which check who may
-- do what.
DROP POLICY IF EXISTS "Users can view their own queue entry" ON public.match_queue;
CREATE POLICY "Users can view their own queue entry"
    ON public.match_queue FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view matches they are part of" ON public.matches;
CREATE POLICY "Users can view matches they are part of"
    ON public.matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can view feedback they gave or received" ON public.session_feedback;
CREATE POLICY "Users can view feedback they gave or received"
    ON public.session_feedback FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- REALTIME
-- ============================================

-- Add tables to the publication to enable realtime subscriptions
-- This is crucial for the matchmaking to work!
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'matches') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'match_queue') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_queue;
  END IF;
END $$;


-- The stats trigger (on_match_finished), the band-from-feedback trigger
-- (on_feedback_received), the one-open-match guard, leaderboard() and
-- expire_stale_matches() live in migration_2026_10_security.sql.

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to add sample data for testing
/*
INSERT INTO public.profiles (id, username, email, target_band, current_band, country, native_language)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'test_user_1', 'test1@example.com', 7.0, 6.0, 'Vietnam', 'Vietnamese'),
    ('00000000-0000-0000-0000-000000000002', 'test_user_2', 'test2@example.com', 7.5, 6.5, 'China', 'Chinese');
*/

