/**
 * GET /api/analytics/workspace
 * Get aggregated analytics across all user's forms
 * 
 * Query parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'month' | 'last_month' | 'all' | 'custom'
 * - customStart: ISO date string (required if timeRange is 'custom')
 * - customEnd: ISO date string (required if timeRange is 'custom')
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/database/services/analytics.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";
import { TimeRangeFilter, TimeRange } from "@/lib/types/analytics";

/**
 * Validate and parse time range query parameters
 */
function parseTimeRange(searchParams: URLSearchParams): TimeRangeFilter {
  const range = (searchParams.get("timeRange") || "30d") as TimeRange;
  const customStart = searchParams.get("customStart");
  const customEnd = searchParams.get("customEnd");

  const validRanges: TimeRange[] = ['7d', '30d', '90d', 'month', 'last_month', 'all', 'custom'];
  if (!validRanges.includes(range)) {
    return { range: '30d' };
  }

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
 * GET /api/analytics/workspace
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Parse time range parameters
    let timeRange: TimeRangeFilter;
    try {
      timeRange = parseTimeRange(request.nextUrl.searchParams);
    } catch (error: any) {
      return errorResponse(error.message, 400);
    }

    // Fetch workspace analytics
    const analytics = await analyticsService.getWorkspaceAnalytics(
      authUser.userId,
      timeRange
    );

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching workspace analytics:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

