/**
 * Public Form API Endpoint
 * GET /api/public/forms/[id]
 *
 * Fetch form data for public viewing (no authentication required)
 * Uses UUID lookup only
 */

import { NextRequest, NextResponse } from "next/server";
import { formService } from "@/lib/database/services/form.service";
import { questionService } from "@/lib/database/services/question.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/public/forms/[id]
 * Fetch form by UUID for public viewing
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    // Fetch form by UUID only
    const form = await formService.getById(id);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Only allow access to published forms
    if (form.status !== "published") {
      return NextResponse.json(
        {
          error: "Form is not available",
          status: form.status,
        },
        { status: 403 }
      );
    }

    // Check if form has reached response limit
    if (form.responseLimit && form.responseLimit > 0) {
      // TODO: Check actual response count when responses are implemented
      // For now, we'll allow access
    }

    // Check if form is closed by date
    if (form.closeDate) {
      const closeDate = new Date(form.closeDate);
      const now = new Date();
      if (now > closeDate) {
        return NextResponse.json({ error: "Form is closed" }, { status: 403 });
      }
    }

    // Get questions for the form
    const questions = await questionService.getByFormId(form.id);

    // Remove sensitive information before sending to client
    const publicForm = {
      ...form,
      passwordHash: undefined, // Never send password hash
      createdBy: undefined, // Don't expose creator ID
      workspaceId: undefined, // Don't expose workspace ID
    };

    return NextResponse.json(
      {
        form: publicForm,
        questions,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching public form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    );
  }
}
