/**
 * GET /api/forms/[id]/responses
 * Get all responses for a specific form with filtering and pagination
 *
 * Supports query parameters:
 * - status: Filter by response status (completed, partial, flagged, all)
 * - search: Search by respondent name or email
 * - device: Filter by device type (desktop, mobile, tablet, all)
 * - dateFrom: Filter responses from this date (ISO string)
 * - dateTo: Filter responses until this date (ISO string)
 * - limit: Number of responses per page (default: 50, max: 100)
 * - offset: Number of responses to skip for pagination
 */

import { NextRequest, NextResponse } from "next/server";
import { responseService } from "@/lib/database/services/response.service";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";
import { ResponseFilters } from "@/lib/types/forms";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Validate and sanitize query parameters
 */
function validateQueryParams(searchParams: URLSearchParams) {
  const filters: ResponseFilters = {};
  const pagination = { limit: 50, offset: 0 };

  // Status filter
  const status = searchParams.get("status");
  if (status && ["completed", "partial", "flagged", "all"].includes(status)) {
    filters.status = status === "all" ? undefined : (status as any);
  }

  // Search filter
  const search = searchParams.get("search");
  if (search && search.trim().length > 0) {
    filters.search = search.trim();
  }

  // Device filter
  const device = searchParams.get("device");
  if (device && ["desktop", "mobile", "tablet", "all"].includes(device)) {
    filters.device = device === "all" ? undefined : (device as any);
  }

  // Date range filters
  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) {
    const date = new Date(dateFrom);
    if (!isNaN(date.getTime())) {
      filters.dateFrom = date.toISOString();
    }
  }

  const dateTo = searchParams.get("dateTo");
  if (dateTo) {
    const date = new Date(dateTo);
    if (!isNaN(date.getTime())) {
      filters.dateTo = date.toISOString();
    }
  }

  // Pagination
  const limit = searchParams.get("limit");
  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      pagination.limit = parsedLimit;
    }
  }

  const offset = searchParams.get("offset");
  if (offset) {
    const parsedOffset = parseInt(offset, 10);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      pagination.offset = parsedOffset;
    }
  }

  return { filters, pagination };
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

    // Parse and validate query parameters
    const { filters, pagination } = validateQueryParams(
      request.nextUrl.searchParams
    );

    // Fetch responses and stats in parallel
    const [responses, stats] = await Promise.all([
      responseService.getByFormId(formId, filters, pagination),
      responseService.getStats(formId),
    ]);

    // Return response data
    return NextResponse.json(
      {
        responses,
        stats,
        pagination: {
          limit: pagination.limit,
          offset: pagination.offset,
          hasMore: responses.length === pagination.limit, // Simple check - more sophisticated pagination could use total count
        },
        filters,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching form responses:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
