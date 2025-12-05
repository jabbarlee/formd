/**
 * POST /api/public/forms/[id]/track
 * Track analytics events for public form interactions
 * 
 * This is a public endpoint (no authentication required)
 * Used to track form views, starts, and interactions
 * 
 * Request body:
 * - eventType: 'form_viewed' | 'form_started' | 'question_answered' | 'form_submitted' | 'form_abandoned'
 * - sessionId: string (optional, for tracking user journey)
 * - responseId: string (optional, for linking to response)
 * - eventData: object (optional, additional event data)
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/database/services/analytics.service";
import { formService } from "@/lib/database/services/form.service";
import { errorResponse } from "@/lib/api/auth";
import { AnalyticsEventType, TrackEventRequest } from "@/lib/types/analytics";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Validate event type
 */
function isValidEventType(type: any): type is AnalyticsEventType {
  const validTypes: AnalyticsEventType[] = [
    'form_viewed',
    'form_started',
    'question_answered',
    'form_submitted',
    'form_abandoned',
  ];
  return validTypes.includes(type);
}

/**
 * Extract IP address from request
 */
function getIpAddress(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return undefined;
}

/**
 * POST /api/public/forms/[id]/track
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: formId } = await params;

    // Verify form exists and is published
    const form = await formService.getById(formId);
    if (!form) {
      return errorResponse("Form not found", 404);
    }

    // Only track events for published forms
    if (form.status !== 'published') {
      return errorResponse("Form is not published", 403);
    }

    // Parse request body
    const body: TrackEventRequest = await request.json();
    const { eventType, sessionId, responseId, eventData } = body;

    // Validate event type
    if (!eventType || !isValidEventType(eventType)) {
      return errorResponse(
        "Invalid eventType. Must be one of: form_viewed, form_started, question_answered, form_submitted, form_abandoned",
        400
      );
    }

    // Validate sessionId if provided
    if (sessionId && typeof sessionId !== 'string') {
      return errorResponse("sessionId must be a string", 400);
    }

    // Validate responseId if provided
    if (responseId && typeof responseId !== 'string') {
      return errorResponse("responseId must be a string", 400);
    }

    // Extract metadata from request
    const ipAddress = getIpAddress(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Track the event
    const event = await analyticsService.trackEvent(formId, eventType, {
      sessionId,
      responseId,
      eventData,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
        timestamp: event.timestamp,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error tracking event:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

