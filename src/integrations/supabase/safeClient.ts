/**
 * Safe Supabase client that works in iframe contexts where localStorage may be blocked.
 * This re-exports the client using safe storage to prevent crashes.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { safeStorage } from "@/lib/safeStorage";

// Use env vars with fallback to hardcoded publishable values for production builds
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://sudlkozsotxdzvjpxubu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGxrb3pzb3R4ZHp2anB4dWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTM5MDYsImV4cCI6MjA3OTE2OTkwNn0.aHA_m7ANlxpwBcmYmqiLqltcygfJHp63nC95VZ94r8Y";

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
