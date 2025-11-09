/**
 * Server-side Supabase Client
 * Used in API routes and server components ONLY
 * Uses service role key to bypass RLS policies
 *
 * WARNING: Never import this in client-side code!
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

// Only check for service key on the server side
if (typeof window === "undefined" && !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

// Service role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Alias for backwards compatibility
export const supabaseServer = supabaseAdmin;
