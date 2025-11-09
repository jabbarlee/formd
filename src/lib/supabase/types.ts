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
      forms: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string | null;
          slug: string;
          status: "draft" | "published" | "closed" | "archived";
          theme: Json;
          cover_image: string | null;
          logo: string | null;
          unified_card_layout: boolean;
          has_due_date: boolean;
          due_date: string | null;
          include_time: boolean;
          due_time: string | null;
          has_location: boolean;
          location: string | null;
          settings: Json;
          requires_password: boolean;
          password_hash: string | null;
          response_limit: number | null;
          close_date: string | null;
          allow_multiple_responses: boolean;
          show_progress_bar: boolean;
          collect_email: boolean;
          meta_title: string | null;
          meta_description: string | null;
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          workspace_id: string | null;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description?: string | null;
          slug: string;
          status?: "draft" | "published" | "closed" | "archived";
          theme?: Json;
          cover_image?: string | null;
          logo?: string | null;
          unified_card_layout?: boolean;
          has_due_date?: boolean;
          due_date?: string | null;
          include_time?: boolean;
          due_time?: string | null;
          has_location?: boolean;
          location?: string | null;
          settings?: Json;
          requires_password?: boolean;
          password_hash?: string | null;
          response_limit?: number | null;
          close_date?: string | null;
          allow_multiple_responses?: boolean;
          show_progress_bar?: boolean;
          collect_email?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          workspace_id?: string | null;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          status?: "draft" | "published" | "closed" | "archived";
          theme?: Json;
          cover_image?: string | null;
          logo?: string | null;
          unified_card_layout?: boolean;
          has_due_date?: boolean;
          due_date?: string | null;
          include_time?: boolean;
          due_time?: string | null;
          has_location?: boolean;
          location?: string | null;
          settings?: Json;
          requires_password?: boolean;
          password_hash?: string | null;
          response_limit?: number | null;
          close_date?: string | null;
          allow_multiple_responses?: boolean;
          show_progress_bar?: boolean;
          collect_email?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          published_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          workspace_id?: string | null;
        };
      };
      questions: {
        Row: {
          id: string;
          form_id: string;
          type: string;
          title: string;
          description: string | null;
          placeholder: string | null;
          required: boolean;
          order_position: number;
          options: Json | null;
          validation: Json | null;
          logic: Json | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          type: string;
          title: string;
          description?: string | null;
          placeholder?: string | null;
          required?: boolean;
          order_position: number;
          options?: Json | null;
          validation?: Json | null;
          logic?: Json | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          placeholder?: string | null;
          required?: boolean;
          order_position?: number;
          options?: Json | null;
          validation?: Json | null;
          logic?: Json | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          form_id: string;
          respondent_email: string | null;
          respondent_name: string | null;
          respondent_user_id: string | null;
          status: "in_progress" | "completed" | "flagged";
          completion_percentage: number;
          time_spent: number | null;
          started_at: string;
          submitted_at: string | null;
          device_type: "desktop" | "mobile" | "tablet" | null;
          browser: string | null;
          os: string | null;
          ip_address: string | null;
          location: Json | null;
          referrer: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          respondent_email?: string | null;
          respondent_name?: string | null;
          respondent_user_id?: string | null;
          status?: "in_progress" | "completed" | "flagged";
          completion_percentage?: number;
          time_spent?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          device_type?: "desktop" | "mobile" | "tablet" | null;
          browser?: string | null;
          os?: string | null;
          ip_address?: string | null;
          location?: Json | null;
          referrer?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          respondent_email?: string | null;
          respondent_name?: string | null;
          respondent_user_id?: string | null;
          status?: "in_progress" | "completed" | "flagged";
          completion_percentage?: number;
          time_spent?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          device_type?: "desktop" | "mobile" | "tablet" | null;
          browser?: string | null;
          os?: string | null;
          ip_address?: string | null;
          location?: Json | null;
          referrer?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          response_id: string;
          question_id: string;
          answer_text: string | null;
          answer_number: number | null;
          answer_boolean: boolean | null;
          answer_date: string | null;
          answer_time: string | null;
          answer_datetime: string | null;
          answer_json: Json | null;
          answer_file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          question_id: string;
          answer_text?: string | null;
          answer_number?: number | null;
          answer_boolean?: boolean | null;
          answer_date?: string | null;
          answer_time?: string | null;
          answer_datetime?: string | null;
          answer_json?: Json | null;
          answer_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          question_id?: string;
          answer_text?: string | null;
          answer_number?: number | null;
          answer_boolean?: boolean | null;
          answer_date?: string | null;
          answer_time?: string | null;
          answer_datetime?: string | null;
          answer_json?: Json | null;
          answer_file_url?: string | null;
          created_at?: string;
          updated_at?: string;
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
      form_status: "draft" | "published" | "closed" | "archived";
      response_status: "in_progress" | "completed" | "flagged";
      device_type: "desktop" | "mobile" | "tablet";
    };
  };
}
