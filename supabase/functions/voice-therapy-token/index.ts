import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment");
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log("Creating OpenAI Realtime session...");
    console.log("API Key present:", !!OPENAI_API_KEY, "Length:", OPENAI_API_KEY.length);

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are a compassionate AI therapy assistant called "Guardian". Your role is to provide empathetic, supportive conversations while maintaining professional boundaries.

Core Principles:
- Listen actively and respond with empathy
- Use reflective listening techniques
- Validate emotions without judgment
- Encourage healthy coping strategies
- Never provide medical diagnoses or prescribe medication
- If someone expresses thoughts of self-harm or suicide, gently encourage them to contact crisis resources (988 Suicide & Crisis Lifeline)

Safety Framework:
- Monitor for signs of distress
- Escalate appropriately when needed
- Always prioritize user wellbeing

Communication Style:
- Warm and supportive tone
- Use "I hear you" and "That sounds difficult" 
- Ask open-ended questions
- Keep responses conversational and not too long
- Be present and attentive`
      }),
    });

    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Session created successfully, has client_secret:", !!data.client_secret);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in voice-therapy-token:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
