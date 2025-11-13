/**
 * GET /api/forms
 * Get all forms for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { formService } from "@/lib/database/services/form.service";
import { responseService } from "@/lib/database/services/response.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Fetch forms
    const forms = await formService.getByUserId(authUser.userId, {
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    // Fetch response counts for each form
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        try {
          const responseCount = await responseService.getCount(form.id);
          return {
            ...form,
            responseCount,
          };
        } catch (error) {
          console.error(
            `Error getting response count for form ${form.id}:`,
            error
          );
          return {
            ...form,
            responseCount: 0,
          };
        }
      })
    );

    return NextResponse.json({ forms: formsWithCounts }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching forms:", error);
    return errorResponse(error.message || "Internal server error");
  }
}

/**
 * POST /api/forms
 * Create a new form
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return errorResponse("Title is required", 400);
    }

    // Create form
    const form = await formService.create(body, authUser.userId);

    return NextResponse.json({ form }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating form:", error);
    return errorResponse(error.message || "Internal server error");
  }
}
