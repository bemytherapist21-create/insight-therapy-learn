-- Fix voice_sessions authentication bypass by standardizing to JWT claims approach
-- This ensures consistency with other tables and prevents authentication bypass

-- Drop current policies that use auth.uid()::text
DROP POLICY IF EXISTS "Users can view their own voice sessions" ON public.voice_sessions;
DROP POLICY IF EXISTS "Users can create their own voice sessions" ON public.voice_sessions;
DROP POLICY IF EXISTS "Users can update their own voice sessions" ON public.voice_sessions;
DROP POLICY IF EXISTS "Users can delete their own voice sessions" ON public.voice_sessions;

-- Recreate policies using standardized JWT claims approach
CREATE POLICY "Users can view their own voice sessions"
ON public.voice_sessions FOR SELECT
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can create their own voice sessions"
ON public.voice_sessions FOR INSERT
WITH CHECK (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can update their own voice sessions"
ON public.voice_sessions FOR UPDATE
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

CREATE POLICY "Users can delete their own voice sessions"
ON public.voice_sessions FOR DELETE
USING (user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text));

-- Fix voice_messages policies to use same approach
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.voice_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.voice_messages;
DROP POLICY IF EXISTS "Users can update messages in their sessions" ON public.voice_messages;
DROP POLICY IF EXISTS "Users can delete messages in their sessions" ON public.voice_messages;

CREATE POLICY "Users can view messages in their sessions"
ON public.voice_messages FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.voice_sessions
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Users can create messages in their sessions"
ON public.voice_messages FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM public.voice_sessions
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Users can update messages in their sessions"
ON public.voice_messages FOR UPDATE
USING (
  session_id IN (
    SELECT id FROM public.voice_sessions
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Users can delete messages in their sessions"
ON public.voice_messages FOR DELETE
USING (
  session_id IN (
    SELECT id FROM public.voice_sessions
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

-- Remove anonymous default to require authentication
-- This prevents the mismatch where auth check expects UUID but gets 'anonymous'
ALTER TABLE IF EXISTS public.voice_sessions
ALTER COLUMN user_id DROP DEFAULT;

-- Add comment explaining the security requirements
COMMENT ON COLUMN public.voice_sessions.user_id IS 'User ID from JWT claims. Authentication required - no anonymous sessions allowed.';
