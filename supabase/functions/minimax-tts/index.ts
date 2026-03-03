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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, voiceId } = await req.json();
    
    // Input validation - prevent DoS attacks
    const MAX_TEXT_LENGTH = 5000;
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) {
      console.error("MINIMAX_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "TTS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom cloned voice for therapy
    const selectedVoice = voiceId || "moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3";
    
    console.log(`[minimax-tts] Generating TTS for user ${claimsData.claims.sub}, text: "${text.substring(0, 50)}..."`);

    const response = await fetch("https://api.minimax.io/v1/t2a_v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "speech-2.6-hd",
        text: text,
        stream: false,
        language_boost: "auto",
        output_format: "hex",
        voice_setting: {
          voice_id: selectedVoice,
          speed: 0.95, // Slightly slower for therapeutic context
          vol: 1,
          pitch: 0,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3",
          channel: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "TTS generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    if (!data.data?.audio) {
      console.error("No audio data in MiniMax response:", data);
      return new Response(
        JSON.stringify({ error: "No audio generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert hex to binary
    const hexAudio = data.data.audio;
    const audioBytes = new Uint8Array(hexAudio.length / 2);
    for (let i = 0; i < hexAudio.length; i += 2) {
      audioBytes[i / 2] = parseInt(hexAudio.substr(i, 2), 16);
    }

    console.log(`[minimax-tts] Generated ${audioBytes.length} bytes of audio`);

    return new Response(audioBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    // Log detailed error server-side for debugging
    console.error("MiniMax TTS error:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "Text-to-speech service unavailable. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
