-- Add Guardian Safety columns to voice_sessions table
ALTER TABLE IF EXISTS voice_sessions
ADD COLUMN IF NOT EXISTS wbc_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'clear';

-- Add index for performance queries
CREATE INDEX IF NOT EXISTS idx_voice_sessions_risk 
ON voice_sessions(risk_level, wbc_score);

-- Add comment
COMMENT ON COLUMN voice_sessions.wbc_score IS 'Well-Being Coefficient (Guardian Safety Framework): 1-100';
COMMENT ON COLUMN voice_sessions.risk_level IS 'Risk classification: clear (1-20), clouded (21-50), critical (51-100)';
