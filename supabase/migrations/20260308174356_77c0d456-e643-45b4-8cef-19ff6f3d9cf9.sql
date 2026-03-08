CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
  plan text NOT NULL DEFAULT 'premium',
  razorpay_payment_id text,
  razorpay_order_id text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT USING (user_id = (auth.uid())::text);