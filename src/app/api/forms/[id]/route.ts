/**
 * GET /api/forms/[id]
 * Get a specific form by ID
 *
 * PUT /api/forms/[id]
 * Update a specific form
 *
 * DELETE /api/forms/[id]
 * Delete a specific form
 */

import { NextRequest, NextResponse } from "next/server";
import { formService } from "@/lib/database/services/form.service";
import { questionService } from "@/lib/database/services/question.service";
import { getAuthUser, unauthorizedResponse, errorResponse } from "@/lib/api/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/forms/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const formId = params.id;

    // Get form
    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (form.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Get questions for the form
    const questions = await questionService.getByFormId(formId);

    return NextResponse.json({ form, questions }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching form:", error);
    return errorResponse(error.message || "Internal server error");
  }
}

/**
 * PUT /api/forms/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const formId = params.id;

    // Get existing form
    const existingForm = await formService.getById(formId);
    if (!existingForm) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (existingForm.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Parse request body
    const body = await request.json();

    // If slug is being updated, check availability
    if (body.slug && body.slug !== existingForm.slug) {
      const isSlugAvailable = await formService.isSlugAvailable(body.slug, formId);
      if (!isSlugAvailable) {
        return errorResponse("Slug is already taken", 400);
      }
    }

    // Update form
    const updatedForm = await formService.update(formId, body);

    // If questions are included, sync them
    if (body.questions) {
      await questionService.syncQuestions(formId, body.questions);
    }

    // Get updated questions
    const questions = await questionService.getByFormId(formId);

    return NextResponse.json({ form: updatedForm, questions }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating form:", error);
    return errorResponse(error.message || "Internal server error");
  }
}

/**
 * DELETE /api/forms/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const formId = params.id;

    // Get existing form
    const existingForm = await formService.getById(formId);
    if (!existingForm) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (existingForm.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Soft delete form (questions will be cascade deleted)
    await formService.delete(formId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting form:", error);
    return errorResponse(error.message || "Internal server error");
  }
}
