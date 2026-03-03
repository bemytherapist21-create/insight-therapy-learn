-- Drop existing overly permissive RLS policies on voice_sessions
DROP POLICY IF EXISTS "Anyone can create voice sessions" ON public.voice_sessions;
DROP POLICY IF EXISTS "Anyone can read their sessions" ON public.voice_sessions;
DROP POLICY IF EXISTS "Anyone can update their sessions" ON public.voice_sessions;

-- Drop existing overly permissive RLS policies on voice_messages
DROP POLICY IF EXISTS "Anyone can create voice messages" ON public.voice_messages;
DROP POLICY IF EXISTS "Anyone can read voice messages" ON public.voice_messages;

-- Create secure RLS policies for voice_sessions (user_id = auth.uid()::text)
CREATE POLICY "Users can view their own voice sessions"
ON public.voice_sessions
FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own voice sessions"
ON public.voice_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own voice sessions"
ON public.voice_sessions
FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own voice sessions"
ON public.voice_sessions
FOR DELETE
USING (user_id = auth.uid()::text);

-- Create secure RLS policies for voice_messages (check session ownership)
CREATE POLICY "Users can view messages in their sessions"
ON public.voice_messages
FOR SELECT
USING (session_id IN (SELECT id FROM public.voice_sessions WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can create messages in their sessions"
ON public.voice_messages
FOR INSERT
WITH CHECK (session_id IN (SELECT id FROM public.voice_sessions WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update messages in their sessions"
ON public.voice_messages
FOR UPDATE
USING (session_id IN (SELECT id FROM public.voice_sessions WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete messages in their sessions"
ON public.voice_messages
FOR DELETE
USING (session_id IN (SELECT id FROM public.voice_sessions WHERE user_id = auth.uid()::text));