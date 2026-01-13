import { createRoot } from 'react-dom/client';
import './index.css';

const root = document.getElementById('root')!;

// Boot guard: catch module-level failures (e.g., blocked localStorage in iframes)
async function bootstrap() {
  try {
    const [{ default: App }, { ErrorBoundary }, { reportWebVitals }] = await Promise.all([
      import('./App'),
      import('./components/analytics/ErrorBoundary'),
      import('./lib/performance'),
    ]);

    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );

    reportWebVitals();
  } catch (err) {
    console.error('[Boot] Failed to start app:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isDev = import.meta.env.DEV;
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;padding:24px;text-align:center;background:#0a0a0a;color:#fff;">
        <h1 style="font-size:1.5rem;margin-bottom:8px;">Unable to load app</h1>
        <p style="color:#888;margin-bottom:16px;">${isDev ? errorMessage : 'This may be due to browser privacy settings blocking storage access.'}</p>
        ${isDev ? `<pre style="background:#1a1a1a;padding:12px;border-radius:6px;font-size:0.75rem;max-width:90%;overflow-x:auto;margin-bottom:16px;color:#f87171;">${errorMessage}</pre>` : ''}
        <button onclick="location.reload()" style="padding:10px 20px;border-radius:6px;background:#7c3aed;color:#fff;border:none;cursor:pointer;">Reload</button>
      </div>
    `;
  }
}

bootstrap();
