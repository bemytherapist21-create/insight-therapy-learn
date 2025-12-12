/*
  SECURITY HOTFIX: Fix Anonymous Data Exposure Vulnerability
  Date: 2025-12-07
  Severity: CRITICAL
  
  Description:
  This patch secures the 'voice_sessions' table by removing the default 'anonymous' value,
  enforcing NOT NULL on user_id, and tightening RLS policies to allow access ONLY 
  to authenticated owners.

  INSTRUCTIONS:
  Run this SQL script in your Supabase Dashboard > SQL Editor.
*/

-- 1. Cleanup: Remove or update existing anonymous sessions
-- Option A: Delete them (Safe if anonymous data isn't critical)
DELETE FROM voice_sessions WHERE user_id = 'anonymous';

-- 2. Schema Hardening
-- Remove the default value 'anonymous' which was part of the vulnerability
ALTER TABLE voice_sessions 
  ALTER COLUMN user_id DROP DEFAULT;

-- Enforce that user_id can never be null
ALTER TABLE voice_sessions 
  ALTER COLUMN user_id SET NOT NULL;

-- 3. RLS Policy Hardening
-- Drop insecure policies (assuming names, but 'DROP IF EXISTS' handles it)
DROP POLICY IF EXISTS "Allow anonymous access" ON voice_sessions;
DROP POLICY IF EXISTS "Public access" ON voice_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON voice_sessions;

-- Create strictly scoped policies
-- SELECT: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" 
ON voice_sessions FOR SELECT 
USING (auth.uid()::text = user_id);

-- INSERT: Users can only create sessions for themselves
CREATE POLICY "Users can create own sessions" 
ON voice_sessions FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- UPDATE: Users can only update their own sessions
CREATE POLICY "Users can update own sessions" 
ON voice_sessions FOR UPDATE 
USING (auth.uid()::text = user_id);

-- 4. Apply same protection to voice_messages linkage
-- Messages should inherit security from the session
DROP POLICY IF EXISTS "Messages follow session rules" ON voice_messages;

CREATE POLICY "Users can view own messages"
ON voice_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM voice_sessions 
    WHERE voice_sessions.id = voice_messages.session_id 
    AND voice_sessions.user_id = auth.uid()::text
  )
);
