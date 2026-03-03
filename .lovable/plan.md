

# Plan: Switch to BYOK (Bring Your Own Key) Google OAuth

## Overview

This plan will convert your Google sign-in from Lovable's managed OAuth broker to using your own Google OAuth credentials configured directly in Lovable Cloud. This gives you full control over branding and security.

## Prerequisites (Your Action Required)

Before I implement the code changes, you need to ensure your Google OAuth credentials are configured:

1. **In Google Cloud Console** (https://console.cloud.google.com):
   - Create or select an OAuth 2.0 Client ID (Web application type)
   - Add to **Authorized redirect URLs**: `https://sudlkozsotxdzvjpxubu.supabase.co/auth/v1/callback`
   - Note down your **Client ID** and **Client Secret**

2. **In Lovable Cloud Dashboard** (Users → Authentication Settings → Google):
   - Enter your Google Client ID and Client Secret
   - Save the configuration

## Code Changes

### Change 1: Update GoogleLoginButton.tsx

Switch from `@lovable.dev/cloud-auth-js` to direct Supabase auth:

**Current approach:**
```typescript
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
const lovableAuth = createLovableAuth({});
const result = await lovableAuth.signInWithOAuth("google", {...});
```

**New approach:**
```typescript
import { supabase } from "@/integrations/supabase/safeClient";
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### Change 2: Create Auth Callback Handler

Create a new page `/auth/callback` that processes the OAuth response from Supabase:

**File: `src/pages/AuthCallback.tsx`**

This component will:
- Listen for the auth state change after redirect
- Handle errors gracefully
- Redirect user to home page on success

### Change 3: Add Route for Auth Callback

Add the new callback route to `App.tsx`:

```typescript
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
// ...
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Change 4: Clean Up Managed OAuth Artifacts

Remove or disable the managed OAuth components that are no longer needed:

1. **index.html**: Remove the `/~oauth/` redirect script (lines 40-47)
2. **App.tsx**: Remove the `/~oauth/*` route (no longer needed)
3. **OAuthBrokerProxy.tsx**: Can be deleted (optional, won't cause harm if kept)

### Change 5: Update CSP if Needed

The Content-Security-Policy in `index.html` already includes the necessary domains for Supabase auth, so no changes are required here.

## Summary of File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/auth/GoogleLoginButton.tsx` | Modify | Switch to direct Supabase OAuth |
| `src/pages/AuthCallback.tsx` | Create | Handle OAuth callback from Supabase |
| `src/App.tsx` | Modify | Add `/auth/callback` route, remove `/~oauth/*` route |
| `index.html` | Modify | Remove the `/~oauth/` redirect script |
| `src/pages/OAuthBrokerProxy.tsx` | Delete (optional) | No longer needed |

## Technical Details

### How Direct Supabase OAuth Works

```text
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────┐
│   User      │     │   Your App   │     │   Supabase     │     │   Google    │
│   clicks    │────▶│   calls      │────▶│   redirects    │────▶│   consent   │
│   "Google"  │     │   signIn     │     │   to Google    │     │   screen    │
└─────────────┘     └──────────────┘     └────────────────┘     └─────────────┘
                                                                       │
┌─────────────┐     ┌──────────────┐     ┌────────────────┐            │
│   App       │◀────│   /auth/     │◀────│   Supabase     │◀───────────┘
│   home      │     │   callback   │     │   callback     │
└─────────────┘     └──────────────┘     └────────────────┘
```

1. User clicks "Continue with Google"
2. App calls `supabase.auth.signInWithOAuth()` with redirect URL
3. Browser redirects to Supabase → Google consent screen
4. After consent, Google redirects back to Supabase
5. Supabase processes tokens and redirects to your `/auth/callback`
6. Your callback page handles the session and navigates to home

### Error Handling

The new `AuthCallback` component will:
- Check for error parameters in the URL
- Display user-friendly error messages
- Provide a link back to login on failure

## Testing After Implementation

After I implement these changes, you should:

1. **Publish the changes** to production
2. **Clear browser cookies/cache** for the production site
3. **Test the flow**: Login page → Click "Continue with Google" → Google consent → Redirected back and logged in

