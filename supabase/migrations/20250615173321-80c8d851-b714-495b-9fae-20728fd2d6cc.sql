
-- 1. Roles Enum
CREATE TYPE public.user_role AS ENUM ('citizen', 'employee', 'admin');

-- 2. Location Type Enum
CREATE TYPE public.location_type AS ENUM ('village', 'city');

-- 3. Complaint Status Enum
CREATE TYPE public.complaint_status AS ENUM ('submitted', 'in_progress', 'resolved');

-- 4. Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Locations table
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type location_type NOT NULL
);

-- 6. Employee assignments (many-to-many: user <-> location)
CREATE TABLE public.employee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  UNIQUE (user_id, location_id)
);

-- 7. Complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  category TEXT,
  status complaint_status NOT NULL DEFAULT 'submitted',
  assigned_officer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Complaint comments
CREATE TABLE public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Complaint notifications
CREATE TABLE public.complaint_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. RLS policies (without "TO authenticated;")
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_notifications ENABLE ROW LEVEL SECURITY;

-- Only allow users to SELECT their own record
CREATE POLICY "Users can see/edit themselves" ON public.users
  FOR SELECT USING (auth.uid()::uuid = id);

-- Citizens: can insert complaints, view their own
CREATE POLICY "Citizen can insert/view own complaints" ON public.complaints
  FOR SELECT USING (citizen_id = auth.uid()::uuid);
CREATE POLICY "Citizen can insert complaints" ON public.complaints 
  FOR INSERT WITH CHECK (citizen_id = auth.uid()::uuid);

-- Employees: can view complaints for assigned locations
CREATE POLICY "Employee can view assigned complaints" ON public.complaints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.employee_assignments ea
      WHERE ea.user_id = auth.uid()::uuid
        AND ea.location_id = complaints.location_id
    )
    OR assigned_officer_id = auth.uid()::uuid
  );

-- Employees can update status/comment on assigned complaints
CREATE POLICY "Employee can update assigned complaints" ON public.complaints
  FOR UPDATE
  USING (
    assigned_officer_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM public.employee_assignments ea
      WHERE ea.user_id = auth.uid()::uuid AND ea.location_id = complaints.location_id
    )
  );

-- Admins: can view/update all
CREATE POLICY "Admin can do everything" ON public.complaints
  FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()::uuid) = 'admin'
  );

-- Comments: Citizens & employees can read/write related comments
CREATE POLICY "Related comments" ON public.complaint_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_comments.complaint_id
        AND (c.citizen_id = auth.uid()::uuid OR c.assigned_officer_id = auth.uid()::uuid)
    )
  );
CREATE POLICY "Insert own comment" ON public.complaint_comments
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

-- Notifications: Only recipient can read
CREATE POLICY "Notification receiver" ON public.complaint_notifications
  FOR SELECT USING (recipient_user_id = auth.uid()::uuid);

