-- Create voice_sessions table
CREATE TABLE public.voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_emotion TEXT,
  notes TEXT
);

-- Create voice_messages table  
CREATE TABLE public.voice_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  emotion TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous users (no auth required for this feature)
CREATE POLICY "Anyone can create voice sessions"
ON public.voice_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read their sessions"
ON public.voice_sessions FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their sessions"
ON public.voice_sessions FOR UPDATE
USING (true);

CREATE POLICY "Anyone can create voice messages"
ON public.voice_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read voice messages"
ON public.voice_messages FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_voice_messages_session ON public.voice_messages(session_id);
CREATE INDEX idx_voice_sessions_started ON public.voice_sessions(started_at DESC);