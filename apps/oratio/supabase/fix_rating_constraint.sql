-- Fix overall_rating constraint from 1-5 to 1-9 for IELTS band scores
-- Drop the old constraint
ALTER TABLE public.session_feedback 
DROP CONSTRAINT IF EXISTS session_feedback_overall_rating_check;

-- Add new constraint with correct range (1-9)
ALTER TABLE public.session_feedback 
ADD CONSTRAINT session_feedback_overall_rating_check 
CHECK (overall_rating >= 1 AND overall_rating <= 9);
