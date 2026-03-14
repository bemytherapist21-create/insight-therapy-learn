
CREATE TABLE public.resume_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  company_name text NOT NULL,
  company_website text,
  job_description_snippet text,
  status text NOT NULL DEFAULT 'generating',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_generations ENABLE ROW LEVEL SECURITY;

-- Users can read their own generations
CREATE POLICY "Users can read own generations" ON public.resume_generations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations" ON public.resume_generations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own generations
CREATE POLICY "Users can update own generations" ON public.resume_generations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
