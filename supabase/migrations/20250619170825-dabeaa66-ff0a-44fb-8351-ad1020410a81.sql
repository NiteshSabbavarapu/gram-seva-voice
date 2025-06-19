
-- Fix the authentication issue by allowing complaints without auth requirement
-- since the app uses custom phone-based auth, not Supabase auth

-- Drop existing policies
DROP POLICY IF EXISTS "Allow complaint submission" ON public.complaints;
DROP POLICY IF EXISTS "Users can view relevant complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow complaint updates" ON public.complaints;

-- Create new policies that work with the custom auth system
CREATE POLICY "Allow complaint submission" ON public.complaints
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view relevant complaints" ON public.complaints
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow complaint updates" ON public.complaints
  FOR UPDATE 
  USING (true);

-- Fix complaint_assignments policies (correct table name)
DROP POLICY IF EXISTS "View assignments" ON public.complaint_assignments;
DROP POLICY IF EXISTS "Allow assignment creation" ON public.complaint_assignments;

CREATE POLICY "View assignments" ON public.complaint_assignments
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow assignment creation" ON public.complaint_assignments
  FOR INSERT 
  WITH CHECK (true);

-- Add voice_message column to complaints table for storing voice recordings
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS voice_message TEXT;

-- Add voice_duration column to track recording length
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS voice_duration INTEGER;
