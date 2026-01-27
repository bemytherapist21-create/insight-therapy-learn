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

interface PerplexityRequest {
  query: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Perplexity API key from Supabase secrets
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY is not configured in Supabase secrets");
    }

    // Check for JWT authentication (optional - allows anonymous access for Insight Fusion)
    const authHeader = req.headers.get("authorization");
    let userId = 'anonymous';
    
    if (authHeader?.startsWith('Bearer ')) {
      // Validate JWT using Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
      
      if (!claimsError && claimsData?.claims) {
        userId = claimsData.claims.sub as string;
      }
    }
    
    // Verify that either JWT or apikey is present
    const reqApiKey = req.headers.get('apikey');
    if (!authHeader && !reqApiKey) {
      return new Response(
        JSON.stringify({ error: "API key required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { query }: PerplexityRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Input validation - prevent DoS attacks
    const MAX_QUERY_LENGTH = 5000;
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Query too long. Maximum ${MAX_QUERY_LENGTH} characters allowed.` }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[perplexity-research] Processing query for user: ${userId}`);

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You are a high-level business strategy consultant. Provide concise, data-driven insights with strategic recommendations. Focus on trends, opportunities, and risks.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.2,
        top_p: 0.9,
        frequency_penalty: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[perplexity-research] API error:", response.status, errorText);
      throw new Error(`Research service temporarily unavailable`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "No insight generated.";
    const citations = data.citations || [];

    return new Response(
      JSON.stringify({ content, citations }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in perplexity-research function:", error);
    return new Response(
      JSON.stringify({
        error: "Research service unavailable. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
