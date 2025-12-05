/**
 * API Client for Analytics
 * Type-safe client functions for interacting with the analytics API
 */

import {
  FormAnalytics,
  WorkspaceAnalytics,
  OverviewMetrics,
  TrendDataPoint,
  QuestionAnalytics,
  TimeRangeFilter,
  TrackEventRequest,
} from "@/lib/types/analytics";
import { auth } from "@/lib/firebase/client";

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated - Please sign in first");
  }

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
 * Build query parameters from time range filter
 */
function buildTimeRangeParams(timeRange: TimeRangeFilter): URLSearchParams {
  const params = new URLSearchParams();
  params.set("timeRange", timeRange.range);

  if (timeRange.range === 'custom' && timeRange.customStart && timeRange.customEnd) {
    params.set("customStart", timeRange.customStart);
    params.set("customEnd", timeRange.customEnd);
  }

  return params;
}

export const analyticsApi = {
  /**
   * Get complete analytics for a form
   */
  async getFormAnalytics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<FormAnalytics> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    const response = await fetch(
      `/api/forms/${formId}/analytics?${params}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Get overview metrics only (lightweight)
   */
  async getOverviewMetrics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<OverviewMetrics> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    const response = await fetch(
      `/api/forms/${formId}/analytics/overview?${params}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Get trend data for charts
   */
  async getTrendData(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<TrendDataPoint[]> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    const response = await fetch(
      `/api/forms/${formId}/analytics/trends?${params}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Get question-by-question analytics
   */
  async getQuestionAnalytics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<QuestionAnalytics[]> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    const response = await fetch(
      `/api/forms/${formId}/analytics/questions?${params}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Get workspace-level analytics
   */
  async getWorkspaceAnalytics(
    timeRange: TimeRangeFilter
  ): Promise<WorkspaceAnalytics> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    const response = await fetch(
      `/api/analytics/workspace?${params}`,
      { headers }
    );

    return handleResponse(response);
  },

  /**
   * Track analytics event (public, no auth required)
   */
  async trackEvent(
    formId: string,
    data: TrackEventRequest
  ): Promise<{ success: boolean; eventId: string; timestamp: string }> {
    const response = await fetch(`/api/public/forms/${formId}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Export analytics data
   */
  async exportAnalytics(
    formId: string,
    timeRange: TimeRangeFilter,
    format: 'csv' | 'json' = 'csv'
  ): Promise<void> {
    const headers = await getAuthHeaders();
    const params = buildTimeRangeParams(timeRange);
    params.set("format", format);

    const response = await fetch(
      `/api/forms/${formId}/analytics/export?${params}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Export failed" }));
      throw new Error(error.error || "Failed to export analytics");
    }

    // Trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch
      ? filenameMatch[1]
      : `analytics_${Date.now()}.${format}`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

