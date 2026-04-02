import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function errorResponse(msg: string, code: string, status = 400) {
  return new Response(JSON.stringify({ error: msg, code }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 8000,
  temperature = 0.7,
): Promise<string> {
  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
    },
  );

  if (!response.ok) {
    const status = response.status;
    const errBody = await response.text();
    console.error(`[generate-resume] AI call failed (${status}):`, errBody);
    throw { status, message: errBody };
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse("Service temporarily unavailable", "CONFIG_ERROR", 500);
    }

    const body = await req.json();
    const { resumeText, companyName, companyWebsite, jobDescription } = body;

    // Input validation
    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return errorResponse("Resume text is required", "MISSING_RESUME");
    }
    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return errorResponse("Company name is required", "MISSING_COMPANY");
    }
    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return errorResponse("Job description is required", "MISSING_JD");
    }
    if (resumeText.length > 50000) {
      return errorResponse("Resume text is too long (max 50,000 characters)", "RESUME_TOO_LONG");
    }
    if (jobDescription.length > 20000) {
      return errorResponse("Job description is too long (max 20,000 characters)", "JD_TOO_LONG");
    }
    if (companyName.length > 200) {
      return errorResponse("Company name is too long (max 200 characters)", "COMPANY_TOO_LONG");
    }
    if (companyWebsite && typeof companyWebsite === "string" && companyWebsite.length > 500) {
      return errorResponse("Company website URL is too long", "WEBSITE_TOO_LONG");
    }

    const PRO_MODEL = "google/gemini-2.5-pro";
    const FLASH_MODEL = "google/gemini-2.5-flash";

    // =========================================================
    // STEP 1: Extract Resume Content (structured) — parallel with Step 2
    // =========================================================
    console.log("[generate-resume] Step 1: Extracting resume content...");

    const extractPromise = callAI(
      LOVABLE_API_KEY,
      FLASH_MODEL,
      `You are a resume parser. Extract ALL information from the resume accurately. Never fabricate or omit anything.`,
      `Extract the structured information from this resume. Return ONLY valid JSON, no markdown fences.

Return JSON in this exact structure:
{
  "name": "",
  "title": "",
  "contact": { "email": "", "phone": "", "location": "", "linkedin": "" },
  "summary": "",
  "experience": [
    { "role": "", "company": "", "duration": "", "achievements": [] }
  ],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "skills": { "technical": [], "business": [], "tools": [] },
  "certifications": [],
  "projects": []
}

RESUME TEXT:
${resumeText}`,
      4000,
      0.2,
    );

    // =========================================================
    // STEP 2: Analyze Company Brand (parallel with Step 1)
    // =========================================================
    console.log("[generate-resume] Step 2: Analyzing company brand...");

    const brandPromise = callAI(
      LOVABLE_API_KEY,
      FLASH_MODEL,
      `You are a brand identity analyst. Research and analyze the target company's brand identity. Identify their exact brand colors, typography, UI patterns, design language, content tone, and metaphors. Be specific — use actual hex colors and font names.

Quick-Reference for popular companies:
Company	Accent Color	Font	UI Style
OpenAI	#10A37F (green)	Inter + JetBrains Mono	Terminal/playground aesthetic
Netflix	#E50914 (red)	Outfit + Helvetica Neue	Cinematic cards
Google	#4285F4 / #34A853 / #EA4335 / #FBBC05	Product Sans (→ Outfit) + Roboto	Material Design
Spotify	#1DB954 (green)	Circular (→ Outfit) + Inter	Playlist-card layout
Apple	#000000 + subtle gradients	SF Pro (→ Inter 300-600)	Ultra-minimal, glass
Amazon	#FF9900 (orange)	Amazon Ember (→ Inter)	Product-card layout
Microsoft	#00A4EF (blue)	Segoe UI (→ Inter)	Fluent Design cards
Meta	#0668E1 (blue)	Optimistic Display (→ Outfit)	Feed-style timeline
Tesla	#CC0000 (red)	SFUI (→ Inter 300)	Dashboard/instrument-panel
Stripe	#635BFF (purple)	Inter	Developer-doc feel
Airbnb	#FF5A5F (coral)	Cereal (→ Outfit)	Warm rounded cards

Brand Immersion Metaphor Guide:
| Company Type | Design Approach | Metaphor Style |
|---|---|---|
| AI/Tech | Terminal/playground aesthetic. Monospace metadata. | Experience="Training Epochs", Skills="Vectors & Parameters", Education="Foundational Datasets", Summary="System Prompt" |
| Streaming/Entertainment | Cinematic, bold, dark backgrounds. Card layouts. | Experience="Seasons", Skills="Top Picks", Education="Origin Story", Summary="The Pitch" |
| Social Media | Feed-style, stories-like sections, engagement metrics. | Experience="Posts/Threads", Skills="Trending Topics" |
| E-commerce | Product listing style, review testimonials. | Experience="Best Sellers", Skills="Product Specs" |
| Finance | Clean, data-heavy, charts/progress bars. | Experience="Portfolio", Skills="Asset Allocation" |
| Design/Creative | Portfolio-style, layer-panel metaphors. | Experience="Artboards", Skills="Toolbox" |
| Gaming | HUD-style, XP bars, achievement badges. | Experience="Quest Log", Skills="Skill Tree" |
| Consulting | Ultra-clean, structured, serious. | Experience="Engagements", Skills="Capabilities" |
| Healthcare | Clinical, clean whites and blues. | Experience="Case History", Skills="Specializations" |
| Travel | Warm cards, rounded corners, destination-cards. | Experience="Journeys", Skills="Travel Essentials" |
| Startups | Minimal, modern, lots of whitespace. | Match the specific startup's aesthetic |`,
      `Analyze the brand identity of "${companyName}"${companyWebsite ? ` (website: ${companyWebsite})` : ""}.

Return ONLY valid JSON, no markdown fences:
{
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "font_style": "description",
  "google_font_primary": "Font Name",
  "google_font_secondary": "Font Name",
  "design_theme": "description of UI patterns",
  "content_tone": "description of voice/tone",
  "ui_inspiration": "specific UI patterns to use",
  "metaphors": {
    "experience": "section header metaphor",
    "skills": "section header metaphor",
    "education": "section header metaphor",
    "certifications": "section header metaphor",
    "summary": "section header metaphor",
    "projects": "section header metaphor"
  },
  "special_ui_elements": "specific branded UI elements to include"
}`,
      3000,
      0.5,
    );

    // Run Steps 1 & 2 in parallel
    let extractedResume: string;
    let brandAnalysis: string;
    try {
      [extractedResume, brandAnalysis] = await Promise.all([extractPromise, brandPromise]);
    } catch (err: any) {
      if (err.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again in a moment.", "RATE_LIMITED", 429);
      }
      if (err.status === 402) {
        return errorResponse("AI credits exhausted. Please try again later.", "CREDITS_EXHAUSTED", 402);
      }
      console.error("[generate-resume] Steps 1-2 failed:", err);
      return errorResponse("AI generation failed. Please try again.", "AI_ERROR", 502);
    }

    console.log("[generate-resume] Steps 1-2 complete. Extracted resume:", extractedResume.length, "chars. Brand:", brandAnalysis.length, "chars");

    // =========================================================
    // STEP 3: Transform Resume Content (uses both outputs + JD)
    // =========================================================
    console.log("[generate-resume] Step 3: Transforming resume content...");

    let transformedContent: string;
    try {
      transformedContent = await callAI(
        LOVABLE_API_KEY,
        PRO_MODEL,
        `You are a professional resume writer and brand strategist. Your job is to rewrite and optimize resume content to align with a specific job description and company brand. You must:
1. Transform section headers using the brand metaphors
2. Rewrite the professional summary to match the company's content tone and voice
3. Add bold lead-ins to experience bullets using the JD's terminology
4. Emphasize experience and skills that match the job description
5. Create a compelling "Why [Company]?" section derived from the JD + resume context
6. Maintain ALL factual information — do NOT fabricate any experience, skills, or credentials
7. Copy the candidate's name, email, phone, and location VERBATIM from the resume — never modify them`,
        `Transform this resume content for ${companyName}.

EXTRACTED RESUME DATA:
${extractedResume}

COMPANY BRAND ANALYSIS:
${brandAnalysis}

JOB DESCRIPTION:
${jobDescription}

Output the fully transformed resume content as structured text with clear section headings. Use the brand metaphors for section headers. Keep all facts accurate.`,
        6000,
        0.6,
      );
    } catch (err: any) {
      if (err.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again in a moment.", "RATE_LIMITED", 429);
      }
      if (err.status === 402) {
        return errorResponse("AI credits exhausted. Please try again later.", "CREDITS_EXHAUSTED", 402);
      }
      console.error("[generate-resume] Step 3 failed:", err);
      return errorResponse("AI generation failed during content transformation. Please try again.", "AI_ERROR", 502);
    }

    console.log("[generate-resume] Step 3 complete. Transformed:", transformedContent.length, "chars");

    // =========================================================
    // STEP 4: Generate Themed HTML Resume
    // =========================================================
    console.log("[generate-resume] Step 4: Generating themed HTML...");

    const htmlSystemPrompt = `You are an AI Web Developer specializing in premium, production-quality HTML resumes. Your task is to generate a single, self-contained HTML document.

CRITICAL VISUAL REQUIREMENTS:
- Aesthetics are CRUCIAL. The resume must look AMAZING — premium, state-of-the-art design.
- The user should be WOWED at first glance. Use best practices in modern web design.
- Avoid generic colors. Use the EXACT brand colors from the brand analysis.
- Use modern typography from Google Fonts as specified in the brand analysis.
- Use smooth gradients, subtle micro-animations, hover effects.
- Define a clear visual "vibe" that matches the company's actual product aesthetic.
- Pay extra attention to readability and contrast.

LAYOUT:
- Sticky header with candidate name (left) and 3 theme toggle buttons (right)
- Hero section: name, title, contact — styled like the company's hero section
- 2-column grid on desktop (experience left, skills/education right), single column on mobile
- Max-width container (max-w-5xl)
- Subtle entrance animations (fade-in, slide-up) on page load
- Hover effects on skill tags and experience cards
- Custom styled scrollbar matching the theme

3-THEME TOGGLE (MANDATORY):
1. [COMPANY_NAME] Theme (Default) — Company's exact brand colors, fonts, personality. The resume should feel like an easter egg from their design team.
2. LIGHT Theme — Professional, clean white background. Blue accents. ATS-friendly. Segoe UI / Inter font.
3. DARK Theme — Sleek dark mode (#121212 bg). Teal/cyan accents (#64FFDA). Inter font.

Toggle must:
- Use pill-shaped button group in top-right corner
- Apply smooth CSS transitions (0.4s ease) on all theme properties
- Use CSS classes on <body> (theme-default, theme-light, theme-dark)

CONTENT SECTIONS (ALL REQUIRED):
1. Hero/Header — Name (huge, bold), title, location, contact
2. Professional Summary — In the company's voice
3. Experience — Each role as a card with company, title, dates, bullet points with bold lead-ins
4. Skills/Expertise — Grouped into categories with pill/tag styling
5. Education — Clean, minimal
6. Why [Company]? — Italic quote or highlighted block
7. Footer — Subtle branding line in company's voice

TECHNICAL REQUIREMENTS:
- Single self-contained HTML file
- Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Google Fonts via <link> in <head>
- Extend Tailwind config in a <script> block for custom fonts and colors
- All theme switching in vanilla JavaScript
- Print-friendly (@media print — hide nav, remove shadows, white bg, A4 layout, page-break-inside: avoid)
- Semantic HTML5 structure
- Custom scrollbar styling
- Output ONLY raw HTML — no markdown fences, no explanation`;

    const htmlUserPrompt = `Generate a company-branded HTML resume for ${companyName}.

TRANSFORMED RESUME CONTENT:
${transformedContent}

COMPANY BRAND ANALYSIS:
${brandAnalysis}

ORIGINAL EXTRACTED RESUME (use for verbatim name/contact):
${extractedResume}

IMPORTANT: Use the candidate's name, email, phone, and location EXACTLY as they appear in the extracted resume. Do not modify them.

Output the complete HTML file now.`;

    let html: string;
    try {
      html = await callAI(
        LOVABLE_API_KEY,
        PRO_MODEL,
        htmlSystemPrompt,
        htmlUserPrompt,
        16000,
        0.7,
      );
    } catch (err: any) {
      if (err.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again in a moment.", "RATE_LIMITED", 429);
      }
      if (err.status === 402) {
        return errorResponse("AI credits exhausted. Please try again later.", "CREDITS_EXHAUSTED", 402);
      }
      console.error("[generate-resume] Step 4 failed:", err);
      return errorResponse("AI generation failed during HTML creation. Please try again.", "AI_ERROR", 502);
    }

    // Strip markdown code fences if present
    html = html
      .replace(/^```html?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    if (!html || html.length < 500) {
      return errorResponse("AI returned an incomplete response. Please try again.", "EMPTY_RESPONSE", 502);
    }

    console.log(`[generate-resume] Successfully generated HTML (${html.length} chars) via 4-step pipeline`);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Generate resume error:", err);
    return errorResponse("An unexpected error occurred. Please try again.", "INTERNAL_ERROR", 500);
  }
});
