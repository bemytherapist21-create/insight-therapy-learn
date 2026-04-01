import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function error(msg: string, code: string, status = 400) {
  return new Response(JSON.stringify({ error: msg, code }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return error("Service temporarily unavailable", "CONFIG_ERROR", 500);
    }

    const body = await req.json();
    const { resumeText, companyName, companyWebsite, jobDescription } = body;

    // Input validation
    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return error("Resume text is required", "MISSING_RESUME");
    }
    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return error("Company name is required", "MISSING_COMPANY");
    }
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return error("Job description is required", "MISSING_JD");
    }
    if (resumeText.length > 50000) {
      return error("Resume text is too long (max 50,000 characters)", "RESUME_TOO_LONG");
    }
    if (jobDescription.length > 20000) {
      return error("Job description is too long (max 20,000 characters)", "JD_TOO_LONG");
    }
    if (companyName.length > 200) {
      return error("Company name is too long (max 200 characters)", "COMPANY_TOO_LONG");
    }
    if (companyWebsite && typeof companyWebsite === "string" && companyWebsite.length > 500) {
      return error("Company website URL is too long", "WEBSITE_TOO_LONG");
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

    console.log("[generate-resume] Using Lovable AI Gateway with gemini-2.5-pro");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
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
      if (response.status === 429) {
        return error("Rate limit exceeded. Please try again in a moment.", "RATE_LIMITED", 429);
      }
      if (response.status === 402) {
        return error("AI credits exhausted. Please try again later.", "CREDITS_EXHAUSTED", 402);
      }
      const errBody = await response.text();
      console.error("[generate-resume] AI Gateway error:", response.status, errBody);
      return error("AI generation failed. Please try again.", "AI_ERROR", 502);
    }

    const result = await response.json();
    let html = result.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    html = html
      .replace(/^```html?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    if (!html) {
      return error("AI returned an empty response. Please try again.", "EMPTY_RESPONSE", 502);
    }

    console.log(`[generate-resume] Successfully generated HTML (${html.length} chars)`);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Generate resume error:", err);
    return error("An unexpected error occurred. Please try again.", "INTERNAL_ERROR", 500);
  }
});
