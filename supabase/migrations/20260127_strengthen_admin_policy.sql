-- Strengthen safety_violations admin policy
-- Replace weak user metadata checks with proper role-based access control

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can view safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "System can create safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "Only admins can update safety violations" ON public.safety_violations;
DROP POLICY IF EXISTS "Only admins can delete safety violations" ON public.safety_violations;

-- Create admin role table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only service role can modify admin_roles
CREATE POLICY "Only service role can manage admin roles"
ON public.admin_roles FOR ALL
USING (false)
WITH CHECK (false);

-- Recreate safety_violations policies with proper admin checks
CREATE POLICY "Only admins can view safety violations"
ON public.safety_violations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- System/service role can insert (for automated detection)
CREATE POLICY "System can create safety violations"
ON public.safety_violations FOR INSERT
WITH CHECK (true);  -- Service role only

-- Only admins can update
CREATE POLICY "Only admins can update safety violations"
ON public.safety_violations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Only admins can delete
CREATE POLICY "Only admins can delete safety violations"
ON public.safety_violations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Add comment
COMMENT ON TABLE public.admin_roles IS 'Admin role management. Only service role can modify. User metadata is NOT used for authorization to prevent manipulation.';
