
-- Insert your college location
INSERT INTO public.locations (name, type) 
VALUES ('CBIT College, Gandipet mandal, Telangana', 'city');

-- Insert the college supervisor user
INSERT INTO public.users (name, phone, role) 
VALUES ('CBIT College Supervisor', '8000000002', 'employee')
ON CONFLICT (phone) DO NOTHING;

-- Assign the college supervisor to the college location
INSERT INTO public.employee_assignments (user_id, location_id)
SELECT u.id, l.id 
FROM public.users u, public.locations l
WHERE u.phone = '8000000002' 
AND l.name = 'CBIT College, Gandipet mandal, Telangana'
ON CONFLICT (user_id, location_id) DO NOTHING;
