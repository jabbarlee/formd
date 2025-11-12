/**
 * GET /api/forms/[id]/responses/export
 * Export form responses as CSV or JSON
 *
 * Query parameters:
 * - format: Export format (csv, json) - default: csv
 * - includeMetadata: Include response metadata - default: false
 * - questionIds: Comma-separated list of question IDs to include
 */

import { NextRequest, NextResponse } from "next/server";
import { responseService } from "@/lib/database/services/response.service";
import { questionService } from "@/lib/database/services/question.service";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Convert responses to CSV format
 */
function convertToCSV(
  responses: any[],
  questions: any[],
  includeMetadata: boolean
) {
  if (responses.length === 0) {
    return "No responses found\n";
  }

  // Create headers
  const headers = [
    "Response ID",
    "Submitted At",
    "Status",
    "Respondent Name",
    "Respondent Email",
  ];

  // Add question headers
  questions.forEach((q) => {
    headers.push(`Q: ${q.title}`);
  });

  if (includeMetadata) {
    headers.push("Completion Time", "Device", "Location");
  }

  // Create rows
  const rows = responses.map((response) => {
    const row = [
      response.id,
      response.submittedAt,
      response.status,
      response.respondent.name || "",
      response.respondent.email || "",
    ];

    // Add question answers
    questions.forEach((q) => {
      const answer = response.data[q.id];
      if (answer !== undefined && answer !== null) {
        // Handle different answer types
        if (typeof answer === "object") {
          row.push(JSON.stringify(answer));
        } else {
          row.push(String(answer));
        }
      } else {
        row.push("");
      }
    });

    if (includeMetadata) {
      row.push(
        response.completionTime ? `${response.completionTime}s` : "",
        response.device || "",
        response.location || ""
      );
    }

    return row;
  });

  // Convert to CSV string
  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return csvContent;
}

/**
 * Convert responses to JSON format
 */
function convertToJSON(
  responses: any[],
  questions: any[],
  includeMetadata: boolean
) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalResponses: responses.length,
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        required: q.required,
      })),
      responses: responses.map((response) => {
        const exported: any = {
          id: response.id,
          submittedAt: response.submittedAt,
          status: response.status,
          respondent: response.respondent,
          answers: response.data,
        };

        if (includeMetadata) {
          exported.metadata = {
            completionTime: response.completionTime,
            device: response.device,
            location: response.location,
          };
        }

        return exported;
      }),
    },
    null,
    2
  );
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: formId } = await params;

    // Verify form exists and user has access
    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    // Check ownership
    if (form.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "csv";
    const includeMetadata = searchParams.get("includeMetadata") === "true";
    const questionIdsParam = searchParams.get("questionIds");

    if (!["csv", "json"].includes(format)) {
      return errorResponse("Invalid format. Must be 'csv' or 'json'", 400);
    }

    // Get all responses and questions
    const [responses, allQuestions] = await Promise.all([
      responseService.getByFormId(formId),
      questionService.getByFormId(formId),
    ]);

    // Filter questions if specific IDs were requested
    let questions = allQuestions;
    if (questionIdsParam) {
      const requestedIds = questionIdsParam.split(",");
      questions = allQuestions.filter((q) => requestedIds.includes(q.id));
    }

    // Generate export content
    let content: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      content = convertToCSV(responses, questions, includeMetadata);
      contentType = "text/csv";
      filename = `${form.title}-responses.csv`;
    } else {
      content = convertToJSON(responses, questions, includeMetadata);
      contentType = "application/json";
      filename = `${form.title}-responses.json`;
    }

    // Return file
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Error exporting responses:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
