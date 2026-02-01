

# Fix Plan: Production 404 Error on Google Sign-in

## Problem Summary

Google sign-in works in the **preview** environment but fails on the **production** site (`insight-therapy-learn.lovable.app`) with a 404 error. The managed OAuth flow from `@lovable.dev/cloud-auth-js` attempts to navigate to `/~oauth/initiate`, but this route isn't being caught correctly on production.

## Root Cause Analysis

The `@lovable.dev/cloud-auth-js` library initiates the OAuth flow by navigating to `/~oauth/initiate?...`. On production:

1. The React Router route (`/~oauth/*` → `OAuthBrokerProxy`) may not load fast enough before the browser shows a 404
2. The Content-Security-Policy (CSP) in `index.html` doesn't include `oauth.lovable.app`, which could block the redirect
3. There may be a timing issue where the SPA hasn't bootstrapped before the navigation occurs

## Solution

### Change 1: Update Content-Security-Policy

Add `https://oauth.lovable.app` to the CSP headers in `index.html` to allow:
- Connections to the OAuth broker (`connect-src`)
- Frames from the OAuth broker if popup mode is used (`frame-src`)

```text
File: index.html

Add to connect-src: https://oauth.lovable.app
Add to frame-src: https://oauth.lovable.app
```

### Change 2: Add Immediate Redirect in HTML for OAuth Routes

To ensure `/~oauth/*` routes are handled even before React loads, add a small inline script in `index.html` that checks if the current path starts with `/~oauth/` and immediately redirects to `oauth.lovable.app`.

```text
File: index.html

Add inline script before React app loads:
- Check if pathname starts with /~oauth/
- If yes, redirect immediately to oauth.lovable.app with same path and query
- This ensures OAuth works even if SPA hasn't loaded yet
```

## Summary of Changes

| File | Change |
|------|--------|
| `index.html` | Add `oauth.lovable.app` to CSP `connect-src` and `frame-src` |
| `index.html` | Add inline redirect script for `/~oauth/` routes before SPA loads |

## Why This Will Work

1. The inline script in `<head>` runs immediately when the page loads, before React bootstraps
2. If the URL matches `/~oauth/*`, it redirects to the OAuth broker before the 404 page can render
3. The CSP update ensures the browser allows the connection/redirect to `oauth.lovable.app`

This is a robust fix that handles both:
- First-time page loads (URL starts with `/~oauth/`)
- SPA navigation (React Router catches `/~oauth/*` routes)

