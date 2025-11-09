/**
 * Question Service
 * Database operations for questions table
 * Supports batch operations for performance
 */

import { supabase } from "@/lib/supabase/client";
import { Question } from "@/lib/types/forms";
import { Database } from "@/lib/supabase/types";

// Database types
type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
type QuestionInsert = Database["public"]["Tables"]["questions"]["Insert"];
type QuestionUpdate = Database["public"]["Tables"]["questions"]["Update"];

/**
 * Transform database row to application Question type
 */
function transformQuestionFromDb(row: QuestionRow): Question {
  return {
    id: row.id,
    formId: row.form_id,
    type: row.type as any,
    title: row.title,
    description: row.description || undefined,
    placeholder: row.placeholder || undefined,
    required: row.required,
    order: row.order_position,
    options: (row.options as any) || undefined,
    validation: (row.validation as any) || undefined,
    logic: (row.logic as any) || undefined,
    settings: (row.settings as any) || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Transform application Question type to database insert format
 */
function transformQuestionToDb(question: Partial<Question>): Partial<QuestionInsert> {
  return {
    form_id: question.formId,
    type: question.type,
    title: question.title,
    description: question.description,
    placeholder: question.placeholder,
    required: question.required,
    order_position: question.order,
    options: question.options as any,
    validation: question.validation as any,
    logic: question.logic as any,
    settings: question.settings as any,
  };
}

export const questionService = {
  /**
   * Create a single question
   */
  async create(question: Partial<Question>): Promise<Question> {
    const questionData = transformQuestionToDb(question);

    const { data, error } = await supabase
      .from("questions")
      .insert(questionData)
      .select()
      .single();

    if (error) {
      console.error("Error creating question:", error);
      throw new Error(`Failed to create question: ${error.message}`);
    }

    return transformQuestionFromDb(data);
  },

  /**
   * Create multiple questions (batch operation)
   */
  async createMany(questions: Partial<Question>[]): Promise<Question[]> {
    const questionsData = questions.map(transformQuestionToDb);

    const { data, error } = await supabase
      .from("questions")
      .insert(questionsData)
      .select();

    if (error) {
      console.error("Error creating questions:", error);
      throw new Error(`Failed to create questions: ${error.message}`);
    }

    return data.map(transformQuestionFromDb);
  },

  /**
   * Get question by ID
   */
  async getById(questionId: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("Error fetching question:", error);
      throw new Error(`Failed to fetch question: ${error.message}`);
    }

    return transformQuestionFromDb(data);
  },

  /**
   * Get all questions for a form
   */
  async getByFormId(formId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("form_id", formId)
      .order("order_position", { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return data.map(transformQuestionFromDb);
  },

  /**
   * Update a single question
   */
  async update(questionId: string, updates: Partial<Question>): Promise<Question> {
    // Remove fields that shouldn't be updated
    const { id, formId, createdAt, ...updateData } = updates as any;

    // Transform to database format
    const dbUpdates: Partial<QuestionUpdate> = {
      type: updateData.type,
      title: updateData.title,
      description: updateData.description,
      placeholder: updateData.placeholder,
      required: updateData.required,
      order_position: updateData.order,
      options: updateData.options as any,
      validation: updateData.validation as any,
      logic: updateData.logic as any,
      settings: updateData.settings as any,
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach((key) => {
      if (dbUpdates[key as keyof QuestionUpdate] === undefined) {
        delete dbUpdates[key as keyof QuestionUpdate];
      }
    });

    const { data, error } = await supabase
      .from("questions")
      .update(dbUpdates)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating question:", error);
      throw new Error(`Failed to update question: ${error.message}`);
    }

    return transformQuestionFromDb(data);
  },

  /**
   * Batch update multiple questions
   * More efficient than updating one by one
   */
  async updateMany(
    updates: Array<{ id: string; data: Partial<Question> }>
  ): Promise<Question[]> {
    // Supabase doesn't support batch updates natively, so we use Promise.all
    const updatePromises = updates.map(({ id, data }) =>
      this.update(id, data)
    );

    try {
      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error("Error in batch update:", error);
      throw error;
    }
  },

  /**
   * Delete a single question
   */
  async delete(questionId: string): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting question:", error);
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  },

  /**
   * Delete multiple questions (batch operation)
   */
  async deleteMany(questionIds: string[]): Promise<void> {
    const { error } = await supabase
      .from("questions")
      .delete()
      .in("id", questionIds);

    if (error) {
      console.error("Error deleting questions:", error);
      throw new Error(`Failed to delete questions: ${error.message}`);
    }
  },

  /**
   * Reorder questions for a form
   * Updates all question orders in a single transaction
   */
  async reorder(formId: string, questionOrders: Array<{ id: string; order: number }>): Promise<void> {
    // Update each question's order
    const updatePromises = questionOrders.map(({ id, order }) =>
      supabase
        .from("questions")
        .update({ order_position: order })
        .eq("id", id)
        .eq("form_id", formId)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error("Error reordering questions:", errors);
      throw new Error("Failed to reorder questions");
    }
  },

  /**
   * Duplicate a question
   */
  async duplicate(questionId: string, newOrder: number): Promise<Question> {
    // Get original question
    const original = await this.getById(questionId);
    if (!original) {
      throw new Error("Question not found");
    }

    // Create duplicate with new order
    const duplicate: Partial<Question> = {
      ...original,
      id: undefined, // Let database generate new ID
      title: `${original.title} (Copy)`,
      order: newOrder,
    };

    return this.create(duplicate);
  },

  /**
   * Sync questions with form
   * Handles create, update, and delete operations in a single call
   * This is efficient for auto-save scenarios
   */
  async syncQuestions(
    formId: string,
    questions: Question[]
  ): Promise<Question[]> {
    // Get existing questions
    const existing = await this.getByFormId(formId);
    const existingIds = new Set(existing.map((q) => q.id));
    const incomingIds = new Set(questions.map((q) => q.id));

    // Determine operations
    const toCreate = questions.filter((q) => !existingIds.has(q.id));
    const toUpdate = questions.filter((q) => existingIds.has(q.id));
    const toDelete = existing.filter((q) => !incomingIds.has(q.id));

    try {
      // Execute operations in parallel
      const [created, updated] = await Promise.all([
        toCreate.length > 0 ? this.createMany(toCreate) : Promise.resolve([]),
        toUpdate.length > 0
          ? this.updateMany(toUpdate.map((q) => ({ id: q.id, data: q })))
          : Promise.resolve([]),
        toDelete.length > 0
          ? this.deleteMany(toDelete.map((q) => q.id))
          : Promise.resolve(),
      ]);

      // Return all questions for the form
      return this.getByFormId(formId);
    } catch (error) {
      console.error("Error syncing questions:", error);
      throw new Error("Failed to sync questions");
    }
  },
};
