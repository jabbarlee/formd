/**
 * API Client for Responses
 * Type-safe client functions for interacting with the responses API
 */

import {
  FormResponse,
  ResponseFilters,
  ResponseStats,
  ResponseDetail,
} from "@/lib/types/forms";
import { auth } from "@/lib/firebase/client";

// API response types
interface ResponsesApiResponse {
  responses: FormResponse[];
  stats: ResponseStats;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: ResponseFilters;
}

interface ResponseDetailApiResponse {
  response: ResponseDetail;
  form: {
    id: string;
    title: string;
  };
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    // Wait a bit for auth to initialize if not ready
    await new Promise((resolve) => setTimeout(resolve, 100));
    const retryUser = auth.currentUser;
    if (!retryUser) {
      throw new Error("Not authenticated - Please sign in first");
    }
  }

  const user = currentUser || auth.currentUser!;
  // Get Firebase ID token
  const idToken = await user.getIdToken();

  // Use the same header structure as forms API
  // The API will verify the Firebase UID exists in the database
  return {
    "Content-Type": "application/json",
    "x-firebase-uid": user.uid,
    "x-user-id": user.uid, // Will be verified against database
    "x-user-email": user.email || "", // For auto-creating user
    Authorization: `Bearer ${idToken}`,
  };
}
/**
 * Handle API response with proper error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Build query string from filters and pagination
 */
function buildQueryString(
  filters: ResponseFilters = {},
  pagination: { limit?: number; offset?: number } = {}
): string {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.device && filters.device !== "all") {
    params.set("device", filters.device);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (pagination.limit) {
    params.set("limit", pagination.limit.toString());
  }

  if (pagination.offset) {
    params.set("offset", pagination.offset.toString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export const responsesApi = {
  /**
   * Get responses for a form with optional filtering and pagination
   */
  async getResponses(
    formId: string,
    filters: ResponseFilters = {},
    pagination: { limit?: number; offset?: number } = {}
  ): Promise<ResponsesApiResponse> {
    const headers = await getAuthHeaders();
    const queryString = buildQueryString(filters, pagination);

    const response = await fetch(
      `/api/forms/${formId}/responses${queryString}`,
      {
        headers,
      }
    );

    return handleResponse<ResponsesApiResponse>(response);
  },

  /**
   * Get detailed information about a specific response
   */
  async getResponse(
    formId: string,
    responseId: string
  ): Promise<ResponseDetailApiResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `/api/forms/${formId}/responses/${responseId}`,
      {
        headers,
      }
    );

    return handleResponse<ResponseDetailApiResponse>(response);
  },

  /**
   * Delete a response
   */
  async deleteResponse(
    formId: string,
    responseId: string
  ): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `/api/forms/${formId}/responses/${responseId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    return handleResponse<{ success: boolean; message: string }>(response);
  },

  /**
   * Flag a response for review
   */
  async flagResponse(
    formId: string,
    responseId: string
  ): Promise<{ success: boolean; response: FormResponse; message: string }> {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `/api/forms/${formId}/responses/${responseId}/flag`,
      {
        method: "POST",
        headers,
      }
    );

    return handleResponse<{
      success: boolean;
      response: FormResponse;
      message: string;
    }>(response);
  },

  /**
   * Get only response statistics for a form (lighter request)
   */
  async getStats(formId: string): Promise<ResponseStats> {
    const data = await this.getResponses(formId, {}, { limit: 1 });
    return data.stats;
  },

  /**
   * Search responses across all forms (if needed for global search)
   */
  async searchResponses(
    formId: string,
    searchTerm: string,
    additionalFilters: Omit<ResponseFilters, "search"> = {}
  ): Promise<FormResponse[]> {
    const filters: ResponseFilters = {
      ...additionalFilters,
      search: searchTerm,
    };

    const data = await this.getResponses(formId, filters);
    return data.responses;
  },

  /**
   * Get responses with pagination helper
   */
  async getResponsesPaginated(
    formId: string,
    page: number = 1,
    pageSize: number = 20,
    filters: ResponseFilters = {}
  ): Promise<{
    responses: FormResponse[];
    stats: ResponseStats;
    pagination: {
      currentPage: number;
      pageSize: number;
      hasMore: boolean;
      totalShown: number;
    };
  }> {
    const offset = (page - 1) * pageSize;

    const data = await this.getResponses(formId, filters, {
      limit: pageSize,
      offset,
    });

    return {
      responses: data.responses,
      stats: data.stats,
      pagination: {
        currentPage: page,
        pageSize,
        hasMore: data.pagination.hasMore,
        totalShown: offset + data.responses.length,
      },
    };
  },

  /**
   * Bulk operations (for future implementation)
   */
  async bulkDelete(
    formId: string,
    responseIds: string[]
  ): Promise<{ success: boolean; deletedCount: number }> {
    // This would require a bulk delete endpoint
    // For now, perform sequential deletes
    let deletedCount = 0;

    for (const responseId of responseIds) {
      try {
        await this.deleteResponse(formId, responseId);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete response ${responseId}:`, error);
        // Continue with other deletions
      }
    }

    return {
      success: deletedCount > 0,
      deletedCount,
    };
  },

  /**
   * Export responses using the dedicated export API endpoint
   */
  async exportResponses(
    formId: string,
    format: "csv" | "json" = "csv",
    options: {
      includeMetadata?: boolean;
      questionIds?: string[];
      filters?: ResponseFilters;
    } = {}
  ): Promise<Blob> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();

    params.set("format", format);

    if (options.includeMetadata) {
      params.set("includeMetadata", "true");
    }

    if (options.questionIds && options.questionIds.length > 0) {
      params.set("questionIds", options.questionIds.join(","));
    }

    const response = await fetch(
      `/api/forms/${formId}/responses/export?${params}`,
      {
        headers: {
          ...headers,
          Accept: format === "csv" ? "text/csv" : "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Export failed" }));
      throw new Error(
        errorData.error || `Export failed: ${response.statusText}`
      );
    }

    return response.blob();
  },

  /**
   * Helper: Convert responses to CSV format (kept for compatibility)
   */
  convertToCSV(responses: FormResponse[]): string {
    if (responses.length === 0) return "No data available";

    // Get all unique question IDs from all responses
    const questionIds = new Set<string>();
    responses.forEach((response) => {
      Object.keys(response.data).forEach((qId) => questionIds.add(qId));
    });

    // Create header
    const headers = [
      "Response ID",
      "Submitted At",
      "Status",
      "Respondent Name",
      "Respondent Email",
      "Completion Time",
      "Device",
      ...Array.from(questionIds),
    ];

    // Create rows
    const rows = responses.map((response) => [
      response.id,
      response.submittedAt,
      response.status,
      response.respondent.name || "",
      response.respondent.email || "",
      response.completionTime?.toString() || "",
      response.device || "",
      ...Array.from(questionIds).map((qId) => {
        const value = response.data[qId];
        return value !== undefined ? JSON.stringify(value) : "";
      }),
    ]);

    // Combine headers and rows
    const allRows = [headers, ...rows];

    // Convert to CSV string
    return allRows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
  },
};
