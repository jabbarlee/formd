/**
 * GET /api/forms/[id]/analytics/questions
 * Get question-by-question analytics breakdown
 * 
 * Query parameters same as main analytics endpoint
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
    return { range: 'custom', customStart, customEnd };
  }

  return { range };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: formId } = await params;

    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    if (form.createdBy !== authUser.userId) {
      return errorResponse("Forbidden", 403);
    }

    let timeRange: TimeRangeFilter;
    try {
      timeRange = parseTimeRange(request.nextUrl.searchParams);
    } catch (error: any) {
      return errorResponse(error.message, 400);
    }

    // Check if detailed param is set to use enhanced analytics
    const useDetailed = request.nextUrl.searchParams.get('detailed') === 'true';
    
    const questions = useDetailed
      ? await analyticsService.getQuestionAnalyticsDetailed(formId, timeRange)
      : await analyticsService.getQuestionAnalytics(formId, timeRange);

    return NextResponse.json(questions, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching question analytics:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

