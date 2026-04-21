-- Enable REPLICA IDENTITY FULL on matches table
-- Required for Supabase Realtime to properly deliver UPDATE events through RLS
ALTER TABLE public.matches REPLICA IDENTITY FULL;
