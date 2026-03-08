CREATE TABLE public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  feature text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature)
);

ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (user_id = (auth.uid())::text);
CREATE POLICY "Users can insert own usage" ON public.user_usage FOR INSERT WITH CHECK (user_id = (auth.uid())::text);
CREATE POLICY "Users can update own usage" ON public.user_usage FOR UPDATE USING (user_id = (auth.uid())::text);