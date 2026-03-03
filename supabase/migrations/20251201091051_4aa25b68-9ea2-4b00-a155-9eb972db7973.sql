-- Add RLS policies for conversations table
CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create their own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own conversations"
ON public.conversations
FOR DELETE
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Add RLS policies for messages table
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.messages
FOR DELETE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Add RLS policies for detection_events table
CREATE POLICY "Users can view detection events in their conversations"
ON public.detection_events
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can create detection events in their conversations"
ON public.detection_events
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can update detection events in their conversations"
ON public.detection_events
FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can delete detection events in their conversations"
ON public.detection_events
FOR DELETE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

-- Add RLS policies for safety_violations table
CREATE POLICY "Users can view safety violations in their conversations"
ON public.safety_violations
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can create safety violations in their conversations"
ON public.safety_violations
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can update safety violations in their conversations"
ON public.safety_violations
FOR UPDATE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);

CREATE POLICY "Users can delete safety violations in their conversations"
ON public.safety_violations
FOR DELETE
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
);