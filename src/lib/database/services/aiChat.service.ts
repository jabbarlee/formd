/**
 * AI Chat Database Service
 * Handles all database operations for AI chat conversations
 * 
 * NOTE: This service runs on the SERVER (in API routes).
 * Authentication is handled by the API routes using getAuthUser().
 * This service just uses the userId passed from the authenticated API routes.
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";

// Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface FormDraft {
  form: any;
  questions: any[];
}

export interface AiChat {
  id: string;
  created_by: string;
  title: string;
  messages: ChatMessage[];
  form_id: string | null;
  form_draft: FormDraft | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Create a new AI chat session
 */
export async function createChat(userId: string, title: string): Promise<AiChat> {
  const { data, error } = await supabase
    .from("ai_chats")
    .insert({
      created_by: userId,
      title,
      messages: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    throw new Error(`Failed to create chat: ${error.message}`);
  }

  return data;
}

/**
 * Get user's chat history with pagination
 */
export async function getUserChats(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<AiChat[]> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("created_by", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching chats:", error);
    throw new Error(`Failed to fetch chats: ${error.message}`);
  }

  return data || [];
}

/**
 * Get single chat by ID
 */
export async function getChatById(
  chatId: string,
  userId: string
): Promise<AiChat | null> {
  const { data, error } = await supabase
    .from("ai_chats")
    .select("*")
    .eq("id", chatId)
    .eq("created_by", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching chat:", error);
    throw new Error(`Failed to fetch chat: ${error.message}`);
  }

  return data;
}

/**
 * Append a message to a chat
 */
export async function appendMessage(
  chatId: string,
  userId: string,
  message: ChatMessage
): Promise<void> {
  // First, get current messages
  const chat = await getChatById(chatId, userId);
  if (!chat) {
    throw new Error("Chat not found");
  }

  const updatedMessages = [...chat.messages, message];

  const { error } = await supabase
    .from("ai_chats")
    .update({ messages: updatedMessages })
    .eq("id", chatId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error appending message:", error);
    throw new Error(`Failed to append message: ${error.message}`);
  }
}

/**
 * Update form draft
 */
export async function updateFormDraft(
  chatId: string,
  userId: string,
  formDraft: FormDraft
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ form_draft: formDraft })
    .eq("id", chatId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error updating form draft:", error);
    throw new Error(`Failed to update form draft: ${error.message}`);
  }
}

/**
 * Link chat to a created form
 */
export async function linkForm(
  chatId: string,
  userId: string,
  formId: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ form_id: formId })
    .eq("id",chatId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error linking form:", error);
    throw new Error(`Failed to link form: ${error.message}`);
  }
}

/**
 * Update chat title
 */
export async function updateTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ title })
    .eq("id", chatId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error updating title:", error);
    throw new Error(`Failed to update title: ${error.message}`);
  }
}

/**
 * Soft delete a chat
 */
export async function deleteChat(chatId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("ai_chats")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error deleting chat:", error);
    throw new Error(`Failed to delete chat: ${error.message}`);
  }
}

/**
 * AI Chat Service - Exported object
 */
export const aiChatService = {
  create: createChat,
  getUserChats,
  getById: getChatById,
  appendMessage,
  updateFormDraft,
  linkForm,
  updateTitle,
  delete: deleteChat,
};
