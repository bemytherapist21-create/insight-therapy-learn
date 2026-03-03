import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root")!;

// Boot guard: catch module-level failures (e.g., blocked localStorage in iframes)
async function bootstrap() {
  try {
    const [{ default: App }, { ErrorBoundary }, { reportWebVitals }] =
      await Promise.all([
        import("./App"),
        import("./components/analytics/ErrorBoundary"),
        import("./lib/performance"),
      ]);

    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );

    reportWebVitals();
  } catch (err) {
    console.error("[Boot] Failed to start app:", err);
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;padding:24px;text-align:center;background:#0a0a0a;color:#fff;">
        <h1 style="font-size:1.5rem;margin-bottom:8px;">Unable to load app</h1>
        <p style="color:#888;margin-bottom:16px;max-width:500px;">This may be due to browser privacy settings blocking storage access after login.</p>
        
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:16px 0;max-width:500px;text-align:left;">
          <p style="color:#7c3aed;font-weight:600;margin-bottom:8px;">Try these steps:</p>
          <ol style="color:#aaa;font-size:0.9rem;line-height:1.8;padding-left:20px;margin:0;">
            <li>Enable cookies in your browser settings</li>
            <li>Allow third-party cookies for this site</li>
            <li>Try in a different browser or incognito mode</li>
            <li>Clear browser cache and reload</li>
          </ol>
        </div>
        
        <button onclick="location.reload()" style="padding:12px 24px;border-radius:6px;background:#7c3aed;color:#fff;border:none;cursor:pointer;font-size:1rem;margin-top:8px;">Reload Page</button>
      </div>
    `;
  }
}

bootstrap();
