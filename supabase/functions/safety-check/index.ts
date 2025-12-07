// Supabase Edge Function: Safety Check
// Comprehensive message safety analysis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crisis keywords with severity weights
const CRISIS_KEYWORDS = {
  critical: [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'plan to die',
    'goodbye cruel world',
  ],
  high: [
    'no reason to live',
    'better off dead',
    'can\'t go on',
    'hopeless',
    'worthless',
    'burden to everyone',
  ],
  medium: [
    'cut myself',
    'hurt myself',
    'self harm',
    'give up',
    'can\'t take it',
  ],
  low: ['depressed', 'sad', 'lonely', 'struggling'],
};

interface SafetyCheckRequest {
  message: string;
  sessionId: string;
  conversationHistory?: string[];
}

function analyzeCrisisLevel(text: string): {
  level: 'safe' | 'warning' | 'danger' | 'critical';
  score: number;
  detectedKeywords: string[];
} {
  const lowerText = text.toLowerCase();
  let score = 0;
  const detectedKeywords: string[] = [];

  // Check critical keywords
  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (lowerText.includes(keyword)) {
      score += 10;
      detectedKeywords.push(keyword);
    }
  }

  // Check high severity
  for (const keyword of CRISIS_KEYWORDS.high) {
    if (lowerText.includes(keyword)) {
      score += 5;
      detectedKeywords.push(keyword);
    }
  }

  // Check medium severity
  for (const keyword of CRISIS_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) {
      score += 3;
      detectedKeywords.push(keyword);
    }
  }

  // Check low severity
  for (const keyword of CRISIS_KEYWORDS.low) {
    if (lowerText.includes(keyword)) {
      score += 1;
      detectedKeywords.push(keyword);
    }
  }

  // Determine level
  let level: 'safe' | 'warning' | 'danger' | 'critical' = 'safe';
  if (score >= 10) level = 'critical';
  else if (score >= 5) level = 'danger';
  else if (score >= 2) level = 'warning';

  return { level, score, detectedKeywords };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, sessionId, conversationHistory }: SafetyCheckRequest = await req.json();

    // Analyze current message
    const analysis = analyzeCrisisLevel(message);

    // Analyze conversation trend if history available
    let trendAnalysis = { isEscalating: false };
    if (conversationHistory && conversationHistory.length > 1) {
      const scores = conversationHistory.map(
        (msg) => analyzeCrisisLevel(msg).score
      );
      const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = scores.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(scores.length - 3, 1);
      trendAnalysis.isEscalating = recentAvg > olderAvg + 2;
    }

    const result = {
      isSafe: analysis.level === 'safe',
      riskLevel: analysis.level,
      crisisDetected: analysis.level === 'critical' || analysis.level === 'danger',
      signals: [
        {
          level: analysis.level,
          keywords: analysis.detectedKeywords,
          confidence: Math.min(analysis.score / 10, 1.0),
          timestamp: new Date().toISOString(),
          context: message.substring(0, 100),
        },
      ],
      interventionRequired: analysis.level === 'critical' || trendAnalysis.isEscalating,
      message:
        analysis.level === 'critical'
          ? 'Crisis detected. Emergency intervention recommended.'
          : analysis.level === 'danger'
          ? 'High risk detected. Please consider reaching out for support.'
          : undefined,
    };

    // Log to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('safety_logs').insert({
      session_id: sessionId,
      event_type: 'message_analyzed',
      severity: analysis.level,
      details: result,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Safety check error:', error);
    return new Response(
      JSON.stringify({
        error: 'Safety check failed',
        isSafe: false,
        riskLevel: 'warning',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
