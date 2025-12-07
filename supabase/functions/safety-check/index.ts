// Supabase Edge Function: Safety Check
// Integrates with Project Guardian Python backend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SafetyCheckRequest {
  message: string;
  sessionId: string;
  userId: string;
  type: 'pre-processing' | 'post-processing';
  context?: any[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { message, sessionId, userId, type, context }: SafetyCheckRequest = await req.json();

    // Step 1: Keyword-based detection (fast)
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'self-harm', 'hurt myself', 'overdose', 'no reason to live'
    ];

    const messageLower = message.toLowerCase();
    const detectedKeywords = crisisKeywords.filter(keyword => 
      messageLower.includes(keyword)
    );

    // Step 2: Risk level determination
    let riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    let interventionRequired = false;

    if (detectedKeywords.length > 0) {
      if (detectedKeywords.some(k => ['suicide', 'kill myself', 'end my life'].includes(k))) {
        riskLevel = 'critical';
        interventionRequired = true;
      } else if (detectedKeywords.length >= 2) {
        riskLevel = 'high';
        interventionRequired = true;
      } else {
        riskLevel = 'medium';
      }
    }

    // Step 3: Call Project Guardian Python API (if available)
    try {
      const guardianApiUrl = Deno.env.get('GUARDIAN_API_URL');
      if (guardianApiUrl) {
        const guardianResponse = await fetch(`${guardianApiUrl}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            context,
            session_id: sessionId
          }),
          signal: AbortSignal.timeout(5000) // 5s timeout
        });

        if (guardianResponse.ok) {
          const guardianResult = await guardianResponse.json();
          // Override with Guardian's assessment if more severe
          if (guardianResult.risk_level === 'critical') {
            riskLevel = 'critical';
            interventionRequired = true;
          }
        }
      }
    } catch (error) {
      console.error('Guardian API call failed:', error);
      // Continue with keyword-based detection
    }

    // Step 4: Log safety event
    if (riskLevel !== 'none') {
      await supabaseClient.from('safety_audit_logs').insert({
        session_id: sessionId,
        user_id: userId,
        event_type: `safety_check_${type}`,
        severity: riskLevel,
        details: {
          message: message.substring(0, 200),
          detected_keywords: detectedKeywords,
          risk_level: riskLevel
        },
        timestamp: new Date().toISOString()
      });
    }

    // Step 5: Get emergency contacts if intervention needed
    let emergencyContacts = [];
    if (interventionRequired) {
      const { data: contacts } = await supabaseClient
        .from('emergency_contacts')
        .select('*')
        .eq('active', true)
        .limit(5);
      emergencyContacts = contacts || [];
    }

    return new Response(
      JSON.stringify({
        isSafe: !interventionRequired,
        riskLevel,
        triggers: detectedKeywords,
        interventionRequired,
        recommendedAction: interventionRequired ? 'show_emergency_resources' : 'continue',
        emergencyContacts
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
