/**
 * AI Sessions API Routes
 * POST /api/ai-sessions - Create new session (on first message)
 * GET /api/ai-sessions - List user's sessions
 * 
 * Architecture:
 * - Follows /api/forms pattern
 * - Uses getAuthUser() for authentication
 * - Creates session only when user sends first message
 */

import { NextRequest, NextResponse } from "next/server";
import { aiSessionService } from "@/lib/database/services/aiSession.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

/**
 * POST /api/ai-sessions
 * Create new AI session with first message
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Parse request body
    const body = await request.json();
    const { title, prompt } = body;

    // Validate
    if (!prompt || typeof prompt !== "string") {
      return errorResponse("Prompt is required", 400);
    }

    if (prompt.length < 10 || prompt.length > 2000) {
      return errorResponse("Prompt must be between 10 and 2000 characters", 400);
    }

    // Generate form with AI
    const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        conversationHistory: [],
      }),
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.json();
      throw new Error(aiError.error || "AI generation failed");
    }

    const aiData = await aiResponse.json();

    // Create user message
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user" as const,
      content: prompt,
      timestamp: new Date().toISOString(),
    };

    // Create session with initial message
    const session = await aiSessionService.create(
      authUser.userId,
      title || "New Form",
      userMessage
    );

    // Add AI response message
    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      role: "assistant" as const,
      content: `I've created your form with ${aiData.questions.length} questions based on your request.`,
      timestamp: new Date().toISOString(),
    };

    await aiSessionService.appendMessage(session.id, authUser.userId, aiMessage);

    // Save form draft
    await aiSessionService.updateFormDraft(session.id, authUser.userId, {
      form: aiData.form,
      questions: aiData.questions,
    });

    // Get updated session
    const updatedSession = await aiSessionService.getById(session.id, authUser.userId);

    return NextResponse.json({ session: updatedSession }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating session:", error);
    return errorResponse(error.message || "Failed to create session");
  }
}

/**
 * GET /api/ai-sessions
 * Get user's AI sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch sessions
    const sessions = await aiSessionService.getUserSessions(
      authUser.userId,
      limit,
      offset
    );

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return errorResponse(error.message || "Failed to fetch sessions");
  }
}
