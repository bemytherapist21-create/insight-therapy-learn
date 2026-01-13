/**
 * Safe Supabase client that works in iframe contexts where localStorage may be blocked.
 * This re-exports the client using safe storage to prevent crashes.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { safeStorage } from '@/lib/safeStorage';
import { backendAnonKey, backendUrl } from '@/config/backend';

export const supabase = createClient<Database>(backendUrl, backendAnonKey, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
