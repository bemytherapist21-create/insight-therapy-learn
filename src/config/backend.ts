/**
 * Backend runtime configuration.
 *
 * NOTE: In some preview/build environments, Vite env vars may not be injected.
 * We therefore provide safe defaults so the app can boot reliably.
 */

const DEFAULT_PROJECT_ID = 'sudlkozsotxdzvjpxubu';
const DEFAULT_BACKEND_URL = `https://${DEFAULT_PROJECT_ID}.supabase.co`;
// Publishable (anon) key; safe to embed for client usage.
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGxrb3pzb3R4ZHp2anB4dWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTM5MDYsImV4cCI6MjA3OTE2OTkwNn0.aHA_m7ANlxpwBcmYmqiLqltcygfJHp63nC95VZ94r8Y';

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const backendUrl = envUrl || (projectId ? `https://${projectId}.supabase.co` : DEFAULT_BACKEND_URL);
export const backendAnonKey = envKey || DEFAULT_ANON_KEY;
