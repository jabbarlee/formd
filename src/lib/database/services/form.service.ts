/**
 * Form Service
 * Database operations for forms table
 * Follows clean code principles with proper error handling
 */

import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { Form, FormStatus } from "@/lib/types/forms";
import { Database } from "@/lib/supabase/types";

// Database types
type FormRow = Database["public"]["Tables"]["forms"]["Row"];
type FormInsert = Database["public"]["Tables"]["forms"]["Insert"];
type FormUpdate = Database["public"]["Tables"]["forms"]["Update"];

/**
 * Transform database row to application Form type
 */
function transformFormFromDb(row: FormRow): Form {
  return {
    id: row.id,
    workspaceId: row.workspace_id || undefined,
    createdBy: row.created_by,
    title: row.title,
    description: row.description || undefined,
    status: row.status as FormStatus,
    theme: (row.theme as any) || undefined,
    settings: (row.settings as any) || undefined,
    coverImage: row.cover_image || undefined,
    logo: row.logo || undefined,
    unifiedCardLayout: row.unified_card_layout || false,
    hasDueDate: row.has_due_date || false,
    dueDate: row.due_date || undefined,
    includeTime: row.include_time || false,
    dueTime: row.due_time || undefined,
    hasLocation: row.has_location || false,
    location: row.location || undefined,
    requiresPassword: row.requires_password || false,
    passwordHash: row.password_hash || undefined,
    publishedAt: row.published_at || undefined,
    closedAt: row.closed_at || undefined,
    responseLimit: row.response_limit || undefined,
    closeDate: row.close_date || undefined,
    allowMultipleResponses: row.allow_multiple_responses || false,
    showProgressBar: row.show_progress_bar || true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Transform application Form type to database insert format
 */
function transformFormToDb(
  form: Partial<Form>,
  userId: string
): Partial<FormInsert> {
  return {
    id: form.id, // Allow custom UUID
    created_by: userId,
    title: form.title,
    description: form.description,
    status: form.status,
    theme: form.theme as any,
    settings: form.settings as any,
    cover_image: form.coverImage,
    logo: form.logo,
    unified_card_layout: form.unifiedCardLayout,
    has_due_date: form.hasDueDate,
    due_date: form.dueDate,
    include_time: form.includeTime,
    due_time: form.dueTime,
    has_location: form.hasLocation,
    location: form.location,
    requires_password: form.requiresPassword,
    password_hash: form.passwordHash,
    published_at: form.publishedAt,
    closed_at: form.closedAt,
    response_limit: form.responseLimit,
    close_date: form.closeDate,
    allow_multiple_responses: form.allowMultipleResponses,
    show_progress_bar: form.showProgressBar,
  };
}

export const formService = {
  /**
   * Create a new form
   */
  async create(form: Partial<Form>, userId: string): Promise<Form> {
    const formData = transformFormToDb(form, userId);

    const { data, error } = await supabase
      .from("forms")
      .insert(formData)
      .select()
      .single();

    if (error) {
      console.error("Error creating form:", error);
      throw new Error(`Failed to create form: ${error.message}`);
    }

    return transformFormFromDb(data);
  },

  /**
   * Get form by ID
   */
  async getById(formId: string): Promise<Form | null> {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", formId)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      console.error("Error fetching form:", error);
      throw new Error(`Failed to fetch form: ${error.message}`);
    }

    return transformFormFromDb(data);
  },

  /**
   * Get form by slug
   */

  /**
   * Get all forms for a user
   */
  async getByUserId(
    userId: string,
    options?: {
      status?: FormStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<Form[]> {
    let query = supabase
      .from("forms")
      .select("*")
      .eq("created_by", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user forms:", error);
      throw new Error(`Failed to fetch forms: ${error.message}`);
    }

    return data.map(transformFormFromDb);
  },

  /**
   * Update form
   */
  async update(formId: string, updates: Partial<Form>): Promise<Form> {
    // Remove fields that shouldn't be updated
    const { id, createdBy, createdAt, ...updateData } = updates as any;

    console.log("🔄 Updating form with data:", {
      formId,
      unifiedCardLayout: updateData.unifiedCardLayout,
      updates: Object.keys(updateData),
    });

    // Transform to database format
    const dbUpdates: Partial<FormUpdate> = {
      title: updateData.title,
      description: updateData.description,
      status: updateData.status,
      theme: updateData.theme as any,
      settings: updateData.settings as any,
      cover_image: updateData.coverImage,
      logo: updateData.logo,
      unified_card_layout: updateData.unifiedCardLayout,
      has_due_date: updateData.hasDueDate,
      due_date: updateData.dueDate,
      include_time: updateData.includeTime,
      due_time: updateData.dueTime,
      has_location: updateData.hasLocation,
      location: updateData.location,
      requires_password: updateData.requiresPassword,
      password_hash: updateData.passwordHash,
      published_at: updateData.publishedAt,
      closed_at: updateData.closedAt,
      response_limit: updateData.responseLimit,
      close_date: updateData.closeDate,
      allow_multiple_responses: updateData.allowMultipleResponses,
      show_progress_bar: updateData.showProgressBar,
    };

    // Remove undefined values
    Object.keys(dbUpdates).forEach((key) => {
      if (dbUpdates[key as keyof FormUpdate] === undefined) {
        delete dbUpdates[key as keyof FormUpdate];
      }
    });

    console.log("💾 Sending to database:", {
      unified_card_layout: dbUpdates.unified_card_layout,
      dbFields: Object.keys(dbUpdates),
    });

    // If no fields to update, just return the existing form
    if (Object.keys(dbUpdates).length === 0) {
      console.log("⏭️ No form fields to update, fetching existing form");
      const existingForm = await this.getById(formId);
      if (!existingForm) {
        throw new Error("Form not found");
      }
      return existingForm;
    }

    const { data, error } = await supabase
      .from("forms")
      .update(dbUpdates)
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating form:", error);
      throw new Error(`Failed to update form: ${error.message}`);
    }

    console.log(
      "✅ Form updated, unified_card_layout in response:",
      data.unified_card_layout
    );

    return transformFormFromDb(data);
  },

  /**
   * Soft delete form
   */
  async delete(formId: string): Promise<void> {
    const { error } = await supabase
      .from("forms")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", formId);

    if (error) {
      console.error("Error deleting form:", error);
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  },

  /**
   * Publish form
   */
  async publish(formId: string): Promise<Form> {
    const { data, error } = await supabase
      .from("forms")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Error publishing form:", error);
      throw new Error(`Failed to publish form: ${error.message}`);
    }

    return transformFormFromDb(data);
  },

  /**
   * Unpublish form (back to draft)
   */
  async unpublish(formId: string): Promise<Form> {
    const { data, error } = await supabase
      .from("forms")
      .update({
        status: "draft",
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Error unpublishing form:", error);
      throw new Error(`Failed to unpublish form: ${error.message}`);
    }

    return transformFormFromDb(data);
  },

  /**
   * Close form
   */
  async close(formId: string): Promise<Form> {
    const { data, error } = await supabase
      .from("forms")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Error closing form:", error);
      throw new Error(`Failed to close form: ${error.message}`);
    }

    return transformFormFromDb(data);
  },

  /**
   * Get form statistics
   */
  async getStats(formId: string): Promise<{
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    avgCompletionRate: number;
  }> {
    const { data, error } = await supabase
      .from("form_stats")
      .select("*")
      .eq("id", formId)
      .single();

    if (error) {
      console.error("Error fetching form stats:", error);
      return {
        totalResponses: 0,
        completedResponses: 0,
        partialResponses: 0,
        avgCompletionRate: 0,
      };
    }

    return {
      totalResponses: data.total_responses || 0,
      completedResponses: data.completed_responses || 0,
      partialResponses: data.partial_responses || 0,
      avgCompletionRate: data.avg_completion_rate || 0,
    };
  },

  /**
   * Check if a slug is available for use
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("id")
        .eq("slug", slug)
        .is("deleted_at", null)
        .limit(1);

      if (error) {
        console.error("Error checking slug availability:", error);
        throw new Error(`Failed to check slug availability: ${error.message}`);
      }

      return (data?.length ?? 0) === 0;
    } catch (error) {
      console.error("Error in isSlugAvailable:", error);
      throw error;
    }
  },
};
