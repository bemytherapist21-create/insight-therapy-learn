// Supabase Edge Function: Validate AI Response
// Ensures AI responses are safe and appropriate

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { response, context } = await req.json();

    // Check for harmful patterns
    const harmfulPatterns = [
      /(?:kill|hurt|harm)\s+(?:yourself|themselves)/i,
      /(?:suicide|self-harm)\s+(?:is|might be)\s+(?:a|the)\s+(?:solution|answer)/i,
      /you\s+(?:should|must)\s+(?:take|stop)\s+(?:medication|medicine)/i,
      /i\s+(?:diagnose|prescribe)/i,
    ];

    const containsHarmful = harmfulPatterns.some(pattern => pattern.test(response));

    if (containsHarmful) {
      return new Response(
        JSON.stringify({
          safe: false,
          reason: 'Response contains potentially harmful content',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check for medical advice
    const medicalPatterns = [
      /diagnos(?:e|is|ed)/i,
      /prescrib(?:e|ed|ing)/i,
      /you\s+(?:have|might have)\s+(?:depression|anxiety|bipolar|schizophrenia)/i,
    ];

    const givesMedicalAdvice = medicalPatterns.some(pattern => pattern.test(response));

    if (givesMedicalAdvice) {
      return new Response(
        JSON.stringify({
          safe: false,
          reason: 'Response contains medical advice, which is prohibited',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Response is safe
    return new Response(
      JSON.stringify({ safe: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Response validation failed:', error);
    return new Response(
      JSON.stringify({ safe: false, reason: 'Validation error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
