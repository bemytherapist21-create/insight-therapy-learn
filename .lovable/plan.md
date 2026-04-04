

## Fix Build Error + Payment Bypass + Use Gemini-Based Pipeline

### Problem
The `generate-resume` edge function has **git merge conflict markers** throughout the file, causing a build error. Additionally, `bhupeshpandey62@gmail.com` still hits the payment wall because `setHasPaid(false)` resets unconditionally after generation.

### Plan

#### File 1: `supabase/functions/generate-resume/index.ts` — Full rewrite (resolve conflicts)
- Remove ALL merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- Keep the **Gemini direct API version** (`callGemini` with `GOOGLE_AI_API_KEY`) — this mirrors how Opal generates resumes using Gemini under the hood
- Keep the Opal-style 4-step pipeline: Extract → Brand Analysis → Transform → Generate HTML
- The Step 4 prompt from the "Stashed changes" version (lines 607-702) is the Opal-style prompt with rich design instructions — keep this
- Keep `callGemini` helper function (lines 56-107)
- Keep the `errorResponse` helper from the "Updated upstream" version (cleaner error handling)
- Remove the `callAI` / Lovable gateway code entirely

#### File 2: `src/pages/ResumeForge.tsx` — Payment bypass fix
- Line 299: Change `setHasPaid(false)` to `if (!isWhitelisted) { setHasPaid(false); }`
- This lets whitelisted users generate unlimited resumes without the payment gate reappearing

### Technical Detail

The resolved edge function will:
- Use `GOOGLE_AI_API_KEY` secret (already configured)
- Call `gemini-2.5-flash-preview-05-20` model directly
- Steps 1-3 return JSON (`responseMimeType: "application/json"`)
- Step 4 returns raw HTML (16,000 max tokens)
- Strip markdown code fences from output
- Include proper CORS headers and input validation

### Files Changed
1. `supabase/functions/generate-resume/index.ts` — Resolve merge conflicts, keep Gemini pipeline
2. `src/pages/ResumeForge.tsx` — 1-line payment bypass fix

