import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import { logger } from "@/services/loggingService";

export const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      logger.info("Google OAuth initiated successfully");
    } catch (error) {
      logger.error(
        "Google login error",
        error instanceof Error ? error : new Error("Unknown error"),
      );
      toast.error("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Continue with Google"
      )}
    </Button>
  );
};
