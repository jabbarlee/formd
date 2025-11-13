/**
 * GET /api/forms/[id]/responses/[responseId]
 * Get detailed information about a specific response
 *
 * DELETE /api/forms/[id]/responses/[responseId]
 * Delete a specific response and all its answers
 */

import { NextRequest, NextResponse } from "next/server";
import { responseService } from "@/lib/database/services/response.service";
import { formService } from "@/lib/database/services/form.service";
import { questionService } from "@/lib/database/services/question.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";
import { ResponseDetail } from "@/lib/types/forms";

interface RouteContext {
  params: Promise<{
    id: string;
    responseId: string;
  }>;
}

/**
 * Transform response data to detailed view with question context
 */
async function transformToDetailedResponse(
  response: any,
  questions: any[]
): Promise<ResponseDetail> {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const answers = Object.entries(response.data || {}).map(
    ([questionId, value]) => {
      const question = questionMap.get(questionId);
      return {
        questionId,
        questionTitle: question?.title || "Unknown Question",
        questionType: question?.type || "short_text",
        value,
        displayValue: formatDisplayValue(value, question?.type),
      };
    }
  );

  return {
    ...response,
    answers,
    metadata: {
      browser: undefined, // These would come from the response table if tracked
      os: undefined,
      ipAddress: undefined,
      referrer: undefined,
      userAgent: undefined,
    },
  };
}

/**
 * Format answer value for display purposes
 */
function formatDisplayValue(value: any, questionType?: string): string {
  if (value === null || value === undefined) return "No answer";

  switch (questionType) {
    case "date":
      return new Date(value).toLocaleDateString();
    case "datetime":
      return new Date(value).toLocaleString();
    case "multiple_choice":
    case "checkboxes":
      return Array.isArray(value) ? value.join(", ") : String(value);
    case "file_upload":
      return value ? "File uploaded" : "No file";
    case "star_rating":
      return `${value}/5 stars`;
    case "linear_scale":
      return `${value}/10`;
    case "nps":
      return `${value}/10 (NPS)`;
    default:
      return String(value);
  }
}

/**
 * GET /api/forms/[id]/responses/[responseId]
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: formId, responseId } = await params;

    // Verify form exists and user has access
    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (form.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Get response details
    const response = await responseService.getById(responseId);
    if (!response) {
      return errorResponse("Response not found", 404);
    }

    // Verify response belongs to the form
    if (response.formId !== formId) {
      return errorResponse("Response does not belong to this form", 400);
    }

    // Get form questions for context
    const questions = await questionService.getByFormId(formId);

    // Transform to detailed response
    const detailedResponse = await transformToDetailedResponse(
      response,
      questions
    );

    return NextResponse.json(
      {
        response: detailedResponse,
        form: {
          id: form.id,
          title: form.title,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching response details:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * DELETE /api/forms/[id]/responses/[responseId]
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: formId, responseId } = await params;

    // Verify form exists and user has access
    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (form.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Verify response exists and belongs to the form
    const response = await responseService.getById(responseId);
    if (!response) {
      return errorResponse("Response not found", 404);
    }

    if (response.formId !== formId) {
      return errorResponse("Response does not belong to this form", 400);
    }

    // Delete the response (answers will be cascade deleted)
    await responseService.delete(responseId);

    return NextResponse.json(
      {
        success: true,
        message: "Response deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting response:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
