// Supabase Edge Function: Safety Check
// Integrates with Python Guardian API for crisis detection

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SafetyCheckRequest {
  message: string;
  userId: string;
  sessionId: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId, timestamp }: SafetyCheckRequest = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Call Python Guardian API
    const guardianApiUrl = Deno.env.get('GUARDIAN_API_URL') || 'http://localhost:8000';
    const guardianResponse = await fetch(`${guardianApiUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': Deno.env.get('GUARDIAN_API_KEY') || '',
      },
      body: JSON.stringify({ message, userId, sessionId }),
    });

    if (!guardianResponse.ok) {
      throw new Error(`Guardian API error: ${guardianResponse.statusText}`);
    }

    const guardianResult = await guardianResponse.json();

    // Store safety check result
    await supabaseClient.from('safety_checks').insert({
      user_id: userId,
      session_id: sessionId,
      message_text: message,
      risk_level: guardianResult.riskLevel,
      signals: guardianResult.signals,
      intervention_required: guardianResult.interventionRequired,
      timestamp,
    });

    return new Response(JSON.stringify(guardianResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Safety check failed:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        isSafe: false,
        riskLevel: 'monitor',
        interventionRequired: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
