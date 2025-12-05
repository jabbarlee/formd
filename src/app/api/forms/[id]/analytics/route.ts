/**
 * GET /api/forms/[id]/analytics
 * Get complete analytics for a specific form
 * 
 * Query parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'month' | 'last_month' | 'all' | 'custom'
 * - customStart: ISO date string (required if timeRange is 'custom')
 * - customEnd: ISO date string (required if timeRange is 'custom')
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/database/services/analytics.service";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";
import { TimeRangeFilter, TimeRange } from "@/lib/types/analytics";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Validate and parse time range query parameters
 */
function parseTimeRange(searchParams: URLSearchParams): TimeRangeFilter {
  const range = (searchParams.get("timeRange") || "30d") as TimeRange;
  const customStart = searchParams.get("customStart");
  const customEnd = searchParams.get("customEnd");

  // Validate time range
  const validRanges: TimeRange[] = ['7d', '30d', '90d', 'month', 'last_month', 'all', 'custom'];
  if (!validRanges.includes(range)) {
    return { range: '30d' }; // Default to 30 days
  }

  // Validate custom range if specified
  if (range === 'custom') {
    if (!customStart || !customEnd) {
      throw new Error("Custom range requires both customStart and customEnd parameters");
    }

    const start = new Date(customStart);
    const end = new Date(customEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format for custom range");
    }

    if (start > end) {
      throw new Error("customStart must be before customEnd");
    }

    return { range: 'custom', customStart, customEnd };
  }

  return { range };
}

/**
 * GET /api/forms/[id]/analytics
 */
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

    // Parse time range parameters
    let timeRange: TimeRangeFilter;
    try {
      timeRange = parseTimeRange(request.nextUrl.searchParams);
    } catch (error: any) {
      return errorResponse(error.message, 400);
    }

    // Fetch analytics data
    const analytics = await analyticsService.getFormAnalytics(formId, timeRange);

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching form analytics:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

