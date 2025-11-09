/**
 * POST /api/forms/[id]/unpublish
 * Unpublish a form (back to draft)
 */

import { NextRequest, NextResponse } from "next/server";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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

    // Unpublish form
    const updatedForm = await formService.unpublish(formId);

    return NextResponse.json({ form: updatedForm }, { status: 200 });
  } catch (error: any) {
    console.error("Error unpublishing form:", error);
    return errorResponse(error.message || "Internal server error");
  }
}
