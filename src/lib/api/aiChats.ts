/**
 * AI Chats API Client
 * Frontend wrapper for AI chat API operations
 */

import type { ChatMessage, FormDraft, AiChat } from "@/lib/database/services/aiChat.service";
import { auth } from "@/lib/firebase/client";
import { tokenStorage } from "@/lib/auth/utils/token-storage";

/**
 * Get Firebase auth token for API requests
 */
const getAuthToken = async (): Promise<string> => {
  // Try to get cached token first
  const cachedToken = tokenStorage.getAuthToken();
  if (cachedToken) {
    return cachedToken;
  }

  // Get fresh token from Firebase
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const token = await currentUser.getIdToken();
  tokenStorage.setAuthToken(token);
  return token;
};

/**
 * Create a new chat
 */
export async function createChat(title: string): Promise<AiChat> {
  const token = await getAuthToken();

  const response = await fetch("/api/ai/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create chat");
  }

  return data.chat;
}

/**
 * Get user's chat list
 */
export async function getUserChats(limit: number = 20, offset: number = 0): Promise<AiChat[]> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats?limit=${limit}&offset=${offset}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch chats");
  }

  return data.chats;
}

/**
 * Get single chat by ID
 */
export async function getChat(chatId: string): Promise<AiChat> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats/${chatId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch chat");
  }

  return data.chat;
}

/**
 * Append message to chat
 */
export async function appendMessage(chatId: string, message: ChatMessage): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to append message");
  }
}

/**
 * Update form draft
 */
export async function updateFormDraft(chatId: string, formDraft: FormDraft): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ formDraft }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to update form draft");
  }
}

/**
 * Link chat to created form
 */
export async function linkForm(chatId: string, formId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ formId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to link form");
  }
}

/**
 * Delete chat
 */
export async function deleteChat(chatId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`/api/ai/chats/${chatId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete chat");
  }
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
