/**
 * Analytics Service
 * Database operations for analytics events and metrics calculation
 * Handles event tracking, metrics aggregation, and trend analysis
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import {
  AnalyticsEvent,
  AnalyticsEventType,
  TimeRangeFilter,
  DateRange,
  OverviewMetrics,
  TrendDataPoint,
  FunnelStage,
  DeviceBreakdown,
  GeographicData,
  QuestionAnalytics,
  FormAnalytics,
  WorkspaceAnalytics,
  FormPerformance,
  DeviceStats,
} from "@/lib/types/analytics";

/**
 * Calculate date range from TimeRangeFilter
 */
function calculateDateRange(timeRange: TimeRangeFilter): DateRange {
  const end = new Date();
  let start = new Date();

  switch (timeRange.range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "month":
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
    case "last_month":
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
      break;
    case "custom":
      if (timeRange.customStart && timeRange.customEnd) {
        start = new Date(timeRange.customStart);
        end.setTime(new Date(timeRange.customEnd).getTime());
      }
      break;
    case "all":
      start = new Date(0); // Beginning of time
      break;
  }

  return { start, end };
}

/**
 * Calculate previous period date range for comparison
 */
function calculatePreviousPeriod(currentRange: DateRange): DateRange {
  const duration = currentRange.end.getTime() - currentRange.start.getTime();
  const previousEnd = new Date(currentRange.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return { start: previousStart, end: previousEnd };
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Analytics Service
 * Provides comprehensive analytics operations
 */
export const analyticsService = {
  /**
   * Track an analytics event
   */
  async trackEvent(
    formId: string,
    eventType: AnalyticsEventType,
    data?: {
      responseId?: string;
      sessionId?: string;
      eventData?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AnalyticsEvent> {
    try {
      const { data: event, error } = await supabase
        .from("analytics_events")
        .insert({
          form_id: formId,
          event_type: eventType,
          response_id: data?.responseId,
          session_id: data?.sessionId,
          event_data: data?.eventData,
          ip_address: data?.ipAddress,
          user_agent: data?.userAgent,
        })
        .select()
        .single();

      if (error) {
        console.error("Error tracking event:", error);
        throw new Error(`Failed to track event: ${error.message}`);
      }

      return {
        id: event.id,
        formId: event.form_id,
        responseId: event.response_id || undefined,
        eventType: event.event_type as AnalyticsEventType,
        eventData: event.event_data || undefined,
        sessionId: event.session_id || undefined,
        ipAddress: event.ip_address || undefined,
        userAgent: event.user_agent || undefined,
        timestamp: event.timestamp,
      };
    } catch (error) {
      console.error("Error in trackEvent:", error);
      throw error;
    }
  },

  /**
   * Get overview metrics with comparison to previous period
   */
  async getOverviewMetrics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<OverviewMetrics> {
    try {
      const currentRange = calculateDateRange(timeRange);
      const previousRange = calculatePreviousPeriod(currentRange);

      // Get current period metrics
      const [currentViews, currentResponses, currentCompletions] =
        await Promise.all([
          this.countEvents(formId, "form_viewed", currentRange),
          this.countEvents(formId, "form_started", currentRange),
          supabase
            .from("responses")
            .select("time_spent", { count: "exact" })
            .eq("form_id", formId)
            .eq("status", "completed")
            .gte("submitted_at", currentRange.start.toISOString())
            .lte("submitted_at", currentRange.end.toISOString()),
        ]);

      // Get previous period metrics
      const [previousViews, previousResponses, previousCompletions] =
        await Promise.all([
          this.countEvents(formId, "form_viewed", previousRange),
          this.countEvents(formId, "form_started", previousRange),
          supabase
            .from("responses")
            .select("*", { count: "exact", head: true })
            .eq("form_id", formId)
            .eq("status", "completed")
            .gte("submitted_at", previousRange.start.toISOString())
            .lte("submitted_at", previousRange.end.toISOString()),
        ]);

      const totalResponses = currentCompletions.count || 0;
      const previousTotalResponses = previousCompletions.count || 0;

      // Calculate average time from completed responses
      const completedResponses = currentCompletions.data || [];
      const averageTime =
        completedResponses.length > 0
          ? completedResponses.reduce(
              (sum, r) => sum + (r.time_spent || 0),
              0
            ) / completedResponses.length
          : 0;

      // Calculate completion rate
      const completionRate =
        currentResponses > 0 ? (totalResponses / currentResponses) * 100 : 0;

      const previousCompletionRate =
        previousResponses > 0
          ? (previousTotalResponses / previousResponses) * 100
          : 0;

      // Calculate previous period average time
      const { data: previousCompletedResponses } = await supabase
        .from("responses")
        .select("time_spent")
        .eq("form_id", formId)
        .eq("status", "completed")
        .gte("submitted_at", previousRange.start.toISOString())
        .lte("submitted_at", previousRange.end.toISOString());

      const previousAverageTime =
        previousCompletedResponses && previousCompletedResponses.length > 0
          ? previousCompletedResponses.reduce(
              (sum, r) => sum + (r.time_spent || 0),
              0
            ) / previousCompletedResponses.length
          : 0;

      return {
        totalViews: currentViews,
        totalResponses,
        completionRate: Math.round(completionRate),
        averageTime: Math.round(averageTime),
        viewsChange: calculatePercentageChange(currentViews, previousViews),
        responsesChange: calculatePercentageChange(
          totalResponses,
          previousTotalResponses
        ),
        completionRateChange: completionRate - previousCompletionRate,
        averageTimeChange: calculatePercentageChange(
          averageTime,
          previousAverageTime
        ),
      };
    } catch (error) {
      console.error("Error in getOverviewMetrics:", error);
      throw error;
    }
  },

  /**
   * Helper: Count events of specific type in date range
   */
  async countEvents(
    formId: string,
    eventType: AnalyticsEventType,
    dateRange: DateRange
  ): Promise<number> {
    const { count, error } = await supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("form_id", formId)
      .eq("event_type", eventType)
      .gte("timestamp", dateRange.start.toISOString())
      .lte("timestamp", dateRange.end.toISOString());

    if (error) {
      console.error("Error counting events:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Get trend data for charts (daily aggregations)
   */
  async getTrendData(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<TrendDataPoint[]> {
    try {
      const dateRange = calculateDateRange(timeRange);

      // Query for daily event counts using date_trunc
      const { data: eventData, error: eventError } = await supabase.rpc(
        "get_daily_event_counts",
        {
          p_form_id: formId,
          p_start_date: dateRange.start.toISOString(),
          p_end_date: dateRange.end.toISOString(),
        }
      );

      // If RPC doesn't exist, fall back to manual aggregation
      if (eventError) {
        console.log("RPC not available, using manual aggregation");
        return this.getTrendDataManual(formId, dateRange);
      }

      return eventData || [];
    } catch (error) {
      console.error("Error in getTrendData:", error);
      // Return manual aggregation as fallback
      return this.getTrendDataManual(formId, calculateDateRange(timeRange));
    }
  },

  /**
   * Manual trend data calculation (fallback when RPC unavailable)
   */
  async getTrendDataManual(
    formId: string,
    dateRange: DateRange
  ): Promise<TrendDataPoint[]> {
    try {
      // Fetch all events in range
      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("event_type, timestamp")
        .eq("form_id", formId)
        .gte("timestamp", dateRange.start.toISOString())
        .lte("timestamp", dateRange.end.toISOString())
        .order("timestamp");

      if (error) throw error;

      // Fetch all completed responses in range
      const { data: responses, error: responseError } = await supabase
        .from("responses")
        .select("submitted_at")
        .eq("form_id", formId)
        .eq("status", "completed")
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString());

      if (responseError) throw responseError;

      // Aggregate by date
      const dataMap = new Map<string, TrendDataPoint>();

      // Process events
      events?.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split("T")[0];
        const existing = dataMap.get(date) || {
          date,
          views: 0,
          starts: 0,
          completions: 0,
        };

        if (event.event_type === "form_viewed") existing.views++;
        if (event.event_type === "form_started") existing.starts++;

        dataMap.set(date, existing);
      });

      // Process responses
      responses?.forEach((response) => {
        const date = new Date(response.submitted_at)
          .toISOString()
          .split("T")[0];
        const existing = dataMap.get(date) || {
          date,
          views: 0,
          starts: 0,
          completions: 0,
        };
        existing.completions++;
        dataMap.set(date, existing);
      });

      // Convert to array and sort by date
      return Array.from(dataMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    } catch (error) {
      console.error("Error in getTrendDataManual:", error);
      return [];
    }
  },

  /**
   * Get funnel data (conversion stages)
   */
  async getFunnelData(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<FunnelStage[]> {
    try {
      const dateRange = calculateDateRange(timeRange);

      const [viewed, started, responses] = await Promise.all([
        this.countEvents(formId, "form_viewed", dateRange),
        this.countEvents(formId, "form_started", dateRange),
        supabase
          .from("responses")
          .select("completion_percentage, status", { count: "exact" })
          .eq("form_id", formId)
          .gte("started_at", dateRange.start.toISOString())
          .lte("started_at", dateRange.end.toISOString()),
      ]);

      const allResponses = responses.data || [];
      const halfwayCount = allResponses.filter(
        (r) => r.completion_percentage >= 50
      ).length;
      const completedCount = allResponses.filter(
        (r) => r.status === "completed"
      ).length;

      const stages: FunnelStage[] = [
        {
          stage: "viewed",
          label: "Form Viewed",
          count: viewed,
          percentage: 100,
        },
        {
          stage: "started",
          label: "Started",
          count: started,
          percentage: viewed > 0 ? (started / viewed) * 100 : 0,
        },
        {
          stage: "halfway",
          label: "50% Complete",
          count: halfwayCount,
          percentage: viewed > 0 ? (halfwayCount / viewed) * 100 : 0,
        },
        {
          stage: "completed",
          label: "Completed",
          count: completedCount,
          percentage: viewed > 0 ? (completedCount / viewed) * 100 : 0,
        },
      ];

      return stages;
    } catch (error) {
      console.error("Error in getFunnelData:", error);
      return [];
    }
  },

  /**
   * Get device breakdown statistics
   */
  async getDeviceBreakdown(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<DeviceBreakdown> {
    try {
      const dateRange = calculateDateRange(timeRange);

      const { data: responses, error } = await supabase
        .from("responses")
        .select("device_type")
        .eq("form_id", formId)
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString());

      if (error) throw error;

      const total = responses?.length || 0;
      const deviceCounts = {
        desktop: 0,
        mobile: 0,
        tablet: 0,
      };

      responses?.forEach((r) => {
        const device = r.device_type?.toLowerCase();
        if (device === "desktop") deviceCounts.desktop++;
        else if (device === "mobile") deviceCounts.mobile++;
        else if (device === "tablet") deviceCounts.tablet++;
      });

      const createStats = (count: number): DeviceStats => ({
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      });

      return {
        desktop: createStats(deviceCounts.desktop),
        mobile: createStats(deviceCounts.mobile),
        tablet: createStats(deviceCounts.tablet),
      };
    } catch (error) {
      console.error("Error in getDeviceBreakdown:", error);
      return {
        desktop: { count: 0, percentage: 0 },
        mobile: { count: 0, percentage: 0 },
        tablet: { count: 0, percentage: 0 },
      };
    }
  },

  /**
   * Get geographic distribution
   */
  async getGeographicData(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<GeographicData[]> {
    try {
      const dateRange = calculateDateRange(timeRange);

      const { data: responses, error } = await supabase
        .from("responses")
        .select("location")
        .eq("form_id", formId)
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString())
        .not("location", "is", null);

      if (error) throw error;

      const countryMap = new Map<
        string,
        { country: string; code: string; count: number }
      >();
      const total = responses?.length || 0;

      responses?.forEach((r) => {
        if (r.location && typeof r.location === "object") {
          const location = r.location as any;
          const country = location.country || "Unknown";
          const code = location.countryCode || location.country_code || "XX";

          const existing = countryMap.get(country);
          if (existing) {
            existing.count++;
          } else {
            countryMap.set(country, { country, code, count: 1 });
          }
        }
      });

      const geoData: GeographicData[] = Array.from(countryMap.values())
        .map(({ country, code, count }) => ({
          country,
          countryCode: code,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 countries

      return geoData;
    } catch (error) {
      console.error("Error in getGeographicData:", error);
      return [];
    }
  },

  /**
   * Get question-by-question analytics
   */
  async getQuestionAnalytics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<QuestionAnalytics[]> {
    try {
      const dateRange = calculateDateRange(timeRange);

      // Get all questions for the form
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("id, title, type, options")
        .eq("form_id", formId)
        .order("order_position");

      if (questionsError) throw questionsError;

      // Get all responses in time range
      const { data: responses, error: responsesError } = await supabase
        .from("responses")
        .select("id")
        .eq("form_id", formId)
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString());

      if (responsesError) throw responsesError;

      const responseIds = responses?.map((r) => r.id) || [];
      const totalResponses = responseIds.length;

      if (totalResponses === 0 || !questions) {
        return [];
      }

      // Get all answers for these responses
      const { data: answers, error: answersError } = await supabase
        .from("answers")
        .select(
          "question_id, answer_text, answer_number, answer_json, answer_boolean"
        )
        .in("response_id", responseIds);

      if (answersError) throw answersError;

      // Build analytics for each question
      const questionAnalytics: QuestionAnalytics[] = questions.map(
        (question) => {
          const questionAnswers =
            answers?.filter((a) => a.question_id === question.id) || [];
          const responseCount = questionAnswers.length;
          const skipCount = totalResponses - responseCount;

          const analytics: QuestionAnalytics = {
            questionId: question.id,
            questionTitle: question.title,
            questionType: question.type,
            responseCount,
            skipCount,
          };

          // For choice-based questions, calculate option breakdown
          const choiceTypes = [
            "multiple_choice",
            "radio",
            "dropdown",
            "checkboxes",
          ];
          if (choiceTypes.includes(question.type) && question.options) {
            const optionCounts = new Map<string, number>();

            questionAnswers.forEach((answer) => {
              const value = answer.answer_text || answer.answer_json;
              if (Array.isArray(value)) {
                // For checkboxes (multiple selections)
                value.forEach((v) => {
                  optionCounts.set(v, (optionCounts.get(v) || 0) + 1);
                });
              } else if (value) {
                optionCounts.set(
                  String(value),
                  (optionCounts.get(String(value)) || 0) + 1
                );
              }
            });

            analytics.optionBreakdown = Array.from(optionCounts.entries())
              .map(([option, count]) => ({
                option,
                count,
                percentage:
                  responseCount > 0 ? (count / responseCount) * 100 : 0,
              }))
              .sort((a, b) => b.count - a.count);
          }

          // For text questions, calculate sentiment breakdown
          // TODO: Sentiment analysis not yet implemented
          // const textTypes = ['text', 'textarea', 'long_text'];
          // if (textTypes.includes(question.type)) {
          //   const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
          //
          //   questionAnswers.forEach((answer) => {
          //     if (answer.ai_sentiment) {
          //       sentimentCounts[answer.ai_sentiment as keyof typeof sentimentCounts]++;
          //     }
          //   });
          //
          //   const hasSentiment = Object.values(sentimentCounts).some(v => v > 0);
          //   if (hasSentiment) {
          //     analytics.sentimentBreakdown = sentimentCounts;
          //   }
          // }

          return analytics;
        }
      );

      return questionAnalytics;
    } catch (error) {
      console.error("Error in getQuestionAnalytics:", error);
      return [];
    }
  },

  /**
   * Get detailed question analytics with interaction tracking
   */
  async getQuestionAnalyticsDetailed(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<import("@/lib/types/analytics").QuestionAnalyticsDetailed[]> {
    try {
      const dateRange = calculateDateRange(timeRange);

      // Get all questions for the form
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("id, title, type, options, required")
        .eq("form_id", formId)
        .order("order_position");

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) return [];

      // Get all interactions for this form in time range
      const { data: interactions, error: interactionsError } = await supabase
        .from("question_interactions")
        .select("*")
        .eq("form_id", formId)
        .gte("timestamp", dateRange.start.toISOString())
        .lte("timestamp", dateRange.end.toISOString());

      if (interactionsError) {
        console.warn(
          "Question interactions not available, falling back to basic analytics:",
          interactionsError
        );
        // Fall back to basic question analytics if interactions table doesn't exist
        return this.getQuestionAnalytics(formId, timeRange) as any;
      }

      const allInteractions = interactions || [];

      // Get answers data for option breakdown and sentiment
      const { data: responses } = await supabase
        .from("responses")
        .select("id")
        .eq("form_id", formId)
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString());

      const responseIds = responses?.map((r) => r.id) || [];
      let answers: any[] = [];
      if (responseIds.length > 0) {
        const { data: answersData } = await supabase
          .from("answers")
          .select(
            "question_id, answer_text, answer_number, answer_json, answer_boolean"
          )
          .in("response_id", responseIds);
        answers = answersData || [];
      }

      // Build detailed analytics for each question
      const questionAnalytics = questions.map((question) => {
        const qInteractions = allInteractions.filter(
          (i: any) => i.question_id === question.id
        );
        const qAnswers = answers.filter((a) => a.question_id === question.id);

        // Time metrics
        const answerTimes = qInteractions
          .filter(
            (i: any) => i.interaction_type === "answered" && i.time_to_answer
          )
          .map((i: any) => i.time_to_answer);

        const avgTime =
          answerTimes.length > 0
            ? answerTimes.reduce((a: number, b: number) => a + b, 0) /
              answerTimes.length
            : 0;

        const sortedTimes = [...answerTimes].sort((a, b) => a - b);
        const medianTime =
          sortedTimes.length > 0
            ? sortedTimes[Math.floor(sortedTimes.length / 2)]
            : 0;

        // Time distribution
        const fast = answerTimes.filter((t: number) => t < 10).length;
        const normal = answerTimes.filter(
          (t: number) => t >= 10 && t <= 60
        ).length;
        const slow = answerTimes.filter((t: number) => t > 60).length;

        // Drop-off analysis
        const viewCount = qInteractions.filter(
          (i: any) => i.interaction_type === "viewed"
        ).length;
        const answerCount = qInteractions.filter(
          (i: any) => i.interaction_type === "answered"
        ).length;
        const skipCount = qInteractions.filter(
          (i: any) => i.interaction_type === "skipped"
        ).length;

        // Calculate drop-off: unique sessions that viewed but neither answered nor skipped
        const sessionsViewed = new Set(
          qInteractions
            .filter((i: any) => i.interaction_type === "viewed")
            .map((i: any) => i.session_id)
        );
        const sessionsCompleted = new Set(
          qInteractions
            .filter((i: any) =>
              ["answered", "skipped"].includes(i.interaction_type)
            )
            .map((i: any) => i.session_id)
        );
        const dropOffCount = sessionsViewed.size - sessionsCompleted.size;

        // Skip reasons analysis
        const skipReasonMap = new Map<string, number>();
        qInteractions
          .filter((i: any) => i.interaction_type === "skipped" && i.skip_reason)
          .forEach((i: any) => {
            skipReasonMap.set(
              i.skip_reason,
              (skipReasonMap.get(i.skip_reason) || 0) + 1
            );
          });

        const skipReasons = Array.from(skipReasonMap.entries()).map(
          ([reason, count]) => ({
            reason,
            count,
            percentage: skipCount > 0 ? (count / skipCount) * 100 : 0,
          })
        );

        // Edit count analysis
        const editCounts = qInteractions
          .filter(
            (i: any) => i.interaction_type === "answered" && i.edit_count > 0
          )
          .map((i: any) => i.edit_count);
        const avgEditCount =
          editCounts.length > 0
            ? editCounts.reduce((a: number, b: number) => a + b, 0) /
              editCounts.length
            : 0;

        // Validation error rate
        const withErrors = qInteractions.filter(
          (i: any) => i.validation_errors > 0
        ).length;
        const validationErrorRate =
          qInteractions.length > 0
            ? (withErrors / qInteractions.length) * 100
            : 0;

        // Retry distribution
        const firstTry = editCounts.filter((c: number) => c === 0).length;
        const fewRetries = editCounts.filter(
          (c: number) => c >= 1 && c <= 3
        ).length;
        const manyRetries = editCounts.filter((c: number) => c > 3).length;

        // Navigation patterns
        const forward = qInteractions.filter(
          (i: any) => i.navigation_direction === "forward"
        ).length;
        const backward = qInteractions.filter(
          (i: any) => i.navigation_direction === "backward"
        ).length;
        const jump = qInteractions.filter(
          (i: any) => i.navigation_direction === "jump"
        ).length;

        // Position analysis
        const positions = qInteractions
          .filter((i: any) => i.question_order)
          .map((i: any) => i.question_order);
        const avgPosition =
          positions.length > 0
            ? positions.reduce((a: number, b: number) => a + b, 0) /
              positions.length
            : 0;

        // Calculate variance
        const variance =
          positions.length > 1
            ? positions.reduce(
                (sum: number, pos: number) =>
                  sum + Math.pow(pos - avgPosition, 2),
                0
              ) / positions.length
            : 0;

        // Option breakdown (for choice questions)
        let optionBreakdown: any[] | undefined;
        const choiceTypes = [
          "multiple_choice",
          "radio",
          "dropdown",
          "checkboxes",
        ];
        if (choiceTypes.includes(question.type) && question.options) {
          const optionCounts = new Map<string, number>();

          qAnswers.forEach((answer) => {
            const value = answer.answer_text || answer.answer_json;
            if (Array.isArray(value)) {
              value.forEach((v) => {
                optionCounts.set(v, (optionCounts.get(v) || 0) + 1);
              });
            } else if (value) {
              optionCounts.set(
                String(value),
                (optionCounts.get(String(value)) || 0) + 1
              );
            }
          });

          optionBreakdown = Array.from(optionCounts.entries())
            .map(([option, count]) => ({
              option,
              count,
              percentage:
                qAnswers.length > 0 ? (count / qAnswers.length) * 100 : 0,
            }))
            .sort((a, b) => b.count - a.count);
        }

        // Sentiment breakdown (for text questions)
        // TODO: Sentiment analysis not yet implemented
        let sentimentBreakdown: any | undefined;
        // const textTypes = ['text', 'textarea', 'long_text'];
        // if (textTypes.includes(question.type)) {
        //   const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
        //
        //   qAnswers.forEach((answer) => {
        //     if (answer.ai_sentiment && answer.ai_sentiment in sentimentCounts) {
        //       sentimentCounts[answer.ai_sentiment as keyof typeof sentimentCounts]++;
        //     }
        //   });
        //
        //   const hasSentiment = Object.values(sentimentCounts).some(v => v > 0);
        //   if (hasSentiment) {
        //     sentimentBreakdown = sentimentCounts;
        //   }
        // }

        return {
          questionId: question.id,
          questionTitle: question.title,
          questionType: question.type,
          responseCount: answerCount,
          skipCount,
          averageTime: avgTime,
          // Detailed metrics
          averageTimeToAnswer: avgTime,
          medianTimeToAnswer: medianTime,
          timeDistribution: {
            fast,
            normal,
            slow,
          },
          viewCount,
          answerCount,
          dropOffCount,
          dropOffRate: viewCount > 0 ? (dropOffCount / viewCount) * 100 : 0,
          skipRate: viewCount > 0 ? (skipCount / viewCount) * 100 : 0,
          skipReasons,
          averageEditCount: avgEditCount,
          validationErrorRate,
          retryDistribution: {
            firstTry,
            fewRetries,
            manyRetries,
          },
          navigationPatterns: {
            forward,
            backward,
            jump,
          },
          averagePosition: avgPosition,
          positionVariance: variance,
          optionBreakdown,
          sentimentBreakdown,
        };
      });

      return questionAnalytics;
    } catch (error) {
      console.error("Error in getQuestionAnalyticsDetailed:", error);
      return [];
    }
  },

  /**
   * Get complete form analytics (aggregates all metrics)
   */
  async getFormAnalytics(
    formId: string,
    timeRange: TimeRangeFilter
  ): Promise<FormAnalytics> {
    try {
      // Get form details
      const { data: form, error: formError } = await supabase
        .from("forms")
        .select("title")
        .eq("id", formId)
        .single();

      if (formError) throw formError;

      // Fetch all analytics in parallel
      const [overview, trends, funnel, devices, geography, questions] =
        await Promise.all([
          this.getOverviewMetrics(formId, timeRange),
          this.getTrendData(formId, timeRange),
          this.getFunnelData(formId, timeRange),
          this.getDeviceBreakdown(formId, timeRange),
          this.getGeographicData(formId, timeRange),
          this.getQuestionAnalytics(formId, timeRange),
        ]);

      return {
        formId,
        formTitle: form.title,
        timeRange,
        overview,
        trends,
        funnel,
        devices,
        geography,
        questions,
      };
    } catch (error) {
      console.error("Error in getFormAnalytics:", error);
      throw error;
    }
  },

  /**
   * Get workspace-level analytics (aggregated across all forms)
   */
  async getWorkspaceAnalytics(
    userId: string,
    timeRange: TimeRangeFilter
  ): Promise<WorkspaceAnalytics> {
    try {
      const dateRange = calculateDateRange(timeRange);

      // Get all forms for user
      const { data: forms, error: formsError } = await supabase
        .from("forms")
        .select("id, title, status")
        .eq("created_by", userId);

      if (formsError) throw formsError;

      const formIds = forms?.map((f) => f.id) || [];
      const activeForms =
        forms?.filter((f) => f.status === "published").length || 0;

      if (formIds.length === 0) {
        // Return empty analytics
        return {
          timeRange,
          overview: {
            totalViews: 0,
            totalResponses: 0,
            completionRate: 0,
            averageTime: 0,
            viewsChange: 0,
            responsesChange: 0,
            completionRateChange: 0,
            averageTimeChange: 0,
          },
          trends: [],
          topForms: [],
          totalForms: 0,
          activeForms: 0,
        };
      }

      // Aggregate views across all forms
      const { count: totalViews } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .in("form_id", formIds)
        .eq("event_type", "form_viewed")
        .gte("timestamp", dateRange.start.toISOString())
        .lte("timestamp", dateRange.end.toISOString());

      // Aggregate responses
      const { data: responses, count: totalResponses } = await supabase
        .from("responses")
        .select("time_spent, status, started_at", { count: "exact" })
        .in("form_id", formIds)
        .eq("status", "completed")
        .gte("submitted_at", dateRange.start.toISOString())
        .lte("submitted_at", dateRange.end.toISOString());

      // Calculate metrics
      const averageTime =
        responses && responses.length > 0
          ? responses.reduce((sum, r) => sum + (r.time_spent || 0), 0) /
            responses.length
          : 0;

      const { count: starts } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .in("form_id", formIds)
        .eq("event_type", "form_started")
        .gte("timestamp", dateRange.start.toISOString())
        .lte("timestamp", dateRange.end.toISOString());

      const completionRate =
        starts && starts > 0 ? ((totalResponses || 0) / starts) * 100 : 0;

      // Get previous period for comparison
      const previousRange = calculatePreviousPeriod(dateRange);
      const { count: previousViews } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .in("form_id", formIds)
        .eq("event_type", "form_viewed")
        .gte("timestamp", previousRange.start.toISOString())
        .lte("timestamp", previousRange.end.toISOString());

      const { count: previousResponses } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .in("form_id", formIds)
        .eq("status", "completed")
        .gte("submitted_at", previousRange.start.toISOString())
        .lte("submitted_at", previousRange.end.toISOString());

      // Get top performing forms
      const formPerformances: FormPerformance[] = await Promise.all(
        forms.slice(0, 10).map(async (form) => {
          const metrics = await this.getOverviewMetrics(form.id, timeRange);
          return {
            formId: form.id,
            formTitle: form.title,
            views: metrics.totalViews,
            responses: metrics.totalResponses,
            completionRate: metrics.completionRate,
            averageTime: metrics.averageTime,
          };
        })
      );

      const topForms = formPerformances
        .sort((a, b) => b.responses - a.responses)
        .slice(0, 5);

      // Get aggregated trends
      const trendsMap = new Map<string, TrendDataPoint>();

      for (const formId of formIds) {
        const formTrends = await this.getTrendData(formId, timeRange);
        formTrends.forEach((point) => {
          const existing = trendsMap.get(point.date) || {
            date: point.date,
            views: 0,
            starts: 0,
            completions: 0,
          };
          existing.views += point.views;
          existing.starts += point.starts;
          existing.completions += point.completions;
          trendsMap.set(point.date, existing);
        });
      }

      const trends = Array.from(trendsMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      return {
        timeRange,
        overview: {
          totalViews: totalViews || 0,
          totalResponses: totalResponses || 0,
          completionRate: Math.round(completionRate),
          averageTime: Math.round(averageTime),
          viewsChange: calculatePercentageChange(
            totalViews || 0,
            previousViews || 0
          ),
          responsesChange: calculatePercentageChange(
            totalResponses || 0,
            previousResponses || 0
          ),
          completionRateChange: 0, // Could calculate if needed
          averageTimeChange: 0, // Could calculate if needed
        },
        trends,
        topForms,
        totalForms: forms.length,
        activeForms,
      };
    } catch (error) {
      console.error("Error in getWorkspaceAnalytics:", error);
      throw error;
    }
  },
};
