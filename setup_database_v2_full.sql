/*
  MASTER DATABASE SETUP SCRIPT (v1.0.1 Secure)
  
  This script initializes the entire database schema for Insight Therapy Learn.
  It includes:
  1. All required tables (conversations, voice_sessions, etc.)
  2. Security hardening (RLS policies, no anonymous access)
  3. Indexes for performance
  
  INSTRUCTIONS:
  Run this entire script in the Supabase SQL Editor.
  If tables already exist, some parts might fail - that is expected.
  Ideally, run this on a clean database or use it to fill in missing parts.
*/

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Tables (Chat & Detection)

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  wbc_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('clear', 'clouded', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  law_violated TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_message TEXT NOT NULL,
  detected_risk TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.detection_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  predicted_risk BOOLEAN NOT NULL,
  actual_risk BOOLEAN,
  wbc_score INTEGER NOT NULL,
  outcome TEXT CHECK (outcome IN ('hit', 'miss', 'false_alarm', 'correct_rejection')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Voice Therapy Tables (SECURE VERSION)

CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Hardened: No default 'anonymous', NOT NULL enforced
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_emotion TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  emotion TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Audit Logging (Compliance)

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Indexes

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_session ON public.voice_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON public.voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);

-- 6. Row Level Security (RLS) & Policies

-- Enable RLS everywhere
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop policies before creating them (idempotency)
DO $$ 
BEGIN
    -- Voice Sessions Policies
    DROP POLICY IF EXISTS "Users can view own sessions" ON public.voice_sessions;
    DROP POLICY IF EXISTS "Users can create own sessions" ON public.voice_sessions;
    DROP POLICY IF EXISTS "Users can update own sessions" ON public.voice_sessions;
    
    -- Voice Messages Policies
    DROP POLICY IF EXISTS "Users can view own messages" ON public.voice_messages;
    DROP POLICY IF EXISTS "Users can create own messages" ON public.voice_messages;
    DROP POLICY IF EXISTS "Users can update own messages" ON public.voice_messages;

    -- Audit Logs Policies
    DROP POLICY IF EXISTS "Users can create audit logs" ON public.audit_logs;
    DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

    -- Conversations Policies
    DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can create own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

    -- Messages Policies
    DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can update messages in their conversations" ON public.messages;
    DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
    
    -- Detection Events Policies
    DROP POLICY IF EXISTS "Users can view detection events in their conversations" ON public.detection_events;
    DROP POLICY IF EXISTS "Users can create detection events in their conversations" ON public.detection_events;
    DROP POLICY IF EXISTS "Users can update detection events in their conversations" ON public.detection_events;
    DROP POLICY IF EXISTS "Users can delete detection events in their conversations" ON public.detection_events;

    -- Safety Violations Policies
    DROP POLICY IF EXISTS "Users can view safety violations in their conversations" ON public.safety_violations;
    DROP POLICY IF EXISTS "Users can create safety violations in their conversations" ON public.safety_violations;
    DROP POLICY IF EXISTS "Users can update safety violations in their conversations" ON public.safety_violations;
    DROP POLICY IF EXISTS "Users can delete safety violations in their conversations" ON public.safety_violations;
END $$;

-- Policy Definitions

-- Voice Sessions
CREATE POLICY "Users can view own sessions" ON public.voice_sessions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can create own sessions" ON public.voice_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own sessions" ON public.voice_sessions FOR UPDATE USING (auth.uid()::text = user_id);

-- Voice Messages
CREATE POLICY "Users can view own messages" ON public.voice_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM voice_sessions WHERE id = session_id AND user_id = auth.uid()::text)
);
CREATE POLICY "Users can create own messages" ON public.voice_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM voice_sessions WHERE id = session_id AND user_id = auth.uid()::text)
);

-- Audit Logs (Insert only mostly, select own)
CREATE POLICY "Users can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid()::text = user_id);

-- Conversations (Standard)
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create own conversations" ON public.conversations FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Realtime (Idempotent)
DO $$
BEGIN
  -- Add messages to realtime if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  -- Add voice_messages to realtime if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'voice_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_messages;
  END IF;
END $$;
