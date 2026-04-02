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

    const htmlSystemPrompt = `You are an elite HTML resume designer. Generate a single, self-contained HTML file that follows the EXACT architecture below. Do NOT deviate from this structure.

MANDATORY CSS/HTML ARCHITECTURE (follow precisely):

1. HEAD SETUP:
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=BRAND_FONT:wght@300;400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script>
tailwind.config = {
  theme: { extend: {
    colors: { brand: { primary: 'var(--color-primary)', accent: 'var(--color-accent)' }},
    fontFamily: { sans: ['BRAND_FONT','sans-serif'], display: ['Inter','sans-serif'] },
    animation: { 'fade-in-up': 'fadeInUp 0.6s ease-out forwards' },
    keyframes: { fadeInUp: { '0%': { opacity:'0', transform:'translateY(20px)' }, '100%': { opacity:'1', transform:'translateY(0)' }}}
  }}
}
</script>

2. CSS THEME SYSTEM (CRITICAL — use CSS custom properties for ALL colors):
<style>
::-webkit-scrollbar { width: 10px; }
.theme-default::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 5px; }
.theme-light::-webkit-scrollbar-thumb { background: #ccc; border-radius: 5px; }
.theme-dark::-webkit-scrollbar-thumb { background: #444; border-radius: 5px; }

body { transition: background-color 0.4s ease, color 0.4s ease; }
.transition-all-custom { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

@media print {
  .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
  .section-card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
  header { position: static !important; }
}

.glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }

/* COMPANY THEME — use brand analysis colors */
.theme-default { background-color: BG_COLOR; color: TEXT_COLOR; }
.theme-default .accent-text { color: PRIMARY_COLOR; }
.theme-default .accent-bg { background-color: PRIMARY_COLOR; }
.theme-default .header-bg { background: rgba(BG_RGB, 0.95); backdrop-filter: blur(8px); color: HEADER_TEXT; }

/* LIGHT THEME — fixed professional */
.theme-light { background-color: #FAFAFA; color: #1a1a1a; }
.theme-light .accent-text { color: #2563eb; }
.theme-light .accent-bg { background-color: #2563eb; }
.theme-light .header-bg { background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid #e5e7eb; color: #111; }

/* DARK THEME — fixed sleek */
.theme-dark { background-color: #0F172A; color: #F8FAFC; }
.theme-dark .accent-text { color: #38BDF8; }
.theme-dark .accent-bg { background-color: #38BDF8; }
.theme-dark .header-bg { background: rgba(15,23,42,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid #1E293B; color: white; }
</style>

3. BODY STRUCTURE (follow this exact layout):
<body class="theme-default font-sans leading-relaxed">

  <!-- STICKY HEADER -->
  <header class="header-bg sticky top-0 z-50 py-4 px-6 lg:px-12 shadow-md no-print">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <h1 class="text-xl font-extrabold tracking-tighter uppercase font-display">CANDIDATE_NAME</h1>
      <nav class="flex gap-2">
        <button onclick="setTheme('default')" class="px-3 py-1.5 text-xs font-bold rounded-full border accent-bg uppercase tracking-widest">COMPANY</button>
        <button onclick="setTheme('light')" class="px-3 py-1.5 text-xs font-bold rounded-full border border-gray-300 bg-white text-black uppercase tracking-widest">Light</button>
        <button onclick="setTheme('dark')" class="px-3 py-1.5 text-xs font-bold rounded-full border border-gray-700 bg-gray-900 text-white uppercase tracking-widest">Dark</button>
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-24 space-y-20">

    <!-- HERO — gradient bg with brand colors at low opacity -->
    <section class="rounded-3xl p-8 md:p-16 text-center space-y-6 animate-fade-in-up" style="background: linear-gradient(135deg, rgba(PRIMARY_RGB,0.1), rgba(ACCENT_RGB,0.05));">
      <p class="accent-text font-bold tracking-[0.2em] uppercase text-sm">TITLE_TAGLINE</p>
      <h2 class="text-4xl md:text-7xl font-extrabold font-display">CANDIDATE_NAME</h2>
      <div class="flex flex-wrap justify-center gap-4 text-sm opacity-80">
        <span>📍 LOCATION</span><span class="opacity-30">|</span><span>📧 EMAIL</span><span class="opacity-30">|</span><span>📞 PHONE</span>
      </div>
      <div class="max-w-3xl mx-auto text-lg italic opacity-90">SUMMARY_QUOTE</div>
    </section>

    <!-- 3-COLUMN GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">

      <!-- LEFT SIDEBAR (col-span-1): Summary, Skills grouped by category, Technical tags -->
      <div class="lg:col-span-1 space-y-12">
        <!-- Each section: -->
        <section class="animate-fade-in-up" style="animation-delay: 0.Ns;">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
            <span class="h-8 w-1 accent-bg"></span> SECTION_TITLE
          </h2>
          <!-- Skills as grouped categories with accent-text headers -->
          <!-- Tech tags as: <span class="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-md text-xs font-semibold">SKILL</span> -->
        </section>
      </div>

      <!-- RIGHT CONTENT (col-span-2): Experience, Education, Certs -->
      <div class="lg:col-span-2 space-y-16">

        <!-- EXPERIENCE — Timeline layout (CRITICAL) -->
        <section class="animate-fade-in-up" style="animation-delay: 0.4s;">
          <h2 class="text-3xl font-bold mb-8 flex items-center gap-4">
            <span class="h-10 w-1 accent-bg"></span> Experience
          </h2>
          <div class="space-y-12">
            <!-- Each role: -->
            <article class="relative pl-8 border-l-2 border-gray-100 dark:border-gray-800 transition-all-custom hover:border-brand-primary">
              <div class="absolute -left-[9px] top-0 h-4 w-4 rounded-full accent-bg"></div>
              <div class="flex flex-col md:flex-row md:justify-between mb-4">
                <div>
                  <h3 class="text-xl font-extrabold">ROLE_TITLE</h3>
                  <h4 class="text-lg font-semibold accent-text">COMPANY_NAME</h4>
                </div>
                <span class="text-sm font-bold opacity-60 uppercase tracking-widest">DATES</span>
              </div>
              <ul class="space-y-3 opacity-80 list-disc ml-5">
                <li><strong>Bold lead-in:</strong> achievement detail with metrics.</li>
              </ul>
            </article>
          </div>
        </section>

        <!-- EDUCATION — hover cards -->
        <section class="animate-fade-in-up" style="animation-delay: 0.5s;">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all-custom hover:shadow-xl hover:-translate-y-1 bg-white/50 dark:bg-gray-900/20">
              <div class="text-xs font-bold accent-text">YEAR</div>
              <h3 class="text-lg font-bold">DEGREE</h3>
              <p class="text-sm font-semibold">FIELD</p>
              <p class="text-xs opacity-60">INSTITUTION</p>
            </div>
          </div>
        </section>

        <!-- WHY COMPANY — highlighted block -->
        <section class="p-6 rounded-xl border-l-4 accent-bg bg-gray-50 dark:bg-gray-900/50 italic opacity-90">
          WHY_COMPANY_TEXT
        </section>

      </div>
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="text-center py-8 text-sm opacity-50 no-print">
    Crafted for COMPANY_NAME • YEAR
  </footer>

  <script>
    function setTheme(theme) {
      const body = document.getElementById('body-root');
      body.className = body.className.replace(/theme-\\S+/g, '');
      body.classList.add('theme-' + theme);
      localStorage.setItem('user-theme', theme);
    }
    window.addEventListener('DOMContentLoaded', () => {
      setTheme(localStorage.getItem('user-theme') || 'default');
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100');
          entry.target.classList.remove('opacity-0');
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-fade-in-up').forEach(el => {
      el.classList.add('opacity-0', 'transition-all', 'duration-700');
      el.style.transform = 'translateY(20px)';
      observer.observe(el);
    });
  </script>
</body>

RULES:
- Use CSS custom properties for ALL theme-dependent colors. NEVER hardcode colors on individual elements.
- Use .accent-text and .accent-bg utility classes everywhere. No inline color styles.
- Experience MUST use the border-l-2 timeline with absolute-positioned dots.
- Education cards MUST have hover:shadow-xl hover:-translate-y-1.
- Skill tags MUST use rounded-md px-3 py-1 text-xs font-semibold pattern.
- Section headers MUST use the <span class="h-8 w-1 accent-bg"></span> bar pattern.
- Stagger animation-delay values (0.1s, 0.2s, 0.3s...) on sections.
- Output ONLY raw HTML. No markdown fences. No explanation.
- The HTML must be complete and self-contained (400+ lines expected).`;

    const htmlUserPrompt = `Generate a company-branded HTML resume for ${companyName}.

TRANSFORMED RESUME CONTENT:
${transformedContent}

COMPANY BRAND ANALYSIS:
${brandAnalysis}

ORIGINAL EXTRACTED RESUME (use for verbatim name/contact):
${extractedResume}

IMPORTANT: Use the candidate's name, email, phone, and location EXACTLY as they appear in the extracted resume. Do not modify them. Replace all placeholder values (PRIMARY_COLOR, BG_COLOR, BRAND_FONT, etc.) with actual values from the brand analysis.

Output the complete HTML file now.`;

    let html: string;
    try {
      html = await callAI(
        LOVABLE_API_KEY,
        PRO_MODEL,
        htmlSystemPrompt,
        htmlUserPrompt,
        24000,
        0.4,
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
