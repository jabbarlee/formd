/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for database operations
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase configuration
 * All values are loaded from environment variables for security
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Validates that all required Supabase configuration values are present
 * @throws Error if any required configuration is missing
 */
const validateSupabaseConfig = (): void => {
  if (!supabaseUrl) {
    throw new Error(
      "Missing required Supabase configuration: NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing required Supabase configuration: NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
};

// Validate configuration
validateSupabaseConfig();

/**
 * Initialize Supabase client
 * Using generic typing for flexibility during development
 */
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    persistSession: false, // We use Firebase for auth, Supabase only for database
    autoRefreshToken: false,
  },
  db: {
    schema: "public",
  },
});

/**
 * Supabase Admin Client (for server-side operations)
 * Uses service role key for elevated permissions
 */
export const createSupabaseAdmin = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin operations");
  }

  return createClient(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
