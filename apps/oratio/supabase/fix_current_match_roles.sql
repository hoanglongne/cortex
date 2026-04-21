-- ============================================
-- Quick Fix: Assign Roles to Current Active Match
-- Run this if your current match doesn't have roles assigned
-- ============================================

-- First, check your current active matches and their roles:
SELECT 
  id, 
  user1_id, 
  user2_id, 
  interviewer_id, 
  candidate_id,
  status,
  created_at
FROM matches 
WHERE status IN ('pending', 'active')
ORDER BY created_at DESC 
LIMIT 5;

-- If interviewer_id and candidate_id are NULL, run this to assign roles:
-- Replace YOUR_MATCH_ID with the actual match ID from above query

-- Option 1: User1 becomes interviewer (50/50 random choice)
UPDATE matches 
SET 
  interviewer_id = user1_id,
  candidate_id = user2_id
WHERE id = 'YOUR_MATCH_ID';

-- OR Option 2: User2 becomes interviewer (50/50 random choice)
-- UPDATE matches 
-- SET 
--   interviewer_id = user2_id,
--   candidate_id = user1_id
-- WHERE id = 'YOUR_MATCH_ID';

-- Verify the update:
SELECT 
  id, 
  interviewer_id, 
  candidate_id
FROM matches 
WHERE id = 'YOUR_MATCH_ID';

-- Expected result: Both interviewer_id and candidate_id should now have UUID values
