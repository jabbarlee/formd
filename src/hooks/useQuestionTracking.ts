/**
 * Question Tracking Hook
 * Provides detailed tracking of question-level interactions for analytics
 */

import { useRef, useCallback } from 'react';
import { QuestionInteractionType } from '@/lib/types/analytics';

interface QuestionTracker {
  questionId: string;
  viewStartTime: number;
  answerStartTime?: number;
  editCount: number;
  validationErrors: number;
  previousQuestionId?: string;
}

interface UseQuestionTrackingOptions {
  formId: string;
  sessionId: string;
  enabled?: boolean;
}

interface UseQuestionTrackingReturn {
  onQuestionView: (questionId: string) => void;
  onQuestionAnswer: (questionId: string, answerValue: any) => void;
  onQuestionSkip: (questionId: string, reason: string) => void;
  onValidationError: (questionId: string) => void;
  linkToResponse: (responseId: string) => void;
}

/**
 * Hook for tracking detailed question interactions
 */
export function useQuestionTracking({
  formId,
  sessionId,
  enabled = true,
}: UseQuestionTrackingOptions): UseQuestionTrackingReturn {
  const trackersRef = useRef<Map<string, QuestionTracker>>(new Map());
  const currentQuestionRef = useRef<string | null>(null);
  const questionSequenceRef = useRef<string[]>([]);
  const responseIdRef = useRef<string | null>(null);

  /**
   * Track an interaction with the server
   */
  const trackInteraction = useCallback(
    async (
      questionId: string,
      interactionType: QuestionInteractionType,
      data?: Partial<QuestionTracker> & { answerValue?: any; skipReason?: string }
    ) => {
      if (!enabled) return;

      try {
        const tracker = trackersRef.current.get(questionId);
        const now = Date.now();

        let timeToAnswer: number | undefined;
        let timeOnQuestion: number | undefined;

        if (tracker) {
          timeOnQuestion = Math.floor((now - tracker.viewStartTime) / 1000);
          if (tracker.answerStartTime) {
            timeToAnswer = Math.floor((now - tracker.answerStartTime) / 1000);
          }
        }

        // Determine navigation direction
        let navigationDirection: string | undefined;
        const lastQuestion = currentQuestionRef.current;
        if (lastQuestion) {
          const lastIndex = questionSequenceRef.current.indexOf(lastQuestion);
          const currentIndex = questionSequenceRef.current.indexOf(questionId);
          if (currentIndex === lastIndex + 1) {
            navigationDirection = 'forward';
          } else if (currentIndex === lastIndex - 1) {
            navigationDirection = 'backward';
          } else if (currentIndex !== lastIndex) {
            navigationDirection = 'jump';
          }
        }

        // Track the interaction
        await fetch(`/api/public/forms/${formId}/track-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            sessionId,
            interactionType,
            responseId: responseIdRef.current,
            questionOrder: questionSequenceRef.current.indexOf(questionId) + 1 || undefined,
            timeToAnswer,
            timeOnQuestion,
            editCount: tracker?.editCount || 0,
            validationErrors: tracker?.validationErrors || 0,
            isSkipped: interactionType === 'skipped',
            skipReason: data?.skipReason,
            answerValue: data?.answerValue,
            cameFromQuestionId: lastQuestion || undefined,
            navigationDirection,
          }),
        });

        // Update current question reference
        if (interactionType === 'answered' || interactionType === 'viewed') {
          currentQuestionRef.current = questionId;
        }
      } catch (error) {
        console.error('Failed to track question interaction:', error);
        // Silently fail - don't interrupt user experience
      }
    },
    [formId, sessionId, enabled]
  );

  /**
   * Track when a question becomes visible
   */
  const onQuestionView = useCallback(
    (questionId: string) => {
      if (!enabled) return;

      if (!trackersRef.current.has(questionId)) {
        trackersRef.current.set(questionId, {
          questionId,
          viewStartTime: Date.now(),
          editCount: 0,
          validationErrors: 0,
          previousQuestionId: currentQuestionRef.current || undefined,
        });
        questionSequenceRef.current.push(questionId);
        trackInteraction(questionId, 'viewed');
      }
    },
    [enabled, trackInteraction]
  );

  /**
   * Track when a question is answered
   */
  const onQuestionAnswer = useCallback(
    (questionId: string, answerValue: any) => {
      if (!enabled) return;

      const tracker = trackersRef.current.get(questionId);
      if (tracker) {
        if (!tracker.answerStartTime) {
          // First time answering
          tracker.answerStartTime = Date.now();
        } else {
          // Editing an existing answer
          tracker.editCount++;
        }
      }

      trackInteraction(questionId, 'answered', { answerValue });
    },
    [enabled, trackInteraction]
  );

  /**
   * Track when a question is skipped
   */
  const onQuestionSkip = useCallback(
    (questionId: string, reason: string) => {
      if (!enabled) return;
      trackInteraction(questionId, 'skipped', { skipReason: reason });
    },
    [enabled, trackInteraction]
  );

  /**
   * Track validation errors
   */
  const onValidationError = useCallback(
    (questionId: string) => {
      if (!enabled) return;

      const tracker = trackersRef.current.get(questionId);
      if (tracker) {
        tracker.validationErrors++;
      }

      trackInteraction(questionId, 'validation_error');
    },
    [enabled, trackInteraction]
  );

  /**
   * Link all tracked interactions to a response ID after submission
   */
  const linkToResponse = useCallback(
    (responseId: string) => {
      responseIdRef.current = responseId;
      // Optionally, could make an API call to link past interactions
      // For now, future interactions will include the responseId
    },
    []
  );

  return {
    onQuestionView,
    onQuestionAnswer,
    onQuestionSkip,
    onValidationError,
    linkToResponse,
  };
}

