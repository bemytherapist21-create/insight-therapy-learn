import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    const { text } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log("Analyzing emotion for text:", text.substring(0, 50));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an emotion classifier for a mental health support system.
Classify the dominant emotion in the user's message as one of:
[calm, sad, anxious, angry, hopeless, stressed, happy, mixed]
Return ONLY a JSON object with format: {"emotion": "word", "confidence": 0.0-1.0}
No other text.`
          },
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"emotion": "mixed", "confidence": 0.5}';
    
    // Parse the JSON response
    let emotionData;
    try {
      emotionData = JSON.parse(content);
    } catch {
      // Fallback if response isn't valid JSON
      const allowed = ["calm", "sad", "anxious", "angry", "hopeless", "stressed", "happy", "mixed"];
      const foundEmotion = allowed.find(e => content.toLowerCase().includes(e));
      emotionData = { emotion: foundEmotion || "mixed", confidence: 0.7 };
    }

    console.log("Detected emotion:", emotionData);

    return new Response(JSON.stringify(emotionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message, emotion: "mixed", confidence: 0 }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
