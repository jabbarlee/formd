/**
 * POST /api/forms/[id]/responses/[responseId]/flag
 * Flag a response for review
 */

import { NextRequest, NextResponse } from "next/server";
import { responseService } from "@/lib/database/services/response.service";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

interface RouteContext {
  params: Promise<{
    id: string;
    responseId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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
    const existingResponse = await responseService.getById(responseId);
    if (!existingResponse) {
      return errorResponse("Response not found", 404);
    }

    if (existingResponse.formId !== formId) {
      return errorResponse("Response does not belong to this form", 400);
    }

    // Check if response is already flagged
    if (existingResponse.status === "flagged") {
      return errorResponse("Response is already flagged", 400);
    }

    // Flag the response
    const flaggedResponse = await responseService.flag(responseId);

    return NextResponse.json(
      {
        success: true,
        response: flaggedResponse,
        message: "Response flagged for review",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error flagging response:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
