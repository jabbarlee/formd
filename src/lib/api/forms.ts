/**
 * API Client for Forms
 * Type-safe client functions for interacting with the forms API
 */

import { Form, Question } from "@/lib/types/forms";
import { auth } from "@/lib/firebase/client";

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  // For now, using temporary auth headers
  // TODO: Replace with proper Firebase ID token
  return {
    "Content-Type": "application/json",
    "x-user-id": currentUser.uid, // Temporary
    "x-firebase-uid": currentUser.uid,
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const formsApi = {
  /**
   * Get all forms for the current user
   */
  async getForms(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ forms: Form[] }> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();

    if (options?.status) params.set("status", options.status);
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());

    const url = `/api/forms${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers });

    return handleResponse(response);
  },

  /**
   * Get a single form by ID with its questions
   */
  async getForm(formId: string): Promise<{ form: Form; questions: Question[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}`, { headers });

    return handleResponse(response);
  },

  /**
   * Create a new form
   */
  async createForm(formData: Partial<Form>): Promise<{ form: Form }> {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/forms", {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
    });

    return handleResponse(response);
  },

  /**
   * Update a form (with optional questions sync)
   */
  async updateForm(
    formId: string,
    updates: Partial<Form>,
    questions?: Question[]
  ): Promise<{ form: Form; questions: Question[] }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ...updates, questions }),
    });

    return handleResponse(response);
  },

  /**
   * Delete a form
   */
  async deleteForm(formId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}`, {
      method: "DELETE",
      headers,
    });

    return handleResponse(response);
  },

  /**
   * Publish a form
   */
  async publishForm(formId: string): Promise<{ form: Form }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}/publish`, {
      method: "POST",
      headers,
    });

    return handleResponse(response);
  },

  /**
   * Unpublish a form
   */
  async unpublishForm(formId: string): Promise<{ form: Form }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}/unpublish`, {
      method: "POST",
      headers,
    });

    return handleResponse(response);
  },

  /**
   * Close a form
   */
  async closeForm(formId: string): Promise<{ form: Form }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/forms/${formId}/close`, {
      method: "POST",
      headers,
    });

    return handleResponse(response);
  },
};
