import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/safeClient";
import { ROUTES } from "@/config/constants";
import { logger } from "@/services/loggingService";

const AUTH_REDIRECT_STORAGE_KEY = "auth.redirectTo";
const LAST_THERAPY_ROUTE_KEY = "app.lastTherapyRoute";

function sanitizeRedirectPath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;
  return path;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // Domain Enforcement: If we land on lovable.app, redirect to primary domain immediately
        if (
          window.location.hostname.includes("lovable.app") ||
          window.location.hostname === "theeverythingai.com"
        ) {
          const primaryDomain = "https://www.theeverythingai.com";
          const currentPath =
            window.location.pathname +
            window.location.search +
            window.location.hash;
          window.location.replace(`${primaryDomain}${currentPath}`);
          return;
        }

        const desired =
          sanitizeRedirectPath(searchParams.get("redirect")) ||
          sanitizeRedirectPath(
            localStorage.getItem(AUTH_REDIRECT_STORAGE_KEY),
          ) ||
          sanitizeRedirectPath(localStorage.getItem(LAST_THERAPY_ROUTE_KEY)) ||
          "/"; // Fallback to home on current origin

        // Clear stored redirect to avoid sticky redirects
        try {
          localStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
        } catch {
          // ignore
        }

        // Handle provider error params
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");
        if (errorParam) {
          logger.error(
            "OAuth error from provider",
            new Error(errorDescription || errorParam),
          );
          setError(
            errorDescription || "Authentication failed. Please try again.",
          );
          return;
        }

        // If we came back from OAuth with a code flow, exchange it.
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch {
            // If exchange fails, still continue to route; user can re-login.
          }
        } else {
          // Handle implicit flow tokens in hash fragment
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              logger.error("Failed to set session", sessionError);
              setError("Failed to complete sign in. Please try again.");
              return;
            }
          } else {
            // Trigger session hydration (also handles other flows)
            try {
              await supabase.auth.getSession();
            } catch {
              // ignore
            }
          }
        }

        // Clean fragments like "#access_token=..." so we don't end up at "/#"
        try {
          const cleaned = new URL(window.location.href);
          cleaned.hash = "";
          cleaned.searchParams.delete("code");
          cleaned.searchParams.delete("redirect");
          cleaned.searchParams.delete("error");
          cleaned.searchParams.delete("error_description");
          window.history.replaceState(
            {},
            document.title,
            `${cleaned.pathname}${cleaned.search}`,
          );
        } catch {
          // ignore
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate(ROUTES.LOGIN, { replace: true });
          return;
        }

        // Navigate to intended destination
        navigate(desired, {
          replace: true,
          state: { from: location.pathname },
        });
      } catch (err) {
        logger.error(
          "Unexpected error in auth callback",
          err instanceof Error ? err : new Error(String(err)),
        );
        setError("An unexpected error occurred. Please try again.");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Sign In Failed
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-primary hover:underline font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="flex items-center gap-3 text-white/80">
        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        <span>Signing you in…</span>
      </div>
    </div>
  );
}
