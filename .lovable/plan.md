## Route Resume Brandifier to Opal (new tab)

### Change
On the `/experiments` page, the **Resume Brandifier** card will open `https://opal.google/app/1oETbkY7XfWfZ4TWt-riq6z6mRzx4OjAj` in a new browser tab — same mechanism already used for the Open Mind card.

### Files changed

**1. `src/pages/Experiments.tsx`**
- Update the `resume-brandifier` product entry:
  - Add `externalUrl: "https://opal.google/app/1oETbkY7XfWfZ4TWt-riq6z6mRzx4OjAj"`
  - Set `requiresLogin: false` (Opal handles its own auth)
  - Optionally update `price` to `"FREE"` since the in-app paywall no longer applies on this card
- The existing render logic already wraps any product with `externalUrl` in an `<a target="_blank" rel="noopener noreferrer">`, so no rendering changes needed.

**2. `src/App.tsx`** — leave untouched
- The `/experiments/resume-brandifier` route stays in place so the in-app version remains reachable via direct URL (and the admin pages keep working). It's just unlinked from the Experiments grid.

### Not changed
- `src/pages/ResumeForge.tsx`, `supabase/functions/generate-resume/index.ts`, the admin page, and the database remain untouched. Nothing is deleted — only the card's destination changes.

### Notes
- Browsers cannot open a tab in the background without focus; the new Opal tab will become the active tab. True "background" opening is not possible cross-browser.
- If you later want to fully retire the in-app version, say the word and I'll remove the route, the page, and the edge function in a follow-up.
