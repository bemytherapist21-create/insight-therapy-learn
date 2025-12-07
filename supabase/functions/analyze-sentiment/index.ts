// Supabase Edge Function: Sentiment Analysis
// Analyzes emotional content of user messages

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, userId, sessionId } = await req.json();

    // Call OpenAI for sentiment analysis
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze the emotional content of the following message and return a JSON object with this structure:
{
  "score": number between -1 (very negative) and 1 (very positive),
  "magnitude": number between 0 and 1 (intensity of emotion),
  "emotions": {
    "joy": number 0-1,
    "sadness": number 0-1,
    "anger": number 0-1,
    "fear": number 0-1,
    "anxiety": number 0-1,
    "neutral": number 0-1
  },
  "dominant": string (name of dominant emotion)
}
Return ONLY the JSON object, no other text.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIResult = await openAIResponse.json();
    const sentimentData = JSON.parse(openAIResult.choices[0].message.content);

    const result = {
      ...sentimentData,
      timestamp: new Date(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return new Response(
      JSON.stringify({
        score: 0,
        magnitude: 0.5,
        emotions: { joy: 0.16, sadness: 0.16, anger: 0.16, fear: 0.16, anxiety: 0.16, neutral: 0.2 },
        dominant: 'neutral',
        timestamp: new Date(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
