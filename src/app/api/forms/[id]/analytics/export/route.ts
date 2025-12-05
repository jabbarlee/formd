/**
 * GET /api/forms/[id]/analytics/export
 * Export analytics data in various formats
 * 
 * Query parameters:
 * - format: 'csv' | 'json' (default: 'csv')
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

/**
 * Convert analytics data to CSV format
 */
function analyticsToCSV(analytics: any): string {
  const rows: string[] = [];

  // Header
  rows.push("Analytics Report");
  rows.push(`Form: ${analytics.formTitle}`);
  rows.push(`Time Range: ${analytics.timeRange.range}`);
  rows.push("");

  // Overview Metrics
  rows.push("Overview Metrics");
  rows.push("Metric,Value,Change");
  rows.push(`Total Views,${analytics.overview.totalViews},${analytics.overview.viewsChange.toFixed(1)}%`);
  rows.push(`Total Responses,${analytics.overview.totalResponses},${analytics.overview.responsesChange.toFixed(1)}%`);
  rows.push(`Completion Rate,${analytics.overview.completionRate}%,${analytics.overview.completionRateChange.toFixed(1)}%`);
  rows.push(`Average Time,${Math.floor(analytics.overview.averageTime / 60)} min ${analytics.overview.averageTime % 60} sec,${analytics.overview.averageTimeChange.toFixed(1)}%`);
  rows.push("");

  // Funnel Data
  rows.push("Completion Funnel");
  rows.push("Stage,Count,Percentage");
  analytics.funnel.forEach((stage: any) => {
    rows.push(`${stage.label},${stage.count},${stage.percentage.toFixed(1)}%`);
  });
  rows.push("");

  // Device Breakdown
  rows.push("Device Breakdown");
  rows.push("Device,Count,Percentage");
  rows.push(`Desktop,${analytics.devices.desktop.count},${analytics.devices.desktop.percentage.toFixed(1)}%`);
  rows.push(`Mobile,${analytics.devices.mobile.count},${analytics.devices.mobile.percentage.toFixed(1)}%`);
  rows.push(`Tablet,${analytics.devices.tablet.count},${analytics.devices.tablet.percentage.toFixed(1)}%`);
  rows.push("");

  // Geographic Data
  if (analytics.geography.length > 0) {
    rows.push("Geographic Distribution");
    rows.push("Country,Count,Percentage");
    analytics.geography.forEach((geo: any) => {
      rows.push(`${geo.country},${geo.count},${geo.percentage.toFixed(1)}%`);
    });
    rows.push("");
  }

  // Trend Data
  if (analytics.trends.length > 0) {
    rows.push("Trend Data");
    rows.push("Date,Views,Starts,Completions");
    analytics.trends.forEach((trend: any) => {
      rows.push(`${trend.date},${trend.views},${trend.starts},${trend.completions}`);
    });
    rows.push("");
  }

  // Question Analytics
  if (analytics.questions.length > 0) {
    rows.push("Question Analytics");
    analytics.questions.forEach((question: any, index: number) => {
      rows.push(`Q${index + 1}: ${question.questionTitle}`);
      rows.push(`Type: ${question.questionType}`);
      rows.push(`Responses: ${question.responseCount}`);
      rows.push(`Skipped: ${question.skipCount}`);
      
      if (question.optionBreakdown && question.optionBreakdown.length > 0) {
        rows.push("Option,Count,Percentage");
        question.optionBreakdown.forEach((option: any) => {
          rows.push(`${option.option},${option.count},${option.percentage.toFixed(1)}%`);
        });
      }
      
      rows.push("");
    });
  }

  return rows.join("\n");
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

    // Parse parameters
    const format = request.nextUrl.searchParams.get("format") || "csv";
    
    let timeRange: TimeRangeFilter;
    try {
      timeRange = parseTimeRange(request.nextUrl.searchParams);
    } catch (error: any) {
      return errorResponse(error.message, 400);
    }

    if (!['csv', 'json'].includes(format)) {
      return errorResponse("Invalid format. Supported: csv, json", 400);
    }

    // Fetch analytics data
    const analytics = await analyticsService.getFormAnalytics(formId, timeRange);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics_${form.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${format}`;

    // Return appropriate format
    if (format === 'json') {
      return new NextResponse(JSON.stringify(analytics, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      // CSV format
      const csv = analyticsToCSV(analytics);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Error exporting analytics:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

