
# Fix Plan: "Unable to load app" Error After Google OAuth Login

## Problem

After logging in or registering via Google, the app shows "Unable to load app" with a message about browser privacy settings blocking storage access. This happens because:

1. The OAuth callback redirect is interfering with the app's initialization
2. The authentication session token may not be properly accessible when the app reloads

## Root Cause

The Google OAuth flow redirects back to the app with authentication tokens in the URL. When the app initializes after this redirect, there's a race condition where:
- The app's bootstrap tries to load before Supabase can process the OAuth tokens
- This causes the entire app module to fail loading, triggering the fallback error screen in `main.tsx`

## Solution

Apply the proven fix from the stack overflow solution: Use `skipBrowserRedirect: true` for custom domains to bypass the auth-bridge and handle the OAuth URL manually.

### Technical Changes

**File: `src/components/auth/GoogleLoginButton.tsx`**

Update the Google login handler to:
1. Detect if running on a custom domain (not `*.lovable.app` or `*.lovableproject.com`)
2. If custom domain: use `skipBrowserRedirect: true` and redirect manually
3. If Lovable domain: use normal flow (auth-bridge handles it)

```typescript
const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    // Detect if we're on a custom domain
    const isCustomDomain =
      !window.location.hostname.includes("lovable.app") &&
      !window.location.hostname.includes("lovableproject.com") &&
      !window.location.hostname.includes("localhost");

    if (isCustomDomain) {
      // Bypass auth-bridge for custom domains
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } else {
      // Normal flow for Lovable domains
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    }

    logger.info("Google OAuth initiated successfully");
  } catch (error) {
    logger.error("Google login error", error);
    toast.error("Failed to sign in with Google. Please try again.");
    setLoading(false);
  }
};
```

## Summary

| File | Change |
|------|--------|
| `src/components/auth/GoogleLoginButton.tsx` | Add custom domain detection and use `skipBrowserRedirect: true` to handle OAuth redirect manually |

This fix ensures Google OAuth works correctly on custom domains by bypassing the auth-bridge redirect that was causing the initialization failure.
