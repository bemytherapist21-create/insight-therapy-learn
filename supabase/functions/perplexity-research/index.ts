import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": Deno.env.get("FRONTEND_URL") || "https://insight-therapy-learn.lovable.app",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface PerplexityRequest {
    query: string;
}

serve(async (req) => {
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

        // Verify JWT authentication
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Authentication required" }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Note: Supabase automatically verifies the JWT when using supabase.functions.invoke()
        // This endpoint should only be called via the frontend service

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
            throw new Error(`Perplexity API Error: ${response.statusText} - ${errorText}`);
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
                error: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
