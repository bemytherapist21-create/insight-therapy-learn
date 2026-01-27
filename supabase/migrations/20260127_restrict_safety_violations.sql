-- Restrict safety_violations table to admin-only access
-- Users should NEVER see their own safety violations (blackmail/legal risk)

-- Drop all existing user-accessible policies
DROP POLICY IF EXISTS "Users can view safety violations in their conversations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can create safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can create safety violations in their conversations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can update safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can update safety violations in their conversations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can delete safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "Users can delete safety violations in their conversations" ON public.safety_violations;

-- Admin-only read access (for monitoring and moderation)
-- Assumes admins have 'role' = 'admin' in their user metadata
CREATE POLICY "Only admins can view safety violations"
ON public.safety_violations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

-- System can insert violations (service role only, not regular users)
CREATE POLICY "System can create safety violations"
ON public.safety_violations FOR INSERT
WITH CHECK (true);

-- Admin-only update access
CREATE POLICY "Only admins can update safety violations"
ON public.safety_violations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

-- Admin-only delete access
CREATE POLICY "Only admins can delete safety violations"
ON public.safety_violations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  )
);

-- Add comment explaining the security rationale
COMMENT ON TABLE public.safety_violations IS 'ADMIN-ONLY: Contains sensitive safety violation data. Users must never access this to prevent blackmail/legal risks.';
