/**
 * Answer Service
 * Database operations for answers table
 * Handles polymorphic answer storage and retrieval for form responses
 * Follows clean code principles with proper error handling and type safety
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

// Database types
type AnswerRow = Database["public"]["Tables"]["answers"]["Row"];
type AnswerInsert = Database["public"]["Tables"]["answers"]["Insert"];

/**
 * Enhanced Answer interface with type-safe value access
 */
export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  value: any;
  type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "time"
    | "datetime"
    | "json"
    | "file";
  createdAt: string;
  updatedAt: string;
}

/**
 * Text-specific answer for analysis purposes
 */
export interface TextAnswer {
  id: string;
  responseId: string;
  questionId: string;
  text: string;
  createdAt: string;
}

/**
 * Answer aggregation for analysis
 */
export interface AnswerAggregation {
  questionId: string;
  totalAnswers: number;
  uniqueAnswers: number;
  mostCommonAnswer?: string;
  averageValue?: number;
  responseRate: number;
}

/**
 * Determine the answer type and value from database row
 */
function extractAnswerTypeAndValue(row: AnswerRow): {
  type: Answer["type"];
  value: any;
} {
  if (row.answer_text !== null) return { type: "text", value: row.answer_text };
  if (row.answer_number !== null)
    return { type: "number", value: row.answer_number };
  if (row.answer_boolean !== null)
    return { type: "boolean", value: row.answer_boolean };
  if (row.answer_date !== null) return { type: "date", value: row.answer_date };
  if (row.answer_time !== null) return { type: "time", value: row.answer_time };
  if (row.answer_datetime !== null)
    return { type: "datetime", value: row.answer_datetime };
  if (row.answer_json !== null) return { type: "json", value: row.answer_json };
  if (row.answer_file_url !== null)
    return { type: "file", value: row.answer_file_url };

  return { type: "text", value: null };
}

/**
 * Transform database answer row to application Answer type
 */
function transformAnswerFromDb(row: AnswerRow): Answer {
  const { type, value } = extractAnswerTypeAndValue(row);

  return {
    id: row.id,
    responseId: row.response_id,
    questionId: row.question_id,
    value,
    type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Validate answer data before database insertion
 */
function validateAnswerData(answerData: Partial<AnswerInsert>): void {
  if (!answerData.response_id) {
    throw new Error("Response ID is required");
  }

  if (!answerData.question_id) {
    throw new Error("Question ID is required");
  }

  // Ensure only one answer field is set
  const answerFields = [
    answerData.answer_text,
    answerData.answer_number,
    answerData.answer_boolean,
    answerData.answer_date,
    answerData.answer_time,
    answerData.answer_datetime,
    answerData.answer_json,
    answerData.answer_file_url,
  ];

  const setFields = answerFields.filter(
    (field) => field !== null && field !== undefined
  );
  if (setFields.length === 0) {
    throw new Error("At least one answer value must be provided");
  }

  if (setFields.length > 1) {
    throw new Error("Only one answer value type should be set");
  }
}

/**
 * Answer Service
 * Provides clean, type-safe database operations for form answers
 */
export const answerService = {
  /**
   * Get all answers for a specific response
   */
  async getByResponseId(responseId: string): Promise<Answer[]> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("response_id", responseId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching answers by response:", error);
        throw new Error(`Failed to fetch answers: ${error.message}`);
      }

      return (data || []).map(transformAnswerFromDb);
    } catch (error) {
      console.error("Error in getByResponseId:", error);
      throw error;
    }
  },

  /**
   * Get all answers for a specific question across all responses
   */
  async getByQuestionId(questionId: string): Promise<Answer[]> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching answers by question:", error);
        throw new Error(`Failed to fetch answers: ${error.message}`);
      }

      return (data || []).map(transformAnswerFromDb);
    } catch (error) {
      console.error("Error in getByQuestionId:", error);
      throw error;
    }
  },

  /**
   * Get all text answers for a form (useful for sentiment analysis)
   */
  async getTextAnswers(formId: string): Promise<TextAnswer[]> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .select(
          `
          id,
          response_id,
          question_id,
          answer_text,
          created_at,
          responses!inner(form_id)
        `
        )
        .eq("responses.form_id", formId)
        .not("answer_text", "is", null);

      if (error) {
        console.error("Error fetching text answers:", error);
        throw new Error(`Failed to fetch text answers: ${error.message}`);
      }

      return (data || []).map((row) => ({
        id: row.id,
        responseId: row.response_id,
        questionId: row.question_id,
        text: row.answer_text!,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error in getTextAnswers:", error);
      throw error;
    }
  },

  /**
   * Get aggregated statistics for answers to a specific question
   */
  async getQuestionAggregation(
    questionId: string,
    totalResponses: number
  ): Promise<AnswerAggregation> {
    try {
      const answers = await this.getByQuestionId(questionId);
      const totalAnswers = answers.length;
      const responseRate =
        totalResponses > 0 ? (totalAnswers / totalResponses) * 100 : 0;

      // Count unique answers
      const uniqueValues = new Set(answers.map((a) => JSON.stringify(a.value)));
      const uniqueAnswers = uniqueValues.size;

      // Find most common answer
      const valueCounts = new Map<string, number>();
      answers.forEach((answer) => {
        const key = JSON.stringify(answer.value);
        valueCounts.set(key, (valueCounts.get(key) || 0) + 1);
      });

      let mostCommonAnswer: string | undefined;
      let maxCount = 0;
      valueCounts.forEach((count, value) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonAnswer = JSON.parse(value);
        }
      });

      // Calculate average for numeric answers
      let averageValue: number | undefined;
      const numericAnswers = answers.filter(
        (a) => a.type === "number" && typeof a.value === "number"
      );
      if (numericAnswers.length > 0) {
        const sum = numericAnswers.reduce(
          (acc, a) => acc + (a.value as number),
          0
        );
        averageValue = sum / numericAnswers.length;
      }

      return {
        questionId,
        totalAnswers,
        uniqueAnswers,
        mostCommonAnswer,
        averageValue,
        responseRate: Math.round(responseRate),
      };
    } catch (error) {
      console.error("Error in getQuestionAggregation:", error);
      throw error;
    }
  },

  /**
   * Create a single answer
   */
  async create(answerData: Partial<AnswerInsert>): Promise<Answer> {
    try {
      validateAnswerData(answerData);

      const { data, error } = await supabase
        .from("answers")
        .insert(answerData)
        .select()
        .single();

      if (error) {
        console.error("Error creating answer:", error);
        throw new Error(`Failed to create answer: ${error.message}`);
      }

      return transformAnswerFromDb(data);
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  },

  /**
   * Create multiple answers in a batch operation
   */
  async createMany(answersData: Partial<AnswerInsert>[]): Promise<Answer[]> {
    try {
      // Validate all answers before insertion
      answersData.forEach(validateAnswerData);

      const { data, error } = await supabase
        .from("answers")
        .insert(answersData)
        .select();

      if (error) {
        console.error("Error creating answers:", error);
        throw new Error(`Failed to create answers: ${error.message}`);
      }

      return (data || []).map(transformAnswerFromDb);
    } catch (error) {
      console.error("Error in createMany:", error);
      throw error;
    }
  },

  /**
   * Update an answer
   */
  async update(
    answerId: string,
    updates: Partial<AnswerInsert>
  ): Promise<Answer> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .update(updates)
        .eq("id", answerId)
        .select()
        .single();

      if (error) {
        console.error("Error updating answer:", error);
        throw new Error(`Failed to update answer: ${error.message}`);
      }

      return transformAnswerFromDb(data);
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  },

  /**
   * Delete an answer
   */
  async delete(answerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("answers")
        .delete()
        .eq("id", answerId);

      if (error) {
        console.error("Error deleting answer:", error);
        throw new Error(`Failed to delete answer: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  },

  /**
   * Delete all answers for a response
   */
  async deleteByResponseId(responseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("answers")
        .delete()
        .eq("response_id", responseId);

      if (error) {
        console.error("Error deleting answers by response:", error);
        throw new Error(`Failed to delete answers: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deleteByResponseId:", error);
      throw error;
    }
  },

  /**
   * Search answers by text content
   */
  async searchTextAnswers(
    formId: string,
    searchTerm: string
  ): Promise<TextAnswer[]> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .select(
          `
          id,
          response_id,
          question_id,
          answer_text,
          created_at,
          responses!inner(form_id)
        `
        )
        .eq("responses.form_id", formId)
        .ilike("answer_text", `%${searchTerm}%`)
        .not("answer_text", "is", null);

      if (error) {
        console.error("Error searching text answers:", error);
        throw new Error(`Failed to search text answers: ${error.message}`);
      }

      return (data || []).map((row) => ({
        id: row.id,
        responseId: row.response_id,
        questionId: row.question_id,
        text: row.answer_text!,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error in searchTextAnswers:", error);
      throw error;
    }
  },
};
