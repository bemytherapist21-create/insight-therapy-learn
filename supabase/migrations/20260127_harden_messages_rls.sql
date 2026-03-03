-- Ensure messages table has deny-by-default RLS with explicit auth checks
-- This prevents any access if authentication is bypassed or fails

-- Drop existing policies to recreate with explicit auth checks
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;

-- Recreate with explicit authentication requirement and deny-by-default
CREATE POLICY "Authenticated users can view their messages only"
ON public.messages FOR SELECT
USING (
  auth.uid() IS NOT NULL  -- Explicit auth check - deny if null
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Authenticated users can create messages in their conversations only"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL  -- Explicit auth check - deny if null
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Authenticated users can update their messages only"
ON public.messages FOR UPDATE
USING (
  auth.uid() IS NOT NULL  -- Explicit auth check - deny if null
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

CREATE POLICY "Authenticated users can delete their messages only"
ON public.messages FOR DELETE
USING (
  auth.uid() IS NOT NULL  -- Explicit auth check - deny if null
  AND conversation_id IN (
    SELECT id FROM public.conversations
    WHERE user_id = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)
  )
);

-- Add comment explaining the security model
COMMENT ON TABLE public.messages IS 'User conversation messages. RLS enforces deny-by-default with explicit auth.uid() checks to prevent access if authentication fails.';
