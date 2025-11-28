/**
 * AI Chats API Client
 * Frontend wrapper for AI chat API operations
 */

import type { ChatMessage, FormDraft, AiChat } from "@/lib/database/services/aiChat.service";
import { auth } from "@/lib/firebase/client";

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated - Please sign in first");
  }

  // Get Firebase ID token
  const idToken = await currentUser.getIdToken();

  return {
    "Content-Type": "application/json",
    "x-firebase-uid": currentUser.uid,
    "x-user-id": currentUser.uid,
    "x-user-email": currentUser.email || "",
    Authorization: `Bearer ${idToken}`,
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));

    if (response.status === 401) {
      throw new Error(
        "Authentication failed. Please ensure you are signed in and your account exists in the database."
      );
    }

    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Create a new chat
 */
export async function createChat(title: string): Promise<AiChat> {
  const headers = await getAuthHeaders();
  const response = await fetch("/api/ai/chats", {
    method: "POST",
    headers,
    body: JSON.stringify({ title }),
  });

  const data = await handleResponse<{ chat: AiChat }>(response);
  return data.chat;
}

/**
 * Get user's chat list
 */
export async function getUserChats(limit: number = 20, offset: number = 0): Promise<AiChat[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats?limit=${limit}&offset=${offset}`, {
    headers,
  });

  const data = await handleResponse<{ chats: AiChat[] }>(response);
  return data.chats;
}

/**
 * Get single chat by ID
 */
export async function getChat(chatId: string): Promise<AiChat> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats/${chatId}`, {
    headers,
  });

  const data = await handleResponse<{ chat: AiChat }>(response);
  return data.chat;
}

/**
 * Append message to chat
 */
export async function appendMessage(chatId: string, message: ChatMessage): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ message }),
  });

  await handleResponse<{ success: boolean }>(response);
}

/**
 * Update form draft
 */
export async function updateFormDraft(chatId: string, formDraft: FormDraft): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ formDraft }),
  });

  await handleResponse<{ success: boolean }>(response);
}

/**
 * Link chat to created form
 */
export async function linkForm(chatId: string, formId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ formId }),
  });

  await handleResponse<{ success: boolean }>(response);
}

/**
 * Delete chat
 */
export async function deleteChat(chatId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "DELETE",
    headers,
  });

  await handleResponse<{ success: boolean }>(response);
}

/**
 * Exported API wrapper
 */
export const aiChatsApi = {
  createChat,
  getUserChats,
  getChat,
  appendMessage,
  updateFormDraft,
  linkForm,
  deleteChat,
};
