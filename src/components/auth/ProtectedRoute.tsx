import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const fullRedirectPath = `${location.pathname}${location.search}${location.hash}`;

    try {
      sessionStorage.setItem("postLoginRedirect", fullRedirectPath);
    } catch {
      // ignore storage issues in restricted browser contexts
    }

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(fullRedirectPath)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};
