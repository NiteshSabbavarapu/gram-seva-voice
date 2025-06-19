
-- Fix the RLS policies for complaints table to allow proper insertion
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view relevant complaints" ON public.complaints;

-- Allow authenticated users to insert complaints (they don't need to be in users table yet)
CREATE POLICY "Allow complaint submission" ON public.complaints
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view complaints based on phone number or assignment
CREATE POLICY "Users can view relevant complaints" ON public.complaints
  FOR SELECT 
  USING (
    phone = auth.jwt() ->> 'phone' OR
    assigned_officer_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid()::uuid AND u.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.employee_assignments ea
      JOIN public.users u ON u.id = ea.user_id
      WHERE u.id = auth.uid()::uuid AND ea.location_id = complaints.location_id
    )
  );

-- Allow admins and assigned officers to update complaint status
CREATE POLICY "Allow complaint updates" ON public.complaints
  FOR UPDATE 
  USING (
    assigned_officer_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid()::uuid AND u.role = 'admin'
    )
  );

-- Update complaint_assignments policies
DROP POLICY IF EXISTS "Employees can view their assignments" ON public.complaint_assignments;
DROP POLICY IF EXISTS "Admins can create assignments" ON public.complaint_assignments;

-- Allow viewing assignments for assigned officers and admins
CREATE POLICY "View assignments" ON public.complaint_assignments
  FOR SELECT 
  USING (
    assigned_to = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid()::uuid AND u.role = 'admin'
    )
  );

-- Allow system to create assignments (will be done programmatically)
CREATE POLICY "Allow assignment creation" ON public.complaint_assignments
  FOR INSERT 
  WITH CHECK (true);
