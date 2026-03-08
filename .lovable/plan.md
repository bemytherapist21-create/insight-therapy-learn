

# Plan: Add Stripe Paywall After 3 Free Interactions

## Overview

Add a usage-tracking system that gives users 3 free interactions per feature (Chat, Voice Therapy, Market Research, Precision Insights), then requires a Stripe subscription to continue.

## Step 1: Enable Stripe

Use the Lovable Stripe integration tool to enable Stripe and set up a subscription product.

## Step 2: Database — Track Usage

Create a `user_usage` table to track interaction counts per feature per user:

```sql
CREATE TABLE public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  feature text NOT NULL,  -- 'chat', 'voice', 'research', 'precision_insights'
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature)
);

ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (user_id = (auth.uid())::text);
CREATE POLICY "Users can insert own usage" ON public.user_usage FOR INSERT WITH CHECK (user_id = (auth.uid())::text);
CREATE POLICY "Users can update own usage" ON public.user_usage FOR UPDATE USING (user_id = (auth.uid())::text);
```

## Step 3: Create Usage Hook

**File: `src/hooks/useUsageGate.ts`**

A reusable hook that:
- Fetches current usage count for a given feature from `user_usage`
- Checks if user has an active Stripe subscription (bypasses limit if subscribed)
- Increments count on each interaction
- Returns `{ canUse: boolean, usageCount: number, showPaywall: boolean, incrementUsage: () => void }`

Free limit: 3 interactions per feature.

## Step 4: Create Paywall Component

**File: `src/components/PaywallModal.tsx`**

A modal dialog that appears when the user exceeds 3 free interactions. Shows:
- "You've used your 3 free sessions"
- Feature benefits
- "Subscribe to Continue" button → triggers Stripe Checkout
- Pricing info

## Step 5: Integrate Paywall into Each Feature

| Feature | File | Where to Gate |
|---------|------|---------------|
| Chat | `src/components/TherapyChat.tsx` | Before sending a message (after 3 messages sent) |
| Voice | `src/components/VoiceTherapy.tsx` | Before starting a recording session |
| Market Research | `src/pages/InsightFusion.tsx` | Before submitting a research query |
| Precision Insights | `src/pages/PrecisionInsights.tsx` | Before file upload/analysis |

Each integration will:
1. Call `useUsageGate('feature_name')`
2. On interaction attempt, check `canUse`
3. If blocked, show `<PaywallModal />`
4. If allowed, call `incrementUsage()` and proceed

## Step 6: Stripe Checkout & Subscription Check

- Create an edge function `check-subscription` that verifies if a user has an active Stripe subscription
- Create an edge function `create-checkout` that creates a Stripe Checkout session for the subscription product
- The `useUsageGate` hook calls `check-subscription` to determine if user is subscribed

## File Summary

| File | Action |
|------|--------|
| Stripe | Enable via tool |
| DB migration | Create `user_usage` table |
| `src/hooks/useUsageGate.ts` | Create — usage tracking + subscription check |
| `src/components/PaywallModal.tsx` | Create — paywall UI |
| `src/components/TherapyChat.tsx` | Modify — add usage gate |
| `src/components/VoiceTherapy.tsx` | Modify — add usage gate |
| `src/pages/InsightFusion.tsx` | Modify — add usage gate |
| `src/pages/PrecisionInsights.tsx` | Modify — add usage gate |
| `supabase/functions/check-subscription/index.ts` | Create |
| `supabase/functions/create-checkout/index.ts` | Create |

