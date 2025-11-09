/**
 * Supabase Database Types
 * Auto-generated types based on database schema
 *
 * Note: In production, generate these using:
 * npx supabase gen types typescript --project-id <project-id> --schema public > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          firebase_uid: string;
          email: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          company: string | null;
          plan: "free" | "pro" | "business" | "enterprise";
          email_verified: boolean;
          stripe_customer_id: string | null;
          preferences: Json;
          metadata: Json;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          firebase_uid: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          plan?: "free" | "pro" | "business" | "enterprise";
          email_verified?: boolean;
          stripe_customer_id?: string | null;
          preferences?: Json;
          metadata?: Json;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          firebase_uid?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          plan?: "free" | "pro" | "business" | "enterprise";
          email_verified?: boolean;
          stripe_customer_id?: string | null;
          preferences?: Json;
          metadata?: Json;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      // Add other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_plan: "free" | "pro" | "business" | "enterprise";
    };
  };
}
