
-- Add a table to store complaints in the database (extending the existing structure)
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'assigned'
);

-- Enable RLS on complaint_assignments
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;

-- Allow employees and admins to view assignments
CREATE POLICY "Employees can view their assignments" ON public.complaint_assignments
  FOR SELECT 
  USING (
    assigned_to = auth.uid()::uuid OR
    (SELECT role FROM public.users WHERE id = auth.uid()::uuid) = 'admin'
  );

-- Allow admins to create assignments
CREATE POLICY "Admins can create assignments" ON public.complaint_assignments
  FOR INSERT 
  WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()::uuid) = 'admin' OR
    assigned_by = auth.uid()::uuid
  );

-- Update complaints table to store actual complaint data from frontend
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS area_type TEXT,
ADD COLUMN IF NOT EXISTS forwarded_to TEXT;

-- Allow users to insert complaints
CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view their own complaints and assigned officers to view assigned complaints
CREATE POLICY "Users can view relevant complaints" ON public.complaints
  FOR SELECT 
  USING (
    phone = (SELECT phone FROM public.users WHERE id = auth.uid()::uuid) OR
    assigned_officer_id = auth.uid()::uuid OR
    (SELECT role FROM public.users WHERE id = auth.uid()::uuid) = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.employee_assignments ea
      WHERE ea.user_id = auth.uid()::uuid AND ea.location_id = complaints.location_id
    )
  );
