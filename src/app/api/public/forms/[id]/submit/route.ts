/**
 * Public Form Submission API Endpoint
 * POST /api/public/forms/[id]/submit
 *
 * Submit form responses (no authentication required)
 */

import { NextRequest, NextResponse } from "next/server";
import { formService } from "@/lib/database/services/form.service";
import { supabaseAdmin } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface SubmissionData {
  answers: Record<string, any>;
  respondentEmail?: string;
  respondentName?: string;
  timeSpent?: number;
  metadata?: Record<string, any>;
}

/**
 * POST /api/public/forms/[id]/submit
 * Submit form response
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: formId } = await params;
    const body: SubmissionData = await request.json();

    // Validate form exists and is published
    const form = await formService.getById(formId);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.status !== "published") {
      return NextResponse.json(
        { error: "Form is not accepting responses" },
        { status: 403 }
      );
    }

    // Check if form is closed by date
    if (form.closeDate) {
      const closeDate = new Date(form.closeDate);
      const now = new Date();
      if (now > closeDate) {
        return NextResponse.json({ error: "Form is closed" }, { status: 403 });
      }
    }

    // Check response limit
    if (form.responseLimit && form.responseLimit > 0) {
      const { count } = await supabaseAdmin
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("form_id", formId);

      if (count && count >= form.responseLimit) {
        return NextResponse.json(
          { error: "Form has reached its response limit" },
          { status: 403 }
        );
      }
    }

    // Get questions to calculate completion
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("*")
      .eq("form_id", formId)
      .order("order_position", { ascending: true });

    const requiredQuestions = questions?.filter((q) => q.required) || [];
    const answeredRequired = requiredQuestions.filter(
      (q) => body.answers[q.id] !== undefined && body.answers[q.id] !== ""
    ).length;

    const completionPercentage =
      requiredQuestions.length > 0
        ? Math.round((answeredRequired / requiredQuestions.length) * 100)
        : 100;

    // Extract device/browser info
    const userAgent = request.headers.get("user-agent") || "";
    const deviceType = /mobile/i.test(userAgent) ? "mobile" : "desktop";

    // Get IP address (works with Vercel/most hosting)
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      null;

    // Create response record
    const { data: response, error: responseError } = await supabaseAdmin
      .from("responses")
      .insert({
        form_id: formId,
        respondent_email: body.respondentEmail || null,
        respondent_name: body.respondentName || null,
        status: completionPercentage === 100 ? "completed" : "in_progress",
        completion_percentage: completionPercentage,
        time_spent: body.timeSpent || null,
        submitted_at: new Date().toISOString(),
        device_type: deviceType,
        user_agent: userAgent,
        ip_address: ipAddress,
        referrer: request.headers.get("referer") || null,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (responseError) {
      console.error("Error creating response:", responseError);
      return NextResponse.json(
        { error: "Failed to submit response" },
        { status: 500 }
      );
    }

    // Create answer records
    const answerRecords = Object.entries(body.answers).map(
      ([questionId, value]) => {
        // Determine the appropriate field based on value type
        let answerData: any = {
          response_id: response.id,
          question_id: questionId,
        };

        if (typeof value === "boolean") {
          answerData.answer_boolean = value;
        } else if (typeof value === "number") {
          answerData.answer_number = value;
        } else if (Array.isArray(value)) {
          answerData.answer_array = value;
        } else if (value instanceof Date) {
          answerData.answer_date = value.toISOString();
        } else {
          answerData.answer_text = String(value);
        }

        return answerData;
      }
    );

    if (answerRecords.length > 0) {
      const { error: answersError } = await supabaseAdmin
        .from("answers")
        .insert(answerRecords);

      if (answersError) {
        console.error("Error creating answers:", answersError);
        // Don't fail the whole submission if answers fail
      }
    }

    // Return success with custom message if configured
    return NextResponse.json(
      {
        success: true,
        responseId: response.id,
        message:
          form.settings?.customSubmissionMessage ||
          "Thank you for your submission!",
        redirectUrl: form.settings?.redirectUrl || null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
