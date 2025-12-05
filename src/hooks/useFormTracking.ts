/**
 * Form Tracking Hook
 * Provides utilities for tracking form analytics events
 */

import { useEffect, useRef, useCallback } from "react";
import { analyticsApi } from "@/lib/api/analytics";
import { AnalyticsEventType } from "@/lib/types/analytics";

// Generate or retrieve session ID
function getSessionId(): string {
  const storageKey = "formd_session_id";
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

interface UseFormTrackingOptions {
  formId: string;
  enabled?: boolean;
}

interface UseFormTrackingReturn {
  trackEvent: (
    eventType: AnalyticsEventType,
    data?: { responseId?: string; eventData?: Record<string, any> }
  ) => Promise<void>;
  sessionId: string;
}

/**
 * Hook for tracking form analytics events
 */
export function useFormTracking({
  formId,
  enabled = true,
}: UseFormTrackingOptions): UseFormTrackingReturn {
  const sessionId = useRef(getSessionId()).current;
  const hasTrackedView = useRef(false);
  const hasTrackedStart = useRef(false);
  const isSubmitted = useRef(false);

  /**
   * Track an analytics event
   */
  const trackEvent = useCallback(
    async (
      eventType: AnalyticsEventType,
      data?: { responseId?: string; eventData?: Record<string, any> }
    ) => {
      if (!enabled) return;

      try {
        await analyticsApi.trackEvent(formId, {
          eventType,
          sessionId,
          responseId: data?.responseId,
          eventData: data?.eventData,
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error("Failed to track event:", error);
      }
    },
    [formId, sessionId, enabled]
  );

  /**
   * Track form view on mount
   */
  useEffect(() => {
    if (!enabled || hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackEvent("form_viewed");
  }, [enabled, trackEvent]);

  /**
   * Track form abandonment on unmount (if not submitted)
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isSubmitted.current && hasTrackedStart.current) {
        // Use sendBeacon for reliable tracking on page unload
        const sessionId = getSessionId();
        navigator.sendBeacon(
          `/api/public/forms/${formId}/track`,
          JSON.stringify({
            eventType: "form_abandoned",
            sessionId,
          })
        );
      }
    };

    if (enabled) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [formId, enabled]);

  return {
    trackEvent,
    sessionId,
  };
}

/**
 * Helper to mark form as started (call when first question is answered)
 */
export function useTrackFormStart(
  trackEvent: (eventType: AnalyticsEventType) => Promise<void>,
  hasAnswers: boolean
) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && hasAnswers) {
      hasTracked.current = true;
      trackEvent("form_started");
    }
  }, [hasAnswers, trackEvent]);
}

/**
 * Helper to mark form as submitted
 */
export function markFormSubmitted() {
  // This is accessed via ref in the hook, so we need to export a flag
  // The actual marking happens in the component
}

