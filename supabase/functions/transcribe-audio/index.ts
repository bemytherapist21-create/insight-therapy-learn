import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper to get CORS headers based on origin
function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = [
    'https://insight-therapy-learn.lovable.app',
    'http://localhost:5173',
    'http://localhost:8080',
  ];
  
  const origin = req.headers.get('origin') || '';
  
  // Check exact matches first
  let isAllowed = allowedOrigins.includes(origin);
  
  // Check for lovable.app preview deployments (wildcard pattern)
  if (!isAllowed && origin.match(/^https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+\.lovable\.app$/)) {
    isAllowed = true;
  }
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JWT using Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation - check request size before parsing
    const contentLength = req.headers.get('content-length');
    const MAX_REQUEST_SIZE_BYTES = 35 * 1024 * 1024; // 35MB max request size
    
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Request too large. Maximum 35MB allowed.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { audio, mimeType } = await req.json();
    
    if (!audio) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audio size (base64 encoded audio)
    const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB max audio size
    const estimatedSize = (audio.length * 3) / 4; // Base64 is ~33% larger than binary
    
    if (estimatedSize > MAX_AUDIO_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: 'Audio file too large. Maximum 25MB allowed.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`[transcribe-audio] Processing audio for user: ${claimsData.claims.sub}`);

    // Use Gemini's multimodal capabilities for audio transcription
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a transcription assistant. Listen to the audio and transcribe exactly what the person says. Return ONLY the transcription text, nothing else. No explanations, no formatting, just the exact words spoken.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please transcribe this audio recording:'
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: audio,
                  format: mimeType?.includes('wav') ? 'wav' : 'mp3'
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const transcript = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('[transcribe-audio] Transcription completed successfully');

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Transcription error:', error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: 'Transcription service unavailable. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
