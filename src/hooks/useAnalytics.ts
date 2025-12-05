/**
 * Analytics Hooks
 * React hooks for fetching and managing analytics data
 */

import { useState, useEffect, useCallback } from "react";
import {
  FormAnalytics,
  WorkspaceAnalytics,
  OverviewMetrics,
  TrendDataPoint,
  QuestionAnalytics,
  TimeRangeFilter,
} from "@/lib/types/analytics";
import { analyticsApi } from "@/lib/api/analytics";

interface UseAnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching complete form analytics
 */
export function useFormAnalytics(
  formId: string | undefined,
  timeRange: TimeRangeFilter
): UseAnalyticsState<FormAnalytics> {
  const [data, setData] = useState<FormAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analytics = await analyticsApi.getFormAnalytics(formId, timeRange);
      setData(analytics);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch analytics");
      setError(error);
      console.error("Error fetching form analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [formId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching overview metrics only
 */
export function useAnalyticsOverview(
  formId: string | undefined,
  timeRange: TimeRangeFilter
): UseAnalyticsState<OverviewMetrics> {
  const [data, setData] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const metrics = await analyticsApi.getOverviewMetrics(formId, timeRange);
      setData(metrics);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch metrics");
      setError(error);
      console.error("Error fetching overview metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [formId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching trend data
 */
export function useAnalyticsTrends(
  formId: string | undefined,
  timeRange: TimeRangeFilter
): UseAnalyticsState<TrendDataPoint[]> {
  const [data, setData] = useState<TrendDataPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trends = await analyticsApi.getTrendData(formId, timeRange);
      setData(trends);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch trends");
      setError(error);
      console.error("Error fetching trend data:", error);
    } finally {
      setLoading(false);
    }
  }, [formId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching question analytics
 */
export function useQuestionAnalytics(
  formId: string | undefined,
  timeRange: TimeRangeFilter
): UseAnalyticsState<QuestionAnalytics[]> {
  const [data, setData] = useState<QuestionAnalytics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const questions = await analyticsApi.getQuestionAnalytics(formId, timeRange);
      setData(questions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch question analytics");
      setError(error);
      console.error("Error fetching question analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [formId, timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for fetching workspace analytics
 */
export function useWorkspaceAnalytics(
  timeRange: TimeRangeFilter
): UseAnalyticsState<WorkspaceAnalytics> {
  const [data, setData] = useState<WorkspaceAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await analyticsApi.getWorkspaceAnalytics(timeRange);
      setData(analytics);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch workspace analytics");
      setError(error);
      console.error("Error fetching workspace analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

