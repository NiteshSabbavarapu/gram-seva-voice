
-- Enable Row Level Security on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow users to select their own profile
CREATE POLICY "Users can select their own profile" ON public.users
  FOR SELECT 
  USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE 
  USING (true);
