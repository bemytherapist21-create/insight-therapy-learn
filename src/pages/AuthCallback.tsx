import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/safeClient";
import { Loader2 } from "lucide-react";
import { logger } from "@/services/loggingService";

/**
 * Auth callback page for handling OAuth redirects from Supabase.
 * This page processes the authentication response after Google OAuth.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL params (Supabase sends errors this way)
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");

        if (errorParam) {
          logger.error("OAuth error from provider", new Error(errorDescription || errorParam));
          setError(errorDescription || "Authentication failed. Please try again.");
          return;
        }

        // Check for hash fragment (Supabase sends tokens in hash for implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the session manually if tokens are in the hash
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            logger.error("Failed to set session", sessionError);
            setError("Failed to complete sign in. Please try again.");
            return;
          }
        }

        // Get the current session (might have been set by Supabase automatically)
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

        if (getSessionError) {
          logger.error("Failed to get session", getSessionError);
          setError("Failed to verify sign in. Please try again.");
          return;
        }

        if (session) {
          logger.info("OAuth callback successful, user authenticated");
          // Small delay to ensure session is propagated
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
        } else {
          // No session and no error - might be a stale callback, redirect to login
          logger.warn("OAuth callback with no session");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        logger.error("Unexpected error in auth callback", err instanceof Error ? err : new Error(String(err)));
        setError("An unexpected error occurred. Please try again.");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Sign In Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
