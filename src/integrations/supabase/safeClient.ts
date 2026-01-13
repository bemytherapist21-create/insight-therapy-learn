/**
 * Safe Supabase client that works in iframe contexts where localStorage may be blocked.
 * This re-exports the client using safe storage to prevent crashes.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { safeStorage } from '@/lib/safeStorage';

/**
 * Resolve backend env vars robustly.
 * Some preview environments may not expose .env values; we fall back to deriving the URL from the project id.
 */
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as
  | string
  | undefined;

const SUPABASE_URL = envUrl || (projectId ? `https://${projectId}.supabase.co` : '');
const SUPABASE_PUBLISHABLE_KEY = envKey || '';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Backend configuration missing: VITE_SUPABASE_URL (or VITE_SUPABASE_PROJECT_ID) and VITE_SUPABASE_PUBLISHABLE_KEY are required.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
