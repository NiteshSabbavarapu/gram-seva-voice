
-- Create a contacts table to store fixed phone numbers assigned to each location (village/city)
CREATE TABLE public.location_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL
);

-- Enable Row Level Security for privacy & access control
ALTER TABLE public.location_contacts ENABLE ROW LEVEL SECURITY;

-- Admins can insert, update, delete, and select all contacts
CREATE POLICY "Admin can manage contacts"
  ON public.location_contacts
  FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()::uuid) = 'admin'
  );

-- Employees may select (view) contacts for assigned locations
CREATE POLICY "Employee can view assigned location contacts"
  ON public.location_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.employee_assignments ea
      WHERE ea.user_id = auth.uid()::uuid
        AND ea.location_id = location_contacts.location_id
    )
  );

-- Citizens can select contacts for any location (for public info)
CREATE POLICY "Citizen can view contacts"
  ON public.location_contacts
  FOR SELECT
  USING (true);
