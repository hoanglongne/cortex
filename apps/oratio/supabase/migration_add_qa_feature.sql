-- ============================================
-- Migration: Add Q&A Feature to Existing Database
-- Safe to run on existing database
-- Date: 2026-03-21
-- ============================================

-- 1. Create ielts_questions table (only if not exists)
CREATE TABLE IF NOT EXISTS public.ielts_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part INTEGER NOT NULL CHECK (part >= 1 AND part <= 3),
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add new columns to matches table (safe with DO blocks)
DO $$ 
BEGIN
    -- Add interviewer_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'matches' 
        AND column_name = 'interviewer_id'
    ) THEN
        ALTER TABLE public.matches 
        ADD COLUMN interviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add candidate_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'matches' 
        AND column_name = 'candidate_id'
    ) THEN
        ALTER TABLE public.matches 
        ADD COLUMN candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add current_question_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'matches' 
        AND column_name = 'current_question_id'
    ) THEN
        ALTER TABLE public.matches 
        ADD COLUMN current_question_id UUID REFERENCES public.ielts_questions(id);
    END IF;

    -- Add questions_asked column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'matches' 
        AND column_name = 'questions_asked'
    ) THEN
        ALTER TABLE public.matches 
        ADD COLUMN questions_asked UUID[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Add constraints to matches table (safe with IF NOT EXISTS)
DO $$
BEGIN
    -- Check constraint for interviewer_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'matches_interviewer_valid'
    ) THEN
        ALTER TABLE public.matches 
        ADD CONSTRAINT matches_interviewer_valid 
        CHECK (interviewer_id IN (user1_id, user2_id) OR interviewer_id IS NULL);
    END IF;

    -- Check constraint for candidate_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'matches_candidate_valid'
    ) THEN
        ALTER TABLE public.matches 
        ADD CONSTRAINT matches_candidate_valid 
        CHECK (candidate_id IN (user1_id, user2_id) OR candidate_id IS NULL);
    END IF;
END $$;

-- 4. Create indexes (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_ielts_questions_part ON public.ielts_questions(part);
CREATE INDEX IF NOT EXISTS idx_ielts_questions_category ON public.ielts_questions(category);
CREATE INDEX IF NOT EXISTS idx_ielts_questions_difficulty ON public.ielts_questions(difficulty);

-- 5. Enable RLS on ielts_questions
ALTER TABLE public.ielts_questions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policy for ielts_questions (drop first if exists)
DROP POLICY IF EXISTS "IELTS questions are viewable by authenticated users" ON public.ielts_questions;
CREATE POLICY "IELTS questions are viewable by authenticated users"
    ON public.ielts_questions FOR SELECT
    USING (auth.role() = 'authenticated');

-- 7. Add ielts_questions to realtime publication (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'ielts_questions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ielts_questions;
  END IF;
END $$;

-- ============================================
-- Verification Queries (optional - comment out before running)
-- ============================================

-- Uncomment to verify after migration:
/*
-- Check new columns in matches table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('interviewer_id', 'candidate_id', 'current_question_id', 'questions_asked');

-- Check ielts_questions table exists
SELECT COUNT(*) as question_count FROM public.ielts_questions;

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'ielts_questions';
*/

-- ============================================
-- Success Message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📝 Next step: Run seed_questions.sql to populate IELTS questions';
END $$;
