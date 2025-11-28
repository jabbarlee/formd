/**
 * AI Session Service
 * Handles database operations for AI form generation sessions
 * 
 * Architecture:
 * - Runs on SERVER (in API routes)
 * - Uses userId passed from authenticated API routes
 * - Follows form.service.ts pattern
 * 
 * Stack:
 * - Firebase Authentication (handled by API routes)
 * - Supabase Database (ai_chats table)
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";

// Types
export interface SessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface FormDraft {
  form: any;
  questions: any[];
}

export interface AiSession {
  id: string;
  createdBy: string;
  title: string;
  messages: SessionMessage[];
  formDraft: FormDraft | null;
  formId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new AI session with initial message
 */
export async function create(
  userId: string,
  title: string,
  initialMessage: SessionMessage
): Promise<AiSession> {
  const { data, error } = await supabase
    .from("ai_chats")
    .insert({
      created_by: userId,
      title,
      messages: [initialMessage],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return mapToSession(data);
}

/**
 * Get session by ID (with ownership check)
 */
export async function getById(
  sessionId: string,
  userId: string
): Promise<AiSession | null> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("id", sessionId)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching session:", error);
    throw new Error(`Failed to fetch session: ${error.message}`);
  }

  return mapToSession(data);
}

/**
 * Append a message to session
 */
export async function appendMessage(
  sessionId: string,
  userId: string,
  message: SessionMessage
): Promise<void> {
  // Get current session to ensure it exists and user owns it
  const session = await getById(sessionId, userId);
  if (!session) {
    throw new Error("Session not found or access denied");
  }

  const updatedMessages = [...session.messages, message];

  const { error } = await supabase
    .from("ai_chats")
    .update({ messages: updatedMessages })
    .eq("id", sessionId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error appending message:", error);
    throw new Error(`Failed to append message: ${error.message}`);
  }
}

/**
 * Update form draft (AI-generated form before saving)
 */
export async function updateFormDraft(
  sessionId: string,
  userId: string,
  formDraft: FormDraft
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ form_draft: formDraft })
    .eq("id", sessionId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error updating form draft:", error);
    throw new Error(`Failed to update form draft: ${error.message}`);
  }
}

/**
 * Link session to created form
 */
export async function linkForm(
  sessionId: string,
  userId: string,
  formId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ form_id: formId })
    .eq("id", sessionId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error linking form:", error);
    throw new Error(`Failed to link form: ${error.message}`);
  }
}

/**
 * Get user's sessions (with pagination)
 */
export async function getUserSessions(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<AiSession[]> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("created_by", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching sessions:", error);
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  return (data || []).map(mapToSession);
}

/**
 * Update session title
 */
export async function updateTitle(
  sessionId: string,
  userId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ title })
    .eq("id", sessionId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error updating title:", error);
    throw new Error(`Failed to update title: ${error.message}`);
  }
}

/**
 * Soft delete session
 */
export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error deleting session:", error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
}

/**
 * Helper to map database row to AiSession type
 */
function mapToSession(row: any): AiSession {
  return {
    id: row.id,
    createdBy: row.created_by,
    title: row.title,
    messages: row.messages || [],
    formDraft: row.form_draft,
    formId: row.form_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Exported service object
 */
export const aiSessionService = {
  create,
  getById,
  appendMessage,
  updateFormDraft,
  linkForm,
  getUserSessions,
  updateTitle,
  deleteSession,
};
