import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restricted CORS
function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = [
    'https://insight-therapy-learn.lovable.app',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://www.theeverythingai.com',
    'https://theeverythingai.com',
  ];
  const origin = req.headers.get('origin') || '';
  let isAllowed = allowedOrigins.includes(origin);
  if (!isAllowed && origin.match(/^https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9-]+\.lovable\.app$/)) {
    isAllowed = true;
  }
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const DID_TALK_URL = "https://api.d-id.com/talks";

function getAuthHeader(apiKey: string): string {
  if (apiKey.includes(':')) {
    const encoded = btoa(apiKey);
    return `Basic ${encoded}`;
  }
  return `Basic ${apiKey}`;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const DID_API_KEY = Deno.env.get('DID_API_KEY');
    if (!DID_API_KEY) {
      throw new Error('DID_API_KEY is not set');
    }

    const didAuth = getAuthHeader(DID_API_KEY);
    const body = await req.json();
    const { text, action, talkId } = body;

    if (action === 'create') {
      // Input validation
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const MAX_TEXT_LENGTH = 5000;
      if (text.length > MAX_TEXT_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters.` }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("Creating D-ID talk for user:", claimsData.claims.sub);

      const response = await fetch(DID_TALK_URL, {
        method: "POST",
        headers: {
          "Authorization": didAuth,
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
          config: { stitch: true },
          source_url: "https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("D-ID create error:", response.status, errorText);
        throw new Error(`D-ID API error: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify({ id: data.id, status: data.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'poll') {
      if (!talkId || typeof talkId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'talkId is required for poll action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate talkId format to prevent path traversal
      if (!/^[a-zA-Z0-9_-]+$/.test(talkId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid talkId format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(`${DID_TALK_URL}/${talkId}`, {
        method: "GET",
        headers: { "Authorization": didAuth },
      });

      if (!response.ok) {
        console.error("D-ID poll error:", response.status);
        throw new Error(`D-ID poll error: ${response.status}`);
      }

      const data = await response.json();
      return new Response(JSON.stringify({ status: data.status, result_url: data.result_url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'create' or 'poll'." }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
