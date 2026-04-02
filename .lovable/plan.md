

## Fix Resume Quality: Embed the Opal HTML as a Few-Shot Template

### Problem
The current Step 4 prompt describes what to build in prose. The AI interprets it loosely and produces inconsistent, mediocre HTML. The uploaded Opal Deloitte resume (423 lines) is the gold standard — it uses a precise CSS variable architecture, proper theme toggling, staggered animations, and clean semantic structure.

### Root Cause
No concrete example. The model needs to **see** the exact CSS/HTML architecture to replicate it consistently.

### Solution
Embed a **condensed version of the Opal HTML** (~120 lines) directly into the Step 4 system prompt as a structural blueprint. The AI fills in the actual content and brand colors but follows the architecture exactly.

### Single file change: `supabase/functions/generate-resume/index.ts`

#### Replace the Step 4 `htmlSystemPrompt` with a template-driven prompt containing:

**1. The exact CSS variable pattern from the Opal resume:**
```css
.theme-default {
  --color-primary: PRIMARY_HEX;
  --color-accent: ACCENT_HEX;
  --color-bg: BG_HEX;
  --color-card-bg: CARD_HEX;
  --color-text: TEXT_HEX;
  --color-text-secondary: SECONDARY_TEXT_HEX;
  --color-border: BORDER_HEX;
  --color-heading: HEADING_HEX;
}
.theme-light { /* fixed professional blue */ }
.theme-dark { /* fixed #121212 + #64FFDA */ }
```

**2. The exact HTML structure skeleton:**
- Sticky header with `bg-brand-card-bg/80 backdrop-blur-sm`
- Hero section with `hero-gradient`, huge name, title, SVG contact icons
- 3-column grid (`lg:grid-cols-3`): experience (col-span-2) + sidebar (col-span-1)
- Experience cards: `bg-brand-card-bg p-6 rounded-lg shadow-md border border-brand-border hover:shadow-xl hover:-translate-y-1`
- Skill tags: `rounded-full` pills with `hover:scale-105 hover:bg-ACCENT hover:text-white`
- Section headers: `border-l-4 border-brand-heading pl-4`
- "Why Company?" section with `border-l-4 border-brand-accent` italic block
- Footer with company tagline

**3. The exact JS pattern:**
- `setTheme()` with `localStorage` persistence
- `classList.toggle('active')` on buttons
- Staggered `animationDelay` on `.animate-on-load` elements

**4. Tailwind config extension block** using `var(--color-*)` references

#### Additional changes:
- Increase `max_tokens` from 16,000 to 24,000 (Opal output is 423 lines)
- Lower `temperature` from 0.7 to 0.4 (more consistent structural output)
- Add explicit instruction: "Use CSS custom properties for ALL theme-dependent colors. NEVER hardcode colors on individual elements."

### What stays the same
Steps 1-3 (extract, brand analysis, content transform) remain unchanged. Only Step 4's prompt and parameters change.

