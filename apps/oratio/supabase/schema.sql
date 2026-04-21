-- ============================================
-- SpeakMate Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Match queue status enum
CREATE TYPE match_queue_status AS ENUM ('waiting', 'matched', 'cancelled');

-- Match status enum
CREATE TYPE match_status AS ENUM ('pending', 'active', 'finished', 'cancelled');

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
CREATE POLICY "IELTS questions are viewable by authenticated users"
    ON public.ielts_questions FOR SELECT
    USING (auth.role() = 'authenticated');

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Match queue policies
CREATE POLICY "Users can view their own queue entry"
    ON public.match_queue FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert themselves into queue"
    ON public.match_queue FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue entry"
    ON public.match_queue FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entry"
    ON public.match_queue FOR DELETE
    USING (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches they are part of"
    ON public.matches FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update matches they are part of"
    ON public.matches FOR UPDATE
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Note: INSERT for matches should be done via service role (server-side)
-- This prevents race conditions in matchmaking

-- Session feedback policies
CREATE POLICY "Users can view feedback they gave or received"
    ON public.session_feedback FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert feedback for matches they participated in"
    ON public.session_feedback FOR INSERT
    WITH CHECK (
        auth.uid() = from_user_id 
        AND EXISTS (
            SELECT 1 FROM public.matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own feedback"
    ON public.session_feedback FOR UPDATE
    USING (auth.uid() = from_user_id);

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


-- Function to update user stats after a match ends
CREATE OR REPLACE FUNCTION public.update_user_stats_after_match()
RETURNS TRIGGER AS $$
DECLARE
    match_duration INTEGER;
BEGIN
    -- Only run when match status changes to 'finished'
    IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
        -- Calculate duration in minutes
        match_duration := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
        
        -- Update user1 stats
        UPDATE public.profiles
        SET 
            total_sessions = total_sessions + 1,
            total_minutes = total_minutes + match_duration,
            last_practice_date = CURRENT_DATE,
            current_streak = CASE 
                WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                WHEN last_practice_date = CURRENT_DATE THEN current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(longest_streak, 
                CASE 
                    WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                    WHEN last_practice_date = CURRENT_DATE THEN current_streak
                    ELSE 1
                END
            )
        WHERE id = NEW.user1_id;
        
        -- Update user2 stats
        UPDATE public.profiles
        SET 
            total_sessions = total_sessions + 1,
            total_minutes = total_minutes + match_duration,
            last_practice_date = CURRENT_DATE,
            current_streak = CASE 
                WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                WHEN last_practice_date = CURRENT_DATE THEN current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(longest_streak, 
                CASE 
                    WHEN last_practice_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
                    WHEN last_practice_date = CURRENT_DATE THEN current_streak
                    ELSE 1
                END
            )
        WHERE id = NEW.user2_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when match ends
DROP TRIGGER IF EXISTS on_match_finished ON public.matches;
CREATE TRIGGER on_match_finished
    AFTER UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_match();

-- Function to update current_band from peer feedback
CREATE OR REPLACE FUNCTION public.update_current_band_from_feedback()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if feedback has scores
    IF NEW.scores IS NOT NULL AND (NEW.scores->>'overall') IS NOT NULL THEN
        -- Update the recipient's current_band with weighted average of recent feedback
        -- Prioritize recent 30 days, with minimum 3 feedback sessions for stability
        UPDATE public.profiles
        SET current_band = (
            SELECT CASE 
                WHEN COUNT(*) >= 3 THEN 
                    ROUND(AVG((scores->>'overall')::decimal), 1)
                ELSE 
                    current_band  -- Keep current if not enough data
            END
            FROM session_feedback
            WHERE to_user_id = NEW.to_user_id
                AND scores IS NOT NULL
                AND (scores->>'overall') IS NOT NULL
                AND created_at >= NOW() - INTERVAL '30 days'
        )
        WHERE id = NEW.to_user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update band after receiving feedback
DROP TRIGGER IF EXISTS on_feedback_received ON public.session_feedback;
CREATE TRIGGER on_feedback_received
    AFTER INSERT ON public.session_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_current_band_from_feedback();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for matches table (for async matching)
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

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

