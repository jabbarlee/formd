/**
 * AI Form Modification API Route
 * POST /api/forms/[id]/ai-modify - Modify form using AI
 * 
 * Architecture:
 * - Follows /api/forms/[id] pattern
 * - Uses getAuthUser() for authentication
 * - Verifies form ownership
 * - Uses OpenAI for intelligent modifications
 */

import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { formService } from "@/lib/database/services/form.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";
import { aiFormModificationSchema } from "@/lib/validations/ai-modify-form";
import { buildModificationPrompt } from "@/lib/ai/ai-modify-form";
import type { Form, Question } from "@/lib/types/forms";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Clean settings object by removing default/unchanged values
 */
function cleanSettings(settings: any): any | undefined {
  if (!settings) return undefined;

  const cleaned: any = {};

  // Only include non-default values
  if (settings.minLength && settings.minLength > 0) cleaned.minLength = settings.minLength;
  if (settings.maxLength && settings.maxLength > 0) cleaned.maxLength = settings.maxLength;
  if (settings.min && settings.min !== 0) cleaned.min = settings.min;
  if (settings.max && settings.max !== 0) cleaned.max = settings.max;
  if (settings.step && settings.step !== 0) cleaned.step = settings.step;
  if (settings.maxRating && settings.maxRating > 0) cleaned.maxRating = settings.maxRating;
  if (settings.icon && settings.icon !== "none") cleaned.icon = settings.icon;
  if (settings.scaleMin !== undefined && settings.scaleMin !== 0) cleaned.scaleMin = settings.scaleMin;
  if (settings.scaleMax !== undefined && settings.scaleMax !== 0) cleaned.scaleMax = settings.scaleMax;
  if (settings.minLabel && settings.minLabel.trim()) cleaned.minLabel = settings.minLabel;
  if (settings.maxLabel && settings.maxLabel.trim()) cleaned.maxLabel = settings.maxLabel;
  if (settings.allowedFileTypes && settings.allowedFileTypes.length > 0) {
    cleaned.allowedFileTypes = settings.allowedFileTypes;
  }
  if (settings.maxFileSize && settings.maxFileSize > 0) cleaned.maxFileSize = settings.maxFileSize;
  if (settings.maxFiles && settings.maxFiles > 0) cleaned.maxFiles = settings.maxFiles;
  if (settings.allowOther) cleaned.allowOther = settings.allowOther;
  if (settings.randomizeOptions) cleaned.randomizeOptions = settings.randomizeOptions;
  if (settings.imageSize && settings.imageSize !== "none") cleaned.imageSize = settings.imageSize;
  if (settings.currency && settings.currency.trim()) cleaned.currency = settings.currency;
  if (settings.amount && settings.amount !== 0) cleaned.amount = settings.amount;

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}


/**
 * POST /api/forms/[id]/ai-modify
 * Modify existing form using AI
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: formId } = await params;

    // Verify form exists and user owns it
    const existingForm = await formService.getById(formId);
    if (!existingForm) {
      return errorResponse("Form not found", 404);
    }

    if (existingForm.createdBy !== authUser.userId) {
      return errorResponse("Unauthorized - you don't own this form", 403);
    }

    // Parse request body
    const body = await request.json();
    const { prompt, currentQuestions } = body;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return errorResponse("Prompt is required and must be a string", 400);
    }

    if (prompt.length < 5) {
      return errorResponse("Prompt must be at least 5 characters long", 400);
    }

    if (prompt.length > 1000) {
      return errorResponse("Prompt must not exceed 1000 characters", 400);
    }

    if (!currentQuestions || !Array.isArray(currentQuestions)) {
      return errorResponse("Current questions array is required", 400);
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return errorResponse(
        "AI service not configured",
        500
      );
    }

    // Build modification prompt with current form context
    const { systemPrompt, userMessage } = buildModificationPrompt(
      prompt,
      existingForm as Form,
      currentQuestions as Question[]
    );

    console.log("🤖 Sending modification request to AI...");

    // Call OpenAI with structured outputs
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      response_format: zodResponseFormat(
        aiFormModificationSchema,
        "form_modification"
      ),
      temperature: 0.7,
      max_tokens: 4000,
    });

    const message = completion.choices[0]?.message;

    // Check for refusal
    if (message?.refusal) {
      console.warn("AI refused to modify form:", message.refusal);
      return errorResponse(
        "Unable to modify form - request declined for safety reasons",
        400
      );
    }

    // Check if we have content
    if (!message?.content) {
      throw new Error("No content in AI response");
    }

    // Parse and validate the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(message.content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    const validatedModification = aiFormModificationSchema.parse(parsedData);

    // Prepare updated form data (only include non-empty strings)
    const updatedForm: Partial<Form> = {};
    if (validatedModification.form.title && validatedModification.form.title.trim()) {
      updatedForm.title = validatedModification.form.title;
    }
    if (validatedModification.form.description && validatedModification.form.description.trim()) {
      updatedForm.description = validatedModification.form.description;
    }

    // Process questions - clean up and ensure proper structure
    const updatedQuestions = validatedModification.questions.map((q, idx) => ({
      id: q.id,
      formId: formId,
      type: q.type,
      title: q.title,
      description: q.description && q.description.trim() ? q.description : undefined,
      placeholder: q.placeholder && q.placeholder.trim() ? q.placeholder : undefined,
      required: q.required,
      order: idx, // Ensure sequential ordering
      options: q.options && q.options.length > 0 ? q.options : undefined,
      settings: cleanSettings(q.settings),
      createdAt: currentQuestions.find(cq => cq.id === q.id)?.createdAt || new Date().toISOString(),
    }));

    console.log(`✅ AI modification complete: ${validatedModification.summary}`);
    console.log(`   Questions: ${currentQuestions.length} → ${updatedQuestions.length}`);

    return NextResponse.json({
      form: updatedForm,
      questions: updatedQuestions,
      summary: validatedModification.summary,
      metadata: {
        model: "gpt-4o-2024-08-06",
        tokensUsed: completion.usage?.total_tokens,
        modifiedAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error("❌ AI Form Modification Error:", error);

    // Handle specific error types
    if (error.name === "ZodError") {
      return errorResponse(
        "Invalid modification structure generated",
        500
      );
    }

    if (error.code === "insufficient_quota") {
      return errorResponse(
        "OpenAI quota exceeded",
        429
      );
    }

    if (error.code === "rate_limit_exceeded") {
      return errorResponse(
        "Rate limit exceeded - please try again in a moment",
        429
      );
    }

    return errorResponse(
      error.message || "Failed to modify form",
      500
    );
  }
}
