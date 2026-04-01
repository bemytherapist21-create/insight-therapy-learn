

## Resume Brandifier — Assessment & Improvement Plan

### Current State
The feature works end-to-end: 4-step wizard, Razorpay payment, AI generation via Lovable AI Gateway, HTML preview in iframe, download. It's functional but has several areas where a fresh build would do better.

### What's Good
- Payment flow with Razorpay is solid
- PDF/DOCX/TXT file upload with client-side extraction
- Generation tracking in the database
- The AI prompt is detailed and produces themed resumes

### What Needs Improvement

**1. No textarea for manual resume input**
The upload zone exists, but there's no visible textarea to paste resume text manually. Users who don't have a file ready are stuck.

**2. No loading progress or streaming feedback**
Generation takes 30-60 seconds with just a spinner. A progress indicator or streaming would make it feel much faster.

**3. Preview is basic**
The iframe preview has no controls — no fullscreen, no "open in new tab", no print button. The download only offers HTML.

**4. Edge function has no input validation**
The function accepts any length of resumeText and jobDescription with no limits, which could cause AI token overflows or abuse.

**5. No error specificity on the frontend**
All errors show "Generation failed. Please try again" — no distinction between rate limits, payment issues, or AI failures.

**6. Single-file 639-line component**
Everything lives in one massive file. A fresh project would split this into composable pieces.

**7. No "regenerate" or "edit & retry" flow**
After generation, users can't tweak inputs and regenerate without losing the current result.

**8. The model could be upgraded**
Using `gemini-2.5-flash` — upgrading to `gemini-2.5-pro` would produce higher quality HTML for this use case where quality matters more than speed.

---

### Implementation Plan

#### Step 1: Add manual paste textarea alongside file upload
- Show a textarea below the upload zone with "Or paste your resume text" label
- Both methods populate the same `resumeText` state

#### Step 2: Upgrade AI model and add input validation
- **Edge function**: Switch to `google/gemini-2.5-pro` for better HTML output quality
- Add input length limits: resumeText (50k chars), jobDescription (20k chars), companyName (200 chars)
- Return specific error codes the frontend can act on

#### Step 3: Better error handling on frontend
- Parse error responses from the edge function and show specific toast messages for rate limits (429), payment (402), and validation errors
- Show a "Try Again" button that preserves all inputs

#### Step 4: Enhanced preview controls
- Add "Open in New Tab", "Print", and "Fullscreen" buttons alongside Download
- Add a "Regenerate" button that re-runs generation with current inputs

#### Step 5: Refactor into smaller components
- Extract: `ResumeUploadStep`, `CompanyInfoStep`, `JobDescriptionStep`, `ResumePreview`, `PaymentGate`
- Keep the main page as an orchestrator

#### Step 6: Add progress animation during generation
- Replace the plain spinner with a multi-stage progress indicator ("Analyzing resume...", "Researching company brand...", "Designing layout...", "Generating HTML...")
- Timed stages that advance every ~10 seconds to give visual feedback

### Technical Details

**Edge function changes** (`supabase/functions/generate-resume/index.ts`):
- Model: `google/gemini-2.5-pro`
- Add Zod-style validation for input lengths
- Return structured error objects: `{ error: string, code: string }`

**New component files**:
- `src/components/resume/ResumeUploadStep.tsx`
- `src/components/resume/CompanyInfoStep.tsx`
- `src/components/resume/JobDescriptionStep.tsx`
- `src/components/resume/ResumePreview.tsx`
- `src/components/resume/PaymentGate.tsx`
- `src/components/resume/GenerationProgress.tsx`

**Main page** (`src/pages/ResumeForge.tsx`): Reduced to ~150 lines orchestrating the sub-components.

