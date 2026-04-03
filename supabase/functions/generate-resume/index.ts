import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

<<<<<<< Updated upstream
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
=======
// Helper function to call Gemini 2.5 Flash API
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  requireJson: boolean = false,
  maxTokens: number = 8192
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  };

  if (requireJson) {
    body.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Gemini API Error: ${errText}`);
    throw new Error(`Gemini API failed [${response.status}]: ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (requireJson) {
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fallback: strip markdown json blocks if Gemini ignores responseMimeType
      const cleanText = text
        .replace(/^```json\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
      return JSON.parse(cleanText);
    }
  }

  return text;
>>>>>>> Stashed changes
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
<<<<<<< Updated upstream
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse("Service temporarily unavailable", "CONFIG_ERROR", 500);
=======
    const GOOGLE_API_KEY =
      Deno.env.get("GOOGLE_AI_API_KEY") || Deno.env.get("GEMINI_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not configured in Supabase secrets");
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
    console.log(`[generate-resume] Starting 4-Step Pipeline for: ${companyName}`);

    // =========================================================================
    // STEP 1: Extract Resume Content
    // =========================================================================
    console.log("[generate-resume] Step 1: Extracting Resume JSON...");
    const step1System = `Objective: Extract key information from the provided resume file. This includes the candidate's name, contact details such as email, phone number, and location, as well as their work experience, education, skills, and any other relevant sections found in the text.

Output Format: Provide a structured JSON representation of the extracted resume content. Use clear keys for each section (e.g., name, contact, experience, education, skills, certifications, projects) to ensure the data is organized for further processing. Return plain JSON only.

CRITICAL INSTRUCTION: Ensure you extract the candidate's name, email, and location verbatim. Do not infer or substitute elements.`;
    
    const step1User = `User Input / Context: \n${resumeText}`;
    
    const parsedResumeJson = await callGemini(GOOGLE_API_KEY, step1System, step1User, true);


    // =========================================================================
    // STEP 2: Analyze Company Brand
    // =========================================================================
    console.log("[generate-resume] Step 2: Analyzing Brand Identity...");
    const step2System = `Objective: 
Research and analyze the brand identity of the company provided in the input. Use your knowledge to identify the target company's brand colors, typography, UI design inspiration, brand voice, and any relevant metaphors or stylistic elements. Gather this information as if you searched publicly available sources such as the company website, design guidelines, and press kits.

Output Format: 
Return a JSON object containing primary_color, secondary_color, accent_color, background_color, google_font, secondary_font, design_theme, content_tone, ui_inspiration, and metaphors (experience, skills, education, certifications, summary, projects). Return plain JSON only.`;
    
    const step2User = `User Input / Context: \nCompany Name: ${companyName}\nCompany Website: ${companyWebsite || "N/A"}\nJob Description: ${jobDescription}`;
    
    const brandAnalysisJson = await callGemini(GOOGLE_API_KEY, step2System, step2User, true);

>>>>>>> Stashed changes

    // =========================================================================
    // STEP 3: Transform Resume Content
    // =========================================================================
    console.log("[generate-resume] Step 3: Transforming Content to Brand Voice...");
    const step3System = `Objective:
Rewrite and optimize the provided resume content to align with a specific job description and company brand analysis. Tailor the keywords, phrasing, and professional highlights to ensure the resume is ATS-friendly and reflects the brand voice of the target company while maintaining a professional tone.

<<<<<<< Updated upstream
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
=======
CRITICAL INSTRUCTION: Copy the candidate's "name" field verbatim from the input resume JSON into the output JSON without any rewording.

Output Format:
A cohesive, rewritten version of the resume content organized by standard resume sections (name, contact, experience, skills, education, etc) in a JSON object. Verify that all key requirements from the job description are addressed and the brand alignment is evident. Include a "why_company" string field demonstrating cultural fit. Return plain JSON only.`;

    const step3User = `User Input / Context:
Job Description: ${jobDescription}
Company Brand Analysis: ${JSON.stringify(brandAnalysisJson)}
Extracted Resume Content: ${JSON.stringify(parsedResumeJson)}`;
    
    const transformedResumeJson = await callGemini(GOOGLE_API_KEY, step3System, step3User, true);


    // =========================================================================
    // STEP 4: Generate Themed HTML
    // =========================================================================
    console.log("[generate-resume] Step 4: Generating Final HTML...");
    
    const step4System = `You are an AI Web Developer. Your task is to generate a single, self-contained HTML document for rendering in an iframe, based on user instructions and data.

**Visual aesthetic:**
    * Aesthetics are crucial. Make the page look amazing, especially on mobile.
    * Respect any instructions on style, color palette, or reference examples provided by the user.
    * **CRITICAL: Aim for premium, state-of-the-art designs. Avoid simple minimum viable products.**
    * **Use Rich Aesthetics**: The USER should be wowed at first glance by the design. Use best practices in modern web design (e.g. vibrant colors, dark modes, glassmorphism, and dynamic animations) to create a stunning first impression. Failure to do this is UNACCEPTABLE.
    * **Prioritize Visual Excellence**: Implement designs that will WOW the user and feel extremely premium:
        - Avoid generic colors (plain red, blue, green). Use curated, harmonious color palettes (e.g., HSL tailored colors, sleek dark modes).
        - Using modern typography (e.g., from Google Fonts like Inter, Roboto, or Outfit) instead of browser defaults.
        - Use smooth gradients.
        - Add subtle micro-animations for enhanced user experience.
    * **Use a Dynamic Design**: An interface that feels responsive and alive encourages interaction. Achieve this with hover effects and interactive elements. Micro-animations, in particular, are highly effective for improving user engagement.
    * **Thematic Specificity**: Do not just create a generic layout. Define a clear "vibe" or theme based on the content. Use specific aesthetic keywords (e.g., "Glassmorphism", "Neobrutalism", "Minimalist", "Comic Book Style") to guide the design.
    * **Typography Hierarchy**: Explicitly import and use font pairings. Use a distinct Display Font for headers and a highly readable Body Font for text.
    * **Readability**: Pay extra attention to readability. Ensure the text is always readable with sufficient contrast against the background. Choose fonts and colors that enhance legibility.

**Design and Functionality:**
    * **Component-Based Design**: Do not just dump text into blocks. Semanticize the content into distinct UI components.
    * **Layout Dynamics**: Break the grid. Avoid strict, identical grid columns. Use asymmetrical layouts, Bento grids, or responsive flexbox layouts where some elements span full width to create visual interest and emphasize key content.
    * **Tailwind Configuration**: Extend the Tailwind configuration within a \`<script>\` block to define custom font families and color palettes that match the theme.
    * Thoroughly analyze the user's instructions to determine the desired type of webpage, application, or visualization. What are the key features, layouts, or functionality?
    * Analyze any provided data to identify the most compelling layout or visualization of it. For example, if the user requests a visualization, select an appropriate chart type (bar, line, pie, scatter, etc.) to create the most insightful and visually compelling representation. Or if user instructions say \`use a carousel format\`, you should consider how to break the content and any media into different card components to display within the carousel.
    * If requirements are underspecified, make reasonable assumptions to complete the design and functionality. Your goal is to deliver a working product with no placeholder content.
    * Ensure the generated code is valid and functional. Return only the code, and open the HTML codeblock with the literal string "\`\`\`html".
    * The output must be a complete and valid HTML document with no placeholder content for the developer to fill in.

**Libraries:**
  Unless otherwise specified, use:
    * Tailwind for CSS
    * **CRITICAL: Use the Tailwind CDN from \`https://cdn.tailwindcss.com\`. Do NOT use \`tailwind.min.css\` or any other local Tailwind file. Always include Tailwind using: \`<script src="https://cdn.tailwindcss.com"></script>\`**

**Constraints:**
  * **External Links:** You ARE allowed to generate external links (\`<a href="...">\` and \`window.open(...)\`) to external websites (e.g. google.com, wikipedia.org) for user navigation.
  * **NO External Embeds:** Do NOT embed any external resources (e.g. \`<script src="...">\`, \`<img src="...">\`, \`<iframe src="...">\`, \`<link href="...">\`) from external URLs. Content Security Policy (CSP) will block them.
  * **Media Restriction:** ONLY use media URLs that are explicitly passed in the input. Do NOT generate or hallucinate any other media URLs (e.g. from placeholder sites or external CDNs).
  * **Render All Media:** You MUST render ALL media (images, videos, audio) that are passed in. Do NOT skip or omit any provided media items. Every passed-in media URL must appear in the final HTML output.
  * **Navigation Restriction:** Do NOT generate unneeded fake links or buttons to sub-pages (e.g. "About", "Contact", "Learn More") unless explicitly requested. Stick to the plan and the provided content.
  * **Footer Restriction:** **NEVER** generate any footer content, including legal footers like "All rights reserved" or "Copyright 2024". [It is a violation of Google's policies to hallucinate legal footers.]`;

    const step4User = `Generate a comprehensive, production-quality HTML file for a themed resume, incorporating dynamic styling based on company brand analysis, responsive design, and theme toggling.

**Layout Organization**:
1.  **Overall Structure**: The webpage will consist of a full-width, sticky \`header\` element at the top, followed by a \`main\` content area.
2.  **Header Layout**: The \`header\` will contain two primary sections:
    *   The candidate's \`name\` (from \`extract_resume_content\`), prominently displayed, positioned to the left.
    *   A group of three \`button\` elements positioned to the right, serving as theme toggles: '[company_name] Theme' (default), 'LIGHT Theme', and 'DARK Theme'.
    *   The header must remain fixed at the top of the viewport (\`sticky\`).
3.  **Main Content Area**: This area will house all resume content, structured for readability and scannability.
    *   **Hero Section**: The very top of the \`main\` content will feature a visually impactful hero section. This section will display the candidate's \`name\`, \`email\`, and \`location\` (all verbatim from \`extract_resume_content\`) in a clear, accessible, and prominent manner, serving as an immediate introduction.
    *   **Resume Sections**: The \`transformed_resume_content\` will be organized into distinct, semantic \`<section>\` elements (e.g., "Summary," "Experience," "Education," "Skills," "Projects").
        *   Each section will have a clear \`<h2>\` heading.
        *   Individual experience entries and educational achievements will be presented as separate blocks or card-like structures, detailing titles, organizations, dates, and key achievements or descriptions.
        *   Skills can be categorized and displayed as a list or a series of styled tags/badges.
    *   **Content Flow**: On mobile, use a clean, stacked, single-column layout. On larger screens, the \`main\` content should transition to a wider, single-column layout with generous side padding, or a two-column structure if appropriate for specific sections, to maximize readability and visual appeal.

**Style Design Language**:
1.  **Visual Design Approach**: "Adaptive Professionalism with Brand Integration."
    *   **Default ([company_name] Theme)**: This theme will embody a "Modern & Stylish" and "Expressive" aesthetic. It will leverage the \`company_brand_analysis\` to create a unique, branded look with a "Wow Factor."
    *   **LIGHT Theme**: This theme will be "Minimalist & Professional," prioritizing extreme readability and high contrast for ATS-friendliness.
    *   **DARK Theme**: This theme will offer a "Modern & Professional" dark mode experience with comfortable contrast.
2.  **Color Scheme**:
    *   **Default ([company_name] Theme)**: Dynamically apply primary, secondary, and accent colors, along with corresponding text and background colors, directly from the \`analyze_company_brand\` input.
    *   **LIGHT Theme**: Predominantly use a very light background (e.g., white or off-white) with dark grey or black text. A single, subtle accent color, potentially derived from the company brand analysis or a neutral professional tone, will be used sparingly for highlights or links.
    *   **DARK Theme**: Feature a deep, rich dark background (e.g., charcoal, dark navy) with light, highly contrasting text. Company accent colors should be used judiciously for interactive elements or key highlights.
3.  **Typography Style**:
    *   **Default ([company_name] Theme)**: Headings will use the primary Google Font identified in \`analyze_company_brand\` to establish brand identity. Body text will use a highly readable, complementary sans-serif Google Font (from brand analysis if available, otherwise a common professional sans-serif like Lato or Roboto).
    *   **LIGHT Theme**: A clean, universally readable sans-serif font (e.g., Lato, Roboto, Open Sans) for all text, prioritizing clarity and legibility for ATS compatibility.
    *   **DARK Theme**: Typography consistent with the default theme, ensuring optimal legibility against dark backgrounds.
    *   All fonts must be loaded from Google Fonts (as specified in \`company_brand_analysis\`) and be scalable for responsiveness.
4.  **Spacing and Layout Principles**: Employ generous whitespace throughout the design to enhance readability, provide visual breathing room, and convey a premium feel. Maintain consistent padding and margins across all sections and components. Content should be well-organized, with a clear visual hierarchy that guides the reader's eye.
5.  **Aesthetic Goal**: "Adaptive Professionalism with Brand Integration." The resume should appear custom-tailored, contemporary, and trustworthy, reflecting the candidate's professionalism while seamlessly adapting to various viewing preferences and aligning with the target company's brand.

**Component Guidelines**:
1.  **Sticky Header**: A \`nav\` element containing the candidate's name (e.g., \`<h1>\`) and three distinct \`button\` elements for theme switching. Smooth CSS \`transition\` properties must be applied to relevant elements for seamless theme changes.
2.  **Hero Section**: A dedicated \`section\` element, visually distinct, prominently displaying \`name\`, \`email\`, and \`location\` using appropriate semantic tags (e.g., \`<h1>\`, \`<p>\`).
3.  **Resume Content Sections**: Each major resume category will be a semantic \`section\` with an \`<h2>\` heading.
    *   **Experience/Education Entries**: Structure these as \`article\` or \`div\` elements, using \`<h3>\` for titles/degrees, \`<h4>\` for companies/institutions, \`<span>\` for dates/locations, and \`<ul>\` with \`<li>\` for bulleted achievements.
    *   **Skills**: Display as a \`div\` or \`ul\`, with individual skills styled as tags or badges.
4.  **Theming**: Implement theme switching by applying different CSS classes (or updating CSS variables) to the \`<body>\` element or a primary wrapper \`div\`. Ensure smooth transitions (\`transition: all 0.3s ease-in-out;\`) on properties like \`background-color\`, \`color\`, and \`border-color\`.
5.  **Responsiveness**: Utilize Tailwind CSS's mobile-first approach and utility classes to ensure the layout, typography, and spacing adapt gracefully across all screen sizes, from mobile to desktop.
6.  **Print Styles**: Include a \`@media print\` query in the CSS to:
    *   Force all text to black and backgrounds to white for optimal ink usage and readability.
    *   Remove or hide interactive elements (buttons, sticky header behavior) that are not relevant for print.
    *   Adjust margins, padding, and font sizes for a clean, professional print layout.
    *   Ensure content does not break awkwardly across pages (\`page-break-inside: avoid;\`).
7.  **Custom Scrollbar**: Apply custom CSS styling (e.g., \`::-webkit-scrollbar\`) to the scrollbar to match the aesthetic of the active theme, ensuring a polished user experience.
8.  **Technology Stack**: The HTML file must be self-contained, using Tailwind CSS via a CDN link in the \`<head>\`, Google Fonts via \`<link>\` or \`@import\`, and adhering to Semantic HTML5 principles. JavaScript will be required for theme toggle functionality.

transform_resume_content: ${JSON.stringify(transformedResumeJson, null, 2)}

analyze_company_brand: ${JSON.stringify(brandAnalysisJson, null, 2)}

extract_resume_content: ${JSON.stringify(parsedResumeJson, null, 2)}

company_name: ${companyName}`;

    let html = await callGemini(GOOGLE_API_KEY, step4System, step4User, false, 16000);
>>>>>>> Stashed changes

    // Strip markdown code fences if present
    html = html
      .replace(/^```html?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

<<<<<<< Updated upstream
    if (!html || html.length < 500) {
      return errorResponse("AI returned an incomplete response. Please try again.", "EMPTY_RESPONSE", 502);
    }

    console.log(`[generate-resume] Successfully generated HTML (${html.length} chars) via 4-step pipeline`);
=======
    if (!html) {
      throw new Error("AI returned empty response at Step 4");
    }

    console.log(`[generate-resume] Generation Complete! Return size: ${html.length} chars`);
>>>>>>> Stashed changes

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Generate resume error:", err);
    return errorResponse("An unexpected error occurred. Please try again.", "INTERNAL_ERROR", 500);
  }
});
