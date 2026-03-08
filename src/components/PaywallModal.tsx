import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/safeClient";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

const FEATURE_LABELS: Record<string, string> = {
  chat: "AI Therapy Chat",
  voice: "Voice Therapy",
  research: "Market Research",
  precision_insights: "Precision Insights",
};

const benefits = [
  { icon: Sparkles, text: "Unlimited AI therapy sessions" },
  { icon: Shield, text: "Priority crisis support" },
  { icon: Zap, text: "Advanced voice & insight features" },
  { icon: Crown, text: "Early access to new tools" },
];

export const PaywallModal = ({ open, onOpenChange, feature }: PaywallModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { userId: user.id, email: user.email },
      });

      if (error) throw error;

      // Load Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Insight Therapy",
        description: "Premium Subscription",
        order_id: data.orderId,
        prefill: {
          email: user.email || "",
        },
        handler: async (response: any) => {
          // Verify payment on server
          const { error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
            },
          });

          if (verifyError) {
            toast.error("Payment verification failed");
          } else {
            toast.success("Subscription activated! Enjoy unlimited access.");
            onOpenChange(false);
            window.location.reload();
          }
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-primary" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            You've used your 3 free {FEATURE_LABELS[feature] || feature} sessions.
            Subscribe to unlock unlimited access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <benefit.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">₹499<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Loading..." : "Subscribe Now"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secured by Razorpay. Supports UPI, cards & wallets.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
