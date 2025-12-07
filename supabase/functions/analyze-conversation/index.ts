// Supabase Edge Function: Analyze Conversation
// Analyzes entire conversation history for risk patterns

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, userId } = await req.json();

    // Analyze conversation for patterns
    const userMessages = messages
      .filter((m: ConversationMessage) => m.role === 'user')
      .map((m: ConversationMessage) => m.content.toLowerCase());

    // Pattern detection
    const concerningPatterns = {
      hopelessness: ['no hope', 'hopeless', 'nothing matters', 'give up'],
      isolation: ['alone', 'no one', 'nobody cares', 'isolated'],
      selfHarm: ['hurt myself', 'harm', 'cut', 'pain'],
      suicidal: ['suicide', 'kill myself', 'end it', 'die']
    };

    let patternCounts: Record<string, number> = {
      hopelessness: 0,
      isolation: 0,
      selfHarm: 0,
      suicidal: 0
    };

    for (const message of userMessages) {
      for (const [pattern, keywords] of Object.entries(concerningPatterns)) {
        if (keywords.some(keyword => message.includes(keyword))) {
          patternCounts[pattern]++;
        }
      }
    }

    // Determine risk level based on patterns
    let riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    let interventionRequired = false;

    if (patternCounts.suicidal > 0) {
      riskLevel = 'critical';
      interventionRequired = true;
    } else if (patternCounts.selfHarm > 1 || patternCounts.hopelessness > 2) {
      riskLevel = 'high';
      interventionRequired = true;
    } else if (Object.values(patternCounts).some(count => count > 0)) {
      riskLevel = 'medium';
    }

    return new Response(
      JSON.stringify({
        isSafe: !interventionRequired,
        riskLevel,
        triggers: Object.entries(patternCounts)
          .filter(([_, count]) => count > 0)
          .map(([pattern, _]) => pattern),
        interventionRequired,
        patterns: patternCounts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
