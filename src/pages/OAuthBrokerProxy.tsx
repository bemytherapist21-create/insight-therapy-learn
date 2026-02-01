import { useEffect } from "react";

/**
 * Proxy page for Lovable's managed OAuth broker.
 *
 * @lovable.dev/cloud-auth-js navigates to `/~oauth/initiate?...` on our origin.
 * In many SPA setups that path would be handled by the client router (and 404).
 *
 * This page forwards the request to the hosted OAuth broker (oauth.lovable.app)
 * while preserving the path + query.
 */
export default function OAuthBrokerProxy() {
  useEffect(() => {
    const target = `https://oauth.lovable.app${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to secure sign-in…</p>
      </div>
    </div>
  );
}
