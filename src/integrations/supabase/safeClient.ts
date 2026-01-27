/**
 * Safe Supabase client that works in iframe contexts where localStorage may be blocked.
 * This re-exports the client using safe storage to prevent crashes.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { safeStorage } from "@/lib/safeStorage";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: safeStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
