/**
 * Response Service
 * Database operations for responses and answers tables
 * Handles form submission data retrieval, filtering, and analytics
 * Follows clean code principles with proper error handling and type safety
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import {
  FormResponse,
  ResponseFilters,
  ResponseStats,
  DeviceType,
  ResponseStatus,
} from "@/lib/types/forms";
import { Database } from "@/lib/supabase/types";

// Database types
type ResponseRow = Database["public"]["Tables"]["responses"]["Row"];
type AnswerRow = Database["public"]["Tables"]["answers"]["Row"];

/**
 * Interface for response with aggregated answers
 */
interface ResponseWithAnswers extends ResponseRow {
  answers: AnswerRow[];
}

/**
 * Transform polymorphic answer value to appropriate JavaScript type
 */
function getAnswerValue(answer: AnswerRow): any {
  if (answer.answer_text !== null) return answer.answer_text;
  if (answer.answer_number !== null) return answer.answer_number;
  if (answer.answer_boolean !== null) return answer.answer_boolean;
  if (answer.answer_date !== null) return answer.answer_date;
  if (answer.answer_time !== null) return answer.answer_time;
  if (answer.answer_datetime !== null) return answer.answer_datetime;
  if (answer.answer_json !== null) return answer.answer_json;
  if (answer.answer_file_url !== null) return answer.answer_file_url;
  return null;
}

/**
 * Transform answers array into data object keyed by question ID
 */
function transformAnswersToData(answers: AnswerRow[]): Record<string, any> {
  return answers.reduce((acc, answer) => {
    const value = getAnswerValue(answer);
    if (value !== null) {
      acc[answer.question_id] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Transform database response row to application FormResponse type
 */
function transformResponseFromDb(
  responseWithAnswers: ResponseWithAnswers
): FormResponse {
  const { answers, ...response } = responseWithAnswers;

  return {
    id: response.id,
    formId: response.form_id,
    submittedAt: response.submitted_at || response.created_at,
    status: response.status as ResponseStatus,
    respondent: {
      name: response.respondent_name || undefined,
      email: response.respondent_email || undefined,
      userId: response.respondent_user_id || undefined,
    },
    completionTime: response.time_spent || undefined,
    device: (response.device_type as DeviceType) || undefined,
    location: (response.location as string) || undefined,
    data: transformAnswersToData(answers),
  };
}

/**
 * Build dynamic query filters for responses
 */
function buildResponseFilters(baseQuery: any, filters: ResponseFilters) {
  let query = baseQuery;

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.device && filters.device !== "all") {
    query = query.eq("device_type", filters.device);
  }

  if (filters.dateFrom) {
    query = query.gte("submitted_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("submitted_at", filters.dateTo);
  }

  if (filters.search) {
    // Search across respondent name and email
    query = query.or(
      `respondent_name.ilike.%${filters.search}%,respondent_email.ilike.%${filters.search}%`
    );
  }

  return query;
}

/**
 * Calculate response statistics for a form
 */
async function calculateStats(formId: string): Promise<ResponseStats> {
  const { data: responses, error } = await supabase
    .from("responses")
    .select("status, completion_percentage, time_spent, created_at")
    .eq("form_id", formId);

  if (error) {
    console.error("Error calculating response stats:", error);
    throw new Error(`Failed to calculate stats: ${error.message}`);
  }

  const total = responses.length;
  const completed = responses.filter((r) => r.status === "completed").length;
  const partial = responses.filter((r) => r.status === "in_progress").length;
  const flagged = responses.filter((r) => r.status === "flagged").length;

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  // Calculate average time for completed responses
  const completedWithTime = responses.filter(
    (r) => r.status === "completed" && r.time_spent
  );
  const averageTime =
    completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => sum + (r.time_spent || 0), 0) /
        completedWithTime.length
      : 0;

  // Count today's responses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = responses.filter((r) => {
    const responseDate = new Date(r.created_at);
    responseDate.setHours(0, 0, 0, 0);
    return responseDate.getTime() === today.getTime();
  }).length;

  // Calculate week growth (placeholder - would need historical data)
  const weekGrowth = 0; // TODO: Implement proper week-over-week calculation

  return {
    total,
    completed,
    partial,
    flagged,
    completionRate: Math.round(completionRate),
    averageTime: Math.round(averageTime),
    todayCount,
    weekGrowth,
  };
}

/**
 * Response Service
 * Provides clean, type-safe database operations for form responses
 */
export const responseService = {
  /**
   * Get all responses for a form with optional filtering
   */
  async getByFormId(
    formId: string,
    filters: ResponseFilters = {},
    options: { limit?: number; offset?: number } = {}
  ): Promise<FormResponse[]> {
    try {
      // Base query with answers joined
      let query = supabase
        .from("responses")
        .select(
          `
          *,
          answers:answers(*)
        `
        )
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      // Apply filters
      query = buildResponseFilters(query, filters);

      // Apply pagination
      if (options.limit) {
        const from = options.offset || 0;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching responses:", error);
        throw new Error(`Failed to fetch responses: ${error.message}`);
      }

      // Transform the data
      return (data || []).map((responseWithAnswers: any) =>
        transformResponseFromDb(responseWithAnswers as ResponseWithAnswers)
      );
    } catch (error) {
      console.error("Error in getByFormId:", error);
      throw error;
    }
  },

  /**
   * Get a single response by ID with full answer details
   */
  async getById(responseId: string): Promise<FormResponse | null> {
    try {
      const { data, error } = await supabase
        .from("responses")
        .select(
          `
          *,
          answers:answers(*)
        `
        )
        .eq("id", responseId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        console.error("Error fetching response:", error);
        throw new Error(`Failed to fetch response: ${error.message}`);
      }

      return transformResponseFromDb(data as ResponseWithAnswers);
    } catch (error) {
      console.error("Error in getById:", error);
      throw error;
    }
  },

  /**
   * Get response statistics for a form
   */
  async getStats(formId: string): Promise<ResponseStats> {
    try {
      return await calculateStats(formId);
    } catch (error) {
      console.error("Error in getStats:", error);
      throw error;
    }
  },

  /**
   * Soft delete a response and its answers
   */
  async delete(responseId: string): Promise<void> {
    try {
      // Note: Answers will be cascade deleted due to FK constraint
      const { error } = await supabase
        .from("responses")
        .delete()
        .eq("id", responseId);

      if (error) {
        console.error("Error deleting response:", error);
        throw new Error(`Failed to delete response: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  /**
   * Flag a response for review
   */
  async flag(responseId: string): Promise<FormResponse> {
    try {
      const { data, error } = await supabase
        .from("responses")
        .update({ status: "flagged" })
        .eq("id", responseId)
        .select(
          `
          *,
          answers:answers(*)
        `
        )
        .single();

      if (error) {
        console.error("Error flagging response:", error);
        throw new Error(`Failed to flag response: ${error.message}`);
      }

      return transformResponseFromDb(data as ResponseWithAnswers);
    } catch (error) {
      console.error("Error in flag:", error);
      throw error;
    }
  },

  /**
   * Check if a form has responses
   */
  async hasResponses(formId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("responses")
        .select("id")
        .eq("form_id", formId)
        .limit(1);

      if (error) {
        console.error("Error checking responses:", error);
        throw new Error(`Failed to check responses: ${error.message}`);
      }

      return (data?.length ?? 0) > 0;
    } catch (error) {
      console.error("Error in hasResponses:", error);
      throw error;
    }
  },

  /**
   * Get response count for a form
   */
  async getCount(formId: string, status?: ResponseStatus): Promise<number> {
    try {
      let query = supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("form_id", formId);

      if (status) {
        query = query.eq("status", status);
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error counting responses:", error);
        throw new Error(`Failed to count responses: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getCount:", error);
      throw error;
    }
  },
};
