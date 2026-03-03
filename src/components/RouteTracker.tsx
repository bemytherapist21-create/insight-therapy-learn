import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LAST_THERAPY_ROUTE_KEY = "app.lastTherapyRoute";

function isSafePath(p: string): boolean {
  return p.startsWith("/") && !p.startsWith("//");
}

export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    if (p === "/chat" || p === "/ai-voice" || p === "/ai-therapy/voice") {
      if (!isSafePath(p)) return;
      try {
        localStorage.setItem(
          LAST_THERAPY_ROUTE_KEY,
          p === "/ai-therapy/voice" ? "/ai-voice" : p,
        );
      } catch {
        // ignore
      }
    }
  }, [location.pathname]);

  return null;
}
