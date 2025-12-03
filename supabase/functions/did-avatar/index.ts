import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DID_TALK_URL = "https://api.d-id.com/talks";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY is not set');
    }

    const { text, action } = await req.json();

    // Action: create or poll
    if (action === 'create') {
      console.log("Creating D-ID talk for text:", text?.substring(0, 50));
      
      const response = await fetch(DID_TALK_URL, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${DID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script: {
            type: "text",
            input: text,
            provider: {
              type: "microsoft",
              voice_id: "en-US-JennyNeural"
            }
          },
          config: {
            stitch: true,
          },
          source_url: "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("D-ID create error:", response.status, errorText);
        throw new Error(`D-ID API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("D-ID talk created:", data.id);
      
      return new Response(JSON.stringify({ 
        id: data.id,
        status: data.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'poll') {
      const { talkId } = await req.json();
      console.log("Polling D-ID talk:", talkId);

      const response = await fetch(`${DID_TALK_URL}/${talkId}`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${DID_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("D-ID poll error:", response.status, errorText);
        throw new Error(`D-ID poll error: ${response.status}`);
      }

      const data = await response.json();
      console.log("D-ID talk status:", data.status);

      return new Response(JSON.stringify({
        status: data.status,
        result_url: data.result_url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("Invalid action. Use 'create' or 'poll'.");

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
