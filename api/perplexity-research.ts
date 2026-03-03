export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    // Only allow POST
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { query } = await req.json();

        if (!query) {
            return new Response(JSON.stringify({ error: "Query is required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Use the key from Vercel environment
        const apiKey = process.env.VITE_PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Call Perplexity API directly
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                model: "sonar", // using 'sonar' as seen in the original Supabase function
                messages: [
                    {
                        role: "system",
                        content: "You are a high-level business strategy consultant. Provide concise, data-driven insights with strategic recommendations. Focus on trends, opportunities, and risks.",
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
            console.error("[Vercel API] Perplexity error:", response.status, errorText);
            return new Response(JSON.stringify({ error: `Perplexity API error: ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "No insight generated.";
        const citations = data.citations || [];

        return new Response(JSON.stringify({ content, citations }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error("Error in Vercel function:", error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
