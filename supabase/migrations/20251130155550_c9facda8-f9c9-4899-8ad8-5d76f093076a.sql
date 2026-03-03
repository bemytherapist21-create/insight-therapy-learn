-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_events ENABLE ROW LEVEL SECURITY;

-- Since these tables are accessed via edge functions only (using service role),
-- we don't need to create any policies. RLS is enabled for security,
-- but edge functions bypass it using the service role key.