

## Problem

Resume Brandifier's edge function (`generate-resume`) has **two issues**:

1. **Wrong Gemini model name** — It calls `gemini-2.5-flash-preview-05-20` which is outdated/invalid. The `GOOGLE_AI_API_KEY` secret exists, so this path runs first and fails.

2. **Wrong fallback URL** — The Lovable AI fallback uses the old `https://api.lovable.dev/v1/chat/completions` instead of the correct `https://ai.gateway.lovable.dev/v1/chat/completions` (which therapy-chat, analyze-emotion, and transcribe-audio all use successfully).

3. **Missing config.toml entry** — `generate-resume` is not listed in `supabase/config.toml`, so JWT verification may block requests.

## Plan

### 1. Rewrite `generate-resume` edge function to use Lovable AI Gateway

- Remove the direct Google Gemini API path entirely — no need for a separate `GOOGLE_AI_API_KEY` code path
- Use `LOVABLE_API_KEY` with `https://ai.gateway.lovable.dev/v1/chat/completions` (same pattern as therapy-chat and other working functions)
- Use model `google/gemini-2.5-flash` (appropriate for large HTML generation)
- Handle 429/402 rate limit errors properly

### 2. Add `generate-resume` to `supabase/config.toml`

```toml
[functions.generate-resume]
verify_jwt = false
```

### Technical Details

The fix mirrors exactly how `therapy-chat/index.ts` calls the AI gateway:
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [...],
    max_tokens: 16000,
    temperature: 0.7,
  }),
});
```

No new API keys needed — `LOVABLE_API_KEY` is already configured.

