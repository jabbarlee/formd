/**
 * AI Sessions API Client
 * Frontend client for AI session operations
 * 
 * Architecture:
 * - Follows formsApi pattern
 * - Sends Firebase auth headers
 * - Handles all session CRUD operations
 */

import { auth } from "@/lib/firebase/client";
import type {
  AiSession,
  SessionMessage,
  FormDraft,
} from "@/lib/database/services/aiSession.service";

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
        "Authentication failed. Please ensure you are signed in."
      );
    }

    throw new Error(
      error.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * AI Sessions API
 */
export const aiSessionsApi = {
  /**
   * Create new session with first message
   */
  async createSession(
    prompt: string,
    title?: string
  ): Promise<{ session: AiSession }> {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/ai-sessions", {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, title: title || "New Form" }),
    });

    return handleResponse(response);
  },

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<{ session: AiSession }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/ai-sessions/${sessionId}`, {
      headers,
    });

    return handleResponse(response);
  },

  /**
   * Get user's sessions
   */
  async getUserSessions(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ sessions: AiSession[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `/api/ai-sessions?limit=${limit}&offset=${offset}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Send message to session (continues conversation)
   */
  async sendMessage(
    sessionId: string,
    prompt: string
  ): Promise<{ session: AiSession }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/ai-sessions/${sessionId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ prompt }),
    });

    return handleResponse(response);
  },

  /**
   * Link session to created form
   */
  async linkForm(
    sessionId: string,
    formId: string
  ): Promise<{ session: AiSession }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/ai-sessions/${sessionId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ formId }),
    });

    return handleResponse(response);
  },

  /**
   * Update session title
   */
  async updateTitle(
    sessionId: string,
    title: string
  ): Promise<{ session: AiSession }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/ai-sessions/${sessionId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ title }),
    });

    return handleResponse(response);
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/ai-sessions/${sessionId}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse(response);
  },
};
