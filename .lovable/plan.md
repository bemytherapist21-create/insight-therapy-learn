
# Fix Plan: Supabase Project ID Mismatch

## Problem Identified

The Insight Fusion voice input and research generation are failing because of a **Supabase project mismatch**:

| Component | Project ID |
|-----------|------------|
| Lovable Cloud (correct) | `sudlkozsotxdzvjpxubu` |
| vite.config.ts proxy | `sudlkozsotxdzvjpxubu` (correct) |
| vercel.json rewrites | `sudlkozsotxdzvjpxubu` (correct) |
| Edge Functions deployed to | `sudlkozsotxdzvjpxubu` (correct) |
| `.env` VITE_SUPABASE_PUBLISHABLE_KEY | Points to wrong project |

The frontend sends the `apikey` header from the environment variable, but this key belongs to a **different Supabase project** than where the edge functions are deployed. This causes authentication failures.

## Root Cause

In a previous edit or configuration, the `.env` file may have been set to use a different Supabase project's credentials while the actual Lovable Cloud project is `sudlkozsotxdzvjpxubu`.

## Solution

### Step 1: Use Correct API Key in Frontend Services

Update the frontend code to use the **correct Lovable Cloud publishable key** directly, since the `.env` file cannot be manually edited (it's auto-managed by Lovable Cloud).

**Files to update:**

1. **`src/pages/InsightFusion.tsx`** - Line 64
   - Change from using `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`
   - Use direct call via `supabase.functions.invoke()` which automatically uses the correct project credentials

2. **`src/services/researchService.ts`** - Line 22
   - Same fix: switch to `supabase.functions.invoke()` instead of manual fetch

### Step 2: Remove Custom Proxy Routes

Since `supabase.functions.invoke()` handles routing correctly with the auto-configured Supabase client, we can remove the custom proxy setup:

1. **`vite.config.ts`** - Remove the `/api` proxy configuration
2. **`vercel.json`** - Remove the custom rewrites for edge functions

### Step 3: Revert to Standard Supabase Client Invocation

The Supabase client at `src/integrations/supabase/client.ts` is **auto-generated** and always has the correct Lovable Cloud credentials. Using `supabase.functions.invoke()` ensures the right project is targeted.

---

## Technical Details

### Changes to `src/pages/InsightFusion.tsx`

Replace the manual fetch call with:

```typescript
const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  // Convert blob to base64
  const base64Audio: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Failed to read audio"));
    reader.readAsDataURL(audioBlob);
  });

  // Use supabase.functions.invoke which has correct credentials
  const { data, error } = await supabase.functions.invoke("transcribe-audio", {
    body: { audio: base64Audio, mimeType: audioBlob.type },
  });

  if (error) throw new Error(error.message || "Transcription failed");
  return data?.transcript || "";
};
```

### Changes to `src/services/researchService.ts`

Replace manual fetch with:

```typescript
async generateInsight(query: string): Promise<ResearchResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "perplexity-research",
      { body: { query } }
    );

    if (error) {
      if (error.message?.includes("Authentication required")) {
        throw new Error("AUTH_REQUIRED");
      }
      throw new Error(error.message || "Research failed");
    }

    return {
      content: data?.content || "No insight generated.",
      citations: data?.citations || [],
    };
  } catch (error) {
    logger.error("Failed to generate insight", error);
    return null;
  }
}
```

### Changes to `vite.config.ts`

Remove the proxy configuration (lines 11-16):

```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Remove proxy - not needed with supabase.functions.invoke
  },
  // ... rest unchanged
}));
```

### Changes to `vercel.json`

Remove the edge function rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  // headers section remains unchanged
}
```

---

## Summary

| File | Change |
|------|--------|
| `src/pages/InsightFusion.tsx` | Replace manual fetch with `supabase.functions.invoke()` |
| `src/services/researchService.ts` | Replace manual fetch with `supabase.functions.invoke()` |
| `vite.config.ts` | Remove `/api` proxy configuration |
| `vercel.json` | Remove edge function rewrite rules |

This ensures all requests use the auto-configured Lovable Cloud credentials, eliminating the project mismatch.
