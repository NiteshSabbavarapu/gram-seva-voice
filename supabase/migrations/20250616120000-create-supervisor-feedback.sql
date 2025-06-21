-- Create supervisor_feedback table
CREATE TABLE IF NOT EXISTS public.supervisor_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    supervisor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating integer NOT NULL,
    comments text,
    created_at timestamp with time zone DEFAULT now()
);

-- Optional: Add unique constraint to prevent duplicate feedback per complaint
ALTER TABLE public.supervisor_feedback
    ADD CONSTRAINT unique_feedback_per_complaint UNIQUE (complaint_id); 