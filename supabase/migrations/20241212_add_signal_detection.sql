-- Signal Detection System Database Schema
-- Tracks safety predictions and outcomes for continuous improvement

-- Detection events table
CREATE TABLE IF NOT EXISTS safety_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES voice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prediction data
  predicted_risk BOOLEAN NOT NULL,
  wbc_score INTEGER NOT NULL,
  user_message TEXT,
  
  -- Outcome data (set by human review or follow-up)
  actual_risk BOOLEAN,
  outcome TEXT CHECK (outcome IN ('hit', 'miss', 'false_alarm', 'correct_rejection')),
  reviewed_by UUID,
  review_timestamp TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detection metrics aggregation table
CREATE TABLE IF NOT EXISTS detection_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Counts
  total_events INTEGER DEFAULT 0,
  hits INTEGER DEFAULT 0,
  misses INTEGER DEFAULT 0,
  false_alarms INTEGER DEFAULT 0,
  correct_rejections INTEGER DEFAULT 0,
  
  -- Calculated metrics
  hit_rate DECIMAL(5,4),
  false_alarm_rate DECIMAL(5,4),
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  
  -- Threshold info
  threshold_used INTEGER,
  threshold_recommended INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_detections_session ON safety_detections(session_id);
CREATE INDEX IF NOT EXISTS idx_safety_detections_user ON safety_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_detections_timestamp ON safety_detections(timestamp);
CREATE INDEX IF NOT EXISTS idx_safety_detections_outcome ON safety_detections(outcome);
CREATE INDEX IF NOT EXISTS idx_safety_detections_needs_review ON safety_detections(actual_risk) WHERE actual_risk IS NULL;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_safety_detections_updated_at
  BEFORE UPDATE ON safety_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for events needing review
CREATE OR REPLACE VIEW detections_needing_review AS
SELECT 
  id,
  session_id,
  user_id,
  timestamp,
  wbc_score,
  user_message,
  created_at
FROM safety_detections
WHERE actual_risk IS NULL
  AND predicted_risk = true
ORDER BY timestamp DESC;

-- View for critical misses
CREATE OR REPLACE VIEW critical_misses AS
SELECT 
  id,
  session_id,
  user_id,
  timestamp,
  wbc_score,
  user_message,
  review_notes,
  review_timestamp
FROM safety_detections
WHERE outcome = 'miss'
ORDER BY timestamp DESC;

-- Function to calculate metrics for a time period
CREATE OR REPLACE FUNCTION calculate_detection_metrics(
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS TABLE (
  total_events BIGINT,
  hits BIGINT,
  misses BIGINT,
  false_alarms BIGINT,
  correct_rejections BIGINT,
  hit_rate DECIMAL,
  false_alarm_rate DECIMAL,
  accuracy DECIMAL,
  precision_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_events,
    COUNT(*) FILTER (WHERE outcome = 'hit')::BIGINT as hits,
    COUNT(*) FILTER (WHERE outcome = 'miss')::BIGINT as misses,
    COUNT(*) FILTER (WHERE outcome = 'false_alarm')::BIGINT as false_alarms,
    COUNT(*) FILTER (WHERE outcome = 'correct_rejection')::BIGINT as correct_rejections,
    
    -- Hit rate (sensitivity/recall)
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IN ('hit', 'miss')) > 0 
      THEN COUNT(*) FILTER (WHERE outcome = 'hit')::DECIMAL / 
           COUNT(*) FILTER (WHERE outcome IN ('hit', 'miss'))
      ELSE 0
    END as hit_rate,
    
    -- False alarm rate
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IN ('false_alarm', 'correct_rejection')) > 0 
      THEN COUNT(*) FILTER (WHERE outcome = 'false_alarm')::DECIMAL / 
           COUNT(*) FILTER (WHERE outcome IN ('false_alarm', 'correct_rejection'))
      ELSE 0
    END as false_alarm_rate,
    
    -- Accuracy
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IS NOT NULL) > 0 
      THEN (COUNT(*) FILTER (WHERE outcome IN ('hit', 'correct_rejection')))::DECIMAL / 
           COUNT(*) FILTER (WHERE outcome IS NOT NULL)
      ELSE 0
    END as accuracy,
    
    -- Precision
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IN ('hit', 'false_alarm')) > 0 
      THEN COUNT(*) FILTER (WHERE outcome = 'hit')::DECIMAL / 
           COUNT(*) FILTER (WHERE outcome IN ('hit', 'false_alarm'))
      ELSE 0
    END as precision_score
    
  FROM safety_detections
  WHERE timestamp BETWEEN start_time AND end_time
    AND outcome IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE safety_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own detection events
CREATE POLICY "Users can view own detections"
  ON safety_detections FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access detections"
  ON safety_detections
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access metrics"
  ON detection_metrics
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON detections_needing_review TO authenticated;
GRANT SELECT ON critical_misses TO service_role;
