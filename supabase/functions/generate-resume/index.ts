import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try Google AI API key first, then fall back to Lovable
    const GOOGLE_API_KEY =
      Deno.env.get("GOOGLE_AI_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GOOGLE_API_KEY && !LOVABLE_API_KEY) {
      throw new Error(
        "No AI API key configured (GOOGLE_AI_API_KEY or LOVABLE_API_KEY)",
      );
    }

    const { resumeText, companyName, companyWebsite, jobDescription } =
      await req.json();

    if (!resumeText || !companyName || !jobDescription) {
      throw new Error("Missing required fields");
    }

    const systemPrompt = `You are ResumeForge — a company-branded resume builder. Generate a complete, self-contained HTML file for a stunning, single-page resume that looks and FEELS like it was designed BY the target company's design team.

CRITICAL RULES:
- Output ONLY the raw HTML — no markdown, no code fences, no explanation.
- Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) and Google Fonts via CDN.
- Include a sticky header with 3-theme toggle: [COMPANY] Theme (default) | LIGHT | DARK
- Smooth CSS transitions between themes (0.4s ease)
- Responsive layout, print-friendly (@media print)
- Semantic HTML5, custom scrollbar
- 2-column grid on desktop (experience left, skills/education right)
- Use the company's brand colors, fonts, metaphors, and UI patterns
- Do NOT fabricate any experience or credentials
- Include sections: Hero/Header, Professional Summary, Experience, Skills, Education, Why [Company]?, Footer
- The LIGHT theme must be ATS-friendly

Brand Immersion Rules:
For AI/Tech companies: use terminal/playground aesthetic, monospace fonts for metadata
For Streaming/Entertainment: cinematic, bold, dark backgrounds, card layouts
For Finance: clean, data-heavy, charts/progress bars
For Design/Creative: portfolio-style, layer-panel metaphors
For Gaming: HUD-style layout, XP bars, achievement badges
For Social Media: Feed-style layout, stories-like sections
For E-commerce: Product listing style, review-like testimonials
Match the specific company's known aesthetic.

The 3-Theme Toggle (MANDATORY):
1. [COMPANY_NAME] Theme (Default) — Uses the company's exact brand colors and personality
2. LIGHT Theme — Professional, clean white background. Blue accents. Traditional resume feel.
3. DARK Theme — Sleek dark mode (#121212 background). Teal/cyan accents (#64FFDA). Modern, developer-friendly.

The toggle must use CSS classes on the <body> element (theme-default, theme-light, theme-dark).`;

    const userPrompt = `Generate a company-branded HTML resume.

RESUME:
${resumeText}

TARGET COMPANY: ${companyName}${companyWebsite ? `\nWEBSITE: ${companyWebsite}` : ""}

JOB DESCRIPTION:
${jobDescription}

Output the complete HTML file now.`;

    let html = "";

    if (GOOGLE_API_KEY) {
      // Use Google Gemini API directly
      console.log("[generate-resume] Using Google Gemini API");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 16000,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!response.ok) {
        const errBody = await response.text();
        console.error("[generate-resume] Gemini API error:", errBody);
        throw new Error(`Gemini API failed [${response.status}]: ${errBody}`);
      }

      const result = await response.json();
      html = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      // Fallback to Lovable API
      console.log("[generate-resume] Using Lovable API");
      const response = await fetch(
        "https://api.lovable.dev/v1/chat/completions",
        {
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
        },
      );

      if (!response.ok) {
        const errBody = await response.text();
        console.error("[generate-resume] Lovable API error:", errBody);
        throw new Error(`AI API failed [${response.status}]: ${errBody}`);
      }

      const result = await response.json();
      html = result.choices?.[0]?.message?.content || "";
    }

    // Strip markdown code fences if present
    html = html
      .replace(/^```html?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    if (!html) {
      throw new Error("AI returned empty response");
    }

    console.log(
      `[generate-resume] Successfully generated HTML (${html.length} chars)`,
    );

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
