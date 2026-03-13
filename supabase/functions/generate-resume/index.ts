import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { resumeText, companyName, companyWebsite, jobDescription } = await req.json();

    if (!resumeText || !companyName || !jobDescription) {
      throw new Error("Missing required fields");
    }

    const systemPrompt = `You are ResumeForge — a company-branded resume builder. Generate a complete, self-contained HTML file for a stunning, single-page resume that looks and FEELS like it was designed BY the target company's design team.

CRITICAL RULES:
- Output ONLY the raw HTML — no markdown, no code fences, no explanation.
- Use Tailwind CSS via CDN and Google Fonts via CDN.
- Include a sticky header with 3-theme toggle: [COMPANY] Theme (default) | LIGHT | DARK
- Smooth CSS transitions between themes (0.4s ease)
- Responsive layout, print-friendly (@media print)
- Semantic HTML5, custom scrollbar
- 2-column grid on desktop (experience left, skills/education right)
- Use the company's brand colors, fonts, metaphors, and UI patterns
- Do NOT fabricate any experience or credentials
- Include sections: Hero/Header, Professional Summary, Experience, Skills, Education, Why [Company]?, Footer
- The LIGHT theme must be ATS-friendly

For AI/Tech companies: use terminal/playground aesthetic, monospace fonts for metadata
For Streaming/Entertainment: cinematic, bold, dark backgrounds, card layouts
For Finance: clean, data-heavy, charts/progress bars
For Design/Creative: portfolio-style, layer-panel metaphors
Match the specific company's known aesthetic.`;

    const userPrompt = `Generate a company-branded HTML resume.

RESUME:
${resumeText}

TARGET COMPANY: ${companyName}${companyWebsite ? `\nWEBSITE: ${companyWebsite}` : ""}

JOB DESCRIPTION:
${jobDescription}

Output the complete HTML file now.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 16000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`AI API failed [${response.status}]: ${errBody}`);
    }

    const result = await response.json();
    let html = result.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Generate resume error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
