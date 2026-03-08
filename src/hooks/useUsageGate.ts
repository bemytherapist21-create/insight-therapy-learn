import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/safeClient";
import { useAuth } from "@/hooks/useAuth";

const FREE_LIMIT = 3;

export type GatedFeature = "chat" | "voice" | "research" | "precision_insights";

interface UsageGateResult {
  canUse: boolean;
  usageCount: number;
  remaining: number;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  incrementUsage: () => Promise<boolean>;
  loading: boolean;
  isSubscribed: boolean;
}

const WHITELISTED_EMAILS = ["bhupeshpandey62@gmail.com"];

export const useUsageGate = (feature: GatedFeature): UsageGateResult => {
  const { user } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const isWhitelisted = user?.email ? WHITELISTED_EMAILS.includes(user.email) : false;

  // Fetch usage count
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      try {
        // Check subscription status
        const { data: subData } = await supabase.functions.invoke("check-subscription", {
          body: { userId: user.id },
        });
        if (subData?.subscribed) {
          setIsSubscribed(true);
        }

        // Fetch usage count
        const { data, error } = await supabase
          .from("user_usage" as any)
          .select("usage_count")
          .eq("user_id", user.id)
          .eq("feature", feature)
          .maybeSingle();

        if (!error && data) {
          setUsageCount((data as any).usage_count || 0);
        }
      } catch (err) {
        console.warn("Failed to fetch usage:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user, feature]);

  const canUse = isWhitelisted || isSubscribed || usageCount < FREE_LIMIT;
  const remaining = isWhitelisted ? Infinity : Math.max(0, FREE_LIMIT - usageCount);

  const incrementUsage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (isWhitelisted || isSubscribed) return true;

    if (usageCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return false;
    }

    try {
      const newCount = usageCount + 1;

      // Upsert usage
      const { error } = await supabase
        .from("user_usage" as any)
        .upsert(
          {
            user_id: user.id,
            feature,
            usage_count: newCount,
            last_used_at: new Date().toISOString(),
          } as any,
          { onConflict: "user_id,feature" }
        );

      if (error) throw error;

      setUsageCount(newCount);

      if (newCount >= FREE_LIMIT) {
        // Will show paywall on next attempt
      }

      return true;
    } catch (err) {
      console.error("Failed to increment usage:", err);
      return true; // Allow on error to not block user
    }
  }, [user, feature, usageCount, isSubscribed]);

  return {
    canUse,
    usageCount,
    remaining,
    showPaywall,
    setShowPaywall,
    incrementUsage,
    loading,
    isSubscribed,
  };
};
