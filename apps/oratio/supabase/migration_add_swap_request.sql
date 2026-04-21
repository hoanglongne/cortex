-- Migration: Add swap_requested_by column to matches table
-- This enables the swap consent mechanism where one user requests
-- and the other must accept/decline the role swap.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'matches'
        AND column_name = 'swap_requested_by'
    ) THEN
        ALTER TABLE public.matches
            ADD COLUMN swap_requested_by UUID REFERENCES auth.users(id) DEFAULT NULL;
        RAISE NOTICE 'Column swap_requested_by added to matches';
    ELSE
        RAISE NOTICE 'Column swap_requested_by already exists';
    END IF;
END $$;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'matches'
AND column_name = 'swap_requested_by';
