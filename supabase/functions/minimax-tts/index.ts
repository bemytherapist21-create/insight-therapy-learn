import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Use a warm, natural voice for therapy
    const selectedVoice = voiceId || "English_expressive_narrator";
    
    console.log(`Generating TTS for text: "${text.substring(0, 50)}..." with voice: ${selectedVoice}`);

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

    console.log(`Generated ${audioBytes.length} bytes of audio`);

    return new Response(audioBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });

  } catch (error) {
    console.error("MiniMax TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
