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

// Helper function to call Gemini 2.5 Flash API directly
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  requireJson: boolean = false,
  maxTokens: number = 8192,
  temperature: number = 0.7
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
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
    } catch (_e) {
      const cleanText = text
        .replace(/^```json\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
      return JSON.parse(cleanText);
    }
  }

  return text;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY =
      Deno.env.get("GOOGLE_AI_API_KEY") || Deno.env.get("GEMINI_API_KEY");

    if (!GOOGLE_API_KEY) {
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

    // =========================================================================
    // STEP 3: Transform Resume Content
    // =========================================================================
    console.log("[generate-resume] Step 3: Transforming Content to Brand Voice...");
    const step3System = `Objective:
Rewrite and optimize the provided resume content to align with a specific job description and company brand analysis. Tailor the keywords, phrasing, and professional highlights to ensure the resume is ATS-friendly and reflects the brand voice of the target company while maintaining a professional tone.

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
    * Analyze any provided data to identify the most compelling layout or visualization of it.
    * If requirements are underspecified, make reasonable assumptions to complete the design and functionality. Your goal is to deliver a working product with no placeholder content.
    * Ensure the generated code is valid and functional. Return only the code, and open the HTML codeblock with the literal string "\`\`\`html".
    * The output must be a complete and valid HTML document with no placeholder content for the developer to fill in.

**Libraries:**
  Unless otherwise specified, use:
    * Tailwind for CSS
    * **CRITICAL: Use the Tailwind CDN from \`https://cdn.tailwindcss.com\`. Do NOT use \`tailwind.min.css\` or any other local Tailwind file. Always include Tailwind using: \`<script src="https://cdn.tailwindcss.com"></script>\`**

**Constraints:**
  * **External Links:** You ARE allowed to generate external links (\`<a href="...">\` and \`window.open(...)\`) to external websites.
  * **NO External Embeds:** Do NOT embed any external resources from external URLs except Tailwind CDN and Google Fonts.
  * **Media Restriction:** ONLY use media URLs that are explicitly passed in the input. Do NOT generate or hallucinate any other media URLs.
  * **Navigation Restriction:** Do NOT generate unneeded fake links or buttons to sub-pages unless explicitly requested.
  * **Footer Restriction:** **NEVER** generate any footer content, including legal footers like "All rights reserved" or "Copyright 2024".`;

    const step4User = `Generate a comprehensive, production-quality HTML file for a themed resume, incorporating dynamic styling based on company brand analysis, responsive design, and theme toggling.

**Layout Organization**:
1.  **Overall Structure**: The webpage will consist of a full-width, sticky \`header\` element at the top, followed by a \`main\` content area.
2.  **Header Layout**: The \`header\` will contain two primary sections:
    *   The candidate's \`name\` (from \`extract_resume_content\`), prominently displayed, positioned to the left.
    *   A group of three \`button\` elements positioned to the right, serving as theme toggles: '[company_name] Theme' (default), 'LIGHT Theme', and 'DARK Theme'.
    *   The header must remain fixed at the top of the viewport (\`sticky\`).
3.  **Main Content Area**: This area will house all resume content, structured for readability and scannability.
    *   **Hero Section**: The very top of the \`main\` content will feature a visually impactful hero section. This section will display the candidate's \`name\`, \`email\`, and \`location\` (all verbatim from \`extract_resume_content\`) in a clear, accessible, and prominent manner.
    *   **Resume Sections**: The \`transformed_resume_content\` will be organized into distinct, semantic \`<section>\` elements.
        *   Each section will have a clear \`<h2>\` heading.
        *   Individual experience entries and educational achievements will be presented as separate blocks or card-like structures.
        *   Skills can be categorized and displayed as a list or a series of styled tags/badges.
    *   **Content Flow**: On mobile, use a clean, stacked, single-column layout. On larger screens, use a wider layout with generous side padding.

**Style Design Language**:
1.  **Visual Design Approach**: "Adaptive Professionalism with Brand Integration."
    *   **Default ([company_name] Theme)**: Embody a "Modern & Stylish" and "Expressive" aesthetic leveraging the brand analysis.
    *   **LIGHT Theme**: "Minimalist & Professional," prioritizing extreme readability and high contrast.
    *   **DARK Theme**: "Modern & Professional" dark mode with comfortable contrast.
2.  **Color Scheme**:
    *   **Default**: Dynamically apply colors from the brand analysis.
    *   **LIGHT Theme**: Very light background with dark text. Subtle accent color.
    *   **DARK Theme**: Deep dark background with light text. Company accent colors used sparingly.
3.  **Typography Style**: Use Google Fonts from the brand analysis. Ensure scalable, readable typography.
4.  **Spacing**: Generous whitespace, consistent padding and margins, clear visual hierarchy.
5.  **Aesthetic Goal**: "Adaptive Professionalism with Brand Integration." Custom-tailored, contemporary, and trustworthy.

**Component Guidelines**:
1.  **Sticky Header**: Nav with candidate name and three theme toggle buttons. Smooth CSS transitions.
2.  **Hero Section**: Prominently display name, email, and location.
3.  **Resume Sections**: Semantic sections with h2 headings. Experience entries as timeline/card structures. Skills as styled tags/badges.
4.  **Theming**: CSS variables or class-based theme switching with smooth transitions.
5.  **Responsiveness**: Mobile-first Tailwind approach.
6.  **Print Styles**: @media print with black text, white background, hidden interactive elements.
7.  **Custom Scrollbar**: Themed scrollbar styling.

transform_resume_content: ${JSON.stringify(transformedResumeJson, null, 2)}

analyze_company_brand: ${JSON.stringify(brandAnalysisJson, null, 2)}

extract_resume_content: ${JSON.stringify(parsedResumeJson, null, 2)}

company_name: ${companyName}`;

    let html = await callGemini(GOOGLE_API_KEY, step4System, step4User, false, 16000, 0.4);

    // Strip markdown code fences if present
    html = html
      .replace(/^```html?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    if (!html || html.length < 500) {
      return errorResponse("AI returned an incomplete response. Please try again.", "EMPTY_RESPONSE", 502);
    }

    console.log(`[generate-resume] Generation Complete! Return size: ${html.length} chars`);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Generate resume error:", err);
    return errorResponse("An unexpected error occurred. Please try again.", "INTERNAL_ERROR", 500);
  }
});
