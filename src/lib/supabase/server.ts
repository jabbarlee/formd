/**
 * Server-side Supabase Client
 * Used in API routes and server components ONLY
 * Uses service role key to bypass RLS policies
 *
 * WARNING: Never import this in client-side code!
 */

import { createClient } from "@supabase/supabase-js";

// Throw error if imported on client side
if (typeof window !== "undefined") {
  throw new Error(
    "❌ supabase/server cannot be imported on the client side. Use supabase/client instead."
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
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
